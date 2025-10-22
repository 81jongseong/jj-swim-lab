/**
 * @file 센터 관리자 API 라우트
 * @description 센터 관리자 전용 API 엔드포인트들을 정의합니다.
 * @date 2025-01-13
 * @author JJ Swim Lab
 */

import express, { Request, Response } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth';
import { User } from '../models/User';
import { Course } from '../models/Course';
import { Booking } from '../models/Booking';
import { Payment } from '../models/Payment';
import { Notice } from '../models/Notice';
import { Review } from '../models/Review';
import { Report } from '../models/Report';
import { SwimmingCenter } from '../models/SwimmingCenter'; // ⭐ SwimmingCenter 추가

interface AuthRequest extends Request {
  user?: any;
}

const router = express.Router();

// 센터 관리자 권한 확인 미들웨어
const requireCenterAdmin = requireRole(['centerAdmin']);

/**
 * 🏠 센터 관리자 대시보드 데이터 조회
 * GET /api/center-admin/dashboard
 */
router.get('/dashboard', authMiddleware, requireCenterAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const centerAdmin = await User.findById(req.user._id);
    const centerId = centerAdmin?.centerAdminInfo?.managedCenters?.[0];

    if (!centerId) {
      return res.status(400).json({
        success: false,
        message: '관리하는 센터가 없습니다.'
      });
    }

    // 센터 통계 조회
    const totalMembers = await User.countDocuments({
      $or: [
        { 'studentInfo.centerId': centerId },
        { 'instructorInfo.assignedCenters': centerId }
      ],
      isActive: true
    });

    const activeInstructors = await User.countDocuments({
      userType: 'instructor',
      'instructorInfo.assignedCenters': centerId,
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
    const centerId = centerAdmin?.centerAdminInfo?.managedCenters?.[0];

    if (!centerId) {
      return res.status(400).json({
        success: false,
        message: '관리하는 센터가 없습니다.'
      });
    }

    // 센터 정보 조회
    const center = await SwimmingCenter.findById(centerId);
    
    if (!center) {
      return res.status(404).json({
        success: false,
        message: '센터를 찾을 수 없습니다.'
      });
    }

    console.log('🏊 센터 정보 조회:', {
      centerName: center.name,
      poolConfiguration: center.poolConfiguration
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
      $or: [
        { 'studentInfo.centerId': centerId },
        { 'instructorInfo.assignedCenters': centerId }
      ],
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
      .select('-password')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      message: '센터 회원 목록 조회 성공!',
      data: {
        users,
        pagination: {
          current: Number(page),
          total: Math.ceil(total / Number(limit)),
          count: users.length,
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
 * 👨‍🏫 센터 강사 목록 조회
 * GET /api/center-admin/instructors
 */
router.get('/instructors', authMiddleware, requireCenterAdmin, async (req: AuthRequest, res: Response) => {
  try {
    console.log('📋 센터 강사 목록 조회 요청');
    const centerAdmin = await User.findById(req.user._id);
    const centerId = centerAdmin?.centerAdminInfo?.managedCenters?.[0];

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
      'instructorInfo.assignedCenters': centerId,
      isActive: true
    };

    console.log('🔍 검색 조건:', query);

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const instructors = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    console.log('📊 조회 결과:', {
      강사수: instructors.length,
      총계: total,
      강사목록: instructors.map(i => ({ name: i.name, id: i._id.toString() }))
    });

    res.json({
      success: true,
      message: '센터 강사 목록 조회 성공!',
      data: {
        instructors,
        pagination: {
          current: Number(page),
          total: Math.ceil(total / Number(limit)),
          count: instructors.length,
          totalCount: total
        }
      }
    });
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
      bodyKeys: Object.keys(req.body)
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
      'instructorInfo.assignedCenters': centerId
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
    }

    console.log('📊 업데이트 데이터:', updateData);

    // 강사 정보 업데이트
    const updatedInstructor = await User.findByIdAndUpdate(
      instructorId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    console.log('✅ 강사 정보 업데이트 성공:', updatedInstructor?.name);

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
 * 📚 센터 강의 목록 조회
 * GET /api/center-admin/courses
 */
router.get('/courses', authMiddleware, requireCenterAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const centerAdmin = await User.findById(req.user._id);
    const centerId = centerAdmin?.centerAdminInfo?.managedCenters?.[0];

    if (!centerId) {
      return res.status(400).json({
        success: false,
        message: '관리하는 센터가 없습니다.'
      });
    }

    const { page = 1, limit = 10, status = 'all' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query: any = { centerId };

    if (status !== 'all') {
      query.status = status;
    }

    const courses = await Course.find(query)
      .populate('instructorId', 'name email')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Course.countDocuments(query);

    res.json({
      success: true,
      message: '센터 강의 목록 조회 성공!',
      data: {
        courses,
        pagination: {
          current: Number(page),
          total: Math.ceil(total / Number(limit)),
          count: courses.length,
          totalCount: total
        }
      }
    });
  } catch (error) {
    console.error('센터 강의 목록 조회 오류:', error);
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

    const { page = 1, limit = 10, status = 'all', date } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query: any = { centerId };

    if (status !== 'all') {
      query.status = status;
    }

    if (date) {
      const startDate = new Date(date as string);
      const endDate = new Date(date as string);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }

    const bookings = await Booking.find(query)
      .populate('userId', 'name email phone')
      .populate('courseId', 'name level')
      .skip(skip)
      .limit(Number(limit))
      .sort({ date: -1 });

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      message: '센터 예약 목록 조회 성공!',
      data: {
        bookings,
        pagination: {
          current: Number(page),
          total: Math.ceil(total / Number(limit)),
          count: bookings.length,
          totalCount: total
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
      .populate('userId', 'name email')
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

export default router;