/**
 * ✅ JJ Swim Lab - 새로고침 버튼 컴포넌트
 * 
 * 📋 **기능**
 * - 데이터 새로고침 기능
 * - 로딩 상태 표시
 * - 클릭 시 회전 애니메이션
 * - 접근성 지원
 */

import React, { useState } from 'react';
import Button from './Button';

interface RefreshButtonProps {
  onRefresh: () => Promise<void> | void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'outline' | 'default' | 'secondary';
  className?: string;
  disabled?: boolean;
  tooltip?: string;
}

export function RefreshButton({
  onRefresh,
  size = 'md',
  variant = 'outline',
  className = '',
  disabled = false,
  tooltip
}: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (isRefreshing || disabled) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh();
    } catch (error) {
      console.error('새로고침 실패:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size === 'md' ? 'default' : size}
      onClick={handleRefresh}
      disabled={disabled || isRefreshing}
      className={`transition-all duration-200 ${className}`}
      title={tooltip || '새로고침'}
      aria-label="데이터 새로고침"
    >
      <svg
        className={`w-4 h-4 transition-transform duration-200 ${
          isRefreshing ? 'animate-spin' : ''
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
      {size !== 'sm' && (
        <span className="ml-2">
          {isRefreshing ? '새로고침 중...' : '새로고침'}
        </span>
      )}
    </Button>
  );
}

export default RefreshButton;
