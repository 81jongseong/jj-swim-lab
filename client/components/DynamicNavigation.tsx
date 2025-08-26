'use client';

import { useAuth } from '../hooks/useAuth';
import TopNavigation from './TopNavigation';
import Navigation from './Navigation';

export default function DynamicNavigation() {
  const { user } = useAuth();
  
  // 사용자 타입에 따라 네비게이션 선택
  if (user?.userType === 'superAdmin' || user?.userType === 'centerAdmin') {
    return <TopNavigation />;
  }
  
  // 일반 사용자, 강사, 게스트는 Navigation 사용
  return <Navigation />;
}
