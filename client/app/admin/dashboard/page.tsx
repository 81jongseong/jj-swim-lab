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
import StatCard from '@/components/StatCard';
import SimpleBarChart from '@/components/SimpleBarChart';
import { useRouter } from 'next/navigation';

interface AdminStats extends DashboardStats {
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
}

export default function AdminDashboard() {
  const router = useRouter();
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

  // 승인 대기 항목들
  const [pendingApprovals, setPendingApprovals] = useState({
    centerRegistrations: 2,
    instructorRegistrations: 1,
    total: 3
  });

  // 고객지원 관리 요약
  const [customerSupport, setCustomerSupport] = useState({
    pendingTickets: 5,
    resolvedToday: 12,
    avgResponseTime: '2.3시간'
  });

  // 공지사항 관리 요약
  const [notices, setNotices] = useState({
    totalNotices: 8,
    activeNotices: 6,
    draftNotices: 2
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

    // 60초마다 자동 새로고침 (API 호출 빈도 감소)
    const interval = setInterval(fetchDashboardStats, 60000);

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
      <div className="mb-8 animate-fade-in-up">
        <div className="card-premium border-l-4 border-l-blue-500 p-6">
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

      {/* 승인 대기 항목 카드 */}
      <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="card-premium border-l-4 border-l-red-500 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">⚠️ 승인 대기 항목</h2>
            <div className="px-3 py-1 rounded-full text-white bg-red-500">
              {pendingApprovals.total}건 대기
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-red-50 rounded-lg p-4 cursor-pointer hover:bg-red-100 transition-colors"
              onClick={() => router.push('/admin/approvals')}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold text-red-600">{pendingApprovals.centerRegistrations}</div>
                  <div className="text-sm text-gray-600">센터 등록</div>
                </div>
                <span className="text-2xl">🏢</span>
              </div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 cursor-pointer hover:bg-orange-100 transition-colors"
              onClick={() => router.push('/admin/instructor-management')}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold text-orange-600">{pendingApprovals.instructorRegistrations}</div>
                  <div className="text-sm text-gray-600">강사 등록</div>
                </div>
                <span className="text-2xl">👨‍🏫</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 통계 카드들 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="전체 사용자"
          value={stats.totalUsers.toLocaleString()}
          icon="👥"
          color="blue"
          subtitle="등록된 사용자 수"
          href="/admin/users"
        />

        <StatCard
          title="강습 과정"
          value={stats.activeCourses}
          icon="📚"
          color="green"
          subtitle="진행 중인 과정"
          href="/admin/courses"
        />

        <StatCard
          title="총 매출"
          value={`${stats.totalRevenue.toLocaleString()}원`}
          icon="💰"
          color="purple"
          subtitle="전체 매출액"
          href="/admin/revenue-management"
        />

        <StatCard
          title="승인 대기"
          value={stats.pendingApprovals}
          icon="⏳"
          color="orange"
          subtitle="처리 대기 중"
          href="/admin/approvals"
        />
      </div>

      {/* 성능 모니터링 섹션 */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 성능 모니터링</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div className="card-premium p-6 border-2 border-transparent hover:border-blue-300 animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-lg font-semibold mb-4">📊 성능 모니터링 (임시 비활성화)</h3>
            <p className="text-gray-600">PerformanceMonitor 컴포넌트를 임시로 비활성화했습니다.</p>
          </div>

          {/* 시스템 리소스 모니터링 */}
          <div className="card-premium p-6 border-2 border-transparent hover:border-purple-300 animate-scale-in" style={{ animationDelay: '0.3s' }}>
            <h3 className="text-lg font-semibold mb-4">🖥️ 시스템 리소스</h3>
            <SimpleBarChart
              data={[
                { name: 'CPU 사용률', value: 23 },
                { name: '메모리 사용률', value: 67 },
                { name: '디스크 사용률', value: 45 }
              ]}
              xKey="name"
              yKey="value"
              color="#3B82F6"
              horizontal={true}
              showValues={true}
              className="mt-2"
            />
          </div>
        </div>
      </div>

      {/* 고객지원 및 공지사항 관리 */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">📞 고객지원 & 공지사항 관리</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 고객지원 관리 카드 */}
          <div className="card-premium p-6 border-2 border-transparent hover:border-blue-300 animate-scale-in" style={{ animationDelay: '0.4s' }}
            onClick={() => router.push('/admin/reports')}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">🎧 고객지원 관리</h3>
              <span className="text-2xl">📞</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">대기 중인 문의</span>
                <span className="text-lg font-bold text-red-600">{customerSupport.pendingTickets}건</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">오늘 해결</span>
                <span className="text-lg font-bold text-green-600">{customerSupport.resolvedToday}건</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">평균 응답시간</span>
                <span className="text-lg font-bold text-blue-600">{customerSupport.avgResponseTime}</span>
              </div>
            </div>
          </div>

          {/* 공지사항 관리 카드 */}
          <div className="card-premium p-6 border-2 border-transparent hover:border-green-300 animate-scale-in" style={{ animationDelay: '0.5s' }}
            onClick={() => router.push('/admin/notices')}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">📢 공지사항 관리</h3>
              <span className="text-2xl">📝</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">전체 공지사항</span>
                <span className="text-lg font-bold text-gray-700">{notices.totalNotices}건</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">활성 공지</span>
                <span className="text-lg font-bold text-green-600">{notices.activeNotices}건</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">임시저장</span>
                <span className="text-lg font-bold text-orange-600">{notices.draftNotices}건</span>
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
      <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">🕒 최근 활동</h2>
        <div className="card-premium p-6">
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