/**
 * 🛡️ JJ Swim Lab - 보안 미들웨어
 * 
 * 📋 **미들웨어 목적**
 * - API 엔드포인트 보안 강화
 * - 입력 데이터 검증 및 sanitization
 * - SQL 인젝션 및 XSS 공격 방지
 * - CORS 정책 및 보안 헤더 설정
 * - 민감한 데이터 보호
 * 
 * 🔄 **주요 기능**
 * - 요청 데이터 검증 및 sanitization
 * - SQL 인젝션 방지
 * - XSS 공격 방지
 * - CORS 정책 설정
 * - 보안 헤더 추가
 * - Rate Limiting
 * - 입력 길이 제한
 * - 파일 업로드 보안
 * 
 * 🗄️ **데이터 연동**
 * - 요청 데이터 및 헤더
 * - 사용자 인증 정보
 * - 보안 정책 및 규칙
 * - 에러 로그 및 모니터링
 * - 보안 이벤트 및 알림
 * 
 * 🛠️ **필요한 설치 파일**
 * - Express.js 미들웨어
 * - Helmet.js (보안 헤더)
 * - CORS 미들웨어
 * - Rate Limiting 라이브러리
 * - Input Validation 라이브러리
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 보안 정책의 성능 영향 최소화
 * 2. 사용자 경험과 보안의 균형
 * 3. 민감한 데이터의 적절한 보호
 * 4. 보안 로그의 민감한 정보 보호
 * 5. 정기적인 보안 정책 업데이트
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 보안 미들웨어 동작 확인
 * - [ ] 입력 데이터 검증 검증
 * - [ ] SQL 인젝션 방지 확인
 * - [ ] XSS 공격 방지 확인
 * - [ ] CORS 정책 및 보안 헤더 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 보안 미들웨어)
 * - 2024-12-19: 입력 데이터 검증 및 sanitization 구현
 * - 2024-12-19: SQL 인젝션 및 XSS 공격 방지 구현
 * - 2024-12-19: CORS 정책 및 보안 헤더 설정 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (보안 미들웨어 시스템 완료)
 * 
 * 🚀 **다음 단계**
 * - 고급 보안 분석 및 모니터링
 * - 자동 보안 정책 업데이트
 * - 성능 최적화
 * - 사용자 경험 개선
 * 
 * 💡 **사용 예시**
 * ```typescript
 * app.use(securityMiddleware);
 * app.use('/api', rateLimitMiddleware);
 * app.use('/api', inputValidationMiddleware);
 * ```
 */

import { Request, Response, NextFunction } from 'express';
// import helmet from 'helmet';
// import cors from 'cors';
// import rateLimit from 'express-rate-limit';
import { ValidationChain, validationResult } from './validation';
// import validator from 'validator';

// 보안 헤더 설정 (간단한 버전)
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // 기본 보안 헤더 설정
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
};

// CORS 정책 설정 (간단한 버전)
export const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, x-center-id');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
};

// Rate Limiting 설정 (간단한 버전)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const rateLimitMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // 개발 환경에서는 rate limiting 완화
  if (process.env.NODE_ENV === 'development') {
    next();
    return;
  }
  
  const clientId = req.ip || 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15분
  const maxRequests = 1000; // 개발 환경에서 더 관대하게 설정
  
  const clientData = requestCounts.get(clientId);
  
  if (!clientData || now > clientData.resetTime) {
    // 새로운 윈도우 시작
    requestCounts.set(clientId, { count: 1, resetTime: now + windowMs });
    next();
  } else if (clientData.count >= maxRequests) {
    // 요청 한도 초과
    res.status(429).json({
      error: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.',
      retryAfter: '15분',
    });
  } else {
    // 요청 수 증가
    clientData.count++;
    next();
  }
};

// API Rate Limiting (더 엄격한 버전)
export const apiRateLimitMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // 개발 환경에서는 rate limiting 완화
  if (process.env.NODE_ENV === 'development') {
    next();
    return;
  }
  
  const clientId = req.ip || 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15분
  const maxRequests = 500; // 개발 환경에서 더 관대하게 설정
  
  const clientData = requestCounts.get(clientId);
  
  if (!clientData || now > clientData.resetTime) {
    // 새로운 윈도우 시작
    requestCounts.set(clientId, { count: 1, resetTime: now + windowMs });
    next();
  } else if (clientData.count >= maxRequests) {
    // 요청 한도 초과
    res.status(429).json({
      error: 'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
      retryAfter: '15분',
    });
  } else {
    // 요청 수 증가
    clientData.count++;
    next();
  }
};

// 입력 데이터 sanitization
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  try {
    // 요청 본문 sanitization
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }
    
    // 쿼리 파라미터 sanitization
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query);
    }
    
    // URL 파라미터 sanitization
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeObject(req.params);
    }
    
    next();
  } catch (error) {
    console.error('입력 데이터 sanitization 오류:', error);
    res.status(400).json({
      error: '잘못된 입력 데이터입니다.',
      message: '입력 데이터를 확인해주세요.',
    });
  }
};

// 객체 sanitization 헬퍼 함수
const sanitizeObject = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'string') {
    // HTML 태그 제거 및 XSS 방지 (DOMPurify 대신 기본 정리)
    return obj
      .replace(/<[^>]*>/g, '') // HTML 태그 제거
      .replace(/[<>]/g, '') // 남은 꺾쇠 괄호 제거
      .trim();
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // 키도 sanitization (DOMPurify 대신 기본 정리)
        const sanitizedKey = key
          .replace(/<[^>]*>/g, '') // HTML 태그 제거
          .replace(/[<>]/g, '') // 남은 꺾쇠 괄호 제거
          .trim();
        sanitized[sanitizedKey] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }
  
  return obj;
};

// SQL 인젝션 방지 검증
export const sqlInjectionCheck = (req: Request, res: Response, next: NextFunction) => {
  try {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
      /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
      /(\b(OR|AND)\s+['"]\s*=\s*['"])/i,
      /(\b(OR|AND)\s+['"]\s*LIKE\s*['"])/i,
      /(\b(OR|AND)\s+['"]\s*IN\s*\()/i,
      /(\b(OR|AND)\s+['"]\s*BETWEEN\s+)/i,
      /(\b(OR|AND)\s+['"]\s*IS\s+NULL)/i,
      /(\b(OR|AND)\s+['"]\s*IS\s+NOT\s+NULL)/i,
      /(\b(OR|AND)\s+['"]\s*EXISTS\s*\()/i,
      /(\b(OR|AND)\s+['"]\s*NOT\s+EXISTS\s*\()/i,
      /(\b(OR|AND)\s+['"]\s*HAVING\s+)/i,
      /(\b(OR|AND)\s+['"]\s*GROUP\s+BY\s+)/i,
      /(\b(OR|AND)\s+['"]\s*ORDER\s+BY\s+)/i,
      /(\b(OR|AND)\s+['"]\s*LIMIT\s+)/i,
      /(\b(OR|AND)\s+['"]\s*OFFSET\s+)/i,
      /(\b(OR|AND)\s+['"]\s*UNION\s+SELECT)/i,
      /(\b(OR|AND)\s+['"]\s*UNION\s+ALL\s+SELECT)/i,
      /(\b(OR|AND)\s+['"]\s*UNION\s+DISTINCT\s+SELECT)/i,
      /(\b(OR|AND)\s+['"]\s*UNION\s+ALL\s+DISTINCT\s+SELECT)/i,
    ];
    
    const checkForSQLInjection = (data: any): boolean => {
      if (typeof data === 'string') {
        return sqlPatterns.some(pattern => pattern.test(data));
      }
      
      if (Array.isArray(data)) {
        return data.some(item => checkForSQLInjection(item));
      }
      
      if (typeof data === 'object' && data !== null) {
        return Object.values(data).some(value => checkForSQLInjection(value));
      }
      
      return false;
    };
    
    // 요청 데이터 검사
    if (checkForSQLInjection(req.body) || 
        checkForSQLInjection(req.query) || 
        checkForSQLInjection(req.params)) {
      console.warn('SQL 인젝션 시도 감지:', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        body: req.body,
        query: req.query,
        params: req.params,
        timestamp: new Date().toISOString(),
      });
      
      return res.status(400).json({
        error: '잘못된 요청입니다.',
        message: '입력 데이터를 확인해주세요.',
      });
    }
    
    next();
  } catch (error) {
    console.error('SQL 인젝션 검사 오류:', error);
    res.status(500).json({
      error: '서버 오류가 발생했습니다.',
      message: '잠시 후 다시 시도해주세요.',
    });
  }
};

// XSS 공격 방지 검증
export const xssProtection = (req: Request, res: Response, next: NextFunction) => {
  try {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
      /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
      /<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi,
      /<meta\b[^<]*(?:(?!<\/meta>)<[^<]*)*<\/meta>/gi,
      /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
      /<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi,
      /<meta\b[^<]*(?:(?!<\/meta>)<[^<]*)*<\/meta>/gi,
      /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /onload\s*=/gi,
      /onerror\s*=/gi,
      /onclick\s*=/gi,
      /onmouseover\s*=/gi,
      /onfocus\s*=/gi,
      /onblur\s*=/gi,
      /onchange\s*=/gi,
      /onsubmit\s*=/gi,
      /onreset\s*=/gi,
      /onselect\s*=/gi,
      /onkeydown\s*=/gi,
      /onkeyup\s*=/gi,
      /onkeypress\s*=/gi,
      /onmousedown\s*=/gi,
      /onmouseup\s*=/gi,
      /onmousemove\s*=/gi,
      /onmouseout\s*=/gi,
      /onmouseover\s*=/gi,
      /onmouseenter\s*=/gi,
      /onmouseleave\s*=/gi,
      /oncontextmenu\s*=/gi,
      /ondblclick\s*=/gi,
      /onwheel\s*=/gi,
      /ontouchstart\s*=/gi,
      /ontouchend\s*=/gi,
      /ontouchmove\s*=/gi,
      /ontouchcancel\s*=/gi,
    ];
    
    const checkForXSS = (data: any): boolean => {
      if (typeof data === 'string') {
        return xssPatterns.some(pattern => pattern.test(data));
      }
      
      if (Array.isArray(data)) {
        return data.some(item => checkForXSS(item));
      }
      
      if (typeof data === 'object' && data !== null) {
        return Object.values(data).some(value => checkForXSS(value));
      }
      
      return false;
    };
    
    // 요청 데이터 검사
    if (checkForXSS(req.body) || 
        checkForXSS(req.query) || 
        checkForXSS(req.params)) {
      console.warn('XSS 공격 시도 감지:', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        body: req.body,
        query: req.query,
        params: req.params,
        timestamp: new Date().toISOString(),
      });
      
      return res.status(400).json({
        error: '잘못된 요청입니다.',
        message: '입력 데이터를 확인해주세요.',
      });
    }
    
    next();
  } catch (error) {
    console.error('XSS 검사 오류:', error);
    res.status(500).json({
      error: '서버 오류가 발생했습니다.',
      message: '잠시 후 다시 시도해주세요.',
    });
  }
};

// 입력 길이 제한
export const inputLengthLimit = (req: Request, res: Response, next: NextFunction) => {
  try {
    const limits = {
      body: 1024 * 1024, // 1MB
      query: 2048, // 2KB
      params: 512, // 512B
      headers: 8192, // 8KB
    };
    
    // 요청 본문 길이 검사
    if (req.body && JSON.stringify(req.body).length > limits.body) {
      return res.status(413).json({
        error: '요청 본문이 너무 큽니다.',
        message: '요청 데이터 크기를 줄여주세요.',
      });
    }
    
    // 쿼리 파라미터 길이 검사
    if (req.query && JSON.stringify(req.query).length > limits.query) {
      return res.status(413).json({
        error: '쿼리 파라미터가 너무 큽니다.',
        message: '쿼리 파라미터를 줄여주세요.',
      });
    }
    
    // URL 파라미터 길이 검사
    if (req.params && JSON.stringify(req.params).length > limits.params) {
      return res.status(413).json({
        error: 'URL 파라미터가 너무 큽니다.',
        message: 'URL 파라미터를 줄여주세요.',
      });
    }
    
    // 헤더 길이 검사
    const headerLength = Object.keys(req.headers).reduce((total, key) => {
      return total + key.length + (req.headers[key]?.length || 0);
    }, 0);
    
    if (headerLength > limits.headers) {
      return res.status(413).json({
        error: '헤더가 너무 큽니다.',
        message: '헤더를 줄여주세요.',
      });
    }
    
    next();
  } catch (error) {
    console.error('입력 길이 제한 검사 오류:', error);
    res.status(500).json({
      error: '서버 오류가 발생했습니다.',
      message: '잠시 후 다시 시도해주세요.',
    });
  }
};

// 파일 업로드 보안 검증
export const fileUploadSecurity = (req: Request, res: Response, next: NextFunction) => {
  try {
    // 파일 업로드가 있는 경우에만 검사
    if (req.files) {
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'video/mp4',
        'video/webm',
        'application/pdf',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      
      const maxFileSize = 10 * 1024 * 1024; // 10MB
      
      const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
      
      for (const file of files) {
        // 파일 타입 검사
        if (!allowedTypes.includes(file.mimetype)) {
          return res.status(400).json({
            error: '허용되지 않는 파일 타입입니다.',
            message: '지원되는 파일 형식만 업로드 가능합니다.',
          });
        }
        
        // 파일 크기 검사
        if (file.size > maxFileSize) {
          return res.status(413).json({
            error: '파일 크기가 너무 큽니다.',
            message: '파일 크기는 10MB 이하여야 합니다.',
          });
        }
        
        // 파일명 검사 (특수문자 제한)
        const fileNamePattern = /^[a-zA-Z0-9._-]+$/;
        if (!fileNamePattern.test(file.originalname)) {
          return res.status(400).json({
            error: '잘못된 파일명입니다.',
            message: '파일명에는 영문, 숫자, 점, 하이픈, 언더스코어만 사용 가능합니다.',
          });
        }
      }
    }
    
    next();
  } catch (error) {
    console.error('파일 업로드 보안 검사 오류:', error);
    res.status(500).json({
      error: '서버 오류가 발생했습니다.',
      message: '잠시 후 다시 시도해주세요.',
    });
  }
};

// 입력 데이터 검증 미들웨어 생성기
export const createValidationMiddleware = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 검증 실행
      await Promise.all(validations.map(validation => validation(req, res, () => {})));
      
      // 검증 결과 확인
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: '입력 데이터 검증 실패',
          message: '입력 데이터를 확인해주세요.',
          details: errors.array(),
        });
      }
      
      next();
    } catch (error) {
      console.error('입력 데이터 검증 오류:', error);
      res.status(500).json({
        error: '서버 오류가 발생했습니다.',
        message: '잠시 후 다시 시도해주세요.',
      });
    }
  };
};

// 공통 검증 함수들 (간단한 버전)
export const commonValidations = {
  // 이메일 검증
  email: (email: string): { isValid: boolean; message?: string } => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return { isValid: false, message: '유효한 이메일 주소를 입력해주세요.' };
    }
    return { isValid: true };
  },
  
  // 비밀번호 검증
  password: (password: string): { isValid: boolean; message?: string } => {
    if (!password || password.length < 8 || password.length > 128) {
      return { isValid: false, message: '비밀번호는 8-128자 사이여야 합니다.' };
    }
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!strongPasswordRegex.test(password)) {
      return { isValid: false, message: '비밀번호는 대소문자, 숫자, 특수문자를 포함해야 합니다.' };
    }
    return { isValid: true };
  },
  
  // 이름 검증
  name: (name: string): { isValid: boolean; message?: string } => {
    if (!name || name.length < 1 || name.length > 50) {
      return { isValid: false, message: '이름은 1-50자 사이여야 합니다.' };
    }
    const nameRegex = /^[가-힣a-zA-Z\s]+$/;
    if (!nameRegex.test(name)) {
      return { isValid: false, message: '이름은 한글 또는 영문만 사용 가능합니다.' };
    }
    return { isValid: true };
  },
  
  // 전화번호 검증 (한국 형식)
  phone: (phone: string): { isValid: boolean; message?: string } => {
    if (!phone) {
      return { isValid: false, message: '전화번호를 입력해주세요.' };
    }
    const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return { isValid: false, message: '유효한 전화번호를 입력해주세요.' };
    }
    return { isValid: true };
  },
  
  // MongoDB ID 검증
  id: (id: string): { isValid: boolean; message?: string } => {
    if (!id) {
      return { isValid: false, message: 'ID를 입력해주세요.' };
    }
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!objectIdRegex.test(id)) {
      return { isValid: false, message: '유효한 ID를 입력해주세요.' };
    }
    return { isValid: true };
  },
  
  // 페이지 번호 검증
  page: (page: any): { isValid: boolean; message?: string } => {
    const pageNum = parseInt(page);
    if (isNaN(pageNum) || pageNum < 1 || pageNum > 1000) {
      return { isValid: false, message: '페이지 번호는 1-1000 사이의 정수여야 합니다.' };
    }
    return { isValid: true };
  },
  
  // 페이지 크기 검증
  limit: (limit: any): { isValid: boolean; message?: string } => {
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return { isValid: false, message: '페이지 크기는 1-100 사이의 정수여야 합니다.' };
    }
    return { isValid: true };
  },
};

// 보안 로깅 미들웨어
export const securityLogging = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // 응답 완료 시 로깅
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      referer: req.get('Referer'),
      userId: (req as any).user?.id || 'anonymous',
    };
    
    // 보안 관련 이벤트 로깅
    if (res.statusCode >= 400) {
      console.warn('보안 이벤트:', logData);
    } else {
      console.log('API 요청:', logData);
    }
  });
  
  next();
};

// 통합 보안 미들웨어
export const securityMiddleware = [
  securityHeaders,
  corsMiddleware,
  rateLimitMiddleware,
  sanitizeInput,
  sqlInjectionCheck,
  xssProtection,
  inputLengthLimit,
  fileUploadSecurity,
  securityLogging,
];

export default securityMiddleware;
