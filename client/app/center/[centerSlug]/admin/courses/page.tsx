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
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Calendar, List, BookOpen, CreditCard } from 'lucide-react';
import withAuth from '@/components/withAuth';
import StatCard from '@/components/StatCard';
import CourseFilterButtons from '@/components/center-admin/CourseFilterButtons';
import CourseTable from '@/components/center-admin/CourseTable';
import CourseCard from '@/components/center-admin/CourseCard';
import CourseFormModal from '@/components/center-admin/CourseFormModal';
import WeeklyCalendar from '@/components/center-admin/WeeklyCalendar';
import CourseMemberAssignmentModal from '@/components/center-admin/CourseMemberAssignmentModal';
import InstructorStudentManagement from '@/components/center-admin/InstructorStudentManagement';
import PTLessonProgress from '@/components/center-admin/PTLessonProgress';
import BookingManagementContent from '../../../center-admin/courses/booking-management-content';

// Course 타입 정의 (서버 모델과 일치)
type Course = {
  _id?: string;
  name: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced' | string;
  duration: number; // minutes
  maxStudents: number;
  currentStudents: number;
  instructorId: string;
  instructorName: string;
  price: number;
  schedule: Array<{
    dayOfWeek?: string;
    day?: string;
    startTime: string;
    endTime?: string;
    lanes?: {
      assignedLanes?: number[];
      originalAssignedLanes?: number[];
      isAdjusted?: boolean;
    };
  }>;
  status: 'active' | 'inactive' | 'full';
  createdAt?: Date;
  tags?: string[];
  poolType?: 'mainPool' | 'kidsPool' | 'auxiliaryPool';
  lanes?: number[];
  laneInfo?: {
    assignedLanes?: number[];
    maxLanes?: number;
    laneNotes?: string;
  };
  courseType?: 'group' | 'personal' | 'freeSwim';
  isPersonalLesson?: boolean;
  enrolledStudents?: Array<{
    studentId: string;
    studentName: string;
    status: 'active' | 'inactive' | 'completed' | 'cancelled';
    enrolledAt?: Date;
    completedAt?: Date;
  }>;
  startDate?: Date | string;
  endDate?: Date | string;
}

function CoursesManagement() {
  const { user } = useAuth();
  
  // 권한 확인 - 페이지 렌더링 전에 체크
  // center@swim.com 계정도 센터 관리자로 인식
  const isCenterAdmin = user && (
    ['centerAdmin', 'center-admin', 'superAdmin'].includes(user.userType) ||
    user.email === 'center@swim.com'
  );
  
  if (!isCenterAdmin) {
    // 권한이 없는 사용자는 게스트 버전의 화면으로 리다이렉트
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
    return null;
  }
  
  // === 강의 관리 상태 ===
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [showMemberAssignmentModal, setShowMemberAssignmentModal] = useState(false);
  const [assignmentCourse, setAssignmentCourse] = useState<Course | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [schedules, setSchedules] = useState<any[]>([]); // 확정된 스케줄 데이터
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar'); // 캘린더/리스트 뷰 토글
  const [activeTab, setActiveTab] = useState<'courses' | 'bookings'>('courses'); // 탭 상태
  const [instructors, setInstructors] = useState<{ _id: string; name: string; userId?: string }[]>([]);
  const [customLevels, setCustomLevels] = useState([
    { id: 'level1', name: '입문', description: '수영을 처음 시작하는 단계', order: 1 },
    { id: 'level2', name: '초급', description: '기본 영법을 배우는 단계', order: 2 },
    { id: 'level3', name: '중급', description: '영법을 다듬는 단계', order: 3 },
    { id: 'level4', name: '상급', description: '고급 기술을 익히는 단계', order: 4 },
    { id: 'level5', name: '마스터', description: '전문가 수준', order: 5 }
  ]);

  // === PT 관리 상태 ===
  const [showStudentManagement, setShowStudentManagement] = useState(false);
  const [showLessonProgress, setShowLessonProgress] = useState(false);
  const [selectedInstructorId, setSelectedInstructorId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');

  // PT 관리 핸들러 함수들
  const handleManageStudents = (instructorId: string) => {
    setSelectedInstructorId(instructorId);
    setShowStudentManagement(true);
  };

  const handleManageLessons = (instructorId: string, date: string) => {
    setSelectedInstructorId(instructorId);
    setSelectedDate(date);
    setShowLessonProgress(true);
  };

  // ⭐ 센터 정보 상태 추가
  const [centerInfo, setCenterInfo] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadCourses();
      loadInstructors();
      loadSchedules();
      loadCenterInfo();
    }
  }, [user]);

  // ⭐ 센터 정보 로드 함수
  const loadCenterInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/center-admin/center-info', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('🏢 센터 정보:', {
          personalLesson: data.data?.availabilitySettings?.personalLesson,
          freeSwim: data.data?.availabilitySettings?.freeSwim
        });
        setCenterInfo(data.data);
      }
    } catch (error) {
      console.error('💥 센터 정보 로드 실패:', error);
    }
  };

  const loadCourses = async () => {
    try {
      setIsLoading(true);
      
      // ✅ 센터 관리자용 API 호출
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('❌ 토큰이 없습니다. 로그인이 필요합니다.');
        throw new Error('토큰이 없습니다. 로그인이 필요합니다.');
      }
      
      // 토큰 디코딩해서 내용 확인
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
        }
      } catch (e) {
        console.error('❌ 토큰 디코딩 실패:', e);
      }
      
      const response = await fetch('http://localhost:5000/api/center-admin/courses', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }
      
      const data = await response.json();
      console.log('📡 강습 과정 목록 API 응답:', data);
      
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
        console.log('🔄 강습 과정 변환 전:', {
          _id: course._id,
          name: course.name,
          instructorId: course.instructorId,
          instructorName: course.instructorName,
          instructor: course.instructor,
          lanes: course.lanes,
          poolType: course.poolType,
          laneInfo: course.laneInfo
        });
        // schedule 필드 안전하게 처리 & 영어 → 한글 변환
        let schedule = [];
        if (Array.isArray(course.schedule) && course.schedule.length > 0) {
          // ⭐ 각 스케줄 항목을 개별적으로 변환 (요일별로 분리)
          schedule = course.schedule.map((sch: any) => {
            const dayEnglish = sch.day || sch.dayOfWeek || '';
            const dayKorean = dayMap[dayEnglish.toLowerCase()] || dayEnglish;
            const startTime = sch.startTime || '09:00';
            const endTime = sch.endTime || '';
            
            return {
              dayOfWeek: dayKorean,
              startTime,
              endTime,
              day: dayEnglish, // ⭐ 원본 영어 요일 추가
              lanes: sch.lanes // ⭐ 레인 정보 추가
            };
          });
        }
        
        // 개인레슨 여부 확인
        const isPersonalLesson = course.isPersonalLesson || course.courseType === 'personal' || course.name?.includes('개인');
        
        const transformedCourse = {
          _id: course._id,
          name: course.name || '제목 없음',
          description: course.description || '',
          level: course.level || 'beginner',
          duration: course.duration || 60,
          maxStudents: course.maxStudents || 10,
          currentStudents: course.enrolledStudents?.filter((e: any) => e.status === 'active').length || 0,
          instructorId: course.instructorId?._id || course.instructorId || course.instructor?._id || course.instructor,
          instructorName: course.instructorId?.name || course.instructorName || course.instructor?.name || '강사 미배정',
          instructor: course.instructorId || course.instructor, // ⭐ instructor 필드 추가
          price: course.price || 0,
          schedule: schedule,
          status: course.isActive === false ? 'inactive' : 
                  (course.enrolledStudents?.filter((e: any) => e.status === 'active').length >= course.maxStudents ? 'full' : 'active'),
          createdAt: new Date(course.createdAt),
          tags: course.tags || [],
          // ⭐ 레인 정보 추가
          poolType: course.poolType,
          lanes: course.lanes,
          laneInfo: course.laneInfo,
          // ⭐ 개인레슨 여부 추가
          isPersonalLesson: isPersonalLesson,
          // ⭐ 과정 타입 추가
          courseType: course.courseType || (isPersonalLesson ? 'personal' : 'group')
        };
        
        console.log('✅ 강습 과정 변환 후:', {
          _id: transformedCourse._id,
          name: transformedCourse.name,
          instructorId: transformedCourse.instructorId,
          instructorName: transformedCourse.instructorName,
          lanes: transformedCourse.lanes,
          poolType: transformedCourse.poolType,
          laneInfo: transformedCourse.laneInfo
        });
        
        return transformedCourse;
      });
      
      setCourses(coursesData);
      
      // 📊 통계 정보 출력
      
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

  // 강사 목록 로드
  const loadInstructors = async () => {
    try {
      console.log('👨‍🏫 강사 목록 로드 시작');
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('❌ 토큰이 없습니다. 로그인이 필요합니다.');
        return;
      }
      
      const response = await fetch('http://localhost:5000/api/center-admin/instructors', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        console.error('❌ 강사 목록 로드 실패:', response.status, response.statusText);
        return;
      }
      
      const data = await response.json();
      console.log('👨‍🏫 강사 목록 API 응답:', data);
      
      // 강사 데이터 변환 (_id, name, instructorType 포함)
      const rawInstructors = data.data?.instructors || data.instructors || data.data || data || [];
      console.log('👨‍🏫 원본 강사 데이터:', rawInstructors);
      
      // rawInstructors가 배열인지 확인
      if (!Array.isArray(rawInstructors)) {
        console.error('❌ 강사 데이터가 배열이 아닙니다:', rawInstructors);
        setInstructors([]);
        return;
      }
      
      const instructorList = rawInstructors
        .map((instructor: any) => ({
          _id: instructor._id,
          name: instructor.name || instructor.userId || '이름 없음',
          userId: instructor.userId,
          instructorType: instructor.instructorInfo?.instructorType || 'instructor' // ⭐ 강사 종류
        }))
        .sort((a, b) => a.name.localeCompare(b.name, 'ko-KR')); // ⭐ 가나다순 정렬
      
      console.log('👨‍🏫 변환된 강사 목록:', instructorList);
      setInstructors(instructorList);
      
    } catch (error) {
      console.error('💥 강사 목록 로드 오류:', error);
    }
  };

  // 확정된 스케줄 로드
  const loadSchedules = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/center-admin/schedules', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        console.error('❌ 스케줄 로드 실패');
        return;
      }
      
      const data = await response.json();
      if (data.success) {
        // 확정된 스케줄만 필터링
        const confirmedSchedules = data.data.filter((schedule: any) => schedule.status === 'confirmed');
        setSchedules(confirmedSchedules);
      }
    } catch (error) {
      console.error('💥 스케줄 로드 오류:', error);
    }
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

  // 레벨 ID → 레벨 이름 변환 함수
  const getLevelName = (levelId: string): string => {
    const level = customLevels.find(l => l.id === levelId);
    if (level) return level.name;
    
    // 기존 레벨 처리
    const defaultLevels: { [key: string]: string } = {
      'beginner': '초급',
      'intermediate': '중급',
      'advanced': '고급'
    };
    return defaultLevels[levelId] || levelId;
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

  // 필터링된 과정 목록 (레인 순서대로 정렬)
  const filteredCourses = courses.filter(course => {
    if (activeFilter === 'all') return true;
    
    // 사용자 정의 태그 필터링 (우선순위)
    if (course.tags?.includes(activeFilter)) {
      return true;
    }
    
    // 시간대 필터
    const timeCategory = getTimeCategory(course.schedule[0]?.startTime || '');
    return timeCategory === activeFilter;
  }).sort((a, b) => {
    // ⭐ 레인 순서대로 정렬
    const aLanes = a.laneInfo?.assignedLanes || a.lanes || [];
    const bLanes = b.laneInfo?.assignedLanes || b.lanes || [];
    
    // 첫 번째 레인 번호로 비교
    const aFirstLane = aLanes.length > 0 ? aLanes[0] : 999;
    const bFirstLane = bLanes.length > 0 ? bLanes[0] : 999;
    
    return aFirstLane - bFirstLane;
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
    // 개인레슨이 아닌 경우에만 편집 모달 열기
    if (!course.isPersonalLesson) {
      setEditingCourse(course);
      setIsModalOpen(true);
    } else {
      // 개인레슨인 경우 회원 배정 모달 열기
      handleOpenMemberAssignment(course);
    }
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

  // 회원 배정 모달 열기
  const handleOpenMemberAssignment = (course: Course) => {
    console.log('🎯 handleOpenMemberAssignment 호출됨:', course);
    setAssignmentCourse(course);
    setShowMemberAssignmentModal(true);
    console.log('🎯 회원 배정 모달 상태 업데이트:', {
      assignmentCourse: course,
      showMemberAssignmentModal: true
    });
  };

  // 회원 배정 실행
  const handleAssignMembers = async (memberIds: string[]) => {
    if (!assignmentCourse) return;

    try {
      const token = localStorage.getItem('token');
      
      console.log('📝 회원 배정 시작:', {
        memberIds: memberIds,
        courseId: assignmentCourse._id,
        courseName: assignmentCourse.name
      });
      
      // 각 회원을 순차적으로 배정
      for (const memberId of memberIds) {
        console.log(`📝 회원 ${memberId} 배정 중...`);
        
        const response = await fetch(`http://localhost:5000/api/center-admin/members/${memberId}/course`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ courseId: assignmentCourse._id })
        });

        console.log(`📝 회원 ${memberId} 배정 응답:`, {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error(`❌ 회원 ${memberId} 배정 실패:`, errorData);
          throw new Error(errorData.message || '회원 배정에 실패했습니다.');
        }
        
        console.log(`✅ 회원 ${memberId} 배정 성공`);
      }

      alert(`${memberIds.length}명의 회원이 성공적으로 배정되었습니다.`);
      loadCourses(); // 강습 과정 목록 새로고침
    } catch (error) {
      console.error('회원 배정 오류:', error);
      alert(`회원 배정 중 오류가 발생했습니다: ${error.message}`);
    }
  };

  // 과정 저장 핸들러
  const handleSaveCourse = async (courseData: any) => {
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
      
      console.log('🔍 courseData.schedule:', courseData.schedule);
      
      if (!courseData.schedule || courseData.schedule.length === 0) {
        console.error('❌ schedule이 비어있습니다!');
        throw new Error('요일과 시간을 선택해주세요.');
      }
      
      (courseData.schedule || []).forEach(sch => {
        console.log('🔍 schedule 변환:', sch);
        // 쉼표로 구분된 요일 처리 (예: "월,수,금" → ["월", "수", "금"])
        const days = ((sch as any).dayOfWeek || (sch as any).day || '').split(',').map((d: string) => d.trim()).filter((d: string) => d);
        
        console.log('📅 변환된 days:', days);
        
        if (days.length === 0) {
          console.error('❌ 요일이 비어있습니다!');
          return;
        }
        
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
      
      console.log('📋 최종 scheduleForDB:', scheduleForDB);
      
      if (scheduleForDB.length === 0) {
        console.error('❌ scheduleForDB가 비어있습니다!');
        throw new Error('요일과 시간을 올바르게 선택해주세요.');
      }
      
      if (editingCourse && editingCourse._id) {
        // ✅ 수정 - PUT 요청
        const updateData = {
          name: courseData.name,
          description: courseData.description,
          level: courseData.level,
          duration: courseData.duration,
          price: courseData.price,
          maxStudents: courseData.maxStudents,
          instructorId: courseData.instructorId, // ⭐ 강사 ID 추가
          schedule: scheduleForDB,
          tags: courseData.tags,
          poolType: courseData.poolType, // ⭐ 풀 타입 추가
          lanes: courseData.lanes, // ⭐ 레인 배열 추가
          laneInfo: courseData.laneInfo // ⭐ 레인 정보 추가
        };
        
        console.log('🎯 강습 과정 수정 요청 시작');
        console.log('📋 courseData:', courseData);
        console.log('🏊 courseData.lanes:', courseData.lanes);
        console.log('🏊 courseData.poolType:', courseData.poolType);
        console.log('🏊 courseData.laneInfo:', courseData.laneInfo);
        console.log('🚀 전송할 updateData:', updateData);
        
        const response = await fetch(`http://localhost:5000/api/courses/${editingCourse._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(updateData)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('❌ 서버 응답 에러:', errorData);
          throw new Error(errorData.error || errorData.details || 'Failed to update course');
        }
        
        const data = await response.json();
        console.log('✅ 수정 완료 응답:', data);
        console.log('🏊 응답의 laneInfo:', data.data?.laneInfo || data.course?.laneInfo);
        
        // 전체 목록 새로고침
        await loadCourses();
        alert('✅ 강습 과정이 수정되었습니다.');
        
      } else {
        // ✅ 추가 - POST 요청
        const requestBody = {
          name: courseData.name,
          description: courseData.description || '강습 과정 설명',
          level: courseData.level,
          duration: courseData.duration,
          price: courseData.price,
          maxStudents: courseData.maxStudents,
          instructorId: courseData.instructorId,
          instructorName: courseData.instructorName, // ⭐ 강사 이름 추가
          schedule: scheduleForDB,
          tags: courseData.tags,
          poolType: courseData.poolType, // ⭐ 풀 타입 추가
          lanes: courseData.lanes, // ⭐ 레인 배열 추가
          laneInfo: courseData.laneInfo, // ⭐ 레인 정보 추가
          courseType: courseData.courseType || 'group', // ⭐ 과정 타입 추가
          isPersonalLesson: courseData.isPersonalLesson || false, // ⭐ 개인레슨 여부 추가
          startDate: (courseData as any).startDate, // ⭐ 시작일 추가
          endDate: (courseData as any).endDate // ⭐ 종료일 추가
        };
        
        console.log('📡 강습 과정 생성 요청:', requestBody);
        
        const response = await fetch('http://localhost:5000/api/courses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(requestBody)
        });
        
        console.log('📡 응답 상태:', response.status);
        
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
          📚 센터 강의 관리
        </h1>
        <p className="text-gray-600">센터의 강의와 예약·결제를 한 곳에서 관리하세요</p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('courses')}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'courses'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              강의 관리
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'bookings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              예약·결제 관리
            </button>
          </nav>
        </div>
      </div>

      {/* 예약·결제 관리 탭 */}
      {activeTab === 'bookings' && (
        <BookingManagementContent />
      )}

      {/* 강의 관리 탭 */}
      {activeTab === 'courses' && (
        <>
      {/* 통계 카드 */}
          <div className="grid grid-cols-1 min-[600px]:grid-cols-2 lg:grid-cols-6 gap-3 md:gap-6 mb-8">
        <StatCard
          icon="📚"
          title="총 과정"
          value={`${courses.filter(c => !c.isPersonalLesson).length}개`}
          color="blue"
        />
        <StatCard
          icon="👥"
          title="총 학생"
          value={`${courses.filter(c => !c.isPersonalLesson).reduce((sum, course) => sum + course.currentStudents, 0)}명`}
          color="green"
        />
        <StatCard
          icon="⭐"
          title="활성 과정"
          value={`${courses.filter(course => course.status === 'active' && !course.isPersonalLesson).length}개`}
          color="yellow"
        />
        <StatCard
          icon="⏸️"
          title="비활성"
          value={`${courses.filter(course => course.status === 'inactive' && !course.isPersonalLesson).length}개`}
          color="red"
        />
        <StatCard
          icon="🔒"
          title="마감"
          value={`${courses.filter(course => course.status === 'full' && !course.isPersonalLesson).length}개`}
          color="indigo"
        />
        <StatCard
          icon="👤"
          title="개인레슨"
          value={`${courses.filter(course => course.isPersonalLesson).length}개`}
          color="orange"
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
          onClick={() => handleAddCourse()}
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
          schedules={schedules} // 확정된 스케줄 데이터 전달
          onCourseClick={handleEditCourse}
          onEmptySlotClick={(day, time) => {
            console.log('빈 슬롯 클릭:', day, time);
            handleAddCourse(day, time); // 선택한 요일/시간 전달 ✅
          }}
          personalLessonAvailability={centerInfo?.availabilitySettings?.personalLesson} // ⭐ 개인레슨 운영시간 전달
          freeSwimAvailability={centerInfo?.availabilitySettings?.freeSwim} // ⭐ 자유수영 운영시간 전달
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

          {/* 과정 목록 헤더 */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              강습 과정 목록 ({filteredCourses.length}개)
            </h3>
          </div>

          {/* 과정 카드 그리드 - 반응형 */}
          {(() => {
            console.log('🔍 filteredCourses 확인:', {
              filteredCoursesLength: filteredCourses.length,
              filteredCourses: filteredCourses,
              coursesLength: courses.length,
              courses: courses
            });
            return filteredCourses.length > 0;
          })() ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course._id || Math.random()}
                  course={course as any}
                  levelName={getLevelName(course.level)}
                  onEdit={handleEditCourse}
                  onDelete={handleDeleteCourse}
                  onAssignMembers={handleOpenMemberAssignment}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-lg">표시할 강습 과정이 없습니다.</p>
              <button
                onClick={() => handleAddCourse()}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                첫 과정 추가하기
              </button>
            </div>
          )}
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
        course={editingCourse as any}
        instructors={instructors}
        customLevels={allLevels}
        onAssignMembers={handleOpenMemberAssignment}
      />

      {/* 회원 배정 모달 */}
      <CourseMemberAssignmentModal
        isOpen={showMemberAssignmentModal}
        onClose={() => {
          setShowMemberAssignmentModal(false);
          setAssignmentCourse(null);
        }}
        course={assignmentCourse as any}
        onAssignMembers={handleAssignMembers}
      />

      {/* PT 관리 컴포넌트들 */}
      {showStudentManagement && (
        <InstructorStudentManagement
          instructorId={selectedInstructorId}
          onClose={() => setShowStudentManagement(false)}
          onManageLessons={handleManageLessons}
        />
      )}

      {showLessonProgress && (
        <PTLessonProgress
          instructorId={selectedInstructorId}
          selectedDate={selectedDate}
          onClose={() => setShowLessonProgress(false)}
          onBack={() => {
            setShowLessonProgress(false);
            setShowStudentManagement(true);
          }}
        />
      )}
        </>
      )}
    </div>
  );
}

export default withAuth(CoursesManagement, { 
  requireTypes: ['centerAdmin', 'superAdmin'] 
});
