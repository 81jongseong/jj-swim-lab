/**
 * 📋 내 지원 목록 카드 컴포넌트
 * 
 * 📋 **컴포넌트 목적**:
 * - 강사가 자신의 지원 목록을 표시하는 전용 카드
 * - 지원 상태, 센터 정보, 면접 일정 등을 표시
 * - 면접 수락/거부 기능 포함
 * 
 * 🔗 **연동 파일**:
 * - client/app/job-board/page.tsx
 */

'use client';

import React from 'react';
import { 
  MapPin, 
  DollarSign, 
  Clock,
  Calendar,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui';

interface MyApplicationCardProps {
  application: {
    _id: string;
    status: 'applied' | 'document_passed' | 'document_failed' | 'interview_scheduled' | 'interview_passed' | 'interview_failed' | 'final_passed' | 'final_failed' | 'withdrawn';
    interviewDate?: string;
    interviewTime?: string;
    interviewLocation?: string;
    createdAt: string;
    postId?: {
      _id?: string;
      title?: string;
      content?: string;
      roomSpecific?: {
        jobBoard?: {
          centerId?: {
            name?: string;
          } | string;
          centerName?: string;
          location?: string;
          salary?: {
            min?: number;
            max?: number;
            type: 'monthly' | 'hourly' | 'per_class';
          };
        };
      };
    };
    centerId?: {
      name?: string;
    } | string;
  };
  onInterviewAccept?: (applicationId: string) => void;
  onInterviewReject?: (applicationId: string) => void;
  formatSalary?: (salary?: { min?: number; max?: number; type: string }) => string;
}

export default function MyApplicationCard({
  application,
  onInterviewAccept,
  onInterviewReject,
  formatSalary
}: MyApplicationCardProps) {
  const post = application.postId;
  
  // 센터명 찾기
  const centerName = 
    (typeof application.centerId === 'object' && application.centerId?.name) ||
    (typeof post?.roomSpecific?.jobBoard?.centerId === 'object' && post?.roomSpecific?.jobBoard?.centerId?.name) ||
    post?.roomSpecific?.jobBoard?.centerName ||
    post?.roomSpecific?.jobBoard?.location ||
    '센터명 없음';

  // 상태 텍스트 및 색상
  const statusText = 
    application.status === 'applied' ? '지원' :
    application.status === 'document_passed' ? '서류 통과' :
    application.status === 'interview_scheduled' ? '면접 일정' :
    application.status === 'interview_passed' ? '면접 통과' :
    application.status === 'final_passed' ? '최종 합격' :
    application.status === 'document_failed' ? '서류 불합격' :
    application.status === 'interview_failed' ? '면접 불합격' :
    application.status === 'final_failed' ? '최종 불합격' :
    application.status === 'withdrawn' ? '지원 취소' : application.status;

  const statusColor = 
    application.status === 'applied' ? 'bg-blue-100 text-blue-800' :
    application.status === 'document_passed' ? 'bg-green-100 text-green-800' :
    application.status === 'interview_scheduled' ? 'bg-purple-100 text-purple-800' :
    application.status === 'interview_passed' ? 'bg-green-100 text-green-800' :
    application.status === 'final_passed' ? 'bg-green-100 text-green-800' :
    'bg-gray-100 text-gray-800';

  const formatSalaryDefault = (salary?: { min?: number; max?: number; type: string }) => {
    if (!salary) return '면접 후 결정';
    
    const min = salary.min?.toLocaleString() || '';
    const max = salary.max?.toLocaleString() || '';
    const type = salary.type === 'monthly' ? '만원/월' : salary.type === 'hourly' ? '원/시간' : '원/회';
    
    if (min && max) {
      return `${min} ~ ${max} ${type}`;
    } else if (min) {
      return `${min} ${type} 이상`;
    }
    return '면접 후 결정';
  };

  const salaryFormatter = formatSalary || formatSalaryDefault;

  return (
    <div
      className={`bg-white rounded-lg border-2 transition-all duration-200 ${
        application.status === 'interview_scheduled' ? 'border-purple-300 bg-purple-50/30' : 'border-gray-200 hover:border-blue-300'
      } hover:shadow-md`}
    >
      <div className="p-4">
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-2">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColor}`}>
                {statusText}
              </span>
              {application.status === 'interview_scheduled' && (
                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                  응답 대기
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-gray-900 line-clamp-2 mb-1">
              {post?.title || '제목 없음'}
            </h3>
            <p className="text-xs text-gray-500 line-clamp-1">
              {centerName} {application.status === 'document_passed' && '서류 통과'} {application.status === 'interview_scheduled' && '면접 날짜'}
            </p>
          </div>
        </div>

        {/* 공고 정보 */}
        <div className="bg-gray-50 p-3 rounded-lg space-y-1.5 mb-3 text-sm">
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <MapPin className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
            <span className="font-medium">센터:</span>
            <span className="text-gray-900">{centerName}</span>
          </div>
          {post?.roomSpecific?.jobBoard?.salary && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <DollarSign className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
              <span className="font-medium">급여:</span>
              <span className="text-gray-900">{salaryFormatter(post.roomSpecific.jobBoard.salary)}</span>
            </div>
          )}
          {post?.roomSpecific?.jobBoard?.location && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <MapPin className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
              <span className="line-clamp-1">{post.roomSpecific.jobBoard.location}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
            <span>지원일: {new Date(application.createdAt).toLocaleDateString('ko-KR')}</span>
          </div>
        </div>

        {/* 면접 일정 */}
        {application.status === 'interview_scheduled' && application.interviewDate && (
          <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span className="font-semibold text-purple-900 text-sm">면접 일정</span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                <span className="text-gray-700">
                  {new Date(application.interviewDate).toLocaleDateString('ko-KR')} {application.interviewTime || '시간 미정'}
                </span>
              </div>
              {application.interviewLocation && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                  <span className="text-gray-700 line-clamp-1">{application.interviewLocation}</span>
                </div>
              )}
              <div className="flex gap-2 mt-2 pt-2 border-t border-purple-200">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onInterviewAccept?.(application._id)}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  수락
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    if (confirm('정말 면접을 거부하시겠습니까?')) {
                      onInterviewReject?.(application._id);
                    }
                  }}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  거부
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

