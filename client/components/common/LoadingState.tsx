/**
 * ⏳ 로딩 상태 컴포넌트
 * 
 * 📋 **컴포넌트 목적**:
 * - 데이터 로딩 중 표시
 * - 일관된 로딩 UI 제공
 * 
 * 🔗 **연동 파일**:
 * - 모든 데이터 로딩이 필요한 페이지
 */

'use client';

import React from 'react';
import LoadingSpinner from '@/components/ui/loadingspinner';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  className?: string;
}

export default function LoadingState({
  message = '로딩 중...',
  size = 'md',
  fullScreen = false,
  className = ''
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  if (fullScreen) {
    return (
      <div className={`fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50 ${className}`}>
        <div className="text-center">
          <LoadingSpinner size={size} />
          <p className="mt-4 text-gray-600">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <LoadingSpinner size={size} />
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  );
}

