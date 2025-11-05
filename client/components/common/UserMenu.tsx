/**
 * 👤 JJ Swim Lab - UserMenu 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 사용자 프로필과 로그아웃 버튼을 포함하는 통합 메뉴 컴포넌트
 * - 상단 네비게이션 바에서 사용
 * - 가시성 개선 및 일관된 디자인
 * 
 * 🗄️ **데이터 연동**
 * - UserProfile 컴포넌트
 * - LogoutButton 컴포넌트
 */

'use client';

import UserProfile from './UserProfile';
import LogoutButton from './LogoutButton';

interface UserMenuProps {
  showUserType?: boolean;
  size?: 'sm' | 'md' | 'lg';
  logoutVariant?: 'text' | 'button' | 'icon';
  className?: string;
}

export default function UserMenu({
  showUserType = false,
  size = 'md',
  logoutVariant = 'text',
  className = ''
}: UserMenuProps) {
  return (
    <div className={`flex items-center space-x-3 ${className || 'bg-white px-4 py-2.5 rounded-lg shadow-lg border-2 border-gray-300 hover:border-blue-400 transition-all'}`}>
      <UserProfile 
        showName={true}
        showUserType={showUserType}
        size={size}
      />
      <div className="h-6 w-px bg-gray-300" />
      <LogoutButton 
        variant={logoutVariant}
        size={size}
        showIcon={false}
      />
    </div>
  );
}

