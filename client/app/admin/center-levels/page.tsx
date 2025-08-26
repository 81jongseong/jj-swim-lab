"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Button, Input, Card, Badge } from '@/components/ui';

interface CenterLevel {
  _id: string;
  centerId: string;
  name: string;
  displayName: string;
  order: number;
  color: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function CenterLevelsPage() {
  const { user } = useAuth();
  const [levels, setLevels] = useState<CenterLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<CenterLevel | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    order: 0,
    color: 'blue',
    description: ''
  });

  const isCenterAdmin = user?.userType === 'centerAdmin';
  const isSuperAdmin = user?.userType === 'superAdmin';

  useEffect(() => {
    if (isCenterAdmin || isSuperAdmin) {
      fetchCenterLevels();
    }
  }, [user]);

  const fetchCenterLevels = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ JWT 토큰이 없습니다.');
        return;
      }

      const response = await fetch('http://localhost:5000/api/center-levels', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ 센터 레벨 목록 로드 성공:', data);
        setLevels(data.data || []);
      } else {
        console.error('❌ 센터 레벨 목록 로드 실패:', response.status);
      }
    } catch (error) {
      console.error('❌ 센터 레벨 목록 로드 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('인증 토큰이 없습니다.');
        return;
      }

      const url = editingLevel 
        ? `http://localhost:5000/api/center-levels/${editingLevel._id}`
        : 'http://localhost:5000/api/center-levels';
      
      const method = editingLevel ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ 센터 레벨 저장 성공:', result);
        
        alert(editingLevel ? '레벨이 수정되었습니다.' : '새 레벨이 생성되었습니다.');
        
        // 폼 초기화
        setFormData({
          name: '',
          displayName: '',
          order: 0,
          color: 'blue',
          description: ''
        });
        setEditingLevel(null);
        setIsFormOpen(false);
        
        // 목록 새로고침
        fetchCenterLevels();
      } else {
        const errorData = await response.json();
        alert('저장에 실패했습니다: ' + (errorData.message || '알 수 없는 오류'));
      }
    } catch (error) {
      console.error('❌ 센터 레벨 저장 중 오류:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  const handleEdit = (level: CenterLevel) => {
    setEditingLevel(level);
    setFormData({
      name: level.name,
      displayName: level.displayName,
      order: level.order,
      color: level.color,
      description: level.description || ''
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (levelId: string) => {
    if (!confirm('정말로 이 레벨을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('인증 토큰이 없습니다.');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/center-levels/${levelId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('레벨이 삭제되었습니다.');
        fetchCenterLevels();
      } else {
        const errorData = await response.json();
        alert('삭제에 실패했습니다: ' + (errorData.message || '알 수 없는 오류'));
      }
    } catch (error) {
      console.error('❌ 센터 레벨 삭제 중 오류:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const getColorClass = (color: string) => {
    const colorMap: { [key: string]: string } = {
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      red: 'bg-red-100 text-red-800',
      purple: 'bg-purple-100 text-purple-800',
      pink: 'bg-pink-100 text-pink-800',
      indigo: 'bg-indigo-100 text-indigo-800',
      gray: 'bg-gray-100 text-gray-800'
    };
    return colorMap[color] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">로딩 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isCenterAdmin ? '센터 레벨 관리' : '센터별 레벨 관리'}
          </h1>
          <p className="mt-2 text-gray-600">
            {isCenterAdmin 
              ? '센터에 맞는 맞춤형 레벨 체계를 설정하고 관리합니다.'
              : '모든 센터의 레벨 체계를 관리합니다.'
            }
          </p>
        </div>

        {/* 레벨 추가 버튼 */}
        <div className="mb-6">
          <Button
            onClick={() => {
              setEditingLevel(null);
              setFormData({
                name: '',
                displayName: '',
                order: 0,
                color: 'blue',
                description: ''
              });
              setIsFormOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            ✨ 새 레벨 추가
          </Button>
        </div>

        {/* 레벨 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {levels.map((level) => (
            <Card key={level._id} className="hover:shadow-lg transition-shadow duration-200">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{level.displayName}</h3>
                  <Badge className={getColorClass(level.color)}>
                    {level.name}
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">순서:</span> {level.order}
                  </p>
                  {level.description && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">설명:</span> {level.description}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">
                    생성일: {new Date(level.createdAt).toLocaleDateString('ko-KR')}
                  </p>
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleEdit(level)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    ✏️ 수정
                  </Button>
                  <Button
                    onClick={() => handleDelete(level._id)}
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-red-50 text-red-700 border-red-300 hover:bg-red-100"
                  >
                    🗑️ 삭제
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {levels.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              <p>등록된 레벨이 없습니다.</p>
              <p className="text-sm mt-2">새로운 레벨을 추가해보세요!</p>
            </div>
          </div>
        )}

        {/* 레벨 추가/수정 모달 */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingLevel ? '레벨 수정' : '새 레벨 추가'}
                  </h3>
                  <button
                    onClick={() => {
                      setIsFormOpen(false);
                      setEditingLevel(null);
                      setFormData({
                        name: '',
                        displayName: '',
                        order: 0,
                        color: 'blue',
                        description: ''
                      });
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        레벨 이름 *
                      </label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="예: 입문, 기초, 마스터"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                        표시 이름 *
                      </label>
                      <Input
                        id="displayName"
                        type="text"
                        value={formData.displayName}
                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                        placeholder="예: 입문반, 기초반, 마스터반"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-2">
                        순서 *
                      </label>
                      <Input
                        id="order"
                        type="number"
                        value={formData.order}
                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                        min="0"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">
                        색상 *
                      </label>
                      <select
                        id="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="blue">파랑</option>
                        <option value="green">초록</option>
                        <option value="yellow">노랑</option>
                        <option value="red">빨강</option>
                        <option value="purple">보라</option>
                        <option value="pink">분홍</option>
                        <option value="indigo">남색</option>
                        <option value="gray">회색</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      설명
                    </label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="레벨에 대한 설명을 입력하세요"
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      onClick={() => {
                        setIsFormOpen(false);
                        setEditingLevel(null);
                        setFormData({
                          name: '',
                          displayName: '',
                          order: 0,
                          color: 'blue',
                          description: ''
                        });
                      }}
                      variant="outline"
                    >
                      취소
                    </Button>
                    <Button type="submit">
                      {editingLevel ? '수정' : '추가'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
