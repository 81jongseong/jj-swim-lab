/**
 * 🗓️ JJ Swim Lab - 주간 캘린더 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 센터 강습 과정을 주간 캘린더 형식으로 시각화
 * - 시간대별, 요일별 강습 일정 표시
 * - 같은 시간대에 여러 강사의 강습 표시 지원
 * 
 * 🔄 **주요 기능**
 * - 주간 그리드 뷰 (시간 x 요일)
 * - 강습 과정 카드 표시 (강사명, 과정명, 학생수)
 * - 🎨 **동적 색상 시스템**: 급수명 기반 자동 색상 생성 (12가지 팔레트)
 * - 📱 **반응형 레이아웃**: 모바일/태블릿(세로 스택) / 데스크톱(가로 스크롤)
 * - 클릭 시 상세 정보 표시
 * - 빈 슬롯 클릭 시 새 강습 추가
 * 
 * 🎨 **색상 규칙**
 * - 급수명을 해시하여 일관된 색상 할당
 * - 같은 급수는 항상 같은 색상
 * - 센터 커스텀 급수도 자동 색상 할당
 * - 12가지 색상 팔레트: blue, green, purple, pink, orange, red, indigo, cyan, teal, emerald, violet, rose
 * 
 * 🗄️ **데이터 연동**
 * - client/app/center-admin/courses/page.tsx (부모 컴포넌트)
 * - Course 타입 (schedule 필드)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 같은 시간에 여러 강사 표시 - 반응형 레이아웃
 *    - 모바일/태블릿: flex-col (세로 스택)
 *    - 데스크톱(lg): flex-row (가로 스크롤)
 * 2. 시간대 겹침 처리 - 쉼표로 구분된 요일 지원 ("월,수,금")
 * 3. 색상 일관성 - getLevelColor 함수로 자동 할당
 * 4. 스크롤 최적화 - overflow-y-auto (모바일), overflow-x-auto (데스크톱)
 */

'use client';

import React, { useState } from 'react';
import { Clock, User, Users } from 'lucide-react';

interface CourseSchedule {
  dayOfWeek?: string;
  day?: string; // ⭐ day 필드 지원
  startTime: string;
  endTime?: string;
  lanes?: { // ⭐ 스케줄별 레인 정보
    assignedLanes?: number[];
    originalAssignedLanes?: number[];
    isAdjusted?: boolean;
  };
}

interface Course {
  _id: string;
  name: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  maxStudents: number;
  currentStudents: number;
  instructorId: string;
  instructorName: string;
  price: number;
  schedule: CourseSchedule[];
  status: 'active' | 'inactive' | 'full';
  tags?: string[];
  // ⭐ 레인 정보 추가
  poolType?: 'mainPool' | 'kidsPool' | 'auxiliaryPool';
  lanes?: number[];
  laneInfo?: {
    assignedLanes?: number[];
    originalAssignedLanes?: number[];
    minLanes?: number;
    maxLanes?: number;
    laneNotes?: string;
  };
  courseType?: 'group' | 'personal' | 'freeSwim';
  isPersonalLesson?: boolean;
}

interface WeeklyCalendarProps {
  courses: Course[];
  schedules?: any[]; // 확정된 스케줄 데이터
  onCourseClick?: (course: Course) => void;
  onEmptySlotClick?: (day: string, time: string) => void;
  personalLessonAvailability?: { // ⭐ 개인레슨 운영시간 (센터 설정에서)
    dayTimeSlots?: Array<{
      day: string; // 'monday', 'tuesday', etc.
      timeSlots: Array<{
        startTime: string;
        endTime: string;
      }>;
    }>;
  };
  freeSwimAvailability?: { // ⭐ 자유수영 운영시간 (센터 설정에서)
    dayTimeSlots?: Array<{
      day: string; // 'monday', 'tuesday', etc.
      timeSlots: Array<{
        startTime: string;
        endTime: string;
      }>;
    }>;
  };
}

const DAYS_OF_WEEK = ['월', '화', '수', '목', '금', '토', '일'];
const DAY_MAP: { [key: string]: string } = {
  '월': 'monday',
  '화': 'tuesday',
  '수': 'wednesday',
  '목': 'thursday',
  '금': 'friday',
  '토': 'saturday',
  '일': 'sunday',
  'monday': '월',
  'tuesday': '화',
  'wednesday': '수',
  'thursday': '목',
  'friday': '금',
  'saturday': '토',
  'sunday': '일'
};

// 06:00 ~ 22:00 (1시간 단위)
const TIME_SLOTS = Array.from({ length: 16 }, (_, i) => {
  const hour = i + 6;
  return `${hour.toString().padStart(2, '0')}:00`;
});

// 색상 팔레트 (12가지) - 급수별로 자동 할당
const COLOR_PALETTE = [
  'bg-blue-100 border-blue-400 text-blue-800',
  'bg-green-100 border-green-400 text-green-800',
  'bg-purple-100 border-purple-400 text-purple-800',
  'bg-pink-100 border-pink-400 text-pink-800',
  'bg-orange-100 border-orange-400 text-orange-800',
  'bg-red-100 border-red-400 text-red-800',
  'bg-indigo-100 border-indigo-400 text-indigo-800',
  'bg-cyan-100 border-cyan-400 text-cyan-800',
  'bg-teal-100 border-teal-400 text-teal-800',
  'bg-emerald-100 border-emerald-400 text-emerald-800',
  'bg-violet-100 border-violet-400 text-violet-800',
  'bg-rose-100 border-rose-400 text-rose-800',
];

/**
 * 급수명을 기반으로 일관된 색상 생성
 * - 같은 급수는 항상 같은 색상
 * - 간단한 해시 함수로 색상 팔레트에서 선택
 * 
 * 예: "초급" → 항상 같은 색상
 *     "중급" → 항상 같은 색상
 *     "커스텀 급수1" → 항상 같은 색상
 */
const getLevelColor = (level: string): string => {
  // 특정 급수들에 대해 명시적으로 다른 색상 할당
  const levelColorMap: { [key: string]: number } = {
    '기초': 0,           // 파란색
    '자유형 기초반': 1,   // 초록색
    '배영 중급반': 2,     // 보라색
    '평영 고급반': 3,     // 핑크색
    'level1': 0,         // 파란색
    'level2': 1,         // 초록색
    'level3': 2,         // 보라색
    'beginner': 0,       // 파란색
    'intermediate': 2,    // 보라색
    'advanced': 3,       // 핑크색
    // 한글 레벨 추가
    '초급': 0,           // 파란색
    '중급': 1,           // 초록색
    '고급': 2,           // 보라색
    '전문가': 3,          // 핑크색
    '마스터': 4,          // 주황색
  };
  
  // 명시적으로 정의된 급수가 있으면 해당 색상 사용
  if (levelColorMap[level] !== undefined) {
    const index = levelColorMap[level];
    return COLOR_PALETTE[index];
  }
  
  // ⭐ 직접 입력한 급수들에 대해 고유한 색상 할당
  // 더 나은 해시 함수 사용 (문자열 길이와 내용을 모두 고려)
  let hash = 0;
  for (let i = 0; i < level.length; i++) {
    hash = ((hash << 5) - hash) + level.charCodeAt(i) + i; // 위치 정보도 포함
    hash = hash & hash; // 32bit integer로 변환
  }
  
  // 해시에 문자열 길이도 추가하여 더 나은 분산
  hash = hash + level.length * 1000;
  
  const index = Math.abs(hash) % COLOR_PALETTE.length;
  
  return COLOR_PALETTE[index];
};

export default function WeeklyCalendar({
  courses,
  schedules = [],
  onCourseClick,
  onEmptySlotClick,
  personalLessonAvailability,
  freeSwimAvailability
}: WeeklyCalendarProps) {

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // ⭐ 개인레슨 운영시간에 해당하는 슬롯인지 확인
  const isPersonalLessonSlotAvailable = (day: string, timeSlot: string): boolean => {
    if (!personalLessonAvailability?.dayTimeSlots || personalLessonAvailability.dayTimeSlots.length === 0) {
      return false;
    }
    
    const dayEnglish = DAY_MAP[day]?.toLowerCase();
    
    // 요일별로 확인
    for (const daySlot of personalLessonAvailability.dayTimeSlots) {
      if (daySlot.day === dayEnglish || daySlot.day === day) {
        // 해당 요일의 시간대 중에 현재 시간이 포함되는지 확인
        for (const timeRange of daySlot.timeSlots) {
          const slotTime = timeSlot.split(':').map(Number);
          const startTime = timeRange.startTime.split(':').map(Number);
          const endTime = timeRange.endTime.split(':').map(Number);
          
          const slotMinutes = slotTime[0] * 60 + slotTime[1];
          const startMinutes = startTime[0] * 60 + startTime[1];
          const endMinutes = endTime[0] * 60 + endTime[1];
          
          // 시간대에 포함되면 true
          if (slotMinutes >= startMinutes && slotMinutes < endMinutes) {
            return true;
          }
        }
      }
    }
    
    return false;
  };

  // ⭐ 자유수영 운영시간에 해당하는 슬롯인지 확인
  const isFreeSwimSlotAvailable = (day: string, timeSlot: string): boolean => {
    if (!freeSwimAvailability?.dayTimeSlots || freeSwimAvailability.dayTimeSlots.length === 0) {
      return false;
    }
    
    const dayEnglish = DAY_MAP[day]?.toLowerCase();
    
    // 요일별로 확인
    for (const daySlot of freeSwimAvailability.dayTimeSlots) {
      if (daySlot.day === dayEnglish || daySlot.day === day) {
        // 해당 요일의 시간대 중에 현재 시간이 포함되는지 확인
        for (const timeRange of daySlot.timeSlots) {
          const slotTime = timeSlot.split(':').map(Number);
          const startTime = timeRange.startTime.split(':').map(Number);
          const endTime = timeRange.endTime.split(':').map(Number);
          
          const slotMinutes = slotTime[0] * 60 + slotTime[1];
          const startMinutes = startTime[0] * 60 + startTime[1];
          const endMinutes = endTime[0] * 60 + endTime[1];
          
          // 시간대에 포함되면 true
          if (slotMinutes >= startMinutes && slotMinutes < endMinutes) {
            return true;
          }
        }
      }
    }
    
    return false;
  };

  // 레인 충돌 감지 및 재배치 로직 (클라이언트 계산)
  const detectLaneConflicts = (courses: Course[]): Course[] => {
    // 개인레슨 찾기 (강사 배정된 경우만)
    const activePersonalLessons = courses.filter(course => {
      if (!course.isPersonalLesson) return false;
      const isUnassigned = !course.instructorName || 
                          course.instructorName === '강사 미배정' || 
                          course.instructorName === '센터 관리자';
      return !isUnassigned && course.instructorId && course.instructorId !== '' && course.instructorId !== 'unassigned';
    });
    
    // 개인레슨이 없으면 원본 반환
    if (activePersonalLessons.length === 0) {
      return courses;
    }
    
    // 개인레슨 레인 찾기
    const personalLessonLane = activePersonalLessons[0].lanes?.[0] || activePersonalLessons[0].laneInfo?.assignedLanes?.[0] || 1;
    
    // 단체반들의 레인 조정 (UI 표시용, DB 변경 없음)
    return courses.map(course => {
      // 개인레슨은 그대로
      if (course.isPersonalLesson) {
        return course;
      }
      
      // 단체반의 레인 조정: 개인레슨 레인보다 크거나 같은 레인은 모두 이동
      const originalLanes = course.lanes || course.laneInfo?.assignedLanes || [];
      const hasAnyLaneAbovePersonal = originalLanes.some(lane => lane >= personalLessonLane);
      
      if (hasAnyLaneAbovePersonal) {
        // 개인레슨 레인보다 크거나 같은 레인은 모두 1칸씩 뒤로 이동
        const adjustedLanes = originalLanes.map(lane => {
          if (lane >= personalLessonLane) {
            return lane + 1;
          }
          return lane;
        });
        
        // 조정된 레인으로 임시 복사본 생성
        return {
          ...course,
          lanes: adjustedLanes,
          adjustedLanes: adjustedLanes // 조정된 레인 표시
        };
      }
      
      // 개인레슨 레인보다 작은 레인만 있는 경우 그대로
      return course;
    });
  };

  // 특정 시간대, 요일에 해당하는 강습들 찾기 (레인 순서대로 정렬)
  const getCoursesForSlot = (day: string, timeSlot: string): Course[] => {
    const dayEnglish = DAY_MAP[day]?.toLowerCase();
    
    const filteredCourses = courses.filter(course => {
      // ⭐ 모든 수업(개인레슨, 단체 수업 모두) schedule에서 확인
      if (!course.schedule || course.schedule.length === 0) {
        return false;
      }
      
      return course.schedule.some(sch => {
        // dayOfWeek 또는 day, startTime이 없으면 스킵
        const schDay = sch.dayOfWeek || sch.day; // ⭐ dayOfWeek 또는 day 사용
        if (!schDay || !sch.startTime) {
          return false;
        }
        
        let schDays = schDay;
        const schTime = sch.startTime;
        
        // 쉼표로 구분된 요일 처리 (예: "월,수,금")
        const daysList = schDays.split(',').map(d => d.trim());
        
        // 요일 매칭 (여러 요일 지원)
        const dayMatch = daysList.some(schDay => {
          const schDayLower = schDay.toLowerCase();
          return schDayLower === dayEnglish || 
                 schDayLower === day.toLowerCase() || 
                 DAY_MAP[schDay] === day ||
                 DAY_MAP[schDayLower] === day;
        });
        
        // 시간 매칭 (정확한 시간 비교)
        // timeSlot: "10:00", schTime: "10:00" → true
        // timeSlot: "10:00", schTime: "19:00" → false
        const slotHour = timeSlot.split(':')[0];
        const schHour = schTime.split(':')[0];
        const timeMatch = slotHour === schHour;
        
        return dayMatch && timeMatch;
      });
    });
    
    // 레인 충돌 감지 및 재배치
    const resolvedCourses = detectLaneConflicts(filteredCourses);

    // ⭐ 레인 순서대로 정렬 (조정된 레인 사용)
    return resolvedCourses.sort((a, b) => {
      // 조정된 레인 또는 원본 레인 사용
      const aLanes = (a as any).adjustedLanes || a.lanes || [];
      const bLanes = (b as any).adjustedLanes || b.lanes || [];
      
      // 첫 번째 레인 번호로 비교
      const aFirstLane = aLanes.length > 0 ? aLanes[0] : 999;
      const bFirstLane = bLanes.length > 0 ? bLanes[0] : 999;
      
      return aFirstLane - bFirstLane;
    });
  };

  // 확정된 스케줄을 가져오는 함수
  const getSchedulesForSlot = (day: string, timeSlot: string): any[] => {
    const dayEnglish = DAY_MAP[day]?.toLowerCase();
    
    return schedules.filter(schedule => {
      // 요일 매칭
      const dayMatch = schedule.dayOfWeek === dayEnglish || 
                      schedule.dayOfWeek === day ||
                      schedule.dayOfWeek?.toLowerCase() === dayEnglish;
      
      // 시간 매칭
      const timeMatch = schedule.startTime === timeSlot ||
                       schedule.startTime?.split(':')[0] === timeSlot.split(':')[0];
      
      return dayMatch && timeMatch;
    });
  };

  const handleSlotClick = (day: string, time: string, coursesInSlot: Course[]) => {
    if (coursesInSlot.length === 0) {
      // 빈 슬롯 - 새 강습 추가
      onEmptySlotClick?.(day, time);
    } else if (coursesInSlot.length === 1) {
      // 강습 1개 - 바로 상세보기
      onCourseClick?.(coursesInSlot[0]);
    } else {
      // 여러 강습 - 선택 UI 표시
      // TODO: 다중 선택 모달 구현
      onCourseClick?.(coursesInSlot[0]);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Clock className="w-6 h-6 mr-2" />
          주간 강습 캘린더
        </h2>
        <p className="text-blue-100 text-sm mt-1">시간대별 강습 일정을 한눈에 확인하세요</p>
      </div>

      {/* 캘린더 그리드 */}
      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          {/* 요일 헤더 */}
          <div className="grid grid-cols-8 border-b bg-gray-50">
            <div className="p-3 text-center font-semibold text-gray-600 border-r">
              시간
            </div>
            {DAYS_OF_WEEK.map(day => (
              <div key={day} className="p-3 text-center font-semibold text-gray-900 border-r last:border-r-0">
                {day}요일
              </div>
            ))}
          </div>

          {/* 시간대별 행 */}
          {TIME_SLOTS.map(timeSlot => (
            <div key={timeSlot} className="grid grid-cols-8 border-b hover:bg-gray-50">
              {/* 시간 라벨 */}
              <div className="p-3 text-center font-medium text-gray-600 border-r bg-gray-50">
                <Clock className="w-4 h-4 inline mr-1 text-gray-400" />
                {timeSlot}
              </div>

              {/* 요일별 셀 */}
              {DAYS_OF_WEEK.map(day => {
                const coursesInSlot = getCoursesForSlot(day, timeSlot);
                const schedulesInSlot = getSchedulesForSlot(day, timeSlot);
                const isEmpty = coursesInSlot.length === 0 && schedulesInSlot.length === 0;
                const hasFreeSwim = isFreeSwimSlotAvailable(day, timeSlot);
                const hasPersonalLesson = isPersonalLessonSlotAvailable(day, timeSlot);

                return (
                  <div
                    key={`${day}-${timeSlot}`}
                    className={`p-2 border-r last:border-r-0 min-h-[80px] cursor-pointer transition-colors relative ${
                      isEmpty 
                        ? 'hover:bg-blue-50' 
                        : 'hover:bg-gray-100'
                    } ${
                      hasFreeSwim && !isEmpty ? 'bg-blue-50/30' : ''
                    } ${
                      hasPersonalLesson && !isEmpty && !hasFreeSwim ? 'bg-amber-50/30' : ''
                    }`}
                    style={{
                      borderRight: hasFreeSwim && !isEmpty ? '2px dashed #60a5fa' : undefined,
                      borderTop: hasFreeSwim && !isEmpty ? '2px dashed #60a5fa' : undefined,
                      borderLeft: hasPersonalLesson && !isEmpty && !hasFreeSwim ? '2px dashed #f59e0b' : undefined,
                      borderBottom: hasPersonalLesson && !isEmpty && !hasFreeSwim ? '2px dashed #f59e0b' : undefined,
                    }}
                    onClick={() => handleSlotClick(day, timeSlot, coursesInSlot)}
                  >
                    {isEmpty ? (
                      // 빈 슬롯 - 개인레슨/자유수영 운영시간 표시
                      <div className={`h-full flex flex-col items-center justify-center transition-opacity ${
                        isPersonalLessonSlotAvailable(day, timeSlot) || isFreeSwimSlotAvailable(day, timeSlot)
                          ? 'border-2 border-dashed rounded' 
                          : 'opacity-0 hover:opacity-100'
                      } ${
                        isFreeSwimSlotAvailable(day, timeSlot)
                          ? 'bg-blue-50 border-blue-400'
                          : isPersonalLessonSlotAvailable(day, timeSlot)
                          ? 'bg-amber-50 border-amber-400'
                          : ''
                      }`}>
                        {isFreeSwimSlotAvailable(day, timeSlot) ? (
                          <div className="text-xs text-blue-600 font-medium">🏊 자유수영 시간</div>
                        ) : isPersonalLessonSlotAvailable(day, timeSlot) ? (
                          <div className="text-xs text-amber-600 font-medium">⏰ 개인레슨 시간</div>
                        ) : null}
                      </div>
                    ) : (
                      // 강습 및 스케줄 표시 (여러 개 가능)
                      // 반응형: 모바일/태블릿(세로 스택) / 데스크톱(가로 스크롤)
                      <div className={`
                        ${(coursesInSlot.length + schedulesInSlot.length) > 1 
                          ? 'flex flex-col lg:flex-row gap-1 overflow-y-auto lg:overflow-y-visible lg:overflow-x-auto max-h-[200px] lg:max-h-none' 
                          : ''
                        }
                      `}>
                        {/* 확정된 스케줄 표시 */}
                        {schedulesInSlot.map(schedule => (
                          <div
                            key={`schedule-${schedule._id}`}
                            className="p-2 rounded border-l-4 bg-blue-50 border-blue-400 cursor-pointer hover:shadow-md transition-shadow"
                          >
                            <div className="text-xs font-semibold mb-1 truncate text-blue-800" title={schedule.title}>
                              📅 {schedule.title}
                            </div>
                            <div className="text-xs text-blue-600">
                              {schedule.type === 'operating_hours' && '운영시간'}
                              {schedule.type === 'instructor_schedule' && `강사: ${schedule.instructorName || '미배정'}`}
                              {schedule.type === 'group_class' && `단체수업: ${schedule.maxStudents || 0}명`}
                              {schedule.type === 'maintenance' && '점검/정비'}
                            </div>
                            {schedule.notes && (
                              <div className="text-xs text-gray-500 mt-1 truncate">
                                {schedule.notes}
                              </div>
                            )}
                          </div>
                        ))}
                        {coursesInSlot.map(course => {
                          // ⭐ 강사 미배정 개인레슨인지 확인 
                          // instructorName이 '강사 미배정' 또는 '센터 관리자'이면 미배정으로 처리
                          const isUnassignedPersonalLesson = course.isPersonalLesson && 
                            (!course.instructorName || 
                             course.instructorName === '강사 미배정' || 
                             course.instructorName === '센터 관리자' ||
                             !course.instructorId || 
                             course.instructorId === '' || 
                             course.instructorId === 'unassigned');
                          
                          return (
                          <div
                            key={course._id}
                            className={`p-2 rounded border-l-4 relative ${
                              isUnassignedPersonalLesson 
                                ? 'bg-gray-100 border-gray-400 opacity-50' // 회색으로 표시
                                : course.courseType === 'freeSwim'
                                  ? 'bg-blue-100 border-blue-400 text-blue-800' // 자유수영은 파란색 (테두리 파란색)
                                  : course.isPersonalLesson
                                    ? 'bg-amber-100 border-amber-400 text-amber-800' // 개인레슨은 노란색 (테두리 노란색)
                                    : getLevelColor(course.level)
                            } cursor-pointer hover:shadow-md transition-shadow ${
                              coursesInSlot.length > 1 ? 'min-w-0 lg:min-w-[140px]' : ''
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onCourseClick?.(course);
                            }}
                          >
                            {/* 가능시간 배지 표시 */}
                            {hasFreeSwim && (
                              <div className="absolute top-1 right-1 flex items-center gap-1">
                                <div className="px-1.5 py-0.5 bg-blue-500/80 text-white text-[10px] rounded-full font-medium whitespace-nowrap">
                                  🏊 자유수영
                                </div>
                              </div>
                            )}
                            {hasPersonalLesson && !hasFreeSwim && (
                              <div className="absolute top-1 right-1 flex items-center gap-1">
                                <div className="px-1.5 py-0.5 bg-amber-500/80 text-white text-[10px] rounded-full font-medium whitespace-nowrap">
                                  ⏰ 개인레슨
                                </div>
                              </div>
                            )}
                            <div className={`text-xs font-semibold mb-1 truncate ${isUnassignedPersonalLesson ? 'text-gray-500' : ''} ${hasFreeSwim || hasPersonalLesson ? 'pr-16' : ''}`} title={course.name}>
                              {course.name}
                              {isUnassignedPersonalLesson && ' (미배정)'}
                            </div>
                            <div className="flex items-center text-xs text-gray-600">
                              <User className="w-3 h-3 mr-1" />
                              <span className="truncate">{course.instructorName || '강사 미배정'}</span>
                            </div>
                            <div className="flex items-center text-xs text-gray-600 mt-1">
                              <Users className="w-3 h-3 mr-1" />
                              <span>{course.currentStudents}/{course.maxStudents}명</span>
                            </div>
                            {/* 자유수영/개인레슨 표시 */}
                            {course.courseType === 'freeSwim' && (
                              <div className="flex items-center text-xs text-blue-600 mt-1">
                                <span className="mr-1">🏊</span>
                                <span>자유수영</span>
                              </div>
                            )}
                            {course.isPersonalLesson && (
                              <div className="flex items-center text-xs text-amber-600 mt-1">
                                <span className="mr-1">👤</span>
                                <span>개인레슨</span>
                              </div>
                            )}
                            {/* 레인 정보 (스케줄별) */}
                            {(() => {
                              // 현재 시간 슬롯에 해당하는 스케줄 찾기
                              const dayEnglish = DAY_MAP[day]?.toLowerCase();
                              const slotHour = timeSlot.split(':')[0];
                              const matchingSchedule = course.schedule?.find(sch => {
                                const schDay = sch.dayOfWeek || sch.day; // ⭐ dayOfWeek 또는 day 사용
                                const schDays = schDay?.split(',').map(d => d.trim()) || [];
                                const dayMatch = schDays.some(schDay => {
                                  const schDayLower = schDay.toLowerCase();
                                  return schDayLower === dayEnglish || 
                                         schDayLower === day.toLowerCase() || 
                                         DAY_MAP[schDay] === day ||
                                         DAY_MAP[schDayLower] === day;
                                });
                                const schHour = sch.startTime?.split(':')[0];
                                const timeMatch = schHour === slotHour;
                                return dayMatch && timeMatch;
                              });
                              
                              // 조정된 레인 우선 사용, 없으면 스케줄별 레인 정보, 없으면 기본 레인 정보
                              const adjustedLanes = (course as any).adjustedLanes;
                              const lanes = adjustedLanes || 
                                          matchingSchedule?.lanes?.assignedLanes || 
                                          course.laneInfo?.assignedLanes || 
                                          course.lanes || [];
                              
                              return lanes.length > 0 ? (
                                <div className="flex items-center text-xs text-blue-600 mt-1">
                                  <span className="mr-1">🏊</span>
                                  <span className="font-medium">
                                    {lanes.join(',')}레인
                                  </span>
                                </div>
                              ) : null;
                            })()}
                            {course.status === 'full' && (
                              <div className="text-xs bg-red-500 text-white px-1 py-0.5 rounded mt-1 inline-block">
                                마감
                              </div>
                            )}
                          </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* 범례 */}
      <div className="bg-gray-50 px-6 py-4 border-t">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700">🎨 색상 규칙:</span>
            <span className="text-gray-600">급수별 자동 색상 (12가지 팔레트)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700">📱 반응형:</span>
            <span className="text-gray-600">모바일 세로 / 데스크톱 가로</span>
          </div>
          <div className="ml-auto text-xs text-gray-500">
            💡 클릭하여 상세보기 / 빈 슬롯 클릭하여 추가
          </div>
        </div>
        {/* 색상 샘플 */}
        <div className="mt-3 flex flex-wrap gap-2">
          {COLOR_PALETTE.slice(0, 6).map((colorClass, idx) => (
            <div key={idx} className={`px-2 py-1 rounded border-l-4 ${colorClass} text-xs`}>
              샘플 {idx + 1}
            </div>
          ))}
          <div className="text-xs text-gray-500 self-center">
            ... 총 12가지 색상
          </div>
        </div>
      </div>
    </div>
  );
}

