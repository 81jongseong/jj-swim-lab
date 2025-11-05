/**
 * 🚪 JJ Swim Lab - LogoutButton 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 로그아웃 기능을 제공하는 재사용 가능한 컴포넌트
 * - 다양한 스타일 및 크기 지원
 * 
 * 🗄️ **데이터 연동**
 * - useAuth 훅 (logout 함수)
 */

'use client';

import { useAuth } from 'hooks/useAuth';
import { useRouter } from 'next/navigation';

interface LogoutButtonProps {
  variant?: 'text' | 'button' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showIcon?: boolean;
}

export default function LogoutButton({ 
  variant = 'text',
  size = 'md',
  className = '',
  showIcon = false
}: LogoutButtonProps) {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleLogout}
        className={`p-2 text-gray-600 hover:text-red-600 transition-colors ${className}`}
        aria-label="로그아웃"
        title="로그아웃"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
    );
  }

  if (variant === 'button') {
    return (
      <button
        onClick={handleLogout}
        className={`${sizeClasses[size]} bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors font-medium ${className}`}
      >
        {showIcon && (
          <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        )}
        로그아웃
      </button>
    );
  }

  // text variant (default) - 가시성 개선
  return (
    <button
      onClick={handleLogout}
      className={`${sizeClasses[size]} text-gray-900 hover:text-red-600 transition-all font-bold hover:underline hover:bg-red-50 rounded px-2 py-1 ${className}`}
    >
      {showIcon && (
        <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      )}
      로그아웃
    </button>
  );
}

