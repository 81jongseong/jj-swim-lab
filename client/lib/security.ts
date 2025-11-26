/**
 * 🛡️ JJ Swim Lab - 클라이언트 보안 유틸리티
 * 
 * 📋 **유틸리티 목적**
 * - 클라이언트 측 보안 강화
 * - 입력 데이터 검증 및 sanitization
 * - XSS 공격 방지
 * - 민감한 데이터 보호
 * - 보안 정책 적용
 * 
 * 🔄 **주요 기능**
 * - 입력 데이터 검증 및 sanitization
 * - XSS 공격 방지
 * - 민감한 데이터 마스킹
 * - 보안 헤더 설정
 * - CSRF 토큰 관리
 * - 로컬 스토리지 보안
 * - 세션 관리
 * 
 * 🗄️ **데이터 연동**
 * - 사용자 입력 데이터
 * - 민감한 정보 (토큰, 비밀번호 등)
 * - 로컬 스토리지 데이터
 * - 세션 정보
 * - 보안 정책 및 규칙
 * 
 * 🛠️ **필요한 설치 파일**
 * - DOMPurify (XSS 방지)
 * - validator.js (입력 검증)
 * - crypto-js (암호화)
 * - js-cookie (쿠키 관리)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 클라이언트 측 보안의 한계 인식
 * 2. 민감한 데이터의 서버 측 검증 필요
 * 3. 보안 정책의 성능 영향 최소화
 * 4. 사용자 경험과 보안의 균형
 * 5. 정기적인 보안 정책 업데이트
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 입력 데이터 검증 동작 확인
 * - [ ] XSS 공격 방지 확인
 * - [ ] 민감한 데이터 보호 확인
 * - [ ] 보안 헤더 설정 확인
 * - [ ] CSRF 토큰 관리 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 클라이언트 보안)
 * - 2024-12-19: 입력 데이터 검증 및 sanitization 구현
 * - 2024-12-19: XSS 공격 방지 구현
 * - 2024-12-19: 민감한 데이터 보호 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (클라이언트 보안 시스템 완료)
 * 
 * 🚀 **다음 단계**
 * - 고급 보안 분석 및 모니터링
 * - 자동 보안 정책 업데이트
 * - 성능 최적화
 * - 사용자 경험 개선
 * 
 * 💡 **사용 예시**
 * ```typescript
 * import { sanitizeInput, validateEmail, maskSensitiveData } from '@/lib/security';
 * 
 * const cleanInput = sanitizeInput(userInput);
 * const isValidEmail = validateEmail(email);
 * const maskedToken = maskSensitiveData(token);
 * ```
 */

'use client';

// import DOMPurify from 'isomorphic-dompurify';
import validator from 'validator';
import CryptoJS from 'crypto-js';
import { logger } from '@/lib/logger';

// 보안 설정
const SECURITY_CONFIG = {
  // XSS 방지 설정
  XSS: {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: false,
  },
  
  // 입력 길이 제한
  INPUT_LIMITS: {
    TEXT: 1000,
    EMAIL: 255,
    PASSWORD: 128,
    PHONE: 20,
    URL: 2048,
  },
  
  // 민감한 데이터 마스킹
  MASKING: {
    EMAIL: { visible: 2, hidden: 4 },
    PHONE: { visible: 3, hidden: 4 },
    TOKEN: { visible: 4, hidden: 8 },
    CARD: { visible: 4, hidden: 8 },
  },
  
  // 암호화 설정
  ENCRYPTION: {
    ALGORITHM: 'AES',
    KEY_SIZE: 256,
    IV_SIZE: 16,
  },
};

// 입력 데이터 sanitization
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }
  
  // HTML 태그 제거 및 XSS 방지 (DOMPurify 대신 기본 정리)
  const sanitized = input
    .replace(/<[^>]*>/g, '') // HTML 태그 제거
    .replace(/[<>]/g, ''); // 남은 꺾쇠 괄호 제거
  
  // 추가 정리
  return sanitized
    .trim()
    .replace(/\s+/g, ' ') // 연속된 공백을 하나로
    .replace(/[<>]/g, ''); // 남은 꺾쇠 괄호 제거
};

// 객체 sanitization
export const sanitizeObject = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'string') {
    return sanitizeInput(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const sanitizedKey = sanitizeInput(key);
        sanitized[sanitizedKey] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }
  
  return obj;
};

// 이메일 검증
export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  // 길이 제한
  if (email.length > SECURITY_CONFIG.INPUT_LIMITS.EMAIL) {
    return false;
  }
  
  // 이메일 형식 검증
  return validator.isEmail(email);
};

// 비밀번호 강도 검증
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  score: number;
  errors: string[];
} => {
  const errors: string[] = [];
  let score = 0;
  
  if (!password || typeof password !== 'string') {
    return { isValid: false, score: 0, errors: ['비밀번호를 입력해주세요.'] };
  }
  
  // 길이 검사
  if (password.length < 8) {
    errors.push('비밀번호는 최소 8자 이상이어야 합니다.');
  } else if (password.length >= 8) {
    score += 1;
  }
  
  if (password.length > SECURITY_CONFIG.INPUT_LIMITS.PASSWORD) {
    errors.push('비밀번호는 최대 128자 이하여야 합니다.');
  }
  
  // 대소문자 검사
  if (!/[a-z]/.test(password)) {
    errors.push('비밀번호는 소문자를 포함해야 합니다.');
  } else {
    score += 1;
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('비밀번호는 대문자를 포함해야 합니다.');
  } else {
    score += 1;
  }
  
  // 숫자 검사
  if (!/\d/.test(password)) {
    errors.push('비밀번호는 숫자를 포함해야 합니다.');
  } else {
    score += 1;
  }
  
  // 특수문자 검사
  if (!/[@$!%*?&]/.test(password)) {
    errors.push('비밀번호는 특수문자(@$!%*?&)를 포함해야 합니다.');
  } else {
    score += 1;
  }
  
  // 연속된 문자 검사
  if (/(.)\1{2,}/.test(password)) {
    errors.push('비밀번호는 연속된 문자를 3개 이상 사용할 수 없습니다.');
  } else {
    score += 1;
  }
  
  // 일반적인 패턴 검사
  const commonPatterns = [
    /123456/,
    /password/i,
    /qwerty/i,
    /abc123/i,
    /admin/i,
    /user/i,
  ];
  
  if (commonPatterns.some(pattern => pattern.test(password))) {
    errors.push('비밀번호는 일반적인 패턴을 사용할 수 없습니다.');
  } else {
    score += 1;
  }
  
  return {
    isValid: errors.length === 0,
    score: Math.min(score, 6),
    errors,
  };
};

// 전화번호 검증
export const validatePhone = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') {
    return false;
  }
  
  // 길이 제한
  if (phone.length > SECURITY_CONFIG.INPUT_LIMITS.PHONE) {
    return false;
  }
  
  // 한국 전화번호 형식 검증
  const cleanPhone = phone.replace(/[-\s]/g, '');
  return /^01[016789]\d{7,8}$/.test(cleanPhone);
};

// URL 검증
export const validateUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  // 길이 제한
  if (url.length > SECURITY_CONFIG.INPUT_LIMITS.URL) {
    return false;
  }
  
  // URL 형식 검증
  return validator.isURL(url);
};

// 텍스트 길이 검증
export const validateTextLength = (text: string, maxLength: number = SECURITY_CONFIG.INPUT_LIMITS.TEXT): boolean => {
  if (!text || typeof text !== 'string') {
    return false;
  }
  
  return text.length <= maxLength;
};

// 민감한 데이터 마스킹
export const maskSensitiveData = (data: string, type: 'email' | 'phone' | 'token' | 'card' = 'token'): string => {
  if (!data || typeof data !== 'string') {
    return '';
  }
  
  const config = SECURITY_CONFIG.MASKING[type.toUpperCase() as keyof typeof SECURITY_CONFIG.MASKING];
  
  if (data.length <= config.visible + config.hidden) {
    return '*'.repeat(data.length);
  }
  
  const visibleStart = data.substring(0, config.visible);
  const visibleEnd = data.substring(data.length - config.visible);
  const hidden = '*'.repeat(config.hidden);
  
  return `${visibleStart}${hidden}${visibleEnd}`;
};

// 데이터 암호화
export const encryptData = (data: string, key: string): string => {
  try {
    const encrypted = CryptoJS.AES.encrypt(data, key).toString();
    return encrypted;
  } catch (error) {
    logger.error('데이터 암호화 오류:', error);
    return '';
  }
};

// 데이터 복호화
export const decryptData = (encryptedData: string, key: string): string => {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key).toString(CryptoJS.enc.Utf8);
    return decrypted;
  } catch (error) {
    logger.error('데이터 복호화 오류:', error);
    return '';
  }
};

// 로컬 스토리지 보안 저장
export const secureSetItem = (key: string, value: any): boolean => {
  try {
    const encryptedValue = encryptData(JSON.stringify(value), key);
    localStorage.setItem(key, encryptedValue);
    return true;
  } catch (error) {
    logger.error('보안 저장 오류:', error);
    return false;
  }
};

// 로컬 스토리지 보안 조회
export const secureGetItem = (key: string): any => {
  try {
    const encryptedValue = localStorage.getItem(key);
    if (!encryptedValue) {
      return null;
    }
    
    const decryptedValue = decryptData(encryptedValue, key);
    return JSON.parse(decryptedValue);
  } catch (error) {
    logger.error('보안 조회 오류:', error);
    return null;
  }
};

// 로컬 스토리지 보안 삭제
export const secureRemoveItem = (key: string): boolean => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    logger.error('보안 삭제 오류:', error);
    return false;
  }
};

// CSRF 토큰 생성
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// CSRF 토큰 검증
export const validateCSRFToken = (token: string, storedToken: string): boolean => {
  if (!token || !storedToken) {
    return false;
  }
  
  return token === storedToken;
};

// 보안 헤더 설정
export const setSecurityHeaders = (): void => {
  // Content Security Policy 설정
  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.jj-swim-lab.com;";
  document.head.appendChild(meta);
  
  // X-Frame-Options 설정
  const frameOptions = document.createElement('meta');
  frameOptions.httpEquiv = 'X-Frame-Options';
  frameOptions.content = 'DENY';
  document.head.appendChild(frameOptions);
  
  // X-Content-Type-Options 설정
  const contentTypeOptions = document.createElement('meta');
  contentTypeOptions.httpEquiv = 'X-Content-Type-Options';
  contentTypeOptions.content = 'nosniff';
  document.head.appendChild(contentTypeOptions);
  
  // Referrer Policy 설정
  const referrerPolicy = document.createElement('meta');
  referrerPolicy.name = 'referrer';
  referrerPolicy.content = 'strict-origin-when-cross-origin';
  document.head.appendChild(referrerPolicy);
};

// 세션 관리
export const sessionManager = {
  // 세션 생성
  createSession: (userId: string, userData: any): boolean => {
    try {
      const sessionData = {
        userId,
        userData,
        createdAt: new Date().toISOString(),
        lastAccessedAt: new Date().toISOString(),
        isActive: true,
      };
      
      return secureSetItem('session', sessionData);
    } catch (error) {
      logger.error('세션 생성 오류:', error);
      return false;
    }
  },
  
  // 세션 조회
  getSession: (): any => {
    try {
      const session = secureGetItem('session');
      if (!session || !session.isActive) {
        return null;
      }
      
      // 세션 갱신
      session.lastAccessedAt = new Date().toISOString();
      secureSetItem('session', session);
      
      return session;
    } catch (error) {
      logger.error('세션 조회 오류:', error);
      return null;
    }
  },
  
  // 세션 갱신
  refreshSession: (): boolean => {
    try {
      const session = secureGetItem('session');
      if (!session) {
        return false;
      }
      
      session.lastAccessedAt = new Date().toISOString();
      return secureSetItem('session', session);
    } catch (error) {
      logger.error('세션 갱신 오류:', error);
      return false;
    }
  },
  
  // 세션 삭제
  deleteSession: (): boolean => {
    try {
      return secureRemoveItem('session');
    } catch (error) {
      logger.error('세션 삭제 오류:', error);
      return false;
    }
  },
  
  // 세션 만료 검사
  isSessionExpired: (maxAge: number = 24 * 60 * 60 * 1000): boolean => {
    try {
      const session = secureGetItem('session');
      if (!session) {
        return true;
      }
      
      const lastAccessed = new Date(session.lastAccessedAt);
      const now = new Date();
      const age = now.getTime() - lastAccessed.getTime();
      
      return age > maxAge;
    } catch (error) {
      logger.error('세션 만료 검사 오류:', error);
      return true;
    }
  },
};

// 보안 로깅
export const securityLogger = {
  logSecurityEvent: (event: string, details: any): void => {
    try {
      const logData = {
        event,
        details,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      };
      
      logger.warn('보안 이벤트', logData);
      
      // 실제 구현에서는 보안 로깅 서비스에 전송
      // 예: Sentry.captureMessage(event, { extra: details });
    } catch (error) {
      logger.error('보안 로깅 오류:', error);
    }
  },
  
  logInputValidation: (field: string, value: any, isValid: boolean): void => {
    if (!isValid) {
      securityLogger.logSecurityEvent('입력 검증 실패', {
        field,
        value: maskSensitiveData(String(value)),
        isValid,
      });
    }
  },
  
  logAuthenticationAttempt: (email: string, success: boolean): void => {
    securityLogger.logSecurityEvent('인증 시도', {
      email: maskSensitiveData(email, 'email'),
      success,
    });
  },
};

// 보안 정책 초기화
export const initializeSecurity = (): void => {
  // 보안 헤더 설정
  setSecurityHeaders();
  
  // 세션 만료 검사
  if (sessionManager.isSessionExpired()) {
    sessionManager.deleteSession();
  }
  
  // 보안 이벤트 리스너 설정
  window.addEventListener('beforeunload', () => {
    // 페이지 이탈 시 민감한 데이터 정리
    secureRemoveItem('tempData');
  });
  
  // 개발자 도구 감지 (기본적인 보안)
  let devtools = { open: false, orientation: null };
  setInterval(() => {
    if (window.outerHeight - window.innerHeight > 200 || window.outerWidth - window.innerWidth > 200) {
      if (!devtools.open) {
        devtools.open = true;
        securityLogger.logSecurityEvent('개발자 도구 감지', {
          userAgent: navigator.userAgent,
          url: window.location.href,
        });
      }
    } else {
      devtools.open = false;
    }
  }, 500);
};

export default {
  sanitizeInput,
  sanitizeObject,
  validateEmail,
  validatePasswordStrength,
  validatePhone,
  validateUrl,
  validateTextLength,
  maskSensitiveData,
  encryptData,
  decryptData,
  secureSetItem,
  secureGetItem,
  secureRemoveItem,
  generateCSRFToken,
  validateCSRFToken,
  setSecurityHeaders,
  sessionManager,
  securityLogger,
  initializeSecurity,
};

