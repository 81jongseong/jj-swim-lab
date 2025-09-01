'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, Button, LoadingSpinner, Badge } from '@/components/ui';
import { getCenterUsers, updateUserStatus, type User } from '../../../lib/api/users';
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  EyeOff, 
  Edit, 
  RefreshCw,
  UserCheck,
  UserX,
  GraduationCap,
  User as UserIcon,
  Building
} from 'lucide-react';
import withAuth from '../../../components/withAuth';

function CenterUsersManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  
  // 필터 상태
  const [filters, setFilters] = useState({
    userType: '',
    level: '',
    search: '',
    status: 'all'
  });

  useEffect(() => {
    if (user) {
      loadCenterUsers();
    }
  }, [user, currentPage, filters]);

  const loadCenterUsers = async () => {
    try {
      setIsLoading(true);
      const result = await getCenterUsers({
        page: currentPage,
        limit: 20,
        ...filters
      });
      
      setUsers(result.users);
      setTotalPages(result.pagination.pages);
      setTotalUsers(result.pagination.total);
    } catch (error) {
      console.error('센터 사용자 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // 필터 변경 시 첫 페이지로
  };

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    try {
      await updateUserStatus(userId, !currentStatus);
      // 상태 업데이트 후 목록 새로고침
      loadCenterUsers();
    } catch (error) {
      console.error('사용자 상태 변경 실패:', error);
      alert('사용자 상태 변경에 실패했습니다.');
    }
  };

  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case 'instructor':
        return <GraduationCap className="w-4 h-4" />;
      case 'student':
        return <UserIcon className="w-4 h-4" />;
      case 'centerAdmin':
        return <Building className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getUserTypeLabel = (userType: string) => {
    switch (userType) {
      case 'instructor':
        return '강사';
      case 'student':
        return '회원';
      case 'centerAdmin':
        return '센터관리자';
      default:
        return userType;
    }
  };

  const getLevelInfo = (user: User) => {
    if (user.userType === 'student' && user.studentInfo) {
      return user.studentInfo.swimmingLevel;
    }
    if (user.userType === 'instructor' && user.instructorInfo) {
      return user.instructorInfo.instructorLevel;
    }
    return '정보 없음';
  };

  const getCenterInfo = (user: User) => {
    if (user.userType === 'instructor' && user.instructorInfo?.assignedCenters) {
      return user.instructorInfo.assignedCenters.join(', ');
    }
    if (user.userType === 'student' && user.studentInfo?.enrolledCenters) {
      return user.studentInfo.enrolledCenters.join(', ');
    }
    return '정보 없음';
  };

  if (isLoading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="센터 사용자 목록을 불러오는 중..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          👥 센터 사용자 관리
        </h1>
        <p className="text-sm text-gray-600">
          소속 강사와 회원을 관리하고 모니터링하세요
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">전체 사용자</p>
                <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">강사</p>
                <p className="text-2xl font-bold text-green-600">
                  {users.filter(u => u.userType === 'instructor').length}
                </p>
              </div>
              <GraduationCap className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">회원</p>
                <p className="text-2xl font-bold text-purple-600">
                  {users.filter(u => u.userType === 'student').length}
                </p>
              </div>
                              <UserIcon className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">활성 사용자</p>
                <p className="text-2xl font-bold text-blue-600">
                  {users.filter(u => u.isActive).length}
                </p>
              </div>
              <UserCheck className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 필터 및 검색 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            필터 및 검색
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* 검색 */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="이름, 이메일, 전화번호로 검색..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* 사용자 유형 */}
            <div>
              <select
                value={filters.userType}
                onChange={(e) => handleFilterChange('userType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">전체 유형</option>
                <option value="instructor">강사</option>
                <option value="student">회원</option>
              </select>
            </div>
            
            {/* 레벨 */}
            <div>
              <select
                value={filters.level}
                onChange={(e) => handleFilterChange('level', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">전체 레벨</option>
                <option value="기초">기초</option>
                <option value="초급">초급</option>
                <option value="중급">중급</option>
                <option value="상급">상급</option>
                <option value="마스터">마스터</option>
              </select>
            </div>
            
            {/* 상태 */}
            <div>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">전체 상태</option>
                <option value="active">활성</option>
                <option value="inactive">비활성</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 사용자 목록 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              사용자 목록
            </CardTitle>
            <Button onClick={loadCenterUsers} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              새로고침
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">사용자</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">유형</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">레벨</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">센터</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">상태</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">가입일</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          {user.phone && (
                            <div className="text-sm text-gray-500">{user.phone}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getUserTypeIcon(user.userType)}
                          <Badge variant="outline">
                            {getUserTypeLabel(user.userType)}
                          </Badge>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary">
                          {getLevelInfo(user)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-600 max-w-xs truncate">
                          {getCenterInfo(user)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={user.isActive ? 'default' : 'secondary'}>
                          {user.isActive ? '활성' : '비활성'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-600">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusToggle(user._id, user.isActive)}
                            className={user.isActive ? 'text-red-600 border-red-300' : 'text-green-600 border-green-300'}
                          >
                            {user.isActive ? (
                              <>
                                <EyeOff className="w-4 h-4 mr-1" />
                                비활성화
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4 mr-1" />
                                활성화
                              </>
                            )}
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-1" />
                            수정
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>검색 조건에 맞는 사용자가 없습니다.</p>
              <p className="text-sm">필터 조건을 변경해보세요.</p>
            </div>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                이전
              </Button>
              
              <span className="text-sm text-gray-600">
                {currentPage} / {totalPages} 페이지
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                다음
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default withAuth(CenterUsersManagement, { 
  requireTypes: ['centerAdmin', 'superAdmin'] 
});
