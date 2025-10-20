/**
 * 센터 과정 관리 페이지
 * 
 * 연동 컴포넌트:
 * - client/components/center-admin/CourseFilterButtons.tsx
 * - client/components/center-admin/CourseTable.tsx
 * - client/components/StatCard.tsx
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Plus } from 'lucide-react';
import withAuth from '@/components/withAuth';
import StatCard from '@/components/StatCard';
import CourseFilterButtons from '@/components/center-admin/CourseFilterButtons';
import CourseTable from '@/components/center-admin/CourseTable';
import CourseFormModal from '@/components/center-admin/CourseFormModal';

interface Course {
  _id: string;
  name: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // minutes
  maxStudents: number;
  currentStudents: number;
  instructorId: string;
  instructorName: string;
  price: number;
  schedule: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  }[];
  status: 'active' | 'inactive' | 'full';
  createdAt: Date;
  tags?: string[]; // 과정 태그 (어린이, 아쿠아 등)
}

function CoursesManagement() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [instructors, setInstructors] = useState([
    { _id: '1', name: '김강사' },
    { _id: '2', name: '이코치' },
    { _id: '3', name: '박트레이너' }
  ]);
  const [customLevels, setCustomLevels] = useState([
    { id: 'level1', name: '입문', description: '수영을 처음 시작하는 단계', order: 1 },
    { id: 'level2', name: '초급', description: '기본 영법을 배우는 단계', order: 2 },
    { id: 'level3', name: '중급', description: '영법을 다듬는 단계', order: 3 },
    { id: 'level4', name: '상급', description: '고급 기술을 익히는 단계', order: 4 },
    { id: 'level5', name: '마스터', description: '전문가 수준', order: 5 }
  ]);

  useEffect(() => {
    if (user) {
      loadCourses();
    }
  }, [user]);

  const loadCourses = async () => {
    try {
      setIsLoading(true);
      // 임시 데이터
      const tempCourses: Course[] = [
        {
          _id: '1',
          name: '초급 자유형 클래스',
          description: '수영을 처음 시작하는 분들을 위한 기초 자유형 클래스',
          level: 'beginner',
          duration: 60,
          maxStudents: 8,
          currentStudents: 6,
          instructorId: 'instructor001',
          instructorName: '김강사',
          price: 80000,
          schedule: [
            { dayOfWeek: '월', startTime: '19:00', endTime: '20:00' },
            { dayOfWeek: '수', startTime: '19:00', endTime: '20:00' }
          ],
          status: 'active',
          createdAt: new Date('2024-01-15'),
          tags: ['beginner-friendly']
        },
        {
          _id: '2',
          name: '중급 배영 클래스',
          description: '배영 기술을 향상시키고 싶은 분들을 위한 클래스',
          level: 'intermediate',
          duration: 60,
          maxStudents: 6,
          currentStudents: 6,
          instructorId: 'instructor002',
          instructorName: '이코치',
          price: 100000,
          schedule: [
            { dayOfWeek: '화', startTime: '20:00', endTime: '21:00' },
            { dayOfWeek: '목', startTime: '20:00', endTime: '21:00' }
          ],
          status: 'full',
          createdAt: new Date('2024-01-10'),
          tags: []
        },
        {
          _id: '3',
          name: '고급 접영 클래스',
          description: '접영 기술을 완성하고 싶은 분들을 위한 고급 클래스',
          level: 'advanced',
          duration: 90,
          maxStudents: 4,
          currentStudents: 3,
          instructorId: 'instructor001',
          instructorName: '김강사',
          price: 120000,
          schedule: [
            { dayOfWeek: '토', startTime: '10:00', endTime: '11:30' }
          ],
          status: 'active',
          createdAt: new Date('2024-01-05'),
          tags: ['competition']
        },
        {
          _id: '4',
          name: '어린이 수영교실',
          description: '7-12세 어린이를 위한 기초 수영 교육',
          level: 'beginner',
          duration: 50,
          maxStudents: 12,
          currentStudents: 10,
          instructorId: 'instructor003',
          instructorName: '박트레이너',
          price: 70000,
          schedule: [
            { dayOfWeek: '월,수,금', startTime: '16:00', endTime: '16:50' }
          ],
          status: 'active',
          createdAt: new Date('2024-01-20'),
          tags: ['kids', 'beginner-friendly']
        },
        {
          _id: '5',
          name: '아쿠아로빅',
          description: '음악에 맞춰 물속에서 하는 유산소 운동',
          level: 'beginner',
          duration: 45,
          maxStudents: 15,
          currentStudents: 12,
          instructorId: 'instructor002',
          instructorName: '이코치',
          price: 60000,
          schedule: [
            { dayOfWeek: '화,목', startTime: '10:00', endTime: '10:45' }
          ],
          status: 'active',
          createdAt: new Date('2024-01-18'),
          tags: ['aqua', 'fitness']
        },
        {
          _id: '6',
          name: '새벽 수영반',
          description: '새벽 시간을 활용한 자유 수영 시간',
          level: 'intermediate',
          duration: 90,
          maxStudents: 20,
          currentStudents: 15,
          instructorId: 'instructor001',
          instructorName: '김강사',
          price: 50000,
          schedule: [
            { dayOfWeek: '월,수,금', startTime: '06:00', endTime: '07:30' }
          ],
          status: 'active',
          createdAt: new Date('2024-01-12'),
          tags: ['fitness']
        }
      ];
      setCourses(tempCourses);
    } catch (error) {
      console.error('강습 과정 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  // 시간대별 필터링 함수
  const getTimeCategory = (startTime: string): string => {
    const hour = parseInt(startTime.split(':')[0]);
    if (hour >= 5 && hour < 7) return 'dawn';      // 새벽 05:00-06:59
    if (hour >= 7 && hour < 12) return 'morning';  // 오전 07:00-11:59
    if (hour >= 12 && hour < 18) return 'afternoon'; // 오후 12:00-17:59
    if (hour >= 18 && hour < 22) return 'evening'; // 저녁 18:00-21:59
    return 'other';
  };

  // 모든 과정의 태그 수집 (중복 제거)
  const allTags = Array.from(
    new Set(
      courses.flatMap(course => course.tags || [])
    )
  ).sort();

  // 모든 과정에서 사용된 급수 수집 (중복 제거)
  const usedLevels = Array.from(
    new Set(
      courses.map(course => course.level)
    )
  );

  // 커스텀 급수 + 사용된 급수 통합 (중복 제거)
  const allLevels = [
    ...customLevels,
    ...usedLevels
      .filter(levelId => !customLevels.some(cl => cl.id === levelId))
      .map((levelId, index) => ({
        id: levelId,
        name: levelId,
        description: '기존 사용 중인 급수',
        order: customLevels.length + index + 1
      }))
  ];

  // 필터링된 과정 목록
  const filteredCourses = courses.filter(course => {
    if (activeFilter === 'all') return true;
    
    // 사용자 정의 태그 필터링 (우선순위)
    if (course.tags?.includes(activeFilter)) {
      return true;
    }
    
    // 시간대 필터
    const timeCategory = getTimeCategory(course.schedule[0]?.startTime || '');
    return timeCategory === activeFilter;
  });

  // 과정 추가 핸들러
  const handleAddCourse = () => {
    setEditingCourse(null);
    setIsModalOpen(true);
  };

  // 과정 수정 핸들러
  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setIsModalOpen(true);
  };

  // 과정 삭제 핸들러
  const handleDeleteCourse = (courseId: string) => {
    if (confirm('정말 이 과정을 삭제하시겠습니까?')) {
      setCourses(prev => prev.filter(c => c._id !== courseId));
    }
  };

  // 과정 저장 핸들러
  const handleSaveCourse = (courseData: Course) => {
    if (editingCourse) {
      // 수정
      setCourses(prev => prev.map(c => 
        c._id === editingCourse._id ? { ...courseData, _id: editingCourse._id } : c
      ));
    } else {
      // 추가
      const newCourse = {
        ...courseData,
        _id: `course-${Date.now()}`,
        createdAt: new Date()
      };
      setCourses(prev => [...prev, newCourse]);
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🏊‍♂️ 강습 과정 관리
        </h1>
        <p className="text-gray-600">센터의 강습 과정을 관리하고 모니터링하세요</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 min-[600px]:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8">
        <StatCard
          icon="📚"
          title="총 과정"
          value={`${courses.length}개`}
          color="blue"
        />
        <StatCard
          icon="👥"
          title="총 학생"
          value={`${courses.reduce((sum, course) => sum + course.currentStudents, 0)}명`}
          color="green"
        />
        <StatCard
          icon="⏱️"
          title="평균 수업시간"
          value={`${courses.length > 0 
            ? Math.round(courses.reduce((sum, course) => sum + course.duration, 0) / courses.length)
            : 0
          }분`}
          color="purple"
        />
        <StatCard
          icon="⭐"
          title="활성 과정"
          value={`${courses.filter(course => course.status === 'active').length}개`}
          color="yellow"
        />
      </div>

      {/* 필터 버튼 - 동적 태그 포함 */}
      <CourseFilterButtons
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        allTags={allTags}
      />

      {/* 과정 목록 - 추가 버튼 */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          강습 과정 목록 ({filteredCourses.length}개)
        </h3>
        <button 
          onClick={handleAddCourse}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          새 과정 추가
        </button>
      </div>

      {/* 과정 테이블 */}
      <CourseTable
        courses={filteredCourses}
        onEdit={handleEditCourse}
        onDelete={handleDeleteCourse}
      />

      {/* 과정 추가/수정 모달 */}
      <CourseFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCourse(null);
        }}
        onSave={handleSaveCourse}
        course={editingCourse}
        instructors={instructors}
        customLevels={allLevels}
      />
    </div>
  );
}

export default withAuth(CoursesManagement, { 
  requireTypes: ['centerAdmin', 'superAdmin'] 
});
