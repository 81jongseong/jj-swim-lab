/**
 * @file 센터 관리자 대시보드 페이지
 * @description 센터 관리자가 센터의 전반적인 현황을 한눈에 볼 수 있는 대시보드입니다.
 * @date 2025-09-13
 * @author JJ Swim Lab
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Users, BookOpen, DollarSign, TrendingUp, Calendar, AlertCircle, CheckCircle, Clock, Settings } from 'lucide-react';

interface CenterStats {
  totalMembers: number;
  activeInstructors: number;
  activeCourses: number;
  monthlyRevenue: number;
  todayBookings: number;
  pendingApprovals: number;
  monthlyGrowth: number;
  averageRating: number;
}

interface RecentActivity {
  id: string;
  type: 'new_member' | 'new_booking' | 'payment' | 'course_completed';
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'info';
}

const CenterAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<CenterStats>({
    totalMembers: 0,
    activeInstructors: 0,
    activeCourses: 0,
    monthlyRevenue: 0,
    todayBookings: 0,
    pendingApprovals: 0,
    monthlyGrowth: 0,
    averageRating: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // 실제 API 호출
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/centers/dashboard-stats', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('통계 데이터를 가져올 수 없습니다.');
      }

      const result = await response.json();
      
      if (result.success) {
        setStats(result.data);
      } else {
        throw new Error(result.message || '통계 데이터 조회에 실패했습니다.');
      }

      // 최근 활동은 현재 임시 데이터 (향후 별도 API 개발 필요)
      const mockActivities: RecentActivity[] = [
        {
          id: '1',
          type: 'new_member',
          description: '새 회원이 가입했습니다.',
          timestamp: '2분 전',
          status: 'success',
        },
        {
          id: '2',
          type: 'new_booking',
          description: '새로운 수업 예약이 있습니다.',
          timestamp: '5분 전',
          status: 'info',
        },
        {
          id: '3',
          type: 'payment',
          description: '결제가 완료되었습니다.',
          timestamp: '10분 전',
          status: 'success',
        },
        {
          id: '4',
          type: 'course_completed',
          description: '수업이 완료되었습니다.',
          timestamp: '15분 전',
          status: 'success',
        },
      ];

      setRecentActivities(mockActivities);
    } catch (error) {
      console.error('대시보드 데이터 로딩 실패:', error);
      // 에러 발생 시 기본값 설정
      setStats({
        totalMembers: 0,
        activeInstructors: 0,
        activeCourses: 0,
        monthlyRevenue: 0,
        todayBookings: 0,
        pendingApprovals: 0,
        monthlyGrowth: 0,
        averageRating: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'new_member':
        return <Users className="h-4 w-4" />;
      case 'new_booking':
        return <Calendar className="h-4 w-4" />;
      case 'payment':
        return <DollarSign className="h-4 w-4" />;
      case 'course_completed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'info':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          센터 관리 대시보드 🏊‍♂️
        </h1>
        <p className="text-gray-600">
          {user?.name}님, 센터의 전반적인 현황을 확인하세요.
        </p>
      </div>

      {/* 주요 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="cursor-pointer hover:shadow-md transition-shadow duration-200" onClick={() => window.location.href = '/center-admin/users'}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 회원</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers}명</div>
            <p className="text-xs text-muted-foreground">
              활성 회원 기준
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow duration-200" onClick={() => window.location.href = '/center-admin/instructors'}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활성 강사</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeInstructors}명</div>
            <p className="text-xs text-muted-foreground">
              현재 근무 중
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow duration-200" onClick={() => window.location.href = '/center-admin/courses'}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">진행 중인 강의</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCourses}개</div>
            <p className="text-xs text-muted-foreground">
              현재 진행 중
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow duration-200" onClick={() => window.location.href = '/center-admin/payments'}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">이번 달 매출</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.monthlyRevenue.toLocaleString()}원
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{stats.monthlyGrowth}%</span> 전월 대비
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 추가 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="cursor-pointer hover:shadow-md transition-shadow duration-200" onClick={() => window.location.href = '/center-admin/bookings'}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">오늘 예약</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayBookings}건</div>
            <p className="text-xs text-muted-foreground">
              오늘 예정된 수업
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow duration-200" onClick={() => window.location.href = '/center-admin/approvals'}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">승인 대기</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApprovals}건</div>
            <p className="text-xs text-muted-foreground">
              처리 필요
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow duration-200" onClick={() => window.location.href = '/center-admin/reviews'}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 평점</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating}</div>
            <p className="text-xs text-muted-foreground">
              회원 평가 기준
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow duration-200" onClick={() => window.location.href = '/center-admin/analytics'}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">성장률</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{stats.monthlyGrowth}%</div>
            <p className="text-xs text-muted-foreground">
              전월 대비 증가
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 최근 활동 */}
        <Card>
          <CardHeader>
            <CardTitle>최근 활동</CardTitle>
            <CardDescription>
              센터에서 발생한 최근 활동들을 확인하세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 p-3 border rounded-lg"
                >
                  <div className={`flex-shrink-0 ${getActivityColor(activity.status)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 빠른 액션 */}
        <Card>
          <CardHeader>
            <CardTitle>빠른 액션</CardTitle>
            <CardDescription>
              자주 사용하는 관리 기능들에 빠르게 접근하세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-20 flex flex-col">
                <Users className="h-6 w-6 mb-2" />
                <span>회원 관리</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col">
                <BookOpen className="h-6 w-6 mb-2" />
                <span>강의 관리</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col">
                <Calendar className="h-6 w-6 mb-2" />
                <span>예약 관리</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col">
                <DollarSign className="h-6 w-6 mb-2" />
                <span>결제 관리</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col">
                <TrendingUp className="h-6 w-6 mb-2" />
                <span>통계 보기</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col"
                onClick={() => window.location.href = '/center-admin/introduction'}
              >
                <Settings className="h-6 w-6 mb-2" />
                <span>센터 정보 편집</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col">
                <AlertCircle className="h-6 w-6 mb-2" />
                <span>승인 관리</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
};

export default CenterAdminDashboard;
