/**
 * @file 이메일 알림 서비스
 * @description 시스템 이벤트에 대한 이메일 알림을 발송하는 서비스입니다.
 * @date 2025-09-19
 * @author JJ Swim Lab
 */

import { SystemConfig } from '../models/SystemConfig';

export interface EmailNotification {
  type: 'system' | 'error' | 'performance' | 'security';
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  data?: any;
}

class EmailService {
  private static instance: EmailService;
  private isEnabled: boolean = false;
  private recipients: string[] = [];
  private lastConfigCheck: number = 0;

  private constructor() {}

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  // 이메일 설정 로드
  private async loadEmailConfig(): Promise<void> {
    try {
      const now = Date.now();
      
      // 1분마다 설정 재확인
      if (now - this.lastConfigCheck < 60 * 1000) {
        return;
      }

      const systemConfig = await SystemConfig.findOne({ isActive: true });
      
      if (systemConfig) {
        this.isEnabled = systemConfig.notifications.systemAlerts || 
                         systemConfig.notifications.errorNotifications || 
                         systemConfig.notifications.performanceAlerts;
        this.recipients = systemConfig.notifications.emailRecipients || [];
        this.lastConfigCheck = now;
        
        console.log(`📧 이메일 설정 업데이트: ${this.isEnabled ? '활성' : '비활성'}, 수신자 ${this.recipients.length}명`);
      }
    } catch (error) {
      console.error('이메일 설정 로드 오류:', error);
    }
  }

  // 이메일 발송 (현재는 콘솔 로그로 시뮬레이션)
  public async sendNotification(notification: EmailNotification): Promise<boolean> {
    try {
      await this.loadEmailConfig();

      if (!this.isEnabled || this.recipients.length === 0) {
        console.log('📧 이메일 알림 비활성화 상태 또는 수신자 없음');
        return false;
      }

      // 실제 환경에서는 nodemailer, SendGrid 등을 사용
      // 현재는 콘솔 로그로 시뮬레이션
      console.log('\n📧 ===== 이메일 알림 발송 =====');
      console.log(`📬 수신자: ${this.recipients.join(', ')}`);
      console.log(`📋 제목: ${notification.subject}`);
      console.log(`📝 내용: ${notification.message}`);
      console.log(`🏷️ 유형: ${notification.type}`);
      console.log(`⚠️ 우선순위: ${notification.priority}`);
      console.log(`📅 발송시간: ${new Date().toLocaleString()}`);
      
      if (notification.data) {
        console.log(`📊 첨부 데이터:`, JSON.stringify(notification.data, null, 2));
      }
      
      console.log('================================\n');

      return true;
    } catch (error) {
      console.error('이메일 발송 오류:', error);
      return false;
    }
  }

  // 시스템 알림
  public async sendSystemAlert(message: string, data?: any): Promise<boolean> {
    return this.sendNotification({
      type: 'system',
      subject: '[JJ Swim Lab] 시스템 알림',
      message,
      priority: 'medium',
      data
    });
  }

  // 오류 알림
  public async sendErrorAlert(error: string, data?: any): Promise<boolean> {
    return this.sendNotification({
      type: 'error',
      subject: '[JJ Swim Lab] 시스템 오류 발생',
      message: `시스템 오류가 발생했습니다: ${error}`,
      priority: 'high',
      data
    });
  }

  // 성능 알림
  public async sendPerformanceAlert(message: string, data?: any): Promise<boolean> {
    return this.sendNotification({
      type: 'performance',
      subject: '[JJ Swim Lab] 성능 경고',
      message,
      priority: 'medium',
      data
    });
  }

  // 보안 알림
  public async sendSecurityAlert(message: string, data?: any): Promise<boolean> {
    return this.sendNotification({
      type: 'security',
      subject: '[JJ Swim Lab] 보안 경고',
      message,
      priority: 'critical',
      data
    });
  }
}

export const emailService = EmailService.getInstance();
