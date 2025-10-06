/**
 * @file 시스템 사용 통계 페이지
 * @description 최고관리자가 시스템 사용 현황과 통계를 모니터링하는 페이지
 * @date 2025-01-13
 * @author JJ Swim Lab
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import StatCard from '@/components/StatCard';
import Button from '@/components/Button';

export default function SystemPage() {
  const { user, hasUserType } = useAuth();
  
  // 상태 관리
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'performance' | 'security'>('overview');
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // 시스템 통계 데이터
  const [systemStats, setSystemStats] = useState({
    totalUsers: 1247,
    activeUsers: 89,
    totalCenters: 15,
    activeCenters: 12,
    totalInstructors: 45,
    activeInstructors: 38,
    totalCourses: 156,
    activeCourses: 89,
    totalRevenue: 45600000,
    monthlyRevenue: 3800000,
    systemUptime: '99.8%',
    avgResponseTime: 120,
    errorRate: 0.2,
    securityAlerts: 0,
    lastBackup: '2025-01-13 02:00:00'
  });

  // 사용자 활동 데이터
  const [userActivity, setUserActivity] = useState({
    todayLogins: 89,
    weeklyLogins: 450,
    monthlyLogins: 1800,
    topPages: [
      { path: '/dashboard', visits: 120, users: 45 },
      { path: '/courses', visits: 85, users: 32 },
      { path: '/profile', visits: 60, users: 28 },
      { path: '/instructor-management', visits: 45, users: 12 },
      { path: '/center-management', visits: 38, users: 8 }
    ],
    userTypes: [
      { type: '학생', count: 856, percentage: 68.7 },
      { type: '강사', count: 245, percentage: 19.7 },
      { type: '센터관리자', count: 98, percentage: 7.9 },
      { type: '최고관리자', count: 48, percentage: 3.9 }
    ],
    deviceTypes: [
      { type: '모바일', count: 789, percentage: 63.3 },
      { type: '데스크톱', count: 345, percentage: 27.7 },
      { type: '태블릿', count: 113, percentage: 9.1 }
    ]
  });

  // 성능 데이터
  const [performanceData, setPerformanceData] = useState({
    cpuUsage: 45,
    memoryUsage: 62,
    diskUsage: 38,
    networkLatency: 12,
    databaseConnections: 25,
    apiResponseTimes: [
      { endpoint: '/api/users', avgTime: 85, maxTime: 150 },
      { endpoint: '/api/courses', avgTime: 120, maxTime: 200 },
      { endpoint: '/api/centers', avgTime: 95, maxTime: 180 },
      { endpoint: '/api/dashboard', avgTime: 200, maxTime: 350 }
    ],
    errorLogs: [
      { time: '2025-01-13 14:30:15', level: 'WARN', message: 'API 응답 시간이 평균보다 높음' },
      { time: '2025-01-13 12:15:30', level: 'INFO', message: '데이터베이스 백업 완료' },
      { time: '2025-01-13 10:45:20', level: 'ERROR', message: '센터 데이터 로드 실패' }
    ]
  });

  // 보안 데이터
  const [securityData, setSecurityData] = useState({
    failedLogins: 12,
    blockedIPs: 3,
    securityAlerts: 0,
    lastSecurityScan: '2025-01-13 01:00:00',
    sslExpiry: '2025-12-15',
    firewallStatus: '활성',
    antivirusStatus: '최신',
    recentActivities: [
      { time: '2025-01-13 15:30:00', user: 'admin', action: '시스템 설정 변경', ip: '192.168.1.100' },
      { time: '2025-01-13 14:20:00', user: 'center_manager_01', action: '센터 정보 수정', ip: '192.168.1.101' },
      { time: '2025-01-13 13:15:00', user: 'instructor_05', action: '강사 정보 업데이트', ip: '192.168.1.102' }
    ]
  });

  // 데이터 새로고침
  const refreshData = async () => {
    setLoading(true);
    try {
      // 실제 API 호출 대신 목 데이터 업데이트
      setLastUpdated(new Date());
      console.log('시스템 통계 데이터 새로고침 완료');
    } catch (error) {
      console.error('데이터 새로고침 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // 권한 확인
  if (!user || !hasUserType('superAdmin')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">접근 권한 없음</h1>
          <p className="text-gray-600">이 페이지는 최고관리자만 접근할 수 있습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">시스템 사용 통계</h1>
            <p className="text-gray-600 mt-2">JJ Swim Lab 시스템 현황 및 사용자 활동 모니터링</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={refreshData}
              disabled={loading}
              variant="primary"
              size="md"
            >
              {loading ? '새로고침 중...' : '새로고침'}
            </Button>
            <div className="text-sm text-gray-500">
              마지막 업데이트: {lastUpdated.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: '개요', icon: '📊' },
              { id: 'users', label: '사용자 활동', icon: '👥' },
              { id: 'performance', label: '성능 모니터링', icon: '⚡' },
              { id: 'security', label: '보안 현황', icon: '🔒' }
            ].map((tab) => (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                variant={activeTab === tab.id ? 'primary' : 'ghost'}
                size="sm"
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon} {tab.label}
              </Button>
            ))}
          </nav>
        </div>
      </div>

      {/* 탭 컨텐츠 */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* 주요 지표 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="전체 사용자"
              value={systemStats.totalUsers.toLocaleString()}
              icon="👥"
              color="blue"
              subtitle="등록된 총 사용자 수"
              change={{ value: 5.2, type: 'increase' }}
            />

            <StatCard
              title="활성 센터"
              value={systemStats.activeCenters.toString()}
              icon="🏊"
              color="green"
              subtitle={`전체 ${systemStats.totalCenters}개 중`}
              change={{ value: 2.1, type: 'increase' }}
            />

            <StatCard
              title="월 매출"
              value={`₩${systemStats.monthlyRevenue.toLocaleString()}`}
              icon="💰"
              color="purple"
              subtitle="이번 달 총 매출"
              change={{ value: 8.7, type: 'increase' }}
            />

            <StatCard
              title="시스템 가동률"
              value={systemStats.systemUptime}
              icon="⚡"
              color="orange"
              subtitle="평균 응답시간 120ms"
              change={{ value: 0.2, type: 'increase' }}
            />
          </div>

          {/* 사용자 유형별 분포 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">사용자 유형별 분포</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {userActivity.userTypes.map((type, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{type.count}</div>
                  <div className="text-sm text-gray-600">{type.type}</div>
                  <div className="text-xs text-gray-500">{type.percentage}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* 최근 활동 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">최근 시스템 활동</h3>
            <div className="space-y-3">
              {securityData.recentActivities.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div>
                    <span className="font-medium">{activity.user}</span>
                    <span className="text-gray-600 ml-2">{activity.action}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {activity.time} ({activity.ip})
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-8">
          {/* 사용자 활동 통계 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="오늘 로그인"
              value={userActivity.todayLogins.toString()}
              icon="🔐"
              color="blue"
              subtitle={`이번 주: ${userActivity.weeklyLogins}명`}
              change={{ value: 12.5, type: 'increase' }}
            />

            <StatCard
              title="활성 사용자"
              value={systemStats.activeUsers.toString()}
              icon="👥"
              color="green"
              subtitle="현재 온라인"
              change={{ value: 3.2, type: 'increase' }}
            />

            <StatCard
              title="이번 달 로그인"
              value={userActivity.monthlyLogins.toString()}
              icon="📊"
              color="purple"
              subtitle="월간 총 로그인"
              change={{ value: 18.7, type: 'increase' }}
            />
          </div>

          {/* 인기 페이지 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">인기 페이지</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">페이지</th>
                    <th className="text-left py-2">방문 수</th>
                    <th className="text-left py-2">사용자 수</th>
                  </tr>
                </thead>
                <tbody>
                  {userActivity.topPages.map((page, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2 font-medium">{page.path}</td>
                      <td className="py-2">{page.visits}</td>
                      <td className="py-2">{page.users}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="space-y-8">
          {/* 시스템 리소스 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="CPU 사용률"
              value={`${performanceData.cpuUsage}%`}
              icon="💻"
              color="blue"
              subtitle="프로세서 사용량"
              change={{ value: -2.1, type: 'decrease' }}
            />

            <StatCard
              title="메모리 사용률"
              value={`${performanceData.memoryUsage}%`}
              icon="🧠"
              color="green"
              subtitle="RAM 사용량"
              change={{ value: 1.5, type: 'increase' }}
            />

            <StatCard
              title="디스크 사용률"
              value={`${performanceData.diskUsage}%`}
              icon="💾"
              color="yellow"
              subtitle="저장공간 사용량"
              change={{ value: 0.8, type: 'increase' }}
            />

            <StatCard
              title="네트워크 지연"
              value={`${performanceData.networkLatency}ms`}
              icon="🌐"
              color="purple"
              subtitle="평균 응답 시간"
              change={{ value: -5.2, type: 'decrease' }}
            />
          </div>

          {/* API 응답 시간 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">API 응답 시간</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">엔드포인트</th>
                    <th className="text-left py-2">평균 응답 시간</th>
                    <th className="text-left py-2">최대 응답 시간</th>
                  </tr>
                </thead>
                <tbody>
                  {performanceData.apiResponseTimes.map((api, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2 font-medium">{api.endpoint}</td>
                      <td className="py-2">{api.avgTime}ms</td>
                      <td className="py-2">{api.maxTime}ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 최근 오류 로그 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">최근 오류 로그</h3>
            <div className="space-y-3">
              {performanceData.errorLogs.map((log, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      log.level === 'ERROR' ? 'bg-red-100 text-red-800' :
                      log.level === 'WARN' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {log.level}
                    </span>
                    <span className="text-gray-700">{log.message}</span>
                  </div>
                  <div className="text-sm text-gray-500">{log.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-8">
          {/* 보안 상태 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="실패한 로그인"
              value={securityData.failedLogins.toString()}
              icon="🚫"
              color="red"
              subtitle="24시간 내 시도"
              change={{ value: -15.3, type: 'decrease' }}
            />

            <StatCard
              title="차단된 IP"
              value={securityData.blockedIPs.toString()}
              icon="🔒"
              color="orange"
              subtitle="자동 차단된 IP"
              change={{ value: 2.1, type: 'increase' }}
            />

            <StatCard
              title="방화벽 상태"
              value={securityData.firewallStatus}
              icon="🛡️"
              color="green"
              subtitle="보안 시스템 활성"
              change={{ value: 0, type: 'increase' }}
            />

            <StatCard
              title="SSL 만료일"
              value={securityData.sslExpiry}
              icon="🔐"
              color="blue"
              subtitle="인증서 만료일"
              change={{ value: 0, type: 'increase' }}
            />
          </div>

          {/* 보안 활동 로그 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">보안 활동 로그</h3>
            <div className="space-y-3">
              {securityData.recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <span className="font-medium">{activity.user}</span>
                      <span className="text-gray-600 ml-2">{activity.action}</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {activity.time} ({activity.ip})
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 보안 설정 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">보안 설정</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">시스템 보안</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">방화벽</span>
                    <span className="text-green-600 font-medium">{securityData.firewallStatus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">안티바이러스</span>
                    <span className="text-green-600 font-medium">{securityData.antivirusStatus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">마지막 보안 스캔</span>
                    <span className="text-gray-600">{securityData.lastSecurityScan}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">SSL 인증서</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">상태</span>
                    <span className="text-green-600 font-medium">유효</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">만료일</span>
                    <span className="text-gray-600">{securityData.sslExpiry}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}