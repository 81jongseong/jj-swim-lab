'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import TopNavigation from './TopNavigation';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
  showSidebar?: boolean;
}

export default function DashboardLayout({
  children,
  title,
  subtitle,
  breadcrumbs,
  actions,
  showSidebar = true
}: DashboardLayoutProps) {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const navigationItems = [
    { name: '대시보드', href: '/dashboard', icon: '📊', category: 'main' },
    { name: '강습 과정', href: '/courses', icon: '🏊‍♂️', category: 'main' },
    { name: '예약 관리', href: '/bookings', icon: '📅', category: 'main' },
    { name: '진도 관리', href: '/progress', icon: '📈', category: 'main' },
    { name: '결제 내역', href: '/payments', icon: '💳', category: 'main' },
    { name: '커뮤니티', href: '/community', icon: '💬', category: 'social' },
    { name: 'AI 분석', href: '/ai-analysis', icon: '🤖', category: 'ai' },
    { name: '퀴즈', href: '/quiz', icon: '❓', category: 'learning' },
    { name: '센터 정보', href: '/about', icon: 'ℹ️', category: 'info' },
  ];

  const adminNavigationItems = [
    { name: '사용자 관리', href: '/admin/users', icon: '👥', category: 'admin' },
    { name: '강습법 관리', href: '/admin/teaching-methods', icon: '📚', category: 'admin' },
    { name: '센터별 레벨 관리', href: '/admin/center-levels', icon: '🎯', category: 'admin' },
    { name: '학생 레벨 관리', href: '/admin/student-levels', icon: '👨‍🎓', category: 'admin' },
    { name: 'AI 설정', href: '/admin/ai-config', icon: '⚙️', category: 'admin' },
    { name: '시스템 상태', href: '/admin/system', icon: '🔧', category: 'admin' },
  ];

  const getNavigationItems = () => {
    if (user?.userType === 'superAdmin') {
      return [...navigationItems, ...adminNavigationItems];
    }
    if (user?.userType === 'centerAdmin') {
      return [...navigationItems, ...adminNavigationItems.slice(0, 4)];
    }
    if (user?.userType === 'instructor') {
      const instructorItems = navigationItems.filter(item => 
        !['결제 내역', 'AI 분석'].includes(item.name)
      );
      // 강사도 학생 레벨 관리에 접근 가능
      return [...instructorItems, { name: '학생 레벨 관리', href: '/admin/student-levels', icon: '👨‍🎓' }];
    }
    return navigationItems.filter(item => 
      !['결제 내역', 'AI 분석', '사용자 관리'].includes(item.name)
    );
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
      admin: { title: '관리자 도구', color: 'text-purple-600', icon: '🔧' },
      social: { title: '소셜', color: 'text-green-600', icon: '💬' },
      ai: { title: 'AI 서비스', color: 'text-orange-600', icon: '🤖' },
      learning: { title: '학습 도구', color: 'text-indigo-600', icon: '📚' },
      info: { title: '정보', color: 'text-gray-600', icon: 'ℹ️' },
      other: { title: '기타', color: 'text-gray-600', icon: '📋' }
    };
    return categoryMap[category] || categoryMap.other;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 새로운 상단 네비게이션 */}
      <TopNavigation />
      
      <div className="flex h-screen">
        {/* 사이드바 */}
        {showSidebar && (
          <aside className={`
            fixed inset-y-0 left-0 z-40 w-72 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}>
            <div className="flex flex-col h-full">
              {/* 로고 및 브랜드 */}
              <div className="flex items-center justify-between h-16 px-6 border-b border-border bg-gradient-to-r from-blue-600 to-indigo-700">
                <Link href="/" className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-blue-600 font-bold text-xl">J</span>
                  </div>
                  <span className="font-bold text-xl text-white">JJ Swim Lab</span>
                </Link>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="lg:hidden p-2 rounded-md hover:bg-muted"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* 사용자 정보 */}
              <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-blue-50 to-indigo-50">
                {user ? (
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg">
                        {user.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-600 truncate capitalize">
                        {user.userType || 'user'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-muted/50 rounded-lg p-2">
                    <p className="text-xs text-muted-foreground text-center">v1.0.0</p>
                  </div>
                )}
              </div>

              {/* 네비게이션 메뉴 */}
              <nav className="flex-1 px-4 py-4 space-y-6 overflow-y-auto">
                {Object.entries(groupedItems).map(([category, items]) => (
                  <div key={category} className="space-y-2">
                    {/* 카테고리 제목 */}
                    <div className="flex items-center space-x-2 px-3 py-2">
                      <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                        {getCategoryInfo(category).icon} {getCategoryInfo(category).title}
                      </span>
                    </div>
                    
                    {/* 카테고리별 메뉴 아이템들 */}
                    <div className="space-y-1">
                      {(items as any[]).map((item: any) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200 group"
                        >
                          <span className="text-lg group-hover:scale-110 transition-transform duration-200">
                            {item.icon}
                          </span>
                          <span className="group-hover:font-semibold transition-all duration-200">
                            {item.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </nav>

              {/* 하단 정보 */}
              <div className="px-6 py-4 border-t border-border">
                <div className="text-xs text-muted-foreground text-center">
                  <p>JJ Swim Lab v1.0.0</p>
                  <p className="mt-1">© 2024 All rights reserved</p>
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* 메인 콘텐츠 */}
        <main className="flex-1 min-w-0 overflow-hidden">
          {/* 페이지 헤더 */}
          {(title || breadcrumbs) && (
            <div className="bg-card border-b border-border px-6 py-6">
              <div className="container mx-auto">
                {/* 브레드크럼 */}
                {breadcrumbs && (
                  <nav className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                    {breadcrumbs.map((crumb, index) => (
                      <React.Fragment key={index}>
                        {index > 0 && (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                        {crumb.href ? (
                          <Link
                            href={crumb.href}
                            className="hover:text-foreground transition-colors"
                          >
                            {crumb.label}
                          </Link>
                        ) : (
                          <span className="text-foreground font-medium">{crumb.label}</span>
                        )}
                      </React.Fragment>
                    ))}
                  </nav>
                )}

                {/* 페이지 제목 및 액션 */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    {title && (
                      <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2 truncate">{title}</h1>
                    )}
                    {subtitle && (
                      <p className="text-base lg:text-lg text-muted-foreground truncate">{subtitle}</p>
                    )}
                  </div>
                  {actions && (
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {actions}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 페이지 콘텐츠 */}
          <div className="p-6 overflow-auto h-full">
            <div className="container mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* 모바일 오버레이 */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 모바일 메뉴 버튼은 TopNavigation에서 처리 */}
    </div>
  );
}
