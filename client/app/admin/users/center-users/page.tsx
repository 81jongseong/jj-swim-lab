"use client";

import { useState, useEffect } from 'react';
import apiClient from '../../../../utils/api';
import withAuth from '../../../../components/withAuth';
import { useAuth } from '../../../../hooks/useAuth';
import { Button, Input, Card, Badge } from '../../../../components/ui';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  userType: 'student' | 'instructor' | 'centerAdmin' | 'superAdmin';
  isActive: boolean;
  level?: string;
  centerId?: string;
  centerInfo?: {
    _id: string;
    name: string;
    address?: {
      city: string;
      province: string;
      address1: string;
    };
    grade?: string;
  };
  studentInfo?: {
    swimmingLevel?: string;
    age?: number;
    parentName?: string;
    parentPhone?: string;
  };
  instructorInfo?: {
    instructorLevel?: string;
    experience?: string;
    specialties?: string[];
  };
  centerAdminInfo?: {
    adminLevel?: string;
    permissions?: string[];
  };
  superAdminInfo?: {
    systemPermissions?: string[];
  };
  createdAt: string;
}

function CenterUsersPage() {
  const { user: currentUser } = useAuth(); // 현재 로그인한 사용자 정보
  console.log('🧪 TEST: CenterUsersPage 컴포넌트 렌더링 시작');
  console.log('🔍 현재 시간:', new Date().toISOString());
  console.log('🔍 컴포넌트가 실행되고 있습니다!');
  console.log('🧪 이 로그가 보인다면 컴포넌트가 정상적으로 렌더링되고 있습니다!');
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<any>({
    name: '',
    email: '',
    phone: '',
    userType: 'student',
    level: 'beginner',
  });

  // 필터링 상태
  const [filters, setFilters] = useState({
    userType: '',
    level: '',
    search: '',
    status: 'all',
  });

  // 페이지네이션
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  const loadUsers = async (page = 1) => {
    console.log('🧪 TEST: loadUsers 함수 호출됨, 페이지:', page);
    console.log('🔍 loadUsers 함수가 실행되고 있습니다!');
    console.log('🔍 현재 시간:', new Date().toISOString());
    console.log('🧪 이 로그가 보인다면 loadUsers 함수가 정상적으로 실행되고 있습니다!');
    setLoading(true);
    try {
      // 센터 계정만 해당 센터의 사용자들을 조회
      console.log('🌐 API 호출 시작:', `/api/users?page=${page}&limit=${pagination.limit}`);
      const res = await apiClient.get<{
        success: boolean;
        users?: any[];
        pagination?: { total: number };
        error?: string;
      }>(`/api/users?page=${page}&limit=${pagination.limit}`);
      console.log('🔍 API 응답:', res);
      if ((res as any).users && Array.isArray((res as any).users)) {
        console.log('✅ 사용자 목록 로드 성공:', (res as any).users.length, '명');
        console.log('🔍 첫 번째 사용자 데이터 구조:', (res as any).users[0]);
        console.log('🔍 모든 사용자 데이터:', (res as any).users);
        
        // 🔐 현재 로그인한 사용자를 목록에서 제외
        const filteredUsers = (res as any).users.filter((user: User) => 
          currentUser && user._id !== currentUser._id
        );
        console.log(`👥 전체 사용자: ${(res as any).users.length}명, 필터링 후: ${filteredUsers.length}명`);
        
        setUsers(filteredUsers);
        setPagination(prev => ({
          ...prev,
          page,
          total: (res as any).pagination?.total || 0,
          pages: (res as any).pagination?.pages || 0,
        }));
      } else {
        console.error('❌ 응답에 users 필드가 없음:', res);
      }
    } catch (error) {
      console.error('사용자 목록 로드 실패:', error);
    } finally {
      setLoading(false);
      console.log('🏁 loadUsers 함수 완료');
    }
  };

  useEffect(() => {
    console.log('⚡ useEffect 실행됨 - loadUsers 호출');
    loadUsers();
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    loadUsers(1);
  };

  const handlePageChange = (page: number) => {
    loadUsers(page);
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
        활성
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
        비활성
      </span>
    );
  };

  const getUserTypeLabel = (userType: string) => {
    switch (userType) {
      case 'student': return '수강생';
      case 'instructor': return '강사';
      case 'centerAdmin': return '센터관리자';
      case 'superAdmin': return '최고관리자';
      default: return userType;
    }
  };

  const getLevelLabel = (user: User) => {
    switch (user.userType) {
      case 'student':
        // 학생은 메달 등급 시스템 사용 (studentInfo.swimmingLevel 우선 사용)
        const studentLevel = user.studentInfo?.swimmingLevel || 'beginner';
        const studentLevelMap: { [key: string]: string } = {
          'beginner': '🥉 브론즈',
          'intermediate': '🥈 실버',
          'advanced': '🥇 골드',
          'expert': '💎 플래티넘'
        };
        return studentLevelMap[studentLevel] || '🥉 브론즈';
      case 'instructor':
        // 강사는 전문직 등급 시스템 사용 (instructorInfo.instructorLevel 우선 사용)
        const instructorLevel = user.instructorInfo?.instructorLevel || 'junior';
        const instructorLevelMap: { [key: string]: string } = {
          'trainee': '🔰 신입 강사',
          'junior': '📈 주니어 강사',
          'senior': '🏆 시니어 강사',
          'master': '👑 마스터 강사'
        };
        return instructorLevelMap[instructorLevel] || '📈 주니어 강사';
      case 'centerAdmin':
        // 센터관리자는 관리직 등급 시스템 사용 (centerAdminInfo.adminLevel 우선 사용)
        const centerAdminLevel = user.centerAdminInfo?.adminLevel || 'assistant';
        const centerAdminLevelMap: { [key: string]: string } = {
          'assistant': '🔰 어시스턴트',
          'manager': '📈 매니저',
          'director': '🏆 디렉터',
          'executive': '👑 임원'
        };
        return centerAdminLevelMap[centerAdminLevel] || '🔰 어시스턴트';
      case 'superAdmin':
        return '👑 시스템 관리자';
      default:
        return '🥉 브론즈';
    }
  };

  // 필터링된 사용자 목록
  const filteredUsers = users.filter(user => {
    if (filters.userType && user.userType !== filters.userType) return false;
    if (filters.level && user.level !== filters.level) return false;
    if (filters.status !== 'all') {
      if (filters.status === 'active' && !user.isActive) return false;
      if (filters.status === 'inactive' && user.isActive) return false;
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.phone.includes(searchLower)
      );
    }
    return true;
  });

  console.log('🔍 필터링 결과:', {
    전체사용자: users.length,
    필터링된사용자: filteredUsers.length,
    필터: filters
  });

  // 테이블 렌더링 정보 로깅
  const tableBody = filteredUsers.map(user => ({
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    userType: user.userType,
    level: user.level,
    isActive: user.isActive,
    createdAt: user.createdAt
  }));

  console.log('🔍 테이블 렌더링 정보:', {
    filteredUsersLength: filteredUsers.length,
    filteredUsersData: tableBody,
    tableBody: tableBody
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">사용자 관리</h1>
        <p className="text-gray-600">센터에 등록된 강사와 회원을 관리합니다.</p>
      </div>

      {/* 필터 및 검색 */}
      <Card className="mb-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">사용자 유형</label>
            <select
              value={filters.userType}
              onChange={(e) => handleFilterChange('userType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">전체</option>
              <option value="student">수강생</option>
              <option value="instructor">강사</option>
              <option value="centerAdmin">센터관리자</option>
              <option value="superAdmin">최고관리자</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">레벨</label>
            <select
              value={filters.level}
              onChange={(e) => handleFilterChange('level', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">전체</option>
              <option value="beginner">🥉 브론즈</option>
              <option value="intermediate">🥈 실버</option>
              <option value="advanced">🥇 골드</option>
              <option value="expert">💎 플래티넘</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전체</option>
              <option value="active">활성</option>
              <option value="inactive">비활성</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">검색</label>
            <div className="flex">
              <Input
                type="text"
                placeholder="이름, 이메일, 전화번호"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSearch} className="ml-2">
                검색
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* 사용자 목록 */}
      <Card className="mb-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  사용자 정보
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  유형
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  레벨
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  등록일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      <div className="text-sm text-gray-500">{user.phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={user.userType === 'instructor' ? 'default' : 'secondary'}>
                      {getUserTypeLabel(user.userType)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getLevelLabel(user)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(user.isActive)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingUser(user);
                        setShowEditModal(true);
                      }}
                      className="mr-2"
                    >
                      수정
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 페이지네이션 */}
      {pagination.pages > 1 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              총 {pagination.total}명의 사용자
            </div>
            <div className="flex space-x-2">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === pagination.page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* 통계 정보 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">전체 강사</p>
              <p className="text-2xl font-semibold text-gray-900">
                {users.filter(u => u.userType === 'instructor').length}명
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">전체 회원</p>
              <p className="text-2xl font-semibold text-gray-900">
                {users.filter(u => u.userType === 'student').length}명
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">활성 사용자</p>
              <p className="text-2xl font-semibold text-gray-900">
                {users.filter(u => u.isActive).length}명
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default withAuth(CenterUsersPage);
