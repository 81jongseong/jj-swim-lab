/**
 * 🏊‍♂️ JJ Swim Lab - Button UI 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 사용자 인터랙션을 위한 기본 버튼 컴포넌트
 * - 다양한 스타일과 크기 지원
 * - 접근성과 사용성을 고려한 디자인
 * 
 * 🎨 **디자인 특징**
 * - 6가지 variant (primary, secondary, outline, ghost, danger, success)
 * - 3가지 size (sm, md, lg)
 * - 로딩 상태 지원
 * - 비활성화 상태 지원
 * - 반응형 디자인
 * 
 * 🔧 **사용 방법**
 * ```tsx
 * import Button from '@/components/ui/button';
 * 
 * <Button variant="primary" size="lg" onClick={handleClick}>
 *   클릭하세요
 * </Button>
 * <Button variant="outline" loading={isLoading}>
 *   로딩 중...
 * </Button>
 * ```
 * 
 * 📅 **개발 히스토리**
 * - 2025-09-17: 초기 Button 컴포넌트 구현
 * - 2025-09-17: variant 및 size 옵션 추가
 * - 2025-09-17: 로딩 상태 및 접근성 개선
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2025-09-17
 * - 상태: ✅ 완성 (Button UI 컴포넌트)
 */

import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'default' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg' | 'default';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
}

/**
 * Button 컴포넌트
 * 사용자 인터랙션을 위한 기본 버튼입니다.
 */
const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  // variant별 스타일 정의
  const variantStyles = {
    primary: 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 focus:ring-blue-500 shadow-md hover:shadow-lg transition-all',
    secondary: 'bg-gray-600 text-white border-gray-600 hover:bg-gray-700 focus:ring-gray-500 shadow-md hover:shadow-lg transition-all',
    outline: 'bg-transparent text-blue-600 border-blue-600 hover:bg-blue-50 focus:ring-blue-500 hover:border-blue-700 transition-all',
    ghost: 'bg-transparent text-gray-600 border-transparent hover:bg-gray-100 focus:ring-gray-500 transition-colors',
    danger: 'bg-red-600 text-white border-red-600 hover:bg-red-700 focus:ring-red-500 shadow-md hover:shadow-lg transition-all',
    success: 'bg-green-600 text-white border-green-600 hover:bg-green-700 focus:ring-green-500 shadow-md hover:shadow-lg transition-all',
    default: 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 focus:ring-blue-500 shadow-md hover:shadow-lg transition-all',
    destructive: 'bg-red-600 text-white border-red-600 hover:bg-red-700 focus:ring-red-500 shadow-md hover:shadow-lg transition-all',
  };

  // size별 스타일 정의
  const sizeStyles = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    default: 'px-4 py-2 text-base',
  };

  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const variantClass = variantStyles[variant];
  const sizeClass = sizeStyles[size];
  const widthClass = fullWidth ? 'w-full' : '';

  const isDisabled = disabled || loading;

  return (
    <button
      className={`${baseStyles} ${variantClass} ${sizeClass} ${widthClass} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <svg 
          className="animate-spin -ml-1 mr-2 h-4 w-4" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
