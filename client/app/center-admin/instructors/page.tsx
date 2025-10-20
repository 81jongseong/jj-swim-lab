/**
 * 센터 강사 관리 페이지
 * 
 * 연동 컴포넌트:
 * - client/components/center-admin/InstructorStatsCards.tsx (통계 카드)
 * - client/components/center-admin/InstructorCard.tsx (강사 카드)
 * 
 * 연동 데이터:
 * - 센터 강사 목록 (향후 API 연동 예정)
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import withAuth from '@/components/withAuth';
import InstructorStatsCards from '@/components/center-admin/InstructorStatsCards';
import InstructorCard from '@/components/center-admin/InstructorCard';

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

function CenterInstructorsManagement() {
  const { user } = useAuth();
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadInstructors();
    }
  }, [user]);

  const loadInstructors = async () => {
    try {
      setIsLoading(true);
      // 임시 데이터
      const tempInstructors: Instructor[] = [
        {
          _id: '1',
          name: '김강사',
          email: 'instructor1@example.com',
          phone: '010-1234-5678',
          experience: 5,
          rating: 4.8,
          specialties: ['자유형', '배영', '접영'],
          certifications: ['수영지도자 1급', 'CPR 자격증'],
          status: 'active',
          joinedAt: new Date('2023-01-15'),
          totalStudents: 45,
          totalClasses: 120
        },
        {
          _id: '2',
          name: '이코치',
          email: 'instructor2@example.com',
          phone: '010-2345-6789',
          experience: 8,
          rating: 4.9,
          specialties: ['평영', '접영', '종합'],
          certifications: ['수영지도자 1급', '수상안전요원', 'CPR 자격증'],
          status: 'active',
          joinedAt: new Date('2022-06-10'),
          totalStudents: 67,
          totalClasses: 200
        },
        {
          _id: '3',
          name: '박트레이너',
          email: 'instructor3@example.com',
          phone: '010-3456-7890',
          experience: 3,
          rating: 4.5,
          specialties: ['자유형', '초급자 지도'],
          certifications: ['수영지도자 2급', 'CPR 자격증'],
          status: 'pending',
          joinedAt: new Date('2024-01-01'),
          totalStudents: 12,
          totalClasses: 30
        }
      ];
      setInstructors(tempInstructors);
    } catch (error) {
      console.error('강사 목록 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditInstructor = (instructor: Instructor) => {
    console.log('Edit instructor:', instructor);
    // TODO: 강사 수정 모달 구현
  };

  const handleDeleteInstructor = (instructorId: string) => {
    if (confirm('정말 이 강사를 삭제하시겠습니까?')) {
      setInstructors(prev => prev.filter(i => i._id !== instructorId));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          센터 강사 관리 👨‍🏫
        </h1>
        <p className="text-gray-600">센터 소속 강사들을 관리하고 평가하세요</p>
      </div>

      {/* 통계 카드 */}
      <InstructorStatsCards instructors={instructors} />

      {/* 강사 목록 - 반응형 카드 뷰 (최소 2열) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {instructors.map((instructor) => (
          <InstructorCard
            key={instructor._id}
            instructor={instructor}
            onEdit={handleEditInstructor}
            onDelete={handleDeleteInstructor}
          />
        ))}
      </div>

      {/* 강사 없음 안내 */}
      {instructors.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="text-6xl mb-4">👨‍🏫</div>
          <p className="text-gray-500 text-lg">등록된 강사가 없습니다.</p>
          <p className="text-gray-400 text-sm mt-2">강사를 추가하여 센터 운영을 시작하세요.</p>
        </div>
      )}
    </div>
  );
}

export default withAuth(CenterInstructorsManagement, { 
  requireTypes: ['centerAdmin', 'superAdmin'] 
});