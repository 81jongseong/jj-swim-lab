/**
 * 회원 카드 컴포넌트
 *
 * 연동 파일:
 * - client/app/center-admin/members/page.tsx
 */

'use client';

import React from 'react';
import { Mail, Phone, Users, Calendar, Eye, UserPlus, Edit, Heart } from 'lucide-react';
import { Card, CardContent, Button } from '../ui';

export interface MemberCardData {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  status?: 'active' | 'inactive' | 'suspended';
  assignedCourses?: Array<{ courseId: string; courseName: string; instructorName?: string }>;
  enrollmentDate?: Date | string;
}

interface MemberCardProps {
  member: MemberCardData;
  onView?: (member: MemberCardData) => void;
  onAssign?: (member: MemberCardData) => void;
  onMemo?: (member: MemberCardData) => void;
  onHealth?: (member: MemberCardData) => void;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo';
}

const statusBadge = (status?: string) => {
  const map: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    suspended: 'bg-red-100 text-red-800'
  };
  const cls = map[status || 'active'] || map.active;
  const label = status === 'suspended' ? '정지' : status === 'inactive' ? '비활성' : '활성';
  return <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${cls}`}>{label}</span>;
};

const colorThemes: Record<string, { bg: string; border: string; hoverBg: string; hoverBorder: string; title: string; chip: string }>= {
  blue:   { bg: 'bg-blue-50',   border: 'border-blue-200',   hoverBg: 'hover:bg-blue-100',   hoverBorder: 'hover:border-blue-300',   title: 'text-blue-800',   chip: 'bg-blue-50 border-blue-200 text-blue-800' },
  green:  { bg: 'bg-green-50',  border: 'border-green-200',  hoverBg: 'hover:bg-green-100',  hoverBorder: 'hover:border-green-300',  title: 'text-green-800',  chip: 'bg-green-50 border-green-200 text-green-800' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', hoverBg: 'hover:bg-purple-100', hoverBorder: 'hover:border-purple-300', title: 'text-purple-800', chip: 'bg-purple-50 border-purple-200 text-purple-800' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', hoverBg: 'hover:bg-orange-100', hoverBorder: 'hover:border-orange-300', title: 'text-orange-800', chip: 'bg-orange-50 border-orange-200 text-orange-800' },
  red:    { bg: 'bg-red-50',    border: 'border-red-200',    hoverBg: 'hover:bg-red-100',    hoverBorder: 'hover:border-red-300',    title: 'text-red-800',    chip: 'bg-red-50 border-red-200 text-red-800' },
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', hoverBg: 'hover:bg-indigo-100', hoverBorder: 'hover:border-indigo-300', title: 'text-indigo-800', chip: 'bg-indigo-50 border-indigo-200 text-indigo-800' },
};

export default function MemberCard({ member, onView, onAssign, onMemo, onHealth, color = 'blue' }: MemberCardProps) {
  const theme = colorThemes[color] || colorThemes.blue;
  const courses = member.assignedCourses || [];
  
  const handleViewClick = () => {
    console.log('🔍 [MemberCard] 상세 버튼 클릭:', member.name, member._id);
    onView?.(member);
  };
  
  const handleHealthClick = () => {
    console.log('❤️ [MemberCard] 건강정보 버튼 클릭:', member.name, member._id);
    console.log('❤️ [MemberCard] onHealth 함수 존재 여부:', typeof onHealth);
    if (onHealth) {
      console.log('❤️ [MemberCard] onHealth 함수 호출 중...');
      onHealth(member);
      console.log('❤️ [MemberCard] onHealth 함수 호출 완료');
    } else {
      console.error('❌ [MemberCard] onHealth 함수가 전달되지 않았습니다!');
    }
  };
  
  const handleAssignClick = () => {
    console.log('👤 [MemberCard] 배정 버튼 클릭:', member.name, member._id);
    onAssign?.(member);
  };
  
  const handleMemoClick = () => {
    console.log('📝 [MemberCard] 메모 버튼 클릭:', member.name, member._id);
    onMemo?.(member);
  };
  
  return (
    <Card className={`border-2 ${theme.border} ${theme.bg} ${theme.hoverBg} ${theme.hoverBorder} hover:shadow-lg transition-all`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <div className={`text-base font-semibold ${theme.title} truncate`}>{member.name}</div>
            <div className="mt-1 flex items-center text-sm text-gray-600 break-all"><Mail className="w-4 h-4 mr-2" />{member.email}</div>
            {member.phone && (
              <div className="mt-1 flex items-center text-sm text-gray-600"><Phone className="w-4 h-4 mr-2" />{member.phone}</div>
            )}
          </div>
          <div className="ml-4">{statusBadge(member.status)}</div>
        </div>

        <div className="mt-3 text-sm">
          <div className="font-medium text-gray-700 mb-1">배정된 과정</div>
          {courses.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {courses.slice(0, 3).map((c) => (
                <span key={c.courseId} className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs ${theme.chip}`}>
                  <Users className="w-3 h-3 mr-1" />{c.courseName}
                </span>
              ))}
              {courses.length > 3 && (
                <span className="text-xs text-gray-500">+{courses.length - 3} 더보기</span>
              )}
            </div>
          ) : (
            <span className="text-gray-500">미배정</span>
          )}
        </div>

        <div className="mt-3 text-xs text-gray-500 flex items-center">
          <Calendar className="w-3 h-3 mr-1" />
          등록일: {member.enrollmentDate ? new Date(member.enrollmentDate as any).toLocaleDateString('ko-KR') : '정보 없음'}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button size="sm" variant="outline" className="text-xs hover:bg-gray-100 hover:border-gray-400 transition-colors" onClick={handleViewClick}>
            <Eye className="w-3 h-3 mr-1" /> 상세
          </Button>
          <Button size="sm" variant="outline" className="text-xs hover:bg-gray-100 hover:border-gray-400 transition-colors" onClick={handleHealthClick}>
            <Heart className="w-3 h-3 mr-1" /> 건강정보
          </Button>
          <Button size="sm" className="text-xs hover:opacity-90 transition-opacity" onClick={handleAssignClick}>
            <UserPlus className="w-3 h-3 mr-1" /> 배정
          </Button>
          <Button size="sm" variant="secondary" className="text-xs hover:opacity-80 transition-opacity" onClick={handleMemoClick}>
            <Edit className="w-3 h-3 mr-1" /> 메모
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


