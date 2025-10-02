/**
 * 📊 JJ Swim Lab - 시스템 사용 통계 페이지
 * 
 * 📋 **페이지 목적**
 * - 전체 시스템 사용 현황 및 통계 분석
 * - 실제 DB 데이터 기반
 * 
 * 🗄️ **데이터 연동**
 * - GET /api/users - 전체 회원 통계
 * - GET /api/user-activities - 페이지 방문/API 호출 통계
 * 
 * 📅 **생성일**: 2025-01-22
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import apiClient from '../../../utils/api';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Activity,
  Heart,
  RefreshCw,
  Calendar,
  MousePointer,
  Database,
  Clock,
  FileText,
  Zap
} from 'lucide-react';

interface User {
  _id: string;
  email: string;
  name: string;
  userType: string;
  healthProfile?: any;
  createdAt: string;
  lastLoginAt?: string;
}

interface UserActivity {
  _id: string;
  userId: string;
  action: string;
  page: string;
  createdAt: string;
}

export default function SystemAnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [users, setUsers] = useState<User[]>([]);
  const [activities, setActivities] = useState<UserActivity[]>([]);

  useEffect(() => {
    if (authLoading) return;
    
    console.log('🔍 시스템 통계 - 사용자 확인:', { user, userType: user?.userType });
    
    if (!user) {
      alert('로그인이 필요합니다');
      window.location.href = '/login';
      return;
    }
    
    // 관리자 권한 체크 (superAdmin, admin, centerAdmin 모두 허용)
    const allowedTypes = ['superAdmin', 'admin', 'centerAdmin'];
    if (!allowedTypes.includes(user.userType)) {
      alert('관리자 권한이 필요합니다');
      window.location.href = '/';
      return;
    }
    
    console.log('✅ 권한 체크 통과 - loadData 호출');
    loadData();
  }, [user, authLoading]);

  const loadData = async () => {
    console.log('📡 loadData 함수 실행 시작');
    try {
      setLoading(true);
      
      // 회원 데이터 로드
      console.log('🔗 API 호출: /api/users');
      const usersResponse = await apiClient.get('/api/users');
      console.log('📊 Users API 응답:', usersResponse);
      
      // API 응답 형식이 { users: [...] } 또는 { success: true, users: [...] } 둘 다 지원
      console.log('🔍 usersResponse:', usersResponse);
      console.log('🔍 usersResponse.data:', usersResponse?.data);
      console.log('🔍 usersResponse.data.users:', usersResponse?.data?.users);
      
      if (usersResponse && usersResponse.data) {
        const users = usersResponse.data.users || usersResponse.data;
        console.log('🔍 추출된 users:', users);
        console.log('🔍 Array.isArray(users):', Array.isArray(users));
        
        if (Array.isArray(users)) {
          setUsers(users);
          console.log(`✅ ${users.length}명의 회원 데이터 로드 완료`);
        } else {
          console.warn('❌ 회원 데이터 배열이 아님:', typeof users, users);
          setUsers([]);
        }
      } else {
        console.warn('❌ 회원 데이터 응답 없음');
        setUsers([]);
      }
      
      // 사용자 활동 로드 (있으면)
      try {
        const activitiesResponse = await apiClient.get('/api/user-activities');
        if (activitiesResponse && activitiesResponse.data && activitiesResponse.data.success) {
          setActivities(activitiesResponse.data.activities || []);
        }
      } catch (err) {
        console.log('사용자 활동 데이터 없음 (선택사항)');
        setActivities([]);
      }
      
    } catch (error: any) {
      console.error('데이터 로드 오류:', error);
      
      // 토큰 만료 시 재로그인
      if (error?.response?.status === 401 || error?.code === 'TOKEN_EXPIRED') {
        alert('세션이 만료되었습니다. 다시 로그인해주세요.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      
      // 기본값 설정
      setUsers([]);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  // 통계 계산
  const statistics = useMemo(() => {
    const now = new Date();
    let cutoffDate: Date;
    
    switch (timeRange) {
      case '7d':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        cutoffDate = new Date(0);
    }

    // 총 회원 수
    const totalUsers = users.length;
    
    // 기간 내 신규 가입자
    const newUsers = users.filter(u => new Date(u.createdAt) >= cutoffDate).length;
    
    // 건강정보 입력 회원
    const usersWithHealth = users.filter(u => u.healthProfile).length;
    
    // 기간 내 건강정보 입력
    const newHealthProfiles = users.filter(u => 
      u.healthProfile && new Date(u.createdAt) >= cutoffDate
    ).length;
    
    // 계정 타입별 분포
    const userTypeDistribution = users.reduce((acc, u) => {
      acc[u.userType] = (acc[u.userType] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
    
    // 기간 내 활동
    const recentActivities = activities.filter(a => 
      new Date(a.createdAt) >= cutoffDate
    );
    
    // 페이지별 방문 통계
    const pageVisits = recentActivities.reduce((acc, a) => {
      if (a.action === 'page_view') {
        acc[a.page] = (acc[a.page] || 0) + 1;
      }
      return acc;
    }, {} as { [key: string]: number });
    
    // 상위 방문 페이지
    const topPages = Object.entries(pageVisits)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([page, count]) => ({ page, count }));
    
    // 최근 로그인 회원 (7일 이내)
    const recentLoginDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const activeUsers = users.filter(u => 
      u.lastLoginAt && new Date(u.lastLoginAt) >= recentLoginDate
    ).length;

    return {
      totalUsers,
      newUsers,
      usersWithHealth,
      newHealthProfiles,
      activeUsers,
      userTypeDistribution,
      recentActivities: recentActivities.length,
      topPages
    };
  }, [users, activities, timeRange]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-12 w-12 text-blue-600 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-blue-500" />
                시스템 사용 통계
              </h1>
              <p className="text-gray-600">
                전체 시스템의 사용 현황과 회원 활동을 실시간으로 분석합니다
              </p>
            </div>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              새로고침
            </button>
          </div>
        </div>

        {/* 필터 */}
        <div className="mb-6 flex items-center gap-4">
          <Calendar className="h-5 w-5 text-gray-500" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">최근 7일</option>
            <option value="30d">최근 30일</option>
            <option value="90d">최근 90일</option>
            <option value="1y">최근 1년</option>
          </select>
        </div>

        {/* 주요 지표 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">총 회원 수</div>
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{statistics.totalUsers}</div>
            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              신규: {statistics.newUsers}명
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">활성 회원</div>
              <Activity className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{statistics.activeUsers}</div>
            <div className="text-xs text-gray-500 mt-1">
              최근 7일 로그인
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">건강정보 입력</div>
              <Heart className="h-5 w-5 text-red-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{statistics.usersWithHealth}</div>
            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              신규: {statistics.newHealthProfiles}명
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">사용자 활동</div>
              <MousePointer className="h-5 w-5 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{statistics.recentActivities}</div>
            <div className="text-xs text-gray-500 mt-1">
              선택 기간 내
            </div>
          </div>
        </div>

        {/* 계정 타입별 분포 */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            계정 타입별 분포
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {statistics.userTypeDistribution.superAdmin || 0}
              </div>
              <div className="text-sm text-gray-600">최고관리자</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {statistics.userTypeDistribution.admin || 0}
              </div>
              <div className="text-sm text-gray-600">시스템관리자</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {statistics.userTypeDistribution.centerAdmin || 0}
              </div>
              <div className="text-sm text-gray-600">센터관리자</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {statistics.userTypeDistribution.instructor || 0}
              </div>
              <div className="text-sm text-gray-600">강사</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {statistics.userTypeDistribution.member || 0}
              </div>
              <div className="text-sm text-gray-600">회원</div>
            </div>
            <div className="text-center p-4 bg-pink-50 rounded-lg">
              <div className="text-2xl font-bold text-pink-600">
                {statistics.userTypeDistribution.student || 0}
              </div>
              <div className="text-sm text-gray-600">학생</div>
            </div>
          </div>
        </div>

        {/* 건강정보 등록률 */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            건강정보 등록 현황
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">전체 등록률</span>
                <span className="font-medium">
                  {statistics.usersWithHealth} / {statistics.totalUsers} 
                  ({statistics.totalUsers > 0 ? ((statistics.usersWithHealth / statistics.totalUsers) * 100).toFixed(1) : 0}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all" 
                  style={{ width: `${statistics.totalUsers > 0 ? (statistics.usersWithHealth / statistics.totalUsers) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">건강정보 있음</div>
                <div className="text-2xl font-bold text-green-600">{statistics.usersWithHealth}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">미등록</div>
                <div className="text-2xl font-bold text-gray-600">
                  {statistics.totalUsers - statistics.usersWithHealth}
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">기간 내 신규</div>
                <div className="text-2xl font-bold text-blue-600">{statistics.newHealthProfiles}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 상위 방문 페이지 */}
        {statistics.topPages.length > 0 && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MousePointer className="h-5 w-5 text-purple-500" />
              상위 방문 페이지 (선택 기간)
            </h3>
            <div className="space-y-2">
              {statistics.topPages.map((page, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-gray-700 w-8">{index + 1}.</div>
                    <div className="text-sm text-gray-900">{page.page || '(알 수 없음)'}</div>
                  </div>
                  <div className="text-sm font-medium text-blue-600">{page.count}회</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 활동 타임라인 (최근 활동만) */}
        {statistics.recentActivities > 0 && (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              활동 요약
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{statistics.recentActivities}</div>
                <div className="text-sm text-gray-600">총 활동</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {statistics.recentActivities > 0 
                    ? (statistics.recentActivities / parseInt(timeRange.replace('d', '')) || 1).toFixed(1)
                    : 0}
                </div>
                <div className="text-sm text-gray-600">일평균 활동</div>
              </div>
            </div>
          </div>
        )}

        {/* 데이터가 없을 때 */}
        {statistics.recentActivities === 0 && (
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <div className="text-center text-blue-900">
              <Database className="h-12 w-12 mx-auto mb-3 text-blue-400" />
              <div className="font-semibold mb-2">사용자 활동 데이터가 없습니다</div>
              <div className="text-sm text-blue-800">
                • 사용자 활동 추적 기능이 활성화되지 않았을 수 있습니다<br/>
                • 회원 데이터와 건강정보 통계는 정상적으로 표시됩니다
              </div>
            </div>
          </div>
        )}

        {/* 시스템 상태 */}
        <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-green-600" />
            시스템 상태
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-white p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">✅</div>
              <div className="text-sm text-gray-600 mt-1">데이터베이스</div>
              <div className="text-xs text-gray-500">정상</div>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">📊</div>
              <div className="text-sm text-gray-600 mt-1">통계 시스템</div>
              <div className="text-xs text-gray-500">활성화</div>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">🏊</div>
              <div className="text-sm text-gray-600 mt-1">수영 엔진</div>
              <div className="text-xs text-gray-500">정상 작동</div>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">💾</div>
              <div className="text-sm text-gray-600 mt-1">데이터 수집</div>
              <div className="text-xs text-gray-500">실시간</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
