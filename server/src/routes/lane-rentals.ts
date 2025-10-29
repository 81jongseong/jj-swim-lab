/**
 * 🏊‍♀️ 레인대여 API 라우트
 * 
 * 레인대여 신청, 조회, 수정, 취소 기능을 제공합니다.
 */

import express, { Request, Response } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth';
import { LaneRental } from '../models/LaneRental';
import { User } from '../models/User';
import { LaneAllocationService } from '../services/laneAllocationService';

const router = express.Router();

interface AuthRequest extends Request {
  user?: any;
}

/**
 * 레인대여 신청
 * POST /api/lane-rentals
 */
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const {
      date,
      startTime,
      endTime,
      duration,
      laneNumber,
      purpose,
      notes
    } = req.body;

    // 사용자 정보 가져오기
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: '사용자 정보를 찾을 수 없습니다.'
      });
    }

    // 센터 ID 가져오기
    const centerId = user.centerId || user.instructorInfo?.assignedCenters?.[0];
    if (!centerId) {
      return res.status(400).json({
        success: false,
        message: '소속 센터가 없습니다.'
      });
    }

    // 레인 충돌 검사
    const conflicts = await LaneAllocationService.checkLaneConflicts(
      date,
      startTime,
      centerId?.toString() || '',
      duration
    );

    // 특정 레인 번호와의 충돌 검사
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
      centerId: centerId,
      date: new Date(date),
      startTime,
      endTime,
      duration,
      laneNumber,
      purpose,
      notes,
      status: 'pending'
    });

    await laneRental.save();

    res.status(201).json({
      success: true,
      message: '레인대여 신청이 완료되었습니다.',
      data: laneRental
    });

  } catch (error) {
    console.error('레인대여 신청 실패:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

/**
 * 레인대여 목록 조회
 * GET /api/lane-rentals
 */
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const { status, page = 1, limit = 10 } = req.query;

    const query: any = { userId };
    if (status && status !== 'all') {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const laneRentals = await LaneRental.find(query)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await LaneRental.countDocuments(query);

    res.json({
      success: true,
      message: '레인대여 목록 조회 성공',
      data: {
        laneRentals,
        pagination: {
          current: Number(page),
          total: Math.ceil(total / Number(limit)),
          count: laneRentals.length,
          totalCount: total
        }
      }
    });

  } catch (error) {
    console.error('레인대여 목록 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

/**
 * 레인대여 상세 조회
 * GET /api/lane-rentals/:id
 */
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const laneRental = await LaneRental.findOne({
      _id: id,
      userId
    });

    if (!laneRental) {
      return res.status(404).json({
        success: false,
        message: '레인대여를 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      message: '레인대여 상세 조회 성공',
      data: laneRental
    });

  } catch (error) {
    console.error('레인대여 상세 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

/**
 * 레인대여 취소
 * DELETE /api/lane-rentals/:id
 */
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const laneRental = await LaneRental.findOne({
      _id: id,
      userId
    });

    if (!laneRental) {
      return res.status(404).json({
        success: false,
        message: '레인대여를 찾을 수 없습니다.'
      });
    }

    if (laneRental.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: '완료된 대여는 취소할 수 없습니다.'
      });
    }

    // 레인대여 취소
    await LaneRental.findByIdAndUpdate(id, {
      status: 'cancelled'
    });

    res.json({
      success: true,
      message: '레인대여가 취소되었습니다.'
    });

  } catch (error) {
    console.error('레인대여 취소 실패:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

/**
 * 사용 가능한 레인 조회
 * GET /api/lane-rentals/availability
 */
router.get('/availability/:date/:time', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { date, time } = req.params;
    const { duration = 60 } = req.query;

    const user = await User.findById(req.user._id);
    const centerId = user?.centerId || user?.instructorInfo?.assignedCenters?.[0];

    if (!centerId) {
      return res.status(400).json({
        success: false,
        message: '소속 센터가 없습니다.'
      });
    }

    const availability = await LaneAllocationService.findAvailableLanes(
      date,
      time,
      centerId?.toString() || '',
      Number(duration)
    );

    res.json({
      success: true,
      message: '사용 가능한 레인 조회 성공',
      data: availability
    });

  } catch (error) {
    console.error('사용 가능한 레인 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

export default router;


