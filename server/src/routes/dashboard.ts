import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { Course } from '../models/Course';
import { Booking } from '../models/Booking';
import { Payment } from '../models/Payment';
import { Notice } from '../models/Notice';

// Request 타입 확장
interface AuthRequest extends Request {
  user?: any;
}

const router: Router = Router();

// 인증 미들웨어
const authenticateToken = (req: AuthRequest, res: Response, next: Function) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: '인증 토큰이 필요합니다.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
  }
};

// 관리자 권한 확인
const requireAdmin = async (req: AuthRequest, res: Response, next: Function) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || user.userType !== 'admin') {
      return res.status(403).json({ error: '관리자 권한이 필요합니다.' });
    }
    return next();
  } catch (error) {
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};

// 강사 권한 확인
const requireInstructor = async (req: AuthRequest, res: Response, next: Function) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || (user.userType !== 'instructor' && user.userType !== 'admin')) {
      return res.status(403).json({ error: '강사 권한이 필요합니다.' });
    }
    return next();
  } catch (error) {
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};

// 대시보드 데이터 조회
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    // 사용자 타입에 따른 대시보드 데이터
    let dashboardData: any = {
      user: {
        id: user._id,
        name: user.name,
        userId: user.userId,
        userType: user.userType,
        email: user.email
      }
    };

    if (user.userType === 'admin') {
      // 관리자 대시보드
      const totalUsers = await User.countDocuments();
      const totalInstructors = await User.countDocuments({ userType: 'instructor' });
      const totalMembers = await User.countDocuments({ userType: 'member' });
      const activeUsers = await User.countDocuments({ isActive: true });
      const totalCourses = await Course.countDocuments();
      const activeCourses = await Course.countDocuments({ isActive: true });
      const totalBookings = await Booking.countDocuments();
      const todayBookings = await Booking.countDocuments({
        date: {
          $gte: new Date().setHours(0, 0, 0, 0),
          $lt: new Date().setHours(23, 59, 59, 999)
        }
      });
      const totalPayments = await Payment.countDocuments({ status: 'completed' });
      const totalRevenue = await Payment.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      dashboardData.stats = {
        totalUsers,
        totalInstructors,
        totalMembers,
        activeUsers,
        totalCourses,
        activeCourses,
        totalBookings,
        todayBookings,
        totalPayments,
        totalRevenue: totalRevenue[0]?.total || 0
      };

      // 최근 활동
      const recentBookings = await Booking.find()
        .populate('user', 'name userId')
        .sort({ createdAt: -1 })
        .limit(5);

      const recentPayments = await Payment.find({ status: 'completed' })
        .populate('user', 'name userId')
        .sort({ processedAt: -1 })
        .limit(5);

      dashboardData.recentActivity = {
        bookings: recentBookings,
        payments: recentPayments
      };

    } else if (user.userType === 'instructor') {
      // 강사 대시보드
      const myCourses = await Course.find({ instructor: user._id })
        .populate('enrolledStudents.student', 'name userId')
        .sort({ createdAt: -1 });

      const totalStudents = myCourses.reduce((sum, course) => 
        sum + course.enrolledStudents.filter(e => e.status === 'active').length, 0
      );

      const todayBookings = await Booking.countDocuments({
        instructor: user._id,
        date: {
          $gte: new Date().setHours(0, 0, 0, 0),
          $lt: new Date().setHours(23, 59, 59, 999)
        }
      });

      dashboardData.stats = {
        totalCourses: myCourses.length,
        totalStudents,
        todayBookings
      };

      dashboardData.courses = myCourses;

    } else {
      // 일반 회원 대시보드
      const myBookings = await Booking.find({ user: user._id })
        .populate('instructor', 'name userId')
        .populate('course', 'name')
        .sort({ date: -1 })
        .limit(5);

      const myCourses = await Course.find({
        'enrolledStudents.student': user._id,
        'enrolledStudents.status': 'active'
      })
        .populate('instructor', 'name userId')
        .sort({ createdAt: -1 });

      const myPayments = await Payment.find({ user: user._id })
        .populate('relatedCourse', 'name')
        .populate('relatedBooking', 'date startTime endTime')
        .sort({ createdAt: -1 })
        .limit(5);

      dashboardData.stats = {
        totalBookings: myBookings.length,
        totalCourses: myCourses.length,
        totalPayments: myPayments.length
      };

      dashboardData.recentActivity = {
        bookings: myBookings,
        courses: myCourses,
        payments: myPayments
      };
    }

    return res.json(dashboardData);
  } catch (error) {
    console.error('대시보드 조회 오류:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 관리자 통계 데이터
router.get('/admin/stats', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { period } = req.query; // 'day', 'week', 'month'
    
    let dateFilter: any = {};
    const now = new Date();
    
    if (period === 'day') {
      dateFilter = {
        $gte: new Date(now.setHours(0, 0, 0, 0)),
        $lte: new Date(now.setHours(23, 59, 59, 999))
      };
    } else if (period === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { $gte: weekAgo, $lte: now };
    } else if (period === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = { $gte: monthAgo, $lte: now };
    }

    const stats = {
      users: await User.countDocuments(dateFilter),
      courses: await Course.countDocuments(dateFilter),
      bookings: await Booking.countDocuments(dateFilter),
      payments: await Payment.countDocuments({ ...dateFilter, status: 'completed' }),
      revenue: await Payment.aggregate([
        { $match: { ...dateFilter, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    };

    return res.json(stats);
  } catch (error) {
    console.error('관리자 통계 조회 오류:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 강사 통계 데이터
router.get('/instructor/stats', authenticateToken, requireInstructor, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    const myCourses = await Course.find({ instructor: user._id });
    const totalStudents = myCourses.reduce((sum, course) => 
      sum + course.enrolledStudents.filter(e => e.status === 'active').length, 0
    );

    const todayBookings = await Booking.countDocuments({
      instructor: user._id,
      date: {
        $gte: new Date().setHours(0, 0, 0, 0),
        $lt: new Date().setHours(23, 59, 59, 999)
      }
    });

    const stats = {
      totalCourses: myCourses.length,
      totalStudents,
      todayBookings,
      activeCourses: myCourses.filter(course => course.isActive).length
    };

    return res.json(stats);
  } catch (error) {
    console.error('강사 통계 조회 오류:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

export default router; 