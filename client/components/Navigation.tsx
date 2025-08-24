'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import NotificationsBell from './NotificationsBell';
import SmartNotifications from './SmartNotifications';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout, hasPermission, hasUserType } = useAuth();
  const isLoggedIn = !!user;
  const userName = user?.name || '';


  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  // 권한 기반 메뉴 필터링 함수
  const filterMenuByPermissions = (menuItems: any[], userType: string) => {
    if (userType === 'guest') return menuItems;
    
    return menuItems.filter(item => {
      // 특별한 권한이 필요한 메뉴들
      if (item.href === '/admin/reports' && !hasUserType('superAdmin')) return false;
      if (item.href === '/ai-config' && !hasUserType('superAdmin')) return false;
      if (item.href === '/admin/ai-config' && !hasUserType('superAdmin')) return false;
      
      // 일반적인 권한 체크
      if (item.href.startsWith('/admin/') && !hasUserType('centerAdmin') && !hasUserType('superAdmin')) return false;
      if (item.href.startsWith('/instructor/') && !hasUserType('instructor')) return false;
      
      return true;
    });
  };

  const menuItems = {
    guest: [
      { href: '/', label: '🏠 홈' },
      { href: '/about', label: '🏊‍♂️ 소개' },
      { href: '/guide', label: '📋 이용안내' },
      { href: '/news', label: '📢 공지사항' },
      { href: '/quiz', label: '🧠 퀴즈 체험' },
      { href: '/ai-analysis', label: '🤖 AI 분석 데모' },
      { href: '/health', label: '💪 건강관리 체험' },
      { href: '/(labs)/animation', label: '🎬 애니메이션' },
      { href: '/community', label: '💬 커뮤니티' },
      { href: '/shop', label: '🛍️ 상점' },
      { href: '/map', label: '🗺️ 지도' },
      { href: '/auth/login', label: '🔑 로그인' },
      { href: '/auth/signup', label: '📝 회원가입' },
    ],
    student: [
      { href: '/', label: '홈' },
      { href: '/dashboard', label: '대시보드' },
      { href: '/courses', label: '강습 과정' },
      { href: '/bookings', label: '예약 관리' },
      { href: '/payments', label: '결제 내역' },
      { href: '/quiz', label: '퀴즈' },
      { href: '/uploads', label: '영상 업로드' },
      { href: '/map', label: '지도' },
      { href: '/ai-analysis', label: '🤖 AI 분석' },
      { href: '/health', label: '💪 건강관리' },
      { href: '/(labs)/animation', label: '애니메이션' },
      { href: '/about', label: '소개' },
      { href: '/news', label: '공지사항' },
      { href: '/shop', label: '상점' },
      { href: '/community', label: '커뮤니티' },
    ],
    instructor: [
      { href: '/', label: '홈' },
      { href: '/instructor/dashboard', label: '강사 대시보드' },
      { href: '/instructor/courses', label: '강습 관리' },
      { href: '/instructor/students', label: '학생 관리' },
      { href: '/instructor/schedule', label: '일정 관리' },
      { href: '/instructor/progress', label: '진도 관리' },
      { href: '/instructor/reviews', label: '업로드 리뷰' },
      { href: '/quiz', label: '퀴즈' },
      { href: '/ai-analysis', label: '🤖 AI 분석' },
      { href: '/health', label: '💪 건강관리' },
      { href: '/about', label: '소개' },
      { href: '/news', label: '공지사항' },
      { href: '/(labs)/animation', label: '애니메이션' },
      { href: '/shop', label: '상점' },
      { href: '/community', label: '커뮤니티' },
    ],
    centerAdmin: [
      { href: '/', label: '홈' },
      { href: '/admin/dashboard', label: '관리자 대시보드' },
      { href: '/admin/users', label: '사용자 관리' },
      { href: '/admin/courses', label: '강습 과정 관리' },
      { href: '/admin/bookings', label: '예약 관리' },
      { href: '/admin/payments', label: '결제 관리' },
      { href: '/admin/notices', label: '공지사항 관리' },
      { href: '/admin/teaching-methods', label: '강습법 관리' },
      { href: '/admin/lesson-plans', label: '강습 계획 관리' },
      { href: '/admin/quiz', label: '퀴즈 관리' },
      { href: '/admin/reports', label: '리포트' },
      { href: '/about', label: '소개' },
      { href: '/news', label: '공지사항' },
      { href: '/shop', label: '상점' },
      { href: '/community', label: '커뮤니티' },
    ],
    superAdmin: [
      { href: '/', label: '홈' },
      { href: '/admin/dashboard', label: '슈퍼 관리자 대시보드' },
      { href: '/admin/users', label: '사용자 관리' },
      { href: '/admin/centers', label: '센터 관리' },
      { href: '/admin/courses', label: '강습 과정 관리' },
      { href: '/admin/bookings', label: '예약 관리' },
      { href: '/admin/payments', label: '결제 관리' },
      { href: '/admin/notices', label: '공지사항 관리' },
      { href: '/admin/teaching-methods', label: '강습법 관리' },
      { href: '/admin/lesson-plans', label: '강습 계획 관리' },
      { href: '/admin/quiz', label: '퀴즈 관리' },
      { href: '/admin/ai-config', label: 'AI 설정' },
      { href: '/admin/reports', label: '리포트' },
      { href: '/about', label: '소개' },
      { href: '/news', label: '공지사항' },
      { href: '/shop', label: '상점' },
      { href: '/community', label: '커뮤니티' },
    ],
  };

        const currentMenu = filterMenuByPermissions(menuItems[user?.userType || 'guest'] || menuItems.guest, user?.userType || 'guest');

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl font-bold">🏊‍♂️</span>
              </div>
              <span className="text-xl font-bold text-gray-900">JJ Swim Lab</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-8">
            {currentMenu.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-gray-700 hover:text-blue-600 transition-colors font-medium ${
                  pathname === item.href ? 'text-blue-600 font-semibold' : ''
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* User Menu and Actions */}
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <div className="hidden md:flex items-center space-x-2">
                  <NotificationsBell />
                  <SmartNotifications userId={user?._id || ''} userType={user?.userType || 'guest'} />
                </div>
                <div className="hidden md:flex items-center space-x-2">
                  <span className="text-sm text-gray-700">{userName}님</span>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-gray-700 hover:text-red-600 transition-colors"
                  >
                    로그아웃
                  </button>
                </div>
              </>
            ) : (user?.userType || 'guest') === 'guest' ? (
              <div className="hidden md:flex items-center space-x-3">
                <Link
                  href="/auth/login"
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                >
                  로그인
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors font-medium"
                >
                  회원가입
                </Link>
              </div>
            ) : null}

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors"
              >
                {isMenuOpen ? (
                  <span className="text-2xl">✕</span>
                ) : (
                  <span className="text-2xl">☰</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t max-h-96 overflow-y-auto">
              {currentMenu.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors ${
                    pathname === item.href ? 'text-blue-600 font-semibold' : ''
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              
              {isLoggedIn ? (
                <div className="px-3 py-2 border-t border-gray-200">
                  <div className="text-sm text-gray-700 mb-2">
                    {userName}님 환영합니다
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <NotificationsBell />
                    <SmartNotifications userId={user?._id || ''} userType={user?.userType || 'guest'} />
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
                  >
                    로그아웃
                  </button>
                </div>
              ) : (user?.userType || 'guest') === 'guest' ? (
                <div className="px-3 py-2 border-t border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg mx-2 mb-2">
                  <div className="text-center text-sm text-gray-600 mb-3 py-2">
                    🎯 더 많은 기능을 체험해보세요!
                  </div>
                  <div className="space-y-2">
                    <Link 
                      href="/auth/login" 
                      className="block w-full text-center px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors bg-white rounded-md border hover:border-blue-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      🔑 로그인
                    </Link>
                    <Link 
                      href="/auth/signup" 
                      className="block w-full text-center px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      📝 회원가입
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 