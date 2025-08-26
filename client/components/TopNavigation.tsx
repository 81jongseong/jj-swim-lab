'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';

interface NavigationItem {
  name: string;
  href: string;
  icon: string;
  category: string;
}

interface NavigationGroup {
  title: string;
  icon: string;
  color: string;
  items: NavigationItem[];
}

export default function TopNavigation() {
  const { user } = useAuth();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // 클릭 외부에서 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 기본 네비게이션 메뉴 (모든 사용자)
  const baseNavigationItems = [
    { name: '홈', href: '/', icon: '🏠', category: 'main' },
    { name: '소개', href: '/about', icon: 'ℹ️', category: 'info' },
    { name: '커뮤니티', href: '/community', icon: '💬', category: 'social' },
  ];

  // 관리자 전용 메뉴
  const adminNavigationItems = [
    { name: '슈퍼 관리자 대시보드', href: '/admin/dashboard', icon: '🏠', category: 'dashboard' },
    { name: '사용자 관리', href: '/admin/users', icon: '👤', category: 'users' },
    { name: '센터별 사용자', href: '/admin/users/center-users', icon: '🏢', category: 'users' },
    { name: '센터 관리', href: '/admin/centers', icon: '🏢', category: 'centers' },
    { name: '센터별 레벨 관리', href: '/admin/center-levels', icon: '🎯', category: 'centers' },
    { name: '강습 과정 관리', href: '/admin/courses', icon: '📚', category: 'courses' },
    { name: '강습법 관리', href: '/admin/teaching-methods', icon: '📖', category: 'courses' },
    { name: '강습 계획 관리', href: '/admin/lesson-plans', icon: '📅', category: 'courses' },
    { name: '퀴즈 관리', href: '/admin/quiz', icon: '❓', category: 'learning' },
    { name: '학생 레벨 관리', href: '/admin/student-levels', icon: '👨‍🎓', category: 'learning' },
    { name: 'AI 설정', href: '/admin/ai-config', icon: '🤖', category: 'system' },
    { name: '공지 사항 관리', href: '/admin/notices', icon: '📢', category: 'system' },
    { name: '리포트', href: '/admin/reports', icon: '📊', category: 'system' },
    { name: '시스템 상태', href: '/admin/system', icon: '🔧', category: 'system' },
  ];

  // 사용자 권한에 따른 메뉴 필터링
  const getNavigationItems = () => {
    if (user?.userType === 'superAdmin') {
      return [...baseNavigationItems, ...adminNavigationItems];
    }
    if (user?.userType === 'centerAdmin') {
      // 센터 관리자는 일부 관리자 기능만 접근 가능
      const centerAdminItems = adminNavigationItems.filter(item => 
        !['슈퍼 관리자 대시보드', '센터 관리'].includes(item.name)
      );
      return [...baseNavigationItems, ...centerAdminItems];
    }
    if (user?.userType === 'instructor') {
      // 강사는 학생 레벨 관리만 접근 가능
      const instructorItems = adminNavigationItems.filter(item => 
        item.name === '학생 레벨 관리'
      );
      return [...baseNavigationItems, ...instructorItems];
    }
    // 일반 사용자는 기본 메뉴만
    return baseNavigationItems;
  };

  const currentNavigationItems = getNavigationItems();

  // 카테고리별로 메뉴 그룹화
  const groupNavigationItems = (items: any[]) => {
    const grouped = items.reduce((acc, item) => {
      const category = item.category || 'other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {});

    return grouped;
  };

  const groupedItems = groupNavigationItems(currentNavigationItems);

  // 카테고리별 제목과 스타일
  const getCategoryInfo = (category: string) => {
    const categoryMap: { [key: string]: { title: string; color: string; icon: string } } = {
      main: { title: '주요 기능', color: 'text-blue-600', icon: '⭐' },
      dashboard: { title: '대시보드', color: 'text-blue-600', icon: '📊' },
      users: { title: '사용자 관리', color: 'text-green-600', icon: '👥' },
      centers: { title: '센터 관리', color: 'text-purple-600', icon: '🏢' },
      courses: { title: '강습 관리', color: 'text-orange-600', icon: '🏊‍♂️' },
      learning: { title: '학습 도구', color: 'text-indigo-600', icon: '🎓' },
      system: { title: '시스템', color: 'text-gray-600', icon: '⚙️' },
      social: { title: '소셜', color: 'text-green-600', icon: '💬' },
      info: { title: '정보', color: 'text-gray-600', icon: 'ℹ️' },
      other: { title: '기타', color: 'text-gray-600', icon: '📋' }
    };
    return categoryMap[category] || categoryMap.other;
  };

  const handleDropdownToggle = (groupTitle: string) => {
    setActiveDropdown(activeDropdown === groupTitle ? null : groupTitle);
  };

  const closeAllDropdowns = () => {
    setActiveDropdown(null);
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 lg:px-6">
      <div className="flex items-center justify-between h-16">
        {/* 로고 */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">J</span>
            </div>
            <span className="font-bold text-xl text-gray-900">JJ Swim Lab</span>
          </Link>
        </div>

        {/* 데스크톱 네비게이션 */}
        <div ref={dropdownRef} className="hidden lg:flex items-center space-x-1">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category} className="relative">
              <button
                onClick={() => handleDropdownToggle(category)}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <span className="text-lg">{getCategoryInfo(category).icon}</span>
                <span>{getCategoryInfo(category).title}</span>
                <svg className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === category ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* 드롭다운 메뉴 */}
              {activeDropdown === category && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="py-2">
                    {(items as any[]).map((item: any) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={closeAllDropdowns}
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-150"
                      >
                        <span className="text-lg">{item.icon}</span>
                        <span>{item.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 사용자 정보 및 알림 */}
        <div className="flex items-center space-x-4">
          {/* 알림 */}
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </button>

          {/* 사용자 프로필 */}
          {user && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user.name?.charAt(0) || 'U'}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-700">{user.name}님</span>
            </div>
          )}
        </div>
      </div>

              {/* 모바일 메뉴 버튼 */}
        <div className="lg:hidden">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {isMobileMenuOpen && (
        <div ref={mobileMenuRef} className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="px-4 py-2 space-y-1">
            {Object.entries(groupedItems).map(([category, items]) => (
              <div key={category} className="py-2">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                  {getCategoryInfo(category).icon} {getCategoryInfo(category).title}
                </div>
                {(items as any[]).map((item: any) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-150"
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
