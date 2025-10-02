/**
 * @file 강습법 레벨 일괄 변경 API 엔드포인트
 * @description 모든 강습법의 레벨을 한국어로 통일
 * @date 2025-01-13
 * @author JJ Swim Lab
 */

import express, { Request, Response, Router } from 'express';
import { TeachingMethod } from '../models/TeachingMethod';

const router: Router = express.Router();

// 레벨 일괄 변경 API
router.post('/update-levels', async (req: Request, res: Response) => {
  try {
    console.log('🔄 강습법 레벨 일괄 변경 시작...');

    // 레벨 매핑 정의
    const levelMapping = {
      'beginner': '초급',
      'intermediate': '중급', 
      'advanced': '상급',
      'expert': '상급',
      '고급': '상급',
      '전문가': '상급'
    };

    const results = [];

    // 각 매핑에 대해 업데이트 실행
    for (const [oldLevel, newLevel] of Object.entries(levelMapping)) {
      const result = await TeachingMethod.updateMany(
        { level: oldLevel },
        { $set: { level: newLevel, updatedAt: new Date() } }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`✅ "${oldLevel}" → "${newLevel}": ${result.modifiedCount}개 업데이트`);
        results.push({
          from: oldLevel,
          to: newLevel,
          count: result.modifiedCount
        });
      } else {
        console.log(`ℹ️ "${oldLevel}": 변경할 데이터 없음`);
      }
    }

    // 최종 결과 확인
    const levelStats = await TeachingMethod.aggregate([
      { $group: { _id: '$level', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('📊 최종 레벨 통계:', levelStats);

    res.json({
      success: true,
      message: '레벨 변경이 완료되었습니다!',
      results: results,
      finalStats: levelStats
    });

  } catch (error) {
    console.error('❌ 레벨 변경 오류:', error);
    res.status(500).json({
      success: false,
      message: '레벨 변경에 실패했습니다.',
      error: error.message
    });
  }
});

export default router;

