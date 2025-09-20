/**
 * @file 동적 API 요청 제한 미들웨어
 * @description 시스템 설정에 따라 동적으로 API 요청 제한을 적용하는 미들웨어입니다.
 * @date 2025-09-19
 * @author JJ Swim Lab
 */

import { Request, Response, NextFunction } from 'express';
import { SystemConfig } from '../models/SystemConfig';

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    userType: 'student' | 'instructor' | 'centerAdmin' | 'superAdmin';
  };
}

// 클라이언트별 요청 카운트 저장
const requestCounts = new Map<string, {
  count: number;
  resetTime: number;
  maxRequests: number;
}>();

// 설정 캐시 (성능 최적화)
let rateLimitCache: {
  maxRequestsPerMinute: number;
  rateLimitEnabled: boolean;
  lastChecked: number;
} = {
  maxRequestsPerMinute: 100,
  rateLimitEnabled: true,
  lastChecked: 0
};

const CACHE_DURATION = 60 * 1000; // 1분 캐시

export const dynamicRateLimitMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const now = Date.now();
    const clientId = req.ip || 'unknown';
    
    // 캐시된 설정이 유효한지 확인
    if (now - rateLimitCache.lastChecked > CACHE_DURATION) {
      // 데이터베이스에서 최신 설정 조회
      const systemConfig = await SystemConfig.findOne({ isActive: true });
      
      if (systemConfig) {
        rateLimitCache = {
          maxRequestsPerMinute: systemConfig.security.maxRequestsPerMinute,
          rateLimitEnabled: systemConfig.security.rateLimitEnabled,
          lastChecked: now
        };
      }
    }

    // Rate Limit이 비활성화된 경우 통과
    if (!rateLimitCache.rateLimitEnabled) {
      return next();
    }

    // 최고관리자는 Rate Limit 적용 안함
    if (req.user?.userType === 'superAdmin') {
      return next();
    }

    const windowMs = 60 * 1000; // 1분
    const maxRequests = rateLimitCache.maxRequestsPerMinute;
    
    const clientData = requestCounts.get(clientId);
    
    if (!clientData || now > clientData.resetTime) {
      // 새로운 윈도우 시작
      requestCounts.set(clientId, { 
        count: 1, 
        resetTime: now + windowMs,
        maxRequests 
      });
      next();
    } else if (clientData.count >= maxRequests) {
      // 요청 한도 초과
      console.log(`🚨 API 요청 한도 초과: ${clientId} (${clientData.count}/${maxRequests})`);
      
      res.status(429).json({
        success: false,
        error: 'RATE_LIMIT_EXCEEDED',
        message: `API 요청 한도를 초과했습니다. (${maxRequests}요청/분)`,
        retryAfter: Math.ceil((clientData.resetTime - now) / 1000),
        currentRequests: clientData.count,
        maxRequests
      });
    } else {
      // 요청 수 증가
      clientData.count++;
      next();
    }
  } catch (error) {
    console.error('동적 Rate Limit 확인 오류:', error);
    // 오류 시 기본 Rate Limit 적용
    next();
  }
};

// Rate Limit 캐시 강제 새로고침
export const refreshRateLimitCache = () => {
  rateLimitCache.lastChecked = 0;
};

// 클라이언트 요청 카운트 초기화
export const clearRequestCounts = () => {
  requestCounts.clear();
};
