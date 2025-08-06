import { useState, useEffect } from 'react';
import apiClient from '../../utils/api';
import { LoadingSpinner, Button, Badge } from '../../components/ui';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('전체');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    userType: 'member',
    phone: ''
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.getUsers();
        
        if (response.data && Array.isArray(response.data)) {
          setUsers(response.data);
        } else if (response.data && !Array.isArray(response.data)) {
          // If response.data exists but is not an array, set empty array
          setUsers([]);
        } else if (response.error) {
          setError(response.error);
          setUsers([]);
        } else {
          // If no data or error, set empty array
          setUsers([]);
        }
      } catch (err) {
        setError('사용자 목록을 불러오는데 실패했습니다.');
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleFilter = (filterType: string) => {
    setFilter(filterType);
  };

  const handleAddUser = () => {
    setFormData({
      name: '',
      email: '',
      userType: 'member',
      phone: ''
    });
    setShowAddModal(true);
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      userType: user.userType || 'member',
      phone: user.phone || ''
    });
    setShowEditModal(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('정말로 이 사용자를 삭제하시겠습니까?')) {
      try {
        const response = await apiClient.deleteUser(userId);
        if (response.data) {
          setUsers(users.filter(user => user._id !== userId));
          alert('사용자가 삭제되었습니다.');
        } else {
          alert('삭제에 실패했습니다.');
        }
      } catch (err) {
        alert('삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (showAddModal) {
        // createUser 메서드가 없으므로 signup을 사용하거나 기능을 제한
        alert('사용자 추가 기능은 서버에서 구현됩니다.');
        setShowAddModal(false);
      } else if (selectedUser) {
        const response = await apiClient.updateUser(selectedUser._id, formData);
        if (response.data) {
          setUsers(users.map(user => 
            user._id === selectedUser._id ? { ...user, ...formData } : user
          ));
          setShowEditModal(false);
          alert('사용자 정보가 수정되었습니다.');
        }
      }
    } catch (err) {
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  const filteredUsers = users.filter(user => {
    if (filter === '전체') return true;
    if (filter === '회원') return user.userType === 'member';
    if (filter === '강사') return user.userType === 'instructor';
    if (filter === '관리자') return user.userType === 'admin';
    return true;
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">사용자 관리</h1>
          <p className="text-gray-600">회원 및 강사 정보를 관리하세요</p>
        </div>

        {isLoading ? (
                      <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <LoadingSpinner size="lg" className="mx-auto" />
                <p className="mt-4 text-gray-600">로딩 중...</p>
              </div>
            </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">사용자 목록</h3>
                                  <Button 
                    onClick={handleAddUser}
                    variant="primary"
                  >
                    + 새 사용자 추가
                  </Button>
              </div>
              
              <div className="flex space-x-4 mb-6">
                <button 
                  onClick={() => handleFilter('전체')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filter === '전체' 
                      ? 'bg-primary text-white' 
                      : 'text-gray-600 hover:text-primary'
                  }`}
                >
                  전체
                </button>
                <button 
                  onClick={() => handleFilter('회원')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filter === '회원' 
                      ? 'bg-primary text-white' 
                      : 'text-gray-600 hover:text-primary'
                  }`}
                >
                  회원
                </button>
                <button 
                  onClick={() => handleFilter('강사')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filter === '강사' 
                      ? 'bg-primary text-white' 
                      : 'text-gray-600 hover:text-primary'
                  }`}
                >
                  강사
                </button>
                <button 
                  onClick={() => handleFilter('관리자')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filter === '관리자' 
                      ? 'bg-primary text-white' 
                      : 'text-gray-600 hover:text-primary'
                  }`}
                >
                  관리자
                </button>
              </div>

              <div className="space-y-4">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {filter === '전체' ? '등록된 사용자가 없습니다.' : `${filter} 사용자가 없습니다.`}
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <div key={user._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary font-semibold">{user.name?.charAt(0) || 'U'}</span>
                        </div>
                        <div>
                          <p className="text-gray-900 font-semibold">{user.name || '이름 없음'}</p>
                          <p className="text-gray-500 text-sm">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={
                            user.userType === 'member' ? 'success' :
                            user.userType === 'instructor' ? 'primary' :
                            'secondary'
                          }
                          size="sm"
                        >
                          {user.userType === 'member' ? '회원' : 
                           user.userType === 'instructor' ? '강사' : '관리자'}
                        </Badge>
                        <button 
                          onClick={() => handleEditUser(user)}
                          className="text-primary hover:text-primary-800 text-sm"
                        >
                          수정
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user._id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">새 사용자 추가</h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">사용자 유형</label>
                  <select
                    value={formData.userType}
                    onChange={(e) => setFormData({...formData, userType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="member">회원</option>
                    <option value="instructor">강사</option>
                    <option value="admin">관리자</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                >
                  추가
                </Button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">사용자 정보 수정</h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">사용자 유형</label>
                  <select
                    value={formData.userType}
                    onChange={(e) => setFormData({...formData, userType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="member">회원</option>
                    <option value="instructor">강사</option>
                    <option value="admin">관리자</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                >
                  수정
                </Button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 