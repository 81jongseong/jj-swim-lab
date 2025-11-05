/**
 * 🏷️ JJ Swim Lab - AccountTypeDisplay 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 계정 타입별 아이콘, 색상, 라벨을 표시하는 재사용 가능한 컴포넌트
 * - 다양한 사용자 타입 지원 (student, instructor, centerAdmin, superAdmin, guest)
 * - 일관된 디자인 및 가시성 개선
 * 
 * 🗄️ **데이터 연동**
 * - useAuth 훅 (사용자 정보)
 */

'use client';

import { useAuth } from 'hooks/useAuth';

interface AccountTypeDisplayProps {
  userType?: string;
  showIcon?: boolean;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ACCOUNT_TYPES = {
  student: { icon: '👤', label: '회원', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  instructor: { icon: '🏊', label: '강사', color: 'text-green-600 bg-green-50 border-green-200' },
  centerAdmin: { icon: '🏢', label: '센터관리자', color: 'text-purple-600 bg-purple-50 border-purple-200' },
  'center-admin': { icon: '🏢', label: '센터관리자', color: 'text-purple-600 bg-purple-50 border-purple-200' },
  superAdmin: { icon: '👑', label: '최고관리자', color: 'text-orange-600 bg-orange-50 border-orange-200' },
  guest: { icon: '👋', label: '게스트', color: 'text-gray-600 bg-gray-50 border-gray-200' }
} as const;

const sizeClasses = {
  sm: { text: 'text-xs', padding: 'px-2 py-0.5', icon: 'text-xs' },
  md: { text: 'text-sm', padding: 'px-3 py-1', icon: 'text-sm' },
  lg: { text: 'text-base', padding: 'px-4 py-1.5', icon: 'text-base' }
};

export default function AccountTypeDisplay({
  userType,
  showIcon = true,
  showLabel = true,
  size = 'md',
  className = ''
}: AccountTypeDisplayProps) {
  const { user } = useAuth();
  const accountType = userType || user?.userType || 'guest';
  const typeInfo = ACCOUNT_TYPES[accountType as keyof typeof ACCOUNT_TYPES] || ACCOUNT_TYPES.guest;
  const sizeClass = sizeClasses[size];

  return (
    <div className={`inline-flex items-center space-x-1.5 ${sizeClass.padding} rounded-md border ${typeInfo.color} ${className}`}>
      {showIcon && <span className={sizeClass.icon}>{typeInfo.icon}</span>}
      {showLabel && <span className={`${sizeClass.text} font-semibold`}>{typeInfo.label}</span>}
    </div>
  );
}



