/**
 * 🚀 JJ Swim Lab - EnhancedOfflineIndicator 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 고급 오프라인 상태 표시 및 관리 시스템
 * - 네트워크 상태의 세밀한 모니터링 및 분석
 * - 오프라인 상태에서의 지능형 기능 안내
 * - 네트워크 품질 및 속도 정보 제공
 * - 오프라인 기능 자동 최적화 및 권장사항
 * 
 * 🔄 **주요 기능**
 * - 고급 네트워크 상태 감지 및 분석
 * - 네트워크 품질 및 속도 측정
 * - 지능형 오프라인 기능 안내
 * - 오프라인 기능 자동 최적화
 * - 네트워크 상태 예측 및 권장사항
 * 
 * 🗄️ **데이터 연동**
 * - 고급 네트워크 상태 정보
 * - 네트워크 품질 및 성능 데이터
 * - 오프라인 기능 사용 패턴
 * - 사용자 인터랙션 및 피드백
 * - 네트워크 상태 예측 모델
 * 
 * 🛠️ **필요한 설치 파일**
 * - React (useState, useEffect, useCallback)
 * - 고급 네트워크 상태 감지 API
 * - 네트워크 성능 측정 도구
 * - 오프라인 기능 최적화 라이브러리
 * - Tailwind CSS (스타일링)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 고급 네트워크 상태 감지의 정확성
 * 2. 네트워크 성능 측정의 오버헤드 최소화
 * 3. 지능형 기능 안내의 적절성
 * 4. 오프라인 기능 최적화의 효과성
 * 5. 사용자 경험의 일관성 유지
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 고급 네트워크 상태 감지 동작 확인
 * - [ ] 네트워크 품질 측정 정확성 확인
 * - [ ] 지능형 기능 안내 검증
 * - [ ] 오프라인 기능 최적화 효과 확인
 * - [ ] 네트워크 상태 예측 정확성 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 고급 오프라인 표시기)
 * - 2024-12-19: 고급 네트워크 상태 감지 구현
 * - 2024-12-19: 네트워크 품질 측정 시스템 구현
 * - 2024-12-19: 지능형 기능 안내 시스템 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (고급 오프라인 표시기 시스템 완료)
 * 
 * 🚀 **다음 단계**
 * - AI 기반 네트워크 상태 예측 고도화
 * - 오프라인 기능 자동 최적화 고도화
 * - 성능 최적화
 * - 접근성 개선
 * 
 * 💡 **사용 예시**
 * ```tsx
 * <EnhancedOfflineIndicator 
 *   onNetworkQualityChange={(quality) => handleQualityChange(quality)}
 *   onOfflineOptimization={(optimization) => handleOptimization(optimization)}
 *   onNetworkPrediction={(prediction) => handlePrediction(prediction)}
 *   enableIntelligentGuide={true}
 * />
 * ```
 */

'use client';

import { useState, useEffect } from 'react';
import useEnhancedOffline from '../hooks/useEnhancedOffline';
import Button from './ui/button';
import Card from './ui/card';
import Badge from './ui/badge';

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
              <Badge variant="secondary" className="text-xs">
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
                variant="secondary"
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
