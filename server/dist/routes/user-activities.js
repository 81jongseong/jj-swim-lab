"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userActivityService_1 = __importDefault(require("../services/userActivityService"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const activityService = userActivityService_1.default.getInstance();
router.get('/', (0, auth_1.requireRole)(['superAdmin', 'centerAdmin']), async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        console.log('🔍 사용자 활동 목록 조회 요청:', { page, limit });
        const activities = [];
        res.json({
            success: true,
            message: '사용자 활동 목록 조회 성공',
            data: {
                activities,
                pagination: {
                    page,
                    limit,
                    total: 0,
                    totalPages: 0
                }
            }
        });
    }
    catch (error) {
        console.error('사용자 활동 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '사용자 활동 목록 조회 중 오류가 발생했습니다.'
        });
    }
});
router.get('/stats/:userId', (0, auth_1.requireRole)(['superAdmin', 'centerAdmin']), async (req, res) => {
    try {
        const { userId } = req.params;
        const days = parseInt(req.query.days) || 30;
        const stats = await activityService.getUserActivityStats(userId, days);
        res.json({
            success: true,
            data: {
                userId,
                period: `${days}일`,
                stats
            }
        });
    }
    catch (error) {
        console.error('사용자 활동 통계 조회 실패:', error);
        res.status(500).json({
            success: false,
            message: '사용자 활동 통계 조회 중 오류가 발생했습니다.'
        });
    }
});
router.get('/:userId', (0, auth_1.requireRole)(['superAdmin', 'centerAdmin']), async (req, res) => {
    try {
        const { userId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const filters = {};
        if (req.query.action)
            filters.action = req.query.action;
        if (req.query.resource)
            filters.resource = req.query.resource;
        if (req.query.success !== undefined)
            filters.success = req.query.success === 'true';
        if (req.query.startDate)
            filters.startDate = new Date(req.query.startDate);
        if (req.query.endDate)
            filters.endDate = new Date(req.query.endDate);
        const result = await activityService.getUserActivities(userId, page, limit, filters);
        res.json({
            success: true,
            data: {
                activities: result.activities.map(activity => ({
                    id: activity._id,
                    userId: activity.userId,
                    userType: activity.userType,
                    action: activity.action,
                    resource: activity.resource,
                    resourceId: activity.resourceId,
                    timestamp: activity.timestamp,
                    success: activity.success,
                    duration: activity.duration,
                    ip: activity.ip,
                    userAgent: activity.userAgent,
                    metadata: activity.metadata,
                    details: activity.details
                })),
                pagination: {
                    page,
                    limit,
                    total: result.total,
                    pages: result.pages
                }
            }
        });
    }
    catch (error) {
        console.error('사용자 활동 목록 조회 실패:', error);
        res.status(500).json({
            success: false,
            message: '사용자 활동 목록 조회 중 오류가 발생했습니다.'
        });
    }
});
router.get('/trends/overview', (0, auth_1.requireRole)(['superAdmin', 'centerAdmin']), async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const trends = await activityService.getActivityTrends(days);
        res.json({
            success: true,
            data: {
                period: `${days}일`,
                trends: trends.map(trend => ({
                    date: trend.date,
                    totalActivities: trend.count,
                    successfulActivities: trend.successCount,
                    uniqueUsers: trend.uniqueUserCount,
                    successRate: trend.count > 0 ? (trend.successCount / trend.count) * 100 : 0
                }))
            }
        });
    }
    catch (error) {
        console.error('활동 트렌드 조회 실패:', error);
        res.status(500).json({
            success: false,
            message: '활동 트렌드 조회 중 오류가 발생했습니다.'
        });
    }
});
router.get('/top-actions/overview', (0, auth_1.requireRole)(['superAdmin', 'centerAdmin']), async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const topActions = await activityService.getTopActions(limit);
        res.json({
            success: true,
            data: {
                actions: topActions.map(action => ({
                    action: action.action,
                    totalCount: action.count,
                    successCount: action.successCount,
                    successRate: Math.round(action.successRate * 100) / 100
                }))
            }
        });
    }
    catch (error) {
        console.error('상위 활동 조회 실패:', error);
        res.status(500).json({
            success: false,
            message: '상위 활동 조회 중 오류가 발생했습니다.'
        });
    }
});
router.get('/summary/:userId', (0, auth_1.requireRole)(['superAdmin', 'centerAdmin']), async (req, res) => {
    try {
        const { userId } = req.params;
        const days = parseInt(req.query.days) || 7;
        const summary = await activityService.generateActivitySummary(userId, days);
        res.json({
            success: true,
            data: summary
        });
    }
    catch (error) {
        console.error('사용자 활동 요약 생성 실패:', error);
        res.status(500).json({
            success: false,
            message: '사용자 활동 요약 생성 중 오류가 발생했습니다.'
        });
    }
});
router.get('/suspicious/:userId', (0, auth_1.requireRole)(['superAdmin']), async (req, res) => {
    try {
        const { userId } = req.params;
        const hours = parseInt(req.query.hours) || 24;
        const suspiciousActivities = await activityService.detectSuspiciousActivity(userId, hours);
        res.json({
            success: true,
            data: {
                userId,
                period: `${hours}시간`,
                suspiciousActivities: suspiciousActivities.map(activity => ({
                    type: activity.type,
                    count: activity.count,
                    severity: activity.severity,
                    description: activity.description,
                    timestamp: new Date()
                }))
            }
        });
    }
    catch (error) {
        console.error('의심스러운 활동 감지 실패:', error);
        res.status(500).json({
            success: false,
            message: '의심스러운 활동 감지 중 오류가 발생했습니다.'
        });
    }
});
router.get('/system-summary/overview', (0, auth_1.requireRole)(['superAdmin']), async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const [trends, topActions] = await Promise.all([
            activityService.getActivityTrends(days),
            activityService.getTopActions(10)
        ]);
        const totalActivities = trends.reduce((sum, trend) => sum + trend.count, 0);
        const totalSuccessfulActivities = trends.reduce((sum, trend) => sum + trend.successCount, 0);
        const overallSuccessRate = totalActivities > 0 ? (totalSuccessfulActivities / totalActivities) * 100 : 0;
        const recentTrends = trends.slice(-7);
        const recentActivities = recentTrends.reduce((sum, trend) => sum + trend.count, 0);
        res.json({
            success: true,
            data: {
                period: `${days}일`,
                overview: {
                    totalActivities,
                    totalSuccessfulActivities,
                    overallSuccessRate: Math.round(overallSuccessRate * 100) / 100,
                    recentActivities,
                    averageDailyActivities: Math.round(totalActivities / days)
                },
                trends: trends.slice(-14),
                topActions: topActions.slice(0, 5)
            }
        });
    }
    catch (error) {
        console.error('시스템 활동 요약 조회 실패:', error);
        res.status(500).json({
            success: false,
            message: '시스템 활동 요약 조회 중 오류가 발생했습니다.'
        });
    }
});
router.get('/search/overview', (0, auth_1.requireRole)(['superAdmin', 'centerAdmin']), async (req, res) => {
    try {
        const { q: query } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        if (!query) {
            return res.status(400).json({
                success: false,
                message: '검색어가 필요합니다.'
            });
        }
        const filters = {
            $or: [
                { action: { $regex: query, $options: 'i' } },
                { resource: { $regex: query, $options: 'i' } },
                { 'details.method': { $regex: query, $options: 'i' } },
                { 'details.url': { $regex: query, $options: 'i' } }
            ]
        };
        const result = await activityService.getUserActivities('', page, limit, filters);
        res.json({
            success: true,
            data: {
                query,
                activities: result.activities.map(activity => ({
                    id: activity._id,
                    userId: activity.userId,
                    userType: activity.userType,
                    action: activity.action,
                    resource: activity.resource,
                    timestamp: activity.timestamp,
                    success: activity.success,
                    details: activity.details
                })),
                pagination: {
                    page,
                    limit,
                    total: result.total,
                    pages: result.pages
                }
            }
        });
    }
    catch (error) {
        console.error('사용자 활동 검색 실패:', error);
        res.status(500).json({
            success: false,
            message: '사용자 활동 검색 중 오류가 발생했습니다.'
        });
    }
});
exports.default = router;
//# sourceMappingURL=user-activities.js.map