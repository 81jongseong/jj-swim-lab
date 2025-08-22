'use client';

import { useState, useEffect } from 'react';
import withAuth from '../../../components/withAuth';

interface TeachingMethod {
  _id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  steps: string[];
  tips: string[];
  order: number;
}

interface LessonPlan {
  _id: string;
  name: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // 개월 수
  teachingMethods: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function LessonPlansPage() {
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [teachingMethods, setTeachingMethods] = useState<TeachingMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<LessonPlan | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    duration: 3,
    teachingMethods: [] as string[]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Mock 데이터
      const mockLessonPlans: LessonPlan[] = [
        {
          _id: '1',
          name: '자유형 기초 과정 (3개월)',
          description: '자유형의 기본기를 다지는 3개월 과정입니다.',
          level: 'beginner',
          duration: 3,
          teachingMethods: ['1', '2', '3'],
          isActive: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-15')
        },
        {
          _id: '2',
          name: '평영 중급 과정 (4개월)',
          description: '평영의 고급 기술을 익히는 4개월 과정입니다.',
          level: 'intermediate',
          duration: 4,
          teachingMethods: ['4', '5'],
          isActive: true,
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-01-20')
        }
      ];

      const mockTeachingMethods: TeachingMethod[] = [
        {
          _id: '1',
          name: '기본 자세',
          description: '수영의 기본 자세를 익힙니다.',
          category: '자유형',
          difficulty: 'beginner',
          steps: ['발 딛기', '팔 위치', '머리 각도'],
          tips: ['편안하게 호흡하세요', '어깨를 이완하세요'],
          order: 1
        },
        {
          _id: '2',
          name: '호흡법',
          description: '수영 중 올바른 호흡법을 익힙니다.',
          category: '자유형',
          difficulty: 'beginner',
          steps: ['입으로 들이마시기', '코로 내쉬기', '리듬 맞추기'],
          tips: ['천천히 연습하세요', '물속에서 눈을 감지 마세요'],
          order: 2
        },
        {
          _id: '3',
          name: '팔 동작',
          description: '자유형의 팔 동작을 익힙니다.',
          category: '자유형',
          difficulty: 'beginner',
          steps: ['물 밀기', '팔 돌리기', '손목 각도'],
          tips: ['팔을 너무 세게 치지 마세요', '자연스럽게 움직이세요'],
          order: 3
        },
        {
          _id: '4',
          name: '평영 기본 자세',
          description: '평영의 기본 자세를 익힙니다.',
          category: '평영',
          difficulty: 'intermediate',
          steps: ['발 동작', '팔 동작', '호흡 타이밍'],
          tips: ['동작을 정확하게 하세요', '속도보다 정확성을 우선하세요'],
          order: 4
        },
        {
          _id: '5',
          name: '평영 고급 기술',
          description: '평영의 고급 기술을 익힙니다.',
          category: '평영',
          difficulty: 'advanced',
          steps: ['턴 동작', '스타트', '피니시'],
          tips: ['경기 상황을 고려하세요', '체력 관리가 중요합니다'],
          order: 5
        }
      ];

      setLessonPlans(mockLessonPlans);
      setTeachingMethods(mockTeachingMethods);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      level: 'beginner',
      duration: 3,
      teachingMethods: []
    });
  };

  const handleCreate = () => {
    if (!formData.name || formData.teachingMethods.length === 0) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    const newPlan: LessonPlan = {
      _id: Date.now().toString(),
      ...formData,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setLessonPlans(prev => [...prev, newPlan]);
    setShowCreateModal(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!selectedPlan || !formData.name || formData.teachingMethods.length === 0) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    const updatedPlan: LessonPlan = {
      ...selectedPlan,
      ...formData,
      updatedAt: new Date()
    };

    setLessonPlans(prev => prev.map(plan => 
      plan._id === selectedPlan._id ? updatedPlan : plan
    ));
    setShowEditModal(false);
    setSelectedPlan(null);
    resetForm();
  };

  const handleDelete = (planId: string) => {
    if (window.confirm('정말로 이 강습 계획을 삭제하시겠습니까?')) {
      setLessonPlans(prev => prev.filter(plan => plan._id !== planId));
    }
  };

  const handleToggleActive = (planId: string) => {
    setLessonPlans(prev => prev.map(plan => 
      plan._id === planId ? { ...plan, isActive: !plan.isActive } : plan
    ));
  };

  const openEditModal = (plan: LessonPlan) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description,
      level: plan.level,
      duration: plan.duration,
      teachingMethods: plan.teachingMethods
    });
    setShowEditModal(true);
  };

  const applyRecommendation = () => {
    const recommendedMethods = teachingMethods
      .filter(method => method.difficulty === formData.level)
      .slice(0, 3)
      .map(method => method._id);
    
    setFormData(prev => ({ ...prev, teachingMethods: recommendedMethods }));
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'beginner': return '초급';
      case 'intermediate': return '중급';
      case 'advanced': return '고급';
      default: return level;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">강습 계획을 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">📚 강습 계획 관리</h1>
          <p className="text-xl text-gray-600">수영 강습의 체계적인 계획을 관리하세요</p>
        </div>

        {/* 상단 액션 버튼 */}
        <div className="mb-6">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ➕ 새 강습 계획 만들기
          </button>
        </div>

        {/* 강습 계획 목록 */}
        <div className="grid gap-6">
          {lessonPlans.map((plan) => (
            <div key={plan._id} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(plan.level)}`}>
                        {getLevelText(plan.level)}
                      </span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        plan.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {plan.isActive ? '활성' : '비활성'}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{plan.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>📅 {plan.duration}개월 과정</span>
                      <span>📝 {plan.teachingMethods.length}개 강습법 포함</span>
                      <span>🕒 {new Date(plan.updatedAt).toLocaleDateString()} 최종 수정</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleActive(plan._id)}
                      className={`px-3 py-1 text-xs rounded-md ${
                        plan.isActive 
                          ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {plan.isActive ? '비활성화' : '활성화'}
                    </button>
                    <button
                      onClick={() => openEditModal(plan)}
                      className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(plan._id)}
                      className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                    >
                      삭제
                    </button>
                  </div>
                </div>

                {/* 포함된 강습법 목록 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">📋 포함된 강습법</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {plan.teachingMethods.map((methodId) => {
                      const method = teachingMethods.find(m => m._id === methodId);
                      if (!method) return null;
                      
                      return (
                        <div key={methodId} className="flex items-center space-x-2 text-sm">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          <span className="text-gray-700">{method.name}</span>
                          <span className="text-gray-500">({method.category})</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 강습 계획이 없을 때 */}
        {lessonPlans.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📚</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">강습 계획이 없습니다</h3>
            <p className="text-gray-600 mb-6">첫 번째 강습 계획을 만들어보세요!</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              강습 계획 만들기
            </button>
          </div>
        )}

        {/* 새 강습 계획 생성 모달 */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">새 강습 계획 만들기</h3>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      강습 계획명 *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="예: 자유형 기초 과정 (3개월)"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      설명
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="강습 계획에 대한 상세 설명을 입력하세요"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        레벨 *
                      </label>
                      <select
                        value={formData.level}
                        onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="beginner">초급</option>
                        <option value="intermediate">중급</option>
                        <option value="advanced">고급</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        기간 (개월) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="12"
                        value={formData.duration}
                        onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 1 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        포함할 강습법 *
                      </label>
                      <button
                        onClick={applyRecommendation}
                        className="text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md"
                      >
                        🎯 자동 추천
                      </button>
                    </div>
                    <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3">
                      {teachingMethods
                        .filter(method => method.difficulty === formData.level)
                        .map((method) => (
                          <label key={method._id} className="flex items-center mb-2">
                            <input
                              type="checkbox"
                              checked={formData.teachingMethods.includes(method._id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData(prev => ({
                                    ...prev,
                                    teachingMethods: [...prev.teachingMethods, method._id]
                                  }));
                                } else {
                                  setFormData(prev => ({
                                    ...prev,
                                    teachingMethods: prev.teachingMethods.filter(id => id !== method._id)
                                  }));
                                }
                              }}
                              className="mr-2"
                            />
                            <span className="text-sm">
                              {method.name} ({method.category})
                            </span>
                          </label>
                        ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={!formData.name || formData.teachingMethods.length === 0}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    생성
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 강습 계획 수정 모달 */}
        {showEditModal && selectedPlan && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">강습 계획 수정</h3>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedPlan(null);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      강습 계획명 *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      설명
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        레벨 *
                      </label>
                      <select
                        value={formData.level}
                        onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="beginner">초급</option>
                        <option value="intermediate">중급</option>
                        <option value="advanced">고급</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        기간 (개월) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="12"
                        value={formData.duration}
                        onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 1 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        포함할 강습법 *
                      </label>
                      <button
                        onClick={applyRecommendation}
                        className="text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md"
                      >
                        🎯 자동 추천
                      </button>
                    </div>
                    <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3">
                      {teachingMethods
                        .filter(method => method.difficulty === formData.level)
                        .map((method) => (
                          <label key={method._id} className="flex items-center mb-2">
                            <input
                              type="checkbox"
                              checked={formData.teachingMethods.includes(method._id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData(prev => ({
                                    ...prev,
                                    teachingMethods: [...prev.teachingMethods, method._id]
                                  }));
                                } else {
                                  setFormData(prev => ({
                                    ...prev,
                                    teachingMethods: prev.teachingMethods.filter(id => id !== method._id)
                                  }));
                                }
                              }}
                              className="mr-2"
                            />
                            <span className="text-sm">
                              {method.name} ({method.category})
                            </span>
                          </label>
                        ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedPlan(null);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleEdit}
                    disabled={!formData.name || formData.teachingMethods.length === 0}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    수정
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(LessonPlansPage, { requireTypes: ['superAdmin'], requirePermission: null });

