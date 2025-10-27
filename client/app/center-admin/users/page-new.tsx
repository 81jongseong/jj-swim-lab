/**
 * 센터 회원 관리 페이지
 * 연동되는 데이터: 회원 정보, 강습 과정, 메모 이력, 통계
 * 연동되는 파일: 
 * - /api/center-admin/members (회원 목록)
 * - /api/center-admin/members/stats/summary (통계)
 * - /api/center-admin/members/:memberId/memo (메모 관리)
 * - /api/center-admin/members/:memberId/status (상태 변경)
 * - /api/center-admin/members/:memberId/course (과정 배정)
 * - /api/center-admin/courses (강습 과정 목록)
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, LoadingSpinner } from '@/components/ui';
import { Button } from '@/components/Button';
import { Users, Search, AlertCircle, Ticket, Calendar, User as UserIcon } from 'lucide-react';
import withAuth from '@/components/withAuth';
import MemberDetailModal from '@/components/center-admin/MemberDetailModal';
import CourseAssignmentModal from '@/components/center-admin/CourseAssignmentModal';
import MemberMemoModal from '@/components/center-admin/MemberMemoModal';

interface LessonTicket {
  _id: string;
  type: 'group' | 'personal' | 'unlimited';
  name: string;
  remainingSessions: number;
  totalSessions: number;
  expiryDate: string;
  status: 'active' | 'expired' | 'used';
}

interface Member {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  userType: string;
  status: string;
  joinedAt: string;
  currentLevel?: string;
  emergencyContact?: string;
  medicalConditions?: string;
  swimmingGoals?: string[];
  tickets?: LessonTicket[];
  totalTickets?: number;
  totalRemainingSessions?: number;
  totalAttendance?: number;
  centerMemo?: string;
  centerMemos?: Array<{
    _id: string;
    content: string;
    type: 'info' | 'warning' | 'complaint' | 'special';
    createdAt: string;
    createdByName: string;
  }>;
  currentCourses?: Array<{
    courseId: string;
    courseName: string;
    courseType: string;
    instructorName: string;
    startDate: string;
    endDate: string;
    status: string;
    remainingSessions: number;
    totalSessions: number;
  }>;
  personalLessons?: Array<{
    lessonId: string;
    lessonType: string;
    instructorName: string;
    startDate: string;
    endDate: string;
    status: string;
    remainingSessions: number;
    totalSessions: number;
  }>;
  membershipType?: string;
  notes?: string;
}

interface Stats {
  totalMembers: number;
  activeMembers: number;
  newMembersThisMonth: number;
  expiringTicketsCount: number;
}

function CenterUsersManagement() {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [instructorFilter, setInstructorFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [memoFilter, setMemoFilter] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showMemoModal, setShowMemoModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadMembers();
      loadStats();
      loadCourses();
    }
  }, [user]);

  const loadMembers = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/center-admin/members', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMembers(data.data || []);
        }
      }
    } catch (error) {
      console.error('회원 목록 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/center-admin/members/stats/summary', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        }
      }
    } catch (error) {
      console.error('통계 로드 실패:', error);
    }
  };

  const loadCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/center-admin/courses', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCourses(data.data || []);
        }
      }
    } catch (error) {
      console.error('강습 과정 로드 실패:', error);
    }
  };

  const handleStatusChange = async (memberId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/center-admin/members/${memberId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        loadMembers();
      }
    } catch (error) {
      console.error('상태 변경 실패:', error);
    }
  };

  const handleUpdateMemo = async (memberId: string, memo: string, memoType: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/center-admin/members/${memberId}/memo`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ memo, memoType })
      });

      if (response.ok) {
        loadMembers();
      }
    } catch (error) {
      console.error('메모 업데이트 실패:', error);
    }
  };

  const handleDeleteMemo = async (memberId: string, memoId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/center-admin/members/${memberId}/memo/${memoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        loadMembers();
      }
    } catch (error) {
      console.error('메모 삭제 실패:', error);
    }
  };

  const handleCourseAssignment = async (memberId: string, courseId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/data-center-admin/members/${memberId}/course`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ courseId })
      });

      if (response.ok) {
        alert('과정 배정이 완료되었습니다.');
        loadMembers();
      } else {
        alert('과정 배정에 실패했습니다.');
      }
    } catch (error) {
      console.error('과정 배정 오류:', error);
      alert('과정 배정 중 오류가 발생했습니다.');
    }
  };

  const handleCourseUnassignment = async (memberId: string, courseId: string) => {
    if (!confirm('과정 배정을 취소하시겠습니까?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/data-center-admin/members/${memberId}/course/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('과정 배정이 취소되었습니다.');
        loadMembers();
      } else {
        alert('과정 배정 취소에 실패했습니다.');
      }
    } catch (error) {
      console.error('과정 배정 취소 오류:', error);
      alert('과정 배정 취소 중 오류가 발생했습니다.');
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || member.status === statusFilter;
    const matchesMemo = !memoFilter || (member.centerMemo && member.centerMemo.includes(memoFilter));
    
    return matchesSearch && matchesStatus && matchesMemo;
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">회원 관리</h1>
          <p className="text-gray-600">센터 회원 정보를 관리하고 수강 과정을 배정하세요</p>
        </div>
      </div>

      {/* 통계 카드 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">총 회원</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalMembers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <UserIcon className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">활성 회원</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeMembers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">신규 회원</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.newMembersThisMonth}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">만료 임박</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.expiringTicketsCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 검색 및 필터 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="이름 또는 이메일로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">전체 상태</option>
              <option value="active">활성</option>
              <option value="inactive">비활성</option>
              <option value="suspended">정지</option>
            </select>
            
            <input
              type="text"
              placeholder="메모 내용으로 검색..."
              value={memoFilter}
              onChange={(e) => setMemoFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* 회원 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map((member) => (
          <Card key={member._id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <CardDescription>{member.email}</CardDescription>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  member.status === 'active' ? 'bg-green-100 text-green-800' :
                  member.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {member.status === 'active' ? '활성' :
                   member.status === 'inactive' ? '비활성' : '정지'}
                </span>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="text-sm text-gray-600">
                <p>전화: {member.phone || '-'}</p>
                <p>가입일: {new Date(member.joinedAt).toLocaleDateString('ko-KR')}</p>
                {member.currentLevel && <p>레벨: {member.currentLevel}</p>}
              </div>
              
              {member.centerMemo && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                  <p className="text-sm text-blue-800">
                    <strong>메모:</strong> {member.centerMemo}
                  </p>
                </div>
              )}
              
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => {
                    setSelectedMember(member);
                    setShowDetailModal(true);
                  }}
                  variant="secondary"
                  size="sm"
                >
                  상세보기
                </Button>
                <Button
                  onClick={() => {
                    setSelectedMember(member);
                    setShowMemoModal(true);
                  }}
                  variant="secondary"
                  size="sm"
                >
                  메모 관리
                </Button>
                <Button
                  onClick={() => {
                    setSelectedMember(member);
                    setShowAssignmentModal(true);
                  }}
                  variant="secondary"
                  size="sm"
                >
                  과정 배정
                </Button>
                <Button
                  onClick={() => handleStatusChange(member._id, member.status === 'active' ? 'inactive' : 'active')}
                  variant={member.status === 'active' ? 'destructive' : 'default'}
                  size="sm"
                >
                  {member.status === 'active' ? '비활성화' : '활성화'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 모달 컴포넌트들 */}
      <MemberDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        member={selectedMember}
        onUnassignCourse={handleCourseUnassignment}
      />
      
      <CourseAssignmentModal
        isOpen={showAssignmentModal}
        onClose={() => setShowAssignmentModal(false)}
        member={selectedMember}
        courses={courses}
        onAssign={handleCourseAssignment}
      />
      
      <MemberMemoModal
        isOpen={showMemoModal}
        onClose={() => setShowMemoModal(false)}
        member={selectedMember}
        onUpdateMemo={handleUpdateMemo}
        onDeleteMemo={handleDeleteMemo}
      />
    </div>
  );
}

export default withAuth(CenterUsersManagement, { 
  requireTypes: ['centerAdmin', 'superAdmin'] 
});



