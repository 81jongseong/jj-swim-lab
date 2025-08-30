/**
 * ✅ JJ Swim Lab - 로딩 스피너 컴포넌트
 * 
 * 📋 **기능**
 * - 다양한 크기의 로딩 스피너
 * - 커스텀 색상 지원
 * - 텍스트와 함께 표시 가능
 */

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  text?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16'
};

const colorClasses = {
  primary: 'border-blue-600',
  secondary: 'border-gray-600',
  success: 'border-green-600',
  warning: 'border-yellow-600',
  danger: 'border-red-600'
};

export function LoadingSpinner({ 
  size = 'md', 
  color = 'primary', 
  text, 
  className = '' 
}: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-2 border-gray-300 border-t-transparent ${sizeClasses[size]} ${colorClasses[color]}`}
      />
      {text && (
        <p className="mt-3 text-sm text-gray-600 animate-pulse">{text}</p>
      )}
    </div>
  );
}

export default LoadingSpinner; 