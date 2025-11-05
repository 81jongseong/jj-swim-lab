/**
 * 👨‍🏫 강사 프로필 카드 컴포넌트
 * 
 * 📋 **컴포넌트 목적**:
 * - job-board에서 강사 구직 이력서를 표시하는 전용 카드
 * - 각 강사가 자신의 스타일로 커스터마이징 가능
 * 
 * 🔗 **연동 파일**:
 * - client/app/job-board/page.tsx
 * - server/src/models/User.ts (instructorInfo.profileCustomization)
 */

'use client';

import React from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Star, 
  Award, 
  Briefcase,
  Calendar,
  DollarSign,
  GraduationCap
} from 'lucide-react';

interface InstructorProfileCardProps {
  instructor: {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
    instructorInfo?: {
      experience?: string;
      specialties?: string[];
      certifications?: Array<{
        name: string;
        issuer: string;
        certificateNumber?: string;
        acquiredDate?: string;
      }>;
      instructorLevel?: 'junior' | 'senior' | 'master' | 'expert';
      photo?: string;
      introduction?: string;
      availableRegions?: string[];
      profileCustomization?: {
        theme?: 'default' | 'blue' | 'green' | 'purple' | 'orange' | 'custom';
        primaryColor?: string;
        secondaryColor?: string;
        layout?: 'compact' | 'standard' | 'detailed';
        showPhoto?: boolean;
        showCertifications?: boolean;
        showExperience?: boolean;
        showSpecialties?: boolean;
        showRegions?: boolean;
      };
    };
  };
  jobPost?: {
    title: string;
    content: string;
    roomSpecific?: {
      jobBoard?: {
        salary?: {
          min?: number;
          max?: number;
          type: 'monthly' | 'hourly' | 'per_class';
        };
        location?: string;
        employmentType?: string;
      };
    };
  };
  onClick?: () => void;
}

const themeColors = {
  default: {
    primary: 'from-blue-500 to-blue-600',
    secondary: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200'
  },
  blue: {
    primary: 'from-blue-500 to-indigo-600',
    secondary: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200'
  },
  green: {
    primary: 'from-green-500 to-emerald-600',
    secondary: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200'
  },
  purple: {
    primary: 'from-purple-500 to-violet-600',
    secondary: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200'
  },
  orange: {
    primary: 'from-orange-500 to-amber-600',
    secondary: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200'
  },
  custom: {
    primary: 'from-gray-500 to-gray-600',
    secondary: 'bg-gray-50',
    text: 'text-gray-700',
    border: 'border-gray-200'
  }
};

const levelLabels = {
  junior: '초급',
  senior: '중급',
  master: '고급',
  expert: '전문가'
};

export default function InstructorProfileCard({ 
  instructor, 
  jobPost,
  onClick 
}: InstructorProfileCardProps) {
  const customization = instructor.instructorInfo?.profileCustomization || {};
  const theme = customization.theme || 'default';
  const layout = customization.layout || 'standard';
  const colors = customization.theme === 'custom' && customization.primaryColor && customization.secondaryColor
    ? {
        primary: `from-[${customization.primaryColor}] to-[${customization.secondaryColor}]`,
        secondary: `bg-[${customization.secondaryColor}]20`,
        text: `text-[${customization.primaryColor}]`,
        border: `border-[${customization.primaryColor}]20`
      }
    : themeColors[theme as keyof typeof themeColors] || themeColors.default;

  const showPhoto = customization.showPhoto !== false;
  const showCertifications = customization.showCertifications !== false;
  const showExperience = customization.showExperience !== false;
  const showSpecialties = customization.showSpecialties !== false;
  const showRegions = customization.showRegions !== false;

  return (
    <div 
      className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer border-2 ${colors.border}`}
      onClick={onClick}
    >
      {/* 헤더 - 그라데이션 배경 */}
      <div className={`bg-gradient-to-r ${colors.primary} p-6 text-white`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4 flex-1">
            {/* 프로필 사진 */}
            {showPhoto && (
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                {instructor.instructorInfo?.photo ? (
                  <img 
                    src={instructor.instructorInfo.photo} 
                    alt={instructor.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-white" />
                )}
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-2xl font-bold truncate">{instructor.name}</h3>
                {instructor.instructorInfo?.instructorLevel && (
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm ${colors.secondary} ${colors.text}`}>
                    {levelLabels[instructor.instructorInfo.instructorLevel]}
                  </span>
                )}
              </div>
              
              {jobPost?.title && (
                <p className="text-white/90 text-sm line-clamp-2">{jobPost.title}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 본문 */}
      <div className="p-6 space-y-4">
        {/* 자기소개 */}
        {instructor.instructorInfo?.introduction && (
          <p className="text-gray-700 text-sm leading-relaxed">
            {instructor.instructorInfo.introduction}
          </p>
        )}

        {/* 경력 */}
        {showExperience && instructor.instructorInfo?.experience && (
          <div className="flex items-start gap-2">
            <Briefcase className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">경력</p>
              <p className="text-sm text-gray-900">{instructor.instructorInfo.experience}</p>
            </div>
          </div>
        )}

        {/* 전문 분야 */}
        {showSpecialties && instructor.instructorInfo?.specialties && instructor.instructorInfo.specialties.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">전문 분야</p>
            <div className="flex flex-wrap gap-2">
              {instructor.instructorInfo.specialties.map((specialty, idx) => (
                <span
                  key={idx}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${colors.secondary} ${colors.text}`}
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 자격증 */}
        {showCertifications && instructor.instructorInfo?.certifications && instructor.instructorInfo.certifications.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
              <Award className="w-4 h-4" />
              자격증
            </p>
            <div className="space-y-2">
              {instructor.instructorInfo.certifications.map((cert, idx) => (
                <div key={idx} className="text-sm text-gray-700">
                  <span className="font-medium">{cert.name}</span>
                  {cert.issuer && (
                    <span className="text-gray-500"> - {cert.issuer}</span>
                  )}
                  {cert.acquiredDate && (
                    <span className="text-gray-400 text-xs ml-2">({cert.acquiredDate})</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 근무 가능 지역 */}
        {showRegions && instructor.instructorInfo?.availableRegions && instructor.instructorInfo.availableRegions.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              근무 가능 지역
            </p>
            <div className="flex flex-wrap gap-2">
              {instructor.instructorInfo.availableRegions.slice(0, 5).map((region, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
                >
                  {region}
                </span>
              ))}
              {instructor.instructorInfo.availableRegions.length > 5 && (
                <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-500">
                  +{instructor.instructorInfo.availableRegions.length - 5}개
                </span>
              )}
            </div>
          </div>
        )}

        {/* 급여 정보 (job-board에서) */}
        {jobPost?.roomSpecific?.jobBoard?.salary && (
          <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
            <DollarSign className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-xs font-medium text-gray-500">희망 급여</p>
              <p className="text-sm font-semibold text-gray-900">
                {jobPost.roomSpecific.jobBoard.salary.min && jobPost.roomSpecific.jobBoard.salary.max
                  ? `${(jobPost.roomSpecific.jobBoard.salary.min / 10000).toFixed(0)}만원 ~ ${(jobPost.roomSpecific.jobBoard.salary.max / 10000).toFixed(0)}만원`
                  : jobPost.roomSpecific.jobBoard.salary.min
                  ? `${(jobPost.roomSpecific.jobBoard.salary.min / 10000).toFixed(0)}만원 이상`
                  : '면접 후 결정'}
                {jobPost.roomSpecific.jobBoard.salary.type === 'monthly' && ' (월급)'}
                {jobPost.roomSpecific.jobBoard.salary.type === 'hourly' && ' (시급)'}
                {jobPost.roomSpecific.jobBoard.salary.type === 'per_class' && ' (회당)'}
              </p>
            </div>
          </div>
        )}

        {/* 연락처 */}
        <div className="flex items-center gap-4 pt-3 border-t border-gray-200 text-sm">
          {instructor.email && (
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="w-4 h-4" />
              <span>{instructor.email}</span>
            </div>
          )}
          {instructor.phone && (
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="w-4 h-4" />
              <span>{instructor.phone}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

