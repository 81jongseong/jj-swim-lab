/**
 * 🏊‍♂️ 개인레슨 API 라우트
 * 
 * 개인레슨 신청, 조회, 수정, 취소 기능을 제공합니다.
 */

import express, { Request, Response } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth';
import { PersonalLesson } from '../models/PersonalLesson';
import { User } from '../models/User';
import { LaneAllocationService } from '../services/laneAllocationService';

const router = express.Router();

interface AuthRequest extends Request {
  user?: any;
}

/**
 * 개인레슨 신청
 * POST /api/personal-lessons
 */
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const {
      date,
      time,
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

    // 레인 충돌 검사
    const conflicts = await LaneAllocationService.checkLaneConflicts(
      date,
      time,
      centerId?.toString() || '',
      duration
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
      date: new Date(date),
      time,
      duration,
      lessonType,
      skillLevel,
      goals,
      notes,
      status: 'pending'
    });

    // 레인 자동 조정 및 레인 배정
    const adjustmentResult = await LaneAllocationService.adjustLanesForPersonalLesson({
      date,
      time,
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

export default router;


