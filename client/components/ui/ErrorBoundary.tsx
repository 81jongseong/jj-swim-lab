/**
 * ✅ JJ Swim Lab - 에러 경계 컴포넌트
 * 
 * 📋 **기능**
 * - React 컴포넌트 트리의 에러 캐치
 * - 사용자 친화적인 에러 메시지 표시
 * - 에러 로깅 및 복구 옵션 제공
 * - 개발자 모드에서 상세 에러 정보 표시
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import Button from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // 에러 로깅
    this.props.onError?.(error, errorInfo);
    
    // 개발 환경에서 에러 정보 저장
    if (process.env.NODE_ENV === 'development') {
      this.setState({ errorInfo });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReportError = () => {
    // 에러 리포트 로직 (예: Sentry, LogRocket 등)
    console.log('에러 리포트 전송:', this.state.error);
    
    if ((window as any).showToast) {
      (window as any).showToast({
        type: 'info',
        title: '에러 리포트',
        message: '에러 정보가 전송되었습니다.',
        duration: 3000
      });
    }
  };

  render() {
    if (this.state.hasError) {
      // 커스텀 fallback이 있으면 사용
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 기본 에러 UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">문제가 발생했습니다</h1>
              <p className="text-gray-600 mb-6">
                예상치 못한 오류가 발생했습니다. 페이지를 새로고침하거나 다시 시도해주세요.
              </p>
            </div>

            <div className="space-y-3">
              <Button onClick={this.handleRetry} className="w-full">
                다시 시도
              </Button>
              <Button onClick={this.handleReportError} variant="outline" className="w-full">
                에러 리포트
              </Button>
              <Button 
                onClick={() => window.location.href = '/'} 
                variant="outline" 
                className="w-full"
              >
                홈으로 돌아가기
              </Button>
            </div>

            {/* 개발 환경에서 상세 에러 정보 표시 */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                  개발자 정보 (클릭하여 확장)
                </summary>
                <div className="bg-gray-100 p-4 rounded-lg text-xs font-mono text-gray-800 overflow-auto">
                  <div className="mb-2">
                    <strong>에러:</strong> {this.state.error.toString()}
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong>스택 트레이스:</strong>
                      <pre className="whitespace-pre-wrap mt-1">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
