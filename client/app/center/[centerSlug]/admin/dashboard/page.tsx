/**
 * @file 센터 관리자 대시보드 페이지 (테넌트 경로)
 * @description 센터 관리자가 센터의 전반적인 현황을 한눈에 볼 수 있는 대시보드입니다.
 * 
 * @연동되는 데이터:
 * - 대시보드 통계 API (/api/center-admin/dashboard)
 * - 센터 정보 API (/api/center-admin/center-info)
 * 
 * @연동되는 파일:
 * - hooks/useAuth.tsx (인증 상태)
 * - components/StatCard.tsx (통계 카드 컴포넌트)
 * - components/ui (UI 컴포넌트)
 */

'use client';
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Users, BookOpen, DollarSign, Calendar, AlertCircle, CheckCircle, Clock, Settings, TrendingUp } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { Button } from '@/components/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import QuickActionCard from '@/components/center-admin/QuickActionCard';

const DEBUG = false;

interface CenterStats {
  totalMembers: number;
  activeInstructors: number;
  activeCourses: number;
  monthlyRevenue: number;
  pendingApprovals: number;
  todayBookings: number;
}

interface RecentActivity {
  id: string;
  type: 'member' | 'instructor' | 'booking' | 'payment';
  description: string;
  time: string;
  status: 'success' | 'warning' | 'info';
}

const CenterAdminDashboard: React.FC = () => {
  const params = useParams();
  const centerSlug = String((params as any)?.centerSlug || 'default');
  const { user } = useAuth();
  const [stats, setStats] = useState<CenterStats>({
    totalMembers: 0,
    activeInstructors: 0,
    activeCourses: 0,
    monthlyRevenue: 0,
    pendingApprovals: 0,
    todayBookings: 0
  });
  
  // 여러 센터 관리 상태
  const [selectedCenterId, setSelectedCenterId] = useState<string | null>(null);
  const [managedCenters, setManagedCenters] = useState<Array<{ _id: string; name: string }>>([]);
  const [centerStats, setCenterStats] = useState<Record<string, CenterStats>>({});
  const [allCentersStats, setAllCentersStats] = useState<CenterStats>({
    totalMembers: 0,
    activeInstructors: 0,
    activeCourses: 0,
    monthlyRevenue: 0,
    pendingApprovals: 0,
    todayBookings: 0
  });

  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'member',
      description: '새로운 회원이 가입했습니다',
      time: '5분 전',
      status: 'success'
    },
    {
      id: '2',
      type: 'booking',
      description: '새로운 수업 예약이 생성되었습니다',
      time: '15분 전',
      status: 'info'
    },
    {
      id: '3',
      type: 'payment',
      description: '결제가 완료되었습니다',
      time: '30분 전',
      status: 'success'
    },
    {
      id: '4',
      type: 'instructor',
      description: '강사 승인 요청이 있습니다',
      time: '1시간 전',
      status: 'warning'
    }
  ]);

  // 관리하는 센터 목록 로드
  useEffect(() => {
    if (user?.centerAdminInfo?.managedCenters) {
      const centers = user.centerAdminInfo.managedCenters;
      const centersList = centers.map((c: any) => ({
        _id: c.toString ? c.toString() : c._id?.toString() || c,
        name: c.name || `센터 ${c.toString ? c.toString() : c._id?.toString() || c}`
      }));
      setManagedCenters(centersList);
      setSelectedCenterId(null); // 초기값: 전체 통계
    }
  }, [user]);

  // 센터별 통계 로드
  useEffect(() => {
    const loadCenterData = async () => {
      if (!user) return;

      try {
        if (DEBUG) console.log('📊 센터 데이터 로드 중...');
        
        // 관리하는 센터 목록
        const managedCenters = user.centerAdminInfo?.managedCenters || [];
        
        if (managedCenters.length === 0) {
          // 센터가 없으면 기본 API 호출
          const response = await fetch('http://localhost:5000/api/center-admin/dashboard', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              setStats({
                totalMembers: data.data.totalMembers || 0,
                activeInstructors: data.data.activeInstructors || 0,
                activeCourses: data.data.activeCourses || 0,
                monthlyRevenue: data.data.monthlyRevenue || 0,
                pendingApprovals: data.data.pendingApprovals || 0,
                todayBookings: data.data.todayBookings || 0
              });
            }
          }
          return;
        }

        // 여러 센터가 있는 경우
        const centerStatsMap: Record<string, CenterStats> = {};
        let allStats: CenterStats = {
          totalMembers: 0,
          activeInstructors: 0,
          activeCourses: 0,
          monthlyRevenue: 0,
          pendingApprovals: 0,
          todayBookings: 0
        };

        // 각 센터별 통계 로드
        for (const centerId of managedCenters) {
          const cId = centerId.toString ? centerId.toString() : centerId._id?.toString() || centerId;
          const response = await fetch(`http://localhost:5000/api/center-admin/dashboard?centerId=${cId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              const centerStat: CenterStats = {
                totalMembers: data.data.totalMembers || 0,
                activeInstructors: data.data.activeInstructors || 0,
                activeCourses: data.data.activeCourses || 0,
                monthlyRevenue: data.data.monthlyRevenue || 0,
                pendingApprovals: data.data.pendingApprovals || 0,
                todayBookings: data.data.todayBookings || 0
              };
              centerStatsMap[cId] = centerStat;
              
              // 전체 통계 합산
              allStats.totalMembers += centerStat.totalMembers;
              allStats.activeInstructors += centerStat.activeInstructors;
              allStats.activeCourses += centerStat.activeCourses;
              allStats.monthlyRevenue += centerStat.monthlyRevenue;
              allStats.pendingApprovals += centerStat.pendingApprovals;
              allStats.todayBookings += centerStat.todayBookings;
            }
          }
        }

        setCenterStats(centerStatsMap);
        setAllCentersStats(allStats);
        
        // 선택된 센터가 없으면 전체 통계 표시, 있으면 해당 센터 통계 표시
        if (!selectedCenterId) {
          setStats(allStats);
        } else {
          setStats(centerStatsMap[selectedCenterId] || allStats);
        }
        
      } catch (error) {
        if (DEBUG) console.error('❌ 센터 데이터 로드 실패:', error);
      }
    };

    loadCenterData();
  }, [user, selectedCenterId]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'member': return <Users className="h-4 w-4" />;
      case 'instructor': return <Settings className="h-4 w-4" />;
      case 'booking': return <Calendar className="h-4 w-4" />;
      case 'payment': return <DollarSign className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'info': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">센터 관리자 대시보드</h1>
        <p className="text-gray-600 mt-2">안녕하세요, {user?.name || '센터관리자'}님! 센터 현황을 확인해보세요.</p>
      </div>

      {/* 주요 통계 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-6 mb-8">
        <StatCard
          title="승인 대기"
          value={`${stats.pendingApprovals}건`}
          icon={<AlertCircle className="h-5 w-5" />}
          color="red"
        />
        <StatCard
          title="오늘 예약"
          value={`${stats.todayBookings}건`}
          icon={<Calendar className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="총 회원"
          value={`${stats.totalMembers}명`}
          icon="👥"
          color="blue"
        />
        <StatCard
          title="활성 강사"
          value={`${stats.activeInstructors}명`}
          icon="👨‍🏫"
          color="green"
        />
        <StatCard
          title="진행 중인 강의"
          value={`${stats.activeCourses}개`}
          icon="📚"
          color="purple"
        />
        <StatCard
          title="월간 수익"
          value={`${stats.monthlyRevenue.toLocaleString()}원`}
          icon="💰"
          color="orange"
        />
      </div>

      {/* 센터 현황 및 최근 활동 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>센터 현황</CardTitle>
            <CardDescription>센터의 전반적인 운영 현황을 확인하세요.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <h4 className="font-medium text-gray-900">시설 상태</h4>
                  <p className="text-sm text-gray-600">모든 시설 정상 운영</p>
                </div>
              </div>
              <div className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                정상
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-blue-600" />
                <div>
                  <h4 className="font-medium text-gray-900">운영 시간</h4>
                  <p className="text-sm text-gray-600">06:00 - 22:00</p>
                </div>
              </div>
              <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                운영중
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <div>
                  <h4 className="font-medium text-gray-900">이번 주 신규 회원</h4>
                  <p className="text-sm text-gray-600">12명 가입</p>
                </div>
              </div>
              <div className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                증가
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>최근 활동</CardTitle>
            <CardDescription>센터의 최근 활동 내역을 확인하세요.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${getActivityColor(activity.status)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* 빠른 액션 */}
      <Card>
        <CardHeader>
          <CardTitle>빠른 액션</CardTitle>
          <CardDescription>자주 사용하는 기능들에 빠르게 접근하세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            <QuickActionCard
              title="회원 관리"
              icon={Users}
              href={`/center/${centerSlug}/admin/members`}
              color="blue"
            />
            <QuickActionCard
              title="강사 관리"
              icon={Settings}
              href={`/center/${centerSlug}/admin/instructors`}
              color="green"
            />
            <QuickActionCard
              title="강의 관리"
              icon={BookOpen}
              href={`/center/${centerSlug}/admin/courses`}
              color="purple"
            />
            <QuickActionCard
              title="예약·결제 관리"
              icon={DollarSign}
              href={`/center/${centerSlug}/admin/manage`}
              color="orange"
            />
            <QuickActionCard
              title="리포트"
              icon={TrendingUp}
              href={`/center/${centerSlug}/admin/reports`}
              color="indigo"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CenterAdminDashboard;
