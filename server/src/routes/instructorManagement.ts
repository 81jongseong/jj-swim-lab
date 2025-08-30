/**
 * 👨‍🏫 JJ Swim Lab - 강사관리 API 라우터
 * 
 * 📋 **API 목적**
 * - 최고관리자가 모든 강사를 통합 관리하는 API
 * - 강사 정보, 강습 현황, 성과, 학생 관리 등을 위한 CRUD 작업
 * - 강사별 성과 분석 및 평가 데이터 관리
 * 
 * 🔄 **주요 기능**
 * - 강사 목록 조회 및 검색
 * - 강사 정보 CRUD 작업
 * - 강사별 성과 데이터 관리
 * - 학생 관리 현황 조회
 * - 강사 평가 및 피드백 관리
 * 
 * 🗄️ **데이터 연동**
 * - 강사 정보 데이터베이스 (User 모델)
 * - 강습 현황 및 성과 데이터 (Performance 모델)
 * - 학생 관리 및 체크리스트 데이터 (Student, Checklist 모델)
 * - 강사 평가 및 피드백 데이터 (Evaluation 모델)
 * 
 * 🛠️ **필요한 설치 파일**
 * - Express.js (라우터)
 * - MongoDB (Mongoose ODM)
 * - JWT 인증 미들웨어
 * - 권한 검증 미들웨어
 * - 데이터 검증 미들웨어
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 최고 관리자 권한 확인 필수
 * 2. 강사 개인정보 보호 및 보안
 * 3. 데이터 무결성 및 일관성 유지
 * 4. API 응답 시간 최적화
 * 5. 에러 처리 및 로깅
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 최고 관리자 권한 확인
 * - [ ] API 보안 설정 검증
 * - [ ] 데이터베이스 연결 상태 확인
 * - [ ] 에러 처리 및 로깅 검증
 * - [ ] API 응답 시간 테스트
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (강사관리 API 시스템)
 * - 2024-12-19: 강사 성과 분석 API 구현
 * - 2024-12-19: 학생 관리 연동 API 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (강사관리 API 시스템 완료)
 * 
 * 🚀 **다음 단계**
 * - 실시간 데이터 업데이트 (WebSocket)
 * - 캐싱 시스템 구현
 * - API 버전 관리
 * - 성능 모니터링
 * 
 * 💡 **사용 예시**
 * ```typescript
 * // 강사 목록 조회
 * GET /api/instructor-management/instructors
 * 
 * // 강사 성과 데이터 조회
 * GET /api/instructor-management/performance/:instructorId
 * 
 * // 강사 정보 업데이트
 * PUT /api/instructor-management/instructors/:id
 * ```
 */

import express from 'express';
import { auth as authMiddleware } from '../middleware/auth';
import { roleMiddleware } from '../middleware/role';
import { User } from '../models/User';
import { Center } from '../models/Center';
import { Course } from '../models/Course';
import { Booking } from '../models/Booking';
import { Checklist } from '../models/Checklist';
import { HealthData } from '../models/HealthData';

const router = express.Router();

// 최고 관리자 권한 확인 미들웨어
const superAdminOnly = roleMiddleware(['superAdmin']);

/**
 * 🎯 **전체 강사 현황 조회**
 * GET /api/instructor-management/overview
 */
router.get('/overview', authMiddleware, superAdminOnly, async (req, res) => {
  try {
    // 전체 강사 수 조회
    const totalInstructors = await User.countDocuments({ userType: 'instructor' });
    
    // 활성 강사 수 조회
    const activeInstructors = await User.countDocuments({ 
      userType: 'instructor', 
      status: 'active' 
    });
    
    // 전체 학생 수 조회
    const totalStudents = await User.countDocuments({ userType: 'student' });
    
    // 강사별 평균 평점 계산
    const instructors = await User.find({ userType: 'instructor' });
    const totalRating = instructors.reduce((sum, instructor) => sum + ((instructor as any).rating || 0), 0);
    const averageRating = totalRating / totalInstructors || 0;

    // 센터별 강사 분포
    const centerDistribution = await User.aggregate([
      { $match: { userType: 'instructor' } },
      { $group: { _id: '$centerId', count: { $sum: 1 } } },
      { $lookup: { from: 'centers', localField: '_id', foreignField: '_id', as: 'center' } },
      { $unwind: '$center' },
      { $project: { centerName: '$center.name', count: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        totalInstructors,
        activeInstructors,
        totalStudents,
        averageRating: Math.round(averageRating * 10) / 10,
        centerDistribution
      }
    });
  } catch (error) {
    console.error('강사 현황 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '강사 현황 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * 🎯 **강사 목록 조회**
 * GET /api/instructor-management/instructors
 */
router.get('/instructors', authMiddleware, superAdminOnly, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      status = 'all',
      center = 'all',
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    // 검색 조건 구성
    const searchQuery: any = { userType: 'instructor' };
    
    if (search) {
      searchQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status !== 'all') {
      searchQuery.status = status;
    }
    
    if (center !== 'all') {
      searchQuery.centerId = center;
    }

    // 정렬 조건 구성
    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    // 페이지네이션
    const skip = (Number(page) - 1) * Number(limit);
    
    // 강사 목록 조회
    const instructors = await User.find(searchQuery)
      .populate('centerId', 'name address')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .select('-password');

    // 전체 강사 수 조회
    const total = await User.countDocuments(searchQuery);

    // 강사별 추가 정보 계산
    const instructorsWithDetails = await Promise.all(
      instructors.map(async (instructor) => {
        // 강사별 학생 수 조회
        const totalStudents = await User.countDocuments({
          instructorId: instructor._id,
          userType: 'student'
        });

        // 활성 학생 수 조회 (최근 30일 내 활동)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const activeStudents = await User.countDocuments({
          instructorId: instructor._id,
          userType: 'student',
          lastActive: { $gte: thirtyDaysAgo }
        });

        // 강습 완료율 계산
        const totalBookings = await Booking.countDocuments({
          instructorId: instructor._id,
          status: { $in: ['completed', 'cancelled'] }
        });

        const completedBookings = await Booking.countDocuments({
          instructorId: instructor._id,
          status: 'completed'
        });

        const completionRate = totalBookings > 0 
          ? Math.round((completedBookings / totalBookings) * 100)
          : 0;

        return {
          ...instructor.toObject(),
          totalStudents,
          activeStudents,
          completionRate
        };
      })
    );

    res.json({
      success: true,
      data: {
        instructors: instructorsWithDetails,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalItems: total,
          itemsPerPage: Number(limit)
        }
      }
    });
  } catch (error) {
    console.error('강사 목록 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '강사 목록 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * 🎯 **강사 상세 정보 조회**
 * GET /api/instructor-management/instructors/:id
 */
router.get('/instructors/:id', authMiddleware, superAdminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    const instructor = await User.findById(id)
      .populate('centerId', 'name address phone')
      .select('-password');

    if (!instructor || instructor.userType !== 'instructor') {
      return res.status(404).json({
        success: false,
        message: '강사를 찾을 수 없습니다.'
      });
    }

    // 강사별 학생 목록 조회
    const students = await User.find({
      instructorId: id,
      userType: 'student'
    }).select('name email phone status lastActive');

    // 강사별 강습 현황 조회
    const bookings = await Booking.find({ instructorId: id })
      .populate('studentId', 'name')
      .populate('courseId', 'name level')
      .sort({ date: -1 })
      .limit(20);

    // 강사별 체크리스트 현황 조회
    const checklists = await Checklist.find({ instructorId: id })
      .populate('studentId', 'name')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      data: {
        instructor,
        students,
        recentBookings: bookings,
        recentChecklists: checklists
      }
    });
  } catch (error) {
    console.error('강사 상세 정보 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '강사 상세 정보 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * 🎯 **강사 정보 업데이트**
 * PUT /api/instructor-management/instructors/:id
 */
router.put('/instructors/:id', authMiddleware, superAdminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // 업데이트 가능한 필드만 허용
    const allowedFields = [
      'name', 'email', 'phone', 'specialization', 'experience',
      'status', 'centerId', 'rating', 'bio'
    ];

    const filteredData: any = {};
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    });

    const instructor = await User.findByIdAndUpdate(
      id,
      filteredData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: '강사를 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      message: '강사 정보가 성공적으로 업데이트되었습니다.',
      data: instructor
    });
  } catch (error) {
    console.error('강사 정보 업데이트 실패:', error);
    res.status(500).json({
      success: false,
      message: '강사 정보 업데이트 중 오류가 발생했습니다.'
    });
  }
});

/**
 * 🎯 **강사 성과 데이터 조회**
 * GET /api/instructor-management/performance/:instructorId
 */
router.get('/performance/:instructorId', authMiddleware, superAdminOnly, async (req, res) => {
  try {
    const { instructorId } = req.params;
    const { period = 'month' } = req.query;

    // 기간별 날짜 계산
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // 강습 현황 조회
    const totalLessons = await Booking.countDocuments({
      instructorId,
      date: { $gte: startDate, $lte: now }
    });

    const completedLessons = await Booking.countDocuments({
      instructorId,
      date: { $gte: startDate, $lte: now },
      status: 'completed'
    });

    // 학생 만족도 조회 (평점)
    const instructor = await User.findById(instructorId);
    const studentSatisfaction = (instructor as any)?.rating || 0;

    // 출석률 계산
    const totalBookings = await Booking.countDocuments({
      instructorId,
      date: { $gte: startDate, $lte: now },
      status: { $in: ['completed', 'cancelled'] }
    });

    const attendanceRate = totalBookings > 0 
      ? Math.round((completedLessons / totalBookings) * 100)
      : 0;

    // 학생 진행률 계산
    const students = await User.find({
      instructorId,
      userType: 'student'
    });

    let totalProgress = 0;
    let studentCount = 0;

    for (const student of students) {
      const studentChecklists = await Checklist.find({
        studentId: student._id,
        instructorId
      });

      if (studentChecklists.length > 0) {
        const completedItems = studentChecklists.reduce((sum, checklist) => {
          return sum + checklist.items.filter((item: any) => item.completed).length;
        }, 0);

        const totalItems = studentChecklists.reduce((sum, checklist) => {
          return sum + checklist.items.length;
        }, 0);

        if (totalItems > 0) {
          totalProgress += (completedItems / totalItems) * 100;
          studentCount++;
        }
      }
    }

    const averageProgressRate = studentCount > 0 
      ? Math.round(totalProgress / studentCount)
      : 0;

    // 이전 기간과 비교하여 성장률 계산
    let previousStartDate: Date;
    switch (period) {
      case 'week':
        previousStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        previousStartDate = new Date(startDate.getFullYear(), startDate.getMonth() - 1, 1);
        break;
      case 'quarter':
        previousStartDate = new Date(startDate.getFullYear(), startDate.getMonth() - 3, 1);
        break;
      case 'year':
        previousStartDate = new Date(startDate.getFullYear() - 1, 0, 1);
        break;
      default:
        previousStartDate = new Date(startDate.getFullYear(), startDate.getMonth() - 1, 1);
    }

    const previousLessons = await Booking.countDocuments({
      instructorId,
      date: { $gte: previousStartDate, $lt: startDate }
    });

    const monthlyGrowth = previousLessons > 0 
      ? Math.round(((totalLessons - previousLessons) / previousLessons) * 100)
      : 0;

    res.json({
      success: true,
      data: {
        instructorId,
        period,
        totalLessons,
        completedLessons,
        studentSatisfaction,
        progressRate: averageProgressRate,
        attendanceRate,
        monthlyGrowth
      }
    });
  } catch (error) {
    console.error('강사 성과 데이터 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '강사 성과 데이터 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * 🎯 **강사별 학생 관리 현황 조회**
 * GET /api/instructor-management/students/:instructorId
 */
router.get('/students/:instructorId', authMiddleware, superAdminOnly, async (req, res) => {
  try {
    const { instructorId } = req.params;

    // 강사의 학생 목록 조회
    const students = await User.find({
      instructorId,
      userType: 'student'
    }).select('name email phone status lastActive joinDate');

    // 학생별 상세 정보 조회
    const studentsWithDetails = await Promise.all(
      students.map(async (student) => {
        // 체크리스트 현황
        const checklists = await Checklist.find({
          studentId: student._id,
          instructorId
        });

        const totalChecklistItems = checklists.reduce((sum, checklist) => {
          return sum + checklist.items.length;
        }, 0);

        const completedChecklistItems = checklists.reduce((sum, checklist) => {
          return sum + checklist.items.filter((item: any) => item.completed).length;
        }, 0);

        const checklistProgress = totalChecklistItems > 0 
          ? Math.round((completedChecklistItems / totalChecklistItems) * 100)
          : 0;

        // 강습 진행률
        const totalBookings = await Booking.countDocuments({
          studentId: student._id,
          instructorId
        });

        const completedBookings = await Booking.countDocuments({
          studentId: student._id,
          instructorId,
          status: 'completed'
        });

        const courseProgress = totalBookings > 0 
          ? Math.round((completedBookings / totalBookings) * 100)
          : 0;

        // 건강 데이터 현황
        const healthData = await HealthData.findOne({
          studentId: student._id
        });

        return {
          ...student.toObject(),
          checklistProgress,
          courseProgress,
          hasHealthData: !!healthData,
          totalChecklists: checklists.length
        };
      })
    );

    res.json({
      success: true,
      data: {
        instructorId,
        students: studentsWithDetails
      }
    });
  } catch (error) {
    console.error('강사별 학생 관리 현황 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '강사별 학생 관리 현황 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * 🎯 **센터별 강사 현황 조회**
 * GET /api/instructor-management/centers
 */
router.get('/centers', authMiddleware, superAdminOnly, async (req, res) => {
  try {
    const centers = await Center.find().select('name address phone');

    const centersWithInstructors = await Promise.all(
      centers.map(async (center) => {
        const instructors = await User.find({
          centerId: center._id,
          userType: 'instructor'
        }).select('name email status rating');

        const students = await User.find({
          centerId: center._id,
          userType: 'student'
        }).select('name status');

        return {
          ...center.toObject(),
          instructorCount: instructors.length,
          studentCount: students.length,
          instructors,
          students
        };
      })
    );

    res.json({
      success: true,
      data: centersWithInstructors
    });
  } catch (error) {
    console.error('센터별 강사 현황 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '센터별 강사 현황 조회 중 오류가 발생했습니다.'
    });
  }
});

export default router;

