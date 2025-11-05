/**
 * 💼 구인 공고 카드 컴포넌트
 * 
 * 📋 **컴포넌트 목적**:
 * - job-board에서 구인 공고를 표시하는 전용 카드
 * - 크기를 줄이고 깔끔한 디자인으로 정보 제공
 * 
 * 🔗 **연동 파일**:
 * - client/app/job-board/page.tsx
 */

'use client';

import React from 'react';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Eye,
  CheckCircle,
  Clock
} from 'lucide-react';

interface JobPostCardProps {
  post: {
    _id: string;
    title: string;
    content: string;
    roomSpecific: {
      jobBoard: {
        jobType: 'job_post' | 'resume' | 'freelance';
        position: 'instructor' | 'lifeguard' | 'front_desk' | 'office' | 'manager' | 'other';
        employmentType: 'full_time' | 'part_time' | 'contract' | 'freelance';
        location?: string;
        centerName?: string;
        salary?: {
          min?: number;
          max?: number;
          type: 'monthly' | 'hourly' | 'per_class';
        };
      };
    };
    views?: number;
    createdAt?: string;
  };
  applied?: boolean;
  onClick?: () => void;
  formatSalary?: (salary?: { min?: number; max?: number; type: string }) => string;
  getJobTypeColor?: (jobType: string) => string;
  jobTypeLabels?: Record<string, string>;
  positionLabels?: Record<string, string>;
  employmentLabels?: Record<string, string>;
}

export default function JobPostCard({
  post,
  applied = false,
  onClick,
  formatSalary,
  getJobTypeColor,
  jobTypeLabels = {},
  positionLabels = {},
  employmentLabels = {}
}: JobPostCardProps) {
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

  const getJobTypeColorDefault = (jobType: string) => {
    switch (jobType) {
      case 'job_post':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'resume':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'freelance':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return '오늘';
    if (days === 1) return '어제';
    if (days < 7) return `${days}일 전`;
    if (days < 30) return `${Math.floor(days / 7)}주 전`;
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  };

  const salaryFormatter = formatSalary || formatSalaryDefault;
  const colorGetter = getJobTypeColor || getJobTypeColorDefault;

  return (
    <div
      className={`bg-white rounded-lg border-2 transition-all duration-200 cursor-pointer hover:shadow-md ${
        applied ? 'border-green-300 bg-green-50/30' : 'border-gray-200 hover:border-blue-300'
      }`}
      onClick={onClick}
    >
      <div className="p-4">
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            {applied && (
              <div className="mb-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                  <CheckCircle className="w-3 h-3" />
                  지원 완료
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5 flex-wrap mb-2">
              <span className={`px-2 py-0.5 rounded text-xs font-medium border ${colorGetter(post.roomSpecific.jobBoard.jobType)}`}>
                {jobTypeLabels[post.roomSpecific.jobBoard.jobType] || post.roomSpecific.jobBoard.jobType}
              </span>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                {positionLabels[post.roomSpecific.jobBoard.position] || post.roomSpecific.jobBoard.position}
              </span>
              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                {employmentLabels[post.roomSpecific.jobBoard.employmentType] || post.roomSpecific.jobBoard.employmentType}
              </span>
            </div>
            <h3 className="text-base font-bold text-gray-900 line-clamp-2 mb-1">
              {post.title}
            </h3>
            <p className="text-xs text-gray-500 line-clamp-1">
              {post.roomSpecific.jobBoard.centerName || post.roomSpecific.jobBoard.location || '위치 미지정'}
            </p>
          </div>
        </div>

        {/* 내용 */}
        <p className="text-sm text-gray-700 line-clamp-2 mb-3">
          {post.content}
        </p>

        {/* 정보 */}
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <DollarSign className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
            <span className="font-medium">급여:</span>
            <span className="text-gray-900">{salaryFormatter(post.roomSpecific.jobBoard.salary)}</span>
          </div>
          {post.roomSpecific.jobBoard.location && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <MapPin className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
              <span className="line-clamp-1">{post.roomSpecific.jobBoard.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-gray-400">
            {post.views !== undefined && (
              <div className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                <span>{post.views}</span>
              </div>
            )}
            {post.createdAt && (
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatDate(post.createdAt)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

