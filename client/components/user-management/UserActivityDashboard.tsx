/**
 * 사용자 활동 대시보드 컴포넌트
 * 사용자 활동 로그, 통계, 분석을 표시합니다.
 */

'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { 
  Users, 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Search,
  Filter,
  Calendar,
  Clock,
  Eye,
  Shield
} from 'lucide-react';

interface UserActivity {
  id: string;
  userId: string;
  userType: string;
  action: string;
  resource: string;
  resourceId?: string;
  timestamp: string;
  success: boolean;
  duration?: number;
  ip: string;
  userAgent?: string;
  metadata?: any;
  details: any;
}

interface ActivityStats {
  totalActivities: number;
  successfulActivities: number;
  failedActivities: number;
  successRate: number;
  averageDuration: number;
  uniqueActionCount: number;
  uniqueResourceCount: number;
}

interface ActivityTrend {
  date: string;
  totalActivities: number;
  successfulActivities: number;
  uniqueUsers: number;
  successRate: number;
}

interface TopAction {
  action: string;
  totalCount: number;
  successCount: number;
  successRate: number;
}

const UserActivityDashboard: React.FC = () => {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [trends, setTrends] = useState<ActivityTrend[]>([]);
  const [topActions, setTopActions] = useState<TopAction[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('7');
  const [filterSuccess, setFilterSuccess] = useState<string>('all');

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
      const [trendsRes, topActionsRes] = await Promise.all([
        fetch(`/api/user-activities/trends/overview?days=${dateRange}`, { headers }),
        fetch('/api/user-activities/top-actions/overview?limit=10', { headers })
      ]);

      if (trendsRes.ok) {
        const trendsData = await trendsRes.json();
        setTrends(trendsData.data.trends);
      }

      if (topActionsRes.ok) {
        const topActionsData = await topActionsRes.json();
        setTopActions(topActionsData.data.actions);
      }

      // 특정 사용자 선택 시 해당 사용자 데이터 로드
      if (selectedUser) {
        const [statsRes, activitiesRes] = await Promise.all([
          fetch(`/api/user-activities/stats/${selectedUser}?days=${dateRange}`, { headers }),
          fetch(`/api/user-activities/${selectedUser}?page=1&limit=50`, { headers })
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData.data.stats);
        }

        if (activitiesRes.ok) {
          const activitiesData = await activitiesRes.json();
          setActivities(activitiesData.data.activities);
        }
      }
    } catch (error) {
      console.error('사용자 활동 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 검색 실행
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/user-activities/search/overview?q=${encodeURIComponent(searchQuery)}&page=1&limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setActivities(data.data.activities);
      }
    } catch (error) {
      console.error('검색 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    refreshData();
  }, [dateRange, selectedUser]);

  // 상태에 따른 아이콘 반환
  const getStatusIcon = (success: boolean) => {
    return success ? 
      <CheckCircle className="w-4 h-4 text-green-500" /> : 
      <XCircle className="w-4 h-4 text-red-500" />;
  };

  // 활동 타입에 따른 색상 반환
  const getActionColor = (action: string) => {
    if (action.includes('LOGIN') || action.includes('SIGNUP')) return 'bg-blue-100 text-blue-800';
    if (action.includes('CREATE')) return 'bg-green-100 text-green-800';
    if (action.includes('UPDATE')) return 'bg-yellow-100 text-yellow-800';
    if (action.includes('DELETE')) return 'bg-red-100 text-red-800';
    if (action.includes('VIEW')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  // 리소스 타입에 따른 색상 반환
  const getResourceColor = (resource: string) => {
    switch (resource) {
      case 'USER': return 'bg-blue-100 text-blue-800';
      case 'COURSE': return 'bg-green-100 text-green-800';
      case 'BOOKING': return 'bg-yellow-100 text-yellow-800';
      case 'SYSTEM': return 'bg-red-100 text-red-800';
      case 'FILE': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">사용자 활동 관리</h1>
          <p className="text-gray-600 mt-1">사용자 활동 로그, 통계, 분석</p>
        </div>
        <Button onClick={refreshData} disabled={loading}>
          <Activity className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          새로고침
        </Button>
      </div>

      {/* 필터 및 검색 */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold">필터 및 검색</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">사용자 ID</label>
            <input
              type="text"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="사용자 ID 입력"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">기간</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1">1일</option>
              <option value="7">7일</option>
              <option value="30">30일</option>
              <option value="90">90일</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">성공 여부</label>
            <select
              value={filterSuccess}
              onChange={(e) => setFilterSuccess(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전체</option>
              <option value="true">성공</option>
              <option value="false">실패</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">검색</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="활동 검색"
              />
              <Button onClick={handleSearch} size="sm">
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* 사용자 활동 통계 */}
      {stats && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold">사용자 활동 통계</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalActivities}</div>
              <div className="text-sm text-gray-600">총 활동 수</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.successfulActivities}</div>
              <div className="text-sm text-gray-600">성공한 활동</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.failedActivities}</div>
              <div className="text-sm text-gray-600">실패한 활동</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{Math.round(stats.successRate * 100) / 100}%</div>
              <div className="text-sm text-gray-600">성공률</div>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{stats.averageDuration}ms</div>
              <div className="text-sm text-gray-600">평균 응답 시간</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{stats.uniqueActionCount}</div>
              <div className="text-sm text-gray-600">고유 활동 타입</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{stats.uniqueResourceCount}</div>
              <div className="text-sm text-gray-600">고유 리소스 타입</div>
            </div>
          </div>
        </Card>
      )}

      {/* 활동 트렌드 */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-semibold">활동 트렌드</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">날짜</th>
                <th className="text-left p-2">총 활동</th>
                <th className="text-left p-2">성공</th>
                <th className="text-left p-2">고유 사용자</th>
                <th className="text-left p-2">성공률</th>
              </tr>
            </thead>
            <tbody>
              {trends.slice(-14).map((trend, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="p-2 text-xs text-gray-600">
                    {new Date(trend.date).toLocaleDateString()}
                  </td>
                  <td className="p-2 font-semibold">{trend.totalActivities}</td>
                  <td className="p-2 text-green-600">{trend.successfulActivities}</td>
                  <td className="p-2 text-blue-600">{trend.uniqueUsers}</td>
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <Progress value={trend.successRate} className="flex-1 h-2" />
                      <span className="text-xs">{Math.round(trend.successRate * 100) / 100}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 상위 활동 */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-6 h-6 text-orange-600" />
          <h2 className="text-xl font-semibold">상위 활동</h2>
        </div>
        
        <div className="space-y-3">
          {topActions.map((action, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium text-sm">{action.action}</div>
                  <div className="text-xs text-gray-600">
                    성공: {action.successCount} / {action.totalCount}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold">{action.totalCount}</div>
                <div className="text-xs text-gray-500">
                  {Math.round(action.successRate * 100) / 100}% 성공률
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 활동 목록 */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="w-6 h-6 text-indigo-600" />
          <h2 className="text-xl font-semibold">활동 목록</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">시간</th>
                <th className="text-left p-2">사용자</th>
                <th className="text-left p-2">활동</th>
                <th className="text-left p-2">리소스</th>
                <th className="text-left p-2">상태</th>
                <th className="text-left p-2">응답시간</th>
                <th className="text-left p-2">IP</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => (
                <tr key={activity.id} className="border-b hover:bg-gray-50">
                  <td className="p-2 text-xs text-gray-600">
                    {new Date(activity.timestamp).toLocaleString()}
                  </td>
                  <td className="p-2">
                    <div className="text-xs">
                      <div className="font-medium">{activity.userId}</div>
                      <div className="text-gray-500">{activity.userType}</div>
                    </div>
                  </td>
                  <td className="p-2">
                    <Badge className={`text-xs ${getActionColor(activity.action)}`}>
                      {activity.action}
                    </Badge>
                  </td>
                  <td className="p-2">
                    <Badge className={`text-xs ${getResourceColor(activity.resource)}`}>
                      {activity.resource}
                    </Badge>
                  </td>
                  <td className="p-2">
                    <div className="flex items-center gap-1">
                      {getStatusIcon(activity.success)}
                      <span className="text-xs">{activity.success ? '성공' : '실패'}</span>
                    </div>
                  </td>
                  <td className="p-2 text-xs text-gray-600">
                    {activity.duration ? `${activity.duration}ms` : '-'}
                  </td>
                  <td className="p-2 text-xs text-gray-500">{activity.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default UserActivityDashboard;
