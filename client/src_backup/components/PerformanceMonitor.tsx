'use client';

import { useEffect } from 'react';
import { onCLS, onFCP, onLCP, onTTFB } from 'web-vitals';

/**
 * 성능 모니터링 컴포넌트
 * 
 * 📋 **기능**:
 *   - Core Web Vitals 측정
 *   - 페이지 로딩 성능 추적
 *   - 사용자 경험 메트릭 수집
 *   - 성능 데이터 분석
 * 
 * 🔄 **측정 지표**:
 *   - CLS (Cumulative Layout Shift): 레이아웃 안정성
 *   - FID (First Input Delay): 상호작용 지연
 *   - FCP (First Contentful Paint): 첫 콘텐츠 렌더링
 *   - LCP (Largest Contentful Paint): 가장 큰 콘텐츠 렌더링
 *   - TTFB (Time to First Byte): 첫 바이트 응답 시간
 * 
 * ⚠️ **주의사항**:
 *   - 프로덕션 환경에서만 활성화
 *   - 사용자 개인정보 보호 준수
 */

interface PerformanceData {
  name: string;
  value: number;
  delta: number;
  id: string;
  navigationType: string;
}

interface PerformanceMonitorProps {
  onMetric?: (metric: PerformanceData) => void;
  enabled?: boolean;
}

export default function PerformanceMonitor({ 
  onMetric, 
  enabled = process.env.NODE_ENV === 'production' 
}: PerformanceMonitorProps) {
  
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // 성능 데이터 수집 함수
    const collectMetric = (metric: PerformanceData) => {
      // 콘솔에 성능 데이터 출력 (개발 환경)
      if (process.env.NODE_ENV === 'development') {
        console.log(`📊 Performance Metric: ${metric.name}`, {
          value: metric.value,
          delta: metric.delta,
          id: metric.id,
          navigationType: metric.navigationType,
        });
      }

      // 외부 분석 도구로 전송
      if (onMetric) {
        onMetric(metric);
      }

      // Google Analytics로 전송 (있는 경우)
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'web_vitals', {
          name: metric.name,
          value: Math.round(metric.value),
          event_category: 'Performance',
          event_label: metric.id,
        });
      }

      // Sentry로 전송 (있는 경우)
      if (typeof window !== 'undefined' && (window as any).Sentry) {
        (window as any).Sentry.addBreadcrumb({
          category: 'performance',
          message: `Web Vital: ${metric.name}`,
          data: {
            value: metric.value,
            delta: metric.delta,
            id: metric.id,
            navigationType: metric.navigationType,
          },
          level: 'info',
        });
      }
    };

    // Core Web Vitals 측정
    onCLS(collectMetric);
    // onFID는 더 이상 사용되지 않음
    onFCP(collectMetric);
    onLCP(collectMetric);
    onTTFB(collectMetric);

    // 추가 성능 메트릭 수집
    const collectAdditionalMetrics = () => {
      // 페이지 로딩 시간
      if (window.performance && window.performance.timing) {
        const timing = window.performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        
        collectMetric({
          name: 'Page Load Time',
          value: loadTime,
          delta: loadTime,
          id: 'page-load',
          navigationType: 'navigate',
        });
      }

      // DOM 콘텐츠 로딩 시간
      if (window.performance && window.performance.timing) {
        const timing = window.performance.timing;
        const domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
        
        collectMetric({
          name: 'DOM Content Loaded',
          value: domContentLoaded,
          delta: domContentLoaded,
          id: 'dom-content-loaded',
          navigationType: 'navigate',
        });
      }

      // 리소스 로딩 시간
      if (window.performance && window.performance.getEntriesByType) {
        const resources = window.performance.getEntriesByType('resource');
        const totalResourceTime = resources.reduce((total, resource) => {
          return total + (resource.responseEnd - resource.startTime);
        }, 0);
        
        collectMetric({
          name: 'Total Resource Load Time',
          value: totalResourceTime,
          delta: totalResourceTime,
          id: 'resource-load',
          navigationType: 'navigate',
        });
      }
    };

    // 페이지 로드 완료 후 추가 메트릭 수집
    if (document.readyState === 'complete') {
      collectAdditionalMetrics();
    } else {
      window.addEventListener('load', collectAdditionalMetrics);
    }

    // 메모리 사용량 모니터링 (지원하는 경우)
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      if (memory) {
        const memoryUsage = {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit,
        };

        collectMetric({
          name: 'Memory Usage',
          value: memoryUsage.used,
          delta: memoryUsage.used,
          id: 'memory-usage',
          navigationType: 'navigate',
        });
      }
    }

    // 네트워크 연결 정보 수집
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        const connectionInfo = {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
        };

        collectMetric({
          name: 'Network Connection',
          value: connectionInfo.rtt,
          delta: connectionInfo.rtt,
          id: 'network-connection',
          navigationType: 'navigate',
        });
      }
    }

    return () => {
      window.removeEventListener('load', collectAdditionalMetrics);
    };
  }, [onMetric, enabled]);

  return null; // UI 렌더링 없음
}

// Hook으로 사용할 수 있는 성능 모니터링 함수
export const usePerformanceMonitor = () => {
  const trackCustomMetric = (name: string, value: number, category = 'Custom') => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'custom_metric', {
        name,
        value: Math.round(value),
        event_category: category,
      });
    }
  };

  const trackUserInteraction = (action: string, element: string, duration?: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'user_interaction', {
        action,
        element,
        duration: duration ? Math.round(duration) : undefined,
        event_category: 'User Interaction',
      });
    }
  };

  const trackPageVisibility = () => {
    if (typeof window !== 'undefined') {
      const startTime = Date.now();
      
      document.addEventListener('visibilitychange', () => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        if (document.hidden) {
          trackCustomMetric('Page Hidden Duration', duration, 'Visibility');
        } else {
          trackCustomMetric('Page Visible Duration', duration, 'Visibility');
        }
      });
    }
  };

  return {
    trackCustomMetric,
    trackUserInteraction,
    trackPageVisibility,
  };
};


