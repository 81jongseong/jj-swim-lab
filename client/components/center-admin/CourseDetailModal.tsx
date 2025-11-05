/**
 * 센터 과정 관리 - 강습 과정 상세 정보 모달 (읽기 전용)
 * 
 * 연동 파일:
 * - client/app/center-admin/courses/page.tsx
 */

import React from 'react';
import { X, Clock, Users, Calendar, DollarSign, User, MapPin, Tag } from 'lucide-react';

interface Course {
  _id?: string;
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
    dayOfWeek?: string;
    day?: string;
    startTime: string;
    endTime?: string;
    lanes?: {
      assignedLanes?: number[];
      originalAssignedLanes?: number[];
      isAdjusted?: boolean;
    };
  }[];
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
}

interface CourseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
  levelName?: string;
}

const getLevelColor = (level: string): string => {
  const colors: { [key: string]: string } = {
    'beginner': 'bg-green-100 text-green-800',
    'intermediate': 'bg-blue-100 text-blue-800',
    'advanced': 'bg-purple-100 text-purple-800'
  };
  return colors[level] || 'bg-gray-100 text-gray-800';
};

const getStatusLabel = (status: string): string => {
  return status === 'active' ? '모집중' : status === 'inactive' ? '비활성' : '마감';
};

const getStatusColor = (status: string): string => {
  return status === 'active' 
    ? 'bg-green-100 text-green-800' 
    : status === 'inactive'
    ? 'bg-gray-100 text-gray-800'
    : 'bg-yellow-100 text-yellow-800';
};

export default function CourseDetailModal({ isOpen, onClose, course, levelName }: CourseDetailModalProps) {
  if (!isOpen || !course) return null;

  const poolTypeLabel = course.poolType === 'kidsPool' 
    ? '유아풀' 
    : course.poolType === 'auxiliaryPool' 
    ? '보조풀' 
    : '메인풀';

  const lanes = course.laneInfo?.assignedLanes || course.lanes || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">강습 과정 상세 정보</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 본문 */}
        <div className="p-6 space-y-6">
          {/* 기본 정보 */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{course.name}</h3>
                <p className="text-gray-600">{course.description || '설명 없음'}</p>
              </div>
              <div className="flex gap-2 ml-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(course.level)}`}>
                  {levelName || course.level}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(course.status)}`}>
                  {getStatusLabel(course.status)}
                </span>
              </div>
            </div>
          </div>

          {/* 강사 정보 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-700">
              <User className="w-5 h-5 text-gray-500" />
              <span className="font-medium">강사:</span>
              <span>{course.instructorName || '강사 미배정'}</span>
            </div>
          </div>

          {/* 일정 정보 */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              수업 일정
            </h4>
            <div className="space-y-2">
              {course.schedule && course.schedule.length > 0 ? (
                course.schedule.map((sch, index) => (
                  <div key={index} className="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          {sch.dayOfWeek || sch.day || '요일 미지정'}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {sch.startTime} {sch.endTime ? `- ${sch.endTime}` : ''}
                        </div>
                      </div>
                      {sch.lanes?.assignedLanes && sch.lanes.assignedLanes.length > 0 && (
                        <div className="text-sm text-blue-700 font-medium">
                          {sch.lanes.assignedLanes.join(', ')}레인
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">일정 정보가 없습니다.</p>
              )}
            </div>
          </div>

          {/* 수강 인원 정보 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-700 mb-2">
                <Users className="w-5 h-5 text-gray-500" />
                <span className="font-medium">수강 인원</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {course.currentStudents} / {course.maxStudents}명
              </div>
              <div className="mt-2 bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full transition-all ${
                    course.currentStudents >= course.maxStudents ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min((course.currentStudents / course.maxStudents) * 100, 100)}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {Math.round((course.currentStudents / course.maxStudents) * 100)}% 수강
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-700 mb-2">
                <Clock className="w-5 h-5 text-gray-500" />
                <span className="font-medium">수업 시간</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {course.duration}분
              </div>
            </div>
          </div>

          {/* 가격 정보 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-700 mb-2">
              <DollarSign className="w-5 h-5 text-gray-500" />
              <span className="font-medium">수강료</span>
            </div>
            <div className="text-2xl font-bold text-blue-700">
              {course.price.toLocaleString()}원
            </div>
          </div>

          {/* 레인 정보 */}
          {lanes.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-700 mb-2">
                <MapPin className="w-5 h-5 text-gray-500" />
                <span className="font-medium">배정된 레인</span>
              </div>
              <div className="text-lg font-semibold text-blue-700">
                {poolTypeLabel} {lanes.join(', ')}레인
              </div>
              {course.laneInfo?.laneNotes && (
                <p className="text-sm text-gray-600 mt-2">{course.laneInfo.laneNotes}</p>
              )}
            </div>
          )}

          {/* 과정 타입 */}
          {(course.courseType || course.isPersonalLesson) && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-700">
                <span className="font-medium">과정 타입:</span>
                {course.courseType === 'freeSwim' ? (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    🏊 자유수영
                  </span>
                ) : course.isPersonalLesson ? (
                  <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                    👤 개인레슨
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    👥 단체 수업
                  </span>
                )}
              </div>
            </div>
          )}

          {/* 태그 */}
          {course.tags && course.tags.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Tag className="w-5 h-5 text-gray-500" />
                태그
              </h4>
              <div className="flex flex-wrap gap-2">
                {course.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 수강생 목록 */}
          {course.enrolledStudents && course.enrolledStudents.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">
                수강생 목록 ({course.enrolledStudents.length}명)
              </h4>
              <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                <div className="space-y-2">
                  {course.enrolledStudents.map((student, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white rounded">
                      <span className="text-gray-900">{student.studentName}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        student.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : student.status === 'completed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {student.status === 'active' ? '수강중' : 
                         student.status === 'completed' ? '완료' : 
                         student.status === 'cancelled' ? '취소' : '비활성'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 생성일 */}
          {course.createdAt && (
            <div className="text-sm text-gray-500 text-center pt-4 border-t">
              생성일: {new Date(course.createdAt).toLocaleDateString('ko-KR')}
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
