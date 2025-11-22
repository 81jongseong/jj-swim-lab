/**
 * 성능 최적화 API 라우트
 * 성능 분석, 캐시 관리, 쿼리 최적화 기능을 제공합니다.
 */

import { Router, Request, Response } from 'express';
import PerformanceAnalyzer from '../utils/performanceAnalyzer';
import CacheService from '../services/cacheService';
import QueryOptimizer from '../utils/queryOptimizer';
import { requireRole } from '../middleware/auth';
import { logInfo, logError, logWarn, logDebug } from '../utils/logger';

const router = Router();
const performanceAnalyzer = PerformanceAnalyzer.getInstance();
const cacheService = CacheService.getInstance();
const queryOptimizer = QueryOptimizer.getInstance();

/**
 * 성능 분석 리포트 조회
 * GET /api/performance/analysis
 */
router.get('/analysis', requireRole(['superAdmin']), async (req: Request, res: Response) => {
  try {
    const report = performanceAnalyzer.generatePerformanceReport();
    
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    logError('성능 분석 리포트 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '성능 분석 리포트 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * 성능 통계 조회
 * GET /api/performance/stats
 */
router.get('/stats', requireRole(['superAdmin', 'centerAdmin']), (req: Request, res: Response) => {
  try {
    const stats = performanceAnalyzer.getPerformanceStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logError('성능 통계 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '성능 통계 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * 느린 쿼리 조회
 * GET /api/performance/slow-queries?threshold=100
 */
router.get('/slow-queries', requireRole(['superAdmin']), (req: Request, res: Response) => {
  try {
    const threshold = parseInt(req.query.threshold as string) || 100;
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
  } catch (error) {
    logError('느린 쿼리 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '느린 쿼리 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * 성능이 나쁜 쿼리 조회
 * GET /api/performance/poor-queries?scoreThreshold=50
 */
router.get('/poor-queries', requireRole(['superAdmin']), (req: Request, res: Response) => {
  try {
    const scoreThreshold = parseInt(req.query.scoreThreshold as string) || 50;
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
  } catch (error) {
    logError('성능이 나쁜 쿼리 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '성능이 나쁜 쿼리 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * 컬렉션별 성능 통계 조회
 * GET /api/performance/collection-stats
 */
router.get('/collection-stats', requireRole(['superAdmin', 'centerAdmin']), (req: Request, res: Response) => {
  try {
    const collectionStats = queryOptimizer.getCollectionStats();
    
    res.json({
      success: true,
      data: collectionStats
    });
  } catch (error) {
    logError('컬렉션별 성능 통계 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '컬렉션별 성능 통계 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * 인덱스 권장사항 조회
 * GET /api/performance/index-recommendations?collection=users
 */
router.get('/index-recommendations', requireRole(['superAdmin']), (req: Request, res: Response) => {
  try {
    const { collection } = req.query;
    
    if (!collection) {
      return res.status(400).json({
        success: false,
        message: '컬렉션명이 필요합니다.'
      });
    }
    
    const recommendations = queryOptimizer.generateIndexRecommendations(collection as string);
    
    res.json({
      success: true,
      data: {
        collection,
        recommendations
      }
    });
  } catch (error) {
    logError('인덱스 권장사항 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '인덱스 권장사항 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * 쿼리 최적화 리포트 생성
 * GET /api/performance/optimization-report
 */
router.get('/optimization-report', requireRole(['superAdmin']), (req: Request, res: Response) => {
  try {
    const report = queryOptimizer.generateOptimizationReport();
    
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    logError('쿼리 최적화 리포트 생성 실패:', error);
    res.status(500).json({
      success: false,
      message: '쿼리 최적화 리포트 생성 중 오류가 발생했습니다.'
    });
  }
});

/**
 * 캐시 통계 조회
 * GET /api/performance/cache-stats
 */
router.get('/cache-stats', requireRole(['superAdmin', 'centerAdmin']), (req: Request, res: Response) => {
  try {
    const stats = cacheService.getCacheStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logError('캐시 통계 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '캐시 통계 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * 캐시 리포트 생성
 * GET /api/performance/cache-report
 */
router.get('/cache-report', requireRole(['superAdmin']), (req: Request, res: Response) => {
  try {
    const report = cacheService.generateCacheReport();
    
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    logError('캐시 리포트 생성 실패:', error);
    res.status(500).json({
      success: false,
      message: '캐시 리포트 생성 중 오류가 발생했습니다.'
    });
  }
});

/**
 * 캐시 무효화
 * POST /api/performance/cache/invalidate
 */
router.post('/cache/invalidate', requireRole(['superAdmin']), (req: Request, res: Response) => {
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
  } catch (error) {
    logError('캐시 무효화 실패:', error);
    res.status(500).json({
      success: false,
      message: '캐시 무효화 중 오류가 발생했습니다.'
    });
  }
});

/**
 * 캐시 정리
 * POST /api/performance/cache/cleanup
 */
router.post('/cache/cleanup', requireRole(['superAdmin']), (req: Request, res: Response) => {
  try {
    cacheService.cleanup();
    
    res.json({
      success: true,
      message: '캐시 정리가 완료되었습니다.'
    });
  } catch (error) {
    logError('캐시 정리 실패:', error);
    res.status(500).json({
      success: false,
      message: '캐시 정리 중 오류가 발생했습니다.'
    });
  }
});

/**
 * 모든 캐시 삭제
 * DELETE /api/performance/cache/clear
 */
router.delete('/cache/clear', requireRole(['superAdmin']), (req: Request, res: Response) => {
  try {
    cacheService.clear();
    
    res.json({
      success: true,
      message: '모든 캐시가 삭제되었습니다.'
    });
  } catch (error) {
    logError('캐시 삭제 실패:', error);
    res.status(500).json({
      success: false,
      message: '캐시 삭제 중 오류가 발생했습니다.'
    });
  }
});

/**
 * 성능 메트릭 초기화
 * DELETE /api/performance/metrics/clear
 */
router.delete('/metrics/clear', requireRole(['superAdmin']), (req: Request, res: Response) => {
  try {
    performanceAnalyzer.clearMetrics();
    queryOptimizer.clearHistory();
    
    res.json({
      success: true,
      message: '성능 메트릭이 초기화되었습니다.'
    });
  } catch (error) {
    logError('성능 메트릭 초기화 실패:', error);
    res.status(500).json({
      success: false,
      message: '성능 메트릭 초기화 중 오류가 발생했습니다.'
    });
  }
});

/**
 * 메모리 사용량 추적 시작
 * POST /api/performance/memory/track
 */
router.post('/memory/track', requireRole(['superAdmin']), (req: Request, res: Response) => {
  try {
    const { interval } = req.body; // 초 단위
    const trackingInterval = interval || 60; // 기본 1분
    
    // 기존 인터벌이 있다면 클리어
    if ((global as any).memoryTrackingInterval) {
      clearInterval((global as any).memoryTrackingInterval);
    }
    
    // 새로운 메모리 추적 시작
    (global as any).memoryTrackingInterval = setInterval(() => {
      performanceAnalyzer.trackMemoryUsage();
    }, trackingInterval * 1000);
    
    res.json({
      success: true,
      message: `메모리 사용량 추적이 시작되었습니다. (${trackingInterval}초 간격)`,
      data: {
        interval: trackingInterval
      }
    });
  } catch (error) {
    logError('메모리 추적 시작 실패:', error);
    res.status(500).json({
      success: false,
      message: '메모리 추적 시작 중 오류가 발생했습니다.'
    });
  }
});

/**
 * 메모리 사용량 추적 중지
 * DELETE /api/performance/memory/track
 */
router.delete('/memory/track', requireRole(['superAdmin']), (req: Request, res: Response) => {
  try {
    if ((global as any).memoryTrackingInterval) {
      clearInterval((global as any).memoryTrackingInterval);
      (global as any).memoryTrackingInterval = null;
    }
    
    res.json({
      success: true,
      message: '메모리 사용량 추적이 중지되었습니다.'
    });
  } catch (error) {
    logError('메모리 추적 중지 실패:', error);
    res.status(500).json({
      success: false,
      message: '메모리 추적 중지 중 오류가 발생했습니다.'
    });
  }
});

export default router;
