'use client';
import { logger } from '@/lib/logger';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Users, Search, Filter, UserCheck, UserX, Mail, Phone } from 'lucide-react';
import withAuth from '../../../components/withAuth';
import { LoadingState, PageHeader } from '@/components/common';
import type { User } from '@/types/user';

function CenterUsersManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    if (user) {
      loadUsers();
    }
  }, [user]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      // 임시 데이터
      const tempUsers: User[] = [
        {
          _id: '1',
          userId: '1',
          name: '김학생',
          email: 'student@example.com',
          phone: '010-1234-5678',
          userType: 'student',
          level: 'beginner',
          status: 'active',
          createdAt: new Date('2024-01-15'),
          lastLoginAt: new Date('2024-01-20')
        },
        {
          _id: '2',
          userId: '2',
          name: '이강사',
          email: 'instructor@example.com',
          phone: '010-2345-6789',
          userType: 'instructor',
          level: 'senior',
          status: 'active',
          createdAt: new Date('2024-01-10'),
          lastLoginAt: new Date('2024-01-19')
        },
        {
          _id: '3',
          userId: '3',
          name: '박관리자',
          email: 'admin@example.com',
          phone: '010-3456-7890',
          userType: 'centerAdmin',
          level: 'manager',
          status: 'active',
          createdAt: new Date('2024-01-05'),
          lastLoginAt: new Date('2024-01-20')
        }
      ];
      setUsers(tempUsers);
    } catch (error) {
      logger.error('사용자 목록 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === '' || user.userType === filterType;
    return matchesSearch && matchesFilter;
  });

  const getUserTypeLabel = (userType?: string) => {
    if (!userType) return '-';
    const types: { [key: string]: string } = {
      'student': '학생',
      'instructor': '강사',
      'centerAdmin': '센터관리자'
    };
    return types[userType] || userType;
  };

  const getStatusLabel = (status?: string) => {
    if (!status) return '-';
    const statuses: { [key: string]: string } = {
      'active': '활성',
      'inactive': '비활성',
      'pending': '대기'
    };
    return statuses[status] || status;
  };

  const getStatusColor = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    const colors: { [key: string]: string } = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-red-100 text-red-800',
      'pending': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingState message="로딩 중..." size="md" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="👥 센터 사용자 관리"
        description="센터에 등록된 사용자들을 관리하고 권한을 설정하세요"
      />

      {/* 검색 및 필터 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="이름 또는 이메일로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">모든 유형</option>
              <option value="student">학생</option>
              <option value="instructor">강사</option>
              <option value="centerAdmin">센터관리자</option>
            </select>
          </div>
        </div>
      </div>

      {/* 사용자 목록 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            사용자 목록 ({filteredUsers.length}명)
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  사용자
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  유형
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  가입일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  마지막 로그인
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <Users className="w-5 h-5 text-gray-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {getUserTypeLabel(user.userType || undefined)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor((user as any).status || undefined)}`}>
                      {getStatusLabel((user as any).status || undefined)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.createdAt ? (typeof user.createdAt === 'string' ? new Date(user.createdAt).toLocaleDateString() : user.createdAt.toLocaleDateString()) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLoginAt ? (typeof user.lastLoginAt === 'string' ? new Date(user.lastLoginAt).toLocaleDateString() : user.lastLoginAt.toLocaleDateString()) : '로그인 기록 없음'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default withAuth(CenterUsersManagement, { 
  requireTypes: ['centerAdmin', 'superAdmin'] 
});