'use client';
import { logger } from '@/lib/logger';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Activity, Target, Calendar, TrendingUp, Plus, Edit, Trash2 } from 'lucide-react';
import withAuth from '@/components/withAuth';
import { LoadingState } from '@/components/common';

interface HealthProgram {
  _id: string;
  name: string;
  description: string;
  type: 'cardio' | 'strength' | 'flexibility' | 'rehabilitation';
  duration: number; // weeks
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  targetAudience: string[];
  exercises: Array<{
    name: string;
    sets: number;
    reps: string;
    duration?: number;
    restTime: number;
  }>;
  equipment: string[];
  benefits: string[];
  precautions: string[];
  enrolledMembers: number;
  maxMembers: number;
  status: 'active' | 'inactive' | 'full';
  createdAt: Date;
  instructorId: string;
  instructorName: string;
}

function HealthProgramsPage() {
  const { user } = useAuth();
  const [programs, setPrograms] = useState<HealthProgram[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (user) {
      loadHealthPrograms();
    }
  }, [user]);

  const loadHealthPrograms = async () => {
    try {
      setIsLoading(true);
      // 임시 데이터
      const tempPrograms: HealthProgram[] = [
        {
          _id: '1',
          name: '초보자 수영 프로그램',
          description: '수영을 처음 시작하는 분들을 위한 기초 프로그램',
          type: 'cardio',
          duration: 8,
          difficulty: 'beginner',
          targetAudience: ['초보자', '체력 부족자'],
          exercises: [
            { name: '자유형 기초', sets: 3, reps: '50m', restTime: 60 },
            { name: '배영 기초', sets: 2, reps: '25m', restTime: 45 },
            { name: '호흡 연습', sets: 5, reps: '10회', restTime: 30 }
          ],
          equipment: ['킥보드', '풀부이', '스노클'],
          benefits: ['체력 향상', '기초 수영 기술 습득', '자신감 향상'],
          precautions: ['무릎 부상 주의', '천천히 진행'],
          enrolledMembers: 8,
          maxMembers: 10,
          status: 'active',
          createdAt: new Date('2024-01-15'),
          instructorId: 'instructor001',
          instructorName: '김강사'
        },
        {
          _id: '2',
          name: '고혈압 관리 프로그램',
          description: '고혈압 환자를 위한 안전한 수영 프로그램',
          type: 'rehabilitation',
          duration: 12,
          difficulty: 'beginner',
          targetAudience: ['고혈압 환자', '중년층'],
          exercises: [
            { name: '느린 자유형', sets: 2, reps: '100m', restTime: 90 },
            { name: '배영', sets: 2, reps: '50m', restTime: 60 },
            { name: '스트레칭', sets: 1, reps: '10분', restTime: 0 }
          ],
          equipment: ['풀부이', '스트레치 밴드'],
          benefits: ['혈압 안정', '심혈관 건강', '스트레스 해소'],
          precautions: ['과도한 운동 금지', '혈압 모니터링 필수'],
          enrolledMembers: 6,
          maxMembers: 8,
          status: 'active',
          createdAt: new Date('2024-01-10'),
          instructorId: 'instructor002',
          instructorName: '이코치'
        },
        {
          _id: '3',
          name: '고급 수영 기술 프로그램',
          description: '수영 기술을 완성하고 싶은 분들을 위한 고급 프로그램',
          type: 'strength',
          duration: 16,
          difficulty: 'advanced',
          targetAudience: ['중급자', '경기 준비자'],
          exercises: [
            { name: '접영 완성', sets: 4, reps: '100m', restTime: 120 },
            { name: '평영 완성', sets: 3, reps: '75m', restTime: 90 },
            { name: '턴 기술', sets: 5, reps: '10회', restTime: 60 }
          ],
          equipment: ['핀', '패들', '저항 밴드'],
          benefits: ['고급 기술 습득', '경기력 향상', '전문성 증대'],
          precautions: ['충분한 준비운동', '기술 숙련도 확인'],
          enrolledMembers: 4,
          maxMembers: 6,
          status: 'active',
          createdAt: new Date('2024-01-05'),
          instructorId: 'instructor001',
          instructorName: '김강사'
        }
      ];
      setPrograms(tempPrograms);
    } catch (error) {
      logger.error('건강 프로그램 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'cardio': '유산소',
      'strength': '근력',
      'flexibility': '유연성',
      'rehabilitation': '재활'
    };
    return types[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'cardio': 'bg-red-100 text-red-800',
      'strength': 'bg-blue-100 text-blue-800',
      'flexibility': 'bg-green-100 text-green-800',
      'rehabilitation': 'bg-purple-100 text-purple-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getDifficultyLabel = (difficulty: string) => {
    const difficulties: { [key: string]: string } = {
      'beginner': '초급',
      'intermediate': '중급',
      'advanced': '고급'
    };
    return difficulties[difficulty] || difficulty;
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: { [key: string]: string } = {
      'beginner': 'bg-green-100 text-green-800',
      'intermediate': 'bg-yellow-100 text-yellow-800',
      'advanced': 'bg-red-100 text-red-800'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const statuses: { [key: string]: string } = {
      'active': '활성',
      'inactive': '비활성',
      'full': '정원마감'
    };
    return statuses[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-red-100 text-red-800',
      'full': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingState message="로딩 중..." size="md" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">건강 프로그램 관리</h1>
            <p className="text-gray-600">회원들의 건강을 위한 맞춤형 프로그램을 관리하세요</p>
          </div>
          <button 
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            새 프로그램 추가
          </button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Activity className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 프로그램</p>
              <p className="text-2xl font-bold text-gray-900">{programs.length}개</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Target className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">활성 프로그램</p>
              <p className="text-2xl font-bold text-gray-900">
                {programs.filter(program => program.status === 'active').length}개
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">평균 기간</p>
              <p className="text-2xl font-bold text-gray-900">
                {programs.length > 0 
                  ? Math.round(programs.reduce((sum, program) => sum + program.duration, 0) / programs.length)
                  : 0
                }주
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 참여자</p>
              <p className="text-2xl font-bold text-gray-900">
                {programs.reduce((sum, program) => sum + program.enrolledMembers, 0)}명
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 프로그램 목록 - 반응형 카드 뷰 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {programs.map((program) => (
          <div key={program._id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{program.name}</h3>
                  <p className="text-sm text-gray-500">{program.description}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(program.status)}`}>
                  {getStatusLabel(program.status)}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">프로그램 유형</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(program.type)}`}>
                    {getTypeLabel(program.type)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">난이도</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(program.difficulty)}`}>
                    {getDifficultyLabel(program.difficulty)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">기간</span>
                  <span className="text-sm font-medium text-gray-900">{program.duration}주</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">참여자</span>
                  <span className="text-sm font-medium text-gray-900">
                    {program.enrolledMembers}/{program.maxMembers}명
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">담당 강사</span>
                  <span className="text-sm font-medium text-gray-900">{program.instructorName}</span>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">주요 운동</p>
                  <div className="space-y-1">
                    {program.exercises.slice(0, 3).map((exercise, index) => (
                      <div key={index} className="text-xs text-gray-600">
                        • {exercise.name} ({exercise.sets}세트, {exercise.reps})
                      </div>
                    ))}
                    {program.exercises.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{program.exercises.length - 3}개 더...
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2 pt-3 border-t">
                  <button className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center justify-center">
                    <Edit className="w-4 h-4 mr-1" />
                    수정
                  </button>
                  <button className="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center justify-center">
                    <Trash2 className="w-4 h-4 mr-1" />
                    삭제
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {programs.length === 0 && (
        <div className="text-center py-12">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">등록된 프로그램이 없습니다.</p>
        </div>
      )}
    </div>
  );
}

export default withAuth(HealthProgramsPage, { 
  requireTypes: ['centerAdmin', 'superAdmin'] 
});