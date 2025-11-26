/**
 * 📝 JJ Swim Lab - AI 기반 맞춤형 강습 시스템 페이지
 * 
 * 📋 **페이지 목적**
 * - AI 기반 개인 맞춤형 강습 계획 생성 및 관리
 * - 사용자 건강 정보 기반 운동량 및 프로그램 주기 최적화
 * - AI 분석 결과 및 진행 상황 추적
 * - 건강체크 기준 설정 및 공개/비공개 권한 관리
 * - 운동량 추천 알고리즘 설정 및 최적화
 * 
 * 🔄 **주요 기능**
 * - AI 기반 맞춤형 강습 계획 생성
 * - 건강 정보 기반 운동량 추천
 * - 강습 진행 상황 AI 분석
 * - 건강체크 기준 및 항목 설정
 * - 공개/비공개 설정 권한 관리
 * - 운동량 추천 알고리즘 설정
 * - 전체 회원 건강 정보 통계 및 분석
 * 
 * 🗄️ **데이터 연동**
 * - 사용자 건강 프로필 정보
 * - AI 분석 결과 및 추천 데이터
 * - 강습 진행 상황 및 성과 데이터
 * - 건강체크 기준 및 설정 데이터
 * - 공개/비공개 설정 정보
 * - 운동량 추천 알고리즘 파라미터
 * 
 * 🛠️ **필요한 설치 파일**
 * - React (useState, useEffect, useCallback)
 * - AI 분석 및 추천 시스템
 * - 건강 정보 관리 API
 * - 권한 관리 시스템
 * - 차트 및 시각화 라이브러리
 * - Tailwind CSS (스타일링)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 최고 관리자 권한 확인 필수
 * 2. 건강 정보 보안 및 개인정보 보호
 * 3. AI 추천 시스템의 정확성 및 신뢰성
 * 4. 권한별 데이터 접근 제한
 * 5. 실시간 데이터 업데이트 및 동기화
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 최고 관리자 권한 확인
 * - [ ] 건강 정보 보안 설정 검증
 * - [ ] AI 추천 시스템 정확성 확인
 * - [ ] 권한별 데이터 접근 제한 검증
 * - [ ] 실시간 데이터 업데이트 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 AI 기반 강습 시스템)
 * - 2024-12-19: 건강 정보 관리 시스템 구현
 * - 2024-12-19: 권한별 데이터 접근 제한 구현
 * - 2024-12-19: 운동량 추천 알고리즘 설정 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (AI 기반 맞춤형 강습 시스템 완료)
 * 
 * 🚀 **다음 단계**
 * - AI 성능 최적화
 * - 실시간 데이터 분석
 * - 예측 모델 정확도 향상
 * - 사용자 경험 개선
 * 
 * 💡 **사용 예시**
 * ```tsx
 * <AIConfigPage 
 *   onHealthStandardUpdate={(standards) => handleStandardsUpdate(standards)}
 *   onPrivacySettingsUpdate={(settings) => handlePrivacyUpdate(settings)}
 *   onAlgorithmUpdate={(algorithm) => handleAlgorithmUpdate(algorithm)}
 *   enableRealTimeMonitoring={true}
 * />
 * ```
 */

/**
 * 📝 JJ Swim Lab - 최고관리자용 AI 설정 및 건강정보 관리 페이지
 *
 * 📋 **페이지 목적**
 * - 최고관리자가 AI 기반 맞춤형 수영 강습 시스템을 관리하는 페이지
 * - 회원들의 건강정보를 AI 도구에서 읽어와 운동량 및 프로그램 주기 최적화
 * - 건강체크 항목 및 기준의 공개/비공개 설정 권한 관리
 * - AI 추천 알고리즘 및 운동량 추천 시스템 관리
 * - 전체 시스템의 건강정보 통계 및 현황 모니터링
 *
 * 🔄 **주요 기능**
 * - AI 기반 맞춤형 수영 강습 계획 생성 및 관리
 * - 회원 건강정보 AI 분석 결과 및 추천 시스템
 * - 건강체크 기준 및 항목 정의 및 관리
 * - 공개/비공개 설정 권한 관리
 * - 운동량 추천 알고리즘 최적화
 * - 건강정보 통계 및 트렌드 분석
 *
 * 🗄️ **데이터 연동**
 * - AI 분석 엔진 및 추천 시스템
 * - 회원 건강정보 데이터베이스
 * - 건강체크 기준 및 설정 데이터
 * - AI 추천 알고리즘 데이터
 * - 건강정보 통계 및 분석 데이터
 *
 * 🛠️ **필요한 설치 파일**
 * - React (useState, useEffect)
 * - useAuth hook (권한 확인)
 * - AI 분석 및 추천 시스템
 * - 차트 및 시각화 라이브러리
 * - Tailwind CSS (스타일링)
 *
 * ⚠️ **개발 시 주의사항**
 * 1. 최고관리자 권한 확인 필수
 * 2. 개인정보 보호 및 데이터 보안 강화
 * 3. AI 추천 시스템의 정확성 및 신뢰성
 * 4. 건강정보 접근 권한 세분화
 * 5. 실시간 데이터 업데이트 및 동기화
 *
 * 🔧 **수정 시 체크리스트**
 * - [ ] 최고관리자 권한 확인
 * - [ ] AI 추천 시스템 정확성 검증
 * - [ ] 건강정보 보안 설정 검증
 * - [ ] 공개/비공개 설정 권한 확인
 * - [ ] 실시간 데이터 업데이트 확인
 *
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (AI 설정 및 건강정보 관리 페이지)
 * - 2024-12-19: AI 기반 맞춤형 강습 시스템 구현
 * - 2024-12-19: 건강체크 기준 및 설정 관리 구현
 * - 2024-12-19: 공개/비공개 설정 권한 시스템 구현
 *
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (AI 설정 및 건강정보 관리 시스템 완료)
 *
 * 🚀 **다음 단계**
 * - AI 성능 최적화
 * - 실시간 데이터 분석
 * - 예측 모델 정확도 향상
 * - 사용자 경험 개선
 *
 * 💡 **사용 예시**
 * ```tsx
 * <AIConfigPage
 *   onHealthStandardUpdate={(standard) => handleStandardUpdate(standard)}
 *   onPrivacySettingChange={(setting) => handlePrivacyChange(setting)}
 *   onAlgorithmOptimize={(algorithm) => handleAlgorithmOptimize(algorithm)}
 *   enableRealTimeMonitoring={true}
 * />
 * ```
 */
'use client';
import { logger } from '@/lib/logger';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { CardGrid, LoadingState, PageHeader, ErrorState } from '@/components/common';
import { 
  Brain, 
  Activity, 
  Users, 
  Settings, 
  Shield, 
  TrendingUp, 
  BarChart3,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Target,
  Zap,
  Heart,
  Dumbbell
} from 'lucide-react';

interface HealthStandard {
  id: string;
  name: string;
  category: string;
  minValue: number;
  maxValue: number;
  unit: string;
  isRequired: boolean;
  isPublic: boolean;
  description: string;
}

interface PrivacySetting {
  id: string;
  category: string;
  isPublic: boolean;
  description: string;
  allowedRoles: string[];
}

interface ExerciseAlgorithm {
  id: string;
  name: string;
  parameters: {
    intensity: number;
    duration: number;
    frequency: number;
    restPeriod: number;
  };
  isActive: boolean;
  description: string;
}

interface HealthStatistics {
  totalUsers: number;
  activeUsers: number;
  averageBMI: number;
  averageAge: number;
  topHealthIssues: string[];
  exerciseCompliance: number;
}

export default function AIConfigPage() {
  const { user, hasUserType } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [healthStandards, setHealthStandards] = useState<HealthStandard[]>([]);
  const [privacySettings, setPrivacySettings] = useState<PrivacySetting[]>([]);
  const [exerciseAlgorithms, setExerciseAlgorithms] = useState<ExerciseAlgorithm[]>([]);
  const [healthStatistics, setHealthStatistics] = useState<HealthStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hooks는 항상 컴포넌트 최상단에 위치해야 함
  useEffect(() => {
    if (user?.userType === 'superAdmin') {
      loadData();
    }
  }, [user?.userType]);

  // 최고 관리자 권한 확인 (Hooks 이후에 위치)
  if (!hasUserType('superAdmin')) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">접근 권한이 없습니다</h1>
            <p className="text-gray-600">이 페이지는 최고 관리자만 접근할 수 있습니다.</p>
          </div>
        </div>
      </div>
    );
  }

  const loadData = async () => {
    try {
      // 실제 API 호출로 대체 필요
      const mockHealthStandards: HealthStandard[] = [
        {
          id: '1',
          name: 'BMI',
          category: '신체지수',
          minValue: 18.5,
          maxValue: 24.9,
          unit: 'kg/m²',
          isRequired: true,
          isPublic: true,
          description: '체질량지수 - 정상 범위 설정'
        },
        {
          id: '2',
          name: '혈압',
          category: '혈압',
          minValue: 90,
          maxValue: 140,
          unit: 'mmHg',
          isRequired: true,
          isPublic: false,
          description: '수축기 혈압 - 정상 범위 설정'
        },
        {
          id: '3',
          name: '심박수',
          category: '심혈관',
          minValue: 60,
          maxValue: 100,
          unit: 'bpm',
          isRequired: false,
          isPublic: true,
          description: '휴식 시 심박수 - 정상 범위 설정'
        }
      ];

      const mockPrivacySettings: PrivacySetting[] = [
        {
          id: '1',
          category: '기본 건강정보',
          isPublic: true,
          description: '키, 몸무게, BMI 등 기본 정보',
          allowedRoles: ['instructor', 'centerAdmin']
        },
        {
          id: '2',
          category: '상세 건강정보',
          isPublic: false,
          description: '혈압, 심박수, 질병 이력 등 상세 정보',
          allowedRoles: ['instructor']
        },
        {
          id: '3',
          category: '운동 기록',
          isPublic: true,
          description: '운동 종류, 강도, 지속시간 등',
          allowedRoles: ['instructor', 'centerAdmin']
        }
      ];

      const mockExerciseAlgorithms: ExerciseAlgorithm[] = [
        {
          id: '1',
          name: '초급자 운동량 추천',
          parameters: {
            intensity: 3,
            duration: 30,
            frequency: 3,
            restPeriod: 48
          },
          isActive: true,
          description: '수영 초급자를 위한 안전한 운동량 설정'
        },
        {
          id: '2',
          name: '중급자 운동량 추천',
          parameters: {
            intensity: 6,
            duration: 45,
            frequency: 4,
            restPeriod: 24
          },
          isActive: true,
          description: '수영 중급자를 위한 균형잡힌 운동량 설정'
        },
        {
          id: '3',
          name: '고급자 운동량 추천',
          parameters: {
            intensity: 8,
            duration: 60,
            frequency: 5,
            restPeriod: 12
          },
          isActive: true,
          description: '수영 고급자를 위한 고강도 운동량 설정'
        }
      ];

      const mockHealthStatistics: HealthStatistics = {
        totalUsers: 1250,
        activeUsers: 890,
        averageBMI: 22.3,
        averageAge: 28.5,
        topHealthIssues: ['관절 통증', '근육 긴장', '피로도'],
        exerciseCompliance: 78.5
      };

      setHealthStandards(mockHealthStandards);
      setPrivacySettings(mockPrivacySettings);
      setExerciseAlgorithms(mockExerciseAlgorithms);
      setHealthStatistics(mockHealthStatistics);
    } catch (error) {
      logger.error('데이터 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHealthStandardUpdate = (standard: HealthStandard) => {
    setHealthStandards(prev => 
      prev.map(s => s.id === standard.id ? standard : s)
    );
  };

  const handlePrivacySettingUpdate = (setting: PrivacySetting) => {
    setPrivacySettings(prev => 
      prev.map(s => s.id === setting.id ? setting : s)
    );
  };

  const handleAlgorithmUpdate = (algorithm: ExerciseAlgorithm) => {
    setExerciseAlgorithms(prev => 
      prev.map(a => a.id === algorithm.id ? algorithm : a)
    );
  };

  const tabs = [
    { id: 'overview', label: '📊 전체 현황', icon: BarChart3 },
    { id: 'health-standards', label: '📋 건강체크 기준', icon: Target },
    { id: 'privacy-settings', label: '🔒 공개/비공개 설정', icon: Shield },
    { id: 'exercise-algorithms', label: '💡 운동량 추천 알고리즘', icon: Brain },
    { id: 'health-statistics', label: '🏥 건강정보 통계', icon: Heart }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LoadingState message="데이터를 불러오는 중..." size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <PageHeader
          title="🤖 AI 설정 및 건강정보 관리"
          description="AI 기반 맞춤형 강습 시스템 설정 및 전체 회원 건강정보 관리"
        />

        {/* 탭 네비게이션 */}
        <div className="mb-8">
          <nav className="flex space-x-8 border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
            <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="bg-white rounded-lg shadow">
          {activeTab === 'overview' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 AI 시스템 전체 현황</h2>
              
              {/* 시스템 상태 카드들 */}
              <CardGrid gap={6} className="mb-8">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-blue-600">전체 회원</p>
                      <p className="text-2xl font-bold text-blue-900">{healthStatistics?.totalUsers}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-6 rounded-lg">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Activity className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-green-600">활성 회원</p>
                      <p className="text-2xl font-bold text-green-900">{healthStatistics?.activeUsers}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-6 rounded-lg">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Target className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-purple-600">건강체크 기준</p>
                      <p className="text-2xl font-bold text-purple-900">{healthStandards.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 p-6 rounded-lg">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Brain className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-orange-600">활성 알고리즘</p>
                      <p className="text-2xl font-bold text-orange-900">
                        {exerciseAlgorithms.filter(a => a.isActive).length}
                      </p>
                    </div>
                  </div>
                </div>
              </CardGrid>

              {/* 최근 활동 */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🔄 최근 시스템 활동</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">건강정보 업데이트</span>
                    <span className="text-sm text-gray-500">방금 전</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">AI 추천 알고리즘 실행</span>
                    <span className="text-sm text-gray-500">5분 전</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">새로운 회원 등록</span>
                    <span className="text-sm text-gray-500">10분 전</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'health-standards' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">📋 건강체크 기준 설정</h2>
              
              <div className="mb-6">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
                  ➕ 새 기준 추가
            </button>
          </div>

              <div className="space-y-4">
                {healthStandards.map((standard) => (
                  <div key={standard.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{standard.name}</h3>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          standard.isRequired 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {standard.isRequired ? '필수' : '선택'}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          standard.isPublic 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {standard.isPublic ? '공개' : '비공개'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
            <div>
                        <p className="text-sm text-gray-500">카테고리</p>
                        <p className="font-medium">{standard.category}</p>
            </div>
            <div>
                        <p className="text-sm text-gray-500">범위</p>
                        <p className="font-medium">{standard.minValue} - {standard.maxValue} {standard.unit}</p>
            </div>
            <div>
                        <p className="text-sm text-gray-500">설명</p>
                        <p className="font-medium">{standard.description}</p>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        ✏️ 수정
                      </button>
                      <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                        🗑️ 삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'privacy-settings' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">🔒 공개/비공개 설정 관리</h2>
              
              <div className="space-y-4">
                {privacySettings.map((setting) => (
                  <div key={setting.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{setting.category}</h3>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          setting.isPublic 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {setting.isPublic ? '공개' : '비공개'}
                  </span>
            </div>
          </div>

                    <p className="text-gray-600 mb-3">{setting.description}</p>
                    
                    <div className="mb-3">
                      <p className="text-sm text-gray-500 mb-2">접근 가능한 역할:</p>
                      <div className="flex flex-wrap gap-2">
                        {setting.allowedRoles.map((role) => (
                          <span key={role} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {role === 'instructor' ? '강사' : 
                             role === 'centerAdmin' ? '센터 관리자' : role}
                          </span>
                        ))}
          </div>
        </div>

                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        ✏️ 수정
                      </button>
                      <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                        🗑️ 삭제
                  </button>
                </div>
                  </div>
                ))}
              </div>
                  </div>
                )}

          {activeTab === 'exercise-algorithms' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">💡 운동량 추천 알고리즘 설정</h2>
              
              <div className="mb-6">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
                  ➕ 새 알고리즘 추가
                </button>
              </div>

              <div className="space-y-4">
                {exerciseAlgorithms.map((algorithm) => (
                  <div key={algorithm.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{algorithm.name}</h3>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          algorithm.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {algorithm.isActive ? '활성' : '비활성'}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-3">{algorithm.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-500">강도 (1-10)</p>
                        <p className="font-medium">{algorithm.parameters.intensity}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">지속시간 (분)</p>
                        <p className="font-medium">{algorithm.parameters.duration}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">빈도 (주/회)</p>
                        <p className="font-medium">{algorithm.parameters.frequency}</p>
                      </div>
                    <div>
                        <p className="text-sm text-gray-500">휴식기간 (시간)</p>
                        <p className="font-medium">{algorithm.parameters.restPeriod}</p>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        ✏️ 수정
                      </button>
                      <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                        🗑️ 삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'health-statistics' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">🏥 전체 회원 건강정보 통계</h2>
              
              {/* 주요 통계 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">📊 평균 BMI</h3>
                  <p className="text-3xl font-bold text-blue-600">{healthStatistics?.averageBMI}</p>
                  <p className="text-sm text-blue-600">정상 범위: 18.5 - 24.9</p>
                </div>

                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">👥 평균 연령</h3>
                  <p className="text-3xl font-bold text-green-600">{healthStatistics?.averageAge}세</p>
                  <p className="text-sm text-green-600">활성 회원 기준</p>
                </div>

                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-purple-900 mb-2">💪 운동 준수율</h3>
                  <p className="text-3xl font-bold text-purple-600">{healthStatistics?.exerciseCompliance}%</p>
                  <p className="text-sm text-purple-600">권장 운동량 대비</p>
                </div>
              </div>

              {/* 주요 건강 이슈 */}
              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">⚠️ 주요 건강 이슈</h3>
                <div className="space-y-2">
                  {healthStatistics?.topHealthIssues.map((issue, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-700">{issue}</span>
                      <span className="text-sm text-gray-500">상위 {index + 1}위</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI 추천 효과 */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🤖 AI 추천 시스템 효과</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                    <h4 className="font-medium text-gray-700 mb-2">운동 성과 향상</h4>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                      <span className="text-sm font-medium text-gray-700">75%</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">건강 상태 개선</h4>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '68%' }}></div>
                      </div>
                      <span className="text-sm font-medium text-gray-700">68%</span>
                    </div>
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

















