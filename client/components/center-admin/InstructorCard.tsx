/**
 * 센터 강사 관리 - 강사 카드 컴포넌트
 * 
 * 연동 파일:
 * - client/app/center-admin/instructors/page.tsx
 */

import React from 'react';
import { Users, Mail, Phone, Star, Edit, Trash2 } from 'lucide-react';

interface Instructor {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  experience: number;
  rating: number;
  specialties: string[];
  certifications: string[];
  status: 'active' | 'inactive' | 'pending';
  joinedAt: Date;
  totalStudents: number;
  totalClasses: number;
  instructorInfo?: {
    instructorType?: 'instructor' | 'lifeguard'; // ⭐ 강사 종류
    experience?: string;
    specialties?: string[];
    certifications?: string[];
    instructorLevel?: string;
    currentStudents?: number;
    totalStudents?: number;
    totalClasses?: number;
  };
}

interface InstructorCardProps {
  instructor: Instructor;
  onEdit?: (instructor: Instructor) => void;
  onDelete?: (instructorId: string) => void;
}

// 상태 라벨 및 색상 유틸리티 함수
const getStatusLabel = (status: string): string => {
  const statuses: { [key: string]: string } = {
    'active': '활성',
    'inactive': '비활성',
    'pending': '승인대기'
  };
  return statuses[status] || status;
};

const getStatusColor = (status: string): string => {
  const colors: { [key: string]: string } = {
    'active': 'bg-green-100 text-green-800',
    'inactive': 'bg-red-100 text-red-800',
    'pending': 'bg-yellow-100 text-yellow-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

// 별점 렌더링 함수
const renderStars = (rating: number) => {
  return Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={`w-4 h-4 ${
        i < Math.floor(rating) 
          ? 'text-yellow-400 fill-current' 
          : 'text-gray-300'
      }`}
    />
  ));
};

export default function InstructorCard({ 
  instructor, 
  onEdit, 
  onDelete 
}: InstructorCardProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-4">
        {/* 헤더: 이름, 경력, 상태 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <span className="text-white text-lg">👨‍🏫</span>
            </div>
            <div className="ml-3">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-gray-900">{instructor.name}</h3>
                {/* 강사 종류 뱃지 */}
                {instructor.instructorInfo?.instructorType === 'lifeguard' ? (
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800">
                    🛟 안전요원
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    🏊 강습
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {instructor.experience || instructor.instructorInfo?.experience || '경력 미입력'}
              </p>
            </div>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(instructor.status || 'active')}`}>
            {getStatusLabel(instructor.status || 'active')}
          </span>
        </div>

        <div className="space-y-2">
          {/* 이메일 */}
          <div className="flex items-center">
            <Mail className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">{instructor.email}</span>
          </div>
          
          {/* 전화번호 */}
          {instructor.phone && (
            <div className="flex items-center">
              <Phone className="w-4 h-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">{instructor.phone}</span>
            </div>
          )}
          
          {/* 평점 */}
          <div className="flex items-center">
            <div className="flex mr-2">
              {renderStars(instructor.rating || 0)}
            </div>
            <span className="text-sm text-gray-600">({(instructor.rating || 0).toFixed(1)})</span>
          </div>

          {/* 전문분야 */}
          <div>
            <p className="text-xs font-medium text-gray-700 mb-1">전문분야</p>
            <div className="flex flex-wrap gap-1">
              {(instructor.specialties || instructor.instructorInfo?.specialties || []).slice(0, 3).map((specialty, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded"
                >
                  {specialty}
                </span>
              ))}
              {(instructor.specialties || instructor.instructorInfo?.specialties || []).length > 3 && (
                <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                  +{(instructor.specialties || instructor.instructorInfo?.specialties || []).length - 3}
                </span>
              )}
            </div>
          </div>

          {/* 자격증 */}
          <div>
            <p className="text-xs font-medium text-gray-700 mb-1">자격증</p>
            <div className="space-y-0.5">
              {(instructor.certifications || instructor.instructorInfo?.certifications || []).slice(0, 2).map((cert, index) => (
                <span
                  key={index}
                  className="block text-xs text-gray-600"
                >
                  • {cert}
                </span>
              ))}
              {(instructor.certifications || instructor.instructorInfo?.certifications || []).length > 2 && (
                <span className="block text-xs text-gray-500">
                  • +{(instructor.certifications || instructor.instructorInfo?.certifications || []).length - 2}개 더보기
                </span>
              )}
            </div>
          </div>

          {/* 통계 */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t">
            <div className="text-center">
              <p className="text-base font-semibold text-gray-900">
                {instructor.totalStudents || instructor.instructorInfo?.currentStudents || 0}
              </p>
              <p className="text-xs text-gray-500">담당 학생</p>
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-gray-900">
                {instructor.totalClasses || 0}
              </p>
              <p className="text-xs text-gray-500">진행 수업</p>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex space-x-2 pt-2 border-t">
            <button 
              onClick={() => onEdit?.(instructor)}
              className="flex-1 px-2 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <Edit className="w-3 h-3 mr-1" />
              수정
            </button>
            <button 
              onClick={() => onDelete?.(instructor._id)}
              className="flex-1 px-2 py-1.5 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

