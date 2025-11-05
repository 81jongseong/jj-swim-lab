/**
 * 🧭 JJ Swim Lab - SimpleNavigation 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 간단하고 직관적인 네비게이션 인터페이스 제공
 * - 기본적인 메뉴 구조와 핵심 기능에 대한 빠른 접근
 * - 복잡한 기능 없이 필수적인 네비게이션 요소만 포함
 * - 가벼운 성능과 빠른 로딩을 위한 최소한의 기능
 * - 기본적인 사용자 경험을 위한 심플한 디자인
 * 
 * 🔄 **주요 기능**
 * - 기본 메뉴 구조 및 링크
 * - 간단한 사용자 인증 상태 표시
 * - 핵심 기능에 대한 빠른 접근
 * - 최소한의 인터랙션 요소
 * - 기본적인 반응형 디자인
 * 
 * 🗄️ **데이터 연동**
 * - 기본 메뉴 구성 데이터
 * - 사용자 인증 상태 정보
 * - 네비게이션 설정 및 옵션
 * - 기본 사용자 인터랙션 데이터
 * 
 * 🛠️ **필요한 설치 파일**
 * - React (기본 컴포넌트)
 * - 기본 사용자 인증 시스템
 * - 간단한 스타일링 라이브러리
 * - 기본 아이콘 리소스
 * - Tailwind CSS (기본 스타일링)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 간단하고 직관적인 메뉴 구조 유지
 * 2. 기본적인 기능만 포함하여 복잡성 방지
 * 3. 빠른 로딩과 가벼운 성능 유지
 * 4. 기본적인 사용자 경험 보장
 * 5. 확장 가능한 구조 설계
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 기본 메뉴 구조 동작 확인
 * - [ ] 사용자 인증 상태 표시 확인
 * - [ ] 핵심 기능 접근 검증
 * - [ ] 기본 반응형 디자인 확인
 * - [ ] 성능 및 로딩 속도 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 심플 네비게이션)
 * - 2024-12-19: 기본 메뉴 구조 시스템 구현
 * - 2024-12-19: 간단한 사용자 인증 상태 표시 구현
 * - 2024-12-19: 기본 반응형 디자인 적용
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (심플 네비게이션 시스템 완료)
 * 
 * 🚀 **다음 단계**
 * - 기본 기능 확장
 * - 성능 최적화
 * - 접근성 개선
 * - 사용자 경험 향상
 * 
 * 💡 **사용 예시**
 * ```tsx
 * <SimpleNavigation 
 *   onMenuClick={(menu) => handleMenuClick(menu)}
 *   onAuthClick={() => handleAuthClick()}
 *   enableBasicFeatures={true}
 *   showUserStatus={true}
 * />
 * ```
 */

'use client';

import Link from 'next/link';
import { useAuth } from 'hooks/useAuth';
import UserMenu from './common/UserMenu';

export default function SimpleNavigation() {
  const { user } = useAuth();

            // 기본 메뉴 (모든 사용자)
          const baseMenu = [
            { href: '/', label: '홈' },
            { href: '/about', label: '소개' },
            { href: '/community', label: '커뮤니티' },
            { href: '/install', label: '📱 앱 설치' },
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
              <UserMenu 
                showUserType={false}
                size="md"
                logoutVariant="text"
                className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200"
              />
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
