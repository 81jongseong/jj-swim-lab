/**
 * 센터 강사 관리 - 통계 카드 컴포넌트
 * 
 * 연동 파일:
 * - client/app/center-admin/instructors/page.tsx
 * - client/components/StatCard.tsx
 */

import React from 'react';
import StatCard from '@/components/StatCard';

interface Instructor {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  experience: number;
  rating: number;
  specialties: string[];
  certifications: string[];
  status: 'active' | 'inactive' | 'pending';
  joinedAt: Date;
  totalStudents: number;
  totalClasses: number;
}

interface InstructorStatsCardsProps {
  instructors: Instructor[];
}

export default function InstructorStatsCards({ instructors }: InstructorStatsCardsProps) {
  // 평균 평점 계산
  const averageRating = instructors.length > 0 
    ? (instructors.reduce((sum, i) => sum + i.rating, 0) / instructors.length).toFixed(1)
    : '0.0';
  
  // 총 수업 수 계산
  const totalClasses = instructors.reduce((sum, i) => sum + i.totalClasses, 0);
  
  // 총 학생 수 계산
  const totalStudents = instructors.reduce((sum, i) => sum + i.totalStudents, 0);

  return (
    <div className="grid grid-cols-1 min-[600px]:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8">
      <StatCard
        icon="👨‍🏫"
        title="총 강사"
        value={`${instructors.length}명`}
        color="blue"
      />
      
      <StatCard
        icon="⭐"
        title="평균 평점"
        value={averageRating}
        color="yellow"
      />
      
      <StatCard
        icon="📅"
        title="총 수업"
        value={`${totalClasses}회`}
        color="green"
      />
      
      <StatCard
        icon="🎓"
        title="총 학생"
        value={`${totalStudents}명`}
        color="purple"
      />
    </div>
  );
}

