'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // PWA 설치 이벤트 감지
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    // PWA 설치 완료 감지
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      console.log('🎉 PWA가 성공적으로 설치되었습니다!');
    };

    // 이미 설치되어 있는지 확인
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches || 
          (window.navigator as any).standalone === true) {
        setIsInstalled(true);
        setShowInstallPrompt(false);
      }
    };

    // 이벤트 리스너 등록
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // 초기 설치 상태 확인
    checkIfInstalled();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // PWA 설치 실행
  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      // 설치 프롬프트 표시
      await deferredPrompt.prompt();
      
      // 사용자 선택 대기
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('✅ 사용자가 PWA 설치를 수락했습니다');
        setShowInstallPrompt(false);
      } else {
        console.log('❌ 사용자가 PWA 설치를 거부했습니다');
      }
    } catch (error) {
      console.error('PWA 설치 중 오류 발생:', error);
    }

    // 프롬프트 초기화
    setDeferredPrompt(null);
  };

  // 설치 안내 숨기기
  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // 24시간 동안 다시 표시하지 않음
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // 24시간 후 다시 표시
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      
      if (now - dismissedTime < oneDay) {
        setShowInstallPrompt(false);
      } else {
        localStorage.removeItem('pwa-install-dismissed');
      }
    }
  }, []);

  // 이미 설치되었거나 표시하지 않을 경우 렌더링하지 않음
  if (isInstalled || !showInstallPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
        {/* 헤더 */}
        <div className="flex items-start space-x-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xl">J</span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-sm">
              JJ Swim Lab 앱 설치
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              홈 화면에 추가하여 더 빠르게 접근하세요
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 혜택 설명 */}
        <div className="bg-blue-50 rounded-lg p-3 mb-3">
          <div className="text-xs text-blue-800 space-y-1">
            <div className="flex items-center">
              <span className="text-blue-600 mr-2">✓</span>
              오프라인에서도 모든 기능 사용
            </div>
            <div className="flex items-center">
              <span className="text-blue-600 mr-2">✓</span>
              네이티브 앱처럼 빠른 속도
            </div>
            <div className="flex items-center">
              <span className="text-blue-600 mr-2">✓</span>
              홈 화면에서 바로 접근
            </div>
          </div>
        </div>

        {/* 설치 버튼 */}
        <div className="flex space-x-2">
          <button
            onClick={handleInstallClick}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            📱 앱 설치하기
          </button>
          <button
            onClick={handleDismiss}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm transition-colors"
          >
            나중에
          </button>
        </div>

        {/* 설치 방법 안내 */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            설치 후 홈 화면에서 바로 실행할 수 있습니다
          </p>
        </div>
      </div>
    </div>
  );
}


