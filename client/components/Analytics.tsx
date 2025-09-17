/**
 * @file Analytics 컴포넌트
 * @description 웹 분석 및 사용자 행동 추적을 위한 컴포넌트
 * @date 2025-01-13
 * @author JJ Swim Lab
 */

'use client';

import { useEffect } from 'react';

interface AnalyticsProps {
  trackingId?: string;
}

export default function Analytics({ trackingId }: AnalyticsProps) {
  useEffect(() => {
    // Google Analytics 또는 다른 분석 도구 초기화
    if (typeof window !== 'undefined' && trackingId) {
      // 실제 분석 도구 연동 코드는 여기에 구현
      console.log('Analytics initialized with tracking ID:', trackingId);
    }
  }, [trackingId]);

  return null; // UI를 렌더링하지 않는 컴포넌트
}

