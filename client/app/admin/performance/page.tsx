/**
 * 관리자 성능 최적화 페이지
 * 성능 분석, 캐시 관리, 쿼리 최적화를 담당하는 페이지입니다.
 */

'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import PerformanceDashboard from '@/components/performance/PerformanceDashboard';
import Card from '@/components/ui/Card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Activity, Zap, Database, TrendingUp, AlertTriangle } from 'lucide-react';

const PerformancePage: React.FC = () => {
  const { user, loading } = useAuth();

  // 로딩 중일 때
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 인증되지 않은 사용자
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 max-w-md w-full">
          <div className="text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">접근 권한 없음</h1>
            <p className="text-gray-600 mb-4">
              성능 최적화 페이지에 접근하려면 로그인이 필요합니다.
            </p>
            <button
              onClick={() => window.location.href = '/login'}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              로그인하기
            </button>
          </div>
        </Card>
      </div>
    );
  }

  // 권한이 없는 사용자 (superAdmin만 접근 가능)
  if (user.userType !== 'superAdmin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 max-w-md w-full">
          <div className="text-center">
            <Shield className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">권한 부족</h1>
            <p className="text-gray-600 mb-4">
              성능 최적화 페이지에 접근할 권한이 없습니다.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              이 페이지는 최고 관리자만 접근할 수 있습니다.
            </p>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              대시보드로 돌아가기
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">성능 최적화</h1>
              <p className="text-gray-600 mt-1">
                성능 분석, 캐시 관리, 쿼리 최적화를 담당합니다.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-600">현재 사용자</div>
                <div className="font-semibold text-gray-900">{user.name}</div>
                <div className="text-xs text-gray-500">{user.userType}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 알림 배너 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Alert className="mb-6">
          <Zap className="h-4 w-4" />
          <AlertDescription>
            <strong>성능 최적화 정보:</strong> 이 페이지는 시스템 성능을 분석하고 최적화하는 도구를 제공합니다. 
            캐시 관리, 쿼리 최적화, 메모리 추적을 통해 시스템 성능을 향상시킬 수 있습니다.
          </AlertDescription>
        </Alert>
      </div>

      {/* 성능 최적화 대시보드 컴포넌트 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <PerformanceDashboard />
      </div>

      {/* 푸터 정보 */}
      <div className="bg-white border-t mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-blue-600" />
              <div>
                <div className="font-semibold text-gray-900">성능 분석</div>
                <div className="text-sm text-gray-600">실시간 성능 메트릭 수집</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Database className="w-8 h-8 text-green-600" />
              <div>
                <div className="font-semibold text-gray-900">쿼리 최적화</div>
                <div className="text-sm text-gray-600">느린 쿼리 감지 및 개선</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Zap className="w-8 h-8 text-purple-600" />
              <div>
                <div className="font-semibold text-gray-900">캐시 관리</div>
                <div className="text-sm text-gray-600">메모리 및 쿼리 캐시 최적화</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-orange-600" />
              <div>
                <div className="font-semibold text-gray-900">성능 모니터링</div>
                <div className="text-sm text-gray-600">지속적인 성능 추적</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformancePage;
