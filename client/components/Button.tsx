/**
 * 통일된 버튼 컴포넌트
 * 
 * 연동되는 데이터:
 * - children: 버튼 텍스트
 * - variant: 버튼 스타일 ('primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'ghost')
 * - size: 버튼 크기 ('sm' | 'md' | 'lg')
 * - onClick: 클릭 이벤트
 * - disabled: 비활성화 여부
 * - className: 추가 CSS 클래스
 * 
 * 연동되는 파일:
 * - 모든 admin 페이지에서 사용
 */

'use client';

import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
}

const variantClasses = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg',
  secondary: 'bg-gray-600 hover:bg-gray-700 text-white shadow-md hover:shadow-lg',
  success: 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg',
  warning: 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-md hover:shadow-lg',
  ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 border-2 border-transparent hover:border-gray-300',
  outline: 'bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 hover:border-gray-400 shadow-sm'
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg'
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  className = '',
  type = 'button',
  fullWidth = false
}: ButtonProps) {
  const baseClasses = 'font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 whitespace-nowrap overflow-hidden text-ellipsis';
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedClasses}
    >
      <span className="inline-block truncate">{children}</span>
    </button>
  );
}

export default Button;

