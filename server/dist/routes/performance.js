"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const performanceAnalyzer_1 = __importDefault(require("../utils/performanceAnalyzer"));
const cacheService_1 = __importDefault(require("../services/cacheService"));
const queryOptimizer_1 = __importDefault(require("../utils/queryOptimizer"));
const auth_1 = require("../middleware/auth");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
const performanceAnalyzer = performanceAnalyzer_1.default.getInstance();
const cacheService = cacheService_1.default.getInstance();
const queryOptimizer = queryOptimizer_1.default.getInstance();
router.get('/analysis', (0, auth_1.requireRole)(['superAdmin']), async (req, res) => {
    try {
        const report = performanceAnalyzer.generatePerformanceReport();
        res.json({
            success: true,
            data: report
        });
    }
    catch (error) {
        (0, logger_1.logError)('성능 분석 리포트 조회 실패:', error);
        res.status(500).json({
            success: false,
            message: '성능 분석 리포트 조회 중 오류가 발생했습니다.'
        });
    }
});
router.get('/stats', (0, auth_1.requireRole)(['superAdmin', 'centerAdmin']), (req, res) => {
    try {
        const stats = performanceAnalyzer.getPerformanceStats();
        res.json({
            success: true,
            data: stats
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
router.get('/slow-queries', (0, auth_1.requireRole)(['superAdmin']), (req, res) => {
    try {
        const threshold = parseInt(req.query.threshold) || 100;
        const slowQueries = queryOptimizer.getSlowQueries(threshold);
        res.json({
            success: true,
            data: {
                threshold,
                slowQueries: slowQueries.map(query => ({
                    query: query.query,
                    collection: query.collection,
                    executionTime: query.executionTime,
                    documentsExamined: query.documentsExamined,
                    documentsReturned: query.documentsReturned,
                    indexUsed: query.indexUsed,
                    score: query.score,
                    recommendations: query.recommendations
                }))
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('느린 쿼리 조회 실패:', error);
        res.status(500).json({
            success: false,
            message: '느린 쿼리 조회 중 오류가 발생했습니다.'
        });
    }
});
router.get('/poor-queries', (0, auth_1.requireRole)(['superAdmin']), (req, res) => {
    try {
        const scoreThreshold = parseInt(req.query.scoreThreshold) || 50;
        const poorQueries = queryOptimizer.getPoorPerformingQueries(scoreThreshold);
        res.json({
            success: true,
            data: {
                scoreThreshold,
                poorQueries: poorQueries.map(query => ({
                    query: query.query,
                    collection: query.collection,
                    executionTime: query.executionTime,
                    score: query.score,
                    recommendations: query.recommendations
                }))
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('성능이 나쁜 쿼리 조회 실패:', error);
        res.status(500).json({
            success: false,
            message: '성능이 나쁜 쿼리 조회 중 오류가 발생했습니다.'
        });
    }
});
router.get('/collection-stats', (0, auth_1.requireRole)(['superAdmin', 'centerAdmin']), (req, res) => {
    try {
        const collectionStats = queryOptimizer.getCollectionStats();
        res.json({
            success: true,
            data: collectionStats
        });
    }
    catch (error) {
        (0, logger_1.logError)('컬렉션별 성능 통계 조회 실패:', error);
        res.status(500).json({
            success: false,
            message: '컬렉션별 성능 통계 조회 중 오류가 발생했습니다.'
        });
    }
});
router.get('/index-recommendations', (0, auth_1.requireRole)(['superAdmin']), (req, res) => {
    try {
        const { collection } = req.query;
        if (!collection) {
            return res.status(400).json({
                success: false,
                message: '컬렉션명이 필요합니다.'
            });
        }
        const recommendations = queryOptimizer.generateIndexRecommendations(collection);
        res.json({
            success: true,
            data: {
                collection,
                recommendations
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('인덱스 권장사항 조회 실패:', error);
        res.status(500).json({
            success: false,
            message: '인덱스 권장사항 조회 중 오류가 발생했습니다.'
        });
    }
});
router.get('/optimization-report', (0, auth_1.requireRole)(['superAdmin']), (req, res) => {
    try {
        const report = queryOptimizer.generateOptimizationReport();
        res.json({
            success: true,
            data: report
        });
    }
    catch (error) {
        (0, logger_1.logError)('쿼리 최적화 리포트 생성 실패:', error);
        res.status(500).json({
            success: false,
            message: '쿼리 최적화 리포트 생성 중 오류가 발생했습니다.'
        });
    }
});
router.get('/cache-stats', (0, auth_1.requireRole)(['superAdmin', 'centerAdmin']), (req, res) => {
    try {
        const stats = cacheService.getCacheStats();
        res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        (0, logger_1.logError)('캐시 통계 조회 실패:', error);
        res.status(500).json({
            success: false,
            message: '캐시 통계 조회 중 오류가 발생했습니다.'
        });
    }
});
router.get('/cache-report', (0, auth_1.requireRole)(['superAdmin']), (req, res) => {
    try {
        const report = cacheService.generateCacheReport();
        res.json({
            success: true,
            data: report
        });
    }
    catch (error) {
        (0, logger_1.logError)('캐시 리포트 생성 실패:', error);
        res.status(500).json({
            success: false,
            message: '캐시 리포트 생성 중 오류가 발생했습니다.'
        });
    }
});
router.post('/cache/invalidate', (0, auth_1.requireRole)(['superAdmin']), (req, res) => {
    try {
        const { pattern } = req.body;
        if (!pattern) {
            return res.status(400).json({
                success: false,
                message: '무효화할 패턴이 필요합니다.'
            });
        }
        const deletedCount = cacheService.invalidatePattern(pattern);
        res.json({
            success: true,
            message: `캐시 무효화 완료: ${deletedCount}개 항목 삭제`,
            data: {
                pattern,
                deletedCount
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('캐시 무효화 실패:', error);
        res.status(500).json({
            success: false,
            message: '캐시 무효화 중 오류가 발생했습니다.'
        });
    }
});
router.post('/cache/cleanup', (0, auth_1.requireRole)(['superAdmin']), (req, res) => {
    try {
        cacheService.cleanup();
        res.json({
            success: true,
            message: '캐시 정리가 완료되었습니다.'
        });
    }
    catch (error) {
        (0, logger_1.logError)('캐시 정리 실패:', error);
        res.status(500).json({
            success: false,
            message: '캐시 정리 중 오류가 발생했습니다.'
        });
    }
});
router.delete('/cache/clear', (0, auth_1.requireRole)(['superAdmin']), (req, res) => {
    try {
        cacheService.clear();
        res.json({
            success: true,
            message: '모든 캐시가 삭제되었습니다.'
        });
    }
    catch (error) {
        (0, logger_1.logError)('캐시 삭제 실패:', error);
        res.status(500).json({
            success: false,
            message: '캐시 삭제 중 오류가 발생했습니다.'
        });
    }
});
router.delete('/metrics/clear', (0, auth_1.requireRole)(['superAdmin']), (req, res) => {
    try {
        performanceAnalyzer.clearMetrics();
        queryOptimizer.clearHistory();
        res.json({
            success: true,
            message: '성능 메트릭이 초기화되었습니다.'
        });
    }
    catch (error) {
        (0, logger_1.logError)('성능 메트릭 초기화 실패:', error);
        res.status(500).json({
            success: false,
            message: '성능 메트릭 초기화 중 오류가 발생했습니다.'
        });
    }
});
router.post('/memory/track', (0, auth_1.requireRole)(['superAdmin']), (req, res) => {
    try {
        const { interval } = req.body;
        const trackingInterval = interval || 60;
        if (global.memoryTrackingInterval) {
            clearInterval(global.memoryTrackingInterval);
        }
        global.memoryTrackingInterval = setInterval(() => {
            performanceAnalyzer.trackMemoryUsage();
        }, trackingInterval * 1000);
        res.json({
            success: true,
            message: `메모리 사용량 추적이 시작되었습니다. (${trackingInterval}초 간격)`,
            data: {
                interval: trackingInterval
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)('메모리 추적 시작 실패:', error);
        res.status(500).json({
            success: false,
            message: '메모리 추적 시작 중 오류가 발생했습니다.'
        });
    }
});
router.delete('/memory/track', (0, auth_1.requireRole)(['superAdmin']), (req, res) => {
    try {
        if (global.memoryTrackingInterval) {
            clearInterval(global.memoryTrackingInterval);
            global.memoryTrackingInterval = null;
        }
        res.json({
            success: true,
            message: '메모리 사용량 추적이 중지되었습니다.'
        });
    }
    catch (error) {
        (0, logger_1.logError)('메모리 추적 중지 실패:', error);
        res.status(500).json({
            success: false,
            message: '메모리 추적 중지 중 오류가 발생했습니다.'
        });
    }
});
exports.default = router;
//# sourceMappingURL=performance.js.map