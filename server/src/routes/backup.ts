/**
 * 백업 및 복구 API 라우트
 * 데이터베이스 백업, 복구, 관리 기능을 제공합니다.
 */

import { Router, Request, Response } from 'express';
import BackupService from '../services/backupService';
import { requireRole } from '../middleware/auth';

const router = Router();
const backupService = BackupService.getInstance();

/**
 * 백업 상태 요약 조회
 * GET /api/backup/summary
 */
router.get('/summary', requireRole(['superAdmin']), (req: Request, res: Response) => {
  try {
    const summary = backupService.getBackupSummary();
    
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('백업 요약 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '백업 요약 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * 백업 목록 조회
 * GET /api/backup/list
 */
router.get('/list', requireRole(['superAdmin', 'centerAdmin']), (req: Request, res: Response) => {
  try {
    const backups = backupService.getBackups();
    
    res.json({
      success: true,
      data: {
        backups: backups.map(backup => ({
          id: backup.id,
          timestamp: backup.timestamp,
          type: backup.type,
          size: backup.size,
          status: backup.status,
          description: backup.description,
          filePath: backup.filePath
        })),
        total: backups.length
      }
    });
  } catch (error) {
    console.error('백업 목록 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '백업 목록 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * 복구 목록 조회
 * GET /api/backup/restores
 */
router.get('/restores', requireRole(['superAdmin', 'centerAdmin']), (req: Request, res: Response) => {
  try {
    const restores = backupService.getRestores();
    
    res.json({
      success: true,
      data: {
        restores: restores.map(restore => ({
          id: restore.id,
          timestamp: restore.timestamp,
          backupId: restore.backupId,
          status: restore.status,
          description: restore.description
        })),
        total: restores.length
      }
    });
  } catch (error) {
    console.error('복구 목록 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '복구 목록 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * 전체 백업 생성
 * POST /api/backup/create-full
 */
router.post('/create-full', requireRole(['superAdmin']), async (req: Request, res: Response) => {
  try {
    const { description } = req.body;
    
    console.log('🔄 전체 백업 요청 받음');
    const backup = await backupService.createFullBackup(description);
    
    res.json({
      success: true,
      message: '전체 백업이 시작되었습니다.',
      data: {
        id: backup.id,
        timestamp: backup.timestamp,
        type: backup.type,
        status: backup.status,
        description: backup.description
      }
    });
  } catch (error) {
    console.error('전체 백업 생성 실패:', error);
    res.status(500).json({
      success: false,
      message: '전체 백업 생성 중 오류가 발생했습니다.'
    });
  }
});

/**
 * 스키마 백업 생성
 * POST /api/backup/create-schema
 */
router.post('/create-schema', requireRole(['superAdmin']), async (req: Request, res: Response) => {
  try {
    const { description } = req.body;
    
    console.log('🔄 스키마 백업 요청 받음');
    const backup = await backupService.createSchemaBackup(description);
    
    res.json({
      success: true,
      message: '스키마 백업이 시작되었습니다.',
      data: {
        id: backup.id,
        timestamp: backup.timestamp,
        type: backup.type,
        status: backup.status,
        description: backup.description
      }
    });
  } catch (error) {
    console.error('스키마 백업 생성 실패:', error);
    res.status(500).json({
      success: false,
      message: '스키마 백업 생성 중 오류가 발생했습니다.'
    });
  }
});

/**
 * 백업에서 복구
 * POST /api/backup/restore
 */
router.post('/restore', requireRole(['superAdmin']), async (req: Request, res: Response) => {
  try {
    const { backupId, description } = req.body;
    
    if (!backupId) {
      return res.status(400).json({
        success: false,
        message: '백업 ID가 필요합니다.'
      });
    }
    
    console.log(`🔄 복구 요청 받음: ${backupId}`);
    const restore = await backupService.restoreFromBackup(backupId, description);
    
    res.json({
      success: true,
      message: '데이터베이스 복구가 시작되었습니다.',
      data: {
        id: restore.id,
        timestamp: restore.timestamp,
        backupId: restore.backupId,
        status: restore.status,
        description: restore.description
      }
    });
  } catch (error) {
    console.error('복구 실패:', error);
    res.status(500).json({
      success: false,
      message: '복구 중 오류가 발생했습니다.'
    });
  }
});

/**
 * 백업 삭제
 * DELETE /api/backup/:backupId
 */
router.delete('/:backupId', requireRole(['superAdmin']), async (req: Request, res: Response) => {
  try {
    const { backupId } = req.params;
    
    console.log(`🗑️ 백업 삭제 요청: ${backupId}`);
    const success = await backupService.deleteBackup(backupId);
    
    if (success) {
      res.json({
        success: true,
        message: '백업이 삭제되었습니다.'
      });
    } else {
      res.status(404).json({
        success: false,
        message: '백업을 찾을 수 없습니다.'
      });
    }
  } catch (error) {
    console.error('백업 삭제 실패:', error);
    res.status(500).json({
      success: false,
      message: '백업 삭제 중 오류가 발생했습니다.'
    });
  }
});

/**
 * 자동 백업 설정
 * POST /api/backup/schedule
 */
router.post('/schedule', requireRole(['superAdmin']), (req: Request, res: Response) => {
  try {
    const { intervalHours } = req.body;
    const hours = intervalHours || 24;
    
    if (hours < 1 || hours > 168) { // 1시간 ~ 1주일
      return res.status(400).json({
        success: false,
        message: '백업 간격은 1시간에서 168시간(1주일) 사이여야 합니다.'
      });
    }
    
    backupService.scheduleAutoBackup(hours);
    
    res.json({
      success: true,
      message: `자동 백업이 설정되었습니다. (${hours}시간 간격)`,
      data: {
        intervalHours: hours,
        nextBackup: new Date(Date.now() + hours * 60 * 60 * 1000)
      }
    });
  } catch (error) {
    console.error('자동 백업 설정 실패:', error);
    res.status(500).json({
      success: false,
      message: '자동 백업 설정 중 오류가 발생했습니다.'
    });
  }
});

/**
 * 백업 상태 확인
 * GET /api/backup/status/:backupId
 */
router.get('/status/:backupId', requireRole(['superAdmin', 'centerAdmin']), (req: Request, res: Response) => {
  try {
    const { backupId } = req.params;
    const backups = backupService.getBackups();
    const backup = backups.find(b => b.id === backupId);
    
    if (!backup) {
      return res.status(404).json({
        success: false,
        message: '백업을 찾을 수 없습니다.'
      });
    }
    
    res.json({
      success: true,
      data: {
        id: backup.id,
        timestamp: backup.timestamp,
        type: backup.type,
        size: backup.size,
        status: backup.status,
        description: backup.description,
        filePath: backup.filePath
      }
    });
  } catch (error) {
    console.error('백업 상태 확인 실패:', error);
    res.status(500).json({
      success: false,
      message: '백업 상태 확인 중 오류가 발생했습니다.'
    });
  }
});

export default router;
