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

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from 'hooks/useAuth';
import NotificationsBell from './NotificationsBell';
import { TenantLogo } from './TenantBranding';
import { useTenantSettings } from '@/contexts/TenantSettingsContext';

// 사용자별 메뉴 구조 정의
const userMenuStructure = {
  student: {
    main: [
      { href: '/dashboard', label: '📊 대시보드' },
      { href: '/map', label: '🗺️ 수영센터 찾기' },
      { href: '/courses', label: '📚 내 강의' },
      { href: '/bookings', label: '📅 예약 관리' },
      { href: '/payments', label: '💰 결제 내역' },
    ],
    health: [
      { href: '/health', label: '🏥 건강관리 홈' },
      { href: '/swimlab/trial', label: '🏊 스윔랩 체험' },
      { href: '/health/program', label: '🏊‍♂️ 운동 프로그램' },
      { href: '/health/history', label: '📋 프로그램 이력' },
      { href: '/health/measurements', label: '📊 측정 데이터' },
    ],
    experience: [
      { href: '/quiz', label: '🧠 퀴즈' },
      { href: '/uploads', label: '📹 영상 업로드' },
      { href: '/3d-viewer', label: '🎨 3D 뷰어' },
    ],
    info: [
      { href: '/guide', label: '📖 이용안내' },
      { href: '/news', label: '📢 공지사항' },
      { href: '/community', label: '💬 커뮤니티' },
      { href: '/shop', label: '🛍️ 상점' },
      { href: '/profile', label: '👤 프로필' },
    ]
  },
  instructor: {
    quickAccess: [
      { href: '/', label: '🏠 홈' },
      { href: '/instructor/dashboard', label: '📊 강사 대시보드' },
    ],
    classManagement: [
      { href: '/instructor/courses', label: '📚 내 강의 관리' },
      { href: '/instructor/bookings', label: '📅 예약 관리' },
    ],
    studentCare: [
      { href: '/instructor/students', label: '👥 수강생 관리' },
      { href: '/instructor/progress', label: '📈 진행 · 출석 관리' },
      { href: '/instructor/reviews', label: '📝 업로드 리뷰' },
    ],
    coachingTools: [
      { href: '/instructor/swim-training-plan', label: '🏊‍♂️ 맞춤형 수영 계획' },
      { href: '/instructor/health/overview', label: '📊 학생 건강 현황' },
      { href: '/instructor/teaching-methods', label: '🏊‍♂️ 강습법 관리' },
    ],
    experience: [
      { href: '/quiz', label: '🧠 퀴즈' },
      { href: '/3d-viewer', label: '🎨 3D 뷰어' },
    ],
    resources: [
      { href: '/guide', label: '📖 이용안내' },
      { href: '/news', label: '📢 공지사항' },
      { href: '/job-board', label: '💼 구인구직' },
      { href: '/community', label: '💬 커뮤니티' },
      { href: '/shop', label: '🛍️ 상점' },
      { href: '/map', label: '🗺️ 수영센터 찾기' },
      { href: '/profile', label: '👤 프로필' },
    ]
  },
  centerAdmin: {
    dashboard: [
      { href: '/', label: '🏠 홈' },
      { href: '/center/default/admin/dashboard', label: '📊 센터 대시보드' },
      { href: '/center/default/admin/members', label: '👥 센터 회원 관리' },
      { href: '/center/default/admin/instructors', label: '👨‍🏫 센터 강사 관리' },
      { href: '/center/default/admin/courses', label: '📚 센터 강의 관리' },
      { href: '/center/default/admin/reports', label: '📊 센터 통계' },
      { href: '/center/default/admin/notices', label: '📢 공지사항 관리' },
    ],
    center: [
      { href: '/center/default/admin/info', label: '⚙️ 센터 정보 관리' },
      { href: '/center/default/admin/branding', label: '🎨 사이트 테마 설정' },
    ],
    community: [
      { href: '/center/default/admin/guide', label: '📖 이용안내' },
      { href: '/news', label: '📢 공지사항' },
      { href: '/job-board', label: '💼 구인구직' },
      { href: '/community', label: '💬 커뮤니티' },
    ],
    tools: [
      { href: '/admin/swim-training-engine', label: '📅 주간 프로그램 생성' },
      { href: '/3d-viewer', label: '🎨 3D 뷰어' },
      { href: '/shop', label: '🛍️ 상점' },
      { href: '/map', label: '🗺️ 수영센터 찾기' },
      { href: '/center-admin/geo-distribution', label: '🗺️ 회원 분포 지도' },
    ]
  },
  'center-admin': {
    dashboard: [
      { href: '/center/default/admin/home', label: '🏠 홈' },
      { href: '/center/default/admin/dashboard', label: '📊 센터 대시보드' },
      { href: '/center/default/admin/members', label: '👥 센터 회원 관리' },
      { href: '/center/default/admin/instructors', label: '👨‍🏫 센터 강사 관리' },
      { href: '/center/default/admin/courses', label: '📚 센터 강의 관리' },
      { href: '/center/default/admin/reports', label: '📊 센터 통계' },
      { href: '/center/default/admin/notices', label: '📢 공지사항 관리' },
    ],
    center: [
      { href: '/center/default/admin/info', label: '⚙️ 센터 정보 관리' },
      { href: '/center/default/admin/branding', label: '🎨 사이트 테마 설정' },
    ],
    community: [
      { href: '/center/default/admin/guide', label: '📖 이용안내' },
      { href: '/news', label: '📢 공지사항' },
      { href: '/job-board', label: '💼 구인구직' },
      { href: '/community', label: '💬 커뮤니티' },
    ],
    tools: [
      { href: '/admin/swim-training-engine', label: '📅 주간 프로그램 생성' },
      { href: '/3d-viewer', label: '🎨 3D 뷰어' },
      { href: '/shop', label: '🛍️ 상점' },
      { href: '/map', label: '🗺️ 수영센터 찾기' },
      { href: '/center-admin/geo-distribution', label: '🗺️ 회원 분포 지도' },
    ]
  },
  superAdmin: {
    core: [
      { href: '/', label: '🏠 홈' },
      { href: '/admin/dashboard', label: '📊 최고관리자 대시보드' },
      { href: '/admin/system-settings', label: '⚙️ 시스템 설정' },
      { href: '/admin/system', label: '📈 시스템 사용 통계' },
    ],
    business: [
      { href: '/admin/center-management', label: '🏢 센터 관리' },
      { href: '/admin/center-statistics', label: '📊 센터 통계' },
      { href: '/admin/approvals', label: '⏳ 센터 승인', description: '강사등록/센터등록 승인' },
      { href: '/admin/users', label: '👥 회원 관리' },
      { href: '/admin/instructor-management', label: '👨‍🏫 강사 관리' },
      { href: '/admin/geo-distribution', label: '🗺️ 회원 분포 지도' },
    ],
    revenue: [
      { href: '/admin/total-revenue-management', label: '💎 총 매출 관리' },
      { href: '/admin/revenue-management', label: '💰 센터별 매출 관리' },
    ],
    content: [
      { href: '/admin/lesson-plans', label: '📋 강습 계획 템플릿' },
      { href: '/admin/teaching-methods', label: '📚 강습법 관리' },
      { href: '/admin/course-oversight', label: '👁️ 강습 과정 감독' },
      { href: '/admin/quiz', label: '🧠 퀴즈 관리' },
      { href: '/admin/swim-training-engine', label: '🏊‍♂️ 수영 트레이닝 규칙 엔진' },
      { href: '/admin/health/overview', label: '📊 전체 건강 현황 및 통계' },
    ],
    operations: [
      { href: '/admin/notices', label: '📢 공지사항 관리' },
      { href: '/admin/reports', label: '🎧 고객지원 관리' },
    ],
    tools: [
      { href: '/3d-viewer', label: '🏊‍♂️ 3D 수영 뷰어 · 영법 관리' },
      { href: '/quiz', label: '🧠 퀴즈 체험' },
    ],
    community: [
      { href: '/guide', label: '📖 이용안내' },
      { href: '/job-board', label: '💼 구인구직' },
      { href: '/community', label: '💬 커뮤니티' },
      { href: '/shop', label: '🛍️ 상점' },
      { href: '/map', label: '🗺️ 수영센터 찾기' },
    ]
  },
  guest: {
    main: [
      { href: '/', label: '🏠 홈' },
      { href: '/guide', label: '📖 이용안내' },
      { href: '/news', label: '📢 공지사항' },
    ],
    experience: [
      { href: '/guest-quiz', label: '🧠 퀴즈 체험' },
      { href: '/swimlab/trial', label: '🏊 스윔랩 체험' },
      { href: '/3d-viewer', label: '🏊‍♂️ 3D 수영 뷰어' },
    ],
    community: [
      { href: '/community', label: '💬 커뮤니티' },
      { href: '/shop', label: '🛍️ 상점' },
      { href: '/map', label: '🗺️ 수영센터 찾기' },
    ],
    auth: [
      { href: '/auth/login', label: '🔑 로그인' },
      { href: '/auth/signup', label: '📝 회원가입' },
      { href: '/auth/signup-center-admin', label: '🏢 센터 등록' },
    ]
  }
};

// 메뉴 그룹화 정의 - 데스크탑과 모바일 모두 동일하게 사용
const menuGrouping = {
  student: [
    { groupName: '🏠 기본 메뉴', categories: ['main'] },
    { groupName: '🏥 건강 관리', categories: ['health'] },
    { groupName: '🎯 체험 메뉴', categories: ['experience'] },
    { groupName: '🏢 정보 & 커뮤니티', categories: ['info'] },
  ],
  instructor: [
    { groupName: '⚡ 바로가기', categories: ['quickAccess'] },
    { groupName: '📚 강의 · 예약', categories: ['classManagement'] },
    { groupName: '👥 수강생 케어', categories: ['studentCare'] },
    { groupName: '🏊 코칭 도구', categories: ['coachingTools'] },
    { groupName: '🎯 체험 메뉴', categories: ['experience'] },
    { groupName: '📘 안내 & 지원', categories: ['resources'] },
  ],
  centerAdmin: [
    { groupName: '📊 센터 관리', categories: ['dashboard'] },
    { groupName: '⚙️ 센터 설정', categories: ['center'] },
    { groupName: '💬 커뮤니티', categories: ['community'] },
    { groupName: '🔗 추가 서비스', categories: ['tools'] },
  ],
  'center-admin': [
    { groupName: '📊 센터 관리', categories: ['dashboard'] },
    { groupName: '⚙️ 센터 설정', categories: ['center'] },
    { groupName: '💬 커뮤니티', categories: ['community'] },
    { groupName: '🔗 추가 서비스', categories: ['tools'] },
  ],
  superAdmin: [
    { groupName: '🎯 핵심 관리', categories: ['core'] },
    { groupName: '🏢 비즈니스 관리', categories: ['business'] },
    { groupName: '💰 매출 관리', categories: ['revenue'] },
    { groupName: '📚 콘텐츠 관리', categories: ['content'] },
    { groupName: '🎧 운영 지원', categories: ['operations'] },
    { groupName: '🛠️ 도구 & 체험', categories: ['tools'] },
    { groupName: '🌐 커뮤니티', categories: ['community'] },
  ],
  guest: [
    { groupName: '🏠 JJ Swim Lab', categories: ['main'] },
    { groupName: '🎯 체험 메뉴', categories: ['experience'] },
    { groupName: '💬 커뮤니티 & 상점', categories: ['community'] }
  ]
};

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const [centerName, setCenterName] = useState('JJ Swim Lab');
  const [primaryColor, setPrimaryColor] = useState<string | undefined>(undefined);
  const [secondaryColor, setSecondaryColor] = useState<string | undefined>(undefined);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  // 테넌트 브랜딩 정보 가져오기 (TenantSettingsProvider 밖에서도 작동하도록)
  useEffect(() => {
    // localStorage에서 센터명 가져오기
    const storedCenterName = localStorage.getItem('center-name');
    if (storedCenterName) {
      setCenterName(storedCenterName);
    }
    
    // localStorage에서 로고 URL 가져오기 (우선순위 1)
    const loadLogoFromLocalStorage = () => {
      const storedLogo = localStorage.getItem('center-logo');
      if (storedLogo) {
        const fullLogoUrl = storedLogo.startsWith('http') ? storedLogo : `http://localhost:5000${storedLogo}`;
        setLogoUrl(fullLogoUrl);
        return true;
      }
      return false;
    };
    
    // localStorage에서 로고 로드 시도
    if (!loadLogoFromLocalStorage()) {
      // localStorage에 없으면 API에서 가져오기
      const loadLogoFromAPI = async () => {
        try {
          const token = localStorage.getItem('token');
          const centerId = localStorage.getItem('centerId');
          if (token && centerId) {
            const response = await fetch(`http://localhost:5000/api/centers/settings`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'x-center-id': centerId
              }
            });
            if (response.ok) {
              const data = await response.json();
              if (data.success && data.data?.branding?.logo) {
                const logo = data.data.branding.logo;
                const fullLogoUrl = logo.startsWith('http') ? logo : `http://localhost:5000${logo}`;
                setLogoUrl(fullLogoUrl);
                // localStorage에 저장
                try {
                  localStorage.setItem('center-logo', logo);
                } catch (e) {
                  console.warn('로고 URL localStorage 저장 실패:', e);
                }
              }
            }
          }
        } catch (error) {
          console.error('Navigation: 로고 URL 로드 실패:', error);
        }
      };
      
      loadLogoFromAPI();
    }
    
    // 커스텀 이벤트 리스너 (로고 업데이트 감지)
    const handleLogoUpdate = (event: any) => {
      const logoUrlFromEvent = event.detail?.logoUrl;
      if (logoUrlFromEvent) {
        const fullLogoUrl = logoUrlFromEvent.startsWith('http') ? logoUrlFromEvent : `http://localhost:5000${logoUrlFromEvent}`;
        setLogoUrl(fullLogoUrl);
      }
    };
    
    window.addEventListener('center-logo-updated', handleLogoUpdate);
    
    // CSS 변수에서 primaryColor와 secondaryColor 가져오기
    const updateColor = () => {
      const primary = getComputedStyle(document.documentElement).getPropertyValue('--tenant-primary-color').trim();
      const secondary = getComputedStyle(document.documentElement).getPropertyValue('--tenant-secondary-color').trim();
      if (primary) {
        setPrimaryColor(primary);
      }
      if (secondary) {
        setSecondaryColor(secondary);
      }
    };
    
    updateColor();
    
    // MutationObserver로 CSS 변수 변경 감지
    const observer = new MutationObserver(() => {
      updateColor();
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style']
    });
    
    // 주기적으로 확인 (백업)
    const interval = setInterval(() => {
      updateColor();
      // 로고도 주기적으로 확인 (localStorage 우선)
      loadLogoFromLocalStorage();
    }, 1000);
    
    // pathname 변경 시에도 색상 확인
    const checkColor = () => {
      updateColor();
    };
    
    window.addEventListener('focus', checkColor);
    
    return () => {
      observer.disconnect();
      clearInterval(interval);
      window.removeEventListener('focus', checkColor);
      window.removeEventListener('center-logo-updated', handleLogoUpdate);
    };
  }, [pathname]); // pathname 변경 시에도 실행

  // 페이지 경로 변경 시 최상단으로 스크롤
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  // 모바일 메뉴가 열릴 때 현재 페이지 항목으로 스크롤 및 포커스
  useEffect(() => {
    if (isMenuOpen) {
      setTimeout(() => {
        
        // 정확한 경로 매칭으로 첫 번째 활성 메뉴 항목만 찾기
        const activeMenuItems = document.querySelectorAll('[data-active="true"]');
        
        let targetMenuItem = null;
        
        // href 속성으로 정확한 경로 매칭 우선
        for (let i = 0; i < activeMenuItems.length; i++) {
          const item = activeMenuItems[i] as HTMLElement;
          const href = item.getAttribute('data-href') || item.getAttribute('href');
          if (href && pathname === href) {
            targetMenuItem = item;
            break;
          }
        }
        
        // 정확한 매칭이 없으면 첫 번째 활성 항목 사용
        if (!targetMenuItem && activeMenuItems.length > 0) {
          targetMenuItem = activeMenuItems[0] as HTMLElement;
        }
        
        if (targetMenuItem && typeof targetMenuItem.scrollIntoView === 'function') {
          targetMenuItem.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
          // 메뉴 항목에 포커스
          targetMenuItem.focus();
        } else {
          // 첫 번째 메뉴 항목 자동 포커스
          const firstMenuItem = document.querySelector('[role="menuitem"]');
          if (firstMenuItem) {
            (firstMenuItem as HTMLElement).focus();
          }
        }
      }, 200);
    }
  }, [isMenuOpen, pathname]);

  // 외부 클릭 시 메뉴 닫기 및 ESC 키 처리
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMenuOpen) {
        const target = event.target as Element;
        const menuElement = document.querySelector('[data-menu="mobile-menu"]');
        const menuButton = document.querySelector('[data-menu="menu-button"]');
        
        if (menuElement && menuButton && 
            !menuElement.contains(target) && 
            !menuButton.contains(target)) {
          setIsMenuOpen(false);
        }
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isMenuOpen && event.key === 'Escape') {
        setIsMenuOpen(false);
        // 메뉴 버튼에 포커스 복원
        const menuButton = document.querySelector('[data-menu="menu-button"]') as HTMLElement;
        if (menuButton) {
          menuButton.focus();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [dropdownTimeout, setDropdownTimeout] = useState<NodeJS.Timeout | null>(null);
  // 메뉴 활성화 매칭 함수
  const isMenuActive = (href: string, currentPath: string): boolean => {
    // 정확한 매칭
    if (currentPath === href) return true;
    
    // 하위 경로 매칭
    if (currentPath.startsWith(href + '/')) return true;
    
    // 특수 케이스: 예약·결제 관리 페이지 (쿼리 파라미터 포함)
    if (href === '/center/default/admin/manage' && currentPath.startsWith('/center/default/admin/manage')) return true;
    
    // 특수 케이스: 건강 관리 관련 페이지들
    if (href === '/health' && currentPath.startsWith('/health')) return true;
    
    // 특수 케이스: 수영트레이닝 규칙엔진 관련 페이지들
    if (href === '/admin/swim-training-engine' && 
        currentPath.startsWith('/admin/swim-training-engine')) return true;
    
    return false;
  };
  const { user, logout, hasPermission, hasUserType, loading } = useAuth();
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
          <div key={groupIndex} className="py-2 border-b border-gray-200">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
              {group.groupName}
            </div>
            {group.categories && group.categories.map && group.categories.map(category => {
              const normalizedUserType = (user?.userType === 'center-admin' || user?.userType === 'centerAdmin') ? 'centerAdmin' : (user?.userType || 'guest');
              const menuItems = userMenuStructure[normalizedUserType]?.[category] || [];
              return menuItems.map((item, itemIndex) => (
                <Link
                  key={`${category}-${itemIndex}`}
                  href={item.href}
                  data-active={isMenuActive(item.href, pathname).toString()}
                  data-href={item.href}
                  className={`block w-full text-left px-3 py-2 text-sm transition-colors rounded-md mx-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isMenuActive(item.href, pathname)
                      ? 'bg-blue-500 text-white font-bold border-l-3 border-blue-700 shadow-sm' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setIsMenuOpen(false);
                      // 페이지 이동 시 항상 상단으로 스크롤
                      setTimeout(() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }, 100);
                    }
                  }}
                  role="menuitem"
                  tabIndex={0}
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
              className={`text-white hover:text-white/80 transition-colors font-medium text-sm flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-white/20 ${
                group.categories.some(cat => 
                  userMenuStructure[(user?.userType === 'center-admin' || user?.userType === 'centerAdmin') ? 'centerAdmin' : (user?.userType || 'guest')]?.[cat]?.some(item => 
                    isMenuActive(item.href, pathname)
                  )
                ) ? 'text-white font-semibold bg-white/30' : ''
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
                  {group.categories && group.categories.map && group.categories.map(category => {
                    const normalizedUserType = (user?.userType === 'center-admin' || user?.userType === 'centerAdmin') ? 'centerAdmin' : (user?.userType || 'guest');
              const menuItems = userMenuStructure[normalizedUserType]?.[category] || [];
                    return menuItems.map((item, itemIndex) => (
                      <Link
                        key={`${category}-${itemIndex}`}
                        href={item.href}
                        className={`block w-full text-left px-4 py-2 text-sm transition-colors text-white ${
                          pathname === item.href || 
                          (item.href === '/center/default/admin/manage' && pathname.startsWith('/center/default/admin/manage')) ||
                          (item.href === '/health' && pathname.startsWith('/health')) ||
                          (item.href === '/swimlab/trial' && pathname === '/swimlab/trial') ||
                          (item.href === '/health/program' && pathname === '/health/program') ||
                          (item.href === '/health/history' && pathname === '/health/history') ||
                          (item.href === '/admin/swim-training-engine' && pathname === '/admin/swim-training-engine')
                            ? 'font-semibold border-r-2' 
                            : 'hover:opacity-80'
                        }`}
                        style={{
                          ...(pathname === item.href || 
                            (item.href === '/center/default/admin/manage' && pathname.startsWith('/center/default/admin/manage')) ||
                            (item.href === '/health' && pathname.startsWith('/health')) ||
                            (item.href === '/swimlab/trial' && pathname === '/swimlab/trial') ||
                            (item.href === '/health/program' && pathname === '/health/program') ||
                            (item.href === '/health/history' && pathname === '/health/history') ||
                            (item.href === '/admin/swim-training-engine' && pathname === '/admin/swim-training-engine')
                            ? {
                                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                color: '#ffffff',
                                borderRightColor: '#ffffff'
                              }
                            : {
                                color: '#ffffff',
                                ...(primaryColor ? { '--hover-bg': `rgba(255, 255, 255, 0.1)` } : {})
                              })
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
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

  // 배경색 그라데이션 계산 (주요 색상 → 보조 색상)
  const primaryNavColor = primaryColor || '#3b82f6';
  const secondaryNavColor = secondaryColor || '#ffffff';
  const navBackgroundStyle = { 
    background: `linear-gradient(to right, ${primaryNavColor}, ${secondaryNavColor})`,
    border: 'none'
  };
  
  return (
    <nav 
      className="shadow-lg fixed top-0 left-0 right-0 z-[9999]"
      style={navBackgroundStyle}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 min-w-0">
          {/* Logo and Brand */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center space-x-3">
              {logoUrl ? (
                <div className="w-12 h-12 relative">
                  <img
                    src={logoUrl}
                    alt="센터 로고"
                    className="w-full h-full object-contain rounded-lg"
                    onError={(e) => {
                      console.error('Navigation: 로고 이미지 로드 실패:', logoUrl);
                      setLogoUrl(null); // 로드 실패 시 null로 설정하여 기본 로고 표시
                    }}
                    onLoad={() => {
                    }}
                  />
                </div>
              ) : (
                <TenantLogo size="lg" />
              )}
              <span 
                className="text-xl font-bold leading-tight text-white"
              >
                {centerName}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation - 반응형으로 자동 조정 */}
          <div className="hidden lg:flex lg:items-center lg:space-x-2 relative min-w-0 flex-1 justify-center px-4">
            {renderMenuGroups(false)}
          </div>

          {/* User Menu and Actions */}
          <div className="flex items-center space-x-4">
            {!loading && isLoggedIn ? (
              <>
                <div className="hidden md:flex items-center space-x-4 flex-nowrap">
                  <div 
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg flex-shrink-0 shadow-md"
                    style={{ backgroundColor: secondaryColor ? `${secondaryColor}40` : 'rgba(255, 255, 255, 0.95)' }}
                  >
                  <NotificationsBell />
                </div>
                  <div 
                    className="flex items-center space-x-3 px-4 py-2.5 rounded-lg whitespace-nowrap flex-shrink-0 bg-white/95 backdrop-blur-sm shadow-lg border border-white/20"
                  >
                    <span className="text-sm font-bold text-gray-900 drop-shadow-sm">{userName}님</span>
                    <span className="text-xs text-gray-400 font-medium">|</span>
                  <button
                    onClick={handleLogout}
                      className="text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-md transition-all font-bold flex items-center space-x-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>로그아웃</span>
                  </button>
                  </div>
                </div>
              </>
            ) : null}

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                data-menu="menu-button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsMenuOpen(!isMenuOpen);
                  }
                }}
                className="p-2 rounded-md transition-colors focus:outline-none focus:ring-2 text-white"
                style={{
                  color: '#ffffff',
                  '--hover-bg': 'rgba(255, 255, 255, 0.2)'
                } as React.CSSProperties & { '--hover-bg': string }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                aria-label={isMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? (
                  <span 
                    className="text-2xl"
                    style={{ color: primaryColor || '#3b82f6' }}
                  >
                    ✕
                  </span>
                ) : (
                  <span 
                    className="text-2xl"
                    style={{ color: primaryColor || '#3b82f6' }}
                  >
                    ☰
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu - 햄버거 버튼 아래 오른쪽 정렬 */}
        {isMenuOpen && (
          <div 
            data-menu="mobile-menu"
            className="lg:hidden absolute top-16 right-4 z-50 border rounded-lg shadow-xl w-auto min-w-[200px] max-w-[280px]"
            style={{
              backgroundColor: secondaryColor || '#ffffff',
              borderColor: primaryColor ? `${primaryColor}40` : '#e5e7eb'
            }}
            role="menu"
            aria-label="주 메뉴"
          >
            <div className="px-4 pt-3 pb-3 space-y-1 max-h-[70vh] overflow-y-auto">
              {renderMenuGroups(true)}
              
              {!loading && isLoggedIn ? (
                <div className="px-4 py-3 border-t-2 border-gray-300 bg-gradient-to-r from-gray-50 to-blue-50 rounded-b-lg">
                  <div className="text-sm font-bold text-gray-900 mb-3 flex items-center space-x-2">
                    <span className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
                      {userName?.charAt(0) || 'U'}
                    </span>
                    <span>{userName}님 환영합니다</span>
                  </div>
                  <div className="flex items-center space-x-2 mb-3">
                    <NotificationsBell />
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 text-sm font-bold text-red-600 hover:text-white hover:bg-red-600 border-2 border-red-600 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>로그아웃</span>
                  </button>
                </div>
              ) : !loading ? (
                <div 
                  className="px-3 py-2 border-t rounded-lg mx-2 mb-2"
                  style={{
                    borderTopColor: primaryColor ? `${primaryColor}40` : '#e5e7eb',
                    background: primaryColor && secondaryColor 
                      ? `linear-gradient(to right, ${primaryColor}20, ${secondaryColor}20)`
                      : primaryColor 
                        ? `${primaryColor}20`
                        : '#eff6ff'
                  }}
                >
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
                      className="block w-full text-center px-3 py-2 text-white rounded-md transition-all duration-200 font-semibold"
                      style={{
                        background: primaryColor && secondaryColor
                          ? `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`
                          : primaryColor || '#2563eb'
                      }}
                      onMouseEnter={(e) => {
                        if (primaryColor && secondaryColor) {
                          e.currentTarget.style.background = `linear-gradient(to right, ${primaryColor}dd, ${secondaryColor}dd)`;
                        } else if (primaryColor) {
                          e.currentTarget.style.opacity = '0.9';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (primaryColor && secondaryColor) {
                          e.currentTarget.style.background = `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`;
                        } else if (primaryColor) {
                          e.currentTarget.style.opacity = '1';
                        }
                      }}
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