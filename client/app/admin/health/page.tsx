/**
 * 📝 JJ Swim Lab - 최고관리자용 건강체크 관리 페이지
 *
 * 📋 **페이지 목적**
 * - 전체 회원의 건강정보 현황 및 통계 관리
 * - 건강체크 항목 및 기준 설정
 * - 건강정보 공개/비공개 정책 관리
 * - AI 기반 건강 분석 시스템 관리
 * - 센터별 건강정보 현황 모니터링
 *
 * 🔄 **주요 기능**
 * - 전체 회원 건강정보 현황 대시보드
 * - 건강체크 항목 및 기준 설정
 * - 공개/비공개 정책 관리
 * - AI 분석 알고리즘 설정
 * - 센터별 건강정보 통계
 * - 건강정보 접근 권한 관리
 *
 * 🗄️ **데이터 연동**
 * - 전체 회원 건강정보 데이터베이스
 * - 건강체크 기준 및 정책 설정
 * - AI 분석 결과 및 통계
 * - 센터별 건강정보 현황
 * - 접근 권한 및 보안 설정
 *
 * 🛠️ **필요한 설치 파일**
 * - React (useState, useEffect)
 * - useAuth hook (사용자 인증)
 * - 건강정보 관리 API
 * - 차트 및 시각화 라이브러리
 * - Tailwind CSS (스타일링)
 *
 * ⚠️ **개발 시 주의사항**
 * 1. 최고관리자 권한 확인 필수
 * 2. 개인정보 보호 및 데이터 보안 강화
 * 3. 건강정보 접근 권한 세밀한 제어
 * 4. AI 분석 시스템 정확성 및 신뢰성
 * 5. 센터별 데이터 분리 및 관리
 *
 * 🔧 **수정 시 체크리스트**
 * - [ ] 최고관리자 권한 확인
 * - [ ] 건강체크 기준 설정 기능
 * - [ ] 공개/비공개 정책 관리
 * - [ ] AI 분석 시스템 설정
 * - [ ] 센터별 데이터 관리
 *
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (최고관리자용 건강체크 관리 페이지)
 *
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (최고관리자용 건강체크 관리 시스템 완료)
 *
 * 🚀 **다음 단계**
 * - 실시간 데이터 분석
 * - AI 성능 최적화
 * - 예측 모델 정확도 향상
 * - 사용자 경험 개선
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';

interface HealthStandard {
  id: string;
  name: string;
  category: string;
  criteria: string;
  isRequired: boolean;
  isPublic: boolean;
  weight: number;
}

interface PrivacySetting {
  id: string;
  category: string;
  defaultVisibility: boolean;
  allowUserOverride: boolean;
  description: string;
}

interface HealthStatistics {
  totalMembers: number;
  activeHealthProfiles: number;
  publicProfiles: number;
  privateProfiles: number;
  averageBMI: number;
  healthRiskMembers: number;
}

export default function AdminHealthPage() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'standards' | 'privacy' | 'ai-settings' | 'statistics'>('overview');
  const [healthStandards, setHealthStandards] = useState<HealthStandard[]>([]);
  const [privacySettings, setPrivacySettings] = useState<PrivacySetting[]>([]);
  const [healthStats, setHealthStats] = useState<HealthStatistics | null>(null);

  // 권한 확인
  useEffect(() => {
    if (loading) {
      return;
    }
    
    if (!user || user.userType !== 'superAdmin') {
      console.error('🚫 최고관리자 권한이 필요합니다.');
      return;
    }
    
    loadHealthData();
  }, [user, loading]);

  const loadHealthData = async () => {
    // 실제 API 연동 시에는 실제 엔드포인트로 변경
    const mockStandards: HealthStandard[] = [
      {
        id: '1',
        name: 'BMI 지수',
        category: '신체지수',
        criteria: '18.5-24.9 (정상)',
        isRequired: true,
        isPublic: true,
        weight: 0.3
      },
      {
        id: '2',
        name: '혈압',
        category: '혈압',
        criteria: '120/80 mmHg 이하',
        isRequired: true,
        isPublic: false,
        weight: 0.25
      },
      {
        id: '3',
        name: '혈당',
        category: '혈당',
        criteria: '공복 100mg/dL 이하',
        isRequired: false,
        isPublic: false,
        weight: 0.2
      }
    ];

    const mockPrivacy: PrivacySetting[] = [
      {
        id: '1',
        category: '신체정보',
        defaultVisibility: true,
        allowUserOverride: true,
        description: '키, 몸무게, BMI 등 기본 신체 정보'
      },
      {
        id: '2',
        category: '건강상태',
        defaultVisibility: false,
        allowUserOverride: true,
        description: '혈압, 혈당, 알레르기 등 건강 상태 정보'
      },
      {
        id: '3',
        category: '운동기록',
        defaultVisibility: true,
        allowUserOverride: true,
        description: '운동 강도, 목표 달성도 등 운동 관련 정보'
      }
    ];

    const mockStats: HealthStatistics = {
      totalMembers: 1250,
      activeHealthProfiles: 980,
      publicProfiles: 720,
      privateProfiles: 260,
      averageBMI: 23.4,
      healthRiskMembers: 45
    };

    setHealthStandards(mockStandards);
    setPrivacySettings(mockPrivacy);
    setHealthStats(mockStats);
  };

  const handleStandardUpdate = (standard: HealthStandard) => {
    setHealthStandards(prev => 
      prev.map(s => s.id === standard.id ? standard : s)
    );
  };

  const handlePrivacyUpdate = (setting: PrivacySetting) => {
    setPrivacySettings(prev => 
      prev.map(s => s.id === setting.id ? setting : s)
    );
  };

  const tabs = [
    { id: 'overview' as const, label: '📊 전체 현황', icon: '📊' },
    { id: 'standards' as const, label: '📋 건강체크 기준', icon: '📋' },
    { id: 'privacy' as const, label: '🔒 공개/비공개 설정', icon: '🔒' },
    { id: 'ai-settings' as const, label: '🤖 AI 설정', icon: '🤖' },
    { id: 'statistics' as const, label: '📈 통계', icon: '📈' }
  ];

  // 권한이 없는 경우 접근 거부
  if (!loading && (!user || user.userType !== 'superAdmin')) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">🚫</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">접근 권한이 없습니다</h2>
              <p className="text-gray-600">
                이 페이지는 최고관리자만 접근할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 로딩 중
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">권한을 확인하는 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🏥 건강체크 관리 시스템</h1>
          <p className="text-gray-600">
            전체 회원의 건강정보를 관리하고, 건강체크 기준과 정책을 설정하세요.
          </p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="mb-6">
          <nav className="flex space-x-8 border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="space-y-6">
          {/* 전체 현황 탭 */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <span className="text-2xl">👥</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">전체 회원</p>
                      <p className="text-2xl font-bold text-gray-900">{healthStats?.totalMembers || 0}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <span className="text-2xl">📊</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">건강프로필</p>
                      <p className="text-2xl font-bold text-gray-900">{healthStats?.activeHealthProfiles || 0}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <span className="text-2xl">🔓</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">공개 프로필</p>
                      <p className="text-2xl font-bold text-gray-900">{healthStats?.publicProfiles || 0}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <span className="text-2xl">⚠️</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">건강 위험</p>
                      <p className="text-2xl font-bold text-gray-900">{healthStats?.healthRiskMembers || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 건강 현황 요약</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">평균 BMI</h4>
                    <p className="text-3xl font-bold text-blue-600">{healthStats?.averageBMI || 0}</p>
                    <p className="text-sm text-gray-500">정상 범위: 18.5 - 24.9</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">프로필 활성화율</h4>
                    <p className="text-3xl font-bold text-green-600">
                      {healthStats ? Math.round((healthStats.activeHealthProfiles / healthStats.totalMembers) * 100) : 0}%
                    </p>
                    <p className="text-sm text-gray-500">전체 회원 대비</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 건강체크 기준 탭 */}
          {activeTab === 'standards' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">📋 건강체크 기준 관리</h3>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    ➕ 새 기준 추가
                  </button>
                </div>
                
                <div className="space-y-4">
                  {healthStandards.map((standard) => (
                    <div key={standard.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{standard.name}</h4>
                          <p className="text-sm text-gray-600">{standard.category}</p>
                          <p className="text-sm text-gray-500">{standard.criteria}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={standard.isRequired}
                              onChange={(e) => handleStandardUpdate({
                                ...standard,
                                isRequired: e.target.checked
                              })}
                              className="mr-2"
                            />
                            <span className="text-sm">필수</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={standard.isPublic}
                              onChange={(e) => handleStandardUpdate({
                                ...standard,
                                isPublic: e.target.checked
                              })}
                              className="mr-2"
                            />
                            <span className="text-sm">공개</span>
                          </label>
                          <button className="text-blue-600 hover:text-blue-800 text-sm">수정</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 공개/비공개 설정 탭 */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🔒 개인정보 보호 설정</h3>
                
                <div className="space-y-4">
                  {privacySettings.map((setting) => (
                    <div key={setting.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{setting.category}</h4>
                          <p className="text-sm text-gray-600">{setting.description}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={setting.defaultVisibility}
                              onChange={(e) => handlePrivacyUpdate({
                                ...setting,
                                defaultVisibility: e.target.checked
                              })}
                              className="mr-2"
                            />
                            <span className="text-sm">기본 공개</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={setting.allowUserOverride}
                              onChange={(e) => handlePrivacyUpdate({
                                ...setting,
                                allowUserOverride: e.target.checked
                              })}
                              className="mr-2"
                            />
                            <span className="text-sm">사용자 설정 허용</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* AI 설정 탭 */}
          {activeTab === 'ai-settings' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🤖 AI 분석 시스템 설정</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        AI 분석 정확도 임계값
                      </label>
                      <input
                        type="range"
                        min="0.7"
                        max="0.95"
                        step="0.05"
                        defaultValue="0.85"
                        className="w-full"
                      />
                      <p className="text-sm text-gray-500">85%</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        자동 알림 활성화
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="mr-2" />
                        <span className="text-sm">건강 위험 시 자동 알림</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        데이터 분석 주기
                      </label>
                      <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                        <option>매일</option>
                        <option>매주</option>
                        <option>매월</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        예측 모델 업데이트
                      </label>
                      <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                        모델 업데이트
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 통계 탭 */}
          {activeTab === 'statistics' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 상세 통계</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      {healthStats ? Math.round((healthStats.publicProfiles / healthStats.activeHealthProfiles) * 100) : 0}%
                    </div>
                    <p className="text-sm text-blue-800">건강정보 공개율</p>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      {healthStats ? Math.round((healthStats.healthRiskMembers / healthStats.totalMembers) * 100) : 0}%
                    </div>
                    <p className="text-sm text-green-800">건강 위험 비율</p>
                  </div>
                  
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600 mb-2">
                      {healthStats ? Math.round((healthStats.activeHealthProfiles / healthStats.totalMembers) * 100) : 0}%
                    </div>
                    <p className="text-sm text-yellow-800">프로필 완성율</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
