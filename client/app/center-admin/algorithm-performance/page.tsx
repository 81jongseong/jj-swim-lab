'use client';
import { logger } from '@/lib/logger';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { BarChart3, TrendingUp, Activity, Target, Clock, Users } from 'lucide-react';
import withAuth from '@/components/withAuth';
import { LoadingState, PageHeader } from '@/components/common';

interface AlgorithmPerformance {
  algorithmId: string;
  name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  lastUpdated: Date;
  totalPredictions: number;
  successRate: number;
}

function AlgorithmPerformancePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [performanceData, setPerformanceData] = useState<AlgorithmPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 테넌트 경로로 리다이렉트 (Phase 3)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const slug = localStorage.getItem('centerSlug') || 'default';
      const currentPath = window.location.pathname;
      if (currentPath.startsWith('/center-admin/') && !currentPath.includes('/center/')) {
        const newPath = currentPath.replace('/center-admin', `/center/${slug}/admin`);
        router.replace(newPath);
        return;
      }
    }
  }, [router]);

  useEffect(() => {
    if (user) {
      loadPerformanceData();
    }
  }, [user]);

  const loadPerformanceData = async () => {
    try {
      setIsLoading(true);
      // 임시 데이터
      const tempData: AlgorithmPerformance[] = [
        {
          algorithmId: 'algo001',
          name: '수영 자세 분석 알고리즘',
          accuracy: 94.2,
          precision: 92.8,
          recall: 95.1,
          f1Score: 93.9,
          lastUpdated: new Date('2024-01-20'),
          totalPredictions: 1250,
          successRate: 94.2
        },
        {
          algorithmId: 'algo002',
          name: '운동 강도 추천 알고리즘',
          accuracy: 89.7,
          precision: 88.3,
          recall: 91.2,
          f1Score: 89.7,
          lastUpdated: new Date('2024-01-19'),
          totalPredictions: 890,
          successRate: 89.7
        },
        {
          algorithmId: 'algo003',
          name: '부상 예측 알고리즘',
          accuracy: 96.1,
          precision: 95.8,
          recall: 96.4,
          f1Score: 96.1,
          lastUpdated: new Date('2024-01-18'),
          totalPredictions: 567,
          successRate: 96.1
        }
      ];
      setPerformanceData(tempData);
    } catch (error) {
      logger.error('알고리즘 성과 데이터 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingState message="로딩 중..." size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <PageHeader
        title="알고리즘 성과 분석"
        description="AI 알고리즘의 성능과 정확도를 모니터링하세요"
      />

      {/* 전체 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">평균 정확도</p>
              <p className="text-2xl font-bold text-gray-900">
                {performanceData.length > 0 
                  ? (performanceData.reduce((sum, algo) => sum + algo.accuracy, 0) / performanceData.length).toFixed(1)
                  : '0.0'
                }%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 예측 수</p>
              <p className="text-2xl font-bold text-gray-900">
                {performanceData.reduce((sum, algo) => sum + algo.totalPredictions, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Activity className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">활성 알고리즘</p>
              <p className="text-2xl font-bold text-gray-900">{performanceData.length}개</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Target className="w-8 h-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">평균 성공률</p>
              <p className="text-2xl font-bold text-gray-900">
                {performanceData.length > 0 
                  ? (performanceData.reduce((sum, algo) => sum + algo.successRate, 0) / performanceData.length).toFixed(1)
                  : '0.0'
                }%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 알고리즘 상세 성과 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">알고리즘별 성과 상세</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  알고리즘
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  정확도
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  정밀도
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  재현율
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  F1 점수
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  예측 수
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  마지막 업데이트
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {performanceData.map((algo) => (
                <tr key={algo.algorithmId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{algo.name}</div>
                      <div className="text-sm text-gray-500">{algo.algorithmId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${algo.accuracy}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{algo.accuracy}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {algo.precision}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {algo.recall}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {algo.f1Score}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {algo.totalPredictions.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {algo.lastUpdated.toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default withAuth(AlgorithmPerformancePage, { 
  requireTypes: ['centerAdmin', 'superAdmin'] 
});