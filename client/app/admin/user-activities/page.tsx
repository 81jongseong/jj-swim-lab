/**
 * 관리자 사용자 활동 관리 페이지
 * 사용자 활동 로그, 통계, 분석을 담당하는 페이지입니다.
 */

'use client';

import React from 'react';
import { useAuth } from '../../../hooks/useAuth';
import UserActivityDashboard from '../../../components/ui/Card';
import { Card } from '../../../components/ui/Card';
import { Alert, AlertDescription     } from '../../../components/ui/alert';
import { Shield, Activity, Users, BarChart3, AlertTriangle } from 'lucide-react';

const UserActivitiesPage: React.FC = () => {
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
              사용자 활동 관리 페이지에 접근하려면 로그인이 필요합니다.
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

  // 권한이 없는 사용자 (superAdmin, centerAdmin만 접근 가능)
  if (user.userType !== 'superAdmin' && user.userType !== 'centerAdmin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 max-w-md w-full">
          <div className="text-center">
            <Shield className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">권한 부족</h1>
            <p className="text-gray-600 mb-4">
              사용자 활동 관리 페이지에 접근할 권한이 없습니다.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              이 페이지는 관리자만 접근할 수 있습니다.
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
              <h1 className="text-3xl font-bold text-gray-900">사용자 활동 관리</h1>
              <p className="text-gray-600 mt-1">
                사용자 활동 로그, 통계, 분석을 담당합니다.
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
          <Activity className="h-4 w-4" />
          <AlertDescription>
            <strong>활동 추적 정보:</strong> 모든 사용자 활동이 자동으로 기록됩니다. 
            보안 이벤트, 권한 거부, 의심스러운 활동은 별도로 표시됩니다.
          </AlertDescription>
        </Alert>
      </div>

      {/* 사용자 활동 대시보드 컴포넌트 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <UserActivityDashboard />
      </div>

      {/* 푸터 정보 */}
      <div className="bg-white border-t mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <div className="font-semibold text-gray-900">사용자 추적</div>
                <div className="text-sm text-gray-600">모든 사용자 활동 기록</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-green-600" />
              <div>
                <div className="font-semibold text-gray-900">활동 분석</div>
                <div className="text-sm text-gray-600">통계 및 트렌드 분석</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-purple-600" />
              <div>
                <div className="font-semibold text-gray-900">보안 모니터링</div>
                <div className="text-sm text-gray-600">의심스러운 활동 감지</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-orange-600" />
              <div>
                <div className="font-semibold text-gray-900">이벤트 알림</div>
                <div className="text-sm text-gray-600">중요 이벤트 알림</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserActivitiesPage;
