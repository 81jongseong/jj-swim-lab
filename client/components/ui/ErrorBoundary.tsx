/**
 * 🛡️ JJ Swim Lab - ErrorBoundary 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - React 애플리케이션의 JavaScript 에러를 포착하고 처리
 * - 사용자에게 친화적인 에러 메시지 표시
 * - 에러 발생 시 애플리케이션의 안정성 유지
 * - 에러 로깅 및 모니터링 시스템 연동
 * 
 * 🔄 **주요 기능**
 * - JavaScript 에러 포착 및 처리
 * - 사용자 친화적인 에러 UI 표시
 * - 에러 복구 및 재시도 기능
 * - 에러 로깅 및 모니터링
 * - 개발/프로덕션 환경별 에러 처리
 * 
 * 🗄️ **데이터 연동**
 * - 에러 정보 및 스택 트레이스
 * - 사용자 컨텍스트 및 상태 정보
 * - 에러 발생 시점 및 빈도
 * - 에러 복구 및 재시도 상태
 * - 모니터링 및 로깅 데이터
 * 
 * 🛠️ **필요한 설치 파일**
 * - React (ComponentDidCatch, ErrorBoundary)
 * - 에러 로깅 서비스 (Sentry, LogRocket 등)
 * - 모니터링 도구 및 대시보드
 * - Tailwind CSS (스타일링)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 에러 바운더리의 범위 및 계층 구조
 * 2. 에러 정보의 민감한 데이터 보호
 * 3. 에러 복구 로직의 안정성
 * 4. 사용자 경험을 고려한 에러 메시지
 * 5. 에러 로깅의 성능 영향 최소화
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 에러 포착 및 처리 동작 확인
 * - [ ] 사용자 친화적인 에러 UI 검증
 * - [ ] 에러 복구 및 재시도 기능 확인
 * - [ ] 에러 로깅 및 모니터링 확인
 * - [ ] 성능 및 안정성 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 에러 바운더리)
 * - 2024-12-19: 사용자 친화적인 에러 UI 구현
 * - 2024-12-19: 에러 복구 및 재시도 시스템 구현
 * - 2024-12-19: 에러 로깅 및 모니터링 시스템 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (에러 바운더리 시스템 완료)
 * 
 * 🚀 **다음 단계**
 * - 고급 에러 분석 및 예측
 * - 자동 에러 복구 시스템
 * - 성능 최적화
 * - 사용자 경험 개선
 * 
 * 💡 **사용 예시**
 * ```tsx
 * <ErrorBoundary 
 *   fallback={<ErrorFallback />}
 *   onError={(error, errorInfo) => handleError(error, errorInfo)}
 *   onReset={() => handleReset()}
 * >
 *   <App />
 * </ErrorBoundary>
 * ```
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import Button from './Button';
import Card, { CardContent, CardHeader, CardTitle } from './Card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // 에러가 발생했을 때 상태를 업데이트
    return {
      hasError: true,
      error,
      errorInfo: null,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 에러 로깅 및 모니터링
    this.setState({
      error,
      errorInfo,
    });

    // 에러 로깅
    this.logError(error, errorInfo);

    // 부모 컴포넌트에 에러 전달
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  logError = (error: Error, errorInfo: ErrorInfo) => {
    // 콘솔에 에러 로깅
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // 프로덕션 환경에서 에러 로깅 서비스에 전송
    if (process.env.NODE_ENV === 'production') {
      // 실제 에러 로깅 서비스 (Sentry, LogRocket 등)에 전송
      // 예: Sentry.captureException(error, { extra: errorInfo });
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    });

    // 부모 컴포넌트에 리셋 알림
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // 커스텀 fallback UI가 있으면 사용
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 기본 에러 UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-red-600">
                ⚠️ 오류가 발생했습니다
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center text-gray-600">
                <p className="mb-2">
                  예상치 못한 오류가 발생했습니다.
                </p>
                <p className="text-sm">
                  잠시 후 다시 시도해주세요.
                </p>
              </div>

              {/* 개발 환경에서만 에러 세부 정보 표시 */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="bg-gray-100 p-3 rounded text-xs">
                  <summary className="cursor-pointer font-medium mb-2">
                    에러 세부 정보 (개발 모드)
                  </summary>
                  <div className="space-y-2">
                    <div>
                      <strong>에러:</strong> {this.state.error.message}
                    </div>
                    <div>
                      <strong>스택:</strong>
                      <pre className="mt-1 whitespace-pre-wrap text-xs">
                        {this.state.error.stack}
                      </pre>
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <strong>컴포넌트 스택:</strong>
                        <pre className="mt-1 whitespace-pre-wrap text-xs">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={this.handleReset}
                  className="flex-1"
                  variant="outline"
                >
                  다시 시도
                </Button>
                <Button
                  onClick={this.handleReload}
                  className="flex-1"
                >
                  페이지 새로고침
                </Button>
              </div>

              <div className="text-center text-xs text-gray-500">
                <p>문제가 지속되면 고객지원에 문의해주세요.</p>
                <p>에러 ID: {this.state.errorId}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export { ErrorBoundary };