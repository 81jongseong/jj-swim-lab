/**
 * @file 리포트 API 라우트
 * @description 리포트 관련 API 엔드포인트들을 정의합니다.
 * @date 2025-09-14
 * @author JJ Swim Lab
 */

import express from 'express';
import { authMiddleware } from '../middleware/auth';
import { Report } from '../models/Report';

const router: express.Router = express.Router();

// 간단한 리포트 조회 API
router.get('/', authMiddleware, async (req: any, res: any) => {
  try {
    const reports = await Report.find({});
    res.json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

export default router;