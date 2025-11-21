/**
 * ✅ JJ Swim Lab - 승인대기 관리 API
 * 
 * 📋 **기능**
 * - 승인 요청 목록 조회
 * - 승인/거부 처리
 * - 승인 상태별 필터링
 * - 승인 이력 관리
 * - 승인 권한 관리
 * 
 * 🔒 **인증 필요**: 예
 * 👤 **접근 권한**: superAdmin, centerAdmin
 */

import express from 'express';
import { auth as authMiddleware } from '../middleware/auth';
import { User } from '../models/User';
import { Payment } from '../models/Payment';
import { Booking } from '../models/Booking';
import { Course } from '../models/Course';
import { Approval } from '../models/Approval';
import mongoose from 'mongoose';
import { logInfo, logError, logWarn, logDebug } from '../utils/logger';
// 사용되지 않는 import 제거됨:
// import { Course } from '../models/Course';

const router = express.Router();

/**
 * 🔐 승인 관리 권한 확인 미들웨어
 * 
 * 📋 **기능**
 * - 승인 관리 기능에 접근할 수 있는 권한 확인
 * - superAdmin과 centerAdmin만 승인 처리 가능
 * - 권한 없는 사용자 접근 차단
 * 
 * 🎯 **허용 계정**
 * - superAdmin: 모든 승인 요청 처리 가능
 * - centerAdmin: 자신의 센터 관련 승인 요청만 처리 가능
 * - instructor, student: 접근 불가
 * 
 * @param req Express 요청 객체 (user 정보 포함)
 * @param res Express 응답 객체
 * @param next 다음 미들웨어 함수
 */
const requireAdmin = (req: any, res: any, next: any) => {
  // 승인 관리 권한이 있는 계정 타입 확인 (center-admin도 허용)
  const userType = req.user.userType;
  if (!['superAdmin', 'centerAdmin', 'center-admin'].includes(userType)) {
    return res.status(403).json({
      success: false,
      message: '승인 관리 권한이 없습니다. 관리자 계정이 필요합니다.'
    });
  }
  next();
};

/**
 * 📋 승인 요청 목록 조회 API
 * 
 * 📋 **기능**
 * - 계정별 승인 요청 목록 조회 (권한별 필터링)
 * - 상태별, 유형별 필터링 지원
 * - 페이지네이션을 통한 대용량 데이터 처리
 * - 실제 데이터베이스 연동 (하드코딩 없음)
 * 
 * 🎯 **계정별 조회 범위**
 * - superAdmin: 모든 승인 요청 조회 가능
 * - centerAdmin: 자신의 센터 관련 승인 요청만 조회 가능
 * 
 * @route GET /api/approvals
 * @param status 승인 상태 필터 (pending/approved/rejected/all)
 * @param type 승인 유형 필터 (course_enrollment/instructor_registration/payment_approval/all)
 * @param page 페이지 번호 (기본값: 1)
 * @param limit 페이지당 항목 수 (기본값: 20)
 */
router.get('/', authMiddleware, requireAdmin, async (req, res) => {
  try {
    // 🔍 요청자 정보 및 쿼리 파라미터 추출
    let { userType } = req.user;  // 요청자 계정 정보
    const { centerId } = req.user;
    const { status, type, page = 1, limit = 20 } = req.query;  // 필터링 옵션

    // center-admin을 centerAdmin으로 정규화
    if (userType === 'center-admin') {
      userType = 'centerAdmin';
    }

    // centerId가 없으면 DB에서 조회
    let finalCenterId: string | mongoose.Types.ObjectId | undefined = centerId;
    if ((userType === 'centerAdmin' || userType === 'center-admin') && !centerId) {
      const user = await User.findById(req.user._id);
      const dbCenterId = user?.centerId || user?.centerAdminInfo?.managedCenters?.[0];
      finalCenterId = dbCenterId ? (dbCenterId.toString ? dbCenterId.toString() : dbCenterId) : undefined;
    }

    // 🔍 기본 쿼리 조건 구성 (계정별 접근 범위 제한)
    const queryCondition: any = {};
    if ((userType === 'centerAdmin' || userType === 'center-admin') && finalCenterId) {
      // 센터관리자: 자신의 센터 관련 승인 요청만 조회
      queryCondition.centerId = finalCenterId;
    }
    // superAdmin: 모든 승인 요청 조회 (추가 조건 없음)

    // 📊 상태별 필터링 (pending/approved/rejected)
    if (status && status !== 'all') {
      queryCondition.status = status;
    }

    // 📂 유형별 필터링 (course_enrollment/instructor_registration/payment_approval)
    if (type && type !== 'all') {
      queryCondition.type = type;
    }

    // 📄 페이지네이션 설정
    const skip = (Number(page) - 1) * Number(limit);

    // 승인 요청 목록 조회
    const approvals = await Approval.find(queryCondition)
      .populate('userId', 'name email userType')
      .populate('courseId', 'name')
      .populate('instructorId', 'name')
      .sort({ requestDate: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    // 타입 안전성을 위한 타입 가드
    const isPopulatedUser = (user: any): user is { name: string; email: string; userType: string } => {
      return user && typeof user === 'object' && 'name' in user;
    };

    const isPopulatedCourse = (course: any): course is { name: string } => {
      return course && typeof course === 'object' && 'name' in course;
    };

    const isPopulatedInstructor = (instructor: any): instructor is { name: string } => {
      return instructor && typeof instructor === 'object' && 'name' in instructor;
    };

    // 전체 개수 조회
    const totalCount = await Approval.countDocuments(queryCondition);

    // 승인 요청 데이터 변환
    const formattedApprovals = approvals.map(approval => ({
      id: approval._id,
      type: approval.type,
      title: approval.title,
      description: approval.description,
      requesterName: isPopulatedUser(approval.userId) ? approval.userId.name : '알 수 없음',
      requesterType: isPopulatedUser(approval.userId) ? approval.userId.userType : '알 수 없음',
      requestDate: approval.requestDate,
      status: approval.status,
      priority: approval.priority,
      estimatedAmount: approval.estimatedAmount,
      courseName: isPopulatedCourse(approval.courseId) ? approval.courseId.name : undefined,
      instructorName: isPopulatedInstructor(approval.instructorId) ? approval.instructorId.name : undefined,
      createdAt: approval.createdAt
    }));

    res.json({
      success: true,
      data: {
        approvals: formattedApprovals,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(totalCount / Number(limit)),
          totalCount,
          hasNext: skip + Number(limit) < totalCount,
          hasPrev: Number(page) > 1
        }
      }
    });
  } catch (error) {
    logError('승인 요청 목록 조회 오류', error);
    res.status(500).json({
      success: false,
      message: '승인 요청 목록 조회 중 오류가 발생했습니다.'
    });
  }
});

// 승인 요청 상세 조회
router.get('/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const approval = await Approval.findById(id)
      .populate('userId', 'name email userType phone')
      .populate('courseId', 'name description price')
      .populate('instructorId', 'name email phone')
      .lean();

    if (!approval) {
      return res.status(404).json({
        success: false,
        message: '승인 요청을 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      data: approval
    });
  } catch (error) {
    logError('승인 요청 상세 조회 오류', error);
    res.status(500).json({
      success: false,
      message: '승인 요청 상세 조회 중 오류가 발생했습니다.'
    });
  }
});

// 승인/거부 처리
router.put('/:id/process', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body; // action: 'approve' | 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: '잘못된 액션입니다. approve 또는 reject만 가능합니다.'
      });
    }

    const approval = await Approval.findById(id);
    if (!approval) {
      return res.status(404).json({
        success: false,
        message: '승인 요청을 찾을 수 없습니다.'
      });
    }

    if (approval.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: '이미 처리된 승인 요청입니다.'
      });
    }

    // 승인/거부 처리
    approval.status = action === 'approve' ? 'approved' : 'rejected';
    approval.processedBy = new mongoose.Types.ObjectId(req.user._id);
    approval.processedAt = new Date();
    approval.reason = reason;

    await approval.save();

    // 승인된 경우 관련 데이터 처리
    if (action === 'approve') {
      await processApprovedRequest(approval);
    }

    res.json({
      success: true,
      message: `승인 요청이 ${action === 'approve' ? '승인' : '거부'}되었습니다.`,
      data: approval
    });
  } catch (error) {
    logError('승인 처리 오류', error);
    res.status(500).json({
      success: false,
      message: '승인 처리 중 오류가 발생했습니다.'
    });
  }
});

// 승인된 요청 처리 함수
async function processApprovedRequest(approval: any) {
  try {
    switch (approval.type) {
      case 'course_enrollment':
        // 수강 신청 승인 시 수강생 등록
        if (approval.courseId && approval.userId) {
          // 이미 등록된 수강생인지 확인
          const existingEnrollment = await Booking.findOne({
            studentId: approval.userId,
            courseId: approval.courseId
          });

          if (!existingEnrollment) {
            await Booking.create({
              studentId: approval.userId,
              courseId: approval.courseId,
              instructorId: approval.instructorId,
              status: 'confirmed',
              enrollmentDate: new Date()
            });
          }
        }
        break;

      case 'instructor_registration':
        // 강사 등록 승인 시 사용자 타입 변경
        if (approval.userId) {
          await User.findByIdAndUpdate(approval.userId, {
            userType: 'instructor',
            isApproved: true,
            approvedAt: new Date()
          });
        }
        break;

      case 'payment_approval':
        // 결제 승인 시 결제 상태 변경 + 코스 배정(enrolledStudents) + 학생 centerId 지정
        if (approval.paymentId) {
          const updatedPayment = await Payment.findByIdAndUpdate(
            approval.paymentId,
            {
              status: 'completed',
              approvedAt: new Date(),
              approvedBy: approval.processedBy
            },
            { new: true }
          ).populate('relatedCourse');

          // 결제에 연결된 코스/유저로 배정 처리
          const courseId = approval.courseId || updatedPayment?.relatedCourse;
          const userId = approval.userId || updatedPayment?.user;

          if (courseId && userId) {
            // 코스에 수강생 배정(enrolledStudents)
            const course = await Course.findById(courseId);
            if (course) {
              const already =
                (course.enrolledStudents || []).some((e: any) => e?.student?.toString?.() === userId.toString());
              if (!already) {
                course.enrolledStudents = [
                  ...(course.enrolledStudents || []),
                  { student: userId, enrollmentDate: new Date(), status: 'active' }
                ];
                await course.save();
              }
              // 학생 centerId 지정(없을 경우)
              if (course.centerId) {
                const student = await User.findById(userId);
                if (student && !student.centerId) {
                  student.centerId = course.centerId;
                  await student.save();
                }
              }
            }
          }
        }
        break;

      case 'schedule_change':
        // 일정 변경 승인 시 수업 일정 업데이트
        // (구체적인 구현은 일정 관리 시스템에 따라 달라짐)
        break;

      case 'refund_request':
        // ⭐ 환불 요청 승인 시 실제 환불 처리
        if (approval.courseId && approval.userId) {
          const { Payment } = require('../models/Payment');
          const { Course } = require('../models/Course');
          const { Booking } = require('../models/Booking');
          // const { PersonalLesson } = require('../models/PersonalLesson'); // 사용하지 않음
          
          // 1. 관련 Payment 찾기 및 환불 처리
          const payment = await Payment.findOne({
            user: approval.userId,
            relatedCourse: approval.courseId,
            status: { $in: ['completed', 'pending'] }
          });
          
          if (payment) {
            // ⭐ 환불 금액 계산 (환불 정책에 따라 계산, 일단 estimatedAmount 또는 payment.amount 사용)
            // TODO: 환불 정책에 따른 정확한 환불 금액 계산 로직 추가 필요
            const refundAmount = approval.estimatedAmount || payment.amount;
            
            payment.status = 'refunded';
            payment.refundAmount = refundAmount;
            payment.refundedAt = new Date();
            payment.refundedBy = approval.processedBy;
            payment.notes = (payment.notes || '') + `\n환불 승인: ${approval.reason || '센터 관리자 승인'}\n환불 금액: ${refundAmount.toLocaleString()}원`;
            await payment.save();
            console.log(`✅ Payment ${payment._id} 환불 처리 완료: ${refundAmount.toLocaleString()}원`);
          }
          
          // 2. Course의 enrolledStudents에서 학생 제거
          const course = await Course.findById(approval.courseId);
          if (course && course.enrolledStudents) {
            const studentIdStr = approval.userId.toString();
            course.enrolledStudents = (course.enrolledStudents || []).filter((e: any) => {
              const eStudentId = e.student?.toString() || e.student?.toString() || e.student;
              return eStudentId !== studentIdStr;
            });
            await course.save();
            console.log(`✅ Course ${course._id}에서 학생 ${approval.userId} 제거 완료`);
          }
          
          // 3. Booking 상태 변경 (있다면)
          const booking = await Booking.findOne({
            studentId: approval.userId,
            courseId: approval.courseId,
            status: { $in: ['confirmed', 'pending', 'completed'] }
          });
          
          if (booking) {
            booking.status = 'cancelled';
            booking.cancelledAt = new Date();
            booking.cancellationReason = '환불 승인';
            await booking.save();
            console.log(`✅ Booking ${booking._id} 취소 처리 완료`);
          }
          
          // 4. PersonalLesson 상태 변경 (있다면) - PersonalLesson은 courseId가 없을 수 있으므로 studentId로만 찾기
          // 환불 신청은 Course에 대한 것이므로 PersonalLesson은 별도로 처리하지 않음
          // (PersonalLesson 환불은 별도 Approval로 처리되어야 함)
        }
        break;
    }
  } catch (error) {
    logError('승인된 요청 처리 오류', error);
    throw error;
  }
}

// 승인 통계 조회
router.get('/stats/overview', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { userType, centerId } = req.user;

    const queryCondition: any = {};
    if (userType === 'centerAdmin' && centerId) {
      queryCondition.centerId = centerId;
    }

    // 상태별 개수
    const statusStats = await Approval.aggregate([
      { $match: queryCondition },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // 유형별 개수
    const typeStats = await Approval.aggregate([
      { $match: queryCondition },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    // 우선순위별 개수
    const priorityStats = await Approval.aggregate([
      { $match: queryCondition },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // 최근 7일간 승인 요청 트렌드
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyTrend = await Approval.aggregate([
      {
        $match: {
          ...queryCondition,
          requestDate: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$requestDate' } },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        statusStats,
        typeStats,
        priorityStats,
        dailyTrend
      }
    });
  } catch (error) {
    logError('승인 통계 조회 오류', error);
    res.status(500).json({
      success: false,
      message: '승인 통계 조회 중 오류가 발생했습니다.'
    });
  }
});

export default router;
