/**
 * 시스템 모니터링 서비스
 * 실시간 서버 상태, 성능 지표, 사용자 활동을 추적합니다.
 */

import os from 'os';
import { Request, Response } from 'express';

// 시스템 메트릭 인터페이스
interface SystemMetrics {
  timestamp: Date;
  cpu: {
    usage: number;
    loadAverage: number[];
  };
  memory: {
    total: number;
    free: number;
    used: number;
    usage: number;
  };
  uptime: number;
  nodeVersion: string;
  platform: string;
}

// API 요청 메트릭 인터페이스
interface ApiMetrics {
  timestamp: Date;
  method: string;
  url: string;
  statusCode: number;
  duration: number;
  ip: string;
  userAgent?: string;
  userId?: string;
}

// 사용자 활동 메트릭 인터페이스
interface UserActivity {
  timestamp: Date;
  userId: string;
  action: string;
  details: any;
  ip: string;
}

class SystemMonitor {
  private static instance: SystemMonitor;
  private metrics: SystemMetrics[] = [];
  private apiMetrics: ApiMetrics[] = [];
  private userActivities: UserActivity[] = [];
  private maxMetricsHistory = 1000; // 최대 저장할 메트릭 수

  private constructor() {
    // 주기적으로 시스템 메트릭 수집 (5분마다)
    setInterval(() => {
      this.collectSystemMetrics();
    }, 5 * 60 * 1000);

    // 초기 메트릭 수집
    this.collectSystemMetrics();
  }

  public static getInstance(): SystemMonitor {
    if (!SystemMonitor.instance) {
      SystemMonitor.instance = new SystemMonitor();
    }
    return SystemMonitor.instance;
  }

  /**
   * 시스템 메트릭 수집
   */
  private collectSystemMetrics(): void {
    try {
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const usedMemory = totalMemory - freeMemory;
      const memoryUsage = (usedMemory / totalMemory) * 100;

      const metrics: SystemMetrics = {
        timestamp: new Date(),
        cpu: {
          usage: this.getCpuUsage(),
          loadAverage: os.loadavg()
        },
        memory: {
          total: totalMemory,
          free: freeMemory,
          used: usedMemory,
          usage: memoryUsage
        },
        uptime: os.uptime(),
        nodeVersion: process.version,
        platform: os.platform()
      };

      this.metrics.push(metrics);
      
      // 메트릭 히스토리 크기 제한
      if (this.metrics.length > this.maxMetricsHistory) {
        this.metrics = this.metrics.slice(-this.maxMetricsHistory);
      }

      console.log(`📊 시스템 메트릭 수집: CPU ${metrics.cpu.usage.toFixed(1)}%, 메모리 ${memoryUsage.toFixed(1)}%`);
    } catch (error) {
      console.error('❌ 시스템 메트릭 수집 실패:', error);
    }
  }

  /**
   * CPU 사용률 계산 (간단한 방법)
   */
  private getCpuUsage(): number {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type as keyof typeof cpu.times];
      }
      totalIdle += cpu.times.idle;
    });

    return 100 - Math.round((totalIdle / totalTick) * 100);
  }

  /**
   * API 요청 메트릭 기록
   */
  public recordApiRequest(req: Request, res: Response, duration: number): void {
    const metric: ApiMetrics = {
      timestamp: new Date(),
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      ip: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent'),
      userId: (req as any).user?.id || 'anonymous'
    };

    this.apiMetrics.push(metric);

    // API 메트릭 히스토리 크기 제한
    if (this.apiMetrics.length > this.maxMetricsHistory) {
      this.apiMetrics = this.apiMetrics.slice(-this.maxMetricsHistory);
    }

    // 느린 요청 경고 (1초 이상)
    if (duration > 1000) {
      console.warn(`⚠️ 느린 API 요청: ${req.method} ${req.url} - ${duration}ms`);
    }

    // 에러 상태 코드 경고
    if (res.statusCode >= 400) {
      console.warn(`⚠️ API 에러: ${req.method} ${req.url} - ${res.statusCode}`);
    }
  }

  /**
   * 사용자 활동 기록
   */
  public recordUserActivity(userId: string, action: string, details: any, ip: string): void {
    const activity: UserActivity = {
      timestamp: new Date(),
      userId,
      action,
      details,
      ip
    };

    this.userActivities.push(activity);

    // 사용자 활동 히스토리 크기 제한
    if (this.userActivities.length > this.maxMetricsHistory) {
      this.userActivities = this.userActivities.slice(-this.maxMetricsHistory);
    }

    console.log(`👤 사용자 활동: ${userId} - ${action}`);
  }

  /**
   * 현재 시스템 상태 조회
   */
  public getCurrentStatus(): SystemMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
  }

  /**
   * 최근 API 메트릭 조회
   */
  public getRecentApiMetrics(limit: number = 100): ApiMetrics[] {
    return this.apiMetrics.slice(-limit);
  }

  /**
   * 최근 사용자 활동 조회
   */
  public getRecentUserActivities(limit: number = 100): UserActivity[] {
    return this.userActivities.slice(-limit);
  }

  /**
   * 시스템 메트릭 히스토리 조회
   */
  public getSystemMetricsHistory(limit: number = 100): SystemMetrics[] {
    return this.metrics.slice(-limit);
  }

  /**
   * 성능 통계 계산
   */
  public getPerformanceStats(): any {
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

  /**
   * 시스템 상태 요약
   */
  public getSystemSummary(): any {
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

export default SystemMonitor;
