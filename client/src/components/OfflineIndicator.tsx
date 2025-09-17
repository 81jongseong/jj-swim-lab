'use client';

import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

/**
 * 오프라인 상태 표시 컴포넌트
 * 
 * 📋 **기능**:
 *   - 온라인/오프라인 상태 감지
 *   - 연결 상태 시각적 표시
 *   - 재연결 시도 기능
 *   - 오프라인 데이터 동기화
 * 
 * 🔄 **상태 관리**:
 *   - 온라인: 정상 연결 상태
 *   - 오프라인: 연결 끊김 상태
 *   - 재연결 중: 연결 시도 중
 * 
 * ⚠️ **주의사항**:
 *   - 사용자 경험 최적화
 *   - 데이터 손실 방지
 *   - 자동 재연결 시도
 */

interface OfflineIndicatorProps {
  onReconnect?: () => void;
  showWhenOnline?: boolean;
  position?: 'top' | 'bottom' | 'fixed';
  autoHide?: boolean;
  hideDelay?: number;
}

export default function OfflineIndicator({
  onReconnect,
  showWhenOnline = false,
  position = 'top',
  autoHide = true,
  hideDelay = 3000,
}: OfflineIndicatorProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [showIndicator, setShowIndicator] = useState(false);
  const [lastOfflineTime, setLastOfflineTime] = useState<Date | null>(null);
  const [offlineDuration, setOfflineDuration] = useState(0);

  useEffect(() => {
    // 초기 온라인 상태 설정
    setIsOnline(navigator.onLine);

    // 온라인 상태 변경 이벤트 리스너
    const handleOnline = () => {
      setIsOnline(true);
      setIsReconnecting(false);
      
      if (lastOfflineTime) {
        const duration = Date.now() - lastOfflineTime.getTime();
        setOfflineDuration(duration);
      }
      
      // 온라인 상태 표시
      if (showWhenOnline) {
        setShowIndicator(true);
        if (autoHide) {
          setTimeout(() => setShowIndicator(false), hideDelay);
        }
      } else {
        setShowIndicator(false);
      }
      
      // 재연결 콜백 실행
      onReconnect?.();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsReconnecting(false);
      setShowIndicator(true);
      setLastOfflineTime(new Date());
    };

    // 네트워크 상태 변경 이벤트 등록
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 주기적 연결 상태 확인
    const checkConnection = async () => {
      try {
        const response = await fetch('/api/health', {
          method: 'HEAD',
          cache: 'no-cache',
        });
        setIsOnline(response.ok);
      } catch (error) {
        setIsOnline(false);
      }
    };

    const connectionCheckInterval = setInterval(checkConnection, 30000); // 30초마다 확인

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(connectionCheckInterval);
    };
  }, [onReconnect, showWhenOnline, autoHide, hideDelay, lastOfflineTime]);

  // 수동 재연결 시도
  const handleReconnect = async () => {
    setIsReconnecting(true);
    
    try {
      const response = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-cache',
      });
      
      if (response.ok) {
        setIsOnline(true);
        setShowIndicator(false);
        onReconnect?.();
      } else {
        throw new Error('Connection failed');
      }
    } catch (error) {
      console.error('재연결 실패:', error);
      // 재연결 실패 시 잠시 후 다시 시도
      setTimeout(() => setIsReconnecting(false), 2000);
    }
  };

  // 오프라인 상태일 때만 표시
  if (!showIndicator && !showWhenOnline) {
    return null;
  }

  // 온라인 상태이고 showWhenOnline이 false면 표시하지 않음
  if (isOnline && !showWhenOnline) {
    return null;
  }

  // 위치별 스타일 설정
  const getPositionStyles = () => {
    switch (position) {
      case 'top':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'bottom':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      case 'fixed':
        return 'fixed top-4 right-4';
      default:
        return 'top-4 left-1/2 transform -translate-x-1/2';
    }
  };

  // 오프라인 상태 표시
  if (!isOnline) {
    return (
      <div className={`absolute ${getPositionStyles()} z-50`}>
        <Card className="bg-red-50 border-red-200 shadow-lg">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <WifiOff className="h-5 w-5 text-red-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">
                  오프라인 상태
                </p>
                <p className="text-xs text-red-600">
                  인터넷 연결을 확인해주세요
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleReconnect}
                disabled={isReconnecting}
                className="text-red-600 border-red-300 hover:bg-red-100"
              >
                {isReconnecting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // 온라인 상태 표시 (showWhenOnline이 true일 때)
  if (isOnline && showWhenOnline && showIndicator) {
    return (
      <div className={`absolute ${getPositionStyles()} z-50`}>
        <Card className="bg-green-50 border-green-200 shadow-lg">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <Wifi className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">
                  온라인 상태
                </p>
                <p className="text-xs text-green-600">
                  연결이 복구되었습니다
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowIndicator(false)}
                className="text-green-600 hover:bg-green-100"
              >
                ✕
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return null;
}

// Hook으로 사용할 수 있는 네트워크 상태 관리
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [connectionType, setConnectionType] = useState<string>('unknown');
  const [effectiveType, setEffectiveType] = useState<string>('unknown');

  useEffect(() => {
    // 초기 상태 설정
    setIsOnline(navigator.onLine);

    // 연결 정보 가져오기
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      setConnectionType(connection.type || 'unknown');
      setEffectiveType(connection.effectiveType || 'unknown');
    }

    // 온라인/오프라인 이벤트 리스너
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 연결 품질 확인
  const getConnectionQuality = () => {
    if (!isOnline) return 'offline';
    
    switch (effectiveType) {
      case 'slow-2g':
      case '2g':
        return 'slow';
      case '3g':
        return 'medium';
      case '4g':
        return 'fast';
      default:
        return 'unknown';
    }
  };

  // 데이터 절약 모드 확인
  const isDataSaver = () => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return connection.saveData || false;
    }
    return false;
  };

  return {
    isOnline,
    connectionType,
    effectiveType,
    connectionQuality: getConnectionQuality(),
    isDataSaver: isDataSaver(),
  };
};


