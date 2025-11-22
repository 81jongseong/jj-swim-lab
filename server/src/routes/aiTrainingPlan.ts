/**
 * AI 기반 개인별 훈련 계획 API 라우트
 */

import express from 'express';
import { authMiddleware } from '../middleware/auth';
import { AITrainingPlanService, ITrainingPlanRequest } from '../services/aiTrainingPlanService';
import { TrainingPlan } from '../models/TrainingPlan';
import mongoose from 'mongoose';
import { logInfo, logError, logWarn, logDebug } from '../utils/logger';

const router = express.Router();

/**
 * POST /api/ai-training-plan/generate
 * AI 기반 개인별 훈련 계획 생성
 */
router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }

    const {
      userProfile,
      goals,
      currentAssessment
    } = req.body;

    // 입력값 검증
    if (!userProfile || !goals || !currentAssessment) {
      return res.status(400).json({ 
        error: '필수 정보가 누락되었습니다.',
        required: ['userProfile', 'goals', 'currentAssessment']
      });
    }

    // 훈련 계획 요청 객체 생성
    const planRequest: ITrainingPlanRequest = {
      userId: new mongoose.Types.ObjectId(userId),
      userProfile: {
        currentLevel: userProfile.currentLevel,
        experience: parseInt(userProfile.experience) || 0,
        age: parseInt(userProfile.age) || 25,
        weight: parseFloat(userProfile.weight) || 70,
        height: parseFloat(userProfile.height) || 170,
        medicalConditions: userProfile.medicalConditions || [],
        availableTime: parseInt(userProfile.availableTime) || 5,
        preferredDays: userProfile.preferredDays || [1, 3, 5],
        preferredTimes: userProfile.preferredTimes || ['evening']
      },
      goals: {
        primary: goals.primary,
        secondary: goals.secondary || [],
        targetDate: new Date(goals.targetDate),
        specificTargets: goals.specificTargets || {}
      },
      currentAssessment: {
        technique: {
          freestyle: parseInt(currentAssessment.technique?.freestyle) || 5,
          backstroke: parseInt(currentAssessment.technique?.backstroke) || 5,
          breaststroke: parseInt(currentAssessment.technique?.breaststroke) || 5,
          butterfly: parseInt(currentAssessment.technique?.butterfly) || 5
        },
        endurance: parseInt(currentAssessment.endurance) || 5,
        speed: parseInt(currentAssessment.speed) || 5,
        flexibility: parseInt(currentAssessment.flexibility) || 5,
        strength: parseInt(currentAssessment.strength) || 5
      }
    };

    // AI 훈련 계획 생성
    const trainingPlan = await AITrainingPlanService.generatePersonalizedPlan(planRequest);

    res.status(201).json({
      message: 'AI 훈련 계획이 성공적으로 생성되었습니다.',
      data: trainingPlan
    });

  } catch (error) {
    logError('AI 훈련 계획 생성 오류:', error);
    res.status(500).json({ 
      error: 'AI 훈련 계획 생성에 실패했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

/**
 * GET /api/ai-training-plan/user/:userId
 * 사용자별 훈련 계획 목록 조회
 */
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const requestUserId = req.user?._id;

    // 본인 또는 관리자만 조회 가능
    if (userId !== requestUserId && req.user?.userType !== 'superAdmin' && req.user?.userType !== 'centerAdmin') {
      return res.status(403).json({ error: '접근 권한이 없습니다.' });
    }

    const trainingPlans = await AITrainingPlanService.getUserTrainingPlans(
      new mongoose.Types.ObjectId(userId)
    );

    res.json({
      message: '훈련 계획 목록을 성공적으로 조회했습니다.',
      data: trainingPlans
    });

  } catch (error) {
    logError('훈련 계획 조회 오류:', error);
    res.status(500).json({ 
      error: '훈련 계획 조회에 실패했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

/**
 * GET /api/ai-training-plan/:planId
 * 특정 훈련 계획 상세 조회
 */
router.get('/:planId', authMiddleware, async (req, res) => {
  try {
    const { planId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(planId)) {
      return res.status(400).json({ error: '유효하지 않은 계획 ID입니다.' });
    }

    const trainingPlan = await TrainingPlan.findById(planId)
      .populate('userId', 'name email');

    if (!trainingPlan) {
      return res.status(404).json({ error: '훈련 계획을 찾을 수 없습니다.' });
    }

    // 본인 또는 관리자만 조회 가능
    if (trainingPlan.userId.toString() !== req.user?._id && 
        req.user?.userType !== 'superAdmin' && 
        req.user?.userType !== 'centerAdmin') {
      return res.status(403).json({ error: '접근 권한이 없습니다.' });
    }

    res.json({
      message: '훈련 계획을 성공적으로 조회했습니다.',
      data: trainingPlan
    });

  } catch (error) {
    logError('훈련 계획 상세 조회 오류:', error);
    res.status(500).json({ 
      error: '훈련 계획 조회에 실패했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

/**
 * PUT /api/ai-training-plan/:planId/complete-session
 * 훈련 세션 완료 처리
 */
router.put('/:planId/complete-session', authMiddleware, async (req, res) => {
  try {
    const { planId } = req.params;
    const {
      sessionId,
      completion,
      perceivedExertion,
      actualDuration,
      notes
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(planId)) {
      return res.status(400).json({ error: '유효하지 않은 계획 ID입니다.' });
    }

    // 입력값 검증
    if (!sessionId || completion === undefined || !perceivedExertion || !actualDuration) {
      return res.status(400).json({ 
        error: '필수 정보가 누락되었습니다.',
        required: ['sessionId', 'completion', 'perceivedExertion', 'actualDuration']
      });
    }

    // 권한 확인
    const trainingPlan = await TrainingPlan.findById(planId);
    if (!trainingPlan) {
      return res.status(404).json({ error: '훈련 계획을 찾을 수 없습니다.' });
    }

    if (trainingPlan.userId.toString() !== req.user?._id) {
      return res.status(403).json({ error: '본인의 훈련 계획만 업데이트할 수 있습니다.' });
    }

    // 세션 완료 처리
    const updatedPlan = await AITrainingPlanService.completeSession(
      new mongoose.Types.ObjectId(planId),
      {
        sessionId: parseInt(sessionId),
        completion: parseFloat(completion),
        perceivedExertion: parseInt(perceivedExertion),
        actualDuration: parseInt(actualDuration),
        notes: notes || ''
      }
    );

    if (!updatedPlan) {
      return res.status(404).json({ error: '훈련 계획을 찾을 수 없습니다.' });
    }

    res.json({
      message: '훈련 세션이 성공적으로 완료 처리되었습니다.',
      data: updatedPlan
    });

  } catch (error) {
    logError('세션 완료 처리 오류:', error);
    res.status(500).json({ 
      error: '세션 완료 처리에 실패했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

/**
 * PUT /api/ai-training-plan/:planId/adjust
 * AI 기반 훈련 계획 조정
 */
router.put('/:planId/adjust', authMiddleware, async (req, res) => {
  try {
    const { planId } = req.params;
    const { performanceData } = req.body;

    if (!mongoose.Types.ObjectId.isValid(planId)) {
      return res.status(400).json({ error: '유효하지 않은 계획 ID입니다.' });
    }

    // 권한 확인
    const trainingPlan = await TrainingPlan.findById(planId);
    if (!trainingPlan) {
      return res.status(404).json({ error: '훈련 계획을 찾을 수 없습니다.' });
    }

    if (trainingPlan.userId.toString() !== req.user?._id && 
        req.user?.userType !== 'superAdmin' && 
        req.user?.userType !== 'centerAdmin') {
      return res.status(403).json({ error: '접근 권한이 없습니다.' });
    }

    // AI 기반 계획 조정
    const adjustedPlan = await AITrainingPlanService.adjustTrainingPlan(
      new mongoose.Types.ObjectId(planId),
      performanceData || trainingPlan.progress.performanceMetrics
    );

    if (!adjustedPlan) {
      return res.status(404).json({ error: '훈련 계획을 찾을 수 없습니다.' });
    }

    res.json({
      message: 'AI 기반 훈련 계획 조정이 완료되었습니다.',
      data: adjustedPlan
    });

  } catch (error) {
    logError('훈련 계획 조정 오류:', error);
    res.status(500).json({ 
      error: '훈련 계획 조정에 실패했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

/**
 * GET /api/ai-training-plan/:planId/next-session
 * 다음 훈련 세션 정보 조회
 */
router.get('/:planId/next-session', authMiddleware, async (req, res) => {
  try {
    const { planId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(planId)) {
      return res.status(400).json({ error: '유효하지 않은 계획 ID입니다.' });
    }

    const trainingPlan = await TrainingPlan.findById(planId);
    if (!trainingPlan) {
      return res.status(404).json({ error: '훈련 계획을 찾을 수 없습니다.' });
    }

    // 권한 확인
    if (trainingPlan.userId.toString() !== req.user?._id && 
        req.user?.userType !== 'superAdmin' && 
        req.user?.userType !== 'centerAdmin') {
      return res.status(403).json({ error: '접근 권한이 없습니다.' });
    }

    // 다음 세션 정보 조회
    const nextSession = (trainingPlan as any).getNextSession();

    if (!nextSession) {
      return res.status(404).json({ 
        error: '다음 훈련 세션을 찾을 수 없습니다.',
        message: '모든 훈련이 완료되었거나 계획에 오류가 있습니다.'
      });
    }

    res.json({
      message: '다음 훈련 세션 정보를 성공적으로 조회했습니다.',
      data: {
        currentWeek: trainingPlan.progress.currentWeek,
        currentSession: trainingPlan.progress.currentSession,
        nextSession: nextSession,
        progress: {
          completed: trainingPlan.progress.completedSessions,
          total: trainingPlan.progress.totalSessions,
          percentage: Math.round((trainingPlan.progress.completedSessions / trainingPlan.progress.totalSessions) * 100)
        }
      }
    });

  } catch (error) {
    logError('다음 세션 조회 오류:', error);
    res.status(500).json({ 
      error: '다음 세션 조회에 실패했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

/**
 * GET /api/ai-training-plan/:planId/progress
 * 훈련 진행 상황 조회
 */
router.get('/:planId/progress', authMiddleware, async (req, res) => {
  try {
    const { planId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(planId)) {
      return res.status(400).json({ error: '유효하지 않은 계획 ID입니다.' });
    }

    const trainingPlan = await TrainingPlan.findById(planId);
    if (!trainingPlan) {
      return res.status(404).json({ error: '훈련 계획을 찾을 수 없습니다.' });
    }

    // 권한 확인
    if (trainingPlan.userId.toString() !== req.user?._id && 
        req.user?.userType !== 'superAdmin' && 
        req.user?.userType !== 'centerAdmin') {
      return res.status(403).json({ error: '접근 권한이 없습니다.' });
    }

    // 진행률 계산
    const progressPercentage = (trainingPlan as any).calculateProgress();
    
    // 최근 성과 분석
    const recentMetrics = trainingPlan.progress.performanceMetrics.slice(-10);
    const avgCompletion = recentMetrics.length > 0 ? 
      recentMetrics.reduce((sum, m) => sum + m.completion, 0) / recentMetrics.length : 0;
    const avgExertion = recentMetrics.length > 0 ? 
      recentMetrics.reduce((sum, m) => sum + m.perceivedExertion, 0) / recentMetrics.length : 0;

    // 조정 필요 여부 확인
    const needsAdjustment = (trainingPlan as any).needsAdjustment();

    res.json({
      message: '훈련 진행 상황을 성공적으로 조회했습니다.',
      data: {
        overview: {
          title: trainingPlan.title,
          currentWeek: trainingPlan.progress.currentWeek,
          totalWeeks: trainingPlan.planDetails.duration,
          completedSessions: trainingPlan.progress.completedSessions,
          totalSessions: trainingPlan.progress.totalSessions,
          progressPercentage,
          adherenceRate: trainingPlan.progress.adherenceRate
        },
        recentPerformance: {
          averageCompletion: Math.round(avgCompletion),
          averageExertion: Math.round(avgExertion * 10) / 10,
          trend: trainingPlan.aiAnalysis.performanceTrend,
          sessionsAnalyzed: recentMetrics.length
        },
        aiAnalysis: {
          lastAnalysisDate: trainingPlan.aiAnalysis.lastAnalysisDate,
          needsAdjustment,
          strengthAreas: trainingPlan.aiAnalysis.strengthAreas,
          improvementAreas: trainingPlan.aiAnalysis.improvementAreas,
          recommendedAdjustments: trainingPlan.aiAnalysis.recommendedAdjustments,
          riskFactors: trainingPlan.aiAnalysis.riskFactors
        },
        metrics: recentMetrics
      }
    });

  } catch (error) {
    logError('진행 상황 조회 오류:', error);
    res.status(500).json({ 
      error: '진행 상황 조회에 실패했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

/**
 * DELETE /api/ai-training-plan/:planId
 * 훈련 계획 삭제 (비활성화)
 */
router.delete('/:planId', authMiddleware, async (req, res) => {
  try {
    const { planId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(planId)) {
      return res.status(400).json({ error: '유효하지 않은 계획 ID입니다.' });
    }

    const trainingPlan = await TrainingPlan.findById(planId);
    if (!trainingPlan) {
      return res.status(404).json({ error: '훈련 계획을 찾을 수 없습니다.' });
    }

    // 권한 확인 (본인 또는 관리자)
    if (trainingPlan.userId.toString() !== req.user?._id && 
        req.user?.userType !== 'superAdmin' && 
        req.user?.userType !== 'centerAdmin') {
      return res.status(403).json({ error: '접근 권한이 없습니다.' });
    }

    // 소프트 삭제 (비활성화)
    trainingPlan.isActive = false;
    await trainingPlan.save();

    res.json({
      message: '훈련 계획이 성공적으로 삭제되었습니다.',
      data: { planId, deletedAt: new Date() }
    });

  } catch (error) {
    logError('훈련 계획 삭제 오류:', error);
    res.status(500).json({ 
      error: '훈련 계획 삭제에 실패했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

/**
 * GET /api/ai-training-plan/stats/overview
 * 전체 훈련 계획 통계 (관리자용)
 */
router.get('/stats/overview', authMiddleware, async (req, res) => {
  try {
    // 관리자 권한 확인
    if (req.user?.userType !== 'superAdmin' && req.user?.userType !== 'centerAdmin') {
      return res.status(403).json({ error: '관리자 권한이 필요합니다.' });
    }

    const stats = await TrainingPlan.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalPlans: { $sum: 1 },
          avgDuration: { $avg: '$planDetails.duration' },
          avgSessionsPerWeek: { $avg: '$planDetails.sessionsPerWeek' },
          avgAdherenceRate: { $avg: '$progress.adherenceRate' }
        }
      }
    ]);

    const goalDistribution = await TrainingPlan.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$goals.primary',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const levelDistribution = await TrainingPlan.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$userProfile.currentLevel',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      message: '훈련 계획 통계를 성공적으로 조회했습니다.',
      data: {
        overview: stats[0] || {
          totalPlans: 0,
          avgDuration: 0,
          avgSessionsPerWeek: 0,
          avgAdherenceRate: 0
        },
        goalDistribution,
        levelDistribution
      }
    });

  } catch (error) {
    logError('통계 조회 오류:', error);
    res.status(500).json({ 
      error: '통계 조회에 실패했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

export default router;
