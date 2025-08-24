'use client';

import { Suspense, lazy, ComponentType } from 'react';

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
export const LazyChart = () => import('./BarChart');
export const LazyModal = () => import('./Modal');
export const LazyTabs = () => import('./Tabs');
export const LazySelect = () => import('./Select');
