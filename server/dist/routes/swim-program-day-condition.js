"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const SwimProgram_1 = __importDefault(require("../models/SwimProgram"));
const User_1 = require("../models/User");
const auth_1 = require("../middleware/auth");
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
router.post('/:programId/sessions/:sessionIdx/day-condition', auth_1.authMiddleware, async (req, res) => {
    try {
        const { programId, sessionIdx } = req.params;
        const { condition, hasPain, painLocation, sleepQuality, stressLevel } = req.body;
        const currentUserId = req.userId;
        if (!currentUserId) {
            return res.status(401).json({ success: false, message: '인증이 필요합니다.' });
        }
        const program = await SwimProgram_1.default.findById(programId);
        if (!program) {
            return res.status(404).json({ success: false, message: '프로그램을 찾을 수 없습니다.' });
        }
        const sessionIndex = parseInt(sessionIdx);
        if (isNaN(sessionIndex) || sessionIndex < 0) {
            return res.status(400).json({ success: false, message: '잘못된 세션 인덱스입니다.' });
        }
        const canEdit = await canEditDayCondition(currentUserId, program);
        if (!canEdit) {
            return res.status(403).json({ success: false, message: '당일 컨디션을 입력할 권한이 없습니다.' });
        }
        const currentUser = await User_1.User.findById(currentUserId);
        const isInstructor = currentUser?.userType === 'instructor' ||
            currentUser?.userType === 'centerAdmin';
        const inputByRole = isInstructor ? 'instructor' : 'self';
        if (!program.content.sessions[sessionIndex]) {
            return res.status(404).json({ success: false, message: '세션을 찾을 수 없습니다.' });
        }
        program.content.sessions[sessionIndex].dayCondition = {
            condition,
            hasPain,
            painLocation,
            sleepQuality,
            stressLevel,
            inputBy: currentUserId,
            inputByRole,
            inputAt: new Date()
        };
        await program.save();
        res.json({
            success: true,
            message: '당일 컨디션이 저장되었습니다.',
            data: {
                sessionIdx: sessionIndex,
                dayCondition: program.content.sessions[sessionIndex].dayCondition
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('당일 컨디션 저장 오류:', error);
        res.status(500).json({
            success: false,
            message: '당일 컨디션 저장에 실패했습니다.',
            error: error.message
        });
    }
});
async function canEditDayCondition(currentUserId, program) {
    if (program.athleteId && program.athleteId.toString() === currentUserId) {
        return true;
    }
    if (program.groupClassId) {
        const currentUser = await User_1.User.findById(currentUserId);
        if (currentUser && currentUser.studentInfo?.assignedGroups) {
            const assignedGroups = currentUser.studentInfo.assignedGroups;
            for (const group of assignedGroups) {
                if (group.groupClass && group.groupClass.toString() === program.groupClassId.toString()) {
                    return true;
                }
            }
        }
    }
    const targetUserId = program.athleteId?.toString();
    if (targetUserId) {
        const member = await User_1.User.findById(targetUserId);
        if (member && member.studentInfo?.assignedInstructors) {
            const instructors = member.studentInfo.assignedInstructors;
            if (instructors.some((inst) => inst.instructor?.toString() === currentUserId)) {
                return true;
            }
        }
        if (member && member.assignedGroups) {
            for (const group of member.assignedGroups) {
                if (group.instructor && group.instructor.toString() === currentUserId) {
                    return true;
                }
            }
        }
    }
    const currentUser = await User_1.User.findById(currentUserId);
    if (currentUser && (currentUser.userType === 'instructor' || currentUser.userType === 'centerAdmin')) {
        return true;
    }
    return false;
}
exports.default = router;
//# sourceMappingURL=swim-program-day-condition.js.map