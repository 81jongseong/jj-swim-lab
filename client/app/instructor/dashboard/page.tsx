/**
 * @file 강사 대시보드 페이지
 * @description 강사가 자신의 강의, 수강생, 일정 등을 한눈에 볼 수 있는 대시보드입니다.
 * @date 2025-01-13
 * @author JJ Swim Lab
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Calendar, Users, BookOpen, TrendingUp, Clock, Star } from 'lucide-react';

interface DashboardStats {
  totalStudents: number;
  activeCourses: number;
  todayBookings: number;
  weeklyRevenue: number;
  averageRating: number;
  completedSessions: number;
}

interface RecentActivity {
  id: string;
  type: 'booking' | 'completion' | 'review';
  student: string;
  course: string;
  time: string;
  status: 'success' | 'warning' | 'info';
}

const InstructorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    activeCourses: 0,
    todayBookings: 0,
    weeklyRevenue: 0,
    averageRating: 0,
    completedSessions: 0
  });

  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'booking',
      student: '김수영',
      course: '자유형 초급',
      time: '10분 전',
      status: 'success'
    },
    {
      id: '2',
      type: 'completion',
      student: '이배영',
      course: '배영 기초',
      time: '30분 전',
      status: 'success'
    },
    {
      id: '3',
      type: 'review',
      student: '박평영',
      course: '평영 입문',
      time: '1시간 전',
      status: 'info'
    }
  ]);

  useEffect(() => {
    const loadInstructorData = async () => {
      try {
        // 실제 API 호출 로직
        console.log('강사 데이터 로드 중...');
        
        // 임시 데이터 설정
        setStats({
          totalStudents: 25,
          activeCourses: 8,
          todayBookings: 12,
          weeklyRevenue: 1500000,
          averageRating: 4.8,
          completedSessions: 156
        });
      } catch (error) {
        console.error('강사 데이터 로드 실패:', error);
      }
    };

    loadInstructorData();
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking': return <Calendar className="h-4 w-4" />;
      case 'completion': return <BookOpen className="h-4 w-4" />;
      case 'review': return <Star className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
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
        <h1 className="text-3xl font-bold text-gray-900">강사 대시보드</h1>
        <p className="text-gray-600 mt-2">안녕하세요, {user?.name || '강사'}님! 오늘의 수업을 준비해보세요.</p>
      </div>

      {/* 주요 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">총 수강생</h3>
            <Users className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalStudents}명</div>
          <p className="text-xs text-gray-500 mt-1">활성 수강생</p>
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
            <h3 className="text-sm font-medium text-gray-600">오늘 예약</h3>
            <Calendar className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.todayBookings}건</div>
          <p className="text-xs text-gray-500 mt-1">오늘 예정된 수업</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">주간 수익</h3>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.weeklyRevenue.toLocaleString()}원</div>
          <p className="text-xs text-gray-500 mt-1">이번 주 수익</p>
        </div>
      </div>

      {/* 추가 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">평균 평점</h3>
            <Star className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.averageRating}</div>
          <p className="text-xs text-gray-500 mt-1">수강생 평가 기준</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">완료한 수업</h3>
            <Clock className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.completedSessions}회</div>
          <p className="text-xs text-gray-500 mt-1">총 완료 수업</p>
        </div>
      </div>

      {/* 오늘의 일정 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">오늘의 일정</h3>
            <p className="text-sm text-gray-600">오늘 예정된 수업 일정을 확인하세요.</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">자유형 초급</h4>
                <p className="text-sm text-gray-600">김수영 학생</p>
                <p className="text-sm text-gray-500">14:00 - 15:00</p>
              </div>
              <div className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                확정
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">배영 기초</h4>
                <p className="text-sm text-gray-600">이배영 학생</p>
                <p className="text-sm text-gray-500">16:00 - 17:00</p>
              </div>
              <div className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                대기
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">평영 입문</h4>
                <p className="text-sm text-gray-600">박평영 학생</p>
                <p className="text-sm text-gray-500">18:00 - 19:00</p>
              </div>
              <div className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                확정
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">최근 활동</h3>
            <p className="text-sm text-gray-600">수강생들의 최근 활동을 확인하세요.</p>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${getActivityColor(activity.status)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.student} 학생이 {activity.course} 수업을 {activity.type === 'booking' ? '예약' : activity.type === 'completion' ? '완료' : '리뷰'}했습니다.
                  </p>
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
            onClick={() => window.location.href = '/instructor/students'}
          >
            <Users className="h-6 w-6 mb-2 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">수강생 관리</span>
          </button>
          <button 
            className="h-20 flex flex-col items-center justify-center bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => window.location.href = '/instructor/bookings'}
          >
            <Calendar className="h-6 w-6 mb-2 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">예약 관리</span>
          </button>
          <button 
            className="h-20 flex flex-col items-center justify-center bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => window.location.href = '/instructor/teaching-methods'}
          >
            <BookOpen className="h-6 w-6 mb-2 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">강습법 관리</span>
          </button>
          <button 
            className="h-20 flex flex-col items-center justify-center bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => window.location.href = '/instructor/schedule'}
          >
            <Clock className="h-6 w-6 mb-2 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">일정 관리</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;