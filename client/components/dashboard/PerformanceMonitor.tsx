'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Button } from '@/components/ui';
import { Progress } from '@/components/ui';

interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  bundleSize: number; // Bundle size in KB
  loadTime: number; // Page load time in ms
}

interface PerformanceMonitorProps {
  refreshInterval?: number; // milliseconds
}

export default function PerformanceMonitor({ refreshInterval = 30000 }: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 성능 메트릭 수집
  const collectMetrics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 실제 환경에서는 Web Vitals API나 성능 모니터링 서비스를 사용
      const mockMetrics: PerformanceMetrics = {
        fcp: Math.random() * 1000 + 500, // 500-1500ms
        lcp: Math.random() * 2000 + 1000, // 1000-3000ms
        fid: Math.random() * 100 + 10, // 10-110ms
        cls: Math.random() * 0.1, // 0-0.1
        ttfb: Math.random() * 200 + 50, // 50-250ms
        bundleSize: Math.random() * 200 + 800, // 800-1000KB
        loadTime: Math.random() * 1000 + 500, // 500-1500ms
      };

      setMetrics(mockMetrics);
      setLastUpdate(new Date());
    } catch (err) {
      setError('성능 메트릭 수집에 실패했습니다.');
      console.error('Performance monitoring error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 성능 점수 계산
  const calculateScore = useCallback((metric: keyof PerformanceMetrics, value: number): number => {
    const thresholds = {
      fcp: { good: 1800, poor: 3000 },
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      ttfb: { good: 200, poor: 600 },
      bundleSize: { good: 1000, poor: 2000 },
      loadTime: { good: 1000, poor: 3000 }
    };

    const threshold = thresholds[metric];
    if (value <= threshold.good) return 100;
    if (value <= threshold.poor) return 50;
    return 25;
  }, []);

  // 전체 성능 점수 계산
  const overallScore = useCallback((): number => {
    if (!metrics) return 0;
    
    const scores = [
      calculateScore('fcp', metrics.fcp),
      calculateScore('lcp', metrics.lcp),
      calculateScore('fid', metrics.fid),
      calculateScore('cls', metrics.cls),
      calculateScore('ttfb', metrics.ttfb),
      calculateScore('bundleSize', metrics.bundleSize),
      calculateScore('loadTime', metrics.loadTime)
    ];
    
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }, [metrics, calculateScore]);

  // 성능 상태 판단
  const getPerformanceStatus = useCallback((score: number): { label: string; color: string } => {
    if (score >= 90) return { label: '우수', color: 'bg-green-500' };
    if (score >= 70) return { label: '양호', color: 'bg-yellow-500' };
    if (score >= 50) return { label: '보통', color: 'bg-orange-500' };
    return { label: '개선 필요', color: 'bg-red-500' };
  }, []);

  // 자동 새로고침 설정
  useEffect(() => {
    collectMetrics();
    
    const interval = setInterval(collectMetrics, refreshInterval);
    return () => clearInterval(interval);
  }, [collectMetrics, refreshInterval]);

  // 수동 새로고침
  const handleRefresh = () => {
    collectMetrics();
  };

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p className="text-lg font-semibold">⚠️ 성능 모니터링 오류</p>
            <p className="mt-2">{error}</p>
            <Button onClick={handleRefresh} className="mt-4">
              다시 시도
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">📊 성능 모니터링</CardTitle>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className={getPerformanceStatus(overallScore()).color}>
            {getPerformanceStatus(overallScore()).label}
          </Badge>
          <Button 
            onClick={handleRefresh} 
            disabled={isLoading}
            size="sm"
            variant="outline"
          >
            {isLoading ? '🔄' : '🔄'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 전체 성능 점수 */}
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">
            {overallScore()}
          </div>
          <div className="text-sm text-gray-500">전체 성능 점수</div>
          <Progress value={overallScore()} className="mt-2" />
        </div>

        {metrics && (
          <>
            {/* Core Web Vitals */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>FCP</span>
                  <span className="font-mono">{metrics.fcp.toFixed(0)}ms</span>
                </div>
                <Progress 
                  value={calculateScore('fcp', metrics.fcp)} 
                  className="h-2"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>LCP</span>
                  <span className="font-mono">{metrics.lcp.toFixed(0)}ms</span>
                </div>
                <Progress 
                  value={calculateScore('lcp', metrics.lcp)} 
                  className="h-2"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>FID</span>
                  <span className="font-mono">{metrics.fid.toFixed(0)}ms</span>
                </div>
                <Progress 
                  value={calculateScore('fid', metrics.fid)} 
                  className="h-2"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>CLS</span>
                  <span className="font-mono">{metrics.cls.toFixed(3)}</span>
                </div>
                <Progress 
                  value={calculateScore('cls', metrics.cls)} 
                  className="h-2"
                />
              </div>
            </div>

            {/* 추가 메트릭 */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {metrics.ttfb.toFixed(0)}ms
                </div>
                <div className="text-xs text-gray-500">TTFB</div>
              </div>
              
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {metrics.bundleSize.toFixed(0)}KB
                </div>
                <div className="text-xs text-gray-500">번들 크기</div>
              </div>
              
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {metrics.loadTime.toFixed(0)}ms
                </div>
                <div className="text-xs text-gray-500">로딩 시간</div>
              </div>
            </div>
          </>
        )}

        {/* 마지막 업데이트 시간 */}
        {lastUpdate && (
          <div className="text-center text-xs text-gray-400">
            마지막 업데이트: {lastUpdate.toLocaleTimeString()}
          </div>
        )}

        {/* 성능 권장사항 */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">💡 성능 개선 팁</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 이미지 최적화 및 WebP 포맷 사용</li>
            <li>• 코드 스플리팅으로 초기 번들 크기 줄이기</li>
            <li>• CDN을 통한 정적 자산 전송</li>
            <li>• 브라우저 캐싱 전략 최적화</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
