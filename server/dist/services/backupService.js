"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class BackupService {
    constructor() {
        this.backups = [];
        this.restores = [];
        this.backupDir = path_1.default.join(process.cwd(), 'backups');
        this.restoreDir = path_1.default.join(process.cwd(), 'restores');
        this.ensureDirectories();
        this.loadBackupHistory();
    }
    static getInstance() {
        if (!BackupService.instance) {
            BackupService.instance = new BackupService();
        }
        return BackupService.instance;
    }
    ensureDirectories() {
        if (!fs_1.default.existsSync(this.backupDir)) {
            fs_1.default.mkdirSync(this.backupDir, { recursive: true });
        }
        if (!fs_1.default.existsSync(this.restoreDir)) {
            fs_1.default.mkdirSync(this.restoreDir, { recursive: true });
        }
    }
    loadBackupHistory() {
        const historyFile = path_1.default.join(this.backupDir, 'backup-history.json');
        if (fs_1.default.existsSync(historyFile)) {
            try {
                const data = fs_1.default.readFileSync(historyFile, 'utf8');
                this.backups = JSON.parse(data);
            }
            catch (error) {
                console.error('백업 히스토리 로드 실패:', error);
                this.backups = [];
            }
        }
    }
    saveBackupHistory() {
        const historyFile = path_1.default.join(this.backupDir, 'backup-history.json');
        try {
            fs_1.default.writeFileSync(historyFile, JSON.stringify(this.backups, null, 2));
        }
        catch (error) {
            console.error('백업 히스토리 저장 실패:', error);
        }
    }
    async createFullBackup(description) {
        const backupId = `backup_${Date.now()}`;
        const timestamp = new Date();
        const backupInfo = {
            id: backupId,
            timestamp,
            type: 'full',
            size: 0,
            status: 'in_progress',
            description,
            filePath: ''
        };
        this.backups.push(backupInfo);
        this.saveBackupHistory();
        try {
            console.log(`🔄 전체 백업 시작: ${backupId}`);
            const mongoUri = process.env.MONGODB_URI || '';
            const dbName = this.extractDatabaseName(mongoUri);
            if (!dbName) {
                throw new Error('데이터베이스명을 추출할 수 없습니다.');
            }
            const backupFileName = `${backupId}_full.json`;
            const backupFilePath = path_1.default.join(this.backupDir, backupFileName);
            const dumpCommand = `mongodump --uri="${mongoUri}" --out="${this.backupDir}/${backupId}"`;
            await execAsync(dumpCommand);
            const stats = fs_1.default.statSync(path_1.default.join(this.backupDir, backupId));
            backupInfo.size = this.getDirectorySize(path_1.default.join(this.backupDir, backupId));
            backupInfo.filePath = backupFilePath;
            backupInfo.status = 'success';
            console.log(`✅ 전체 백업 완료: ${backupId} (${this.formatBytes(backupInfo.size)})`);
        }
        catch (error) {
            console.error(`❌ 전체 백업 실패: ${backupId}`, error);
            backupInfo.status = 'failed';
        }
        this.saveBackupHistory();
        return backupInfo;
    }
    async createSchemaBackup(description) {
        const backupId = `schema_${Date.now()}`;
        const timestamp = new Date();
        const backupInfo = {
            id: backupId,
            timestamp,
            type: 'schema',
            size: 0,
            status: 'in_progress',
            description,
            filePath: ''
        };
        this.backups.push(backupInfo);
        this.saveBackupHistory();
        try {
            console.log(`🔄 스키마 백업 시작: ${backupId}`);
            const schemas = {};
            const models = mongoose_1.default.models;
            for (const [modelName, model] of Object.entries(models)) {
                schemas[modelName] = {
                    collectionName: model.collection.name,
                    schema: model.schema.obj,
                    indexes: model.schema.indexes()
                };
            }
            const schemaFileName = `${backupId}_schema.json`;
            const schemaFilePath = path_1.default.join(this.backupDir, schemaFileName);
            fs_1.default.writeFileSync(schemaFilePath, JSON.stringify(schemas, null, 2));
            backupInfo.size = fs_1.default.statSync(schemaFilePath).size;
            backupInfo.filePath = schemaFilePath;
            backupInfo.status = 'success';
            console.log(`✅ 스키마 백업 완료: ${backupId} (${this.formatBytes(backupInfo.size)})`);
        }
        catch (error) {
            console.error(`❌ 스키마 백업 실패: ${backupId}`, error);
            backupInfo.status = 'failed';
        }
        this.saveBackupHistory();
        return backupInfo;
    }
    async restoreFromBackup(backupId, description) {
        const restoreId = `restore_${Date.now()}`;
        const timestamp = new Date();
        const restoreInfo = {
            id: restoreId,
            timestamp,
            backupId,
            status: 'in_progress',
            description
        };
        this.restores.push(restoreInfo);
        try {
            console.log(`🔄 데이터베이스 복구 시작: ${restoreId} (백업: ${backupId})`);
            const backup = this.backups.find(b => b.id === backupId);
            if (!backup) {
                throw new Error(`백업을 찾을 수 없습니다: ${backupId}`);
            }
            if (backup.status !== 'success') {
                throw new Error(`백업이 성공하지 않았습니다: ${backupId}`);
            }
            const mongoUri = process.env.MONGODB_URI || '';
            const dbName = this.extractDatabaseName(mongoUri);
            if (!dbName) {
                throw new Error('데이터베이스명을 추출할 수 없습니다.');
            }
            const restoreCommand = `mongorestore --uri="${mongoUri}" --drop "${this.backupDir}/${backupId}"`;
            await execAsync(restoreCommand);
            restoreInfo.status = 'success';
            console.log(`✅ 데이터베이스 복구 완료: ${restoreId}`);
        }
        catch (error) {
            console.error(`❌ 데이터베이스 복구 실패: ${restoreId}`, error);
            restoreInfo.status = 'failed';
        }
        return restoreInfo;
    }
    getBackups() {
        return this.backups.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }
    getRestores() {
        return this.restores.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }
    async deleteBackup(backupId) {
        try {
            const backup = this.backups.find(b => b.id === backupId);
            if (!backup) {
                return false;
            }
            if (backup.filePath && fs_1.default.existsSync(backup.filePath)) {
                fs_1.default.unlinkSync(backup.filePath);
            }
            const backupDirPath = path_1.default.join(this.backupDir, backupId);
            if (fs_1.default.existsSync(backupDirPath)) {
                fs_1.default.rmSync(backupDirPath, { recursive: true, force: true });
            }
            this.backups = this.backups.filter(b => b.id !== backupId);
            this.saveBackupHistory();
            console.log(`✅ 백업 삭제 완료: ${backupId}`);
            return true;
        }
        catch (error) {
            console.error(`❌ 백업 삭제 실패: ${backupId}`, error);
            return false;
        }
    }
    scheduleAutoBackup(intervalHours = 24) {
        setInterval(async () => {
            try {
                console.log('🔄 자동 백업 실행 중...');
                await this.createFullBackup('자동 백업');
            }
            catch (error) {
                console.error('❌ 자동 백업 실패:', error);
            }
        }, intervalHours * 60 * 60 * 1000);
    }
    extractDatabaseName(uri) {
        try {
            const url = new URL(uri);
            return url.pathname.substring(1) || null;
        }
        catch (error) {
            return null;
        }
    }
    getDirectorySize(dirPath) {
        let size = 0;
        const files = fs_1.default.readdirSync(dirPath);
        for (const file of files) {
            const filePath = path_1.default.join(dirPath, file);
            const stats = fs_1.default.statSync(filePath);
            if (stats.isDirectory()) {
                size += this.getDirectorySize(filePath);
            }
            else {
                size += stats.size;
            }
        }
        return size;
    }
    formatBytes(bytes) {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    getBackupSummary() {
        const totalBackups = this.backups.length;
        const successfulBackups = this.backups.filter(b => b.status === 'success').length;
        const failedBackups = this.backups.filter(b => b.status === 'failed').length;
        const totalSize = this.backups.reduce((sum, b) => sum + b.size, 0);
        const lastBackup = this.backups
            .filter(b => b.status === 'success')
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
        return {
            totalBackups,
            successfulBackups,
            failedBackups,
            successRate: totalBackups > 0 ? (successfulBackups / totalBackups) * 100 : 0,
            totalSize: this.formatBytes(totalSize),
            lastBackup: lastBackup ? {
                id: lastBackup.id,
                timestamp: lastBackup.timestamp,
                type: lastBackup.type,
                size: this.formatBytes(lastBackup.size)
            } : null
        };
    }
}
exports.default = BackupService;
//# sourceMappingURL=backupService.js.map