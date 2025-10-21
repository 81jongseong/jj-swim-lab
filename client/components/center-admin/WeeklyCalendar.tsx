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
  dayOfWeek: string;
  startTime: string;
  endTime?: string;
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
}

interface WeeklyCalendarProps {
  courses: Course[];
  onCourseClick?: (course: Course) => void;
  onEmptySlotClick?: (day: string, time: string) => void;
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
  // 문자열을 숫자로 변환 (간단한 해시)
  let hash = 0;
  for (let i = 0; i < level.length; i++) {
    hash = level.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // 32bit integer로 변환
  }
  
  // 해시를 색상 팔레트 인덱스로 변환 (0~11)
  const index = Math.abs(hash) % COLOR_PALETTE.length;
  
  return COLOR_PALETTE[index];
};

export default function WeeklyCalendar({ 
  courses, 
  onCourseClick,
  onEmptySlotClick 
}: WeeklyCalendarProps) {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // 특정 시간대, 요일에 해당하는 강습들 찾기
  const getCoursesForSlot = (day: string, timeSlot: string): Course[] => {
    const dayEnglish = DAY_MAP[day]?.toLowerCase();
    
    return courses.filter(course => {
      // schedule이 없거나 비어있으면 스킵
      if (!course.schedule || course.schedule.length === 0) {
        return false;
      }
      
      return course.schedule.some(sch => {
        // dayOfWeek나 startTime이 없으면 스킵
        if (!sch.dayOfWeek || !sch.startTime) {
          return false;
        }
        
        let schDays = sch.dayOfWeek;
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
        
        // 디버그 로깅 (배영 중급반 확인)
        if (course.name.includes('배영') && dayMatch) {
          console.log(`🔍 ${course.name} - ${day} ${timeSlot}:`, {
            dayMatch,
            timeMatch,
            schDays,
            schTime,
            slotHour,
            schHour
          });
        }
        
        return dayMatch && timeMatch;
      });
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
                const isEmpty = coursesInSlot.length === 0;

                return (
                  <div
                    key={`${day}-${timeSlot}`}
                    className={`p-2 border-r last:border-r-0 min-h-[80px] cursor-pointer transition-colors ${
                      isEmpty 
                        ? 'hover:bg-blue-50' 
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => handleSlotClick(day, timeSlot, coursesInSlot)}
                  >
                    {isEmpty ? (
                      // 빈 슬롯
                      <div className="h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-xs text-gray-400">+ 추가</span>
                      </div>
                    ) : (
                      // 강습 표시 (여러 개 가능)
                      // 반응형: 모바일/태블릿(세로 스택) / 데스크톱(가로 스크롤)
                      <div className={`
                        ${coursesInSlot.length > 1 
                          ? 'flex flex-col lg:flex-row gap-1 overflow-y-auto lg:overflow-y-visible lg:overflow-x-auto max-h-[200px] lg:max-h-none' 
                          : ''
                        }
                      `}>
                        {coursesInSlot.map(course => (
                          <div
                            key={course._id}
                            className={`p-2 rounded border-l-4 ${getLevelColor(course.level)} cursor-pointer hover:shadow-md transition-shadow ${
                              coursesInSlot.length > 1 ? 'min-w-0 lg:min-w-[140px]' : ''
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onCourseClick?.(course);
                            }}
                          >
                            <div className="text-xs font-semibold mb-1 truncate" title={course.name}>
                              {course.name}
                            </div>
                            <div className="flex items-center text-xs text-gray-600">
                              <User className="w-3 h-3 mr-1" />
                              <span className="truncate">{course.instructorName}</span>
                            </div>
                            <div className="flex items-center text-xs text-gray-600 mt-1">
                              <Users className="w-3 h-3 mr-1" />
                              <span>{course.currentStudents}/{course.maxStudents}명</span>
                            </div>
                            {course.status === 'full' && (
                              <div className="text-xs bg-red-500 text-white px-1 py-0.5 rounded mt-1 inline-block">
                                마감
                              </div>
                            )}
                          </div>
                        ))}
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

