/**
 * 강사 스케줄 카드 컴포넌트
 * 
 * 연동되는 데이터:
 * - instructor: 강사 정보 객체
 * - onClick: 카드 클릭 이벤트
 * 
 * 연동되는 파일:
 * - 사용하는 페이지: admin/instructor-management 등
 */

'use client';

import React from 'react';

interface Instructor {
  id: number;
  name: string;
  center: string;
  rating: number;
  students: number;
}

interface InstructorScheduleCardProps {
  instructor: Instructor;
  onClick?: () => void;
}

export default function InstructorScheduleCard({ instructor, onClick }: InstructorScheduleCardProps) {
  return (
    <div 
      className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer hover:border-blue-400"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900 text-lg">{instructor.name}</h4>
        <span className="text-sm text-gray-600 bg-blue-50 px-2 py-1 rounded">{instructor.center}</span>
      </div>
      
      <div className="space-y-2 text-sm text-gray-600 mb-3">
        <div className="flex items-center">
          <span className="text-blue-600 mr-2">🕐</span>
          <p>오전 10:00 - 11:00 (초급반)</p>
        </div>
        <div className="flex items-center">
          <span className="text-green-600 mr-2">🕑</span>
          <p>오후 2:00 - 3:00 (중급반)</p>
        </div>
        <div className="flex items-center">
          <span className="text-purple-600 mr-2">🕓</span>
          <p>오후 4:00 - 5:00 (고급반)</p>
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-xs text-gray-500 bg-yellow-50 px-2 py-1 rounded">⭐ {instructor.rating}/5.0</span>
          <span className="text-xs text-gray-500 bg-purple-50 px-2 py-1 rounded">👥 {instructor.students}명</span>
        </div>
      </div>
    </div>
  );
}


