/**
 * @file 페이지 방문 추적 미들웨어
 * @description 사용자의 페이지 방문을 자동으로 추적하는 미들웨어입니다.
 * @date 2025-09-19
 * @author JJ Swim Lab
 */

import { Request, Response, NextFunction } from 'express';
import { PageVisit } from '../models/PageVisit';

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    userType: 'student' | 'instructor' | 'centerAdmin' | 'superAdmin';
  };
}

export const pageTrackingMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // 응답이 완료된 후 로그 기록
  res.on('finish', async () => {
    try {
      const responseTime = Date.now() - startTime;
      
      // API 요청만 추적 (정적 파일 제외)
      if (req.path.startsWith('/api/') || req.path.startsWith('/admin/') || req.path.startsWith('/dashboard')) {
        const pageVisit = new PageVisit({
          userId: req.user?._id || undefined,
          userType: req.user?.userType || 'guest',
          path: req.path,
          method: req.method as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
          statusCode: res.statusCode,
          responseTime,
          ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
          userAgent: req.get('User-Agent') || 'unknown',
          referrer: req.get('Referer'),
          visitTime: new Date(),
          sessionId: (req as any).sessionID
        });

        await pageVisit.save();
      }
    } catch (error) {
      // 로그 기록 실패해도 요청 처리에는 영향 없음
      console.warn('⚠️ 페이지 방문 로그 기록 실패:', error);
    }
  });
  
  next();
};

// 로그 정리 함수 (오래된 로그 삭제)
export const cleanupOldPageVisits = async () => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const result = await PageVisit.deleteMany({
      visitTime: { $lt: thirtyDaysAgo }
    });
    
    if (result.deletedCount > 0) {
      console.log(`🗑️ 30일 이전 페이지 방문 로그 ${result.deletedCount}개 삭제`);
    }
  } catch (error) {
    console.error('페이지 방문 로그 정리 오류:', error);
  }
};
