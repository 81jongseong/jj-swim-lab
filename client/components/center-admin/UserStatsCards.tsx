/**
 * 센터 회원 관리 - 통계 카드 컴포넌트
 * 
 * 연동 파일:
 * - client/app/center-admin/users/page.tsx
 * - client/components/StatCard.tsx
 */

import React from 'react';
import StatCard from '@/components/StatCard';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  userType: 'student' | 'instructor' | 'centerAdmin';
  status: 'active' | 'inactive' | 'pending';
  joinedAt: Date;
  lastLogin?: Date;
  membershipType?: string;
  membershipExpiry?: Date;
  totalClasses?: number;
  totalPayments?: number;
}

interface UserStatsCardsProps {
  users: User[];
}

export default function UserStatsCards({ users }: UserStatsCardsProps) {
  // 활성 회원 수
  const activeUsersCount = users.filter(u => u.status === 'active').length;
  
  // 이번 달 신규 회원 수
  const thisMonthNewUsers = users.filter(u => 
    u.joinedAt.getMonth() === new Date().getMonth() &&
    u.joinedAt.getFullYear() === new Date().getFullYear()
  ).length;
  
  // 학생 비율
  const studentRatio = users.length > 0 
    ? Math.round((users.filter(u => u.userType === 'student').length / users.length) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 min-[600px]:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8">
      <StatCard
        icon="👥"
        title="총 회원"
        value={`${users.length}명`}
        color="blue"
      />
      
      <StatCard
        icon="✅"
        title="활성 회원"
        value={`${activeUsersCount}명`}
        color="green"
      />
      
      <StatCard
        icon="📅"
        title="이번 달 신규"
        value={`${thisMonthNewUsers}명`}
        color="purple"
      />
      
      <StatCard
        icon="📊"
        title="학생 비율"
        value={`${studentRatio}%`}
        color="orange"
      />
    </div>
  );
}

