/**
 * 🏥 JJ Swim Lab - 건강정보 설정 API 라우트
 * 
 * 📋 **라우트 목적**
 * - 최고관리자가 건강정보 시스템의 모든 설정을 관리하는 API
 * - 건강정보 항목, 정상범주, 운동추천 규칙, AI 알고리즘 설정
 * - 권한별 건강정보 접근 제어 및 개인정보 보호 설정
 * 
 * 🔄 **주요 기능**
 * - 건강정보 설정 조회/생성/수정/삭제
 * - 건강정보 항목 관리 (추가/수정/삭제/순서 변경)
 * - 정상범주 설정 (연령대별, 성별 구분)
 * - 운동 추천 규칙 관리
 * - AI 알고리즘 파라미터 조정
 * - 개인정보 보호 설정 관리
 * 
 * 🗄️ **데이터 연동**
 * - HealthConfig 모델과 연동
 * - User 모델과 연동 (권한 확인)
 * - 인증 미들웨어와 연동
 * 
 * 🛠️ **필요한 설치 파일**
 * - Express.js
 * - Mongoose
 * - 인증 미들웨어 (authMiddleware, requireRole)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 최고관리자 권한 확인 필수
 * 2. 의료 데이터의 정확성 검증
 * 3. 개인정보 보호법 준수
 * 4. AI 알고리즘 안전성 검증
 * 5. 설정 변경 이력 추적
 * 
 * 📅 **개발 히스토리**
 * - 2025-01-13: 초기 건강정보 설정 API 구현
 * - 2025-01-13: 권한별 접근 제어 추가
 * - 2025-01-13: AI 알고리즘 설정 API 추가
 */

import express, { Request, Response } from 'express';
import { HealthConfig } from '../models/HealthConfig';
import { authMiddleware, requireRole } from '../middleware/auth';
import { EvidenceBasedWeightSystem } from '../utils/EvidenceBasedWeights';

const router = express.Router();

// 인터페이스 정의
interface AuthRequest extends Request {
  user?: any;
}

/**
 * 건강정보 설정 조회 (최고관리자 전용)
 * GET /api/health-config
 */
router.get('/', authMiddleware, requireRole(['superAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    console.log('🔍 건강정보 설정 조회 요청');

    const healthConfig = await HealthConfig.findOne({ isActive: true })
      .populate('createdBy', 'name userType')
      .populate('updatedBy', 'name userType')
      .sort({ version: -1 });

    if (!healthConfig) {
      // 기본 설정 생성
      const defaultConfig = await createDefaultHealthConfig((req as any).user._id);
      
      return res.json({
        success: true,
        message: '기본 건강정보 설정이 생성되었습니다.',
        data: defaultConfig
      });
    }

    res.json({
      success: true,
      message: '건강정보 설정 조회 성공',
      data: healthConfig
    });

  } catch (error) {
    console.error('건강정보 설정 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '건강정보 설정을 조회할 수 없습니다.'
    });
  }
});

/**
 * 건강정보 설정 업데이트 (최고관리자 전용)
 * PUT /api/health-config
 */
router.put('/', authMiddleware, requireRole(['superAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    console.log('🔄 건강정보 설정 업데이트 요청');

    const { healthFields, normalRanges, exerciseRules, aiConfig, privacySettings } = req.body;
    const userId = (req as any).user._id;

    let healthConfig = await HealthConfig.findOne({ isActive: true });

    if (!healthConfig) {
      // 새로운 설정 생성
      healthConfig = new HealthConfig({
        version: '1.0.0',
        healthFields: healthFields || [],
        normalRanges: normalRanges || [],
        exerciseRules: exerciseRules || [],
        aiConfig: aiConfig || {},
        privacySettings: privacySettings || {},
        createdBy: userId,
        updatedBy: userId
      });
    } else {
      // 기존 설정 업데이트
      if (healthFields) healthConfig.healthFields = healthFields;
      if (normalRanges) healthConfig.normalRanges = normalRanges;
      if (exerciseRules) healthConfig.exerciseRules = exerciseRules;
      if (aiConfig) healthConfig.aiConfig = { ...healthConfig.aiConfig, ...aiConfig };
      if (privacySettings) healthConfig.privacySettings = { ...healthConfig.privacySettings, ...privacySettings };
      healthConfig.updatedBy = userId;
    }

    await healthConfig.save();

    res.json({
      success: true,
      message: '건강정보 설정이 업데이트되었습니다.',
      data: healthConfig
    });

  } catch (error) {
    console.error('건강정보 설정 업데이트 오류:', error);
    res.status(500).json({
      success: false,
      message: '건강정보 설정을 업데이트할 수 없습니다.'
    });
  }
});

/**
 * 건강정보 항목 추가 (최고관리자 전용)
 * POST /api/health-config/fields
 */
router.post('/fields', authMiddleware, requireRole(['superAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    console.log('➕ 건강정보 항목 추가 요청');

    const { name, type, unit, required, category, description } = req.body;
    const userId = (req as any).user._id;

    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: '항목명과 타입은 필수입니다.'
      });
    }

    let healthConfig = await HealthConfig.findOne({ isActive: true });

    if (!healthConfig) {
      healthConfig = await createDefaultHealthConfig(userId);
    }

    // 새 항목 ID 생성
    const newFieldId = `field_${Date.now()}`;
    
    // 표시 순서 계산
    const maxOrder = healthConfig.healthFields.length > 0 
      ? Math.max(...healthConfig.healthFields.map(f => f.displayOrder)) 
      : 0;

    const newField = {
      id: newFieldId,
      name,
      type,
      unit: unit || '',
      required: required || false,
      category: category || 'custom',
      description: description || '',
      isActive: true,
      displayOrder: maxOrder + 1
    };

    healthConfig.healthFields.push(newField);
    healthConfig.updatedBy = userId;
    await healthConfig.save();

    res.json({
      success: true,
      message: '건강정보 항목이 추가되었습니다.',
      data: newField
    });

  } catch (error) {
    console.error('건강정보 항목 추가 오류:', error);
    res.status(500).json({
      success: false,
      message: '건강정보 항목을 추가할 수 없습니다.'
    });
  }
});

/**
 * 건강정보 항목 수정 (최고관리자 전용)
 * PUT /api/health-config/fields/:fieldId
 */
router.put('/fields/:fieldId', authMiddleware, requireRole(['superAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    console.log('🔄 건강정보 항목 수정 요청');

    const { fieldId } = req.params;
    const updateData = req.body;
    const userId = (req as any).user._id;

    const healthConfig = await HealthConfig.findOne({ isActive: true });

    if (!healthConfig) {
      return res.status(404).json({
        success: false,
        message: '건강정보 설정을 찾을 수 없습니다.'
      });
    }

    const fieldIndex = healthConfig.healthFields.findIndex(f => f.id === fieldId);

    if (fieldIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '해당 건강정보 항목을 찾을 수 없습니다.'
      });
    }

    // 항목 업데이트
    healthConfig.healthFields[fieldIndex] = {
      ...healthConfig.healthFields[fieldIndex],
      ...updateData
    };

    healthConfig.updatedBy = userId;
    await healthConfig.save();

    res.json({
      success: true,
      message: '건강정보 항목이 수정되었습니다.',
      data: healthConfig.healthFields[fieldIndex]
    });

  } catch (error) {
    console.error('건강정보 항목 수정 오류:', error);
    res.status(500).json({
      success: false,
      message: '건강정보 항목을 수정할 수 없습니다.'
    });
  }
});

/**
 * 건강정보 항목 삭제 (최고관리자 전용)
 * DELETE /api/health-config/fields/:fieldId
 */
router.delete('/fields/:fieldId', authMiddleware, requireRole(['superAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    console.log('🗑️ 건강정보 항목 삭제 요청');

    const { fieldId } = req.params;
    const userId = (req as any).user._id;

    const healthConfig = await HealthConfig.findOne({ isActive: true });

    if (!healthConfig) {
      return res.status(404).json({
        success: false,
        message: '건강정보 설정을 찾을 수 없습니다.'
      });
    }

    const fieldIndex = healthConfig.healthFields.findIndex(f => f.id === fieldId);

    if (fieldIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '해당 건강정보 항목을 찾을 수 없습니다.'
      });
    }

    // 항목 삭제
    const deletedField = healthConfig.healthFields[fieldIndex];
    healthConfig.healthFields.splice(fieldIndex, 1);

    healthConfig.updatedBy = userId;
    await healthConfig.save();

    res.json({
      success: true,
      message: '건강정보 항목이 삭제되었습니다.',
      data: deletedField
    });

  } catch (error) {
    console.error('건강정보 항목 삭제 오류:', error);
    res.status(500).json({
      success: false,
      message: '건강정보 항목을 삭제할 수 없습니다.'
    });
  }
});

/**
 * AI 알고리즘 설정 업데이트 (최고관리자 전용) - 가중치 수정 차단
 * PUT /api/health-config/ai
 */
router.put('/ai', authMiddleware, requireRole(['superAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    console.log('🤖 AI 알고리즘 설정 업데이트 요청');

    const aiConfigData = req.body;
    const userId = (req as any).user._id;

    // 가중치 수정 시도 감지 및 차단
    if (aiConfigData.weights || aiConfigData.parameters?.weights) {
      console.log('🚫 가중치 수정 시도 차단됨');
      return res.status(403).json({
        success: false,
        message: '가중치는 과학적 근거 없이는 수정할 수 없습니다.',
        error: 'WEIGHT_MODIFICATION_BLOCKED',
        requiredSteps: [
          '과학적 근거 문서 제출 (연구 논문, 가이드라인)',
          '의학 전문가 승인',
          '수정 사유 상세 설명 (최소 50자)',
          '임상 검증 결과 제시',
          '시스템 관리자 최종 승인'
        ],
        currentWeights: 'EvidenceBasedWeightSystem에서 관리됨'
      });
    }

    let healthConfig = await HealthConfig.findOne({ isActive: true });

    if (!healthConfig) {
      healthConfig = await createDefaultHealthConfig(userId);
    }

    // 가중치를 제외한 다른 설정만 업데이트
    const { weights, parameters, ...allowedConfig } = aiConfigData;
    void weights;
    const safeParameters = parameters ? {
      ...parameters,
      weights: undefined // 가중치 제거
    } : undefined;

    healthConfig.aiConfig = {
      ...healthConfig.aiConfig,
      ...allowedConfig,
      ...(safeParameters && { parameters: safeParameters }),
      lastUpdated: new Date()
    };

    healthConfig.updatedBy = userId;
    await healthConfig.save();

    res.json({
      success: true,
      message: 'AI 알고리즘 설정이 업데이트되었습니다. (가중치는 과학적 근거 기반으로 보호됨)',
      data: healthConfig.aiConfig
    });

  } catch (error) {
    console.error('AI 알고리즘 설정 업데이트 오류:', error);
    res.status(500).json({
      success: false,
      message: 'AI 알고리즘 설정을 업데이트할 수 없습니다.'
    });
  }
});

/**
 * 건강정보 권한 설정 (센터관리자, 강사용)
 * GET /api/health-config/permissions
 */
router.get('/permissions', authMiddleware, requireRole(['centerAdmin', 'instructor']), async (req: AuthRequest, res: Response) => {
  try {
    console.log('🔑 건강정보 권한 조회 요청');

    const userType = (req as any).user.userType;
    const healthConfig = await HealthConfig.findOne({ isActive: true });

    if (!healthConfig) {
      return res.status(404).json({
        success: false,
        message: '건강정보 설정을 찾을 수 없습니다.'
      });
    }

    // 사용자 타입별 권한 확인
    const userPermissions = healthConfig.permissions[userType] || [];
    
    // 건강정보 항목 중 해당 권한으로 접근 가능한 것만 반환
    const accessibleFields = healthConfig.healthFields.filter(field => 
      field.isActive && userPermissions.includes(`view_${field.id}`)
    );

    res.json({
      success: true,
      message: '건강정보 권한 조회 성공',
      data: {
        userType,
        permissions: userPermissions,
        accessibleFields,
        privacySettings: healthConfig.privacySettings
      }
    });

  } catch (error) {
    console.error('건강정보 권한 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '건강정보 권한을 조회할 수 없습니다.'
    });
  }
});

/**
 * 기본 건강정보 설정 생성 함수
 */
async function createDefaultHealthConfig(createdBy: string) {
  const defaultConfig = new HealthConfig({
    version: '1.0.0',
    healthFields: [
      {
        id: 'height',
        name: '키',
        type: 'number',
        unit: 'cm',
        required: true,
        category: 'basic',
        description: '신장 (센티미터)',
        isActive: true,
        displayOrder: 1
      },
      {
        id: 'weight',
        name: '몸무게',
        type: 'number',
        unit: 'kg',
        required: true,
        category: 'basic',
        description: '체중 (킬로그램)',
        isActive: true,
        displayOrder: 2
      },
      {
        id: 'bloodType',
        name: '혈액형',
        type: 'select',
        required: false,
        category: 'medical',
        description: 'ABO 혈액형',
        isActive: true,
        displayOrder: 3
      },
      {
        id: 'allergies',
        name: '알레르기',
        type: 'string',
        required: false,
        category: 'medical',
        description: '알려진 알레르기 반응',
        isActive: true,
        displayOrder: 4
      }
    ],
    normalRanges: [
      {
        fieldId: 'height',
        ageGroups: [
          {
            minAge: 20,
            maxAge: 65,
            gender: 'male',
            normalRange: { min: 160, max: 185 },
            riskLevels: [
              {
                level: 'normal',
                range: { min: 160, max: 185 },
                description: '정상 범위',
                recommendations: ['규칙적인 운동 유지']
              }
            ]
          }
        ]
      }
    ],
    exerciseRules: [],
    aiConfig: {
      modelVersion: '1.0.0',
      parameters: {
        learningRate: 0.001,
        confidence: 0.8,
        accuracy: 0.85,
        maxRecommendations: 5,
        updateFrequency: 7
      },
      features: {
        personalizedRecommendations: true,
        riskAssessment: true,
        progressTracking: true,
        goalSetting: true,
        socialComparison: false
      },
      thresholds: {
        riskAlert: 0.7,
        progressAlert: 0.8,
        goalAchievement: 0.9
      },
      lastUpdated: new Date(),
      lastTrainedAt: new Date()
    },
    privacySettings: {
      defaultVisibility: 'center',
      allowUserControl: true,
      dataRetentionDays: 365,
      anonymizeAfterDays: 1825
    },
    permissions: {
      superAdmin: ['*'],
      centerAdmin: ['view_basic', 'view_vital'],
      instructor: ['view_basic', 'view_vital'],
      student: ['view_own', 'edit_own', 'privacy_control']
    },
    createdBy,
    updatedBy: createdBy
  });

  await defaultConfig.save();
  return defaultConfig;
}

// 과학적 근거 기반 가중치 조회
router.get('/evidence-based-weights', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const weights = EvidenceBasedWeightSystem.generateEvidenceBasedWeights();
    const validation = EvidenceBasedWeightSystem.validateWeights(weights);
    const algorithmEvidence = EvidenceBasedWeightSystem.getAlgorithmEvidence();

    res.json({
      success: true,
      data: {
        weights,
        validation,
        algorithmEvidence,
        lastUpdated: new Date().toISOString(),
        source: 'EvidenceBasedWeightSystem'
      }
    });
  } catch (error) {
    console.error('과학적 근거 기반 가중치 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '과학적 근거 기반 가중치 조회 중 오류가 발생했습니다.'
    });
  }
});

// 가중치 수정 권한 확인
router.post('/validate-weight-modification', authMiddleware, requireRole(['superAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const { modificationReason, evidenceProvided, adminLevel } = req.body;

    const validation = EvidenceBasedWeightSystem.canModifyWeights(
      adminLevel || 'superAdmin',
      modificationReason,
      evidenceProvided
    );

    res.json({
      success: true,
      data: validation
    });
  } catch (error) {
    console.error('가중치 수정 권한 확인 오류:', error);
    res.status(500).json({
      success: false,
      message: '가중치 수정 권한 확인 중 오류가 발생했습니다.'
    });
  }
});

// 알고리즘별 과학적 근거 조회
router.get('/algorithm-evidence', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const algorithmEvidence = EvidenceBasedWeightSystem.getAlgorithmEvidence();

    res.json({
      success: true,
      data: algorithmEvidence
    });
  } catch (error) {
    console.error('알고리즘 과학적 근거 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '알고리즘 과학적 근거 조회 중 오류가 발생했습니다.'
    });
  }
});

export default router;
