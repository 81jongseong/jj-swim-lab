'use client';

import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';

export default function SimpleNavigation() {
  const { user } = useAuth();

  // 기본 메뉴 (모든 사용자)
  const baseMenu = [
    { href: '/', label: '홈' },
    { href: '/about', label: '소개' },
    { href: '/community', label: '커뮤니티' },
  ];

  // 로그인한 사용자용 메뉴
  const userMenu = [
    { href: '/dashboard', label: '대시보드' },
    { href: '/courses', label: '강습 과정' },
    { href: '/quiz', label: '퀴즈' },
  ];

  // 관리자용 메뉴
  const adminMenu = [
    { href: '/admin/dashboard', label: '관리자 대시보드' },
    { href: '/admin/users', label: '사용자 관리' },
    { href: '/admin/teaching-methods', label: '강습법 관리' },
  ];

  const getMenuItems = () => {
    if (user?.userType === 'superAdmin') {
      return [...baseMenu, ...adminMenu];
    }
    if (user?.userType === 'centerAdmin') {
      return [...baseMenu, ...userMenu, ...adminMenu.filter(item => 
        !['관리자 대시보드'].includes(item.label)
      )];
    }
    if (user?.userType === 'instructor') {
      return [...baseMenu, ...userMenu];
    }
    if (user?.userType === 'student') {
      return [...baseMenu, ...userMenu];
    }
    return baseMenu;
  };

  const currentMenu = getMenuItems();

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고 및 브랜드 */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">J</span>
              </div>
              <span className="text-xl font-bold text-gray-900">JJ Swim Lab</span>
            </Link>
          </div>

          {/* 데스크톱 네비게이션 */}
          <div className="hidden lg:flex lg:items-center lg:space-x-6">
            {currentMenu.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-3 py-2 rounded-md hover:bg-gray-50"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* 사용자 메뉴 및 액션 */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">{user.name}님</span>
                <button className="text-sm text-gray-700 hover:text-red-600 transition-colors">
                  로그아웃
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
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
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
