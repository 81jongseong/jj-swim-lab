"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = __importDefault(require("os"));
class SystemMonitor {
    constructor() {
        this.metrics = [];
        this.apiMetrics = [];
        this.userActivities = [];
        this.maxMetricsHistory = 1000;
        setInterval(() => {
            this.collectSystemMetrics();
        }, 5 * 60 * 1000);
        this.collectSystemMetrics();
    }
    static getInstance() {
        if (!SystemMonitor.instance) {
            SystemMonitor.instance = new SystemMonitor();
        }
        return SystemMonitor.instance;
    }
    collectSystemMetrics() {
        try {
            const totalMemory = os_1.default.totalmem();
            const freeMemory = os_1.default.freemem();
            const usedMemory = totalMemory - freeMemory;
            const memoryUsage = (usedMemory / totalMemory) * 100;
            const metrics = {
                timestamp: new Date(),
                cpu: {
                    usage: this.getCpuUsage(),
                    loadAverage: os_1.default.loadavg()
                },
                memory: {
                    total: totalMemory,
                    free: freeMemory,
                    used: usedMemory,
                    usage: memoryUsage
                },
                uptime: os_1.default.uptime(),
                nodeVersion: process.version,
                platform: os_1.default.platform()
            };
            this.metrics.push(metrics);
            if (this.metrics.length > this.maxMetricsHistory) {
                this.metrics = this.metrics.slice(-this.maxMetricsHistory);
            }
            console.log(`📊 시스템 메트릭 수집: CPU ${metrics.cpu.usage.toFixed(1)}%, 메모리 ${memoryUsage.toFixed(1)}%`);
        }
        catch (error) {
            console.error('❌ 시스템 메트릭 수집 실패:', error);
        }
    }
    getCpuUsage() {
        const cpus = os_1.default.cpus();
        let totalIdle = 0;
        let totalTick = 0;
        cpus.forEach(cpu => {
            for (const type in cpu.times) {
                totalTick += cpu.times[type];
            }
            totalIdle += cpu.times.idle;
        });
        return 100 - Math.round((totalIdle / totalTick) * 100);
    }
    recordApiRequest(req, res, duration) {
        const metric = {
            timestamp: new Date(),
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration,
            ip: req.ip || req.connection.remoteAddress || 'unknown',
            userAgent: req.get('User-Agent'),
            userId: req.user?.id || 'anonymous'
        };
        this.apiMetrics.push(metric);
        if (this.apiMetrics.length > this.maxMetricsHistory) {
            this.apiMetrics = this.apiMetrics.slice(-this.maxMetricsHistory);
        }
        if (duration > 1000) {
            console.warn(`⚠️ 느린 API 요청: ${req.method} ${req.url} - ${duration}ms`);
        }
        if (res.statusCode >= 400) {
            console.warn(`⚠️ API 에러: ${req.method} ${req.url} - ${res.statusCode}`);
        }
    }
    recordUserActivity(userId, action, details, ip) {
        const activity = {
            timestamp: new Date(),
            userId,
            action,
            details,
            ip
        };
        this.userActivities.push(activity);
        if (this.userActivities.length > this.maxMetricsHistory) {
            this.userActivities = this.userActivities.slice(-this.maxMetricsHistory);
        }
        console.log(`👤 사용자 활동: ${userId} - ${action}`);
    }
    getCurrentStatus() {
        return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
    }
    getRecentApiMetrics(limit = 100) {
        return this.apiMetrics.slice(-limit);
    }
    getRecentUserActivities(limit = 100) {
        return this.userActivities.slice(-limit);
    }
    getSystemMetricsHistory(limit = 100) {
        return this.metrics.slice(-limit);
    }
    getPerformanceStats() {
        const recentApiMetrics = this.getRecentApiMetrics(100);
        if (recentApiMetrics.length === 0) {
            return {
                totalRequests: 0,
                averageResponseTime: 0,
                errorRate: 0,
                slowRequests: 0
            };
        }
        const totalRequests = recentApiMetrics.length;
        const totalDuration = recentApiMetrics.reduce((sum, metric) => sum + metric.duration, 0);
        const averageResponseTime = totalDuration / totalRequests;
        const errorRequests = recentApiMetrics.filter(metric => metric.statusCode >= 400).length;
        const errorRate = (errorRequests / totalRequests) * 100;
        const slowRequests = recentApiMetrics.filter(metric => metric.duration > 1000).length;
        return {
            totalRequests,
            averageResponseTime: Math.round(averageResponseTime),
            errorRate: Math.round(errorRate * 100) / 100,
            slowRequests,
            successRate: Math.round((100 - errorRate) * 100) / 100
        };
    }
    getSystemSummary() {
        const currentStatus = this.getCurrentStatus();
        const performanceStats = this.getPerformanceStats();
        const recentActivities = this.getRecentUserActivities(10);
        return {
            timestamp: new Date(),
            system: currentStatus,
            performance: performanceStats,
            recentActivities: recentActivities.length,
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage()
        };
    }
}
exports.default = SystemMonitor;
//# sourceMappingURL=systemMonitor.js.map