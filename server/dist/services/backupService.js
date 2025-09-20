"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.backupService = void 0;
const SystemConfig_1 = require("../models/SystemConfig");
const emailService_1 = require("./emailService");
const mongoose_1 = __importDefault(require("mongoose"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class BackupService {
    constructor() {
        this.backupInterval = null;
        this.isRunning = false;
    }
    static getInstance() {
        if (!BackupService.instance) {
            BackupService.instance = new BackupService();
        }
        return BackupService.instance;
    }
    async startBackupService() {
        try {
            console.log('💾 자동 백업 서비스 시작...');
            if (this.backupInterval) {
                clearInterval(this.backupInterval);
            }
            await this.checkAndScheduleBackup();
            this.backupInterval = setInterval(async () => {
                await this.checkAndScheduleBackup();
            }, 60 * 60 * 1000);
            this.isRunning = true;
            console.log('✅ 자동 백업 서비스 시작 완료');
        }
        catch (error) {
            console.error('자동 백업 서비스 시작 오류:', error);
        }
    }
    async checkAndScheduleBackup() {
        try {
            const systemConfig = await SystemConfig_1.SystemConfig.findOne({ isActive: true });
            if (!systemConfig || !systemConfig.backup.autoBackup) {
                console.log('💾 자동 백업 비활성화 상태');
                return;
            }
            const backupInterval = systemConfig.backup.backupInterval * 60 * 60 * 1000;
            const lastBackup = systemConfig.backup.lastBackup;
            const now = new Date();
            if (!lastBackup || (now.getTime() - lastBackup.getTime()) >= backupInterval) {
                console.log('💾 백업 실행 조건 충족, 백업 시작...');
                await this.performBackup(systemConfig);
            }
            else {
                const nextBackup = new Date(lastBackup.getTime() + backupInterval);
                console.log(`💾 다음 백업 예정: ${nextBackup.toLocaleString()}`);
            }
        }
        catch (error) {
            console.error('백업 스케줄 확인 오류:', error);
        }
    }
    async performBackup(systemConfig) {
        try {
            console.log('💾 데이터베이스 백업 시작...');
            const backupDir = path_1.default.join(process.cwd(), 'backups');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupPath = path_1.default.join(backupDir, `backup-${timestamp}.json`);
            if (!fs_1.default.existsSync(backupDir)) {
                fs_1.default.mkdirSync(backupDir, { recursive: true });
            }
            const collections = ['users', 'centers', 'courses', 'bookings', 'payments'];
            const backupData = {
                timestamp: new Date().toISOString(),
                version: '1.0.0',
                collections: {}
            };
            for (const collectionName of collections) {
                try {
                    const collection = mongoose_1.default.connection.db.collection(collectionName);
                    const documents = await collection.find({}).toArray();
                    backupData.collections[collectionName] = documents;
                    console.log(`✅ ${collectionName} 컬렉션 백업 완료 (${documents.length}개 문서)`);
                }
                catch (collectionError) {
                    console.warn(`⚠️ ${collectionName} 컬렉션 백업 실패:`, collectionError);
                }
            }
            fs_1.default.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
            console.log(`✅ 백업 파일 저장 완료: ${backupPath}`);
            await SystemConfig_1.SystemConfig.findByIdAndUpdate(systemConfig._id, {
                'backup.lastBackup': new Date()
            });
            await this.cleanupOldBackups(systemConfig.backup.retentionDays);
            await emailService_1.emailService.sendSystemAlert(`데이터베이스 백업이 성공적으로 완료되었습니다.`, {
                backupPath,
                collections: Object.keys(backupData.collections),
                totalDocuments: Object.values(backupData.collections).reduce((sum, docs) => sum + docs.length, 0)
            });
            console.log('🎉 데이터베이스 백업 완료!');
        }
        catch (error) {
            console.error('백업 수행 오류:', error);
            await emailService_1.emailService.sendErrorAlert(`데이터베이스 백업에 실패했습니다: ${error.message}`, { error: error.message });
        }
    }
    async cleanupOldBackups(retentionDays) {
        try {
            const backupDir = path_1.default.join(process.cwd(), 'backups');
            if (!fs_1.default.existsSync(backupDir)) {
                return;
            }
            const files = fs_1.default.readdirSync(backupDir);
            const now = Date.now();
            const retentionMs = retentionDays * 24 * 60 * 60 * 1000;
            let deletedCount = 0;
            for (const file of files) {
                if (file.startsWith('backup-') && file.endsWith('.json')) {
                    const filePath = path_1.default.join(backupDir, file);
                    const stats = fs_1.default.statSync(filePath);
                    if (now - stats.mtime.getTime() > retentionMs) {
                        fs_1.default.unlinkSync(filePath);
                        deletedCount++;
                        console.log(`🗑️ 오래된 백업 파일 삭제: ${file}`);
                    }
                }
            }
            if (deletedCount > 0) {
                console.log(`🗑️ 총 ${deletedCount}개의 오래된 백업 파일 정리 완료`);
            }
        }
        catch (error) {
            console.error('백업 파일 정리 오류:', error);
        }
    }
    async triggerManualBackup() {
        try {
            const systemConfig = await SystemConfig_1.SystemConfig.findOne({ isActive: true });
            if (!systemConfig) {
                console.error('시스템 설정을 찾을 수 없습니다.');
                return false;
            }
            await this.performBackup(systemConfig);
            return true;
        }
        catch (error) {
            console.error('수동 백업 실행 오류:', error);
            return false;
        }
    }
    stopBackupService() {
        if (this.backupInterval) {
            clearInterval(this.backupInterval);
            this.backupInterval = null;
        }
        this.isRunning = false;
        console.log('💾 자동 백업 서비스 중지');
    }
    getStatus() {
        return {
            isRunning: this.isRunning
        };
    }
}
exports.backupService = BackupService.getInstance();
//# sourceMappingURL=backupService.js.map