/**
 * 시스템 모니터링 대시보드 컴포넌트
 * 실시간 서버 상태, 성능 지표, 사용자 활동을 표시합니다.
 */

'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/card';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RefreshCw, Server, Users, Activity, AlertTriangle, CheckCircle } from 'lucide-react';

interface SystemStatus {
  timestamp: string;
  cpu: {
    usage: string;
    loadAverage: number[];
  };
  memory: {
    total: string;
    free: string;
    used: string;
    usage: string;
  };
  uptime: string;
  nodeVersion: string;
  platform: string;
}

interface PerformanceStats {
  totalRequests: number;
  averageResponseTime: number;
  errorRate: number;
  slowRequests: number;
  successRate: number;
  summary: {
    status: string;
    recommendation: string;
  };
}

interface ApiRequest {
  timestamp: string;
  method: string;
  url: string;
  statusCode: number;
  duration: string;
  ip: string;
  userId: string;
}

interface UserActivity {
  timestamp: string;
  userId: string;
  action: string;
  details: any;
  ip: string;
}

const SystemMonitor: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [performanceStats, setPerformanceStats] = useState<PerformanceStats | null>(null);
  const [apiRequests, setApiRequests] = useState<ApiRequest[]>([]);
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

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
      const [statusRes, performanceRes, requestsRes, activitiesRes] = await Promise.all([
        fetch('/api/monitoring/status', { headers }),
        fetch('/api/monitoring/performance', { headers }),
        fetch('/api/monitoring/api-requests?limit=20', { headers }),
        fetch('/api/monitoring/user-activities?limit=10', { headers })
      ]);

      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setSystemStatus(statusData.data);
      }

      if (performanceRes.ok) {
        const performanceData = await performanceRes.json();
        setPerformanceStats(performanceData.data);
      }

      if (requestsRes.ok) {
        const requestsData = await requestsRes.json();
        setApiRequests(requestsData.data.requests);
      }

      if (activitiesRes.ok) {
        const activitiesData = await activitiesRes.json();
        setUserActivities(activitiesData.data.activities);
      }
    } catch (error) {
      console.error('모니터링 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 자동 새로고침 설정
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoRefresh) {
      interval = setInterval(refreshData, 30000); // 30초마다 새로고침
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  // 초기 데이터 로드
  useEffect(() => {
    refreshData();
  }, []);

  // 상태에 따른 아이콘 반환
  const getStatusIcon = (status: string) => {
    switch (status) {
      case '양호':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case '주의':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case '위험':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Server className="w-5 h-5 text-gray-500" />;
    }
  };

  // HTTP 상태 코드에 따른 색상 반환
  const getStatusColor = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return 'bg-green-100 text-green-800';
    if (statusCode >= 300 && statusCode < 400) return 'bg-blue-100 text-blue-800';
    if (statusCode >= 400 && statusCode < 500) return 'bg-yellow-100 text-yellow-800';
    if (statusCode >= 500) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">시스템 모니터링</h1>
          <p className="text-gray-600 mt-1">실시간 서버 상태 및 성능 지표</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-50 border-green-200' : ''}
          >
            <Activity className="w-4 h-4 mr-2" />
            자동 새로고침 {autoRefresh ? 'ON' : 'OFF'}
          </Button>
          <Button onClick={refreshData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
        </div>
      </div>

      {/* 시스템 상태 카드 */}
      {systemStatus && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Server className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">시스템 상태</h2>
            <Badge variant="outline" className="ml-auto">
              {new Date(systemStatus.timestamp).toLocaleString()}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* CPU 사용률 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">CPU 사용률</span>
                <span className="text-sm font-bold">{systemStatus.cpu.usage}</span>
              </div>
              <Progress 
                value={parseFloat(systemStatus.cpu.usage)} 
                className="h-2"
              />
              <div className="text-xs text-gray-500 mt-1">
                Load: {systemStatus.cpu.loadAverage.map(l => l.toFixed(2)).join(', ')}
              </div>
            </div>

            {/* 메모리 사용률 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">메모리 사용률</span>
                <span className="text-sm font-bold">{systemStatus.memory.usage}</span>
              </div>
              <Progress 
                value={parseFloat(systemStatus.memory.usage)} 
                className="h-2"
              />
              <div className="text-xs text-gray-500 mt-1">
                {systemStatus.memory.used} / {systemStatus.memory.total}
              </div>
            </div>

            {/* 업타임 */}
            <div>
              <div className="text-sm font-medium text-gray-600 mb-1">업타임</div>
              <div className="text-lg font-bold text-green-600">{systemStatus.uptime}</div>
              <div className="text-xs text-gray-500 mt-1">
                Node.js {systemStatus.nodeVersion}
              </div>
            </div>

            {/* 플랫폼 */}
            <div>
              <div className="text-sm font-medium text-gray-600 mb-1">플랫폼</div>
              <div className="text-lg font-bold text-blue-600">{systemStatus.platform}</div>
              <div className="text-xs text-gray-500 mt-1">
                운영체제 정보
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 성능 통계 카드 */}
      {performanceStats && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold">성능 통계</h2>
            <div className="ml-auto flex items-center gap-2">
              {getStatusIcon(performanceStats.summary.status)}
              <Badge 
                variant={performanceStats.summary.status === '양호' ? 'default' : 'destructive'}
              >
                {performanceStats.summary.status}
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{performanceStats.totalRequests}</div>
              <div className="text-sm text-gray-600">총 요청 수</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{performanceStats.averageResponseTime}ms</div>
              <div className="text-sm text-gray-600">평균 응답 시간</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{performanceStats.errorRate}%</div>
              <div className="text-sm text-gray-600">에러율</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{performanceStats.slowRequests}</div>
              <div className="text-sm text-gray-600">느린 요청</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{performanceStats.successRate}%</div>
              <div className="text-sm text-gray-600">성공률</div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">{performanceStats.summary.recommendation}</p>
          </div>
        </Card>
      )}

      {/* 최근 API 요청 */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Server className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-semibold">최근 API 요청</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">시간</th>
                <th className="text-left p-2">메서드</th>
                <th className="text-left p-2">URL</th>
                <th className="text-left p-2">상태</th>
                <th className="text-left p-2">응답시간</th>
                <th className="text-left p-2">사용자</th>
              </tr>
            </thead>
            <tbody>
              {apiRequests.map((request, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="p-2 text-xs text-gray-600">
                    {new Date(request.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="p-2">
                    <Badge variant="outline" className="text-xs">
                      {request.method}
                    </Badge>
                  </td>
                  <td className="p-2 font-mono text-xs">{request.url}</td>
                  <td className="p-2">
                    <Badge className={`text-xs ${getStatusColor(request.statusCode)}`}>
                      {request.statusCode}
                    </Badge>
                  </td>
                  <td className="p-2 text-xs">{request.duration}</td>
                  <td className="p-2 text-xs text-gray-600">{request.userId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 사용자 활동 */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-6 h-6 text-orange-600" />
          <h2 className="text-xl font-semibold">사용자 활동</h2>
        </div>
        
        <div className="space-y-3">
          {userActivities.map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <div className="font-medium text-sm">{activity.userId}</div>
                  <div className="text-xs text-gray-600">{activity.action}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">
                  {new Date(activity.timestamp).toLocaleString()}
                </div>
                <div className="text-xs text-gray-400">{activity.ip}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default SystemMonitor;
