/**
 * 센터 운영 스케줄 캘린더 컴포넌트
 * 
 * 연동 데이터:
 * - 센터 운영 시간 설정
 * - 강사별 개인레슨 스케줄
 * - 단체 수업 스케줄
 * - 점검/정비 스케줄
 * 
 * 연동 컴포넌트:
 * - client/app/center-admin/schedule/page.tsx
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Edit, Trash2, Clock, Users, Settings, AlertCircle } from 'lucide-react';

interface ScheduleItem {
  _id: string;
  type: 'operating_hours' | 'instructor_schedule' | 'group_class' | 'maintenance';
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  instructorId?: string;
  instructorName?: string;
  maxStudents?: number;
  currentStudents?: number;
  poolType: 'mainPool' | 'kidsPool' | 'auxiliaryPool';
  status: 'confirmed' | 'tentative' | 'cancelled';
  color: string;
  isRecurring: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  notes?: string;
  dayOfWeek?: string;
  day?: string;
}

interface ScheduleCalendarProps {
  schedules: ScheduleItem[];
  onScheduleClick?: (schedule: ScheduleItem) => void;
  onAddSchedule?: (date: string, time: string) => void;
  onEditSchedule?: (schedule: ScheduleItem) => void;
  onDeleteSchedule?: (scheduleId: string) => void;
}

const DAYS_OF_WEEK = ['월', '화', '수', '목', '금', '토', '일'];
const TIME_SLOTS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
];

export default function ScheduleCalendar({
  schedules,
  onScheduleClick,
  onAddSchedule,
  onEditSchedule,
  onDeleteSchedule
}: ScheduleCalendarProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');


  // 현재 주의 날짜들 계산
  const getWeekDates = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // 월요일 시작
    startOfWeek.setDate(diff);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      week.push(date);
    }
    return week;
  };

  const weekDates = getWeekDates(currentDate);

  // 특정 날짜와 시간에 해당하는 스케줄 가져오기
  const getSchedulesForSlot = (date: Date, timeSlot: string) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = DAYS_OF_WEEK[date.getDay() === 0 ? 6 : date.getDay() - 1];
    
    return schedules.filter(schedule => {
      const scheduleDate = schedule.date || '';
      const scheduleDay = schedule.dayOfWeek || schedule.day || '';
      const scheduleTime = schedule.startTime || '';
      
      // 날짜 매칭 (정확한 날짜 또는 요일)
      const dateMatch = scheduleDate === dateStr || 
                       scheduleDay === dayOfWeek ||
                       scheduleDay.toLowerCase() === dayOfWeek.toLowerCase();
      
      // 시간 매칭
      const timeMatch = scheduleTime === timeSlot ||
                       scheduleTime.split(':')[0] === timeSlot.split(':')[0];
      
      return dateMatch && timeMatch;
    });
  };

  // 스케줄 타입별 색상
  const getScheduleColor = (type: string) => {
    switch (type) {
      case 'operating_hours': return 'bg-green-100 border-green-400 text-green-800';
      case 'instructor_schedule': return 'bg-blue-100 border-blue-400 text-blue-800';
      case 'group_class': return 'bg-purple-100 border-purple-400 text-purple-800';
      case 'maintenance': return 'bg-red-100 border-red-400 text-red-800';
      default: return 'bg-gray-100 border-gray-400 text-gray-800';
    }
  };

  // 스케줄 타입별 아이콘
  const getScheduleIcon = (type: string) => {
    switch (type) {
      case 'operating_hours': return <Clock className="w-3 h-3" />;
      case 'instructor_schedule': return <Users className="w-3 h-3" />;
      case 'group_class': return <Users className="w-3 h-3" />;
      case 'maintenance': return <Settings className="w-3 h-3" />;
      default: return <AlertCircle className="w-3 h-3" />;
    }
  };

  // 이전/다음 주 이동
  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* 캘린더 헤더 */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900">스케줄 캘린더</h2>
            <div className="text-sm text-gray-500">
              주간 뷰
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateWeek('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-gray-900 min-w-[120px] text-center">
              {weekDates[0].toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })} - {weekDates[6].toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
            </span>
            <button
              onClick={() => navigateWeek('next')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 캘린더 그리드 */}
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* 시간 헤더 */}
          <thead>
            <tr>
              <th className="w-16 p-2 text-xs font-medium text-gray-500 border-b">시간</th>
              {DAYS_OF_WEEK.map((day, index) => (
                <th key={day} className="w-32 p-2 text-xs font-medium text-gray-500 border-b border-l">
                  <div className="text-center">
                    <div>{day}</div>
                    <div className="text-xs text-gray-400">
                      {weekDates[index].getDate()}일
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          
          {/* 시간 슬롯 */}
          <tbody>
            {TIME_SLOTS.map(timeSlot => (
              <tr key={timeSlot}>
                {/* 시간 라벨 */}
                <td className="p-2 text-xs text-gray-600 border-b border-r text-center">
                  {timeSlot}
                </td>
                
                {/* 요일별 셀 */}
                {DAYS_OF_WEEK.map((day, dayIndex) => {
                  const date = weekDates[dayIndex];
                  const schedulesInSlot = getSchedulesForSlot(date, timeSlot);
                  const isEmpty = schedulesInSlot.length === 0;

                  return (
                    <td
                      key={`${day}-${timeSlot}`}
                      className={`p-1 border-b border-l min-h-[60px] ${
                        isEmpty ? 'hover:bg-blue-50 cursor-pointer' : ''
                      }`}
                      onClick={() => {
                        if (isEmpty && onAddSchedule) {
                          onAddSchedule(date.toISOString().split('T')[0], timeSlot);
                        }
                      }}
                    >
                      {isEmpty ? (
                        <div className="h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <Plus className="w-4 h-4 text-blue-400" />
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {schedulesInSlot.map(schedule => (
                            <div
                              key={schedule._id}
                              className={`p-2 rounded border-l-2 ${getScheduleColor(schedule.type)} cursor-pointer hover:shadow-md transition-shadow`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onScheduleClick?.(schedule);
                              }}
                            >
                              <div className="flex items-center space-x-1 mb-1">
                                {getScheduleIcon(schedule.type)}
                                <span className="text-xs font-medium truncate">
                                  {schedule.title}
                                </span>
                              </div>
                              <div className="text-xs text-gray-600">
                                {schedule.startTime} - {schedule.endTime}
                              </div>
                              {schedule.instructorName && (
                                <div className="text-xs text-gray-500 truncate">
                                  강사: {schedule.instructorName}
                                </div>
                              )}
                              {schedule.maxStudents && (
                                <div className="text-xs text-gray-500">
                                  {schedule.currentStudents || 0}/{schedule.maxStudents}명
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 범례 */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex items-center space-x-6 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-100 border border-green-400 rounded"></div>
            <span>운영시간</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-100 border border-blue-400 rounded"></div>
            <span>강사 스케줄</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-100 border border-purple-400 rounded"></div>
            <span>단체 수업</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-100 border border-red-400 rounded"></div>
            <span>점검/정비</span>
          </div>
        </div>
      </div>
    </div>
  );
}
