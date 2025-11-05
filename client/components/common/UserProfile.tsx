/**
 * 👤 JJ Swim Lab - UserProfile 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 사용자 프로필 정보를 표시하는 재사용 가능한 컴포넌트
 * - 다양한 사용자 타입 지원 (student, instructor, centerAdmin, superAdmin)
 * - 아바타, 이름, 사용자 타입 표시
 * 
 * 🗄️ **데이터 연동**
 * - useAuth 훅 (사용자 정보)
 */

'use client';

import { useAuth } from 'hooks/useAuth';

interface UserProfileProps {
  showName?: boolean;
  showUserType?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const getUserTypeLabel = (userType: string): string => {
  const labels: Record<string, string> = {
    'student': '회원',
    'instructor': '강사',
    'centerAdmin': '센터관리자',
    'center-admin': '센터관리자',
    'superAdmin': '최고관리자',
    'guest': '게스트'
  };
  return labels[userType] || userType;
};

const getUserTypeColor = (userType: string): string => {
  const colors: Record<string, string> = {
    'student': 'from-blue-500 to-indigo-600',
    'instructor': 'from-green-500 to-emerald-600',
    'centerAdmin': 'from-purple-500 to-pink-600',
    'center-admin': 'from-purple-500 to-pink-600',
    'superAdmin': 'from-orange-500 to-red-600',
    'guest': 'from-gray-400 to-gray-600'
  };
  return colors[userType] || 'from-blue-500 to-indigo-600';
};

const sizeClasses = {
  sm: {
    avatar: 'w-7 h-7',
    text: 'text-xs',
    name: 'text-xs'
  },
  md: {
    avatar: 'w-8 h-8',
    text: 'text-sm',
    name: 'text-sm'
  },
  lg: {
    avatar: 'w-12 h-12',
    text: 'text-base',
    name: 'text-base'
  }
};

export default function UserProfile({ 
  showName = true, 
  showUserType = false,
  size = 'md',
  className = '' 
}: UserProfileProps) {
  const { user } = useAuth();

  if (!user) return null;

  const sizeClass = sizeClasses[size];
  const gradientColor = getUserTypeColor(user.userType);

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`${sizeClass.avatar} bg-gradient-to-br ${gradientColor} rounded-full flex items-center justify-center shadow-lg ring-2 ring-white/50`}>
        <span className={`text-white font-bold ${sizeClass.text}`}>
          {user.name?.charAt(0) || 'U'}
        </span>
      </div>
      {showName && (
        <div className="min-w-0 flex-1">
          <p className={`${sizeClass.name} font-bold text-gray-900 truncate drop-shadow-sm`}>
            {user.name}
          </p>
          {showUserType && (
            <p className={`${sizeClass.text} text-gray-900 truncate font-bold drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]`}>
              {getUserTypeLabel(user.userType)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

