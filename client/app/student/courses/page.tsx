'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { BookOpen, Users, Clock, Star, Search, Plus } from 'lucide-react';
import withAuth from '@/components/withAuth';
import { CenterSelector, LoadingState, PageHeader, ConfirmModal } from '@/components/common';
import { logger } from '@/lib/logger';

interface Course {
  _id: string;
  name: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  duration: number; // minutes
  maxStudents: number;
  price: number;
  instructorId: string;
  instructorName: string;
  schedule: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }>;
  enrolledStudents: number;
  rating: number;
  status: 'active' | 'inactive';
  enrolled: boolean;
}

function StudentCourses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [selectedCenterId, setSelectedCenterId] = useState<string | null>(null);
  
  // ConfirmModal 상태
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
    variant?: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    message: '',
    onConfirm: () => {},
    variant: 'info'
  });

  useEffect(() => {
    if (user) {
      loadCourses();
    }
  }, [user]);

  const loadCourses = async () => {
    try {
      setIsLoading(true);
      const apiClient = (await import('@/utils/api')).default;
      const response = await apiClient.getStudentCourses();
      
      if (response.success && response.data) {
        const coursesData = response.data.map((course: any) => ({
          _id: course.id || course._id || '',
          name: course.name || '제목 없음',
          description: `${course.level || 'beginner'} 레벨 강의`,
          level: course.level || 'beginner',
          category: course.name?.includes('자유형') ? '자유형' : course.name?.includes('배영') ? '배영' : course.name?.includes('평영') ? '평영' : course.name?.includes('접영') ? '접영' : '기타',
          duration: 60,
          maxStudents: 10,
          price: 0,
          instructorId: course.instructorId || '',
          instructorName: course.instructorName || '강사 미배정',
          schedule: course.schedule ? [{ dayOfWeek: 1, startTime: course.schedule.split(' ')[0] || '10:00', endTime: course.schedule.split(' ')[2] || '11:00' }] : [],
          enrolledStudents: 0,
          rating: 4.5,
          status: course.status === 'active' ? 'active' : 'inactive',
          enrolled: true
        }));
        setCourses(coursesData);
      }
    } catch (error) {
      logger.error('강의 목록 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === '' || course.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const getLevelLabel = (level: string) => {
    const levels: { [key: string]: string } = {
      'beginner': '초급',
      'intermediate': '중급',
      'advanced': '고급'
    };
    return levels[level] || level;
  };

  const getLevelColor = (level: string) => {
    const colors: { [key: string]: string } = {
      'beginner': 'bg-green-100 text-green-800',
      'intermediate': 'bg-yellow-100 text-yellow-800',
      'advanced': 'bg-red-100 text-red-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  const getDayOfWeekLabel = (dayOfWeek: number) => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return days[dayOfWeek];
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const enrollCourse = (courseId: string) => {
    setConfirmModal({
      isOpen: true,
      message: '이 강의에 등록하시겠습니까?',
      variant: 'info',
      onConfirm: () => {
        setCourses(prev => prev.map(course => 
          course._id === courseId 
            ? { ...course, enrolled: true, enrolledStudents: course.enrolledStudents + 1 }
            : course
        ));
        setConfirmModal({ isOpen: false, message: '', onConfirm: () => {} });
      }
    });
  };

  const unenrollCourse = (courseId: string) => {
    setConfirmModal({
      isOpen: true,
      message: '이 강의에서 탈퇴하시겠습니까?',
      variant: 'warning',
      onConfirm: () => {
        setCourses(prev => prev.map(course => 
          course._id === courseId 
            ? { ...course, enrolled: false, enrolledStudents: course.enrolledStudents - 1 }
            : course
        ));
        setConfirmModal({ isOpen: false, message: '', onConfirm: () => {} });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingState message="강의 목록을 불러오는 중..." size="md" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <PageHeader
        title="강의 관리"
        description="수영 강의를 찾고 등록하세요"
        actions={
          <CenterSelector
            selectedCenterId={selectedCenterId}
            onCenterChange={setSelectedCenterId}
          />
        }
      />

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 강의</p>
              <p className="text-2xl font-bold text-gray-900">{courses.length}개</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">등록된 강의</p>
              <p className="text-2xl font-bold text-gray-900">
                {courses.filter(c => c.enrolled).length}개
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">활성 강의</p>
              <p className="text-2xl font-bold text-gray-900">
                {courses.filter(c => c.status === 'active').length}개
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Star className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">평균 평점</p>
              <p className="text-2xl font-bold text-gray-900">
                {courses.length > 0 
                  ? (courses.reduce((sum, c) => sum + c.rating, 0) / courses.length).toFixed(1)
                  : '0.0'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="강의명, 설명, 카테고리, 강사명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">모든 레벨</option>
              <option value="beginner">초급</option>
              <option value="intermediate">중급</option>
              <option value="advanced">고급</option>
            </select>
          </div>
        </div>
      </div>

      {/* 강의 목록 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCourses.map((course) => (
          <div key={course._id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{course.description}</p>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(course.level)}`}>
                      {getLevelLabel(course.level)}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {course.category}
                    </span>
                    {course.enrolled && (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        등록됨
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">강사</span>
                  <span className="text-sm font-medium text-gray-900">{course.instructorName}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">수강료</span>
                  <span className="text-sm font-medium text-gray-900">{course.price.toLocaleString()}원</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">수강생</span>
                  <span className="text-sm font-medium text-gray-900">
                    {course.enrolledStudents}/{course.maxStudents}명
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">평점</span>
                  <div className="flex items-center">
                    <div className="flex mr-1">
                      {renderStars(course.rating)}
                    </div>
                    <span className="text-sm text-gray-600">({course.rating})</span>
                  </div>
                </div>

                <div>
                  <span className="text-sm text-gray-600">수업 일정</span>
                  <div className="mt-1 space-y-1">
                    {course.schedule.map((schedule, index) => (
                      <div key={index} className="text-xs text-gray-500">
                        {getDayOfWeekLabel(schedule.dayOfWeek)} {schedule.startTime}-{schedule.endTime}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-2 pt-3 border-t">
                  {course.enrolled ? (
                    <button
                      onClick={() => unenrollCourse(course._id)}
                      className="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      탈퇴
                    </button>
                  ) : (
                    <button
                      onClick={() => enrollCourse(course._id)}
                      className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      등록
                    </button>
                  )}
                  <button className="flex-1 px-3 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors">
                    상세보기
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">검색 결과가 없습니다.</p>
        </div>
      )}

      {/* ConfirmModal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, message: '', onConfirm: () => {} })}
        onConfirm={confirmModal.onConfirm}
        message={confirmModal.message}
        variant={confirmModal.variant || 'info'}
        title="확인"
        confirmText="확인"
        cancelText="취소"
      />
    </div>
  );
}

export default withAuth(StudentCourses, { 
  requireTypes: ['student'] 
});