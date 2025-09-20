/**
 * @file 자동 백업 서비스
 * @description 시스템 설정에 따라 자동으로 데이터베이스 백업을 수행하는 서비스입니다.
 * @date 2025-09-19
 * @author JJ Swim Lab
 */

import { SystemConfig } from '../models/SystemConfig';
import { emailService } from './emailService';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

class BackupService {
  private static instance: BackupService;
  private backupInterval: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;

  private constructor() {}

  public static getInstance(): BackupService {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService();
    }
    return BackupService.instance;
  }

  // 백업 서비스 시작
  public async startBackupService(): Promise<void> {
    try {
      console.log('💾 자동 백업 서비스 시작...');
      
      // 기존 스케줄 정리
      if (this.backupInterval) {
        clearInterval(this.backupInterval);
      }

      // 초기 백업 설정 확인
      await this.checkAndScheduleBackup();
      
      // 1시간마다 백업 설정 재확인
      this.backupInterval = setInterval(async () => {
        await this.checkAndScheduleBackup();
      }, 60 * 60 * 1000); // 1시간

      this.isRunning = true;
      console.log('✅ 자동 백업 서비스 시작 완료');
    } catch (error) {
      console.error('자동 백업 서비스 시작 오류:', error);
    }
  }

  // 백업 설정 확인 및 스케줄링
  private async checkAndScheduleBackup(): Promise<void> {
    try {
      const systemConfig = await SystemConfig.findOne({ isActive: true });
      
      if (!systemConfig || !systemConfig.backup.autoBackup) {
        console.log('💾 자동 백업 비활성화 상태');
        return;
      }

      const backupInterval = systemConfig.backup.backupInterval * 60 * 60 * 1000; // 시간을 밀리초로
      const lastBackup = systemConfig.backup.lastBackup;
      const now = new Date();

      if (!lastBackup || (now.getTime() - lastBackup.getTime()) >= backupInterval) {
        console.log('💾 백업 실행 조건 충족, 백업 시작...');
        await this.performBackup(systemConfig);
      } else {
        const nextBackup = new Date(lastBackup.getTime() + backupInterval);
        console.log(`💾 다음 백업 예정: ${nextBackup.toLocaleString()}`);
      }
    } catch (error) {
      console.error('백업 스케줄 확인 오류:', error);
    }
  }

  // 실제 백업 수행
  private async performBackup(systemConfig: any): Promise<void> {
    try {
      console.log('💾 데이터베이스 백업 시작...');
      
      const backupDir = path.join(process.cwd(), 'backups');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(backupDir, `backup-${timestamp}.json`);

      // 백업 디렉토리 생성
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      // 주요 컬렉션 백업
      const collections = ['users', 'centers', 'courses', 'bookings', 'payments'];
      const backupData: any = {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        collections: {}
      };

      for (const collectionName of collections) {
        try {
          const collection = mongoose.connection.db.collection(collectionName);
          const documents = await collection.find({}).toArray();
          backupData.collections[collectionName] = documents;
          console.log(`✅ ${collectionName} 컬렉션 백업 완료 (${documents.length}개 문서)`);
        } catch (collectionError) {
          console.warn(`⚠️ ${collectionName} 컬렉션 백업 실패:`, collectionError);
        }
      }

      // 백업 파일 저장
      fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
      console.log(`✅ 백업 파일 저장 완료: ${backupPath}`);

      // 백업 완료 시간 업데이트
      await SystemConfig.findByIdAndUpdate(systemConfig._id, {
        'backup.lastBackup': new Date()
      });

      // 오래된 백업 파일 정리
      await this.cleanupOldBackups(systemConfig.backup.retentionDays);

      // 백업 완료 알림
      await emailService.sendSystemAlert(
        `데이터베이스 백업이 성공적으로 완료되었습니다.`,
        {
          backupPath,
          collections: Object.keys(backupData.collections),
          totalDocuments: Object.values(backupData.collections).reduce((sum: number, docs: any) => sum + docs.length, 0)
        }
      );

      console.log('🎉 데이터베이스 백업 완료!');
    } catch (error) {
      console.error('백업 수행 오류:', error);
      
      // 백업 실패 알림
      await emailService.sendErrorAlert(
        `데이터베이스 백업에 실패했습니다: ${error.message}`,
        { error: error.message }
      );
    }
  }

  // 오래된 백업 파일 정리
  private async cleanupOldBackups(retentionDays: number): Promise<void> {
    try {
      const backupDir = path.join(process.cwd(), 'backups');
      
      if (!fs.existsSync(backupDir)) {
        return;
      }

      const files = fs.readdirSync(backupDir);
      const now = Date.now();
      const retentionMs = retentionDays * 24 * 60 * 60 * 1000;

      let deletedCount = 0;
      
      for (const file of files) {
        if (file.startsWith('backup-') && file.endsWith('.json')) {
          const filePath = path.join(backupDir, file);
          const stats = fs.statSync(filePath);
          
          if (now - stats.mtime.getTime() > retentionMs) {
            fs.unlinkSync(filePath);
            deletedCount++;
            console.log(`🗑️ 오래된 백업 파일 삭제: ${file}`);
          }
        }
      }

      if (deletedCount > 0) {
        console.log(`🗑️ 총 ${deletedCount}개의 오래된 백업 파일 정리 완료`);
      }
    } catch (error) {
      console.error('백업 파일 정리 오류:', error);
    }
  }

  // 수동 백업 실행
  public async triggerManualBackup(): Promise<boolean> {
    try {
      const systemConfig = await SystemConfig.findOne({ isActive: true });
      
      if (!systemConfig) {
        console.error('시스템 설정을 찾을 수 없습니다.');
        return false;
      }

      await this.performBackup(systemConfig);
      return true;
    } catch (error) {
      console.error('수동 백업 실행 오류:', error);
      return false;
    }
  }

  // 백업 서비스 중지
  public stopBackupService(): void {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
      this.backupInterval = null;
    }
    this.isRunning = false;
    console.log('💾 자동 백업 서비스 중지');
  }

  // 백업 서비스 상태 확인
  public getStatus(): { isRunning: boolean } {
    return {
      isRunning: this.isRunning
    };
  }
}

export const backupService = BackupService.getInstance();