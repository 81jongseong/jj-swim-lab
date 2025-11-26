/**
 * 🛡️ JJ Swim Lab - ErrorProvider 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 애플리케이션 전반의 에러 상태를 관리
 * - 에러 토스트 및 알림을 중앙에서 처리
 * - 에러 복구 및 재시도 기능 제공
 * - 에러 로깅 및 모니터링 시스템 연동
 * 
 * 🔄 **주요 기능**
 * - 전역 에러 상태 관리
 * - 에러 토스트 자동 표시
 * - 에러 복구 및 재시도 처리
 * - 에러 로깅 및 모니터링
 * - 사용자 친화적인 에러 UI
 * 
 * 🗄️ **데이터 연동**
 * - 에러 정보 및 상태
 * - 사용자 액션 및 피드백
 * - 에러 복구 및 재시도 상태
 * - 에러 로깅 및 모니터링 데이터
 * - 토스트 알림 상태
 * 
 * 🛠️ **필요한 설치 파일**
 * - React (createContext, useContext, useState, useEffect)
 * - useErrorHandler 훅
 * - ErrorToast 컴포넌트
 * - 에러 로깅 서비스
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 에러 상태의 메모리 누수 방지
 * 2. 에러 토스트의 중복 표시 방지
 * 3. 에러 복구 로직의 안정성
 * 4. 성능 및 렌더링 최적화
 * 5. 접근성 및 사용자 경험
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 에러 상태 관리 동작 확인
 * - [ ] 에러 토스트 표시 검증
 * - [ ] 에러 복구 및 재시도 기능 확인
 * - [ ] 에러 로깅 및 모니터링 확인
 * - [ ] 성능 및 메모리 사용량 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 에러 프로바이더)
 * - 2024-12-19: 에러 토스트 자동 표시 구현
 * - 2024-12-19: 에러 복구 및 재시도 시스템 구현
 * - 2024-12-19: 에러 로깅 및 모니터링 시스템 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (에러 프로바이더 시스템 완료)
 * 
 * 🚀 **다음 단계**
 * - 고급 에러 분석 및 예측
 * - 자동 에러 복구 시스템
 * - 성능 최적화
 * - 사용자 경험 개선
 * 
 * 💡 **사용 예시**
 * ```tsx
 * <ErrorProvider>
 *   <App />
 * </ErrorProvider>
 * ```
 */

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useErrorHandler, ErrorInfo, ErrorContext as ErrorContextFromHook } from '@/hooks/useErrorHandler';
import ErrorToast from './ErrorToast';
import { logger } from '@/lib/logger';

interface ErrorContextType {
  handleError: (error: Error | string, context?: ErrorContextFromHook) => void;
  showError: (message: string, type?: ErrorInfo['type'], context?: ErrorContextFromHook) => void;
  clearError: (errorId: string) => void;
  clearAllErrors: () => void;
  retryError: (errorId: string, retryFn: () => Promise<void>) => Promise<void>;
  getErrorById: (errorId: string) => ErrorInfo | undefined;
  getErrorsByType: (type: ErrorInfo['type']) => ErrorInfo[];
  errors: ErrorInfo[];
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

interface ErrorProviderProps {
  children: ReactNode;
  maxToasts?: number;
  autoHideDuration?: number;
  showDetails?: boolean;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({
  children,
  maxToasts = 3,
  autoHideDuration = 5000,
  showDetails = false,
}) => {
  const errorHandler = useErrorHandler();
  const [visibleToasts, setVisibleToasts] = useState<Set<string>>(new Set());

  // 에러가 추가될 때 토스트 표시
  useEffect(() => {
    const newErrors = errorHandler.errors.filter(
      error => !visibleToasts.has(error.id)
    );

    if (newErrors.length > 0) {
      // 최대 토스트 수 제한
      const errorsToShow = newErrors.slice(0, maxToasts);
      
      setVisibleToasts(prev => {
        const newSet = new Set(prev);
        errorsToShow.forEach(error => newSet.add(error.id));
        return newSet;
      });
    }
  }, [errorHandler.errors, visibleToasts, maxToasts]);

  // 토스트 닫기 처리
  const handleToastDismiss = (errorId: string) => {
    setVisibleToasts(prev => {
      const newSet = new Set(prev);
      newSet.delete(errorId);
      return newSet;
    });
    
    // 에러도 제거
    errorHandler.clearError(errorId);
  };

  // 토스트 재시도 처리
  const handleToastRetry = async (errorId: string) => {
    const error = errorHandler.getErrorById(errorId);
    if (!error || !error.retryable) {
      return;
    }

    // 기본 재시도 로직 (페이지 새로고침)
    const retryFn = async () => {
      window.location.reload();
    };

    try {
      await errorHandler.retryError(errorId, retryFn);
    } catch (retryError) {
      logger.error('재시도 실패:', retryError);
    }
  };

  // 컨텍스트 값
  const contextValue: ErrorContextType = {
    ...errorHandler,
  };

  return (
    <ErrorContext.Provider value={contextValue}>
      {children}
      
      {/* 에러 토스트들 */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {errorHandler.errors
          .filter(error => visibleToasts.has(error.id))
          .map(error => (
            <ErrorToast
              key={error.id}
              error={error.message}
              onRetry={error.retryable ? () => handleToastRetry(error.id) : undefined}
              onDismiss={() => handleToastDismiss(error.id)}
              autoHide={true}
              duration={autoHideDuration}
              showDetails={showDetails}
            />
          ))}
      </div>
    </ErrorContext.Provider>
  );
};

export default ErrorProvider;

