import rateLimit from 'express-rate-limit';
// @ts-ignore
import * as slowDown from 'express-slow-down';
import { Request, Response } from 'express';

// 일반 요청 제한 (분당 100회)
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1분
  max: 100, // 최대 100회 요청
  message: {
    error: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.',
    retryAfter: '60초 후에 다시 시도해주세요.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: '요청 제한에 도달했습니다.',
      retryAfter: Math.ceil(60 / 1000),
      timestamp: new Date().toISOString()
    });
  }
});

// 인증 관련 요청 제한 (분당 5회)
export const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1분
  max: 5, // 최대 5회 요청
  message: {
    error: '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.',
    retryAfter: '60초 후에 다시 시도해주세요.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: '로그인 시도 제한에 도달했습니다.',
      retryAfter: Math.ceil(60 / 1000),
      timestamp: new Date().toISOString()
    });
  }
});

// API 요청 제한 (분당 1000회)
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1분
  max: 1000, // 최대 1000회 요청
  message: {
    error: 'API 요청이 너무 많습니다.',
    retryAfter: '60초 후에 다시 시도해주세요.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'API 요청 제한에 도달했습니다.',
      retryAfter: Math.ceil(60 / 1000),
      timestamp: new Date().toISOString()
    });
  }
});

// 파일 업로드 제한 (시간당 10회)
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1시간
  max: 10, // 최대 10회 업로드
  message: {
    error: '파일 업로드가 너무 많습니다.',
    retryAfter: '1시간 후에 다시 시도해주세요.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: '파일 업로드 제한에 도달했습니다.',
      retryAfter: Math.ceil(3600 / 1000),
      timestamp: new Date().toISOString()
    });
  }
});

// 속도 제한 (점진적 속도 감소)
export const speedLimiter: any = slowDown({
  windowMs: 15 * 60 * 1000, // 15분
  delayAfter: 100, // 100회 요청 후부터 지연 시작
  delayMs: 500, // 500ms씩 지연 증가
  maxDelayMs: 20000, // 최대 20초 지연
  skipSuccessfulRequests: false,
  skipFailedRequests: false
});

// IP별 요청 제한
export const ipLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // IP당 최대 100회 요청
  message: {
    error: 'IP별 요청 제한에 도달했습니다.',
    retryAfter: '15분 후에 다시 시도해주세요.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    return req.ip || req.connection.remoteAddress || 'unknown';
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'IP별 요청 제한에 도달했습니다.',
      retryAfter: Math.ceil(900 / 1000),
      timestamp: new Date().toISOString()
    });
  }
});

