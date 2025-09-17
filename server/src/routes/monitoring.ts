/**
 * 모니터링 API 라우트
 * 시스템 상태, 성능 메트릭, 사용자 활동을 조회할 수 있는 엔드포인트를 제공합니다.
 */

import { Router, Request, Response } from 'express';
import SystemMonitor from '../monitoring/systemMonitor';
import { requireRole } from '../middleware/auth';

const router = Router();
const monitor = SystemMonitor.getInstance();

/**
 * 시스템 상태 조회
 * GET /api/monitoring/status
 */
router.get('/status', requireRole(['superAdmin', 'centerAdmin']), (req: Request, res: Response) => {
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
  } catch (error) {
    console.error('시스템 상태 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '시스템 상태 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * 성능 통계 조회
 * GET /api/monitoring/performance
 */
router.get('/performance', requireRole(['superAdmin', 'centerAdmin']), (req: Request, res: Response) => {
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
  } catch (error) {
    console.error('성능 통계 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '성능 통계 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * 최근 API 요청 조회
 * GET /api/monitoring/api-requests?limit=50
 */
router.get('/api-requests', requireRole(['superAdmin', 'centerAdmin']), (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
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
  } catch (error) {
    console.error('API 요청 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: 'API 요청 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * 사용자 활동 조회
 * GET /api/monitoring/user-activities?limit=50
 */
router.get('/user-activities', requireRole(['superAdmin', 'centerAdmin']), (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
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
  } catch (error) {
    console.error('사용자 활동 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '사용자 활동 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * 시스템 메트릭 히스토리 조회
 * GET /api/monitoring/metrics-history?limit=100
 */
router.get('/metrics-history', requireRole(['superAdmin', 'centerAdmin']), (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
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
  } catch (error) {
    console.error('메트릭 히스토리 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '메트릭 히스토리 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * 시스템 요약 정보 조회
 * GET /api/monitoring/summary
 */
router.get('/summary', requireRole(['superAdmin', 'centerAdmin']), (req: Request, res: Response) => {
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
  } catch (error) {
    console.error('시스템 요약 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '시스템 요약 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * 실시간 알림 설정
 * POST /api/monitoring/alerts
 */
router.post('/alerts', requireRole(['superAdmin']), (req: Request, res: Response) => {
  try {
    const { type, threshold, enabled } = req.body;
    
    // 알림 설정 로직 (향후 구현)
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
  } catch (error) {
    console.error('알림 설정 실패:', error);
    res.status(500).json({
      success: false,
      message: '알림 설정 중 오류가 발생했습니다.'
    });
  }
});

export default router;
