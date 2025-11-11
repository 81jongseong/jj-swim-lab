import express, { Response } from 'express';
import { AIAnalysis } from '../models/AIAnalysis';
import { EvaluationCriteria } from '../models/AIEvaluationCriteria';
import { Checklist } from '../models/Checklist';
import { AIEngine } from '../utils/AIEngine';
import { AdvancedAIEngine } from '../utils/AdvancedAIEngine';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = express.Router();

// AI 분석 결과 저장
router.post('/analyze', authMiddleware, requireRole(['instructor', 'centerAdmin', 'superAdmin']), async (req: any, res: Response) => {
  try {
    const { studentId, analysisType, technique, checklistData } = req.body;
    
    if (!studentId || !analysisType) {
      return res.status(400).json({
        success: false,
        message: '필수 파라미터가 누락되었습니다.'
      });
    }
    
    let analysisResult;
    
    switch (analysisType) {
      case 'posture':
        if (!technique || !checklistData) {
          return res.status(400).json({
            success: false,
            message: '자세 분석을 위해 technique와 checklistData가 필요합니다.'
          });
        }
        analysisResult = await AIEngine.analyzePosture(studentId, technique, checklistData);
        break;
        
      case 'progress':
        analysisResult = await AIEngine.predictProgress(studentId, req.user._id);
        break;
        
      case 'recommendation':
        analysisResult = await AIEngine.generatePersonalizedRecommendation(studentId, req.user._id, { persist: false });
        break;
        
      case 'performance':
        analysisResult = await AIEngine.analyzePerformance(studentId, req.user._id, { persist: false });
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: '지원하지 않는 분석 유형입니다.'
        });
    }
    
    // 분석 결과 저장
    const aiAnalysis = new AIAnalysis({
      studentId,
      instructorId: req.user._id,
      analysisType,
      [analysisType + 'Analysis']: analysisResult
    });
    
    await aiAnalysis.save();
    
    res.json({
      success: true,
      data: {
        analysisId: aiAnalysis._id,
        analysisType,
        result: analysisResult,
        createdAt: aiAnalysis.createdAt
      }
    });
    
  } catch (error) {
    console.error('AI 분석 오류:', error);
    res.status(500).json({
      success: false,
      message: 'AI 분석 중 오류가 발생했습니다.'
    });
  }
});

// AI 분석 결과 조회
router.get('/analysis/:studentId', authMiddleware, requireRole(['instructor', 'centerAdmin', 'superAdmin']), async (req: any, res: Response) => {
  try {
    const { studentId } = req.params;
    const { analysisType, limit = 10 } = req.query;
    
    const query: any = {
      studentId,
      instructorId: req.user._id,
      isActive: true
    };
    
    if (analysisType) {
      query.analysisType = analysisType;
    }
    
    const analyses = await AIAnalysis.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string))
      .populate('studentId', 'name email')
      .populate('instructorId', 'name email');
    
    res.json({
      success: true,
      data: analyses
    });
    
  } catch (error) {
    console.error('AI 분석 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: 'AI 분석 조회 중 오류가 발생했습니다.'
    });
  }
});

// 학생별 AI 대시보드 데이터
router.get('/dashboard/:studentId', authMiddleware, requireRole(['instructor', 'centerAdmin', 'superAdmin']), async (req: any, res: Response) => {
  try {
    const { studentId } = req.params;
    
    // 최근 분석 결과들 가져오기
    const [recentAnalyses, checklists] = await Promise.all([
      AIAnalysis.find({
        studentId,
        instructorId: req.user._id,
        isActive: true
      }).sort({ createdAt: -1 }).limit(5),
      
      Checklist.find({
        studentId,
        instructorId: req.user._id
      }).sort({ createdAt: -1 }).limit(10)
    ]);
    
    // 대시보드 데이터 구성
    const dashboardData = {
      recentAnalyses: recentAnalyses.map(analysis => ({
        id: analysis._id,
        type: analysis.analysisType,
        createdAt: analysis.createdAt,
        summary: getAnalysisSummary(analysis)
      })),
      
      progressTrend: calculateProgressTrend(checklists),
      
      recommendations: getLatestRecommendations(recentAnalyses),
      
      performanceMetrics: calculatePerformanceMetrics(checklists)
    };
    
    res.json({
      success: true,
      data: dashboardData
    });
    
  } catch (error) {
    console.error('AI 대시보드 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: 'AI 대시보드 조회 중 오류가 발생했습니다.'
    });
  }
});

// AI 분석 결과 업데이트
router.put('/analysis/:analysisId', authMiddleware, requireRole(['instructor', 'centerAdmin', 'superAdmin']), async (req: any, res: Response) => {
  try {
    const { analysisId } = req.params;
    const updateData = req.body;
    
    const analysis = await AIAnalysis.findOneAndUpdate(
      {
        _id: analysisId,
        instructorId: req.user._id
      },
      updateData,
      { new: true }
    );
    
    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: '분석 결과를 찾을 수 없습니다.'
      });
    }
    
    res.json({
      success: true,
      data: analysis
    });
    
  } catch (error) {
    console.error('AI 분석 업데이트 오류:', error);
    res.status(500).json({
      success: false,
      message: 'AI 분석 업데이트 중 오류가 발생했습니다.'
    });
  }
});

// AI 분석 결과 삭제
router.delete('/analysis/:analysisId', authMiddleware, requireRole(['instructor', 'centerAdmin', 'superAdmin']), async (req: any, res: Response) => {
  try {
    const { analysisId } = req.params;
    
    const analysis = await AIAnalysis.findOneAndUpdate(
      {
        _id: analysisId,
        instructorId: req.user._id
      },
      { isActive: false },
      { new: true }
    );
    
    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: '분석 결과를 찾을 수 없습니다.'
      });
    }
    
    res.json({
      success: true,
      message: '분석 결과가 삭제되었습니다.'
    });
    
  } catch (error) {
    console.error('AI 분석 삭제 오류:', error);
    res.status(500).json({
      success: false,
      message: 'AI 분석 삭제 중 오류가 발생했습니다.'
    });
  }
});

// 헬퍼 메서드들
function getAnalysisSummary(analysis: any): string {
  switch (analysis.analysisType) {
    case 'posture': {
      const score = analysis.postureAnalysis?.score;
      const technique = analysis.postureAnalysis?.technique;
      const completionRate = analysis.postureAnalysis?.completionRate;
      return [
        score !== undefined ? `자세 ${score}점` : null,
        technique ? `${technique}` : null,
        completionRate !== undefined ? `완료율 ${completionRate}%` : null
      ].filter(Boolean).join(' · ') || '자세 분석 완료';
    }
    case 'progress': {
      const prediction = analysis.progressPrediction;
      if (!prediction) return '진도 예측 완료';
      const base = `${prediction.currentLevel} → ${prediction.predictedNextLevel}`;
      const weeks = prediction.estimatedWeeks ? `${prediction.estimatedWeeks}주 예상` : null;
      const confidence = prediction.confidence ? `신뢰도 ${(prediction.confidence * 100).toFixed(0)}%` : null;
      return [base, weeks, confidence].filter(Boolean).join(' · ');
    }
    case 'recommendation': {
      const recommendation = analysis.personalizedRecommendation;
      if (!recommendation) return '추천 분석 완료';
      const focus = recommendation.focusAreas?.length
        ? `중점 영역: ${recommendation.focusAreas.join(', ')}`
        : null;
      const difficulty = recommendation.difficultyAdjustment
        ? `강도: ${translateDifficulty(recommendation.difficultyAdjustment)}`
        : null;
      const improvement = recommendation.estimatedImprovement;
      return [focus, difficulty, improvement].filter(Boolean).join(' · ') || '추천 운동 생성';
    }
    case 'performance': {
      const performance = analysis.performanceAnalysis;
      if (!performance) return '성과 분석 완료';
      const base = `총점 ${performance.overallScore}점`;
      const improvement = performance.improvementRate !== undefined
        ? `개선율 ${performance.improvementRate}%`
        : null;
      const consistency = performance.consistencyScore !== undefined
        ? `일관성 ${performance.consistencyScore}`
        : null;
      return [base, improvement, consistency].filter(Boolean).join(' · ');
    }
    default:
      return '분석 완료';
  }
}

function calculateProgressTrend(checklists: any[]): any {
  if (checklists.length < 2) {
    return { trend: 0, direction: 'stable' };
  }
  
  const recent = checklists.slice(0, 3).reduce((sum, c) => sum + (c.progress || 0), 0) / 3;
  const older = checklists.slice(-3).reduce((sum, c) => sum + (c.progress || 0), 0) / 3;
  
  const trend = recent - older;
  const direction = trend > 5 ? 'up' : trend < -5 ? 'down' : 'stable';
  
  return { trend: Math.round(trend), direction };
}

function getLatestRecommendations(analyses: any[]): string[] {
  const recommendationAnalysis = analyses.find(a => a.analysisType === 'recommendation');
  if (!recommendationAnalysis?.personalizedRecommendation) return [];

  const { personalizedRecommendation: recommendation } = recommendationAnalysis;
  const messages: string[] = [];

  if (recommendation.focusAreas?.length) {
    messages.push(`중점 훈련 영역: ${recommendation.focusAreas.join(', ')}`);
  }
  if (recommendation.recommendedExercises?.length) {
    messages.push(`추천 운동: ${recommendation.recommendedExercises.slice(0, 3).join(', ')}${recommendation.recommendedExercises.length > 3 ? ' 외' : ''}`);
  }
  if (recommendation.difficultyAdjustment) {
    messages.push(`강도 조정: ${translateDifficulty(recommendation.difficultyAdjustment)}`);
  }
  if (recommendation.estimatedImprovement) {
    messages.push(`예상 효과: ${recommendation.estimatedImprovement}`);
  }

  return messages;
}

function calculatePerformanceMetrics(checklists: any[]): any {
  if (checklists.length === 0) {
    return { avgScore: 0, completionRate: 0, consistency: 0 };
  }
  
  const avgScore = checklists.reduce((sum, c) => sum + (c.progress || 0), 0) / checklists.length;
  const completionRate = (checklists.filter(c => c.status === 'completed').length / checklists.length) * 100;
  
  // 일관성 계산
  const progresses = checklists.map(c => c.progress || 0);
  const mean = progresses.reduce((a, b) => a + b, 0) / progresses.length;
  const variance = progresses.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / progresses.length;
  const consistency = Math.max(0, 1 - (Math.sqrt(variance) / 100));
  
  return {
    avgScore: Math.round(avgScore),
    completionRate: Math.round(completionRate),
    consistency: Math.round(consistency * 100)
  };
}

function translateDifficulty(difficulty: 'easier' | 'same' | 'harder'): string {
  switch (difficulty) {
    case 'easier':
      return '완화';
    case 'harder':
      return '강화';
    default:
      return '유지';
  }
}

// AI 설정 조회
router.get('/config', authMiddleware, requireRole(['instructor', 'centerAdmin', 'superAdmin']), async (req: any, res: Response) => {
  try {
    // 기본 AI 설정 반환
    const defaultConfig = {
      postureAnalysis: {
        enabled: true,
        techniques: ['freestyle', 'backstroke', 'breaststroke', 'butterfly'],
        weights: {
          '자세': 0.3,
          '호흡': 0.25,
          '팔동작': 0.25,
          '다리동작': 0.15,
          '타이밍': 0.05
        }
      },
      progressPrediction: {
        enabled: true,
        confidenceThreshold: 0.7,
        dataPointsRequired: 5
      },
      personalizedRecommendation: {
        enabled: true,
        focusAreas: ['자세', '호흡', '팔동작', '다리동작', '타이밍'],
        exerciseDatabase: [
          '플랭크', '코어 스트레칭', '자세 교정 운동',
          '호흡 연습', '수중 호흡', '호흡 타이밍 연습',
          '팔 스트로크 연습', '풀링 연습', '리커버리 연습',
          '킥 연습', '다리 근력 운동', '플렉서빌리티',
          '리듬 연습', '타이밍 연습', '조화 운동'
        ]
      },
      performanceAnalysis: {
        enabled: true,
        metrics: ['overallScore', 'improvementRate', 'consistencyScore'],
        thresholds: {
          'excellent': 90,
          'good': 70,
          'average': 50,
          'poor': 30
        }
      }
    };

    res.json({
      success: true,
      data: defaultConfig
    });
    
  } catch (error) {
    console.error('AI 설정 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: 'AI 설정 조회 중 오류가 발생했습니다.'
    });
  }
});

// AI 설정 업데이트
router.put('/config', authMiddleware, requireRole(['instructor', 'centerAdmin', 'superAdmin']), async (req: any, res: Response) => {
  try {
    const configData = req.body;
    
    // 설정 검증
    if (!configData) {
      return res.status(400).json({
        success: false,
        message: '설정 데이터가 필요합니다.'
      });
    }

    // 여기서는 설정을 메모리에 저장하거나 별도 컬렉션에 저장할 수 있습니다
    // 현재는 성공 응답만 반환
    res.json({
      success: true,
      message: 'AI 설정이 업데이트되었습니다.',
      data: configData
    });
    
  } catch (error) {
    console.error('AI 설정 업데이트 오류:', error);
    res.status(500).json({
      success: false,
      message: 'AI 설정 업데이트 중 오류가 발생했습니다.'
    });
  }
});

// 고급 AI 평가 수행
router.post('/evaluate', authMiddleware, requireRole(['instructor', 'centerAdmin', 'superAdmin']), async (req: any, res: Response) => {
  try {
    const {
      studentId,
      technique,
      performanceMetrics,
      instructorObservations
    } = req.body;

    if (!studentId || !technique) {
      return res.status(400).json({
        success: false,
        message: '학생 ID와 수영 기법이 필요합니다.'
      });
    }

    // 체크리스트 데이터 가져오기 (최근 5개)
    const recentChecklists = await Checklist.find({
      studentId,
      technique
    })
    .sort({ createdAt: -1 })
    .limit(5);

    const checklistData = recentChecklists.flatMap(checklist => 
      checklist.items || []
    );

    // 이전 평가 결과 가져오기
    const previousEvaluations = await AIAnalysis.find({
      studentId,
      analysisType: 'comprehensive'
    })
    .sort({ createdAt: -1 })
    .limit(3);

    // 고급 AI 평가 수행
    const evaluationInput = {
      studentId,
      technique,
      checklistData,
      performanceMetrics: performanceMetrics || {},
      instructorObservations: instructorObservations || {
        posture: 5,
        breathing: 5,
        movement: 5,
        efficiency: 5
      },
      previousEvaluations
    };

    const result = await AdvancedAIEngine.performComprehensiveEvaluation({
      ...evaluationInput,
      instructorId: req.user.id,
      level: 'intermediate' // 기본값 설정
    });

    res.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('고급 AI 평가 오류:', error);
    res.status(500).json({
      success: false,
      message: 'AI 평가 중 오류가 발생했습니다.'
    });
  }
});

// 평가 기준 조회
router.get('/criteria', authMiddleware, requireRole(['instructor', 'centerAdmin', 'superAdmin']), async (req: any, res: Response) => {
  try {
    const { technique } = req.query;
    
    const query = technique ? { technique } : {};
    const criteria = await EvaluationCriteria.find(query);

    res.json({
      success: true,
      data: criteria
    });

  } catch (error) {
    console.error('평가 기준 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '평가 기준 조회 중 오류가 발생했습니다.'
    });
  }
});

// 평가 기준 생성/업데이트
router.post('/criteria', authMiddleware, requireRole(['superAdmin']), async (req: any, res: Response) => {
  try {
    const criteriaData = req.body;

    const criteria = await EvaluationCriteria.findOneAndUpdate(
      { technique: criteriaData.technique },
      criteriaData,
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      data: criteria,
      message: '평가 기준이 저장되었습니다.'
    });

  } catch (error) {
    console.error('평가 기준 저장 오류:', error);
    res.status(500).json({
      success: false,
      message: '평가 기준 저장 중 오류가 발생했습니다.'
    });
  }
});

export default router;
