"use client";

import { useState, useEffect } from 'react';
import useEnhancedOffline from '../hooks/useEnhancedOffline';
import Button from './ui/Button';
import Card from './ui/Card';
import Badge from './ui/Badge';

export default function EnhancedOfflineIndicator() {
  const [isMounted, setIsMounted] = useState(false);
  
  // 클라이언트에서만 훅 사용 (hydration 오류 방지)
  const {
    isOnline,
    isDBReady,
    isPreloading,
    offlineData,
    stats,
    preloadData,
    saveOfflineData,
    syncOfflineData,
    clearOfflineData
  } = useEnhancedOffline();

  const [showOfflineData, setShowOfflineData] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // 클라이언트 마운트 후에만 실행
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 클라이언트가 마운트되지 않았으면 아무것도 렌더링하지 않음
  if (!isMounted) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* 온라인/오프라인 상태 표시 */}
      <div className="mb-2">
        <Badge 
          variant={isOnline ? "default" : "destructive"}
          className="text-xs"
        >
          {isOnline ? '🟢 온라인' : '🔴 오프라인'}
        </Badge>
      </div>

      {/* 오프라인 데이터베이스 상태 */}
      {isDBReady && (
        <Card className="p-3 bg-background/80 backdrop-blur-sm border shadow-lg">
          <div className="space-y-2">
            {/* 데이터베이스 상태 */}
            <div className="flex items-center justify-between text-xs">
              <span>데이터베이스:</span>
              <Badge variant="outline" className="text-xs">
                {isDBReady ? '✅ 준비됨' : '⏳ 초기화 중'}
              </Badge>
            </div>

            {/* 프리로딩 상태 */}
            {isPreloading && (
              <div className="text-xs text-muted-foreground">
                🔄 데이터 프리로딩 중...
              </div>
            )}

            {/* 통계 정보 */}
            {stats && (
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span>강습법:</span>
                  <span className="font-mono">{stats.teachingMethods}</span>
                </div>
                <div className="flex justify-between">
                  <span>학생:</span>
                  <span className="font-mono">{stats.students}</span>
                </div>
                <div className="flex justify-between">
                  <span>오프라인 액션:</span>
                  <span className="font-mono">{stats.offlineActions}</span>
                </div>
              </div>
            )}

            {/* 액션 버튼들 */}
            <div className="flex flex-wrap gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={preloadData}
                disabled={isPreloading || !isOnline}
                className="text-xs h-6 px-2"
              >
                📥 프리로딩
              </Button>

              {offlineData.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={syncOfflineData}
                  disabled={!isOnline}
                  className="text-xs h-6 px-2"
                >
                  🔄 동기화 ({offlineData.length})
                </Button>
              )}

              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowOfflineData(!showOfflineData)}
                className="text-xs h-6 px-2"
              >
                📱 오프라인 데이터
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowStats(!showStats)}
                className="text-xs h-6 px-2"
              >
                📊 통계
              </Button>

              <Button
                size="sm"
                variant="danger"
                onClick={clearOfflineData}
                className="text-xs h-6 px-2"
              >
                🗑️ 정리
              </Button>
            </div>

            {/* 오프라인 데이터 상세 보기 */}
            {showOfflineData && offlineData.length > 0 && (
              <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                <div className="font-semibold mb-1">📱 오프라인 액션:</div>
                {offlineData.map((item, index) => (
                  <div key={index} className="mb-1 p-1 bg-background rounded">
                    <div className="flex justify-between">
                      <span className="font-mono">{item.type}</span>
                      <span className="text-muted-foreground">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 통계 상세 보기 */}
            {showStats && stats && (
              <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                <div className="font-semibold mb-1">📊 상세 통계:</div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>강습법:</span>
                    <span className="font-mono">{stats.teachingMethods}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>학생:</span>
                    <span className="font-mono">{stats.students}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>사용자 프로필:</span>
                    <span className="font-mono">{stats.userProfiles}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>오프라인 액션:</span>
                    <span className="font-mono">{stats.offlineActions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>캐시된 페이지:</span>
                    <span className="font-mono">{stats.cachedPages}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
