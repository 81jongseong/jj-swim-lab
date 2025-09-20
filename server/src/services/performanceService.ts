/**
 * @file 성능 설정 서비스
 * @description 시스템 설정에 따라 동적으로 성능 설정을 적용하는 서비스입니다.
 * @date 2025-09-19
 * @author JJ Swim Lab
 */

import { SystemConfig } from '../models/SystemConfig';
import { emailService } from './emailService';

class PerformanceService {
  private static instance: PerformanceService;
  private currentLogLevel: string = 'info';
  private maxLogSize: number = 100; // MB
  private cacheEnabled: boolean = true;
  private compressionEnabled: boolean = true;
  private lastConfigCheck: number = 0;

  private constructor() {}

  public static getInstance(): PerformanceService {
    if (!PerformanceService.instance) {
      PerformanceService.instance = new PerformanceService();
    }
    return PerformanceService.instance;
  }

  // 성능 설정 로드 및 적용
  public async loadAndApplySettings(): Promise<void> {
    try {
      const now = Date.now();
      
      // 5분마다 설정 재확인
      if (now - this.lastConfigCheck < 5 * 60 * 1000) {
        return;
      }

      const systemConfig = await SystemConfig.findOne({ isActive: true });
      
      if (systemConfig && systemConfig.performance) {
        const oldSettings = {
          logLevel: this.currentLogLevel,
          maxLogSize: this.maxLogSize,
          cacheEnabled: this.cacheEnabled,
          compressionEnabled: this.compressionEnabled
        };

        // 설정 업데이트
        this.currentLogLevel = systemConfig.performance.logLevel;
        this.maxLogSize = systemConfig.performance.maxLogSize;
        this.cacheEnabled = systemConfig.performance.cacheEnabled;
        this.compressionEnabled = systemConfig.performance.compressionEnabled;
        this.lastConfigCheck = now;

        // 설정 변경 감지
        const hasChanges = 
          oldSettings.logLevel !== this.currentLogLevel ||
          oldSettings.maxLogSize !== this.maxLogSize ||
          oldSettings.cacheEnabled !== this.cacheEnabled ||
          oldSettings.compressionEnabled !== this.compressionEnabled;

        if (hasChanges) {
          console.log('⚡ 성능 설정 업데이트 적용:');
          console.log(`   📋 로그 레벨: ${oldSettings.logLevel} → ${this.currentLogLevel}`);
          console.log(`   📁 최대 로그 크기: ${oldSettings.maxLogSize}MB → ${this.maxLogSize}MB`);
          console.log(`   🚀 캐시: ${oldSettings.cacheEnabled ? '활성' : '비활성'} → ${this.cacheEnabled ? '활성' : '비활성'}`);
          console.log(`   📦 압축: ${oldSettings.compressionEnabled ? '활성' : '비활성'} → ${this.compressionEnabled ? '활성' : '비활성'}`);

          // 로그 레벨 동적 적용
          this.applyLogLevel();
          
          // 성능 설정 변경 알림
          await emailService.sendSystemAlert(
            '시스템 성능 설정이 업데이트되었습니다.',
            {
              oldSettings,
              newSettings: {
                logLevel: this.currentLogLevel,
                maxLogSize: this.maxLogSize,
                cacheEnabled: this.cacheEnabled,
                compressionEnabled: this.compressionEnabled
              }
            }
          );
        }
      }
    } catch (error) {
      console.error('성능 설정 로드 오류:', error);
    }
  }

  // 로그 레벨 동적 적용
  private applyLogLevel(): void {
    try {
      // 실제 환경에서는 winston 등의 로거 레벨 변경
      console.log(`📋 로그 레벨 변경: ${this.currentLogLevel}`);
      
      // 로그 레벨에 따른 콘솔 출력 제어
      if (this.currentLogLevel === 'error') {
        console.info = () => {}; // info 로그 비활성화
        console.warn = () => {}; // warn 로그 비활성화
      } else if (this.currentLogLevel === 'warn') {
        console.info = () => {}; // info 로그 비활성화
      }
      // debug나 info 레벨에서는 모든 로그 활성화
      
    } catch (error) {
      console.error('로그 레벨 적용 오류:', error);
    }
  }

  // 현재 성능 설정 조회
  public getSettings(): {
    logLevel: string;
    maxLogSize: number;
    cacheEnabled: boolean;
    compressionEnabled: boolean;
  } {
    return {
      logLevel: this.currentLogLevel,
      maxLogSize: this.maxLogSize,
      cacheEnabled: this.cacheEnabled,
      compressionEnabled: this.compressionEnabled
    };
  }

  // 성능 메트릭 수집
  public async collectPerformanceMetrics(): Promise<any> {
    try {
      const memoryUsage = process.memoryUsage();
      const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
      
      const metrics = {
        memory: {
          usage: memoryUsage,
          usagePercent: Math.round(memoryUsagePercent * 100) / 100
        },
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      };

      // 메모리 사용량이 높으면 성능 알림
      if (memoryUsagePercent > 85) {
        await emailService.sendPerformanceAlert(
          `메모리 사용량이 높습니다: ${Math.round(memoryUsagePercent)}%`,
          metrics
        );
      }

      return metrics;
    } catch (error) {
      console.error('성능 메트릭 수집 오류:', error);
      return null;
    }
  }

  // 성능 서비스 중지
  public stopService(): void {
    console.log('⚡ 성능 서비스 중지');
  }
}

export const performanceService = PerformanceService.getInstance();
