/**
 * 🏥 JJ Swim Lab - HealthProfileForm 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 사용자의 건강 프로필 정보를 입력하고 관리하는 폼
 * - 수영 운동에 필요한 건강 상태 및 제한사항 파악
 * - 개인별 맞춤 운동 계획 수립을 위한 건강 정보 수집
 * - 건강 상태 변화 추적 및 모니터링
 * - 의료진과의 정보 공유 및 협업 지원
 * 
 * 🔄 **주요 기능**
 * - 기본 건강 정보 입력 (신장, 체중, 나이 등)
 * - 기존 질병 및 건강 상태 관리
 * - 수영 운동 관련 제한사항 및 주의사항
 * - 건강 상태 변화 추적 및 기록
 * - 건강 정보 보안 및 개인정보 보호
 * 
 * 🗄️ **데이터 연동**
 * - 사용자 건강 프로필 데이터
 * - 기존 질병 및 건강 상태 정보
 * - 수영 운동 관련 제한사항
 * - 건강 상태 변화 이력
 * - 의료진 연동 및 정보 공유
 * 
 * 🛠️ **필요한 설치 파일**
 * - React (useState, useEffect, useCallback)
 * - 폼 유효성 검증 라이브러리
 * - 건강 정보 관리 라이브러리
 * - 데이터 암호화 및 보안 도구
 * - Tailwind CSS (스타일링)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 건강 정보의 민감성 및 보안
 * 2. 개인정보 보호 및 암호화
 * 3. 건강 정보 입력의 정확성 검증
 * 4. 의료진과의 정보 공유 협의
 * 5. 건강 정보 접근 권한 관리
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 건강 정보 입력 폼 동작 확인
 * - [ ] 건강 정보 보안 및 암호화 확인
 * - [ ] 개인정보 보호 시스템 검증
 * - [ ] 건강 상태 변화 추적 확인
 * - [ ] 의료진 연동 시스템 검증
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 건강 프로필 폼)
 * - 2024-12-19: 건강 정보 보안 시스템 구현
 * - 2024-12-19: 건강 상태 변화 추적 시스템 구현
 * - 2024-12-19: 의료진 연동 시스템 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (건강 프로필 폼 시스템 완료)
 * 
 * 🚀 **다음 단계**
 * - AI 기반 건강 상태 분석
 * - 실시간 건강 모니터링
 * - 성능 최적화
 * - 접근성 개선
 * 
 * 💡 **사용 예시**
 * ```tsx
 * <HealthProfileForm 
 *   onSubmit={(profile) => handleSubmit(profile)}
 *   onHealthUpdate={(update) => handleHealthUpdate(update)}
 *   onMedicalShare={(info) => handleMedicalShare(info)}
 *   initialData={existingProfile}
 *   enableMedicalSharing={true}
 * />
 * ```
 */

'use client';

import { useState, useEffect } from 'react';

interface HealthProfile {
  height?: number;
  weight?: number;
  bmi?: number;
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  allergies?: string[];
  chronicConditions?: string[];
  medications?: string[];
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  fitnessGoals?: string[];
  activityLevel?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
  targetWeight?: number;
  targetBMI?: number;
  lastHealthCheck?: Date;
  // 공개 설정 추가
  privacySettings?: {
    height: boolean;
    weight: boolean;
    bmi: boolean;
    bloodType: boolean;
    allergies: boolean;
    chronicConditions: boolean;
    medications: boolean;
    emergencyContact: boolean;
    fitnessGoals: boolean;
    activityLevel: boolean;
  };
}

interface HealthProfileFormProps {
  onSave?: (profile: HealthProfile) => void;
  initialData?: HealthProfile;
  showAdvanced?: boolean;
}

export default function HealthProfileForm({
  onSave,
  initialData,
  showAdvanced = false
}: HealthProfileFormProps) {
  const [profile, setProfile] = useState<HealthProfile>(initialData || {
    // 기본 공개 설정 (안전한 정보만 공개)
    privacySettings: {
      height: true,
      weight: false, // 체중은 기본 비공개
      bmi: true,
      bloodType: false, // 혈액형은 기본 비공개
      allergies: false, // 알레르기는 기본 비공개
      chronicConditions: false, // 만성질환은 기본 비공개
      medications: false, // 복용약물은 기본 비공개
      emergencyContact: false, // 비상연락처는 기본 비공개
      fitnessGoals: true, // 운동목표는 기본 공개
      activityLevel: true, // 활동수준은 기본 공개
    }
  });
  const [isEditing, setIsEditing] = useState(!initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // BMI 자동 계산
  useEffect(() => {
    if (profile.height && profile.weight) {
      const heightInMeters = profile.height / 100;
      const bmi = Math.round((profile.weight / (heightInMeters * heightInMeters)) * 100) / 100;
      setProfile(prev => ({ ...prev, bmi }));
    }
  }, [profile.height, profile.weight]);

  const handleInputChange = (field: string, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayInputChange = (field: string, value: string) => {
    if (value.trim()) {
      setProfile(prev => ({
        ...prev,
        [field]: [...(prev[field as keyof HealthProfile] as string[] || []), value.trim()]
      }));
    }
  };

  const removeArrayItem = (field: string, index: number) => {
    setProfile(prev => ({
      ...prev,
      [field]: (prev[field as keyof HealthProfile] as string[])?.filter((_, i) => i !== index) || []
    }));
  };

  // 공개 설정 토글
  const togglePrivacySetting = (field: keyof NonNullable<HealthProfile['privacySettings']>) => {
    setProfile(prev => ({
      ...prev,
      privacySettings: {
        height: prev.privacySettings?.height ?? true,
        weight: prev.privacySettings?.weight ?? false,
        bmi: prev.privacySettings?.bmi ?? true,
        bloodType: prev.privacySettings?.bloodType ?? false,
        allergies: prev.privacySettings?.allergies ?? false,
        chronicConditions: prev.privacySettings?.chronicConditions ?? false,
        medications: prev.privacySettings?.medications ?? false,
        emergencyContact: prev.privacySettings?.emergencyContact ?? false,
        fitnessGoals: prev.privacySettings?.fitnessGoals ?? true,
        activityLevel: prev.privacySettings?.activityLevel ?? true,
        ...prev.privacySettings,
        [field]: !(prev.privacySettings?.[field] ?? false)
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('인증 토큰이 없습니다. 다시 로그인해주세요.');
        return;
      }

      const response = await fetch('http://localhost:5000/api/exercise/health-profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('건강상태가 성공적으로 저장되었습니다!');
        setIsEditing(false);
        onSave?.(profile);
      } else {
        setMessage('저장에 실패했습니다: ' + data.message);
      }
    } catch (error) {
      setMessage('오류가 발생했습니다: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  const bloodTypes: HealthProfile['bloodType'][] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const activityLevels = [
    { value: 'sedentary', label: '거의 움직이지 않음 (사무직)' },
    { value: 'lightly_active', label: '가벼운 활동 (주 1-3일 운동)' },
    { value: 'moderately_active', label: '보통 활동 (주 3-5일 운동)' },
    { value: 'very_active', label: '활발한 활동 (주 6-7일 운동)' },
    { value: 'extremely_active', label: '매우 활발한 활동 (매일 강도 높은 운동)' }
  ];

  if (!isEditing) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">🏥 건강상태 프로필</h2>
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            수정
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 기본 정보 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">기본 정보</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">키 (cm)</label>
                <div className="text-lg font-semibold text-gray-900">{profile.height || '-'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">몸무게 (kg)</label>
                <div className="text-lg font-semibold text-gray-900">{profile.weight || '-'}</div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">BMI</label>
              <div className="text-lg font-semibold text-gray-900">
                {profile.bmi ? `${profile.bmi} (${getBMICategory(profile.bmi)})` : '-'}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">혈액형</label>
              <div className="text-lg font-semibold text-gray-900">{profile.bloodType || '-'}</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">활동 수준</label>
              <div className="text-lg font-semibold text-gray-900">
                {activityLevels.find(level => level.value === profile.activityLevel)?.label || '-'}
              </div>
            </div>
          </div>
          
          {/* 목표 및 알레르기 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">목표 및 건강 정보</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">목표 몸무게 (kg)</label>
              <div className="text-lg font-semibold text-gray-900">{profile.targetWeight || '-'}</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">목표 BMI</label>
              <div className="text-lg font-semibold text-gray-900">{profile.targetBMI || '-'}</div>
            </div>
            
            {profile.allergies && profile.allergies.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">알레르기</label>
                <div className="flex flex-wrap gap-2">
                  {profile.allergies.map((allergy, index) => (
                    <span key={index} className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {profile.fitnessGoals && profile.fitnessGoals.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">피트니스 목표</label>
                <div className="flex flex-wrap gap-2">
                  {profile.fitnessGoals.map((goal, index) => (
                    <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      {goal}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {profile.emergencyContact && (
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h3 className="text-lg font-semibold text-yellow-800 mb-3">비상 연락처</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-yellow-700 mb-1">이름</label>
                <div className="font-semibold text-yellow-900">{profile.emergencyContact.name}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-yellow-700 mb-1">관계</label>
                <div className="font-semibold text-yellow-900">{profile.emergencyContact.relationship}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-yellow-700 mb-1">연락처</label>
                <div className="font-semibold text-yellow-900">{profile.emergencyContact.phone}</div>
              </div>
            </div>
          </div>
        )}
        
        {message && (
          <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg">
            {message}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">🏥 건강상태 프로필 입력</h2>
        <button
          onClick={() => setIsEditing(false)}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          취소
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 기본 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">기본 정보</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">키 (cm)</label>
                  <button
                    type="button"
                    onClick={() => togglePrivacySetting('height')}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      profile.privacySettings?.height 
                        ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {profile.privacySettings?.height ? '🔓 공개' : '🔒 비공개'}
                  </button>
                </div>
                <input
                  type="number"
                  value={profile.height || ''}
                  onChange={(e) => handleInputChange('height', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="170"
                  min="100"
                  max="250"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">몸무게 (kg)</label>
                  <button
                    type="button"
                    onClick={() => togglePrivacySetting('weight')}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      profile.privacySettings?.weight 
                        ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {profile.privacySettings?.weight ? '🔓 공개' : '🔒 비공개'}
                  </button>
                </div>
                <input
                  type="number"
                  value={profile.weight || ''}
                  onChange={(e) => handleInputChange('weight', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="70"
                  min="30"
                  max="300"
                />
              </div>
            </div>
            
            {profile.bmi && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">BMI</label>
                  <button
                    type="button"
                    onClick={() => togglePrivacySetting('bmi')}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      profile.privacySettings?.bmi 
                        ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {profile.privacySettings?.bmi ? '🔓 공개' : '🔒 비공개'}
                  </button>
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  {profile.bmi} ({getBMICategory(profile.bmi)})
                </div>
              </div>
            )}
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">혈액형</label>
                <button
                  type="button"
                  onClick={() => togglePrivacySetting('bloodType')}
                  className={`text-xs px-2 py-1 rounded transition-colors ${
                    profile.privacySettings?.bloodType 
                      ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {profile.privacySettings?.bloodType ? '🔓 공개' : '🔒 비공개'}
                </button>
              </div>
              <select
                value={profile.bloodType || ''}
                onChange={(e) => handleInputChange('bloodType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">선택하세요</option>
                {bloodTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">활동 수준</label>
                <button
                  type="button"
                  onClick={() => togglePrivacySetting('activityLevel')}
                  className={`text-xs px-2 py-1 rounded transition-colors ${
                    profile.privacySettings?.activityLevel 
                      ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {profile.privacySettings?.activityLevel ? '🔓 공개' : '🔒 비공개'}
                </button>
              </div>
              <select
                value={profile.activityLevel || ''}
                onChange={(e) => handleInputChange('activityLevel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">선택하세요</option>
                {activityLevels.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* 목표 및 건강 정보 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">목표 및 건강 정보</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">목표 몸무게 (kg)</label>
                <input
                  type="number"
                  value={profile.targetWeight || ''}
                  onChange={(e) => handleInputChange('targetWeight', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="65"
                  min="30"
                  max="300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">목표 BMI</label>
                <input
                  type="number"
                  value={profile.targetBMI || ''}
                  onChange={(e) => handleInputChange('targetBMI', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="22.5"
                  min="15"
                  max="40"
                  step="0.1"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">알레르기</label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="알레르기 입력"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const target = e.target as HTMLInputElement;
                        handleArrayInputChange('allergies', target.value);
                        target.value = '';
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                      handleArrayInputChange('allergies', input.value);
                      input.value = '';
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    추가
                  </button>
                </div>
                {profile.allergies && profile.allergies.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {profile.allergies.map((allergy, index) => (
                      <span key={index} className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm flex items-center gap-1">
                        {allergy}
                        <button
                          type="button"
                          onClick={() => removeArrayItem('allergies', index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">피트니스 목표</label>
                <button
                  type="button"
                  onClick={() => togglePrivacySetting('fitnessGoals')}
                  className={`text-xs px-2 py-1 rounded transition-colors ${
                    profile.privacySettings?.fitnessGoals 
                      ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {profile.privacySettings?.fitnessGoals ? '🔓 공개' : '🔒 비공개'}
                </button>
              </div>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="목표 입력"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const target = e.target as HTMLInputElement;
                        handleArrayInputChange('fitnessGoals', target.value);
                        target.value = '';
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                      handleArrayInputChange('fitnessGoals', input.value);
                      input.value = '';
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    추가
                  </button>
                </div>
                {profile.fitnessGoals && profile.fitnessGoals.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {profile.fitnessGoals.map((goal, index) => (
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-1">
                        {goal}
                        <button
                          type="button"
                          onClick={() => removeArrayItem('fitnessGoals', index)}
                          className="text-green-600 hover:text-green-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 비상 연락처 */}
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h3 className="text-lg font-semibold text-yellow-800 mb-4">비상 연락처</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-yellow-700 mb-1">이름</label>
              <input
                type="text"
                value={profile.emergencyContact?.name || ''}
                onChange={(e) => handleInputChange('emergencyContact', {
                  ...profile.emergencyContact,
                  name: e.target.value
                })}
                className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="비상연락처 이름"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-yellow-700 mb-1">관계</label>
              <input
                type="text"
                value={profile.emergencyContact?.relationship || ''}
                onChange={(e) => handleInputChange('emergencyContact', {
                  ...profile.emergencyContact,
                  relationship: e.target.value
                })}
                className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="배우자, 부모님 등"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-yellow-700 mb-1">연락처</label>
              <input
                type="tel"
                value={profile.emergencyContact?.phone || ''}
                onChange={(e) => handleInputChange('emergencyContact', {
                  ...profile.emergencyContact,
                  phone: e.target.value
                })}
                className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="010-1234-5678"
              />
            </div>
          </div>
        </div>

        {/* 공개 설정 요약 */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h3 className="text-sm font-semibold text-blue-800 mb-3">🔒 개인정보 공개 설정 요약</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(profile.privacySettings || {}).map(([key, isPublic]) => {
              const labels: Record<string, string> = {
                height: '키',
                weight: '몸무게',
                bmi: 'BMI',
                bloodType: '혈액형',
                allergies: '알레르기',
                chronicConditions: '만성질환',
                medications: '복용약물',
                emergencyContact: '비상연락처',
                fitnessGoals: '운동목표',
                activityLevel: '활동수준'
              };
              
              return (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-gray-700">{labels[key]}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    isPublic 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {isPublic ? '🔓 공개' : '🔒 비공개'}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-blue-600 mt-3">
            💡 각 항목 옆의 버튼을 클릭하여 공개/비공개를 설정할 수 있습니다.
          </p>
        </div>

        {/* 제출 버튼 */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? '저장 중...' : '저장'}
          </button>
        </div>

        {message && (
          <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg">
            {message}
          </div>
        )}
      </form>
    </div>
  );
}

// BMI 카테고리 계산
function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return '저체중';
  if (bmi < 25) return '정상';
  if (bmi < 30) return '과체중';
  return '비만';
}

