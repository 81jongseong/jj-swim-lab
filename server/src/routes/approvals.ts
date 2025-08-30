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
import { Course } from '../models/Course';
import { Payment } from '../models/Payment';
import { Booking } from '../models/Booking';
import { Approval } from '../models/Approval';
import mongoose from 'mongoose';

const router = express.Router();

// 권한 확인 미들웨어
const requireAdmin = (req: any, res: any, next: any) => {
  if (!['superAdmin', 'centerAdmin'].includes(req.user.userType)) {
    return res.status(403).json({
      success: false,
      message: '접근 권한이 없습니다.'
    });
  }
  next();
};

// 승인 요청 목록 조회
router.get('/', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { userType, centerId } = req.user;
    const { status, type, page = 1, limit = 20 } = req.query;

    // 기본 쿼리 조건
    let queryCondition: any = {};
    if (userType === 'centerAdmin' && centerId) {
      queryCondition.centerId = centerId;
    }

    // 상태별 필터링
    if (status && status !== 'all') {
      queryCondition.status = status;
    }

    // 유형별 필터링
    if (type && type !== 'all') {
      queryCondition.type = type;
    }

    // 페이지네이션
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
    console.error('승인 요청 목록 조회 오류:', error);
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
    console.error('승인 요청 상세 조회 오류:', error);
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
    console.error('승인 처리 오류:', error);
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
        // 결제 승인 시 결제 상태 변경
        if (approval.paymentId) {
          await Payment.findByIdAndUpdate(approval.paymentId, {
            status: 'completed',
            approvedAt: new Date(),
            approvedBy: approval.processedBy
          });
        }
        break;

      case 'schedule_change':
        // 일정 변경 승인 시 수업 일정 업데이트
        // (구체적인 구현은 일정 관리 시스템에 따라 달라짐)
        break;

      case 'refund_request':
        // 환불 요청 승인 시 환불 처리
        // (구체적인 구현은 결제 시스템에 따라 달라짐)
        break;
    }
  } catch (error) {
    console.error('승인된 요청 처리 오류:', error);
    throw error;
  }
}

// 승인 통계 조회
router.get('/stats/overview', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { userType, centerId } = req.user;

    let queryCondition: any = {};
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
    console.error('승인 통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '승인 통계 조회 중 오류가 발생했습니다.'
    });
  }
});

export default router;
