/**
 * 백업 및 복구 API 라우트
 * 데이터베이스 백업, 복구, 관리 기능을 제공합니다.
 */

import { Router, Request, Response } from 'express';
import { backupService } from '../services/backupService';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = Router();

/**
 * 백업 상태 요약 조회
 * GET /api/backup/summary
 */
router.get('/summary', authMiddleware, requireRole(['superAdmin']), (req: Request, res: Response) => {
  try {
    const summary = backupService.getStatus();
    
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
 * 수동 백업 실행
 * POST /api/backup/manual
 */
router.post('/manual', authMiddleware, requireRole(['superAdmin']), async (req: Request, res: Response) => {
  try {
    console.log('💾 수동 백업 실행 요청');
    
    const success = await backupService.triggerManualBackup();
    
    if (success) {
      res.json({
        success: true,
        message: '백업이 성공적으로 완료되었습니다.',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        message: '백업 실행에 실패했습니다.'
      });
    }
  } catch (error) {
    console.error('수동 백업 실행 오류:', error);
    res.status(500).json({
      success: false,
      message: '백업 실행 중 오류가 발생했습니다.'
    });
  }
});

export default router;