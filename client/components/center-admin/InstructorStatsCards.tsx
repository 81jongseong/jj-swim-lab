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
  instructorStats?: {[key: string]: any};
}

export default function InstructorStatsCards({ instructors, instructorStats = {} }: InstructorStatsCardsProps) {
  // 평균 평점 계산 (안전하게)
  const averageRating = instructors.length > 0 
    ? (instructors.reduce((sum, i) => sum + (i.rating || 0), 0) / instructors.length).toFixed(1)
    : '0.0';
  
  // 총 수업 수 계산 (instructorStats에서 가져옴)
  const totalClasses = Object.values(instructorStats).reduce((sum, stat: any) => sum + (stat.totalLessons || 0), 0);
  
  // 총 학생 수 계산 (instructorStats에서 가져옴)
  const totalStudents = Object.values(instructorStats).reduce((sum, stat: any) => sum + (stat.totalStudents || 0), 0);
  
  console.log('📊 강사 통계 카드 계산:', { 
    instructorsCount: instructors.length,
    instructorStatsCount: Object.keys(instructorStats).length,
    averageRating,
    totalClasses,
    totalStudents,
    instructorStats
  });

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

