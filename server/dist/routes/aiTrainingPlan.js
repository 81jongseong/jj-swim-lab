"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const aiTrainingPlanService_1 = require("../services/aiTrainingPlanService");
const TrainingPlan_1 = require("../models/TrainingPlan");
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
router.post('/generate', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ error: '인증이 필요합니다.' });
        }
        const { userProfile, goals, currentAssessment } = req.body;
        if (!userProfile || !goals || !currentAssessment) {
            return res.status(400).json({
                error: '필수 정보가 누락되었습니다.',
                required: ['userProfile', 'goals', 'currentAssessment']
            });
        }
        const planRequest = {
            userId: new mongoose_1.default.Types.ObjectId(userId),
            userProfile: {
                currentLevel: userProfile.currentLevel,
                experience: parseInt(userProfile.experience) || 0,
                age: parseInt(userProfile.age) || 25,
                weight: parseFloat(userProfile.weight) || 70,
                height: parseFloat(userProfile.height) || 170,
                medicalConditions: userProfile.medicalConditions || [],
                availableTime: parseInt(userProfile.availableTime) || 5,
                preferredDays: userProfile.preferredDays || [1, 3, 5],
                preferredTimes: userProfile.preferredTimes || ['evening']
            },
            goals: {
                primary: goals.primary,
                secondary: goals.secondary || [],
                targetDate: new Date(goals.targetDate),
                specificTargets: goals.specificTargets || {}
            },
            currentAssessment: {
                technique: {
                    freestyle: parseInt(currentAssessment.technique?.freestyle) || 5,
                    backstroke: parseInt(currentAssessment.technique?.backstroke) || 5,
                    breaststroke: parseInt(currentAssessment.technique?.breaststroke) || 5,
                    butterfly: parseInt(currentAssessment.technique?.butterfly) || 5
                },
                endurance: parseInt(currentAssessment.endurance) || 5,
                speed: parseInt(currentAssessment.speed) || 5,
                flexibility: parseInt(currentAssessment.flexibility) || 5,
                strength: parseInt(currentAssessment.strength) || 5
            }
        };
        const trainingPlan = await aiTrainingPlanService_1.AITrainingPlanService.generatePersonalizedPlan(planRequest);
        res.status(201).json({
            message: 'AI 훈련 계획이 성공적으로 생성되었습니다.',
            data: trainingPlan
        });
    }
    catch (error) {
        (0, logger_1.logError)('AI 훈련 계획 생성 오류:', error);
        res.status(500).json({
            error: 'AI 훈련 계획 생성에 실패했습니다.',
            details: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
router.get('/user/:userId', auth_1.authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;
        const requestUserId = req.user?._id;
        if (userId !== requestUserId && req.user?.userType !== 'superAdmin' && req.user?.userType !== 'centerAdmin') {
            return res.status(403).json({ error: '접근 권한이 없습니다.' });
        }
        const trainingPlans = await aiTrainingPlanService_1.AITrainingPlanService.getUserTrainingPlans(new mongoose_1.default.Types.ObjectId(userId));
        res.json({
            message: '훈련 계획 목록을 성공적으로 조회했습니다.',
            data: trainingPlans
        });
    }
    catch (error) {
        (0, logger_1.logError)('훈련 계획 조회 오류:', error);
        res.status(500).json({
            error: '훈련 계획 조회에 실패했습니다.',
            details: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
router.get('/:planId', auth_1.authMiddleware, async (req, res) => {
    try {
        const { planId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(planId)) {
            return res.status(400).json({ error: '유효하지 않은 계획 ID입니다.' });
        }
        const trainingPlan = await TrainingPlan_1.TrainingPlan.findById(planId)
            .populate('userId', 'name email');
        if (!trainingPlan) {
            return res.status(404).json({ error: '훈련 계획을 찾을 수 없습니다.' });
        }
        if (trainingPlan.userId.toString() !== req.user?._id &&
            req.user?.userType !== 'superAdmin' &&
            req.user?.userType !== 'centerAdmin') {
            return res.status(403).json({ error: '접근 권한이 없습니다.' });
        }
        res.json({
            message: '훈련 계획을 성공적으로 조회했습니다.',
            data: trainingPlan
        });
    }
    catch (error) {
        (0, logger_1.logError)('훈련 계획 상세 조회 오류:', error);
        res.status(500).json({
            error: '훈련 계획 조회에 실패했습니다.',
            details: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
router.put('/:planId/complete-session', auth_1.authMiddleware, async (req, res) => {
    try {
        const { planId } = req.params;
        const { sessionId, completion, perceivedExertion, actualDuration, notes } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(planId)) {
            return res.status(400).json({ error: '유효하지 않은 계획 ID입니다.' });
        }
        if (!sessionId || completion === undefined || !perceivedExertion || !actualDuration) {
            return res.status(400).json({
                error: '필수 정보가 누락되었습니다.',
                required: ['sessionId', 'completion', 'perceivedExertion', 'actualDuration']
            });
        }
        const trainingPlan = await TrainingPlan_1.TrainingPlan.findById(planId);
        if (!trainingPlan) {
            return res.status(404).json({ error: '훈련 계획을 찾을 수 없습니다.' });
        }
        if (trainingPlan.userId.toString() !== req.user?._id) {
            return res.status(403).json({ error: '본인의 훈련 계획만 업데이트할 수 있습니다.' });
        }
        const updatedPlan = await aiTrainingPlanService_1.AITrainingPlanService.completeSession(new mongoose_1.default.Types.ObjectId(planId), {
            sessionId: parseInt(sessionId),
            completion: parseFloat(completion),
            perceivedExertion: parseInt(perceivedExertion),
            actualDuration: parseInt(actualDuration),
            notes: notes || ''
        });
        if (!updatedPlan) {
            return res.status(404).json({ error: '훈련 계획을 찾을 수 없습니다.' });
        }
        res.json({
            message: '훈련 세션이 성공적으로 완료 처리되었습니다.',
            data: updatedPlan
        });
    }
    catch (error) {
        (0, logger_1.logError)('세션 완료 처리 오류:', error);
        res.status(500).json({
            error: '세션 완료 처리에 실패했습니다.',
            details: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
router.put('/:planId/adjust', auth_1.authMiddleware, async (req, res) => {
    try {
        const { planId } = req.params;
        const { performanceData } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(planId)) {
            return res.status(400).json({ error: '유효하지 않은 계획 ID입니다.' });
        }
        const trainingPlan = await TrainingPlan_1.TrainingPlan.findById(planId);
        if (!trainingPlan) {
            return res.status(404).json({ error: '훈련 계획을 찾을 수 없습니다.' });
        }
        if (trainingPlan.userId.toString() !== req.user?._id &&
            req.user?.userType !== 'superAdmin' &&
            req.user?.userType !== 'centerAdmin') {
            return res.status(403).json({ error: '접근 권한이 없습니다.' });
        }
        const adjustedPlan = await aiTrainingPlanService_1.AITrainingPlanService.adjustTrainingPlan(new mongoose_1.default.Types.ObjectId(planId), performanceData || trainingPlan.progress.performanceMetrics);
        if (!adjustedPlan) {
            return res.status(404).json({ error: '훈련 계획을 찾을 수 없습니다.' });
        }
        res.json({
            message: 'AI 기반 훈련 계획 조정이 완료되었습니다.',
            data: adjustedPlan
        });
    }
    catch (error) {
        (0, logger_1.logError)('훈련 계획 조정 오류:', error);
        res.status(500).json({
            error: '훈련 계획 조정에 실패했습니다.',
            details: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
router.get('/:planId/next-session', auth_1.authMiddleware, async (req, res) => {
    try {
        const { planId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(planId)) {
            return res.status(400).json({ error: '유효하지 않은 계획 ID입니다.' });
        }
        const trainingPlan = await TrainingPlan_1.TrainingPlan.findById(planId);
        if (!trainingPlan) {
            return res.status(404).json({ error: '훈련 계획을 찾을 수 없습니다.' });
        }
        if (trainingPlan.userId.toString() !== req.user?._id &&
            req.user?.userType !== 'superAdmin' &&
            req.user?.userType !== 'centerAdmin') {
            return res.status(403).json({ error: '접근 권한이 없습니다.' });
        }
        const nextSession = trainingPlan.getNextSession();
        if (!nextSession) {
            return res.status(404).json({
                error: '다음 훈련 세션을 찾을 수 없습니다.',
                message: '모든 훈련이 완료되었거나 계획에 오류가 있습니다.'
            });
        }
        res.json({
            message: '다음 훈련 세션 정보를 성공적으로 조회했습니다.',
            data: {
                currentWeek: trainingPlan.progress.currentWeek,
                currentSession: trainingPlan.progress.currentSession,
                nextSession: nextSession,
                progress: {
                    completed: trainingPlan.progress.completedSessions,
                    total: trainingPlan.progress.totalSessions,
                    percentage: Math.round((trainingPlan.progress.completedSessions / trainingPlan.progress.totalSessions) * 100)
                }
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('다음 세션 조회 오류:', error);
        res.status(500).json({
            error: '다음 세션 조회에 실패했습니다.',
            details: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
router.get('/:planId/progress', auth_1.authMiddleware, async (req, res) => {
    try {
        const { planId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(planId)) {
            return res.status(400).json({ error: '유효하지 않은 계획 ID입니다.' });
        }
        const trainingPlan = await TrainingPlan_1.TrainingPlan.findById(planId);
        if (!trainingPlan) {
            return res.status(404).json({ error: '훈련 계획을 찾을 수 없습니다.' });
        }
        if (trainingPlan.userId.toString() !== req.user?._id &&
            req.user?.userType !== 'superAdmin' &&
            req.user?.userType !== 'centerAdmin') {
            return res.status(403).json({ error: '접근 권한이 없습니다.' });
        }
        const progressPercentage = trainingPlan.calculateProgress();
        const recentMetrics = trainingPlan.progress.performanceMetrics.slice(-10);
        const avgCompletion = recentMetrics.length > 0 ?
            recentMetrics.reduce((sum, m) => sum + m.completion, 0) / recentMetrics.length : 0;
        const avgExertion = recentMetrics.length > 0 ?
            recentMetrics.reduce((sum, m) => sum + m.perceivedExertion, 0) / recentMetrics.length : 0;
        const needsAdjustment = trainingPlan.needsAdjustment();
        res.json({
            message: '훈련 진행 상황을 성공적으로 조회했습니다.',
            data: {
                overview: {
                    title: trainingPlan.title,
                    currentWeek: trainingPlan.progress.currentWeek,
                    totalWeeks: trainingPlan.planDetails.duration,
                    completedSessions: trainingPlan.progress.completedSessions,
                    totalSessions: trainingPlan.progress.totalSessions,
                    progressPercentage,
                    adherenceRate: trainingPlan.progress.adherenceRate
                },
                recentPerformance: {
                    averageCompletion: Math.round(avgCompletion),
                    averageExertion: Math.round(avgExertion * 10) / 10,
                    trend: trainingPlan.aiAnalysis.performanceTrend,
                    sessionsAnalyzed: recentMetrics.length
                },
                aiAnalysis: {
                    lastAnalysisDate: trainingPlan.aiAnalysis.lastAnalysisDate,
                    needsAdjustment,
                    strengthAreas: trainingPlan.aiAnalysis.strengthAreas,
                    improvementAreas: trainingPlan.aiAnalysis.improvementAreas,
                    recommendedAdjustments: trainingPlan.aiAnalysis.recommendedAdjustments,
                    riskFactors: trainingPlan.aiAnalysis.riskFactors
                },
                metrics: recentMetrics
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('진행 상황 조회 오류:', error);
        res.status(500).json({
            error: '진행 상황 조회에 실패했습니다.',
            details: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
router.delete('/:planId', auth_1.authMiddleware, async (req, res) => {
    try {
        const { planId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(planId)) {
            return res.status(400).json({ error: '유효하지 않은 계획 ID입니다.' });
        }
        const trainingPlan = await TrainingPlan_1.TrainingPlan.findById(planId);
        if (!trainingPlan) {
            return res.status(404).json({ error: '훈련 계획을 찾을 수 없습니다.' });
        }
        if (trainingPlan.userId.toString() !== req.user?._id &&
            req.user?.userType !== 'superAdmin' &&
            req.user?.userType !== 'centerAdmin') {
            return res.status(403).json({ error: '접근 권한이 없습니다.' });
        }
        trainingPlan.isActive = false;
        await trainingPlan.save();
        res.json({
            message: '훈련 계획이 성공적으로 삭제되었습니다.',
            data: { planId, deletedAt: new Date() }
        });
    }
    catch (error) {
        (0, logger_1.logError)('훈련 계획 삭제 오류:', error);
        res.status(500).json({
            error: '훈련 계획 삭제에 실패했습니다.',
            details: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
router.get('/stats/overview', auth_1.authMiddleware, async (req, res) => {
    try {
        if (req.user?.userType !== 'superAdmin' && req.user?.userType !== 'centerAdmin') {
            return res.status(403).json({ error: '관리자 권한이 필요합니다.' });
        }
        const stats = await TrainingPlan_1.TrainingPlan.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: null,
                    totalPlans: { $sum: 1 },
                    avgDuration: { $avg: '$planDetails.duration' },
                    avgSessionsPerWeek: { $avg: '$planDetails.sessionsPerWeek' },
                    avgAdherenceRate: { $avg: '$progress.adherenceRate' }
                }
            }
        ]);
        const goalDistribution = await TrainingPlan_1.TrainingPlan.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: '$goals.primary',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);
        const levelDistribution = await TrainingPlan_1.TrainingPlan.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: '$userProfile.currentLevel',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);
        res.json({
            message: '훈련 계획 통계를 성공적으로 조회했습니다.',
            data: {
                overview: stats[0] || {
                    totalPlans: 0,
                    avgDuration: 0,
                    avgSessionsPerWeek: 0,
                    avgAdherenceRate: 0
                },
                goalDistribution,
                levelDistribution
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('통계 조회 오류:', error);
        res.status(500).json({
            error: '통계 조회에 실패했습니다.',
            details: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
exports.default = router;
//# sourceMappingURL=aiTrainingPlan.js.map