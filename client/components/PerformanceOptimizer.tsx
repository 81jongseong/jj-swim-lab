'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import Badge from '@/components/ui/Badge';
import Tabs, { TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';

interface PerformanceMetrics {
  memoryUsage: number;
  cpuUsage: number;
  networkLatency: number;
  imageLoadTime: number;
  bundleSize: number;
  cacheHitRate: number;
  fps: number;
  renderTime: number;
}

interface OptimizationSuggestion {
  id: string;
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  category: 'code' | 'assets' | 'network' | 'caching';
  implemented: boolean;
}

interface PerformanceOptimizerProps {
  onOptimizationComplete?: (metrics: PerformanceMetrics) => void;
}

function PerformanceOptimizer({ onOptimizationComplete }: PerformanceOptimizerProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    memoryUsage: 0,
    cpuUsage: 0,
    networkLatency: 0,
    imageLoadTime: 0,
    bundleSize: 0,
    cacheHitRate: 0,
    fps: 0,
    renderTime: 0
  });

  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([
    {
      id: '1',
      title: '대시보드 최적화',
      description: 'WebP 이미지 사용 및 이미지 최적화로 로딩 속도 향상',
      impact: 'high',
      category: 'assets',
      implemented: false
    },
    {
      id: '2',
      title: '코드 분할',
      description: 'React.lazy와 Suspense를 사용한 지연 로딩 구현',
      impact: 'high',
      category: 'code',
      implemented: false
    },
    {
      id: '3',
      title: '메모이제이션',
      description: 'useMemo와 useCallback을 사용한 불필요한 재렌더링 방지',
      impact: 'medium',
      category: 'code',
      implemented: false
    },
    {
      id: '4',
      title: '캐싱 최적화',
      description: 'Redis와 파일 기반 캐싱으로 응답 속도 향상',
      impact: 'high',
      category: 'caching',
      implemented: false
    },
    {
      id: '5',
      title: 'CDN 활용',
      description: '정적 자원을 CDN으로 분산하여 로딩 속도 향상',
      impact: 'medium',
      category: 'network',
      implemented: false
    },
    {
      id: '6',
      title: 'Gzip 압축',
      description: '응답 데이터 압축으로 전송 크기 최소화',
      impact: 'medium',
      category: 'network',
      implemented: false
    }
  ]);

  const [activeTab, setActiveTab] = useState('overview');
  const [isOptimizing, setIsOptimizing] = useState(false);

  // 메트릭 수집
  const collectMetrics = useCallback(async () => {
    try {
      // 메모리 사용량 (임의 생성)
      const memoryUsage = Math.random() * 100;
      
      // CPU 사용량 (임의 생성)
      const cpuUsage = Math.random() * 80;
      
      // 네트워크 대기 시간 (임의 생성)
      const networkLatency = Math.random() * 200 + 50;
      
      // 이미지 로딩 시간 (임의 생성)
      const imageLoadTime = Math.random() * 1000 + 200;
      
      // 번들 크기 (임의 생성)
      const bundleSize = Math.random() * 2000 + 500;
      
      // 캐시 히트율 (임의 생성)
      const cacheHitRate = Math.random() * 40 + 60;
      
      // FPS (임의 생성)
      const fps = Math.random() * 30 + 30;
      
      // 렌더링 시간 (임의 생성)
      const renderTime = Math.random() * 16 + 8;

      setMetrics({
        memoryUsage,
        cpuUsage,
        networkLatency,
        imageLoadTime,
        bundleSize,
        cacheHitRate,
        fps,
        renderTime
      });
    } catch (error) {
      console.error('메트릭 수집 중 오류:', error);
    }
  }, []);

  // 성능 점수 계산
  const performanceScore = useMemo(() => {
    const scores = [
      (100 - metrics.memoryUsage) * 0.2,
      (100 - metrics.cpuUsage) * 0.2,
      Math.max(0, 300 - metrics.networkLatency) / 3 * 0.2,
      Math.max(0, 1000 - metrics.imageLoadTime) / 10 * 0.15,
      Math.max(0, 2500 - metrics.bundleSize) / 25 * 0.15,
      metrics.cacheHitRate * 0.1
    ];
    
    return Math.round(scores.reduce((sum, score) => sum + score, 0));
  }, [metrics]);

  // 성능 등급 계산
  const performanceGrade = useMemo(() => {
    if (performanceScore >= 90) return { grade: 'A+', color: 'text-green-600', bg: 'bg-green-100' };
    if (performanceScore >= 80) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-100' };
    if (performanceScore >= 70) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (performanceScore >= 60) return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { grade: 'D', color: 'text-red-600', bg: 'bg-red-100' };
  }, [performanceScore]);

  // 자동 최적화 실행
  const runAutoOptimization = useCallback(async () => {
    setIsOptimizing(true);
    
    // 제안 사항 구현
    for (let i = 0; i < suggestions.length; i++) {
      if (!suggestions[i].implemented) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setSuggestions(prev => prev.map((suggestion, index) => 
          index === i ? { ...suggestion, implemented: true } : suggestion
        ));
      }
    }
    
    // 최적화 완료 후 메트릭 수집 및 상태 업데이트
    setTimeout(() => {
      collectMetrics();
      setIsOptimizing(false);
      
      // 최적화 완료 콜백 호출
      if (onOptimizationComplete) {
        onOptimizationComplete(metrics);
      }
    }, 1000);
  }, [suggestions, collectMetrics, onOptimizationComplete, metrics]);

  useEffect(() => {
    collectMetrics();
    const interval = setInterval(collectMetrics, 30000); // 30초마다 메트릭 수집
    
    return () => clearInterval(interval);
  }, [collectMetrics]);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'code': return 'bg-blue-100 text-blue-800';
      case 'assets': return 'bg-purple-100 text-purple-800';
      case 'network': return 'bg-green-100 text-green-800';
      case 'caching': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">성능 최적화 관리</h1>
        <p className="text-gray-600 mt-2">웹 애플리케이션의 성능을 모니터링하고 최적화하는 도구입니다.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="metrics">메트릭</TabsTrigger>
          <TabsTrigger value="optimizations">최적화 제안</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* 성능 점수 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>성능 점수</span>
                <Badge className={`${performanceGrade.bg} ${performanceGrade.color} text-lg px-4 py-2`}>
                  {performanceGrade.grade}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {performanceScore}
                </div>
                <div className="text-gray-600">점수 (100점 만점)</div>
              </div>
              <Progress value={performanceScore} className="h-3" />
              <div className="mt-4 text-center">
                <Button 
                  onClick={runAutoOptimization} 
                  disabled={isOptimizing}
                  className="w-full"
                >
                  {isOptimizing ? '최적화 중...' : '자동 최적화 실행'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 메트릭 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">메모리 사용량</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {metrics.memoryUsage.toFixed(1)}%
                </div>
                <Progress value={metrics.memoryUsage} className="h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">CPU 사용량</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {metrics.cpuUsage.toFixed(1)}%
                </div>
                <Progress value={metrics.cpuUsage} className="h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">네트워크 대기 시간</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600 mb-2">
                  {metrics.networkLatency.toFixed(0)}ms
                </div>
                <div className="text-sm text-gray-500">
                  {metrics.networkLatency < 100 ? '빠른 응답' : 
                   metrics.networkLatency < 200 ? '일반적인 응답' : '느린 응답'}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>성능 메트릭</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">이미지 로딩 시간</span>
                    <span className="text-lg font-bold text-blue-600">
                      {metrics.imageLoadTime.toFixed(0)}ms
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(100, (metrics.imageLoadTime / 1000) * 100)} 
                    className="h-2" 
                  />
                  <div className="text-sm text-gray-500 mt-1">
                    목표: 200ms 이하
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">번들 크기</span>
                    <span className="text-lg font-bold text-green-600">
                      {(metrics.bundleSize / 1024).toFixed(1)}KB
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(100, (metrics.bundleSize / 2500) * 100)} 
                    className="h-2" 
                  />
                  <div className="text-sm text-gray-500 mt-1">
                    목표: 2.5MB 이하
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">캐시 히트율</span>
                    <span className="text-lg font-bold text-purple-600">
                      {metrics.cacheHitRate.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={metrics.cacheHitRate} className="h-2" />
                  <div className="text-sm text-gray-500 mt-1">
                    목표: 80% 이상
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimizations" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">최적화 제안</h2>
            <Button onClick={runAutoOptimization} disabled={isOptimizing}>
              {isOptimizing ? '최적화 중...' : '최적화 적용'}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {suggestions.map((suggestion) => (
              <Card key={suggestion.id} className={suggestion.implemented ? 'border-green-500' : ''}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className={suggestion.implemented ? 'line-through text-gray-500' : ''}>
                      {suggestion.title}
                    </span>
                    <div className="flex space-x-2">
                      <Badge className={getImpactColor(suggestion.impact)}>
                        {suggestion.impact}
                      </Badge>
                      <Badge className={getCategoryColor(suggestion.category)}>
                        {suggestion.category}
                      </Badge>
                      {suggestion.implemented && (
                        <Badge className="bg-green-500 text-white">
                          적용됨
                        </Badge>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{suggestion.description}</p>
                  {!suggestion.implemented && (
                    <Button 
                      size="sm" 
                      onClick={() => {
                        setSuggestions(prev => prev.map(s => 
                          s.id === suggestion.id ? { ...s, implemented: true } : s
                        ));
                      }}
                    >
                      적용
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default PerformanceOptimizer;

