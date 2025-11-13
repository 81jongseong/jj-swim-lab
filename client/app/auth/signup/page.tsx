/**
 * 회원가입 페이지
 * 
 * 연동되는 데이터:
 * - 개인정보: 이름, 이메일, 비밀번호, 전화번호, 생년월일, 성별, 주소
 * - 학생 정보: 건강 정보, 운동 정보
 * - 강사 정보: 자격증 정보, 경력, 전문 분야, 근무 가능 지역
 * 
 * 연동되는 파일:
 * - RegionSelector: 지역 선택 컴포넌트
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Calendar,
  MapPin,
  Activity,
  CheckCircle,
  Eye,
  Target,
  EyeOff
} from 'lucide-react';
import RegionSelector, { CITIES_BY_PROVINCE } from '@/components/map/RegionSelector';
import CSSInputSection from '@/components/swimlab/member-variables/CSSInputSection';
import StrokesSelectionSection from '@/components/swimlab/member-variables/StrokesSelectionSection';
import ConditionQuickPick from '@/components/swimlab/ConditionQuickPick';


interface Certificate {
  name: string;
  issuer: string;
  certificateNumber: string;
  acquiredDate: string;
}

interface TeachingExperience {
  centerName: string;
  startDate: string;
  endDate: string;
  workType: string;
}

type AccountType = 'student' | 'instructor';
type StrokeId = 'freestyle' | 'backstroke' | 'breaststroke' | 'butterfly';
type SwimProficiencyId = 'basic' | StrokeId;
type HasCssOption = 'yes' | 'no';

interface SignupFormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  birthDate: string;
  gender: string;
  address: string;
  postalCode: string;
  address1: string;
  address2: string;
  latitude: number | null;
  longitude: number | null;
  accountType: AccountType;
  height: string;
  weight: string;
  emergencyContact: string;
  emergencyPhone: string;
  swimProficiency: SwimProficiencyId | '';
  maxContinuousDistance: string;
  hasCssMeasurement: HasCssOption;
  strokeCSS: Record<StrokeId, number>;
  cssMeasurementPoolLength: number;
  mainStrokes: StrokeId[];
  excludedStrokes: StrokeId[];
  preferredStrokes: StrokeId[];
  conditionIds: string[];
  fitnessGoals: string;
  specialties: string;
  introduction: string;
  agreeTerms: boolean;
  agreePrivacy: boolean;
}

export default function SignupPage() {
  const [formData, setFormData] = useState<SignupFormState>({
    // 기본 정보
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    birthDate: '',
    gender: '',
    address: '',
    postalCode: '', // 🆕 우편번호
    address1: '', // 🆕 기본 주소
    address2: '', // 🆕 상세 주소
    latitude: null, // 🆕 위도
    longitude: null, // 🆕 경도
    
    // 계정 유형별 정보
    accountType: 'student',
    
    // 학생용 건강 정보
    height: '',
    weight: '',
    emergencyContact: '',
    emergencyPhone: '',
    swimProficiency: '',
    maxContinuousDistance: '',
    hasCssMeasurement: 'no',
    strokeCSS: {
      freestyle: 0,
      backstroke: 0,
      breaststroke: 0,
      butterfly: 0
    },
    cssMeasurementPoolLength: 25,
    mainStrokes: ['freestyle'],
    excludedStrokes: [],
    preferredStrokes: ['freestyle'],
    conditionIds: [],
    fitnessGoals: '체력 향상',
    
    // 강사용 정보
    specialties: '',
    introduction: '',
    
    // 약관 동의
    agreeTerms: false,
    agreePrivacy: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<any>({});

  // 자격증 정보 (강사용)
  const [certificates, setCertificates] = useState<Certificate[]>([
    { name: '', issuer: '', certificateNumber: '', acquiredDate: '' }
  ]);

  // 강의 경험 정보 (강사용)
  const [teachingExperiences, setTeachingExperiences] = useState<TeachingExperience[]>([
    { centerName: '', startDate: '', endDate: '', workType: '' }
  ]);

  // 근무 가능 지역 (강사용)
  const [selectedSido, setSelectedSido] = useState('');
  const [selectedRegions, setSelectedRegions] = useState<Set<string>>(new Set());
  const [showDistrictSelection, setShowDistrictSelection] = useState(false);

  // 약관 동의 팝업
  const [showTermsPopup, setShowTermsPopup] = useState(false);
  const [currentTermsType, setCurrentTermsType] = useState<'terms' | 'privacy'>('terms');

  // 전화번호 인증 상태
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [codeError, setCodeError] = useState('');

  const totalSteps = 5;

  const strokeOptions: Array<{ id: StrokeId; label: string; icon: string }> = [
    { id: 'freestyle', label: '자유형', icon: '🏊' },
    { id: 'backstroke', label: '배영', icon: '🏊‍♂️' },
    { id: 'breaststroke', label: '평영', icon: '🤿' },
    { id: 'butterfly', label: '접영', icon: '🦋' }
  ];

  const swimProficiencyOptions: Array<{ id: SwimProficiencyId; label: string; description: string }> = [
    {
      id: 'basic',
      label: '기초 단계',
      description: '킥보드, 호흡 연습 단계'
    },
    {
      id: 'freestyle',
      label: '자유형까지 가능',
      description: '25m 이상 자유형 완영'
    },
    {
      id: 'backstroke',
      label: '배영까지 가능',
      description: '자유형 + 배영 완영'
    },
    {
      id: 'breaststroke',
      label: '평영까지 가능',
      description: '3영법 완영 가능'
    },
    {
      id: 'butterfly',
      label: '접영까지 가능',
      description: '4영법 모두 완영 가능'
    }
  ];

  const distanceOptions: Array<{ value: string; label: string }> = [
    { value: '25', label: '25m (1바퀴)' },
    { value: '50', label: '50m (2바퀴)' },
    { value: '100', label: '100m (4바퀴)' },
    { value: '200', label: '200m (8바퀴)' },
    { value: '400', label: '400m (16바퀴)' },
    { value: '800', label: '800m (32바퀴)' },
    { value: '1500', label: '1500m 이상' }
  ];

  const goalOptions = [
    '체력 향상',
    '체중 감량',
    '기술 연마',
    '실력 향상',
    '재활',
    '스트레스 해소',
    '장거리 수영',
    '오픈워터',
    '생존수영',
    '인명구조원'
  ];

  const proficiencyToLevel: Record<SwimProficiencyId, '초급' | '중급' | '고급' | '전문가' | '마스터'> = {
    basic: '초급',
    freestyle: '초급',
    backstroke: '중급',
    breaststroke: '고급',
    butterfly: '전문가'
  };

  // 🆕 Daum Postcode API 스크립트 로드
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // 🆕 주소 → 위도/경도 변환 (Next.js API Route를 통해 프록시)
  const getCoordinatesFromAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      // Next.js API Route를 통해 프록시 호출 (CORS 문제 해결)
      const response = await fetch(`/api/geo/coordinates?address=${encodeURIComponent(address)}`);
      
      if (!response.ok) {
        throw new Error(`좌표 변환 API 오류: ${response.status}`);
      }

      const data = await response.json();

      if (data?.success && data?.lat && data?.lng) {
        return {
          lat: data.lat,
          lng: data.lng
        };
      }

      console.warn('⚠️ 주소에서 좌표를 찾을 수 없습니다:', address);
      return null;
    } catch (error) {
      console.error('❌ 좌표 변환 오류:', error);
      return null;
    }
  };

  // 🆕 Daum 주소 검색
  const openAddressSearch = () => {
    if (!window.daum || !window.daum.Postcode) {
      alert('주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    new window.daum.Postcode({
      oncomplete: async function(data: any) {
        const fullAddress = data.roadAddress || data.jibunAddress;
        
        // 선택한 주소 정보를 formData에 설정
        setFormData(prev => ({
          ...prev,
          postalCode: data.zonecode,
          address1: fullAddress,
          address: fullAddress // 기존 address 필드도 유지
        }));
        
        // 🆕 주소 → 위도/경도 변환
        const coords = await getCoordinatesFromAddress(fullAddress);
        if (coords) {
          console.log('✅ 좌표 변환 성공:', coords);
          setFormData(prev => ({
            ...prev,
            latitude: coords.lat,
            longitude: coords.lng
          }));
        }
        
        // 상세주소 입력 필드로 포커스 이동
        setTimeout(() => {
          const detailInput = document.getElementById('address2');
          if (detailInput) {
            detailInput.focus();
          }
        }, 100);
      }
    }).open();
  };

  const validateStep = (step: number) => {
    const newErrors: any = {};

    if (step === 1) {
      if (!formData.name) newErrors.name = '이름을 입력해주세요';
      if (!formData.email) newErrors.email = '이메일을 입력해주세요';
      if (!formData.password) newErrors.password = '비밀번호를 입력해주세요';
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';
      }
      if (!formData.phone) newErrors.phone = '전화번호를 입력해주세요';
      // 전화번호 인증은 선택 사항 (향후 필수로 변경 가능)
      // if (formData.accountType && !phoneVerified) newErrors.phone = '전화번호 인증이 필요합니다.';
    }

    if (step === 2) {
      if (!formData.birthDate) newErrors.birthDate = '생년월일을 입력해주세요';
      if (!formData.gender) newErrors.gender = '성별을 선택해주세요';
      if (!formData.address) newErrors.address = '주소를 입력해주세요';
    }

    if (step === 3) {
      if (formData.accountType === 'student') {
        if (!formData.height) newErrors.height = '키를 입력해주세요';
        if (!formData.weight) newErrors.weight = '몸무게를 입력해주세요';
        if (!formData.swimProficiency) newErrors.swimProficiency = '수영 숙련도를 선택해주세요';
        if (!formData.maxContinuousDistance) newErrors.maxContinuousDistance = '연속으로 수영할 수 있는 거리를 선택해주세요';
        if (!formData.mainStrokes || formData.mainStrokes.length === 0) {
          newErrors.mainStrokes = '가능한 영법을 최소 1개 이상 선택해주세요';
        }
        if (formData.hasCssMeasurement === 'yes') {
          const hasValidCss = Object.values(formData.strokeCSS || {}).some((value) => Number(value) > 0);
          if (!hasValidCss) {
            newErrors.strokeCSS = 'CSS 측정 값을 입력해주세요';
          }
        }
      } else if (formData.accountType === 'instructor') {
        const validCertificates = certificates.filter(cert => cert.name && cert.issuer && cert.certificateNumber && cert.acquiredDate);
        if (validCertificates.length === 0) newErrors.certifications = '자격증 정보를 최소 1개 이상 입력해주세요';
        const validExperiences = teachingExperiences.filter(exp => exp.centerName && exp.startDate && exp.endDate && exp.workType);
        if (validExperiences.length === 0) newErrors.teachingExperience = '강의 경험을 최소 1개 이상 입력해주세요';
        if (!formData.specialties) newErrors.specialties = '전문 분야를 입력해주세요';
      }
    }

    if (step === 4) {
      if (formData.accountType === 'student') {
        // 학생용 추가 정보 검증
      } else if (formData.accountType === 'instructor') {
        if (selectedRegions.size === 0) newErrors.availableRegions = '근무 가능 지역을 최소 1개 이상 선택해주세요';
        if (!formData.introduction) newErrors.introduction = '자기소개를 입력해주세요';
      }
    }

    if (step === 5) {
      if (!formData.agreeTerms) newErrors.agreeTerms = '이용약관에 동의해주세요';
      if (!formData.agreePrivacy) newErrors.agreePrivacy = '개인정보처리방침에 동의해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      // 다음 단계로 이동 시 최상단으로 스크롤
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
    // 이전 단계로 이동 시 최상단으로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    try {
      // 회원가입 API 호출
      const requestData: any = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        birthDate: formData.birthDate,
        gender: formData.gender,
        address: formData.address,
        userType: formData.accountType,
        phoneVerified: phoneVerified
      };

      // 🆕 위도/경도 추가 (있는 경우)
      if (formData.latitude && formData.longitude) {
        requestData.location = {
          type: 'Point',
          coordinates: [formData.longitude, formData.latitude] // [경도, 위도] 순서
        };
      }

      // 계정 유형별 추가 정보
      if (formData.accountType === 'student') {
        const cleanedCss = Object.entries(formData.strokeCSS || {}).reduce<Record<string, number>>((acc, [key, value]) => {
          const numeric = Number(value);
          if (Number.isFinite(numeric) && numeric > 0) {
            acc[key] = numeric;
          }
          return acc;
        }, {});

        const swimmingProfile: Record<string, any> = {
          mainStrokes: formData.mainStrokes,
          preferredStrokes: formData.preferredStrokes,
          excludedStrokes: formData.excludedStrokes,
          conditionIds: formData.conditionIds,
          currentGoal: formData.fitnessGoals || undefined,
          hasCssMeasurement: formData.hasCssMeasurement === 'yes'
        };

        if (formData.maxContinuousDistance) {
          swimmingProfile.maxContinuousDistance = Number(formData.maxContinuousDistance);
        }

        if (formData.swimProficiency) {
          swimmingProfile.swimProficiency = formData.swimProficiency;
        }

        if (formData.hasCssMeasurement === 'yes' && Object.keys(cleanedCss).length > 0) {
          swimmingProfile.css = {
            ...cleanedCss,
            lastUpdated: new Date().toISOString(),
            updatedByRole: 'self'
          };
          swimmingProfile.cssMeasurementPoolLength = formData.cssMeasurementPoolLength;
        }

        requestData.studentInfo = {
          height: formData.height ? Number(formData.height) : undefined,
          weight: formData.weight ? Number(formData.weight) : undefined,
          emergencyContact: formData.emergencyContact,
          emergencyPhone: formData.emergencyPhone,
          swimmingLevel: formData.swimProficiency ? proficiencyToLevel[formData.swimProficiency] : undefined,
          currentLevel: formData.swimProficiency ? proficiencyToLevel[formData.swimProficiency] : undefined,
          swimmingProfile
        };
      } else if (formData.accountType === 'instructor') {
        const validCertificates = certificates.filter(cert => cert.name && cert.issuer && cert.certificateNumber && cert.acquiredDate);
        const validExperiences = teachingExperiences.filter(exp => exp.centerName && exp.startDate && exp.endDate && exp.workType);
        requestData.instructorInfo = {
          certificates: validCertificates,
          teachingExperiences: validExperiences,
          specialties: formData.specialties.split(',').map(s => s.trim()).filter(Boolean),
          availableRegions: Array.from(selectedRegions)
        };
      }

      console.log('📤 회원가입 요청 데이터:', requestData);

      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (!response.ok) {
        // 에러 응답 처리
        console.error('❌ 회원가입 에러 응답:', result);
        alert(`회원가입 실패: ${result.error || result.message || '알 수 없는 오류'}`);
        return;
      }

      if (result.success) {
        alert('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.');
        window.location.href = '/auth/login';
      } else {
        console.error('❌ 회원가입 실패:', result);
        alert(`회원가입 실패: ${result.error || result.message || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('❌ 회원가입 오류:', error);
      alert('회원가입 중 오류가 발생했습니다.');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">기본 정보</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                계정 유형 *
              </label>
              <select
                value={formData.accountType}
                onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="student">수강생</option>
                <option value="instructor">강사</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">계정 유형을 먼저 선택해주세요</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                이름 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="이름을 입력하세요"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                이메일 *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="이메일을 입력하세요"
                autoComplete="off"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Lock className="w-4 h-4 inline mr-2" />
                비밀번호 *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="비밀번호를 입력하세요"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Lock className="w-4 h-4 inline mr-2" />
                비밀번호 확인 *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="비밀번호를 다시 입력하세요"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                전화번호 * {phoneVerified && <span className="text-green-600 text-xs">✓ 인증 완료</span>}
                <span className="text-xs text-gray-500 ml-2">(인증은 선택 사항)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value });
                    setPhoneVerified(false);
                    setCodeSent(false);
                    setVerificationCode('');
                  }}
                  disabled={phoneVerified}
                  className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  } ${phoneVerified ? 'bg-gray-100' : ''}`}
                  placeholder="010-1234-5678"
                />
                <button
                  type="button"
                  onClick={async () => {
                    if (!formData.phone) {
                      setCodeError('전화번호를 입력해주세요.');
                      return;
                    }
                    setSendingCode(true);
                    setCodeError('');
                    try {
                      const response = await fetch('http://localhost:5000/api/auth/send-verification-code', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ phone: formData.phone })
                      });
                      const result = await response.json();
                      if (result.success) {
                        setCodeSent(true);
                        // 개발 환경에서 인증 코드 표시 (서버에서 code를 반환한 경우)
                        if (result.code) {
                          alert(`[개발용] 인증 코드: ${result.code}`);
                        }
                      } else {
                        setCodeError(result.error || '인증 코드 발송에 실패했습니다.');
                      }
                    } catch (error) {
                      setCodeError('인증 코드 발송 중 오류가 발생했습니다.');
                    } finally {
                      setSendingCode(false);
                    }
                  }}
                  disabled={sendingCode || phoneVerified || !formData.phone}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {sendingCode ? '발송 중...' : '인증 코드 발송'}
                </button>
              </div>
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              
              {codeSent && !phoneVerified && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    인증 코드 입력
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => {
                        setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                        setCodeError('');
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="6자리 인증 코드"
                      maxLength={6}
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        if (verificationCode.length !== 6) {
                          setCodeError('인증 코드 6자리를 입력해주세요.');
                          return;
                        }
                        setVerifyingCode(true);
                        setCodeError('');
                        try {
                          const response = await fetch('http://localhost:5000/api/auth/verify-phone-code', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ phone: formData.phone, code: verificationCode })
                          });
                          const result = await response.json();
                          if (result.success) {
                            setPhoneVerified(true);
                            setCodeError('');
                          } else {
                            setCodeError(result.error || '인증 코드가 일치하지 않습니다.');
                          }
                        } catch (error) {
                          setCodeError('인증 코드 검증 중 오류가 발생했습니다.');
                        } finally {
                          setVerifyingCode(false);
                        }
                      }}
                      disabled={verifyingCode || verificationCode.length !== 6}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {verifyingCode ? '확인 중...' : '인증 확인'}
                    </button>
                  </div>
                  {codeError && <p className="text-red-500 text-sm mt-1">{codeError}</p>}
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">개인 정보</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  생년월일 *
                </label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.birthDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.birthDate && <p className="text-red-500 text-sm mt-1">{errors.birthDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  성별 *
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.gender ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">성별을 선택하세요</option>
                  <option value="male">남성</option>
                  <option value="female">여성</option>
                </select>
                {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
              </div>
            </div>

            {/* 🆕 Daum 주소 검색 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                주소 *
              </label>
              <div className="space-y-2">
                {/* 우편번호 + 검색 버튼 */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.postalCode}
                    readOnly
                    placeholder="우편번호"
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  />
                  <button
                    type="button"
                    onClick={openAddressSearch}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    🔍 주소 검색
                  </button>
                </div>
                
                {/* 기본 주소 */}
                <input
                  type="text"
                  value={formData.address1}
                  readOnly
                  placeholder="기본 주소 (주소 검색 버튼을 클릭하세요)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
                
                {/* 상세 주소 */}
                <input
                  id="address2"
                  type="text"
                  value={formData.address2}
                  onChange={(e) => setFormData({ ...formData, address2: e.target.value, address: `${formData.address1} ${e.target.value}` })}
                  placeholder="상세 주소 (동/호수 등)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {formData.accountType === 'student' ? '건강 및 운동 정보' : '자격증 및 경력 정보'}
            </h2>
            
            {formData.accountType === 'student' ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Activity className="w-4 h-4 inline mr-2" />
                      키 (cm) *
                    </label>
                    <input
                      type="number"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.height ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="키를 입력하세요"
                    />
                    {errors.height && <p className="text-red-500 text-sm mt-1">{errors.height}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Activity className="w-4 h-4 inline mr-2" />
                      몸무게 (kg) *
                    </label>
                    <input
                      type="number"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.weight ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="몸무게를 입력하세요"
                    />
                    {errors.weight && <p className="text-red-500 text-sm mt-1">{errors.weight}</p>}
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-gray-800">수영 숙련도 *</h3>
                      <p className="text-xs text-gray-500">완영 가능한 최고 영법을 선택해주세요.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {swimProficiencyOptions.map((option) => (
                      <label
                        key={option.id}
                        className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition ${
                          formData.swimProficiency === option.id
                            ? 'border-blue-500 bg-white shadow-sm'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="swimProficiency"
                          value={option.id}
                          checked={formData.swimProficiency === option.id}
                          onChange={() => setFormData({ ...formData, swimProficiency: option.id })}
                          className="mt-1 h-4 w-4 text-blue-600"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{option.label}</p>
                          <p className="text-sm text-gray-600">{option.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                  {errors.swimProficiency && <p className="text-red-500 text-sm mt-1">{errors.swimProficiency}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Target className="w-4 h-4 inline mr-2" />
                    연속으로 수영 가능한 거리 *
                  </label>
                  <select
                    value={formData.maxContinuousDistance}
                    onChange={(e) => setFormData({ ...formData, maxContinuousDistance: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.maxContinuousDistance ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">거리를 선택하세요</option>
                    {distanceOptions.map((distance) => (
                      <option key={distance.value} value={distance.value}>
                        {distance.label}
                      </option>
                    ))}
                  </select>
                  {errors.maxContinuousDistance && (
                    <p className="text-red-500 text-sm mt-1">{errors.maxContinuousDistance}</p>
                  )}
                </div>

                <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-gray-800">가능 영법 & 회피 영법 *</h3>
                      <p className="text-xs text-gray-500">주로 사용하는 영법과 피하고 싶은 영법을 선택하세요.</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      선택된 영법: <strong className="text-blue-600">{formData.mainStrokes.length}</strong>개
                    </span>
                  </div>
                  <StrokesSelectionSection
                    mainStrokes={formData.mainStrokes}
                    excludedStrokes={formData.excludedStrokes}
                    strokes={strokeOptions}
                    onUpdate={(updates) =>
                      setFormData((prev) => ({
                        ...prev,
                        mainStrokes: updates.mainStrokes ?? prev.mainStrokes,
                        preferredStrokes: updates.mainStrokes ?? prev.preferredStrokes,
                        excludedStrokes: updates.excludedStrokes ?? prev.excludedStrokes,
                      }))
                    }
                  />
                  {errors.mainStrokes && <p className="text-red-500 text-sm">{errors.mainStrokes}</p>}
                </div>

                <div className="border border-blue-200 rounded-lg p-4 bg-blue-50 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-blue-900">CSS 측정 여부</h3>
                      <p className="text-xs text-blue-700">
                        최근에 CSS(Critical Swim Speed)를 측정하셨다면 값을 입력해주세요.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {(['no', 'yes'] as HasCssOption[]).map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setFormData({ ...formData, hasCssMeasurement: value })}
                          className={`px-3 py-2 text-sm rounded-md border transition ${
                            formData.hasCssMeasurement === value
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-100'
                          }`}
                        >
                          {value === 'yes' ? '측정 완료' : '아직 없음'}
                        </button>
                      ))}
                    </div>
                  </div>
                  {formData.hasCssMeasurement === 'yes' && (
                    <div className="space-y-3">
                      <CSSInputSection
                        css={formData.strokeCSS}
                        strokes={strokeOptions}
                        onUpdate={(css) =>
                          setFormData((prev) => ({
                            ...prev,
                            strokeCSS: css as Record<StrokeId, number>,
                          }))
                        }
                        cssMeasurementPoolLength={formData.cssMeasurementPoolLength}
                        onCssMeasurementPoolLengthUpdate={(length) =>
                          setFormData((prev) => ({
                            ...prev,
                            cssMeasurementPoolLength: length,
                          }))
                        }
                      />
                      {errors.strokeCSS && <p className="text-red-500 text-sm">{errors.strokeCSS}</p>}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* 자격증 정보 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      <CheckCircle className="w-4 h-4 inline mr-2" />
                      자격증 정보 *
                    </label>
                    <button
                      type="button"
                      onClick={() => setCertificates([...certificates, { name: '', issuer: '', certificateNumber: '', acquiredDate: '' }])}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      + 자격증 추가
                    </button>
                  </div>
                  
                  {certificates.map((cert, index) => (
                    <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg space-y-3">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-gray-700">자격증 #{index + 1}</h3>
                        {certificates.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setCertificates(certificates.filter((_, i) => i !== index))}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            ✕ 제거
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            자격증 이름 <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={cert.name}
                            onChange={(e) => {
                              const updated = [...certificates];
                              updated[index] = { ...updated[index], name: e.target.value };
                              setCertificates(updated);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="예: 생활체육지도자 수영 2급"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            발급 기관 <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={cert.issuer}
                            onChange={(e) => {
                              const updated = [...certificates];
                              updated[index] = { ...updated[index], issuer: e.target.value };
                              setCertificates(updated);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="예: 대한수영연맹"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            자격증 번호 <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={cert.certificateNumber}
                            onChange={(e) => {
                              const updated = [...certificates];
                              updated[index] = { ...updated[index], certificateNumber: e.target.value };
                              setCertificates(updated);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="예: SW-2024-12345"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            취득일 <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            value={cert.acquiredDate}
                            onChange={(e) => {
                              const updated = [...certificates];
                              updated[index] = { ...updated[index], acquiredDate: e.target.value };
                              setCertificates(updated);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {errors.certifications && <p className="text-red-500 text-sm mt-1">{errors.certifications}</p>}
                </div>

                {/* 강의 경험 정보 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      <Activity className="w-4 h-4 inline mr-2" />
                      강의 경험 *
                    </label>
                    <button
                      type="button"
                      onClick={() => setTeachingExperiences([...teachingExperiences, { centerName: '', startDate: '', endDate: '', workType: '' }])}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      + 경험 추가
                    </button>
                  </div>
                  
                  {teachingExperiences.map((exp, index) => (
                    <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg space-y-3">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-gray-700">경험 #{index + 1}</h3>
                        {teachingExperiences.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setTeachingExperiences(teachingExperiences.filter((_, i) => i !== index))}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            ✕ 제거
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            센터명 <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={exp.centerName}
                            onChange={(e) => {
                              const updated = [...teachingExperiences];
                              updated[index] = { ...updated[index], centerName: e.target.value };
                              setTeachingExperiences(updated);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="예: 강남 수영센터"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            근무 형태 <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={exp.workType}
                            onChange={(e) => {
                              const updated = [...teachingExperiences];
                              updated[index] = { ...updated[index], workType: e.target.value };
                              setTeachingExperiences(updated);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          >
                            <option value="">선택하세요</option>
                            <option value="full-time">정규직</option>
                            <option value="part-time">파트타임</option>
                            <option value="contract">계약직</option>
                            <option value="freelance">프리랜서</option>
                            <option value="intern">인턴</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            시작 날짜 <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            value={exp.startDate}
                            onChange={(e) => {
                              const updated = [...teachingExperiences];
                              updated[index] = { ...updated[index], startDate: e.target.value };
                              setTeachingExperiences(updated);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            종료 날짜 <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            value={exp.endDate}
                            onChange={(e) => {
                              const updated = [...teachingExperiences];
                              updated[index] = { ...updated[index], endDate: e.target.value };
                              setTeachingExperiences(updated);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {errors.teachingExperience && <p className="text-red-500 text-sm mt-1">{errors.teachingExperience}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Target className="w-4 h-4 inline mr-2" />
                    전문 분야 *
                  </label>
                  <textarea
                    value={formData.specialties}
                    onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.specialties ? 'border-red-500' : 'border-gray-300'
                    }`}
                    rows={3}
                    placeholder="전문 분야를 입력하세요 (예: 어린이 수영, 성인 수영, 생존수영 등)"
                  />
                  {errors.specialties && <p className="text-red-500 text-sm mt-1">{errors.specialties}</p>}
                </div>

              </>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {formData.accountType === 'student' ? '추가 정보' : '근무 정보'}
            </h2>
            
            {formData.accountType === 'student' ? (
              <>
                <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-gray-800">질환·특수상황 선택</h3>
                      <p className="text-xs text-gray-500">
                        수영 엔진의 안전 조정을 위해 해당되는 질환이나 특수상황을 선택해주세요.
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      선택됨: <strong className="text-blue-600">{formData.conditionIds.length}</strong>개
                    </span>
                  </div>
                  <ConditionQuickPick
                    value={formData.conditionIds}
                    onChange={(ids) => setFormData({ ...formData, conditionIds: ids })}
                  />
                  <p className="text-xs text-gray-500">
                    선택된 항목은 프로그램 생성 시 자동으로 반영됩니다.
                  </p>
                </div>

                <div className="border border-purple-200 rounded-lg p-4 space-y-4 bg-purple-50/40">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-purple-900">운동 목표 선택</h3>
                      <p className="text-xs text-purple-700">
                        수영 엔진에서 제공하는 10가지 목표 중 하나를 선택해주세요.
                      </p>
                    </div>
                    <span className="text-xs text-purple-700">
                      현재 선택: <strong className="text-purple-600">{formData.fitnessGoals}</strong>
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {goalOptions.map((goal) => {
                      const isSelected = formData.fitnessGoals === goal;
                      return (
                        <button
                          key={goal}
                          type="button"
                          onClick={() => setFormData({ ...formData, fitnessGoals: goal })}
                          className={`px-3 py-2 text-sm border-2 rounded-lg transition-all ${
                            isSelected
                              ? 'border-purple-500 bg-white text-purple-700 font-semibold shadow-sm'
                              : 'border-purple-100 bg-white hover:border-purple-300 text-gray-700'
                          }`}
                        >
                          {goal}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-purple-700">
                    선택한 목표는 프로그램 생성 시 운동 강도와 구성에 직접 반영됩니다.
                  </p>
                </div>

              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    근무 가능 지역 *
                  </label>
                  <RegionSelector
                    selectedSido={selectedSido}
                    selectedRegions={selectedRegions}
                    showDistrictSelection={showDistrictSelection}
                    onSidoSelect={(sido) => {
                      if (sido === '전국') {
                        setSelectedRegions(new Set(['전국']));
                        setSelectedSido('');
                        setShowDistrictSelection(false);
                      } else {
                        setSelectedSido(sido);
                        setShowDistrictSelection(true);
                        setSelectedRegions(new Set());
                      }
                    }}
                    onDistrictToggle={(district) => {
                      const newRegions = new Set(selectedRegions);
                      if (newRegions.has(district)) {
                        newRegions.delete(district);
                        if (newRegions.size === 0) {
                          setSelectedSido('');
                          setShowDistrictSelection(false);
                        }
                      } else {
                        newRegions.add(district);
                      }
                      setSelectedRegions(newRegions);
                    }}
                    onSelectAll={() => {
                      if (selectedSido && CITIES_BY_PROVINCE[selectedSido]) {
                        const allDistrictsSelected = CITIES_BY_PROVINCE[selectedSido].every(city => selectedRegions.has(city));
                        const newRegions = new Set(selectedRegions);
                        
                        if (allDistrictsSelected) {
                          // 모두 해제
                          CITIES_BY_PROVINCE[selectedSido].forEach(city => newRegions.delete(city));
                        } else {
                          // 모두 선택
                          CITIES_BY_PROVINCE[selectedSido].forEach(city => newRegions.add(city));
                        }
                        setSelectedRegions(newRegions);
                      }
                    }}
                    onClose={() => {
                      setShowDistrictSelection(false);
                      setSelectedSido('');
                    }}
                  />
                  {errors.availableRegions && <p className="text-red-500 text-sm mt-1">{errors.availableRegions}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    자기소개 *
                  </label>
                  <textarea
                    value={formData.introduction}
                    onChange={(e) => setFormData({ ...formData, introduction: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.introduction ? 'border-red-500' : 'border-gray-300'
                    }`}
                    rows={4}
                    placeholder="자기소개를 입력하세요"
                  />
                  {errors.introduction && <p className="text-red-500 text-sm mt-1">{errors.introduction}</p>}
                </div>
              </>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">약관 동의</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center flex-1">
                  <input
                    type="checkbox"
                    id="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={(e) => {
                      e.preventDefault();
                      if (!formData.agreeTerms) {
                        setCurrentTermsType('terms');
                        setShowTermsPopup(true);
                      }
                    }}
                    className={`mt-1 mr-3 ${errors.agreeTerms ? 'border-red-500' : ''} ${formData.agreeTerms ? '' : 'cursor-not-allowed opacity-50'}`}
                    readOnly
                  />
                  <label htmlFor="agreeTerms" className="text-sm font-medium text-gray-900">
                    서비스 이용약관 동의 <span className="text-red-600">*</span>
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentTermsType('terms');
                    setShowTermsPopup(true);
                  }}
                  className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                >
                  👁️ 보기
                </button>
              </div>
              {errors.agreeTerms && <p className="text-red-500 text-sm">{errors.agreeTerms}</p>}

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center flex-1">
                  <input
                    type="checkbox"
                    id="agreePrivacy"
                    checked={formData.agreePrivacy}
                    onChange={(e) => {
                      e.preventDefault();
                      if (!formData.agreePrivacy) {
                        setCurrentTermsType('privacy');
                        setShowTermsPopup(true);
                      }
                    }}
                    className={`mt-1 mr-3 ${errors.agreePrivacy ? 'border-red-500' : ''} ${formData.agreePrivacy ? '' : 'cursor-not-allowed opacity-50'}`}
                    readOnly
                  />
                  <label htmlFor="agreePrivacy" className="text-sm font-medium text-gray-900">
                    개인정보 처리방침 동의 <span className="text-red-600">*</span>
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentTermsType('privacy');
                    setShowTermsPopup(true);
                  }}
                  className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                >
                  👁️ 보기
                </button>
              </div>
              {errors.agreePrivacy && <p className="text-red-500 text-sm">{errors.agreePrivacy}</p>}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                <div>
                  <h4 className="font-medium text-blue-900">회원가입 완료 후</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    {formData.accountType === 'student' 
                      ? '입력하신 정보를 바탕으로 맞춤형 수영 프로그램을 제공받을 수 있습니다.'
                      : '입력하신 정보를 바탕으로 강사 승인 절차를 진행합니다.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 진행 단계 표시 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">회원가입</h1>
            <span className="text-sm text-gray-600">
              {currentStep} / {totalSteps}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>기본 정보</span>
            <span>개인 정보</span>
            <span>{formData.accountType === 'student' ? '건강/운동' : '자격증/경력'}</span>
            <span>{formData.accountType === 'student' ? '추가 정보' : '근무 정보'}</span>
            <span>약관 동의</span>
          </div>
        </div>

        {/* 폼 내용 */}
        <div className="bg-white rounded-lg shadow p-8">
          {renderStepContent()}
        </div>

        {/* 버튼 */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handlePrev}
            disabled={currentStep === 1}
            className={`px-6 py-3 border border-gray-300 rounded-md ${
              currentStep === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            이전
          </button>

          {currentStep < totalSteps ? (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              다음
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              회원가입 완료
            </button>
          )}
        </div>
      </div>

      {/* 약관 팝업 */}
      {showTermsPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                {currentTermsType === 'terms' && '서비스 이용약관'}
                {currentTermsType === 'privacy' && '개인정보 처리방침'}
              </h3>
              <button
                onClick={() => setShowTermsPopup(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {currentTermsType === 'terms' && (
                <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
                  <h4 className="font-bold text-base">제1조 (목적)</h4>
                  <p>본 약관은 JJ Swim Lab(이하 &quot;회사&quot;)이 제공하는 수영 교육 관리 플랫폼 서비스(이하 &quot;서비스&quot;)의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
                  
                  <h4 className="font-bold text-base">제2조 (정의)</h4>
                  <ol className="list-decimal ml-5 space-y-1">
                    <li>&quot;서비스&quot;란 회사가 제공하는 AI 기반 수영 교육 관리, 회원 관리, 진도 추적 등의 플랫폼을 의미합니다.</li>
                    <li>&quot;일반 회원&quot;이란 본 약관에 동의하고 개인 자격으로 서비스를 이용하는 학생 및 강사를 의미합니다.</li>
                    <li>&quot;센터 회원&quot;이란 본 약관에 동의하고 센터 등록을 신청한 수영장 센터(사업자)를 의미합니다.</li>
                    <li>&quot;계정&quot;이란 회원의 식별과 서비스 이용을 위해 회원이 설정한 이메일과 비밀번호의 조합을 의미합니다.</li>
                    <li>&quot;민감정보&quot;는 「개인정보 보호법」 제23조에 따른 건강정보, 질환정보, 컨디션 등을 의미합니다.</li>
                  </ol>
                  
                  <h4 className="font-bold text-base">제3조 (약관의 효력 및 변경)</h4>
                  <ol className="list-decimal ml-5 space-y-1">
                    <li>본 약관은 서비스를 이용하고자 하는 모든 회원에게 그 효력이 발생합니다.</li>
                    <li>회사는 필요한 경우 관련 법령을 위배하지 않는 범위 내에서 본 약관을 변경할 수 있습니다.</li>
                    <li>회사는 약관을 개정하는 경우 적용일자 및 개정사유를 명시하여 적용일 30일 전부터 서비스 초기화면, 공지사항 및 전자우편, 앱 푸시 등으로 알립니다.</li>
                    <li>회원에게 불리한 변경의 경우, 회사는 개별 통지하며, 회원은 변경 약관 적용일 전까지 동의를 거부하고 위약금 없이 계약을 해지할 수 있습니다.</li>
                    <li>변경된 약관에 동의하지 않는 회원은 서비스 이용이 제한되거나 계약이 해지될 수 있습니다.</li>
                  </ol>
                  
                  <h4 className="font-bold text-base">제4조 (서비스의 제공)</h4>
                  <p>회사는 다음과 같은 서비스를 제공합니다:</p>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>AI 기반 맞춤형 수영 프로그램 생성</li>
                    <li>회원 건강 정보 및 진도 관리</li>
                    <li>강사-학생 매칭 및 평가 시스템</li>
                    <li>3D 영법 뷰어 및 학습 도구</li>
                    <li>실시간 알림 및 진도 공유</li>
                  </ul>
                  
                  <h4 className="font-bold text-base">제5조 (회원 가입 및 승인)</h4>
                  <ol className="list-decimal ml-5 space-y-1">
                    <li>회원 가입은 신청인이 온라인으로 필요한 정보를 기입하고 본 약관에 동의함으로써 이루어집니다.</li>
                    <li>회사는 신청 내용을 검토한 후 승인 여부를 결정합니다.</li>
                    <li>다음 각 호에 해당하는 경우 회사는 승인을 거부하거나 유보할 수 있습니다:
                      <ul className="list-disc ml-5 mt-1">
                        <li>허위 정보를 기재한 경우</li>
                        <li>기타 회사가 정한 승인 기준을 충족하지 못한 경우</li>
                      </ul>
                    </li>
                  </ol>
                  
                  <h4 className="font-bold text-base">제6조 (개인정보보호)</h4>
                  <p>회사는 관련 법령이 정하는 바에 따라 회원의 개인정보를 보호하기 위해 노력합니다. 개인정보의 보호 및 이용에 대해서는 별도의 개인정보 처리방침을 적용합니다.</p>
                  
                  <h4 className="font-bold text-base">제7조 (손해배상 및 면책)</h4>
                  <ol className="list-decimal ml-5 space-y-1">
                    <li><strong>면책 사유</strong>: 회사는 다음 각 호의 사유로 인한 서비스 중단, 장애, 데이터 손실에 대해 책임을 지지 않습니다:
                      <ul className="list-disc ml-5 mt-1">
                        <li>천재지변, 전쟁, 파업, 정부 명령 등 불가항력</li>
                        <li>IDC/클라우드 사업자, 전기통신사업자, PG사, 메시지 대행사 등 제3자 서비스 장애</li>
                        <li>회원의 귀책사유(ID/PW 유출, 약관 위반, 부정 사용 등)</li>
                        <li>회원 환경(기기, 네트워크, 브라우저)의 문제</li>
                      </ul>
                    </li>
                    <li><strong>손해배상 범위 제한</strong>:
                      <ul className="list-disc ml-5 mt-1">
                        <li>회사의 고의 또는 중과실이 없는 한, <strong>회사의 배상 책임은 해당 회원이 최근 12개월간 납부한 서비스 이용료 총액을 한도</strong>로 합니다</li>
                        <li>무료 플랜, 체험, 프로모션 이용 회원에 대한 배상 한도는 <strong>10만 원</strong>으로 합니다</li>
                        <li>간접손해, 특별손해, 결과적 손해, 징벌적 손해, 일실이익 등은 배상 범위에서 제외됩니다</li>
                      </ul>
                    </li>
                  </ol>
                  
                  <h4 className="font-bold text-base">제8조 (분쟁 해결 및 관할)</h4>
                  <ol className="list-decimal ml-5 space-y-1">
                    <li>본 약관의 준거법은 대한민국 법령으로 합니다.</li>
                    <li>서비스 이용과 관련한 분쟁은 서울중앙지방법원을 관할법원으로 합니다.</li>
                  </ol>
                  
                  <p className="text-xs text-gray-500 mt-6">
                    <strong>시행일:</strong> 2025년 10월 15일<br/>
                    <strong>버전:</strong> v1.1
                  </p>
                </div>
              )}

              {currentTermsType === 'privacy' && (
                <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
                  <h4 className="font-bold text-base">1. 개인정보의 수집 및 이용 목적</h4>
                  <p>회사는 다음의 목적을 위하여 개인정보를 처리합니다:</p>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>회원 가입 및 계정 관리</li>
                    <li>서비스 제공 및 계약 이행</li>
                    <li>요금 결제 및 정산</li>
                    <li>고객 문의 및 불만 처리</li>
                    <li>서비스 개선 및 통계 분석</li>
                  </ul>
                  
                  <h4 className="font-bold text-base">2. 수집하는 개인정보 항목</h4>
                  <p><strong>일반 정보 (필수):</strong></p>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>계정: 이메일, 비밀번호</li>
                    <li>개인 정보: 이름, 전화번호, 생년월일, 성별, 주소</li>
                    <li>이용 내역: 접속 로그, 서비스 이용 기록</li>
                    <li>결제 정보: 결제 토큰, 영수증 정보</li>
                  </ul>
                  <p className="text-xs text-orange-600 bg-orange-50 p-2 rounded mt-2">
                    ⚠️ <strong>민감정보(건강정보)</strong>는 별도 동의를 통해 수집됩니다.
                  </p>
                  
                  <h4 className="font-bold text-base">3. 개인정보의 보유 및 이용 기간</h4>
                  <p>회사는 원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체없이 파기합니다. 단, 관련 법령에 따라 일정 기간 보관해야 하는 정보는 법령이 정한 기간 동안 보관합니다:</p>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>계약 또는 청약철회 등에 관한 기록: 5년</li>
                    <li>대금결제 및 재화 등의 공급에 관한 기록: 5년</li>
                    <li>소비자 불만 또는 분쟁처리에 관한 기록: 3년</li>
                  </ul>
                  
                  <h4 className="font-bold text-base">4. 개인정보 처리 위탁</h4>
                  <p>회사는 원활한 서비스 제공을 위해 다음과 같이 개인정보 처리를 위탁합니다:</p>
                  <table className="w-full text-xs border mt-2">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border p-2">수탁자</th>
                        <th className="border p-2">위탁 업무</th>
                        <th className="border p-2">보유 기간</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border p-2">AWS Korea / AWS Singapore</td>
                        <td className="border p-2">클라우드 호스팅, 데이터 백업</td>
                        <td className="border p-2">계약 종료 시까지</td>
                      </tr>
                      <tr>
                        <td className="border p-2">메시지 발송 대행사</td>
                        <td className="border p-2">이메일/SMS/알림톡 발송</td>
                        <td className="border p-2">발송 즉시 파기</td>
                      </tr>
                      <tr>
                        <td className="border p-2">결제대행사(PG)</td>
                        <td className="border p-2">결제 처리</td>
                        <td className="border p-2">5년 (전자상거래법)</td>
                      </tr>
                    </tbody>
                  </table>
                  
                  <h4 className="font-bold text-base">5. 개인정보의 국외 이전</h4>
                  <p>회사는 서비스 제공을 위해 다음과 같이 개인정보를 국외로 이전합니다:</p>
                  <table className="w-full text-xs border mt-2">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border p-2">이전받는 자</th>
                        <th className="border p-2">국가</th>
                        <th className="border p-2">이전 항목</th>
                        <th className="border p-2">목적</th>
                        <th className="border p-2">보유 기간</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border p-2">Amazon Web Services (AWS)</td>
                        <td className="border p-2">싱가포르</td>
                        <td className="border p-2">전체 서비스 데이터</td>
                        <td className="border p-2">클라우드 호스팅</td>
                        <td className="border p-2">계약 종료 시까지</td>
                      </tr>
                    </tbody>
                  </table>
                  <p className="text-xs mt-2">※ 이전 일시: 실시간 상시 전송 / 이전 방법: 암호화된 네트워크 전송(TLS)</p>
                  
                  <h4 className="font-bold text-base">6. 이용자의 권리</h4>
                  <p>이용자는 다음의 권리를 행사할 수 있습니다:</p>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>개인정보 열람, 정정, 삭제 요구</li>
                    <li>개인정보 처리 정지 요구</li>
                    <li>동의 철회 (회원 탈퇴)</li>
                    <li>행사 방법: 앱 내 설정 메뉴 또는 privacy@jjswimlab.com으로 요청</li>
                    <li>답변 기한: 접수 후 10일 이내</li>
                  </ul>
                  
                  <h4 className="font-bold text-base">7. 개인정보보호책임자</h4>
                  <p>개인정보 처리에 관한 업무를 총괄하는 개인정보보호책임자:</p>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>성명: 개인정보보호책임자</li>
                    <li>직책: DPO (Data Protection Officer)</li>
                    <li>이메일: privacy@jjswimlab.com</li>
                    <li>전화: 02-1234-5678</li>
                  </ul>
                  
                  <p className="text-xs text-gray-500 mt-6">
                    <strong>시행일:</strong> 2025년 10월 15일<br/>
                    <strong>버전:</strong> v1.1
                  </p>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t flex justify-end space-x-3">
              <button
                onClick={() => setShowTermsPopup(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                닫기
              </button>
              <button
                onClick={() => {
                  if (currentTermsType === 'terms') {
                    setFormData({ ...formData, agreeTerms: true });
                  } else if (currentTermsType === 'privacy') {
                    setFormData({ ...formData, agreePrivacy: true });
                  }
                  setShowTermsPopup(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                동의합니다
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}