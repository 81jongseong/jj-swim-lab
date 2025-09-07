'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import Card, { CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { 
  Dumbbell, 
  Settings, 
  Target,
  Plus,
  Edit,
  Trash2,
  Save,
  RefreshCw,
  Clock,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Play,
  Pause
} from 'lucide-react';

interface Exercise {
  _id?: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number;
  repetitions?: number;
  sets?: number;
  equipment: string[];
  instructions: string[];
  benefits: string[];
  precautions: string[];
}

interface WorkoutPlan {
  _id?: string;
  name: string;
  description: string;
  totalDuration: number;
  exercises: {
    exerciseName: string;
    duration: number;
    order: number;
  }[];
  frequency: number;
  progression: any;
}

interface ExerciseRecommendation {
  _id?: string;
  technique: string;
  level: string;
  category: 'posture' | 'breathing' | 'movement' | 'efficiency';
  exercises: Exercise[];
  workoutPlan: WorkoutPlan[];
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
  { value: 'posture', label: '자세', color: 'blue' },
  { value: 'breathing', label: '호흡', color: 'green' },
  { value: 'movement', label: '동작', color: 'purple' },
  { value: 'efficiency', label: '효율성', color: 'orange' }
];

const DIFFICULTIES = [
  { value: 'easy', label: '쉬움', color: 'green' },
  { value: 'medium', label: '보통', color: 'yellow' },
  { value: 'hard', label: '어려움', color: 'red' }
];

export default function AIExerciseDatabasePage() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<ExerciseRecommendation[]>([]);
  const [selectedRecommendation, setSelectedRecommendation] = useState<ExerciseRecommendation | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'exercises' | 'workout'>('exercises');
  const [filterTechnique, setFilterTechnique] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ai/exercise-recommendations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
      }
    } catch (error) {
      console.error('운동 추천 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveRecommendation = async () => {
    if (!selectedRecommendation) return;
    
    try {
      setLoading(true);
      const url = selectedRecommendation._id 
        ? `/api/ai/exercise-recommendations/${selectedRecommendation._id}`
        : '/api/ai/exercise-recommendations';
      
      const method = selectedRecommendation._id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(selectedRecommendation)
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        setIsEditing(false);
        setIsCreating(false);
        loadRecommendations();
      }
    } catch (error) {
      console.error('운동 추천 저장 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteRecommendation = async (id: string) => {
    if (!confirm('정말로 이 운동 추천을 삭제하시겠습니까?')) return;
    
    try {
      const response = await fetch(`/api/ai/exercise-recommendations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        loadRecommendations();
        setSelectedRecommendation(null);
      }
    } catch (error) {
      console.error('운동 추천 삭제 오류:', error);
    }
  };

  const createNewRecommendation = () => {
    const newRecommendation: ExerciseRecommendation = {
      technique: 'freestyle',
      level: 'beginner',
      category: 'posture',
      exercises: [],
      workoutPlan: [],
      isActive: true
    };
    
    setSelectedRecommendation(newRecommendation);
    setIsCreating(true);
    setIsEditing(true);
  };

  const addExercise = () => {
    if (!selectedRecommendation) return;
    
    const newExercise: Exercise = {
      name: '',
      description: '',
      difficulty: 'easy',
      duration: 10,
      equipment: [],
      instructions: [],
      benefits: [],
      precautions: []
    };
    
    const updated = { ...selectedRecommendation };
    updated.exercises.push(newExercise);
    setSelectedRecommendation(updated);
  };

  const updateExercise = (index: number, field: string, value: any) => {
    if (!selectedRecommendation) return;
    
    const updated = { ...selectedRecommendation };
    updated.exercises[index] = {
      ...updated.exercises[index],
      [field]: value
    };
    setSelectedRecommendation(updated);
  };

  const removeExercise = (index: number) => {
    if (!selectedRecommendation) return;
    
    const updated = { ...selectedRecommendation };
    updated.exercises.splice(index, 1);
    setSelectedRecommendation(updated);
  };

  const addArrayItem = (exerciseIndex: number, field: string, value: string) => {
    if (!selectedRecommendation || !value.trim()) return;
    
    const updated = { ...selectedRecommendation };
    const fieldValue = updated.exercises[exerciseIndex][field as keyof Exercise];
    if (Array.isArray(fieldValue)) {
      fieldValue.push(value);
    }
    setSelectedRecommendation(updated);
  };

  const removeArrayItem = (exerciseIndex: number, field: string, itemIndex: number) => {
    if (!selectedRecommendation) return;
    
    const updated = { ...selectedRecommendation };
    const fieldValue = updated.exercises[exerciseIndex][field as keyof Exercise];
    if (Array.isArray(fieldValue)) {
      fieldValue.splice(itemIndex, 1);
    }
    setSelectedRecommendation(updated);
  };

  const getTechniqueLabel = (technique: string) => {
    return TECHNIQUES.find(t => t.value === technique)?.label || technique;
  };

  const getLevelLabel = (level: string) => {
    return LEVELS.find(l => l.value === level)?.label || level;
  };

  const getCategoryLabel = (category: string) => {
    return CATEGORIES.find(c => c.value === category)?.label || category;
  };

  const getDifficultyLabel = (difficulty: string) => {
    return DIFFICULTIES.find(d => d.value === difficulty)?.label || difficulty;
  };

  const getDifficultyColor = (difficulty: string) => {
    return DIFFICULTIES.find(d => d.value === difficulty)?.color || 'gray';
  };

  const filteredRecommendations = recommendations.filter(rec => {
    if (filterTechnique !== 'all' && rec.technique !== filterTechnique) return false;
    if (filterLevel !== 'all' && rec.level !== filterLevel) return false;
    if (filterCategory !== 'all' && rec.category !== filterCategory) return false;
    return true;
  });

  if (loading && recommendations.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">운동 데이터베이스를 불러오는 중...</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">💪 AI 운동 데이터베이스</h1>
          <p className="text-gray-600">
            수영 기법별, 레벨별 맞춤형 운동과 훈련 계획을 관리합니다.
          </p>
        </div>

        {/* 필터 */}
        <div className="mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    수영 기법
                  </label>
                  <select
                    value={filterTechnique}
                    onChange={(e) => setFilterTechnique(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">전체</option>
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
                    value={filterLevel}
                    onChange={(e) => setFilterLevel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">전체</option>
                    {LEVELS.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    카테고리
                  </label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">전체</option>
                    {CATEGORIES.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <Button onClick={createNewRecommendation} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    새 운동 추가
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 운동 추천 목록 */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Dumbbell className="w-5 h-5 mr-2" />
                  운동 추천 목록
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredRecommendations.map((recommendation) => (
                    <div
                      key={recommendation._id}
                      onClick={() => {
                        setSelectedRecommendation(recommendation);
                        setIsEditing(false);
                        setIsCreating(false);
                      }}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedRecommendation?._id === recommendation._id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {getTechniqueLabel(recommendation.technique)} - {getLevelLabel(recommendation.level)}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {getCategoryLabel(recommendation.category)} • {recommendation.exercises.length}개 운동
                          </p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Badge className={recommendation.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {recommendation.isActive ? '활성' : '비활성'}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              deleteRecommendation(recommendation._id!);
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

          {/* 운동 편집 */}
          <div className="lg:col-span-2">
            {selectedRecommendation ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Target className="w-5 h-5 mr-2" />
                      {isCreating ? '새 운동 추천 생성' : '운동 추천 편집'}
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
                            setSelectedRecommendation(null);
                          }} variant="outline" size="sm">
                            취소
                          </Button>
                          <Button 
                            onClick={saveRecommendation}
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
                        { id: 'exercises', label: '운동 목록', icon: '💪' },
                        { id: 'workout', label: '훈련 계획', icon: '📋' }
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
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            수영 기법
                          </label>
                          <select
                            value={selectedRecommendation.technique}
                            onChange={(e) => setSelectedRecommendation({
                              ...selectedRecommendation,
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
                            value={selectedRecommendation.level}
                            onChange={(e) => setSelectedRecommendation({
                              ...selectedRecommendation,
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
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            카테고리
                          </label>
                          <select
                            value={selectedRecommendation.category}
                            onChange={(e) => setSelectedRecommendation({
                              ...selectedRecommendation,
                              category: e.target.value as any
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {CATEGORIES.map(category => (
                              <option key={category.value} value={category.value}>
                                {category.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 운동 목록 탭 */}
                  {activeTab === 'exercises' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900">운동 목록</h3>
                        {(isEditing || isCreating) && (
                          <Button onClick={addExercise} size="sm">
                            <Plus className="w-4 h-4 mr-1" />
                            운동 추가
                          </Button>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        {selectedRecommendation.exercises.map((exercise, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-gray-900">
                                운동 {index + 1}
                              </h4>
                              {(isEditing || isCreating) && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => removeExercise(index)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  운동명
                                </label>
                                <input
                                  type="text"
                                  value={exercise.name}
                                  onChange={(e) => updateExercise(index, 'name', e.target.value)}
                                  disabled={!isEditing && !isCreating}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  난이도
                                </label>
                                <select
                                  value={exercise.difficulty}
                                  onChange={(e) => updateExercise(index, 'difficulty', e.target.value)}
                                  disabled={!isEditing && !isCreating}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                >
                                  {DIFFICULTIES.map(difficulty => (
                                    <option key={difficulty.value} value={difficulty.value}>
                                      {difficulty.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  지속시간 (분)
                                </label>
                                <input
                                  type="number"
                                  value={exercise.duration}
                                  onChange={(e) => updateExercise(index, 'duration', parseInt(e.target.value))}
                                  disabled={!isEditing && !isCreating}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  반복 횟수
                                </label>
                                <input
                                  type="number"
                                  value={exercise.repetitions || ''}
                                  onChange={(e) => updateExercise(index, 'repetitions', parseInt(e.target.value) || undefined)}
                                  disabled={!isEditing && !isCreating}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                />
                              </div>
                            </div>
                            
                            <div className="mt-4">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                설명
                              </label>
                              <textarea
                                value={exercise.description}
                                onChange={(e) => updateExercise(index, 'description', e.target.value)}
                                disabled={!isEditing && !isCreating}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                              />
                            </div>
                            
                            {/* 장비 */}
                            <div className="mt-4">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                필요 장비
                              </label>
                              <div className="space-y-2">
                                {exercise.equipment.map((item, itemIndex) => (
                                  <div key={itemIndex} className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-700">{item}</span>
                                    {(isEditing || isCreating) && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => removeArrayItem(index, 'equipment', itemIndex)}
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    )}
                                  </div>
                                ))}
                                {(isEditing || isCreating) && (
                                  <div className="flex space-x-2">
                                    <input
                                      id={`equipment-input-${index}`}
                                      type="text"
                                      placeholder="장비 추가"
                                      onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                          addArrayItem(index, 'equipment', e.currentTarget.value);
                                          e.currentTarget.value = '';
                                        }
                                      }}
                                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        const input = document.querySelector(`#equipment-input-${index}`) as HTMLInputElement;
                                        if (input && input.value.trim()) {
                                          addArrayItem(index, 'equipment', input.value);
                                          input.value = '';
                                        }
                                      }}
                                    >
                                      <Plus className="w-4 h-4" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* 운동 방법 */}
                            <div className="mt-4">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                운동 방법
                              </label>
                              <div className="space-y-2">
                                {exercise.instructions.map((instruction, itemIndex) => (
                                  <div key={itemIndex} className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-700">{itemIndex + 1}. {instruction}</span>
                                    {(isEditing || isCreating) && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => removeArrayItem(index, 'instructions', itemIndex)}
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    )}
                                  </div>
                                ))}
                                {(isEditing || isCreating) && (
                                  <div className="flex space-x-2">
                                    <input
                                      id={`instructions-input-${index}`}
                                      type="text"
                                      placeholder="운동 방법 추가"
                                      onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                          addArrayItem(index, 'instructions', e.currentTarget.value);
                                          e.currentTarget.value = '';
                                        }
                                      }}
                                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        const input = document.querySelector(`#instructions-input-${index}`) as HTMLInputElement;
                                        if (input && input.value.trim()) {
                                          addArrayItem(index, 'instructions', input.value);
                                          input.value = '';
                                        }
                                      }}
                                    >
                                      <Plus className="w-4 h-4" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 훈련 계획 탭 */}
                  {activeTab === 'workout' && (
                    <div className="space-y-6">
                      <h3 className="font-medium text-gray-900">훈련 계획</h3>
                      <div className="text-center py-8 text-gray-500">
                        훈련 계획 설정 기능은 곧 추가될 예정입니다.
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Dumbbell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    운동 추천을 선택하세요
                  </h3>
                  <p className="text-gray-600 mb-4">
                    왼쪽에서 운동 추천을 선택하거나 새 운동을 추가하세요.
                  </p>
                  <Button onClick={createNewRecommendation}>
                    <Plus className="w-4 h-4 mr-2" />
                    새 운동 추가
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
