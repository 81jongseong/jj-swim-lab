/**
 * 회원 상세보기 모달 컴포넌트
 * 연동되는 데이터: 회원 정보, 현재 수강 과정, 개인레슨 정보
 * 연동되는 파일: center-admin/users/page.tsx
 */

import React from 'react';
import { Modal } from '@/components/ui';
import { Button } from '@/components/Button';

interface Member {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  status: string;
  joinedAt: string;
  currentLevel?: string;
  emergencyContact?: string;
  medicalConditions?: string;
  swimmingGoals?: string[];
  currentCourses?: Array<{
    courseId: string;
    courseName: string;
    courseType: string;
    instructorName: string;
    remainingSessions: number;
    totalSessions: number;
    status: string;
  }>;
  personalLessons?: Array<{
    lessonType: string;
    instructorName: string;
    remainingSessions: number;
    totalSessions: number;
    status: string;
  }>;
}

interface MemberDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  onUnassignCourse?: (memberId: string, courseId: string) => void;
}

export default function MemberDetailModal({ isOpen, onClose, member, onUnassignCourse }: MemberDetailModalProps) {
  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            👤 {member.name} 회원 상세 정보
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
            <p className="text-sm text-gray-900">{member.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
            <p className="text-sm text-gray-900">{member.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
            <p className="text-sm text-gray-900">{member.phone || '-'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              member.status === 'active' ? 'bg-green-100 text-green-800' :
              member.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {member.status === 'active' ? '활성' :
               member.status === 'inactive' ? '비활성' : '정지'}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">가입일</label>
            <p className="text-sm text-gray-900">{new Date(member.joinedAt).toLocaleDateString('ko-KR')}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">현재 레벨</label>
            <p className="text-sm text-gray-900">{member.currentLevel || '-'}</p>
          </div>
        </div>
        
        {member.emergencyContact && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">응급 연락처</label>
            <p className="text-sm text-gray-900">{member.emergencyContact}</p>
          </div>
        )}
        
        {member.medicalConditions && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">의료 정보</label>
            <p className="text-sm text-gray-900">{member.medicalConditions}</p>
          </div>
        )}
        
        {member.swimmingGoals && member.swimmingGoals.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">수영 목표</label>
            <p className="text-sm text-gray-900">{member.swimmingGoals.join(', ')}</p>
          </div>
        )}
        
        {/* 현재 수강 중인 과정 정보 */}
        {member.currentCourses && member.currentCourses.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">현재 수강 중인 과정</label>
            <div className="space-y-2">
              {member.currentCourses.map((course, index) => (
                <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-blue-900">{course.courseName}</p>
                      <p className="text-sm text-blue-600">
                        {course.courseType === 'group' ? '단체반' : '개인레슨'} | {course.instructorName}
                      </p>
                      <p className="text-sm text-blue-500">
                        {course.remainingSessions}/{course.totalSessions}회 남음
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        course.status === 'active' ? 'bg-green-100 text-green-800' :
                        course.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {course.status === 'active' ? '진행중' :
                         course.status === 'completed' ? '완료' : '취소'}
                      </span>
                      {course.status === 'active' && course.courseId && onUnassignCourse && (
                        <button
                          onClick={() => onUnassignCourse(member._id, course.courseId)}
                          className="text-red-500 hover:text-red-700 text-sm"
                          title="배정 취소"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* 개인레슨 정보 */}
        {member.personalLessons && member.personalLessons.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">개인레슨 정보</label>
            <div className="space-y-2">
              {member.personalLessons.map((lesson, index) => (
                <div key={index} className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-purple-900">개인레슨 ({lesson.lessonType})</p>
                      <p className="text-sm text-purple-600">{lesson.instructorName}</p>
                      <p className="text-sm text-purple-500">
                        {lesson.remainingSessions}/{lesson.totalSessions}회 남음
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      lesson.status === 'active' ? 'bg-green-100 text-green-800' :
                      lesson.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {lesson.status === 'active' ? '진행중' :
                       lesson.status === 'completed' ? '완료' : '취소'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>
        
        {/* 버튼 */}
        <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
