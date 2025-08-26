'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    // Service Worker 등록을 완전히 비활성화
    console.log('🚫 Service Worker 등록이 비활성화되었습니다');
    
    // 기존 Service Worker 제거
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (let registration of registrations) {
          registration.unregister();
          console.log('🗑️ 기존 Service Worker 제거됨');
        }
      });
    }
  }, []);

  return null; // 이 컴포넌트는 UI를 렌더링하지 않습니다
}

