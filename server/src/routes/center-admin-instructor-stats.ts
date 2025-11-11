/**
 * 센터 관리자 - 강사 통계 API 라우터
 * 강사별 담당 학생 수, 진행 수업 수 등 통계 정보 제공
 */

import express from 'express';

const router = express.Router();

// 모든 강사 통계 정보 조회 (센터별)
router.get('/instructors/stats', (req, res) => {
  console.log('🔍 강사 통계 조회 시작 (최소 버전)');
  
  // 최소한의 응답
  res.json({
    success: true,
    message: '강사 통계 조회 성공',
    data: []
  });
});

export default router;