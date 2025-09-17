'use client';

import { useEffect } from 'react';
import Script from 'next/script';

/**
 * Google Analytics 컴포넌트
 * 
 * 📋 **기능**:
 *   - 페이지 뷰 추적
 *   - 사용자 행동 분석
 *   - 성능 메트릭 수집
 *   - 이벤트 추적
 * 
 * 🔄 **사용법**:
 *   - _app.tsx에서 전역으로 사용
 *   - 환경변수 NEXT_PUBLIC_GA_ID 설정 필요
 * 
 * ⚠️ **주의사항**:
 *   - 프로덕션 환경에서만 활성화
 *   - 개인정보 보호 정책 준수 필요
 */

interface AnalyticsProps {
  gaId?: string;
}

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export default function Analytics({ gaId }: AnalyticsProps) {
  const GA_ID = gaId || process.env.NEXT_PUBLIC_GA_ID;

  useEffect(() => {
    if (typeof window !== 'undefined' && GA_ID) {
      // Google Analytics 초기화
      window.gtag = window.gtag || function() {
        (window.gtag as any).q = (window.gtag as any).q || [];
        (window.gtag as any).q.push(arguments);
      };
      
      window.gtag('js', new Date());
      window.gtag('config', GA_ID, {
        page_title: document.title,
        page_location: window.location.href,
      });
    }
  }, [GA_ID]);

  // 페이지 뷰 추적 함수
  const trackPageView = (url: string) => {
    if (typeof window !== 'undefined' && window.gtag && GA_ID) {
      window.gtag('config', GA_ID, {
        page_path: url,
      });
    }
  };

  // 이벤트 추적 함수
  const trackEvent = (action: string, category: string, label?: string, value?: number) => {
    if (typeof window !== 'undefined' && window.gtag && GA_ID) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    }
  };

  // 사용자 정의 이벤트 추적
  const trackCustomEvent = (eventName: string, parameters?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.gtag && GA_ID) {
      window.gtag('event', eventName, parameters);
    }
  };

  // 성능 측정
  const trackPerformance = () => {
    if (typeof window !== 'undefined' && window.gtag && GA_ID) {
      // Core Web Vitals 추적
      if ('web-vital' in window) {
        import('web-vitals').then(({ onCLS, onFCP, onLCP, onTTFB }) => {
          onCLS((metric) => {
            window.gtag('event', 'web_vitals', {
              name: 'CLS',
              value: Math.round(metric.value * 1000),
            });
          });

          // onFID는 더 이상 사용되지 않음

          onFCP((metric) => {
            window.gtag('event', 'web_vitals', {
              name: 'FCP',
              value: Math.round(metric.value),
            });
          });

          onLCP((metric) => {
            window.gtag('event', 'web_vitals', {
              name: 'LCP',
              value: Math.round(metric.value),
            });
          });

          onTTFB((metric) => {
            window.gtag('event', 'web_vitals', {
              name: 'TTFB',
              value: Math.round(metric.value),
            });
          });
        });
      }
    }
  };

  useEffect(() => {
    // 성능 측정 시작
    trackPerformance();
  }, []);

  if (!GA_ID || process.env.NODE_ENV !== 'production') {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  );
}

// Hook으로 사용할 수 있는 함수들 export
export const useAnalytics = () => {
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

  const trackPageView = (url: string) => {
    if (typeof window !== 'undefined' && window.gtag && GA_ID) {
      window.gtag('config', GA_ID, {
        page_path: url,
      });
    }
  };

  const trackEvent = (action: string, category: string, label?: string, value?: number) => {
    if (typeof window !== 'undefined' && window.gtag && GA_ID) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    }
  };

  const trackCustomEvent = (eventName: string, parameters?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.gtag && GA_ID) {
      window.gtag('event', eventName, parameters);
    }
  };

  return {
    trackPageView,
    trackEvent,
    trackCustomEvent,
  };
};


