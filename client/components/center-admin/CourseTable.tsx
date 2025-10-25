/**
 * 센터 과정 관리 - 과정 테이블 컴포넌트
 * 
 * 연동 파일:
 * - client/app/center-admin/courses/page.tsx
 */

import React from 'react';
import { Edit, Trash2, Users } from 'lucide-react';

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
  schedule: {
    dayOfWeek: string;
    startTime: string;
    endTime?: string;
  }[];
  status: 'active' | 'inactive' | 'full';
  createdAt: Date;
  tags?: string[];
}

interface CourseTableProps {
  courses: Course[];
  onEdit: (course: Course) => void;
  onDelete: (courseId: string) => void;
  onAssignMembers: (course: Course) => void;
}

const getLevelLabel = (level: string): string => {
  const levels: { [key: string]: string } = {
    'beginner': '초급',
    'intermediate': '중급',
    'advanced': '고급'
  };
  return levels[level] || level;
};

const getLevelColor = (level: string): string => {
  const colors: { [key: string]: string } = {
    'beginner': 'bg-green-100 text-green-800',
    'intermediate': 'bg-blue-100 text-blue-800',
    'advanced': 'bg-purple-100 text-purple-800'
  };
  return colors[level] || 'bg-gray-100 text-gray-800';
};

const getStatusLabel = (status: string): string => {
  return status === 'active' ? '활성' : '비활성';
};

const getStatusColor = (status: string): string => {
  return status === 'active' 
    ? 'bg-green-100 text-green-800' 
    : 'bg-red-100 text-red-800';
};

export default function CourseTable({ courses, onEdit, onDelete, onAssignMembers }: CourseTableProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                과정명
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                난이도
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                강사
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                일정
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                수강인원
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                수업시간
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                가격
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상태
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                액션
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {courses.map((course) => (
              <tr key={course._id} className="hover:bg-gray-50">
                {/* 과정명 */}
                <td className="px-6 py-4 max-w-xs">
                  <div>
                    <div 
                      className="text-sm font-medium text-gray-900 truncate" 
                      title={course.name}
                    >
                      {course.name}
                    </div>
                    <div 
                      className="text-xs text-gray-500 truncate" 
                      title={course.description}
                    >
                      {course.description}
                    </div>
                  </div>
                </td>
                
                {/* 난이도 */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(course.level)}`}>
                    {getLevelLabel(course.level)}
                  </span>
                </td>
                
                {/* 강사 */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {course.instructorName}
                </td>
                
                {/* 일정 */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {course.schedule && course.schedule.length > 0 ? (
                    <div>
                      <div>{course.schedule[0].dayOfWeek}</div>
                      <div className="text-xs text-gray-500">{course.schedule[0].startTime}</div>
                      {course.schedule.length > 1 && (
                        <div className="text-xs text-gray-400">+{course.schedule.length - 1}개</div>
                      )}
                    </div>
                  ) : '-'}
                </td>
                
                {/* 수강인원 */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center">
                    <span className="font-semibold">{course.currentStudents}</span>
                    <span className="text-gray-500 mx-1">/</span>
                    <span className="text-gray-500">{course.maxStudents}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {Math.round((course.currentStudents / course.maxStudents) * 100)}% 수강
                  </div>
                </td>
                
                {/* 수업시간 */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {course.duration}분
                </td>
                
                {/* 가격 */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {course.price.toLocaleString()}원
                </td>
                
                {/* 상태 */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(course.status)}`}>
                    {getStatusLabel(course.status)}
                  </span>
                </td>
                
                {/* 액션 */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => onEdit(course)}
                      className="text-blue-600 hover:text-blue-900"
                      title="수정"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onAssignMembers(course)}
                      className="text-green-600 hover:text-green-900"
                      title="회원 배정"
                    >
                      <Users className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onDelete(course._id)}
                      className="text-red-600 hover:text-red-900"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {courses.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <p className="text-gray-500 text-lg">표시할 과정이 없습니다.</p>
        </div>
      )}
    </div>
  );
}

