/**
 * 🔧 JJ Swim Lab - 공통 유틸리티 함수
 * 
 * 📋 **유틸리티 목적**:
 * - 중복 코드 패턴을 공통 함수로 추출
 * - 일관된 에러 처리 및 로딩 상태 관리
 * - API 호출 헬퍼 함수
 * 
 * 🔄 **연동 데이터**: 없음
 * 🔗 **연동되는 파일**: 모든 Client 컴포넌트 및 페이지
 */

/**
 * 로컬 스토리지에서 인증 토큰 가져오기
 */
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

/**
 * API 요청 헤더 생성 (인증 토큰 포함)
 */
export const createAuthHeaders = (additionalHeaders?: Record<string, string>): HeadersInit => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...additionalHeaders,
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return headers;
};

/**
 * API 에러 처리 및 사용자 피드백
 */
export const handleApiError = (error: unknown, defaultMessage = '오류가 발생했습니다.'): string => {
  if (error instanceof Error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('API 오류:', error);
    }
    return error.message || defaultMessage;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return defaultMessage;
};

/**
 * 안전한 JSON 파싱
 */
export const safeJsonParse = <T = unknown>(json: string, fallback: T): T => {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
};

/**
 * 배열이 비어있지 않은지 확인
 */
export const isNonEmptyArray = <T>(arr: T[] | null | undefined): arr is T[] => {
  return Array.isArray(arr) && arr.length > 0;
};

/**
 * 객체가 비어있지 않은지 확인
 */
export const isNonEmptyObject = (obj: unknown): obj is Record<string, unknown> => {
  return typeof obj === 'object' && obj !== null && Object.keys(obj).length > 0;
};

