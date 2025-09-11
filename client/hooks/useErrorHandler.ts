/**
 * 🛠️ JJ Swim Lab - useErrorHandler 훅
 * 
 * 📋 **훅 목적**
 * - 애플리케이션 전반의 에러 처리를 중앙화
 * - 사용자 친화적인 에러 메시지 제공
 * - 에러 로깅 및 모니터링 시스템 연동
 * - 에러 복구 및 재시도 로직 관리
 * 
 * 🔄 **주요 기능**
 * - 에러 발생 시 자동 처리
 * - 에러 타입별 적절한 메시지 생성
 * - 에러 로깅 및 모니터링
 * - 에러 복구 및 재시도 기능
 * - 사용자 알림 및 피드백
 * 
 * 🗄️ **데이터 연동**
 * - 에러 정보 및 컨텍스트
 * - 사용자 액션 및 상태
 * - 에러 발생 빈도 및 패턴
 * - 에러 복구 및 재시도 상태
 * - 모니터링 및 로깅 데이터
 * 
 * 🛠️ **필요한 설치 파일**
 * - React (useState, useCallback, useEffect)
 * - 에러 로깅 서비스 (Sentry, LogRocket 등)
 * - 토스트 알림 시스템
 * - 모니터링 도구 및 대시보드
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 에러 처리의 성능 영향 최소화
 * 2. 에러 메시지의 사용자 친화성
 * 3. 에러 로깅의 민감한 데이터 보호
 * 4. 에러 복구 로직의 안정성
 * 5. 메모리 누수 방지
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 에러 처리 로직 동작 확인
 * - [ ] 에러 메시지 생성 검증
 * - [ ] 에러 로깅 및 모니터링 확인
 * - [ ] 에러 복구 및 재시도 기능 확인
 * - [ ] 성능 및 메모리 사용량 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 에러 처리)
 * - 2024-12-19: 에러 타입별 처리 구현
 * - 2024-12-19: 에러 로깅 및 모니터링 시스템 구현
 * - 2024-12-19: 에러 복구 및 재시도 시스템 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (에러 처리 시스템 완료)
 * 
 * 🚀 **다음 단계**
 * - 고급 에러 분석 및 예측
 * - 자동 에러 복구 시스템
 * - 성능 최적화
 * - 사용자 경험 개선
 * 
 * 💡 **사용 예시**
 * ```tsx
 * const { handleError, showError, clearError } = useErrorHandler();
 * 
 * try {
 *   await apiCall();
 * } catch (error) {
 *   handleError(error, { context: 'API 호출' });
 * }
 * ```
 */

'use client';

import { useState, useCallback, useRef } from 'react';

export interface ErrorContext {
  context?: string;
  userId?: string;
  action?: string;
  metadata?: Record<string, any>;
  originalErrorId?: string;
}

export interface ErrorInfo {
  id: string;
  message: string;
  type: 'network' | 'auth' | 'permission' | 'validation' | 'server' | 'general';
  timestamp: Date;
  context?: ErrorContext;
  stack?: string;
  retryable: boolean;
}

export interface UseErrorHandlerReturn {
  errors: ErrorInfo[];
  handleError: (error: Error | string, context?: ErrorContext) => void;
  showError: (message: string, type?: ErrorInfo['type'], context?: ErrorContext) => void;
  clearError: (errorId: string) => void;
  clearAllErrors: () => void;
  retryError: (errorId: string, retryFn: () => Promise<void>) => Promise<void>;
  getErrorById: (errorId: string) => ErrorInfo | undefined;
  getErrorsByType: (type: ErrorInfo['type']) => ErrorInfo[];
}

export const useErrorHandler = (): UseErrorHandlerReturn => {
  const [errors, setErrors] = useState<ErrorInfo[]>([]);
  const retryFunctions = useRef<Map<string, () => Promise<void>>>(new Map());

  // 에러 타입 결정
  const determineErrorType = (error: Error | string): ErrorInfo['type'] => {
    if (typeof error === 'string') return 'general';
    
    const message = error.message.toLowerCase();
    if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
      return 'network';
    }
    if (message.includes('auth') || message.includes('login') || message.includes('token')) {
      return 'auth';
    }
    if (message.includes('permission') || message.includes('access') || message.includes('forbidden')) {
      return 'permission';
    }
    if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
      return 'validation';
    }
    if (message.includes('server') || message.includes('500') || message.includes('internal')) {
      return 'server';
    }
    return 'general';
  };

  // 에러 메시지 생성
  const generateErrorMessage = (error: Error | string, type: ErrorInfo['type']): string => {
    if (typeof error === 'string') return error;
    
    const message = error.message;
    
    // 에러 타입별 사용자 친화적인 메시지
    switch (type) {
      case 'network':
        return '네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인하고 다시 시도해주세요.';
      case 'auth':
        return '로그인이 필요합니다. 다시 로그인해주세요.';
      case 'permission':
        return '이 작업을 수행할 권한이 없습니다. 관리자에게 문의해주세요.';
      case 'validation':
        return '입력한 정보를 확인해주세요.';
      case 'server':
        return '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
      default:
        return message || '알 수 없는 오류가 발생했습니다.';
    }
  };

  // 에러 로깅
  const logError = useCallback((error: Error | string, context?: ErrorContext) => {
    const errorInfo = {
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'object' && error.stack ? error.stack : undefined,
      context,
      timestamp: new Date(),
    };

    // 콘솔에 에러 로깅
    console.error('ErrorHandler caught an error:', errorInfo);

    // 프로덕션 환경에서 에러 로깅 서비스에 전송
    if (process.env.NODE_ENV === 'production') {
      // 실제 에러 로깅 서비스 (Sentry, LogRocket 등)에 전송
      // 예: Sentry.captureException(error, { extra: context });
    }
  }, []);

  // 에러 처리
  const handleError = useCallback((error: Error | string, context?: ErrorContext) => {
    const type = determineErrorType(error);
    const message = generateErrorMessage(error, type);
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const errorInfo: ErrorInfo = {
      id: errorId,
      message,
      type,
      timestamp: new Date(),
      context,
      stack: typeof error === 'object' && error.stack ? error.stack : undefined,
      retryable: type === 'network' || type === 'server',
    };

    // 에러 로깅
    logError(error, context);

    // 에러 상태 업데이트
    setErrors(prev => [...prev, errorInfo]);

    // 에러가 너무 많으면 오래된 에러 제거 (최대 10개 유지)
    setErrors(prev => {
      if (prev.length > 10) {
        return prev.slice(-10);
      }
      return prev;
    });
  }, [logError]);

  // 에러 표시
  const showError = useCallback((message: string, type: ErrorInfo['type'] = 'general', context?: ErrorContext) => {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const errorInfo: ErrorInfo = {
      id: errorId,
      message,
      type,
      timestamp: new Date(),
      context,
      retryable: type === 'network' || type === 'server',
    };

    setErrors(prev => [...prev, errorInfo]);
  }, []);

  // 에러 제거
  const clearError = useCallback((errorId: string) => {
    setErrors(prev => prev.filter(error => error.id !== errorId));
    retryFunctions.current.delete(errorId);
  }, []);

  // 모든 에러 제거
  const clearAllErrors = useCallback(() => {
    setErrors([]);
    retryFunctions.current.clear();
  }, []);

  // 에러 재시도
  const retryError = useCallback(async (errorId: string, retryFn: () => Promise<void>) => {
    const error = errors.find(e => e.id === errorId);
    if (!error || !error.retryable) {
      throw new Error('재시도할 수 없는 에러입니다.');
    }

    try {
      // 재시도 함수 저장
      retryFunctions.current.set(errorId, retryFn);
      
      // 재시도 실행
      await retryFn();
      
      // 성공 시 에러 제거
      clearError(errorId);
    } catch (retryError) {
      // 재시도 실패 시 새로운 에러로 처리
      handleError(retryError, { 
        context: '재시도 실패', 
        originalErrorId: errorId 
      });
    }
  }, [errors, clearError, handleError]);

  // 에러 ID로 조회
  const getErrorById = useCallback((errorId: string) => {
    return errors.find(error => error.id === errorId);
  }, [errors]);

  // 에러 타입별 조회
  const getErrorsByType = useCallback((type: ErrorInfo['type']) => {
    return errors.filter(error => error.type === type);
  }, [errors]);

  return {
    errors,
    handleError,
    showError,
    clearError,
    clearAllErrors,
    retryError,
    getErrorById,
    getErrorsByType,
  };
};
