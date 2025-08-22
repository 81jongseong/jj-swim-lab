import express, { Router, Request, Response } from 'express';
import { AIConfig, IAIConfig } from '../models/AIConfig';
import { auth, requirePermission, requireLevel } from '../middleware/auth';
import { User } from '../models/User'; // Added import for User
import { requireRole } from '../middleware/auth'; // Added import for requireRole

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
router.post('/personalized-lesson-plan', auth, requireRole(['student']), async (req: AuthRequest, res: Response) => {
  try {
    const { currentLevel, goals, availableTime, preferredStyle } = req.body;
    
    // AI 기반 개인 맞춤 강습 계획 생성
    const lessonPlan = {
      student: req.user._id,
      generatedAt: new Date(),
      currentLevel,
      goals,
      availableTime,
      preferredStyle,
      plan: {
        weekly: {
          monday: {
            focus: '기술 연마',
            duration: '60분',
            exercises: [
              '자유형 호흡법 연습 (20분)',
              '평영 기본 동작 연습 (25분)',
              '스트레칭 및 정리 (15분)'
            ],
            difficulty: 'moderate',
            expectedProgress: '+5%'
          },
          wednesday: {
            focus: '지구력 향상',
            duration: '75분',
            exercises: [
              '자유형 지속 수영 (30분)',
              '인터벌 트레이닝 (25분)',
              '턴 연습 (15분)',
              '정리 (5분)'
            ],
            difficulty: 'challenging',
            expectedProgress: '+8%'
          },
          friday: {
            focus: '새로운 기술 습득',
            duration: '60분',
            exercises: [
              '평영 고급 동작 연습 (30분)',
              '배영 기초 연습 (20분)',
              '정리 (10분)'
            ],
            difficulty: 'moderate',
            expectedProgress: '+6%'
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
      },
      aiRecommendations: [
        '현재 진도에 맞춰 평영 학습을 시작하는 것이 최적입니다',
        '수요일 지구력 훈련으로 전반적인 체력 향상을 기대할 수 있습니다',
        '금요일 새로운 기술 습득으로 동기부여를 유지하세요',
        '2주마다 목표를 달성하여 지속적인 성장을 이어가세요'
      ]
    };

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

// 11. AI 진도 예측 및 최적화 (학생만)
router.get('/progress-prediction', auth, requireRole(['student']), async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    // AI 기반 진도 예측
    const prediction = {
      currentStatus: {
        level: user.studentInfo?.swimmingLevel || 'beginner',
        progress: 65,
        lastUpdate: new Date()
      },
      predictions: {
        shortTerm: {
          '1주': { level: 'beginner', progress: 70, confidence: 95 },
          '2주': { level: 'beginner', progress: 75, confidence: 90 },
          '4주': { level: 'intermediate', progress: 20, confidence: 85 }
        },
        mediumTerm: {
          '2개월': { level: 'intermediate', progress: 50, confidence: 80 },
          '3개월': { level: 'intermediate', progress: 80, confidence: 75 },
          '6개월': { level: 'advanced', progress: 30, confidence: 70 }
        },
        longTerm: {
          '1년': { level: 'advanced', progress: 80, confidence: 65 },
          '2년': { level: 'expert', progress: 50, confidence: 60 }
        }
      },
      optimization: {
        recommendedPracticeTime: '주 3회, 회당 60-75분',
        focusAreas: [
          '자유형 호흡법 완벽 숙련 (2주)',
          '평영 기본 동작 습득 (4주)',
          '지구력 향상 (지속적)',
          '턴 기술 개선 (6주)'
        ],
        potentialBottlenecks: [
          '호흡법 미숙으로 인한 지구력 한계',
          '새로운 영법 학습 시 기존 기술 퇴보',
          '정기적인 연습 부족으로 인한 성장 지연'
        ],
        solutions: [
          '호흡법 전용 연습 시간 확보 (주 2회)',
          '기존 기술 복습 시간 확보 (주 1회)',
          '연습 일정 고정 및 알림 설정'
        ]
      },
      successProbability: {
        '1개월 내 목표 달성': 85,
        '3개월 내 목표 달성': 75,
        '6개월 내 목표 달성': 65,
        '1년 내 목표 달성': 55
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