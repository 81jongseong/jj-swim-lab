'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../../hooks/useAuth';

/**
 * AI 설정 - 추천 시스템 관리 페이지
 * 2025-09-13: 404 오류 해결을 위해 생성
 * 기능: AI 기반 수영 학습 추천 시스템 설정 및 관리
 */

interface AIRecommendation {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: 'training' | 'nutrition' | 'equipment' | 'schedule';
  priority: 'low' | 'medium' | 'high';
  isActive: boolean;
  accuracy: number; // 정확도 (%)
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function AIRecommendationsPage() {
  const { user, loading } = useAuth();
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 기본 AI 추천 데이터 (하드코딩)
  const defaultRecommendations: AIRecommendation[] = [
    {
      id: 'stroke-analysis',
      name: 'stroke-analysis',
      displayName: '스트로크 분석',
      description: '수영 자세를 AI로 분석하여 개선점을 추천하는 시스템',
      category: 'training',
      priority: 'high',
      isActive: true,
      accuracy: 92,
      usageCount: 1250,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'training-plan',
      name: 'training-plan',
      displayName: '훈련 계획 추천',
      description: '개인 수준에 맞는 맞춤형 훈련 계획을 추천하는 AI',
      category: 'schedule',
      priority: 'high',
      isActive: true,
      accuracy: 88,
      usageCount: 890,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'nutrition-advice',
      name: 'nutrition-advice',
      displayName: '영양 조언',
      description: '수영 선수를 위한 맞춤형 영양 조언 제공',
      category: 'nutrition',
      priority: 'medium',
      isActive: true,
      accuracy: 85,
      usageCount: 450,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'equipment-suggestion',
      name: 'equipment-suggestion',
      displayName: '장비 추천',
      description: '개인 특성에 맞는 수영 장비를 추천하는 AI',
      category: 'equipment',
      priority: 'low',
      isActive: true,
      accuracy: 78,
      usageCount: 320,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  useEffect(() => {
    // 실제로는 API에서 데이터를 가져와야 함
    setRecommendations(defaultRecommendations);
    setIsLoading(false);
  }, []);

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user || (user.userType !== 'superAdmin' && user.userType !== 'centerAdmin')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">접근 권한 없음</h1>
          <p className="text-gray-600">이 페이지에 접근할 권한이 없습니다.</p>
        </div>
      </div>
    );
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'training': return 'bg-blue-100 text-blue-800';
      case 'nutrition': return 'bg-green-100 text-green-800';
      case 'equipment': return 'bg-purple-100 text-purple-800';
      case 'schedule': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'training': return '훈련';
      case 'nutrition': return '영양';
      case 'equipment': return '장비';
      case 'schedule': return '일정';
      default: return '알 수 없음';
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

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return '높음';
      case 'medium': return '보통';
      case 'low': return '낮음';
      default: return '알 수 없음';
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return 'text-green-600';
    if (accuracy >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI 설정 - 추천 시스템 관리</h1>
        <p className="text-gray-600">AI 기반 수영 학습 추천 시스템 설정 및 관리</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 추천 시스템</p>
              <p className="text-2xl font-bold text-gray-900">{recommendations.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">평균 정확도</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(recommendations.reduce((sum, rec) => sum + rec.accuracy, 0) / recommendations.length)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 사용 횟수</p>
              <p className="text-2xl font-bold text-gray-900">
                {recommendations.reduce((sum, rec) => sum + rec.usageCount, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">고우선순위</p>
              <p className="text-2xl font-bold text-gray-900">{recommendations.filter(r => r.priority === 'high').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI 추천 시스템 목록 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">AI 추천 시스템 목록</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  시스템명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  카테고리
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  우선순위
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  정확도
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  사용 횟수
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recommendations.map((rec) => (
                <tr key={rec.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-ai-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-ai-600">
                            AI
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {rec.displayName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {rec.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(rec.category)}`}>
                      {getCategoryText(rec.category)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(rec.priority)}`}>
                      {getPriorityText(rec.priority)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${rec.accuracy}%` }}
                            ></div>
                          </div>
                          <span className={`text-sm font-medium ${getAccuracyColor(rec.accuracy)}`}>
                            {rec.accuracy}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {rec.usageCount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      rec.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {rec.isActive ? '활성' : '비활성'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      설정
                    </button>
                    <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                      편집
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 개발 노트 */}
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-sm font-medium text-yellow-800 mb-2">🚧 개발 상태</h3>
        <p className="text-sm text-yellow-700">
          이 페이지는 현재 개발 중입니다. 실제 AI 모델 연동과 데이터베이스 연동이 필요합니다.
        </p>
      </div>
    </div>
  );
}
