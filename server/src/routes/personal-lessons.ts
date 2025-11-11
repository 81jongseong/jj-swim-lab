/**
 * 🏊‍♂️ 개인레슨 API 라우트
 * 
 * 개인레슨 신청, 조회, 수정, 취소 기능을 제공합니다.
 */

import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import { authMiddleware } from '../middleware/auth';
import { PersonalLesson } from '../models/PersonalLesson';
import { User } from '../models/User';
import { LaneAllocationService } from '../services/laneAllocationService';
import { Payment } from '../models/Payment';
import { createSettlementItem } from '../services/settlementService';

const router = express.Router();

interface AuthRequest extends Request {
  user?: any;
}

/**
 * ⭐ 외부 회원 개인레슨 요청 (장소 섭외 포함)
 * POST /api/personal-lessons/external-request
 */
router.post('/external-request', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const {
      requestedCenterId, // ⭐ 요청한 센터 ID
      instructorId, // ⭐ 선택한 강사 ID (외부 강사 가능)
      date,
      startTime,
      endTime,
      duration,
      lessonType,
      skillLevel,
      goals,
      notes,
      poolType = 'mainPool',
      laneNumber,
      requestLaneRental = false, // ⭐ 레인대여 신청 여부
      instructorFee, // ⭐ 강사 수업료 (선택적, 강사 설정에서 가져올 수도 있음)
      laneRentalFee // ⭐ 레인대여 비용 (선택적, 센터 설정에서 가져올 수도 있음)
    } = req.body;

    // 사용자 정보 가져오기
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: '사용자 정보를 찾을 수 없습니다.'
      });
    }

    // 외부 회원 확인 (센터 소속이 없거나, 요청한 센터가 본인 센터가 아닌 경우)
    const userCenterId = (user as any).centerId || (user as any).studentInfo?.centerId;
    const isExternalMember = !userCenterId || (requestedCenterId && userCenterId.toString() !== requestedCenterId.toString());

    if (!requestedCenterId) {
      return res.status(400).json({
        success: false,
        message: '요청할 센터를 선택해주세요.'
      });
    }

    // 센터 정보 확인
    const Center = mongoose.model('Center');
    const requestedCenter = await Center.findById(requestedCenterId);
    if (!requestedCenter) {
      return res.status(400).json({
        success: false,
        message: '요청한 센터를 찾을 수 없습니다.'
      });
    }

    // ⭐ 강사 정보 확인 및 외부 강사 여부 판단
    let instructor: any = null;
    let isExternalInstructor = false;
    let calculatedInstructorFee = instructorFee || 0;
    
    if (instructorId) {
      instructor = await User.findById(instructorId);
      if (!instructor || instructor.userType !== 'instructor') {
        return res.status(400).json({
          success: false,
          message: '유효하지 않은 강사입니다.'
        });
      }
      
      // 외부 강사 여부 확인 (해당 센터 소속이 아닌 경우)
      const instructorCenters = instructor.instructorInfo?.assignedCenters || [];
      isExternalInstructor = !instructorCenters.some((centerId: any) => 
        centerId.toString() === requestedCenterId.toString()
      );
      
      // 강사 수업료 계산 (강사 설정에서 가져오거나 요청값 사용)
      if (!calculatedInstructorFee && instructor.instructorInfo?.personalLessonSettings?.lessonTypes) {
        const lessonType = instructor.instructorInfo.personalLessonSettings.lessonTypes.find(
          (lt: any) => lt.type === '1:1'
        );
        calculatedInstructorFee = lessonType?.pricePerSession || 80000; // 기본값 8만원
      } else if (!calculatedInstructorFee) {
        calculatedInstructorFee = 80000; // 기본값
      }
    }

    // ⭐ 레인대여 비용 계산 (센터 설정에서 가져오거나 요청값 사용)
    let calculatedLaneRentalFee = laneRentalFee || 0;
    if (requestLaneRental && !calculatedLaneRentalFee) {
      // 센터의 레인대여 기본 가격 가져오기 (예: 시간당 2만원)
      calculatedLaneRentalFee = (duration / 60) * 20000; // 기본값: 시간당 2만원
    }

    // ⭐ 플랫폼 수수료 계산 (강사 수업료의 10%)
    const platformFeeRate = 0.1; // 10%
    const calculatedPlatformFee = Math.round(calculatedInstructorFee * platformFeeRate);

    // ⭐ 총 결제 금액 계산
    const totalAmount = calculatedInstructorFee + calculatedLaneRentalFee + calculatedPlatformFee;

    let laneRentalId = null;

    // 레인대여 신청이 필요한 경우
    if (requestLaneRental && laneNumber) {
      const LaneRental = mongoose.model('LaneRental');
      
      // 레인 충돌 검사
      const conflicts = await LaneAllocationService.checkLaneConflicts(
        date,
        startTime,
        requestedCenterId,
        duration
      );

      const laneConflicts = conflicts.filter(conflict => 
        conflict.lanes.includes(laneNumber)
      );

      if (laneConflicts.length > 0) {
        return res.status(400).json({
          success: false,
          message: '해당 레인은 이미 사용 중입니다.',
          conflicts: laneConflicts
        });
      }

      // 레인대여 생성
      const laneRental = new LaneRental({
        userId,
        centerId: requestedCenterId,
        date: new Date(date),
        startTime,
        endTime: endTime || (() => {
          const [h, m] = startTime.split(':').map(Number);
          const end = new Date(2000, 0, 1, h, m + duration, 0);
          return `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;
        })(),
        duration,
        laneNumber,
        poolType,
        purpose: '개인레슨',
        notes: `개인레슨 요청: ${goals}`,
        status: 'pending',
        price: calculatedLaneRentalFee // ⭐ 레인대여 비용 설정
      });

      await laneRental.save();
      laneRentalId = laneRental._id;
    }

    // 개인레슨 생성
    const personalLesson = new PersonalLesson({
      studentId: userId,
      instructorId: instructorId || undefined,
      centerId: requestedCenterId, // 요청한 센터로 설정 (승인 후 확정)
      requestedCenterId,
      isExternalMember,
      isExternalInstructor, // ⭐ 외부 강사 여부
      date: new Date(date),
      startTime,
      endTime,
      time: startTime, // 하위 호환성
      duration,
      lessonType,
      skillLevel,
      goals,
      notes,
      poolType,
      assignedLane: laneNumber,
      laneRentalId,
      locationStatus: requestLaneRental && laneRentalId ? 'pending' : 'pending',
      // ⭐ 결제 관련 필드
      instructorFee: calculatedInstructorFee,
      laneRentalFee: calculatedLaneRentalFee,
      platformFee: calculatedPlatformFee,
      totalAmount: totalAmount,
      price: totalAmount, // 하위 호환성
      status: 'pending',
      paymentStatus: 'pending'
    });

    await personalLesson.save();

    res.status(201).json({
      success: true,
      message: '개인레슨 요청이 완료되었습니다. 결제 후 센터 승인을 기다려주세요.',
      data: {
        personalLesson: personalLesson.toObject(),
        laneRental: laneRentalId ? { _id: laneRentalId } : null,
        // ⭐ 결제 정보 반환
        pricing: {
          instructorFee: calculatedInstructorFee,
          laneRentalFee: calculatedLaneRentalFee,
          platformFee: calculatedPlatformFee,
          totalAmount: totalAmount,
          isExternalInstructor: isExternalInstructor
        }
      }
    });

  } catch (error: any) {
    console.error('외부 회원 개인레슨 요청 실패:', error);
    res.status(500).json({
      success: false,
      message: error.message || '서버 오류가 발생했습니다.'
    });
  }
});

/**
 * 개인레슨 신청 (기존 - 센터 소속 회원용)
 * POST /api/personal-lessons
 */
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const {
      date,
      time,
      startTime,
      endTime,
      duration,
      lessonType,
      skillLevel,
      goals,
      notes
    } = req.body;

    // 사용자 정보 가져오기
    const user = await User.findById(userId);
    if (!user || user.userType !== 'student') {
      return res.status(400).json({
        success: false,
        message: '학생만 개인레슨을 신청할 수 있습니다.'
      });
    }

    // 센터 ID 가져오기
    const centerId = user.centerId;
    if (!centerId) {
      return res.status(400).json({
        success: false,
        message: '소속 센터가 없습니다.'
      });
    }

    const actualStartTime = startTime || time;
    const actualEndTime = endTime || (() => {
      const [h, m] = actualStartTime.split(':').map(Number);
      const end = new Date(2000, 0, 1, h, m + (duration || 60), 0);
      return `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;
    })();

    // 레인 충돌 검사
    const conflicts = await LaneAllocationService.checkLaneConflicts(
      date,
      actualStartTime,
      centerId?.toString() || '',
      duration || 60
    );

    if (conflicts.length > 0) {
      return res.status(400).json({
        success: false,
        message: '해당 시간에는 다른 수업이 진행됩니다.',
        conflicts
      });
    }

    // 개인레슨 생성
    const personalLesson = new PersonalLesson({
      studentId: userId,
      centerId,
      isExternalMember: false,
      date: new Date(date),
      startTime: actualStartTime,
      endTime: actualEndTime,
      time: actualStartTime, // 하위 호환성
      duration: duration || 60,
      lessonType,
      skillLevel,
      goals,
      notes,
      status: 'pending'
    });

    // 레인 자동 조정 및 레인 배정
    const adjustmentResult = await LaneAllocationService.adjustLanesForPersonalLesson({
      date,
      time: actualStartTime,
      centerId
    });

    // 개인레슨에 레인 배정
    personalLesson.assignedLane = adjustmentResult.personalLessonLane || 1;
    await personalLesson.save();

    res.status(201).json({
      success: true,
      message: '개인레슨 신청이 완료되었습니다.',
      data: {
        ...personalLesson.toObject(),
        assignedLane: adjustmentResult.personalLessonLane || 1
      }
    });

  } catch (error) {
    console.error('개인레슨 신청 실패:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

/**
 * 개인레슨 목록 조회
 * GET /api/personal-lessons
 */
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const { status, page = 1, limit = 10 } = req.query;

    const query: any = { studentId: userId };
    if (status && status !== 'all') {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const personalLessons = await PersonalLesson.find(query)
      .populate('instructorId', 'name email phone')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await PersonalLesson.countDocuments(query);

    res.json({
      success: true,
      message: '개인레슨 목록 조회 성공',
      data: {
        personalLessons,
        pagination: {
          current: Number(page),
          total: Math.ceil(total / Number(limit)),
          count: personalLessons.length,
          totalCount: total
        }
      }
    });

  } catch (error) {
    console.error('개인레슨 목록 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

/**
 * 개인레슨 상세 조회
 * GET /api/personal-lessons/:id
 */
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const personalLesson = await PersonalLesson.findOne({
      _id: id,
      studentId: userId
    }).populate('instructorId', 'name email phone');

    if (!personalLesson) {
      return res.status(404).json({
        success: false,
        message: '개인레슨을 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      message: '개인레슨 상세 조회 성공',
      data: personalLesson
    });

  } catch (error) {
    console.error('개인레슨 상세 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

/**
 * 개인레슨 취소
 * DELETE /api/personal-lessons/:id
 */
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const personalLesson = await PersonalLesson.findOne({
      _id: id,
      studentId: userId
    });

    if (!personalLesson) {
      return res.status(404).json({
        success: false,
        message: '개인레슨을 찾을 수 없습니다.'
      });
    }

    if (personalLesson.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: '완료된 수업은 취소할 수 없습니다.'
      });
    }

    // 레인 복원
    await LaneAllocationService.restoreLanesAfterPersonalLessonCancellation(id);

    // 개인레슨 취소
    await PersonalLesson.findByIdAndUpdate(id, {
      status: 'cancelled'
    });

    res.json({
      success: true,
      message: '개인레슨이 취소되었습니다.'
    });

  } catch (error) {
    console.error('개인레슨 취소 실패:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

/**
 * ⭐ 외부 개인레슨 통합 결제 생성
 * POST /api/personal-lessons/:id/payment
 */
router.post('/:id/payment', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { paymentMethod = 'online' } = req.body;

    // 개인레슨 조회
    const personalLesson = await PersonalLesson.findById(id)
      .populate('instructorId', 'name email instructorInfo')
      .populate('centerId', 'name');

    if (!personalLesson) {
      return res.status(404).json({
        success: false,
        message: '개인레슨을 찾을 수 없습니다.'
      });
    }

    // 본인 확인
    if (personalLesson.studentId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: '본인의 개인레슨만 결제할 수 있습니다.'
      });
    }

    // 이미 결제 완료된 경우
    if (personalLesson.paymentStatus === 'completed') {
      return res.status(400).json({
        success: false,
        message: '이미 결제가 완료된 개인레슨입니다.'
      });
    }

    // 결제 금액 확인
    const totalAmount = personalLesson.totalAmount || personalLesson.price;
    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: '결제 금액이 설정되지 않았습니다.'
      });
    }

    // 결제 생성
    const transactionId = `PL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const payment = new Payment({
      user: userId,
      amount: totalAmount,
      currency: 'KRW',
      paymentMethod,
      status: 'pending',
      purpose: 'booking',
      relatedBooking: id,
      centerId: personalLesson.centerId,
      transactionId,
      pricingInfo: {
        userType: 'student',
        pricingTier: 'standard',
        baseAmount: totalAmount,
        discountAmount: 0,
        discountReason: '',
        centerId: personalLesson.centerId,
        isCenterSponsored: false
      },
      notes: `외부 개인레슨 결제 - 강사: ${(personalLesson.instructorId as any)?.name || '미정'}, 센터: ${(personalLesson.centerId as any)?.name || '미정'}`
    });

    await payment.save();

    // 개인레슨에 결제 ID 연결
    personalLesson.paymentId = payment._id;
    await personalLesson.save();

    res.status(201).json({
      success: true,
      message: '결제가 생성되었습니다.',
      data: {
        payment: payment.toObject(),
        personalLesson: {
          id: personalLesson._id,
          instructorFee: personalLesson.instructorFee,
          laneRentalFee: personalLesson.laneRentalFee,
          platformFee: personalLesson.platformFee,
          totalAmount: personalLesson.totalAmount
        }
      }
    });

  } catch (error: any) {
    console.error('결제 생성 실패:', error);
    res.status(500).json({
      success: false,
      message: error.message || '서버 오류가 발생했습니다.'
    });
  }
});

/**
 * ⭐ 외부 개인레슨 결제 완료 처리 및 정산 정보 저장
 * POST /api/personal-lessons/:id/payment/complete
 */
router.post('/:id/payment/complete', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { transactionId, receiptUrl } = req.body;

    // 개인레슨 조회
    const personalLesson = await PersonalLesson.findById(id)
      .populate('instructorId', 'name email instructorInfo')
      .populate('centerId', 'name')
      .populate('paymentId');

    if (!personalLesson) {
      return res.status(404).json({
        success: false,
        message: '개인레슨을 찾을 수 없습니다.'
      });
    }

    // 본인 확인
    if (personalLesson.studentId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: '본인의 개인레슨만 결제할 수 있습니다.'
      });
    }

    // 결제 정보 확인
    if (!personalLesson.paymentId) {
      return res.status(400).json({
        success: false,
        message: '결제 정보가 없습니다.'
      });
    }

    const payment = await Payment.findById(personalLesson.paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: '결제 정보를 찾을 수 없습니다.'
      });
    }

    // 결제 완료 처리
    payment.status = 'completed';
    payment.processedAt = new Date();
    if (transactionId) payment.transactionId = transactionId;
    if (receiptUrl) payment.receiptUrl = receiptUrl;
    await payment.save();

    // 개인레슨 결제 상태 업데이트
    personalLesson.paymentStatus = 'completed';
    await personalLesson.save();

    // ⭐ 정산 항목 자동 생성 (강사, 센터, 플랫폼)
    try {
      await createSettlementItem(personalLesson._id.toString());
    } catch (settlementError) {
      console.error('정산 항목 생성 실패:', settlementError);
      // 정산 항목 생성 실패해도 결제 완료는 유지
    }

    res.json({
      success: true,
      message: '결제가 완료되었습니다.',
      data: {
        payment: payment.toObject(),
        personalLesson: {
          id: personalLesson._id,
          status: personalLesson.status,
          paymentStatus: personalLesson.paymentStatus,
          instructorFee: personalLesson.instructorFee,
          laneRentalFee: personalLesson.laneRentalFee,
          platformFee: personalLesson.platformFee,
          totalAmount: personalLesson.totalAmount,
          isExternalInstructor: personalLesson.isExternalInstructor
        },
        settlement: {
          instructorAmount: (personalLesson.instructorFee || 0) - (personalLesson.platformFee || 0),
          centerAmount: personalLesson.laneRentalFee || 0,
          platformAmount: personalLesson.platformFee || 0
        }
      }
    });

  } catch (error: any) {
    console.error('결제 완료 처리 실패:', error);
    res.status(500).json({
      success: false,
      message: error.message || '서버 오류가 발생했습니다.'
    });
  }
});

export default router;


