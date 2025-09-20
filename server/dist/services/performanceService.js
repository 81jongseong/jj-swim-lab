"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.performanceService = void 0;
const SystemConfig_1 = require("../models/SystemConfig");
const emailService_1 = require("./emailService");
class PerformanceService {
    constructor() {
        this.currentLogLevel = 'info';
        this.maxLogSize = 100;
        this.cacheEnabled = true;
        this.compressionEnabled = true;
        this.lastConfigCheck = 0;
    }
    static getInstance() {
        if (!PerformanceService.instance) {
            PerformanceService.instance = new PerformanceService();
        }
        return PerformanceService.instance;
    }
    async loadAndApplySettings() {
        try {
            const now = Date.now();
            if (now - this.lastConfigCheck < 5 * 60 * 1000) {
                return;
            }
            const systemConfig = await SystemConfig_1.SystemConfig.findOne({ isActive: true });
            if (systemConfig && systemConfig.performance) {
                const oldSettings = {
                    logLevel: this.currentLogLevel,
                    maxLogSize: this.maxLogSize,
                    cacheEnabled: this.cacheEnabled,
                    compressionEnabled: this.compressionEnabled
                };
                this.currentLogLevel = systemConfig.performance.logLevel;
                this.maxLogSize = systemConfig.performance.maxLogSize;
                this.cacheEnabled = systemConfig.performance.cacheEnabled;
                this.compressionEnabled = systemConfig.performance.compressionEnabled;
                this.lastConfigCheck = now;
                const hasChanges = oldSettings.logLevel !== this.currentLogLevel ||
                    oldSettings.maxLogSize !== this.maxLogSize ||
                    oldSettings.cacheEnabled !== this.cacheEnabled ||
                    oldSettings.compressionEnabled !== this.compressionEnabled;
                if (hasChanges) {
                    console.log('⚡ 성능 설정 업데이트 적용:');
                    console.log(`   📋 로그 레벨: ${oldSettings.logLevel} → ${this.currentLogLevel}`);
                    console.log(`   📁 최대 로그 크기: ${oldSettings.maxLogSize}MB → ${this.maxLogSize}MB`);
                    console.log(`   🚀 캐시: ${oldSettings.cacheEnabled ? '활성' : '비활성'} → ${this.cacheEnabled ? '활성' : '비활성'}`);
                    console.log(`   📦 압축: ${oldSettings.compressionEnabled ? '활성' : '비활성'} → ${this.compressionEnabled ? '활성' : '비활성'}`);
                    this.applyLogLevel();
                    await emailService_1.emailService.sendSystemAlert('시스템 성능 설정이 업데이트되었습니다.', {
                        oldSettings,
                        newSettings: {
                            logLevel: this.currentLogLevel,
                            maxLogSize: this.maxLogSize,
                            cacheEnabled: this.cacheEnabled,
                            compressionEnabled: this.compressionEnabled
                        }
                    });
                }
            }
        }
        catch (error) {
            console.error('성능 설정 로드 오류:', error);
        }
    }
    applyLogLevel() {
        try {
            console.log(`📋 로그 레벨 변경: ${this.currentLogLevel}`);
            if (this.currentLogLevel === 'error') {
                console.info = () => { };
                console.warn = () => { };
            }
            else if (this.currentLogLevel === 'warn') {
                console.info = () => { };
            }
        }
        catch (error) {
            console.error('로그 레벨 적용 오류:', error);
        }
    }
    getSettings() {
        return {
            logLevel: this.currentLogLevel,
            maxLogSize: this.maxLogSize,
            cacheEnabled: this.cacheEnabled,
            compressionEnabled: this.compressionEnabled
        };
    }
    async collectPerformanceMetrics() {
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
            if (memoryUsagePercent > 85) {
                await emailService_1.emailService.sendPerformanceAlert(`메모리 사용량이 높습니다: ${Math.round(memoryUsagePercent)}%`, metrics);
            }
            return metrics;
        }
        catch (error) {
            console.error('성능 메트릭 수집 오류:', error);
            return null;
        }
    }
    stopService() {
        console.log('⚡ 성능 서비스 중지');
    }
}
exports.performanceService = PerformanceService.getInstance();
//# sourceMappingURL=performanceService.js.map