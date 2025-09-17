import express, { Router, Request, Response } from 'express';
import { AIConfig } from '../models/AIConfig';
import { auth, requirePermission } from '../middleware/auth';
import { User } from '../models/User'; // Added import for User
import { requireRole } from '../middleware/auth'; // Added import for requireRole
import { Checklist } from '../models/Checklist'; // Added import for Checklist

interface AuthRequest extends Request {
  user?: any;
}

const router: Router = express.Router();

// Get all AI configurations
router.get('/', auth, requirePermission('aiConfigManagement'), async (req: AuthRequest, res: Response) => {
  try {
    const { category, algorithmType, isActive, search } = req.query;
    
    const filter: any = {};
    
    if (category) filter.category = category;
    if (algorithmType) filter.algorithmType = algorithmType;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'configData.metadata.tags': { $in: [new RegExp(search as string, 'i')] } }
      ];
    }
    
    const configs = await AIConfig.find(filter)
      .sort({ createdAt: -1 })
      .select('-configData.parameters -configData.thresholds -configData.weights');
    
    res.json({
      success: true,
      data: configs,
      total: configs.length
    });
                } catch (error) {
                res.status(500).json({
                  success: false,
                  message: 'Failed to fetch AI configurations',
                  error: error instanceof Error ? error instanceof Error ? error.message : String(error) : 'Unknown error'
                });
                return;
              }
});

// Get specific AI configuration
router.get('/:id', auth, requirePermission('aiConfigManagement'), async (req: AuthRequest, res: Response) => {
  try {
    const config = await AIConfig.findById(req.params.id);
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'AI configuration not found'
      });
    }
    
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch AI configuration',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Create new AI configuration
router.post('/', auth, requirePermission('aiConfigManagement'), async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      description,
      category,
      algorithmType,
      version,
      configData,
      uiConfig
    } = req.body;
    
    // Check if configuration with same name exists
    const existingConfig = await AIConfig.findOne({ name });
    if (existingConfig) {
      return res.status(400).json({
        success: false,
        message: 'AI configuration with this name already exists'
      });
    }
    
    // Set metadata
    const metadata = {
      createdBy: req.user._id,
      lastModifiedBy: req.user._id,
      tags: configData?.metadata?.tags || [],
      dependencies: configData?.metadata?.dependencies || []
    };
    
    const newConfig = new AIConfig({
      name,
      description,
      category,
      algorithmType,
      version: version || '1.0.0',
      configData: {
        ...configData,
        metadata
      },
      uiConfig
    });
    
    // Validate configuration
    const validation = newConfig.validateConfig();
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Configuration validation failed',
        errors: validation.errors
      });
    }
    
    await newConfig.save();
    
    res.status(201).json({
      success: true,
      message: 'AI configuration created successfully',
      data: newConfig
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create AI configuration',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Update AI configuration
router.put('/:id', auth, requirePermission('aiConfigManagement'), async (req: AuthRequest, res: Response) => {
  try {
    const config = await AIConfig.findById(req.params.id);
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'AI configuration not found'
      });
    }
    
    const {
      name,
      description,
      category,
      algorithmType,
      version,
      configData,
      uiConfig
    } = req.body;
    
    // Check if name is being changed and if it conflicts
    if (name && name !== config.name) {
      const existingConfig = await AIConfig.findOne({ name, _id: { $ne: req.params.id } });
      if (existingConfig) {
        return res.status(400).json({
          success: false,
          message: 'AI configuration with this name already exists'
        });
      }
    }
    
    // Update fields
    if (name) config.name = name;
    if (description) config.description = description;
    if (category) config.category = category;
    if (algorithmType) config.algorithmType = algorithmType;
    if (version) config.version = version;
    if (configData) {
      config.configData = {
        ...config.configData,
        ...configData,
        metadata: {
          ...config.configData.metadata,
          ...configData.metadata,
          lastModifiedBy: req.user._id
        }
      };
    }
    if (uiConfig) config.uiConfig = uiConfig;
    
    // Validate configuration
    const validation = config.validateConfig();
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Configuration validation failed',
        errors: validation.errors
      });
    }
    
    await config.save();
    
    res.json({
      success: true,
      message: 'AI configuration updated successfully',
      data: config
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update AI configuration',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Delete AI configuration
router.delete('/:id', auth, requirePermission('aiConfigManagement'), async (req: AuthRequest, res: Response) => {
  try {
    const config = await AIConfig.findById(req.params.id);
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'AI configuration not found'
      });
    }
    
    await AIConfig.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'AI configuration deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete AI configuration',
      error: error instanceof Error ? error instanceof Error ? error.message : String(error) : 'Unknown error'
    });
  }
});

// Toggle AI configuration active status
router.patch('/:id/toggle', auth, requirePermission('aiConfigManagement'), async (req: AuthRequest, res: Response) => {
  try {
    const config = await AIConfig.findById(req.params.id);
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'AI configuration not found'
      });
    }
    
    config.isActive = !config.isActive;
    config.configData.metadata.lastModifiedBy = req.user._id;
    
    await config.save();
    
    res.json({
      success: true,
      message: `AI configuration ${config.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { isActive: config.isActive }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to toggle AI configuration status',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Export AI configuration as JSON
router.get('/:id/export', auth, requirePermission('aiConfigManagement'), async (req: AuthRequest, res: Response) => {
  try {
    const config = await AIConfig.findById(req.params.id);
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'AI configuration not found'
      });
    }
    
    const exportData = config.exportConfig();
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${config.name}-v${config.version}.json"`);
    res.json(exportData);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to export AI configuration',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Import AI configuration from JSON
router.post('/import', auth, requirePermission('aiConfigManagement'), async (req: AuthRequest, res: Response) => {
  try {
    const importData = req.body;
    
    if (!importData.name || !importData.category || !importData.algorithmType) {
      return res.status(400).json({
        success: false,
        message: 'Invalid import data: missing required fields'
      });
    }
    
    // Check if configuration with same name exists
    const existingConfig = await AIConfig.findOne({ name: importData.name });
    if (existingConfig) {
      return res.status(400).json({
        success: false,
        message: 'AI configuration with this name already exists'
      });
    }
    
    const newConfig = new AIConfig();
    newConfig.importConfig(importData);
    
    // Set metadata
    newConfig.configData.metadata.createdBy = req.user._id;
    newConfig.configData.metadata.lastModifiedBy = req.user._id;
    
    // Validate configuration
    const validation = newConfig.validateConfig();
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Configuration validation failed',
        errors: validation.errors
      });
    }
    
    await newConfig.save();
    
    res.status(201).json({
      success: true,
      message: 'AI configuration imported successfully',
      data: newConfig
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to import AI configuration',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Validate AI configuration
router.post('/:id/validate', auth, requirePermission('aiConfigManagement'), async (req: AuthRequest, res: Response) => {
  try {
    const config = await AIConfig.findById(req.params.id);
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'AI configuration not found'
      });
    }
    
    const validation = config.validateConfig();
    
    res.json({
      success: true,
      data: validation
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to validate AI configuration',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Get AI configuration statistics
router.get('/stats/overview', auth, requirePermission('aiConfigManagement'), async (req: AuthRequest, res: Response) => {
  try {
    const stats = await AIConfig.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: {
            $sum: { $cond: ['$isActive', 1, 0] }
          },
          inactive: {
            $sum: { $cond: ['$isActive', 0, 1] }
          }
        }
      }
    ]);
    
    const categoryStats = await AIConfig.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          active: {
            $sum: { $cond: ['$isActive', 1, 0] }
          }
        }
      }
    ]);
    
    const algorithmTypeStats = await AIConfig.aggregate([
      {
        $group: {
          _id: '$algorithmType',
          count: { $sum: 1 },
          active: {
            $sum: { $cond: ['$isActive', 1, 0] }
          }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        overview: stats[0] || { total: 0, active: 0, inactive: 0 },
        byCategory: categoryStats,
        byAlgorithmType: algorithmTypeStats
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch AI configuration statistics',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Get AI configuration templates
router.get('/templates/list', auth, requirePermission('aiConfigManagement'), async (req: AuthRequest, res: Response) => {
  try {
    const templates = [
      {
        name: 'Swimming Stroke Analysis',
        description: 'AI algorithm for analyzing swimming stroke technique and form',
        category: 'diagnostic',
        algorithmType: 'swimming_analysis',
        configData: {
          parameters: {
            frameRate: { type: 'number', value: 30, min: 15, max: 60, description: 'Video frame rate for analysis', required: true },
            confidenceThreshold: { type: 'number', value: 0.8, min: 0.5, max: 0.95, description: 'Minimum confidence for pose detection', required: true },
            analysisMode: { type: 'string', value: 'comprehensive', options: ['basic', 'comprehensive', 'advanced'], description: 'Analysis depth level', required: true }
          },
          thresholds: {
            strokeEfficiency: 0.7,
            bodyAlignment: 0.8,
            breathingPattern: 0.6
          },
          weights: {
            armMovement: 0.3,
            legMovement: 0.25,
            bodyRotation: 0.25,
            breathing: 0.2
          },
          rules: [
            { id: 'rule1', condition: 'strokeEfficiency < 0.7', action: 'flag_for_review', priority: 1 },
            { id: 'rule2', condition: 'bodyAlignment < 0.8', action: 'suggest_correction', priority: 2 }
          ]
        },
        uiConfig: {
          displayName: 'Stroke Analysis',
          icon: 'Activity',
          color: '#3B82F6',
          formFields: [
            { field: 'frameRate', type: 'slider', label: 'Frame Rate', validation: { min: 15, max: 60 } },
            { field: 'confidenceThreshold', type: 'slider', label: 'Confidence Threshold', validation: { min: 0.5, max: 0.95 } },
            { field: 'analysisMode', type: 'select', label: 'Analysis Mode', options: [
              { label: 'Basic', value: 'basic' },
              { label: 'Comprehensive', value: 'comprehensive' },
              { label: 'Advanced', value: 'advanced' }
            ]}
          ],
          visualization: {
            charts: [
              { type: 'line', title: 'Stroke Efficiency Over Time', dataSource: 'strokeEfficiency', config: {} },
              { type: 'bar', title: 'Component Scores', dataSource: 'componentScores', config: {} }
            ],
            widgets: [
              { type: 'metric', title: 'Overall Score', dataSource: 'overallScore', config: {} },
              { type: 'gauge', title: 'Stroke Efficiency', dataSource: 'strokeEfficiency', config: {} }
            ]
          }
        }
      },
      {
        name: 'Performance Prediction',
        description: 'AI algorithm for predicting swimming performance improvements',
        category: 'assessment',
        algorithmType: 'performance_prediction',
        configData: {
          parameters: {
            predictionHorizon: { type: 'number', value: 30, min: 7, max: 90, description: 'Days to predict ahead', required: true },
            confidenceLevel: { type: 'number', value: 0.9, min: 0.8, max: 0.99, description: 'Prediction confidence level', required: true },
            includeExternalFactors: { type: 'boolean', value: true, description: 'Include weather, pool conditions', required: false }
          },
          thresholds: {
            improvementThreshold: 0.05,
            regressionThreshold: -0.02
          },
          weights: {
            recentPerformance: 0.4,
            trainingConsistency: 0.3,
            techniqueImprovement: 0.2,
            externalFactors: 0.1
          },
          rules: [
            { id: 'rule1', condition: 'predictedImprovement > 0.05', action: 'encourage_continuation', priority: 1 },
            { id: 'rule2', condition: 'predictedRegression < -0.02', action: 'suggest_intervention', priority: 2 }
          ]
        },
        uiConfig: {
          displayName: 'Performance Prediction',
          icon: 'TrendingUp',
          color: '#10B981',
          formFields: [
            { field: 'predictionHorizon', type: 'slider', label: 'Prediction Horizon (days)', validation: { min: 7, max: 90 } },
            { field: 'confidenceLevel', type: 'slider', label: 'Confidence Level', validation: { min: 0.8, max: 0.99 } },
            { field: 'includeExternalFactors', type: 'checkbox', label: 'Include External Factors' }
          ],
          visualization: {
            charts: [
              { type: 'line', title: 'Performance Trend', dataSource: 'performanceTrend', config: {} },
              { type: 'scatter', title: 'Prediction vs Actual', dataSource: 'predictionAccuracy', config: {} }
            ],
            widgets: [
              { type: 'metric', title: 'Predicted Improvement', dataSource: 'predictedImprovement', config: {} },
              { type: 'status', title: 'Prediction Status', dataSource: 'predictionStatus', config: {} }
            ]
          }
        }
      }
    ];
    
    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch AI configuration templates',
      error: error instanceof Error ? error instanceof Error ? error.message : String(error) : 'Unknown error'
    });
  }
});

// 10. AI 개인 맞춤 강습 계획 생성 (학생만)
router.post('/lesson-plan', auth, requireRole(['student']), async (req: AuthRequest, res: Response) => {
  try {
    const { swimmingLevel, goals, availableDays, preferredDuration } = req.body;
    
    // 사용자의 현재 진도율을 데이터베이스에서 조회
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    // 체크리스트 기반으로 현재 진도율 계산
    const checklists = await Checklist.find({ studentId: req.user._id });
    let currentProgress = 0;
    if (checklists.length > 0) {
      const totalItems = checklists.reduce((sum, checklist) => sum + checklist.items.length, 0);
      const completedItems = checklists.reduce((sum, checklist) => 
        sum + checklist.items.filter(item => item.isCompleted).length, 0
      );
      currentProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    }

    // AI 기반 개인 맞춤 강습 계획 생성
    const lessonPlan: any = {
      studentId: req.user._id,
      currentLevel: swimmingLevel || 'beginner',
      currentProgress: currentProgress,
      goals: goals || ['기본 영법 습득', '지구력 향상', '안전한 수영'],
      weeklySchedule: {
        monday: {
          focus: '기본기 연마',
          duration: '45분',
          exercises: [
            '자유형 기본 동작 연습 (20분)',
            '스트레칭 및 정리 (15분)',
            '안전 교육 (10분)'
          ],
          difficulty: 'easy',
          expectedProgress: calculateExpectedProgress(currentProgress, 'easy')
        },
        wednesday: {
          focus: '기술 연마',
          duration: '60분',
          exercises: [
            '자유형 호흡법 연습 (20분)',
            '평영 기본 동작 연습 (25분)',
            '스트레칭 및 정리 (15분)'
          ],
          difficulty: 'moderate',
          expectedProgress: calculateExpectedProgress(currentProgress, 'moderate')
        },
        friday: {
          focus: '지구력 향상',
          duration: '75분',
          exercises: [
            '자유형 지속 수영 (30분)',
            '인터벌 트레이닝 (25분)',
            '턴 연습 (15분)',
            '정리 (5분)'
          ],
          difficulty: 'challenging',
          expectedProgress: calculateExpectedProgress(currentProgress, 'challenging')
        }
      },
      monthly: {
        week1: '기본 기술 완성',
        week2: '지구력 향상',
        week3: '새로운 영법 도전',
        week4: '종합 평가 및 다음 목표 설정'
      },
      milestones: [
        {
          week: 2,
          goal: '자유형 100m 완주',
          reward: '특별 강습 1회'
        },
        {
          week: 4,
          goal: '평영 기본 동작 완성',
          reward: '강사 1:1 피드백'
        },
        {
          week: 8,
          goal: '모든 기본 영법 습득',
          reward: '수영 경기 참가 자격'
        }
      ]
    };

    // AI 추천사항 생성 (현재 진도율 기반)
    const aiRecommendations = generateAIRecommendations(currentProgress, swimmingLevel, goals);

    lessonPlan.aiRecommendations = aiRecommendations;

    res.status(201).json({
      success: true,
      message: 'AI 개인 맞춤 강습 계획이 성공적으로 생성되었습니다!',
      data: lessonPlan
    });
  } catch (error) {
    console.error('AI 강습 계획 생성 오류:', error);
    res.status(500).json({
      success: false,
      message: 'AI 강습 계획 생성에 실패했습니다.'
    });
  }
});

// 예상 진도율 계산 함수
function calculateExpectedProgress(currentProgress: number, difficulty: string): string {
  let progressIncrease = 0;
  
  switch (difficulty) {
    case 'easy':
      progressIncrease = Math.min(3, Math.max(1, Math.floor(currentProgress * 0.05)));
      break;
    case 'moderate':
      progressIncrease = Math.min(5, Math.max(2, Math.floor(currentProgress * 0.08)));
      break;
    case 'challenging':
      progressIncrease = Math.min(8, Math.max(3, Math.floor(currentProgress * 0.12)));
      break;
    default:
      progressIncrease = 3;
  }
  
  return `+${progressIncrease}%`;
}

// AI 추천사항 생성 함수
function generateAIRecommendations(currentProgress: number, level: string, goals: string[]): string[] {
  const recommendations = [];
  
  if (currentProgress < 30) {
    recommendations.push('기본 동작 연습에 집중하여 안전한 수영 기초를 다지세요');
    recommendations.push('정기적인 연습으로 기본기를 탄탄히 하세요');
  } else if (currentProgress < 60) {
    recommendations.push('기본 기술을 완성하고 새로운 영법에 도전해보세요');
    recommendations.push('지구력 향상을 위한 지속적인 연습이 필요합니다');
  } else if (currentProgress < 80) {
    recommendations.push('고급 기술 습득과 함께 경기 기술도 연마해보세요');
    recommendations.push('정기적인 평가로 현재 수준을 파악하고 개선점을 찾아보세요');
  } else {
    recommendations.push('전문가 수준의 기술을 완성하고 경기 참가를 고려해보세요');
    recommendations.push('다른 학생들을 지도하는 멘토 역할도 도전해보세요');
  }
  
  if (goals.includes('지구력 향상')) {
    recommendations.push('인터벌 트레이닝과 장거리 수영으로 체력을 기르세요');
  }
  
  if (goals.includes('안전한 수영')) {
    recommendations.push('안전 수칙을 항상 준수하고 응급 상황 대처법을 익히세요');
  }
  
  return recommendations;
}

// 11. AI 진도 예측 및 최적화 (학생만)
router.get('/progress-prediction', auth, requireRole(['student']), async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    // 체크리스트 기반으로 현재 진도율 계산
    const checklists = await Checklist.find({ studentId: req.user._id });
    let currentProgress = 0;
    if (checklists.length > 0) {
      const totalItems = checklists.reduce((sum, checklist) => sum + checklist.items.length, 0);
      const completedItems = checklists.reduce((sum, checklist) => 
        sum + checklist.items.filter(item => item.isCompleted).length, 0
      );
      currentProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    }

    // AI 기반 진도 예측 (현재 진도율 기반)
    const prediction = {
      currentStatus: {
        level: user.studentInfo?.swimmingLevel || 'beginner',
        progress: currentProgress,
        lastUpdate: new Date()
      },
      predictions: {
        shortTerm: {
          '1주': { 
            level: user.studentInfo?.swimmingLevel || 'beginner', 
            progress: Math.min(100, currentProgress + Math.floor(currentProgress * 0.08)), 
            confidence: 95 
          },
          '2주': { 
            level: user.studentInfo?.swimmingLevel || 'beginner', 
            progress: Math.min(100, currentProgress + Math.floor(currentProgress * 0.15)), 
            confidence: 90 
          },
          '4주': { 
            level: currentProgress >= 70 ? 'intermediate' : (user.studentInfo?.swimmingLevel || 'beginner'), 
            progress: Math.min(100, currentProgress + Math.floor(currentProgress * 0.25)), 
            confidence: 85 
          }
        },
        mediumTerm: {
          '2개월': { 
            level: currentProgress >= 60 ? 'intermediate' : (user.studentInfo?.swimmingLevel || 'beginner'), 
            progress: Math.min(100, currentProgress + Math.floor(currentProgress * 0.4)), 
            confidence: 80 
          },
          '3개월': { 
            level: currentProgress >= 50 ? 'intermediate' : (user.studentInfo?.swimmingLevel || 'beginner'), 
            progress: Math.min(100, currentProgress + Math.floor(currentProgress * 0.6)), 
            confidence: 75 
          },
          '6개월': { 
            level: currentProgress >= 40 ? 'advanced' : (currentProgress >= 20 ? 'intermediate' : 'beginner'), 
            progress: Math.min(100, currentProgress + Math.floor(currentProgress * 0.8)), 
            confidence: 70 
          }
        },
        longTerm: {
          '1년': { 
            level: currentProgress >= 30 ? 'advanced' : (currentProgress >= 10 ? 'intermediate' : 'beginner'), 
            progress: Math.min(100, currentProgress + Math.floor(currentProgress * 1.2)), 
            confidence: 65 
          },
          '2년': { 
            level: currentProgress >= 20 ? 'expert' : (currentProgress >= 5 ? 'advanced' : 'intermediate'), 
            progress: Math.min(100, currentProgress + Math.floor(currentProgress * 1.5)), 
            confidence: 60 
          }
        }
      },
      optimization: {
        recommendedPracticeTime: calculateRecommendedPracticeTime(currentProgress),
        focusAreas: generateFocusAreas(currentProgress, user.studentInfo?.swimmingLevel),
        potentialBottlenecks: generatePotentialBottlenecks(currentProgress),
        solutions: generateSolutions(currentProgress)
      },
      successProbability: {
        '1개월 내 목표 달성': Math.max(50, 100 - Math.floor(currentProgress * 0.3)),
        '3개월 내 목표 달성': Math.max(60, 100 - Math.floor(currentProgress * 0.2)),
        '6개월 내 목표 달성': Math.max(70, 100 - Math.floor(currentProgress * 0.15)),
        '1년 내 목표 달성': Math.max(80, 100 - Math.floor(currentProgress * 0.1))
      }
    };

    res.json({
      success: true,
      message: 'AI 진도 예측 및 최적화 조회 성공!',
      data: prediction
    });
  } catch (error) {
    console.error('AI 진도 예측 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: 'AI 진도 예측 조회에 실패했습니다.'
    });
  }
});

// 추천 연습 시간 계산 함수
function calculateRecommendedPracticeTime(currentProgress: number): string {
  if (currentProgress < 30) {
    return '주 2-3회, 회당 30-45분';
  } else if (currentProgress < 60) {
    return '주 3-4회, 회당 45-60분';
  } else if (currentProgress < 80) {
    return '주 4-5회, 회당 60-75분';
  } else {
    return '주 5-6회, 회당 75-90분';
  }
}

// 집중 영역 생성 함수
function generateFocusAreas(currentProgress: number, level: string): string[] {
  const focusAreas = [];
  
  if (currentProgress < 30) {
    focusAreas.push('자유형 기본 동작 완벽 숙련 (4주)');
    focusAreas.push('안전한 수영 습관 형성 (지속적)');
    focusAreas.push('기본 체력 향상 (2주)');
  } else if (currentProgress < 60) {
    focusAreas.push('자유형 호흡법 완벽 숙련 (2주)');
    focusAreas.push('평영 기본 동작 습득 (4주)');
    focusAreas.push('지구력 향상 (지속적)');
  } else if (currentProgress < 80) {
    focusAreas.push('고급 영법 습득 (6주)');
    focusAreas.push('턴 기술 개선 (4주)');
    focusAreas.push('경기 전략 학습 (8주)');
  } else {
    focusAreas.push('전문가 수준 기술 완성 (12주)');
    focusAreas.push('경기 경험 축적 (지속적)');
    focusAreas.push('멘토링 및 지도법 학습 (6주)');
  }
  
  return focusAreas;
}

// 잠재적 병목 지점 생성 함수
function generatePotentialBottlenecks(currentProgress: number): string[] {
  const bottlenecks = [];
  
  if (currentProgress < 30) {
    bottlenecks.push('기본 동작 미숙으로 인한 안전 위험');
    bottlenecks.push('체력 부족으로 인한 연습 지속 어려움');
    bottlenecks.push('수영에 대한 두려움과 긴장감');
  } else if (currentProgress < 60) {
    bottlenecks.push('호흡법 미숙으로 인한 지구력 한계');
    bottlenecks.push('새로운 영법 학습 시 기존 기술 퇴보');
    bottlenecks.push('정기적인 연습 부족으로 인한 성장 지연');
  } else if (currentProgress < 80) {
    bottlenecks.push('고급 기술 습득 시 기본기 퇴보');
    bottlenecks.push('경기 압박감으로 인한 실력 발휘 실패');
    bottlenecks.push('지나친 연습으로 인한 과부하');
  } else {
    bottlenecks.push('기술적 한계에 도달한 느낌');
    bottlenecks.push('동기부여 유지의 어려움');
    bottlenecks.push('새로운 도전 과제 부족');
  }
  
  return bottlenecks;
}

// 해결 방안 생성 함수
function generateSolutions(currentProgress: number): string[] {
  const solutions = [];
  
  if (currentProgress < 30) {
    solutions.push('기본 동작 전용 연습 시간 확보 (주 2회)');
    solutions.push('체력 향상을 위한 보조 운동 병행');
    solutions.push('강사와의 1:1 맞춤 지도');
  } else if (currentProgress < 60) {
    solutions.push('호흡법 전용 연습 시간 확보 (주 2회)');
    solutions.push('기존 기술 복습 시간 확보 (주 1회)');
    solutions.push('연습 일정 고정 및 알림 설정');
  } else if (currentProgress < 80) {
    solutions.push('기본기 복습과 고급 기술 학습 병행');
    solutions.push('정기적인 경기 참가로 압박감 극복');
    solutions.push('적절한 휴식과 회복 시간 확보');
  } else {
    solutions.push('새로운 목표 설정 및 도전 과제 제시');
    solutions.push('멘토링 역할로 동기부여 유지');
    solutions.push('다양한 수영 스타일과 기술 탐구');
  }
  
  return solutions;
}

// 12. AI 기반 강사 매칭 시스템 (학생만)
router.get('/instructor-matching', auth, requireRole(['student']), async (req: AuthRequest, res: Response) => {
  try {
    const { preferredStyle, learningPace, communicationStyle, schedule } = req.body;
    
    // AI 기반 강사 매칭
    const matching = {
      student: req.user._id,
      preferences: {
        preferredStyle,
        learningPace,
        communicationStyle,
        schedule
      },
      recommendations: [
        {
          instructor: {
            name: '김수영',
            rating: 4.8,
            experience: '8년',
            specialty: '자유형, 평영',
            communicationStyle: '친근하고 격려적',
            availability: '월,수,금 19:00-21:00'
          },
          matchScore: 95,
          reasons: [
            '선호하는 자유형 전문 강사',
            '학습 속도에 맞는 지도 스타일',
            '선호하는 커뮤니케이션 스타일',
            '가능한 시간대와 일치'
          ],
          expectedOutcome: '3개월 내 자유형 완성, 6개월 내 평영 습득'
        },
        {
          instructor: {
            name: '박영법',
            rating: 4.9,
            experience: '12년',
            specialty: '전 영법 마스터',
            communicationStyle: '체계적이고 명확한',
            availability: '화,목,토 18:00-20:00'
          },
          matchScore: 88,
          reasons: [
            '전 영법 전문가로 장기적 성장 가능',
            '체계적인 학습 방법',
            '높은 만족도',
            '시간대 부분 일치'
          ],
          expectedOutcome: '1년 내 모든 영법 완성, 경기 참가 가능'
        }
      ],
      aiInsights: [
        '김수영 강사는 현재 목표에 가장 적합합니다',
        '박영법 강사는 장기적 성장을 원한다면 추천합니다',
                '두 강사 모두 높은 만족도를 보여줍니다',
        '선호하는 시간대를 고려하여 선택하세요'
      ]
    };

    res.json({
      success: true,
      message: 'AI 강사 매칭 결과 조회 성공!',
      data: matching
    });
  } catch (error) {
    console.error('AI 강사 매칭 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: 'AI 강사 매칭 조회에 실패했습니다.'
    });
  }
});

export default router; 