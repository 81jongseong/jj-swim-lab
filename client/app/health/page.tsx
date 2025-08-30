/**
 * 📝 JJ Swim Lab - 학생용 건강정보 관리 페이지
 *
 * 📋 **페이지 목적**
 * - 학생이 자신의 건강 프로필을 관리하고 운동 기록을 추적하는 페이지
 * - 개인 건강정보 입력, 수정, 삭제 및 공개/비공개 설정
 * - AI 기반 맞춤형 운동 추천 및 건강 상태 분석
 * - 운동 기록 및 성과 추적을 통한 건강 개선 모니터링
 * - 개인정보 보호를 위한 세밀한 공개 설정 관리
 *
 * 🔄 **주요 기능**
 * - 개인 건강 프로필 관리 (키, 몸무게, BMI, 건강 상태 등)
 * - 건강정보 공개/비공개 설정 (개별 항목별 설정 가능)
 * - AI 기반 맞춤형 운동 계획 및 추천
 * - 운동 기록 및 성과 추적
 * - 건강 상태 변화 이력 및 트렌드 분석
 * - 개인정보 보안 및 접근 제어
 *
 * 🗄️ **데이터 연동**
 * - 개인 건강 프로필 데이터베이스
 * - AI 분석 및 추천 시스템
 * - 운동 기록 및 성과 데이터
 * - 건강 상태 변화 이력
 * - 공개/비공개 설정 정보
 *
 * 🛠️ **필요한 설치 파일**
 * - React (useState, useEffect)
 * - useAuth hook (사용자 인증)
 * - 건강정보 관리 API
 * - AI 분석 및 추천 시스템
 * - 차트 및 시각화 라이브러리
 * - Tailwind CSS (스타일링)
 *
 * ⚠️ **개발 시 주의사항**
 * 1. 학생 권한 확인 필수
 * 2. 개인정보 보호 및 데이터 보안 강화
 * 3. 공개/비공개 설정의 세밀한 제어
 * 4. AI 추천 시스템의 정확성 및 신뢰성
 * 5. 실시간 데이터 업데이트 및 동기화
 *
 * 🔧 **수정 시 체크리스트**
 * - [ ] 학생 권한 확인
 * - [ ] 개인정보 보안 설정 검증
 * - [ ] 공개/비공개 설정 기능 확인
 * - [ ] AI 추천 시스템 정확성 검증
 * - [ ] 실시간 데이터 업데이트 확인
 *
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (학생용 건강정보 관리 페이지)
 * - 2024-12-19: 개인 건강 프로필 관리 시스템 구현
 * - 2024-12-19: 공개/비공개 설정 시스템 구현
 * - 2024-12-19: AI 기반 운동 추천 시스템 구현
 *
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (학생용 건강정보 관리 시스템 완료)
 *
 * 🚀 **다음 단계**
 * - AI 성능 최적화
 * - 실시간 데이터 분석
 * - 예측 모델 정확도 향상
 * - 사용자 경험 개선
 *
 * 💡 **사용 예시**
 * ```tsx
 * <HealthPage
 *   onHealthUpdate={(healthData) => handleHealthUpdate(healthData)}
 *   onPrivacyChange={(setting) => handlePrivacyChange(setting)}
 *   onExerciseRecord={(record) => handleExerciseRecord(record)}
 *   enableRealTimeMonitoring={true}
 * />
 * ```
 */
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import HealthProfileForm from '../../components/HealthProfileForm';
import ExerciseDashboard from '../../components/ExerciseDashboard';
import ExerciseIntensityAI from '../../components/ExerciseIntensityAI';

interface HealthProfile {
  id?: string;
  height?: number;
  weight?: number;
  bmi?: number;
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  allergies?: string[];
  medicalConditions?: string[];
  medications?: string[];
  exerciseLevel?: string;
  swimmingExperience?: string;
  lastHealthCheck?: Date;
  isPublic?: {
    height: boolean;
    weight: boolean;
    bmi: boolean;
    bloodType: boolean;
    allergies: boolean;
    medicalConditions: boolean;
    medications: boolean;
    exerciseLevel: boolean;
    swimmingExperience: boolean;
  };
}



export default function HealthPage() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'exercise' | 'ai-training'>('profile');
  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 권한 확인 및 데이터 로딩
  useEffect(() => {
    // 로딩 중이거나 사용자 정보가 아직 준비되지 않은 경우 대기
    if (loading) {
      console.log('🔍 권한 확인 대기 중...', { loading, user: user?.userType });
      return;
    }
    
    // 사용자가 없거나 학생 권한이 없는 경우
    if (!user || user.userType !== 'student') {
      console.error('🚫 접근 권한이 없습니다.', { 
        hasUser: !!user, 
        userType: user?.userType,
        expectedType: 'student' 
      });
      return;
    }
    
    // 권한이 있는 경우 데이터 로딩
    console.log('✅ 학생 권한 확인됨, 데이터 로딩 시작');
    loadHealthProfile();
  }, [user, loading]);

  // 권한이 없는 경우 접근 거부 메시지 표시 (로딩 완료 후에만)
  if (!loading && (!user || user.userType !== 'student')) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">🚫</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">접근 권한이 없습니다</h2>
              <p className="text-gray-600">
                이 페이지는 학생 회원만 접근할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const loadHealthProfile = async () => {
    try {
      const response = await fetch('/api/exercise/health-profile');
      const data = await response.json();
      
      if (data.success) {
        setHealthProfile(data.healthProfile);
      }
    } catch (error) {
      console.error('건강상태 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHealthProfileSave = (profile: HealthProfile) => {
    setHealthProfile(prev => ({ ...prev, ...profile }));
  };

  const tabs = [
    { id: 'profile' as const, label: '🏥 건강상태', icon: '🏥' },
    { id: 'exercise' as const, label: '📊 운동 기록', icon: '📊' },
    { id: 'ai-training' as const, label: '🤖 AI 훈련', icon: '🤖' }
  ];

  // 로딩 중이거나 권한 확인 중인 경우
  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">
                {loading ? '권한을 확인하는 중...' : '데이터를 불러오는 중...'}
              </p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">💪 건강 & 운동 관리</h1>
          <p className="text-gray-600">
            개인 건강상태를 관리하고 AI 기반 운동 분석을 통해 최적의 피트니스 목표를 달성하세요.
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
          {/* 건강상태 탭 */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">🏥 건강상태 관리</h2>
                <p className="text-gray-600 mb-6">
                  개인 건강 정보를 입력하고 관리하세요. 정확한 정보는 AI가 더 나은 운동 추천을 제공하는 데 도움이 됩니다.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl mb-2">📏</div>
                    <h3 className="font-semibold text-blue-800 mb-1">신체 정보</h3>
                    <p className="text-sm text-blue-600">키, 몸무게, BMI 등 기본 신체 정보</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl mb-2">🎯</div>
                    <h3 className="font-semibold text-green-800 mb-1">피트니스 목표</h3>
                    <p className="text-sm text-green-600">개인 운동 목표와 달성 계획</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-3xl mb-2">⚠️</div>
                    <h3 className="font-semibold text-yellow-800 mb-1">건강 주의사항</h3>
                    <p className="text-sm text-yellow-600">알레르기, 만성질환 등 주의사항</p>
                  </div>
                </div>
              </div>
              
              <HealthProfileForm
                onSave={handleHealthProfileSave}
                initialData={healthProfile}
                showAdvanced={true}
              />
            </div>
          )}

          {/* 운동 기록 탭 */}
          {activeTab === 'exercise' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">📊 운동 기록 & 통계</h2>
                <p className="text-gray-600 mb-6">
                  AI가 분석한 운동 데이터를 통해 개인 맞춤형 피드백과 추천사항을 확인하세요.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl mb-1">📈</div>
                    <h4 className="font-semibold text-blue-800 text-sm">진행 상황</h4>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl mb-1">🎯</div>
                    <h4 className="font-semibold text-green-800 text-sm">목표 달성</h4>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl mb-1">📊</div>
                    <h4 className="font-semibold text-purple-800 text-sm">성과 분석</h4>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl mb-1">🤖</div>
                    <h4 className="font-semibold text-orange-800 text-sm">AI 추천</h4>
                  </div>
                </div>
              </div>
              
              <ExerciseDashboard />
            </div>
          )}

          {/* AI 훈련 탭 */}
          {activeTab === 'ai-training' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">🤖 AI 기반 실시간 훈련</h2>
                <p className="text-gray-600 mb-6">
                  카메라를 통해 실시간으로 운동 자세를 분석하고, AI가 개인 맞춤형 피드백을 제공합니다.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl mb-1">📹</div>
                    <h4 className="font-semibold text-blue-800 text-sm">실시간 모니터링</h4>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl mb-1">⚡</div>
                    <h4 className="font-semibold text-green-800 text-sm">운동 강도 분석</h4>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl mb-1">🎯</div>
                    <h4 className="font-semibold text-purple-800 text-sm">자세 교정</h4>
                  </div>
                </div>
              </div>
              
              <ExerciseIntensityAI
                onIntensityChange={(intensity, feedback) => {
                  console.log('운동 강도 변경:', intensity, feedback);
                }}
                showCamera={true}
                autoStart={false}
              />
            </div>
          )}
        </div>

        {/* 추가 정보 */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">💡 건강 관리 팁</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">🏊‍♂️ 수영 운동의 장점</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 전신 근력 및 지구력 향상</li>
                <li>• 관절 부담이 적은 저충격 운동</li>
                <li>• 심폐 기능 강화</li>
                <li>• 체지방 감소 및 근육량 증가</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">🤖 AI 분석의 효과</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 객관적인 자세 평가</li>
                <li>• 개인 맞춤형 운동 계획</li>
                <li>• 실시간 피드백 제공</li>
                <li>• 지속적인 성과 모니터링</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

