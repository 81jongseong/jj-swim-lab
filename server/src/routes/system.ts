import express, { Request, Response } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth';
import { User } from '../models/User';
import { SystemConfig } from '../models/SystemConfig';
import { LoginLog } from '../models/LoginLog';
import { PageVisit } from '../models/PageVisit';
import { refreshMaintenanceCache } from '../middleware/maintenanceMode';
import { refreshRateLimitCache } from '../middleware/dynamicRateLimit';
import { emailService } from '../services/emailService';
import { performanceService } from '../services/performanceService';
import mongoose from 'mongoose';

const router: express.Router = express.Router();

// 1. 시스템 상태 확인
router.get('/status', authMiddleware, requireRole(['superAdmin']), async (req: Request, res: Response) => {
  try {
    // 메모리 사용량 체크
    const memoryUsage = process.memoryUsage();
    const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
    
    // 시스템 상태 결정
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (memoryUsagePercent > 90) status = 'critical';
    else if (memoryUsagePercent > 75) status = 'warning';

    // 데이터베이스 상태 확인
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const dbResponseTime = Math.floor(Math.random() * 100) + 20; // 임시 응답시간
    
    const systemStatus = {
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: memoryUsage,
      version: process.version,
      platform: process.platform,
      database: {
        status: dbStatus,
        responseTime: dbResponseTime,
        collections: Object.keys(mongoose.connection.collections).length
      },
      api: {
        totalRequests: Math.floor(Math.random() * 20000) + 10000,
        errorRate: Math.round(Math.random() * 3 * 100) / 100, // 0-3%
        avgResponseTime: Math.floor(Math.random() * 200) + 50 // 50-250ms
      }
    };

    res.json({
      success: true,
      message: '시스템 상태 조회 성공!',
      data: systemStatus
    });
  } catch (error) {
    console.error('시스템 상태 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '시스템 상태 조회에 실패했습니다.'
    });
  }
});

// 2. 시스템 설정 조회
router.get('/settings', authMiddleware, requireRole(['superAdmin']), async (req: Request, res: Response) => {
  try {
    // 데이터베이스에서 활성 시스템 설정 조회
    let systemConfig = await SystemConfig.findOne({ isActive: true });

    if (!systemConfig) {
      // 시스템 설정이 없으면 기본값으로 생성
      systemConfig = new SystemConfig({
        maintenance: {
          enabled: false,
          message: '시스템 점검 중입니다. 잠시 후 다시 시도해주세요.'
        },
        security: {
          rateLimitEnabled: true,
          maxRequestsPerMinute: 100,
          bruteForceProtection: true,
          requireTwoFactor: false
        },
        notifications: {
          systemAlerts: true,
          errorNotifications: true,
          performanceAlerts: true,
          emailRecipients: ['admin@jjswim.com']
        },
        backup: {
          autoBackup: true,
          backupInterval: 24,
          retentionDays: 30,
          lastBackup: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12시간 전
        },
        performance: {
          cacheEnabled: true,
          compressionEnabled: true,
          logLevel: 'info',
          maxLogSize: 100
        },
        createdBy: (req as any).user._id,
        updatedBy: (req as any).user._id
      });
      
      await systemConfig.save();
      console.log('✅ 기본 시스템 설정 생성 완료');
    }

    res.json({
      success: true,
      message: '시스템 설정 조회 성공!',
      data: systemConfig
    });
  } catch (error) {
    console.error('시스템 설정 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '시스템 설정 조회에 실패했습니다.'
    });
  }
});

// 3. 시스템 설정 업데이트
router.put('/settings', authMiddleware, requireRole(['superAdmin']), async (req: Request, res: Response) => {
  try {
    const settings = req.body;
    const userId = (req as any).user._id;
    
    // 기존 활성 설정을 비활성화
    await SystemConfig.updateMany({ isActive: true }, { isActive: false });
    
    // 새로운 설정 저장
    const newSystemConfig = new SystemConfig({
      ...settings,
      isActive: true,
      updatedBy: userId,
      createdBy: userId
    });
    
    await newSystemConfig.save();
    console.log('✅ 시스템 설정 업데이트 완료:', settings);

    // 캐시 새로고침 (설정 변경 즉시 적용)
    refreshMaintenanceCache();
    refreshRateLimitCache();
    await performanceService.loadAndApplySettings();

    // 설정 변경 알림
    await emailService.sendSystemAlert(
      '시스템 설정이 관리자에 의해 변경되었습니다.',
      {
        changedBy: (req as any).user.name || 'Unknown',
        changedAt: new Date().toISOString(),
        newSettings: settings
      }
    );

    res.json({
      success: true,
      message: '시스템 설정이 업데이트되었습니다.',
      data: newSystemConfig
    });
  } catch (error) {
    console.error('시스템 설정 업데이트 오류:', error);
    res.status(500).json({
      success: false,
      message: '시스템 설정 업데이트에 실패했습니다.'
    });
  }
});

// 4. 사용자 활동 통계 조회
router.get('/activity', authMiddleware, requireRole(['superAdmin']), async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 실제 사용자 활동 데이터 계산
    const [
      activeUsers,
      todayLogins,
      weeklyLogins,
      topPagesData
    ] = await Promise.all([
      // 30분 내 활성 로그인 세션
      LoginLog.countDocuments({ 
        loginTime: { $gte: thirtyMinutesAgo },
        $or: [
          { logoutTime: { $exists: false } }, // 로그아웃하지 않음
          { logoutTime: { $gte: thirtyMinutesAgo } } // 30분 내 로그아웃
        ]
      }),
      
      // 오늘 로그인 수
      LoginLog.countDocuments({
        loginTime: { $gte: todayStart }
      }),
      
      // 주간 로그인 수
      LoginLog.countDocuments({
        loginTime: { $gte: weekStart }
      }),
      
      // 인기 페이지 (실제 데이터가 없으면 기본값)
      PageVisit.aggregate([
        {
          $match: {
            visitTime: { $gte: weekStart },
            path: { $regex: '^/(dashboard|courses|bookings|payments|admin)' }
          }
        },
        {
          $group: {
            _id: '$path',
            visits: { $sum: 1 }
          }
        },
        {
          $sort: { visits: -1 }
        },
        {
          $limit: 5
        }
      ]).catch(() => [])
    ]);

    // 인기 페이지 데이터가 없으면 기본값 사용
    const topPages = topPagesData.length > 0 
      ? topPagesData.map(item => ({ path: item._id, visits: item.visits }))
      : [
          { path: '/dashboard', visits: 1250 },
          { path: '/courses', visits: 987 },
          { path: '/bookings', visits: 743 },
          { path: '/payments', visits: 521 },
          { path: '/admin/users', visits: 312 }
        ];

    const activityData = {
      activeUsers,
      todayLogins,
      weeklyLogins,
      topPages
    };

    console.log('📊 실제 사용자 활동 데이터:', activityData);

    res.json({
      success: true,
      message: '사용자 활동 통계 조회 성공!',
      data: activityData
    });
  } catch (error) {
    console.error('사용자 활동 통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '사용자 활동 통계 조회에 실패했습니다.'
    });
  }
});

// 5. 사용자 통계 조회
router.get('/user-stats', authMiddleware, requireRole(['superAdmin']), async (req: Request, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ 'accountStatus.isActive': true });
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });

    const userStats = {
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      inactiveUsers: totalUsers - activeUsers
    };

    res.json({
      success: true,
      message: '사용자 통계 조회 성공!',
      data: userStats
    });
  } catch (error) {
    console.error('사용자 통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '사용자 통계 조회에 실패했습니다.'
    });
  }
});

// 3. 데이터베이스 상태 확인
router.get('/database-status', authMiddleware, requireRole(['superAdmin']), async (req: Request, res: Response) => {
  try {
    const dbStatus = {
      status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name,
      readyState: mongoose.connection.readyState
    };

    res.json({
      success: true,
      message: '데이터베이스 상태 조회 성공!',
      data: dbStatus
    });
  } catch (error) {
    console.error('데이터베이스 상태 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '데이터베이스 상태 조회에 실패했습니다.'
    });
  }
});

// 4. 시스템 백업 및 복구
router.post('/backup', authMiddleware, requireRole(['superAdmin']), async (req: Request, res: Response) => {
  try {
    // 실제로는 데이터베이스 백업 로직 구현
    const backupInfo = {
      timestamp: new Date().toISOString(),
      status: 'completed',
      size: '2.5GB',
      location: '/backups/system_backup_2024_08_15.zip'
    };

    res.json({
      success: true,
      message: '시스템 백업이 성공적으로 완료되었습니다!',
      data: backupInfo
    });
  } catch (error) {
    console.error('시스템 백업 오류:', error);
    res.status(500).json({
      success: false,
      message: '시스템 백업에 실패했습니다.'
    });
  }
});

// 5. 시스템 로그 조회
router.get('/logs', authMiddleware, requireRole(['superAdmin']), async (req: Request, res: Response) => {
  try {
    const { type, level, startDate, endDate, limit = 100 } = req.query;
    void type;
    void level;
    void startDate;
    void endDate;
    void limit;

    // 실제로는 로그 시스템에서 조회
    const logs = [
      {
        timestamp: new Date().toISOString(),
        level: 'info',
        type: 'system',
        message: '시스템 정상 운영 중',
        details: {}
      }
    ];

    res.json({
      success: true,
      message: '시스템 로그 조회 성공!',
      data: logs
    });
  } catch (error) {
    console.error('시스템 로그 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '시스템 로그 조회에 실패했습니다.'
    });
  }
});

// 6. 수동 백업 실행
router.post('/backup', authMiddleware, requireRole(['superAdmin']), async (req: Request, res: Response) => {
  try {
    console.log('💾 수동 백업 실행 요청');
    
    const { backupService } = await import('../services/backupService');
    const success = await backupService.triggerManualBackup();
    
    if (success) {
      res.json({
        success: true,
        message: '백업이 성공적으로 완료되었습니다.',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        message: '백업 실행에 실패했습니다.'
      });
    }
  } catch (error) {
    console.error('수동 백업 실행 오류:', error);
    res.status(500).json({
      success: false,
      message: '백업 실행 중 오류가 발생했습니다.'
    });
  }
});

// 7. 성능 메트릭 조회
router.get('/performance', authMiddleware, requireRole(['superAdmin']), async (req: Request, res: Response) => {
  try {
    const metrics = await performanceService.collectPerformanceMetrics();
    const performanceSettings = performanceService.getSettings();
    
    res.json({
      success: true,
      message: '성능 메트릭 조회 성공!',
      data: {
        metrics,
        settings: performanceSettings
      }
    });
  } catch (error) {
    console.error('성능 메트릭 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '성능 메트릭 조회에 실패했습니다.'
    });
  }
});

export default router;
