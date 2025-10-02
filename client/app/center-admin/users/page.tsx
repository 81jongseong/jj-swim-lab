'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Users, UserPlus, Search, Filter, Edit, Trash2, Mail, Phone, Calendar } from 'lucide-react';
import withAuth from '@/components/withAuth';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  userType: 'student' | 'instructor' | 'centerAdmin';
  status: 'active' | 'inactive' | 'pending';
  joinedAt: Date;
  lastLogin?: Date;
  membershipType?: string;
  membershipExpiry?: Date;
  totalClasses?: number;
  totalPayments?: number;
}

function CenterUsersManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

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
          name: '김학생',
          email: 'student1@example.com',
          phone: '010-1234-5678',
          userType: 'student',
          status: 'active',
          joinedAt: new Date('2024-01-15'),
          lastLogin: new Date('2024-01-20'),
          membershipType: '기본 멤버십',
          membershipExpiry: new Date('2024-02-15'),
          totalClasses: 12,
          totalPayments: 80000
        },
        {
          _id: '2',
          name: '이학생',
          email: 'student2@example.com',
          phone: '010-2345-6789',
          userType: 'student',
          status: 'active',
          joinedAt: new Date('2024-01-10'),
          lastLogin: new Date('2024-01-19'),
          membershipType: '프리미엄 멤버십',
          membershipExpiry: new Date('2024-02-10'),
          totalClasses: 18,
          totalPayments: 120000
        },
        {
          _id: '3',
          name: '박강사',
          email: 'instructor1@example.com',
          phone: '010-3456-7890',
          userType: 'instructor',
          status: 'active',
          joinedAt: new Date('2023-12-01'),
          lastLogin: new Date('2024-01-20'),
          totalClasses: 45,
          totalPayments: 0
        },
        {
          _id: '4',
          name: '최학생',
          email: 'student3@example.com',
          phone: '010-4567-8901',
          userType: 'student',
          status: 'inactive',
          joinedAt: new Date('2023-11-20'),
          lastLogin: new Date('2024-01-05'),
          membershipType: '기본 멤버십',
          membershipExpiry: new Date('2024-01-20'),
          totalClasses: 8,
          totalPayments: 80000
        }
      ];
      setUsers(tempUsers);
    } catch (error) {
      console.error('회원 목록 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.phone && user.phone.includes(searchTerm));
    const matchesStatus = statusFilter === '' || user.status === statusFilter;
    const matchesType = typeFilter === '' || user.userType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusLabel = (status: string) => {
    const statuses: { [key: string]: string } = {
      'active': '활성',
      'inactive': '비활성',
      'pending': '대기중'
    };
    return statuses[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-red-100 text-red-800',
      'pending': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getUserTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'student': '학생',
      'instructor': '강사',
      'centerAdmin': '센터관리자'
    };
    return types[type] || type;
  };

  const getUserTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'student': 'bg-blue-100 text-blue-800',
      'instructor': 'bg-purple-100 text-purple-800',
      'centerAdmin': 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user._id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">회원 목록을 불러오는 중...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          센터 회원 관리 👥
        </h1>
        <p className="text-gray-600">센터의 모든 회원을 관리하고 모니터링하세요</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 회원</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}명</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <UserPlus className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">활성 회원</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.status === 'active').length}명
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">이번 달 신규</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => 
                  u.joinedAt.getMonth() === new Date().getMonth() &&
                  u.joinedAt.getFullYear() === new Date().getFullYear()
                ).length}명
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Mail className="w-8 h-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">학생 비율</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round((users.filter(u => u.userType === 'student').length / users.length) * 100)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="이름, 이메일, 전화번호로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">모든 상태</option>
              <option value="active">활성</option>
              <option value="inactive">비활성</option>
              <option value="pending">대기중</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">모든 타입</option>
              <option value="student">학생</option>
              <option value="instructor">강사</option>
              <option value="centerAdmin">센터관리자</option>
            </select>
          </div>
        </div>
      </div>

      {/* 회원 목록 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">회원 목록</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  회원 정보
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  타입
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  멤버십
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  활동 정보
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  가입일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  액션
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
                      {user.phone && (
                        <div className="text-sm text-gray-500">{user.phone}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUserTypeColor(user.userType)}`}>
                      {getUserTypeLabel(user.userType)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user.status)}`}>
                      {getStatusLabel(user.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.membershipType ? (
                      <div>
                        <div>{user.membershipType}</div>
                        {user.membershipExpiry && (
                          <div className="text-xs text-gray-500">
                            만료: {user.membershipExpiry.toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.userType === 'student' ? (
                      <div>
                        <div>수업: {user.totalClasses || 0}회</div>
                        <div>결제: {user.totalPayments ? user.totalPayments.toLocaleString() : 0}원</div>
                      </div>
                    ) : user.userType === 'instructor' ? (
                      <div>
                        <div>수업: {user.totalClasses || 0}회</div>
                        <div>담당 학생: -</div>
                      </div>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.joinedAt.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => toggleUserStatus(user._id)}
                        className={`${user.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                      >
                        {user.status === 'active' ? '비활성화' : '활성화'}
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">검색 결과가 없습니다.</p>
        </div>
      )}
    </div>
  );
}

export default withAuth(CenterUsersManagement, { 
  requireTypes: ['centerAdmin', 'superAdmin'] 
});