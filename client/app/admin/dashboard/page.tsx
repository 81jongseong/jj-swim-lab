/**
 * @file 관리자 대시보드 페이지
 * @description 관리자가 시스템 전체 현황을 한눈에 볼 수 있는 대시보드입니다.
 * @date 2025-01-13
 * @author JJ Swim Lab
 */

'use client';

import { useState, useEffect } from 'react';
import { getDashboardStats, DashboardStats } from '../../../lib/api/dashboard';
import VWorldKeyBadge, { VWorldExpiryBanner } from '../../../components/VWorldKeyBadge';

interface AdminStats extends DashboardStats {
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeCourses: 0,
    totalRevenue: 0,
    activeBookings: 0,
    pendingApprovals: 0,
    instructorStats: [],
    courseStats: [],
    systemHealth: 'good'
  });

  const fetchDashboardStats = async () => {
    try {
      const data = await getDashboardStats();
      setStats({
        ...data,
        systemHealth: 'good'
      });
    } catch (error) {
      console.error('대시보드 통계 로드 실패:', error);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    
    // 30초마다 자동 새로고침
    const interval = setInterval(fetchDashboardStats, 30000);
    
    return () => clearInterval(interval);
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
      {/* VWorld 키 만료 배너 */}
      <VWorldExpiryBanner />

      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
          <VWorldKeyBadge />
        </div>
        <p className="text-gray-600 mt-2">JJ Swim Lab 시스템 현황 및 성능 모니터링</p>
      </div>

      {/* 시스템 상태 카드 */}
      <div className="mb-8">
        <div className="border-l-4 border-l-blue-500 bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">🖥️ 시스템 상태</h2>
            <div className={`px-3 py-1 rounded-full text-white ${getHealthColor(stats.systemHealth)}`}>
              {getHealthLabel(stats.systemHealth)}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalUsers.toLocaleString()}</div>
              <div className="text-sm text-gray-500">전체 사용자</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.activeCourses}</div>
              <div className="text-sm text-gray-500">강습 과정</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.totalRevenue.toLocaleString()}원</div>
              <div className="text-sm text-gray-500">총 매출</div>
              <button 
                className="mt-2 text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                onClick={() => window.location.href = '/admin/revenue'}
              >
                상세보기
              </button>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.activeBookings}</div>
              <div className="text-sm text-gray-500">활성 예약</div>
            </div>
          </div>
        </div>
      </div>

      {/* 통계 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 border-transparent hover:border-blue-300"
             onClick={() => {
               console.log('전체 사용자 카드 클릭됨');
               window.location.href = '/admin/users';
             }}>
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">전체 사용자</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 border-transparent hover:border-green-300"
             onClick={() => {
               console.log('강습 과정 카드 클릭됨');
               window.location.href = '/admin/courses';
             }}>
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
              <p className="text-2xl font-bold text-gray-900">{stats.activeCourses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 border-transparent hover:border-purple-300"
             onClick={() => {
               console.log('총 매출 카드 클릭됨');
               window.location.href = '/admin/revenue';
             }}>
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 매출</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRevenue.toLocaleString()}원</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 border-transparent hover:border-orange-300"
             onClick={() => {
               console.log('승인 대기 카드 클릭됨');
               window.location.href = '/admin/approvals';
             }}>
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <span className="text-2xl">⏳</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">승인 대기</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingApprovals}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 성능 모니터링 섹션 */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 성능 모니터링</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">📊 성능 모니터링 (임시 비활성화)</h3>
            <p className="text-gray-600">PerformanceMonitor 컴포넌트를 임시로 비활성화했습니다.</p>
          </div>
          
          {/* 시스템 리소스 모니터링 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">🖥️ 시스템 리소스</h3>
            <div className="space-y-4">
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
            </div>
          </div>
        </div>
      </div>

      {/* 빠른 액션 버튼들 */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">⚡ 빠른 액션</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => window.location.href = '/admin/teaching-methods'}
            className="h-20 text-lg font-semibold bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            📚 강습법 관리
          </button>
          
          <button 
            onClick={() => window.location.href = '/admin/center-levels'}
            className="h-20 text-lg font-semibold bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            🎯 센터별 레벨 관리
          </button>
          
          <button 
            onClick={() => window.location.href = '/admin/bookings'}
            className="h-20 text-lg font-semibold bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            📅 예약 관리
          </button>
          
          <button 
            onClick={() => window.location.href = '/admin/reports'}
            className="h-20 text-lg font-semibold bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            📊 리포트 생성
          </button>
        </div>
      </div>

      {/* 최근 활동 */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">🕒 최근 활동</h2>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">새로운 사용자가 가입했습니다</span>
              <span className="text-xs text-gray-400">2분 전</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">강습 예약이 생성되었습니다</span>
              <span className="text-xs text-gray-400">5분 전</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-600">결제가 완료되었습니다</span>
              <span className="text-xs text-gray-400">10분 전</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}