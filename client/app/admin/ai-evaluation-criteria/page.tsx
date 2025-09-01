'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import Card, { CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { 
  Brain, 
  Settings, 
  Target,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface EvaluationCriteria {
  _id?: string;
  technique: string;
  level: string;
  categories: {
    posture: {
      weight: number;
      subCategories: {
        bodyAlignment: { weight: number; criteria: string[]; };
        headPosition: { weight: number; criteria: string[]; };
        coreStability: { weight: number; criteria: string[]; };
      };
    };
    breathing: {
      weight: number;
      subCategories: {
        timing: { weight: number; criteria: string[]; };
        technique: { weight: number; criteria: string[]; };
        consistency: { weight: number; criteria: string[]; };
      };
    };
    movement: {
      weight: number;
      subCategories: {
        strokeTechnique: { weight: number; criteria: string[]; };
        rhythm: { weight: number; criteria: string[]; };
        coordination: { weight: number; criteria: string[]; };
      };
    };
    efficiency: {
      weight: number;
      subCategories: {
        power: { weight: number; criteria: string[]; };
        endurance: { weight: number; criteria: string[]; };
        speed: { weight: number; criteria: string[]; };
      };
    };
  };
  performanceMetrics: any;
  scoringMethod: any;
  feedbackTemplates: any;
  improvementSuggestions: any;
  isActive: boolean;
}

const TECHNIQUES = [
  { value: 'freestyle', label: '자유형' },
  { value: 'backstroke', label: '배영' },
  { value: 'breaststroke', label: '평영' },
  { value: 'butterfly', label: '접영' }
];

const LEVELS = [
  { value: 'beginner', label: '초급' },
  { value: 'intermediate', label: '중급' },
  { value: 'advanced', label: '고급' },
  { value: 'expert', label: '전문가' }
];

const CATEGORIES = [
  { key: 'posture', label: '자세', color: 'blue' },
  { key: 'breathing', label: '호흡', color: 'green' },
  { key: 'movement', label: '동작', color: 'purple' },
  { key: 'efficiency', label: '효율성', color: 'orange' }
];

export default function AIEvaluationCriteriaPage() {
  const { user } = useAuth();
  const [criteriaList, setCriteriaList] = useState<EvaluationCriteria[]>([]);
  const [selectedCriteria, setSelectedCriteria] = useState<EvaluationCriteria | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'criteria' | 'performance' | 'feedback'>('criteria');

  useEffect(() => {
    loadCriteriaList();
  }, []);

  const loadCriteriaList = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ai/evaluation-criteria', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCriteriaList(data.criteria || []);
      }
    } catch (error) {
      console.error('평가 기준 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCriteria = async () => {
    if (!selectedCriteria) return;
    
    try {
      setLoading(true);
      const url = selectedCriteria._id 
        ? `/api/ai/evaluation-criteria/${selectedCriteria._id}`
        : '/api/ai/evaluation-criteria';
      
      const method = selectedCriteria._id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(selectedCriteria)
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        setIsEditing(false);
        setIsCreating(false);
        loadCriteriaList();
      }
    } catch (error) {
      console.error('평가 기준 저장 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteCriteria = async (id: string) => {
    if (!confirm('정말로 이 평가 기준을 삭제하시겠습니까?')) return;
    
    try {
      const response = await fetch(`/api/ai/evaluation-criteria/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        loadCriteriaList();
        setSelectedCriteria(null);
      }
    } catch (error) {
      console.error('평가 기준 삭제 오류:', error);
    }
  };

  const createNewCriteria = () => {
    const newCriteria: EvaluationCriteria = {
      technique: 'freestyle',
      level: 'beginner',
      categories: {
        posture: {
          weight: 0.3,
          subCategories: {
            bodyAlignment: { weight: 0.4, criteria: [] },
            headPosition: { weight: 0.3, criteria: [] },
            coreStability: { weight: 0.3, criteria: [] }
          }
        },
        breathing: {
          weight: 0.25,
          subCategories: {
            timing: { weight: 0.4, criteria: [] },
            technique: { weight: 0.3, criteria: [] },
            consistency: { weight: 0.3, criteria: [] }
          }
        },
        movement: {
          weight: 0.25,
          subCategories: {
            strokeTechnique: { weight: 0.4, criteria: [] },
            rhythm: { weight: 0.3, criteria: [] },
            coordination: { weight: 0.3, criteria: [] }
          }
        },
        efficiency: {
          weight: 0.2,
          subCategories: {
            power: { weight: 0.4, criteria: [] },
            endurance: { weight: 0.3, criteria: [] },
            speed: { weight: 0.3, criteria: [] }
          }
        }
      },
      performanceMetrics: {},
      scoringMethod: { type: 'weighted', parameters: {} },
      feedbackTemplates: { excellent: [], good: [], average: [], poor: [] },
      improvementSuggestions: { posture: [], breathing: [], movement: [], efficiency: [] },
      isActive: true
    };
    
    setSelectedCriteria(newCriteria);
    setIsCreating(true);
    setIsEditing(true);
  };

  const addCriteria = (category: string, subCategory: string) => {
    if (!selectedCriteria) return;
    
    const criteria = prompt('평가 기준을 입력하세요:');
    if (criteria) {
      const updated = { ...selectedCriteria };
      updated.categories[category as keyof typeof updated.categories].subCategories[subCategory as keyof any].criteria.push(criteria);
      setSelectedCriteria(updated);
    }
  };

  const removeCriteria = (category: string, subCategory: string, index: number) => {
    if (!selectedCriteria) return;
    
    const updated = { ...selectedCriteria };
    updated.categories[category as keyof typeof updated.criteria].subCategories[subCategory as keyof any].criteria.splice(index, 1);
    setSelectedCriteria(updated);
  };

  const getTechniqueLabel = (technique: string) => {
    return TECHNIQUES.find(t => t.value === technique)?.label || technique;
  };

  const getLevelLabel = (level: string) => {
    return LEVELS.find(l => l.value === level)?.label || level;
  };

  const getCategoryColor = (category: string) => {
    const cat = CATEGORIES.find(c => c.key === category);
    return cat?.color || 'gray';
  };

  if (loading && criteriaList.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">평가 기준을 불러오는 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🤖 AI 평가 기준 관리</h1>
          <p className="text-gray-600">
            수영 기법별, 레벨별 AI 평가 기준을 설정하고 관리합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 평가 기준 목록 */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    평가 기준 목록
                  </CardTitle>
                  <Button onClick={createNewCriteria} size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    새 기준
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {criteriaList.map((criteria) => (
                    <div
                      key={criteria._id}
                      onClick={() => {
                        setSelectedCriteria(criteria);
                        setIsEditing(false);
                        setIsCreating(false);
                      }}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedCriteria?._id === criteria._id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {getTechniqueLabel(criteria.technique)} - {getLevelLabel(criteria.level)}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {criteria.isActive ? '활성' : '비활성'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Badge className={criteria.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {criteria.isActive ? '활성' : '비활성'}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteCriteria(criteria._id!);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 평가 기준 편집 */}
          <div className="lg:col-span-2">
            {selectedCriteria ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Brain className="w-5 h-5 mr-2" />
                      {isCreating ? '새 평가 기준 생성' : '평가 기준 편집'}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      {!isEditing && !isCreating && (
                        <Button onClick={() => setIsEditing(true)} size="sm">
                          <Edit className="w-4 h-4 mr-1" />
                          편집
                        </Button>
                      )}
                      {(isEditing || isCreating) && (
                        <>
                          <Button onClick={() => {
                            setIsEditing(false);
                            setIsCreating(false);
                            setSelectedCriteria(null);
                          }} variant="outline" size="sm">
                            취소
                          </Button>
                          <Button 
                            onClick={saveCriteria}
                            disabled={loading}
                            className={saved ? 'bg-green-600 hover:bg-green-700' : ''}
                            size="sm"
                          >
                            {saved ? (
                              <>
                                <CheckCircle className="w-4 h-4 mr-1" />
                                저장됨
                              </>
                            ) : (
                              <>
                                <Save className="w-4 h-4 mr-1" />
                                저장
                              </>
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* 탭 네비게이션 */}
                  <div className="mb-6">
                    <nav className="flex space-x-8 border-b border-gray-200">
                      {[
                        { id: 'criteria', label: '평가 기준', icon: '🎯' },
                        { id: 'performance', label: '성과 지표', icon: '📊' },
                        { id: 'feedback', label: '피드백', icon: '💬' }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id as any)}
                          className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === tab.id
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {tab.icon} {tab.label}
                        </button>
                      ))}
                    </nav>
                  </div>

                  {/* 기본 정보 */}
                  {(isEditing || isCreating) && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-3">기본 정보</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            수영 기법
                          </label>
                          <select
                            value={selectedCriteria.technique}
                            onChange={(e) => setSelectedCriteria({
                              ...selectedCriteria,
                              technique: e.target.value
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {TECHNIQUES.map(technique => (
                              <option key={technique.value} value={technique.value}>
                                {technique.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            레벨
                          </label>
                          <select
                            value={selectedCriteria.level}
                            onChange={(e) => setSelectedCriteria({
                              ...selectedCriteria,
                              level: e.target.value
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {LEVELS.map(level => (
                              <option key={level.value} value={level.value}>
                                {level.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 평가 기준 탭 */}
                  {activeTab === 'criteria' && (
                    <div className="space-y-6">
                      <h3 className="font-medium text-gray-900">평가 카테고리 설정</h3>
                      
                      {CATEGORIES.map((category) => (
                        <div key={category.key} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900 flex items-center">
                              <div className={`w-3 h-3 rounded-full bg-${category.color}-500 mr-2`}></div>
                              {category.label}
                            </h4>
                            {(isEditing || isCreating) && (
                              <div className="flex items-center space-x-2">
                                <label className="text-sm text-gray-600">가중치:</label>
                                <input
                                  type="number"
                                  min="0"
                                  max="1"
                                  step="0.1"
                                  value={selectedCriteria.categories[category.key as keyof typeof selectedCriteria.categories].weight}
                                  onChange={(e) => {
                                    const updated = { ...selectedCriteria };
                                    updated.categories[category.key as keyof typeof updated.categories].weight = parseFloat(e.target.value);
                                    setSelectedCriteria(updated);
                                  }}
                                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                              </div>
                            )}
                          </div>
                          
                          <div className="space-y-3">
                            {Object.entries(selectedCriteria.categories[category.key as keyof typeof selectedCriteria.categories].subCategories).map(([subKey, subCategory]) => (
                              <div key={subKey} className="bg-gray-50 p-3 rounded">
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="text-sm font-medium text-gray-700">
                                    {subKey === 'bodyAlignment' && '몸의 정렬'}
                                    {subKey === 'headPosition' && '머리 위치'}
                                    {subKey === 'coreStability' && '코어 안정성'}
                                    {subKey === 'timing' && '타이밍'}
                                    {subKey === 'technique' && '기법'}
                                    {subKey === 'consistency' && '일관성'}
                                    {subKey === 'strokeTechnique' && '스트로크 기법'}
                                    {subKey === 'rhythm' && '리듬'}
                                    {subKey === 'coordination' && '조화'}
                                    {subKey === 'power' && '파워'}
                                    {subKey === 'endurance' && '지구력'}
                                    {subKey === 'speed' && '속도'}
                                  </h5>
                                  {(isEditing || isCreating) && (
                                    <div className="flex items-center space-x-2">
                                      <label className="text-xs text-gray-600">가중치:</label>
                                      <input
                                        type="number"
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        value={subCategory.weight}
                                        onChange={(e) => {
                                          const updated = { ...selectedCriteria };
                                          updated.categories[category.key as keyof typeof updated.categories].subCategories[subKey as keyof any].weight = parseFloat(e.target.value);
                                          setSelectedCriteria(updated);
                                        }}
                                        className="w-16 px-1 py-1 border border-gray-300 rounded text-xs"
                                      />
                                    </div>
                                  )}
                                </div>
                                
                                <div className="space-y-2">
                                  {subCategory.criteria.map((criteria, index) => (
                                    <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                                      <span className="text-sm text-gray-700">{criteria}</span>
                                      {(isEditing || isCreating) && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => removeCriteria(category.key, subKey, index)}
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </Button>
                                      )}
                                    </div>
                                  ))}
                                  
                                  {(isEditing || isCreating) && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => addCriteria(category.key, subKey)}
                                      className="w-full"
                                    >
                                      <Plus className="w-4 h-4 mr-1" />
                                      기준 추가
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 성과 지표 탭 */}
                  {activeTab === 'performance' && (
                    <div className="space-y-6">
                      <h3 className="font-medium text-gray-900">성과 지표 설정</h3>
                      <div className="text-center py-8 text-gray-500">
                        성과 지표 설정 기능은 곧 추가될 예정입니다.
                      </div>
                    </div>
                  )}

                  {/* 피드백 탭 */}
                  {activeTab === 'feedback' && (
                    <div className="space-y-6">
                      <h3 className="font-medium text-gray-900">피드백 템플릿 설정</h3>
                      <div className="text-center py-8 text-gray-500">
                        피드백 템플릿 설정 기능은 곧 추가될 예정입니다.
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    평가 기준을 선택하세요
                  </h3>
                  <p className="text-gray-600 mb-4">
                    왼쪽에서 평가 기준을 선택하거나 새 기준을 생성하세요.
                  </p>
                  <Button onClick={createNewCriteria}>
                    <Plus className="w-4 h-4 mr-2" />
                    새 평가 기준 생성
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
