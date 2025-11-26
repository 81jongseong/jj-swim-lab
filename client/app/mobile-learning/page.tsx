/**
 * @file 모바일 최적화 학습 페이지
 * @description 모바일 환경에서 강습법을 쉽게 학습할 수 있도록 최적화된 페이지
 * @date 2025-01-13
 * @author JJ Swim Lab
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui';
import { Card } from '../../components/ui';
import { Badge } from '../../components/ui';
import { Progress } from '../../components/ui';
import { logger } from '@/lib/logger';
import { LoadingState } from '@/components/common';

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

interface MobileLearningData {
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

export default function MobileLearningPage() {
  const { user } = useAuth();
  const [learningData, setLearningData] = useState<MobileLearningData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<TeachingMethod | null>(null);
  const [isLearningModalOpen, setIsLearningModalOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isStepCompleted, setIsStepCompleted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  useEffect(() => {
    fetchLearningData();
  }, []);

  const fetchLearningData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        logger.error('JWT 토큰이 없습니다.');
        return;
      }

      // 강습법 데이터 가져오기
      const methodsResponse = await fetch('http://localhost:5000/api/teaching-methods', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (methodsResponse.ok) {
        const methodsData = await methodsResponse.json();
        const methods = methodsData.data || methodsData;
        
        // 학습 진도 데이터 가져오기 (임시로 로컬 스토리지 사용)
        const progressData = JSON.parse(localStorage.getItem('learningProgress') || '[]');
        
        // 통계 계산
        const stats = calculateStats(methods, progressData);
        
        setLearningData({
          teachingMethods: methods,
          progress: progressData,
          stats
        });
      } else {
        logger.error('강습법 조회 실패', { status: methodsResponse.status });
      }
    } catch (error) {
      logger.error('학습 데이터 조회 중 오류:', error);
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

  const updateProgress = (methodId: string, completedSteps: number[]) => {
    if (!learningData) return;

    const existingProgress = learningData.progress.find(p => p.teachingMethodId === methodId);
    const method = learningData.teachingMethods.find(m => m._id === methodId);
    
    if (!method) return;

    const progress: LearningProgress = {
      teachingMethodId: methodId,
      completedSteps,
      totalSteps: method.steps.length,
      progress: (completedSteps.length / method.steps.length) * 100,
      lastStudied: new Date().toISOString(),
      notes: existingProgress?.notes || '',
      rating: existingProgress?.rating
    };

    const updatedProgress = learningData.progress.filter(p => p.teachingMethodId !== methodId);
    updatedProgress.push(progress);

    const updatedLearningData = {
      ...learningData,
      progress: updatedProgress,
      stats: calculateStats(learningData.teachingMethods, updatedProgress)
    };

    setLearningData(updatedLearningData);
    
    // 로컬 스토리지에 저장
    localStorage.setItem('learningProgress', JSON.stringify(updatedProgress));
  };

  const startLearning = (method: TeachingMethod) => {
    setSelectedMethod(method);
    setCurrentStepIndex(0);
    setIsStepCompleted(false);
    setIsLearningModalOpen(true);
  };

  const nextStep = () => {
    if (!selectedMethod) return;
    
    const progress = getMethodProgress(selectedMethod._id);
    const completedSteps = progress?.completedSteps || [];
    
    if (!completedSteps.includes(currentStepIndex)) {
      const newCompletedSteps = [...completedSteps, currentStepIndex];
      updateProgress(selectedMethod._id, newCompletedSteps);
    }
    
    if (currentStepIndex < selectedMethod.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setIsStepCompleted(false);
    } else {
      // 모든 단계 완료
      setIsLearningModalOpen(false);
      setSelectedMethod(null);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      setIsStepCompleted(false);
    }
  };

  const filteredMethods = learningData?.teachingMethods.filter(method => {
    const categoryMatch = selectedCategory === 'all' || method.category === selectedCategory;
    const levelMatch = selectedLevel === 'all' || method.level === selectedLevel;
    return categoryMatch && levelMatch;
  }) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingState message="학습 데이터를 불러오는 중..." size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 모바일 헤더 */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-gray-900">🏊‍♂️ 모바일 학습</h1>
            <div className="flex items-center space-x-2">
              <Badge className="bg-blue-100 text-blue-800">
                {learningData?.stats.completedMethods || 0}개 완료
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* 통계 섹션 - 모바일 최적화 */}
      {learningData && (
        <div className="px-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
              <div className="p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-500 rounded-full">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-medium text-blue-600">총 강습법</p>
                    <p className="text-lg font-bold text-blue-900">{learningData.stats.totalMethods}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-r from-green-50 to-green-100">
              <div className="p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-green-500 rounded-full">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-medium text-green-600">완료</p>
                    <p className="text-lg font-bold text-green-900">{learningData.stats.completedMethods}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100">
              <div className="p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-500 rounded-full">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-medium text-yellow-600">진행중</p>
                    <p className="text-lg font-bold text-yellow-900">{learningData.stats.inProgressMethods}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-r from-purple-50 to-purple-100">
              <div className="p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-500 rounded-full">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-medium text-purple-600">평균 진도</p>
                    <p className="text-lg font-bold text-purple-900">{learningData.stats.averageProgress.toFixed(0)}%</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* 필터 섹션 - 모바일 최적화 */}
      <div className="px-4 py-2">
        <Card className="bg-white">
          <div className="p-4">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="all">전체 카테고리</option>
                  {TEACHING_METHOD_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">레벨</label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
      </div>

      {/* 강습법 목록 - 모바일 최적화 */}
      <div className="px-4 pb-20">
        <div className="space-y-3">
          {filteredMethods.map((method) => {
            const progress = getMethodProgress(method._id);
            const progressPercentage = progress?.progress || 0;
            
            return (
              <Card key={method._id} className="bg-white hover:shadow-md transition-shadow duration-200">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-base font-semibold text-gray-900 flex-1 mr-2">{method.name}</h3>
                    <div className="flex gap-1">
                      <Badge className={`text-xs ${TEACHING_METHOD_LEVELS.find(l => l.value === method.level)?.color || 'bg-gray-100 text-gray-800'}`}>
                        {TEACHING_METHOD_LEVELS.find(l => l.value === method.level)?.label}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {method.description}
                  </p>

                  {/* 진도 표시 */}
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-gray-700">진도</span>
                      <span className="text-xs text-gray-500">{progressPercentage.toFixed(0)}%</span>
                    </div>
                    <Progress value={progressPercentage} className="h-1" />
                    <div className="text-xs text-gray-500 mt-1">
                      {progress?.completedSteps?.length || 0} / {method.steps.length} 단계
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <Button
                    onClick={() => startLearning(method)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2"
                  >
                    📖 학습하기
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredMethods.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-sm">
              해당 조건에 맞는 강습법이 없습니다.
            </div>
          </div>
        )}
      </div>

      {/* 학습 모달 - 모바일 최적화 */}
      {isLearningModalOpen && selectedMethod && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50">
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4">
              {/* 모달 헤더 */}
              <div className="flex justify-between items-center mb-4 pb-3 border-b">
                <h3 className="text-lg font-semibold text-gray-900">{selectedMethod.name}</h3>
                <button
                  onClick={() => setIsLearningModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
              </div>

              {/* 현재 단계 */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    단계 {currentStepIndex + 1} / {selectedMethod.steps.length}
                  </span>
                  <Badge className={TEACHING_METHOD_LEVELS.find(l => l.value === selectedMethod.level)?.color || 'bg-gray-100 text-gray-800'}>
                    {TEACHING_METHOD_LEVELS.find(l => l.value === selectedMethod.level)?.label}
                  </Badge>
                </div>
                <Progress value={((currentStepIndex + 1) / selectedMethod.steps.length) * 100} className="h-2 mb-4" />
                
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <h4 className="text-base font-medium text-blue-900 mb-2">
                    📚 {selectedMethod.steps[currentStepIndex]}
                  </h4>
                  <p className="text-sm text-blue-700">
                    이 단계를 차근차근 따라해보세요.
                  </p>
                </div>
              </div>

              {/* 팁 섹션 */}
              {selectedMethod.tips && selectedMethod.tips.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">💡 학습 팁</h4>
                  <div className="space-y-2">
                    {selectedMethod.tips.map((tip, index) => (
                      <div key={index} className="p-3 bg-yellow-50 rounded-lg">
                        <p className="text-sm text-yellow-800">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 네비게이션 버튼 */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={prevStep}
                  disabled={currentStepIndex === 0}
                  variant="outline"
                  className="flex-1 bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                >
                  ← 이전
                </Button>
                <Button
                  onClick={nextStep}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {currentStepIndex === selectedMethod.steps.length - 1 ? '완료' : '다음 →'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 하단 네비게이션 - 모바일 최적화 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          <button className="flex flex-col items-center py-2 text-blue-600">
            <svg className="h-5 w-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-xs">학습</span>
          </button>
          <button className="flex flex-col items-center py-2 text-gray-400">
            <svg className="h-5 w-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className="text-xs">진도</span>
          </button>
          <button className="flex flex-col items-center py-2 text-gray-400">
            <svg className="h-5 w-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-xs">통계</span>
          </button>
          <button className="flex flex-col items-center py-2 text-gray-400">
            <svg className="h-5 w-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs">프로필</span>
          </button>
        </div>
      </div>
    </div>
  );
}
