/**
 * ❌ 에러 상태 컴포넌트
 * 
 * 📋 **컴포넌트 목적**:
 * - 에러 발생 시 표시
 * - 일관된 에러 UI 제공
 * 
 * 🔗 **연동 파일**:
 * - 모든 에러 처리가 필요한 페이지
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  retryText?: string;
  className?: string;
}

export default function ErrorState({
  message = '오류가 발생했습니다.',
  onRetry,
  retryText = '다시 시도',
  className = ''
}: ErrorStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <div className="text-6xl mb-4">❌</div>
      <Alert variant="destructive" className="max-w-md">
        <Alert.Title>오류</Alert.Title>
        <Alert.Description>{message}</Alert.Description>
      </Alert>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="mt-4"
        >
          {retryText}
        </Button>
      )}
    </div>
  );
}

