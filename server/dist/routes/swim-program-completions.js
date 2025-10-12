"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const SwimProgram_1 = __importDefault(require("../models/SwimProgram"));
const User_1 = require("../models/User");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
async function canEditCompletion(currentUserId, targetUserId, program) {
    if (currentUserId === targetUserId) {
        return true;
    }
    if (program.createdBy && program.createdBy.toString() === currentUserId) {
        return true;
    }
    const member = await User_1.User.findById(targetUserId);
    if (member && member.assignedInstructor && member.assignedInstructor.toString() === currentUserId) {
        return true;
    }
    if (member && member.assignedGroups && Array.isArray(member.assignedGroups)) {
        for (const group of member.assignedGroups) {
            if (group.instructor && group.instructor.toString() === currentUserId) {
                return true;
            }
        }
    }
    const currentUser = await User_1.User.findById(currentUserId);
    if (currentUser && (currentUser.userType === 'instructor' || currentUser.userType === 'centerAdmin')) {
        return true;
    }
    return false;
}
router.get('/:programId/sessions', auth_1.authMiddleware, async (req, res, next) => {
    try {
        const { programId } = req.params;
        const currentUserId = req.user?._id;
        const program = await SwimProgram_1.default.findById(programId);
        if (!program) {
            return res.status(404).json({
                success: false,
                message: '프로그램을 찾을 수 없습니다'
            });
        }
        const canEdit = await canEditCompletion(currentUserId, program.athleteId ? program.athleteId.toString() : currentUserId, program);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const sessions = program.content.sessions.map((session, index) => {
            const sessionDate = session.date ? new Date(session.date) : null;
            let status = 'upcoming';
            if (sessionDate) {
                if (sessionDate <= today) {
                    status = session.completion ? 'completed' : 'available';
                }
            }
            return {
                sessionIndex: index,
                sessionId: `${programId}_session_${index}`,
                day: session.day,
                date: session.date,
                themeDesc: session.themeDesc,
                status,
                completion: session.completion ? {
                    completionRate: session.completion.completionRate,
                    feeling: session.completion.feeling,
                    inputBy: session.completion.inputBy,
                    inputByRole: session.completion.inputByRole,
                    inputAt: session.completion.inputAt,
                    notes: session.completion.notes
                } : undefined,
                canEdit: canEdit && status === 'available'
            };
        });
        res.json({
            success: true,
            data: {
                programId,
                athleteId: program.athleteId,
                athleteName: program.athleteName,
                sessions
            }
        });
    }
    catch (error) {
        console.error('세션 조회 오류:', error);
        next(error);
    }
});
router.post('/:programId/sessions/:sessionIndex/completion', auth_1.authMiddleware, async (req, res, next) => {
    try {
        const { programId, sessionIndex } = req.params;
        const currentUserId = req.user?._id;
        const { completionType, simpleCompletion, detailedCompletion, inputByRole } = req.body;
        const program = await SwimProgram_1.default.findById(programId);
        if (!program) {
            return res.status(404).json({
                success: false,
                message: '프로그램을 찾을 수 없습니다'
            });
        }
        const canEdit = await canEditCompletion(currentUserId, program.athleteId ? program.athleteId.toString() : currentUserId, program);
        if (!canEdit) {
            return res.status(403).json({
                success: false,
                message: '완료율을 입력할 권한이 없습니다'
            });
        }
        const sessionIdx = parseInt(sessionIndex);
        if (sessionIdx < 0 || sessionIdx >= program.content.sessions.length) {
            return res.status(400).json({
                success: false,
                message: '잘못된 세션 인덱스입니다'
            });
        }
        let completionRate = 0;
        let feeling = 'moderate';
        let notes = '';
        let detailedSets = undefined;
        if (completionType === 'simple' && simpleCompletion) {
            completionRate = simpleCompletion.overallRate;
            feeling = simpleCompletion.feeling || 'moderate';
            notes = simpleCompletion.notes || '';
        }
        else if (completionType === 'detailed' && detailedCompletion) {
            const sets = detailedCompletion.sets || [];
            if (sets.length > 0) {
                const totalPlannedDistance = sets.reduce((sum, set) => {
                    return sum + (set.planned.distance * set.planned.reps);
                }, 0);
                const totalActualDistance = sets.reduce((sum, set) => {
                    return sum + (set.actual.distance * set.actual.reps);
                }, 0);
                completionRate = totalPlannedDistance > 0
                    ? Math.min(Math.round((totalActualDistance / totalPlannedDistance) * 100), 100)
                    : 0;
                console.log('📊 백엔드 완료율 계산:', {
                    totalPlannedDistance,
                    totalActualDistance,
                    completionRate,
                    sets: sets.map((s) => ({
                        planned: s.planned.distance * s.planned.reps,
                        actual: s.actual.distance * s.actual.reps
                    }))
                });
            }
            feeling = detailedCompletion.feeling || 'moderate';
            notes = detailedCompletion.notes || '';
            detailedSets = sets;
        }
        program.content.sessions[sessionIdx].completion = {
            completionRate,
            feeling,
            inputBy: new mongoose_1.default.Types.ObjectId(currentUserId),
            inputByRole: inputByRole || 'self',
            inputAt: new Date(),
            notes,
            detailedSets
        };
        await program.save();
        res.json({
            success: true,
            message: '완료율이 입력되었습니다',
            data: {
                sessionId: `${programId}_session_${sessionIdx}`,
                completion: {
                    completionRate,
                    calculatedFrom: completionType
                }
            }
        });
    }
    catch (error) {
        console.error('완료율 입력 오류:', error);
        next(error);
    }
});
router.get('/:programId/completion-history', auth_1.authMiddleware, async (req, res, next) => {
    try {
        const { programId } = req.params;
        const program = await SwimProgram_1.default.findById(programId);
        if (!program) {
            return res.status(404).json({
                success: false,
                message: '프로그램을 찾을 수 없습니다'
            });
        }
        const completedSessions = program.content.sessions.filter((s) => s.completion);
        const sessions = completedSessions.map((session) => ({
            date: session.date,
            day: session.day,
            completionRate: session.completion.completionRate,
            feeling: session.completion.feeling,
            inputBy: session.completion.inputBy,
            inputByRole: session.completion.inputByRole,
            inputAt: session.completion.inputAt,
            notes: session.completion.notes
        }));
        const avgCompletionRate = completedSessions.length > 0
            ? Math.round(completedSessions.reduce((sum, s) => sum + s.completion.completionRate, 0) / completedSessions.length)
            : 0;
        let trend = 'stable';
        if (completedSessions.length >= 3) {
            const recent = completedSessions.slice(-3);
            const rates = recent.map((s) => s.completion.completionRate);
            const isImproving = rates[2] > rates[0] && rates[1] >= rates[0];
            const isDeclining = rates[2] < rates[0] && rates[1] <= rates[2];
            if (isImproving)
                trend = 'improving';
            else if (isDeclining)
                trend = 'declining';
        }
        let nextIntensity = 1.0;
        let nextVolume = 1.0;
        let reason = '';
        if (avgCompletionRate >= 90) {
            nextIntensity = 1.03;
            nextVolume = 1.03;
            reason = '완료율이 우수합니다. 강도와 볼륨을 3% 증가시킬 수 있습니다.';
        }
        else if (avgCompletionRate >= 80) {
            nextIntensity = 1.0;
            nextVolume = 1.0;
            reason = '완료율이 양호합니다. 현재 강도를 유지하세요.';
        }
        else if (avgCompletionRate >= 70) {
            nextIntensity = 0.97;
            nextVolume = 0.95;
            reason = '완료율이 다소 낮습니다. 강도를 3%, 볼륨을 5% 감소시키는 것을 권장합니다.';
        }
        else {
            nextIntensity = 0.90;
            nextVolume = 0.85;
            reason = '완료율이 낮습니다. 강도와 볼륨을 크게 줄여 기초를 다시 다지세요.';
        }
        res.json({
            success: true,
            data: {
                programId,
                athleteId: program.athleteId,
                completedSessions: completedSessions.length,
                totalSessions: program.content.sessions.length,
                avgCompletionRate,
                trend,
                sessions,
                recommendation: {
                    nextIntensity,
                    nextVolume,
                    reason,
                    scientificBasis: [
                        'TRIMP (Training Impulse) 모델',
                        'Banister Fitness-Fatigue 모델',
                        '점진적 과부하 원칙'
                    ]
                }
            }
        });
    }
    catch (error) {
        console.error('완료율 이력 조회 오류:', error);
        next(error);
    }
});
router.get('/athlete/:athleteId/incomplete-sessions', auth_1.authMiddleware, async (req, res, next) => {
    try {
        const { athleteId } = req.params;
        const currentUserId = req.user?._id;
        const programs = await SwimProgram_1.default.find({
            athleteId: new mongoose_1.default.Types.ObjectId(athleteId)
        }).sort({ createdAt: -1 }).limit(10);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const incompleteSessions = [];
        for (const program of programs) {
            const canEdit = await canEditCompletion(currentUserId, athleteId, program);
            program.content.sessions.forEach((session, index) => {
                const sessionDate = session.date ? new Date(session.date) : null;
                if (sessionDate && sessionDate <= today && !session.completion) {
                    const daysAgo = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
                    incompleteSessions.push({
                        programId: program._id,
                        sessionIndex: index,
                        athleteName: program.athleteName,
                        session: {
                            sessionId: `${program._id}_session_${index}`,
                            day: session.day,
                            date: session.date,
                            daysAgo
                        },
                        canEdit
                    });
                }
            });
        }
        res.json({
            success: true,
            data: {
                incompleteSessions
            }
        });
    }
    catch (error) {
        console.error('미입력 세션 조회 오류:', error);
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=swim-program-completions.js.map