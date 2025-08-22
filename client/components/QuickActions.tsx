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
