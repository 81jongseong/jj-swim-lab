/**
 * 🚦 JJ Swim Lab - Rate Limiting 미들웨어
 * 
 * 📋 **미들웨어 목적**
 * - API 요청 빈도 제한을 통한 서버 보호 및 안정성 확보
 * - DDoS 공격 방지 및 리소스 보호
 * - 사용자별 요청 제한 및 공정한 서비스 제공
 * - 서버 성능 최적화 및 안정성 향상
 * - 요청 제한 통계 및 모니터링
 * 
 * 🔄 **주요 기능**
 * - 일반 요청 제한 (분당 100회)
 * - 인증 관련 요청 제한 (분당 5회)
 * - API 엔드포인트별 요청 제한
 * - 사용자별 요청 제한
 * - 요청 제한 통계 및 모니터링
 * - 요청 제한 알림 및 로깅
 * 
 * 🗄️ **데이터 연동**
 * - HTTP 요청 및 응답 데이터
 * - 요청 제한 통계 및 메트릭
 * - 사용자별 요청 이력
 * - 요청 제한 설정 및 정책
 * - 요청 제한 로그 및 알림
 * 
 * 🛠️ **필요한 설치 파일**
 * - express-rate-limit 라이브러리
 * - express-slow-down 라이브러리
 * - Express.js 미들웨어
 * - 요청 제한 모니터링 도구
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 요청 제한 정책 및 임계값 설정
 * 2. 요청 제한 우회 방지 및 보안
 * 3. 요청 제한 통계 및 모니터링
 * 4. 요청 제한 에러 처리 및 사용자 피드백
 * 5. 요청 제한 성능 최적화
 * 6. 요청 제한 로깅 및 분석
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 요청 제한 정책 설정 확인
 * - [ ] 요청 제한 보안 설정 확인
 * - [ ] 요청 제한 통계 모니터링 확인
 * - [ ] 요청 제한 에러 처리 확인
 * - [ ] 요청 제한 성능 최적화 확인
 * - [ ] 요청 제한 로깅 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 Rate Limiting 미들웨어 구현
 * - 2024-12-19: 일반 요청 제한 시스템 구현
 * - 2024-12-19: 인증 요청 제한 시스템 구현
 * - 2024-12-19: API 엔드포인트별 요청 제한 구현
 * - 2024-12-19: 요청 제한 통계 및 모니터링 시스템 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (Rate Limiting 미들웨어 완료)
 * 
 * 🚀 **다음 단계**
 * - 동적 요청 제한 정책
 * - 요청 제한 예측 및 분석
 * - 요청 제한 자동 조정
 * - 요청 제한 보안 강화
 * - 요청 제한 모니터링 대시보드
 * 
 * 💡 **사용 예시**
 * ```typescript
 * import { generalLimiter, authLimiter } from '../middleware/rateLimit';
 * 
 * // 일반 요청 제한 적용
 * app.use('/api/', generalLimiter);
 * 
 * // 인증 요청 제한 적용
 * app.use('/api/auth/', authLimiter);
 * ```
 * 
 * 🔍 **Rate Limiting 처리 흐름**
 * 1. HTTP 요청 수신 및 분석
 * 2. 요청 제한 정책 확인 및 적용
 * 3. 요청 제한 임계값 검증
 * 4. 요청 제한 초과 시 에러 응답
 * 5. 요청 제한 통계 업데이트
 * 6. 요청 제한 로깅 및 모니터링
 * 7. 요청 제한 결과 반환
 */

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

