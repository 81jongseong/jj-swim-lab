"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const logger_1 = require("../utils/logger");
const SwimProgram_1 = __importDefault(require("../models/SwimProgram"));
const PersonalProgramAdjustment_1 = __importDefault(require("../models/PersonalProgramAdjustment"));
const User_1 = require("../models/User");
const GroupClass = require('../models/GroupClass').default;
const Course_1 = require("../models/Course");
const router = express_1.default.Router();
router.post('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const { groupClassId, courseId, programData } = req.body;
        if ((!groupClassId && !courseId) || !programData) {
            return res.status(400).json({
                success: false,
                message: '단체반 또는 강습 과정 ID와 프로그램 데이터가 필요합니다.'
            });
        }
        let groupClass = groupClassId ? await GroupClass.findById(groupClassId) : null;
        let fallbackCourse = null;
        let resolvedGroupClassId = groupClassId;
        let resolvedClassName = groupClass?.className;
        let resolvedCenterId = groupClass?.centerId;
        let resolvedInstructorId = groupClass?.instructorId;
        let resolvedStudents = groupClass?.students || [];
        if (!groupClass) {
            if (!courseId) {
                return res.status(404).json({
                    success: false,
                    message: '단체반을 찾을 수 없습니다.'
                });
            }
            fallbackCourse = await Course_1.Course.findById(courseId);
            if (!fallbackCourse) {
                return res.status(404).json({
                    success: false,
                    message: '단체반을 찾을 수 없습니다.'
                });
            }
            resolvedGroupClassId = courseId;
            resolvedClassName = fallbackCourse.classInfo?.className || fallbackCourse.name || '단체반';
            resolvedCenterId = fallbackCourse.centerId;
            resolvedInstructorId =
                fallbackCourse.instructorId ||
                    fallbackCourse.instructor ||
                    (fallbackCourse.teacherId || fallbackCourse.teacher);
            resolvedStudents = (fallbackCourse.enrolledStudents || []).map((enrollment) => ({
                userId: enrollment?.student || enrollment?.studentId,
                status: (enrollment?.status || 'active')
            }));
            groupClass = {
                _id: courseId,
                className: resolvedClassName,
                centerId: resolvedCenterId,
                instructorId: resolvedInstructorId,
                students: resolvedStudents
            };
        }
        console.log(`📚 단체반 프로그램 생성 시작: ${resolvedClassName}`);
        const newProgram = new SwimProgram_1.default({
            groupClassId: resolvedGroupClassId,
            groupClassName: resolvedClassName,
            centerId: resolvedCenterId,
            programType: programData.programType || 'weekly',
            programScope: 'group',
            params: programData.params,
            content: programData.content,
            usedMethodIds: programData.usedMethodIds || []
        });
        await newProgram.save();
        console.log(`✅ 단체반 공통 프로그램 생성 완료: ${newProgram._id}`);
        const activeStudents = resolvedStudents.filter((s) => (s?.status || 'active') === 'active');
        console.log(`👥 활성 학생 ${activeStudents.length}명에 대한 개인별 조정사항 생성 시작`);
        const adjustmentPromises = activeStudents.map(async (student) => {
            try {
                const user = await User_1.User.findById(student.userId);
                if (!user || !user.studentInfo) {
                    console.warn(`⚠️ 학생 정보 없음: ${student.userId}`);
                    return null;
                }
                const adjustment = await generatePersonalAdjustment(newProgram._id, user._id, resolvedGroupClassId, user, programData);
                console.log(`  ✓ ${user.name}: 조정사항 생성 완료`);
                return adjustment;
            }
            catch (error) {
                (0, logger_1.logError)(`조정사항 생성 실패: ${student.userId}`, error);
                return null;
            }
        });
        const adjustments = await Promise.all(adjustmentPromises);
        const successCount = adjustments.filter(a => a !== null).length;
        console.log(`🎯 개인별 조정사항 생성 완료: ${successCount}/${activeStudents.length}명`);
        return res.json({
            success: true,
            message: `단체반 프로그램 생성 완료! (${successCount}/${activeStudents.length}명의 개인별 조정사항 생성됨)`,
            data: {
                programId: newProgram._id,
                groupClassName: resolvedClassName,
                studentCount: activeStudents.length,
                adjustmentCount: successCount,
                usedFallbackCourse: Boolean(fallbackCourse)
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('단체반 프로그램 생성 실패', error);
        return res.status(500).json({
            success: false,
            message: '단체반 프로그램 생성에 실패했습니다.',
            error: error.message
        });
    }
});
router.get('/:groupClassId', auth_1.authMiddleware, async (req, res) => {
    try {
        const { groupClassId } = req.params;
        const programs = await SwimProgram_1.default.find({
            groupClassId,
            programScope: 'group'
        }).sort({ createdAt: -1 });
        return res.json({
            success: true,
            data: {
                programs,
                total: programs.length
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('단체반 프로그램 조회 실패', error);
        return res.status(500).json({
            success: false,
            message: '프로그램 목록 조회에 실패했습니다.'
        });
    }
});
router.get('/:programId/my-adjustment', auth_1.authMiddleware, async (req, res) => {
    try {
        const { programId } = req.params;
        const userId = req.user._id;
        const program = await SwimProgram_1.default.findById(programId);
        if (!program) {
            return res.status(404).json({
                success: false,
                message: '프로그램을 찾을 수 없습니다.'
            });
        }
        const adjustment = await PersonalProgramAdjustment_1.default.findOne({
            programId,
            userId
        });
        if (adjustment && !adjustment.viewedByMember) {
            adjustment.viewedByMember = true;
            adjustment.viewedAt = new Date();
            await adjustment.save();
        }
        return res.json({
            success: true,
            data: {
                program,
                adjustment
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('개인별 조정사항 조회 실패', error);
        return res.status(500).json({
            success: false,
            message: '조정사항 조회에 실패했습니다.'
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
        globalPaceReason = '어깨 질환으로 인한 페이스 조정';
        avoidStrokes.push('butterfly');
        avoidEquipment.push('paddles', 'large_paddles');
        warnings.push({
            type: 'health',
            severity: 'warning',
            message: '⚠️ 어깨에 무리가 가지 않도록 팔 동작 범위를 축소하세요. 통증이 느껴지면 즉시 중단하세요.',
            relatedCondition: 'shoulder_impingement'
        });
    }
    if (healthConditions.includes('knee_pain') || healthConditions.includes('patellofemoral_pain')) {
        avoidStrokes.push('breaststroke');
        warnings.push({
            type: 'health',
            severity: 'warning',
            message: '⚠️ 무릎 통증: 평영 동작을 피하고, 킥보드 대신 풀부이를 사용하세요.',
            relatedCondition: 'knee_pain'
        });
    }
    if (healthConditions.includes('asthma') || healthConditions.includes('chlorine_sensitivity')) {
        globalPaceAdjustment += 5;
        globalPaceReason = globalPaceReason
            ? `${globalPaceReason}, 호흡기 질환으로 인한 추가 조정`
            : '호흡기 질환으로 인한 페이스 조정';
        avoidDrills.push('hypoxic', 'underwater', 'breath_control');
        warnings.push({
            type: 'health',
            severity: 'critical',
            message: '🚨 호흡기 주의: 고강도 세트는 건너뛰고, 충분한 휴식을 취하세요. 호흡 곤란 시 즉시 중단하세요.',
            relatedCondition: 'asthma'
        });
    }
    if (conditionIds.includes('피곤함') || conditionIds.includes('매우 피곤함')) {
        globalPaceAdjustment += 5;
        globalPaceReason = globalPaceReason
            ? `${globalPaceReason}, 피로도 고려`
            : '피로도를 고려한 페이스 조정';
        warnings.push({
            type: 'condition',
            severity: 'info',
            message: '💡 오늘은 피곤한 상태입니다. 무리하지 말고 여유있게 진행하세요.',
            relatedCondition: 'fatigue'
        });
    }
    const sessionAdjustments = programData.content.sessions.map((session) => ({
        sessionDate: session.date || '',
        dayOfWeek: session.day,
        paceAdjustment: globalPaceAdjustment,
        restAdjustment: healthConditions.length > 0 ? 10 : 0,
        skipBlocks: [],
        modifiedBlocks: [],
        notes: `${user.name}님을 위한 맞춤 조정: ${globalPaceReason || '기본 프로그램 유지'}`
    }));
    const adjustment = new PersonalProgramAdjustment_1.default({
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
//# sourceMappingURL=group-programs.js.map