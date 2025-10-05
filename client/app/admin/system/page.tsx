/**
 * @file 시스템 설정 및 모니터링 페이지
 * @description 최고관리자가 전체 시스템을 모니터링하고 설정을 관리하는 페이지입니다.
 * @date 2025-09-19
 * @author JJ Swim Lab
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import withAuth from '../../../components/withAuth';

const SystemPage: React.FC = () => {
  const { user, hasUserType } = useAuth();
  
  // 상태 관리
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [systemSettings, setSystemSettings] = useState<any>(null);
  const [userActivity, setUserActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'status' | 'settings' | 'activity'>('status');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // 데이터 로드
  useEffect(() => {
    // 디버깅: 현재 사용자 정보 출력
    console.log('🔍 System Page - Current User:', user);
    console.log('🔍 System Page - User Type:', user?.userType);
    console.log('🔍 System Page - Has SuperAdmin:', hasUserType('superAdmin'));
    console.log('🔍 System Page - Token:', localStorage.getItem('token') ? 'Present' : 'Missing');
    
    loadSystemData();
    
    // 30초마다 자동 새로고침
    const interval = setInterval(loadSystemData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadSystemData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('인증 토큰이 없습니다.');
        return;
      }

      console.log('🔍 API Request - Token:', token.substring(0, 20) + '...');
      console.log('🔍 API Request - User:', user);

      // 시스템 상태 조회
      const statusResponse = await fetch('http://localhost:5000/api/system/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('🔍 API Response - Status:', statusResponse.status);

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        if (statusData.success) {
          setSystemStatus(statusData.data);
        }
      } else {
        const errorData = await statusResponse.text();
        console.error('🔍 API Error Response:', errorData);
      }

      // 시스템 설정 조회
      const settingsResponse = await fetch('http://localhost:5000/api/system/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        if (settingsData.success) {
          setSystemSettings(settingsData.data);
        }
      }

      // 사용자 활동 조회
      const activityResponse = await fetch('http://localhost:5000/api/system/activity', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        if (activityData.success) {
          setUserActivity(activityData.data);
        }
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('시스템 데이터 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // 설정 저장
  const saveSettings = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/system/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(systemSettings)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert('✅ 시스템 설정이 저장되고 즉시 적용되었습니다!');
          loadSystemData(); // 데이터 새로고침
        } else {
          alert('❌ 설정 저장 실패: ' + result.message);
        }
      } else {
        alert('❌ 설정 저장 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('설정 저장 오류:', error);
      alert('❌ 설정 저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // 수동 백업 실행
  const triggerBackup = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/system/backup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert('✅ 백업이 성공적으로 완료되었습니다!');
          loadSystemData(); // 데이터 새로고침
        } else {
          alert('❌ 백업 실패: ' + result.message);
        }
      } else {
        alert('❌ 백업 실행 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('백업 실행 오류:', error);
      alert('❌ 백업 실행 중 오류가 발생했습니다.');
    }
  };

  // 메모리 사용량 포맷팅
  const formatMemory = (bytes: number) => {
    return `${Math.round(bytes / 1024 / 1024)}MB`;
  };

  // 업타임 포맷팅
  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}시간 ${minutes}분`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">시스템 데이터 로딩 중...</span>
      </div>
    );
  }

  // 권한 확인
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">로그인 필요</h1>
          <p className="text-gray-600">시스템 설정 페이지에 접근하려면 로그인이 필요합니다.</p>
        </div>
      </div>
    );
  }

  if (!hasUserType('superAdmin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">접근 권한 없음</h1>
          <p className="text-gray-600">이 페이지는 최고 관리자만 접근할 수 있습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              🔧 시스템 관리
            </h1>
            <p className="text-gray-600 mt-2">
              JJ Swim Lab 시스템 상태 모니터링 및 전역 설정 관리
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              마지막 업데이트: {lastUpdated.toLocaleTimeString()}
            </div>
            <button
              onClick={loadSystemData}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              🔄 새로고침
            </button>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('status')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'status'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📊 시스템 상태
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'settings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            ⚙️ 시스템 설정
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'activity'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            👥 사용자 활동
          </button>
        </nav>
      </div>

      {/* 시스템 상태 탭 */}
      {activeTab === 'status' && systemStatus && (
        <div className="space-y-6">
          {/* 전체 상태 카드 */}
          <div className="bg-white rounded-lg shadow-md border-l-4 border-l-blue-500 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">🖥️ 시스템 전체 상태</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                systemStatus.status === 'healthy' ? 'bg-green-100 text-green-800' :
                systemStatus.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {systemStatus.status === 'healthy' ? '정상' : 
                 systemStatus.status === 'warning' ? '주의' : '위험'}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              업타임: {formatUptime(systemStatus.uptime)} | 
              플랫폼: {systemStatus.platform} | 
              Node.js: {systemStatus.version}
            </div>
          </div>

          {/* 상세 메트릭 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 메모리 사용량 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">💾 메모리 사용량</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Heap 사용</span>
                  <span className="font-mono">{formatMemory(systemStatus.memory.heapUsed)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Heap 총량</span>
                  <span className="font-mono">{formatMemory(systemStatus.memory.heapTotal)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{
                      width: `${(systemStatus.memory.heapUsed / systemStatus.memory.heapTotal) * 100}%`
                    }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 text-center">
                  {Math.round((systemStatus.memory.heapUsed / systemStatus.memory.heapTotal) * 100)}% 사용 중
                </div>
              </div>
            </div>

            {/* 데이터베이스 상태 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🗄️ 데이터베이스</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">연결 상태</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    systemStatus.database.status === 'connected' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {systemStatus.database.status === 'connected' ? '연결됨' : '연결 안됨'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">응답 시간</span>
                  <span className="font-mono">{systemStatus.database.responseTime}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">컬렉션 수</span>
                  <span className="font-mono">{systemStatus.database.collections}개</span>
                </div>
              </div>
            </div>

            {/* API 성능 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🌐 API 성능</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">총 요청 수</span>
                  <span className="font-mono">{systemStatus.api.totalRequests.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">오류율</span>
                  <span className={`font-mono ${systemStatus.api.errorRate > 5 ? 'text-red-600' : 'text-green-600'}`}>
                    {systemStatus.api.errorRate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">평균 응답시간</span>
                  <span className="font-mono">{systemStatus.api.avgResponseTime}ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 시스템 설정 탭 */}
      {activeTab === 'settings' && systemSettings && (
        <div className="space-y-6">
          {/* 점검 모드 설정 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🚧 점검 모드</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">점검 모드 활성화</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={systemSettings.maintenance?.enabled || false}
                    onChange={(e) => setSystemSettings({
                      ...systemSettings,
                      maintenance: {
                        ...systemSettings.maintenance,
                        enabled: e.target.checked
                      }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  점검 메시지
                </label>
                <textarea
                  value={systemSettings.maintenance?.message || ''}
                  onChange={(e) => setSystemSettings({
                    ...systemSettings,
                    maintenance: {
                      ...systemSettings.maintenance,
                      message: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="사용자에게 표시할 점검 메시지를 입력하세요"
                />
              </div>
            </div>
          </div>

          {/* 보안 설정 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🔒 보안 설정</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">API 요청 제한</span>
                  <p className="text-sm text-gray-500">분당 최대 요청 수 제한</p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={systemSettings.security?.maxRequestsPerMinute || 100}
                    onChange={(e) => setSystemSettings({
                      ...systemSettings,
                      security: {
                        ...systemSettings.security,
                        maxRequestsPerMinute: parseInt(e.target.value)
                      }
                    })}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                    min="1"
                    max="1000"
                  />
                  <span className="text-sm text-gray-500">요청/분</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">무차별 대입 공격 방지</span>
                  <p className="text-sm text-gray-500">반복 로그인 실패 시 계정 잠금</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={systemSettings.security?.bruteForceProtection || false}
                    onChange={(e) => setSystemSettings({
                      ...systemSettings,
                      security: {
                        ...systemSettings.security,
                        bruteForceProtection: e.target.checked
                      }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">2단계 인증 필수</span>
                  <p className="text-sm text-gray-500">관리자 계정 2FA 필수 설정</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={systemSettings.security?.requireTwoFactor || false}
                    onChange={(e) => setSystemSettings({
                      ...systemSettings,
                      security: {
                        ...systemSettings.security,
                        requireTwoFactor: e.target.checked
                      }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* 알림 설정 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🔔 알림 설정</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">시스템 알림</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={systemSettings.notifications?.systemAlerts || false}
                    onChange={(e) => setSystemSettings({
                      ...systemSettings,
                      notifications: {
                        ...systemSettings.notifications,
                        systemAlerts: e.target.checked
                      }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium">오류 알림</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={systemSettings.notifications?.errorNotifications || false}
                    onChange={(e) => setSystemSettings({
                      ...systemSettings,
                      notifications: {
                        ...systemSettings.notifications,
                        errorNotifications: e.target.checked
                      }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium">성능 알림</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={systemSettings.notifications?.performanceAlerts || false}
                    onChange={(e) => setSystemSettings({
                      ...systemSettings,
                      notifications: {
                        ...systemSettings.notifications,
                        performanceAlerts: e.target.checked
                      }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  알림 수신 이메일
                </label>
                <input
                  type="email"
                  value={systemSettings.notifications?.emailRecipients?.[0] || ''}
                  onChange={(e) => setSystemSettings({
                    ...systemSettings,
                    notifications: {
                      ...systemSettings.notifications,
                      emailRecipients: [e.target.value]
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="admin@jjswim.com"
                />
              </div>
            </div>
          </div>

          {/* 백업 설정 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">💾 백업 설정</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">자동 백업</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={systemSettings.backup?.autoBackup || false}
                    onChange={(e) => setSystemSettings({
                      ...systemSettings,
                      backup: {
                        ...systemSettings.backup,
                        autoBackup: e.target.checked
                      }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium">백업 주기</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={systemSettings.backup?.backupInterval || 24}
                    onChange={(e) => setSystemSettings({
                      ...systemSettings,
                      backup: {
                        ...systemSettings.backup,
                        backupInterval: parseInt(e.target.value)
                      }
                    })}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                    min="1"
                    max="168"
                  />
                  <span className="text-sm text-gray-500">시간</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium">보관 기간</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={systemSettings.backup?.retentionDays || 30}
                    onChange={(e) => setSystemSettings({
                      ...systemSettings,
                      backup: {
                        ...systemSettings.backup,
                        retentionDays: parseInt(e.target.value)
                      }
                    })}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                    min="1"
                    max="365"
                  />
                  <span className="text-sm text-gray-500">일</span>
                </div>
              </div>

              {systemSettings.backup?.lastBackup && (
                <div className="flex items-center justify-between">
                  <span className="font-medium">마지막 백업</span>
                  <span className="text-sm text-gray-600">
                    {new Date(systemSettings.backup.lastBackup).toLocaleString()}
                  </span>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={triggerBackup}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  💾 지금 백업 실행
                </button>
              </div>
            </div>
          </div>

          {/* 성능 설정 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">⚡ 성능 설정</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">캐시 활성화</span>
                  <p className="text-sm text-gray-500">API 응답 캐싱으로 성능 향상</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={systemSettings.performance?.cacheEnabled || false}
                    onChange={(e) => setSystemSettings({
                      ...systemSettings,
                      performance: {
                        ...systemSettings.performance,
                        cacheEnabled: e.target.checked
                      }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">압축 활성화</span>
                  <p className="text-sm text-gray-500">응답 데이터 압축으로 전송 속도 향상</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={systemSettings.performance?.compressionEnabled || false}
                    onChange={(e) => setSystemSettings({
                      ...systemSettings,
                      performance: {
                        ...systemSettings.performance,
                        compressionEnabled: e.target.checked
                      }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">로그 레벨</span>
                  <p className="text-sm text-gray-500">시스템 로그 상세도 설정</p>
                </div>
                <select
                  value={systemSettings.performance?.logLevel || 'info'}
                  onChange={(e) => setSystemSettings({
                    ...systemSettings,
                    performance: {
                      ...systemSettings.performance,
                      logLevel: e.target.value
                    }
                  })}
                  className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="error">Error (오류만)</option>
                  <option value="warn">Warning (경고 이상)</option>
                  <option value="info">Info (정보 이상)</option>
                  <option value="debug">Debug (모든 로그)</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">최대 로그 크기</span>
                  <p className="text-sm text-gray-500">로그 파일 최대 크기 제한</p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={systemSettings.performance?.maxLogSize || 100}
                    onChange={(e) => setSystemSettings({
                      ...systemSettings,
                      performance: {
                        ...systemSettings.performance,
                        maxLogSize: parseInt(e.target.value)
                      }
                    })}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                    min="1"
                    max="1000"
                  />
                  <span className="text-sm text-gray-500">MB</span>
                </div>
              </div>
            </div>
          </div>

          {/* 저장 버튼 */}
          <div className="flex justify-end">
            <button
              onClick={saveSettings}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? '💾 저장 중...' : '💾 설정 저장'}
            </button>
          </div>
        </div>
      )}

      {/* 사용자 활동 탭 */}
      {activeTab === 'activity' && userActivity && (
        <div className="space-y-6">
          {/* 활동 통계 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">👥 현재 활성 사용자</h3>
              <div className="text-3xl font-bold text-green-600">
                {userActivity.activeUsers}
              </div>
              <p className="text-sm text-gray-500">현재 접속 중 (실제 데이터)</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">📅 오늘 로그인</h3>
              <div className="text-3xl font-bold text-blue-600">
                {userActivity.todayLogins}
              </div>
              <p className="text-sm text-gray-500">오늘 총 로그인 수 (실제 데이터)</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">📊 주간 로그인</h3>
              <div className="text-3xl font-bold text-purple-600">
                {userActivity.weeklyLogins}
              </div>
              <p className="text-sm text-gray-500">이번 주 총 로그인 (실제 데이터)</p>
            </div>
          </div>

          {/* 인기 페이지 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🌐 인기 페이지</h3>
            <div className="space-y-3">
              {userActivity.topPages.map((page: any, index: number) => (
                <div key={page.path} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      {index + 1}
                    </div>
                    <span className="font-mono text-sm">{page.path}</span>
                  </div>
                  <div className="text-sm font-medium text-gray-600">
                    {page.visits.toLocaleString()} 방문
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemPage;