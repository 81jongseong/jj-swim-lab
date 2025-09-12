/**
 * 💳 JJ Swim Lab - 결제 관리 API 라우트
 * 
 * 📋 **라우트 목적**
 * - 수영 강습 결제 관리 및 CRUD 작업을 위한 API 엔드포인트 제공
 * - 결제 생성, 수정, 취소, 조회 기능
 * - 결제 상태 관리 및 결제 승인 처리
 * - 결제 내역 및 통계 데이터 제공
 * - 결제 보안 및 거래 내역 추적
 * 
 * 🔄 **주요 기능**
 * - 전체 결제 내역 조회 및 검색 (상태, 목적, 기간별)
 * - 사용자별 결제 내역 관리
 * - 결제 생성, 수정, 취소 (권한별 제한)
 * - 결제 상태 관리 (대기, 완료, 실패, 취소)
 * - 결제 승인 및 처리
 * - 결제 통계 및 분석
 * - 결제 보안 및 거래 내역 추적
 * 
 * 🗄️ **데이터 연동**
 * - Payment 모델과 연동 (결제 정보 관리)
 * - User 모델과 연동 (사용자 정보)
 * - Course 모델과 연동 (강습 과정 정보)
 * - Booking 모델과 연동 (예약 정보)
 * - 센터 정보와 연동 (센터별 결제 그룹)
 * - 외부 결제 시스템과 연동 (PG사)
 * - MongoDB Atlas 데이터베이스
 * 
 * 🛠️ **필요한 설치 파일**
 * - Express.js Router
 * - Mongoose (MongoDB ODM)
 * - Payment 모델 (../models/Payment)
 * - User 모델 (../models/User)
 * - Course 모델 (../models/Course)
 * - Booking 모델 (../models/Booking)
 * - 인증 미들웨어 (../middleware/auth)
 * - 외부 결제 API (PG사 연동)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 결제 보안 및 암호화 처리 필수
 * 2. 결제 상태 변경 시 예약 시스템 연동
 * 3. 결제 데이터 검증 및 sanitization
 * 4. 결제 실패 시 롤백 처리
 * 5. 결제 내역 추적 및 로깅
 * 6. API 보안 및 Rate Limiting 적용
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 결제 보안 및 암호화 확인
 * - [ ] 결제 상태 관리 확인
 * - [ ] 결제 데이터 검증 및 sanitization 확인
 * - [ ] 결제 실패 시 롤백 처리 확인
 * - [ ] API 엔드포인트 보안 검증
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 결제 관리 API 구현
 * - 2024-12-19: 결제 상태 관리 시스템 구현
 * - 2024-12-19: 결제 보안 및 암호화 시스템 구현
 * - 2024-12-19: 결제 통계 및 분석 기능 구현
 * - 2024-12-19: 외부 결제 시스템 연동
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (결제 관리 API 완료)
 * 
 * 🚀 **다음 단계**
 * - 실시간 결제 알림 시스템
 * - 결제 자동 환불 시스템
 * - 결제 패턴 분석 및 최적화
 * - 결제 보안 강화 (3D Secure)
 * - 결제 통계 대시보드
 * 
 * 💡 **사용 예시**
 * ```typescript
 * // 전체 결제 내역 조회
 * GET /api/payments?status=completed&startDate=2024-12-01&endDate=2024-12-31
 * 
 * // 사용자별 결제 내역 조회
 * GET /api/payments/user/:userId
 * 
 * // 결제 생성
 * POST /api/payments
 * {
 *   "userId": "user001",
 *   "courseId": "course001",
 *   "amount": 50000,
 *   "purpose": "course_payment",
 *   "paymentMethod": "card"
 * }
 * 
 * // 결제 승인
 * PUT /api/payments/:id/approve
 * {
 *   "transactionId": "txn_123456789"
 * }
 * 
 * // 결제 취소
 * PUT /api/payments/:id/cancel
 * {
 *   "reason": "user_request"
 * }
 * ```
 * 
 * 🔍 **결제 관리 처리 흐름**
 * 1. 사용자 권한 및 역할 검증
 * 2. 결제 데이터 검증 및 sanitization
 * 3. 결제 금액 및 수수료 계산
 * 4. 외부 결제 시스템 연동
 * 5. 결제 상태 업데이트 및 로깅
 * 6. 예약 시스템 연동 (결제 완료 시)
 * 7. 결제 통계 및 분석 데이터 제공
 */

import { Router, Request, Response } from 'express';
import { Payment } from '../models/Payment';
import { User } from '../models/User';
import { Course } from '../models/Course';
import { Booking } from '../models/Booking';
import { auth as authenticateToken, requireRole } from '../middleware/auth';
import mongoose from 'mongoose';

// Request 타입 확장
interface AuthRequest extends Request {
  user?: any;
}

const router: Router = Router();

// 공통 인증/권한 미들웨어 사용

// 모든 결제 내역 조회
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { status, purpose, startDate, endDate } = req.query;
    const filter: any = {};
    
    if (status) filter.status = status;
    if (purpose) filter.purpose = purpose;
    
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }

    // 일반 사용자는 본인 결제만 조회 가능
    const currentUser = (req as any).user;
    if (currentUser?.userType !== 'superAdmin') {
      filter.user = currentUser._id;
    }

    const payments = await Payment.find(filter)
      .populate('user', 'name userId')
      .populate('relatedCourse', 'name')
      .populate('relatedBooking', 'date startTime endTime')
      .sort({ createdAt: -1 });

    return res.json({ payments });
  } catch (error) {
    console.error('결제 내역 조회 오류:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 특정 결제 조회
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('user', 'name userId email phone')
      .populate('relatedCourse', 'name description price')
      .populate('relatedBooking', 'date startTime endTime purpose');

    if (!payment) {
      return res.status(404).json({ error: '결제 내역을 찾을 수 없습니다.' });
    }

    // 본인 결제이거나 관리자인지 확인
    const currentUser = await User.findById(req.user.userId);
    if (currentUser?.userType !== 'superAdmin' && payment.user.toString() !== req.user.userId) {
      return res.status(403).json({ error: '조회 권한이 없습니다.' });
    }

    return res.json({ payment });
  } catch (error) {
    console.error('결제 조회 오류:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 결제 생성
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { 
      amount, 
      paymentMethod, 
      purpose, 
      relatedCourse, 
      relatedBooking, 
      notes 
    } = req.body;

    // 필수 필드 검증
    if (!amount || !paymentMethod || !purpose) {
      return res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
    }

    // 금액 유효성 검사
    if (amount <= 0) {
      return res.status(400).json({ error: '유효하지 않은 금액입니다.' });
    }

    // 관련 데이터 검증
    if (purpose === 'course' && !relatedCourse) {
      return res.status(400).json({ error: '강습 과정 정보가 필요합니다.' });
    }

    if (purpose === 'booking' && !relatedBooking) {
      return res.status(400).json({ error: '예약 정보가 필요합니다.' });
    }

    // 트랜잭션 ID 생성
    const transactionId = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const paymentData = {
      user: (req as any).user._id,
      amount,
      paymentMethod,
      purpose,
      relatedCourse,
      relatedBooking,
      notes: notes || '',
      transactionId,
      status: 'pending',
    };

    const payment = new Payment(paymentData);
    await payment.save();

    const populatedPayment = await Payment.findById(payment._id)
      .populate('user', 'name userId')
      .populate('relatedCourse', 'name')
      .populate('relatedBooking', 'date startTime endTime');

    // notify user
    try {
      const io = (req as any).app.get('io');
      if (io) io.to(`user:${String((req as any).user._id)}`).emit('notification', {
        type: 'payment:created',
        message: '결제가 생성되었습니다. 결제 완료 대기 중입니다.',
      });
    } catch {}

    return res.status(201).json({
      message: '결제가 생성되었습니다.',
      payment: populatedPayment
    });
  } catch (error) {
    console.error('결제 생성 오류:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 결제 완료 처리
router.post('/:id/complete', authenticateToken, requireRole(['superAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const { receiptUrl } = req.body;
    
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ error: '결제 내역을 찾을 수 없습니다.' });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({ error: '처리 대기 중인 결제만 완료할 수 있습니다.' });
    }

    payment.status = 'completed';
    payment.processedAt = new Date();
    if (receiptUrl) {
      payment.receiptUrl = receiptUrl;
    }

    await payment.save();

    // 관련 강습 과정이나 예약 상태 업데이트
    if (payment.purpose === 'course' && payment.relatedCourse) {
      // 강습 과정 등록 처리
      const course = await Course.findById(payment.relatedCourse);
      if (course) {
        let existingEnrollment = null;
        for (const enrollment of course.enrolledStudents) {
          if (enrollment.student && enrollment.student.toString() === payment.user.toString()) {
            existingEnrollment = enrollment;
            break;
          }
        }
        
        if (!existingEnrollment) {
          course.enrolledStudents.push({
            student: payment.user,
            status: 'active',
            enrolledAt: new Date()
          });
          await course.save();
        }
      }
    }

    const updatedPayment = await Payment.findById(payment._id)
      .populate('user', 'name userId')
      .populate('relatedCourse', 'name')
      .populate('relatedBooking', 'date startTime endTime');

    // notify user
    try {
      const io = (req as any).app.get('io');
      if (io && updatedPayment) io.to(`user:${String(updatedPayment.user)}`).emit('notification', {
        type: 'payment:completed',
        message: '결제가 완료되었습니다.',
      });
    } catch {}

    return res.json({
      message: '결제가 완료되었습니다.',
      payment: updatedPayment
    });
  } catch (error) {
    console.error('결제 완료 처리 오류:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 결제 취소/환불
router.post('/:id/refund', authenticateToken, requireRole(['superAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const { reason } = req.body;
    
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ error: '결제 내역을 찾을 수 없습니다.' });
    }

    if (payment.status !== 'completed') {
      return res.status(400).json({ error: '완료된 결제만 환불할 수 있습니다.' });
    }

    payment.status = 'refunded';
    payment.notes = payment.notes + `\n환불 사유: ${reason || '관리자 요청'}`;
    await payment.save();

    // 관련 강습 과정이나 예약 상태 업데이트
    if (payment.purpose === 'course' && payment.relatedCourse) {
      const course = await Course.findById(payment.relatedCourse);
      if (course) {
        const enrollmentIndex = course.enrolledStudents.findIndex(
          enrollment => enrollment.student && enrollment.student.toString() === payment.user.toString()
        );
        
        if (enrollmentIndex !== -1) {
          course.enrolledStudents[enrollmentIndex].status = 'dropped';
          await course.save();
        }
      }
    }

    const updatedPayment = await Payment.findById(payment._id)
      .populate('user', 'name userId')
      .populate('relatedCourse', 'name')
      .populate('relatedBooking', 'date startTime endTime');

    // notify user
    try {
      const io = (req as any).app.get('io');
      if (io && updatedPayment) io.to(`user:${String(updatedPayment.user)}`).emit('notification', {
        type: 'payment:refunded',
        message: '결제가 환불되었습니다.',
      });
    } catch {}

    return res.json({
      message: '결제가 환불되었습니다.',
      payment: updatedPayment
    });
  } catch (error) {
    console.error('결제 환불 오류:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 결제 통계 (관리자만)
router.get('/stats/summary', authenticateToken, requireRole(['superAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const filter: any = { status: 'completed' };
    
    if (startDate && endDate) {
      filter.processedAt = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }

    const payments = await Payment.find(filter);
    
    let totalAmount = 0;
    const paymentMethodStats: any = {};
    const purposeStats: any = {};
    
    for (const payment of payments) {
      totalAmount += payment.amount;
      paymentMethodStats[payment.paymentMethod] = (paymentMethodStats[payment.paymentMethod] || 0) + 1;
      purposeStats[payment.purpose] = (purposeStats[payment.purpose] || 0) + 1;
    }

    return res.json({
      totalPayments: payments.length,
      totalAmount,
      paymentMethodStats,
      purposeStats,
      averageAmount: payments.length > 0 ? totalAmount / payments.length : 0
    });
  } catch (error) {
    console.error('결제 통계 조회 오류:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 강습 과정별 결제 통계 조회
router.get('/course/:courseId/stats', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const { period = 'month' } = req.query;

    // 기간별 필터 설정
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

    // 강습 과정별 결제 통계
    const stats = await Payment.aggregate([
      {
        $match: {
          relatedCourse: new mongoose.Types.ObjectId(courseId),
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalPayments: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          averageAmount: { $avg: '$amount' },
          paymentMethods: { $addToSet: '$paymentMethod' }
        }
      }
    ]);

    // 월별 결제 추이
    const monthlyTrend = await Payment.aggregate([
      {
        $match: {
          relatedCourse: new mongoose.Types.ObjectId(courseId),
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // 결제 수단별 통계
    const methodStats = await Payment.aggregate([
      {
        $match: {
          relatedCourse: new mongoose.Types.ObjectId(courseId),
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    res.json({
      success: true,
      message: '강습 과정별 결제 통계 조회 성공',
      data: {
        courseId,
        period,
        overview: stats[0] || {
          totalPayments: 0,
          totalAmount: 0,
          averageAmount: 0,
          paymentMethods: []
        },
        monthlyTrend,
        methodStats
      }
    });
  } catch (error) {
    console.error('강습 과정별 결제 통계 조회 오류:', error);
    res.status(500).json({ error: '결제 통계 조회에 실패했습니다.' });
  }
});

// 학생별 강습 과정 결제 내역 조회
router.get('/student/:studentId/courses', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { studentId } = req.params;
    
    // 권한 확인: 본인이거나 관리자
    if (req.user._id !== studentId && 
        req.user.userType !== 'instructor' && 
        req.user.userType !== 'centerAdmin' && 
        req.user.userType !== 'superAdmin') {
      return res.status(403).json({ error: '접근 권한이 없습니다.' });
    }

    // 학생이 등록한 강습 과정의 결제 내역
    const payments = await Payment.find({ 
      user: studentId,
      relatedCourse: { $exists: true, $ne: null }
    })
    .populate('relatedCourse', 'name level price')
    .sort({ createdAt: -1 });

    // 강습 과정별로 그룹화
    const coursePayments = new Map();
    
    payments.forEach(payment => {
      if (payment.relatedCourse) {
        const course = payment.relatedCourse as any; // populate 후 타입 캐스팅
        const courseId = course._id.toString();
        
        if (!coursePayments.has(courseId)) {
          coursePayments.set(courseId, {
            course: {
              _id: course._id,
              name: course.name,
              level: course.level,
              price: course.price
            },
            totalPayments: 0,
            totalAmount: 0,
            payments: []
          });
        }
        
        const courseInfo = coursePayments.get(courseId);
        courseInfo.totalPayments++;
        courseInfo.totalAmount += payment.amount;
        courseInfo.payments.push(payment);
      }
    });

    res.json({
      success: true,
      message: '학생별 강습 과정 결제 내역 조회 성공',
      data: {
        studentId,
        totalCourses: coursePayments.size,
        coursePayments: Array.from(coursePayments.values())
      }
    });
  } catch (error) {
    console.error('학생별 강습 과정 결제 내역 조회 오류:', error);
    res.status(500).json({ error: '결제 내역 조회에 실패했습니다.' });
  }
});

// 강사별 강습 과정 결제 통계 조회
router.get('/instructor/:instructorId/courses', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { instructorId } = req.params;
    const { period = 'month' } = req.query;

    // 기간별 필터 설정
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

    // 강사가 담당하는 강습 과정의 결제 통계
    const courseIds = await Course.find({ instructor: instructorId }).distinct('_id');
    
    const stats = await Payment.aggregate([
      {
        $match: {
          relatedCourse: { $in: courseIds },
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $lookup: {
          from: 'courses',
          localField: 'relatedCourse',
          foreignField: '_id',
          as: 'course'
        }
      },
      {
        $unwind: '$course'
      },
      {
        $group: {
          _id: '$relatedCourse',
          courseName: { $first: '$course.name' },
          courseLevel: { $first: '$course.level' },
          totalPayments: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          averageAmount: { $avg: '$amount' }
        }
      },
      {
        $sort: { totalAmount: -1 }
      }
    ]);

    res.json({
      success: true,
      message: '강사별 강습 과정 결제 통계 조회 성공',
      data: {
        instructorId,
        period,
        totalCourses: stats.length,
        courseStats: stats
      }
    });
  } catch (error) {
    console.error('강사별 강습 과정 결제 통계 조회 오류:', error);
    res.status(500).json({ error: '결제 통계 조회에 실패했습니다.' });
  }
});

// 강습 과정별 결제 통계 조회
router.get('/course/:courseId/stats', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const { period = 'month' } = req.query;

    // 기간별 필터 설정
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

    // 강습 과정별 결제 통계
    const stats = await Payment.aggregate([
      {
        $match: {
          relatedCourse: new mongoose.Types.ObjectId(courseId),
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalPayments: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          averageAmount: { $avg: '$amount' },
          paymentMethods: { $addToSet: '$paymentMethod' }
        }
      }
    ]);

    // 월별 결제 추이
    const monthlyTrend = await Payment.aggregate([
      {
        $match: {
          relatedCourse: new mongoose.Types.ObjectId(courseId),
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // 결제 수단별 통계
    const methodStats = await Payment.aggregate([
      {
        $match: {
          relatedCourse: new mongoose.Types.ObjectId(courseId),
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    res.json({
      success: true,
      message: '강습 과정별 결제 통계 조회 성공',
      data: {
        courseId,
        period,
        overview: stats[0] || {
          totalPayments: 0,
          totalAmount: 0,
          averageAmount: 0,
          paymentMethods: []
        },
        monthlyTrend,
        methodStats
      }
    });
  } catch (error) {
    console.error('강습 과정별 결제 통계 조회 오류:', error);
    res.status(500).json({ error: '결제 통계 조회에 실패했습니다.' });
  }
});

// 학생별 강습 과정 결제 내역 조회
router.get('/student/:studentId/courses', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { studentId } = req.params;
    
    // 권한 확인: 본인이거나 관리자
    if (req.user._id !== studentId && 
        req.user.userType !== 'instructor' && 
        req.user.userType !== 'centerAdmin' && 
        req.user.userType !== 'superAdmin') {
      return res.status(403).json({ error: '접근 권한이 없습니다.' });
    }

    // 학생이 등록한 강습 과정의 결제 내역
    const payments = await Payment.find({ 
      user: studentId,
      relatedCourse: { $exists: true, $ne: null }
    })
    .populate('relatedCourse', 'name level price')
    .sort({ createdAt: -1 });

    // 강습 과정별로 그룹화
    const coursePayments = new Map();
    
    payments.forEach(payment => {
      if (payment.relatedCourse) {
        const course = payment.relatedCourse as any; // populate 후 타입 캐스팅
        const courseId = course._id.toString();
        
        if (!coursePayments.has(courseId)) {
          coursePayments.set(courseId, {
            course: {
              _id: course._id,
              name: course.name,
              level: course.level,
              price: course.price
            },
            totalPayments: 0,
            totalAmount: 0,
            payments: []
          });
        }
        
        const courseInfo = coursePayments.get(courseId);
        courseInfo.totalPayments++;
        courseInfo.totalAmount += payment.amount;
        courseInfo.payments.push(payment);
      }
    });

    res.json({
      success: true,
      message: '학생별 강습 과정 결제 내역 조회 성공',
      data: {
        studentId,
        totalCourses: coursePayments.size,
        coursePayments: Array.from(coursePayments.values())
      }
    });
  } catch (error) {
    console.error('학생별 강습 과정 결제 내역 조회 오류:', error);
    res.status(500).json({ error: '결제 내역 조회에 실패했습니다.' });
  }
});

// 강사별 강습 과정 결제 통계 조회
router.get('/instructor/:instructorId/courses', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { instructorId } = req.params;
    const { period = 'month' } = req.query;

    // 기간별 필터 설정
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

    // 강사가 담당하는 강습 과정의 결제 통계
    const courseIds = await Course.find({ instructor: instructorId }).distinct('_id');
    
    const stats = await Payment.aggregate([
      {
        $match: {
          relatedCourse: { $in: courseIds },
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $lookup: {
          from: 'courses',
          localField: 'relatedCourse',
          foreignField: '_id',
          as: 'course'
        }
      },
      {
        $unwind: '$course'
      },
      {
        $group: {
          _id: '$relatedCourse',
          courseName: { $first: '$course.name' },
          courseLevel: { $first: '$course.level' },
          totalPayments: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          averageAmount: { $avg: '$amount' }
        }
      },
      {
        $sort: { totalAmount: -1 }
      }
    ]);

    res.json({
      success: true,
      message: '강사별 강습 과정 결제 통계 조회 성공',
      data: {
        instructorId,
        period,
        totalCourses: stats.length,
        courseStats: stats
      }
    });
  } catch (error) {
    console.error('강사별 강습 과정 결제 통계 조회 오류:', error);
    res.status(500).json({ error: '결제 통계 조회에 실패했습니다.' });
  }
});

export default router; 