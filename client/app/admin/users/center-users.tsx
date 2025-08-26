"use client";

import { useState, useEffect } from 'react';
import apiClient from '@/utils/api';
import withAuth from '@/components/withAuth';
import { Button, Input, Card, Badge } from '@/components/ui';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  userType: 'student' | 'instructor';
  isActive: boolean;
  level?: string;
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
  createdAt: string;
}

function CenterUsersPage() {
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
      console.log('🌐 API 호출 시작:', `/users?page=${page}&limit=${pagination.limit}`);
      const res = await apiClient.get(`/users?page=${page}&limit=${pagination.limit}`);
      console.log('🔍 API 응답:', res);
      if (res.success && res.users) {
        console.log('✅ 사용자 목록 로드 성공:', res.users.length, '명');
        console.log('🔍 첫 번째 사용자 데이터 구조:', res.users[0]);
        console.log('🔍 모든 사용자 데이터:', res.users);
        setUsers(res.users);
        setPagination(prev => ({
          ...prev,
          page,
          total: res.pagination?.total || 0,
          pages: res.pagination?.pages || 0,
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
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSearch = () => {
    loadUsers(1);
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
    loadUsers(page);
  };

  const filteredUsers = users.filter(user => {
    console.log('🔍 필터링 중인 사용자:', {
      name: user.name,
      userType: user.userType,
      isActive: user.isActive,
      studentInfo: user.studentInfo,
      instructorInfo: user.instructorInfo
    });
    
    if (filters.userType && user.userType !== filters.userType) {
      console.log('❌ 사용자 유형 필터링 제외:', user.name, user.userType, '!==', filters.userType);
      return false;
    }
    
    if (filters.level) {
      // 사용자 유형에 따라 레벨 필드 확인
      let userLevel = null;
      if (user.userType === 'student' && user.studentInfo?.swimmingLevel) {
        userLevel = user.studentInfo.swimmingLevel;
      } else if (user.userType === 'instructor' && user.instructorInfo?.instructorLevel) {
        userLevel = user.instructorInfo.instructorLevel;
      } else if (user.level) {
        userLevel = user.level;
      }
      
      if (userLevel !== filters.level) {
        console.log('❌ 레벨 필터링 제외:', user.name, userLevel, '!==', filters.level);
        return false;
      }
    }
    
    if (filters.status !== 'all') {
      if (filters.status === 'active' && !user.isActive) {
        console.log('❌ 상태 필터링 제외 (비활성):', user.name);
        return false;
      }
      if (filters.status === 'inactive' && user.isActive) {
        console.log('❌ 상태 필터링 제외 (활성):', user.name);
        return false;
      }
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matches = (
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.phone.includes(searchLower)
      );
      if (!matches) {
        console.log('❌ 검색 필터링 제외:', user.name, '검색어:', filters.search);
        return false;
      }
    }
    
    console.log('✅ 필터링 통과:', user.name);
    return true;
  });
  
  console.log('📊 필터링 결과:', {
    전체사용자: users.length,
    필터링된사용자: filteredUsers.length,
    필터: filters
  });
  
  // 테이블 렌더링 디버깅
  console.log('🔍 테이블 렌더링 정보:', {
    filteredUsersLength: filteredUsers.length,
    filteredUsersData: filteredUsers,
    tableBody: filteredUsers.map(user => ({
      id: user._id,
      name: user.name,
      userType: user.userType
    }))
  });

  const getUserTypeLabel = (userType: string) => {
    switch (userType) {
      case 'student': return '회원';
      case 'instructor': return '강사';
      default: return userType;
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'beginner': return '초급';
      case 'intermediate': return '중급';
      case 'advanced': return '상급';
      default: return level;
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="default">활성</Badge>
    ) : (
      <Badge variant="destructive">비활성</Badge>
    );
  };

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
              <option value="instructor">강사</option>
              <option value="student">회원</option>
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
              <option value="beginner">초급</option>
              <option value="intermediate">중급</option>
              <option value="advanced">상급</option>
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
                                     <td className="px-6 py-4 whitespace-nowrap">
                     {(() => {
                       let userLevel = null;
                       if (user.userType === 'student' && user.studentInfo?.swimmingLevel) {
                         userLevel = user.studentInfo.swimmingLevel;
                       } else if (user.userType === 'instructor' && user.instructorInfo?.instructorLevel) {
                         userLevel = user.instructorInfo.instructorLevel;
                       } else if (user.level) {
                         userLevel = user.level;
                       }
                       
                       return userLevel ? (
                         <Badge variant="outline">
                           {getLevelLabel(userLevel)}
                         </Badge>
                       ) : null;
                     })()}
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
        <div className="flex justify-center">
          <nav className="flex space-x-2">
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
          </nav>
        </div>
      )}

      {/* 통계 정보 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card className="p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {users.filter(u => u.userType === 'instructor').length}
            </div>
            <div className="text-sm text-gray-600">전체 강사</div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.userType === 'student').length}
            </div>
            <div className="text-sm text-gray-600">전체 회원</div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {users.filter(u => u.isActive).length}
            </div>
            <div className="text-sm text-gray-600">활성 사용자</div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default withAuth(CenterUsersPage, { requireTypes: ['centerAdmin'] });
