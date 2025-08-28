'use client';

import { useAuth } from '../hooks/useAuth';
import Navigation from './Navigation';

export default function DynamicNavigation() {
  const { user } = useAuth();
  
  // 모든 사용자 타입에 대해 Navigation 컴포넌트 사용
  // Navigation 컴포넌트가 useMemo를 사용하여 사용자 타입에 따라 메뉴를 동적으로 계산
  return <Navigation />;
}
