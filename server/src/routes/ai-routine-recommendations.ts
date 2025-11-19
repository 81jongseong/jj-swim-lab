/**
 * 🤖 AI 기반 개인별 운동 루틴 추천 API
 * 
 * 📋 **라우트 목적**
 * - 사용자 패턴 분석을 통한 맞춤형 루틴 추천
 * - AI 기반 동적 루틴 생성 및 조정
 * 
 * 🔄 **연동되는 모델**
 * - User, SwimProgram, HealthData, LearningProgress
 * - AIRoutineRecommendationService
 */

import express, { Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { AIRoutineRecommendationService } from '../services/aiRoutineRecommendationService';
import { cacheMiddleware } from '../middleware/cache';
import { logInfo, logError } from '../utils/logger';

const router = express.Router();

/**
 * GET /api/ai-routine-recommendations/analyze/:userId
 * 사용자 패턴 분석
 */
router.get('/analyze/:userId', authMiddleware, cacheMiddleware.statistics, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?.id;

    // 본인 또는 강사만 조회 가능
    if (userId !== currentUserId && req.user?.userType !== 'instructor' && req.user?.userType !== 'superAdmin') {
      return res.status(403).json({
        success: false,
        message: '권한이 없습니다.'
      });
    }

    logInfo('사용자 패턴 분석 요청', { userId, currentUserId });

    const pattern = await AIRoutineRecommendationService.analyzeUserPattern(userId);

    res.json({
      success: true,
      data: pattern
    });
  } catch (error: any) {
    logError('사용자 패턴 분석 실패', error);
    res.status(500).json({
      success: false,
      message: error.message || '사용자 패턴 분석 중 오류가 발생했습니다.'
    });
  }
});

/**
 * POST /api/ai-routine-recommendations/generate/:userId
 * AI 기반 개인별 루틴 추천
 */
router.post('/generate/:userId', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?.id;
    const { goals } = req.body;

    // 본인 또는 강사만 생성 가능
    if (userId !== currentUserId && req.user?.userType !== 'instructor' && req.user?.userType !== 'superAdmin') {
      return res.status(403).json({
        success: false,
        message: '권한이 없습니다.'
      });
    }

    logInfo('AI 루틴 추천 요청', { userId, currentUserId, goals });

    const recommendation = await AIRoutineRecommendationService.generateRoutineRecommendation(
      userId,
      Array.isArray(goals) ? goals : []
    );

    res.json({
      success: true,
      data: recommendation
    });
  } catch (error: any) {
    logError('AI 루틴 추천 실패', error);
    res.status(500).json({
      success: false,
      message: error.message || 'AI 루틴 추천 중 오류가 발생했습니다.'
    });
  }
});

/**
 * POST /api/ai-routine-recommendations/generate-options/:userId
 * 여러 루틴 옵션 생성 (A/B 테스트용)
 */
router.post('/generate-options/:userId', authMiddleware, async (req: Request & { user?: any }, res: Response) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?.id;
    const { count = 3 } = req.body;

    // 본인 또는 강사만 생성 가능
    if (userId !== currentUserId && req.user?.userType !== 'instructor' && req.user?.userType !== 'superAdmin') {
      return res.status(403).json({
        success: false,
        message: '권한이 없습니다.'
      });
    }

    logInfo('AI 루틴 옵션 생성 요청', { userId, currentUserId, count });

    const options = await AIRoutineRecommendationService.generateMultipleRoutineOptions(
      userId,
      Math.min(Math.max(count, 1), 5) // 1-5개 제한
    );

    res.json({
      success: true,
      data: options
    });
  } catch (error: any) {
    logError('AI 루틴 옵션 생성 실패', error);
    res.status(500).json({
      success: false,
      message: error.message || 'AI 루틴 옵션 생성 중 오류가 발생했습니다.'
    });
  }
});

export default router;



