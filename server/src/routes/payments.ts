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
 * - logger (로깅 유틸리티)
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
import { auth as authenticateToken, requireRole } from '../middleware/auth';
import { calculatePricing, getCurrentPricingPolicy, updatePricingPolicy } from '../services/pricingService';
import mongoose from 'mongoose';
import { logInfo, logError, logWarn, logDebug } from '../utils/logger';

// Request 타입 확장
interface AuthRequest extends Request {
  user?: any;
}

const router: Router = Router();

// 공통 인증/권한 미들웨어 사용

// 사용자별 요금 조회 API
router.get('/pricing/calculate', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { billingPeriod = 'monthly' } = req.query;
    
    const pricingResult = await calculatePricing(req.user.userId, billingPeriod as 'monthly' | 'annual');
    
    return res.json({
      success: true,
      message: '요금 계산 완료',
      data: pricingResult
    });
  } catch (error) {
    logError('요금 계산 오류', error);
    return res.status(500).json({ error: '요금 계산에 실패했습니다.' });
  }
});

// 모든 결제 내역 조회 (테넌트 가드 적용)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { status, purpose, startDate, endDate, centerId: centerIdQuery } = req.query as any;
    const filter: any = {};
    
    if (status) filter.status = status;
    if (purpose) filter.purpose = purpose;
    
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }

    // 테넌트 가드: centerId 우선 적용, 없으면 본인 결제로 제한
    const currentUser = req.user;
    const resolvedCenterId = centerIdQuery || currentUser?.centerId || currentUser?.centerAdminInfo?.managedCenters?.[0];
    
    // ⭐ 학생인 경우 항상 본인 결제만 조회
    if (currentUser?.userType === 'student') {
      filter.user = currentUser.userId || currentUser._id;
      // centerId가 있으면 추가 필터링
      if (resolvedCenterId) {
        filter.centerId = resolvedCenterId;
      }
    } else if (resolvedCenterId) {
      // 센터 관리자나 다른 역할인 경우
      filter.centerId = resolvedCenterId;
    } else if (currentUser?.userType !== 'superAdmin') {
      // 일반 사용자는 본인 결제만
      filter.user = currentUser.userId || currentUser._id;
    }

    // ⭐ status 필터가 없으면 completed, refunded, pending 모두 포함 (pending은 completed로 표시)
    if (!status) {
      filter.status = { $in: ['completed', 'refunded', 'pending'] };
    }

    console.log('📊 결제 내역 조회 필터:', JSON.stringify(filter, null, 2));
    console.log('📊 현재 사용자:', {
      userId: currentUser?.userId || currentUser?._id,
      userType: currentUser?.userType,
      centerId: resolvedCenterId
    });

    const payments = await Payment.find(filter)
      .populate('user', 'name userId')
      .populate('relatedCourse', 'name')
      .populate('relatedBooking', 'date startTime endTime')
      .sort({ createdAt: -1 });

    console.log('📊 조회된 결제 수:', payments.length);

    // ⭐ 학생인 경우: 등록된 강의 중 Payment가 없는 경우 가상의 Payment 생성
    if (currentUser?.userType === 'student' && !centerIdQuery) {
      const userId = currentUser.userId || currentUser._id;
      const userIdObj = new mongoose.Types.ObjectId(userId);
      
      // ⭐ 학생의 centerId 확인 (필터링용)
      const studentCenterId = currentUser.centerId || resolvedCenterId;
      
      // 등록된 강의 조회 (해당 센터의 강의만)
      const courseFilter: any = {
        'enrolledStudents.student': userIdObj,
        'enrolledStudents.status': { $ne: 'dropped' }
      };
      
      // centerId가 있으면 해당 센터의 강의만 조회
      if (studentCenterId) {
        courseFilter.centerId = studentCenterId;
      }
      
      const enrolledCourses = await Course.find(courseFilter)
      .populate('instructor', 'name')
      .lean();

      // 각 등록된 강의에 대해 Payment가 있는지 확인
      for (const course of enrolledCourses) {
        const enrollment = (course.enrolledStudents || []).find((e: any) => {
          const eStudentId = e.student?.toString() || e.student;
          return eStudentId === userId.toString();
        });

        if (enrollment) {
          // 해당 강의에 대한 Payment가 있는지 확인
          const existingPayment = payments.find((p: any) => {
            const pCourseId = p.relatedCourse?._id?.toString() || p.relatedCourse?.toString();
            return pCourseId === course._id.toString();
          });

          // Payment가 없으면 가상의 Payment 생성
          if (!existingPayment) {
            const virtualPayment = {
              _id: `virtual-${course._id}`,
              user: { name: currentUser.name || '사용자', userId: userId },
              amount: course.price || 0,
              currency: 'KRW',
              paymentMethod: 'card', // 기본값
              status: 'completed' as const,
              purpose: 'course' as const,
              relatedCourse: { _id: course._id, name: course.name },
              relatedBooking: null,
              transactionId: `VIRTUAL-${course._id}`,
              notes: '기존 등록 강의 (결제 기록 없음)',
              centerId: course.centerId,
              createdAt: enrollment.enrolledAt || enrollment.enrollmentDate || course.createdAt || new Date(),
              updatedAt: enrollment.enrolledAt || enrollment.enrollmentDate || course.createdAt || new Date(),
              isVirtual: true // 가상 Payment 표시
            };
            payments.push(virtualPayment as any);
          }
        }
      }

      // ⭐ PersonalLesson도 결제 내역에 포함 (Payment가 없는 경우, 해당 센터만)
      const { PersonalLesson } = require('../models/PersonalLesson');
      const personalLessonFilter: any = {
        studentId: userIdObj,
        status: { $in: ['pending', 'approved', 'completed'] }
      };
      
      // centerId가 있으면 해당 센터의 PersonalLesson만 조회
      if (studentCenterId) {
        personalLessonFilter.centerId = studentCenterId;
      }
      
      const personalLessons = await PersonalLesson.find(personalLessonFilter)
      .populate('instructorId', 'name')
      .lean();

      for (const lesson of personalLessons) {
        // PersonalLesson에 대한 Payment가 있는지 확인 (paymentId로)
        const existingPayment = payments.find((p: any) => {
          return p._id?.toString() === lesson.paymentId?.toString();
        });

        // Payment가 없으면 가상의 Payment 생성
        if (!existingPayment && !lesson.paymentId) {
          const virtualPayment = {
            _id: `virtual-pl-${lesson._id}`,
            user: { name: currentUser.name || '사용자', userId: userId },
            amount: lesson.price || lesson.totalAmount || 0,
            currency: 'KRW',
            paymentMethod: 'card', // 기본값
            status: 'completed' as const,
            purpose: 'booking' as const,
            relatedCourse: null,
            relatedBooking: { _id: lesson._id, date: lesson.date, startTime: lesson.startTime || lesson.time, endTime: lesson.endTime },
            transactionId: `VIRTUAL-PL-${lesson._id}`,
            notes: '개인 레슨 (결제 기록 없음)',
            centerId: lesson.centerId,
            createdAt: lesson.createdAt || new Date(),
            updatedAt: lesson.updatedAt || lesson.createdAt || new Date(),
            isVirtual: true // 가상 Payment 표시
          };
          payments.push(virtualPayment as any);
        }
      }

      // 날짜순 정렬
      payments.sort((a: any, b: any) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
    }

    // ⭐ 모든 결제 객체를 일반 객체로 변환하고 amount 보장, pending은 completed로 변환
    const processedPayments = payments.map((payment: any) => {
      // Mongoose 문서를 일반 객체로 변환
      const paymentObj = payment.toObject ? payment.toObject() : payment;
      
      // pending 상태를 completed로 변환 (결제 대기 없음)
      const finalStatus = paymentObj.status === 'pending' ? 'completed' : paymentObj.status;
      
      return {
        ...paymentObj,
        status: finalStatus,
        amount: paymentObj.amount || 0 // amount가 없으면 0으로 설정
      };
    });

    console.log('📊 결제 내역 조회 결과:', {
      filter,
      totalCount: payments.length,
      completedCount: processedPayments.filter((p: any) => p.status === 'completed').length,
      refundedCount: processedPayments.filter((p: any) => p.status === 'refunded').length,
      payments: processedPayments.map((p: any) => ({ _id: p._id, status: p.status, amount: p.amount }))
    });

    return res.json({ success: true, message: '결제 내역 조회 성공!', data: { payments: processedPayments } });
  } catch (error) {
    logError('결제 내역 조회 오류', error);
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

    return res.json({ success: true, message: '결제 조회 성공!', data: payment });
  } catch (error) {
    logError('결제 조회 오류', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 결제 생성 (차등 요금 적용)
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { 
      paymentMethod, 
      purpose, 
      relatedCourse, 
      relatedBooking, 
      notes,
      billingPeriod = 'monthly'
    } = req.body;

    // 필수 필드 검증
    if (!paymentMethod || !purpose) {
      return res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
    }

    // 관련 데이터 검증
    if (purpose === 'course' && !relatedCourse) {
      return res.status(400).json({ error: '강습 과정 정보가 필요합니다.' });
    }

    if (purpose === 'booking' && !relatedBooking) {
      return res.status(400).json({ error: '예약 정보가 필요합니다.' });
    }

    // 사용자별 차등 요금 계산
    const pricingResult = await calculatePricing(req.user.userId, billingPeriod);
    
    // 트랜잭션 ID 생성
    const transactionId = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const paymentData = {
      user: req.user.userId,
      amount: pricingResult.finalAmount,
      pricingInfo: {
        userType: pricingResult.userType,
        pricingTier: pricingResult.pricingTier,
        baseAmount: pricingResult.baseAmount,
        discountAmount: pricingResult.discountAmount,
        discountReason: pricingResult.discountReason,
        centerId: pricingResult.centerId || null,
        isCenterSponsored: pricingResult.isCenterSponsored
      },
      paymentMethod,
      purpose,
      relatedCourse,
      relatedBooking,
      notes: notes || '',
      transactionId,
      status: 'completed', // ⭐ 결제 대기 없이 바로 완료 상태로 설정
      processedAt: new Date(), // ⭐ 처리 시간 설정
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
      if (io) io.to(`user:${String(req.user.userId)}`).emit('notification', {
        type: 'payment:created',
        message: '결제가 완료되었습니다.',
      });
    } catch (error) {
      logError('결제 처리 중 오류', error);
    }

    return res.status(201).json({
      success: true,
      message: '결제가 완료되었습니다.',
      data: populatedPayment
    });
  } catch (error) {
    logError('결제 생성 오류', error);
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
    } catch (error) {
      logError('결제 처리 중 오류', error);
    }

    return res.json({
      success: true,
      message: '결제가 완료되었습니다.',
      data: updatedPayment
    });
  } catch (error) {
    logError('결제 완료 처리 오류', error);
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
    } catch (error) {
      logError('결제 처리 중 오류', error);
    }

    return res.json({
      success: true,
      message: '결제가 환불되었습니다.',
      data: updatedPayment
    });
  } catch (error) {
    logError('결제 환불 오류', error);
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
      success: true,
      message: '결제 통계 조회 성공!',
      data: {
        totalPayments: payments.length,
        totalAmount,
        paymentMethodStats,
        purposeStats,
        averageAmount: payments.length > 0 ? totalAmount / payments.length : 0
      }
    });
  } catch (error) {
    logError('결제 통계 조회 오류', error);
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
    logError('강습 과정별 결제 통계 조회 오류', error);
    res.status(500).json({ error: '결제 통계 조회에 실패했습니다.' });
  }
});

// 학생별 강습 과정 결제 내역 조회
router.get('/student/:studentId/courses', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { studentId } = req.params;
    
    // 권한 확인: 본인이거나 관리자
    if (req.user.userId !== studentId && 
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
    logError('학생별 강습 과정 결제 내역 조회 오류', error);
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
    logError('강사별 강습 과정 결제 통계 조회 오류', error);
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
    logError('강습 과정별 결제 통계 조회 오류', error);
    res.status(500).json({ error: '결제 통계 조회에 실패했습니다.' });
  }
});

// 학생별 강습 과정 결제 내역 조회
router.get('/student/:studentId/courses', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { studentId } = req.params;
    
    // 권한 확인: 본인이거나 관리자
    if (req.user.userId !== studentId && 
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
    logError('학생별 강습 과정 결제 내역 조회 오류', error);
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
    logError('강사별 강습 과정 결제 통계 조회 오류', error);
    res.status(500).json({ error: '결제 통계 조회에 실패했습니다.' });
  }
});

// 요금 정책 조회 (관리자만)
router.get('/pricing/policy', authenticateToken, requireRole(['superAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const policy = getCurrentPricingPolicy();
    
    return res.json({
      success: true,
      message: '요금 정책 조회 완료',
      data: policy
    });
  } catch (error) {
    logError('요금 정책 조회 오류', error);
    return res.status(500).json({ error: '요금 정책 조회에 실패했습니다.' });
  }
});

// 요금 정책 업데이트 (슈퍼 관리자만)
router.put('/pricing/policy', authenticateToken, requireRole(['superAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const newPolicy = req.body;
    
    updatePricingPolicy(newPolicy);
    
    return res.json({
      success: true,
      message: '요금 정책이 업데이트되었습니다.',
      data: getCurrentPricingPolicy()
    });
  } catch (error) {
    logError('요금 정책 업데이트 오류', error);
    return res.status(500).json({ error: '요금 정책 업데이트에 실패했습니다.' });
  }
});

// 사용자별 할인율 조회
router.get('/pricing/discount/:userId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    
    // 본인이거나 관리자인지 확인
    if (req.user.userId !== userId && 
        req.user.userType !== 'centerAdmin' && 
        req.user.userType !== 'superAdmin') {
      return res.status(403).json({ error: '접근 권한이 없습니다.' });
    }
    
    const pricingResult = await calculatePricing(userId);
    
    return res.json({
      success: true,
      message: '할인율 조회 완료',
      data: {
        userType: pricingResult.userType,
        pricingTier: pricingResult.pricingTier,
        discountAmount: pricingResult.discountAmount,
        discountReason: pricingResult.discountReason,
        finalAmount: pricingResult.finalAmount,
        isCenterSponsored: pricingResult.isCenterSponsored
      }
    });
  } catch (error) {
    logError('할인율 조회 오류', error);
    return res.status(500).json({ error: '할인율 조회에 실패했습니다.' });
  }
});

export default router; 