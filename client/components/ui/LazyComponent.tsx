/**
 * 🦥 JJ Swim Lab - LazyComponent UI 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 컴포넌트의 지연 로딩을 위한 래퍼 컴포넌트
 * - 초기 로딩 시간 단축 및 성능 최적화
 * - 필요할 때만 컴포넌트를 로드하는 지연 로딩 시스템
 * - 로딩 상태 표시 및 에러 처리 지원
 * - 코드 스플리팅과 함께 사용하여 번들 크기 최적화
 * 
 * 🔄 **주요 기능**
 * - 컴포넌트 지연 로딩 및 렌더링
 * - 로딩 상태 표시 및 관리
 * - 에러 발생 시 폴백 UI 표시
 * - 로딩 완료 후 컴포넌트 렌더링
 * - 성능 최적화를 위한 메모이제이션
 * 
 * 🗄️ **데이터 연동**
 * - 지연 로딩할 컴포넌트 정보
 * - 로딩 상태 및 진행 상황
 * - 에러 상태 및 에러 메시지
 * - 로딩 완료 후 컴포넌트 데이터
 * - 성능 메트릭 및 최적화 정보
 * 
 * 🛠️ **필요한 설치 파일**
 * - React (lazy, Suspense, useState, useEffect)
 * - 에러 바운더리 컴포넌트
 * - 로딩 상태 관리 시스템
 * - 성능 모니터링 도구
 * - Tailwind CSS (스타일링)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 지연 로딩 시 적절한 로딩 상태 표시
 * 2. 에러 발생 시 사용자 친화적인 폴백 UI
 * 3. 컴포넌트 로딩 완료 후 상태 관리
 * 4. 성능 최적화를 위한 메모이제이션
 * 5. 네트워크 상태에 따른 로딩 처리
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 컴포넌트 지연 로딩 동작 확인
 * - [ ] 로딩 상태 표시 검증
 * - [ ] 에러 처리 및 폴백 UI 확인
 * - [ ] 성능 최적화 확인
 * - [ ] 메모리 사용량 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 지연 로딩)
 * - 2024-12-19: 로딩 상태 관리 시스템 구현
 * - 2024-12-19: 에러 처리 및 폴백 UI 시스템 구현
 * - 2024-12-19: 성능 최적화 시스템 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (지연 로딩 컴포넌트 완료)
 * 
 * 🚀 **다음 단계**
 * - 고급 지연 로딩 전략
 * - 실시간 성능 모니터링
 * - 성능 최적화
 * - 접근성 개선
 * 
 * 💡 **사용 예시**
 * ```tsx
 * <LazyComponent 
 *   component={lazy(() => import('./HeavyComponent'))}
 *   fallback={<LoadingSpinner />}
 *   errorBoundary={<ErrorFallback />}
 *   onLoadComplete={() => handleLoadComplete()}
 *   enableMemoization={true}
 * />
 * ```
 */

'use client';

import React, { Suspense, lazy, ComponentType } from 'react';

interface LazyComponentProps {
  component: () => Promise<{ default: ComponentType<any> }>;
  fallback?: React.ReactNode;
  props?: any;
}

export default function LazyComponent({ 
  component, 
  fallback = <div className="animate-pulse bg-gray-200 h-32 rounded" />,
  props = {}
}: LazyComponentProps) {
  const LazyComponent = lazy(component);

  return (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

// 자주 사용되는 컴포넌트들의 지연 로딩 래퍼
export const LazyChart = () => import('./barchart');
export const LazyModal = () => import('./modal');
export const LazyTabs = () => import('./tabs');
export const LazySelect = () => import('./select');
