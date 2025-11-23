/**
 * @file 센터 관리자 회원가입 페이지
 * @description 센터 대표자가 직접 센터 등록 신청을 하는 페이지
 * @date 2025-10-14
 * @author JJ Swim Lab
 * 
 * @연동되는 데이터:
 * - 센터 기본 정보 (센터명, 사업자번호, 대표자 정보)
 * - 센터 시설 정보 (수영장 크기, 레인 수, 부대시설)
 * - 운영 정보 (운영시간, 주차 여부)
 * 
 * @연동되는 파일:
 * - server/src/routes/center-registrations.ts (등록 신청 API)
 * - server/src/models/CenterRegistration.ts (등록 신청 모델)
 * - components/Button.tsx (버튼 컴포넌트)
 * - components/ui/card.tsx (카드 컴포넌트)
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui';
import { Button } from '@/components/ui';
import { Building2, User, MapPin, Phone, Mail, FileText, Clock, Car, Waves } from 'lucide-react';

// Daum 우편번호 서비스 타입 선언
declare global {
  interface Window {
    daum: any;
  }
}

// 수영장 정보 인터페이스
interface PoolInfo {
  id: string;
  type: 'main' | 'auxiliary';
  length: number;
  width: number;
  depth: number;
  laneCount?: number;
  description?: string;
}

// 시설 상세 정보 인터페이스
interface FacilityDetail {
  name: string;
  enabled: boolean;
  details?: {
    count?: number;
    type?: string;
    description?: string;
  };
}

interface FormData {
  // 기본 정보
  centerName: string;
  businessNumber: string;
  representativeName: string;
  representativeEmail: string;
  representativePhone: string;
  password: string;
  passwordConfirm: string;
  
  // 주소
  postalCode: string;
  address1: string;
  address2: string;
  city: string;
  province: string;
  
  // 센터 정보
  description: string;
  
  // 수영장 정보 (다중)
  pools: PoolInfo[];
  
  // 시설 정보 (상세)
  facilities: FacilityDetail[];
  
  // 운영 정보
  weekdaysOpen: string;
  weekdaysClose: string;
  weekendsOpen: string;
  weekendsClose: string;
  capacity: number;
  parkingAvailable: boolean;
  parkingSpaces: number;
  
  // 신청자 정보
  applicantPosition: string;
}

// 시설 기본 템플릿
const FACILITY_TEMPLATES: FacilityDetail[] = [
  { 
    name: '샤워실', 
    enabled: false, 
    details: { type: '남/여 구분', description: '' } 
  },
  { 
    name: '락커룸', 
    enabled: false, 
    details: { type: '남/여 분리', description: '' } 
  },
  { 
    name: '사우나', 
    enabled: false, 
    details: { type: '남/여 분리', description: '' } 
  },
  { 
    name: '탈수기', 
    enabled: false, 
    details: { type: '남/여 구분', description: '' } 
  },
  { 
    name: '수영용품 판매점', 
    enabled: false, 
    details: { description: '' } 
  },
  { 
    name: '황토방', 
    enabled: false, 
    details: { type: '남/여 분리', description: '' } 
  },
  { 
    name: '체온조절실', 
    enabled: false, 
    details: { type: '남/여 분리', description: '' } 
  },
  { 
    name: '체온유지탕(월풀)', 
    enabled: false, 
    details: { type: '남/여 분리', description: '' } 
  },
  { 
    name: '카페/휴게실', 
    enabled: false, 
    details: { description: '' } 
  },
  { 
    name: '키즈존', 
    enabled: false, 
    details: { description: '' } 
  },
  { 
    name: 'PT룸', 
    enabled: false, 
    details: { count: 0, description: '' } 
  },
  { 
    name: '수중 음향시스템', 
    enabled: false, 
    details: { description: '' } 
  },
  { 
    name: 'CCTV', 
    enabled: false, 
    details: { count: 0, description: '' } 
  },
  { 
    name: '자동 제세동기(AED)', 
    enabled: false, 
    details: { count: 0 } 
  },
  { 
    name: '응급처치실', 
    enabled: false, 
    details: { description: '' } 
  },
];

export default function SignupCenterAdminPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [sentCode, setSentCode] = useState('');
  
  // 수용 인원 계산 설정
  const [autoCalculateCapacity, setAutoCalculateCapacity] = useState(true);
  const [capacityCalcMethod, setCapacityCalcMethod] = useState<'lane' | 'area'>('lane');
  const [peoplePerLane, setPeoplePerLane] = useState(12);
  const [areaPerPerson, setAreaPerPerson] = useState(2.5);
  
  // 약관 동의 상태
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [sensitiveInfoAgreed, setSensitiveInfoAgreed] = useState(false);
  const [marketingAgreed, setMarketingAgreed] = useState(false);
  const [showTermsPopup, setShowTermsPopup] = useState(false);
  const [currentTermsType, setCurrentTermsType] = useState<'terms' | 'privacy' | 'sensitive' | 'marketing'>('terms');
  const [formData, setFormData] = useState<FormData>({
    centerName: '',
    businessNumber: '',
    representativeName: '',
    representativeEmail: '',
    representativePhone: '',
    password: '',
    passwordConfirm: '',
    postalCode: '',
    address1: '',
    address2: '',
    city: '',
    province: '',
    description: '',
    pools: [
      {
        id: '1',
        type: 'main',
        length: 25,
        width: 12.5,
        depth: 1.2,
        laneCount: 6,
        description: '메인 수영장'
      }
    ],
    facilities: JSON.parse(JSON.stringify(FACILITY_TEMPLATES)),
    weekdaysOpen: '06:00',
    weekdaysClose: '22:00',
    weekendsOpen: '08:00',
    weekendsClose: '20:00',
    capacity: 100,
    parkingAvailable: false,
    parkingSpaces: 0,
    applicantPosition: '대표'
  });

  // Daum 우편번호 스크립트 로드
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // 페이지 진입 시 스크롤 최상단으로
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Step 변경 시 스크롤 최상단으로
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const updateFormData = (field: keyof FormData, value: string | number | boolean | PoolInfo[] | FacilityDetail[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 도로명 주소 검색
  const openAddressSearch = () => {
    if (!window.daum || !window.daum.Postcode) {
      alert('주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    new window.daum.Postcode({
      oncomplete: function(data: { zonecode: string; roadAddress?: string; jibunAddress?: string; sido: string; sigungu: string }) {
        // 선택한 주소 정보를 formData에 설정
        updateFormData('postalCode', data.zonecode);
        updateFormData('address1', data.roadAddress || data.jibunAddress);
        updateFormData('province', data.sido);
        updateFormData('city', data.sigungu);
        
        // 상세주소 입력 필드로 포커스 이동
        const detailInput = document.getElementById('address2');
        if (detailInput) {
          detailInput.focus();
        }
      }
    }).open();
  };

  // 이메일 인증 코드 발송
  const sendVerificationEmail = async () => {
    if (!formData.representativeEmail) {
      alert('이메일을 입력해주세요.');
      return;
    }

    // 6자리 랜덤 코드 생성
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSentCode(code);

    try {
      // 실제로는 서버에서 이메일 발송
      // 여기서는 콘솔에 출력 (테스트용)
      if (process.env.NODE_ENV === 'development') {
        console.log(`인증 코드: ${code}`);
      }
      alert(`인증 코드가 ${formData.representativeEmail}로 발송되었습니다.\n(테스트: ${code})`);
    } catch (error) {
      console.error('이메일 발송 오류:', error);
      alert('이메일 발송에 실패했습니다.');
    }
  };

  // 인증 코드 확인
  const verifyEmail = () => {
    if (verificationCode === sentCode) {
      setEmailVerified(true);
      alert('이메일 인증이 완료되었습니다.');
    } else {
      alert('인증 코드가 일치하지 않습니다.');
    }
  };

  // 수영장 추가
  const addPool = () => {
    const newPool: PoolInfo = {
      id: Date.now().toString(),
      type: 'auxiliary',
      length: 15,
      width: 8,
      depth: 0.8,
      description: '보조 수영장'
    };
    setFormData(prev => ({
      ...prev,
      pools: [...prev.pools, newPool]
    }));
  };

  // 수영장 삭제
  const removePool = (id: string) => {
    setFormData(prev => ({
      ...prev,
      pools: prev.pools.filter(p => p.id !== id)
    }));
  };

  // 수영장 정보 업데이트
  const updatePool = (id: string, field: keyof PoolInfo, value: any) => {
    setFormData(prev => ({
      ...prev,
      pools: prev.pools.map(p => 
        p.id === id ? { ...p, [field]: value } : p
      )
    }));
  };

  // 시설 토글
  const toggleFacility = (index: number) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.map((f, i) => 
        i === index ? { ...f, enabled: !f.enabled } : f
      )
    }));
  };

  // 시설 상세 정보 업데이트
  const updateFacilityDetail = (index: number, field: string, value: string | number | boolean | { type?: string; description?: string }) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.map((f, i) => 
        i === index 
          ? { ...f, details: { ...f.details, [field]: value } } 
          : f
      )
    }));
  };

  // 커스텀 시설 추가
  const addCustomFacility = () => {
    const newFacility: FacilityDetail = {
      name: '',
      enabled: true,
      details: { description: '' }
    };
    setFormData(prev => ({
      ...prev,
      facilities: [...prev.facilities, newFacility]
    }));
  };

  // 커스텀 시설 삭제
  const removeCustomFacility = (index: number) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.filter((_, i) => i !== index)
    }));
  };

  // 커스텀 시설 이름 업데이트
  const updateFacilityName = (index: number, name: string) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.map((f, i) => 
        i === index ? { ...f, name } : f
      )
    }));
  };

  // 수용 인원 자동 계산
  const calculateCapacity = () => {
    if (!autoCalculateCapacity) return;
    
    const mainPool = formData.pools.find(p => p.type === 'main');
    if (!mainPool) return;
    
    let calculatedCapacity = 0;
    
    if (capacityCalcMethod === 'lane') {
      // 레인 기준 계산
      calculatedCapacity = (mainPool.laneCount || 6) * peoplePerLane;
    } else {
      // 수면적 기준 계산
      const area = mainPool.length * mainPool.width;
      calculatedCapacity = Math.floor(area / areaPerPerson);
    }
    
    updateFormData('capacity', calculatedCapacity);
  };

  // 약관 팝업 열기
  const openTermsPopup = (type: 'terms' | 'privacy' | 'sensitive' | 'marketing') => {
    setCurrentTermsType(type);
    setShowTermsPopup(true);
  };

  // 약관 동의 처리
  const agreeToTerms = () => {
    if (currentTermsType === 'terms') {
      setTermsAgreed(true);
    } else if (currentTermsType === 'privacy') {
      setPrivacyAgreed(true);
    } else if (currentTermsType === 'sensitive') {
      setSensitiveInfoAgreed(true);
    } else if (currentTermsType === 'marketing') {
      setMarketingAgreed(true);
    }
    setShowTermsPopup(false);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // 이메일 인증 확인
      if (!emailVerified) {
        alert('이메일 인증을 완료해주세요.');
        setLoading(false);
        return;
      }

      // 비밀번호 확인
      if (formData.password !== formData.passwordConfirm) {
        alert('비밀번호가 일치하지 않습니다.');
        setLoading(false);
        return;
      }

      // 필수 필드 검증
      if (!formData.centerName || !formData.businessNumber || !formData.representativeName || 
          !formData.representativeEmail || !formData.representativePhone || !formData.password) {
        alert('필수 항목을 모두 입력해주세요.');
        setLoading(false);
        return;
      }

      // 주소 검증
      if (!formData.postalCode || !formData.address1 || !formData.province || !formData.city) {
        alert('주소 검색 버튼을 클릭하여 주소를 입력해주세요.');
        setLoading(false);
        return;
      }

      // 데이터 검증
      if (formData.pools.length === 0) {
        alert('최소 1개 이상의 수영장 정보를 입력해주세요.');
        setLoading(false);
        return;
      }

      // 이메일 형식 검증
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.representativeEmail)) {
        alert('올바른 이메일 주소를 입력해주세요.\n예: center@example.com');
        setLoading(false);
        return;
      }

      // 사업자등록번호 형식 검증
      const businessNumberRegex = /^\d{3}-\d{2}-\d{5}$/;
      if (!businessNumberRegex.test(formData.businessNumber)) {
        alert('올바른 사업자등록번호를 입력해주세요.\n예: 123-45-67890');
        setLoading(false);
        return;
      }

      // 전화번호 형식 검증
      const phoneRegex = /^01[0-9]-\d{3,4}-\d{4}$/;
      if (!phoneRegex.test(formData.representativePhone)) {
        alert('올바른 전화번호를 입력해주세요.\n예: 010-1234-5678');
        setLoading(false);
        return;
      }

      const requestData = {
        centerName: formData.centerName,
        businessNumber: formData.businessNumber,
        representativeName: formData.representativeName,
        representativeEmail: formData.representativeEmail,
        representativePhone: formData.representativePhone,
        password: formData.password,
        address: {
          postalCode: formData.postalCode,
          address1: formData.address1,
          address2: formData.address2,
          city: formData.city,
          province: formData.province
        },
        centerInfo: {
          description: formData.description,
          pools: formData.pools,
          facilities: formData.facilities.filter(f => f.enabled),
          operatingHours: {
            weekdays: {
              open: formData.weekdaysOpen,
              close: formData.weekdaysClose
            },
            weekends: {
              open: formData.weekendsOpen,
              close: formData.weekendsClose
            }
          },
          capacity: formData.capacity,
          parkingAvailable: formData.parkingAvailable,
          parkingSpaces: formData.parkingSpaces
        },
        applicant: {
          name: formData.representativeName,
          email: formData.representativeEmail,
          phone: formData.representativePhone,
          position: formData.applicantPosition
        }
      };

      if (process.env.NODE_ENV === 'development') {
        console.log('📤 센터 등록 신청 데이터:', requestData);
      }

      const response = await fetch('http://localhost:5000/api/center-registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        const result = await response.json();
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ 센터 등록 성공:', result);
        }
        alert('센터 등록 신청이 완료되었습니다. 관리자 승인 후 이용하실 수 있습니다.');
        router.push('/');
      } else {
        const errorData = await response.json();
        console.error('❌ 센터 등록 실패:', errorData);
        alert(`센터 등록 신청 실패:\n${errorData.message || '알 수 없는 오류'}\n\n콘솔(F12)을 확인해주세요.`);
      }
    } catch (error) {
      console.error('센터 등록 신청 오류:', error);
      alert('센터 등록 신청 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            센터 기본 정보
          </CardTitle>
          <CardDescription>센터의 기본 정보를 입력해주세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              센터명 *
            </label>
            <input
              type="text"
              value={formData.centerName}
              onChange={(e) => updateFormData('centerName', e.target.value)}
              placeholder="예: JJ 수영센터 강남점"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              사업자등록번호 *
            </label>
            <input
              type="text"
              value={formData.businessNumber}
              onChange={(e) => {
                // 숫자만 추출
                const numbers = e.target.value.replace(/[^\d]/g, '');
                // 자동으로 하이픈 추가 (123-45-67890 형식)
                let formatted = numbers;
                if (numbers.length > 3) {
                  formatted = numbers.slice(0, 3) + '-' + numbers.slice(3);
                }
                if (numbers.length > 5) {
                  formatted = numbers.slice(0, 3) + '-' + numbers.slice(3, 5) + '-' + numbers.slice(5, 10);
                }
                updateFormData('businessNumber', formatted);
              }}
              placeholder="123-45-67890"
              maxLength={12}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1">10자리 숫자를 입력하면 자동으로 형식이 지정됩니다</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              센터 소개 *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => updateFormData('description', e.target.value)}
              placeholder="센터의 특징, 강점, 교육 철학 등을 자유롭게 작성해주세요"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            대표자 정보
          </CardTitle>
          <CardDescription>대표자 및 계정 정보를 입력해주세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              대표자명 *
            </label>
            <input
              type="text"
              value={formData.representativeName}
              onChange={(e) => updateFormData('representativeName', e.target.value)}
              placeholder="홍길동"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              연락처 *
            </label>
            <input
              type="tel"
              value={formData.representativePhone}
              onChange={(e) => {
                // 숫자만 추출
                const numbers = e.target.value.replace(/[^\d]/g, '');
                // 자동으로 하이픈 추가 (010-1234-5678 형식)
                let formatted = numbers;
                if (numbers.length > 3) {
                  formatted = numbers.slice(0, 3) + '-' + numbers.slice(3);
                }
                if (numbers.length > 7) {
                  formatted = numbers.slice(0, 3) + '-' + numbers.slice(3, 7) + '-' + numbers.slice(7, 11);
                } else if (numbers.length > 6) {
                  // 010-123-4567 형식도 지원
                  formatted = numbers.slice(0, 3) + '-' + numbers.slice(3, 6) + '-' + numbers.slice(6, 10);
                }
                updateFormData('representativePhone', formatted);
              }}
              placeholder="010-1234-5678"
              maxLength={13}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1">휴대폰 번호를 입력하면 자동으로 형식이 지정됩니다</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이메일 (로그인 ID) *
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={formData.representativeEmail}
                onChange={(e) => {
                  updateFormData('representativeEmail', e.target.value);
                  setEmailVerified(false);
                }}
                placeholder="center@example.com"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
                disabled={emailVerified}
              />
              {!emailVerified && (
                <Button
                  variant="outline"
                  onClick={sendVerificationEmail}
                  disabled={!formData.representativeEmail}
                >
                  인증코드 발송
                </Button>
              )}
              {emailVerified && (
                <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium">
                  ✓ 인증완료
                </span>
              )}
            </div>
            {!emailVerified && sentCode && (
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="인증 코드 6자리"
                  maxLength={6}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <Button onClick={verifyEmail}>
                  확인
                </Button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호 *
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => updateFormData('password', e.target.value)}
              placeholder="8자 이상 입력"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호 확인 *
            </label>
            <input
              type="password"
              value={formData.passwordConfirm}
              onChange={(e) => updateFormData('passwordConfirm', e.target.value)}
              placeholder="비밀번호 재입력"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              직책
            </label>
            <input
              type="text"
              value={formData.applicantPosition}
              onChange={(e) => updateFormData('applicantPosition', e.target.value)}
              placeholder="대표, 원장, 실장 등"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* 약관 동의 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            약관 동의
          </CardTitle>
          <CardDescription>서비스 이용을 위한 약관에 동의해주세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center flex-1">
              <input
                type="checkbox"
                checked={termsAgreed}
                onChange={(e) => {
                  // 필수 약관은 직접 체크 불가
                  e.preventDefault();
                  alert('약관을 먼저 확인해주세요. "👁️ 보기" 버튼을 클릭하세요.');
                }}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3 cursor-not-allowed"
                readOnly
              />
              <span className="text-sm font-medium text-gray-900">
                서비스 이용약관 동의 <span className="text-red-600">*</span>
              </span>
            </div>
            <button
              onClick={() => openTermsPopup('terms')}
              className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors font-medium"
            >
              👁️ 보기
            </button>
          </div>

          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center flex-1">
              <input
                type="checkbox"
                checked={privacyAgreed}
                onChange={(e) => {
                  // 필수 약관은 직접 체크 불가
                  e.preventDefault();
                  alert('약관을 먼저 확인해주세요. "👁️ 보기" 버튼을 클릭하세요.');
                }}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3 cursor-not-allowed"
                readOnly
              />
              <span className="text-sm font-medium text-gray-900">
                개인정보 처리방침 동의 <span className="text-red-600">*</span>
              </span>
            </div>
            <button
              onClick={() => openTermsPopup('privacy')}
              className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors font-medium"
            >
              👁️ 보기
            </button>
          </div>

          <div className="flex items-center justify-between p-3 border-2 border-orange-300 rounded-lg bg-orange-50">
            <div className="flex items-center flex-1">
              <input
                type="checkbox"
                checked={sensitiveInfoAgreed}
                onChange={(e) => {
                  // 필수 약관은 직접 체크 불가
                  e.preventDefault();
                  alert('민감정보 수집·이용 약관을 먼저 확인해주세요. "👁️ 보기" 버튼을 클릭하세요.');
                }}
                className="w-4 h-4 text-orange-600 border-orange-400 rounded focus:ring-orange-500 mr-3 cursor-not-allowed"
                readOnly
              />
              <span className="text-sm font-medium text-gray-900">
                ⚠️ 민감정보(건강정보) 수집·이용 동의 <span className="text-red-600">*</span>
              </span>
            </div>
            <button
              onClick={() => openTermsPopup('sensitive')}
              className="px-3 py-1 text-sm text-orange-700 hover:text-orange-900 hover:bg-orange-100 rounded-lg transition-colors font-bold border border-orange-300"
            >
              👁️ 보기
            </button>
          </div>

          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <label className="flex items-center cursor-pointer flex-1">
              <input
                type="checkbox"
                checked={marketingAgreed}
                onChange={(e) => setMarketingAgreed(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
              />
              <span className="text-sm font-medium text-gray-900">
                마케팅 정보 수신 동의 <span className="text-gray-500">(선택)</span>
              </span>
            </label>
            <button
              onClick={() => openTermsPopup('marketing')}
              className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors font-medium"
            >
              👁️ 보기
            </button>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              ⚠️ <strong>필수 약관</strong>은 "👁️ 보기" 버튼을 클릭하여 내용을 확인한 후 팝업에서 "동의합니다"를 눌러주세요.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            센터 위치
          </CardTitle>
          <CardDescription>도로명 주소 검색으로 정확한 주소를 입력해주세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              우편번호 *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.postalCode}
                placeholder="우편번호"
                readOnly
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
              <Button
                variant="outline"
                onClick={openAddressSearch}
              >
                📍 주소 검색
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              도로명 주소 *
            </label>
            <input
              type="text"
              value={formData.address1}
              placeholder="주소 검색 버튼을 클릭하세요"
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              상세 주소
            </label>
            <input
              id="address2"
              type="text"
              value={formData.address2}
              onChange={(e) => updateFormData('address2', e.target.value)}
              placeholder="건물명, 층수 등 상세 주소를 입력하세요"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                시/도
              </label>
              <input
                type="text"
                value={formData.province}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                시/군/구
              </label>
              <input
                type="text"
                value={formData.city}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              💡 <strong>주소 검색 버튼</strong>을 클릭하면 우편번호, 시/도, 시/군/구가 자동으로 입력됩니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      {/* 수영장 정보 */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center">
                <Waves className="h-5 w-5 mr-2" />
                수영장 정보
              </CardTitle>
              <CardDescription>수영장 규격을 입력해주세요. 여러 개의 수영장 등록 가능합니다.</CardDescription>
            </div>
            <Button
              onClick={addPool}
              variant="outline"
              size="sm"
              className="flex items-center"
            >
              <span className="mr-1">+</span> 수영장 추가
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {formData.pools.map((pool, index) => (
            <div key={pool.id} className="p-4 border-2 border-gray-200 rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-gray-900">
                  {pool.type === 'main' ? '🏊 메인 수영장' : '🧒 보조 수영장'} #{index + 1}
                </h4>
                {pool.type === 'auxiliary' && (
                  <button
                    onClick={() => removePool(pool.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    삭제
                  </button>
                )}
              </div>

              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    길이 (m) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={pool.length}
                    onChange={(e) => updatePool(pool.id, 'length', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="25"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">일반: 25m, 50m</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    너비 (m) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={pool.width}
                    onChange={(e) => updatePool(pool.id, 'width', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="12.5"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    깊이 (m) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={pool.depth}
                    onChange={(e) => updatePool(pool.id, 'depth', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="1.2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    레인 수 {pool.type === 'main' && '*'}
                  </label>
                  <input
                    type="number"
                    value={pool.laneCount || (pool.type === 'main' ? 6 : 0)}
                    onChange={(e) => updatePool(pool.id, 'laneCount', parseInt(e.target.value))}
                    min="0"
                    max="20"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder={pool.type === 'main' ? '6' : '선택'}
                    required={pool.type === 'main'}
                  />
                  <p className="text-xs text-gray-500 mt-1">{pool.type === 'auxiliary' && '선택 사항'}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  설명 (선택)
                </label>
                <input
                  type="text"
                  value={pool.description || ''}
                  onChange={(e) => updatePool(pool.id, 'description', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="예: 유아 전용, 초급자 교육용 등"
                />
              </div>
            </div>
          ))}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              💡 <strong>보조 수영장</strong>이 여러 개 있다면 <strong>&quot;+ 수영장 추가&quot;</strong> 버튼을 클릭하세요.
            </p>
          </div>

          {/* 수용 인원 계산 */}
          <div className="border-t pt-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoCalculateCapacity}
                    onChange={(e) => setAutoCalculateCapacity(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">자동 계산 사용</span>
                </label>
              </div>

              {autoCalculateCapacity ? (
                <div className="space-y-3 bg-blue-50 p-4 rounded-lg">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-2">계산 방식</label>
                      <select
                        value={capacityCalcMethod}
                        onChange={(e) => setCapacityCalcMethod(e.target.value as 'lane' | 'area')}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="lane">레인 기준</option>
                        <option value="area">수면적 기준</option>
                      </select>
                    </div>

                    {capacityCalcMethod === 'lane' ? (
                      <div>
                        <label className="block text-xs text-gray-600 mb-2">레인당 인원 (명)</label>
                        <input
                          type="number"
                          value={peoplePerLane}
                          onChange={(e) => setPeoplePerLane(parseInt(e.target.value))}
                          min="5"
                          max="20"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="12"
                        />
                        <p className="text-xs text-gray-500 mt-1">일반: 10~15명</p>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs text-gray-600 mb-2">1인당 수면적 (㎡)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={areaPerPerson}
                          onChange={(e) => setAreaPerPerson(parseFloat(e.target.value))}
                          min="1"
                          max="5"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="2.5"
                        />
                        <p className="text-xs text-gray-500 mt-1">법적 기준: 2.5㎡</p>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={calculateCapacity}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    계산하기
                  </Button>

                  {formData.capacity > 0 && (
                    <div className="bg-white p-3 rounded-lg border border-blue-200">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">계산 결과:</span> {formData.capacity}명
                      </p>
                      {capacityCalcMethod === 'lane' && (
                        <p className="text-xs text-gray-500 mt-1">
                          {formData.pools.find(p => p.type === 'main')?.laneCount || 6}개 레인 × {peoplePerLane}명 = {formData.capacity}명
                        </p>
                      )}
                      {capacityCalcMethod === 'area' && (
                        <p className="text-xs text-gray-500 mt-1">
                          {(formData.pools.find(p => p.type === 'main')?.length || 25) * (formData.pools.find(p => p.type === 'main')?.width || 12.5)}㎡ ÷ {areaPerPerson}㎡ = {formData.capacity}명
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    최대 수용 인원 * (수동 입력)
                  </label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => updateFormData('capacity', parseInt(e.target.value))}
                    min="10"
                    max="1000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="100"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">센터 전체 최대 수용 가능 인원</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 보유 시설 */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>보유 시설</CardTitle>
              <CardDescription>센터에서 제공하는 시설을 선택하고 상세 정보를 입력해주세요</CardDescription>
            </div>
            <Button
              onClick={addCustomFacility}
              variant="outline"
              size="sm"
              className="flex items-center"
            >
              <span className="mr-1">+</span> 커스텀 시설 추가
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.facilities.map((facility, index) => (
            <div key={index} className="p-4 border-2 border-gray-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={facility.enabled}
                    onChange={() => toggleFacility(index)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
                  />
                  {facility.name ? (
                    <span className="text-sm font-medium text-gray-900">{facility.name}</span>
                  ) : (
                    <input
                      type="text"
                      value={facility.name}
                      onChange={(e) => updateFacilityName(index, e.target.value)}
                      placeholder="시설명 입력"
                      className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                    />
                  )}
                </label>
                {index >= FACILITY_TEMPLATES.length && (
                  <button
                    onClick={() => removeCustomFacility(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    삭제
                  </button>
                )}
              </div>

              {facility.enabled && (
                <div className="ml-8 space-y-2 bg-gray-50 p-3 rounded-lg">
                  {/* 샤워실 */}
                  {facility.name === '샤워실' && (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 mb-2">💡 샤워실은 남/여 분리가 기본입니다</p>
                      <div className="grid md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">남자 샤워기</label>
                          <input
                            type="number"
                            value={facility.details?.count || 0}
                            onChange={(e) => updateFacilityDetail(index, 'count', parseInt(e.target.value))}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="10"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">여자 샤워기</label>
                          <input
                            type="number"
                            value={(() => {
                              try {
                                const parsed = JSON.parse(facility.details?.description || '{}');
                                return parsed.femaleCount || 0;
                              } catch {
                                return 0;
                              }
                            })()}
                            onChange={(e) => {
                              try {
                                const parsed = JSON.parse(facility.details?.description || '{}');
                                parsed.femaleCount = parseInt(e.target.value);
                                updateFacilityDetail(index, 'description', JSON.stringify(parsed));
                              } catch {
                                updateFacilityDetail(index, 'description', JSON.stringify({ femaleCount: parseInt(e.target.value) }));
                              }
                            }}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="10"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">가족 샤워실</label>
                          <input
                            type="number"
                            value={(() => {
                              try {
                                const parsed = JSON.parse(facility.details?.description || '{}');
                                return parsed.familyCount || 0;
                              } catch {
                                return 0;
                              }
                            })()}
                            onChange={(e) => {
                              try {
                                const parsed = JSON.parse(facility.details?.description || '{}');
                                parsed.familyCount = parseInt(e.target.value);
                                updateFacilityDetail(index, 'description', JSON.stringify(parsed));
                              } catch {
                                updateFacilityDetail(index, 'description', JSON.stringify({ familyCount: parseInt(e.target.value) }));
                              }
                            }}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="2"
                            min="0"
                          />
                          <p className="text-xs text-gray-400 mt-1">부모-자녀 전용</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 락커룸 */}
                  {facility.name === '락커룸' && (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 mb-2">💡 락커룸은 남/여 분리가 기본입니다</p>
                      <div className="grid md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">남자 락커</label>
                          <input
                            type="number"
                            value={facility.details?.count || 0}
                            onChange={(e) => updateFacilityDetail(index, 'count', parseInt(e.target.value))}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="80"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">여자 락커</label>
                          <input
                            type="number"
                            value={(() => {
                              try {
                                const parsed = JSON.parse(facility.details?.description || '{}');
                                return parsed.femaleCount || 0;
                              } catch {
                                return 0;
                              }
                            })()}
                            onChange={(e) => {
                              try {
                                const parsed = JSON.parse(facility.details?.description || '{}');
                                parsed.femaleCount = parseInt(e.target.value);
                                updateFacilityDetail(index, 'description', JSON.stringify(parsed));
                              } catch {
                                updateFacilityDetail(index, 'description', JSON.stringify({ femaleCount: parseInt(e.target.value) }));
                              }
                            }}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="70"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">가족 락커룸</label>
                          <input
                            type="number"
                            value={(() => {
                              try {
                                const parsed = JSON.parse(facility.details?.description || '{}');
                                return parsed.familyCount || 0;
                              } catch {
                                return 0;
                              }
                            })()}
                            onChange={(e) => {
                              try {
                                const parsed = JSON.parse(facility.details?.description || '{}');
                                parsed.familyCount = parseInt(e.target.value);
                                updateFacilityDetail(index, 'description', JSON.stringify(parsed));
                              } catch {
                                updateFacilityDetail(index, 'description', JSON.stringify({ familyCount: parseInt(e.target.value) }));
                              }
                            }}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="5"
                            min="0"
                          />
                          <p className="text-xs text-gray-400 mt-1">부모-자녀 전용</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 사우나 */}
                  {facility.name === '사우나' && (
                    <div className="space-y-3">
                      <p className="text-xs text-gray-500 mb-2">💡 사우나 유형과 수용 인원을 입력해주세요</p>
                      
                      {/* 남자 사우나 */}
                      <div className="border-l-4 border-blue-400 pl-3">
                        <p className="text-sm font-semibold text-gray-700 mb-2">👨 남자 사우나</p>
                        <div className="grid md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">건식 사우나 (명)</label>
                            <input
                              type="number"
                              value={facility.details?.count || 0}
                              onChange={(e) => updateFacilityDetail(index, 'count', parseInt(e.target.value))}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              placeholder="10"
                              min="0"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">습식 사우나 (명)</label>
                            <input
                              type="number"
                              value={(() => {
                                try {
                                  const parsed = JSON.parse(facility.details?.description || '{}');
                                  return parsed.maleWet || 0;
                                } catch {
                                  return 0;
                                }
                              })()}
                              onChange={(e) => {
                                try {
                                  const parsed = JSON.parse(facility.details?.description || '{}');
                                  parsed.maleWet = parseInt(e.target.value);
                                  updateFacilityDetail(index, 'description', JSON.stringify(parsed));
                                } catch {
                                  updateFacilityDetail(index, 'description', JSON.stringify({ maleWet: parseInt(e.target.value) }));
                                }
                              }}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              placeholder="8"
                              min="0"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 여자 사우나 */}
                      <div className="border-l-4 border-pink-400 pl-3">
                        <p className="text-sm font-semibold text-gray-700 mb-2">👩 여자 사우나</p>
                        <div className="grid md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">건식 사우나 (명)</label>
                            <input
                              type="number"
                              value={(() => {
                                try {
                                  const parsed = JSON.parse(facility.details?.description || '{}');
                                  return parsed.femaleDry || 0;
                                } catch {
                                  return 0;
                                }
                              })()}
                              onChange={(e) => {
                                try {
                                  const parsed = JSON.parse(facility.details?.description || '{}');
                                  parsed.femaleDry = parseInt(e.target.value);
                                  updateFacilityDetail(index, 'description', JSON.stringify(parsed));
                                } catch {
                                  updateFacilityDetail(index, 'description', JSON.stringify({ femaleDry: parseInt(e.target.value) }));
                                }
                              }}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              placeholder="10"
                              min="0"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">습식 사우나 (명)</label>
                            <input
                              type="number"
                              value={(() => {
                                try {
                                  const parsed = JSON.parse(facility.details?.description || '{}');
                                  return parsed.femaleWet || 0;
                                } catch {
                                  return 0;
                                }
                              })()}
                              onChange={(e) => {
                                try {
                                  const parsed = JSON.parse(facility.details?.description || '{}');
                                  parsed.femaleWet = parseInt(e.target.value);
                                  updateFacilityDetail(index, 'description', JSON.stringify(parsed));
                                } catch {
                                  updateFacilityDetail(index, 'description', JSON.stringify({ femaleWet: parseInt(e.target.value) }));
                                }
                              }}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              placeholder="8"
                              min="0"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 추가 메모 */}
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">추가 설명 (선택)</label>
                        <input
                          type="text"
                          value={(() => {
                            try {
                              const parsed = JSON.parse(facility.details?.description || '{}');
                              return parsed.notes || '';
                            } catch {
                              return facility.details?.description || '';
                            }
                          })()}
                          onChange={(e) => {
                            try {
                              const parsed = JSON.parse(facility.details?.description || '{}');
                              parsed.notes = e.target.value;
                              updateFacilityDetail(index, 'description', JSON.stringify(parsed));
                            } catch {
                              updateFacilityDetail(index, 'description', JSON.stringify({ notes: e.target.value }));
                            }
                          }}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="예: 온도 조절 가능, 아로마 테라피 제공 등"
                        />
                      </div>
                    </div>
                  )}

                  {/* 탈수기 */}
                  {facility.name === '탈수기' && (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 mb-2">💡 탈수기는 남/여 구분이 기본입니다</p>
                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">남자 탈수기</label>
                          <input
                            type="number"
                            value={facility.details?.count || 0}
                            onChange={(e) => updateFacilityDetail(index, 'count', parseInt(e.target.value))}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="3"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">여자 탈수기</label>
                          <input
                            type="number"
                            value={(() => {
                              try {
                                const parsed = JSON.parse(facility.details?.description || '{}');
                                return parsed.femaleCount || 0;
                              } catch {
                                return 0;
                              }
                            })()}
                            onChange={(e) => {
                              try {
                                const parsed = JSON.parse(facility.details?.description || '{}');
                                parsed.femaleCount = parseInt(e.target.value);
                                updateFacilityDetail(index, 'description', JSON.stringify(parsed));
                              } catch {
                                updateFacilityDetail(index, 'description', JSON.stringify({ femaleCount: parseInt(e.target.value) }));
                              }
                            }}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="2"
                            min="0"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PT룸 */}
                  {facility.name === 'PT룸' && (
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">PT룸 개수</label>
                        <input
                          type="number"
                          value={facility.details?.count || 0}
                          onChange={(e) => updateFacilityDetail(index, 'count', parseInt(e.target.value))}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="2"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">상세 설명</label>
                        <input
                          type="text"
                          value={facility.details?.description || ''}
                          onChange={(e) => updateFacilityDetail(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="예: 개인 PT 진행 가능"
                        />
                      </div>
                    </div>
                  )}

                  {/* CCTV */}
                  {facility.name === 'CCTV' && (
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">CCTV 대수</label>
                        <input
                          type="number"
                          value={facility.details?.count || 0}
                          onChange={(e) => updateFacilityDetail(index, 'count', parseInt(e.target.value))}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="10"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">설치 위치</label>
                        <input
                          type="text"
                          value={facility.details?.description || ''}
                          onChange={(e) => updateFacilityDetail(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="예: 수영장, 락커룸, 입구 등"
                        />
                      </div>
                    </div>
                  )}

                  {/* AED */}
                  {facility.name === '자동 제세동기(AED)' && (
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">AED 개수</label>
                      <input
                        type="number"
                        value={facility.details?.count || 0}
                        onChange={(e) => updateFacilityDetail(index, 'count', parseInt(e.target.value))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="2"
                      />
                    </div>
                  )}

                  {/* 황토방 */}
                  {facility.name === '황토방' && (
                    <div className="space-y-2">
                      <div className="mb-2">
                        <label className="block text-xs text-gray-600 mb-1">유형</label>
                        <select
                          value={facility.details?.type || '남/여 분리'}
                          onChange={(e) => updateFacilityDetail(index, 'type', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                          <option value="남/여 분리">남/여 분리</option>
                          <option value="공용">공용</option>
                        </select>
                      </div>
                      
                      {facility.details?.type === '공용' ? (
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">황토방 (명)</label>
                          <input
                            type="number"
                            value={facility.details?.count || 0}
                            onChange={(e) => updateFacilityDetail(index, 'count', parseInt(e.target.value))}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="16"
                            min="0"
                          />
                          <p className="text-xs text-gray-400 mt-1">총 수용 인원</p>
                        </div>
                      ) : (
                        <div className="grid md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">남자 황토방 (명)</label>
                            <input
                              type="number"
                              value={facility.details?.count || 0}
                              onChange={(e) => updateFacilityDetail(index, 'count', parseInt(e.target.value))}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              placeholder="8"
                              min="0"
                            />
                            <p className="text-xs text-gray-400 mt-1">수용 인원</p>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">여자 황토방 (명)</label>
                            <input
                              type="number"
                              value={(() => {
                                try {
                                  const parsed = JSON.parse(facility.details?.description || '{}');
                                  return parsed.femaleCount || 0;
                                } catch {
                                  return 0;
                                }
                              })()}
                              onChange={(e) => {
                                try {
                                  const parsed = JSON.parse(facility.details?.description || '{}');
                                  parsed.femaleCount = parseInt(e.target.value);
                                  updateFacilityDetail(index, 'description', JSON.stringify(parsed));
                                } catch {
                                  updateFacilityDetail(index, 'description', JSON.stringify({ femaleCount: parseInt(e.target.value) }));
                                }
                              }}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              placeholder="8"
                              min="0"
                            />
                            <p className="text-xs text-gray-400 mt-1">수용 인원</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 체온조절실 */}
                  {facility.name === '체온조절실' && (
                    <div className="space-y-2">
                      <div className="mb-2">
                        <label className="block text-xs text-gray-600 mb-1">유형</label>
                        <select
                          value={facility.details?.type || '남/여 분리'}
                          onChange={(e) => updateFacilityDetail(index, 'type', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                          <option value="남/여 분리">남/여 분리</option>
                          <option value="공용">공용</option>
                        </select>
                      </div>
                      
                      {facility.details?.type === '공용' ? (
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">체온조절실 (명)</label>
                          <input
                            type="number"
                            value={facility.details?.count || 0}
                            onChange={(e) => updateFacilityDetail(index, 'count', parseInt(e.target.value))}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="20"
                            min="0"
                          />
                          <p className="text-xs text-gray-400 mt-1">총 수용 인원</p>
                        </div>
                      ) : (
                        <div className="grid md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">남자 체온조절실 (명)</label>
                            <input
                              type="number"
                              value={facility.details?.count || 0}
                              onChange={(e) => updateFacilityDetail(index, 'count', parseInt(e.target.value))}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              placeholder="10"
                              min="0"
                            />
                            <p className="text-xs text-gray-400 mt-1">수용 인원</p>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">여자 체온조절실 (명)</label>
                            <input
                              type="number"
                              value={(() => {
                                try {
                                  const parsed = JSON.parse(facility.details?.description || '{}');
                                  return parsed.femaleCount || 0;
                                } catch {
                                  return 0;
                                }
                              })()}
                              onChange={(e) => {
                                try {
                                  const parsed = JSON.parse(facility.details?.description || '{}');
                                  parsed.femaleCount = parseInt(e.target.value);
                                  updateFacilityDetail(index, 'description', JSON.stringify(parsed));
                                } catch {
                                  updateFacilityDetail(index, 'description', JSON.stringify({ femaleCount: parseInt(e.target.value) }));
                                }
                              }}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              placeholder="10"
                              min="0"
                            />
                            <p className="text-xs text-gray-400 mt-1">수용 인원</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 체온유지탕(월풀) */}
                  {facility.name === '체온유지탕(월풀)' && (
                    <div className="space-y-2">
                      <div className="mb-2">
                        <label className="block text-xs text-gray-600 mb-1">유형</label>
                        <select
                          value={facility.details?.type || '남/여 분리'}
                          onChange={(e) => updateFacilityDetail(index, 'type', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                          <option value="남/여 분리">남/여 분리</option>
                          <option value="공용">공용</option>
                        </select>
                      </div>
                      
                      {facility.details?.type === '공용' ? (
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">체온유지탕 (명)</label>
                          <input
                            type="number"
                            value={facility.details?.count || 0}
                            onChange={(e) => updateFacilityDetail(index, 'count', parseInt(e.target.value))}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="12"
                            min="0"
                          />
                          <p className="text-xs text-gray-400 mt-1">총 수용 인원</p>
                        </div>
                      ) : (
                        <div className="grid md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">남자 체온유지탕 (명)</label>
                            <input
                              type="number"
                              value={facility.details?.count || 0}
                              onChange={(e) => updateFacilityDetail(index, 'count', parseInt(e.target.value))}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              placeholder="6"
                              min="0"
                            />
                            <p className="text-xs text-gray-400 mt-1">수용 인원</p>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">여자 체온유지탕 (명)</label>
                            <input
                              type="number"
                              value={(() => {
                                try {
                                  const parsed = JSON.parse(facility.details?.description || '{}');
                                  return parsed.femaleCount || 0;
                                } catch {
                                  return 0;
                                }
                              })()}
                              onChange={(e) => {
                                try {
                                  const parsed = JSON.parse(facility.details?.description || '{}');
                                  parsed.femaleCount = parseInt(e.target.value);
                                  updateFacilityDetail(index, 'description', JSON.stringify(parsed));
                                } catch {
                                  updateFacilityDetail(index, 'description', JSON.stringify({ femaleCount: parseInt(e.target.value) }));
                                }
                              }}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                              placeholder="6"
                              min="0"
                            />
                            <p className="text-xs text-gray-400 mt-1">수용 인원</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 기타 시설 - 일반 상세 설명 */}
                  {!['샤워실', '락커룸', '사우나', '탈수기', 'PT룸', 'CCTV', '자동 제세동기(AED)', '황토방', '체온조절실', '체온유지탕(월풀)'].includes(facility.name) && facility.name && (
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">상세 설명</label>
                      <input
                        type="text"
                        value={facility.details?.description || ''}
                        onChange={(e) => updateFacilityDetail(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="시설에 대한 상세 설명을 입력하세요"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            운영 시간
          </CardTitle>
          <CardDescription>센터의 운영 시간을 설정해주세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">평일 (월-금)</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  오픈 시간
                </label>
                <input
                  type="time"
                  value={formData.weekdaysOpen}
                  onChange={(e) => updateFormData('weekdaysOpen', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  마감 시간
                </label>
                <input
                  type="time"
                  value={formData.weekdaysClose}
                  onChange={(e) => updateFormData('weekdaysClose', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-3">주말 (토-일)</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  오픈 시간
                </label>
                <input
                  type="time"
                  value={formData.weekendsOpen}
                  onChange={(e) => updateFormData('weekendsOpen', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  마감 시간
                </label>
                <input
                  type="time"
                  value={formData.weekendsClose}
                  onChange={(e) => updateFormData('weekendsClose', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Car className="h-5 w-5 mr-2" />
            주차 시설
          </CardTitle>
          <CardDescription>주차 시설 정보를 입력해주세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.parkingAvailable}
              onChange={(e) => updateFormData('parkingAvailable', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">주차 가능</span>
          </label>

          {formData.parkingAvailable && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                주차 가능 대수
              </label>
              <input
                type="number"
                value={formData.parkingSpaces}
                onChange={(e) => updateFormData('parkingSpaces', parseInt(e.target.value))}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            신청 내용 확인
          </CardTitle>
          <CardDescription>입력하신 정보를 확인해주세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 센터 기본 정보 */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 pb-2 border-b">센터 기본 정보</h4>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">센터명</dt>
                <dd className="text-sm font-medium text-gray-900">{formData.centerName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">사업자번호</dt>
                <dd className="text-sm font-medium text-gray-900">{formData.businessNumber}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">대표자</dt>
                <dd className="text-sm font-medium text-gray-900">{formData.representativeName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">이메일</dt>
                <dd className="text-sm font-medium text-gray-900">{formData.representativeEmail}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">연락처</dt>
                <dd className="text-sm font-medium text-gray-900">{formData.representativePhone}</dd>
              </div>
            </dl>
          </div>

          {/* 센터 위치 */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 pb-2 border-b">센터 위치</h4>
            <p className="text-sm text-gray-900">
              {formData.province} {formData.city} {formData.address1} {formData.address2}
              {formData.postalCode && ` (${formData.postalCode})`}
            </p>
          </div>

          {/* 수영장 정보 */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 pb-2 border-b">수영장 정보</h4>
            <div className="space-y-3">
              {formData.pools.map((pool, idx) => (
                <div key={pool.id} className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    {pool.type === 'main' ? '🏊 메인 수영장' : '🧒 보조 수영장'} #{idx + 1}
                  </p>
                  <p className="text-sm text-gray-700">
                    {pool.length}m × {pool.width}m × {pool.depth}m
                    {pool.laneCount && ` | ${pool.laneCount}개 레인`}
                  </p>
                  {pool.description && (
                    <p className="text-xs text-gray-600 mt-1">{pool.description}</p>
                  )}
                </div>
              ))}
              <div className="pt-2 border-t">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">최대 수용 인원</dt>
                  <dd className="text-sm font-medium text-gray-900">{formData.capacity}명</dd>
                </div>
              </div>
            </div>
          </div>

          {/* 보유 시설 */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 pb-2 border-b">보유 시설</h4>
            <div className="flex flex-wrap gap-2">
              {formData.facilities.filter(f => f.enabled).map((facility, idx) => (
                <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {facility.name}
                </span>
              ))}
              {formData.facilities.filter(f => f.enabled).length === 0 && (
                <span className="text-sm text-gray-500">선택된 시설 없음</span>
              )}
            </div>
          </div>

          {/* 운영 정보 */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 pb-2 border-b">운영 정보</h4>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">평일 운영시간</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {formData.weekdaysOpen} - {formData.weekdaysClose}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">주말 운영시간</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {formData.weekendsOpen} - {formData.weekendsClose}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">주차</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {formData.parkingAvailable 
                    ? `가능 (${formData.parkingSpaces}대)` 
                    : '불가능'}
                </dd>
              </div>
            </dl>
          </div>
        </CardContent>
      </Card>

      {/* 약관 동의 확인 */}
      <Card>
        <CardHeader>
          <CardTitle>✅ 약관 동의 완료</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <ul className="text-sm text-green-800 space-y-1">
              <li>• 서비스 이용약관 동의 완료</li>
              <li>• 개인정보 처리방침 동의 완료</li>
              <li>• 민감정보(건강정보) 수집·이용 동의 완료</li>
              {marketingAgreed && <li>• 마케팅 정보 수신 동의 완료</li>}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            🏢 센터 등록 신청
          </h1>
          <p className="text-gray-600">
            JJ Swim Lab과 함께 스마트한 수영 교육을 시작하세요
          </p>
        </div>

        {/* 진행 단계 표시 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((s) => (
              <React.Fragment key={s}>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    step >= s 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {s}
                  </div>
                  <span className="text-xs mt-2 text-gray-600">
                    {s === 1 && '기본정보'}
                    {s === 2 && '센터위치'}
                    {s === 3 && '시설정보'}
                    {s === 4 && '확인'}
                  </span>
                </div>
                {s < 4 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    step > s ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* 폼 내용 */}
        <div className="mb-8">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep5()}
        </div>

        {/* 네비게이션 버튼 */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => step > 1 ? setStep(step - 1) : router.push('/')}
            disabled={loading}
          >
            {step === 1 ? '취소' : '이전'}
          </Button>

          <div className="flex space-x-3">
            {step < 4 ? (
              <Button
                onClick={() => {
                  // Step 1에서 필수 약관 동의 확인
                  if (step === 1 && (!termsAgreed || !privacyAgreed || !sensitiveInfoAgreed)) {
                    alert('필수 약관에 모두 동의해주세요.');
                    return;
                  }
                  // Step 1에서 이메일 인증 확인
                  if (step === 1 && !emailVerified) {
                    alert('이메일 인증을 완료해주세요.');
                    return;
                  }
                  setStep(step + 1);
                }}
                disabled={loading}
              >
                다음
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? '신청 중...' : '등록 신청'}
              </Button>
            )}
          </div>
        </div>

        {/* 안내 메시지 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">📌 안내사항</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 신청 후 관리자 승인까지 1-2 영업일 소요됩니다.</li>
            <li>• 승인 완료 시 등록하신 이메일로 안내 메일이 발송됩니다.</li>
            <li>• 추가 문의사항은 support@jjswimlab.com으로 연락주세요.</li>
          </ul>
        </div>
      </div>

      {/* 약관 팝업 */}
      {showTermsPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">
                {currentTermsType === 'terms' && '서비스 이용약관'}
                {currentTermsType === 'privacy' && '개인정보 처리방침'}
                {currentTermsType === 'sensitive' && '민감정보(건강정보) 수집·이용 동의'}
                {currentTermsType === 'marketing' && '마케팅 정보 수신 동의'}
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="prose prose-sm max-w-none">
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
                    
                    <h4 className="font-bold text-base">제4조의2 (서비스 가용성, 점검 및 중단)</h4>
                    <ol className="list-decimal ml-5 space-y-1">
                      <li><strong>가용성 목표(SLO)</strong>: 회사는 서비스의 월간 가용성을 <strong>99.5%</strong>로 목표합니다 (법적 보증 아님).</li>
                      <li><strong>가용성 산정</strong>:
                        <ul className="list-disc ml-5 mt-1">
                          <li>&quot;가용성&quot;은 (총 분 단위 운영 시간 − 다운타임) / 총 운영 시간 × 100%로 산정합니다</li>
                          <li>&quot;다운타임&quot;은 1분 이상 연속하여 핵심 기능(로그인, 프로그램 생성, 3D 뷰어, 결제/인증 등)의 전면 불능이 발생한 시간을 의미합니다</li>
                          <li>다음은 다운타임에서 제외됩니다: ① 사전 공지된 정기 점검 (24시간 전 공지, 월 누적 6시간 이내) ② 긴급 보안 패치(제로데이 등 즉시 조치 필요 시, 사후 공지) ③ 천재지변/전쟁/정부 규제/전력·통신사 장애/클라우드 사업자 장애/제3자 서비스 장애 ④ 회원의 귀책사유, 회원 시스템·네트워크 문제, 허용되지 않은 사용, 약관 위반</li>
                        </ul>
                      </li>
                      <li><strong>점검 및 공지</strong>:
                        <ul className="list-disc ml-5 mt-1">
                          <li>정기 점검은 사전에 공지하며, 공지 채널은 상태페이지/앱 공지/이메일/푸시 중 1개 이상을 사용합니다</li>
                          <li>긴급 조치 시 선(先)조치·후(後)공지가 가능하며, 사후 48시간 이내에 요약 보고(영향/원인/완화/재발방지)를 제공합니다</li>
                        </ul>
                      </li>
                      <li><strong>보상(서비스 크레딧, 유료 플랜 한정)</strong>:
                        <ul className="list-disc ml-5 mt-1">
                          <li>월 가용성 &lt; 99.0% → 차월 요금의 10% 크레딧</li>
                          <li>월 가용성 &lt; 98.0% → 차월 요금의 25% 크레딧</li>
                          <li>크레딧은 환불이 아닌 차월 요금 차감으로 제공하며, 발생월 종료 후 30일 이내 신청해야 합니다</li>
                          <li>무료/체험/프로모션 플랜은 대상에서 제외됩니다</li>
                        </ul>
                      </li>
                      <li><strong>데이터 보호 목표</strong>: 회사는 RPO(복구 시점 목표: 24시간 이내) 및 RTO(복구 시간 목표: 주요 기능 4시간 내)를 목표로 하며, 정기 백업과 접근통제를 운영합니다 (비약정 목표).</li>
                      <li><strong>책임 제한</strong>: 본 조에 따른 크레딧 외 손해배상은 약관의 책임 제한 조항(제12조)을 따릅니다.</li>
                    </ol>
                    
                    <h4 className="font-bold text-base">제5조 (회원 가입 및 승인)</h4>
                    <ol className="list-decimal ml-5 space-y-1">
                      <li>센터 등록은 신청인이 온라인으로 필요한 정보를 기입하고 본 약관에 동의함으로써 이루어집니다.</li>
                      <li>회사는 신청 내용을 검토한 후 승인 여부를 결정합니다.</li>
                      <li>다음 각 호에 해당하는 경우 회사는 승인을 거부하거나 유보할 수 있습니다:
                        <ul className="list-disc ml-5 mt-1">
                          <li>허위 정보를 기재한 경우</li>
                          <li>사업자등록번호가 유효하지 않은 경우</li>
                          <li>기타 회사가 정한 승인 기준을 충족하지 못한 경우</li>
                        </ul>
                      </li>
                    </ol>
                    
                    <h4 className="font-bold text-base">제6조 (센터 회원의 의무)</h4>
                    <ol className="list-decimal ml-5 space-y-1">
                      <li>센터 회원은 관련 법령, 본 약관, 서비스 이용안내 및 공지사항 등을 준수해야 합니다.</li>
                      <li>센터 회원은 계정 정보를 최신으로 유지하고 정확한 정보를 제공해야 합니다.</li>
                      <li>센터 회원은 계정 정보를 제3자에게 양도하거나 대여할 수 없습니다.</li>
                    </ol>
                    
                    <h4 className="font-bold text-base">제7조 (개인정보보호)</h4>
                    <p>회사는 관련 법령이 정하는 바에 따라 센터 회원의 개인정보를 보호하기 위해 노력합니다. 개인정보의 보호 및 이용에 대해서는 별도의 개인정보 처리방침을 적용합니다.</p>
                    
                    <h4 className="font-bold text-base">제5조의2 (계정 및 보안)</h4>
                    <ol className="list-decimal ml-5 space-y-1">
                      <li>센터 회원은 관리자 계정에 대해 2단계 인증(2FA)을 설정할 수 있습니다.</li>
                      <li>센터 회원은 계정 정보를 제3자에게 양도, 대여, 공유할 수 없으며, 계정 오남용 방지 및 접근권한 통제의무를 부담합니다.</li>
                      <li>계정 정보 유출로 인한 피해는 회원이 관리 소홀 책임을 지며, 회사는 고의·중과실이 없는 한 책임을 지지 않습니다.</li>
                    </ol>
                    
                    <h4 className="font-bold text-base">제8조 (요금, 정기결제 및 가격 변경)</h4>
                    <ol className="list-decimal ml-5 space-y-1">
                      <li><strong>일반 회원(B2C) - 정기결제</strong>:
                        <ul className="list-disc ml-5 mt-1">
                          <li>요금: 월 30,000원 또는 연 300,000원(10개월 요금)</li>
                          <li>자동갱신: 매 결제일에 자동 갱신되며, 결제 7일 전 갱신 예정 금액과 해지 방법을 이메일로 고지합니다</li>
                          <li>해지: 언제든 가능하며, 다음 결제일부터 효력 발생</li>
                          <li>부분월 환불: 중도 해지 시 이용일수 계산 후 잔액 환불</li>
                        </ul>
                      </li>
                      <li><strong>B2C 정기결제 가격 인상 및 사전 동의</strong>:
                        <ul className="list-disc ml-5 mt-1">
                          <li>회사가 정기결제 금액을 인상하거나 무료 서비스를 유료 정기결제로 전환하는 경우, 변경일 30일 전부터 변경 일시, 변동 전후 가격, 결제방법, 해지 방법을 회원에게 알리고 사전 동의를 받습니다</li>
                          <li>사전 동의는 이메일, 앱 푸시, SMS 및 앱 내 팝업을 통해 확보하며, 동의 일시 및 채널 로그를 2년간 보관합니다</li>
                          <li>동의하지 않은 회원에게는 인상 또는 전환을 적용하지 않으며, 해당 정기결제는 변경일 이후 자동 해지됩니다</li>
                          <li>원클릭 해지 링크를 제공하여 회원이 간편하게 해지할 수 있도록 합니다</li>
                        </ul>
                      </li>
                      <li><strong>센터 회원(B2B) - 요금표 및 변경</strong>:
                        <ul className="list-disc ml-5 mt-1">
                          <li>요금제: Starter / Grow / Pro (별도 요금표 부속서 참조)</li>
                          <li>과금 기준: ALM(월간 활성 연결 회원)</li>
                          <li>리베이트 상쇄: Starter 40% / Grow 50% / Pro 60% CAP</li>
                          <li>약정 할인: 약정 기간 중도 해지 시 할인액 반환</li>
                          <li>요금표 변경(ALM 티어, 리베이트, CAP 조정 등)은 적용일 30일 전 공지하며, 센터 회원은 변경 적용 전 위약금 없이 해지할 수 있습니다</li>
                          <li>연간 선불 계약 중도 해지 시 잔여기간 일할 계산하여 환급합니다</li>
                        </ul>
                      </li>
                      <li><strong>그랜드파더링 정책</strong>: 회사는 기존 구독자 보호를 위해 필요 시 일정 기간 기존 요금을 유지하는 그랜드파더링 정책을 운영할 수 있으며, 기간 및 대상은 별도로 고지합니다.</li>
                      <li>모든 요금은 부가가치세(VAT) 별도입니다.</li>
                      <li>연체 시 연 15% 이내의 지연손해금이 발생할 수 있으며, 30일 이상 미납 시 서비스 이용이 제한됩니다.</li>
                    </ol>
                    
                    <h4 className="font-bold text-base">제9조 (계약 해지 및 환불)</h4>
                    <ol className="list-decimal ml-5 space-y-1">
                      <li>일반 회원은 언제든 자동갱신을 해지할 수 있으며, 다음 결제일부터 효력이 발생합니다.</li>
                      <li>센터 회원은 약정기간 내 중도해지 시, 약정할인 반환 및 정산 규칙에 따릅니다.</li>
                      <li>전자상거래법상 청약철회 기준(7일 이내)을 따르며, 서비스 이용 개시 후에는 청약철회가 제한될 수 있습니다.</li>
                      <li>회사는 회원이 본 약관을 중대하게 위반한 경우 계약을 해지할 수 있습니다.</li>
                    </ol>
                    
                    <h4 className="font-bold text-base">제10조 (지적재산권)</h4>
                    <ol className="list-decimal ml-5 space-y-1">
                      <li>서비스 내 모든 콘텐츠(앱, 3D 에셋, 프로그램 등)의 저작권 및 지적재산권은 회사 또는 라이선서에 귀속됩니다.</li>
                      <li>센터가 업로드한 자료는 서비스 운영 및 홍보에 필요한 범위에서 비독점적 사용허락을 받으며, 탈퇴 시에도 백업 및 법정 보관사유 범위 내 유지됩니다.</li>
                    </ol>
                    
                    <h4 className="font-bold text-base">제11조 (금지행위)</h4>
                    <p>다음 각 호의 행위를 금지합니다:</p>
                    <ul className="list-disc ml-5 space-y-1">
                      <li>무단 크롤링, 리버스엔지니어링, 복제 또는 변조</li>
                      <li>타인의 건강정보 무단 입력 또는 유출</li>
                      <li>불법 스팸 발송 또는 광고성 정보 무단 전송</li>
                      <li>서비스 운영 방해 또는 시스템 과부하 유발</li>
                    </ul>
                    
                    <h4 className="font-bold text-base">제12조 (손해배상 및 면책)</h4>
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
                      <li><strong>중대한 과실의 경우</strong>: 회사의 고의 또는 중과실로 인한 손해(개인정보 유출, 고의적 서비스 중단 등)는 위 한도를 초과하여 배상할 수 있으며, 민법 및 개인정보보호법 등 관련 법령에 따릅니다.</li>
                      <li><strong>입증 책임</strong>: 손해배상을 청구하는 회원은 회사의 귀책사유, 손해의 발생 및 금액, 인과관계를 입증해야 합니다.</li>
                      <li><strong>분쟁 해결 우선</strong>: 손해배상 청구 전 회사와 협의를 통한 해결을 우선으로 하며, 협의가 이루어지지 않을 경우 법적 절차를 진행할 수 있습니다.</li>
                    </ol>
                    
                    <h4 className="font-bold text-base">제13조 (분쟁 해결 및 관할)</h4>
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
                      <li>센터 정보: 센터명, 사업자등록번호, 주소, 시설 정보</li>
                      <li>대표자 정보: 성명, 전화번호</li>
                      <li>이용 내역: 접속 로그, 서비스 이용 기록</li>
                      <li>결제 정보: 결제 토큰, 영수증 정보</li>
                    </ul>
                    <p><strong>선택 항목:</strong></p>
                    <ul className="list-disc ml-5 space-y-1">
                      <li>마케팅 수신 동의 여부</li>
                    </ul>
                    <p className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
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
                    
                    <h4 className="font-bold text-base">6. 개인정보의 제3자 제공</h4>
                    <p>회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다:</p>
                    <ul className="list-disc ml-5 space-y-1">
                      <li>이용자가 사전에 동의한 경우</li>
                      <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
                    </ul>
                    
                    <h4 className="font-bold text-base">7. 개인정보의 파기 절차 및 방법</h4>
                    <p>회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.</p>
                    <ul className="list-disc ml-5 space-y-1">
                      <li>파기 방법: 전자적 파일 형태 - 복구 불가능한 방법으로 영구 삭제</li>
                      <li>종이 문서 - 분쇄 또는 소각</li>
                    </ul>
                    
                    <h4 className="font-bold text-base">8. 이용자의 권리</h4>
                    <p>이용자는 다음의 권리를 행사할 수 있습니다:</p>
                    <ul className="list-disc ml-5 space-y-1">
                      <li>개인정보 열람, 정정, 삭제 요구</li>
                      <li>개인정보 처리 정지 요구</li>
                      <li>동의 철회 (회원 탈퇴)</li>
                      <li>행사 방법: 앱 내 설정 메뉴 또는 privacy@jjswimlab.com으로 요청</li>
                      <li>답변 기한: 접수 후 10일 이내</li>
                    </ul>
                    
                    <h4 className="font-bold text-base">9. 만 14세 미만 아동의 개인정보</h4>
                    <p>만 14세 미만 아동의 개인정보는 법정대리인의 동의를 받아 처리합니다. 학교 또는 학원과의 계약으로 수집하는 경우, 해당 기관이 법정대리인 동의를 확보한 것으로 간주합니다.</p>
                    
                    <h4 className="font-bold text-base">10. 쿠키 및 자동 수집 장치</h4>
                    <p>회사는 서비스 개선을 위해 쿠키 및 자동 수집 장치를 사용할 수 있습니다:</p>
                    <ul className="list-disc ml-5 space-y-1">
                      <li>쿠키 목적: 로그인 상태 유지, 사용자 설정 저장</li>
                      <li>거부 방법: 브라우저 설정에서 쿠키 차단 (일부 기능 제한 가능)</li>
                      <li>앱 푸시 토큰: 알림 설정에서 언제든 철회 가능</li>
                    </ul>
                    
                    <h4 className="font-bold text-base">11. 안전성 확보 조치</h4>
                    <ul className="list-disc ml-5 space-y-1">
                      <li>암호화: AES-256 (저장), TLS 1.2+ (전송)</li>
                      <li>접근 통제: 권한 분리, 2단계 인증(2FA)</li>
                      <li>접속 기록 보관: 최소 6개월</li>
                      <li>지도 집계: 지오해시 k-익명성(k≥10) 보장, 미달 시 블러 처리</li>
                      <li>정기 취약점 점검 및 보안 업데이트</li>
                    </ul>
                    
                    <h4 className="font-bold text-base">12. 개인정보보호책임자</h4>
                    <p>개인정보 처리에 관한 업무를 총괄하는 개인정보보호책임자:</p>
                    <ul className="list-disc ml-5 space-y-1">
                      <li>성명: 개인정보보호책임자</li>
                      <li>직책: DPO (Data Protection Officer)</li>
                      <li>이메일: privacy@jjswimlab.com</li>
                      <li>전화: 02-1234-5678</li>
                    </ul>
                    
                    <h4 className="font-bold text-base">13. 개인정보 침해 대응</h4>
                    <p>개인정보 유출 사고 발생 시 회사는 지체 없이 해당 이용자에게 통지하고, 개인정보보호위원회(PIPC) 및 한국인터넷진흥원(KISA)에 신고합니다. 재발 방지 대책을 수립하여 공개합니다.</p>
                    
                    <p className="text-xs text-gray-500 mt-6">
                      <strong>시행일:</strong> 2025년 10월 15일<br/>
                      <strong>버전:</strong> v1.1
                    </p>
                  </div>
                )}

                {currentTermsType === 'sensitive' && (
                  <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
                    <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
                      <p className="font-semibold text-orange-900">⚠️ 민감정보 수집·이용 동의 (PIPA 제23조)</p>
                      <p className="text-xs text-orange-700 mt-1">건강정보는 개인정보 보호법상 민감정보로 별도 동의가 필요합니다.</p>
                    </div>
                    
                    <h4 className="font-bold text-base">1. 수집하는 민감정보 항목</h4>
                    <ul className="list-disc ml-5 space-y-1">
                      <li>건강 정보: 질환, 특수상황, 통증 수준, RPE(운동자각도)</li>
                      <li>수영 기록: CSS(임계 수영 속도), 영법별 기록</li>
                      <li>훈련 이력: 세트별 운동 강도, 컨디션 변화</li>
                    </ul>
                    
                    <h4 className="font-bold text-base">2. 처리 목적</h4>
                    <ul className="list-disc ml-5 space-y-1">
                      <li>AI 기반 맞춤형 수영 프로그램 생성</li>
                      <li>위험 제어: 질환에 따른 영법 제한, 휴식 시간 보정</li>
                      <li>진도 추적 및 성과 분석</li>
                      <li>강사의 개별 지도 지원</li>
                    </ul>
                    
                    <h4 className="font-bold text-base">3. 보유 및 이용 기간</h4>
                    <p>회원 탈퇴 또는 1년 미이용 시 지체없이 파기합니다. 단, 다음의 경우 예외:</p>
                    <ul className="list-disc ml-5 space-y-1">
                      <li>법령에 따른 보관 의무 (의료법 등)</li>
                      <li>비식별화된 집계 통계 (개인 재식별 불가)</li>
                    </ul>
                    
                    <h4 className="font-bold text-base">4. 국외 이전 (해당 시)</h4>
                    <p>민감정보도 클라우드 호스팅을 위해 AWS 싱가포르로 이전되며, 암호화 전송(TLS)됩니다.</p>
                    
                    <h4 className="font-bold text-base">5. 동의 거부권 및 불이익</h4>
                    <p className="bg-yellow-50 p-3 rounded border border-yellow-200">
                      <strong>동의 거부 시:</strong> AI 맞춤형 프로그램 생성, 건강 기반 위험 제어 등 개인화 기능이 제한됩니다. 단, 기본적인 서비스 이용은 가능합니다.
                    </p>
                    
                    <p className="text-xs text-gray-500 mt-6">
                      <strong>근거:</strong> 개인정보 보호법 제23조 (민감정보 처리 제한)<br/>
                      <strong>시행일:</strong> 2025년 10월 15일<br/>
                      <strong>버전:</strong> v1.0
                    </p>
                  </div>
                )}

                {currentTermsType === 'marketing' && (
                  <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
                    <h4 className="font-bold text-base">마케팅 정보 수신 동의 (선택)</h4>
                    <p>회사는 다음과 같은 마케팅 정보를 제공합니다:</p>
                    <ul className="list-disc ml-5 space-y-1">
                      <li>신규 서비스 및 기능 안내</li>
                      <li>이벤트 및 프로모션 정보</li>
                      <li>서비스 업데이트 소식</li>
                      <li>교육 콘텐츠 및 뉴스레터</li>
                    </ul>
                    
                    <h4 className="font-bold text-base">수신 매체 및 표시</h4>
                    <ul className="list-disc ml-5 space-y-1">
                      <li>이메일: 발신자 표기, 수신거부 링크 포함</li>
                      <li>SMS/알림톡: [광고] 라벨 표기, 무료 수신거부 080 번호 제공</li>
                      <li>앱 푸시 알림: 설정에서 언제든 OFF 가능</li>
                      <li>야간 시간대(오후 9시~오전 8시) 발송 제한 준수</li>
                    </ul>
                    
                    <h4 className="font-bold text-base">철회 방법</h4>
                    <ul className="list-disc ml-5 space-y-1">
                      <li>앱 내 설정 &gt; 알림 설정 &gt; 마케팅 수신 OFF</li>
                      <li>이메일 하단 "수신거부" 링크 클릭</li>
                      <li>SMS 회신으로 "수신거부" 전송</li>
                      <li>고객센터 marketing@jjswimlab.com으로 요청</li>
                    </ul>
                    
                    <p className="text-sm bg-blue-50 p-3 rounded-lg border border-blue-200">
                      💡 마케팅 정보 수신 동의는 <strong>선택 사항</strong>이며, 동의하지 않아도 서비스 이용에 제한이 없습니다. 언제든지 수신 동의를 철회할 수 있습니다.
                    </p>
                    
                    <p className="text-xs text-gray-500 mt-6">
                      <strong>근거:</strong> 정보통신망법 제50조 (영리목적의 광고성 정보 전송 제한)<br/>
                      <strong>시행일:</strong> 2025년 10월 15일
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6 border-t flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowTermsPopup(false)}
              >
                닫기
              </Button>
              <Button
                onClick={agreeToTerms}
              >
                동의합니다
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
