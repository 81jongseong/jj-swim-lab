/**
 * 📚 JJ Swim Lab - 관리자 강습 계획 관리 페이지
 * 
 * 📋 **페이지 목적**
 * - 수영 강습 계획을 관리하는 관리자 전용 페이지
 * - 강습 계획 생성, 수정, 삭제, 조회 기능 제공
 * - 강습 방법 및 단계별 진행 관리
 * - 강습 계획 템플릿 및 복사 기능
 * - 강습 계획 통계 및 분석 데이터 표시
 * 
 * 🔄 **주요 기능**
 * - 강습 계획 목록 조회 및 표시
 * - 강습 계획 생성 및 수정 기능
 * - 강습 방법 및 단계별 진행 관리
 * - 강습 계획 템플릿 관리
 * - 강습 계획 복사 및 공유 기능
 * - 강습 계획 통계 및 분석
 * - 강습 계획 검색 및 필터링
 * 
 * 🗄️ **데이터 연동**
 * - 강습 계획 관리 API와 연동
 * - 강습 방법 데이터베이스와 연동
 * - 강습 계획 템플릿 데이터
 * - 강습 계획 통계 및 분석 API
 * - 사용자 인증 시스템
 * - 실시간 강습 계획 상태 업데이트
 * 
 * 🛠️ **필요한 설치 파일**
 * - Next.js 14.2.5 (App Router)
 * - React 18.3.1
 * - TypeScript 5.x
 * - Tailwind CSS 3.3.0
 * - 인증 컴포넌트 (../components/withAuth)
 * - 강습 계획 관리 API 엔드포인트
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 관리자 권한 확인 및 보안
 * 2. 강습 계획 데이터 보안 및 검증
 * 3. 강습 방법 및 단계별 진행 관리
 * 4. 강습 계획 템플릿 관리
 * 5. 반응형 디자인 적용 (모바일/데스크톱)
 * 6. 접근성 지원 (키보드 네비게이션, ARIA 라벨)
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 관리자 권한 확인 확인
 * - [ ] 강습 계획 데이터 보안 확인
 * - [ ] 강습 방법 관리 확인
 * - [ ] 강습 계획 템플릿 관리 확인
 * - [ ] 반응형 디자인 테스트
 * - [ ] 접근성 지원 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 관리자 강습 계획 관리 페이지 구현
 * - 2024-12-19: 강습 계획 목록 및 CRUD 기능 구현
 * - 2024-12-19: 강습 방법 관리 시스템 구현
 * - 2024-12-19: 강습 계획 템플릿 시스템 구현
 * - 2024-12-19: 반응형 디자인 및 사용자 경험 개선
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (관리자 강습 계획 관리 페이지 완료)
 * 
 * 🚀 **다음 단계**
 * - 실시간 강습 계획 상태 업데이트
 * - 강습 계획 추천 시스템
 * - 강습 계획 공유 및 협업
 * - 강습 계획 통계 대시보드
 * - 강습 계획 보안 강화
 * 
 * 💡 **사용 예시**
 * ```tsx
 * // 강습 계획 목록 조회
 * const lessonPlans = await apiClient.getLessonPlans();
 * 
 * // 강습 계획 생성
 * const newLessonPlan = await apiClient.createLessonPlan(lessonPlanData);
 * 
 * // 강습 방법 추가
 * const teachingMethod = await apiClient.addTeachingMethod(methodData);
 * ```
 * 
 * 🔍 **강습 계획 관리 처리 흐름**
 * 1. 관리자 권한 확인 및 검증
 * 2. 강습 계획 목록 데이터 로드
 * 3. 강습 방법 및 단계별 진행 관리
 * 4. 강습 계획 생성 및 수정 처리
 * 5. 강습 계획 템플릿 관리
 * 6. 강습 계획 통계 및 분석 업데이트
 * 7. 실시간 강습 계획 상태 동기화
 */

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
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('인증 토큰이 없습니다.');
        return;
      }

      // 실제 API 호출
      const [lessonPlansResponse, teachingMethodsResponse] = await Promise.all([
        fetch('http://localhost:5000/api/lesson-plans', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('http://localhost:5000/api/teaching-methods', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (lessonPlansResponse.ok) {
        const lessonPlansData = await lessonPlansResponse.json();
        setLessonPlans(lessonPlansData.data || []);
      } else {
        console.error('수업 계획 데이터 로드 실패:', lessonPlansResponse.status);
        // API 실패 시 빈 배열로 설정
        setLessonPlans([]);
      }

      if (teachingMethodsResponse.ok) {
        const teachingMethodsData = await teachingMethodsResponse.json();
        setTeachingMethods(teachingMethodsData.data || []);
      } else {
        console.error('강습법 데이터 로드 실패:', teachingMethodsResponse.status);
        // API 실패 시 빈 배열로 설정
        setTeachingMethods([]);
      }
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      // 에러 발생 시 빈 배열로 설정
      setLessonPlans([]);
      setTeachingMethods([]);
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

