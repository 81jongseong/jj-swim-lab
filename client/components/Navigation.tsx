'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import apiClient from '../utils/api';
import '../app/globals.css';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userType, setUserType] = useState<'guest' | 'member' | 'instructor' | 'admin'>('guest');
  const [userName, setUserName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // 로그인 상태 확인
    const token = localStorage.getItem('token');
    const storedUserType = localStorage.getItem('userType') as any;
    const storedUserName = localStorage.getItem('userName');

    if (token && storedUserType) {
      setIsLoggedIn(true);
      setUserType(storedUserType);
      setUserName(storedUserName || '');
    } else {
      setIsLoggedIn(false);
      setUserType('guest');
      setUserName('');
    }
  }, []);

  const handleLogout = () => {
    apiClient.logout();
    setIsLoggedIn(false);
    setUserType('guest');
    setUserName('');
    router.push('/');
  };

  const menuItems = {
    guest: [
      { href: '/', label: '홈' },
      { href: '/centers', label: '수영장 찾기' },
      { href: '/about', label: '소개' },
      { href: '/news', label: '공지사항' },
      { href: '/guide', label: '이용안내' },
      { href: '/auth/login', label: '로그인' },
      { href: '/auth/signup', label: '회원가입' },
    ],
    member: [
      { href: '/dashboard', label: '대시보드' },
      { href: '/courses', label: '강습 과정' },
      { href: '/bookings', label: '예약 관리' },
      { href: '/payments', label: '결제 내역' },
      { href: '/profile', label: '프로필' },
    ],
    instructor: [
      { href: '/instructor/dashboard', label: '강사 대시보드' },
      { href: '/instructor/courses', label: '강습 관리' },
      { href: '/instructor/students', label: '학생 관리' },
      { href: '/instructor/schedule', label: '일정 관리' },
      { href: '/instructor/progress', label: '진도 관리' },
      { href: '/profile', label: '프로필' },
    ],
    admin: [
      { href: '/admin/dashboard', label: '관리자 대시보드' },
      { href: '/admin/users', label: '사용자 관리' },
      { href: '/admin/courses', label: '강습 관리' },
      { href: '/admin/bookings', label: '예약 관리' },
      { href: '/admin/payments', label: '결제 관리' },
      { href: '/admin/notices', label: '공지사항 관리' },
    ],
  };

  const currentMenu = menuItems[userType];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <div className="text-xl font-bold text-primary">🏊‍♂️ JJ Swim Lab</div>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {currentMenu.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'text-primary underline'
                    : 'text-gray-700 hover:text-primary'
                }`}
              >
                {item.label}
              </Link>
            ))}
            
            {/* User Info & Logout */}
            {isLoggedIn && (
              <div className="flex items-center space-x-4 ml-4">
                <span className="text-sm text-gray-700">
                  {userName}님 환영합니다
                </span>
                <button
                  onClick={handleLogout}
                                            className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-error transition-colors"
                >
                  로그아웃
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">메뉴 열기</span>
              {isMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            {currentMenu.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                                          className={`block px-3 py-2 rounded-md text-base font-medium ${
                            pathname === item.href
                              ? 'text-primary underline'
                              : 'text-gray-700 hover:text-primary'
                          }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            
            {/* Mobile User Info & Logout */}
            {isLoggedIn && (
              <div className="px-3 py-2 border-t border-gray-200">
                <div className="text-sm text-gray-700 mb-2">
                  {userName}님 환영합니다
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                                                className="w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:text-error transition-colors"
                >
                  로그아웃
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
} 