"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const User = require('../models/User').default;
const TeachingMethod = require('../models/TeachingMethod').default;
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/:userId', auth_1.authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUser = req.user;
        if (currentUser._id.toString() !== userId &&
            currentUser.userType !== 'superAdmin' &&
            currentUser.userType !== 'centerAdmin' &&
            !currentUser.instructorInfo) {
            return res.status(403).json({ error: '진행 상황 조회 권한이 없습니다.' });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
        }
        const teachingProgress = user.studentInfo?.swimmingProfile?.teachingProgress || [];
        return res.status(200).json({
            userId,
            userName: user.name,
            currentLevel: user.studentInfo?.currentLevel || 'beginner',
            teachingProgress
        });
    }
    catch (error) {
        console.error('진행 상황 조회 실패:', error);
        return res.status(500).json({ error: '진행 상황 조회에 실패했습니다.', details: error.message });
    }
});
router.post('/:userId/method/:methodId/step', auth_1.authMiddleware, async (req, res) => {
    try {
        const { userId, methodId } = req.params;
        const { stepId, completed, notes } = req.body;
        const currentUser = req.user;
        if (currentUser._id.toString() !== userId &&
            currentUser.userType !== 'superAdmin' &&
            currentUser.userType !== 'centerAdmin' &&
            !currentUser.instructorInfo) {
            return res.status(403).json({ error: '진행 상황 수정 권한이 없습니다.' });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
        }
        if (!user.studentInfo) {
            user.studentInfo = {};
        }
        if (!user.studentInfo.swimmingProfile) {
            user.studentInfo.swimmingProfile = {};
        }
        if (!user.studentInfo.swimmingProfile.teachingProgress) {
            user.studentInfo.swimmingProfile.teachingProgress = [];
        }
        let progressEntry = user.studentInfo.swimmingProfile.teachingProgress.find((p) => p.methodId.toString() === methodId);
        if (!progressEntry) {
            const method = await TeachingMethod.findById(methodId);
            if (!method) {
                return res.status(404).json({ error: '강습법을 찾을 수 없습니다.' });
            }
            progressEntry = {
                methodId: new mongoose_1.default.Types.ObjectId(methodId),
                methodName: method.name,
                stroke: method.stroke,
                category: method.category,
                completedSteps: [],
                totalSteps: method.steps.length,
                completionRate: 0,
                masteryLevel: 'learning',
                evaluatedBy: currentUser._id,
                evaluatedAt: new Date()
            };
            user.studentInfo.swimmingProfile.teachingProgress.push(progressEntry);
        }
        const stepIndex = progressEntry.completedSteps.indexOf(stepId);
        if (completed && stepIndex === -1) {
            progressEntry.completedSteps.push(stepId);
        }
        else if (!completed && stepIndex !== -1) {
            progressEntry.completedSteps.splice(stepIndex, 1);
        }
        progressEntry.completionRate = Math.round((progressEntry.completedSteps.length / progressEntry.totalSteps) * 100);
        if (progressEntry.completionRate === 100) {
            progressEntry.masteryLevel = 'mastered';
        }
        else if (progressEntry.completionRate >= 75) {
            progressEntry.masteryLevel = 'proficient';
        }
        else if (progressEntry.completionRate >= 30) {
            progressEntry.masteryLevel = 'practicing';
        }
        else {
            progressEntry.masteryLevel = 'learning';
        }
        progressEntry.lastPracticed = new Date();
        progressEntry.evaluatedBy = currentUser._id;
        progressEntry.evaluatedAt = new Date();
        if (notes) {
            progressEntry.notes = notes;
        }
        await user.save();
        return res.status(200).json({
            message: '진행 상황이 업데이트되었습니다.',
            progress: progressEntry
        });
    }
    catch (error) {
        console.error('진행 상황 업데이트 실패:', error);
        return res.status(500).json({ error: '진행 상황 업데이트에 실패했습니다.', details: error.message });
    }
});
router.get('/:userId/next-recommendation', auth_1.authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUser = req.user;
        if (currentUser._id.toString() !== userId &&
            currentUser.userType !== 'superAdmin' &&
            currentUser.userType !== 'centerAdmin' &&
            !currentUser.instructorInfo) {
            return res.status(403).json({ error: '추천 조회 권한이 없습니다.' });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
        }
        const currentLevel = user.studentInfo?.currentLevel || 'beginner';
        const preferredStrokes = user.studentInfo?.swimmingProfile?.preferredStrokes || [];
        const teachingProgress = user.studentInfo?.swimmingProfile?.teachingProgress || [];
        const allMethods = await TeachingMethod.find({
            targetLevel: { $in: [currentLevel, 'all'] },
            isActive: true
        }).sort({ order: 1 });
        const inProgressMethods = teachingProgress.filter((p) => p.completionRate < 100);
        const completedMethodIds = teachingProgress.map((p) => p.methodId.toString());
        const notStartedMethods = allMethods.filter((m) => !completedMethodIds.includes(m._id.toString()));
        let recommendations = [];
        const preferredInProgress = inProgressMethods.filter((p) => preferredStrokes.includes(p.stroke));
        if (preferredInProgress.length > 0) {
            recommendations.push({
                priority: 'high',
                reason: '선호 영법의 진행 중인 강습법',
                methods: preferredInProgress
            });
        }
        const otherInProgress = inProgressMethods
            .filter((p) => !preferredStrokes.includes(p.stroke))
            .sort((a, b) => a.completionRate - b.completionRate);
        if (otherInProgress.length > 0) {
            recommendations.push({
                priority: 'medium',
                reason: '진행 중인 강습법',
                methods: otherInProgress
            });
        }
        const preferredNotStarted = notStartedMethods.filter((m) => preferredStrokes.includes(m.stroke));
        if (preferredNotStarted.length > 0) {
            recommendations.push({
                priority: 'medium',
                reason: '선호 영법의 새로운 강습법',
                methods: preferredNotStarted.map((m) => ({
                    methodId: m._id,
                    methodName: m.name,
                    stroke: m.stroke,
                    category: m.category,
                    totalSteps: m.steps.length,
                    completionRate: 0
                }))
            });
        }
        const otherNotStarted = notStartedMethods.filter((m) => !preferredStrokes.includes(m.stroke));
        if (otherNotStarted.length > 0) {
            recommendations.push({
                priority: 'low',
                reason: '새로운 강습법',
                methods: otherNotStarted.slice(0, 3).map((m) => ({
                    methodId: m._id,
                    methodName: m.name,
                    stroke: m.stroke,
                    category: m.category,
                    totalSteps: m.steps.length,
                    completionRate: 0
                }))
            });
        }
        return res.status(200).json({
            userId,
            userName: user.name,
            currentLevel,
            preferredStrokes,
            recommendations
        });
    }
    catch (error) {
        console.error('추천 조회 실패:', error);
        return res.status(500).json({ error: '추천 조회에 실패했습니다.', details: error.message });
    }
});
router.get('/:userId/summary', auth_1.authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUser = req.user;
        if (currentUser._id.toString() !== userId &&
            currentUser.userType !== 'superAdmin' &&
            currentUser.userType !== 'centerAdmin' &&
            !currentUser.instructorInfo) {
            return res.status(403).json({ error: '요약 조회 권한이 없습니다.' });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
        }
        const currentLevel = user.studentInfo?.currentLevel || 'beginner';
        const teachingProgress = user.studentInfo?.swimmingProfile?.teachingProgress || [];
        const totalMethods = teachingProgress.length;
        const masteredMethods = teachingProgress.filter((p) => p.completionRate === 100).length;
        const inProgressMethods = teachingProgress.filter((p) => p.completionRate > 0 && p.completionRate < 100).length;
        const notStartedMethods = teachingProgress.filter((p) => p.completionRate === 0).length;
        const byStroke = teachingProgress.reduce((acc, p) => {
            if (!acc[p.stroke]) {
                acc[p.stroke] = {
                    total: 0,
                    mastered: 0,
                    avgCompletion: 0
                };
            }
            acc[p.stroke].total++;
            if (p.completionRate === 100)
                acc[p.stroke].mastered++;
            acc[p.stroke].avgCompletion += p.completionRate;
            return acc;
        }, {});
        Object.keys(byStroke).forEach((stroke) => {
            byStroke[stroke].avgCompletion = Math.round(byStroke[stroke].avgCompletion / byStroke[stroke].total);
        });
        const byMastery = {
            learning: teachingProgress.filter((p) => p.masteryLevel === 'learning').length,
            practicing: teachingProgress.filter((p) => p.masteryLevel === 'practicing').length,
            proficient: teachingProgress.filter((p) => p.masteryLevel === 'proficient').length,
            mastered: teachingProgress.filter((p) => p.masteryLevel === 'mastered').length
        };
        const avgCompletion = totalMethods > 0
            ? Math.round(teachingProgress.reduce((sum, p) => sum + p.completionRate, 0) / totalMethods)
            : 0;
        return res.status(200).json({
            userId,
            userName: user.name,
            currentLevel,
            summary: {
                totalMethods,
                masteredMethods,
                inProgressMethods,
                notStartedMethods,
                avgCompletion,
                byStroke,
                byMastery
            }
        });
    }
    catch (error) {
        console.error('요약 조회 실패:', error);
        return res.status(500).json({ error: '요약 조회에 실패했습니다.', details: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=teaching-progress.js.map