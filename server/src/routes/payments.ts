import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Payment } from '../models/Payment';
import { User } from '../models/User';
import { Course } from '../models/Course';
import { Booking } from '../models/Booking';

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
    const currentUser = await User.findById(req.user.userId);
    if (currentUser?.userType !== 'admin') {
      filter.user = req.user.userId;
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
    if (currentUser?.userType !== 'admin' && payment.user.toString() !== req.user.userId) {
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
      user: req.user.userId,
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
router.post('/:id/complete', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
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
        const existingEnrollment = course.enrolledStudents.find(
          enrollment => enrollment.student && enrollment.student.toString() === payment.user.toString()
        );
        
        if (!existingEnrollment) {
          course.enrolledStudents.push({
            student: payment.user,
            status: 'active'
          });
          await course.save();
        }
      }
    }

    const updatedPayment = await Payment.findById(payment._id)
      .populate('user', 'name userId')
      .populate('relatedCourse', 'name')
      .populate('relatedBooking', 'date startTime endTime');

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
router.post('/:id/refund', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
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
router.get('/stats/summary', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
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
    
    const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const paymentMethodStats = payments.reduce((acc, payment) => {
      acc[payment.paymentMethod] = (acc[payment.paymentMethod] || 0) + 1;
      return acc;
    }, {} as any);
    
    const purposeStats = payments.reduce((acc, payment) => {
      acc[payment.purpose] = (acc[payment.purpose] || 0) + 1;
      return acc;
    }, {} as any);

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

export default router; 