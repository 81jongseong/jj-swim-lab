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
import InstructorEditModal from '@/components/center-admin/InstructorEditModal';
import apiClient from '@/utils/api';

interface EmploymentHistory {
  centerName: string;
  startDate: string;
  endDate: string;
  position: string;
  rating: number;
  totalClasses: number;
  totalStudents: number;
  leaveReason?: string;
  memo?: string;
}

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
  instructorInfo?: {
    instructorType?: 'instructor' | 'lifeguard'; // ⭐ 강사 종류
    instructorLevel?: string;
    maxStudents?: number;
    workSchedule?: {
      daysOfWeek?: number[];
      timeSlots?: string[];
    };
    salaryInfo?: {
      type?: string;
      amount?: number;
      currency?: string;
      incentive?: number;
    };
    memo?: string;
    hiredAt?: Date;
    contractType?: string;
    employmentHistory?: EmploymentHistory[];
  };
}

function CenterInstructorsManagement() {
  const { user } = useAuth();
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [instructorTypeFilter, setInstructorTypeFilter] = useState<'all' | 'instructor' | 'lifeguard'>('all'); // ⭐ 강사 종류 필터

  useEffect(() => {
    if (user) {
      loadInstructors();
    }
  }, [user]);

  const loadInstructors = async () => {
    try {
      setIsLoading(true);
      
      // 실제 API 연동
      const response = await apiClient.get('/api/center-admin/instructors');
      console.log('📡 전체 응답:', response);
      
      // response = { success, message, data: { instructors, pagination } }
      if ((response as any).success) {
        const instructors = ((response as any).data?.instructors || [])
          .sort((a: any, b: any) => (a.name || '').localeCompare(b.name || '', 'ko-KR')); // ⭐ 가나다순 정렬
        console.log('📋 강사 배열 (가나다순):', instructors);
        setInstructors(instructors);
        console.log('✅ 강사 데이터 로드 성공:', instructors.length, '명');
        
        if (instructors.length === 0) {
          console.warn('⚠️ 센터에 배정된 강사가 없습니다. 서버 로그를 확인하세요.');
        }
      } else {
        console.error('❌ API 호출 실패');
        setInstructors([]);
      }
      
      /* 임시 데이터 제거 - 실제 DB 데이터 사용
      const tempInstructors: Instructor[] = [
        {
          _id: '1',
          name: '김강사',
          email: 'instructor1@example.com',
          phone: '010-1234-5678',
          experience: 5,
          rating: 4.8,
          specialties: ['초급자', '중급자', '성인반', '개인지도'],
          certifications: ['수영지도자 1급', 'CPR 자격증'],
          status: 'active',
          joinedAt: new Date('2023-01-15'),
          totalStudents: 45,
          totalClasses: 120,
          instructorInfo: {
            instructorLevel: 'senior',
            maxStudents: 50,
            workSchedule: {
              daysOfWeek: [1, 2, 3, 4, 5], // 월~금
              timeSlots: ['09:00-13:00', '14:00-18:00']
            },
            salaryInfo: {
              type: 'monthly',
              amount: 3500000,
              currency: 'KRW',
              incentive: 10
            },
            memo: '성실하고 학생들에게 인기가 많은 강사입니다.',
            hiredAt: new Date('2023-01-15'),
            contractType: 'full-time',
            employmentHistory: [
              {
                centerName: '서울수영센터',
                startDate: '2020-03-01',
                endDate: '2022-12-31',
                position: '수석강사',
                rating: 4.7,
                totalClasses: 350,
                totalStudents: 120,
                leaveReason: '더 나은 조건의 센터로 이직',
                memo: '우수 강사상 3회 수상'
              }
            ]
          }
        },
        {
          _id: '2',
          name: '이코치',
          email: 'instructor2@example.com',
          phone: '010-2345-6789',
          experience: 8,
          rating: 4.9,
          specialties: ['중급자', '상급자', '선수반', '그룹지도'],
          certifications: ['수영지도자 1급', '수상안전요원', 'CPR 자격증'],
          status: 'active',
          joinedAt: new Date('2022-06-10'),
          totalStudents: 67,
          totalClasses: 200,
          instructorInfo: {
            instructorLevel: 'master',
            maxStudents: 60,
            workSchedule: {
              daysOfWeek: [1, 3, 5], // 월수금
              timeSlots: ['10:00-14:00', '15:00-19:00']
            },
            salaryInfo: {
              type: 'monthly',
              amount: 4200000,
              currency: 'KRW',
              incentive: 15
            },
            memo: '선수반 지도 전문, 대회 입상자 다수 배출',
            hiredAt: new Date('2022-06-10'),
            contractType: 'full-time',
            employmentHistory: [
              {
                centerName: '강남스포츠센터',
                startDate: '2017-01-01',
                endDate: '2020-05-31',
                position: '선수반 코치',
                rating: 4.8,
                totalClasses: 520,
                totalStudents: 180,
                leaveReason: '센터 폐업',
                memo: '전국대회 금메달리스트 5명 배출'
              },
              {
                centerName: '올림픽수영장',
                startDate: '2020-06-01',
                endDate: '2022-05-31',
                position: '수석 코치',
                rating: 4.9,
                totalClasses: 400,
                totalStudents: 150,
                leaveReason: '근무 조건 협의',
                memo: '청소년부 국가대표 후보 2명 배출'
              }
            ]
          }
        },
        {
          _id: '3',
          name: '박트레이너',
          email: 'instructor3@example.com',
          phone: '010-3456-7890',
          experience: 3,
          rating: 4.5,
          specialties: ['초급자', '아동반', '생존수영'],
          certifications: ['수영지도자 2급', 'CPR 자격증'],
          status: 'pending',
          joinedAt: new Date('2024-01-01'),
          totalStudents: 12,
          totalClasses: 30,
          instructorInfo: {
            instructorLevel: 'junior',
            maxStudents: 30,
            workSchedule: {
              daysOfWeek: [0, 6], // 주말
              timeSlots: ['10:00-18:00']
            },
            salaryInfo: {
              type: 'hourly',
              amount: 35000,
              currency: 'KRW',
              incentive: 5
            },
            memo: '신입 강사, 교육 열정이 높음',
            hiredAt: new Date('2024-01-01'),
            contractType: 'part-time',
            employmentHistory: []
          }
        }
      ];
      setInstructors(tempInstructors);
      */
    } catch (error) {
      console.error('강사 목록 로드 실패:', error);
      setInstructors([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditInstructor = (instructor: Instructor) => {
    setSelectedInstructor(instructor);
    setShowEditModal(true);
  };

  const handleSaveInstructor = async (updatedData: Partial<Instructor>) => {
    if (!selectedInstructor) return;

    try {
      console.log('💾 강사 정보 저장 시작:', selectedInstructor._id);
      console.log('📋 업데이트 데이터:', updatedData);

      const response = await apiClient.put(
        `/api/center-admin/instructors/${selectedInstructor._id}`,
        updatedData
      );

      console.log('📡 서버 응답:', response);

      // apiClient는 response.data를 반환하므로 response.success 확인
      if ((response as any)?.success) {
        // 강사 목록 갱신
        setInstructors(prev =>
          prev.map(inst =>
            inst._id === selectedInstructor._id
              ? { ...inst, ...((response as any).data as any) }
              : inst
          )
        );
        alert('✅ 강사 정보가 성공적으로 수정되었습니다!');
        setShowEditModal(false);
        setSelectedInstructor(null);
        
        // 목록 새로고침
        await loadInstructors();
      } else {
        throw new Error('응답 실패');
      }
    } catch (error: any) {
      console.error('❌ 강사 정보 수정 실패:', error);
      console.error('📋 에러 상세:', error.response?.data);
      
      // 에러 메시지 개선
      const errorMessage = error.response?.data?.message || error.message || '알 수 없는 오류';
      alert(`강사 정보 수정 실패: ${errorMessage}\n\n새로고침 후 다시 시도해주세요.`);
    }
  };

  const handleDeleteInstructor = (instructorId: string) => {
    if (confirm('정말 이 강사를 삭제하시겠습니까?')) {
      setInstructors(prev => prev.filter(i => i._id !== instructorId));
    }
  };

  // ⭐ 강사 종류별 필터링
  const filteredInstructors = instructors.filter(instructor => {
    if (instructorTypeFilter === 'all') return true;
    return instructor.instructorInfo?.instructorType === instructorTypeFilter;
  });

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

      {/* 강사 종류 필터 */}
      <div className="mb-6 flex gap-3">
        <button
          onClick={() => setInstructorTypeFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            instructorTypeFilter === 'all'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          전체 ({instructors.length})
        </button>
        <button
          onClick={() => setInstructorTypeFilter('instructor')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            instructorTypeFilter === 'instructor'
              ? 'bg-green-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🏊 강습 강사 ({instructors.filter(i => i.instructorInfo?.instructorType === 'instructor' || !i.instructorInfo?.instructorType).length})
        </button>
        <button
          onClick={() => setInstructorTypeFilter('lifeguard')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            instructorTypeFilter === 'lifeguard'
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🛟 안전 요원 ({instructors.filter(i => i.instructorInfo?.instructorType === 'lifeguard').length})
        </button>
      </div>

      {/* 강사 목록 - 반응형 카드 뷰 (최소 2열) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredInstructors.map((instructor) => (
          <InstructorCard
            key={instructor._id}
            instructor={instructor}
            onEdit={handleEditInstructor}
            onDelete={handleDeleteInstructor}
          />
        ))}
      </div>

      {/* 필터링된 강사 없음 안내 */}
      {filteredInstructors.length === 0 && instructors.length > 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-gray-500 text-lg">
            {instructorTypeFilter === 'instructor' ? '강습 강사가' : '안전 요원이'} 없습니다.
          </p>
        </div>
      )}

      {/* 강사 없음 안내 */}
      {instructors.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="text-6xl mb-4">👨‍🏫</div>
          <p className="text-gray-500 text-lg">등록된 강사가 없습니다.</p>
          <p className="text-gray-400 text-sm mt-2">강사를 추가하여 센터 운영을 시작하세요.</p>
        </div>
      )}

      {/* 강사 수정 모달 */}
      {showEditModal && selectedInstructor && (
        <InstructorEditModal
          instructor={selectedInstructor}
          onClose={() => {
            setShowEditModal(false);
            setSelectedInstructor(null);
          }}
          onSave={handleSaveInstructor}
        />
      )}
    </div>
  );
}

export default withAuth(CenterInstructorsManagement, { 
  requireTypes: ['centerAdmin', 'superAdmin'] 
});