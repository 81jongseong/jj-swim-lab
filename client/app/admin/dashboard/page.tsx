
'use client';

import { useState, useEffect } from 'react';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import PerformanceMonitor from '@/components/dashboard/PerformanceMonitor';

interface AdminStats {
  totalUsers: number;
  totalCourses: number;
  totalRevenue: number;
  activeBookings: number;
  pendingApprovals: number;
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalCourses: 0,
    totalRevenue: 0,
    activeBookings: 0,
    pendingApprovals: 0,
    systemHealth: 'excellent'
  });

  useEffect(() => {
    // 실제 환경에서는 API에서 데이터를 가져옵니다
    setStats({
      totalUsers: 1250,
      totalCourses: 45,
      totalRevenue: 12500000,
      activeBookings: 89,
      pendingApprovals: 12,
      systemHealth: 'excellent'
    });
  }, []);

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getHealthLabel = (health: string) => {
    switch (health) {
      case 'excellent': return '우수';
      case 'good': return '양호';
      case 'warning': return '주의';
      case 'critical': return '위험';
      default: return '알 수 없음';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
        <p className="text-gray-600 mt-2">JJ Swim Lab 시스템 현황 및 성능 모니터링</p>
      </div>

      {/* 시스템 상태 카드 */}
      <div className="mb-8">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>🖥️ 시스템 상태</span>
              <Badge 
                variant="outline" 
                className={`${getHealthColor(stats.systemHealth)} text-white`}
              >
                {getHealthLabel(stats.systemHealth)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalUsers.toLocaleString()}</div>
                <div className="text-sm text-gray-500">전체 사용자</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.totalCourses}</div>
                <div className="text-sm text-gray-500">강습 과정</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.totalRevenue.toLocaleString()}원</div>
                <div className="text-sm text-gray-500">총 매출</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.activeBookings}</div>
                <div className="text-sm text-gray-500">활성 예약</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 통계 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 border-transparent hover:border-blue-300"
          onClick={() => {
            console.log('전체 사용자 카드 클릭됨');
            window.location.href = '/admin/users';
          }}
        >
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">전체 사용자</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 border-transparent hover:border-green-300"
          onClick={() => {
            console.log('강습 과정 카드 클릭됨');
            window.location.href = '/admin/courses';
          }}
        >
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <img 
                  src="/icons/manifest-icon-192.maskable.png" 
                  alt="수영" 
                  className="w-8 h-8 object-cover"
                />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">강습 과정</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 border-transparent hover:border-purple-300"
          onClick={() => {
            console.log('총 매출 카드 클릭됨');
            window.location.href = '/admin/revenue';
          }}
        >
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">총 매출</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRevenue.toLocaleString()}원</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 border-transparent hover:border-orange-300"
          onClick={() => {
            console.log('승인 대기 카드 클릭됨');
            window.location.href = '/admin/approvals';
          }}
        >
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <span className="text-2xl">⏳</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">승인 대기</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingApprovals}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 성능 모니터링 섹션 */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 성능 모니터링</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PerformanceMonitor refreshInterval={60000} />
          
          {/* 시스템 리소스 모니터링 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">🖥️ 시스템 리소스</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>CPU 사용률</span>
                  <span className="font-mono">23%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '23%' }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>메모리 사용률</span>
                  <span className="font-mono">67%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '67%' }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>디스크 사용률</span>
                  <span className="font-mono">45%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>네트워크 상태</span>
                  <span className="font-mono text-green-600">정상</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 빠른 액션 버튼들 */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">⚡ 빠른 액션</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button 
            onClick={() => window.location.href = '/admin/teaching-methods'}
            className="h-20 text-lg font-semibold"
            variant="outline"
          >
            📚 강습법 관리
          </Button>
          
          <Button 
            onClick={() => window.location.href = '/admin/center-levels'}
            className="h-20 text-lg font-semibold"
            variant="outline"
          >
            🎯 센터별 레벨 관리
          </Button>
          
          <Button 
            onClick={() => window.location.href = '/admin/bookings'}
            className="h-20 text-lg font-semibold"
            variant="outline"
          >
            📅 예약 관리
          </Button>
          
          <Button 
            onClick={() => window.location.href = '/admin/reports'}
            className="h-20 text-lg font-semibold"
            variant="outline"
          >
            📊 리포트 생성
          </Button>
        </div>
      </div>

      {/* 최근 활동 */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">🕒 최근 활동</h2>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">새로운 사용자 등록: 김수영 (2분 전)</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">강습 예약 완료: 자유형 초급 (5분 전)</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-600">결제 완료: ₩150,000 (8분 전)</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-600">시스템 백업 완료 (15분 전)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
