/**
 * 💰 JJ Swim Lab - 정산 관리 API
 * 
 * 정산 조회, 처리, 통계 기능 제공
 * 
 * 🔄 **연동 파일**
 * - server/src/models/Settlement.ts (정산 모델)
 * - server/src/services/settlementService.ts (정산 서비스)
 */

import express, { Request, Response } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth';
import { Settlement } from '../models/Settlement';
import { processSettlements, getSettlementStats } from '../services/settlementService';
import { logInfo, logError, logWarn, logDebug } from '../utils/logger';

const router = express.Router();

interface AuthRequest extends Request {
  user?: any;
}

/**
 * 정산 목록 조회
 * GET /api/settlements
 */
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { recipientType, recipientId, status, periodType, startDate, endDate, page = 1, limit = 20 } = req.query;
    const user = req.user;

    const query: any = {};

    // 권한에 따른 필터링
    if (user.userType === 'instructor') {
      query.recipientType = 'instructor';
      query.recipientId = user._id;
    } else if (user.userType === 'centerAdmin') {
      query.recipientType = 'center';
      // 센터 관리자의 경우 본인 센터만 조회
      const userDoc = await require('mongoose').model('User').findById(user._id);
      const centerId = userDoc?.centerAdminInfo?.managedCenters?.[0];
      if (centerId) {
        query.recipientId = centerId;
      }
    }

    if (recipientType) query.recipientType = recipientType;
    if (recipientId) query.recipientId = recipientId;
    if (status) query.status = status;
    if (periodType) query.periodType = periodType;
    if (startDate || endDate) {
      query.periodStart = {};
      if (startDate) query.periodStart.$gte = new Date(startDate as string);
      if (endDate) query.periodStart.$lte = new Date(endDate as string);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const settlements = await Settlement.find(query)
      .populate('recipientId', 'name email')
      .populate('processedBy', 'name email')
      .sort({ periodStart: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Settlement.countDocuments(query);

    res.json({
      success: true,
      message: '정산 목록 조회 성공',
      data: {
        settlements,
        pagination: {
          current: Number(page),
          total: Math.ceil(total / Number(limit)),
          count: settlements.length,
          totalCount: total
        }
      }
    });

  } catch (error: any) {
    logError('정산 목록 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: error.message || '서버 오류가 발생했습니다.'
    });
  }
});

/**
 * 정산 상세 조회
 * GET /api/settlements/:id
 */
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const settlement = await Settlement.findById(id)
      .populate('recipientId', 'name email phone')
      .populate('processedBy', 'name email')
      .populate('items.personalLessonId')
      .populate('items.paymentId');

    if (!settlement) {
      return res.status(404).json({
        success: false,
        message: '정산 내역을 찾을 수 없습니다.'
      });
    }

    // 권한 확인
    if (user.userType === 'instructor' && settlement.recipientType === 'instructor') {
      if (settlement.recipientId.toString() !== user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: '본인의 정산 내역만 조회할 수 있습니다.'
        });
      }
    }

    res.json({
      success: true,
      message: '정산 상세 조회 성공',
      data: settlement
    });

  } catch (error: any) {
    logError('정산 상세 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: error.message || '서버 오류가 발생했습니다.'
    });
  }
});

/**
 * 정산 통계 조회
 * GET /api/settlements/stats
 */
router.get('/stats/overview', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { recipientType, recipientId, startDate, endDate } = req.query;
    const user = req.user;

    let finalRecipientType = recipientType as 'instructor' | 'center' | 'platform' | undefined;
    let finalRecipientId = recipientId as string | undefined;

    // 권한에 따른 필터링
    if (user.userType === 'instructor') {
      finalRecipientType = 'instructor';
      finalRecipientId = user._id.toString();
    } else if (user.userType === 'centerAdmin') {
      finalRecipientType = 'center';
      const userDoc = await require('mongoose').model('User').findById(user._id);
      const centerId = userDoc?.centerAdminInfo?.managedCenters?.[0];
      if (centerId) {
        finalRecipientId = centerId.toString();
      }
    }

    const stats = await getSettlementStats(
      finalRecipientType,
      finalRecipientId,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );

    res.json({
      success: true,
      message: '정산 통계 조회 성공',
      data: stats
    });

  } catch (error: any) {
    logError('정산 통계 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: error.message || '서버 오류가 발생했습니다.'
    });
  }
});

/**
 * 정산 처리 (관리자만)
 * POST /api/settlements/process
 */
router.post('/process', authMiddleware, requireRole(['superAdmin', 'centerAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const { periodStart, periodEnd } = req.body;

    if (!periodStart || !periodEnd) {
      return res.status(400).json({
        success: false,
        message: '정산 기간을 입력해주세요.'
      });
    }

    const result = await processSettlements(
      new Date(periodStart),
      new Date(periodEnd)
    );

    res.json({
      success: true,
      message: '정산 처리가 완료되었습니다.',
      data: result
    });

  } catch (error: any) {
    logError('정산 처리 실패:', error);
    res.status(500).json({
      success: false,
      message: error.message || '서버 오류가 발생했습니다.'
    });
  }
});

export default router;

