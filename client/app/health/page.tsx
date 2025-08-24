'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import HealthProfileForm from '../../components/HealthProfileForm';
import ExerciseDashboard from '../../components/ExerciseDashboard';
import ExerciseIntensityAI from '../../components/ExerciseIntensityAI';

interface HealthProfile {
  height?: number;
  weight?: number;
  bmi?: number;
  bloodType?: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  allergies?: string[];
  fitnessGoals?: string[];
  activityLevel?: "sedentary" | "lightly_active" | "moderately_active" | "very_active" | "extremely_active";
  targetWeight?: number;
  targetBMI?: number;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
}

export default function HealthPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadHealthProfile();
    }
  }, [user]);

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
    setHealthProfile(profile);
  };

  const tabs = [
    { id: 'profile', label: '🏥 건강상태', icon: '🏥' },
    { id: 'exercise', label: '📊 운동 기록', icon: '📊' },
    { id: 'ai-training', label: '🤖 AI 훈련', icon: '🤖' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">데이터를 불러오는 중...</p>
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
                <span className="mr-2">{tab.icon}</span>
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
                initialData={healthProfile || undefined}
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

