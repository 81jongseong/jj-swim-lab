'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Calendar, Clock, Users, Target, Plus, Edit, Trash2, Eye, FileText, Sparkles } from 'lucide-react';
import withAuth from '@/components/withAuth';

interface LessonPlan {
  _id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // minutes
  objectives: string[];
  activities: Array<{
    name: string;
    duration: number;
    description: string;
    equipment?: string[];
  }>;
  materials: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface LessonPlanTemplate {
  _id: string;
  templateName: string;
  description: string;
  category: string;
  level: string;
  totalDuration: number;
  totalSessions: number;
  sessionDuration: number;
  stages: Array<{
    stageNumber: number;
    stageName: string;
    duration: number;
    sessions: number;
    objectives: string[];
    teachingMethods: string[];
    assessmentCriteria: string[];
    materials: string[];
    safetyNotes: string[];
    progressRequirements: string[];
  }>;
  isPublic: boolean;
  usageCount?: number;
}

function LessonPlanner() {
  const { user } = useAuth();
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [templates, setTemplates] = useState<LessonPlanTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<LessonPlanTemplate | null>(null);

  useEffect(() => {
    if (user) {
      loadLessonPlans();
      loadTemplates();
    }
  }, [user]);

  const loadTemplates = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/lesson-plan-templates?isPublic=true', {
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
      console.error('템플릿 로드 실패:', error);
    }
  };

  const loadLessonPlans = async () => {
    try {
      setIsLoading(true);
      // 임시 데이터
      const tempPlans: LessonPlan[] = [
        {
          _id: '1',
          title: '초급 자유형 기초 수업',
          description: '수영을 처음 배우는 학생들을 위한 자유형 기초 수업 계획',
          level: 'beginner',
          duration: 60,
          objectives: [
            '물에 대한 두려움 극복',
            '기본 자유형 동작 익히기',
            '호흡법 연습'
          ],
          activities: [
            {
              name: '워밍업',
              duration: 10,
              description: '기본 스트레칭과 물 적응',
              equipment: ['수영복', '수경']
            },
            {
              name: '자유형 팔 동작',
              duration: 20,
              description: '팔 돌리기와 풀 동작 연습',
              equipment: ['풀 부이']
            },
            {
              name: '자유형 발차기',
              duration: 15,
              description: '발차기 동작과 호흡 연습',
              equipment: ['킥보드']
            },
            {
              name: '쿨다운',
              duration: 15,
              description: '이완 운동과 정리',
              equipment: []
            }
          ],
          materials: ['수영복', '수경', '풀 부이', '킥보드'],
          notes: '초보자에게는 안전을 최우선으로 고려하여 진행',
          createdAt: new Date('2024-01-20'),
          updatedAt: new Date('2024-01-20')
        },
        {
          _id: '2',
          title: '중급 배영 기술 향상',
          description: '배영 기술을 향상시키고 싶은 학생들을 위한 수업',
          level: 'intermediate',
          duration: 60,
          objectives: [
            '배영 자세 교정',
            '발차기 기술 향상',
            '턴 기술 연습'
          ],
          activities: [
            {
              name: '워밍업',
              duration: 10,
              description: '어깨와 허리 스트레칭',
              equipment: ['수영복', '수경']
            },
            {
              name: '배영 자세 교정',
              duration: 20,
              description: '올바른 배영 자세 연습',
              equipment: ['풀 부이']
            },
            {
              name: '배영 발차기',
              duration: 20,
              description: '발차기 기술 향상 연습',
              equipment: ['킥보드']
            },
            {
              name: '쿨다운',
              duration: 10,
              description: '이완 운동',
              equipment: []
            }
          ],
          materials: ['수영복', '수경', '풀 부이', '킥보드'],
          createdAt: new Date('2024-01-19'),
          updatedAt: new Date('2024-01-19')
        }
      ];
      setLessonPlans(tempPlans);
    } catch (error) {
      console.error('수업 계획 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getLevelLabel = (level: string) => {
    const levels: { [key: string]: string } = {
      'beginner': '초급',
      'intermediate': '중급',
      'advanced': '고급'
    };
    return levels[level] || level;
  };

  const getLevelColor = (level: string) => {
    const colors: { [key: string]: string } = {
      'beginner': 'bg-green-100 text-green-800',
      'intermediate': 'bg-yellow-100 text-yellow-800',
      'advanced': 'bg-red-100 text-red-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}시간 ${mins}분`;
    }
    return `${mins}분`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">수업 계획을 불러오는 중...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">수업 계획 관리</h1>
          <p className="text-gray-600">체계적이고 효과적인 수업 계획을 작성하고 관리하세요</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">총 계획</p>
                <p className="text-2xl font-bold text-gray-900">{lessonPlans.length}개</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Target className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">초급 계획</p>
                <p className="text-2xl font-bold text-gray-900">
                  {lessonPlans.filter(p => p.level === 'beginner').length}개
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">중급 계획</p>
                <p className="text-2xl font-bold text-gray-900">
                  {lessonPlans.filter(p => p.level === 'intermediate').length}개
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">평균 시간</p>
                <p className="text-2xl font-bold text-gray-900">
                  {lessonPlans.length > 0 
                    ? formatDuration(Math.round(lessonPlans.reduce((sum, p) => sum + p.duration, 0) / lessonPlans.length))
                    : '0분'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 새 계획 작성 버튼 */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={() => setIsCreating(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            새 수업 계획 작성
          </button>
          <button
            onClick={() => setShowTemplateModal(true)}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            템플릿에서 시작하기
          </button>
        </div>

        {/* 수업 계획 목록 */}
        <div className="space-y-6">
          {lessonPlans.map((plan) => (
            <div key={plan._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 mr-3">{plan.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(plan.level)}`}>
                      {getLevelLabel(plan.level)}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{plan.description}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{formatDuration(plan.duration)}</span>
                    <span className="mx-2">•</span>
                    <span>생성일: {plan.createdAt.toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-green-600 hover:bg-green-50 rounded">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-red-600 hover:bg-red-50 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 학습 목표 */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">학습 목표</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {plan.objectives.map((objective, index) => (
                    <li key={index}>{objective}</li>
                  ))}
                </ul>
              </div>

              {/* 수업 활동 */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">수업 활동</h4>
                <div className="space-y-2">
                  {plan.activities.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{activity.name}</div>
                        <div className="text-sm text-gray-600">{activity.description}</div>
                        {activity.equipment && activity.equipment.length > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            필요 장비: {activity.equipment.join(', ')}
                          </div>
                        )}
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatDuration(activity.duration)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 필요 자료 */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">필요 자료</h4>
                <div className="flex flex-wrap gap-2">
                  {plan.materials.map((material, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                    >
                      {material}
                    </span>
                  ))}
                </div>
              </div>

              {/* 메모 */}
              {plan.notes && (
                <div className="p-3 bg-yellow-50 rounded">
                  <h4 className="text-sm font-medium text-gray-900 mb-1">메모</h4>
                  <p className="text-sm text-gray-700">{plan.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {lessonPlans.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">수업 계획이 없습니다.</p>
            <button
              onClick={() => setIsCreating(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              첫 수업 계획 작성하기
            </button>
          </div>
        )}
      </div>

      {/* 템플릿 선택 모달 */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
              <h3 className="text-xl font-bold text-gray-900">
                📋 강습 계획 템플릿 선택
              </h3>
              <button
                onClick={() => {
                  setShowTemplateModal(false);
                  setSelectedTemplate(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <p className="text-gray-600 mb-4">
                최고 관리자가 작성한 템플릿을 선택하여 강습 계획서를 빠르게 작성하세요.
              </p>
              
              {templates.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">사용 가능한 템플릿이 없습니다.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.map((template) => (
                    <div
                      key={template._id}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        selectedTemplate?._id === template._id
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{template.templateName}</h4>
                        {selectedTemplate?._id === template._id && (
                          <span className="text-purple-600">✓</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                          {template.category === 'freestyle' ? '🏊‍♂️ 자유형' :
                           template.category === 'backstroke' ? '🏊‍♀️ 배영' :
                           template.category === 'breaststroke' ? '🐸 평영' :
                           template.category === 'butterfly' ? '🦋 접영' :
                           template.category}
                        </span>
                        <span className={`px-2 py-1 rounded ${
                          template.level === 'beginner' ? 'bg-green-100 text-green-800' :
                          template.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {template.level === 'beginner' ? '🥉 초급' :
                           template.level === 'intermediate' ? '🥈 중급' :
                           '🥇 고급'}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded">
                          ⏱️ {template.sessionDuration}분
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded">
                          📚 {template.totalSessions}회
                        </span>
                      </div>
                      {template.usageCount && template.usageCount > 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                          {template.usageCount}명이 사용함
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex-shrink-0 p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowTemplateModal(false);
                  setSelectedTemplate(null);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                취소
              </button>
              <button
                onClick={async () => {
                  if (!selectedTemplate) {
                    alert('템플릿을 선택해주세요.');
                    return;
                  }
                  
                  try {
                    const token = localStorage.getItem('token');
                    // 템플릿 내용을 기반으로 강습 계획서 폼에 자동 입력
                    const firstStage = selectedTemplate.stages[0];
                    const newPlan: Partial<LessonPlan> = {
                      title: selectedTemplate.templateName,
                      description: selectedTemplate.description,
                      level: selectedTemplate.level as 'beginner' | 'intermediate' | 'advanced',
                      duration: selectedTemplate.sessionDuration,
                      objectives: firstStage?.objectives.filter(o => o.trim()) || [],
                      activities: firstStage ? [{
                        name: firstStage.stageName,
                        duration: Math.floor(selectedTemplate.sessionDuration / selectedTemplate.stages.length),
                        description: firstStage.objectives.join(', '),
                        equipment: firstStage.materials.filter(m => m.trim())
                      }] : [],
                      materials: firstStage?.materials.filter(m => m.trim()) || [],
                      notes: `템플릿: ${selectedTemplate.templateName}에서 생성됨`
                    };
                    
                    // 강습 계획서 목록에 추가 (실제로는 서버에 저장)
                    setLessonPlans(prev => [...prev, {
                      ...newPlan,
                      _id: `temp-${Date.now()}`,
                      createdAt: new Date(),
                      updatedAt: new Date()
                    } as LessonPlan]);
                    
                    setShowTemplateModal(false);
                    setSelectedTemplate(null);
                    alert('템플릿을 기반으로 강습 계획서가 생성되었습니다. 내용을 확인하고 수정해주세요.');
                  } catch (error) {
                    console.error('템플릿 적용 실패:', error);
                    alert('템플릿 적용 중 오류가 발생했습니다.');
                  }
                }}
                disabled={!selectedTemplate}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedTemplate
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                이 템플릿 사용하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(LessonPlanner, { 
  requireTypes: ['instructor'] 
});