/**
 * 🧠 JJ Swim Lab - 고급 AI 분석 API 라우트
 */

import { Router, Request, Response } from 'express';
import multer from 'multer';
import { AdvancedAIService } from '../services/advancedAI';
import { authMiddleware } from '../middleware/auth';
import { logInfo, logError } from '../utils/logger';

const router = Router();
const aiService = AdvancedAIService.getInstance();

// 파일 업로드 설정 (비디오 분석용)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('비디오 파일만 업로드 가능합니다.'));
    }
  }
});

/**
 * POST /api/advanced-ai/analyze-pose
 * 고도화된 수영 자세 분석
 */
router.post('/analyze-pose', authMiddleware, upload.single('video'), async (req: Request, res: Response) => {
  try {
    const { strokeType } = req.body;
    const videoFile = req.file;
    const userId = (req as any).user?.userId;

    if (!videoFile) {
      return res.status(400).json({
        success: false,
        error: '비디오 파일이 필요합니다.'
      });
    }

    if (!strokeType) {
      return res.status(400).json({
        success: false,
        error: '영법 타입이 필요합니다.'
      });
    }

    logInfo(`고급 자세 분석 요청: 사용자 ${userId}, 영법 ${strokeType}`);

    // AI 분석 실행
    const analysis = await aiService.analyzeSwimmingPose(
      videoFile.buffer,
      userId,
      strokeType
    );

    // 분석 결과를 데이터베이스에 저장 (실제 구현에서)
    // await saveAnalysisResult(analysis);

    res.json({
      success: true,
      data: {
        analysis,
        message: '수영 자세 분석이 완료되었습니다.'
      }
    });

  } catch (error) {
    logError('고급 자세 분석 API 오류:', error);
    res.status(500).json({
      success: false,
      error: '자세 분석 중 오류가 발생했습니다.'
    });
  }
});

/**
 * GET /api/advanced-ai/learning-pattern/:userId
 * 개인별 학습 패턴 분석
 */
router.get('/learning-pattern/:userId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const currentUserId = (req as any).user?.userId;

    // 본인 또는 관리자만 조회 가능
    if (userId !== currentUserId && (req as any).user?.role !== 'superAdmin') {
      return res.status(403).json({
        success: false,
        error: '권한이 없습니다.'
      });
    }

    logInfo(`학습 패턴 분석 요청: 사용자 ${userId}`);

    const learningPattern = await aiService.analyzeLearningPattern(userId);

    res.json({
      success: true,
      data: {
        learningPattern,
        message: '학습 패턴 분석이 완료되었습니다.'
      }
    });

  } catch (error) {
    logError('학습 패턴 분석 API 오류:', error);
    res.status(500).json({
      success: false,
      error: '학습 패턴 분석 중 오류가 발생했습니다.'
    });
  }
});

/**
 * POST /api/advanced-ai/injury-risk-assessment
 * 부상 위험 평가
 */
router.post('/injury-risk-assessment', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { poseAnalysis } = req.body;
    const userId = (req as any).user?.userId;

    if (!poseAnalysis) {
      return res.status(400).json({
        success: false,
        error: '자세 분석 데이터가 필요합니다.'
      });
    }

    logInfo(`부상 위험 평가 요청: 사용자 ${userId}`);

    const riskAssessment = await aiService.assessInjuryRisk(userId, poseAnalysis);

    res.json({
      success: true,
      data: {
        riskAssessment,
        message: '부상 위험 평가가 완료되었습니다.'
      }
    });

  } catch (error) {
    logError('부상 위험 평가 API 오류:', error);
    res.status(500).json({
      success: false,
      error: '부상 위험 평가 중 오류가 발생했습니다.'
    });
  }
});

/**
 * POST /api/advanced-ai/generate-training-plan
 * 맞춤형 훈련 계획 생성
 */
router.post('/generate-training-plan', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { currentLevel } = req.body;
    const userId = (req as any).user?.userId;

    if (!currentLevel) {
      return res.status(400).json({
        success: false,
        error: '현재 수준 정보가 필요합니다.'
      });
    }

    logInfo(`맞춤형 훈련 계획 생성 요청: 사용자 ${userId}, 레벨 ${currentLevel}`);

    // 1. 학습 패턴 분석
    const learningPattern = await aiService.analyzeLearningPattern(userId);

    // 2. 훈련 계획 생성
    const trainingPlan = await aiService.generatePersonalizedTrainingPlan(
      userId,
      learningPattern,
      currentLevel
    );

    res.json({
      success: true,
      data: {
        trainingPlan,
        learningPattern,
        message: '맞춤형 훈련 계획이 생성되었습니다.'
      }
    });

  } catch (error) {
    logError('훈련 계획 생성 API 오류:', error);
    res.status(500).json({
      success: false,
      error: '훈련 계획 생성 중 오류가 발생했습니다.'
    });
  }
});

/**
 * GET /api/advanced-ai/analysis-history/:userId
 * 사용자별 분석 히스토리 조회
 */
router.get('/analysis-history/:userId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, type } = req.query;
    void type;
    const currentUserId = (req as any).user?.userId;

    // 본인 또는 관리자만 조회 가능
    if (userId !== currentUserId && (req as any).user?.role !== 'superAdmin') {
      return res.status(403).json({
        success: false,
        error: '권한이 없습니다.'
      });
    }

    // 실제 구현에서는 데이터베이스에서 히스토리 조회
    const mockHistory = {
      analyses: [
        {
          id: '1',
          type: 'pose-analysis',
          timestamp: new Date(),
          strokeType: 'freestyle',
          overallScore: 85,
          improvements: ['팔 동작 개선', '호흡 리듬 향상']
        },
        {
          id: '2',
          type: 'learning-pattern',
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          learningStyle: 'visual',
          progressRate: 0.75
        }
      ],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: 2,
        totalPages: 1
      }
    };

    res.json({
      success: true,
      data: mockHistory
    });

  } catch (error) {
    logError('분석 히스토리 조회 API 오류:', error);
    res.status(500).json({
      success: false,
      error: '분석 히스토리 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * GET /api/advanced-ai/recommendations/:userId
 * 개인별 맞춤 추천사항 조회
 */
router.get('/recommendations/:userId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const currentUserId = (req as any).user?.userId;

    // 본인 또는 관리자만 조회 가능
    if (userId !== currentUserId && (req as any).user?.role !== 'superAdmin') {
      return res.status(403).json({
        success: false,
        error: '권한이 없습니다.'
      });
    }

    // 실제 구현에서는 최신 분석 결과를 기반으로 추천사항 생성
    const mockRecommendations = [
      {
        type: 'technique',
        priority: 'high',
        title: '킥 기술 개선',
        description: '다리 킥의 강도와 리듬을 개선하여 추진력을 향상시키세요.',
        exercises: [
          {
            name: '킥보드 연습',
            duration: '10분',
            difficulty: 'intermediate'
          }
        ],
        expectedImprovement: 15,
        timeframe: '2-3주'
      },
      {
        type: 'training',
        priority: 'medium',
        title: '지구력 향상',
        description: '장거리 수영을 위한 지구력을 키워보세요.',
        exercises: [
          {
            name: '인터벌 훈련',
            duration: '20분',
            difficulty: 'advanced'
          }
        ],
        expectedImprovement: 20,
        timeframe: '4-6주'
      }
    ];

    res.json({
      success: true,
      data: {
        recommendations: mockRecommendations,
        lastUpdated: new Date(),
        message: '맞춤 추천사항을 조회했습니다.'
      }
    });

  } catch (error) {
    logError('추천사항 조회 API 오류:', error);
    res.status(500).json({
      success: false,
      error: '추천사항 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * POST /api/advanced-ai/real-time-feedback
 * 실시간 피드백 생성
 */
router.post('/real-time-feedback', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { liveData } = req.body;
    const userId = (req as any).user?.userId;

    if (!liveData) {
      return res.status(400).json({
        success: false,
        error: '실시간 데이터가 필요합니다.'
      });
    }

    // 실시간 피드백 생성 (간단한 예시)
    const feedback = {
      timestamp: new Date(),
      userId,
      feedbackType: 'immediate',
      messages: [
        {
          type: 'technique',
          message: '팔 동작이 좋습니다! 이 리듬을 유지하세요.',
          urgency: 'low'
        },
        {
          type: 'correction',
          message: '호흡 시 머리를 조금 더 낮게 유지해보세요.',
          urgency: 'medium'
        }
      ],
      score: 82,
      improvements: ['호흡 타이밍']
    };

    res.json({
      success: true,
      data: {
        feedback,
        message: '실시간 피드백이 생성되었습니다.'
      }
    });

  } catch (error) {
    logError('실시간 피드백 API 오류:', error);
    res.status(500).json({
      success: false,
      error: '실시간 피드백 생성 중 오류가 발생했습니다.'
    });
  }
});

export default router;
