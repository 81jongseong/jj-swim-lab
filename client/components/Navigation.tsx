'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import '../app/globals.css';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userType, setUserType] = useState<'guest' | 'member' | 'instructor' | 'admin'>('guest');
  const pathname = usePathname();

  const menuItems = {
    guest: [
      { href: '/', label: '홈' },
      { href: '/about', label: '소개' },
      { href: '/news', label: '공지사항' },
      { href: '/guide', label: '이용안내' },
      { href: '/auth/login', label: '로그인' },
      { href: '/auth/signup', label: '회원가입' },
    ],
    member: [
      { href: '/dashboard', label: '대시보드' },
      { href: '/progress', label: '진도표' },
      { href: '/training', label: '훈련추천' },
      { href: '/quiz', label: '모의고사' },
      { href: '/shop', label: '쇼핑몰' },
      { href: '/profile', label: '프로필' },
    ],
    instructor: [
      { href: '/instructor/dashboard', label: '강사 대시보드' },
      { href: '/instructor/lessons', label: '레슨 관리' },
      { href: '/instructor/evaluation', label: '회원 평가' },
      { href: '/instructor/feedback', label: '피드백' },
      { href: '/quiz', label: '모의고사' },
    ],
    admin: [
      { href: '/admin/dashboard', label: '관리자 대시보드' },
      { href: '/admin/centers', label: '센터 관리' },
      { href: '/admin/programs', label: '프로그램 관리' },
      { href: '/admin/instructors', label: '강사 관리' },
      { href: '/admin/content', label: '콘텐츠 관리' },
      { href: '/admin/statistics', label: '통계' },
    ],
  };

  const currentMenu = menuItems[userType];

  return (
    <nav className="bg-white shadow-lg fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <div className="text-2xl font-bold text-blue-600">🏊‍♂️ JJ Swim Lab</div>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {currentMenu.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
            
            {/* User Type Selector */}
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value as any)}
              className="ml-4 px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="guest">게스트</option>
              <option value="member">회원</option>
              <option value="instructor">강사</option>
              <option value="admin">관리자</option>
            </select>
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
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            
            <div className="px-3 py-2">
              <select
                value={userType}
                onChange={(e) => setUserType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="guest">게스트</option>
                <option value="member">회원</option>
                <option value="instructor">강사</option>
                <option value="admin">관리자</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
} 