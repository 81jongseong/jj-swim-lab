/**
 * @file 학생용 개인화 추천 페이지
 * @description 강습법 기반으로 맞춤형 학습 추천을 제공하는 페이지
 * @date 2025-01-13
 * @author JJ Swim Lab
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import { Progress } from '../../../components/ui/Progress';

// 강습법 카테고리 상수
const TEACHING_METHOD_CATEGORIES = [
  '자유형',
  '배영',
  '평영',
  '접영',
  '혼영',
  '기초기술',
  '호흡법',
  '발차기',
  '손짓',
  '턴',
  '스타트',
  '안전수칙',
  '체력향상',
  '기타'
] as const;

// 강습법 레벨 상수
const TEACHING_METHOD_LEVELS = [
  { value: 'beginner', label: '초급', color: 'bg-green-100 text-green-800' },
  { value: 'intermediate', label: '중급', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'advanced', label: '고급', color: 'bg-red-100 text-red-800' }
] as const;

interface TeachingMethod {
  _id: string;
  name: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  steps: string[];
  tips: string[];
  videoUrl?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface LearningProgress {
  teachingMethodId: string;
  completedSteps: number[];
  totalSteps: number;
  progress: number;
  lastStudied: string;
  notes?: string;
  rating?: number;
}

interface Recommendation {
  _id: string;
  type: 'next_lesson' | 'review' | 'challenge' | 'foundation';
  title: string;
  description: string;
  teachingMethod: TeachingMethod;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: number; // 분
  difficulty: 'easy' | 'medium' | 'hard';
}

interface StudentRecommendationData {
  teachingMethods: TeachingMethod[];
  progress: LearningProgress[];
  recommendations: Recommendation[];
  stats: {
    totalMethods: number;
    completedMethods: number;
    inProgressMethods: number;
    averageProgress: number;
    studyStreak: number;
    weakAreas: string[];
    strongAreas: string[];
  };
}

export default function RecommendationsPage() {
  const { user } = useAuth();
  const [recommendationData, setRecommendationData] = useState<StudentRecommendationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'recommendations' | 'analysis' | 'goals'>('recommendations');
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    targetDate: '',
    teachingMethods: [] as string[],
    priority: 'medium' as 'high' | 'medium' | 'low'
  });

  useEffect(() => {
    if (user?.userType === 'student') {
      fetchRecommendationData();
    }
  }, [user]);

  const fetchRecommendationData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ JWT 토큰이 없습니다.');
        return;
      }

      // 추천 데이터 가져오기
      const recommendationsResponse = await fetch('http://localhost:5000/api/recommendations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (recommendationsResponse.ok) {
        const recommendationsData = await recommendationsResponse.json();
        const recommendations = recommendationsData.data || [];
        
        // 학습 분석 데이터 가져오기
        const analysisResponse = await fetch('http://localhost:5000/api/recommendations/analysis', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        let analysisData = {
          weakAreas: [],
          strongAreas: [],
          learningPatterns: {},
          totalMethods: 0,
          completedMethods: 0,
          averageProgress: 0
        };

        if (analysisResponse.ok) {
          const analysis = await analysisResponse.json();
          analysisData = analysis.data || analysisData;
        }

        // 학습 진도 데이터 가져오기
        const progressResponse = await fetch('http://localhost:5000/api/learning-progress', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        let progress = [];
        if (progressResponse.ok) {
          const progressData = await progressResponse.json();
          progress = progressData.data || [];
        }

        // 통계 데이터 가져오기
        const statsResponse = await fetch('http://localhost:5000/api/learning-progress/stats/overview', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        let stats = {
          totalMethods: 0,
          completedMethods: 0,
          inProgressMethods: 0,
          averageProgress: 0,
          studyStreak: 0,
          weakAreas: [],
          strongAreas: []
        };

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          stats = {
            ...statsData.data,
            weakAreas: analysisData.weakAreas,
            strongAreas: analysisData.strongAreas
          };
        }

        // 강습법 데이터는 progress에서 가져오기
        const methods = progress.map((p: any) => p.teachingMethodId).filter(Boolean);
        
        setRecommendationData({
          teachingMethods: methods,
          progress: progress,
          recommendations,
          stats
        });
      } else {
        console.error('❌ 추천 데이터 조회 실패:', recommendationsResponse.status);
      }
    } catch (error) {
      console.error('❌ 추천 데이터 조회 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = (methods: TeachingMethod[], progress: LearningProgress[]): Recommendation[] => {
    const recommendations: Recommendation[] = [];
    
    // 완료된 강습법 찾기
    const completedMethods = progress.filter(p => p.progress === 100);
    const inProgressMethods = progress.filter(p => p.progress > 0 && p.progress < 100);
    const notStartedMethods = methods.filter(m => !progress.find(p => p.teachingMethodId === m._id));
    
    // 1. 다음 학습 추천 (진행 중인 강습법 완료)
    inProgressMethods.forEach(progressItem => {
      const method = methods.find(m => m._id === progressItem.teachingMethodId);
      if (method) {
        recommendations.push({
          _id: `next_${method._id}`,
          type: 'next_lesson',
          title: `${method.name} 완료하기`,
          description: `${method.name}의 나머지 단계를 완료하여 다음 레벨로 진행하세요.`,
          teachingMethod: method,
          reason: '진행 중인 강습법을 완료하면 더 체계적인 학습이 가능합니다.',
          priority: 'high',
          estimatedTime: method.steps.length * 10,
          difficulty: 'medium'
        });
      }
    });
    
    // 2. 복습 추천 (완료된 강습법 중 오래된 것)
    completedMethods.forEach(progressItem => {
      const method = methods.find(m => m._id === progressItem.teachingMethodId);
      if (method) {
        const daysSinceLastStudy = Math.floor((Date.now() - new Date(progressItem.lastStudied).getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceLastStudy > 7) {
          recommendations.push({
            _id: `review_${method._id}`,
            type: 'review',
            title: `${method.name} 복습하기`,
            description: `${method.name}을 복습하여 기억을 되살리고 실력을 유지하세요.`,
            teachingMethod: method,
            reason: `${daysSinceLastStudy}일 전에 학습한 내용을 복습하면 장기 기억에 도움이 됩니다.`,
            priority: 'medium',
            estimatedTime: method.steps.length * 5,
            difficulty: 'easy'
        });
        }
      }
    });
    
    // 3. 도전 추천 (다음 레벨 강습법)
    const userLevel = getUserLevel(progress, methods);
    const nextLevelMethods = methods.filter(m => {
      const methodLevel = m.level;
      const userLevelValue = userLevel === 'beginner' ? 0 : userLevel === 'intermediate' ? 1 : 2;
      const methodLevelValue = methodLevel === 'beginner' ? 0 : methodLevel === 'intermediate' ? 1 : 2;
      return methodLevelValue === userLevelValue + 1;
    });
    
    nextLevelMethods.slice(0, 3).forEach(method => {
      recommendations.push({
        _id: `challenge_${method._id}`,
        type: 'challenge',
        title: `${method.name} 도전하기`,
        description: `${method.name}을 통해 다음 레벨로 도전해보세요.`,
        teachingMethod: method,
        reason: '현재 레벨을 완료했으니 다음 단계로 도전할 때입니다.',
        priority: 'medium',
        estimatedTime: method.steps.length * 15,
        difficulty: 'hard'
      });
    });
    
    // 4. 기초 강화 추천 (약한 영역)
    const weakAreas = getWeakAreas(progress, methods);
    weakAreas.forEach(area => {
      const areaMethods = methods.filter(m => m.category === area && m.level === 'beginner');
      if (areaMethods.length > 0) {
        const method = areaMethods[0];
        recommendations.push({
          _id: `foundation_${method._id}`,
          type: 'foundation',
          title: `${area} 기초 강화`,
          description: `${area} 영역의 기초를 다시 한번 다져보세요.`,
          teachingMethod: method,
          reason: `${area} 영역에서 부족한 부분이 있어 기초 강화가 필요합니다.`,
          priority: 'high',
          estimatedTime: method.steps.length * 12,
          difficulty: 'medium'
        });
      }
    });
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const getUserLevel = (progress: LearningProgress[], methods: TeachingMethod[]): string => {
    const completedMethods = progress.filter(p => p.progress === 100);
    if (completedMethods.length === 0) return 'beginner';
    
    const completedLevels = completedMethods.map(p => {
      const method = methods.find(m => m._id === p.teachingMethodId);
      return method?.level;
    });
    
    if (completedLevels.includes('advanced')) return 'advanced';
    if (completedLevels.includes('intermediate')) return 'intermediate';
    return 'beginner';
  };

  const getWeakAreas = (progress: LearningProgress[], methods: TeachingMethod[]): string[] => {
    const categoryProgress: { [key: string]: number[] } = {};
    
    progress.forEach(p => {
      const method = methods.find(m => m._id === p.teachingMethodId);
      if (method) {
        if (!categoryProgress[method.category]) {
          categoryProgress[method.category] = [];
        }
        categoryProgress[method.category].push(p.progress);
      }
    });
    
    const weakAreas: string[] = [];
    Object.entries(categoryProgress).forEach(([category, progresses]) => {
      const averageProgress = progresses.reduce((sum, p) => sum + p, 0) / progresses.length;
      if (averageProgress < 50) {
        weakAreas.push(category);
      }
    });
    
    return weakAreas;
  };

  const calculateStats = (methods: TeachingMethod[], progress: LearningProgress[]) => {
    const totalMethods = methods.length;
    let completedMethods = 0;
    let inProgressMethods = 0;
    let totalProgress = 0;

    methods.forEach(method => {
      const methodProgress = progress.find(p => p.teachingMethodId === method._id);
      if (methodProgress) {
        if (methodProgress.progress === 100) {
          completedMethods++;
        } else if (methodProgress.progress > 0) {
          inProgressMethods++;
        }
        totalProgress += methodProgress.progress;
      }
    });

    return {
      totalMethods,
      completedMethods,
      inProgressMethods,
      averageProgress: totalMethods > 0 ? totalProgress / totalMethods : 0,
      studyStreak: 7, // 임시 데이터
      weakAreas: getWeakAreas(progress, methods),
      strongAreas: methods.map(m => m.category).filter(category => 
        !getWeakAreas(progress, methods).includes(category)
      )
    };
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'next_lesson': return '🎯';
      case 'review': return '🔄';
      case 'challenge': return '🚀';
      case 'foundation': return '🏗️';
      default: return '📚';
    }
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'next_lesson': return 'bg-blue-50 border-blue-200';
      case 'review': return 'bg-green-50 border-green-200';
      case 'challenge': return 'bg-purple-50 border-purple-200';
      case 'foundation': return 'bg-orange-50 border-orange-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user || user.userType !== 'student') {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">접근 권한이 없습니다</h1>
          <p className="text-gray-600">학생만 이 페이지에 접근할 수 있습니다.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">추천 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            🎯 개인화 추천
          </h1>
          <p className="mt-2 text-gray-600">
            AI가 분석한 당신만의 맞춤형 학습 추천을 확인해보세요.
          </p>
        </div>

        {/* 통계 섹션 */}
        {recommendationData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-500 rounded-full">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-blue-600">완료한 강습법</p>
                    <p className="text-2xl font-bold text-blue-900">{recommendationData.stats.completedMethods}개</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-r from-green-50 to-green-100">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-500 rounded-full">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-green-600">평균 진도</p>
                    <p className="text-2xl font-bold text-green-900">{recommendationData.stats.averageProgress.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-r from-red-50 to-red-100">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-red-500 rounded-full">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-red-600">약한 영역</p>
                    <p className="text-2xl font-bold text-red-900">{recommendationData.stats.weakAreas.length}개</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-r from-purple-50 to-purple-100">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-500 rounded-full">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-purple-600">학습 연속</p>
                    <p className="text-2xl font-bold text-purple-900">{recommendationData.stats.studyStreak}일</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* 탭 네비게이션 */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setSelectedTab('recommendations')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'recommendations'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🎯 추천 학습
              </button>
              <button
                onClick={() => setSelectedTab('analysis')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'analysis'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📊 학습 분석
              </button>
              <button
                onClick={() => setSelectedTab('goals')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'goals'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🎯 학습 목표
              </button>
            </nav>
          </div>
        </div>

        {/* 탭 콘텐츠 */}
        {selectedTab === 'recommendations' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">맞춤형 학습 추천</h2>
              <Button
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('token');
                    if (!token) return;

                    const response = await fetch('http://localhost:5000/api/recommendations/generate', {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                      }
                    });

                    if (response.ok) {
                      // 데이터 새로고침
                      await fetchRecommendationData();
                    } else {
                      console.error('❌ 추천 생성 실패:', response.status);
                    }
                  } catch (error) {
                    console.error('❌ 추천 생성 중 오류:', error);
                  }
                }}
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100"
              >
                🔄 추천 새로고침
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendationData?.recommendations.map((recommendation) => (
                <Card key={recommendation._id} className={`hover:shadow-lg transition-shadow duration-200 ${getRecommendationColor(recommendation.type)}`}>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">{getRecommendationIcon(recommendation.type)}</span>
                        <h3 className="text-lg font-semibold text-gray-900">{recommendation.title}</h3>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getPriorityColor(recommendation.priority)}>
                          {recommendation.priority === 'high' ? '높음' : recommendation.priority === 'medium' ? '보통' : '낮음'}
                        </Badge>
                        <Badge className={getDifficultyColor(recommendation.difficulty)}>
                          {recommendation.difficulty === 'easy' ? '쉬움' : recommendation.difficulty === 'medium' ? '보통' : '어려움'}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {recommendation.description}
                    </p>

                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">추천 이유</h4>
                      <p className="text-sm text-gray-600">{recommendation.reason}</p>
                    </div>

                    <div className="space-y-2 text-sm text-gray-500 mb-4">
                      <div>⏱️ 예상 시간: {recommendation.estimatedTime}분</div>
                      <div>📂 카테고리: {recommendation.teachingMethod.category}</div>
                      <div>📊 레벨: {TEACHING_METHOD_LEVELS.find(l => l.value === recommendation.teachingMethod.level)?.label}</div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        onClick={() => window.open(`/student/learning-progress?method=${recommendation.teachingMethod._id}`, '_blank')}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        📖 학습하기
                      </Button>
                      <Button
                        onClick={async () => {
                          try {
                            const token = localStorage.getItem('token');
                            if (!token) return;

                            const response = await fetch(`http://localhost:5000/api/recommendations/${recommendation._id}/complete`, {
                              method: 'PUT',
                              headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                              }
                            });

                            if (response.ok) {
                              // 데이터 새로고침
                              await fetchRecommendationData();
                            } else {
                              console.error('❌ 추천 완료 처리 실패:', response.status);
                            }
                          } catch (error) {
                            console.error('❌ 추천 완료 처리 중 오류:', error);
                          }
                        }}
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-300 hover:bg-green-100"
                      >
                        ✓ 완료
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {recommendationData?.recommendations.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">
                  현재 추천할 학습이 없습니다. 학습을 진행하면 더 많은 추천을 받을 수 있습니다.
                </div>
              </div>
            )}
          </div>
        )}

        {selectedTab === 'analysis' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">학습 분석</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 약한 영역 */}
              <Card className="bg-red-50 border-red-200">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-red-900 mb-4">🔴 약한 영역</h3>
                  <div className="space-y-2">
                    {recommendationData?.stats.weakAreas.map((area, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <span className="text-sm font-medium text-gray-700">{area}</span>
                        <Badge className="bg-red-100 text-red-800">개선 필요</Badge>
                      </div>
                    ))}
                  </div>
                  {recommendationData?.stats.weakAreas.length === 0 && (
                    <p className="text-sm text-gray-600">약한 영역이 없습니다. 잘하고 있습니다! 🎉</p>
                  )}
                </div>
              </Card>

              {/* 강한 영역 */}
              <Card className="bg-green-50 border-green-200">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-4">🟢 강한 영역</h3>
                  <div className="space-y-2">
                    {recommendationData?.stats.strongAreas.map((area, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <span className="text-sm font-medium text-gray-700">{area}</span>
                        <Badge className="bg-green-100 text-green-800">우수</Badge>
                      </div>
                    ))}
                  </div>
                  {recommendationData?.stats.strongAreas.length === 0 && (
                    <p className="text-sm text-gray-600">아직 충분한 데이터가 없습니다.</p>
                  )}
                </div>
              </Card>
            </div>

            {/* 학습 진도 차트 */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 카테고리별 학습 진도</h3>
                <div className="space-y-4">
                  {TEACHING_METHOD_CATEGORIES.map((category) => {
                    const categoryMethods = recommendationData?.teachingMethods.filter(m => m.category === category) || [];
                    const categoryProgress = recommendationData?.progress.filter(p => 
                      categoryMethods.some(m => m._id === p.teachingMethodId)
                    ) || [];
                    const averageProgress = categoryProgress.length > 0 
                      ? categoryProgress.reduce((sum, p) => sum + p.progress, 0) / categoryProgress.length 
                      : 0;
                    
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">{category}</span>
                          <span className="text-sm text-gray-500">{averageProgress.toFixed(1)}%</span>
                        </div>
                        <Progress value={averageProgress} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>
        )}

        {selectedTab === 'goals' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">학습 목표</h2>
              <Button
                onClick={() => setIsGoalModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                🎯 새 목표 설정
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* 임시 목표 데이터 */}
              <Card className="bg-blue-50 border-blue-200">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-blue-900">자유형 마스터하기</h3>
                    <Badge className="bg-blue-100 text-blue-800">진행중</Badge>
                  </div>
                  <p className="text-blue-700 text-sm mb-4">
                    자유형의 모든 기술을 완벽하게 익혀서 50m를 자유롭게 헤엄칠 수 있도록 하겠습니다.
                  </p>
                  <div className="space-y-2 text-sm text-blue-600 mb-4">
                    <div>📅 목표일: 2025-03-31</div>
                    <div>📊 진행률: 65%</div>
                    <div>⏱️ 남은 시간: 77일</div>
                  </div>
                  <Progress value={65} className="h-2 mb-4" />
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                      📖 학습하기
                    </Button>
                    <Button size="sm" variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100">
                      ✏️ 수정
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="bg-green-50 border-green-200">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-green-900">호흡법 개선</h3>
                    <Badge className="bg-green-100 text-green-800">완료</Badge>
                  </div>
                  <p className="text-green-700 text-sm mb-4">
                    호흡법을 개선하여 더 효율적인 수영을 할 수 있도록 하겠습니다.
                  </p>
                  <div className="space-y-2 text-sm text-green-600 mb-4">
                    <div>📅 완료일: 2025-01-10</div>
                    <div>📊 진행률: 100%</div>
                    <div>🎉 달성!</div>
                  </div>
                  <Progress value={100} className="h-2 mb-4" />
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                      🎉 완료됨
                    </Button>
                    <Button size="sm" variant="outline" className="bg-green-50 text-green-700 border-green-300 hover:bg-green-100">
                      📊 리뷰
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* 목표 설정 모달 */}
        {isGoalModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">새 학습 목표</h3>
                  <button
                    onClick={() => setIsGoalModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">목표 제목 *</label>
                    <input
                      type="text"
                      value={newGoal.title}
                      onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="목표 제목을 입력하세요"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">목표 설명</label>
                    <textarea
                      value={newGoal.description}
                      onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="목표에 대한 자세한 설명을 입력하세요"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">목표 날짜 *</label>
                      <input
                        type="date"
                        value={newGoal.targetDate}
                        onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">우선순위</label>
                      <select
                        value={newGoal.priority}
                        onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value as 'high' | 'medium' | 'low' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="high">높음</option>
                        <option value="medium">보통</option>
                        <option value="low">낮음</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-4 border-t">
                    <Button
                      onClick={() => setIsGoalModalOpen(false)}
                      variant="outline"
                    >
                      취소
                    </Button>
                    <Button
                      onClick={() => {
                        // 목표 생성 로직
                        setIsGoalModalOpen(false);
                        setNewGoal({
                          title: '',
                          description: '',
                          targetDate: '',
                          teachingMethods: [],
                          priority: 'medium'
                        });
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      생성
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
