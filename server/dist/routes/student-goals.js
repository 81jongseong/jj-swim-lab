"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const StudentGoal_1 = require("../models/StudentGoal");
const TeachingMethod_1 = require("../models/TeachingMethod");
const LearningProgress_1 = require("../models/LearningProgress");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/', auth_1.authMiddleware, (0, auth_1.requireRole)(['student']), async (req, res) => {
    try {
        const studentId = req.user.id;
        const { status, priority } = req.query;
        let query = { studentId };
        if (status)
            query.status = status;
        if (priority)
            query.priority = priority;
        const goals = await StudentGoal_1.StudentGoal.find(query)
            .populate('teachingMethods', 'name description category level')
            .sort({ priority: -1, createdAt: -1 });
        res.json({
            success: true,
            data: goals
        });
    }
    catch (error) {
        console.error('❌ 학생 목표 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '학생 목표 목록 조회 중 오류가 발생했습니다.'
        });
    }
});
router.get('/:goalId', auth_1.authMiddleware, (0, auth_1.requireRole)(['student']), async (req, res) => {
    try {
        const studentId = req.user.id;
        const { goalId } = req.params;
        const goal = await StudentGoal_1.StudentGoal.findOne({
            _id: goalId,
            studentId
        })
            .populate('teachingMethods', 'name description category level steps tips');
        if (!goal) {
            return res.status(404).json({
                success: false,
                message: '목표를 찾을 수 없습니다.'
            });
        }
        res.json({
            success: true,
            data: goal
        });
    }
    catch (error) {
        console.error('❌ 학생 목표 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '학생 목표 조회 중 오류가 발생했습니다.'
        });
    }
});
router.post('/', auth_1.authMiddleware, (0, auth_1.requireRole)(['student']), async (req, res) => {
    try {
        const studentId = req.user.id;
        const { title, description, targetDate, teachingMethods, priority, milestones } = req.body;
        if (!title || !description || !targetDate) {
            return res.status(400).json({
                success: false,
                message: '필수 정보를 모두 입력해주세요.'
            });
        }
        if (teachingMethods && teachingMethods.length > 0) {
            const methods = await TeachingMethod_1.TeachingMethod.find({ _id: { $in: teachingMethods } });
            if (methods.length !== teachingMethods.length) {
                return res.status(400).json({
                    success: false,
                    message: '일부 강습법을 찾을 수 없습니다.'
                });
            }
        }
        const goal = new StudentGoal_1.StudentGoal({
            studentId,
            title,
            description,
            targetDate: new Date(targetDate),
            teachingMethods: teachingMethods || [],
            priority: priority || 'medium',
            milestones: milestones || [],
            status: 'active'
        });
        await goal.save();
        await goal.populate('teachingMethods', 'name description category level');
        res.status(201).json({
            success: true,
            data: goal,
            message: '목표가 생성되었습니다.'
        });
    }
    catch (error) {
        console.error('❌ 목표 생성 오류:', error);
        res.status(500).json({
            success: false,
            message: '목표 생성 중 오류가 발생했습니다.'
        });
    }
});
router.put('/:goalId', auth_1.authMiddleware, (0, auth_1.requireRole)(['student']), async (req, res) => {
    try {
        const studentId = req.user.id;
        const { goalId } = req.params;
        const updateData = req.body;
        const goal = await StudentGoal_1.StudentGoal.findOne({
            _id: goalId,
            studentId
        });
        if (!goal) {
            return res.status(404).json({
                success: false,
                message: '목표를 찾을 수 없습니다.'
            });
        }
        const allowedFields = [
            'title', 'description', 'targetDate', 'teachingMethods',
            'priority', 'milestones', 'notes', 'status'
        ];
        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                goal[field] = updateData[field];
            }
        }
        await goal.save();
        await goal.populate('teachingMethods', 'name description category level');
        res.json({
            success: true,
            data: goal,
            message: '목표가 수정되었습니다.'
        });
    }
    catch (error) {
        console.error('❌ 목표 수정 오류:', error);
        res.status(500).json({
            success: false,
            message: '목표 수정 중 오류가 발생했습니다.'
        });
    }
});
router.delete('/:goalId', auth_1.authMiddleware, (0, auth_1.requireRole)(['student']), async (req, res) => {
    try {
        const studentId = req.user.id;
        const { goalId } = req.params;
        const goal = await StudentGoal_1.StudentGoal.findOne({
            _id: goalId,
            studentId
        });
        if (!goal) {
            return res.status(404).json({
                success: false,
                message: '목표를 찾을 수 없습니다.'
            });
        }
        await StudentGoal_1.StudentGoal.findByIdAndDelete(goalId);
        res.json({
            success: true,
            message: '목표가 삭제되었습니다.'
        });
    }
    catch (error) {
        console.error('❌ 목표 삭제 오류:', error);
        res.status(500).json({
            success: false,
            message: '목표 삭제 중 오류가 발생했습니다.'
        });
    }
});
router.put('/:goalId/milestones/:milestoneIndex', auth_1.authMiddleware, (0, auth_1.requireRole)(['student']), async (req, res) => {
    try {
        const studentId = req.user.id;
        const { goalId, milestoneIndex } = req.params;
        const { completed } = req.body;
        const goal = await StudentGoal_1.StudentGoal.findOne({
            _id: goalId,
            studentId
        });
        if (!goal) {
            return res.status(404).json({
                success: false,
                message: '목표를 찾을 수 없습니다.'
            });
        }
        const index = parseInt(milestoneIndex);
        if (index < 0 || index >= goal.milestones.length) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 마일스톤 인덱스입니다.'
            });
        }
        goal.milestones[index].completed = completed;
        if (completed) {
            goal.milestones[index].completedAt = new Date();
        }
        else {
            goal.milestones[index].completedAt = undefined;
        }
        await goal.save();
        await goal.populate('teachingMethods', 'name description category level');
        res.json({
            success: true,
            data: goal,
            message: '마일스톤이 업데이트되었습니다.'
        });
    }
    catch (error) {
        console.error('❌ 마일스톤 업데이트 오류:', error);
        res.status(500).json({
            success: false,
            message: '마일스톤 업데이트 중 오류가 발생했습니다.'
        });
    }
});
router.put('/:goalId/calculate-progress', auth_1.authMiddleware, (0, auth_1.requireRole)(['student']), async (req, res) => {
    try {
        const studentId = req.user.id;
        const { goalId } = req.params;
        const goal = await StudentGoal_1.StudentGoal.findOne({
            _id: goalId,
            studentId
        }).populate('teachingMethods', 'name description category level');
        if (!goal) {
            return res.status(404).json({
                success: false,
                message: '목표를 찾을 수 없습니다.'
            });
        }
        if (goal.teachingMethods && goal.teachingMethods.length > 0) {
            const methodIds = goal.teachingMethods.map((m) => m._id);
            const progressData = await LearningProgress_1.LearningProgress.find({
                studentId,
                teachingMethodId: { $in: methodIds }
            });
            if (progressData.length > 0) {
                const totalProgress = progressData.reduce((sum, p) => sum + p.progress, 0);
                goal.progress = Math.round(totalProgress / progressData.length);
            }
        }
        await goal.save();
        res.json({
            success: true,
            data: goal,
            message: '목표 진행률이 계산되었습니다.'
        });
    }
    catch (error) {
        console.error('❌ 목표 진행률 계산 오류:', error);
        res.status(500).json({
            success: false,
            message: '목표 진행률 계산 중 오류가 발생했습니다.'
        });
    }
});
router.get('/stats/overview', auth_1.authMiddleware, (0, auth_1.requireRole)(['student']), async (req, res) => {
    try {
        const studentId = req.user.id;
        const stats = await StudentGoal_1.StudentGoal.aggregate([
            { $match: { studentId: new mongoose_1.default.Types.ObjectId(studentId) } },
            {
                $group: {
                    _id: null,
                    totalGoals: { $sum: 1 },
                    activeGoals: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
                    completedGoals: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
                    pausedGoals: { $sum: { $cond: [{ $eq: ['$status', 'paused'] }, 1, 0] } },
                    averageProgress: { $avg: '$progress' },
                    highPriorityGoals: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } }
                }
            }
        ]);
        const result = stats[0] || {
            totalGoals: 0,
            activeGoals: 0,
            completedGoals: 0,
            pausedGoals: 0,
            averageProgress: 0,
            highPriorityGoals: 0
        };
        const upcomingGoals = await StudentGoal_1.StudentGoal.find({
            studentId,
            status: 'active',
            targetDate: { $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
        }).countDocuments();
        res.json({
            success: true,
            data: {
                ...result,
                upcomingGoals,
                averageProgress: Math.round(result.averageProgress * 100) / 100
            }
        });
    }
    catch (error) {
        console.error('❌ 목표 통계 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '목표 통계 조회 중 오류가 발생했습니다.'
        });
    }
});
router.post('/recommend', auth_1.authMiddleware, (0, auth_1.requireRole)(['student']), async (req, res) => {
    try {
        const studentId = req.user.id;
        const progressData = await LearningProgress_1.LearningProgress.find({ studentId })
            .populate('teachingMethodId', 'name description category level');
        const allMethods = await TeachingMethod_1.TeachingMethod.find({ isActive: true });
        const recommendedGoals = [];
        const completedMethods = progressData.filter(p => p.progress === 100);
        if (completedMethods.length > 0) {
            const method = completedMethods[0].teachingMethodId;
            recommendedGoals.push({
                title: `${method.category} 마스터하기`,
                description: `${method.category} 영역의 모든 기술을 완벽하게 익혀서 전문가 수준에 도달하겠습니다.`,
                teachingMethods: [method._id],
                priority: 'high',
                targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                milestones: [
                    {
                        title: '기초 기술 완성',
                        description: '기초 기술을 완벽하게 익히기',
                        targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                        completed: false
                    },
                    {
                        title: '중급 기술 습득',
                        description: '중급 기술을 습득하기',
                        targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                        completed: false
                    },
                    {
                        title: '고급 기술 완성',
                        description: '고급 기술을 완성하기',
                        targetDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
                        completed: false
                    }
                ]
            });
        }
        const weakAreas = getWeakAreas(progressData);
        for (const area of weakAreas.slice(0, 2)) {
            const areaMethods = allMethods.filter(m => m.category === area);
            if (areaMethods.length > 0) {
                recommendedGoals.push({
                    title: `${area} 기초 강화`,
                    description: `${area} 영역의 기초를 탄탄히 다져서 전반적인 실력 향상을 도모하겠습니다.`,
                    teachingMethods: areaMethods.slice(0, 3).map(m => m._id),
                    priority: 'high',
                    targetDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
                    milestones: [
                        {
                            title: '기초 이해',
                            description: '기초 이론과 동작 이해하기',
                            targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                            completed: false
                        },
                        {
                            title: '실습 시작',
                            description: '실제 동작 연습 시작하기',
                            targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                            completed: false
                        }
                    ]
                });
            }
        }
        res.json({
            success: true,
            data: recommendedGoals,
            message: `${recommendedGoals.length}개의 추천 목표가 생성되었습니다.`
        });
    }
    catch (error) {
        console.error('❌ 목표 추천 생성 오류:', error);
        res.status(500).json({
            success: false,
            message: '목표 추천 생성 중 오류가 발생했습니다.'
        });
    }
});
function getWeakAreas(progressData) {
    const categoryProgress = {};
    progressData.forEach(p => {
        const method = p.teachingMethodId;
        if (method && method.category) {
            if (!categoryProgress[method.category]) {
                categoryProgress[method.category] = [];
            }
            categoryProgress[method.category].push(p.progress);
        }
    });
    const weakAreas = [];
    Object.entries(categoryProgress).forEach(([category, progresses]) => {
        const averageProgress = progresses.reduce((sum, p) => sum + p, 0) / progresses.length;
        if (averageProgress < 50) {
            weakAreas.push(category);
        }
    });
    return weakAreas;
}
exports.default = router;
//# sourceMappingURL=student-goals.js.map