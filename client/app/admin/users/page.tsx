"use client";

import { useState, useEffect } from 'react';
import apiClient from '@/utils/api';
import withAuth from '@/components/withAuth';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  userType: 'student' | 'instructor' | 'centerAdmin' | 'superAdmin';
  isActive: boolean;
  level?: string;
  studentInfo?: {
    swimmingLevel?: string;
    age?: number;
  };
  instructorInfo?: {
    instructorLevel?: string;
    experience?: string;
  };
  centerAdminInfo?: {
    adminLevel?: string;
    permissions?: {
      canManageUsers?: boolean;
      canManageCourses?: boolean;
      canManageBookings?: boolean;
      canManagePayments?: boolean;
      canManageNotices?: boolean;
      canViewReports?: boolean;
    };
  };
  superAdminInfo?: {
    adminLevel?: string;
    systemPermissions?: {
      canManageAllUsers?: boolean;
      canManageAllCenters?: boolean;
      canManageSystemSettings?: boolean;
      canViewAllReports?: boolean;
      canManageSkillTemplates?: boolean;
    };
  };
  createdAt: string;
}

function AdminUsersPage() {
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
    limit: 10,
    total: 0,
    pages: 0,
  });

  const loadUsers = async (page = 1) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.userType && { userType: filters.userType }),
        ...(filters.level && { level: filters.level }),
        ...(filters.search && { search: filters.search }),
        ...(filters.status !== 'all' && { status: filters.status }),
      });

      const res = await apiClient.getUsers({
        page,
        limit: pagination.limit,
        role: filters.userType,
        centerId: filters.level
      });
      if (res.data?.users) {
        setUsers(res.data.users);
        setPagination(prev => ({
          ...prev,
          page,
          total: res.data.pagination?.total || 0,
          pages: res.data.pagination?.pages || 0,
        }));
      }
    } catch (error) {
      console.error('사용자 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    loadUsers(1);
  }, [filters]);

  const handleAddUser = () => {
    setShowAddModal(true);
  };

  const handleEditUser = (userId: string) => {
    const user = users.find(u => u._id === userId);
    if (user) {
      setEditingUser(user);
      setShowEditModal(true);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const user = users.find(u => u._id === userId);
    if (!user || !confirm(`정말로 ${user.name} 사용자를 삭제하시겠습니까?`)) return;
    
    try {
      const res = await apiClient.deleteUser(userId);
      if (!res.error) {
        await loadUsers(pagination.page);
        alert('사용자가 삭제되었습니다.');
      } else {
        alert(res.error);
      }
    } catch (error) {
      alert('사용자 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleSaveUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.phone) { 
      alert('모든 필수 항목을 입력해주세요.'); 
      return; 
    }
    
    try {
      const res = await apiClient.createUser({
        userId: newUser.email,
        name: newUser.name,
        email: newUser.email,
        password: 'password123',
        phone: newUser.phone,
        address: '',
        userType: newUser.userType,
        level: newUser.level,
      });
      
      if (!res.error) {
        setShowAddModal(false);
        setNewUser({ name: '', email: '', phone: '', userType: 'student', level: 'beginner' });
        await loadUsers(pagination.page);
        alert('사용자가 생성되었습니다.');
      } else {
        alert(res.error);
      }
    } catch (error) {
      alert('사용자 생성 중 오류가 발생했습니다.');
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    
    try {
      const res = await apiClient.updateUser(editingUser._id, {
        name: editingUser.name,
        phone: editingUser.phone,
        userType: editingUser.userType,
        level: editingUser.level,
      });
      
      if (!res.error) {
        setShowEditModal(false);
        setEditingUser(null);
        await loadUsers(pagination.page);
        alert('사용자 정보가 업데이트되었습니다.');
      } else {
        alert(res.error);
      }
    } catch (error) {
      alert('사용자 정보 업데이트 중 오류가 발생했습니다.');
    }
  };

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case 'student': return 'bg-blue-100 text-blue-800';
      case 'instructor': return 'bg-green-100 text-green-800';
      case 'centerAdmin': return 'bg-purple-100 text-purple-800';
      case 'superAdmin': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUserTypeText = (userType: string) => {
    switch (userType) {
      case 'student': return '수강생';
      case 'instructor': return '강사';
      case 'centerAdmin': return '센터 관리자';
      case 'superAdmin': return '시스템 관리자';
      default: return userType;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelText = (user: User) => {
    switch (user.userType) {
      case 'student':
        return user.studentInfo?.swimmingLevel || user.level || '초급';
      case 'instructor':
        return user.instructorInfo?.instructorLevel || user.level || '주니어';
      case 'centerAdmin':
        return user.centerAdminInfo?.adminLevel || user.level || '어시스턴트';
      case 'superAdmin':
        return user.superAdminInfo?.adminLevel || user.level || '관리자';
      default:
        return user.level || '초급';
    }
  };

  const getPermissionsText = (user: User) => {
    if (user.userType === 'centerAdmin' && user.centerAdminInfo?.permissions) {
      const perms = user.centerAdminInfo.permissions;
      const activePerms = Object.entries(perms).filter(([_, value]) => value).length;
      return `${activePerms}개 권한`;
    } else if (user.userType === 'superAdmin' && user.superAdminInfo?.systemPermissions) {
      const perms = user.superAdminInfo.systemPermissions;
      const activePerms = Object.entries(perms).filter(([_, value]) => value).length;
      return `${activePerms}개 시스템 권한`;
    }
    return '-';
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    loadUsers(page);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">사용자 관리</h1>
            <p className="text-xl text-gray-600">전체 사용자 목록 및 권한 관리</p>
          </div>
          <button
            onClick={handleAddUser}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold"
          >
            + 새 사용자 추가
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">필터 및 검색</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">사용자 유형</label>
              <select
                value={filters.userType}
                onChange={(e) => handleFilterChange('userType', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">전체</option>
                <option value="student">수강생</option>
                <option value="instructor">강사</option>
                <option value="centerAdmin">센터 관리자</option>
                <option value="superAdmin">시스템 관리자</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">레벨</label>
              <select
                value={filters.level}
                onChange={(e) => handleFilterChange('level', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">전체</option>
                <option value="beginner">초급</option>
                <option value="intermediate">중급</option>
                <option value="advanced">고급</option>
                <option value="expert">전문가</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">전체</option>
                <option value="active">활성</option>
                <option value="inactive">비활성</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">검색</label>
              <input
                type="text"
                placeholder="이름, 이메일, 전화번호"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">사용자 목록을 불러오는 중...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      이름
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      이메일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      전화번호
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      유형
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      레벨
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      권한
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      가입일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUserTypeColor(user.userType)}`}>
                          {getUserTypeText(user.userType)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getLevelText(user)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getPermissionsText(user)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user.isActive ? 'active' : 'inactive')}`}>
                          {user.isActive ? '활성' : '비활성'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditUser(user._id)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex space-x-2">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 rounded-lg text-lg font-semibold transition-colors ${
                    page === pagination.page
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add User Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">새 사용자 추가</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">전화번호</label>
                  <input
                    type="tel"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">사용자 유형</label>
                  <select
                    value={newUser.userType}
                    onChange={(e) => setNewUser({ ...newUser, userType: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="student">수강생</option>
                    <option value="instructor">강사</option>
                    <option value="centerAdmin">센터 관리자</option>
                    <option value="superAdmin">시스템 관리자</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">레벨</label>
                  <select
                    value={newUser.level}
                    onChange={(e) => setNewUser({ ...newUser, level: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="beginner">초급</option>
                    <option value="intermediate">중급</option>
                    <option value="advanced">고급</option>
                    <option value="expert">전문가</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-4 mt-6">
                <button
                  onClick={handleSaveUser}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  추가
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">사용자 정보 수정</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
                  <input
                    type="text"
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">전화번호</label>
                  <input
                    type="tel"
                    value={editingUser.phone}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">사용자 유형</label>
                  <select
                    value={editingUser.userType}
                    onChange={(e) => setEditingUser({ ...editingUser, userType: e.target.value as any })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="student">수강생</option>
                    <option value="instructor">강사</option>
                    <option value="centerAdmin">센터 관리자</option>
                    <option value="superAdmin">시스템 관리자</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">레벨</label>
                  <select
                    value={editingUser.level || 'beginner'}
                    onChange={(e) => setEditingUser({ ...editingUser, level: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="beginner">초급</option>
                    <option value="intermediate">중급</option>
                    <option value="advanced">고급</option>
                    <option value="expert">전문가</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-4 mt-6">
                <button
                  onClick={handleUpdateUser}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  수정
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(AdminUsersPage, { requireTypes: ['centerAdmin', 'superAdmin'], requirePermission: 'userManagement' });
