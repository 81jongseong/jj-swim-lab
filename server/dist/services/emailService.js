"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = void 0;
const SystemConfig_1 = require("../models/SystemConfig");
class EmailService {
    constructor() {
        this.isEnabled = false;
        this.recipients = [];
        this.lastConfigCheck = 0;
    }
    static getInstance() {
        if (!EmailService.instance) {
            EmailService.instance = new EmailService();
        }
        return EmailService.instance;
    }
    async loadEmailConfig() {
        try {
            const now = Date.now();
            if (now - this.lastConfigCheck < 60 * 1000) {
                return;
            }
            const systemConfig = await SystemConfig_1.SystemConfig.findOne({ isActive: true });
            if (systemConfig) {
                this.isEnabled = systemConfig.notifications.systemAlerts ||
                    systemConfig.notifications.errorNotifications ||
                    systemConfig.notifications.performanceAlerts;
                this.recipients = systemConfig.notifications.emailRecipients || [];
                this.lastConfigCheck = now;
                console.log(`📧 이메일 설정 업데이트: ${this.isEnabled ? '활성' : '비활성'}, 수신자 ${this.recipients.length}명`);
            }
        }
        catch (error) {
            console.error('이메일 설정 로드 오류:', error);
        }
    }
    async sendNotification(notification) {
        try {
            await this.loadEmailConfig();
            if (!this.isEnabled || this.recipients.length === 0) {
                console.log('📧 이메일 알림 비활성화 상태 또는 수신자 없음');
                return false;
            }
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
        }
        catch (error) {
            console.error('이메일 발송 오류:', error);
            return false;
        }
    }
    async sendSystemAlert(message, data) {
        return this.sendNotification({
            type: 'system',
            subject: '[JJ Swim Lab] 시스템 알림',
            message,
            priority: 'medium',
            data
        });
    }
    async sendErrorAlert(error, data) {
        return this.sendNotification({
            type: 'error',
            subject: '[JJ Swim Lab] 시스템 오류 발생',
            message: `시스템 오류가 발생했습니다: ${error}`,
            priority: 'high',
            data
        });
    }
    async sendPerformanceAlert(message, data) {
        return this.sendNotification({
            type: 'performance',
            subject: '[JJ Swim Lab] 성능 경고',
            message,
            priority: 'medium',
            data
        });
    }
    async sendSecurityAlert(message, data) {
        return this.sendNotification({
            type: 'security',
            subject: '[JJ Swim Lab] 보안 경고',
            message,
            priority: 'critical',
            data
        });
    }
}
exports.emailService = EmailService.getInstance();
//# sourceMappingURL=emailService.js.map