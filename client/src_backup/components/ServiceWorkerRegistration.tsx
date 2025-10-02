'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/ui/button';
import Card from '@/components/ui/card';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

/**
 * 서비스 워커 등록 및 관리 컴포넌트
 * 
 * 📋 **기능**:
 *   - 서비스 워커 등록 및 업데이트
 *   - 캐시 관리 및 정리
 *   - 오프라인 지원 활성화
 *   - 업데이트 알림 및 적용
 * 
 * 🔄 **생명주기**:
 *   - 설치: 서비스 워커 등록
 *   - 활성화: 캐시 정리 및 업데이트
 *   - 업데이트: 새 버전 감지 및 적용
 * 
 * ⚠️ **주의사항**:
 *   - 브라우저 호환성 확인
 *   - 캐시 크기 관리
 *   - 업데이트 전략 설정
 */

interface ServiceWorkerRegistrationProps {
  onUpdate?: () => void;
  onError?: (error: Error) => void;
  autoUpdate?: boolean;
  showUpdatePrompt?: boolean;
}

export default function ServiceWorkerRegistration({
  onUpdate,
  onError,
  autoUpdate = true,
  showUpdatePrompt = true,
}: ServiceWorkerRegistrationProps) {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // 서비스 워커 지원 여부 확인
    if ('serviceWorker' in navigator) {
      setIsSupported(true);
      registerServiceWorker();
    } else {
      setIsSupported(false);
      setError('이 브라우저는 서비스 워커를 지원하지 않습니다.');
    }
  }, []);

  // 서비스 워커 등록
  const registerServiceWorker = async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      setRegistration(reg);
      console.log('✅ 서비스 워커 등록 완료:', reg);

      // 업데이트 감지
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // 새 버전 사용 가능
                setUpdateAvailable(true);
                if (showUpdatePrompt) {
                  showUpdateNotification();
                }
              } else {
                // 첫 설치 완료
                console.log('✅ 서비스 워커 첫 설치 완료');
              }
            }
          });
        }
      });

      // 서비스 워커 메시지 처리
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SW_UPDATE_AVAILABLE') {
          setUpdateAvailable(true);
        }
      });

    } catch (error) {
      console.error('❌ 서비스 워커 등록 실패:', error);
      setError('서비스 워커 등록에 실패했습니다.');
      onError?.(error as Error);
    }
  };

  // 업데이트 알림 표시
  const showUpdateNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('JJ Swim Lab 업데이트', {
        body: '새로운 버전이 사용 가능합니다. 업데이트하시겠습니까?',
        icon: '/icons/manifest-icon-192.maskable.png',
        tag: 'sw-update',
      });
    }
  };

  // 업데이트 적용
  const applyUpdate = async () => {
    if (!registration || !registration.waiting) return;

    setIsUpdating(true);

    try {
      // 새 서비스 워커에게 업데이트 신호 전송
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });

      // 페이지 새로고침으로 새 버전 적용
      window.location.reload();
      
      onUpdate?.();
    } catch (error) {
      console.error('❌ 업데이트 적용 실패:', error);
      setError('업데이트 적용에 실패했습니다.');
    } finally {
      setIsUpdating(false);
    }
  };

  // 캐시 정리
  const clearCache = async () => {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('✅ 캐시 정리 완료');
      }
    } catch (error) {
      console.error('❌ 캐시 정리 실패:', error);
    }
  };

  // 서비스 워커 해제
  const unregisterServiceWorker = async () => {
    try {
      if (registration) {
        await registration.unregister();
        await clearCache();
        setRegistration(null);
        console.log('✅ 서비스 워커 해제 완료');
      }
    } catch (error) {
      console.error('❌ 서비스 워커 해제 실패:', error);
    }
  };

  // 서비스 워커 상태 확인
  const checkServiceWorkerStatus = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          console.log('서비스 워커 상태:', {
            active: reg.active?.state,
            installing: reg.installing?.state,
            waiting: reg.waiting?.state,
            scope: reg.scope,
          });
        }
      }
    } catch (error) {
      console.error('❌ 서비스 워커 상태 확인 실패:', error);
    }
  };

  // 지원하지 않는 브라우저
  if (!isSupported) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <div className="p-6 pb-0">
          <h3 className="flex items-center gap-2 text-red-600 text-lg font-semibold">
            <AlertCircle className="h-5 w-5" />
            서비스 워커 미지원
          </h3>
        </div>
        <div className="p-6 pt-0">
          <p className="text-sm text-gray-600">
            이 브라우저는 서비스 워커를 지원하지 않습니다.
            오프라인 기능을 사용하려면 최신 브라우저를 사용해주세요.
          </p>
        </div>
      </Card>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <div className="p-6 pb-0">
          <h3 className="flex items-center gap-2 text-red-600 text-lg font-semibold">
            <AlertCircle className="h-5 w-5" />
            오류 발생
          </h3>
        </div>
        <div className="p-6 pt-0">
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <Button onClick={registerServiceWorker} variant="outline" size="sm">
            다시 시도
          </Button>
        </div>
      </Card>
    );
  }

  // 업데이트 사용 가능
  if (updateAvailable && showUpdatePrompt) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <div className="p-6 pb-0">
          <h3 className="flex items-center gap-2 text-blue-600 text-lg font-semibold">
            <RefreshCw className="h-5 w-5" />
            업데이트 사용 가능
          </h3>
          <p className="text-sm text-gray-600">
            새로운 버전이 사용 가능합니다.
          </p>
        </div>
        <div className="space-y-4 p-6 pt-0">
          <p className="text-sm text-gray-600">
            최신 기능과 개선사항을 적용하려면 업데이트하세요.
          </p>
          <div className="flex gap-2">
            <Button 
              onClick={applyUpdate} 
              disabled={isUpdating}
              className="flex-1"
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  업데이트 중...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  업데이트 적용
                </>
              )}
            </Button>
            <Button 
              onClick={() => setUpdateAvailable(false)} 
              variant="outline"
            >
              나중에
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // 정상 상태
  return (
    <Card className="w-full max-w-md mx-auto">
      <div className="p-6 pb-0">
        <h3 className="flex items-center gap-2 text-green-600 text-lg font-semibold">
          <CheckCircle className="h-5 w-5" />
          서비스 워커 활성
        </h3>
        <p className="text-sm text-gray-600">
          오프라인 지원이 활성화되었습니다.
        </p>
      </div>
      <div className="space-y-4 p-6 pt-0">
        <div className="text-sm text-gray-600 space-y-2">
          <p>• 오프라인에서도 앱 사용 가능</p>
          <p>• 빠른 로딩을 위한 캐시 활용</p>
          <p>• 백그라운드 동기화 지원</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={checkServiceWorkerStatus} variant="outline" size="sm">
            상태 확인
          </Button>
          <Button onClick={clearCache} variant="outline" size="sm">
            캐시 정리
          </Button>
        </div>
      </div>
    </Card>
  );
}

// Hook으로 사용할 수 있는 서비스 워커 관리 함수들
export const useServiceWorker = () => {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      setIsSupported(true);
      
      navigator.serviceWorker.getRegistration()
        .then(reg => {
          setRegistration(reg);
          
          if (reg) {
            reg.addEventListener('updatefound', () => {
              setUpdateAvailable(true);
            });
          }
        });
    }
  }, []);

  const register = async () => {
    if (!isSupported) return null;
    
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      setRegistration(reg);
      return reg;
    } catch (error) {
      console.error('서비스 워커 등록 실패:', error);
      return null;
    }
  };

  const unregister = async () => {
    if (registration) {
      await registration.unregister();
      setRegistration(null);
    }
  };

  const applyUpdate = async () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  return {
    registration,
    isSupported,
    updateAvailable,
    register,
    unregister,
    applyUpdate,
  };
};


