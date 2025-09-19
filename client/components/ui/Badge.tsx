/**
 * 🏊‍♂️ JJ Swim Lab - Badge UI 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 상태, 레이블, 카테고리를 시각적으로 표시
 * - 색상별 의미 구분 (성공, 경고, 위험, 정보)
 * - 작은 정보 표시용 컴포넌트
 * 
 * 🎨 **디자인 특징**
 * - 5가지 variant (default, success, warning, danger, info)
 * - 3가지 size (sm, md, lg)
 * - 반응형 디자인
 * - 접근성 고려
 * 
 * 🔧 **사용 방법**
 * ```tsx
 * import Badge from '@/components/ui/badge';
 * 
 * <Badge variant="success">완료</Badge>
 * <Badge variant="warning" size="lg">주의</Badge>
 * ```
 * 
 * 📅 **개발 히스토리**
 * - 2025-09-17: 초기 Badge 컴포넌트 구현
 * - 2025-09-17: variant 및 size 옵션 추가
 * - 2025-09-17: 접근성 개선
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2025-09-17
 * - 상태: ✅ 완성 (Badge UI 컴포넌트)
 */

import React from 'react';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'primary' | 'danger';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

/**
 * Badge 컴포넌트
 * 상태나 레이블을 시각적으로 표시하는 작은 컴포넌트입니다.
 */
const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default', 
  size = 'md', 
  className = '' 
}) => {
  // variant별 스타일 정의
  const variantStyles = {
    default: 'bg-gray-100 text-gray-800 border-gray-200',
    secondary: 'bg-gray-50 text-gray-600 border-gray-300',
    destructive: 'bg-red-100 text-red-800 border-red-200',
    outline: 'bg-transparent text-gray-700 border-gray-300',
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    primary: 'bg-blue-100 text-blue-800 border-blue-200',
    danger: 'bg-red-100 text-red-800 border-red-200',
  };

  // size별 스타일 정의
  const sizeStyles = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const baseStyles = 'inline-flex items-center font-medium rounded-full border';
  const variantClass = variantStyles[variant];
  const sizeClass = sizeStyles[size];

  return (
    <span 
      className={`${baseStyles} ${variantClass} ${sizeClass} ${className}`}
      role="status"
      aria-label={typeof children === 'string' ? children : undefined}
    >
      {children}
    </span>
  );
};

export default Badge;
