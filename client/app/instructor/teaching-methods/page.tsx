/**
 * 강사용 강습법 관리 페이지
 * 
 * 연동되는 데이터:
 * - /api/teaching-methods: 강습법 목록 조회 (강사가 대체한 강습법은 자동으로 최고 관리자 강습법 대신 반환)
 * - /api/teaching-methods (POST): 강습법 생성
 * - /api/teaching-methods/:id (PUT): 강습법 수정
 * - /api/teaching-methods/:id (DELETE): 강습법 삭제
 * 
 * 연동되는 파일:
 * - server/src/models/TeachingMethod.ts: 강습법 모델 (overridesSuperAdminMethod, originalSuperAdminMethodId 필드 포함)
 * - server/src/routes/teaching-methods.ts: 강습법 API 라우트
 * - client/utils/api.ts: API 클라이언트
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { BookOpen, Search, Filter, Plus, Edit, Trash2, Eye, X, Save, AlertCircle } from 'lucide-react';
import withAuth from '@/components/withAuth';
import Modal from '@/components/common/Modal';
import { LoadingState, PageHeader, ConfirmModal, ErrorState } from '@/components/common';
import { Button } from '@/components/ui';
import { logger } from '@/lib/logger';

interface TeachingMethod {
  _id: string;
  name: string;
  description: string;
  category: string;
  level: string;
  steps: string[];
  tips: string[];
  checklist: string[];
  videoUrl?: string;
  imageUrl?: string;
  createdBy?: string;
  createdByRole?: 'superAdmin' | 'instructor' | 'centerAdmin';
  overridesSuperAdminMethod?: boolean;
  originalSuperAdminMethodId?: string;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  name: string;
  description: string;
  category: string;
  level: string;
  steps: string[];
  tips: string[];
  checklist: string[];
  videoUrl: string;
  imageUrl: string;
}

const TEACHING_METHOD_CATEGORIES = [
  '자유형', '배영', '평영', '접영', '접영 발차기', '혼영', '개인혼영',
  '자유형 릴레이', '혼합 릴레이', '기본배영', '사이드스트로크',
  '호흡법', '발차기', '턴', '스타트', '기타'
];

const TEACHING_METHOD_LEVELS = ['초급', '중급', '상급', 'beginner', 'intermediate', 'advanced'];

function InstructorTeachingMethods() {
  const { user } = useAuth();
  const [teachingMethods, setTeachingMethods] = useState<TeachingMethod[]>([]);
  const [superAdminMethods, setSuperAdminMethods] = useState<TeachingMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<TeachingMethod | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<TeachingMethod | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    category: '',
    level: '초급',
    steps: [''],
    tips: [''],
    checklist: [''],
    videoUrl: '',
    imageUrl: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  
  // ConfirmModal 상태
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
    variant?: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    message: '',
    onConfirm: () => {},
    variant: 'info'
  });
  const [isCurriculumModalOpen, setIsCurriculumModalOpen] = useState(false);
  const [selectedMethodsForCurriculum, setSelectedMethodsForCurriculum] = useState<string[]>([]);

  const loadTeachingMethods = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/teaching-methods', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('강습법 목록을 불러오는데 실패했습니다.');
      }

      const result = await response.json();
      if (result.success && result.data) {
        setTeachingMethods(result.data);
        
        // 사용된 카테고리 목록 추출 (중복 제거)
        const categories: string[] = Array.from(new Set(
          result.data.map((m: TeachingMethod) => m.category).filter((cat): cat is string => Boolean(cat))
        ));
        // 기본 카테고리와 병합
        const allCategories: string[] = Array.from(new Set([
          ...TEACHING_METHOD_CATEGORIES,
          ...categories
        ]));
        setAvailableCategories(allCategories.sort());
      }
    } catch (error: any) {
      logger.error('강습법 목록 로드 실패:', error);
      setError(error.message || '강습법 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSuperAdminMethods = async () => {
    try {
      const token = localStorage.getItem('token');
      // 최고 관리자 강습법만 조회하기 위해 별도 API 호출
      // 강사인 경우 대체 로직 때문에 최고 관리자 강습법이 필터링될 수 있으므로
      // 전체 강습법을 조회한 후 클라이언트에서 필터링
      const response = await fetch('/api/teaching-methods', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          // 최고 관리자 강습법만 필터링 (대체되지 않은 원본만)
          const superAdmin = result.data.filter((m: TeachingMethod) => 
            m.createdByRole === 'superAdmin' && !m.overridesSuperAdminMethod
          );
          logger.debug('최고 관리자 강습법', { count: superAdmin.length, data: superAdmin });
          setSuperAdminMethods(superAdmin);
          
          // 최고 관리자 강습법이 없으면 경고 표시
          if (superAdmin.length === 0) {
            logger.warn('최고 관리자 강습법이 없습니다. 최고 관리자가 먼저 강습법을 생성해야 합니다.');
            // 디버깅: 전체 강습법 확인
            logger.info('전체 강습법', { count: result.data.length });
            logger.debug('강습법 역할 분포', {
              superAdmin: result.data.filter((m: TeachingMethod) => m.createdByRole === 'superAdmin').length,
              instructor: result.data.filter((m: TeachingMethod) => m.createdByRole === 'instructor').length,
              centerAdmin: result.data.filter((m: TeachingMethod) => m.createdByRole === 'centerAdmin').length,
              noRole: result.data.filter((m: TeachingMethod) => !m.createdByRole).length
            });
          }
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        logger.error('최고 관리자 강습법 로드 실패', { status: response.status, statusText: response.statusText, errorData });
      }
    } catch (error) {
      logger.error('최고 관리자 강습법 로드 실패:', error);
    }
  };

  useEffect(() => {
    if (user) {
      loadTeachingMethods();
      loadSuperAdminMethods();
    }
  }, [user]);

  const handleCreateOrUpdate = async () => {
    try {
      setError(null);
      setSuccess(null);

      if (!formData.name || !formData.description || !formData.category || !formData.steps[0]) {
        setError('필수 필드(이름, 설명, 카테고리, 단계)를 모두 입력해주세요.');
        return;
      }

      const token = localStorage.getItem('token');
      const payload = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        level: formData.level,
        steps: formData.steps.filter(s => s.trim()),
        tips: formData.tips.filter(t => t.trim()),
        checklist: formData.checklist.filter(c => c.trim()),
        videoUrl: formData.videoUrl || undefined,
        imageUrl: formData.imageUrl || undefined
      };

      let response;
      if (editingMethod) {
        response = await fetch(`/api/teaching-methods/${editingMethod._id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch('/api/teaching-methods', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '강습법 저장에 실패했습니다.');
      }

      setSuccess(editingMethod ? '강습법이 수정되었습니다.' : '강습법이 생성되었습니다.');
      setIsFormOpen(false);
      setEditingMethod(null);
      setFormData({
        name: '',
        description: '',
        category: '',
        level: '초급',
        steps: [''],
        tips: [''],
        checklist: [''],
        videoUrl: '',
        imageUrl: ''
      });
      await loadTeachingMethods();
      await loadSuperAdminMethods();
    } catch (error: any) {
      logger.error('강습법 저장 실패:', error);
      setError(error.message || '강습법 저장에 실패했습니다.');
    }
  };

  const handleDelete = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      message: '정말로 이 강습법을 삭제하시겠습니까?',
      variant: 'danger',
      onConfirm: async () => {
        try {
          setError(null);
          const token = localStorage.getItem('token');
          const response = await fetch(`/api/teaching-methods/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error('강습법 삭제에 실패했습니다.');
          }

          setSuccess('강습법이 삭제되었습니다.');
          await loadTeachingMethods();
          setConfirmModal({ isOpen: false, message: '', onConfirm: () => {} });
        } catch (error: any) {
          logger.error('강습법 삭제 실패:', error);
          setError(error.message || '강습법 삭제에 실패했습니다.');
          setConfirmModal({ isOpen: false, message: '', onConfirm: () => {} });
        }
      }
    });
  };

  const handleEdit = (method: TeachingMethod) => {
    setEditingMethod(method);
    setFormData({
      name: method.name,
      description: method.description,
      category: method.category,
      level: method.level,
      steps: method.steps.length > 0 ? method.steps : [''],
      tips: method.tips.length > 0 ? method.tips : [''],
      checklist: method.checklist.length > 0 ? method.checklist : [''],
      videoUrl: method.videoUrl || '',
      imageUrl: method.imageUrl || '',
    });
    setIsFormOpen(true);
  };

  const handleNew = () => {
    setEditingMethod(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      level: '초급',
      steps: [''],
      tips: [''],
      checklist: [''],
      videoUrl: '',
      imageUrl: ''
    });
    setIsFormOpen(true);
  };

  const filteredMethods = teachingMethods.filter(method => {
    const matchesSearch = method.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         method.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         method.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === '' || method.category === categoryFilter;
    const matchesLevel = levelFilter === '' || method.level === levelFilter;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const getLevelLabel = (level: string) => {
    const levels: { [key: string]: string } = {
      'beginner': '초급',
      'intermediate': '중급',
      'advanced': '고급',
      '초급': '초급',
      '중급': '중급',
      '상급': '상급'
    };
    return levels[level] || level;
  };

  const getLevelColor = (level: string) => {
    const levelLower = level.toLowerCase();
    if (levelLower.includes('초급') || levelLower === 'beginner') {
      return 'bg-green-100 text-green-800';
    } else if (levelLower.includes('중급') || levelLower === 'intermediate') {
      return 'bg-yellow-100 text-yellow-800';
    } else if (levelLower.includes('상급') || levelLower.includes('고급') || levelLower === 'advanced') {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const categories = availableCategories.length > 0 
    ? availableCategories 
    : Array.from(new Set(teachingMethods.map(method => method.category)));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingState message="강습법을 불러오는 중..." size="md" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="강습법 관리"
          description="효과적인 수영 강습법을 만들고 관리하세요. 최고 관리자 강습법과 내 강습법을 선택하여 커리큘럼을 만들 수 있습니다."
          actions={
            <Button
              onClick={() => setIsCurriculumModalOpen(true)}
              variant="primary"
              className="flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              커리큘럼 만들기
            </Button>
          }
        />

        {error && (
          <ErrorState 
            message={error}
            onRetry={() => setError(null)}
            retryText="닫기"
            className="mb-4"
          />
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
            <span className="text-green-800">{success}</span>
            <button onClick={() => setSuccess(null)} className="ml-auto">
              <X className="w-4 h-4 text-green-600" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">총 강습법</p>
                <p className="text-2xl font-bold text-gray-900">{teachingMethods.length}개</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Filter className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">카테고리</p>
                <p className="text-2xl font-bold text-gray-900">{categories.length}개</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <AlertCircle className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">내 강습법</p>
                <p className="text-2xl font-bold text-gray-900">
                  {teachingMethods.filter(m => m.createdByRole === 'instructor' && m.createdBy === user?._id).length}개
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <AlertCircle className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">최고 관리자 강습법</p>
                <p className="text-2xl font-bold text-gray-900">
                  {teachingMethods.filter(m => m.createdByRole === 'superAdmin' || !m.createdByRole).length}개
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="강습법명, 설명, 카테고리로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">모든 카테고리</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">모든 레벨</option>
                <option value="초급">초급</option>
                <option value="중급">중급</option>
                <option value="상급">상급</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <button
                onClick={handleNew}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                새 강습법
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {filteredMethods.map((method) => {
            const isMyMethod = method.createdByRole === 'instructor' && method.createdBy === user?._id;

            return (
              <div key={method._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2 flex-wrap gap-2">
                      <h3 className="text-xl font-semibold text-gray-900">{method.name}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(method.level)}`}>
                        {getLevelLabel(method.level)}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {method.category}
                      </span>
                      {isMyMethod && (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          내 강습법
                        </span>
                      )}
                      {method.createdByRole === 'superAdmin' || !method.createdByRole ? (
                        <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                          최고 관리자 강습법
                        </span>
                      ) : null}
                    </div>
                    <p className="text-gray-600 mb-3">{method.description}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <span>생성일: {new Date(method.createdAt).toLocaleDateString()}</span>
                      {method.createdByRole && (
                        <>
                          <span className="mx-2">•</span>
                          <span>생성자: {method.createdByRole === 'superAdmin' ? '최고 관리자' : method.createdByRole === 'instructor' ? '강사' : '센터 관리자'}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedMethod(method);
                        setIsDetailModalOpen(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="상세 보기"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {isMyMethod && (
                      <>
                        <button
                          onClick={() => handleEdit(method)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded"
                          title="수정"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(method._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">단계별 설명</h4>
                    <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                      {method.steps.slice(0, 3).map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                      {method.steps.length > 3 && <li className="text-gray-400">... 외 {method.steps.length - 3}개</li>}
                    </ol>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">팁</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {method.tips.slice(0, 3).map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                      {method.tips.length > 3 && <li className="text-gray-400">... 외 {method.tips.length - 3}개</li>}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">체크리스트</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {method.checklist.slice(0, 3).map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                      {method.checklist.length > 3 && <li className="text-gray-400">... 외 {method.checklist.length - 3}개</li>}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredMethods.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">검색 결과가 없습니다.</p>
          </div>
        )}

        {isFormOpen && (
          <Modal
            isOpen={isFormOpen}
            onClose={() => {
              setIsFormOpen(false);
              setEditingMethod(null);
              setError(null);
            }}
            title={editingMethod ? '강습법 수정' : '새 강습법 생성'}
            headerButtons={
              <button
                onClick={handleCreateOrUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                {editingMethod ? '수정' : '생성'}
              </button>
            }
            maxWidth="4xl"
          >
            <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">강습법 이름 *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="예: 자유형 팔 동작 교정법"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">카테고리 *</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="예: 자유형, 배영, 평영 등"
                    />
                    <p className="mt-1 text-xs text-gray-500">카테고리를 자유롭게 입력하세요</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">설명 *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="강습법에 대한 설명을 입력하세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">레벨</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {TEACHING_METHOD_LEVELS.map(level => (
                      <option key={level} value={level}>{getLevelLabel(level)}</option>
                    ))}
                  </select>
                </div>


                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">단계별 설명 *</label>
                  {formData.steps.map((step, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={step}
                        onChange={(e) => {
                          const newSteps = [...formData.steps];
                          newSteps[index] = e.target.value;
                          setFormData({ ...formData, steps: newSteps });
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder={`단계 ${index + 1}`}
                      />
                      {formData.steps.length > 1 && (
                        <button
                          onClick={() => {
                            const newSteps = formData.steps.filter((_, i) => i !== index);
                            setFormData({ ...formData, steps: newSteps });
                          }}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => setFormData({ ...formData, steps: [...formData.steps, ''] })}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    + 단계 추가
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">팁</label>
                  {formData.tips.map((tip, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={tip}
                        onChange={(e) => {
                          const newTips = [...formData.tips];
                          newTips[index] = e.target.value;
                          setFormData({ ...formData, tips: newTips });
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder={`팁 ${index + 1}`}
                      />
                      {formData.tips.length > 1 && (
                        <button
                          onClick={() => {
                            const newTips = formData.tips.filter((_, i) => i !== index);
                            setFormData({ ...formData, tips: newTips });
                          }}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => setFormData({ ...formData, tips: [...formData.tips, ''] })}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    + 팁 추가
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">체크리스트</label>
                  {formData.checklist.map((item, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const newChecklist = [...formData.checklist];
                          newChecklist[index] = e.target.value;
                          setFormData({ ...formData, checklist: newChecklist });
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder={`체크리스트 항목 ${index + 1}`}
                      />
                      {formData.checklist.length > 1 && (
                        <button
                          onClick={() => {
                            const newChecklist = formData.checklist.filter((_, i) => i !== index);
                            setFormData({ ...formData, checklist: newChecklist });
                          }}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => setFormData({ ...formData, checklist: [...formData.checklist, ''] })}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    + 체크리스트 항목 추가
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">동영상 URL</label>
                    <input
                      type="url"
                      value={formData.videoUrl}
                      onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">이미지 URL</label>
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="https://..."
                    />
                  </div>
                </div>
            </div>
          </Modal>
        )}

        {isDetailModalOpen && selectedMethod && (
          <Modal
            isOpen={isDetailModalOpen}
            onClose={() => setIsDetailModalOpen(false)}
            title={selectedMethod.name}
            maxWidth="4xl"
          >
            <div className="p-6 space-y-6">
                <div>
                  <p className="text-gray-600">{selectedMethod.description}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">단계별 설명</h4>
                    <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                      {selectedMethod.steps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ol>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">팁</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {selectedMethod.tips.map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">체크리스트</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {selectedMethod.checklist.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
            </div>
          </Modal>
        )}

        {/* 커리큘럼 생성 모달 */}
        {isCurriculumModalOpen && (
          <Modal
            isOpen={isCurriculumModalOpen}
            onClose={() => {
              setIsCurriculumModalOpen(false);
              setSelectedMethodsForCurriculum([]);
            }}
            title="커리큘럼 만들기"
            headerButtons={
              <button
                onClick={() => {
                  // TODO: 커리큘럼 저장 로직 구현
                  setSuccess(`커리큘럼에 ${selectedMethodsForCurriculum.length}개의 강습법이 선택되었습니다.`);
                  setIsCurriculumModalOpen(false);
                  setSelectedMethodsForCurriculum([]);
                }}
                disabled={selectedMethodsForCurriculum.length === 0}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                커리큘럼 저장
              </button>
            }
            maxWidth="4xl"
          >
            <div className="p-6 space-y-6">
                <div>
                  <p className="text-gray-600 mb-4">
                    최고 관리자 강습법과 내 강습법을 선택하여 커리큘럼을 만드세요.
                  </p>
                  
                  {/* 최고 관리자 강습법 섹션 */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">최고 관리자 강습법</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-4">
                      {teachingMethods
                        .filter(m => m.createdByRole === 'superAdmin' || !m.createdByRole)
                        .map(method => (
                          <label key={method._id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedMethodsForCurriculum.includes(method._id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedMethodsForCurriculum([...selectedMethodsForCurriculum, method._id]);
                                } else {
                                  setSelectedMethodsForCurriculum(selectedMethodsForCurriculum.filter(id => id !== method._id));
                                }
                              }}
                              className="mr-3"
                            />
                            <div className="flex-1">
                              <span className="font-medium">{method.name}</span>
                              <span className="ml-2 text-sm text-gray-500">({method.category} - {getLevelLabel(method.level)})</span>
                            </div>
                          </label>
                        ))}
                    </div>
                  </div>

                  {/* 내 강습법 섹션 */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">내 강습법</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-4">
                      {teachingMethods
                        .filter(m => m.createdByRole === 'instructor' && m.createdBy === user?._id)
                        .map(method => (
                          <label key={method._id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedMethodsForCurriculum.includes(method._id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedMethodsForCurriculum([...selectedMethodsForCurriculum, method._id]);
                                } else {
                                  setSelectedMethodsForCurriculum(selectedMethodsForCurriculum.filter(id => id !== method._id));
                                }
                              }}
                              className="mr-3"
                            />
                            <div className="flex-1">
                              <span className="font-medium">{method.name}</span>
                              <span className="ml-2 text-sm text-gray-500">({method.category} - {getLevelLabel(method.level)})</span>
                            </div>
                          </label>
                        ))}
                      {teachingMethods.filter(m => m.createdByRole === 'instructor' && m.createdBy === user?._id).length === 0 && (
                        <p className="text-gray-500 text-sm">아직 생성한 강습법이 없습니다.</p>
                      )}
                    </div>
                  </div>

                  {/* 선택된 강습법 목록 */}
                  {selectedMethodsForCurriculum.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        선택된 강습법 ({selectedMethodsForCurriculum.length}개)
                      </h3>
                      <div className="space-y-2 border border-gray-200 rounded-lg p-4">
                        {selectedMethodsForCurriculum.map(methodId => {
                          const method = teachingMethods.find(m => m._id === methodId);
                          if (!method) return null;
                          return (
                            <div key={methodId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div>
                                <span className="font-medium">{method.name}</span>
                                <span className="ml-2 text-sm text-gray-500">({method.category} - {getLevelLabel(method.level)})</span>
                              </div>
                              <button
                                onClick={() => {
                                  setSelectedMethodsForCurriculum(selectedMethodsForCurriculum.filter(id => id !== methodId));
                                }}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                </div>
            </div>
          </Modal>
        )}

        {/* ConfirmModal */}
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ isOpen: false, message: '', onConfirm: () => {} })}
          onConfirm={confirmModal.onConfirm}
          message={confirmModal.message}
          variant={confirmModal.variant || 'info'}
          title="확인"
          confirmText="확인"
          cancelText="취소"
        />
      </div>
    </div>
  );
}

export default withAuth(InstructorTeachingMethods, { 
  requireTypes: ['instructor'] 
});

