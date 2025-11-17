"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const SwimProgram_1 = __importDefault(require("../models/SwimProgram"));
const User_1 = require("../models/User");
const GroupClass = require('../models/GroupClass').default;
const router = express_1.default.Router();
router.post('/generate', auth_1.authMiddleware, async (req, res) => {
    try {
        const { athleteProfile, programData } = req.body;
        console.log('🚀 통합 프로그램 생성 요청:', athleteProfile.name);
        const isGroupClass = !!athleteProfile.groupClassId;
        if (isGroupClass) {
            console.log(`📚 단체반 프로그램: ${athleteProfile.groupClassName}`);
            const groupClass = await GroupClass.findById(athleteProfile.groupClassId);
            if (!groupClass) {
                return res.status(404).json({
                    success: false,
                    message: '단체반을 찾을 수 없습니다.'
                });
            }
            const newProgram = new SwimProgram_1.default({
                groupClassId: groupClass._id,
                groupClassName: groupClass.className,
                centerId: groupClass.centerId,
                programType: programData.programType || 'weekly',
                programScope: 'group',
                params: programData.params,
                content: programData.content,
                usedMethodIds: programData.usedMethodIds || []
            });
            await newProgram.save();
            console.log(`✅ 단체반 공통 프로그램 생성: ${newProgram._id}`);
            const activeStudents = groupClass.students.filter((s) => s.status === 'active');
            let adjustmentCount = 0;
            for (const student of activeStudents) {
                try {
                    const user = await User_1.User.findById(student.userId);
                    if (!user)
                        continue;
                    await generatePersonalAdjustment(newProgram._id, user._id, groupClass._id, user, programData);
                    adjustmentCount++;
                    console.log(`  ✓ ${user.name}: 조정사항 생성`);
                }
                catch (error) {
                    console.error(`  ✗ ${student.userId}: 실패`, error);
                }
            }
            return res.json({
                success: true,
                message: `단체반 프로그램 생성 완료! (${adjustmentCount}명)`,
                programId: newProgram._id,
                isGroupProgram: true,
                adjustmentCount
            });
        }
        else {
            console.log(`🏊 개인 PT 프로그램: ${athleteProfile.name}`);
            const newProgram = new SwimProgram_1.default({
                athleteId: programData.athleteId,
                athleteName: athleteProfile.name,
                centerId: programData.centerId,
                programType: programData.programType || 'weekly',
                programScope: 'individual',
                params: programData.params,
                content: programData.content,
                usedMethodIds: programData.usedMethodIds || []
            });
            await newProgram.save();
            console.log(`✅ 개인 프로그램 생성: ${newProgram._id}`);
            return res.json({
                success: true,
                message: '프로그램이 저장되었습니다.',
                programId: newProgram._id,
                isGroupProgram: false
            });
        }
    }
    catch (error) {
        console.error('❌ 프로그램 생성 실패:', error);
        return res.status(500).json({
            success: false,
            message: '프로그램 생성에 실패했습니다.',
            error: error.message
        });
    }
});
async function generatePersonalAdjustment(programId, userId, groupClassId, user, programData) {
    const healthProfile = user.studentInfo?.healthProfile || {};
    const swimmingProfile = user.studentInfo?.swimmingProfile || {};
    const healthConditions = [
        ...(healthProfile.chronicConditions || []),
        ...(healthProfile.allergies || [])
    ];
    const conditionIds = swimmingProfile.conditionIds || [];
    let globalPaceAdjustment = 0;
    let globalPaceReason = '';
    const warnings = [];
    const avoidStrokes = [];
    const avoidDrills = [];
    const avoidEquipment = [];
    if (healthConditions.includes('shoulder_impingement') || healthConditions.includes('rotator_cuff')) {
        globalPaceAdjustment += 3;
        globalPaceReason = '어깨 질환';
        avoidStrokes.push('butterfly');
        avoidEquipment.push('paddles');
        warnings.push({
            type: 'health',
            severity: 'warning',
            message: '⚠️ 어깨에 무리가 가지 않도록 팔 동작 범위를 축소하세요.'
        });
    }
    if (healthConditions.includes('knee_pain') || healthConditions.includes('patellofemoral_pain')) {
        avoidStrokes.push('breaststroke');
        warnings.push({
            type: 'health',
            severity: 'warning',
            message: '⚠️ 무릎 통증: 평영을 피하고 풀부이를 사용하세요.'
        });
    }
    if (healthConditions.includes('asthma') || healthConditions.includes('chlorine_sensitivity')) {
        globalPaceAdjustment += 5;
        globalPaceReason = globalPaceReason ? `${globalPaceReason}, 호흡기 질환` : '호흡기 질환';
        avoidDrills.push('hypoxic', 'underwater');
        warnings.push({
            type: 'health',
            severity: 'critical',
            message: '🚨 호흡 곤란 시 즉시 중단하세요.'
        });
    }
    const sessionAdjustments = (programData.content.sessions || []).map((session) => ({
        sessionDate: session.date || '',
        dayOfWeek: session.day,
        paceAdjustment: globalPaceAdjustment,
        restAdjustment: healthConditions.length > 0 ? 10 : 0,
        skipBlocks: [],
        modifiedBlocks: [],
        notes: `${user.name}님 맞춤: ${globalPaceReason || '기본 유지'}`
    }));
    const PersonalProgramAdjustment = require('../models/PersonalProgramAdjustment').default;
    const adjustment = new PersonalProgramAdjustment({
        programId,
        userId,
        groupClassId,
        adjustments: {
            globalPaceAdjustment,
            globalPaceReason,
            avoidStrokes,
            avoidDrills,
            avoidEquipment,
            warnings,
            sessionAdjustments
        },
        generatedBy: {
            conditionIds,
            healthConditions,
            currentCondition: 'normal',
            generatedAt: new Date()
        }
    });
    await adjustment.save();
    return adjustment;
}
exports.default = router;
//# sourceMappingURL=unified-program.js.map