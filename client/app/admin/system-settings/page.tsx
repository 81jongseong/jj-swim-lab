/**
 * @file 시스템 설정 페이지
 * @description 최고관리자가 시스템 설정을 관리하는 페이지
 * @date 2025-01-13
 * @author JJ Swim Lab
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';

export default function SystemSettingsPage() {
  const { user, hasUserType } = useAuth();
  
  // 상태 관리
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'backup' | 'maintenance'>('general');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // 시스템 설정 데이터
  const [settings, setSettings] = useState({
    general: {
      siteName: 'JJ Swim Lab',
      siteDescription: '수영 교육 및 관리 시스템',
      timezone: 'Asia/Seoul',
      language: 'ko',
      maintenanceMode: false,
      maintenanceMessage: '시스템 점검 중입니다. 잠시 후 다시 이용해 주세요.'
    },
    security: {
      maxLoginAttempts: 5,
      lockoutDuration: 30,
      passwordMinLength: 8,
      requireTwoFactor: false,
      sessionTimeout: 60,
      ipWhitelist: [],
      enableAuditLog: true
    },
    backup: {
      autoBackup: true,
      backupInterval: 24,
      retentionDays: 30,
      backupLocation: '/backups',
      compressionEnabled: true,
      lastBackup: '2025-01-13 02:00:00'
    },
    maintenance: {
      enableMaintenance: false,
      maintenanceMessage: '시스템 점검 중입니다.',
      scheduledMaintenance: {
        enabled: false,
        startTime: '2025-01-15 02:00:00',
        endTime: '2025-01-15 04:00:00',
        message: '정기 점검으로 인한 서비스 중단'
      }
    }
  });

  // 설정 저장
  const saveSettings = async () => {
    setSaving(true);
    try {
      // 실제 API 호출 대신 목 데이터 업데이트
      setLastUpdated(new Date());
      console.log('시스템 설정 저장 완료');
      alert('설정이 저장되었습니다.');
    } catch (error) {
      console.error('설정 저장 실패:', error);
      alert('설정 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // 설정 초기화
  const resetSettings = () => {
    if (confirm('설정을 초기화하시겠습니까?')) {
      // 기본값으로 초기화
      setLastUpdated(new Date());
      alert('설정이 초기화되었습니다.');
    }
  };

  useEffect(() => {
    // 설정 데이터 로드
    setLastUpdated(new Date());
  }, []);

  // 권한 확인
  if (!user || !hasUserType('superAdmin')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">접근 권한 없음</h1>
          <p className="text-gray-600">이 페이지는 최고관리자만 접근할 수 있습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">시스템 설정</h1>
            <p className="text-gray-600 mt-2">JJ Swim Lab 시스템 설정 및 관리</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={resetSettings}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              초기화
            </button>
            <button
              onClick={saveSettings}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? '저장 중...' : '설정 저장'}
            </button>
            <div className="text-sm text-gray-500">
              마지막 업데이트: {lastUpdated.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'general', label: '일반 설정', icon: '⚙️' },
              { id: 'security', label: '보안 설정', icon: '🔒' },
              { id: 'backup', label: '백업 설정', icon: '💾' },
              { id: 'maintenance', label: '유지보수', icon: '🔧' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* 탭 컨텐츠 */}
      {activeTab === 'general' && (
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">일반 설정</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">사이트 이름</label>
                <input
                  type="text"
                  value={settings.general.siteName}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    general: { ...prev.general, siteName: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">사이트 설명</label>
                <input
                  type="text"
                  value={settings.general.siteDescription}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    general: { ...prev.general, siteDescription: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">시간대</label>
                <select
                  value={settings.general.timezone}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    general: { ...prev.general, timezone: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Asia/Seoul">Asia/Seoul (한국 표준시)</option>
                  <option value="UTC">UTC (협정 세계시)</option>
                  <option value="America/New_York">America/New_York (미국 동부)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">언어</label>
                <select
                  value={settings.general.language}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    general: { ...prev.general, language: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ko">한국어</option>
                  <option value="en">English</option>
                  <option value="ja">日本語</option>
                </select>
              </div>
            </div>
            <div className="mt-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.general.maintenanceMode}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    general: { ...prev.general, maintenanceMode: e.target.checked }
                  }))}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">유지보수 모드 활성화</span>
              </label>
              {settings.general.maintenanceMode && (
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">유지보수 메시지</label>
                  <textarea
                    value={settings.general.maintenanceMessage}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      general: { ...prev.general, maintenanceMessage: e.target.value }
                    }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">보안 설정</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">최대 로그인 시도 횟수</label>
                <input
                  type="number"
                  value={settings.security.maxLoginAttempts}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    security: { ...prev.security, maxLoginAttempts: parseInt(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">계정 잠금 시간 (분)</label>
                <input
                  type="number"
                  value={settings.security.lockoutDuration}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    security: { ...prev.security, lockoutDuration: parseInt(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">최소 비밀번호 길이</label>
                <input
                  type="number"
                  value={settings.security.passwordMinLength}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    security: { ...prev.security, passwordMinLength: parseInt(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">세션 타임아웃 (분)</label>
                <input
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    security: { ...prev.security, sessionTimeout: parseInt(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mt-6 space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.security.requireTwoFactor}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    security: { ...prev.security, requireTwoFactor: e.target.checked }
                  }))}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">2단계 인증 필수</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.security.enableAuditLog}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    security: { ...prev.security, enableAuditLog: e.target.checked }
                  }))}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">감사 로그 활성화</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'backup' && (
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">백업 설정</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">백업 간격 (시간)</label>
                <input
                  type="number"
                  value={settings.backup.backupInterval}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    backup: { ...prev.backup, backupInterval: parseInt(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">보관 기간 (일)</label>
                <input
                  type="number"
                  value={settings.backup.retentionDays}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    backup: { ...prev.backup, retentionDays: parseInt(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">백업 위치</label>
                <input
                  type="text"
                  value={settings.backup.backupLocation}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    backup: { ...prev.backup, backupLocation: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">마지막 백업</label>
                <input
                  type="text"
                  value={settings.backup.lastBackup}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                />
              </div>
            </div>
            <div className="mt-6 space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.backup.autoBackup}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    backup: { ...prev.backup, autoBackup: e.target.checked }
                  }))}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">자동 백업 활성화</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.backup.compressionEnabled}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    backup: { ...prev.backup, compressionEnabled: e.target.checked }
                  }))}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">압축 활성화</span>
              </label>
            </div>
            <div className="mt-6">
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                지금 백업 실행
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'maintenance' && (
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">유지보수 설정</h3>
            <div className="space-y-6">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.maintenance.enableMaintenance}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      maintenance: { ...prev.maintenance, enableMaintenance: e.target.checked }
                    }))}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">유지보수 모드 활성화</span>
                </label>
                {settings.maintenance.enableMaintenance && (
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">유지보수 메시지</label>
                    <textarea
                      value={settings.maintenance.maintenanceMessage}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        maintenance: { ...prev.maintenance, maintenanceMessage: e.target.value }
                      }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
              
              <div>
                <h4 className="text-md font-medium mb-3">예약된 유지보수</h4>
                <label className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    checked={settings.maintenance.scheduledMaintenance.enabled}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      maintenance: {
                        ...prev.maintenance,
                        scheduledMaintenance: {
                          ...prev.maintenance.scheduledMaintenance,
                          enabled: e.target.checked
                        }
                      }
                    }))}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">예약된 유지보수 활성화</span>
                </label>
                {settings.maintenance.scheduledMaintenance.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">시작 시간</label>
                      <input
                        type="datetime-local"
                        value={settings.maintenance.scheduledMaintenance.startTime.replace(' ', 'T')}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          maintenance: {
                            ...prev.maintenance,
                            scheduledMaintenance: {
                              ...prev.maintenance.scheduledMaintenance,
                              startTime: e.target.value.replace('T', ' ')
                            }
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">종료 시간</label>
                      <input
                        type="datetime-local"
                        value={settings.maintenance.scheduledMaintenance.endTime.replace(' ', 'T')}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          maintenance: {
                            ...prev.maintenance,
                            scheduledMaintenance: {
                              ...prev.maintenance.scheduledMaintenance,
                              endTime: e.target.value.replace('T', ' ')
                            }
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">메시지</label>
                      <textarea
                        value={settings.maintenance.scheduledMaintenance.message}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          maintenance: {
                            ...prev.maintenance,
                            scheduledMaintenance: {
                              ...prev.maintenance.scheduledMaintenance,
                              message: e.target.value
                            }
                          }
                        }))}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
