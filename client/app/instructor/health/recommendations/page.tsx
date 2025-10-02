'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Heart, Users, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import withAuth from '@/components/withAuth';

interface HealthRecommendation {
  _id: string;
  studentId: string;
  studentName: string;
  condition: string;
  recommendation: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'implemented';
  createdAt: Date;
  updatedAt: Date;
}

function HealthRecommendations() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<HealthRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadRecommendations();
    }
  }, [user]);

  const loadRecommendations = async () => {
    try {
      setIsLoading(true);
      // 임시 데이터
      const tempRecommendations: HealthRecommendation[] = [
        {
          _id: '1',
          studentId: 'student001',
          studentName: '김학생',
          condition: '어깨 통증',
          recommendation: '어깨 스트레칭을 수업 전후로 실시하고, 자유형 수영 시 팔 동작을 조정하세요.',
          priority: 'high',
          status: 'pending',
          createdAt: new Date('2024-01-20'),
          updatedAt: new Date('2024-01-20')
        },
        {
          _id: '2',
          studentId: 'student002',
          studentName: '이학생',
          condition: '무릎 관절염',
          recommendation: '무릎에 부담이 적은 배영 위주로 수영하고, 발차기 강도를 조절하세요.',
          priority: 'medium',
          status: 'approved',
          createdAt: new Date('2024-01-19'),
          updatedAt: new Date('2024-01-21')
        },
        {
          _id: '3',
          studentId: 'student003',
          studentName: '박학생',
          condition: '허리 통증',
          recommendation: '코어 강화 운동을 추가하고, 수영 자세를 교정하세요.',
          priority: 'high',
          status: 'implemented',
          createdAt: new Date('2024-01-18'),
          updatedAt: new Date('2024-01-22')
        }
      ];
      setRecommendations(tempRecommendations);
    } catch (error) {
      console.error('건강 추천사항 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
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

  const getStatusLabel = (status: string) => {
    const statuses: { [key: string]: string } = {
      'pending': '검토중',
      'approved': '승인됨',
      'implemented': '적용됨'
    };
    return statuses[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-blue-100 text-blue-800',
      'implemented': 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'implemented':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'approved':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const updateRecommendationStatus = (recommendationId: string, newStatus: string) => {
    setRecommendations(prev => prev.map(rec => 
      rec._id === recommendationId 
        ? { ...rec, status: newStatus as any, updatedAt: new Date() }
        : rec
    ));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">건강 추천사항을 불러오는 중...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">학생 건강 추천사항</h1>
        <p className="text-gray-600">학생들의 건강 상태를 분석하고 맞춤형 추천사항을 제공하세요</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Heart className="w-8 h-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 추천사항</p>
              <p className="text-2xl font-bold text-gray-900">{recommendations.length}개</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <AlertCircle className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">검토중</p>
              <p className="text-2xl font-bold text-gray-900">
                {recommendations.filter(r => r.status === 'pending').length}개
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">적용됨</p>
              <p className="text-2xl font-bold text-gray-900">
                {recommendations.filter(r => r.status === 'implemented').length}개
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">높은 우선순위</p>
              <p className="text-2xl font-bold text-gray-900">
                {recommendations.filter(r => r.priority === 'high').length}개
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 추천사항 목록 */}
      <div className="space-y-6">
        {recommendations.map((recommendation) => (
          <div key={recommendation._id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  {getStatusIcon(recommendation.status)}
                  <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(recommendation.status)}`}>
                    {getStatusLabel(recommendation.status)}
                  </span>
                  <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(recommendation.priority)}`}>
                    {getPriorityLabel(recommendation.priority)}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{recommendation.studentName}</h3>
                <div className="text-sm text-gray-600 mb-3">
                  <strong>건강 상태:</strong> {recommendation.condition}
                </div>
                <p className="text-gray-700 mb-4">{recommendation.recommendation}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-xs text-gray-500">
                생성일: {recommendation.createdAt.toLocaleDateString()}
                {recommendation.updatedAt.getTime() !== recommendation.createdAt.getTime() && (
                  <span className="ml-2">
                    수정일: {recommendation.updatedAt.toLocaleDateString()}
                  </span>
                )}
              </div>
              
              <div className="flex space-x-2">
                {recommendation.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updateRecommendationStatus(recommendation._id, 'approved')}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      승인
                    </button>
                    <button
                      onClick={() => updateRecommendationStatus(recommendation._id, 'implemented')}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                    >
                      적용
                    </button>
                  </>
                )}
                {recommendation.status === 'approved' && (
                  <button
                    onClick={() => updateRecommendationStatus(recommendation._id, 'implemented')}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                  >
                    적용 완료
                  </button>
                )}
                <button className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors">
                  상세보기
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {recommendations.length === 0 && (
        <div className="text-center py-12">
          <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">건강 추천사항이 없습니다.</p>
        </div>
      )}
    </div>
  );
}

export default withAuth(HealthRecommendations, { 
  requireTypes: ['instructor'] 
});