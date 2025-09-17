"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const perf_hooks_1 = require("perf_hooks");
const mongoose_1 = __importDefault(require("mongoose"));
class PerformanceAnalyzer {
    constructor() {
        this.metrics = [];
        this.queryMetrics = [];
        this.maxMetricsHistory = 1000;
        this.setupMongoDBProfiling();
    }
    static getInstance() {
        if (!PerformanceAnalyzer.instance) {
            PerformanceAnalyzer.instance = new PerformanceAnalyzer();
        }
        return PerformanceAnalyzer.instance;
    }
    setupMongoDBProfiling() {
        if (process.env.NODE_ENV === 'development') {
            mongoose_1.default.connection.on('connected', () => {
                console.log('📊 MongoDB 프로파일러 활성화됨 (Mongoose 디버그 모드)');
            });
        }
    }
    async measureFunction(name, fn, metadata) {
        const startTime = perf_hooks_1.performance.now();
        const startMemory = process.memoryUsage();
        try {
            const result = await fn();
            const endTime = perf_hooks_1.performance.now();
            const endMemory = process.memoryUsage();
            this.recordMetric({
                id: `func_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name,
                type: 'function',
                startTime,
                endTime,
                duration: endTime - startTime,
                memoryUsage: {
                    rss: endMemory.rss - startMemory.rss,
                    heapTotal: endMemory.heapTotal - startMemory.heapTotal,
                    heapUsed: endMemory.heapUsed - startMemory.heapUsed,
                    external: endMemory.external - startMemory.external,
                    arrayBuffers: endMemory.arrayBuffers - startMemory.arrayBuffers
                },
                metadata
            });
            return result;
        }
        catch (error) {
            const endTime = perf_hooks_1.performance.now();
            this.recordMetric({
                id: `func_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name,
                type: 'function',
                startTime,
                endTime,
                duration: endTime - startTime,
                metadata: { ...metadata, error: error.message }
            });
            throw error;
        }
    }
    measureApiRequest(req, res) {
        const startTime = perf_hooks_1.performance.now();
        const startMemory = process.memoryUsage();
        res.on('finish', () => {
            const endTime = perf_hooks_1.performance.now();
            const endMemory = process.memoryUsage();
            this.recordMetric({
                id: `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: `${req.method} ${req.url}`,
                type: 'api',
                startTime,
                endTime,
                duration: endTime - startTime,
                memoryUsage: {
                    rss: endMemory.rss - startMemory.rss,
                    heapTotal: endMemory.heapTotal - startMemory.heapTotal,
                    heapUsed: endMemory.heapUsed - startMemory.heapUsed,
                    external: endMemory.external - startMemory.external,
                    arrayBuffers: endMemory.arrayBuffers - startMemory.arrayBuffers
                },
                metadata: {
                    method: req.method,
                    url: req.url,
                    statusCode: res.statusCode,
                    userAgent: req.get('User-Agent'),
                    ip: req.ip
                }
            });
        });
    }
    async measureQuery(operation, collection, queryFn, metadata) {
        const startTime = perf_hooks_1.performance.now();
        try {
            const result = await queryFn();
            const endTime = perf_hooks_1.performance.now();
            const queryMetric = {
                operation,
                collection,
                duration: endTime - startTime,
                documentsExamined: 0,
                documentsReturned: Array.isArray(result) ? result.length : 1,
                indexUsed: false,
                executionStats: metadata
            };
            this.queryMetrics.push(queryMetric);
            if (this.queryMetrics.length > this.maxMetricsHistory) {
                this.queryMetrics = this.queryMetrics.slice(-this.maxMetricsHistory);
            }
            return result;
        }
        catch (error) {
            const endTime = perf_hooks_1.performance.now();
            this.queryMetrics.push({
                operation,
                collection,
                duration: endTime - startTime,
                documentsExamined: 0,
                documentsReturned: 0,
                indexUsed: false,
                executionStats: { error: error.message }
            });
            throw error;
        }
    }
    recordMetric(metric) {
        this.metrics.push(metric);
        if (this.metrics.length > this.maxMetricsHistory) {
            this.metrics = this.metrics.slice(-this.maxMetricsHistory);
        }
        if (metric.duration > 1000) {
            console.warn(`⚠️ 느린 작업 감지: ${metric.name} - ${metric.duration.toFixed(2)}ms`);
        }
    }
    getPerformanceStats() {
        const recentMetrics = this.metrics.slice(-100);
        const recentQueries = this.queryMetrics.slice(-100);
        if (recentMetrics.length === 0) {
            return {
                totalMetrics: 0,
                averageDuration: 0,
                slowOperations: 0,
                memoryUsage: process.memoryUsage()
            };
        }
        const totalDuration = recentMetrics.reduce((sum, m) => sum + m.duration, 0);
        const averageDuration = totalDuration / recentMetrics.length;
        const slowOperations = recentMetrics.filter(m => m.duration > 1000).length;
        const functionMetrics = recentMetrics.filter(m => m.type === 'function');
        const functionStats = functionMetrics.reduce((acc, m) => {
            if (!acc[m.name]) {
                acc[m.name] = { count: 0, totalDuration: 0, averageDuration: 0 };
            }
            acc[m.name].count++;
            acc[m.name].totalDuration += m.duration;
            acc[m.name].averageDuration = acc[m.name].totalDuration / acc[m.name].count;
            return acc;
        }, {});
        const queryStats = recentQueries.reduce((acc, q) => {
            if (!acc[q.collection]) {
                acc[q.collection] = { count: 0, totalDuration: 0, averageDuration: 0 };
            }
            acc[q.collection].count++;
            acc[q.collection].totalDuration += q.duration;
            acc[q.collection].averageDuration = acc[q.collection].totalDuration / acc[q.collection].count;
            return acc;
        }, {});
        return {
            totalMetrics: recentMetrics.length,
            averageDuration: Math.round(averageDuration * 100) / 100,
            slowOperations,
            memoryUsage: process.memoryUsage(),
            functionStats,
            queryStats,
            recommendations: this.generateRecommendations(functionStats, queryStats)
        };
    }
    generateRecommendations(functionStats, queryStats) {
        const recommendations = [];
        Object.entries(functionStats).forEach(([name, stats]) => {
            if (stats.averageDuration > 500) {
                recommendations.push(`함수 '${name}'의 평균 실행 시간이 ${stats.averageDuration.toFixed(2)}ms입니다. 최적화를 고려해보세요.`);
            }
        });
        Object.entries(queryStats).forEach(([collection, stats]) => {
            if (stats.averageDuration > 100) {
                recommendations.push(`컬렉션 '${collection}'의 평균 쿼리 시간이 ${stats.averageDuration.toFixed(2)}ms입니다. 인덱스 추가를 고려해보세요.`);
            }
        });
        const memoryUsage = process.memoryUsage();
        const memoryUsageMB = memoryUsage.heapUsed / 1024 / 1024;
        if (memoryUsageMB > 100) {
            recommendations.push(`힙 메모리 사용량이 ${memoryUsageMB.toFixed(2)}MB입니다. 메모리 누수를 확인해보세요.`);
        }
        return recommendations;
    }
    getSlowQueries(threshold = 100) {
        return this.queryMetrics.filter(q => q.duration > threshold);
    }
    trackMemoryUsage() {
        const memoryUsage = process.memoryUsage();
        this.recordMetric({
            id: `memory_${Date.now()}`,
            name: 'Memory Usage',
            type: 'memory',
            startTime: perf_hooks_1.performance.now(),
            endTime: perf_hooks_1.performance.now(),
            duration: 0,
            memoryUsage,
            metadata: { timestamp: new Date() }
        });
    }
    generatePerformanceReport() {
        const stats = this.getPerformanceStats();
        const slowQueries = this.getSlowQueries();
        return {
            timestamp: new Date(),
            summary: {
                totalMetrics: stats.totalMetrics,
                averageDuration: stats.averageDuration,
                slowOperations: stats.slowOperations,
                slowQueries: slowQueries.length,
                memoryUsage: stats.memoryUsage
            },
            functionPerformance: stats.functionStats,
            queryPerformance: stats.queryStats,
            slowQueries: slowQueries.slice(-10),
            recommendations: stats.recommendations
        };
    }
    clearMetrics() {
        this.metrics = [];
        this.queryMetrics = [];
        console.log('📊 성능 메트릭이 초기화되었습니다.');
    }
}
exports.default = PerformanceAnalyzer;
//# sourceMappingURL=performanceAnalyzer.js.map