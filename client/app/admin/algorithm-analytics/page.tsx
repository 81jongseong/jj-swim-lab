'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock,
  Target,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  Activity,
  Zap,
  Brain,
  Award
} from 'lucide-react';

export default function AlgorithmAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('accuracy');

  useEffect(() => {
    // 샘플 데이터 로드
    const sampleAnalytics = {
      overview: {
        totalUsers: 1250,
        activeUsers: 890,
        totalSessions: 4560,
        avgSessionTime: 35,
        accuracy: 87.5,
        performance: 92.3
      },
      metrics: {
        accuracy: {
          current: 87.5,
          previous: 84.2,
          trend: 'up'
        },
        performance: {
          current: 92.3,
          previous: 89.1,
          trend: 'up'
        },
        userSatisfaction: {
          current: 4.2,
          previous: 4.0,
          trend: 'up'
        }
      },
      charts: {
        accuracyOverTime: [
          { date: '2024-01-01', accuracy: 85.2 },
          { date: '2024-01-02', accuracy: 86.1 },
          { date: '2024-01-03', accuracy: 87.3 },
          { date: '2024-01-04', accuracy: 86.8 },
          { date: '2024-01-05', accuracy: 87.5 }
        ],
        userEngagement: [
          { date: '2024-01-01', users: 120 },
          { date: '2024-01-02', users: 135 },
          { date: '2024-01-03', users: 142 },
          { date: '2024-01-04', users: 138 },
          { date: '2024-01-05', users: 145 }
        ]
      }
    };
    
    setTimeout(() => {
      setAnalytics(sampleAnalytics);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">알고리즘 분석 데이터를 불러오는 중...</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 알고리즘 분석</h1>
          <p className="text-gray-600">
            AI 알고리즘의 성능과 사용자 만족도를 분석합니다.
          </p>
        </div>

        {/* 필터 및 컨트롤 */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">최근 7일</option>
                <option value="30d">최근 30일</option>
                <option value="90d">최근 90일</option>
                <option value="1y">최근 1년</option>
              </select>
            </div>
            <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
              <RefreshCw className="w-4 h-4 mr-2" />
              새로고침
            </button>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            리포트 다운로드
          </button>
        </div>

        {/* 주요 지표 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">전체 사용자</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalUsers.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+12.5%</span>
              <span className="text-gray-500 ml-1">전월 대비</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">활성 사용자</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.activeUsers.toLocaleString()}</p>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+8.3%</span>
              <span className="text-gray-500 ml-1">전월 대비</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">알고리즘 정확도</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.accuracy}%</p>
              </div>
              <Target className="w-8 h-8 text-purple-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+3.3%</span>
              <span className="text-gray-500 ml-1">전월 대비</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">시스템 성능</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.overview.performance}%</p>
              </div>
              <Zap className="w-8 h-8 text-yellow-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+3.2%</span>
              <span className="text-gray-500 ml-1">전월 대비</span>
            </div>
          </div>
        </div>

        {/* 상세 분석 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 정확도 추이 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">알고리즘 정확도 추이</h3>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">정확도</span>
              </div>
            </div>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">차트 데이터</p>
                <p className="text-sm text-gray-500">정확도: {analytics.overview.accuracy}%</p>
              </div>
            </div>
          </div>

          {/* 사용자 참여도 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">사용자 참여도</h3>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">활성 사용자</span>
              </div>
            </div>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">차트 데이터</p>
                <p className="text-sm text-gray-500">활성 사용자: {analytics.overview.activeUsers}명</p>
              </div>
            </div>
          </div>
        </div>

        {/* 성능 지표 상세 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">성능 지표 상세</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <Brain className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900">AI 정확도</h4>
              <p className="text-2xl font-bold text-blue-600 mt-2">{analytics.metrics.accuracy.current}%</p>
              <div className="flex items-center justify-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+{analytics.metrics.accuracy.current - analytics.metrics.accuracy.previous}%</span>
              </div>
            </div>

            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <Zap className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900">시스템 성능</h4>
              <p className="text-2xl font-bold text-yellow-600 mt-2">{analytics.metrics.performance.current}%</p>
              <div className="flex items-center justify-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+{analytics.metrics.performance.current - analytics.metrics.performance.previous}%</span>
              </div>
            </div>

            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900">사용자 만족도</h4>
              <p className="text-2xl font-bold text-purple-600 mt-2">{analytics.metrics.userSatisfaction.current}/5.0</p>
              <div className="flex items-center justify-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+{analytics.metrics.userSatisfaction.current - analytics.metrics.userSatisfaction.previous}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 알림 및 권장사항 */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-yellow-600" />
              주의사항
            </h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3"></div>
                <p className="text-sm text-gray-700">정확도가 90% 미만인 구간이 감지되었습니다.</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3"></div>
                <p className="text-sm text-gray-700">일부 사용자 그룹에서 성능 저하가 관찰됩니다.</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              권장사항
            </h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                <p className="text-sm text-gray-700">알고리즘 모델을 업데이트하여 정확도를 향상시키세요.</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                <p className="text-sm text-gray-700">사용자 피드백을 수집하여 모델을 개선하세요.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}