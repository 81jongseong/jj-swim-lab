'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';

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
    { name: '대시보드', href: '/dashboard', icon: '📊' },
    { name: '강습 과정', href: '/courses', icon: '🏊‍♂️' },
    { name: '예약 관리', href: '/bookings', icon: '📅' },
    { name: '진도 관리', href: '/progress', icon: '📈' },
    { name: '결제 내역', href: '/payments', icon: '💳' },
    { name: '커뮤니티', href: '/community', icon: '💬' },
    { name: 'AI 분석', href: '/ai-analysis', icon: '🤖' },
    { name: '퀴즈', href: '/quiz', icon: '❓' },
    { name: '센터 정보', href: '/about', icon: 'ℹ️' },
  ];

  const adminNavigationItems = [
    { name: '사용자 관리', href: '/admin/users', icon: '👥' },
    { name: '강습법 관리', href: '/admin/teaching-methods', icon: '📚' },
    { name: 'AI 설정', href: '/admin/ai-config', icon: '⚙️' },
    { name: '시스템 상태', href: '/admin/system', icon: '🔧' },
  ];

  const getNavigationItems = () => {
    if (user?.userType === 'superAdmin') {
      return [...navigationItems, ...adminNavigationItems];
    }
    if (user?.userType === 'centerAdmin') {
      return [...navigationItems, ...adminNavigationItems.slice(0, 2)];
    }
    if (user?.userType === 'instructor') {
      return navigationItems.filter(item => 
        !['결제 내역', 'AI 분석'].includes(item.name)
      );
    }
    return navigationItems.filter(item => 
      !['결제 내역', 'AI 분석', '사용자 관리'].includes(item.name)
    );
  };

  const currentNavigationItems = getNavigationItems();

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* 사이드바 */}
        {showSidebar && (
          <aside className={`
            fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}>
            <div className="flex flex-col h-full">
              {/* 로고 및 브랜드 */}
              <div className="flex items-center justify-between h-16 px-6 border-b border-border">
                <Link href="/" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">J</span>
                  </div>
                  <span className="font-bold text-xl text-foreground">JJ Swim Lab</span>
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
              <div className="px-6 py-4 border-b border-border">
                {user ? (
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-semibold text-lg">
                        {user.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate capitalize">
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
              <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                {currentNavigationItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
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

      {/* 모바일 헤더 */}
      {showSidebar && (
        <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-md hover:bg-muted"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">J</span>
              </div>
              <span className="font-bold text-xl text-foreground">JJ Swim Lab</span>
            </Link>
            <div className="w-10"></div>
          </div>
        </header>
      )}
    </div>
  );
}
