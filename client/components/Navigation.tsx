'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import NotificationsBell from './NotificationsBell';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [dropdownTimeout, setDropdownTimeout] = useState<NodeJS.Timeout | null>(null);
  const pathname = usePathname();
  const { user, logout, hasPermission, hasUserType } = useAuth();
  const isLoggedIn = !!user;
  const userName = user?.name || '';

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const openDropdown = (dropdownName: string) => {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
      setDropdownTimeout(null);
    }
    setActiveDropdown(dropdownName);
  };

  const closeDropdown = () => {
    const timeout = setTimeout(() => {
      setActiveDropdown(null);
    }, 150); // 150ms 지연으로 마우스가 메뉴로 이동할 시간 확보
    setDropdownTimeout(timeout);
  };

  const keepDropdownOpen = (dropdownName: string) => {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
      setDropdownTimeout(null);
    }
    setActiveDropdown(dropdownName);
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
      { href: '/guide', label: '📖 이용안내' },
      { href: '/news', label: '📢 공지사항' },
      { href: '/quiz', label: '🧠 퀴즈 체험' },
      { href: '/ai-analysis', label: '🤖 AI 분석 데모' },
      { href: '/health', label: '🏥 건강체크 체험' },
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
      { href: '/health', label: '🏥 건강체크' },
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
      { href: '/instructor/health/overview', label: '🏥 건강정보 관리' },
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
      { href: '/center-admin/health', label: '건강체크 관리' },
      { href: '/about', label: '소개' },
      { href: '/news', label: '공지사항' },
      { href: '/shop', label: '상점' },
      { href: '/community', label: '커뮤니티' },
    ],
    superAdmin: [
      { href: '/', label: '홈' },
      { href: '/admin/dashboard', label: '슈퍼 관리자 대시보드' },
      { href: '/admin/centers', label: '센터 관리' },
      { href: '/admin/users', label: '사용자 관리' },
      { href: '/admin/instructor-management', label: '강사 관리' },
      { href: '/admin/courses', label: '강습 과정 관리' },
      { href: '/admin/bookings', label: '예약 관리' },
      { href: '/admin/payments', label: '결제 관리' },
      { href: '/admin/notices', label: '공지사항 관리' },
      { href: '/admin/teaching-methods', label: '강습법 관리' },
      { href: '/admin/lesson-plans', label: '강습 계획 관리' },
      { href: '/admin/quiz', label: '퀴즈 관리' },
      { href: '/admin/ai-config', label: 'AI & 건강체크' },
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
        <div className="flex justify-between items-center h-16 min-w-0">
          {/* Logo and Brand */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                <img 
                  src="/icons/manifest-icon-192.maskable.png" 
                  alt="JJ Swim Lab" 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xl font-bold text-gray-900 leading-tight">JJ Swim Lab</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-4 relative min-w-0 flex-shrink-0">
            {/* 공통 메뉴 */}
            <Link href="/" className={`text-gray-700 hover:text-blue-600 transition-colors font-medium ${
              pathname === '/' ? 'text-blue-600 font-semibold' : ''
            }`}>
              🏠 홈
            </Link>
            <Link href="/about" className={`text-gray-700 hover:text-blue-600 transition-colors font-medium ${
              pathname === '/about' ? 'text-blue-600 font-semibold' : ''
            }`}>
              🏊‍♂️ 소개
            </Link>
                            <Link href="/guide" className={`text-gray-700 hover:text-blue-600 transition-colors font-medium ${
                  pathname === '/guide' ? 'text-blue-600 font-semibold' : ''
                }`}>
                  📖 이용안내
                </Link>
            <Link href="/news" className={`text-gray-700 hover:text-blue-600 transition-colors font-medium ${
              pathname === '/news' ? 'text-blue-600 font-semibold' : ''
            }`}>
              📢 공지사항
            </Link>
            
            {/* 게스트 전용 메뉴 */}
            {!user && (
              <>
                <span className="text-gray-300">|</span>
                <Link href="/quiz" className={`text-gray-700 hover:text-blue-600 transition-colors font-medium ${
                  pathname === '/quiz' ? 'text-blue-600 font-semibold' : ''
                }`}>
                  🧠 퀴즈 체험
                </Link>
                <Link href="/ai-analysis" className={`text-gray-700 hover:text-blue-600 transition-colors font-medium ${
                  pathname === '/ai-analysis' ? 'text-blue-600 font-semibold' : ''
                }`}>
                  🤖 AI 분석 데모
                </Link>
                <Link href="/health" className={`text-gray-700 hover:text-blue-600 transition-colors font-medium ${
                  pathname === '/health' ? 'text-blue-600 font-semibold' : ''
                }`}>
                  🏥 건강체크 체험
                </Link>
                <Link href="/(labs)/animation" className={`text-gray-700 hover:text-blue-600 transition-colors font-medium ${
                  pathname === '/(labs)/animation' ? 'text-blue-600 font-semibold' : ''
                }`}>
                  🎬 애니메이션
                </Link>
                <span className="text-gray-300">|</span>
                <Link href="/community" className={`text-gray-700 hover:text-blue-600 transition-colors font-medium ${
                  pathname === '/community' ? 'text-blue-600 font-semibold' : ''
                }`}>
                  💬 커뮤니티
                </Link>
                <Link href="/shop" className={`text-gray-700 hover:text-blue-600 transition-colors font-medium ${
                  pathname === '/shop' ? 'text-blue-600 font-semibold' : ''
                }`}>
                  🛍️ 상점
                </Link>
                <Link href="/map" className={`text-gray-700 hover:text-blue-600 transition-colors font-medium ${
                  pathname === '/map' ? 'text-blue-600 font-semibold' : ''
                }`}>
                  🗺️ 지도
                </Link>
                <span className="text-gray-300">|</span>
                <Link href="/auth/login" className={`text-gray-700 hover:text-blue-600 transition-colors font-medium ${
                  pathname === '/auth/login' ? 'text-blue-600 font-semibold' : ''
                }`}>
                  🔑 로그인
                </Link>
                <Link href="/auth/signup" className={`text-gray-700 hover:text-blue-600 transition-colors font-medium ${
                  pathname === '/auth/signup' ? 'text-blue-600 font-semibold' : ''
                }`}>
                  📝 회원가입
                </Link>
              </>
            )}
            
            {/* 학생 전용 메뉴 */}
            {user?.userType === 'student' && (
              <>
                <span className="text-gray-300">|</span>
                <div className="relative group">
                  <button
                    className={`text-gray-700 hover:text-blue-600 transition-colors font-medium flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-gray-50 ${
                      pathname.startsWith('/dashboard') ? 'text-blue-600 font-semibold bg-blue-50' : ''
                    }`}
                    onMouseEnter={() => openDropdown('dashboard')}
                    onMouseLeave={closeDropdown}
                  >
                    <span>📊 대시보드</span>
                    <span className="text-xs ml-1">▼</span>
                  </button>
                  {activeDropdown === 'dashboard' && (
                    <div 
                      className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-2xl z-[9999] min-w-max overflow-hidden"
                      onMouseEnter={() => keepDropdownOpen('dashboard')}
                      onMouseLeave={closeDropdown}
                    >
                      <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                        📊 메인 대시보드
                      </Link>
                      <Link href="/dashboard/checklist" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                        ✅ 체크리스트
                      </Link>
                      <Link href="/dashboard/progress" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                        📈 진행상황
                      </Link>
                    </div>
                  )}
                </div>
                <Link href="/courses" className={`text-gray-700 hover:text-blue-600 transition-colors font-medium ${
                  pathname === '/courses' ? 'text-blue-600 font-semibold' : ''
                }`}>
                  📚 내 강의
                </Link>
                <div className="relative group">
                  <button
                    className={`text-gray-700 hover:text-blue-600 transition-colors font-medium flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-gray-50 ${
                      pathname.startsWith('/health') ? 'text-blue-600 font-semibold bg-blue-50' : ''
                    }`}
                    onMouseEnter={() => openDropdown('health')}
                    onMouseLeave={closeDropdown}
                  >
                    <span>🏥 건강체크</span>
                    <span className="text-xs ml-1">▼</span>
                  </button>
                  {activeDropdown === 'health' && (
                    <div 
                      className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-2xl z-[9999] min-w-max overflow-hidden"
                      onMouseEnter={() => keepDropdownOpen('health')}
                      onMouseLeave={closeDropdown}
                    >
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 bg-gray-50">
                        🏥 건강 관리
                      </div>
                      <Link href="/health" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        🏥 건강상태 관리
                      </Link>
                      <Link href="/health/privacy" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        🔒 공개 설정
                      </Link>
                      
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 mt-2 bg-gray-50">
                        📊 운동 & AI
                      </div>
                      <Link href="/health/exercise" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        📊 운동 기록
                      </Link>
                      <Link href="/health/ai-training" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        🤖 AI 훈련
                      </Link>
                    </div>
                  )}
                </div>
                <span className="text-gray-300">|</span>
                <Link href="/community" className={`text-gray-700 hover:text-blue-600 transition-colors font-medium ${
                  pathname === '/community' ? 'text-blue-600 font-semibold' : ''
                }`}>
                  💬 커뮤니티
                </Link>
                <Link href="/shop" className={`text-gray-700 hover:text-blue-600 transition-colors font-medium ${
                  pathname === '/shop' ? 'text-blue-600 font-semibold' : ''
                }`}>
                  🛍️ 상점
                </Link>
                <Link href="/map" className={`text-gray-700 hover:text-blue-600 transition-colors font-medium ${
                  pathname === '/map' ? 'text-blue-600 font-semibold' : ''
                }`}>
                  🗺️ 지도
                </Link>
                <span className="text-gray-300">|</span>
                <Link href="/profile" className={`text-gray-700 hover:text-blue-600 transition-colors font-medium ${
                  pathname === '/profile' ? 'text-blue-600 font-semibold' : ''
                }`}>
                  👤 프로필
                </Link>
              </>
            )}
            
            {/* 강사 전용 메뉴 */}
            {user?.userType === 'instructor' && (
              <>
                <span className="text-gray-300">|</span>
                <div className="relative group">
                  <button
                    className={`text-gray-700 hover:text-blue-600 transition-colors font-medium flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-gray-50 ${
                      pathname.startsWith('/instructor/dashboard') ? 'text-blue-600 font-semibold bg-blue-50' : ''
                    }`}
                    onMouseEnter={() => openDropdown('instructor-dashboard')}
                    onMouseLeave={closeDropdown}
                  >
                    <span>📊 강사 대시보드</span>
                    <span className="text-xs ml-1">▼</span>
                  </button>
                  {activeDropdown === 'instructor-dashboard' && (
                    <div 
                      className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-2xl z-[9999] min-w-max overflow-hidden"
                      onMouseEnter={() => keepDropdownOpen('instructor-dashboard')}
                      onMouseLeave={closeDropdown}
                    >
                      <Link href="/instructor/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                        📊 메인 대시보드
                      </Link>
                      <Link href="/instructor/students" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                        👥 수강생 관리
                      </Link>
                      <Link href="/instructor/courses" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                        📚 강의 관리
                      </Link>
                      <Link href="/instructor/checklist" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                        ✅ 체크리스트 관리
                      </Link>
                      <Link href="/instructor/progress" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                        📈 진행상황 관리
                      </Link>
                    </div>
                  )}
                </div>
                <div className="relative group">
                  <button
                    className={`text-gray-700 hover:text-blue-600 transition-colors font-medium flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-gray-50 ${
                      pathname.startsWith('/instructor/health') ? 'text-blue-600 font-semibold bg-blue-50' : ''
                    }`}
                    onMouseEnter={() => openDropdown('instructor-health')}
                    onMouseLeave={closeDropdown}
                  >
                    <span>🏥 건강정보 관리</span>
                    <span className="text-xs ml-1">▼</span>
                  </button>
                  {activeDropdown === 'instructor-health' && (
                    <div 
                      className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-52 bg-white border border-gray-200 rounded-lg shadow-2xl z-[9999] min-w-max overflow-hidden"
                      onMouseEnter={() => keepDropdownOpen('instructor-health')}
                      onMouseLeave={closeDropdown}
                    >
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 bg-gray-50">
                        📊 전체 현황
                      </div>
                      <Link href="/instructor/health/overview" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        📊 전체 건강 현황
                      </Link>
                      <Link href="/instructor/health/statistics" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-600 transition-colors">
                        📈 건강 통계
                      </Link>
                      
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 mt-2 bg-gray-50">
                        👥 학생 관리
                      </div>
                      <Link href="/instructor/health/students" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        👥 학생별 건강정보
                      </Link>
                      <Link href="/instructor/health/recommendations" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        💡 맞춤형 운동 추천
                      </Link>
                      <Link href="/instructor/health/progress" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        📈 진행상황 추적
                      </Link>
                    </div>
                  )}
                </div>
                <span className="text-gray-300">|</span>
                <Link href="/community" className={`text-gray-700 hover:text-blue-600 transition-colors font-medium ${
                  pathname === '/community' ? 'text-blue-600 font-semibold' : ''
                }`}>
                  💬 커뮤니티
                </Link>
                <Link href="/shop" className={`text-gray-700 hover:text-blue-600 transition-colors font-medium ${
                  pathname === '/shop' ? 'text-blue-600 font-semibold' : ''
                }`}>
                  🛍️ 상점
                </Link>
                <Link href="/map" className={`text-gray-700 hover:text-blue-600 transition-colors font-medium ${
                  pathname === '/map' ? 'text-blue-600 font-semibold' : ''
                }`}>
                  🗺️ 지도
                </Link>
                <span className="text-gray-300">|</span>
                <Link href="/profile" className={`text-gray-700 hover:text-blue-600 transition-colors font-medium ${
                  pathname === '/profile' ? 'text-blue-600 font-semibold' : ''
                }`}>
                  👤 프로필
                </Link>
              </>
            )}
            
            {/* 센터 관리자 전용 메뉴 */}
            {user?.userType === 'centerAdmin' && (
              <>
                <span className="text-gray-300">|</span>
                <div className="relative group">
                  <button
                    className={`text-gray-700 hover:text-blue-600 transition-colors font-medium flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-gray-50 ${
                      pathname.startsWith('/admin/dashboard') ? 'text-blue-600 font-semibold bg-blue-50' : ''
                    }`}
                    onMouseEnter={() => openDropdown('admin-dashboard')}
                    onMouseLeave={closeDropdown}
                  >
                    <span>📊 센터 대시보드</span>
                    <span className="text-xs ml-1">▼</span>
                  </button>
                  {activeDropdown === 'admin-dashboard' && (
                    <div 
                      className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-2xl z-[9999] min-w-max overflow-hidden"
                      onMouseEnter={() => keepDropdownOpen('admin-dashboard')}
                      onMouseLeave={closeDropdown}
                    >
                      <Link href="/admin/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                        📊 메인 대시보드
                      </Link>
                      <Link href="/admin/users" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                        👥 회원 관리
                      </Link>
                      <Link href="/admin/instructors" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                        👨‍🏫 강사 관리
                      </Link>
                      <Link href="/admin/courses" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                        📚 강의 관리
                      </Link>
                      <Link href="/admin/payments" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                        💰 결제 관리
                      </Link>
                      <Link href="/admin/reports" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                        📊 통계
                      </Link>
                      <Link href="/admin/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                        ⚙️ 설정
                      </Link>
                    </div>
                  )}
                </div>
                <div className="relative group">
                  <button
                    className={`text-gray-700 hover:text-blue-600 transition-colors font-medium flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-gray-50 ${
                      pathname.startsWith('/center-admin/health') ? 'text-blue-600 font-semibold bg-blue-50' : ''
                    }`}
                    onMouseEnter={() => openDropdown('center-health')}
                    onMouseLeave={closeDropdown}
                  >
                    <span>🏥 건강체크</span>
                    <span className="text-xs ml-1">▼</span>
                  </button>
                  {activeDropdown === 'center-health' && (
                    <div 
                      className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-52 bg-white border border-gray-200 rounded-lg shadow-2xl z-[9999] min-w-max overflow-hidden"
                      onMouseEnter={() => keepDropdownOpen('center-health')}
                      onMouseLeave={closeDropdown}
                    >
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 bg-gray-50">
                        📊 센터 현황
                      </div>
                      <Link href="/center-admin/health" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        📊 센터 건강 현황
                      </Link>
                      <Link href="/center-admin/health/statistics" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        📈 건강 통계
                      </Link>
                      
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 mt-2 bg-gray-50">
                        👥 회원 관리
                      </div>
                      <Link href="/center-admin/health/members" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        👥 회원 건강정보
                      </Link>
                      <Link href="/center-admin/health/programs" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        🏊‍♂️ 건강 프로그램
                      </Link>
                    </div>
                  )}
                </div>
                <span className="text-gray-300">|</span>
                <Link href="/community" className={`text-gray-700 hover:text-blue-600 transition-colors font-medium ${
                  pathname === '/community' ? 'text-blue-600 font-semibold' : ''
                }`}>
                  💬 커뮤니티
                </Link>
                <Link href="/shop" className={`text-gray-700 hover:text-blue-600 transition-colors font-medium ${
                  pathname === '/shop' ? 'text-blue-600 font-semibold' : ''
                }`}>
                  🛍️ 상점
                </Link>
                <Link href="/map" className={`text-gray-700 hover:text-blue-600 transition-colors font-medium ${
                  pathname === '/map' ? 'text-blue-600 font-semibold' : ''
                }`}>
                  🗺️ 지도
                </Link>
              </>
            )}
            
            {/* 최고 관리자 전용 메뉴 */}
            {user?.userType === 'superAdmin' && (
              <>
                <span className="text-gray-300">|</span>
                <div className="relative group">
                  <button
                    className={`text-gray-700 hover:text-blue-600 transition-colors font-medium flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-gray-50 ${
                      pathname.startsWith('/admin/dashboard') ? 'text-blue-600 font-semibold bg-blue-50' : ''
                    }`}
                    onMouseEnter={() => openDropdown('super-admin-dashboard')}
                    onMouseLeave={closeDropdown}
                  >
                    <span>📊 최고관리자 대시보드</span>
                    <span className="text-xs ml-1">▼</span>
                  </button>
                  {activeDropdown === 'super-admin-dashboard' && (
                    <div 
                      className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-2xl z-[9999] min-w-max overflow-hidden"
                      onMouseEnter={() => keepDropdownOpen('super-admin-dashboard')}
                      onMouseLeave={closeDropdown}
                    >
                      <Link href="/admin/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                        📊 메인 대시보드
                      </Link>
                      <Link href="/admin/centers" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                        🏢 센터 관리
                      </Link>
                      <Link href="/admin/users" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                        👥 전체 회원 관리
                      </Link>
                      <Link href="/admin/instructors" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                        👨‍🏫 전체 강사 관리
                      </Link>
                      <Link href="/admin/instructor-management" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                        📊 강사 상세 관리
                      </Link>
                      <Link href="/admin/courses" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                        📚 전체 강의 관리
                      </Link>
                      <Link href="/admin/payments" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                        💰 전체 결제 관리
                      </Link>
                      <Link href="/admin/reports" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                        📊 전체 통계
                      </Link>
                      <Link href="/admin/system" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                        ⚙️ 시스템 설정
                      </Link>
                    </div>
                  )}
                </div>
                <div className="relative group">
                  <button
                    className={`text-gray-700 hover:text-blue-600 transition-colors font-medium flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-gray-50 ${
                      pathname.startsWith('/admin/ai-config') || pathname.startsWith('/admin/health') ? 'text-blue-600 font-semibold bg-blue-50' : ''
                    }`}
                    onMouseEnter={() => openDropdown('ai-health')}
                    onMouseLeave={closeDropdown}
                  >
                    <span>🤖 AI & 건강체크</span>
                    <span className="text-xs ml-1">▼</span>
                  </button>
                  {activeDropdown === 'ai-health' && (
                    <div 
                      className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-2xl z-[9999] min-w-max overflow-hidden"
                      onMouseEnter={() => keepDropdownOpen('ai-health')}
                      onMouseLeave={closeDropdown}
                    >
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 bg-gray-50">
                        🤖 AI 시스템
                      </div>
                      <Link href="/admin/ai-config" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        ⚙️ AI 시스템 설정
                      </Link>
                      <Link href="/admin/ai-config/recommendations" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        💡 운동량 추천 알고리즘
                      </Link>
                      
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 mt-2 bg-gray-50">
                        🏥 건강체크 관리
                      </div>
                      <Link href="/admin/health" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        📊 전체 건강 현황
                      </Link>
                      <Link href="/admin/health/standards" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        📊 건강체크 기준
                      </Link>
                      <Link href="/admin/health/privacy" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        🔒 공개/비공개 설정
                      </Link>
                      <Link href="/admin/health/ai-settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        🤖 AI 설정
                      </Link>
                      <Link href="/admin/health/statistics" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        📈 건강 통계
                      </Link>
                    </div>
                  )}
                </div>
                <span className="text-gray-300">|</span>
                <Link href="/community" className={`text-gray-700 hover:text-blue-600 transition-colors font-medium ${
                  pathname === '/community' ? 'text-blue-600 font-semibold' : ''
                }`}>
                  💬 커뮤니티
                </Link>
                <Link href="/shop" className={`text-gray-700 hover:text-blue-600 transition-colors font-medium ${
                  pathname === '/shop' ? 'text-blue-600 font-semibold' : ''
                }`}>
                  🛍️ 상점
                </Link>
                <Link href="/map" className={`text-gray-700 hover:text-blue-600 transition-colors font-medium ${
                  pathname === '/map' ? 'text-blue-600 font-semibold' : ''
                }`}>
                  🗺️ 지도
                </Link>
              </>
            )}
          </div>

          {/* User Menu and Actions */}
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <div className="hidden md:flex items-center space-x-4 flex-nowrap">
                  <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg flex-shrink-0">
                    <NotificationsBell />
                  </div>
                  <div className="flex items-center space-x-3 bg-blue-50 px-4 py-2 rounded-lg whitespace-nowrap flex-shrink-0">
                    <span className="text-sm font-medium text-gray-800">{userName}님</span>
                    <span className="text-xs text-gray-500">|</span>
                    <button
                      onClick={handleLogout}
                      className="text-sm text-gray-700 hover:text-red-600 transition-colors font-medium"
                    >
                      로그아웃
                    </button>
                  </div>
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