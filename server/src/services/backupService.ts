/**
 * 백업 서비스
 * 데이터베이스 백업, 복구, 버전 관리를 담당합니다.
 */

import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// 백업 정보 인터페이스
interface BackupInfo {
  id: string;
  timestamp: Date;
  type: 'full' | 'incremental' | 'schema';
  size: number;
  status: 'success' | 'failed' | 'in_progress';
  description?: string;
  filePath: string;
}

// 복구 정보 인터페이스
interface RestoreInfo {
  id: string;
  timestamp: Date;
  backupId: string;
  status: 'success' | 'failed' | 'in_progress';
  description?: string;
}

class BackupService {
  private static instance: BackupService;
  private backupDir: string;
  private restoreDir: string;
  private backups: BackupInfo[] = [];
  private restores: RestoreInfo[] = [];

  private constructor() {
    // 백업 디렉토리 설정
    this.backupDir = path.join(process.cwd(), 'backups');
    this.restoreDir = path.join(process.cwd(), 'restores');
    
    // 디렉토리 생성
    this.ensureDirectories();
    
    // 기존 백업 정보 로드
    this.loadBackupHistory();
  }

  public static getInstance(): BackupService {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService();
    }
    return BackupService.instance;
  }

  /**
   * 필요한 디렉토리 생성
   */
  private ensureDirectories(): void {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
    if (!fs.existsSync(this.restoreDir)) {
      fs.mkdirSync(this.restoreDir, { recursive: true });
    }
  }

  /**
   * 백업 히스토리 로드
   */
  private loadBackupHistory(): void {
    const historyFile = path.join(this.backupDir, 'backup-history.json');
    if (fs.existsSync(historyFile)) {
      try {
        const data = fs.readFileSync(historyFile, 'utf8');
        this.backups = JSON.parse(data);
      } catch (error) {
        console.error('백업 히스토리 로드 실패:', error);
        this.backups = [];
      }
    }
  }

  /**
   * 백업 히스토리 저장
   */
  private saveBackupHistory(): void {
    const historyFile = path.join(this.backupDir, 'backup-history.json');
    try {
      fs.writeFileSync(historyFile, JSON.stringify(this.backups, null, 2));
    } catch (error) {
      console.error('백업 히스토리 저장 실패:', error);
    }
  }

  /**
   * 전체 데이터베이스 백업
   */
  public async createFullBackup(description?: string): Promise<BackupInfo> {
    const backupId = `backup_${Date.now()}`;
    const timestamp = new Date();
    
    const backupInfo: BackupInfo = {
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
      
      // MongoDB URI에서 데이터베이스명 추출
      const mongoUri = process.env.MONGODB_URI || '';
      const dbName = this.extractDatabaseName(mongoUri);
      
      if (!dbName) {
        throw new Error('데이터베이스명을 추출할 수 없습니다.');
      }

      // 백업 파일 경로
      const backupFileName = `${backupId}_full.json`;
      const backupFilePath = path.join(this.backupDir, backupFileName);
      
      // mongodump 명령어 실행
      const dumpCommand = `mongodump --uri="${mongoUri}" --out="${this.backupDir}/${backupId}"`;
      await execAsync(dumpCommand);
      
      // 백업 파일 크기 계산
      const stats = fs.statSync(path.join(this.backupDir, backupId));
      backupInfo.size = this.getDirectorySize(path.join(this.backupDir, backupId));
      backupInfo.filePath = backupFilePath;
      backupInfo.status = 'success';
      
      console.log(`✅ 전체 백업 완료: ${backupId} (${this.formatBytes(backupInfo.size)})`);
      
    } catch (error) {
      console.error(`❌ 전체 백업 실패: ${backupId}`, error);
      backupInfo.status = 'failed';
    }

    this.saveBackupHistory();
    return backupInfo;
  }

  /**
   * 스키마만 백업 (구조만)
   */
  public async createSchemaBackup(description?: string): Promise<BackupInfo> {
    const backupId = `schema_${Date.now()}`;
    const timestamp = new Date();
    
    const backupInfo: BackupInfo = {
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
      
      // 모든 모델의 스키마 정보 수집
      const schemas: any = {};
      const models = mongoose.models;
      
      for (const [modelName, model] of Object.entries(models)) {
        schemas[modelName] = {
          collectionName: model.collection.name,
          schema: model.schema.obj,
          indexes: model.schema.indexes()
        };
      }
      
      // 스키마 파일 저장
      const schemaFileName = `${backupId}_schema.json`;
      const schemaFilePath = path.join(this.backupDir, schemaFileName);
      
      fs.writeFileSync(schemaFilePath, JSON.stringify(schemas, null, 2));
      
      backupInfo.size = fs.statSync(schemaFilePath).size;
      backupInfo.filePath = schemaFilePath;
      backupInfo.status = 'success';
      
      console.log(`✅ 스키마 백업 완료: ${backupId} (${this.formatBytes(backupInfo.size)})`);
      
    } catch (error) {
      console.error(`❌ 스키마 백업 실패: ${backupId}`, error);
      backupInfo.status = 'failed';
    }

    this.saveBackupHistory();
    return backupInfo;
  }

  /**
   * 데이터베이스 복구
   */
  public async restoreFromBackup(backupId: string, description?: string): Promise<RestoreInfo> {
    const restoreId = `restore_${Date.now()}`;
    const timestamp = new Date();
    
    const restoreInfo: RestoreInfo = {
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

      // mongorestore 명령어 실행
      const restoreCommand = `mongorestore --uri="${mongoUri}" --drop "${this.backupDir}/${backupId}"`;
      await execAsync(restoreCommand);
      
      restoreInfo.status = 'success';
      console.log(`✅ 데이터베이스 복구 완료: ${restoreId}`);
      
    } catch (error) {
      console.error(`❌ 데이터베이스 복구 실패: ${restoreId}`, error);
      restoreInfo.status = 'failed';
    }

    return restoreInfo;
  }

  /**
   * 백업 목록 조회
   */
  public getBackups(): BackupInfo[] {
    return this.backups.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * 복구 목록 조회
   */
  public getRestores(): RestoreInfo[] {
    return this.restores.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * 백업 삭제
   */
  public async deleteBackup(backupId: string): Promise<boolean> {
    try {
      const backup = this.backups.find(b => b.id === backupId);
      if (!backup) {
        return false;
      }

      // 백업 파일 삭제
      if (backup.filePath && fs.existsSync(backup.filePath)) {
        fs.unlinkSync(backup.filePath);
      }

      // 백업 디렉토리 삭제
      const backupDirPath = path.join(this.backupDir, backupId);
      if (fs.existsSync(backupDirPath)) {
        fs.rmSync(backupDirPath, { recursive: true, force: true });
      }

      // 백업 정보에서 제거
      this.backups = this.backups.filter(b => b.id !== backupId);
      this.saveBackupHistory();

      console.log(`✅ 백업 삭제 완료: ${backupId}`);
      return true;
    } catch (error) {
      console.error(`❌ 백업 삭제 실패: ${backupId}`, error);
      return false;
    }
  }

  /**
   * 자동 백업 스케줄링
   */
  public scheduleAutoBackup(intervalHours: number = 24): void {
    setInterval(async () => {
      try {
        console.log('🔄 자동 백업 실행 중...');
        await this.createFullBackup('자동 백업');
      } catch (error) {
        console.error('❌ 자동 백업 실패:', error);
      }
    }, intervalHours * 60 * 60 * 1000);
  }

  /**
   * MongoDB URI에서 데이터베이스명 추출
   */
  private extractDatabaseName(uri: string): string | null {
    try {
      const url = new URL(uri);
      return url.pathname.substring(1) || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * 디렉토리 크기 계산
   */
  private getDirectorySize(dirPath: string): number {
    let size = 0;
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        size += this.getDirectorySize(filePath);
      } else {
        size += stats.size;
      }
    }
    
    return size;
  }

  /**
   * 바이트를 읽기 쉬운 형태로 변환
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 백업 상태 요약
   */
  public getBackupSummary(): any {
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

export default BackupService;
