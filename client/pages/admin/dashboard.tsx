'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import apiClient from '../../utils/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalInstructors: 0,
    totalMembers: 0,
    totalCourses: 0,
    totalBookings: 0,
    totalPayments: 0,
    totalNotices: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.getAdminStats();
        
        if (response.data) {
          setStats(response.data);
        } else if (response.error) {
          setError(response.error);
        }
      } catch (err) {
        setError('통계를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: '전체 사용자',
      value: stats.totalUsers,
      icon: '👥',
      color: 'bg-blue-500',
      href: '/admin/users'
    },
    {
      title: '강사',
      value: stats.totalInstructors,
      icon: '👨‍🏫',
      color: 'bg-green-500',
      href: '/admin/users?userType=instructor'
    },
    {
      title: '회원',
      value: stats.totalMembers,
      icon: '👤',
      color: 'bg-purple-500',
      href: '/admin/users?userType=member'
    },
    {
      title: '강습 과정',
      value: stats.totalCourses,
      icon: '📚',
      color: 'bg-orange-500',
      href: '/admin/courses'
    },
    {
      title: '예약',
      value: stats.totalBookings,
      icon: '📅',
      color: 'bg-indigo-500',
      href: '/admin/bookings'
    },
    {
      title: '결제',
      value: stats.totalPayments,
      icon: '💰',
      color: 'bg-yellow-500',
      href: '/admin/payments'
    },
    {
      title: '공지사항',
      value: stats.totalNotices,
      icon: '📢',
      color: 'bg-red-500',
      href: '/admin/notices'
    }
  ];

  const quickActions = [
    {
      title: '사용자 관리',
      description: '회원 및 강사 관리',
      icon: '👥',
      href: '/admin/users',
      color: 'bg-blue-500'
    },
    {
      title: '강습 관리',
      description: '강습 과정 관리',
      icon: '📚',
      href: '/admin/courses',
      color: 'bg-green-500'
    },
    {
      title: '예약 관리',
      description: '예약 현황 관리',
      icon: '📅',
      href: '/admin/bookings',
      color: 'bg-purple-500'
    },
    {
      title: '결제 관리',
      description: '결제 내역 관리',
      icon: '💰',
      href: '/admin/payments',
      color: 'bg-orange-500'
    },
    {
      title: '공지사항 관리',
      description: '공지사항 작성 및 관리',
      icon: '📢',
      href: '/admin/notices',
      color: 'bg-indigo-500'
    },
    {
      title: '통계 분석',
      description: '시스템 통계 및 분석',
      icon: '📊',
      href: '/admin/statistics',
      color: 'bg-red-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-white">관리자 대시보드</h1>
              <p className="text-blue-100">JJ Swim Lab 관리 시스템</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-white">관리자님</span>
              <button 
                onClick={() => {
                  apiClient.logout();
                  window.location.href = '/';
                }}
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : error ? (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-red-200">
            {error}
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
              {statCards.map((card, index) => (
                <Link
                  key={index}
                  href={card.href}
                  className="backdrop-blur-xl bg-white/10 rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 group"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-8 h-8 ${card.color} rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                      <span className="text-sm">{card.icon}</span>
                    </div>
                    <p className="text-xs font-medium text-blue-200 mb-1">{card.title}</p>
                    <p className="text-lg font-bold text-white">{card.value.toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  href={action.href}
                  className="backdrop-blur-xl bg-white/10 rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 group"
                >
                  <div className="flex items-center">
                    <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform`}>
                      <span className="text-lg">{action.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{action.title}</h3>
                      <p className="text-blue-200 text-sm">{action.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">최근 활동</h3>
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-white/5 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-4"></div>
                  <div className="flex-1">
                    <p className="text-white">새로운 회원이 가입했습니다</p>
                    <p className="text-blue-200 text-sm">2분 전</p>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-white/5 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-4"></div>
                  <div className="flex-1">
                    <p className="text-white">새로운 강사가 등록되었습니다</p>
                    <p className="text-blue-200 text-sm">15분 전</p>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-white/5 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-4"></div>
                  <div className="flex-1">
                    <p className="text-white">새로운 강습 과정이 추가되었습니다</p>
                    <p className="text-blue-200 text-sm">1시간 전</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 