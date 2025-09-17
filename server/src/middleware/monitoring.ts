/**
 * 모니터링 미들웨어
 * API 요청을 추적하고 성능 메트릭을 수집합니다.
 */

import { Request, Response, NextFunction } from 'express';
import SystemMonitor from '../monitoring/systemMonitor';

/**
 * API 요청 모니터링 미들웨어
 */
export const apiMonitoring = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  
  // 응답 완료 시 메트릭 기록
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    SystemMonitor.getInstance().recordApiRequest(req, res, duration);
  });

  next();
};

/**
 * 사용자 활동 추적 미들웨어
 */
export const userActivityTracking = (req: Request, res: Response, next: NextFunction): void => {
  // 인증된 사용자의 활동만 추적
  if ((req as any).user) {
    const userId = (req as any).user.id;
    const action = `${req.method} ${req.url}`;
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    
    // 중요한 액션만 기록 (로그인, 데이터 변경 등)
    const importantActions = ['POST', 'PUT', 'DELETE'];
    if (importantActions.includes(req.method)) {
      SystemMonitor.getInstance().recordUserActivity(
        userId,
        action,
        {
          method: req.method,
          url: req.url,
          timestamp: new Date()
        },
        ip
      );
    }
  }

  next();
};

/**
 * 보안 이벤트 추적 미들웨어
 */
export const securityEventTracking = (req: Request, res: Response, next: NextFunction): void => {
  // 보안 관련 이벤트 추적
  const originalSend = res.send;
  
  res.send = function(data) {
    // 인증 실패, 권한 없음 등의 보안 이벤트 추적
    if (res.statusCode === 401 || res.statusCode === 403) {
      const userId = (req as any).user?.id || 'anonymous';
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      
      SystemMonitor.getInstance().recordUserActivity(
        userId,
        'SECURITY_EVENT',
        {
          statusCode: res.statusCode,
          method: req.method,
          url: req.url,
          userAgent: req.get('User-Agent'),
          timestamp: new Date()
        },
        ip
      );

      console.log(`🔒 보안 이벤트: ${req.method} ${req.url} - ${res.statusCode} (${ip})`);
    }

    return originalSend.call(this, data);
  };

  next();
};

/**
 * 에러 추적 미들웨어
 */
export const errorTracking = (error: any, req: Request, res: Response, next: NextFunction): void => {
  const userId = (req as any).user?.id || 'anonymous';
  const ip = req.ip || req.connection.remoteAddress || 'unknown';

  // 에러 정보 기록
  SystemMonitor.getInstance().recordUserActivity(
    userId,
    'ERROR',
    {
      error: error.message,
      stack: error.stack,
      method: req.method,
      url: req.url,
      timestamp: new Date()
    },
    ip
  );

  console.error(`❌ 에러 발생: ${req.method} ${req.url} - ${error.message}`);

  next(error);
};
