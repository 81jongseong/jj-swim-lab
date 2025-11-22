"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const systemMonitor_1 = __importDefault(require("../monitoring/systemMonitor"));
const auth_1 = require("../middleware/auth");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
const monitor = systemMonitor_1.default.getInstance();
router.get('/status', (0, auth_1.requireRole)(['superAdmin', 'centerAdmin']), (req, res) => {
    try {
        const status = monitor.getCurrentStatus();
        if (!status) {
            return res.status(404).json({
                success: false,
                message: '시스템 상태 정보를 찾을 수 없습니다.'
            });
        }
        res.json({
            success: true,
            data: {
                timestamp: status.timestamp,
                cpu: {
                    usage: `${status.cpu.usage}%`,
                    loadAverage: status.cpu.loadAverage
                },
                memory: {
                    total: `${Math.round(status.memory.total / 1024 / 1024)}MB`,
                    free: `${Math.round(status.memory.free / 1024 / 1024)}MB`,
                    used: `${Math.round(status.memory.used / 1024 / 1024)}MB`,
                    usage: `${status.memory.usage.toFixed(1)}%`
                },
                uptime: `${Math.round(status.uptime / 3600)}시간`,
                nodeVersion: status.nodeVersion,
                platform: status.platform
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('시스템 상태 조회 실패:', error);
        res.status(500).json({
            success: false,
            message: '시스템 상태 조회 중 오류가 발생했습니다.'
        });
    }
});
router.get('/performance', (0, auth_1.requireRole)(['superAdmin', 'centerAdmin']), (req, res) => {
    try {
        const stats = monitor.getPerformanceStats();
        res.json({
            success: true,
            data: {
                ...stats,
                timestamp: new Date(),
                summary: {
                    status: stats.errorRate < 5 ? '양호' : stats.errorRate < 10 ? '주의' : '위험',
                    recommendation: stats.errorRate > 10 ? '시스템 점검이 필요합니다.' : '정상 운영 중입니다.'
                }
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('성능 통계 조회 실패:', error);
        res.status(500).json({
            success: false,
            message: '성능 통계 조회 중 오류가 발생했습니다.'
        });
    }
});
router.get('/api-requests', (0, auth_1.requireRole)(['superAdmin', 'centerAdmin']), (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const requests = monitor.getRecentApiMetrics(limit);
        res.json({
            success: true,
            data: {
                requests: requests.map(req => ({
                    timestamp: req.timestamp,
                    method: req.method,
                    url: req.url,
                    statusCode: req.statusCode,
                    duration: `${req.duration}ms`,
                    ip: req.ip,
                    userId: req.userId
                })),
                total: requests.length,
                limit
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('API 요청 조회 실패:', error);
        res.status(500).json({
            success: false,
            message: 'API 요청 조회 중 오류가 발생했습니다.'
        });
    }
});
router.get('/user-activities', (0, auth_1.requireRole)(['superAdmin', 'centerAdmin']), (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const activities = monitor.getRecentUserActivities(limit);
        res.json({
            success: true,
            data: {
                activities: activities.map(activity => ({
                    timestamp: activity.timestamp,
                    userId: activity.userId,
                    action: activity.action,
                    details: activity.details,
                    ip: activity.ip
                })),
                total: activities.length,
                limit
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('사용자 활동 조회 실패:', error);
        res.status(500).json({
            success: false,
            message: '사용자 활동 조회 중 오류가 발생했습니다.'
        });
    }
});
router.get('/metrics-history', (0, auth_1.requireRole)(['superAdmin', 'centerAdmin']), (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const metrics = monitor.getSystemMetricsHistory(limit);
        res.json({
            success: true,
            data: {
                metrics: metrics.map(metric => ({
                    timestamp: metric.timestamp,
                    cpu: {
                        usage: `${metric.cpu.usage}%`,
                        loadAverage: metric.cpu.loadAverage
                    },
                    memory: {
                        usage: `${metric.memory.usage.toFixed(1)}%`,
                        used: `${Math.round(metric.memory.used / 1024 / 1024)}MB`
                    },
                    uptime: `${Math.round(metric.uptime / 3600)}시간`
                })),
                total: metrics.length,
                limit
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('메트릭 히스토리 조회 실패:', error);
        res.status(500).json({
            success: false,
            message: '메트릭 히스토리 조회 중 오류가 발생했습니다.'
        });
    }
});
router.get('/summary', (0, auth_1.requireRole)(['superAdmin', 'centerAdmin']), (req, res) => {
    try {
        const summary = monitor.getSystemSummary();
        res.json({
            success: true,
            data: {
                ...summary,
                health: {
                    status: summary.system?.memory.usage < 80 ? 'healthy' : 'warning',
                    message: summary.system?.memory.usage < 80
                        ? '시스템이 정상적으로 작동하고 있습니다.'
                        : '메모리 사용량이 높습니다. 모니터링이 필요합니다.'
                }
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('시스템 요약 조회 실패:', error);
        res.status(500).json({
            success: false,
            message: '시스템 요약 조회 중 오류가 발생했습니다.'
        });
    }
});
router.post('/alerts', (0, auth_1.requireRole)(['superAdmin']), (req, res) => {
    try {
        const { type, threshold, enabled } = req.body;
        console.log(`🔔 알림 설정: ${type} - 임계값: ${threshold}, 활성화: ${enabled}`);
        res.json({
            success: true,
            message: '알림 설정이 완료되었습니다.',
            data: {
                type,
                threshold,
                enabled,
                timestamp: new Date()
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('알림 설정 실패:', error);
        res.status(500).json({
            success: false,
            message: '알림 설정 중 오류가 발생했습니다.'
        });
    }
});
exports.default = router;
//# sourceMappingURL=monitoring.js.map