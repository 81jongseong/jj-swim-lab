/**
 * 👤 JJ Swim Lab - 회원 가입 페이지 (건강정보 포함)
 * 
 * 📋 **페이지 목적**
 * - 회원 가입 시 기본 정보와 건강정보를 함께 입력
 * - 관절별 질환 정보를 선택하여 수영 가이드라인 제공
 * - 강사와 센터가 회원의 건강 상태를 인지할 수 있도록 함
 * 
 * 🔄 **주요 기능**
 * - 기본 회원 정보 입력 (이름, 이메일, 비밀번호)
 * - 건강정보 선택 (관절별 질환, 심혈관, 대사 질환 등)
 * - 수영 경험 수준 선택
 * - 개인정보 동의 및 약관 동의
 * 
 * 📅 **개발 히스토리**
 * - 2025-01-22: 건강정보 포함 회원 가입 시스템 구현
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { User, Heart, Shield, CheckCircle, AlertTriangle } from 'lucide-react';

const SignupPage: React.FC = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // 기본 정보
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    birthDate: '',
    gender: '',
    
    // 건강정보
    jointConditions: [] as string[],
    cardiovascularConditions: [] as string[],
    metabolicConditions: [] as string[],
    swimmingExperience: '',
    medicalHistory: '',
    
    // 약관 동의
    agreeTerms: false,
    agreePrivacy: false,
    agreeHealthInfo: false
  });

  // 관절별 질환 옵션
  const jointConditionOptions = [
    { value: 'spine_herniated_disc', label: '허리 디스크', category: '척추' },
    { value: 'spine_simple_back_pain', label: '단순 요통', category: '척추' },
    { value: 'spine_cervical_disorder', label: '목 디스크', category: '척추' },
    { value: 'shoulder_frozen_shoulder', label: '오십견', category: '어깨' },
    { value: 'shoulder_impingement', label: '어깨 충돌 증후군', category: '어깨' },
    { value: 'shoulder_rotator_cuff_tear', label: '회전근개 파열', category: '어깨' },
    { value: 'knee_osteoarthritis', label: '무릎 관절염', category: '무릎' },
    { value: 'knee_meniscus_tear', label: '반월상 연골 손상', category: '무릎' },
    { value: 'knee_acl_injury', label: '전방 십자인대 손상', category: '무릎' },
    { value: 'ankle_sprain', label: '발목 염좌', category: '발목' },
    { value: 'ankle_plantar_fasciitis', label: '족저근막염', category: '발목' },
    { value: 'wrist_carpal_tunnel', label: '수근관 증후군', category: '손목' },
    { value: 'elbow_tennis_elbow', label: '테니스 엘보', category: '팔꿈치' },
    { value: 'hip_arthritis', label: '고관절 관절염', category: '고관절' }
  ];

  // 심혈관 질환 옵션
  const cardiovascularOptions = [
    { value: 'hypertension', label: '고혈압' },
    { value: 'heart_disease', label: '심장질환' },
    { value: 'arrhythmia', label: '부정맥' },
    { value: 'chest_pain', label: '흉통' },
    { value: 'none', label: '해당없음' }
  ];

  // 대사 질환 옵션
  const metabolicOptions = [
    { value: 'diabetes', label: '당뇨병' },
    { value: 'prediabetes', label: '당뇨 전단계' },
    { value: 'metabolic_syndrome', label: '대사 증후군' },
    { value: 'obesity', label: '비만' },
    { value: 'none', label: '해당없음' }
  ];

  // 수영 경험 수준 옵션
  const swimmingExperienceOptions = [
    { value: 'beginner', label: '초보자 (수영 경험 없음)' },
    { value: 'basic', label: '기초 (기본 자유형 가능)' },
    { value: 'intermediate', label: '중급 (여러 영법 가능)' },
    { value: 'advanced', label: '고급 (모든 영법 숙련)' }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: string, value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field as keyof typeof prev] as string[], value]
        : (prev[field as keyof typeof prev] as string[]).filter(item => item !== value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    // 최종 제출
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/auth/login?message=signup-success');
      } else {
        const error = await response.json();
        alert(`가입 실패: ${error.message}`);
      }
    } catch (error) {
      alert('가입 중 오류가 발생했습니다.');
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 flex items-center">
        <User className="h-6 w-6 mr-2" />
        기본 정보 입력
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">이름 *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">이메일 *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호 *</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호 확인 *</label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">생년월일</label>
          <input
            type="date"
            value={formData.birthDate}
            onChange={(e) => handleInputChange('birthDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">성별</label>
          <select
            value={formData.gender}
            onChange={(e) => handleInputChange('gender', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">선택하세요</option>
            <option value="male">남성</option>
            <option value="female">여성</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 flex items-center">
        <Heart className="h-6 w-6 mr-2" />
        건강정보 입력
      </h2>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">건강정보 수집 목적</h4>
            <p className="text-sm text-blue-700">
              회원님의 건강 상태를 파악하여 안전하고 효과적인 수영 프로그램을 제공하기 위해 수집합니다.
              강사와 센터 관리자가 회원님의 건강 상태를 인지하고 적절한 수영 가이드라인을 제공할 수 있습니다.
            </p>
          </div>
        </div>
      </div>

      {/* 관절별 질환 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">관절별 질환 (해당사항 선택)</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {jointConditionOptions.map((option) => (
            <label key={option.value} className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.jointConditions.includes(option.value)}
                onChange={(e) => handleArrayChange('jointConditions', option.value, e.target.checked)}
                className="mr-3"
              />
              <div>
                <div className="font-medium text-gray-900">{option.label}</div>
                <div className="text-sm text-gray-500">{option.category}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* 심혈관 질환 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">심혈관 질환 (해당사항 선택)</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {cardiovascularOptions.map((option) => (
            <label key={option.value} className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.cardiovascularConditions.includes(option.value)}
                onChange={(e) => handleArrayChange('cardiovascularConditions', option.value, e.target.checked)}
                className="mr-3"
              />
              <span className="font-medium text-gray-900">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 대사 질환 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">대사 질환 (해당사항 선택)</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {metabolicOptions.map((option) => (
            <label key={option.value} className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.metabolicConditions.includes(option.value)}
                onChange={(e) => handleArrayChange('metabolicConditions', option.value, e.target.checked)}
                className="mr-3"
              />
              <span className="font-medium text-gray-900">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 수영 경험 수준 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">수영 경험 수준</label>
        <div className="space-y-2">
          {swimmingExperienceOptions.map((option) => (
            <label key={option.value} className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
              <input
                type="radio"
                name="swimmingExperience"
                value={option.value}
                checked={formData.swimmingExperience === option.value}
                onChange={(e) => handleInputChange('swimmingExperience', e.target.value)}
                className="mr-3"
              />
              <span className="font-medium text-gray-900">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 기타 의료 이력 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">기타 의료 이력 (선택사항)</label>
        <textarea
          value={formData.medicalHistory}
          onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
          placeholder="수영과 관련된 기타 건강 상태나 주의사항을 입력해주세요..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 flex items-center">
        <CheckCircle className="h-6 w-6 mr-2" />
        약관 동의
      </h2>
      
      <div className="space-y-4">
        <label className="flex items-start">
          <input
            type="checkbox"
            checked={formData.agreeTerms}
            onChange={(e) => handleInputChange('agreeTerms', e.target.checked)}
            className="mr-3 mt-1"
            required
          />
          <div>
            <span className="font-medium text-gray-900">서비스 이용약관 동의 *</span>
            <p className="text-sm text-gray-600 mt-1">
              JJ Swim Lab 서비스 이용약관에 동의합니다.
            </p>
          </div>
        </label>

        <label className="flex items-start">
          <input
            type="checkbox"
            checked={formData.agreePrivacy}
            onChange={(e) => handleInputChange('agreePrivacy', e.target.checked)}
            className="mr-3 mt-1"
            required
          />
          <div>
            <span className="font-medium text-gray-900">개인정보 처리방침 동의 *</span>
            <p className="text-sm text-gray-600 mt-1">
              개인정보 수집, 이용, 처리에 동의합니다.
            </p>
          </div>
        </label>

        <label className="flex items-start">
          <input
            type="checkbox"
            checked={formData.agreeHealthInfo}
            onChange={(e) => handleInputChange('agreeHealthInfo', e.target.checked)}
            className="mr-3 mt-1"
            required
          />
          <div>
            <span className="font-medium text-gray-900">건강정보 처리 동의 *</span>
            <p className="text-sm text-gray-600 mt-1">
              건강정보 수집 및 강사/센터 관리자와의 공유에 동의합니다.
            </p>
          </div>
        </label>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
          <div>
            <h4 className="font-medium text-yellow-900 mb-1">중요 안내</h4>
            <p className="text-sm text-yellow-700">
              입력하신 건강정보는 강사와 센터 관리자가 안전한 수영 프로그램을 제공하기 위해 활용됩니다.
              정확한 정보를 입력해주시면 더욱 효과적인 수영 가이드라인을 받으실 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        <Card className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">회원 가입</h1>
            <p className="text-gray-600 mt-2">안전한 수영을 위한 건강정보를 함께 입력해주세요</p>
          </div>

          {/* 진행 단계 표시 */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNumber 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div className={`w-16 h-1 mx-2 ${
                      step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>기본 정보</span>
              <span>건강정보</span>
              <span>약관 동의</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}

            <div className="flex justify-between mt-8">
              {step > 1 && (
                <Button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="bg-gray-500 hover:bg-gray-600"
                >
                  이전
                </Button>
              )}
              
              <Button
                type="submit"
                className={`ml-auto ${
                  step === 3 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {step === 3 ? '가입 완료' : '다음'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default SignupPage;