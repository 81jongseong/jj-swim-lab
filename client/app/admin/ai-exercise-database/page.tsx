'use client';

import React, { useState, useEffect } from 'react';
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

export default function AIExerciseDatabasePage() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [selectedRecommendation, setSelectedRecommendation] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'exercises' | 'workout'>('exercises');

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

  useEffect(() => {
    // 샘플 데이터 로드
    const sampleRecommendations = [
      {
        _id: '1',
        technique: 'freestyle',
        level: 'beginner',
        category: 'posture',
        exercises: [
          { name: '기본 자유형', difficulty: 'easy', duration: 10 },
          { name: '킥보드 연습', difficulty: 'easy', duration: 15 }
        ],
        workoutPlan: [],
        isActive: true
      }
    ];
    setRecommendations(sampleRecommendations);
  }, []);

  const createNewRecommendation = () => {
    const newRecommendation = {
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

  const getTechniqueLabel = (technique: string) => {
    return TECHNIQUES.find(t => t.value === technique)?.label || technique;
  };

  const getLevelLabel = (level: string) => {
    return LEVELS.find(l => l.value === level)?.label || level;
  };

  const getCategoryLabel = (category: string) => {
    return CATEGORIES.find(c => c.value === category)?.label || category;
  };

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 운동 추천 목록 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Dumbbell className="w-5 h-5 mr-2" />
                  운동 추천 목록
                </h3>
              </div>
              <div className="space-y-2">
                {recommendations.map((recommendation) => (
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
                        <span className={`px-2 py-1 text-xs rounded ${recommendation.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {recommendation.isActive ? '활성' : '비활성'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 운동 편집 */}
          <div className="lg:col-span-2">
            {selectedRecommendation ? (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    {isCreating ? '새 운동 추천 생성' : '운동 추천 편집'}
                  </h3>
                  <div className="flex items-center space-x-2">
                    {!isEditing && !isCreating && (
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        편집
                      </button>
                    )}
                    {(isEditing || isCreating) && (
                      <>
                        <button 
                          onClick={() => {
                            setIsEditing(false);
                            setIsCreating(false);
                            setSelectedRecommendation(null);
                          }}
                          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                        >
                          취소
                        </button>
                        <button 
                          onClick={() => {
                            setSaved(true);
                            setTimeout(() => setSaved(false), 3000);
                            setIsEditing(false);
                            setIsCreating(false);
                          }}
                          className={`px-3 py-1 text-sm rounded ${saved ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
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
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* 기본 정보 */}
                {(isEditing || isCreating) && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">기본 정보</h4>
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
                            category: e.target.value
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

                {/* 운동 목록 */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">운동 목록</h4>
                    {(isEditing || isCreating) && (
                      <button 
                        onClick={() => {
                          const newExercise = {
                            name: '',
                            difficulty: 'easy',
                            duration: 10
                          };
                          setSelectedRecommendation({
                            ...selectedRecommendation,
                            exercises: [...selectedRecommendation.exercises, newExercise]
                          });
                        }}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        운동 추가
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {selectedRecommendation.exercises.map((exercise: any, index: number) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium text-gray-900">
                            운동 {index + 1}
                          </h5>
                          {(isEditing || isCreating) && (
                            <button
                              onClick={() => {
                                const updated = { ...selectedRecommendation };
                                updated.exercises.splice(index, 1);
                                setSelectedRecommendation(updated);
                              }}
                              className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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
                              onChange={(e) => {
                                const updated = { ...selectedRecommendation };
                                updated.exercises[index] = { ...exercise, name: e.target.value };
                                setSelectedRecommendation(updated);
                              }}
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
                              onChange={(e) => {
                                const updated = { ...selectedRecommendation };
                                updated.exercises[index] = { ...exercise, difficulty: e.target.value };
                                setSelectedRecommendation(updated);
                              }}
                              disabled={!isEditing && !isCreating}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            >
                              <option value="easy">쉬움</option>
                              <option value="medium">보통</option>
                              <option value="hard">어려움</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <Dumbbell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  운동 추천을 선택하세요
                </h3>
                <p className="text-gray-600 mb-4">
                  왼쪽에서 운동 추천을 선택하거나 새 운동을 추가하세요.
                </p>
                <button 
                  onClick={createNewRecommendation}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  새 운동 추가
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}