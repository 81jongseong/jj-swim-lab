/**
 * 성능 최적화 대시보드 컴포넌트
 * 성능 분석, 캐시 관리, 쿼리 최적화를 표시합니다.
 */

'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/button';
import { Badge } from '@/components/ui';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Database, 
  Zap, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  // Memory, // 사용하지 않음
  HardDrive,
  RefreshCw,
  Trash2,
  Settings
} from 'lucide-react';

interface PerformanceStats {
  totalMetrics: number;
  averageDuration: number;
  slowOperations: number;
  memoryUsage: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  functionStats: any;
  queryStats: any;
  recommendations: string[];
}

interface CacheStats {
  memory: {
    keys: number;
    hits: number;
    misses: number;
    ksize: number;
    vsize: number;
  };
  query: {
    size: number;
    items: Array<{
      key: string;
      hits: number;
      age: number;
      ttl: number;
    }>;
  };
  overall: {
    totalHits: number;
    totalMisses: number;
    totalSets: number;
    hitRate: number;
  };
}

interface SlowQuery {
  query: string;
  collection: string;
  executionTime: number;
  documentsExamined: number;
  documentsReturned: number;
  indexUsed: boolean;
  score: number;
  recommendations: string[];
}

const PerformanceDashboard: React.FC = () => {
  const [performanceStats, setPerformanceStats] = useState<PerformanceStats | null>(null);
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [slowQueries, setSlowQueries] = useState<SlowQuery[]>([]);
  const [loading, setLoading] = useState(false);
  const [memoryTracking, setMemoryTracking] = useState(false);

  // 데이터 새로고침 함수
  const refreshData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // 병렬로 모든 데이터 요청
      const [statsRes, cacheRes, queriesRes] = await Promise.all([
        fetch('/api/performance/stats', { headers }),
        fetch('/api/performance/cache-stats', { headers }),
        fetch('/api/performance/slow-queries?threshold=100', { headers })
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setPerformanceStats(statsData.data);
      }

      if (cacheRes.ok) {
        const cacheData = await cacheRes.json();
        setCacheStats(cacheData.data);
      }

      if (queriesRes.ok) {
        const queriesData = await queriesRes.json();
        setSlowQueries(queriesData.data.slowQueries);
      }
    } catch (error) {
      console.error('성능 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 캐시 정리
  const cleanupCache = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/performance/cache/cleanup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('캐시 정리가 완료되었습니다.');
        refreshData();
      } else {
        alert('캐시 정리에 실패했습니다.');
      }
    } catch (error) {
      console.error('캐시 정리 실패:', error);
      alert('캐시 정리 중 오류가 발생했습니다.');
    }
  };

  // 모든 캐시 삭제
  const clearAllCache = async () => {
    if (!confirm('정말로 모든 캐시를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/performance/cache/clear', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('모든 캐시가 삭제되었습니다.');
        refreshData();
      } else {
        alert('캐시 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('캐시 삭제 실패:', error);
      alert('캐시 삭제 중 오류가 발생했습니다.');
    }
  };

  // 메모리 추적 시작/중지
  const toggleMemoryTracking = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = memoryTracking ? '/api/performance/memory/track' : '/api/performance/memory/track';
      const method = memoryTracking ? 'DELETE' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: memoryTracking ? undefined : JSON.stringify({ interval: 60 })
      });

      if (response.ok) {
        setMemoryTracking(!memoryTracking);
        alert(memoryTracking ? '메모리 추적이 중지되었습니다.' : '메모리 추적이 시작되었습니다.');
      } else {
        alert('메모리 추적 설정에 실패했습니다.');
      }
    } catch (error) {
      console.error('메모리 추적 설정 실패:', error);
      alert('메모리 추적 설정 중 오류가 발생했습니다.');
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    refreshData();
  }, []);

  // 성능 점수에 따른 색상 반환
  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // 성능 점수에 따른 아이콘 반환
  const getPerformanceIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (score >= 60) return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    return <AlertTriangle className="w-4 h-4 text-red-500" />;
  };

  // 메모리 사용량을 MB로 변환
  const formatMemory = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2);
  };

  return (
    <div className="p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">성능 최적화</h1>
          <p className="text-gray-600 mt-1">성능 분석, 캐시 관리, 쿼리 최적화</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={toggleMemoryTracking}
            className={memoryTracking ? 'bg-green-50 border-green-200' : ''}
          >
            <span className="w-4 h-4 mr-2">💾</span>
            메모리 추적 {memoryTracking ? 'ON' : 'OFF'}
          </Button>
          <Button onClick={refreshData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
        </div>
      </div>

      {/* 성능 통계 */}
      {performanceStats && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">성능 통계</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{performanceStats.totalMetrics}</div>
              <div className="text-sm text-gray-600">총 메트릭 수</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{performanceStats.averageDuration}ms</div>
              <div className="text-sm text-gray-600">평균 실행 시간</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{performanceStats.slowOperations}</div>
              <div className="text-sm text-gray-600">느린 작업</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{formatMemory(performanceStats.memoryUsage.heapUsed)}MB</div>
              <div className="text-sm text-gray-600">힙 메모리 사용량</div>
            </div>
          </div>

          {/* 메모리 사용량 상세 */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-3">메모리 사용량 상세</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-600">RSS</div>
                <div className="font-semibold">{formatMemory(performanceStats.memoryUsage.rss)}MB</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">힙 총량</div>
                <div className="font-semibold">{formatMemory(performanceStats.memoryUsage.heapTotal)}MB</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">힙 사용량</div>
                <div className="font-semibold">{formatMemory(performanceStats.memoryUsage.heapUsed)}MB</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">외부</div>
                <div className="font-semibold">{formatMemory(performanceStats.memoryUsage.external)}MB</div>
              </div>
            </div>
          </div>

          {/* 권장사항 */}
          {performanceStats.recommendations.length > 0 && (
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold mb-3 text-yellow-800">성능 개선 권장사항</h3>
              <ul className="space-y-2">
                {performanceStats.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-yellow-700">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}

      {/* 캐시 통계 */}
      {cacheStats && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <HardDrive className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold">캐시 통계</h2>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={cleanupCache}>
                <Settings className="w-4 h-4 mr-1" />
                정리
              </Button>
              <Button size="sm" variant="outline" onClick={clearAllCache} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-1" />
                전체 삭제
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{cacheStats.memory.keys}</div>
              <div className="text-sm text-gray-600">메모리 캐시 키</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{cacheStats.memory.hits}</div>
              <div className="text-sm text-gray-600">캐시 히트</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{cacheStats.memory.misses}</div>
              <div className="text-sm text-gray-600">캐시 미스</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{cacheStats.overall.hitRate}%</div>
              <div className="text-sm text-gray-600">히트율</div>
            </div>
          </div>

          {/* 히트율 진행률 */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">캐시 히트율</span>
              <span className="text-sm font-bold">{cacheStats.overall.hitRate}%</span>
            </div>
            <Progress value={cacheStats.overall.hitRate} className="h-2" />
          </div>

          {/* 쿼리 캐시 */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-3">쿼리 캐시 ({cacheStats.query.size}개 항목)</h3>
            <div className="space-y-2">
              {cacheStats.query.items.slice(0, 5).map((item, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="font-mono text-xs truncate flex-1 mr-2">{item.key}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{item.hits} hits</Badge>
                    <span className="text-gray-500">{Math.round(item.age / 1000)}s ago</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* 느린 쿼리 */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-6 h-6 text-red-600" />
          <h2 className="text-xl font-semibold">느린 쿼리 (100ms 이상)</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">컬렉션</th>
                <th className="text-left p-2">실행 시간</th>
                <th className="text-left p-2">문서 검사</th>
                <th className="text-left p-2">문서 반환</th>
                <th className="text-left p-2">인덱스 사용</th>
                <th className="text-left p-2">성능 점수</th>
                <th className="text-left p-2">권장사항</th>
              </tr>
            </thead>
            <tbody>
              {slowQueries.map((query, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="p-2 font-medium">{query.collection}</td>
                  <td className="p-2">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-500" />
                      {query.executionTime}ms
                    </div>
                  </td>
                  <td className="p-2">{query.documentsExamined}</td>
                  <td className="p-2">{query.documentsReturned}</td>
                  <td className="p-2">
                    <div className="flex items-center gap-1">
                      {query.indexUsed ? 
                        <CheckCircle className="w-3 h-3 text-green-500" /> : 
                        <AlertTriangle className="w-3 h-3 text-red-500" />
                      }
                      <span className="text-xs">{query.indexUsed ? '사용됨' : '미사용'}</span>
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="flex items-center gap-1">
                      {getPerformanceIcon(query.score)}
                      <span className={`font-semibold ${getPerformanceColor(query.score)}`}>
                        {query.score}
                      </span>
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="text-xs text-gray-600">
                      {query.recommendations.length > 0 ? query.recommendations[0] : '없음'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default PerformanceDashboard;
