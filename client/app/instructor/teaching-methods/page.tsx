'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';

interface TeachingMethod {
  _id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  steps: string[];
  tips: string[];
  videoUrl?: string;
  imageUrl?: string;
  createdBy?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const InstructorTeachingMethodsPage = () => {
  const [methods, setMethods] = useState<TeachingMethod[]>([]);
  const [filteredMethods, setFilteredMethods] = useState<TeachingMethod[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<TeachingMethod | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<TeachingMethod | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchMethods();
  }, []);

  useEffect(() => {
    filterMethods();
  }, [methods, searchTerm, selectedCategory, selectedDifficulty]);

  const fetchMethods = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // 강사가 생성한 강습법만 조회
      const response = await fetch(`${API_BASE_URL}/api/teaching-methods/instructor`, {
        headers
      });
      
      if (response.ok) {
        const data = await response.json();
        setMethods(data.data || []);
      } else if (response.status === 401) {
        console.error('인증이 필요합니다. 로그인해주세요.');
        window.location.href = '/auth/login';
      }
    } catch (error) {
      console.error('강습법 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterMethods = () => {
    let filtered = methods;

    if (searchTerm) {
      filtered = filtered.filter(method =>
        method.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        method.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        method.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(method => method.category === selectedCategory);
    }

    if (selectedDifficulty) {
      filtered = filtered.filter(method => method.difficulty === selectedDifficulty);
    }

    setFilteredMethods(filtered);
  };

  const handleCreate = () => {
    setEditingMethod(null);
    setIsFormOpen(true);
  };

  const handleEdit = (method: TeachingMethod) => {
    setEditingMethod(method);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말로 이 강습법을 삭제하시겠습니까?')) return;

    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/teaching-methods/${id}`, {
        method: 'DELETE',
        headers
      });

      if (response.ok) {
        setMethods(methods.filter(method => method._id !== id));
        alert('강습법이 삭제되었습니다.');
      } else if (response.status === 401) {
        alert('인증이 필요합니다. 로그인해주세요.');
        window.location.href = '/auth/login';
      }
    } catch (error) {
      console.error('강습법 삭제 실패:', error);
      alert('강습법 삭제에 실패했습니다.');
    }
  };

  const handleFormSubmit = async (methodData: Partial<TeachingMethod>) => {
    try {
      const url = editingMethod
        ? `${API_BASE_URL}/api/teaching-methods/${editingMethod._id}`
        : `${API_BASE_URL}/api/teaching-methods`;

      const method = editingMethod ? 'PUT' : 'POST';

      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(methodData),
      });

      if (response.ok) {
        const result = await response.json();
        if (editingMethod) {
          setMethods(methods.map(method =>
            method._id === editingMethod._id ? result.data : method
          ));
        } else {
          setMethods([...methods, result.data]);
        }
        setIsFormOpen(false);
        setEditingMethod(null);
        alert(editingMethod ? '강습법이 수정되었습니다.' : '강습법이 생성되었습니다.');
      }
    } catch (error) {
      console.error('강습법 저장 실패:', error);
      alert('강습법 저장에 실패했습니다.');
    }
  };

  const handleCardClick = (method: TeachingMethod) => {
    setSelectedMethod(method);
    setIsDetailModalOpen(true);
  };

  const handleDetailEdit = (method: TeachingMethod) => {
    setIsDetailModalOpen(false);
    handleEdit(method);
  };

  const handleDetailDelete = (id: string) => {
    setIsDetailModalOpen(false);
    handleDelete(id);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return '초급';
      case 'intermediate':
        return '중급';
      case 'advanced':
        return '고급';
      default:
        return difficulty;
    }
  };

  const categories = Array.from(new Set(methods.map(method => method.category)));
  const difficulties = ['beginner', 'intermediate', 'advanced'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 text-single-line">🏊‍♂️ 내 강습법 관리</h1>
          <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
            ➕ 새 강습법 추가
          </Button>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="🔍 강습법 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">전체 카테고리</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">전체 난이도</option>
              {difficulties.map(difficulty => (
                <option key={difficulty} value={difficulty}>
                  {getDifficultyText(difficulty)}
                </option>
              ))}
            </select>
            <Button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setSelectedDifficulty('');
              }}
              variant="outline"
              className="w-full"
            >
              🔄 초기화
            </Button>
          </div>
        </div>

        {/* 강습법 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMethods.map((method) => (
            <Card
              key={method._id}
              className="hover:shadow-lg transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 text-single-line mb-1">
                      {method.name.includes(' - ') ? method.name.split(' - ')[0] : method.name}
                    </h3>
                    {method.name.includes(' - ') && (
                      <p className="text-sm text-gray-600 text-single-line">
                        {method.name.split(' - ')[1]}
                      </p>
                    )}
                  </div>
                  <Badge className={getDifficultyColor(method.difficulty)}>
                    {getDifficultyText(method.difficulty)}
                  </Badge>
                </div>
                
                <div className="mb-3">
                  <Badge className="bg-blue-100 text-blue-800">
                    {method.category}
                  </Badge>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {method.description}
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="text-sm text-gray-500">
                    📋 단계: {method.steps.length}개
                  </div>
                  {method.tips.length > 0 && (
                    <div className="text-sm text-gray-500">
                      💡 팁: {method.tips.length}개
                    </div>
                  )}
                  {(method.videoUrl || method.imageUrl) && (
                    <div className="text-sm text-gray-500">
                      🎬 미디어 포함
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm text-gray-500">
                    <div>생성일: {new Date(method.createdAt).toLocaleDateString()}</div>
                    <div className={method.isActive ? 'text-green-600' : 'text-red-600'}>
                      {method.isActive ? '활성' : '비활성'}
                    </div>
                  </div>
                </div>

                {/* 액션 버튼들 */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={() => handleCardClick(method)}
                    variant="outline"
                    className="flex-1 bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100"
                  >
                    👁️ 상세보기
                  </Button>
                  <Button
                    onClick={() => handleEdit(method)}
                    variant="outline"
                    className="flex-1 bg-green-50 text-green-700 border-green-300 hover:bg-green-100"
                  >
                    ✏️ 수정
                  </Button>
                  <Button
                    onClick={() => handleDelete(method._id)}
                    variant="outline"
                    className="flex-1 bg-red-50 text-red-700 border-red-300 hover:bg-red-100"
                  >
                    🗑️ 삭제
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredMethods.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              {methods.length === 0 ? '등록된 강습법이 없습니다.' : '검색 결과가 없습니다.'}
            </div>
          </div>
        )}

        {/* 강습법 등록/수정 폼 모달 */}
        {isFormOpen && (
          <TeachingMethodFormModal
            method={editingMethod}
            onClose={() => {
              setIsFormOpen(false);
              setEditingMethod(null);
            }}
            onSubmit={handleFormSubmit}
          />
        )}

        {/* 강습법 상세 보기 모달 */}
        {isDetailModalOpen && selectedMethod && (
          <TeachingMethodDetailModal
            method={selectedMethod}
            onClose={() => {
              setIsDetailModalOpen(false);
              setSelectedMethod(null);
            }}
            onEdit={handleDetailEdit}
            onDelete={handleDetailDelete}
          />
        )}
      </div>
    </div>
  );
};

// 강습법 등록/수정 폼 모달
const TeachingMethodFormModal: React.FC<{
  method: TeachingMethod | null;
  onClose: () => void;
  onSubmit: (data: Partial<TeachingMethod>) => void;
}> = ({ method, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: method?.name || '',
    description: method?.description || '',
    category: method?.category || '',
    difficulty: method?.difficulty || 'beginner',
    steps: method?.steps || [''],
    tips: method?.tips || [''],
    videoUrl: method?.videoUrl || '',
    imageUrl: method?.imageUrl || '',
    isActive: method?.isActive ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addStep = () => {
    setFormData(prev => ({ ...prev, steps: [...prev.steps, ''] }));
  };

  const removeStep = (index: number) => {
    setFormData(prev => ({ ...prev, steps: prev.steps.filter((_, i) => i !== index) }));
  };

  const updateStep = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => i === index ? value : step)
    }));
  };

  const addTip = () => {
    setFormData(prev => ({ ...prev, tips: [...prev.tips, ''] }));
  };

  const removeTip = (index: number) => {
    setFormData(prev => ({ ...prev, tips: prev.tips.filter((_, i) => i !== index) }));
  };

  const updateTip = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      tips: prev.tips.map((tip, i) => i === index ? value : tip)
    }));
  };

  return (
    <Modal isOpen={true} onClose={onClose} size="xl">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {method ? '강습법 수정' : '새 강습법 추가'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                대제목
              </label>
              <Input
                value={formData.name.split(' - ')[0] || ''}
                onChange={(e) => {
                  const subTitle = formData.name.includes(' - ') ? formData.name.split(' - ')[1] : '';
                  setFormData(prev => ({
                    ...prev,
                    name: e.target.value + (subTitle ? ` - ${subTitle}` : '')
                  }));
                }}
                placeholder="예: 자유형 기초"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                소제목
              </label>
              <Input
                value={formData.name.includes(' - ') ? formData.name.split(' - ')[1] : ''}
                onChange={(e) => {
                  const mainTitle = formData.name.includes(' - ') ? formData.name.split(' - ')[0] : formData.name;
                  setFormData(prev => ({
                    ...prev,
                    name: mainTitle + (e.target.value ? ` - ${e.target.value}` : '')
                  }));
                }}
                placeholder="예: 호흡법"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              설명
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="강습법에 대한 설명을 입력하세요"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                급수
              </label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="예: 초급"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                난이도
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as any }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="beginner">초급</option>
                <option value="intermediate">중급</option>
                <option value="advanced">고급</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상태
              </label>
              <select
                value={formData.isActive ? 'true' : 'false'}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value === 'true' }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="true">활성</option>
                <option value="false">비활성</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              체크리스트 단계
            </label>
            <div className="space-y-2">
              {formData.steps.map((step, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={step}
                    onChange={(e) => updateStep(index, e.target.value)}
                    placeholder={`${index + 1}단계`}
                    required
                  />
                  {formData.steps.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeStep(index)}
                      variant="outline"
                      className="px-3 py-2 text-red-600 border-red-600 hover:bg-red-50"
                    >
                      삭제
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                onClick={addStep}
                variant="outline"
                className="w-full"
              >
                + 단계 추가
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              유용한 팁
            </label>
            <div className="space-y-2">
              {formData.tips.map((tip, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={tip}
                    onChange={(e) => updateTip(index, e.target.value)}
                    placeholder="팁을 입력하세요"
                  />
                  <Button
                    type="button"
                    onClick={() => removeTip(index)}
                    variant="outline"
                    className="px-3 py-2 text-red-600 border-red-600 hover:bg-red-50"
                  >
                    삭제
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                onClick={addTip}
                variant="outline"
                className="w-full"
              >
                + 팁 추가
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                유튜브 링크 (선택)
              </label>
              <Input
                value={formData.videoUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                placeholder="https://youtube.com/..."
                type="url"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이미지 URL (선택)
              </label>
              <Input
                value={formData.imageUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                placeholder="https://example.com/image.jpg"
                type="url"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" onClick={onClose} variant="outline">
              취소
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {method ? '수정' : '추가'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

// 강습법 상세 보기 모달 (강사용)
const TeachingMethodDetailModal: React.FC<{
  method: TeachingMethod;
  onClose: () => void;
  onEdit: (method: TeachingMethod) => void;
  onDelete: (id: string) => void;
}> = ({ method, onClose, onEdit, onDelete }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return '초급';
      case 'intermediate':
        return '중급';
      case 'advanced':
        return '고급';
      default:
        return difficulty;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Modal isOpen={true} onClose={onClose} size="xl">
      <div className="p-6">
        {/* 헤더 */}
        <div className="flex justify-between items-start mb-6">
          <div>
            {/* 제목을 대제목과 소제목으로 구분 */}
            <div className="mb-3">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {method.name.includes(' - ') ? method.name.split(' - ')[0] : method.name}
              </h2>
              {method.name.includes(' - ') && (
                <h3 className="text-lg text-gray-700 font-medium">
                  {method.name.split(' - ')[1]}
                </h3>
              )}
            </div>
            <div className="flex gap-2">
              <Badge className={getDifficultyColor(method.difficulty)}>
                {getDifficultyText(method.difficulty)}
              </Badge>
              <Badge className="bg-blue-100 text-blue-800">
                {method.category}
              </Badge>
              <Badge className={method.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {method.isActive ? '활성' : '비활성'}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => onEdit(method)}
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100"
            >
              ✏️ 수정
            </Button>
            <Button
              onClick={() => onDelete(method._id)}
              variant="outline"
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              🗑️ 삭제
            </Button>
          </div>
        </div>

        {/* 설명 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">📝 설명</h3>
          <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
            {method.description}
          </p>
        </div>

        {/* 체크리스트 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">📋 체크리스트</h3>
          <div className="max-h-64 overflow-y-auto space-y-3 pr-2">
            {method.steps.map((step, index) => (
              <div key={index} className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-gray-700">{step}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 팁 */}
        {method.tips.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 유용한 팁</h3>
            <div className="space-y-2">
              {method.tips.map((tip, index) => (
                <div key={index} className="flex items-start gap-2 bg-yellow-50 p-3 rounded-lg">
                  <span className="text-yellow-600 text-lg">💡</span>
                  <p className="text-gray-700 flex-1">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 미디어 */}
        {(method.videoUrl || method.imageUrl) && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">🎬 미디어</h3>
            <div className="space-y-3">
              {method.imageUrl && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">📷 이미지</p>
                  <img
                    src={method.imageUrl}
                    alt={method.name}
                    className="w-full max-w-md h-auto rounded-lg border"
                  />
                </div>
              )}
              {method.videoUrl && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">🎥 비디오</p>
                  <a
                    href={method.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 underline"
                  >
                    🎬 비디오 보기
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 메타 정보 */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">생성일:</span>
              <span className="ml-2">{formatDate(method.createdAt)}</span>
            </div>
            <div>
              <span className="font-medium">수정일:</span>
              <span className="ml-2">{formatDate(method.updatedAt)}</span>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="flex justify-end mt-6 pt-4 border-t">
          <Button onClick={onClose} variant="outline">
            닫기
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default InstructorTeachingMethodsPage;











