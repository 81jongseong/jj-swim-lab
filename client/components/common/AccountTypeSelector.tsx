/**
 * 📋 JJ Swim Lab - AccountTypeSelector 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 계정 타입별로 다른 옵션을 제공하는 선택 컴포넌트
 * - 사용자 타입에 따라 다른 UI/UX 제공
 * - 재사용 가능한 계정 타입 선택 컴포넌트
 * 
 * 🗄️ **데이터 연동**
 * - useAuth 훅 (현재 사용자 타입)
 */

'use client';

import { useAuth } from 'hooks/useAuth';
import UserTypeBadge from './UserTypeBadge';

interface AccountTypeSelectorProps {
  onTypeChange?: (type: string) => void;
  showLabel?: boolean;
  className?: string;
}

const accountTypes = [
  { value: 'student', label: '회원', icon: '👤' },
  { value: 'instructor', label: '강사', icon: '🏊' },
  { value: 'centerAdmin', label: '센터관리자', icon: '🏢' },
  { value: 'superAdmin', label: '최고관리자', icon: '👑' },
  { value: 'guest', label: '게스트', icon: '👋' }
];

export default function AccountTypeSelector({
  onTypeChange,
  showLabel = true,
  className = ''
}: AccountTypeSelectorProps) {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {showLabel && (
        <span className="text-sm font-medium text-gray-700">계정 타입:</span>
      )}
      <UserTypeBadge userType={user.userType} size="md" />
    </div>
  );
}

