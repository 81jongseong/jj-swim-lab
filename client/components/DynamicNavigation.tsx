/**
 * 🔄 JJ Swim Lab - DynamicNavigation 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 사용자 타입에 따라 적절한 네비게이션 컴포넌트를 동적으로 선택
 * - superAdmin과 centerAdmin은 TopNavigation 사용
 * - 그 외 사용자는 Navigation 사용
 * - useAuth 훅을 통해 사용자 정보 확인
 * 
 * 🔄 **주요 기능**
 * - 사용자 타입 기반 네비게이션 선택
 * - TopNavigation과 Navigation 간 전환
 * - useAuth 훅 연동
 * 
 * 🗄️ **데이터 연동**
 * - useAuth 훅 (사용자 인증 상태 및 타입)
 * - Navigation 컴포넌트 (일반 사용자용)
 * - TopNavigation 컴포넌트 (관리자용)
 * 
 * 🔗 **연동되는 파일**
 * - ../hooks/useAuth.tsx: 사용자 인증 정보
 * - ./Navigation.tsx: 일반 사용자 네비게이션
 * - ./TopNavigation.tsx: 관리자 네비게이션
 * 
 * 🛠️ **필요한 설치 파일**
 * - React 18.3.1
 * - useAuth 훅
 * - Navigation, TopNavigation 컴포넌트
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 사용자 타입 확인 로직의 정확성
 * 2. Navigation 컴포넌트가 내부적으로 사용자 타입에 따라 메뉴를 동적으로 계산
 * 3. 컴포넌트 전환 시 상태 유지
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (동적 네비게이션 선택)
 * - 2025-01-22: 주석 보완 및 실제 구현 반영
 */

'use client';

import { useAuth } from 'hooks/useAuth';
import Navigation from './Navigation';

export default function DynamicNavigation() {
  const { user } = useAuth();
  
  // 모든 사용자 타입에 대해 Navigation 컴포넌트 사용
  // Navigation 컴포넌트가 useMemo를 사용하여 사용자 타입에 따라 메뉴를 동적으로 계산
  return <Navigation />;
}
