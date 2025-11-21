/**
 * 📝 JJ Swim Lab - 로거 유틸리티
 * 
 * 📋 **유틸리티 목적**:
 * - 개발 환경과 프로덕션 환경에서 다른 로깅 레벨 제공
 * - 프로덕션에서는 민감한 정보 제거
 * - 일관된 로깅 포맷 제공
 * 
 * 🔄 **연동 데이터**: 없음
 * 🔗 **연동되는 파일**: 모든 Client 컴포넌트 및 페이지
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  /**
   * 일반 정보 로깅 (개발 환경에서만)
   */
  info: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  /**
   * 경고 로깅 (항상 표시)
   */
  warn: (...args: unknown[]): void => {
    console.warn(...args);
  },

  /**
   * 에러 로깅 (항상 표시)
   */
  error: (...args: unknown[]): void => {
    console.error(...args);
  },

  /**
   * 디버그 로깅 (개발 환경에서만)
   */
  debug: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.log('[DEBUG]', ...args);
    }
  },

  /**
   * API 요청 로깅 (개발 환경에서만)
   */
  api: (message: string, data?: unknown): void => {
    if (isDevelopment) {
      console.log(`[API] ${message}`, data || '');
    }
  },

  /**
   * 성공 로깅 (개발 환경에서만)
   */
  success: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.log('✅', ...args);
    }
  },
};

export default logger;

