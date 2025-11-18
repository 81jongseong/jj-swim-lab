'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Lightbulb, Target, TrendingUp, Award, Star, Calendar } from 'lucide-react';
import withAuth from '@/components/withAuth';

interface Recommendation {
  _id: string;
  type: 'course' | 'exercise' | 'technique' | 'goal';
  title: string;
  description: string;
  reason: string;
  priority: 'low' | 'medium' | 'high';
  estimatedTime?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  category: string;
  createdAt: Date;
}

function StudentRecommendations() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    if (user) {
      loadRecommendations();
    }
  }, [user]);

  const loadRecommendations = async () => {
    try {
      setIsLoading(true);
      const apiClient = (await import('@/utils/api')).default;
      const response = await apiClient.getStudentRecommendations();
      
      if (response.success && response.data) {
        const recommendationsData = response.data.map((r: any) => ({
          _id: r._id || '',
          type: r.type || 'exercise',
          title: r.title || '추천사항',
          description: r.description || '',
          reason: r.reason || '',
          priority: r.priority || 'medium',
          estimatedTime: r.estimatedTime || '',
          difficulty: r.difficulty || 'medium',
          category: r.category || '기타',
          createdAt: r.createdAt ? new Date(r.createdAt) : new Date()
        }));
        setRecommendations(recommendationsData);
      }
    } catch (error) {
      console.error('추천사항 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRecommendations = recommendations.filter(rec => 
    filterType === '' || rec.type === filterType
  );

  const getTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'course': '강의 추천',
      'exercise': '운동 추천',
      'technique': '기술 추천',
      'goal': '목표 설정'
    };
    return types[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'course': 'bg-blue-100 text-blue-800',
      'exercise': 'bg-green-100 text-green-800',
      'technique': 'bg-purple-100 text-purple-800',
      'goal': 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityLabel = (priority: string) => {
    const priorities: { [key: string]: string } = {
      'low': '낮음',
      'medium': '보통',
      'high': '높음'
    };
    return priorities[priority] || priority;
  };

  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      'low': 'bg-green-100 text-green-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getDifficultyLabel = (difficulty: string) => {
    const difficulties: { [key: string]: string } = {
      'easy': '쉬움',
      'medium': '보통',
      'hard': '어려움'
    };
    return difficulties[difficulty] || difficulty;
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: { [key: string]: string } = {
      'easy': 'bg-green-100 text-green-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'hard': 'bg-red-100 text-red-800'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'course':
        return <Target className="w-5 h-5 text-blue-600" />;
      case 'exercise':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'technique':
        return <Star className="w-5 h-5 text-purple-600" />;
      case 'goal':
        return <Award className="w-5 h-5 text-orange-600" />;
      default:
        return <Lightbulb className="w-5 h-5 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">추천사항을 불러오는 중...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">학생 건강 추천사항</h1>
          <p className="text-gray-600">AI가 분석한 맞춤형 학습 추천사항을 확인하세요</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Lightbulb className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">총 추천사항</p>
                <p className="text-2xl font-bold text-gray-900">{recommendations.length}개</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Target className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">강의 추천</p>
                <p className="text-2xl font-bold text-gray-900">
                  {recommendations.filter(r => r.type === 'course').length}개
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">운동 추천</p>
                <p className="text-2xl font-bold text-gray-900">
                  {recommendations.filter(r => r.type === 'exercise').length}개
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Award className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">높은 우선순위</p>
                <p className="text-2xl font-bold text-gray-900">
                  {recommendations.filter(r => r.priority === 'high').length}개
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 필터 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterType('')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === '' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setFilterType('course')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === 'course' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              강의 추천
            </button>
            <button
              onClick={() => setFilterType('exercise')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === 'exercise' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              운동 추천
            </button>
            <button
              onClick={() => setFilterType('technique')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === 'technique' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              기술 추천
            </button>
            <button
              onClick={() => setFilterType('goal')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === 'goal' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              목표 설정
            </button>
          </div>
        </div>

        {/* 추천사항 목록 */}
        <div className="space-y-6">
          {filteredRecommendations.map((recommendation) => (
            <div key={recommendation._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    {getTypeIcon(recommendation.type)}
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(recommendation.type)}`}>
                      {getTypeLabel(recommendation.type)}
                    </span>
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(recommendation.priority)}`}>
                      {getPriorityLabel(recommendation.priority)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{recommendation.title}</h3>
                  <p className="text-gray-700 mb-3">{recommendation.description}</p>
                  <div className="p-3 bg-blue-50 rounded-lg mb-3">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">추천 이유</h4>
                    <p className="text-sm text-gray-700">{recommendation.reason}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {recommendation.estimatedTime && (
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="text-sm font-medium text-gray-900">예상 소요 시간</div>
                    <div className="text-sm text-gray-600">{recommendation.estimatedTime}</div>
                  </div>
                )}
                {recommendation.difficulty && (
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="text-sm font-medium text-gray-900">난이도</div>
                    <span className={`text-sm px-2 py-1 rounded-full ${getDifficultyColor(recommendation.difficulty)}`}>
                      {getDifficultyLabel(recommendation.difficulty)}
                    </span>
                  </div>
                )}
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-sm font-medium text-gray-900">카테고리</div>
                  <div className="text-sm text-gray-600">{recommendation.category}</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-xs text-gray-500">
                  생성일: {recommendation.createdAt.toLocaleDateString()}
                </div>
                
                <div className="flex space-x-2">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    적용하기
                  </button>
                  <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm">
                    나중에
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredRecommendations.length === 0 && (
          <div className="text-center py-12">
            <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">해당 유형의 추천사항이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(StudentRecommendations, { 
  requireTypes: ['student'] 
});