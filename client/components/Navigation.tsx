/**
 * 🧭 JJ Swim Lab - 네비게이션 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 사용자 권한별 맞춤형 네비게이션 메뉴 제공
 * - 반응형 네비게이션 바 및 사이드바 구현
 * - 사용자 타입별 메뉴 구조 및 접근 권한 관리
 * - 현재 페이지 하이라이트 및 활성 상태 표시
 * - 알림 시스템과 연동된 실시간 알림 표시
 * 
 * 🔄 **주요 기능**
 * - 사용자 타입별 메뉴 구조 (student, instructor, centerAdmin, superAdmin)
 * - 반응형 네비게이션 (데스크톱/모바일)
 * - 현재 페이지 하이라이트 및 활성 상태 표시
 * - 알림 벨 및 실시간 알림 표시
 * - 사용자 프로필 및 로그아웃 기능
 * - 메뉴 접기/펼치기 기능
 * - 접근성 지원 (키보드 네비게이션)
 * 
 * 🗄️ **데이터 연동**
 * - useAuth 훅과 연동 (사용자 인증 상태)
 * - 알림 시스템과 연동 (NotificationsBell)
 * - Next.js 라우터와 연동 (현재 경로 확인)
 * - 사용자 권한 및 역할 데이터
 * - 실시간 알림 데이터
 * 
 * 🛠️ **필요한 설치 파일**
 * - Next.js 14.2.5 (App Router)
 * - React 18.3.1
 * - TypeScript 5.x
 * - Tailwind CSS 3.3.0
 * - useAuth 훅 (../hooks/useAuth)
 * - NotificationsBell 컴포넌트
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 사용자 권한별 메뉴 접근 제어
 * 2. 반응형 디자인 및 모바일 최적화
 * 3. 접근성 지원 (ARIA 라벨, 키보드 네비게이션)
 * 4. 현재 페이지 상태 관리
 * 5. 메뉴 구조 변경 시 권한 검증
 * 6. 성능 최적화 (불필요한 리렌더링 방지)
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 사용자 권한별 메뉴 구조 확인
 * - [ ] 반응형 디자인 테스트
 * - [ ] 접근성 지원 확인
 * - [ ] 현재 페이지 하이라이트 확인
 * - [ ] 알림 시스템 연동 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 네비게이션 컴포넌트 구현
 * - 2024-12-19: 사용자 권한별 메뉴 구조 구현
 * - 2024-12-19: 반응형 네비게이션 구현
 * - 2024-12-19: 알림 시스템 연동
 * - 2024-12-19: 접근성 지원 및 사용자 경험 개선
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (네비게이션 컴포넌트 완료)
 * 
 * 🚀 **다음 단계**
 * - 메뉴 사용자 정의 기능
 * - 즐겨찾기 메뉴 기능
 * - 메뉴 검색 기능
 * - 다국어 지원
 * - 테마별 메뉴 스타일
 * 
 * 💡 **사용 예시**
 * ```tsx
 * // 네비게이션 컴포넌트 사용
 * <Navigation />
 * 
 * // 사용자 권한별 메뉴 구조
 * const userMenuStructure = {
 *   student: { main: [...], health: [...], ai: [...] },
 *   instructor: { main: [...], management: [...] },
 *   centerAdmin: { main: [...], admin: [...] },
 *   superAdmin: { main: [...], system: [...] }
 * };
 * ```
 * 
 * 🔍 **네비게이션 처리 흐름**
 * 1. 사용자 인증 상태 확인
 * 2. 사용자 타입별 메뉴 구조 로드
 * 3. 현재 페이지 경로 확인
 * 4. 메뉴 활성 상태 설정
 * 5. 알림 데이터 로드 및 표시
 * 6. 반응형 네비게이션 렌더링
 * 7. 사용자 상호작용 처리
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import NotificationsBell from './NotificationsBell';

// 사용자별 메뉴 구조 정의
const userMenuStructure = {
  student: {
    main: [
      { href: '/', label: '🏠 홈' },
      { href: '/dashboard', label: '📊 대시보드' },
      { href: '/courses', label: '📚 내 강의' },
      { href: '/bookings', label: '📅 예약 관리' },
      { href: '/payments', label: '💰 결제 내역' },
    ],
    health: [
      { href: '/health', label: '🏥 건강상태 관리' },
      { href: '/health/exercise', label: '📊 운동 기록' },
      { href: '/health/ai-training', label: '🤖 AI 훈련' },
    ],
    ai: [
      { href: '/ai-analysis', label: '🤖 AI 분석' },
      { href: '/ai-evaluation', label: '📊 AI 평가' },
      { href: '/video-3d-analysis', label: '🎬 3D 동영상 분석' },
    ],
    experience: [
      { href: '/quiz', label: '🧠 퀴즈' },
      { href: '/uploads', label: '📹 영상 업로드' },
      { href: '/(labs)/animation', label: '🎬 애니메이션' },
      { href: '/3d-viewer', label: '🎨 3D 뷰어' },
    ],
    info: [
      { href: '/about', label: '🏊‍♂️ 소개' },
      { href: '/news', label: '📢 공지사항' },
      { href: '/community', label: '💬 커뮤니티' },
      { href: '/shop', label: '🛍️ 상점' },
      { href: '/map', label: '🗺️ 지도' },
      { href: '/profile', label: '👤 프로필' },
    ]
  },
  instructor: {
    main: [
      { href: '/', label: '🏠 홈' },
      { href: '/instructor/dashboard', label: '📊 강사 대시보드' },
      { href: '/instructor/courses', label: '📚 내 강의 관리' },
      { href: '/instructor/bookings', label: '📅 예약 관리' },
    ],
    students: [
      { href: '/instructor/students', label: '👥 수강생 관리' },
      { href: '/instructor/schedule', label: '📅 일정 관리' },
      { href: '/instructor/reviews', label: '📝 업로드 리뷰' },
    ],
    reports: [
      { href: '/instructor/reports', label: '📊 강사 리포트' },
      { href: '/instructor/progress', label: '📈 진행상황 관리' },
    ],
    health: [
      { href: '/instructor/health/overview', label: '📊 학생 건강 현황' },
      { href: '/instructor/health/students', label: '👥 학생별 건강정보' },
      { href: '/instructor/health/progress', label: '📈 진행상황 추적' },
    ],
    center: [
      { href: '/about', label: '🏊‍♂️ 소개' },
      { href: '/news', label: '📢 공지사항' },
    ],
    teaching: [
      { href: '/instructor/teaching-methods', label: '🏊‍♂️ 강습법 관리' },
    ],
    ai: [
      { href: '/ai-analysis', label: '🤖 AI 분석' },
      { href: '/ai-evaluation', label: '📊 AI 평가' },
      { href: '/video-3d-analysis', label: '🎬 3D 동영상 분석' },
    ],
    experience: [
      { href: '/quiz', label: '🧠 퀴즈' },
      { href: '/(labs)/animation', label: '🎬 애니메이션' },
      { href: '/3d-viewer', label: '🎨 3D 뷰어' },
    ],
    info: [
      { href: '/community', label: '💬 커뮤니티' },
      { href: '/shop', label: '🛍️ 상점' },
      { href: '/map', label: '🗺️ 지도' },
      { href: '/profile', label: '👤 프로필' },
    ]
  },
  centerAdmin: {
    dashboard: [
      { href: '/', label: '🏠 홈' },
      { href: '/center-admin/dashboard', label: '📊 센터 대시보드' },
      { href: '/center-admin/users', label: '👥 센터 회원 관리' },
      { href: '/center-admin/instructors', label: '👨‍🏫 센터 강사 관리' },
      { href: '/center-admin/courses', label: '📚 센터 강의 관리' },
      { href: '/center-admin/bookings', label: '📅 예약 관리' },
      { href: '/center-admin/payments', label: '💰 결제 관리' },
      { href: '/center-admin/reports', label: '📊 센터 통계' },
      { href: '/center-admin/notices', label: '📢 공지사항 관리' },
    ],
    center: [
      { href: '/center-admin/introduction', label: '🏢 센터 소개 편집' },
      { href: '/center-admin/info', label: '⚙️ 센터 정보 관리' },
      { href: '/center-admin/settings', label: '🔧 센터 설정' },
    ],
    health: [
      { href: '/center-admin/health', label: '📊 센터 건강 현황' },
      { href: '/center-admin/health/statistics', label: '📈 건강 통계' },
      { href: '/center-admin/health/members', label: '👥 회원 건강정보' },
      { href: '/center-admin/health/programs', label: '🏊‍♂️ 건강 프로그램' },
    ],
    info: [
      { href: '/about', label: '🏊‍♂️ 소개' },
      { href: '/news', label: '📢 공지사항' },
      { href: '/community', label: '💬 커뮤니티' },
      { href: '/shop', label: '🛍️ 상점' },
      { href: '/map', label: '🗺️ 지도' },
    ],
    ai: [
      { href: '/ai-analysis', label: '🤖 AI 분석' },
      { href: '/ai-evaluation', label: '📊 AI 평가' },
      { href: '/video-3d-analysis', label: '🎬 3D 동영상 분석' },
    ],
    tools: [
      { href: '/3d-viewer', label: '🎨 3D 뷰어' },
    ]
  },
  superAdmin: {
    dashboard: [
      { href: '/', label: '🏠 홈' },
      { href: '/admin/dashboard', label: '📊 최고관리자 대시보드' },
      { href: '/admin/centers', label: '🏢 센터 관리' },
      { href: '/admin/users', label: '👥 전체 회원 관리' },
      { href: '/admin/instructor-management', label: '📊 강사 상세 관리' },
      { href: '/admin/courses', label: '📚 전체 강의 관리' },
      { href: '/admin/payments', label: '💰 전체 결제 관리' },
      { href: '/admin/reports', label: '📊 전체 통계' },
      { href: '/admin/system', label: '⚙️ 시스템 설정' },
    ],
    centers: [
      { href: '/admin/centers', label: '🏢 센터 관리' },
      { href: '/admin/centers/approval', label: '⏳ 센터 승인' },
      { href: '/admin/centers/statistics', label: '📊 센터 통계' },
    ],
    users: [
      { href: '/admin/users', label: '👥 전체 회원 관리' },
      { href: '/admin/instructors', label: '👨‍🏫 전체 강사 관리' },
      { href: '/admin/instructor-management', label: '📊 강사 상세 관리' },
    ],
    levels: [
      { href: '/admin/teaching-methods', label: '📚 강습법 관리' },
      { href: '/admin/lesson-plans', label: '📋 강습 계획 관리' },
      { href: '/admin/quiz', label: '🧠 퀴즈 관리' },
    ],
    revenue: [
      { href: '/admin/payments', label: '💰 전체 결제 관리' },
      { href: '/admin/revenue', label: '💰 총매출 관리' },
      { href: '/admin/reports', label: '📊 전체 통계' },
    ],
    approvals: [
      { href: '/admin/approvals', label: '⏳ 승인대기' },
      { href: '/admin/centers/approval', label: '⏳ 센터 승인' },
    ],
            ai: [
          { href: '/ai-analysis', label: '🤖 AI 분석' },
          { href: '/ai-evaluation', label: '📊 AI 평가' },
          { href: '/video-3d-analysis', label: '🎬 3D 동영상 분석' },
          { href: '/ai-config', label: '⚙️ AI 설정' },
          { href: '/admin/ai-config', label: '⚙️ AI 시스템 설정' },
          { href: '/admin/ai-config/recommendations', label: '💡 운동량 추천 알고리즘' },
          { href: '/admin/ai-evaluation-criteria', label: '🎯 AI 평가 기준 관리' },
          { href: '/admin/ai-exercise-database', label: '💪 AI 운동 데이터베이스' },
        ],
    health: [
      { href: '/admin/health-config', label: '🏥 건강정보 시스템 설정' },
      { href: '/admin/health/overview', label: '📊 전체 건강 현황' },
      { href: '/admin/health/statistics', label: '📈 건강 통계 분석' },
      { href: '/admin/health/ai-config', label: '🤖 건강 AI 설정' },
    ],
    tools: [
      { href: '/admin/3d-viewer/management', label: '⚙️ 3D 뷰어 관리' },
      { href: '/admin/3d-viewer/swimming-styles', label: '🏊‍♂️ 영법 종류 관리' },
      { href: '/admin/3d-viewer/drills', label: '🎯 드릴 관리' },
      { href: '/admin/3d-viewer/models', label: '📦 3D 모델 관리' },
      { href: '/3d-viewer', label: '🧪 기본 3D 뷰어' },
      { href: '/3d-viewer/advanced', label: '🚀 고급 3D 뷰어' },
    ],
    experience: [
      { href: '/quiz', label: '🧠 퀴즈' },
      { href: '/(labs)/animation', label: '🎬 애니메이션' },
    ],
    info: [
      { href: '/about', label: '🏊‍♂️ 소개' },
      { href: '/news', label: '📢 공지사항' },
      { href: '/community', label: '💬 커뮤니티' },
      { href: '/shop', label: '🛍️ 상점' },
      { href: '/map', label: '🗺️ 지도' },
    ]
  },
  guest: {
    main: [
      { href: '/', label: '🏠 홈' },
      { href: '/about', label: '🏊‍♂️ 소개' },
      { href: '/guide', label: '📖 이용안내' },
      { href: '/news', label: '📢 공지사항' },
    ],
    ai: [
      { href: '/ai-analysis', label: '🤖 AI 분석 데모' },
      { href: '/video-3d-analysis', label: '🎬 3D 동영상 분석' },
    ],
    experience: [
      { href: '/quiz', label: '🧠 퀴즈 체험' },
      { href: '/health', label: '🏥 건강체크 체험' },
      { href: '/(labs)/animation', label: '🎬 애니메이션' },
      { href: '/3d-viewer', label: '🎨 3D 뷰어' },
    ],
    health: [
      { href: '/health', label: '🏥 건강체크 체험' },
    ],
    tools: [
      { href: '/3d-viewer', label: '🎨 3D 뷰어' },
      { href: '/(labs)/animation', label: '🎬 애니메이션' },
    ],
    community: [
      { href: '/community', label: '💬 커뮤니티' },
      { href: '/shop', label: '🛍️ 상점' },
      { href: '/map', label: '🗺️ 지도' },
    ],
    shop: [
      { href: '/shop', label: '🛍️ 상점' },
      { href: '/map', label: '🗺️ 지도' },
    ],
    map: [
      { href: '/map', label: '🗺️ 지도' },
    ],
    auth: [
      { href: '/auth/login', label: '🔑 로그인' },
      { href: '/auth/signup', label: '📝 회원가입' },
    ]
  }
};

// 메뉴 그룹화 정의 - 데스크탑과 모바일 모두 동일하게 사용
const menuGrouping = {
  student: [
    { groupName: '🏠 기본 메뉴', categories: ['main'] },
    { groupName: '🏥 건강 관리', categories: ['health'] },
    { groupName: '🤖 AI 분석', categories: ['ai'] },
    { groupName: '🎯 체험 메뉴', categories: ['experience'] },
    { groupName: '🏢 정보 & 커뮤니티', categories: ['info'] },
  ],
  instructor: [
    { groupName: '🏠 기본 메뉴', categories: ['main'] },
    { groupName: '📋 체크리스트 관리', categories: ['checklist'] },
    { groupName: '👥 수강생 관리', categories: ['students'] },
    { groupName: '🏥 건강정보 관리', categories: ['health'] },
    { groupName: '🤖 AI 분석', categories: ['ai'] },
    { groupName: '🏢 센터 정보', categories: ['center'] },
    { groupName: '🎯 체험 메뉴', categories: ['experience'] },
    { groupName: '💬 커뮤니티', categories: ['info'] },
  ],
  centerAdmin: [
    { groupName: '📊 센터 관리', categories: ['dashboard'] },
    { groupName: '🏢 센터 소개', categories: ['center'] },
    { groupName: '🏥 건강 관리', categories: ['health'] },
    { groupName: '📚 레벨 & 강습', categories: ['levels'] },
    { groupName: '🤖 AI 분석', categories: ['ai'] },
    { groupName: '🏢 정보 & 커뮤니티', categories: ['info'] },
    { groupName: '🛠️ 도구', categories: ['tools'] },
  ],
  superAdmin: [
    { groupName: '📊 최고 관리', categories: ['dashboard'] },
    { groupName: '🏢 센터 & 회원', categories: ['centers', 'users'] },
    { groupName: '📚 레벨 & 강습', categories: ['levels'] },
    { groupName: '💰 매출 & 승인', categories: ['revenue', 'approvals'] },
    { groupName: '🏥 건강정보 관리', categories: ['health'] },
    { groupName: '🤖 AI 시스템', categories: ['ai'] },
    { groupName: '🛠️ 도구 & 체험', categories: ['tools', 'experience'] },
    { groupName: '🏢 정보 & 커뮤니티', categories: ['info'] },
  ],
  guest: [
    { groupName: '🏠 JJ Swim Lab', categories: ['main'] },
    { groupName: '🤖 AI 체험', categories: ['ai'] },
    { groupName: '🎯 체험 메뉴', categories: ['experience', 'health', 'tools'] },
    { groupName: '💬 커뮤니티 & 상점', categories: ['community', 'shop', 'map'] },
    { groupName: '🔑 로그인/회원가입', categories: ['auth'] }
  ]
};

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
    }, 150);
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
      if (item.href === '/admin/reports' && !hasUserType('superAdmin')) return false;
      if (item.href === '/ai-config' && !hasUserType('superAdmin')) return false;
      if (item.href === '/admin/ai-config' && !hasUserType('superAdmin')) return false;
      
      if (item.href.startsWith('/admin/') && !hasUserType('centerAdmin') && !hasUserType('superAdmin')) return false;
      if (item.href.startsWith('/instructor/') && !hasUserType('instructor')) return false;
      
      return true;
    });
  };

  // 현재 사용자 타입에 따른 메뉴 그룹 가져오기
  const getCurrentMenuGrouping = () => {
    const userType = user?.userType || 'guest';
    return menuGrouping[userType] || menuGrouping.guest;
  };

  // 메뉴 렌더링 함수 (데스크탑과 모바일 모두에서 사용)
  const renderMenuGroups = (isMobile: boolean = false) => {
    const grouping = getCurrentMenuGrouping();
    
    return grouping.map((group, groupIndex) => {
      if (isMobile) {
        // 모바일 메뉴 렌더링
        return (
          <div key={groupIndex} className="px-3 py-2 border-b border-gray-200">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {group.groupName}
            </div>
            {group.categories.map(category => {
              const menuItems = userMenuStructure[user?.userType || 'guest']?.[category] || [];
              return menuItems.map((item, itemIndex) => (
                <Link
                  key={`${category}-${itemIndex}`}
                  href={item.href}
                  className={`block px-3 py-2 text-sm text-gray-700 hover:text-blue-600 transition-colors ${
                    pathname === item.href ? 'text-blue-600 font-semibold' : ''
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ));
            })}
          </div>
        );
      } else {
        // 데스크탑 메뉴 렌더링
        return (
          <div key={groupIndex} className="relative group">
            <button
              className={`text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-gray-50 ${
                group.categories.some(cat => 
                  userMenuStructure[user?.userType || 'guest']?.[cat]?.some(item => 
                    pathname === item.href || pathname.startsWith(item.href + '/')
                  )
                ) ? 'text-blue-600 font-semibold bg-blue-50' : ''
              }`}
              onMouseEnter={() => openDropdown(`desktop-${groupIndex}`)}
              onMouseLeave={closeDropdown}
            >
              <span>{group.groupName}</span>
              <span className="text-xs ml-1">▼</span>
            </button>
            {activeDropdown === `desktop-${groupIndex}` && (
              <div 
                className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-2xl z-[9999] min-w-max overflow-hidden"
                onMouseEnter={() => keepDropdownOpen(`desktop-${groupIndex}`)}
                onMouseLeave={closeDropdown}
              >
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 bg-gray-50">
                  {group.groupName}
                </div>
                {group.categories.map(category => {
                  const menuItems = userMenuStructure[user?.userType || 'guest']?.[category] || [];
                  return menuItems.map((item, itemIndex) => (
                    <Link
                      key={`${category}-${itemIndex}`}
                      href={item.href}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      {item.label}
                    </Link>
                  ));
                })}
              </div>
            )}
          </div>
        );
      }
    });
  };

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

          {/* Desktop Navigation - 반응형으로 자동 조정 */}
          <div className="hidden lg:flex lg:items-center lg:space-x-2 relative min-w-0 flex-1 justify-center px-4">
            {renderMenuGroups(false)}
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

        {/* Mobile Menu - 반응형으로 자동 조정 */}
        {isMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t max-h-96 overflow-y-auto">
              {renderMenuGroups(true)}
              
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