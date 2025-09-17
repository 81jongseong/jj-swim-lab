/**
 * 사용자 활동 API 라우트
 * 사용자 활동 로그 조회, 통계, 분석 기능을 제공합니다.
 */

import { Router, Request, Response } from 'express';
import UserActivityService from '../services/userActivityService';
import { requireRole } from '../middleware/auth';

const router = Router();
const activityService = UserActivityService.getInstance();

/**
 * 사용자 활동 통계 조회
 * GET /api/user-activities/stats/:userId?days=30
 */
router.get('/stats/:userId', requireRole(['superAdmin', 'centerAdmin']), async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const days = parseInt(req.query.days as string) || 30;
    
    const stats = await activityService.getUserActivityStats(userId, days);
    
    res.json({
      success: true,
      data: {
        userId,
        period: `${days}일`,
        stats
      }
    });
  } catch (error) {
    console.error('사용자 활동 통계 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '사용자 활동 통계 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * 사용자 활동 목록 조회
 * GET /api/user-activities/:userId?page=1&limit=50
 */
router.get('/:userId', requireRole(['superAdmin', 'centerAdmin']), async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    
    const filters: any = {};
    if (req.query.action) filters.action = req.query.action;
    if (req.query.resource) filters.resource = req.query.resource;
    if (req.query.success !== undefined) filters.success = req.query.success === 'true';
    if (req.query.startDate) filters.startDate = new Date(req.query.startDate as string);
    if (req.query.endDate) filters.endDate = new Date(req.query.endDate as string);
    
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
  } catch (error) {
    console.error('사용자 활동 목록 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '사용자 활동 목록 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * 활동 트렌드 조회
 * GET /api/user-activities/trends?days=30
 */
router.get('/trends/overview', requireRole(['superAdmin', 'centerAdmin']), async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    
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
  } catch (error) {
    console.error('활동 트렌드 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '활동 트렌드 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * 상위 활동 조회
 * GET /api/user-activities/top-actions?limit=10
 */
router.get('/top-actions/overview', requireRole(['superAdmin', 'centerAdmin']), async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    
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
  } catch (error) {
    console.error('상위 활동 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '상위 활동 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * 사용자 활동 요약 생성
 * GET /api/user-activities/summary/:userId?days=7
 */
router.get('/summary/:userId', requireRole(['superAdmin', 'centerAdmin']), async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const days = parseInt(req.query.days as string) || 7;
    
    const summary = await activityService.generateActivitySummary(userId, days);
    
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('사용자 활동 요약 생성 실패:', error);
    res.status(500).json({
      success: false,
      message: '사용자 활동 요약 생성 중 오류가 발생했습니다.'
    });
  }
});

/**
 * 의심스러운 활동 감지
 * GET /api/user-activities/suspicious/:userId?hours=24
 */
router.get('/suspicious/:userId', requireRole(['superAdmin']), async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const hours = parseInt(req.query.hours as string) || 24;
    
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
  } catch (error) {
    console.error('의심스러운 활동 감지 실패:', error);
    res.status(500).json({
      success: false,
      message: '의심스러운 활동 감지 중 오류가 발생했습니다.'
    });
  }
});

/**
 * 전체 시스템 활동 요약
 * GET /api/user-activities/system-summary?days=30
 */
router.get('/system-summary/overview', requireRole(['superAdmin']), async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    
    const [trends, topActions] = await Promise.all([
      activityService.getActivityTrends(days),
      activityService.getTopActions(10)
    ]);
    
    // 전체 통계 계산
    const totalActivities = trends.reduce((sum, trend) => sum + trend.count, 0);
    const totalSuccessfulActivities = trends.reduce((sum, trend) => sum + trend.successCount, 0);
    const overallSuccessRate = totalActivities > 0 ? (totalSuccessfulActivities / totalActivities) * 100 : 0;
    
    // 최근 활동량 (마지막 7일)
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
        trends: trends.slice(-14), // 최근 14일 트렌드
        topActions: topActions.slice(0, 5) // 상위 5개 활동
      }
    });
  } catch (error) {
    console.error('시스템 활동 요약 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '시스템 활동 요약 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * 사용자 활동 검색
 * GET /api/user-activities/search?q=keyword&page=1&limit=50
 */
router.get('/search/overview', requireRole(['superAdmin', 'centerAdmin']), async (req: Request, res: Response) => {
  try {
    const { q: query } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: '검색어가 필요합니다.'
      });
    }
    
    // 검색 필터 구성
    const filters: any = {
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
  } catch (error) {
    console.error('사용자 활동 검색 실패:', error);
    res.status(500).json({
      success: false,
      message: '사용자 활동 검색 중 오류가 발생했습니다.'
    });
  }
});

export default router;
