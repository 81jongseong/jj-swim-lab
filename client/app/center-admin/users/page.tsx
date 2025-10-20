/**
 * 🏢 센터 회원 관리 페이지
 * 
 * 📋 **페이지 목적**
 * - 센터 관리자가 센터 회원을 조회하고 관리
 * - 수강권 잔여 횟수 및 만료일 확인
 * - 출석 현황 모니터링
 * - 센터 내부 메모 관리
 * 
 * 🔄 **주요 기능**
 * - 회원 목록 조회 및 검색
 * - 수강권 정보 표시 (남은 횟수, 만료일)
 * - 출석 통계
 * - 회원 상태 관리
 * - 센터 메모 작성
 * - 만료 임박 수강권 알림
 * 
 * 🗄️ **데이터 연동**
 * - /api/center-members (회원 목록)
 * - /api/center-members/stats/summary (통계)
 * - /api/center-members/alerts/expiring-tickets (알림)
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, LoadingSpinner, Modal } from '@/components/ui';
import { Button } from '@/components/Button';
import { Users, Search, AlertCircle, Ticket, Calendar, User as UserIcon } from 'lucide-react';
import withAuth from '@/components/withAuth';

interface LessonTicket {
  _id: string;
  type: 'group' | 'personal' | 'unlimited';
  name: string;
  totalSessions: number;
  remainingSessions: number;
  expiryDate: string;
}

interface CenterMemo {
  _id: string;
  content: string;
  type: 'info' | 'warning' | 'complaint' | 'special';
  createdBy: string;
  createdByName: string;
  createdAt: string;
}

interface Member {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  status: 'active' | 'inactive' | 'suspended';
  joinedAt: string;
  currentLevel?: string;
  assignedInstructor?: any;
  centerMemo?: string;
  centerMemoUpdatedAt?: string;
  centerMemos: CenterMemo[];
  
  // 수강권 정보
  tickets: LessonTicket[];
  totalTickets: number;
  totalRemainingSessions: number;
  
  // 출석 정보
  totalAttendance: number;
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
  const [memo, setMemo] = useState('');
  const [memoType, setMemoType] = useState<'info' | 'warning' | 'complaint' | 'special'>('info');

  useEffect(() => {
    if (user) {
      loadMembers();
      loadStats();
    }
  }, [user]);

  const loadMembers = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      const url = new URL('http://localhost:5000/api/center-members');
      if (searchTerm) url.searchParams.append('search', searchTerm);
      if (statusFilter) url.searchParams.append('status', statusFilter);
      
      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📊 회원 목록 응답:', data);
        console.log('📊 회원 수:', data.data?.length);
        
        if (data.success) {
          setMembers(data.data);
          
          // 전체 회원 데이터 확인
          console.log('📋 전체 회원 데이터:', data.data);
          
          // 첫 번째 회원의 메모 확인
          if (data.data.length > 0) {
            console.log('🔍 첫 회원 메모:', data.data[0].centerMemo);
            console.log('🔍 첫 회원 전체:', data.data[0]);
          }
          
          // 메모가 있는 회원 확인
          const membersWithMemo = data.data.filter((m: Member) => m.centerMemo);
          console.log('📝 메모가 있는 회원:', membersWithMemo.length, '명');
          membersWithMemo.forEach((m: Member) => {
            console.log(`   - ${m.name}: "${m.centerMemo}"`);
          });
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
      const response = await fetch('http://localhost:5000/api/center-members/stats/summary', {
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

  const handleStatusChange = async (memberId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/center-members/${memberId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        alert('✅ 회원 상태가 변경되었습니다.');
        loadMembers();
      } else {
        alert('❌ 상태 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('상태 변경 오류:', error);
      alert('상태 변경 중 오류가 발생했습니다.');
    }
  };

  const handleMemoAdd = async () => {
    if (!selectedMember || !memo.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/center-members/${selectedMember._id}/memo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: memo.trim(), type: memoType })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ 메모 추가 성공:', result);
        
        // selectedMember 업데이트 (전체 목록 새로고침 없이)
        const updatedMember = {
          ...selectedMember,
          centerMemos: result.data.studentInfo.centerMemos || []
        };
        setSelectedMember(updatedMember);
        
        // members 배열도 업데이트
        setMembers(prev => prev.map(m => 
          m._id === selectedMember._id ? updatedMember : m
        ));
        
        setMemo('');
        setMemoType('info');
        alert('✅ 메모가 추가되었습니다.');
      } else {
        const error = await response.json();
        console.error('❌ 메모 추가 실패:', error);
        alert('❌ 메모 추가에 실패했습니다.');
      }
    } catch (error) {
      console.error('메모 추가 오류:', error);
      alert('메모 추가 중 오류가 발생했습니다.');
    }
  };

  const handleMemoDelete = async (memoId: string) => {
    if (!selectedMember || !window.confirm('이 메모를 삭제하시겠습니까?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/center-members/${selectedMember._id}/memo/${memoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        
        // selectedMember 업데이트 (전체 목록 새로고침 없이)
        const updatedMember = {
          ...selectedMember,
          centerMemos: result.data.studentInfo.centerMemos || []
        };
        setSelectedMember(updatedMember);
        
        // members 배열도 업데이트
        setMembers(prev => prev.map(m => 
          m._id === selectedMember._id ? updatedMember : m
        ));
        
        alert('✅ 메모가 삭제되었습니다.');
      } else {
        alert('❌ 메모 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('메모 삭제 오류:', error);
      alert('메모 삭제 중 오류가 발생했습니다.');
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (member.phone && member.phone.includes(searchTerm));
    const matchesStatus = statusFilter === '' || member.status === statusFilter;
    const matchesInstructor = instructorFilter === '' || 
                              (member.assignedInstructor && member.assignedInstructor.name === instructorFilter);
    const matchesLevel = levelFilter === '' || member.currentLevel === levelFilter;
    const matchesMemo = memoFilter === '' || 
                       (memoFilter === 'with' && member.centerMemos && member.centerMemos.length > 0) ||
                       (memoFilter === 'without' && (!member.centerMemos || member.centerMemos.length === 0));
    return matchesSearch && matchesStatus && matchesInstructor && matchesLevel && matchesMemo;
  });

  // 담당 강사 목록 (중복 제거)
  const uniqueInstructors = Array.from(
    new Set(
      members
        .filter(m => m.assignedInstructor)
        .map(m => m.assignedInstructor.name)
    )
  );

  // 레벨 목록 (중복 제거)
  const uniqueLevels = Array.from(
    new Set(
      members
        .filter(m => m.currentLevel)
        .map(m => m.currentLevel)
    )
  ).sort();

  // 만료 임박 회원 (7일 이내)
  const expiringMembers = filteredMembers.filter(member => 
    member.tickets.some(ticket => {
      const expiryDate = new Date(ticket.expiryDate);
      const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      return expiryDate <= sevenDaysFromNow && expiryDate >= new Date();
    })
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          👥 센터 회원 관리
        </h1>
        <p className="text-gray-600">센터 회원의 수강권 및 출석 현황을 관리하세요</p>
      </div>

      {/* 통계 카드 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">총 회원</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalMembers}명</p>
                </div>
                <Users className="h-10 w-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">활성 회원</p>
                  <p className="text-2xl font-bold text-green-600">{stats.activeMembers}명</p>
                </div>
                <UserIcon className="h-10 w-10 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">이번 달 신규</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.newMembersThisMonth}명</p>
                </div>
                <Calendar className="h-10 w-10 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">만료 임박</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.expiringTicketsCount}개</p>
                </div>
                <AlertCircle className="h-10 w-10 text-orange-500" />
              </div>
              <p className="text-xs text-gray-500 mt-2">7일 이내 만료</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 만료 임박 알림 */}
      {expiringMembers.length > 0 && (
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-700 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              ⚠️ 수강권 만료 임박 ({expiringMembers.length}명)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expiringMembers.map(member => {
                const expiringTicket = member.tickets.find(ticket => {
                  const expiryDate = new Date(ticket.expiryDate);
                  const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                  return expiryDate <= sevenDaysFromNow && expiryDate >= new Date();
                });
                
                if (!expiringTicket) return null;
                
                const daysLeft = Math.ceil((new Date(expiringTicket.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                
                return (
                  <div key={member._id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <Ticket className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-600">{expiringTicket.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-orange-600">
                        {daysLeft}일 남음
                      </p>
                      <p className="text-xs text-gray-500">
                        남은 횟수: {expiringTicket.remainingSessions}회
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 검색 및 필터 */}
      <Card className="mb-6">
        <CardContent className="p-6">
          {/* 검색창 */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="이름, 이메일, 전화번호로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
              />
            </div>
          </div>
          
          {/* 필터 옵션 */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {/* 상태 필터 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                📊 회원 상태
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-white"
              >
                <option value="">전체 상태</option>
                <option value="active">✅ 활성</option>
                <option value="inactive">⏸️ 비활성</option>
                <option value="suspended">🚫 정지</option>
              </select>
            </div>
            
            {/* 강사 필터 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                👨‍🏫 담당 강사
              </label>
              <select
                value={instructorFilter}
                onChange={(e) => setInstructorFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-white"
              >
                <option value="">전체 강사</option>
                {uniqueInstructors.map((instructor) => (
                  <option key={instructor} value={instructor}>
                    {instructor}
                  </option>
                ))}
              </select>
            </div>
            
            {/* 레벨 필터 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                🎯 수영 레벨
              </label>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-white"
              >
                <option value="">전체 레벨</option>
                {uniqueLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
            
            {/* 메모 필터 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                📝 메모 유무
              </label>
              <select
                value={memoFilter}
                onChange={(e) => setMemoFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-white"
              >
                <option value="">전체</option>
                <option value="with">✅ 메모 있음</option>
                <option value="without">❌ 메모 없음</option>
              </select>
            </div>
            
            {/* 새로고침 버튼 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                🔄 데이터 갱신
              </label>
              <Button 
                onClick={loadMembers} 
                variant="primary"
                className="w-full"
              >
                새로고침
              </Button>
            </div>
          </div>
          
          {/* 활성 필터 표시 */}
          {(statusFilter || instructorFilter || levelFilter || memoFilter || searchTerm) && (
            <div className="mt-4 flex flex-wrap gap-2 items-center">
              <span className="text-xs font-medium text-gray-600">활성 필터:</span>
              {searchTerm && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  검색: {searchTerm}
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="ml-1.5 hover:text-blue-900"
                  >
                    ✕
                  </button>
                </span>
              )}
              {statusFilter && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  상태: {statusFilter === 'active' ? '✅ 활성' : statusFilter === 'suspended' ? '🚫 정지' : '⏸️ 비활성'}
                  <button 
                    onClick={() => setStatusFilter('')}
                    className="ml-1.5 hover:text-green-900"
                  >
                    ✕
                  </button>
                </span>
              )}
              {instructorFilter && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  강사: {instructorFilter}
                  <button 
                    onClick={() => setInstructorFilter('')}
                    className="ml-1.5 hover:text-purple-900"
                  >
                    ✕
                  </button>
                </span>
              )}
              {levelFilter && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  레벨: {levelFilter}
                  <button 
                    onClick={() => setLevelFilter('')}
                    className="ml-1.5 hover:text-yellow-900"
                  >
                    ✕
                  </button>
                </span>
              )}
              {memoFilter && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                  메모: {memoFilter === 'with' ? '✅ 있음' : '❌ 없음'}
                  <button 
                    onClick={() => setMemoFilter('')}
                    className="ml-1.5 hover:text-pink-900"
                  >
                    ✕
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setInstructorFilter('');
                  setLevelFilter('');
                  setMemoFilter('');
                }}
                className="text-xs text-gray-500 hover:text-gray-700 underline ml-2"
              >
                전체 초기화
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 회원 목록 - 반응형 그리드 */}
      {filteredMembers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredMembers.map((member) => (
            <Card key={member._id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-5">
                {/* 헤더 */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <UserIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                      <p className="text-xs text-gray-600">{member.email}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                    member.status === 'active' ? 'bg-green-100 text-green-700' :
                    member.status === 'suspended' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {member.status === 'active' ? '✅' :
                     member.status === 'suspended' ? '🚫' :
                     '⏸️'}
                  </span>
                </div>
                
                {/* 기본 정보 */}
                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  <div>
                    <p className="text-gray-500 text-xs">📅 가입일</p>
                    <p className="font-semibold">{new Date(member.joinedAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">🎯 레벨</p>
                    <p className="font-semibold">{member.currentLevel || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">👨‍🏫 담당 강사</p>
                    <p className="font-semibold">{member.assignedInstructor?.name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">📊 총 출석</p>
                    <p className="font-semibold text-blue-600">{member.totalAttendance}회</p>
                  </div>
                </div>

                {/* 수강권 정보 */}
                <div className="border-t border-gray-200 pt-3 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-gray-700 flex items-center">
                      <Ticket className="h-3.5 w-3.5 mr-1" />
                      수강권 ({member.totalTickets}개)
                    </p>
                    {member.totalRemainingSessions > 0 && (
                      <span className="text-xs font-bold text-blue-600">
                        총 {member.totalRemainingSessions}회
                      </span>
                    )}
                  </div>
                  
                  {member.tickets.length > 0 ? (
                    <div className="space-y-1.5">
                      {member.tickets.slice(0, 2).map((ticket) => {
                        const expiryDate = new Date(ticket.expiryDate);
                        const daysLeft = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                        const isExpiringSoon = daysLeft <= 7;
                        
                        return (
                          <div 
                            key={ticket._id} 
                            className={`p-2 rounded text-xs ${
                              isExpiringSoon ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">
                                {ticket.type === 'group' ? '🏊' : '👤'} {ticket.remainingSessions}/{ticket.totalSessions}회
                              </span>
                              <span className={isExpiringSoon ? 'text-orange-600 font-semibold' : 'text-gray-500'}>
                                {daysLeft > 0 ? `${daysLeft}일` : '만료'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                      {member.tickets.length > 2 && (
                        <p className="text-xs text-gray-400 text-center">+{member.tickets.length - 2}개 더</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 text-center py-2">수강권 없음</p>
                  )}
                </div>

                {/* 메모 이력 미리보기 */}
                {member.centerMemos && member.centerMemos.length > 0 && (
                  <div className="border-t border-gray-200 pt-3 mb-3">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2.5">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-xs font-semibold text-yellow-800">📝 메모 이력</p>
                        <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full">
                          {member.centerMemos.length}개
                        </span>
                      </div>
                      {member.centerMemos.slice(0, 2).map((memo, idx) => (
                        <div key={idx} className="mb-1.5 last:mb-0">
                          <div className="flex items-start gap-1.5">
                            <span className={`text-xs px-1.5 py-0.5 rounded ${
                              memo.type === 'warning' ? 'bg-orange-100 text-orange-700' :
                              memo.type === 'complaint' ? 'bg-red-100 text-red-700' :
                              memo.type === 'special' ? 'bg-purple-100 text-purple-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {memo.type === 'warning' ? '⚠️' :
                               memo.type === 'complaint' ? '📢' :
                               memo.type === 'special' ? '⭐' :
                               'ℹ️'}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-700 line-clamp-1">{memo.content}</p>
                              <p className="text-[10px] text-gray-500">
                                {new Date(memo.createdAt).toLocaleDateString()} · {memo.createdByName}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {member.centerMemos.length > 2 && (
                        <p className="text-xs text-yellow-700 text-center mt-1">+{member.centerMemos.length - 2}개 더</p>
                      )}
                    </div>
                  </div>
                )}

                {/* 액션 버튼 */}
                <div className="flex gap-2 border-t border-gray-200 pt-3">
                  <Button
                    onClick={() => {
                      setSelectedMember(member);
                      setMemo('');
                      setMemoType('info');
                      setShowMemoModal(true);
                    }}
                    variant="secondary"
                    className="flex-1 text-xs"
                  >
                    📝 메모 관리
                  </Button>
                  
                  {member.status === 'active' ? (
                    <Button
                      onClick={() => handleStatusChange(member._id, 'inactive')}
                      variant="warning"
                      className="flex-1 text-xs"
                    >
                      ⏸️ 비활성
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleStatusChange(member._id, 'active')}
                      variant="primary"
                      className="flex-1 text-xs"
                    >
                      ✅ 활성
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm || statusFilter ? '검색 결과가 없습니다.' : '등록된 회원이 없습니다.'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 메모 관리 모달 */}
      <Modal
        isOpen={showMemoModal && !!selectedMember}
        onClose={() => {
          setShowMemoModal(false);
          setSelectedMember(null);
          setMemo('');
          setMemoType('info');
        }}
        title={`📝 메모 관리 - ${selectedMember?.name}`}
        size="lg"
      >
        <div className="p-6 space-y-4">
          {/* 메모 추가 폼 */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">✏️ 새 메모 추가</h4>
            
            {/* 메모 유형 선택 */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">메모 유형</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setMemoType('info')}
                  className={`flex-1 px-3 py-2 rounded text-xs font-medium transition-colors ${
                    memoType === 'info' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  ℹ️ 일반
                </button>
                <button
                  onClick={() => setMemoType('warning')}
                  className={`flex-1 px-3 py-2 rounded text-xs font-medium transition-colors ${
                    memoType === 'warning' 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                  }`}
                >
                  ⚠️ 경고
                </button>
                <button
                  onClick={() => setMemoType('complaint')}
                  className={`flex-1 px-3 py-2 rounded text-xs font-medium transition-colors ${
                    memoType === 'complaint' 
                      ? 'bg-red-500 text-white' 
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                >
                  📢 민원
                </button>
                <button
                  onClick={() => setMemoType('special')}
                  className={`flex-1 px-3 py-2 rounded text-xs font-medium transition-colors ${
                    memoType === 'special' 
                      ? 'bg-purple-500 text-white' 
                      : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  }`}
                >
                  ⭐ 특이
                </button>
              </div>
            </div>
            
            {/* 메모 입력 */}
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="메모 내용을 입력하세요&#10;예: 경고 조치 - 수영복 미지참&#10;예: 민원 제기 - 강습 시간 변경 요청&#10;예: 특이사항 - 물 공포증 있음"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
              rows={3}
            />
            
            <Button
              onClick={handleMemoAdd}
              variant="primary"
              className="w-full mt-2"
              disabled={!memo.trim()}
            >
              ➕ 메모 추가
            </Button>
          </div>
          
          {/* 메모 이력 타임라인 */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              📋 메모 이력 ({selectedMember?.centerMemos?.length || 0}개)
            </h4>
            
            {selectedMember?.centerMemos && selectedMember.centerMemos.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {[...selectedMember.centerMemos].reverse().map((memoItem) => (
                  <div key={memoItem._id} className="border border-gray-200 rounded-lg p-3 bg-white">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          memoItem.type === 'warning' ? 'bg-orange-100 text-orange-700' :
                          memoItem.type === 'complaint' ? 'bg-red-100 text-red-700' :
                          memoItem.type === 'special' ? 'bg-purple-100 text-purple-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {memoItem.type === 'warning' ? '⚠️ 경고' :
                           memoItem.type === 'complaint' ? '📢 민원' :
                           memoItem.type === 'special' ? '⭐ 특이' :
                           'ℹ️ 일반'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(memoItem.createdAt).toLocaleString('ko-KR')}
                        </span>
                      </div>
                      <button
                        onClick={() => handleMemoDelete(memoItem._id)}
                        className="text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded hover:bg-red-50"
                      >
                        🗑️
                      </button>
                    </div>
                    <p className="text-sm text-gray-900 mb-1">{memoItem.content}</p>
                    <p className="text-xs text-gray-500">작성자: {memoItem.createdByName}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">아직 메모가 없습니다.</p>
                <p className="text-xs">위에서 새 메모를 추가해보세요.</p>
              </div>
            )}
          </div>
          
          {/* 닫기 버튼 */}
          <div className="flex gap-2 pt-4 border-t border-gray-200">
            <Button
              onClick={() => {
                setShowMemoModal(false);
                setSelectedMember(null);
                setMemo('');
                setMemoType('info');
              }}
              variant="secondary"
              className="w-full"
            >
              닫기
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default withAuth(CenterUsersManagement, { 
  requireTypes: ['centerAdmin', 'superAdmin'] 
});
