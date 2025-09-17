"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const HealthConfig_1 = require("../models/HealthConfig");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/', auth_1.authMiddleware, (0, auth_1.requireRole)(['superAdmin']), async (req, res) => {
    try {
        console.log('🔍 건강정보 설정 조회 요청');
        const healthConfig = await HealthConfig_1.HealthConfig.findOne({ isActive: true })
            .populate('createdBy', 'name userType')
            .populate('updatedBy', 'name userType')
            .sort({ version: -1 });
        if (!healthConfig) {
            const defaultConfig = await createDefaultHealthConfig(req.user._id);
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
    }
    catch (error) {
        console.error('건강정보 설정 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '건강정보 설정을 조회할 수 없습니다.'
        });
    }
});
router.put('/', auth_1.authMiddleware, (0, auth_1.requireRole)(['superAdmin']), async (req, res) => {
    try {
        console.log('🔄 건강정보 설정 업데이트 요청');
        const { healthFields, normalRanges, exerciseRules, aiConfig, privacySettings } = req.body;
        const userId = req.user._id;
        let healthConfig = await HealthConfig_1.HealthConfig.findOne({ isActive: true });
        if (!healthConfig) {
            healthConfig = new HealthConfig_1.HealthConfig({
                version: '1.0.0',
                healthFields: healthFields || [],
                normalRanges: normalRanges || [],
                exerciseRules: exerciseRules || [],
                aiConfig: aiConfig || {},
                privacySettings: privacySettings || {},
                createdBy: userId,
                updatedBy: userId
            });
        }
        else {
            if (healthFields)
                healthConfig.healthFields = healthFields;
            if (normalRanges)
                healthConfig.normalRanges = normalRanges;
            if (exerciseRules)
                healthConfig.exerciseRules = exerciseRules;
            if (aiConfig)
                healthConfig.aiConfig = { ...healthConfig.aiConfig, ...aiConfig };
            if (privacySettings)
                healthConfig.privacySettings = { ...healthConfig.privacySettings, ...privacySettings };
            healthConfig.updatedBy = userId;
        }
        await healthConfig.save();
        res.json({
            success: true,
            message: '건강정보 설정이 업데이트되었습니다.',
            data: healthConfig
        });
    }
    catch (error) {
        console.error('건강정보 설정 업데이트 오류:', error);
        res.status(500).json({
            success: false,
            message: '건강정보 설정을 업데이트할 수 없습니다.'
        });
    }
});
router.post('/fields', auth_1.authMiddleware, (0, auth_1.requireRole)(['superAdmin']), async (req, res) => {
    try {
        console.log('➕ 건강정보 항목 추가 요청');
        const { name, type, unit, required, category, description } = req.body;
        const userId = req.user._id;
        if (!name || !type) {
            return res.status(400).json({
                success: false,
                message: '항목명과 타입은 필수입니다.'
            });
        }
        let healthConfig = await HealthConfig_1.HealthConfig.findOne({ isActive: true });
        if (!healthConfig) {
            healthConfig = await createDefaultHealthConfig(userId);
        }
        const newFieldId = `field_${Date.now()}`;
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
    }
    catch (error) {
        console.error('건강정보 항목 추가 오류:', error);
        res.status(500).json({
            success: false,
            message: '건강정보 항목을 추가할 수 없습니다.'
        });
    }
});
router.put('/fields/:fieldId', auth_1.authMiddleware, (0, auth_1.requireRole)(['superAdmin']), async (req, res) => {
    try {
        console.log('🔄 건강정보 항목 수정 요청');
        const { fieldId } = req.params;
        const updateData = req.body;
        const userId = req.user._id;
        const healthConfig = await HealthConfig_1.HealthConfig.findOne({ isActive: true });
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
    }
    catch (error) {
        console.error('건강정보 항목 수정 오류:', error);
        res.status(500).json({
            success: false,
            message: '건강정보 항목을 수정할 수 없습니다.'
        });
    }
});
router.put('/ai', auth_1.authMiddleware, (0, auth_1.requireRole)(['superAdmin']), async (req, res) => {
    try {
        console.log('🤖 AI 알고리즘 설정 업데이트 요청');
        const aiConfigData = req.body;
        const userId = req.user._id;
        let healthConfig = await HealthConfig_1.HealthConfig.findOne({ isActive: true });
        if (!healthConfig) {
            healthConfig = await createDefaultHealthConfig(userId);
        }
        healthConfig.aiConfig = {
            ...healthConfig.aiConfig,
            ...aiConfigData,
            lastUpdated: new Date()
        };
        healthConfig.updatedBy = userId;
        await healthConfig.save();
        res.json({
            success: true,
            message: 'AI 알고리즘 설정이 업데이트되었습니다.',
            data: healthConfig.aiConfig
        });
    }
    catch (error) {
        console.error('AI 알고리즘 설정 업데이트 오류:', error);
        res.status(500).json({
            success: false,
            message: 'AI 알고리즘 설정을 업데이트할 수 없습니다.'
        });
    }
});
router.get('/permissions', auth_1.authMiddleware, (0, auth_1.requireRole)(['centerAdmin', 'instructor']), async (req, res) => {
    try {
        console.log('🔑 건강정보 권한 조회 요청');
        const userType = req.user.userType;
        const healthConfig = await HealthConfig_1.HealthConfig.findOne({ isActive: true });
        if (!healthConfig) {
            return res.status(404).json({
                success: false,
                message: '건강정보 설정을 찾을 수 없습니다.'
            });
        }
        const userPermissions = healthConfig.permissions[userType] || [];
        const accessibleFields = healthConfig.healthFields.filter(field => field.isActive && userPermissions.includes(`view_${field.id}`));
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
    }
    catch (error) {
        console.error('건강정보 권한 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '건강정보 권한을 조회할 수 없습니다.'
        });
    }
});
async function createDefaultHealthConfig(createdBy) {
    const defaultConfig = new HealthConfig_1.HealthConfig({
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
exports.default = router;
//# sourceMappingURL=health-config.js.map