/**
 * ✅ JJ Swim Lab - 3D 뷰어 관리 페이지
 * 
 * 📋 **기능**
 * - 3D 뷰어 시스템 전체 관리
 * - 영법, 드릴, 모델 통합 관리
 * - 시스템 상태 모니터링
 * - 사용 통계 및 분석
 * 
 * 🛠️ **기술 스택**
 * - Next.js App Router
 * - TypeScript
 * - Tailwind CSS
 * - React Hooks
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui';
import { LoadingSpinner, RefreshButton, Toast, ToastContainer } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface SystemStats {
  totalModels: number;
  totalStyles: number;
  totalDrills: number;
  activeUsers: number;
  systemStatus: 'healthy' | 'warning' | 'error';
  lastUpdate: string;
}

export default function ThreeDViewerManagementPage() {
  const { user, hasUserType } = useAuth();
  const router = useRouter();
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toasts, setToasts] = useState<any[]>([]);

  // 권한 체크
  useEffect(() => {
    if (!user || !hasUserType('superAdmin')) {
      router.push('/admin/dashboard');
      return;
    }
  }, [user, hasUserType, router]);

  // 시스템 통계 로드
  useEffect(() => {
    if (user && hasUserType('superAdmin')) {
      loadSystemStats();
    }
  }, [user, hasUserType]);

  const loadSystemStats = async () => {
    try {
      setLoading(true);
      // TODO: 실제 API 호출로 대체
      const mockStats: SystemStats = {
        totalModels: 12,
        totalStyles: 5,
        totalDrills: 24,
        activeUsers: 156,
        systemStatus: 'healthy',
        lastUpdate: new Date().toLocaleString('ko-KR')
      };
      
      setSystemStats(mockStats);
    } catch (error) {
      console.error('시스템 통계 로드 실패:', error);
      showToast('error', '오류', '시스템 통계를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSystemStats();
    setRefreshing(false);
    showToast('success', '새로고침', '시스템 통계가 업데이트되었습니다.');
  };

  const showToast = (type: 'success' | 'error' | 'warning', title: string, message: string) => {
    const newToast = {
      id: Date.now(),
      type,
      title,
      message,
      duration: 5000
    };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  if (!user || !hasUserType('superAdmin')) {
    return <LoadingSpinner />;
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">🎨 3D 뷰어 관리</h1>
        <p className="text-gray-600">
          JJ Swim Lab의 3D 뷰어 시스템을 체계적으로 관리하세요.
        </p>
      </div>

      {/* 시스템 상태 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">총 3D 모델</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{systemStats?.totalModels || 0}</div>
            <p className="text-xs text-gray-500 mt-1">업로드된 모델</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">영법 종류</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{systemStats?.totalStyles || 0}</div>
            <p className="text-xs text-gray-500 mt-1">지원하는 영법</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">드릴 수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{systemStats?.totalDrills || 0}</div>
            <p className="text-xs text-gray-500 mt-1">연습 드릴</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">활성 사용자</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{systemStats?.activeUsers || 0}</div>
            <p className="text-xs text-gray-500 mt-1">오늘 사용자</p>
          </CardContent>
        </Card>
      </div>

      {/* 시스템 상태 */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>시스템 상태</CardTitle>
            <RefreshButton onRefresh={handleRefresh} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">시스템 상태</h4>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  systemStats?.systemStatus === 'healthy' ? 'bg-green-500' :
                  systemStats?.systemStatus === 'warning' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}></div>
                <span className={`font-medium ${
                  systemStats?.systemStatus === 'healthy' ? 'text-green-600' :
                  systemStats?.systemStatus === 'warning' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {systemStats?.systemStatus === 'healthy' ? '정상' :
                   systemStats?.systemStatus === 'warning' ? '주의' : '오류'}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                마지막 업데이트: {systemStats?.lastUpdate}
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">빠른 액션</h4>
              <div className="space-y-2">
                <Button
                  onClick={() => router.push('/admin/3d-viewer/models')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  📦 새 3D 모델 업로드
                </Button>
                <Button
                  onClick={() => router.push('/admin/3d-viewer/swimming-styles')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  🏊‍♂️ 영법 추가/수정
                </Button>
                <Button
                  onClick={() => router.push('/admin/3d-viewer/drills')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  🎯 드릴 생성/관리
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 관리 도구 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/3d-viewer/swimming-styles')}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>🏊‍♂️</span>
              <span>영법 종류 관리</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              자유형, 평형, 접영, 배영 등 수영 영법을 체계적으로 관리합니다.
            </p>
            <div className="text-xs text-gray-500">
              현재 {systemStats?.totalStyles || 0}개 영법 등록됨
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/3d-viewer/drills')}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>🎯</span>
              <span>드릴 관리</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              수영 기술 향상을 위한 연습 드릴을 생성하고 관리합니다.
            </p>
            <div className="text-xs text-gray-500">
              현재 {systemStats?.totalDrills || 0}개 드릴 등록됨
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/3d-viewer/models')}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>📦</span>
              <span>3D 모델 관리</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              3D 수영 모델을 업로드하고 분류하여 관리합니다.
            </p>
            <div className="text-xs text-gray-500">
              현재 {systemStats?.totalModels || 0}개 모델 등록됨
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 토스트 알림 */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
