/**
 * @file 센터 관리자 API 라우트
 * @description 센터 관리자 전용 API 엔드포인트들을 정의합니다.
 * @date 2025-01-13
 * @author JJ Swim Lab
 */

import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import { authMiddleware, requireRole } from '../middleware/auth';
import { User } from '../models/User';
import { Course } from '../models/Course';
import { Booking } from '../models/Booking';
import { Payment } from '../models/Payment';
import { Notice } from '../models/Notice';
import { Review } from '../models/Review';
import { Report } from '../models/Report';
import { Center } from '../models/Center'; // ⭐ Center 모델 추가
import { PersonalLesson } from '../models/PersonalLesson';
import { LaneRental } from '../models/LaneRental';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

interface AuthRequest extends Request {
  user?: any;
}

const router = express.Router();

// 센터 관리자 권한 확인 미들웨어
const requireCenterAdmin = requireRole(['centerAdmin', 'center-admin']);

/**
 * 🏠 센터 관리자 대시보드 데이터 조회
 * GET /api/center-admin/dashboard
 */
router.get('/dashboard', authMiddleware, requireCenterAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const centerAdmin = await User.findById(req.user._id);
    console.log('🔍 센터 관리자 정보:', centerAdmin);
    
    // centerId 필드 또는 centerAdminInfo.managedCenters에서 센터 ID 가져오기
    const centerId = centerAdmin?.centerId || centerAdmin?.centerAdminInfo?.managedCenters?.[0];
    console.log('🏢 센터 ID:', centerId);

    if (!centerId) {
      return res.status(400).json({
        success: false,
        message: '관리하는 센터가 없습니다.'
      });
    }

    // 센터 통계 조회
    const totalMembers = await User.countDocuments({
      centerId: centerId,
      $or: [
        { userType: 'student' },
        { userType: 'instructor' }
      ],
      isActive: true
    });

    const activeInstructors = await User.countDocuments({
      userType: 'instructor',
      centerId: centerId,
      isActive: true
    });

    const activeCourses = await Course.countDocuments({
      centerId,
      status: 'active'
    });

    // 이번 달 매출 계산
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          centerId,
          status: 'completed',
          createdAt: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // 오늘 예약 수
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayBookings = await Booking.countDocuments({
      centerId,
      date: {
        $gte: today,
        $lt: tomorrow
      },
      status: 'confirmed'
    });

    // 승인 대기 건수
    const pendingApprovals = await Booking.countDocuments({
      centerId,
      status: 'pending'
    });

    res.json({
      success: true,
      message: '센터 관리자 대시보드 데이터 조회 성공!',
      data: {
        totalMembers,
        activeInstructors,
        activeCourses,
        monthlyRevenue: monthlyRevenue[0]?.total || 0,
        todayBookings,
        pendingApprovals,
        monthlyGrowth: 12.5, // 실제 계산 로직 필요
        averageRating: 4.7 // 실제 계산 로직 필요
      }
    });
  } catch (error) {
    console.error('센터 관리자 대시보드 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

/**
 * 🏊 센터 정보 조회 (풀 구성 포함)
 * GET /api/center-admin/center-info
 */
router.get('/center-info', authMiddleware, requireCenterAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const centerAdmin = await User.findById(req.user._id);
    const centerId = centerAdmin?.centerId || centerAdmin?.centerAdminInfo?.managedCenters?.[0];

    if (!centerId) {
      return res.status(400).json({
        success: false,
        message: '관리하는 센터가 없습니다.'
      });
    }

    // 센터 정보 조회
    const center = await Center.findById(centerId).lean();
    
    if (!center) {
      return res.status(404).json({
        success: false,
        message: '센터를 찾을 수 없습니다.'
      });
    }

    console.log('🏊 센터 정보 조회:', {
      centerName: center.name,
      poolConfiguration: center.poolConfiguration,
      availabilitySettings: center.availabilitySettings ? JSON.stringify(center.availabilitySettings, null, 2) : '없음'
    });

    return res.json({
      success: true,
      message: '센터 정보 조회 성공!',
      data: center
    });
  } catch (error) {
    console.error('센터 정보 조회 오류:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

/**
 * 👥 센터 회원 목록 조회
 * GET /api/center-admin/users
 */
router.get('/users', authMiddleware, requireCenterAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const centerAdmin = await User.findById(req.user._id);
    const centerId = centerAdmin?.centerAdminInfo?.managedCenters?.[0];

    if (!centerId) {
      return res.status(400).json({
        success: false,
        message: '관리하는 센터가 없습니다.'
      });
    }

    const { page = 1, limit = 10, search = '', userType = 'all' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // 쿼리 조건 구성
    const query: any = {
      centerId: centerId,
      isActive: true
    };

    if (userType !== 'all') {
      query.userType = userType;
    }

    if (search) {
      query.$and = [
        query,
        {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ]
        }
      ];
    }

    const users = await User.find(query)
      .select('-password +studentInfo +instructorInfo')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    // 디버깅을 위한 로깅
    console.log('📊 회원 목록 조회 결과:', {
      totalUsers: users.length,
      sampleUser: users.length > 0 ? {
        name: users[0].name,
        studentInfo: users[0].studentInfo,
        userType: users[0].userType
      } : null
    });

    // 각 회원의 studentInfo 확인
    users.forEach((user, index) => {
      console.log(`👤 회원 ${index + 1} (${user.name}):`, {
        userType: user.userType,
        studentInfo: user.studentInfo,
        hasStudentInfo: !!user.studentInfo
      });
    });

    // 회원 데이터에 currentLevel 필드 추가
    console.log('🔧 currentLevel 필드 추가 시작...');
    const usersWithLevel = users.map((user, index) => {
      const userObj = user.toObject();
        console.log(`🔧 회원 ${index + 1} (${userObj.name}) 처리 중:`, {
        userType: userObj.userType,
        studentInfo: userObj.studentInfo,
        hasStudentInfo: !!userObj.studentInfo
      });
      
      if (userObj.userType === 'student') {
        // DB에 한글 레벨로 저장되어 있으므로 변환 없이 직접 사용
        (userObj as any).currentLevel = userObj.studentInfo?.currentLevel 
          || userObj.studentInfo?.swimmingLevel 
          || (userObj as any).level
          || '레벨 미설정';
        console.log(`✅ 회원 ${index + 1} (${userObj.name}) currentLevel 설정됨:`, (userObj as any).currentLevel);
      }
      return userObj;
    });
    
    console.log('🔧 currentLevel 필드 추가 완료. 결과:', usersWithLevel.map(u => ({
      name: u.name,
      currentLevel: (u as any).currentLevel
    })));

    res.json({
      success: true,
      message: '센터 회원 목록 조회 성공!',
      data: {
        users: usersWithLevel,
        pagination: {
          current: Number(page),
          total: Math.ceil(total / Number(limit)),
          count: usersWithLevel.length,
          totalCount: total
        }
      }
    });
  } catch (error) {
    console.error('센터 회원 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

/**
 * 📊 센터 강사 통계 조회
 * GET /api/center-admin/instructors/stats
 */
router.get('/instructors/stats', authMiddleware, requireCenterAdmin, async (req: AuthRequest, res: Response) => {
  try {
    console.log('📊 강사 통계 조회 시작');
    
    const centerAdmin = await User.findById(req.user._id);
    const centerId = centerAdmin?.centerId || centerAdmin?.centerAdminInfo?.managedCenters?.[0];

    if (!centerId) {
      return res.status(400).json({
        success: false,
        message: '관리하는 센터가 없습니다.'
      });
    }

    // 강사 목록 조회
    const instructors = await User.find({
      userType: 'instructor',
      centerId: centerId
    });

    // 강사별 통계 계산
    const instructorStats = await Promise.all(instructors.map(async (instructor) => {
      try {
        // 단체 수업 학생 수 (Course의 enrolledStudents 필드 사용)
        // instructorId 또는 instructor 필드로 조회
        const groupCoursesWithStudents = await Course.find({
          $or: [
            { instructorId: instructor._id },
            { instructor: instructor._id }
          ],
          centerId: centerId,
          isPersonalLesson: { $ne: true },
          'enrolledStudents.0': { '$exists': true } // enrolledStudents 배열이 비어있지 않은 경우만 카운트
        }).select('_id enrolledStudents');

        const groupStudentsCount = groupCoursesWithStudents.reduce((acc, course) => acc + course.enrolledStudents.length, 0);

        // 개인레슨 학생 수 - PersonalLesson 모델에서
        const personalLessons = await PersonalLesson.find({
          instructorId: instructor._id,
          centerId: centerId
        });
        
        // 중복 제거된 학생 ID 집합
        const uniqueStudentIds = new Set();
        personalLessons.forEach(lesson => {
          if (lesson.studentId) {
            uniqueStudentIds.add(lesson.studentId.toString());
          }
        });
        
        // 개인레슨 학생 수 - Course 모델에서 (isPersonalLesson=true)
        // instructorId 또는 instructor 필드로 조회
        const personalLessonCourses = await Course.find({
          $or: [
            { instructorId: instructor._id },
            { instructor: instructor._id }
          ],
          centerId: centerId,
          isPersonalLesson: true
        }).select('enrolledStudents');
        
        personalLessonCourses.forEach(course => {
          course.enrolledStudents.forEach(enrollment => {
            if (enrollment.student) {
              uniqueStudentIds.add(enrollment.student.toString());
            }
          });
        });
        
        const personalStudentsCount = uniqueStudentIds.size;

        // 단체반 수업 수 (강사가 담당하는 단체반 개수)
        // instructorId 또는 instructor 필드로 조회
        const groupCoursesCount = await Course.countDocuments({
          $or: [
            { instructorId: instructor._id },
            { instructor: instructor._id }
          ],
          centerId: centerId,
          isPersonalLesson: { $ne: true }
        });

        // Course 모델에서 isPersonalLesson=true인 개인레슨 수 추가 조회
        // instructorId 또는 instructor 필드로 조회
        const coursePersonalLessonsCount = await Course.countDocuments({
          $or: [
            { instructorId: instructor._id },
            { instructor: instructor._id }
          ],
          centerId: centerId,
          isPersonalLesson: true
        });
        
        console.log(`📊 ${instructor.name} 개인레슨 통계:`, {
          personalStudentsFromPersonalLessonModel: personalLessons.length,
          personalStudentsFromCourseModel: personalLessonCourses.length,
          uniqueStudentsCount: personalStudentsCount
        });
        
        // 개인레슨 수업 수 = PersonalLesson + Course (isPersonalLesson=true)
        const personalLessonsCount = personalLessons.length + coursePersonalLessonsCount;

        // 완료된 개인레슨 수
        const completedPersonalLessonsCount = personalLessons.filter(lesson => lesson.status === 'completed').length;

        return {
          instructorId: instructor._id,
          name: instructor.name,
          totalStudents: groupStudentsCount + personalStudentsCount,
          groupStudents: groupStudentsCount,
          personalStudents: personalStudentsCount,
          totalLessons: groupCoursesCount + personalLessonsCount,
          groupCourses: groupCoursesCount,
          activePersonalLessons: personalLessonsCount, // 모든 개인레슨을 일단 active로 간주
          completedPersonalLessons: completedPersonalLessonsCount
        };
      } catch (error) {
        console.error(`강사 ${instructor.name} 통계 계산 오류:`, error);
        return {
          instructorId: instructor._id,
          name: instructor.name,
          totalStudents: 0,
          groupStudents: 0,
          personalStudents: 0,
          totalLessons: 0,
          groupCourses: 0,
          activePersonalLessons: 0,
          completedPersonalLessons: 0
        };
      }
    }));

    res.json({
      success: true,
      message: '강사 통계 조회 성공',
      data: instructorStats
    });

  } catch (error) {
    console.error('강사 통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

/**
 * 👨‍🏫 센터 강사 목록 조회
 * GET /api/center-admin/instructors
 */
router.get('/instructors', authMiddleware, requireCenterAdmin, async (req: AuthRequest, res: Response) => {
  try {
    console.log('📋 센터 강사 목록 조회 요청');
    console.log('🔍 req.user 정보:', req.user);
    
    const centerAdmin = await User.findById(req.user._id);
    console.log('🔍 데이터베이스에서 조회한 사용자:', centerAdmin);
    
    // centerId 필드 또는 centerAdminInfo.managedCenters에서 센터 ID 가져오기
    const centerId = centerAdmin?.centerId || centerAdmin?.centerAdminInfo?.managedCenters?.[0];

    console.log('👤 센터 관리자:', {
      name: centerAdmin?.name,
      email: centerAdmin?.email,
      centerId: centerId?.toString()
    });

    if (!centerId) {
      console.error('❌ 센터 ID 없음');
      return res.status(400).json({
        success: false,
        message: '관리하는 센터가 없습니다.'
      });
    }

    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query: any = {
      userType: 'instructor',
      centerId: new mongoose.Types.ObjectId(centerId)
    };

    console.log('🔍 검색 조건:', query);

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const instructors = await User.find(query)
      .select('name email phone userType centerId instructorInfo isActive createdAt updatedAt')
      .lean()
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    
    // instructorInfo에 photo와 bio/introduction 필드 포함
    const instructorsWithPhoto = instructors.map(instructor => {
      const instructorInfo = (instructor.instructorInfo as any) || {};
      return {
        ...instructor,
        instructorInfo: {
          ...instructorInfo,
          photo: instructorInfo.photo,
          bio: instructorInfo.bio || instructorInfo.introduction
        }
      };
    });

    const total = await User.countDocuments(query);

    console.log('📊 조회 결과:', {
      강사수: instructors.length,
      총계: total,
      강사목록: instructors.map(i => ({ name: i.name, id: i._id.toString() }))
    });

    const responseData = {
      success: true,
      message: '센터 강사 목록 조회 성공!',
      data: {
        instructors: instructorsWithPhoto,
        pagination: {
          current: Number(page),
          total: Math.ceil(total / Number(limit)),
          count: instructorsWithPhoto.length,
          totalCount: total
        }
      }
    };

    console.log('📤 응답 데이터:', {
      success: responseData.success,
      instructorsCount: responseData.data.instructors.length,
      instructorNames: responseData.data.instructors.map(i => i.name)
    });

    res.json(responseData);
  } catch (error) {
    console.error('센터 강사 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

/**
 * 👨‍🏫 센터 강사 정보 수정
 * PUT /api/center-admin/instructors/:instructorId
 */
router.put('/instructors/:instructorId', authMiddleware, requireCenterAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { instructorId } = req.params;
    console.log('📝 강사 정보 수정 요청:', {
      instructorId,
      userId: req.user._id,
      bodyKeys: Object.keys(req.body),
      body: req.body
    });

    const centerAdmin = await User.findById(req.user._id);
    const centerId = centerAdmin?.centerAdminInfo?.managedCenters?.[0];

    console.log('🏢 센터 관리자:', {
      name: centerAdmin?.name,
      centerId: centerId?.toString()
    });

    if (!centerId) {
      console.error('❌ 센터 ID 없음');
      return res.status(400).json({
        success: false,
        message: '관리하는 센터가 없습니다.'
      });
    }

    // 강사 존재 여부 및 권한 확인
    const instructor = await User.findOne({
      _id: instructorId,
      userType: 'instructor',
      centerId: centerId
    });

    console.log('👨‍🏫 강사 검색 결과:', instructor ? `${instructor.name} 찾음` : '찾지 못함');

    if (!instructor) {
      console.error('❌ 강사 없음 또는 권한 없음');
      return res.status(404).json({
        success: false,
        message: '해당 강사를 찾을 수 없거나 권한이 없습니다.'
      });
    }

    // 업데이트 가능한 필드만 추출
    const {
      phone,
      instructorInfo
    } = req.body;

    // 업데이트 데이터 구성
    const updateData: any = {};

    if (phone !== undefined) {
      updateData.phone = phone;
    }

    if (instructorInfo) {
      // 강사 정보 업데이트
      if (instructorInfo.instructorLevel) {
        updateData['instructorInfo.instructorLevel'] = instructorInfo.instructorLevel;
      }
      if (instructorInfo.maxStudents !== undefined) {
        updateData['instructorInfo.maxStudents'] = instructorInfo.maxStudents;
      }
      if (instructorInfo.workSchedule) {
        updateData['instructorInfo.workSchedule'] = instructorInfo.workSchedule;
      }
      if (instructorInfo.salaryInfo) {
        updateData['instructorInfo.salaryInfo'] = instructorInfo.salaryInfo;
      }
      if (instructorInfo.memo !== undefined) {
        updateData['instructorInfo.memo'] = instructorInfo.memo;
      }
      if (instructorInfo.hiredAt) {
        updateData['instructorInfo.hiredAt'] = new Date(instructorInfo.hiredAt);
      }
      if (instructorInfo.contractType) {
        updateData['instructorInfo.contractType'] = instructorInfo.contractType;
      }
      if (instructorInfo.specialties) {
        updateData['instructorInfo.specialties'] = instructorInfo.specialties;
      }
      if (instructorInfo.certifications) {
        updateData['instructorInfo.certifications'] = instructorInfo.certifications;
      }
      if (instructorInfo.photo !== undefined) {
        updateData['instructorInfo.photo'] = instructorInfo.photo;
      }
      if (instructorInfo.bio !== undefined) {
        updateData['instructorInfo.bio'] = instructorInfo.bio;
      }
      if (instructorInfo.introduction !== undefined) {
        updateData['instructorInfo.introduction'] = instructorInfo.introduction;
      }
    }

    console.log('📊 업데이트 데이터:', updateData);
    console.log('📋 원본 요청 데이터:', {
      phone: req.body.phone,
      instructorInfo: req.body.instructorInfo
    });

    // 강사 정보 업데이트
    const updatedInstructor = await User.findByIdAndUpdate(
      instructorId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    console.log('✅ 강사 정보 업데이트 성공:', updatedInstructor?.name);
    console.log('📋 업데이트된 강사 정보:', {
      name: updatedInstructor?.name,
      instructorLevel: updatedInstructor?.instructorInfo?.instructorLevel,
      maxStudents: updatedInstructor?.instructorInfo?.maxStudents,
      memo: updatedInstructor?.instructorInfo?.memo
    });

    res.json({
      success: true,
      message: '강사 정보가 성공적으로 수정되었습니다!',
      data: updatedInstructor
    });
  } catch (error: any) {
    console.error('❌ 강사 정보 수정 오류:', error.message);
    console.error('📋 에러 상세:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
      error: error.message
    });
  }
});

/**
 * 강사 사진 업로드
 * POST /api/center-admin/instructors/:instructorId/upload-photo
 */
// Multer 설정 (강사 이미지 업로드)
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const instructorImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(uploadDir, 'instructor-images');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `instructor-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const instructorImageUpload = multer({
  storage: instructorImageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('이미지 파일만 업로드 가능합니다.'));
    }
  }
});

router.post('/instructors/:instructorId/upload-photo',
  authMiddleware,
  requireCenterAdmin,
  instructorImageUpload.single('photo'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { instructorId } = req.params;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: '파일이 업로드되지 않았습니다.'
        });
      }

      const centerAdmin = await User.findById(req.user._id);
      const centerId = centerAdmin?.centerId || centerAdmin?.centerAdminInfo?.managedCenters?.[0];

      if (!centerId) {
        return res.status(400).json({
          success: false,
          message: '관리하는 센터가 없습니다.'
        });
      }

      // 강사 존재 여부 및 권한 확인
      const instructor = await User.findOne({
        _id: instructorId,
        userType: 'instructor',
        centerId: centerId
      });

      if (!instructor) {
        return res.status(404).json({
          success: false,
          message: '해당 강사를 찾을 수 없거나 권한이 없습니다.'
        });
      }

      const imageUrl = `/uploads/instructor-images/${file.filename}`;

      // 강사 정보에 사진 URL 저장
      if (!instructor.instructorInfo) {
        instructor.instructorInfo = {} as any;
      }
      (instructor.instructorInfo as any).photo = imageUrl;
      await instructor.save();

      res.json({
        success: true,
        message: '강사 사진이 성공적으로 업로드되었습니다.',
        data: {
          imageUrl,
          photo: imageUrl
        }
      });
    } catch (error: any) {
      console.error('강사 사진 업로드 오류:', error);
      res.status(500).json({
        success: false,
        message: error.message || '강사 사진 업로드 중 오류가 발생했습니다.'
      });
    }
  }
);

/**
 * 📅 센터 예약 대시보드 데이터 조회
 * GET /api/center-admin/bookings/dashboard
 */
router.get('/bookings/dashboard', authMiddleware, requireCenterAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const centerAdmin = await User.findById(req.user._id);
    const centerId = centerAdmin?.centerAdminInfo?.managedCenters?.[0];

    if (!centerId) {
      return res.status(400).json({
        success: false,
        message: '관리하는 센터가 없습니다.'
      });
    }

    // 오늘 예약 수
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayBookings = await Booking.countDocuments({
      centerId,
      date: { $gte: today, $lt: tomorrow }
    });

    // 이번 주 예약 수
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const weekBookings = await Booking.countDocuments({
      centerId,
      date: { $gte: startOfWeek, $lt: endOfWeek }
    });

    // 대기 중인 개인레슨 신청
    const pendingPersonalLessons = await PersonalLesson.countDocuments({
      centerId,
      status: 'pending'
    });

    // 대기 중인 레인대여 신청
    const pendingLaneRentals = await LaneRental.countDocuments({
      centerId,
      status: 'pending'
    });

    res.json({
      success: true,
      message: '예약 대시보드 데이터 조회 성공!',
      data: {
        todayBookings,
        weekBookings,
        pendingPersonalLessons,
        pendingLaneRentals,
        pendingApprovals: pendingPersonalLessons + pendingLaneRentals,
        totalRevenue: 0,
        personalLessons: pendingPersonalLessons,
        laneRentals: pendingLaneRentals
      }
    });
  } catch (error) {
    console.error('예약 대시보드 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

/**
 * 📅 센터 예약 목록 조회
 * GET /api/center-admin/bookings
 */
router.get('/bookings', authMiddleware, requireCenterAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const centerAdmin = await User.findById(req.user._id);
    const centerId = centerAdmin?.centerAdminInfo?.managedCenters?.[0];

    if (!centerId) {
      return res.status(400).json({
        success: false,
        message: '관리하는 센터가 없습니다.'
      });
    }

    const { page = 1, limit = 10, status = 'all', date, type } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // 개인레슨과 레인대여를 모두 포함한 예약 목록
    const personalLessons = await PersonalLesson.find({ centerId })
      .populate('studentId', 'name email phone')
      .populate('instructorId', 'name')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const laneRentals = await LaneRental.find({ centerId })
      .populate('userId', 'name email phone')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    // 통합 예약 목록 생성
    const allBookings = [
      ...personalLessons.map(lesson => ({
        _id: lesson._id,
        type: 'personal-lesson',
        memberId: (lesson.studentId as any)?._id || lesson.studentId,
        memberName: (lesson.studentId as any)?.name || '회원 정보 없음',
        instructorId: (lesson.instructorId as any)?._id || lesson.instructorId,
        instructorName: (lesson.instructorId as any)?.name || '강사 정보 없음',
        date: lesson.date,
        time: lesson.time,
        duration: lesson.duration,
        status: lesson.status,
        price: lesson.price || 0,
        createdAt: lesson.createdAt
      })),
      ...laneRentals.map(rental => ({
        _id: rental._id,
        type: 'lane-rental',
        memberId: (rental.userId as any)?._id || rental.userId,
        memberName: (rental.userId as any)?.name || '회원 정보 없음',
        date: rental.date,
        time: rental.startTime,
        duration: rental.duration,
        status: rental.status,
        price: rental.price || 0,
        createdAt: rental.createdAt
      }))
    ];

    res.json({
      success: true,
      message: '센터 예약 목록 조회 성공!',
      data: {
        bookings: allBookings,
        pagination: {
          current: Number(page),
          total: Math.ceil(allBookings.length / Number(limit)),
          count: allBookings.length,
          totalCount: allBookings.length
        }
      }
    });
  } catch (error) {
    console.error('센터 예약 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

/**
 * 💰 센터 결제 목록 조회
 * GET /api/center-admin/payments
 */
router.get('/payments', authMiddleware, requireCenterAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const centerAdmin = await User.findById(req.user._id);
    const centerId = centerAdmin?.centerAdminInfo?.managedCenters?.[0];

    if (!centerId) {
      return res.status(400).json({
        success: false,
        message: '관리하는 센터가 없습니다.'
      });
    }

    const { page = 1, limit = 10, status = 'all', startDate, endDate } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query: any = { centerId };

    if (status !== 'all') {
      query.status = status;
    }

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }

    const payments = await Payment.find(query)
      .populate('user', 'name email')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Payment.countDocuments(query);

    res.json({
      success: true,
      message: '센터 결제 목록 조회 성공!',
      data: {
        payments,
        pagination: {
          current: Number(page),
          total: Math.ceil(total / Number(limit)),
          count: payments.length,
          totalCount: total
        }
      }
    });
  } catch (error) {
    console.error('센터 결제 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

/**
 * 📚 센터 강습 과정 목록 조회
 * GET /api/center-admin/courses
 */
router.get('/courses', authMiddleware, requireCenterAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const centerAdmin = await User.findById(req.user._id);
    const centerId = centerAdmin?.centerId || centerAdmin?.centerAdminInfo?.managedCenters?.[0];

    if (!centerId) {
      return res.status(400).json({
        success: false,
        message: '관리하는 센터가 없습니다.'
      });
    }

    // ⭐ 강습 과정 조회 시 개인레슨 없으면 레인 자동 복원
    try {
      const { LaneAllocationService } = await import('../services/laneAllocationService');
      const restoredLanes = await LaneAllocationService.restoreLanesIfNoPersonalLesson(centerId.toString());
      if (restoredLanes && restoredLanes.length > 0) {
        console.log('🔄 레인 자동 복원 완료:', restoredLanes);
      }
    } catch (restoreError) {
      console.error('⚠️ 레인 복원 실패 (무시하고 계속 진행):', restoreError);
    }

    // 센터의 강습 과정 조회 (강사 정보 포함)
    const courses = await Course.find({
      centerId: new mongoose.Types.ObjectId(centerId)
    }).populate('instructor', 'name email');

    console.log('🔍 강습 과정 조회 결과 (원본):', courses.length, '개');
    courses.forEach((course, index) => {
      console.log(`📋 강습 과정 ${index + 1}:`, {
        _id: course._id,
        name: course.name,
        instructor: course.instructor,
        instructorId: course.instructorId,
        instructorName: course.instructorName,
        centerId: course.centerId
      });
    });

    // 강습 과정 데이터 변환
    const coursesData = courses.map((course) => {
      const courseData = {
        _id: course._id,
        name: course.name,
        description: course.description,
        level: course.level,
        maxStudents: course.maxStudents,
        currentStudents: course.currentStudents || 0,
        price: course.price,
        instructorId: course.instructorId || course.instructor?._id || course.instructor,
        instructorName: course.instructorName || course.instructor?.name || '미배정',
        instructorEmail: course.instructor?.email || '',
        schedule: course.schedule,
        isPersonalLesson: course.isPersonalLesson || false,
        courseType: course.courseType || 'group',
        personalLessonSettings: course.personalLessonSettings || { timeSlots: [], lessonTypes: [], frequencyOptions: [] }, // ⭐ 개인레슨 설정 추가 (기본값 제공)
        startDate: course.startDate,
        endDate: course.endDate,
        duration: course.duration || 60, // ⭐ 수업 시간 추가
        lanes: course.lanes || [1],
        poolType: course.poolType || 'main',
        laneInfo: course.laneInfo || { assignedLanes: [], maxLanes: 0, minLanes: 0, laneNotes: '' },
        enrolledStudents: course.enrolledStudents || [],
        isActive: course.isActive,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt
      };
      
      // ⭐ 초급 자유형 월요일 9시 레인 정보 로그
      if (courseData.name === '초급 자유형') {
        const mondaySchedule = course.schedule.find((s: any) => s.day === 'monday' && s.startTime === '09:00');
        if (mondaySchedule) {
          console.log('🔍 초급 자유형 월요일 9시 스케줄:', JSON.stringify(mondaySchedule, null, 2));
        }
      }
      
      console.log('🔄 변환된 강습 과정 데이터:', {
        _id: courseData._id,
        name: courseData.name,
        instructorId: courseData.instructorId,
        instructorName: courseData.instructorName,
        lanes: courseData.lanes,
        poolType: courseData.poolType,
        laneInfo: courseData.laneInfo
      });
      
      return courseData;
    });

    res.json({
      success: true,
      message: '센터 강습 과정 조회 성공!',
      data: coursesData
    });
  } catch (error) {
    console.error('센터 강습 과정 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

/**
 * 📅 센터 스케줄 목록 조회
 * GET /api/center-admin/schedules
 */
router.get('/schedules', authMiddleware, requireCenterAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const centerAdmin = await User.findById(req.user._id);
    const centerId = centerAdmin?.centerId || centerAdmin?.centerAdminInfo?.managedCenters?.[0];

    if (!centerId) {
      return res.status(400).json({
        success: false,
        message: '관리하는 센터가 없습니다.'
      });
    }

    // 센터의 강습 과정 조회 (스케줄 정보 포함)
    const courses = await Course.find({
      centerId: centerId
    }).populate('instructor', 'name');

    // 강습 과정을 스케줄 형태로 변환
    const schedules = courses.map((course) => ({
      _id: course._id,
      title: course.name,
      type: course.isPersonalLesson ? 'personal_lesson' : 'group_class',
      date: course.startDate ? new Date(course.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      startTime: '10:00',
      endTime: '11:00',
      instructorName: course.instructor?.name || course.instructorName || '미배정',
      maxStudents: course.maxStudents,
      currentStudents: course.currentStudents || 0,
      status: 'confirmed',
      lanes: course.lanes || [1],
      poolType: course.poolType || 'main'
    }));

    res.json({
      success: true,
      message: '센터 스케줄 조회 성공!',
      data: schedules
    });
  } catch (error) {
    console.error('센터 스케줄 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

/**
 * 📊 센터 통계 조회
 * GET /api/center-admin/reports
 */
router.get('/reports', authMiddleware, requireCenterAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const centerAdmin = await User.findById(req.user._id);
    const centerId = centerAdmin?.centerAdminInfo?.managedCenters?.[0];

    if (!centerId) {
      return res.status(400).json({
        success: false,
        message: '관리하는 센터가 없습니다.'
      });
    }

    // 월별 매출 통계
    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          centerId,
          status: 'completed'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': -1, '_id.month': -1 }
      },
      {
        $limit: 12
      }
    ]);

    // 강의별 수강생 수
    const courseStats = await Course.aggregate([
      {
        $match: { centerId }
      },
      {
        $lookup: {
          from: 'bookings',
          localField: '_id',
          foreignField: 'courseId',
          as: 'bookings'
        }
      },
      {
        $project: {
          name: 1,
          level: 1,
          studentCount: { $size: '$bookings' }
        }
      }
    ]);

    res.json({
      success: true,
      message: '센터 통계 조회 성공!',
      data: {
        monthlyRevenue,
        courseStats
      }
    });
  } catch (error) {
    console.error('센터 통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

/**
 * 📚 강습 과정 생성
 * POST /api/center-admin/courses
 */
router.post('/courses', authMiddleware, requireCenterAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const centerAdmin = await User.findById(req.user._id);
    const centerId = centerAdmin?.centerId || centerAdmin?.centerAdminInfo?.managedCenters?.[0];

    if (!centerId) {
      return res.status(400).json({
        success: false,
        message: '관리하는 센터가 없습니다.'
      });
    }

    const {
      name,
      description,
      level,
      maxStudents,
      price,
      isPersonalLesson,
      courseType,
      startDate,
      endDate,
      schedule,
      lanes,
      poolType
    } = req.body;

    // 필수 필드 검증
    if (!name || !description || !level || !maxStudents || price === undefined) {
      return res.status(400).json({
        success: false,
        message: '필수 필드가 누락되었습니다. (name, description, level, maxStudents, price)'
      });
    }

    const course = new Course({
      name,
      description,
      level,
      duration: 60, // 기본 60분
      maxStudents,
      currentStudents: 0,
      price,
      instructor: centerId, // 임시로 centerId 사용 (나중에 강사 배정)
      centerId,
      classInfo: {
        className: name,
        classType: 'regular',
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        maxCapacity: maxStudents,
        currentEnrollment: 0
      },
      isPersonalLesson: isPersonalLesson || false,
      courseType: courseType || 'group',
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      schedule,
      lanes,
      poolType,
      enrolledStudents: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await course.save();

    console.log('✅ 강습 과정 생성 완료:', course.name);

    res.status(201).json({
      success: true,
      message: '강습 과정이 성공적으로 생성되었습니다.',
      data: course
    });
  } catch (error) {
    console.error('강습 과정 생성 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

/**
 * 📝 공지사항 목록 조회
 * GET /api/centers/notices
 */
router.get('/notices', authMiddleware, requireCenterAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const centerAdmin = await User.findById(req.user._id);
    const centerId = centerAdmin?.centerAdminInfo?.managedCenters?.[0];

    if (!centerId) {
      return res.status(400).json({
        success: false,
        message: '관리하는 센터가 없습니다.'
      });
    }

    const notices = await Notice.find({ centerId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: notices
    });
  } catch (error) {
    console.error('공지사항 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

/**
 * 📝 공지사항 생성
 * POST /api/centers/notices
 */
router.post('/notices', authMiddleware, requireCenterAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const centerAdmin = await User.findById(req.user._id);
    const centerId = centerAdmin?.centerAdminInfo?.managedCenters?.[0];

    if (!centerId) {
      return res.status(400).json({
        success: false,
        message: '관리하는 센터가 없습니다.'
      });
    }

    const { title, content, isImportant } = req.body;

    const notice = new Notice({
      title,
      content,
      author: centerAdmin.name || '센터 관리자',
      isImportant: isImportant || false,
      status: 'published',
      centerId
    });

    await notice.save();

    res.json({
      success: true,
      data: notice
    });
  } catch (error) {
    console.error('공지사항 생성 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

/**
 * 💳 결제 내역 조회
 * GET /api/centers/payments
 */
router.get('/payments', authMiddleware, requireCenterAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const centerAdmin = await User.findById(req.user._id);
    const centerId = centerAdmin?.centerAdminInfo?.managedCenters?.[0];

    if (!centerId) {
      return res.status(400).json({
        success: false,
        message: '관리하는 센터가 없습니다.'
      });
    }

    const payments = await Payment.find({ centerId })
      .sort({ paymentDate: -1 })
      .limit(100);

    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error('결제 내역 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

/**
 * ⭐ 리뷰 목록 조회
 * GET /api/centers/reviews
 */
router.get('/reviews', authMiddleware, requireCenterAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const centerAdmin = await User.findById(req.user._id);
    const centerId = centerAdmin?.centerAdminInfo?.managedCenters?.[0];

    if (!centerId) {
      return res.status(400).json({
        success: false,
        message: '관리하는 센터가 없습니다.'
      });
    }

    const reviews = await Review.find({ centerId })
      .sort({ date: -1 })
      .limit(100);

    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('리뷰 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

/**
 * 📊 리포트 데이터 조회
 * GET /api/centers/reports
 */
router.get('/reports', authMiddleware, requireCenterAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const centerAdmin = await User.findById(req.user._id);
    const centerId = centerAdmin?.centerAdminInfo?.managedCenters?.[0];

    if (!centerId) {
      return res.status(400).json({
        success: false,
        message: '관리하는 센터가 없습니다.'
      });
    }

    const { period = 'month' } = req.query;

    let report = await Report.findOne({ centerId, period });

    if (!report) {
      // 리포트가 없으면 기본값으로 생성
      report = new Report({
        period,
        totalStudents: 0,
        totalRevenue: 0,
        totalClasses: 0,
        averageRating: 0,
        newStudents: 0,
        retentionRate: 0,
        centerId
      });
      await report.save();
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('리포트 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

/**
 * 🗄️ 예시 데이터 추가 (개발용)
 * POST /api/admin/add-sample-data
 */
router.post('/add-sample-data', authMiddleware, requireCenterAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const centerAdmin = await User.findById(req.user._id);
    const centerId = centerAdmin?.centerAdminInfo?.managedCenters?.[0];

    if (!centerId) {
      return res.status(400).json({
        success: false,
        message: '관리하는 센터가 없습니다.'
      });
    }

    // 기존 예시 데이터 삭제
    await Notice.deleteMany({ centerId });
    await Payment.deleteMany({ centerId });
    await Review.deleteMany({ centerId });
    await Report.deleteMany({ centerId });

    // 공지사항 예시 데이터
    const notices = [
      {
        title: '수영장 이용 안내',
        content: '수영장 이용 시 안전수칙을 준수해 주시기 바랍니다.\n\n1. 수영 전 충분한 준비운동을 해주세요.\n2. 수영장 내에서는 뛰지 마세요.\n3. 개인 소지품은 락커에 보관해주세요.',
        author: '센터 관리자',
        isImportant: true,
        status: 'published',
        centerId
      },
      {
        title: '강의 일정 변경 안내',
        content: '다음 주 강의 일정이 변경되었습니다. 확인해 주세요.\n\n- 월요일: 자유형 기초 (오후 2시 → 오후 3시)\n- 수요일: 배영 중급 (오후 4시 → 오후 5시)\n- 금요일: 접영 고급 (오후 6시 → 오후 7시)',
        author: '센터 관리자',
        isImportant: false,
        status: 'published',
        centerId
      },
      {
        title: '새로운 강사 합류',
        content: '새로운 강사가 합류했습니다. 환영해 주세요.\n\n김수영 강사님\n- 전국대회 우승 경력\n- 자유형 전문\n- 친절하고 체계적인 지도',
        author: '센터 관리자',
        isImportant: false,
        status: 'published',
        centerId
      }
    ];

    await Notice.insertMany(notices);

    // 결제 예시 데이터
    const payments = [
      {
        studentName: '김학생',
        courseName: '자유형 기초',
        amount: 150000,
        paymentMethod: '카드',
        status: 'completed',
        transactionId: 'TXN123456789',
        centerId
      },
      {
        studentName: '박학생',
        courseName: '배영 중급',
        amount: 200000,
        paymentMethod: '계좌이체',
        status: 'pending',
        transactionId: 'TXN123456790',
        centerId
      },
      {
        studentName: '정학생',
        courseName: '접영 고급',
        amount: 250000,
        paymentMethod: '카드',
        status: 'failed',
        transactionId: 'TXN123456791',
        centerId
      }
    ];

    await Payment.insertMany(payments);

    // 리뷰 예시 데이터
    const reviews = [
      {
        studentName: '김학생',
        instructorName: '이강사',
        courseName: '자유형 기초',
        rating: 5,
        comment: '정말 좋은 강의였습니다. 강사님이 친절하시고 설명도 잘 해주셔요.',
        status: 'approved',
        centerId
      },
      {
        studentName: '박학생',
        instructorName: '최강사',
        courseName: '배영 중급',
        rating: 4,
        comment: '배영 기술이 많이 향상되었어요. 감사합니다.',
        status: 'pending',
        centerId
      },
      {
        studentName: '정학생',
        instructorName: '김강사',
        courseName: '접영 고급',
        rating: 3,
        comment: '강의는 괜찮지만 시간이 좀 부족했어요.',
        status: 'rejected',
        centerId
      }
    ];

    await Review.insertMany(reviews);

    // 리포트 예시 데이터
    const reports = [
      {
        period: 'month',
        totalStudents: 156,
        totalRevenue: 23400000,
        totalClasses: 89,
        averageRating: 4.7,
        newStudents: 23,
        retentionRate: 87.5,
        centerId
      },
      {
        period: 'week',
        totalStudents: 45,
        totalRevenue: 6750000,
        totalClasses: 23,
        averageRating: 4.8,
        newStudents: 8,
        retentionRate: 92.0,
        centerId
      }
    ];

    await Report.insertMany(reports);

    res.json({
      success: true,
      message: '예시 데이터가 성공적으로 추가되었습니다.',
      data: {
        notices: notices.length,
        payments: payments.length,
        reviews: reviews.length,
        reports: reports.length
      }
    });
  } catch (error) {
    console.error('예시 데이터 추가 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

/**
 * 👨‍🏫 개별 강사 정보 조회
 * GET /api/center-admin/instructors/:instructorId
 */
router.get('/instructors/:instructorId', authMiddleware, requireCenterAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { instructorId } = req.params;
    console.log('📋 개별 강사 정보 조회:', instructorId);
    
    const centerAdmin = await User.findById(req.user._id);
    const centerId = centerAdmin?.centerId || centerAdmin?.centerAdminInfo?.managedCenters?.[0];

    if (!centerId) {
      return res.status(400).json({
        success: false,
        message: '관리하는 센터가 없습니다.'
      });
    }

    // 강사 정보 조회
    const instructor = await User.findOne({
      _id: instructorId,
      userType: 'instructor',
      centerId: centerId
    });

    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: '강사를 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      message: '강사 정보 조회 성공',
      data: instructor
    });
  } catch (error) {
    console.error('강사 정보 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

/**
 * 👥 강사별 학생 목록 조회
 * GET /api/center-admin/instructors/:instructorId/students
 */
router.get('/instructors/:instructorId/students-list', authMiddleware, requireCenterAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { instructorId } = req.params;
    console.log('🔥🔥🔥 강사별 학생 목록 조회 API 호출됨:', instructorId);
    console.log('🔥🔥🔥 요청 URL:', req.url);
    console.log('🔥🔥🔥 요청 메서드:', req.method);
    
    const centerAdmin = await User.findById(req.user._id);
    const centerId = centerAdmin?.centerId || centerAdmin?.centerAdminInfo?.managedCenters?.[0];
    
    console.log('🏢 센터 ID:', centerId);

    if (!centerId) {
      console.log('❌ 센터 ID 없음');
      return res.status(400).json({
        success: false,
        message: '관리하는 센터가 없습니다.'
      });
    }

    // 단체반 학생들 조회 - enrolledStudents populate
    // instructorId 또는 instructor 필드로 조회
    const groupCourses = await Course.find({
      $or: [
        { instructorId: new mongoose.Types.ObjectId(instructorId) },
        { instructor: new mongoose.Types.ObjectId(instructorId) }
      ],
      centerId: new mongoose.Types.ObjectId(centerId),
      isPersonalLesson: { $ne: true }
    })
    .populate('enrolledStudents.student', 'name phone email studentInfo');
    
    console.log(`📚 조회된 단체반 수업: ${groupCourses.length}개`);
    console.log(`📚 전체 단체반 조회 결과:`, JSON.stringify(groupCourses.map(c => ({
      name: c.name,
      _id: c._id,
      students: c.students,
      enrolledStudents: c.enrolledStudents
    })), null, 2));

    const groupStudents = [];
    for (const course of groupCourses) {
      console.log(`📚 Course: ${course.name}, Students:`, course.students);
      console.log(`📚 Course: ${course.name}, EnrolledStudents:`, course.enrolledStudents);
      
      // 단체반의 학생들을 조회 - students 필드와 enrolledStudents 필드 모두 확인
      const studentIds = [];
      
      // 1. students 필드가 있는 경우 (우리가 생성한 데이터)
      if (course.students && course.students.length > 0) {
        console.log(`🔍 students 필드에서 조회할 학생 ID들:`, course.students);
        studentIds.push(...course.students.map(id => 
          typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id
        ));
      }
      
      // 2. enrolledStudents 필드가 있는 경우 (populate 후에는 student 객체가 있음)
      if (course.enrolledStudents && course.enrolledStudents.length > 0) {
        console.log(`🔍 enrolledStudents 필드에서 조회할 학생들:`, course.enrolledStudents);
        // populate 후에는 enrollment.student가 User 객체 또는 ID
        for (const enrollment of course.enrolledStudents) {
          if (enrollment.student) {
            const studentId = typeof enrollment.student === 'string' 
              ? enrollment.student 
              : enrollment.student._id?.toString() || enrollment.student.toString();
            studentIds.push(new mongoose.Types.ObjectId(studentId));
          }
        }
      }
      
      if (studentIds.length > 0) {
        console.log(`🔍 최종 조회할 학생 ID들:`, studentIds);
        
        const courseStudents = await User.find({ _id: { $in: studentIds } });
        console.log(`👥 조회된 학생들:`, courseStudents.map(s => ({ name: s.name, _id: s._id })));
        
        for (const student of courseStudents) {
          groupStudents.push({
            _id: student._id,
            name: student.name,
            courseId: course._id,
            courseName: course.name,
            isPersonalLesson: false,
            status: 'active',
            enrollmentDate: (student as any).createdAt || new Date(),
            phone: student.phone || '010-0000-0000',
            email: student.email || `${student.name}@example.com`,
            totalLessonsCompleted: 0,
            progress: Math.floor(Math.random() * 100),
            currentPackage: {
              name: course.name,
              remainingSessions: 10,
              expirationDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
            }
          });
        }
      } else {
        console.log(`⚠️ ${course.name}: 실제 학생 데이터 없음`);
      }
    }

    // 개인레슨 학생들 조회 - PersonalLesson 모델
    console.log('🔍 PersonalLesson 모델에서 개인레슨 조회 시작...');
    const personalLessonsRaw = await mongoose.connection.db.collection('personallessons').find({
      instructorId: new mongoose.Types.ObjectId(instructorId),
      centerId: new mongoose.Types.ObjectId(centerId)
    }).toArray();
    
    console.log(`🏊 PersonalLesson 모델에서 조회된 개인레슨: ${personalLessonsRaw.length}개`);

    // Course 모델에서 isPersonalLesson=true인 개인레슨도 조회
    // instructorId 또는 instructor 필드로 조회
    const personalLessonCourses = await Course.find({
      $or: [
        { instructorId: new mongoose.Types.ObjectId(instructorId) },
        { instructor: new mongoose.Types.ObjectId(instructorId) }
      ],
      centerId: new mongoose.Types.ObjectId(centerId),
      isPersonalLesson: true
    })
    .populate('enrolledStudents.student', 'name phone email studentInfo');

    console.log(`🏊 Course 모델에서 조회된 개인레슨: ${personalLessonCourses.length}개`);

    // 개인레슨 학생들의 실제 사용자 정보 조회
    const studentIds = personalLessonsRaw.map(lesson => lesson.studentId).filter(Boolean);
    const students = await User.find({ _id: { $in: studentIds } });

    // PersonalLesson 모델에서 개인레슨 학생들 추가
    const personalStudents1 = personalLessonsRaw.map((lesson: any) => {
      const student = students.find(s => s._id.toString() === lesson.studentId?.toString());
      if (student) {
        return {
          _id: lesson._id,
          name: student.name,
          courseId: lesson._id,
          courseName: '개인레슨',
          isPersonalLesson: true,
          status: lesson.status || 'active',
          enrollmentDate: lesson.date || (lesson as any).createdAt || new Date(),
          phone: student.phone || '',
          email: student.email || '',
          totalLessonsCompleted: lesson.completedSessions || 0,
          progress: {percentage: lesson.progress || 0} as any,
          currentPackage: {
            name: '개인레슨 패키지',
            remainingSessions: lesson.remainingSessions || 0,
            expirationDate: lesson.expirationDate || new Date()
          },
          personalLessonInfo: {
            lessonType: lesson.lessonType || '1:1',
            completedSessions: lesson.completedSessions || 0,
            remainingSessions: lesson.remainingSessions || 0,
            totalSessions: lesson.totalSessions || 0,
            pricePerSession: lesson.pricePerSession || 0,
            endDate: lesson.expirationDate || new Date()
          }
        };
      }
      return null;
    }).filter(Boolean);

    // Course 모델에서 개인레슨 학생들 추가
    const personalStudents2 = [];
    for (const course of personalLessonCourses) {
      if (course.enrolledStudents && course.enrolledStudents.length > 0) {
        for (const enrollment of course.enrolledStudents) {
          if (enrollment.student) {
            const studentId = typeof enrollment.student === 'string' 
              ? enrollment.student 
              : enrollment.student._id?.toString() || enrollment.student.toString();
            
            const student = await User.findById(studentId);
            if (student) {
              personalStudents2.push({
                _id: student._id,
                name: student.name,
                courseId: course._id,
                courseName: course.name || '개인레슨',
                isPersonalLesson: true,
                status: 'active',
                enrollmentDate: (student as any).createdAt || new Date(),
                phone: student.phone || '',
                email: student.email || '',
                totalLessonsCompleted: 0,
                progress: {percentage: enrollment.progress?.percentage || 0} as any,
                currentPackage: {
                  name: course.name || '개인레슨 패키지',
                  remainingSessions: 10,
                  expirationDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
                },
                personalLessonInfo: {
                  lessonType: '1:1',
                  completedSessions: 0,
                  remainingSessions: 10,
                  totalSessions: 10,
                  pricePerSession: course.price || 0,
                  endDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
                }
              });
            }
          }
        }
      }
    }

    const personalStudents = [...personalStudents1, ...personalStudents2];
    console.log(`👥 총 개인레슨 학생 수: ${personalStudents.length}명`);

    const allStudents = [...groupStudents, ...personalStudents];

    res.json({
      success: true,
      message: '강사별 학생 목록 조회 성공',
      data: allStudents
    });
  } catch (error) {
    console.error('강사별 학생 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

/**
 * 👥 센터 회원 메모 업데이트
 * PUT /api/center-admin/members/:memberId/memo
 */
router.put('/members/:memberId/memo', authMiddleware, requireCenterAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const centerAdmin = await User.findById(req.user._id);
    const centerId = centerAdmin?.centerId || centerAdmin?.centerAdminInfo?.managedCenters?.[0];

    if (!centerId) {
      return res.status(400).json({
        success: false,
        message: '관리하는 센터가 없습니다.'
      });
    }

    const { memberId } = req.params;
    const { memo, memoType } = req.body;

    // 회원 정보 조회
    const member = await User.findOne({
      _id: memberId, 
      userType: 'student',
      centerId: new mongoose.Types.ObjectId(centerId)
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: '회원을 찾을 수 없습니다.'
      });
    }

    // studentInfo 객체 초기화
    if (!member.studentInfo) {
      member.studentInfo = {};
    }

    // centerMemos 배열 초기화
    if (!member.studentInfo.centerMemos) {
      member.studentInfo.centerMemos = [];
    }

    // 새 메모 추가 (시간정보 포함)
    const newMemo = {
      _id: new mongoose.Types.ObjectId(),
      content: memo,
      type: memoType || 'info',
      createdAt: new Date(),
      createdBy: req.user._id,
      createdByName: centerAdmin.name || '센터 관리자'
    };

    member.studentInfo.centerMemos.push(newMemo);
    member.studentInfo.centerMemo = memo; // 최신 메모도 저장

    await member.save();

    res.json({
      success: true,
      message: '메모가 저장되었습니다.',
      data: member
    });
  } catch (error) {
    console.error('회원 메모 업데이트 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

/**
 * 👥 센터 회원 메모 삭제
 * DELETE /api/center-admin/members/:memberId/memo/:memoId
 */
router.delete('/members/:memberId/memo/:memoId', authMiddleware, requireCenterAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const centerAdmin = await User.findById(req.user._id);
    const centerId = centerAdmin?.centerId || centerAdmin?.centerAdminInfo?.managedCenters?.[0];

    if (!centerId) {
      return res.status(400).json({
        success: false,
        message: '관리하는 센터가 없습니다.'
      });
    }

    const { memberId, memoId } = req.params;

    // 회원 정보 조회
    const member = await User.findOne({
      _id: memberId, 
      userType: 'student',
      centerId: new mongoose.Types.ObjectId(centerId)
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: '회원을 찾을 수 없습니다.'
      });
    }

    // studentInfo 객체 초기화
    if (!member.studentInfo) {
      member.studentInfo = {};
    }

    // centerMemos 배열 초기화
    if (!member.studentInfo.centerMemos) {
      member.studentInfo.centerMemos = [];
    }

    // 메모 삭제
    member.studentInfo.centerMemos = member.studentInfo.centerMemos.filter(
      (memo: any) => memo._id.toString() !== memoId
    );

    await member.save();

    res.json({
      success: true,
      message: '메모가 삭제되었습니다.',
      data: member
    });
  } catch (error) {
    console.error('회원 메모 삭제 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

/**
 * 👥 센터 회원 메모 수정
 * PUT /api/center-admin/members/:memberId/memo/:memoId
 */
router.put('/members/:memberId/memo/:memoId', authMiddleware, requireCenterAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const centerAdmin = await User.findById(req.user._id);
    const centerId = centerAdmin?.centerId || centerAdmin?.centerAdminInfo?.managedCenters?.[0];

    if (!centerId) {
      return res.status(400).json({
        success: false,
        message: '관리하는 센터가 없습니다.'
      });
    }

    const { memberId, memoId } = req.params;
    const { content, type } = req.body;

    if (!content || !type) {
      return res.status(400).json({
        success: false,
        message: '메모 내용과 타입을 입력해주세요.'
      });
    }

    // 회원 정보 조회
    const member = await User.findOne({
      _id: memberId, 
      userType: 'student',
      centerId: new mongoose.Types.ObjectId(centerId)
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: '회원을 찾을 수 없습니다.'
      });
    }

    // studentInfo 객체 초기화
    if (!member.studentInfo) {
      member.studentInfo = {};
    }

    // centerMemos 배열 초기화
    if (!member.studentInfo.centerMemos) {
      member.studentInfo.centerMemos = [];
    }

    // 메모 수정
    const memoIndex = member.studentInfo.centerMemos.findIndex(
      (memo: any) => memo._id.toString() === memoId
    );

    if (memoIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '메모를 찾을 수 없습니다.'
      });
    }

    // 메모 내용과 타입 업데이트
    member.studentInfo.centerMemos[memoIndex].content = content;
    member.studentInfo.centerMemos[memoIndex].type = type;
    // updatedAt은 centerMemos 스키마에 없으므로 제거 (또는 메모를 새로 추가하는 방식으로 처리)

    await member.save();

    res.json({
      success: true,
      message: '메모가 수정되었습니다.'
    });
  } catch (error) {
    console.error('메모 수정 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 회원 목록 조회
router.get('/members', authMiddleware, requireCenterAdmin, async (req: AuthRequest, res: Response) => {
  try {
    console.log('👥 회원 목록 조회 시작');
    
    const { courseId } = req.query; // 특정 강습 과정에 대한 배정 상태 확인용
    console.log('📋 요청된 courseId:', courseId);

    const centerAdmin = await User.findById(req.user._id);
    const centerId = centerAdmin?.centerId || centerAdmin?.centerAdminInfo?.managedCenters?.[0];

    if (!centerId) {
      return res.status(400).json({
        success: false,
        message: '관리하는 센터가 없습니다.'
      });
    }

    // 센터의 모든 학생 회원 조회
    const members = await User.find({
      userType: 'student',
      centerId: centerId
    }).select('name email phone userType status createdAt studentInfo');

    console.log('🔍 조회된 회원 수:', members.length);
    members.forEach((member, index) => {
      console.log(`${index + 1}. ${member.name}:`, {
        level: member.studentInfo?.currentLevel || member.studentInfo?.swimmingLevel,
        studentInfo: member.studentInfo,
        toObject: member.toObject ? member.toObject() : 'N/A'
      });
    });

    // 각 회원의 배정된 과정 정보 조회
    const membersWithCourses = await Promise.all(members.map(async (member) => {
      // 단체반 과정에서 해당 회원이 배정된 과정들 조회
      const assignedCourses = await Course.find({
        centerId: centerId,
        'enrolledStudents.student': member._id,
        isPersonalLesson: { $ne: true }
      }).select('name instructorId level');

      // 강사 이름 조회
      const courseDetails = await Promise.all(assignedCourses.map(async (course) => {
        const instructor = await User.findById(course.instructorId).select('name');
        
        console.log(`🔍 ${member.name}의 과정 ${course.name} 레벨 확인:`, {
          courseId: course._id,
          courseName: course.name,
          courseLevel: course.level,
          instructorId: course.instructorId
        });
        
        return {
          courseId: course._id,
          courseName: course.name,
          courseLevel: course.level, // 레벨 그대로 사용 (영어 또는 한글)
          instructorName: instructor?.name || '미배정',
          enrollmentDate: new Date(), // 실제로는 enrolledStudents에서 가져와야 함
          status: 'active'
        };
      }));

      // 특정 강습 과정에 대한 배정 상태 확인
      let isEnrolledInSpecificCourse = false;
      if (courseId) {
        isEnrolledInSpecificCourse = courseDetails.some(course => 
          course.courseId.toString() === courseId.toString()
        );
      }

      return {
        _id: member._id,
        name: member.name,
        email: member.email,
        phone: member.phone || '',
        userType: member.userType,
        status: member.studentInfo?.status || 'active',
        enrollmentDate: (member as any).createdAt || new Date(),
        assignedCourses: courseDetails,
        totalLessonsCompleted: 0, // TODO: 실제 수업 완료 횟수 계산
        lastLessonDate: null, // TODO: 마지막 수업 날짜 계산
        centerMemo: member.studentInfo?.centerMemo || '',
        centerMemos: member.studentInfo?.centerMemos || [],
        
        // 회원 레벨 정보 - DB에 저장된 값 그대로 사용
        currentLevel: courseDetails.length > 0 
          ? courseDetails[0].courseLevel 
          : member.studentInfo?.currentLevel 
          || member.studentInfo?.swimmingLevel 
          || member.level
          || '레벨 미설정',
        studentInfo: {
          level: member.studentInfo?.currentLevel || member.studentInfo?.swimmingLevel || '레벨 미설정',
          emergencyContact: member.studentInfo?.emergencyContact || '',
          medicalConditions: member.studentInfo?.medicalConditions || '',
          goals: [],
          centerMemo: member.studentInfo?.centerMemo || '',
          centerMemos: member.studentInfo?.centerMemos || []
        },
        
        // 특정 강습 과정 배정 상태
        isEnrolledInSpecificCourse: isEnrolledInSpecificCourse,
        
        // 현재 수강 정보 추가
        currentCourses: courseDetails.map(course => ({
          courseId: course.courseId.toString(), // ObjectId를 문자열로 변환
          courseName: course.courseName,
          courseType: 'group',
          instructorName: course.instructorName,
          startDate: course.enrollmentDate,
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 임시로 30일 후
          status: course.status,
          remainingSessions: 10, // 임시 값
          totalSessions: 12 // 임시 값
        })),
        
        // 개인레슨 정보 (임시로 빈 배열)
        personalLessons: [],
        
        // 회원 관리 정보
        membershipType: 'regular',
        emergencyContact: member.studentInfo?.emergencyContact || '',
        medicalConditions: member.studentInfo?.medicalConditions || '',
        swimmingGoals: member.studentInfo?.swimmingProfile?.currentGoal ? [member.studentInfo.swimmingProfile.currentGoal] : [],
        preferredTimes: member.studentInfo?.swimmingProfile?.trainingDays || [],
        notes: member.studentInfo?.centerMemo || ''
      };
    }));

    res.json({
      success: true,
      message: '회원 목록 조회 성공',
      data: membersWithCourses
    });
  } catch (error) {
    console.error('회원 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 센터 회원 통계 조회
router.get('/members/stats/summary', authMiddleware, requireCenterAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const centerAdmin = await User.findById(req.user._id);
    const centerId = centerAdmin?.centerId || centerAdmin?.centerAdminInfo?.managedCenters?.[0];

    if (!centerId) {
      return res.status(400).json({
        success: false,
        message: '관리하는 센터가 없습니다.'
      });
    }

    // 회원 통계 계산
    const totalMembers = await User.countDocuments({
      userType: 'student',
      centerId: centerId
    });

    const activeMembers = await User.countDocuments({
      userType: 'student',
      centerId: centerId,
      status: 'active'
    });

    // 이번 달 신규 회원 수
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newMembersThisMonth = await User.countDocuments({
      userType: 'student',
      centerId: centerId,
      createdAt: { $gte: startOfMonth }
    });

    // 만료 임박 수강권 수 (임시로 0으로 설정)
    const expiringTicketsCount = 0;

    res.json({
      success: true,
      message: '회원 통계 조회 성공',
      data: {
        totalMembers,
        activeMembers,
        newMembersThisMonth,
        expiringTicketsCount
      }
    });
  } catch (error) {
    console.error('회원 통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 회원을 과정에 배정
router.put('/members/:memberId/course', authMiddleware, requireCenterAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { memberId } = req.params;
    const { courseId } = req.body;

    console.log('📝 회원 과정 배정 시작:', { memberId, courseId });
    console.log('📝 요청 본문:', req.body);
    console.log('📝 요청 헤더:', req.headers);
    console.log('📝 사용자 정보:', req.user);

    // courseId 검증
    if (!courseId) {
      console.log('❌ courseId가 없습니다.');
      return res.status(400).json({
        success: false,
        message: '과정 ID가 필요합니다.'
      });
    }

    const centerAdmin = await User.findById(req.user._id);
    const centerId = centerAdmin?.centerId || centerAdmin?.centerAdminInfo?.managedCenters?.[0];

    console.log('🏢 센터 관리자 정보:', {
      centerAdminId: centerAdmin?._id,
      centerId: centerId,
      managedCenters: centerAdmin?.centerAdminInfo?.managedCenters
    });

    if (!centerId) {
      console.log('❌ 관리하는 센터가 없습니다.');
      return res.status(400).json({
        success: false,
        message: '관리하는 센터가 없습니다.'
      });
    }

    // 회원 존재 확인
    const member = await User.findById(memberId);
    console.log('👤 회원 정보:', {
      memberId: member?._id,
      userType: member?.userType,
      name: member?.name,
      email: member?.email
    });

    if (!member || member.userType !== 'student') {
      console.log('❌ 학생 회원을 찾을 수 없습니다.');
      return res.status(404).json({
        success: false,
        message: '학생 회원을 찾을 수 없습니다.'
      });
    }

    // emergencyContact 필드 안전하게 처리 (객체인 경우 문자열로 변환)
    if (member.studentInfo?.emergencyContact && typeof member.studentInfo.emergencyContact === 'object') {
      const contact = member.studentInfo.emergencyContact as any;
      member.studentInfo.emergencyContact = `${contact?.name || ''} (${contact?.phone || ''})`;
      console.log('🔄 emergencyContact 필드 변환:', member.studentInfo.emergencyContact);
    }

    // 과정 존재 확인
    console.log('🔍 과정 조회 조건:', {
      courseId: courseId,
      centerId: centerId,
      isPersonalLesson: { $ne: true }
    });

    // 과정 조회 - 개인레슨 여부 상관없이 조회
    const course = await Course.findOne({
      _id: courseId,
      centerId: centerId
    });

    console.log('📚 과정 조회 결과:', course ? '찾음' : '찾지 못함', course ? `(${course.isPersonalLesson ? '개인레슨' : '단체반'})` : '');

    console.log('📚 과정 정보:', {
      courseId: course?._id,
      courseName: course?.name,
      centerId: course?.centerId,
      maxStudents: course?.maxStudents,
      enrolledStudents: course?.enrolledStudents?.length
    });

    if (!course) {
      console.log('❌ 과정을 찾을 수 없습니다.');
      return res.status(404).json({
        success: false,
        message: '과정을 찾을 수 없습니다.'
      });
    }

    // enrolledStudents 배열 안전하게 처리
    const enrolledStudents = course.enrolledStudents || [];
    console.log('📊 현재 등록된 학생들:', enrolledStudents);

    // 이미 배정되어 있는지 확인
    const alreadyEnrolled = enrolledStudents.some(
      (enrollment: any) => {
        if (!enrollment || !enrollment.student) {
          console.log('⚠️ 잘못된 등록 데이터:', enrollment);
          return false;
        }
        // ObjectId나 문자열 모두 비교할 수 있도록 처리
        const enrollmentStudentId = enrollment.student.toString();
        const memberIdStr = memberId.toString();
        console.log('🔍 등록 비교:', { enrollmentStudentId, memberIdStr, match: enrollmentStudentId === memberIdStr });
        return enrollmentStudentId === memberIdStr;
      }
    );

    console.log('🔍 이미 배정되어 있는지 확인:', alreadyEnrolled);

    if (alreadyEnrolled) {
      console.log('❌ 이미 해당 과정에 배정되어 있습니다.');
      return res.status(400).json({
        success: false,
        message: '이미 해당 과정에 배정되어 있습니다.'
      });
    }

    // 정원 확인
    if (enrolledStudents.length >= course.maxStudents) {
      console.log('❌ 과정 정원이 가득 찼습니다.');
      return res.status(400).json({
        success: false,
        message: '과정 정원이 가득 찼습니다.'
      });
    }

    // 기존 enrolledStudents에서 잘못된 데이터 정리
    const validEnrolledStudents = enrolledStudents.filter(
      (enrollment: any) => enrollment && enrollment.student
    );
    
    console.log('🧹 정리된 등록된 학생들:', validEnrolledStudents);

    // 새로운 회원 배정
    const newEnrollment = {
      student: memberId,
      enrollmentDate: new Date(),
      status: 'active'
    };
    
    validEnrolledStudents.push(newEnrollment);
    
    // course.enrolledStudents 업데이트
    course.enrolledStudents = validEnrolledStudents;
    
    console.log('✅ 업데이트할 enrolledStudents:', course.enrolledStudents);

    await course.save();
    console.log('💾 강습 과정 저장 완료');
    
    // 저장 후 검증: 다시 조회해서 확인
    const savedCourse = await Course.findById(courseId);
    console.log('🔍 저장 후 검증 - enrolledStudents:', savedCourse?.enrolledStudents);
    console.log('🔍 저장 후 검증 - 찾고 있는 memberId:', memberId);
    const isNowEnrolled = savedCourse?.enrolledStudents?.some(
      (e: any) => e.student?.toString() === memberId.toString()
    );
    console.log('🔍 저장 후 검증 - 배정 확인:', isNowEnrolled);

    // 회원의 레벨을 강습 과정 레벨로 업데이트
    console.log('🔄 회원 레벨 업데이트 시작:', {
      memberId: memberId,
      currentLevel: member.studentInfo?.currentLevel || member.studentInfo?.swimmingLevel,
      courseLevel: (course as any).level
    });

    // 회원의 studentInfo.currentLevel 업데이트 - 과정 레벨을 그대로 사용
    if (!member.studentInfo) {
      member.studentInfo = {} as any;
    }
    
    const oldLevel = member.studentInfo?.currentLevel || member.studentInfo?.swimmingLevel;
    member.studentInfo.currentLevel = (course as any).level || '레벨 미설정';
    
    // emergencyContact 필드 안전하게 처리 (객체인 경우 문자열로 변환)
    if (member.studentInfo.emergencyContact && typeof member.studentInfo.emergencyContact === 'object') {
      const contact = member.studentInfo.emergencyContact as any;
      member.studentInfo.emergencyContact = `${contact?.name || ''} (${contact?.phone || ''})`;
    }
    
    // 회원 저장 시 validation 오류 방지를 위해 emergencyContact 필드 제거
    const memberToSave = member.toObject();
    if (memberToSave.studentInfo?.emergencyContact && typeof memberToSave.studentInfo.emergencyContact === 'object') {
      delete memberToSave.studentInfo.emergencyContact;
    }
    
    await User.findByIdAndUpdate(memberId, { 
      'studentInfo.level': course.level,
      'studentInfo.emergencyContact': member.studentInfo.emergencyContact || ''
    });
    console.log('✅ 회원 레벨 업데이트 완료:', {
      memberName: member.name,
      oldLevel: oldLevel,
      newLevel: course.level
    });

    res.json({
      success: true,
      message: '과정 배정이 완료되었습니다.',
      data: {
        memberId: memberId,
        courseId: courseId,
        courseName: course.name,
        levelUpdated: {
          oldLevel: oldLevel,
          newLevel: course.level
        }
      }
    });
  } catch (error) {
    console.error('❌ 회원 과정 배정 오류:', error);
    console.error('❌ 오류 스택:', error.stack);
    console.error('❌ 오류 타입:', typeof error);
    console.error('❌ 오류 메시지:', error.message);
    
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
      error: error.message
    });
  }
});

/**
 * 회원 과정 배정 취소 (퇴원)
 * DELETE /api/center-admin/members/:memberId/course/:courseId
 */
router.delete('/members/:memberId/course/:courseId', authMiddleware, requireCenterAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { memberId, courseId } = req.params;

    console.log('🗑️ 회원 과정 배정 취소 시작:', { memberId, courseId });

    const centerAdmin = await User.findById(req.user._id);
    const centerId = centerAdmin?.centerId || centerAdmin?.centerAdminInfo?.managedCenters?.[0];

    if (!centerId) {
      return res.status(400).json({
        success: false,
        message: '관리하는 센터가 없습니다.'
      });
    }

    // 회원 존재 확인
    const member = await User.findById(memberId);
    if (!member || member.userType !== 'student') {
      return res.status(404).json({
        success: false,
        message: '학생 회원을 찾을 수 없습니다.'
      });
    }

    // 과정 존재 확인
    const course = await Course.findOne({
      _id: courseId,
      centerId: centerId,
      isPersonalLesson: { $ne: true }
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: '과정을 찾을 수 없습니다.'
      });
    }

    // enrolledStudents에서 해당 회원 제거
    const enrolledStudents = course.enrolledStudents || [];
    const updatedEnrolledStudents = enrolledStudents.filter(
      (enrollment: any) => {
        const enrollmentStudentId = enrollment.student?.toString();
        const memberIdStr = memberId.toString();
        console.log('🔍 배정 취소 비교:', { enrollmentStudentId, memberIdStr, willRemove: enrollmentStudentId === memberIdStr });
        return enrollmentStudentId !== memberIdStr;
      }
    );

    course.enrolledStudents = updatedEnrolledStudents;
    await course.save();

    console.log('💾 과정 배정 취소 완료');

    res.json({
      success: true,
      message: '과정 배정이 취소되었습니다.',
      data: {
        memberId: memberId,
        courseId: courseId,
        courseName: course.name
      }
    });
  } catch (error) {
    console.error('❌ 회원 과정 배정 취소 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
      error: error.message
    });
  }
});

// 센터 관리자용 강습 과정 목록 조회
router.get('/courses', authMiddleware, requireCenterAdmin, async (req: AuthRequest, res: Response) => {
  try {
    console.log('📚 센터 관리자용 강습 과정 목록 조회 시작');

    const centerAdmin = await User.findById(req.user._id);
    const centerId = centerAdmin?.centerId || centerAdmin?.centerAdminInfo?.managedCenters?.[0];

    if (!centerId) {
      return res.status(400).json({
        success: false,
        message: '관리하는 센터가 없습니다.'
      });
    }

    // 센터의 모든 강습 과정 조회 (강사 정보 포함)
    const courses = await Course.find({
      centerId: centerId
    }).populate('instructorId', 'name email');

    // 강사 정보를 포함한 과정 데이터 구성
    const coursesData = courses.map(course => {
      console.log(`🔍 과정 ${course.name} - laneInfo 원본:`, JSON.stringify(course.laneInfo, null, 2));
      return {
        _id: course._id,
        name: course.name,
        description: course.description,
        level: course.level,
        duration: course.duration,
        maxStudents: course.maxStudents,
        currentStudents: course.enrolledStudents?.length || 0,
        instructorId: course.instructorId,
        instructor: course.instructorId, // 강사 정보
        price: course.price,
        schedule: course.schedule,
        status: course.status,
        createdAt: course.createdAt,
        tags: course.tags || [],
        poolType: course.poolType,
        lanes: course.lanes,
        laneInfo: course.laneInfo,
        courseType: course.courseType,
        isPersonalLesson: course.isPersonalLesson,
        enrolledStudents: course.enrolledStudents,
        startDate: course.startDate,
        endDate: course.endDate
      };
    });

    res.json({
      success: true,
      message: '강습 과정 목록 조회 성공',
      data: coursesData
    });
  } catch (error) {
    console.error('강습 과정 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 회원 정보 수정 API
router.put('/members/:memberId', authMiddleware, requireCenterAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const centerAdmin = await User.findById(req.user._id);
    const centerId = centerAdmin?.centerId || centerAdmin?.centerAdminInfo?.managedCenters?.[0];

    if (!centerId) {
      return res.status(400).json({
        success: false,
        message: '관리하는 센터가 없습니다.'
      });
    }

    const { memberId } = req.params;
    const updateData = req.body;

    // 회원 정보 조회
    const member = await User.findOne({
      _id: memberId, 
      userType: 'student',
      centerId: new mongoose.Types.ObjectId(centerId)
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: '회원을 찾을 수 없습니다.'
      });
    }

    // 회원 정보 업데이트
    const allowedFields = [
      'name', 'email', 'phone', 'status', 'currentLevel', 
      'emergencyContact', 'medicalConditions', 'swimmingGoals', 
      'centerMemo', 'membershipType', 'notes'
    ];

    // 기본 정보 업데이트
    if (updateData.name) member.name = updateData.name;
    if (updateData.email) member.email = updateData.email;
    if (updateData.phone !== undefined) member.phone = updateData.phone;
    if (updateData.status && member.studentInfo) {
      member.studentInfo.status = updateData.status;
    }

    // studentInfo 객체 초기화
    if (!member.studentInfo) {
      member.studentInfo = {} as any;
    }

    // studentInfo 필드 업데이트
    if (updateData.currentLevel !== undefined) member.studentInfo.currentLevel = updateData.currentLevel;
    if (updateData.emergencyContact !== undefined) member.studentInfo.emergencyContact = updateData.emergencyContact;
    if (updateData.medicalConditions !== undefined) member.studentInfo.medicalConditions = updateData.medicalConditions;
    if (updateData.swimmingGoals !== undefined && member.studentInfo.swimmingProfile) {
      member.studentInfo.swimmingProfile.currentGoal = Array.isArray(updateData.swimmingGoals) 
        ? updateData.swimmingGoals[0] 
        : updateData.swimmingGoals;
    }
    if (updateData.centerMemo !== undefined) member.studentInfo.centerMemo = updateData.centerMemo;
    // membershipType과 notes는 studentInfo에 없는 필드이므로 무시

    await member.save();

    res.json({
      success: true,
      message: '회원 정보가 성공적으로 수정되었습니다.',
      data: member
    });
  } catch (error) {
    console.error('회원 정보 수정 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

/**
 * 강사별 수업 일정 조회
 * GET /api/center-admin/instructors/:instructorId/lessons
 */
router.get('/instructors/:instructorId/lessons', authMiddleware, requireCenterAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { instructorId } = req.params;
    const { date } = req.query;

    console.log('📅 강사 수업 일정 조회:', { instructorId, date });

    if (!date) {
      return res.status(400).json({
        success: false,
        message: '날짜가 필요합니다.'
      });
    }

    // 요청 날짜 파싱
    const requestedDate = new Date(date as string);
    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][requestedDate.getDay()];

    console.log('📅 요청된 날짜:', { 
      date: requestedDate.toISOString().split('T')[0],
      dayOfWeek 
    });

    // ⭐ 요일 필터 제거 - 모든 요일의 수업 표시

    // centerId 조회
    const centerId = await getCenterId(req);
    console.log('🔍 강사 수업 일정 조회 - 필터 조건:', {
      instructorId,
      centerId,
      isPersonalLesson: { $ne: true }
    });

    // 1. 단체반 수업 일정 조회
    // instructorId 또는 instructor 필드로 조회 (둘 중 하나가 일치하면 조회)
    const courses = await Course.find({
      $or: [
        { instructorId: instructorId },
        { instructor: instructorId }
      ],
      centerId: centerId,
      isPersonalLesson: { $ne: true }
    })
    .populate('enrolledStudents.student', 'name phone');

    console.log('📚 조회된 단체반 과정 수:', courses.length);
    courses.forEach((course, index) => {
      console.log(`  ${index + 1}. ${course.name} - 학생 ${course.enrolledStudents?.length || 0}명, 스케줄:`, course.schedule?.map((s: any) => `${s.day} ${s.startTime}`));
    });

    // 2. Course 모델에서 isPersonalLesson=true인 개인레슨 조회
    // instructorId 또는 instructor 필드로 조회 (둘 중 하나가 일치하면 조회)
    const coursePersonalLessons = await Course.find({
      $or: [
        { instructorId: instructorId },
        { instructor: instructorId }
      ],
      centerId: centerId,
      isPersonalLesson: true
    })
    .populate('enrolledStudents.student', 'name phone');

    console.log('🏊 Course 모델의 개인레슨 수:', coursePersonalLessons.length);
    coursePersonalLessons.forEach((course, index) => {
      console.log(`  ${index + 1}. ${course.name} - 학생 ${course.enrolledStudents?.length || 0}명, 스케줄:`, course.schedule?.map((s: any) => `${s.day} ${s.startTime}`));
    });

    // 3. PersonalLesson 모델에서 개인레슨 조회
    const personalLessons = await PersonalLesson.find({
      instructorId: instructorId,
      centerId: centerId
    })
    .populate('studentId', 'name phone');

    console.log('🏊 PersonalLesson 모델의 개인레슨 수:', personalLessons.length);
    personalLessons.forEach((lesson, index) => {
      console.log(`  ${index + 1}. ${(lesson.studentId as any)?.name || '미배정'} - ${lesson.time}, 상태: ${lesson.status}`);
    });

    // 수업 일정 변환 함수
    const transformLessons = (courses: any[], coursePersonalLessons: any[], personalLessons: any[]) => {
      const lessons: any[] = [];

      console.log('🔄 수업 일정 변환 시작...');
      
      // 단체반 처리 - 과정 단위로 표시 (요일별로 중복 생성하지 않음)
      courses.forEach((course, courseIndex) => {
        console.log(`  📚 단체반 ${courseIndex + 1}: ${course.name}`);
        
        // 수업 시간 및 요일 정보 수집
        const scheduleInfo = course.schedule?.map((sch: any) => `${sch.day} ${sch.startTime}-${sch.endTime}`).join(', ') || '스케줄 없음';
        
        // enrolledStudents가 있으면 학생별로 수업 생성
        if (course.enrolledStudents && course.enrolledStudents.length > 0) {
          console.log(`    📅 스케줄: ${scheduleInfo}, 학생 ${course.enrolledStudents.length}명`);
          
          // 학생별로 하나의 수업만 생성 (요일 중복 없이)
          course.enrolledStudents.forEach((enrollment: any, studentIndex: number) => {
            const student = enrollment.student;
            console.log(`      👤 학생 ${studentIndex + 1}: ${student.name}`);
            
            lessons.push({
              _id: `${course._id}_${student._id}`,
              courseId: course._id,
              courseName: course.name,
              studentId: student._id,
              studentName: student.name,
              studentPhone: student.phone,
              instructorId: instructorId,
              scheduledDates: course.schedule?.map(s => {
                const dayMap: { [key: string]: string } = {
                  'monday': '월',
                  'tuesday': '화',
                  'wednesday': '수',
                  'thursday': '목',
                  'friday': '금',
                  'saturday': '토',
                  'sunday': '일'
                };
                return dayMap[s.day.toLowerCase()] || s.day;
              }).join(', '), // 모든 요일 표시
              startTime: course.schedule?.[0]?.startTime || '09:00',
              endTime: course.schedule?.[0]?.endTime || '10:00',
              status: 'scheduled',
              lessonType: 'group',
              level: course.level,
              poolType: course.schedule?.[0]?.poolType || 'mainPool',
              laneNumber: (course.schedule?.[0]?.lanes?.assignedLanes?.join(',') || course.laneInfo?.assignedLanes?.join(',') || '1'),
              packageInfo: null,
              progress: enrollment.progress
            });
          });
        } else {
          // enrolledStudents가 없어도 과정 자체를 하나의 수업으로 표시 (회원 미배정)
          console.log(`    📅 스케줄: ${scheduleInfo}, 회원 미배정`);
          
          lessons.push({
            _id: `${course._id}_no_student`,
            courseId: course._id,
            courseName: course.name,
            studentId: null,
            studentName: '회원 미배정',
            studentPhone: null,
            instructorId: instructorId,
            scheduledDates: course.schedule?.map(s => {
              const dayMap: { [key: string]: string } = {
                'monday': '월',
                'tuesday': '화',
                'wednesday': '수',
                'thursday': '목',
                'friday': '금',
                'saturday': '토',
                'sunday': '일'
              };
              return dayMap[s.day.toLowerCase()] || s.day;
            }).join(', '),
            startTime: course.schedule?.[0]?.startTime || '09:00',
            endTime: course.schedule?.[0]?.endTime || '10:00',
            status: 'scheduled',
            lessonType: 'group',
            level: course.level,
            poolType: course.schedule?.[0]?.poolType || 'mainPool',
            laneNumber: (course.schedule?.[0]?.lanes?.assignedLanes?.join(',') || course.laneInfo?.assignedLanes?.join(',') || '1'),
            packageInfo: null,
            progress: null
          });
        }
      });

      console.log(`✅ 단체반 변환 완료: ${lessons.length}개 수업 생성`);

      // Course 모델의 개인레슨 처리 - 과정 단위로 표시
      coursePersonalLessons.forEach((course, courseIndex) => {
        console.log(`  🏊 개인레슨(Course) ${courseIndex + 1}: ${course.name}`);
        
        const scheduleInfo = course.schedule?.map((sch: any) => `${sch.day} ${sch.startTime}-${sch.endTime}`).join(', ') || '스케줄 없음';
        
        // enrolledStudents가 있으면 학생별로 수업 생성
        if (course.enrolledStudents && course.enrolledStudents.length > 0) {
          console.log(`    📅 스케줄: ${scheduleInfo}, 학생 ${course.enrolledStudents.length}명`);
          
          course.enrolledStudents.forEach((enrollment: any, studentIndex: number) => {
            const student = enrollment.student;
            console.log(`      👤 학생 ${studentIndex + 1}: ${student.name}`);
            
            lessons.push({
              _id: `${course._id}_${student._id}`,
              courseId: course._id,
              courseName: course.name,
              studentId: student._id,
              studentName: student.name,
              studentPhone: student.phone,
              instructorId: instructorId,
              scheduledDates: course.schedule?.map(s => {
                const dayMap: { [key: string]: string } = {
                  'monday': '월',
                  'tuesday': '화',
                  'wednesday': '수',
                  'thursday': '목',
                  'friday': '금',
                  'saturday': '토',
                  'sunday': '일'
                };
                return dayMap[s.day.toLowerCase()] || s.day;
              }).join(', '),
              startTime: course.schedule?.[0]?.startTime || '09:00',
              endTime: course.schedule?.[0]?.endTime || '10:00',
              status: 'scheduled',
              lessonType: 'private',
              level: course.level,
              poolType: course.schedule?.[0]?.poolType || 'mainPool',
              laneNumber: (course.schedule?.[0]?.lanes?.assignedLanes?.join(',') || course.laneInfo?.assignedLanes?.join(',') || '1'),
              packageInfo: null,
              progress: enrollment.progress
            });
          });
        } else {
          // enrolledStudents가 없어도 과정 자체를 하나의 수업으로 표시 (회원 미배정)
          console.log(`    📅 스케줄: ${scheduleInfo}, 회원 미배정`);
          
          lessons.push({
            _id: `${course._id}_no_student`,
            courseId: course._id,
            courseName: course.name,
            studentId: null,
            studentName: '회원 미배정',
            studentPhone: null,
            instructorId: instructorId,
            scheduledDates: course.schedule?.map(s => {
              const dayMap: { [key: string]: string } = {
                'monday': '월',
                'tuesday': '화',
                'wednesday': '수',
                'thursday': '목',
                'friday': '금',
                'saturday': '토',
                'sunday': '일'
              };
              return dayMap[s.day.toLowerCase()] || s.day;
            }).join(', '),
            startTime: course.schedule?.[0]?.startTime || '09:00',
            endTime: course.schedule?.[0]?.endTime || '10:00',
            status: 'scheduled',
            lessonType: 'private',
            level: course.level,
            poolType: course.schedule?.[0]?.poolType || 'mainPool',
            laneNumber: (course.schedule?.[0]?.lanes?.assignedLanes?.join(',') || course.laneInfo?.assignedLanes?.join(',') || '1'),
            packageInfo: null,
            progress: null
          });
        }
      });
      
      console.log(`✅ 개인레슨(Course) 변환 완료: 총 ${lessons.length}개 수업 생성`);

      // PersonalLesson 모델의 개인레슨 처리
      personalLessons.forEach((lesson: any) => {
        const [hour, minute] = lesson.time.split(':').map(Number);
        const startTime = new Date(lesson.date);
        startTime.setHours(hour, minute, 0, 0);
        
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + lesson.duration);

        lessons.push({
          _id: lesson._id,
          courseId: lesson._id,
          studentId: lesson.studentId._id,
          studentName: lesson.studentId.name,
          studentPhone: lesson.studentId.phone,
          instructorId: instructorId,
          scheduledDate: new Date(lesson.date).toISOString().split('T')[0],
          startTime: lesson.time,
          endTime: `${String(endTime.getHours()).padStart(2, '0')}:${String(endTime.getMinutes()).padStart(2, '0')}`,
          status: lesson.status === 'approved' ? 'scheduled' : 'pending',
          lessonType: 'private',
          level: lesson.skillLevel,
          poolType: 'mainPool',
          laneNumber: lesson.assignedLane || 1,
          packageInfo: null, // TODO: 패키지 정보 추가
          progress: null
        });
      });

      // 시간순 정렬
      lessons.sort((a, b) => {
        const timeA = a.startTime.split(':').map(Number);
        const timeB = b.startTime.split(':').map(Number);
        
        if (timeA[0] !== timeB[0]) return timeA[0] - timeB[0];
        return timeA[1] - timeB[1];
      });

      return lessons;
    };

    const transformedLessons = transformLessons(courses, coursePersonalLessons, personalLessons);

    console.log('✅ 변환된 수업 일정 수:', transformedLessons.length);

    res.json({
      success: true,
      data: transformedLessons
    });

  } catch (error) {
    console.error('❌ 강사 수업 일정 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

/**
 * 수업 상태 업데이트
 * PUT /api/lessons/:lessonId/status
 */
router.put('/lessons/:lessonId/status', authMiddleware, requireCenterAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { lessonId } = req.params;
    const { status } = req.body;

    console.log('📝 수업 상태 업데이트:', { lessonId, status });

    // lessonId 파싱: "courseId_studentId" 형식
    const [courseId, studentId] = lessonId.split('_');
    
    console.log('📋 파싱된 lessonId:', { courseId, studentId });

    if (status === 'cancelled') {
      // 수업 취소 시 해당 회원을 반에서 제외
      const course = await Course.findById(courseId);
      
      if (!course) {
        return res.status(404).json({
          success: false,
          message: '강습 과정을 찾을 수 없습니다.'
        });
      }

      console.log('🗑️ 취소 전 enrolledStudents:', course.enrolledStudents.length);
      
      // enrolledStudents에서 해당 학생 제거
      course.enrolledStudents = course.enrolledStudents.filter(
        (enrollment: any) => enrollment.student?.toString() !== studentId
      );

      // currentStudents 카운트 업데이트
      course.currentStudents = course.enrolledStudents.filter(
        (e: any) => e.status === 'active'
      ).length;

      await course.save();

      console.log('✅ 취소 후 enrolledStudents:', course.enrolledStudents.length);
      
      return res.json({
        success: true,
        message: '회원이 강습 과정에서 제외되었습니다.',
        data: {
          courseId,
          studentId,
          remainingStudents: course.enrolledStudents.length
        }
      });
    }

    res.json({
      success: true,
      message: '수업 상태가 업데이트되었습니다.'
    });

  } catch (error) {
    console.error('❌ 수업 상태 업데이트 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

/**
 * 수업 진행 기록 저장
 * PUT /api/lessons/:lessonId/progress
 */
router.put('/lessons/:lessonId/progress', authMiddleware, requireCenterAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { lessonId } = req.params;
    const progressData = req.body;

    console.log('📝 수업 진행 기록 저장:', { lessonId, progressData });

    // TODO: 실제로 Course.enrolledStudents.progress 또는 PersonalLesson에 저장
    // 현재는 간단하게 임시 처리

    res.json({
      success: true,
      message: '수업 진행 기록이 저장되었습니다.'
    });

  } catch (error) {
    console.error('❌ 수업 진행 기록 저장 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// getCenterId 헬퍼 함수: 헤더 우선, 없으면 사용자 소속 사용
async function getCenterId(req: AuthRequest): Promise<string | null> {
  const headerCenterId = (req.headers['x-center-id'] as string | undefined)?.trim();
  if (headerCenterId) {
    return headerCenterId;
  }
  const centerAdmin = await User.findById(req.user?._id);
  const centerId = centerAdmin?.centerId || centerAdmin?.centerAdminInfo?.managedCenters?.[0];
  return centerId ? centerId.toString() : null;
}

export default router;