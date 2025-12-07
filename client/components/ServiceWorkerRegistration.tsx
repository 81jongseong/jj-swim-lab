/**
 * @file ServiceWorkerRegistration 컴포넌트
 * @description PWA를 위한 서비스 워커 등록 컴포넌트
 * @date 2025-01-13
 * @author JJ Swim Lab
 */

'use client';
import { logger } from '@/lib/logger';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // 서비스 워커 등록
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          logger.info('Service Worker registered successfully:', registration);
        })
        .catch((error) => {
          logger.info('Service Worker registration failed:', error);
        });
    }
  }, []);

  return null; // UI를 렌더링하지 않는 컴포넌트
}

