/**
 * ?���?JJ Swim Lab - ErrorBoundary 컴포?�트
 * 
 * ?�� **컴포?�트 목적**
 * - React ?�플리�??�션??JavaScript ?�러�??�착?�고 처리
 * - ?�용?�에�?친화?�인 ?�러 메시지 ?�시
 * - ?�러 발생 ???�플리�??�션???�정???��?
 * - ?�러 로깅 �?모니?�링 ?�스???�동
 * 
 * ?�� **주요 기능**
 * - JavaScript ?�러 ?�착 �?처리
 * - ?�용??친화?�인 ?�러 UI ?�시
 * - ?�러 복구 �??�시??기능
 * - ?�러 로깅 �?모니?�링
 * - 개발/?�로?�션 ?�경�??�러 처리
 * 
 * ?���?**?�이???�동**
 * - ?�러 ?�보 �??�택 ?�레?�스
 * - ?�용??컨텍?�트 �??�태 ?�보
 * - ?�러 발생 ?�점 �?빈도
 * - ?�러 복구 �??�시???�태
 * - 모니?�링 �?로깅 ?�이?? * 
 * ?���?**?�요???�치 ?�일**
 * - React (ComponentDidCatch, ErrorBoundary)
 * - ?�러 로깅 ?�비??(Sentry, LogRocket ??
 * - 모니?�링 ?�구 �??�?�보?? * - Tailwind CSS (?��??�링)
 * 
 * ?�️ **개발 ??주의?�항**
 * 1. ?�러 바운?�리??범위 �?계층 구조
 * 2. ?�러 ?�보??민감???�이??보호
 * 3. ?�러 복구 로직???�정?? * 4. ?�용??경험??고려???�러 메시지
 * 5. ?�러 로깅???�능 ?�향 최소?? * 
 * ?�� **?�정 ??체크리스??*
 * - [ ] ?�러 ?�착 �?처리 ?�작 ?�인
 * - [ ] ?�용??친화?�인 ?�러 UI 검�? * - [ ] ?�러 복구 �??�시??기능 ?�인
 * - [ ] ?�러 로깅 �?모니?�링 ?�인
 * - [ ] ?�능 �??�정???�인
 * 
 * ?�� **개발 ?�스?�리**
 * - 2024-12-19: 초기 구현 (기본 ?�러 바운?�리)
 * - 2024-12-19: ?�용??친화?�인 ?�러 UI 구현
 * - 2024-12-19: ?�러 복구 �??�시???�스??구현
 * - 2024-12-19: ?�러 로깅 �?모니?�링 ?�스??구현
 * 
 * ?��?��?**개발???�보**
 * - ?�성?? AI Assistant
 * - 최종 ?�정: 2024-12-19
 * - ?�태: ???�성 (?�러 바운?�리 ?�스???�료)
 * 
 * ?? **?�음 ?�계**
 * - 고급 ?�러 분석 �??�측
 * - ?�동 ?�러 복구 ?�스?? * - ?�능 최적?? * - ?�용??경험 개선
 * 
 * ?�� **?�용 ?�시**
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
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { logger } from '@/lib/logger';

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
    // ?�러가 발생?�을 ???�태�??�데?�트
    return {
      hasError: true,
      error,
      errorInfo: null,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // ?�러 로깅 �?모니?�링
    this.setState({
      error,
      errorInfo,
    });

    // ?�러 로깅
    this.logError(error, errorInfo);

    // 부�?컴포?�트???�러 ?�달
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  logError = (error: Error, errorInfo: ErrorInfo) => {
    // ?�러 로깅
    logger.error('ErrorBoundary caught an error:', { error, errorInfo });

    // ?�로?�션 ?�경?�서 ?�러 로깅 ?�비?�에 ?�송
    if (process.env.NODE_ENV === 'production') {
      // ?�제 ?�러 로깅 ?�비??(Sentry, LogRocket ?????�송
      // ?? Sentry.captureException(error, { extra: errorInfo });
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    });

    // 부�?컴포?�트??리셋 ?�림
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // 커스?� fallback UI가 ?�으�??�용
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 기본 ?�러 UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-red-600">
                ?�️ ?�류가 발생?�습?�다
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center text-gray-600">
                <p className="mb-2">
                  ?�상�?못한 ?�류가 발생?�습?�다.
                </p>
                <p className="text-sm">
                  ?�시 ???�시 ?�도?�주?�요.
                </p>
              </div>

              {/* 개발 ?�경?�서�??�러 ?��? ?�보 ?�시 */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="bg-gray-100 p-3 rounded text-xs">
                  <summary className="cursor-pointer font-medium mb-2">
                    ?�러 ?��? ?�보 (개발 모드)
                  </summary>
                  <div className="space-y-2">
                    <div>
                      <strong>?�러:</strong> {this.state.error.message}
                    </div>
                    <div>
                      <strong>?�택:</strong>
                      <pre className="mt-1 whitespace-pre-wrap text-xs">
                        {this.state.error.stack}
                      </pre>
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <strong>컴포?�트 ?�택:</strong>
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
                  ?�시 ?�도
                </Button>
                <Button
                  onClick={this.handleReload}
                  className="flex-1"
                >
                  ?�이지 ?�로고침
                </Button>
              </div>

              <div className="text-center text-xs text-gray-500">
                <p>문제가 지?�되�?고객지?�에 문의?�주?�요.</p>
                <p>?�러 ID: {this.state.errorId}</p>
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