/**
 * @file 학생용 학습 진도 관리 페이지
 * @description 학생이 강습법 기반으로 학습 진도를 확인하고 관리할 수 있는 페이지
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

interface StudentLearningData {
  teachingMethods: TeachingMethod[];
  progress: LearningProgress[];
  stats: {
    totalMethods: number;
    completedMethods: number;
    inProgressMethods: number;
    averageProgress: number;
    studyStreak: number;
  };
}

export default function LearningProgressPage() {
  const { user } = useAuth();
  const [learningData, setLearningData] = useState<StudentLearningData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<TeachingMethod | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    if (user?.userType === 'student') {
      fetchLearningData();
    }
  }, [user]);

  const fetchLearningData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ JWT 토큰이 없습니다.');
        return;
      }

      // 학습 진도 데이터 가져오기
      const progressResponse = await fetch('http://localhost:5000/api/learning-progress', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (progressResponse.ok) {
        const progressData = await progressResponse.json();
        const progress = progressData.data || [];
        
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
          studyStreak: 0
        };

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          stats = statsData.data || stats;
        }

        // 강습법 데이터는 progress에서 가져오기
        const methods = progress.map((p: any) => p.teachingMethodId).filter(Boolean);
        
        setLearningData({
          teachingMethods: methods,
          progress: progress,
          stats
        });
      } else {
        console.error('❌ 학습 진도 조회 실패:', progressResponse.status);
      }
    } catch (error) {
      console.error('❌ 학습 데이터 조회 중 오류:', error);
    } finally {
      setLoading(false);
    }
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
      studyStreak: 7 // 임시 데이터
    };
  };

  const getMethodProgress = (methodId: string): LearningProgress | undefined => {
    return learningData?.progress.find(p => p.teachingMethodId === methodId);
  };

  const updateProgress = async (methodId: string, completedSteps: number[]) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ JWT 토큰이 없습니다.');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/learning-progress/${methodId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          completedSteps,
          studyTime: 10 // 기본 학습 시간 (분)
        })
      });

      if (response.ok) {
        const result = await response.json();
        // 데이터 새로고침
        await fetchLearningData();
      } else {
        console.error('❌ 진도 업데이트 실패:', response.status);
      }
    } catch (error) {
      console.error('❌ 진도 업데이트 중 오류:', error);
    }
  };

  const filteredMethods = learningData?.teachingMethods.filter(method => {
    const categoryMatch = selectedCategory === 'all' || method.category === selectedCategory;
    const levelMatch = selectedLevel === 'all' || method.level === selectedLevel;
    return categoryMatch && levelMatch;
  }) || [];

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
          <p className="text-gray-600">학습 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            📚 나의 학습 진도
          </h1>
          <p className="mt-2 text-gray-600">
            강습법을 단계별로 학습하고 진도를 추적해보세요.
          </p>
        </div>

        {/* 통계 섹션 */}
        {learningData && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-500 rounded-full">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-blue-600">총 강습법</p>
                    <p className="text-2xl font-bold text-blue-900">{learningData.stats.totalMethods}개</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-r from-green-50 to-green-100">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-500 rounded-full">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-green-600">완료</p>
                    <p className="text-2xl font-bold text-green-900">{learningData.stats.completedMethods}개</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-500 rounded-full">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-yellow-600">진행중</p>
                    <p className="text-2xl font-bold text-yellow-900">{learningData.stats.inProgressMethods}개</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-r from-purple-50 to-purple-100">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-500 rounded-full">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-purple-600">평균 진도</p>
                    <p className="text-2xl font-bold text-purple-900">{learningData.stats.averageProgress.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-r from-orange-50 to-orange-100">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-orange-500 rounded-full">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-orange-600">학습 연속</p>
                    <p className="text-2xl font-bold text-orange-900">{learningData.stats.studyStreak}일</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* 필터 */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">강습법 필터</h3>
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">전체 카테고리</option>
                  {TEACHING_METHOD_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">전체 레벨</option>
                  {TEACHING_METHOD_LEVELS.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* 강습법 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMethods.map((method) => {
            const progress = getMethodProgress(method._id);
            const progressPercentage = progress?.progress || 0;
            
            return (
              <Card key={method._id} className="hover:shadow-lg transition-shadow duration-200">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{method.name}</h3>
                    <div className="flex gap-2">
                      <Badge className={TEACHING_METHOD_LEVELS.find(l => l.value === method.level)?.color || 'bg-gray-100 text-gray-800'}>
                        {TEACHING_METHOD_LEVELS.find(l => l.value === method.level)?.label}
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-800">
                        📂 {method.category}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {method.description}
                  </p>

                  {/* 진도 표시 */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">학습 진도</span>
                      <span className="text-sm text-gray-500">{progressPercentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                    <div className="text-xs text-gray-500 mt-1">
                      {progress?.completedSteps?.length || 0} / {method.steps.length} 단계 완료
                    </div>
                  </div>

                  {/* 마지막 학습일 */}
                  {progress?.lastStudied && (
                    <div className="mb-4">
                      <div className="text-sm text-gray-500">
                        마지막 학습: {new Date(progress.lastStudied).toLocaleDateString()}
                      </div>
                    </div>
                  )}

                  {/* 액션 버튼들 */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      onClick={() => {
                        setSelectedMethod(method);
                        setIsDetailModalOpen(true);
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      📖 학습하기
                    </Button>
                    {progress && progress.progress > 0 && (
                      <Button
                        onClick={() => {
                          setSelectedMethod(method);
                          setIsDetailModalOpen(true);
                        }}
                        variant="outline"
                        className="flex-1 bg-green-50 text-green-700 border-green-300 hover:bg-green-100"
                      >
                        📊 진도보기
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredMethods.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              해당 조건에 맞는 강습법이 없습니다.
            </div>
          </div>
        )}

        {/* 강습법 상세보기 모달 */}
        {isDetailModalOpen && selectedMethod && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">{selectedMethod.name}</h3>
                  <button
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      setSelectedMethod(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900">설명</h4>
                    <p className="text-gray-600">{selectedMethod.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900">카테고리</h4>
                      <p className="text-gray-600">{selectedMethod.category}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">레벨</h4>
                      <p className="text-gray-600">{TEACHING_METHOD_LEVELS.find(l => l.value === selectedMethod.level)?.label}</p>
                    </div>
                  </div>

                  {/* 학습 단계 */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">학습 단계</h4>
                    <div className="space-y-3">
                      {selectedMethod.steps.map((step, index) => {
                        const progress = getMethodProgress(selectedMethod._id);
                        const isCompleted = progress?.completedSteps?.includes(index) || false;
                        
                        return (
                          <div key={index} className={`border rounded-lg p-4 ${isCompleted ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${isCompleted ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                                  {isCompleted ? '✓' : index + 1}
                                </div>
                                <span className={`text-sm ${isCompleted ? 'text-green-800 line-through' : 'text-gray-700'}`}>
                                  {step}
                                </span>
                              </div>
                              <Button
                                onClick={() => {
                                  const progress = getMethodProgress(selectedMethod._id);
                                  const completedSteps = progress?.completedSteps || [];
                                  const newCompletedSteps = isCompleted 
                                    ? completedSteps.filter(i => i !== index)
                                    : [...completedSteps, index];
                                  updateProgress(selectedMethod._id, newCompletedSteps);
                                }}
                                variant="outline"
                                size="sm"
                                className={isCompleted ? 'bg-red-50 text-red-700 border-red-300 hover:bg-red-100' : 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100'}
                              >
                                {isCompleted ? '취소' : '완료'}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 팁 */}
                  {selectedMethod.tips && selectedMethod.tips.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">💡 학습 팁</h4>
                      <div className="space-y-2">
                        {selectedMethod.tips.map((tip, index) => (
                          <div key={index} className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">{tip}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-4 pt-4 border-t">
                    <Button
                      onClick={() => {
                        setIsDetailModalOpen(false);
                        setSelectedMethod(null);
                      }}
                      variant="outline"
                    >
                      닫기
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
