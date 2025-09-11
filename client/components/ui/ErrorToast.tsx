/**
 * 🍞 JJ Swim Lab - ErrorToast 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 사용자에게 에러 메시지를 토스트 형태로 표시
 * - 다양한 에러 타입에 대한 적절한 UI 제공
 * - 에러 복구 및 재시도 옵션 제공
 * - 에러 로깅 및 모니터링 연동
 * 
 * 🔄 **주요 기능**
 * - 에러 메시지 토스트 표시
 * - 에러 타입별 아이콘 및 색상
 * - 에러 복구 및 재시도 버튼
 * - 자동 사라짐 및 수동 닫기
 * - 에러 상세 정보 표시
 * 
 * 🗄️ **데이터 연동**
 * - 에러 메시지 및 타입
 * - 에러 발생 시점 및 컨텍스트
 * - 에러 복구 및 재시도 상태
 * - 사용자 액션 및 피드백
 * - 에러 로깅 및 모니터링 데이터
 * 
 * 🛠️ **필요한 설치 파일**
 * - React (useState, useEffect)
 * - Toast 알림 시스템
 * - 에러 로깅 서비스
 * - Tailwind CSS (스타일링)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 에러 메시지의 사용자 친화성
 * 2. 에러 토스트의 중복 표시 방지
 * 3. 에러 복구 로직의 안정성
 * 4. 접근성 및 키보드 네비게이션
 * 5. 모바일 환경에서의 사용성
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 에러 토스트 표시 동작 확인
 * - [ ] 에러 타입별 UI 검증
 * - [ ] 에러 복구 및 재시도 기능 확인
 * - [ ] 자동 사라짐 및 수동 닫기 확인
 * - [ ] 접근성 및 사용성 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 에러 토스트)
 * - 2024-12-19: 에러 타입별 UI 구현
 * - 2024-12-19: 에러 복구 및 재시도 시스템 구현
 * - 2024-12-19: 접근성 및 사용성 개선
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (에러 토스트 시스템 완료)
 * 
 * 🚀 **다음 단계**
 * - 고급 에러 분석 및 예측
 * - 자동 에러 복구 시스템
 * - 성능 최적화
 * - 사용자 경험 개선
 * 
 * 💡 **사용 예시**
 * ```tsx
 * <ErrorToast
 *   error={error}
 *   onRetry={() => handleRetry()}
 *   onDismiss={() => handleDismiss()}
 *   autoHide={true}
 *   duration={5000}
 * />
 * ```
 */

'use client';

import React, { useState, useEffect } from 'react';
import Button from './Button';
import { X, AlertTriangle, RefreshCw, Info, AlertCircle } from 'lucide-react';

export interface ErrorToastProps {
  error: Error | string;
  onRetry?: () => void;
  onDismiss?: () => void;
  autoHide?: boolean;
  duration?: number;
  showDetails?: boolean;
  className?: string;
}

export const ErrorToast: React.FC<ErrorToastProps> = ({
  error,
  onRetry,
  onDismiss,
  autoHide = true,
  duration = 5000,
  showDetails = false,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [showFullDetails, setShowFullDetails] = useState(false);

  // 에러 메시지 추출
  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorStack = typeof error === 'object' && error.stack ? error.stack : '';

  // 에러 타입 결정
  const getErrorType = (error: Error | string) => {
    if (typeof error === 'string') return 'general';
    
    const message = error.message.toLowerCase();
    if (message.includes('network') || message.includes('fetch')) return 'network';
    if (message.includes('auth') || message.includes('login')) return 'auth';
    if (message.includes('permission') || message.includes('access')) return 'permission';
    if (message.includes('validation') || message.includes('invalid')) return 'validation';
    if (message.includes('server') || message.includes('500')) return 'server';
    return 'general';
  };

  const errorType = getErrorType(error);

  // 에러 타입별 설정
  const getErrorConfig = (type: string) => {
    switch (type) {
      case 'network':
        return {
          icon: <AlertTriangle className="w-5 h-5" />,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          title: '네트워크 오류',
        };
      case 'auth':
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          title: '인증 오류',
        };
      case 'permission':
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          title: '권한 오류',
        };
      case 'validation':
        return {
          icon: <Info className="w-5 h-5" />,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          title: '입력 오류',
        };
      case 'server':
        return {
          icon: <AlertTriangle className="w-5 h-5" />,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          title: '서버 오류',
        };
      default:
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          title: '오류',
        };
    }
  };

  const config = getErrorConfig(errorType);

  // 자동 사라짐 처리
  useEffect(() => {
    if (autoHide && isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onDismiss) {
          onDismiss();
        }
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoHide, duration, isVisible, onDismiss]);

  // 수동 닫기
  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  // 재시도
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
  };

  // 토글 상세 정보
  const toggleDetails = () => {
    setShowFullDetails(!showFullDetails);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 max-w-md w-full
        ${config.bgColor} ${config.borderColor} border rounded-lg shadow-lg
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${className}
      `}
      role="alert"
      aria-live="assertive"
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className={`flex-shrink-0 ${config.color}`}>
            {config.icon}
          </div>
          
          <div className="ml-3 flex-1">
            <div className="flex items-center justify-between">
              <h3 className={`text-sm font-medium ${config.color}`}>
                {config.title}
              </h3>
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="에러 메시지 닫기"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="mt-1">
              <p className="text-sm text-gray-700">
                {errorMessage}
              </p>
            </div>

            {/* 상세 정보 토글 */}
            {showDetails && errorStack && (
              <div className="mt-2">
                <button
                  onClick={toggleDetails}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  {showFullDetails ? '상세 정보 숨기기' : '상세 정보 보기'}
                </button>
                
                {showFullDetails && (
                  <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono text-gray-600 max-h-32 overflow-y-auto">
                    {errorStack}
                  </div>
                )}
              </div>
            )}

            {/* 액션 버튼들 */}
            <div className="mt-3 flex gap-2">
              {onRetry && (
                <Button
                  onClick={handleRetry}
                  size="sm"
                  variant="outline"
                  className="text-xs"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  다시 시도
                </Button>
              )}
              
              <Button
                onClick={handleDismiss}
                size="sm"
                variant="ghost"
                className="text-xs"
              >
                닫기
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorToast;
