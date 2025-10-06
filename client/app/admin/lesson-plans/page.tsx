/**
 * @file 강습 계획 템플릿 관리 페이지 (최고관리자)
 * @description 단계별 커리큘럼 템플릿 생성 및 관리
 * @date 2025-09-20
 * @author JJ Swim Lab
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import StatCard from '@/components/StatCard';
import Button from '@/components/Button';
import TemplateCard from '@/components/TemplateCard';

interface CurriculumStage {
  stageNumber: number;
  stageName: string;
  duration: number; // 주 단위
  sessions: number;
  objectives: string[];
  teachingMethods: string[];
  assessmentCriteria: string[];
  materials: string[];
  safetyNotes: string[];
  progressRequirements: string[];
}

interface SpecialStage {
  stageName: string;
  description: string;
  isOptional: boolean;
  duration: number;
  prerequisites: string[];
  objectives: string[];
  teachingMethods: string[];
}

interface LessonPlanTemplate {
  _id?: string;
  templateName: string;
  description: string;
  category: string;
  level: string;
  totalDuration: number; // 주 단위
  totalSessions: number;
  sessionDuration: number; // 분
  stages: CurriculumStage[];
  specialStages: SpecialStage[];
  isPublic: boolean;
  usageCount?: number;
  rating?: number;
}

export default function LessonPlansPage() {
  const { user, loading } = useAuth();
  const [templates, setTemplates] = useState<LessonPlanTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<LessonPlanTemplate | null>(null);
  
  const [newTemplate, setNewTemplate] = useState<LessonPlanTemplate>({
    templateName: '',
    description: '',
    category: 'freestyle',
    level: 'beginner',
    totalDuration: 12, // 3개월
    totalSessions: 24,
    sessionDuration: 60,
    stages: [
      {
        stageNumber: 1,
        stageName: '1단계: 기초 적응',
        duration: 4,
        sessions: 8,
        objectives: [''],
        teachingMethods: [''],
        assessmentCriteria: [''],
        materials: [''],
        safetyNotes: [''],
        progressRequirements: ['']
      }
    ],
    specialStages: [],
    isPublic: true
  });

  const [filters, setFilters] = useState({
    category: 'all',
    level: 'all',
    search: ''
  });

  // 템플릿 로드
  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      const queryParams = new URLSearchParams({
        ...(filters.category !== 'all' && { category: filters.category }),
        ...(filters.level !== 'all' && { level: filters.level }),
        ...(filters.search && { search: filters.search })
      });

      const response = await fetch(`http://localhost:5000/api/lesson-plan-templates?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTemplates(data.data || []);
        }
      }
    } catch (error) {
      console.error('템플릿 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.userType === 'superAdmin') {
      loadTemplates();
    }
  }, [user, filters]);

  const addStage = () => {
    const newStageNumber = newTemplate.stages.length + 1;
    setNewTemplate(prev => ({
      ...prev,
      stages: [...prev.stages, {
        stageNumber: newStageNumber,
        stageName: `${newStageNumber}단계: `,
        duration: 4,
        sessions: 8,
        objectives: [''],
        teachingMethods: [''],
        assessmentCriteria: [''],
        materials: [''],
        safetyNotes: [''],
        progressRequirements: ['']
      }]
    }));
  };

  const removeStage = (index: number) => {
    setNewTemplate(prev => ({
      ...prev,
      stages: prev.stages.filter((_, i) => i !== index)
    }));
  };

  const updateStage = (index: number, field: string, value: any) => {
    setNewTemplate(prev => ({
      ...prev,
      stages: prev.stages.map((stage, i) => 
        i === index ? { ...stage, [field]: value } : stage
      )
    }));
  };

  const updateStageArray = (stageIndex: number, field: string, arrayIndex: number, value: string) => {
    setNewTemplate(prev => ({
      ...prev,
      stages: prev.stages.map((stage, i) => {
        if (i === stageIndex) {
          const newArray = [...(stage as any)[field]];
          newArray[arrayIndex] = value;
          return { ...stage, [field]: newArray };
        }
        return stage;
      })
    }));
  };

  const addToStageArray = (stageIndex: number, field: string) => {
    setNewTemplate(prev => ({
      ...prev,
      stages: prev.stages.map((stage, i) => {
        if (i === stageIndex) {
          return { ...stage, [field]: [...(stage as any)[field], ''] };
        }
        return stage;
      })
    }));
  };

  const removeFromStageArray = (stageIndex: number, field: string, arrayIndex: number) => {
    setNewTemplate(prev => ({
      ...prev,
      stages: prev.stages.map((stage, i) => {
        if (i === stageIndex) {
          return { ...stage, [field]: (stage as any)[field].filter((_: any, idx: number) => idx !== arrayIndex) };
        }
        return stage;
      })
    }));
  };

  const saveTemplate = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/lesson-plan-templates', {
        method: editingTemplate ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTemplate)
      });

      if (response.ok) {
        alert('템플릿이 저장되었습니다!');
        setShowCreateModal(false);
        setEditingTemplate(null);
        loadTemplates();
      } else {
        alert('템플릿 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('템플릿 저장 오류:', error);
      alert('템플릿 저장 중 오류가 발생했습니다.');
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      freestyle: '🏊‍♂️',
      backstroke: '🏊‍♀️',
      breaststroke: '🐸',
      butterfly: '🦋',
      mixed: '🔄',
      basic: '🎯',
      advanced: '🏆'
    };
    return icons[category] || '📋';
  };

  const getLevelBadge = (level: string) => {
    const badges: { [key: string]: { icon: string; color: string } } = {
      beginner: { icon: '🥉', color: 'bg-green-100 text-green-800' },
      intermediate: { icon: '🥈', color: 'bg-yellow-100 text-yellow-800' },
      advanced: { icon: '🥇', color: 'bg-red-100 text-red-800' }
    };
    return badges[level] || { icon: '📊', color: 'bg-gray-100 text-gray-800' };
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">템플릿을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!user || user.userType !== 'superAdmin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">접근 권한 없음</h1>
          <p className="text-gray-600">최고관리자만 접근할 수 있습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📋 강습 계획 템플릿 관리</h1>
        <p className="text-gray-600">
          단계별 커리큘럼 템플릿을 생성하여 모든 센터에서 사용할 수 있도록 합니다
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="전체 템플릿"
          value={`${templates.length}개`}
          icon="📋"
          color="blue"
          subtitle="등록된 템플릿"
          onClick={() => setFilters({ search: '', category: 'all', level: 'all' })}
        />
        
        <StatCard
          title="자유형 템플릿"
          value={`${templates.filter(t => t.category === 'freestyle').length}개`}
          icon="🏊‍♂️"
          color="green"
          subtitle="자유형 커리큘럼"
          onClick={() => setFilters(prev => ({ ...prev, category: prev.category === 'freestyle' ? 'all' : 'freestyle' }))}
        />
        
        <StatCard
          title="초급 템플릿"
          value={`${templates.filter(t => t.level === 'beginner').length}개`}
          icon="🥉"
          color="yellow"
          subtitle="초급 과정"
          onClick={() => setFilters(prev => ({ ...prev, level: prev.level === 'beginner' ? 'all' : 'beginner' }))}
        />
        
        <StatCard
          title="공개 템플릿"
          value={`${templates.filter(t => t.isPublic).length}개`}
          icon="🌐"
          color="purple"
          subtitle="센터에서 사용 가능"
          onClick={() => setFilters(prev => ({ ...prev, category: 'all', level: 'all', search: '' }))}
        />
      </div>

      {/* 필터 및 검색 */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">🔍 템플릿 검색</label>
            <input
              type="text"
              placeholder="템플릿 이름, 설명으로 검색..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">📊 카테고리</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            >
              <option value="all">🎯 모든 카테고리</option>
              <option value="freestyle">🏊‍♂️ 자유형</option>
              <option value="backstroke">🏊‍♀️ 배영</option>
              <option value="breaststroke">🐸 평영</option>
              <option value="butterfly">🦋 접영</option>
              <option value="mixed">🔄 혼영</option>
              <option value="basic">🎯 기초</option>
              <option value="advanced">🏆 고급</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">📈 난이도</label>
            <select
              value={filters.level}
              onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            >
              <option value="all">🎯 모든 난이도</option>
              <option value="beginner">🥉 초급</option>
              <option value="intermediate">🥈 중급</option>
              <option value="advanced">🥇 고급</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button
              onClick={() => {
                setEditingTemplate(null);
                setNewTemplate({
                  templateName: '',
                  description: '',
                  category: 'freestyle',
                  level: 'beginner',
                  totalDuration: 12,
                  totalSessions: 24,
                  sessionDuration: 60,
                  stages: [{
                    stageNumber: 1,
                    stageName: '1단계: 기초 적응',
                    duration: 4,
                    sessions: 8,
                    objectives: [''],
                    teachingMethods: [''],
                    assessmentCriteria: [''],
                    materials: [''],
                    safetyNotes: [''],
                    progressRequirements: ['']
                  }],
                  specialStages: [],
                  isPublic: true
                });
                setShowCreateModal(true);
              }}
              variant="primary"
              size="md"
              fullWidth
            >
              ✨ 새 커리큘럼 템플릿 생성
            </Button>
          </div>
        </div>
      </div>

      {/* 템플릿 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <TemplateCard
            key={template._id}
            template={template}
            onEdit={() => {
              setEditingTemplate(template);
              setNewTemplate(template);
              setShowCreateModal(true);
            }}
            onDelete={() => {
              if (confirm(`"${template.templateName}" 템플릿을 삭제하시겠습니까?`)) {
                // TODO: 삭제 API 호출
              }
            }}
            onView={() => {
              setEditingTemplate(template);
              setNewTemplate(template);
              setShowCreateModal(true);
            }}
            getCategoryIcon={getCategoryIcon}
            getLevelBadge={getLevelBadge}
          />
        ))}


        {templates.length === 0 && !isLoading && (
          <div className="col-span-full text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">템플릿이 없습니다</h3>
            <p className="text-gray-600 mb-4">
              첫 번째 강습 과정 커리큘럼 템플릿을 생성해보세요
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ✨ 첫 템플릿 만들기
            </button>
          </div>
        )}
      </div>

      {/* 템플릿 생성/수정 모달 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
              <h3 className="text-xl font-bold text-gray-900">
                {editingTemplate ? '✏️ 커리큘럼 템플릿 수정' : '✨ 새 커리큘럼 템플릿 생성'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingTemplate(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* 기본 정보 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">📋 템플릿 이름</label>
                    <input
                      type="text"
                      placeholder="예: 자유형 마스터 과정"
                      value={newTemplate.templateName}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, templateName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">📊 카테고리</label>
                    <select
                      value={newTemplate.category}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="freestyle">🏊‍♂️ 자유형</option>
                      <option value="backstroke">🏊‍♀️ 배영</option>
                      <option value="breaststroke">🐸 평영</option>
                      <option value="butterfly">🦋 접영</option>
                      <option value="mixed">🔄 혼영</option>
                      <option value="basic">🎯 기초</option>
                      <option value="advanced">🏆 고급</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">📝 템플릿 설명</label>
                  <textarea
                    placeholder="이 강습 과정의 전반적인 목표와 특징을 설명하세요"
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">📅 전체 기간 (주)</label>
                    <input
                      type="number"
                      min="1"
                      max="52"
                      value={newTemplate.totalDuration}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, totalDuration: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">📚 총 세션 수</label>
                    <input
                      type="number"
                      min="4"
                      max="200"
                      value={newTemplate.totalSessions}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, totalSessions: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">⏱️ 1회 수업 시간 (분)</label>
                    <input
                      type="number"
                      min="30"
                      max="180"
                      step="15"
                      value={newTemplate.sessionDuration}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, sessionDuration: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* 단계별 커리큘럼 */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">📋 단계별 커리큘럼</h4>
                    <button
                      onClick={addStage}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      ➕ 단계 추가
                    </button>
                  </div>
                  
                  {newTemplate.stages.map((stage, stageIndex) => (
                    <div key={stageIndex} className="border border-gray-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-semibold text-gray-900">단계 {stage.stageNumber}</h5>
                        {newTemplate.stages.length > 1 && (
                          <button
                            onClick={() => removeStage(stageIndex)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            🗑️ 삭제
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">단계 이름</label>
                          <input
                            type="text"
                            placeholder="예: 1단계: 물 적응 및 기본 자세"
                            value={stage.stageName}
                            onChange={(e) => updateStage(stageIndex, 'stageName', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">기간 (주)</label>
                            <input
                              type="number"
                              min="1"
                              value={stage.duration}
                              onChange={(e) => updateStage(stageIndex, 'duration', Number(e.target.value))}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">세션 수</label>
                            <input
                              type="number"
                              min="1"
                              value={stage.sessions}
                              onChange={(e) => updateStage(stageIndex, 'sessions', Number(e.target.value))}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 목표 */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-xs font-medium text-gray-600">🎯 단계 목표</label>
                          <button
                            onClick={() => addToStageArray(stageIndex, 'objectives')}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            ➕ 추가
                          </button>
                        </div>
                        {stage.objectives.map((objective, objIndex) => (
                          <div key={objIndex} className="flex gap-2 mb-1">
                            <input
                              type="text"
                              placeholder="이 단계에서 달성할 목표"
                              value={objective}
                              onChange={(e) => updateStageArray(stageIndex, 'objectives', objIndex, e.target.value)}
                              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            {stage.objectives.length > 1 && (
                              <button
                                onClick={() => removeFromStageArray(stageIndex, 'objectives', objIndex)}
                                className="text-red-600 hover:text-red-800 text-xs"
                              >
                                ❌
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* 강습법 */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-xs font-medium text-gray-600">📚 사용할 강습법</label>
                          <button
                            onClick={() => addToStageArray(stageIndex, 'teachingMethods')}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            ➕ 추가
                          </button>
                        </div>
                        {stage.teachingMethods.map((method, methodIndex) => (
                          <div key={methodIndex} className="flex gap-2 mb-1">
                            <input
                              type="text"
                              placeholder="이 단계에서 사용할 강습법"
                              value={method}
                              onChange={(e) => updateStageArray(stageIndex, 'teachingMethods', methodIndex, e.target.value)}
                              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            {stage.teachingMethods.length > 1 && (
                              <button
                                onClick={() => removeFromStageArray(stageIndex, 'teachingMethods', methodIndex)}
                                className="text-red-600 hover:text-red-800 text-xs"
                              >
                                ❌
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex-shrink-0 p-6 border-t bg-gray-50">
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingTemplate(null);
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  ❌ 취소
                </button>
                <button
                  onClick={saveTemplate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  💾 저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}