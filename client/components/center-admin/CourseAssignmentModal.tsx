import { logger } from '@/lib/logger';
import React, { useState } from 'react';
import { Modal } from '@/components/ui';
import { Button } from '@/components/ui';

interface Course {
  _id: string;
  name: string;
  level: string;
  instructorName?: string;
  schedule?: Array<{
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  }>;
}

interface Member {
  _id: string;
  name: string;
  currentCourses?: Array<{
    courseName: string;
    courseType: string;
    instructorName: string;
    status: string;
  }>;
}

interface CourseAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  courses: Course[];
  onAssign: (memberId: string, courseId: string) => Promise<void>;
}

export default function CourseAssignmentModal({ 
  isOpen, 
  onClose, 
  member, 
  courses, 
  onAssign 
}: CourseAssignmentModalProps) {
  const [selectedCourse, setSelectedCourse] = useState('');
  const [assignmentMemo, setAssignmentMemo] = useState('');

  if (!isOpen || !member) return null;

  const handleAssign = async () => {
    if (!selectedCourse) {
      alert('과정을 선택해주세요.');
      return;
    }
    
    try {
      await onAssign(member._id, selectedCourse);
      setSelectedCourse('');
      setAssignmentMemo('');
    } catch (error) {
      logger.error('과정 배정 오류:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            🎯 {member.name} 회원 과정 배정
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">현재 수강 중인 과정</h4>
          {member.currentCourses && member.currentCourses.length > 0 ? (
            <div className="space-y-2">
              {member.currentCourses.map((course, index) => (
                <div key={index} className="bg-white rounded p-2">
                  <p className="font-medium">{course.courseName}</p>
                  <p className="text-sm text-gray-600">
                    {course.courseType === 'group' ? '단체반' : '개인레슨'} | {course.instructorName}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">현재 수강 중인 과정이 없습니다.</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">새 과정 배정</label>
          <select 
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">과정을 선택하세요</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.name} ({course.level}) - {course.instructorName || '미배정'}
                {course.schedule && course.schedule.length > 0 && (
                  ` - ${course.schedule[0].dayOfWeek} ${course.schedule[0].startTime}-${course.schedule[0].endTime}`
                )}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">배정 메모</label>
          <textarea
            value={assignmentMemo}
            onChange={(e) => setAssignmentMemo(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            rows={3}
            placeholder="과정 배정 관련 메모를 입력하세요..."
          />
        </div>
        </div>
        
        {/* 버튼 */}
        <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleAssign}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            배정하기
          </button>
        </div>
      </div>
    </div>
  );
}
