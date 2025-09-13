/**
 * @file 센터 관리자 API 라우트
 * @description 센터 관리자 전용 API 엔드포인트들을 정의합니다.
 * @date 2025-01-13
 * @author JJ Swim Lab
 */

import express, { Request, Response } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth';
import { User } from '../models/User';
import { Center } from '../models/Center';
import { Course } from '../models/Course';
import { Booking } from '../models/Booking';
import { Payment } from '../models/Payment';

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
    const centerAdmin = await User.findById(req.user._id);
    const centerId = centerAdmin?.centerAdminInfo?.managedCenters?.[0];

    if (!centerId) {
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

export default router;