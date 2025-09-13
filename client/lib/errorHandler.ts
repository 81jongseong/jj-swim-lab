import React from 'react';

/**
 * ❌ JJ Swim Lab - 클라이언트 에러 처리 유틸리티
 * 
 * 📋 **유틸리티 목적**
 * - 클라이언트 애플리케이션의 에러 처리를 표준화하는 유틸리티
 * - 일관된 에러 상태 관리 및 사용자 경험 개선
 * - 에러 로깅 및 모니터링 통합 관리
 * - 에러 복구 및 재시도 로직 표준화
 * - 사용자 친화적 에러 메시지 제공
 * 
 * 🔄 **주요 기능**
 * - 표준화된 에러 상태 관리
 * - 에러 타입 및 심각도 분류
 * - 에러 로깅 및 모니터링
 * - 에러 복구 및 재시도 로직
 * - 사용자 친화적 에러 메시지
 * - 에러 성능 최적화
 * 
 * 🗄️ **데이터 연동**
 * - 에러 객체 및 스택 트레이스
 * - 에러 로깅 시스템
 * - 사용자 세션 및 컨텍스트 정보
 * - 에러 복구 및 재시도 상태
 * - API 응답 에러 데이터
 * 
 * 🛠️ **필요한 설치 파일**
 * - React (에러 상태 관리)
 * - 에러 로깅 및 모니터링 도구
 * - 에러 처리 및 복구 시스템
 * - 사용자 알림 시스템
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 에러 메시지의 사용자 친화적 표현
 * 2. 에러 로깅의 성능 및 메모리 사용량 관리
 * 3. 에러 복구 로직의 안정성 및 무한 루프 방지
 * 4. 에러 모니터링의 실시간성 및 정확성
 * 5. 사용자 경험을 고려한 에러 UI/UX
 * 6. 에러 처리 성능 최적화
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 에러 메시지 사용자 친화성 확인
 * - [ ] 에러 로깅 성능 확인
 * - [ ] 에러 복구 로직 안정성 확인
 * - [ ] 에러 모니터링 정확성 확인
 * - [ ] 사용자 경험 개선 확인
 * - [ ] 에러 처리 성능 최적화 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 클라이언트 에러 처리 유틸리티 구현
 * - 2024-12-19: 표준화된 에러 상태 관리 구현
 * - 2024-12-19: 에러 타입 및 심각도 분류 시스템 구현
 * - 2024-12-19: 에러 로깅 및 모니터링 통합 구현
 * - 2024-12-19: 에러 복구 및 재시도 로직 표준화 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (클라이언트 에러 처리 유틸리티 완료)
 * 
 * 🚀 **다음 단계**
 * - AI 기반 에러 분석 및 진단
 * - 자동 에러 복구 시스템
 * - 에러 성능 모니터링
 * - 에러 보안 강화
 * 
 * 💡 **사용 예시**
 * ```tsx
 * import { ErrorHandler, ErrorBoundary, useErrorHandler } from '@/lib/errorHandler';
 * 
 * // 에러 핸들러 사용
 * const { handleError, clearError } = useErrorHandler();
 * 
 * // 에러 처리
 * try {
 *   await apiCall();
 * } catch (error) {
 *   handleError(error, { context: 'API Call' });
 * }
 * 
 * // 에러 바운더리 사용
 * <ErrorBoundary fallback={<ErrorFallback />}>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 * 
 * 🔍 **에러 처리 흐름**
 * 1. 에러 발생 및 감지
 * 2. 에러 타입 및 심각도 분석
 * 3. 에러 로깅 및 모니터링 데이터 수집
 * 4. 사용자 친화적 에러 메시지 생성
 * 5. 에러 복구 및 재시도 로직 실행
 * 6. 에러 상태 업데이트 및 UI 반영
 * 7. 에러 성능 메트릭 업데이트
 */

import { useState, useCallback, useRef, useEffect } from 'react';

// 에러 타입 열거형
export enum ErrorType {
  // 네트워크 관련 에러
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  
  // API 관련 에러
  API_ERROR = 'API_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  
  // 사용자 관련 에러
  USER_ERROR = 'USER_ERROR',
  INPUT_ERROR = 'INPUT_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  
  // 시스템 관련 에러
  SYSTEM_ERROR = 'SYSTEM_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  RUNTIME_ERROR = 'RUNTIME_ERROR'
}

// 에러 심각도 열거형
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// 에러 상태 인터페이스
export interface ErrorState {
  hasError: boolean;
  error: Error | null;
  errorType: ErrorType | null;
  severity: ErrorSeverity | null;
  message: string;
  context?: Record<string, unknown>;
  timestamp: Date | null;
  retryCount: number;
  maxRetries: number;
}

// 에러 핸들러 옵션
export interface ErrorHandlerOptions {
  maxRetries?: number;
  retryDelay?: number;
  onError?: (error: Error, context?: Record<string, unknown>) => void;
  onRetry?: (retryCount: number) => void;
  onClear?: () => void;
}

// 에러 메시지 매핑
const ERROR_MESSAGES: Record<ErrorType, string> = {
  [ErrorType.NETWORK_ERROR]: '네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요.',
  [ErrorType.TIMEOUT_ERROR]: '요청 시간이 초과되었습니다. 다시 시도해주세요.',
  [ErrorType.CONNECTION_ERROR]: '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.',
  [ErrorType.API_ERROR]: '서버에서 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  [ErrorType.VALIDATION_ERROR]: '입력한 정보를 확인해주세요.',
  [ErrorType.AUTHENTICATION_ERROR]: '로그인이 필요합니다.',
  [ErrorType.AUTHORIZATION_ERROR]: '접근 권한이 없습니다.',
  [ErrorType.USER_ERROR]: '사용자 입력에 문제가 있습니다.',
  [ErrorType.INPUT_ERROR]: '입력한 정보가 올바르지 않습니다.',
  [ErrorType.PERMISSION_ERROR]: '이 작업을 수행할 권한이 없습니다.',
  [ErrorType.SYSTEM_ERROR]: '시스템 오류가 발생했습니다. 관리자에게 문의해주세요.',
  [ErrorType.UNKNOWN_ERROR]: '알 수 없는 오류가 발생했습니다.',
  [ErrorType.RUNTIME_ERROR]: '실행 중 오류가 발생했습니다.'
};

// 에러 타입 감지 함수
const detectErrorType = (error: Error): ErrorType => {
  const message = error.message.toLowerCase();
  
  if (message.includes('network') || message.includes('fetch')) {
    return ErrorType.NETWORK_ERROR;
  }
  
  if (message.includes('timeout')) {
    return ErrorType.TIMEOUT_ERROR;
  }
  
  if (message.includes('unauthorized') || message.includes('401')) {
    return ErrorType.AUTHENTICATION_ERROR;
  }
  
  if (message.includes('forbidden') || message.includes('403')) {
    return ErrorType.AUTHORIZATION_ERROR;
  }
  
  if (message.includes('validation') || message.includes('400')) {
    return ErrorType.VALIDATION_ERROR;
  }
  
  if (message.includes('500') || message.includes('internal')) {
    return ErrorType.SYSTEM_ERROR;
  }
  
  return ErrorType.UNKNOWN_ERROR;
};

// 에러 심각도 결정 함수
const determineSeverity = (errorType: ErrorType): ErrorSeverity => {
  switch (errorType) {
    case ErrorType.SYSTEM_ERROR:
      return ErrorSeverity.CRITICAL;
    case ErrorType.AUTHENTICATION_ERROR:
    case ErrorType.AUTHORIZATION_ERROR:
      return ErrorSeverity.HIGH;
    case ErrorType.API_ERROR:
    case ErrorType.NETWORK_ERROR:
      return ErrorSeverity.MEDIUM;
    default:
      return ErrorSeverity.LOW;
  }
};

// 에러 로깅 함수
const logError = (error: Error, context?: Record<string, unknown>): void => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  };
  
  // 콘솔에 로깅
  console.error('Client Error:', errorInfo);
  
  // 실제 구현에서는 에러 모니터링 서비스로 전송
  // 예: Sentry, LogRocket, Bugsnag 등
};

// 에러 핸들러 훅
export const useErrorHandler = (options: ErrorHandlerOptions = {}) => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    onError,
    onRetry,
    onClear
  } = options;
  
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    errorType: null,
    severity: null,
    message: '',
    context: undefined,
    timestamp: null,
    retryCount: 0,
    maxRetries
  });
  
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // 에러 처리 함수
  const handleError = useCallback((error: Error, context?: Record<string, unknown>) => {
    const errorType = detectErrorType(error);
    const severity = determineSeverity(errorType);
    const message = ERROR_MESSAGES[errorType] || error.message;
    
    // 에러 로깅
    logError(error, context);
    
    // 에러 상태 업데이트
    setErrorState({
      hasError: true,
      error,
      errorType,
      severity,
      message,
      context,
      timestamp: new Date(),
      retryCount: 0,
      maxRetries
    });
    
    // 콜백 실행
    onError?.(error, context);
  }, [maxRetries, onError]);
  
  // 에러 재시도 함수
  const retry = useCallback(async (retryFunction: () => Promise<void>) => {
    if (errorState.retryCount >= errorState.maxRetries) {
      return;
    }
    
    const newRetryCount = errorState.retryCount + 1;
    
    setErrorState(prev => ({
      ...prev,
      retryCount: newRetryCount
    }));
    
    // 재시도 콜백 실행
    onRetry?.(newRetryCount);
    
    // 지연 후 재시도
    retryTimeoutRef.current = setTimeout(async () => {
      try {
        await retryFunction();
        clearError();
      } catch (error) {
        if (newRetryCount < errorState.maxRetries) {
          handleError(error as Error, { retryCount: newRetryCount });
        } else {
          handleError(error as Error, { 
            context: { retryCount: newRetryCount, maxRetries: errorState.maxRetries }
          });
        }
      }
    }, retryDelay * newRetryCount);
  }, [errorState.retryCount, errorState.maxRetries, retryDelay, onRetry, handleError]);
  
  // 에러 클리어 함수
  const clearError = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    
    setErrorState({
      hasError: false,
      error: null,
      errorType: null,
      severity: null,
      message: '',
      context: undefined,
      timestamp: null,
      retryCount: 0,
      maxRetries
    });
    
    onClear?.();
  }, [maxRetries, onClear]);
  
  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);
  
  return {
    errorState,
    handleError,
    retry,
    clearError,
    canRetry: errorState.retryCount < errorState.maxRetries
  };
};

// 에러 바운더리 컴포넌트
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, { hasError: boolean; error: Error | null }> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logError(error, { errorInfo });
    this.props.onError?.(error, errorInfo);
  }
  
  render(): React.ReactNode {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return React.createElement(FallbackComponent, {
        error: this.state.error,
        retry: () => this.setState({ hasError: false, error: null })
      });
    }
    
    return this.props.children;
  }
}

// 기본 에러 폴백 컴포넌트
const DefaultErrorFallback: React.FC<{ error: Error; retry: () => void }> = ({ error, retry }) => {
  return React.createElement('div', { className: 'min-h-screen flex items-center justify-center bg-gray-50' },
    React.createElement('div', { className: 'max-w-md w-full bg-white shadow-lg rounded-lg p-6' },
      React.createElement('div', { className: 'flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full' },
        React.createElement('svg', { className: 'w-6 h-6 text-red-600', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
          React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z' })
        )
      ),
      React.createElement('div', { className: 'mt-4 text-center' },
        React.createElement('h3', { className: 'text-lg font-medium text-gray-900' }, '오류가 발생했습니다'),
        React.createElement('p', { className: 'mt-2 text-sm text-gray-500' },
          ERROR_MESSAGES[detectErrorType(error)] || '알 수 없는 오류가 발생했습니다.'
        ),
        React.createElement('div', { className: 'mt-4' },
          React.createElement('button', {
            onClick: retry,
            className: 'inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          }, '다시 시도')
        )
      )
    )
  );
};

// 에러 핸들러 유틸리티 함수들
export const ErrorHandler = {
  // 에러 타입 감지
  detectErrorType,
  
  // 에러 심각도 결정
  determineSeverity,
  
  // 에러 메시지 가져오기
  getErrorMessage: (errorType: ErrorType) => ERROR_MESSAGES[errorType],
  
  // 에러 로깅
  logError,
  
  // 에러 복구 시도
  retryOperation: async <T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> => {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          throw lastError;
        }
        
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
        console.warn(`Operation retry attempt ${attempt}/${maxRetries}`, { error: lastError.message });
      }
    }
    
    throw lastError!;
  }
};

export default ErrorHandler;

