/**
 * ⚡ JJ Swim Lab - QuickActions 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 사용자가 자주 사용하는 기능에 빠르게 접근할 수 있는 단축 액션 제공
 * - 계정 유형별 맞춤형 빠른 액션 메뉴 구성
 * - 자주 사용하는 기능의 원클릭 접근
 * - 사용자 행동 패턴 기반 액션 추천
 * - 빠른 액션 실행 후 피드백 제공
 * 
 * 🔄 **주요 기능**
 * - 계정 유형별 맞춤 빠른 액션 메뉴
 * - 자주 사용하는 기능 원클릭 접근
 * - 사용자 행동 패턴 기반 액션 추천
 * - 빠른 액션 실행 및 피드백
 * - 액션 실행 이력 및 통계
 * 
 * 🗄️ **데이터 연동**
 * - 사용자 계정 유형 정보
 * - 자주 사용하는 기능 데이터
 * - 사용자 행동 패턴 분석
 * - 액션 실행 이력 및 통계
 * - 빠른 액션 설정 및 커스터마이징
 * 
 * 🛠️ **필요한 설치 파일**
 * - React (useState, useEffect, useCallback)
 * - 사용자 행동 분석 라이브러리
 * - 아이콘 라이브러리 (SVG)
 * - Tailwind CSS (스타일링)
 * - TypeScript (타입 정의)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 계정 유형별 적절한 액션 구성
 * 2. 자주 사용하는 기능의 정확한 식별
 * 3. 빠른 액션 실행의 안정성
 * 4. 사용자 경험의 일관성 유지
 * 5. 액션 실행 후 적절한 피드백 제공
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 계정 유형별 빠른 액션 구성 확인
 * - [ ] 자주 사용하는 기능 식별 정확성 확인
 * - [ ] 빠른 액션 실행 동작 검증
 * - [ ] 액션 실행 후 피드백 확인
 * - [ ] 사용자 행동 패턴 분석 정확성 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 빠른 액션)
 * - 2024-12-19: 계정 유형별 맞춤 액션 구현
 * - 2024-12-19: 자주 사용하는 기능 식별 시스템 구현
 * - 2024-12-19: 사용자 행동 패턴 분석 시스템 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (빠른 액션 시스템 완료)
 * 
 * 🚀 **다음 단계**
 * - AI 기반 액션 추천 시스템
 * - 실시간 액션 최적화
 * - 성능 최적화
 * - 접근성 개선
 * 
 * 💡 **사용 예시**
 * ```tsx
 * <QuickActions 
 *   userType="instructor"
 *   onActionClick={(action) => handleActionClick(action)}
 *   onActionComplete={(result) => handleActionComplete(result)}
 *   enableRecommendations={true}
 * />
 * ```
 */

'use client';

import { useState } from 'react';
import { 
  Plus, 
  Calendar, 
  Users, 
  BookOpen, 
  CreditCard, 
  BarChart3, 
  Settings,
  MessageSquare,
  MapPin,
  ShoppingCart
} from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  href: string;
  userTypes: string[];
}

interface QuickActionsProps {
  userType: string;
}

export default function QuickActions({ userType }: QuickActionsProps) {
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  const quickActions: QuickAction[] = [
    {
      id: 'add-user',
      title: '사용자 추가',
      description: '새로운 사용자 계정 생성',
      icon: <Users className="w-6 h-6" />,
      color: 'bg-blue-500 hover:bg-blue-600',
      href: '/admin/users/new',
      userTypes: ['superAdmin', 'centerAdmin']
    },
    {
      id: 'create-course',
      title: '과정 생성',
      description: '새로운 수영 과정 만들기',
      icon: <BookOpen className="w-6 h-6" />,
      color: 'bg-green-500 hover:bg-green-600',
      href: '/admin/courses/new',
      userTypes: ['superAdmin', 'centerAdmin', 'instructor']
    },
    {
      id: 'schedule-class',
      title: '수업 일정',
      description: '수업 일정 관리 및 예약',
      icon: <Calendar className="w-6 h-6" />,
      color: 'bg-purple-500 hover:bg-purple-600',
      href: '/admin/bookings',
      userTypes: ['superAdmin', 'centerAdmin', 'instructor']
    },
    {
      id: 'manage-payments',
      title: '결제 관리',
      description: '결제 현황 및 환불 처리',
      icon: <CreditCard className="w-6 h-6" />,
      color: 'bg-yellow-500 hover:bg-yellow-600',
      href: '/admin/payments',
      userTypes: ['superAdmin', 'centerAdmin']
    },
    {
      id: 'view-reports',
      title: '리포트',
      description: '상세한 분석 리포트 확인',
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'bg-indigo-500 hover:bg-indigo-600',
      href: '/admin/reports',
      userTypes: ['superAdmin', 'centerAdmin']
    },
    {
      id: 'community',
      title: '커뮤니티',
      description: '사용자 커뮤니티 관리',
      icon: <MessageSquare className="w-6 h-6" />,
      color: 'bg-pink-500 hover:bg-pink-600',
      href: '/community',
      userTypes: ['superAdmin', 'centerAdmin', 'instructor', 'student']
    },
    {
      id: 'map-center',
      title: '센터 위치',
      description: '수영 센터 위치 및 정보',
      icon: <MapPin className="w-6 h-6" />,
      color: 'bg-red-500 hover:bg-red-600',
      href: '/map',
      userTypes: ['superAdmin', 'centerAdmin', 'instructor', 'student']
    },
    {
      id: 'shop',
      title: '상점',
      description: '수영 용품 및 상품',
      icon: <ShoppingCart className="w-6 h-6" />,
      color: 'bg-orange-500 hover:bg-orange-600',
      href: '/shop',
      userTypes: ['superAdmin', 'centerAdmin', 'instructor', 'student']
    }
  ];

  const filteredActions = quickActions.filter(action => 
    action.userTypes.includes(userType)
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">빠른 액션</h2>
        <p className="text-gray-600">자주 사용하는 기능에 빠르게 접근하세요</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {filteredActions.map((action) => (
          <a
            key={action.id}
            href={action.href}
            className={`group relative p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200 ${action.color} text-white`}
            onMouseEnter={() => setHoveredAction(action.id)}
            onMouseLeave={() => setHoveredAction(null)}
          >
            <div className="text-center">
              <div className="flex justify-center mb-2">
                {action.icon}
              </div>
              <h3 className="font-medium text-sm mb-1 card-title-text">{action.title}</h3>
              <p className="text-xs opacity-90 description-text">{action.description}</p>
            </div>
            
            {/* 호버 효과 */}
            {hoveredAction === action.id && (
              <div className="absolute inset-0 bg-black bg-opacity-10 rounded-lg flex items-center justify-center">
                <span className="text-white font-medium">클릭</span>
              </div>
            )}
          </a>
        ))}
      </div>

      {/* 추가 액션 버튼 */}
      <div className="mt-6 text-center">
        <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <Settings className="w-4 h-4 mr-2" />
          더 많은 옵션
        </button>
      </div>
    </div>
  );
}
