/**
 * 센터 과정 관리 - 강습 과정 카드 컴포넌트
 * 
 * 연동 파일:
 * - client/app/center-admin/courses/page.tsx
 */

import React from 'react';
import { Clock, Users, Calendar, DollarSign, Edit2, Trash2 } from 'lucide-react';

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
}

interface CourseCardProps {
  course: Course;
  levelName: string; // level1 → 입문 변환된 이름
  onEdit: (course: Course) => void;
  onDelete: (courseId: string) => void;
}

export default function CourseCard({ course, levelName, onEdit, onDelete }: CourseCardProps) {
  // 레벨별 색상
  const getLevelColor = (level: string) => {
    const colors: { [key: string]: string } = {
      'level1': 'bg-green-100 text-green-800 border-green-300',
      'level2': 'bg-blue-100 text-blue-800 border-blue-300',
      'level3': 'bg-purple-100 text-purple-800 border-purple-300',
      'level4': 'bg-orange-100 text-orange-800 border-orange-300',
      'level5': 'bg-red-100 text-red-800 border-red-300',
      'beginner': 'bg-green-100 text-green-800 border-green-300',
      'intermediate': 'bg-blue-100 text-blue-800 border-blue-300',
      'advanced': 'bg-purple-100 text-purple-800 border-purple-300'
    };
    return colors[level] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  // 상태별 색상
  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'active': 'bg-green-500',
      'inactive': 'bg-gray-400',
      'full': 'bg-yellow-500'
    };
    return colors[status] || 'bg-gray-400';
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      'active': '모집중',
      'inactive': '비활성',
      'full': '마감'
    };
    return labels[status] || status;
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden">
      {/* 상단 헤더 */}
      <div className={`p-4 ${getLevelColor(course.level)} border-b-2`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-block w-3 h-3 rounded-full ${getStatusColor(course.status)}`}></span>
              <span className="text-xs font-medium">{getStatusLabel(course.status)}</span>
            </div>
            <h3 className="text-lg font-bold mb-1">{course.name}</h3>
            <p className="text-sm opacity-80">{levelName}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(course)}
              className="p-2 hover:bg-white/30 rounded-lg transition-colors"
              title="수정"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(course._id)}
              className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
              title="삭제"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 본문 */}
      <div className="p-4 space-y-3">
        {/* 강사 */}
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <span className="font-medium">👨‍🏫</span>
          <span>{course.instructorName}</span>
        </div>

        {/* 요일 및 시간 */}
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span>
            {course.schedule.map((s, i) => (
              <span key={i}>
                {s.dayOfWeek} {s.startTime}
                {i < course.schedule.length - 1 && ', '}
              </span>
            ))}
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
          <span className="font-semibold text-blue-600">
            {course.price.toLocaleString()}원
          </span>
        </div>

        {/* 태그 */}
        {course.tags && course.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-2 border-t">
            {course.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

