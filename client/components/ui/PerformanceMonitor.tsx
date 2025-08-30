/**
 * ✅ JJ Swim Lab - 성능 모니터링 컴포넌트
 * 
 * 📋 **기능**
 * - 페이지 로딩 성능 측정
 * - Core Web Vitals 모니터링
 * - 성능 메트릭 수집 및 로깅
 * - 개발 환경에서 성능 정보 표시
 */

'use client';

import React, { useEffect, useState } from 'react';

interface PerformanceMetrics {
  pageLoadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
}

interface PerformanceMonitorProps {
  pageName: string;
  onMetrics?: (metrics: PerformanceMetrics) => void;
  showDebugInfo?: boolean;
}

export function PerformanceMonitor({ 
  pageName, 
  onMetrics, 
  showDebugInfo = process.env.NODE_ENV === 'development' 
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);

  useEffect(() => {
    const startTime = performance.now();
    
    // Observer 변수들을 함수 스코프 내에서 선언
    let lcpObserver: PerformanceObserver | null = null;
    let clsObserver: PerformanceObserver | null = null;
    let fidObserver: PerformanceObserver | null = null;

    // 페이지 로드 완료 시점 측정
    const handleLoad = () => {
      const loadTime = performance.now() - startTime;
      
      // DOM 콘텐츠 로드 완료 시점
      const domContentLoaded = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      // Core Web Vitals 측정
      let firstContentfulPaint = 0;
      let largestContentfulPaint = 0;
      let cumulativeLayoutShift = 0;
      let firstInputDelay = 0;

      // First Contentful Paint
      const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
      if (fcpEntry) {
        firstContentfulPaint = fcpEntry.startTime;
      }

      // Largest Contentful Paint
      lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          largestContentfulPaint = lastEntry.startTime;
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Cumulative Layout Shift
      clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutShiftEntry = entry as any;
          if (!layoutShiftEntry.hadRecentInput) {
            cumulativeLayoutShift += layoutShiftEntry.value || 0;
          }
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // First Input Delay
      fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const firstInputEntry = entry as any;
          if (firstInputEntry.processingStart && firstInputEntry.startTime) {
            firstInputDelay = firstInputEntry.processingStart - firstInputEntry.startTime;
            break;
          }
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      const performanceMetrics: PerformanceMetrics = {
        pageLoadTime: loadTime,
        domContentLoaded: domContentLoaded?.domContentLoadedEventEnd || 0,
        firstContentfulPaint,
        largestContentfulPaint,
        cumulativeLayoutShift,
        firstInputDelay
      };

      setMetrics(performanceMetrics);
      onMetrics?.(performanceMetrics);

      // 성능 로깅
      console.log(`🚀 ${pageName} 성능 메트릭:`, performanceMetrics);

      // 성능 점수 계산
      const performanceScore = calculatePerformanceScore(performanceMetrics);
      console.log(`📊 ${pageName} 성능 점수: ${performanceScore}/100`);

      // 성능 경고 (개발 환경)
      if (process.env.NODE_ENV === 'development') {
        if (loadTime > 3000) {
          console.warn(`⚠️ ${pageName} 로딩 시간이 3초를 초과합니다: ${loadTime.toFixed(0)}ms`);
        }
        if (cumulativeLayoutShift > 0.1) {
          console.warn(`⚠️ ${pageName} CLS가 0.1을 초과합니다: ${cumulativeLayoutShift.toFixed(3)}`);
        }
      }
    };

    // 이벤트 리스너 등록
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', handleLoad);
    } else {
      handleLoad();
    }

    window.addEventListener('load', handleLoad);

    // 정리 함수
    return () => {
      document.removeEventListener('DOMContentLoaded', handleLoad);
      window.removeEventListener('load', handleLoad);
      lcpObserver?.disconnect();
      clsObserver?.disconnect();
      fidObserver?.disconnect();
    };
  }, [pageName, onMetrics]);

  // 성능 점수 계산
  const calculatePerformanceScore = (metrics: PerformanceMetrics): number => {
    let score = 100;

    // 페이지 로딩 시간 (3초 이상 시 감점)
    if (metrics.pageLoadTime > 3000) {
      score -= Math.min(30, (metrics.pageLoadTime - 3000) / 100);
    }

    // CLS (0.1 이상 시 감점)
    if (metrics.cumulativeLayoutShift > 0.1) {
      score -= Math.min(20, metrics.cumulativeLayoutShift * 200);
    }

    // FID (100ms 이상 시 감점)
    if (metrics.firstInputDelay > 100) {
      score -= Math.min(20, (metrics.firstInputDelay - 100) / 10);
    }

    return Math.max(0, Math.round(score));
  };

  // 개발 환경에서만 성능 정보 표시
  if (!showDebugInfo || !metrics) {
    return null;
  }

  const performanceScore = calculatePerformanceScore(metrics);

  return (
    <div className="fixed bottom-4 left-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-900">성능 모니터</h3>
        <span className={`text-xs px-2 py-1 rounded-full ${
          performanceScore >= 90 ? 'bg-green-100 text-green-800' :
          performanceScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {performanceScore}/100
        </span>
      </div>
      
      <div className="space-y-1 text-xs text-gray-600">
        <div>페이지: {pageName}</div>
        <div>로딩: {metrics.pageLoadTime.toFixed(0)}ms</div>
        <div>FCP: {metrics.firstContentfulPaint.toFixed(0)}ms</div>
        <div>CLS: {metrics.cumulativeLayoutShift.toFixed(3)}</div>
        <div>FID: {metrics.firstInputDelay.toFixed(0)}ms</div>
      </div>
    </div>
  );
}

export default PerformanceMonitor;
