/**
 * 센터 과정 관리 - 강습 과정 카드 컴포넌트
 * 
 * 연동 파일:
 * - client/app/center-admin/courses/page.tsx
 */

import React from 'react';
import { Clock, Users, Calendar, DollarSign, Edit2, Trash2, UserPlus } from 'lucide-react';
import { Card, CardContent } from '../ui';

interface Course {
  _id: string;
  name: string;
  description: string;
  level: string;
  duration: number;
  maxStudents: number;
  currentStudents: number;
  instructorId: string;
  instructorName: string;
  price: number;
  schedule: {
    dayOfWeek: string;
    startTime: string;
    endTime?: string;
  }[];
  status: 'active' | 'inactive' | 'full';
  createdAt: Date;
  tags?: string[];
  isPersonalLesson?: boolean; // ⭐ 개인레슨 여부
  poolType?: 'mainPool' | 'kidsPool' | 'auxiliaryPool'; // ⭐ 풀 타입
  lanes?: number[];
  laneInfo?: {
    assignedLanes?: number[];
    maxLanes?: number;
    laneNotes?: string;
  };
}

interface CourseCardProps {
  course: Course;
  levelName: string; // level1 → 입문 변환된 이름
  onEdit: (course: Course) => void;
  onDelete: (courseId: string) => void;
  onAssignMembers?: (course: Course) => void;
}

// 레벨 테마 (기본)
const levelThemes: Record<string, { bg: string; border: string; hoverBg: string; hoverBorder: string; title: string; chip: string }> = {
  beginner:   { bg: 'bg-green-50',  border: 'border-green-200',  hoverBg: 'hover:bg-green-100',  hoverBorder: 'hover:border-green-300',  title: 'text-green-800',  chip: 'bg-green-50 border-green-200 text-green-800' },
  intermediate:{ bg: 'bg-blue-50',   border: 'border-blue-200',   hoverBg: 'hover:bg-blue-100',   hoverBorder: 'hover:border-blue-300',   title: 'text-blue-800',   chip: 'bg-blue-50 border-blue-200 text-blue-800' },
  advanced:   { bg: 'bg-purple-50', border: 'border-purple-200', hoverBg: 'hover:bg-purple-100', hoverBorder: 'hover:border-purple-300', title: 'text-purple-800', chip: 'bg-purple-50 border-purple-200 text-purple-800' },
};

// 상태 테마 (레벨보다 우선 적용)
const statusThemes: Record<string, { bg: string; border: string; hoverBg: string; hoverBorder: string; title: string; chip: string }> = {
  full:     { bg: 'bg-yellow-50', border: 'border-yellow-200', hoverBg: 'hover:bg-yellow-100', hoverBorder: 'hover:border-yellow-300', title: 'text-yellow-800', chip: 'bg-yellow-50 border-yellow-200 text-yellow-800' },
  inactive: { bg: 'bg-gray-50',   border: 'border-gray-200',   hoverBg: 'hover:bg-gray-100',   hoverBorder: 'hover:border-gray-300',   title: 'text-gray-800',   chip: 'bg-gray-50 border-gray-200 text-gray-800' },
};

const statusDot = (status: string) => {
  const colors: Record<string, string> = {
    active: 'bg-green-500',
    inactive: 'bg-gray-400',
    full: 'bg-yellow-500',
  };
  return <span className={`inline-block w-3 h-3 rounded-full ${colors[status] || 'bg-gray-400'}`}></span>;
};

const statusLabel = (status: string) => ({ active: '모집중', inactive: '비활성', full: '마감' }[status] || status);

export default function CourseCard({ course, levelName, onEdit, onDelete, onAssignMembers }: CourseCardProps) {
  // 상태 기반 테마가 있으면 우선 적용, 없으면 레벨 테마 적용
  const theme = statusThemes[course.status] || levelThemes[course.level] || levelThemes.beginner;

  return (
    <Card className={`border-2 ${theme.border} ${theme.bg} ${theme.hoverBg} ${theme.hoverBorder} hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer`}>
      <CardContent className="p-4">
        {/* 상단 헤더 */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {statusDot(course.status)}
              <span className="text-xs font-medium">{statusLabel(course.status)}</span>
            </div>
            <h3 className={`text-lg font-bold mb-1 truncate ${theme.title}`}>{course.name}</h3>
            <p className="text-sm opacity-80 truncate">{levelName}</p>
          </div>
          <div className="flex gap-2 ml-2 shrink-0">
            <button
              onClick={() => onEdit(course)}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              title="수정"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (onAssignMembers) onAssignMembers(course);
              }}
              className="p-2 hover:bg-green-100 rounded-lg transition-colors text-green-700"
              title="회원 배정"
            >
              <UserPlus className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(course._id)}
              className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-700"
              title="삭제"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 본문 */}
        <div className="mt-3 space-y-3">
          {/* 강사 */}
          <div className="flex items-center gap-2 text-sm text-gray-700 min-w-0">
            <span className="font-medium">👨‍🏫</span>
            <span className="truncate">{course.instructorName}</span>
          </div>

          {/* 요일 및 시간 */}
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="min-w-0 break-words">
              {course.isPersonalLesson ? (
                <span className="text-purple-600">
                  개인레슨 - {course.schedule.map((s, i) => (
                    <span key={i}>
                      {s.dayOfWeek} {s.startTime}
                      {i < course.schedule.length - 1 && ', '}
                    </span>
                  ))}
                </span>
              ) : (
                course.schedule.map((s, i) => (
                  <span key={i}>
                    {s.dayOfWeek} {s.startTime}
                    {i < course.schedule.length - 1 && ', '}
                  </span>
                ))
              )}
            </span>
          </div>

          {/* 수업 시간 */}
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Clock className="w-4 h-4 text-gray-500" />
            <span>{course.duration}분</span>
          </div>

          {/* 수강생 */}
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Users className="w-4 h-4 text-gray-500" />
            <span>{course.currentStudents} / {course.maxStudents}명</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full transition-all ${
                  course.currentStudents >= course.maxStudents ? 'bg-yellow-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min((course.currentStudents / course.maxStudents) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* 가격 */}
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <DollarSign className="w-4 h-4 text-gray-500" />
            <span className="font-semibold text-blue-700">
              {course.price.toLocaleString()}원
            </span>
          </div>

          {/* 레인 정보 */}
          {((course.laneInfo?.assignedLanes && course.laneInfo.assignedLanes.length > 0) || 
            (course.lanes && course.lanes.length > 0)) && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span className="text-gray-500">
                {course.poolType === 'kidsPool' ? '👶' : course.poolType === 'auxiliaryPool' ? '🏊‍♀️' : '🏊'}
              </span>
              <span className="font-medium text-blue-700">
                {course.poolType === 'kidsPool' ? '유아풀 ' : course.poolType === 'auxiliaryPool' ? '보조풀 ' : '메인풀 '}
                {(course.laneInfo?.assignedLanes || course.lanes || []).join(', ')}레인
              </span>
            </div>
          )}

          {/* 태그 */}
          {course.tags && course.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              {course.tags.map((tag, index) => (
                <span
                  key={index}
                  className={`px-2 py-1 rounded-full text-xs border ${theme.chip}`}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

