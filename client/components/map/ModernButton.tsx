/**
 * 🎨 모던 버튼 컴포넌트
 * 
 * 📋 **컴포넌트 목적**:
 * - 통일된 버튼 디자인
 * - 그라디언트 & 3D 효과
 * - 호버 애니메이션
 * 
 * 🔗 **연동 파일**:
 * - client/app/map/page.tsx
 * - client/components/map/* (모든 지도 관련 컴포넌트)
 */

'use client';

interface ModernButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'special';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  icon?: string;
  fullWidth?: boolean;
}

export default function ModernButton({
  children,
  onClick,
  variant = 'outline',
  size = 'md',
  disabled = false,
  className = '',
  icon,
  fullWidth = false
}: ModernButtonProps) {
  const baseStyles = `
    rounded-xl font-bold transition-all transform
    hover:scale-105 hover:-translate-y-0.5
    active:scale-95 active:translate-y-0
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    ${fullWidth ? 'w-full' : ''}
  `;

  const sizeStyles = {
    sm: 'px-3 py-2 text-xs',
    md: 'px-4 py-3 text-sm',
    lg: 'px-6 py-4 text-base'
  };

  const variantStyles = {
    primary: `
      bg-gradient-to-br from-blue-500 to-cyan-500 
      text-white shadow-lg 
      hover:shadow-xl
      ring-2 ring-blue-300
    `,
    secondary: `
      bg-gradient-to-br from-purple-500 to-pink-500 
      text-white shadow-lg 
      hover:shadow-xl
      ring-2 ring-purple-300
    `,
    special: `
      bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 
      text-white shadow-lg 
      hover:shadow-xl
      ring-2 ring-orange-300
    `,
    outline: `
      bg-white border-2 border-gray-200 
      text-gray-700 
      hover:border-blue-400 hover:shadow-md
    `
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseStyles}
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {icon && <span className="text-xl mr-1">{icon}</span>}
      {children}
    </button>
  );
}

