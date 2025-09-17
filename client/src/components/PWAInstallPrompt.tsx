'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { X, Download, Smartphone, Monitor } from 'lucide-react';

/**
 * PWA 설치 프롬프트 컴포넌트
 * 
 * 📋 **기능**:
 *   - PWA 설치 가능 여부 감지
 *   - 설치 프롬프트 표시
 *   - 설치 상태 관리
 *   - 다양한 플랫폼 지원
 * 
 * 🔄 **지원 플랫폼**:
 *   - Chrome/Edge (beforeinstallprompt)
 *   - Safari (iOS)
 *   - Firefox (Android)
 * 
 * ⚠️ **주의사항**:
 *   - 사용자 경험 최적화
 *   - 설치 거부 시 재표시 방지
 *   - 플랫폼별 다른 동작
 */

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAInstallPromptProps {
  onInstall?: () => void;
  onDismiss?: () => void;
  showAfterDelay?: number; // 밀리초
  maxShowCount?: number; // 최대 표시 횟수
}

export default function PWAInstallPrompt({
  onInstall,
  onDismiss,
  showAfterDelay = 3000,
  maxShowCount = 3,
}: PWAInstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showCount, setShowCount] = useState(0);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop' | 'unknown'>('unknown');

  useEffect(() => {
    // 설치 상태 확인
    checkInstallStatus();
    
    // 플랫폼 감지
    detectPlatform();
    
    // beforeinstallprompt 이벤트 리스너
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      
      // 표시 횟수 확인
      const storedCount = localStorage.getItem('pwa-install-show-count');
      const count = storedCount ? parseInt(storedCount) : 0;
      
      if (count < maxShowCount) {
        setTimeout(() => {
          setShowPrompt(true);
          setShowCount(count + 1);
          localStorage.setItem('pwa-install-show-count', (count + 1).toString());
        }, showAfterDelay);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 앱 설치 완료 감지
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      localStorage.setItem('pwa-installed', 'true');
      onInstall?.();
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [showAfterDelay, maxShowCount, onInstall]);

  // 설치 상태 확인
  const checkInstallStatus = () => {
    const installed = localStorage.getItem('pwa-installed') === 'true';
    const dismissed = localStorage.getItem('pwa-install-dismissed') === 'true';
    
    setIsInstalled(installed);
    
    if (installed || dismissed) {
      setShowPrompt(false);
    }
  };

  // 플랫폼 감지
  const detectPlatform = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setPlatform('ios');
    } else if (/android/.test(userAgent)) {
      setPlatform('android');
    } else if (/windows|macintosh|linux/.test(userAgent)) {
      setPlatform('desktop');
    } else {
      setPlatform('unknown');
    }
  };

  // 설치 실행
  const handleInstall = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        
        if (choiceResult.outcome === 'accepted') {
          console.log('✅ PWA 설치 승인됨');
          onInstall?.();
        } else {
          console.log('❌ PWA 설치 거부됨');
        }
        
        setDeferredPrompt(null);
        setShowPrompt(false);
        
      } catch (error) {
        console.error('❌ PWA 설치 중 오류:', error);
      }
    }
  };

  // 프롬프트 닫기
  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
    onDismiss?.();
  };

  // iOS 설치 안내
  const renderIOSInstructions = () => (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <div className="text-center p-6 pb-0">
        <h3 className="flex items-center justify-center gap-2 text-lg font-semibold">
          <Smartphone className="h-6 w-6 text-blue-600" />
          앱 설치하기
        </h3>
        <p className="text-sm text-gray-600">
          홈 화면에 JJ Swim Lab을 추가하세요
        </p>
      </div>
      <div className="space-y-4 p-6 pt-0">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
              1
            </div>
            <span className="text-sm">Safari 하단의 공유 버튼을 탭하세요</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
              2
            </div>
            <span className="text-sm">"홈 화면에 추가"를 선택하세요</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
              3
            </div>
            <span className="text-sm">"추가"를 탭하여 설치를 완료하세요</span>
          </div>
        </div>
        <Button onClick={handleDismiss} variant="outline" className="w-full">
          나중에 하기
        </Button>
      </div>
    </Card>
  );

  // Android 설치 안내
  const renderAndroidInstructions = () => (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <div className="text-center p-6 pb-0">
        <h3 className="flex items-center justify-center gap-2 text-lg font-semibold">
          <Smartphone className="h-6 w-6 text-green-600" />
          앱 설치하기
        </h3>
        <p className="text-sm text-gray-600">
          Chrome에서 JJ Swim Lab을 설치하세요
        </p>
      </div>
      <div className="space-y-4 p-6 pt-0">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">
              1
            </div>
            <span className="text-sm">Chrome 메뉴(⋮)를 탭하세요</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">
              2
            </div>
            <span className="text-sm">"홈 화면에 추가"를 선택하세요</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">
              3
            </div>
            <span className="text-sm">"설치"를 탭하여 완료하세요</span>
          </div>
        </div>
        <Button onClick={handleDismiss} variant="outline" className="w-full">
          나중에 하기
        </Button>
      </div>
    </Card>
  );

  // 데스크톱 설치 프롬프트
  const renderDesktopPrompt = () => (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <div className="text-center p-6 pb-0">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 h-8 w-8 p-0"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
        <h3 className="flex items-center justify-center gap-2 text-lg font-semibold">
          <Monitor className="h-6 w-6 text-blue-600" />
          앱 설치하기
        </h3>
        <p className="text-sm text-gray-600">
          JJ Swim Lab을 데스크톱 앱으로 설치하세요
        </p>
      </div>
      <div className="space-y-4 p-6 pt-0">
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            더 빠른 접근과 오프라인 사용을 위해 앱을 설치하세요
          </p>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>• 빠른 시작 및 오프라인 지원</li>
            <li>• 독립적인 창으로 실행</li>
            <li>• 시스템 트레이 통합</li>
          </ul>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleInstall} className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            설치하기
          </Button>
          <Button onClick={handleDismiss} variant="outline">
            나중에
          </Button>
        </div>
      </div>
    </Card>
  );

  // 이미 설치된 경우
  if (isInstalled) {
    return null;
  }

  // 프롬프트 표시 조건 확인
  if (!showPrompt) {
    return null;
  }

  // 플랫폼별 렌더링
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="relative">
        {platform === 'ios' && renderIOSInstructions()}
        {platform === 'android' && renderAndroidInstructions()}
        {(platform === 'desktop' || platform === 'unknown') && renderDesktopPrompt()}
      </div>
    </div>
  );
}

// Hook으로 사용할 수 있는 PWA 설치 관련 함수들
export const usePWAInstall = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 설치 가능 여부 확인
    const checkInstallability = () => {
      const installed = localStorage.getItem('pwa-installed') === 'true';
      setIsInstalled(installed);
    };

    // beforeinstallprompt 이벤트 리스너
    const handleBeforeInstallPrompt = () => {
      setIsInstallable(true);
    };

    // 앱 설치 완료 감지
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      localStorage.setItem('pwa-installed', 'true');
    };

    checkInstallability();
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    }
  };

  return {
    isInstallable,
    isInstalled,
    install,
  };
};


