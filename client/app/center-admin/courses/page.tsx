/**
 * 🏊‍♂️ JJ Swim Lab - 센터 과정 관리 페이지
 * 
 * 📋 **페이지 목적**
 * - 센터의 강습 과정을 생성, 수정, 삭제, 조회
 * - 캘린더 뷰 / 리스트 뷰 전환
 * - 급수별 동적 색상 시스템
 * - MongoDB와 실시간 연동
 * 
 * 🗄️ **데이터 연동**
 * - GET /api/courses - 강습 과정 목록 조회 (MongoDB)
 * - POST /api/courses - 강습 과정 추가 (DB 저장)
 * - PUT /api/courses/:id - 강습 과정 수정 (DB 업데이트)
 * - DELETE /api/courses/:id - 강습 과정 삭제 (DB 삭제)
 * 
 * 🔄 **연동 컴포넌트**
 * - client/components/center-admin/CourseFilterButtons.tsx
 * - client/components/center-admin/CourseTable.tsx
 * - client/components/center-admin/CourseFormModal.tsx
 * - client/components/center-admin/WeeklyCalendar.tsx
 * - client/components/StatCard.tsx
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 모든 CRUD 작업 후 loadCourses() 호출로 동기화
 * 2. API 응답 데이터를 Course 타입으로 변환 필요
 * 3. 인증 토큰 필요 (localStorage 'token')
 * 4. 에러 처리 및 사용자 피드백 필수
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Calendar, List } from 'lucide-react';
import withAuth from '@/components/withAuth';
import StatCard from '@/components/StatCard';
import CourseFilterButtons from '@/components/center-admin/CourseFilterButtons';
import CourseTable from '@/components/center-admin/CourseTable';
import CourseFormModal from '@/components/center-admin/CourseFormModal';
import WeeklyCalendar from '@/components/center-admin/WeeklyCalendar';

// Course 타입을 CourseTable과 동일하게 통일
type Course = {
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
    endTime?: string; // CourseTable과 동일하게 optional
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
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar'); // 캘린더/리스트 뷰 토글
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
      
      // ✅ API 호출로 실제 DB 데이터 가져오기
      const response = await fetch('http://localhost:5000/api/courses');
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }
      
      const data = await response.json();
      console.log('📚 로드된 강습 과정:', data);
      
      // 🔍 원본 schedule 구조 확인
      console.log('🔍 원본 schedule 샘플 (처음 3개):');
      data.data.slice(0, 3).forEach((course: any, idx: number) => {
        console.log(`  ${idx + 1}. ${course.name}:`, {
          schedule: course.schedule,
          scheduleLength: course.schedule?.length
        });
      });
      
      // 영어 요일 → 한글 요일 변환
      const dayMap: { [key: string]: string } = {
        'monday': '월',
        'tuesday': '화',
        'wednesday': '수',
        'thursday': '목',
        'friday': '금',
        'saturday': '토',
        'sunday': '일'
      };
      
      // API 응답 데이터를 Course 타입에 맞게 변환
      const coursesData: Course[] = (data.data || []).map((course: any) => {
        // schedule 필드 안전하게 처리 & 영어 → 한글 변환
        let schedule = [];
        if (Array.isArray(course.schedule) && course.schedule.length > 0) {
          // 같은 시간대의 요일들을 그룹화 (예: monday 16:00, wednesday 16:00 → "월,수")
          const timeSlotMap: { [key: string]: string[] } = {};
          
          course.schedule.forEach((sch: any) => {
            const dayEnglish = sch.day || sch.dayOfWeek || '';
            const dayKorean = dayMap[dayEnglish.toLowerCase()] || dayEnglish;
            const startTime = sch.startTime || '09:00';
            const endTime = sch.endTime || '';
            
            // 시간대를 키로 사용 (startTime-endTime)
            const timeKey = `${startTime}-${endTime}`;
            
            if (!timeSlotMap[timeKey]) {
              timeSlotMap[timeKey] = [];
            }
            
            if (dayKorean && !timeSlotMap[timeKey].includes(dayKorean)) {
              timeSlotMap[timeKey].push(dayKorean);
            }
          });
          
          // 그룹화된 데이터를 schedule 배열로 변환
          schedule = Object.entries(timeSlotMap).map(([timeKey, days]) => {
            const [startTime, endTime] = timeKey.split('-');
            return {
              dayOfWeek: days.join(','), // 쉼표로 구분
              startTime,
              endTime
            };
          });
        }
        
        return {
          _id: course._id,
          name: course.name || '제목 없음',
          description: course.description || '',
          level: course.level || 'beginner',
          duration: course.duration || 60,
          maxStudents: course.maxStudents || 10,
          currentStudents: course.enrolledStudents?.filter((e: any) => e.status === 'active').length || 0,
          instructorId: course.instructor?._id || course.instructor,
          instructorName: course.instructor?.name || '강사 미배정',
          price: course.price || 0,
          schedule: schedule,
          status: course.isActive === false ? 'inactive' : 
                  (course.enrolledStudents?.filter((e: any) => e.status === 'active').length >= course.maxStudents ? 'full' : 'active'),
          createdAt: new Date(course.createdAt),
          tags: course.tags || []
        };
      });
      
      setCourses(coursesData);
      
      // 📊 통계 정보 출력
      console.log('📊 강습 과정 통계:', {
        총과정: coursesData.length,
        총학생: coursesData.reduce((sum, c) => sum + c.currentStudents, 0),
        평균수업시간: coursesData.length > 0 ? Math.round(coursesData.reduce((sum, c) => sum + c.duration, 0) / coursesData.length) : 0,
        활성과정: coursesData.filter(c => c.status === 'active').length
      });
      
      // 📋 각 과정별 상세 정보
      console.log('📋 강습 과정 목록:');
      coursesData.forEach((course, index) => {
        const days = course.schedule.map(s => s.dayOfWeek).filter(d => d).join(', ');
        console.log(`  ${index + 1}. ${course.name} (${days || '⚠️ 요일 미설정'}) - ${course.duration}분`);
      });
      console.log(`\n💡 "월,수,금" 반은 1개 과정으로 카운트됩니다!`);
      
      // ⚠️ 요일이 없는 과정 확인
      const coursesWithoutSchedule = coursesData.filter(c => 
        !c.schedule || c.schedule.length === 0 || !c.schedule.some(s => s.dayOfWeek)
      );
      if (coursesWithoutSchedule.length > 0) {
        console.warn(`⚠️ 요일이 설정되지 않은 과정: ${coursesWithoutSchedule.length}개`);
        coursesWithoutSchedule.forEach(c => {
          console.warn(`   - ${c.name} (ID: ${c._id})`);
        });
      }
      
      // ✅ 임시 데이터 (DB에 데이터가 없을 경우 표시용)
      if (coursesData.length === 0) {
        console.log('⚠️ DB에 강습 과정이 없습니다. 임시 데이터 표시');
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
      }
    } catch (error) {
      console.error('💥 강습 과정 로드 실패:', error);
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

  // 과정 추가 핸들러 (옵션: 요일/시간 지정)
  const handleAddCourse = (day?: string, time?: string) => {
    // 빈 슬롯 클릭 시: 선택한 요일/시간으로 초기화된 Course 객체 생성
    if (day && time) {
      const endTime = calculateEndTime(time, 60); // 기본 60분
      // _id를 null로 설정하여 추가 모드로 인식
      setEditingCourse({
        _id: null as any, // null = 추가 모드
        name: '',
        description: '',
        level: 'beginner',
        duration: 60,
        maxStudents: 20,
        currentStudents: 0,
        instructorId: '',
        instructorName: '',
        price: 50000,
        schedule: [{ dayOfWeek: day, startTime: time, endTime }],
        status: 'active',
        createdAt: new Date(),
        tags: []
      } as Course);
    } else {
      setEditingCourse(null);
    }
    setIsModalOpen(true);
  };
  
  // 종료 시간 자동 계산 함수
  const calculateEndTime = (startTime: string, durationMinutes: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };

  // 과정 수정 핸들러
  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setIsModalOpen(true);
  };

  // 과정 삭제 핸들러
  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('정말 이 과정을 삭제하시겠습니까?')) {
      return;
    }
    
    try {
      console.log('🗑️ 강습 과정 삭제:', courseId);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete course');
      }
      
      // 로컬 상태 업데이트
      setCourses(prev => prev.filter(c => c._id !== courseId));
      alert('✅ 강습 과정이 삭제되었습니다.');
      
    } catch (error) {
      console.error('💥 강습 과정 삭제 실패:', error);
      alert('❌ 강습 과정 삭제에 실패했습니다.');
    }
  };

  // 과정 저장 핸들러
  const handleSaveCourse = async (courseData: Course) => {
    try {
      const token = localStorage.getItem('token');
      
      // 한글 요일 → 영어 요일 변환 (DB 스키마에 맞게)
      const dayMapReverse: { [key: string]: string } = {
        '월': 'monday',
        '화': 'tuesday',
        '수': 'wednesday',
        '목': 'thursday',
        '금': 'friday',
        '토': 'saturday',
        '일': 'sunday'
      };
      
      // schedule 변환 (dayOfWeek → day)
      // "월,수,금" → 3개의 별도 schedule 항목으로 분리
      const scheduleForDB: any[] = [];
      (courseData.schedule || []).forEach(sch => {
        // 쉼표로 구분된 요일 처리 (예: "월,수,금" → ["월", "수", "금"])
        const days = sch.dayOfWeek.split(',').map(d => d.trim());
        
        // 각 요일별로 별도의 schedule 항목 생성
        days.forEach(dayKorean => {
          const dayEnglish = dayMapReverse[dayKorean] || dayKorean;
          
          scheduleForDB.push({
            day: dayEnglish,
            startTime: sch.startTime,
            endTime: sch.endTime
          });
        });
      });
      
      if (editingCourse && editingCourse._id) {
        // ✅ 수정 - PUT 요청
        console.log('✏️ 강습 과정 수정:', courseData);
        
        const response = await fetch(`http://localhost:5000/api/courses/${editingCourse._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: courseData.name,
            description: courseData.description,
            level: courseData.level,
            duration: courseData.duration,
            price: courseData.price,
            maxStudents: courseData.maxStudents,
            schedule: scheduleForDB,
            tags: courseData.tags
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('❌ 서버 응답 에러:', errorData);
          throw new Error(errorData.error || errorData.details || 'Failed to update course');
        }
        
        const data = await response.json();
        console.log('✅ 수정 완료:', data);
        
        // 전체 목록 새로고침
        await loadCourses();
        alert('✅ 강습 과정이 수정되었습니다.');
        
      } else {
        // ✅ 추가 - POST 요청
        console.log('➕ 강습 과정 추가:', courseData);
        
        const requestBody = {
          name: courseData.name,
          description: courseData.description || '강습 과정 설명',
          level: courseData.level,
          duration: courseData.duration,
          price: courseData.price,
          maxStudents: courseData.maxStudents,
          instructorId: courseData.instructorId,
          schedule: scheduleForDB,
          tags: courseData.tags
        };
        
        console.log('📤 서버로 전송할 데이터:', requestBody);
        console.log('📅 schedule (변환됨):', scheduleForDB);
        
        const response = await fetch('http://localhost:5000/api/courses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('❌ 서버 응답 에러:', errorData);
          throw new Error(errorData.error || errorData.details || 'Failed to create course');
        }
        
        const data = await response.json();
        console.log('✅ 추가 완료:', data);
        
        // 전체 목록 새로고침
        await loadCourses();
        alert('✅ 강습 과정이 추가되었습니다.');
      }
      
    } catch (error) {
      console.error('💥 강습 과정 저장 실패:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      alert(`❌ 강습 과정 저장에 실패했습니다.\n\n${errorMessage}`);
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

      {/* 뷰 모드 토글 & 추가 버튼 */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
              viewMode === 'calendar'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Calendar className="w-4 h-4 mr-2" />
            캘린더 뷰
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <List className="w-4 h-4 mr-2" />
            리스트 뷰
          </button>
        </div>
        <button 
          onClick={handleAddCourse}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          새 과정 추가
        </button>
      </div>

      {/* 캘린더 뷰 */}
      {viewMode === 'calendar' && (
        <WeeklyCalendar
          courses={filteredCourses}
          onCourseClick={handleEditCourse}
          onEmptySlotClick={(day, time) => {
            console.log('빈 슬롯 클릭:', day, time);
            handleAddCourse(day, time); // 선택한 요일/시간 전달 ✅
          }}
        />
      )}

      {/* 리스트 뷰 */}
      {viewMode === 'list' && (
        <>
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
          </div>

          {/* 과정 테이블 */}
          <CourseTable
            courses={filteredCourses}
            onEdit={handleEditCourse}
            onDelete={handleDeleteCourse}
          />
        </>
      )}

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
