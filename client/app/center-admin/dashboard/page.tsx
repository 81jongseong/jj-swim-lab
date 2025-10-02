/**
 * @file 센터 관리자 대시보드 페이지
 * @description 센터 관리자가 센터의 전반적인 현황을 한눈에 볼 수 있는 대시보드입니다.
 * @date 2025-01-13
 * @author JJ Swim Lab
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Users, BookOpen, DollarSign, TrendingUp, Calendar, AlertCircle, CheckCircle, Clock, Settings } from 'lucide-react';

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
  const { user } = useAuth();
  const [stats, setStats] = useState<CenterStats>({
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

  useEffect(() => {
    const loadCenterData = async () => {
      try {
        // 실제 API 호출 로직
        console.log('센터 데이터 로드 중...');
        
        // 임시 데이터 설정
        setStats({
          totalMembers: 150,
          activeInstructors: 8,
          activeCourses: 25,
          monthlyRevenue: 5000000,
          pendingApprovals: 3,
          todayBookings: 45
        });
      } catch (error) {
        console.error('센터 데이터 로드 실패:', error);
      }
    };

    loadCenterData();
  }, []);

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">총 회원</h3>
            <Users className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalMembers}명</div>
          <p className="text-xs text-gray-500 mt-1">등록된 회원</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">활성 강사</h3>
            <Settings className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.activeInstructors}명</div>
          <p className="text-xs text-gray-500 mt-1">현재 활동 중</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">진행 중인 강의</h3>
            <BookOpen className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.activeCourses}개</div>
          <p className="text-xs text-gray-500 mt-1">현재 진행 중</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">월간 수익</h3>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.monthlyRevenue.toLocaleString()}원</div>
          <p className="text-xs text-gray-500 mt-1">이번 달 수익</p>
        </div>
      </div>

      {/* 추가 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">승인 대기</h3>
            <AlertCircle className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.pendingApprovals}건</div>
          <p className="text-xs text-gray-500 mt-1">처리 대기 중</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">오늘 예약</h3>
            <Calendar className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.todayBookings}건</div>
          <p className="text-xs text-gray-500 mt-1">오늘 예정된 수업</p>
        </div>
      </div>

      {/* 센터 현황 및 최근 활동 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">센터 현황</h3>
            <p className="text-sm text-gray-600">센터의 전반적인 운영 현황을 확인하세요.</p>
          </div>
          <div className="space-y-4">
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
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">최근 활동</h3>
            <p className="text-sm text-gray-600">센터의 최근 활동 내역을 확인하세요.</p>
          </div>
          <div className="space-y-4">
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
          </div>
        </div>
      </div>

      {/* 빠른 액션 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">빠른 액션</h3>
          <p className="text-sm text-gray-600">자주 사용하는 기능들에 빠르게 접근하세요.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            className="h-20 flex flex-col items-center justify-center bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => window.location.href = '/center-admin/users'}
          >
            <Users className="h-6 w-6 mb-2 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">회원 관리</span>
          </button>
          <button 
            className="h-20 flex flex-col items-center justify-center bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => window.location.href = '/center-admin/instructors'}
          >
            <Settings className="h-6 w-6 mb-2 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">강사 관리</span>
          </button>
          <button 
            className="h-20 flex flex-col items-center justify-center bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => window.location.href = '/center-admin/courses'}
          >
            <BookOpen className="h-6 w-6 mb-2 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">강의 관리</span>
          </button>
          <button 
            className="h-20 flex flex-col items-center justify-center bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => window.location.href = '/center-admin/reports'}
          >
            <TrendingUp className="h-6 w-6 mb-2 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">리포트</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CenterAdminDashboard;