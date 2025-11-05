/**
 * 🏷️ JJ Swim Lab - UserTypeBadge 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 사용자 타입을 시각적으로 표시하는 배지 컴포넌트
 * - 다양한 사용자 타입 지원 (student, instructor, centerAdmin, superAdmin, guest)
 * - 재사용 가능한 배지 컴포넌트
 * 
 * 🗄️ **데이터 연동**
 * - 사용자 타입 정보
 */

'use client';

interface UserTypeBadgeProps {
  userType: string;
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
    'student': 'bg-blue-100 text-blue-800 border-blue-200',
    'instructor': 'bg-green-100 text-green-800 border-green-200',
    'centerAdmin': 'bg-purple-100 text-purple-800 border-purple-200',
    'center-admin': 'bg-purple-100 text-purple-800 border-purple-200',
    'superAdmin': 'bg-orange-100 text-orange-800 border-orange-200',
    'guest': 'bg-gray-100 text-gray-800 border-gray-200'
  };
  return colors[userType] || 'bg-gray-100 text-gray-800 border-gray-200';
};

const sizeClasses = {
  sm: 'text-xs px-1.5 py-0.5',
  md: 'text-sm px-2 py-1',
  lg: 'text-base px-3 py-1.5'
};

export default function UserTypeBadge({ 
  userType, 
  size = 'md',
  className = '' 
}: UserTypeBadgeProps) {
  const colorClass = getUserTypeColor(userType);
  const sizeClass = sizeClasses[size];
  const label = getUserTypeLabel(userType);

  return (
    <span 
      className={`inline-flex items-center rounded-full border font-semibold ${sizeClass} ${colorClass} ${className}`}
    >
      {label}
    </span>
  );
}

