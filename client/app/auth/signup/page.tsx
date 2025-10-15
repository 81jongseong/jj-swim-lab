'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Calendar,
  MapPin,
  Heart,
  Activity,
  AlertCircle,
  CheckCircle,
  Eye,
  Target,
  EyeOff
} from 'lucide-react';

export default function SignupPage() {
  const [formData, setFormData] = useState({
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
    latitude: null as number | null, // 🆕 위도
    longitude: null as number | null, // 🆕 경도
    
    // 계정 유형별 정보
    accountType: 'student',
    
    // 학생용 건강 정보
    height: '',
    weight: '',
    bloodType: '',
    medicalHistory: '',
    currentMedications: '',
    allergies: '',
    emergencyContact: '',
    emergencyPhone: '',
    
    // 학생용 운동 정보
    exerciseExperience: '',
    preferredSwimmingStyle: '',
    fitnessGoals: '',
    availableTime: '',
    
    // 강사용 자격증 정보
    certifications: '',
    teachingExperience: '',
    specialties: '',
    availableCenters: '',
    hourlyRate: '',
    introduction: '',
    
    // 약관 동의
    agreeTerms: false,
    agreePrivacy: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<any>({});

  const totalSteps = 5;

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

  // 🆕 주소 → 위도/경도 변환 (VWorld Geocoding API)
  const getCoordinatesFromAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      const key = process.env.NEXT_PUBLIC_VWORLD_KEY;
      if (!key) {
        console.warn('⚠️ VWorld API 키가 없습니다. 기본 좌표를 사용합니다.');
        return null;
      }

      const url = new URL('https://api.vworld.kr/req/address');
      url.searchParams.set('service', 'address');
      url.searchParams.set('request', 'getCoord');
      url.searchParams.set('version', '2.0');
      url.searchParams.set('crs', 'EPSG:4326');
      url.searchParams.set('type', 'ROAD');
      url.searchParams.set('format', 'json');
      url.searchParams.set('key', key);
      url.searchParams.set('address', address);

      const response = await fetch(url.toString());
      const data = await response.json();

      const point = data?.response?.result?.point;
      if (!point) {
        console.warn('⚠️ 주소에서 좌표를 찾을 수 없습니다:', address);
        return null;
      }

      return {
        lng: Number(point.x),
        lat: Number(point.y)
      };
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
        if (!formData.exerciseExperience) newErrors.exerciseExperience = '운동 경험을 선택해주세요';
        if (!formData.preferredSwimmingStyle) newErrors.preferredSwimmingStyle = '선호하는 수영 스타일을 선택해주세요';
      } else if (formData.accountType === 'instructor') {
        if (!formData.certifications) newErrors.certifications = '자격증 정보를 입력해주세요';
        if (!formData.teachingExperience) newErrors.teachingExperience = '강의 경험을 입력해주세요';
        if (!formData.specialties) newErrors.specialties = '전문 분야를 입력해주세요';
        if (!formData.hourlyRate) newErrors.hourlyRate = '시급을 입력해주세요';
      }
    }

    if (step === 4) {
      if (formData.accountType === 'student') {
        // 학생용 추가 정보 검증
      } else if (formData.accountType === 'instructor') {
        if (!formData.availableCenters) newErrors.availableCenters = '근무 가능 센터를 입력해주세요';
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
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
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
        userType: formData.accountType
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
        requestData.studentInfo = {
          height: formData.height ? Number(formData.height) : undefined,
          weight: formData.weight ? Number(formData.weight) : undefined,
          medicalConditions: formData.medicalHistory,
          emergencyContact: formData.emergencyContact,
          emergencyPhone: formData.emergencyPhone
        };
      } else if (formData.accountType === 'instructor') {
        requestData.instructorInfo = {
          certifications: formData.certifications.split(',').map(c => c.trim()).filter(Boolean),
          experience: formData.teachingExperience,
          specialties: formData.specialties.split(',').map(s => s.trim()).filter(Boolean)
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

      if (result.success) {
        alert('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.');
        window.location.href = '/auth/login';
      } else {
        alert(result.message || '회원가입에 실패했습니다.');
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
                전화번호 *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="전화번호를 입력하세요"
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                계정 유형 *
              </label>
              <select
                value={formData.accountType}
                onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="student">수강생</option>
                <option value="instructor">강사</option>
              </select>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Activity className="w-4 h-4 inline mr-2" />
                    운동 경험 *
                  </label>
                  <select
                    value={formData.exerciseExperience}
                    onChange={(e) => setFormData({ ...formData, exerciseExperience: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.exerciseExperience ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">운동 경험을 선택하세요</option>
                    <option value="beginner">초보자</option>
                    <option value="intermediate">중급자</option>
                    <option value="advanced">고급자</option>
                    <option value="expert">전문가</option>
                  </select>
                  {errors.exerciseExperience && <p className="text-red-500 text-sm mt-1">{errors.exerciseExperience}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Activity className="w-4 h-4 inline mr-2" />
                    선호하는 수영 스타일 *
                  </label>
                  <select
                    value={formData.preferredSwimmingStyle}
                    onChange={(e) => setFormData({ ...formData, preferredSwimmingStyle: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.preferredSwimmingStyle ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">수영 스타일을 선택하세요</option>
                    <option value="freestyle">자유형</option>
                    <option value="backstroke">배영</option>
                    <option value="breaststroke">평영</option>
                    <option value="butterfly">접영</option>
                    <option value="mixed">혼영</option>
                  </select>
                  {errors.preferredSwimmingStyle && <p className="text-red-500 text-sm mt-1">{errors.preferredSwimmingStyle}</p>}
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <CheckCircle className="w-4 h-4 inline mr-2" />
                    자격증 정보 *
                  </label>
                  <textarea
                    value={formData.certifications}
                    onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.certifications ? 'border-red-500' : 'border-gray-300'
                    }`}
                    rows={3}
                    placeholder="보유 자격증을 입력하세요 (예: 수영지도사 2급, 생존수영지도사 등)"
                  />
                  {errors.certifications && <p className="text-red-500 text-sm mt-1">{errors.certifications}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Activity className="w-4 h-4 inline mr-2" />
                    강의 경험 *
                  </label>
                  <textarea
                    value={formData.teachingExperience}
                    onChange={(e) => setFormData({ ...formData, teachingExperience: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.teachingExperience ? 'border-red-500' : 'border-gray-300'
                    }`}
                    rows={3}
                    placeholder="강의 경험을 입력하세요 (예: 5년 경력, 어린이 수영 강사 등)"
                  />
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Activity className="w-4 h-4 inline mr-2" />
                    시급 (원) *
                  </label>
                  <input
                    type="number"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.hourlyRate ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="시급을 입력하세요"
                  />
                  {errors.hourlyRate && <p className="text-red-500 text-sm mt-1">{errors.hourlyRate}</p>}
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Heart className="w-4 h-4 inline mr-2" />
                    혈액형
                  </label>
                  <select
                    value={formData.bloodType}
                    onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">혈액형을 선택하세요</option>
                    <option value="A">A형</option>
                    <option value="B">B형</option>
                    <option value="AB">AB형</option>
                    <option value="O">O형</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <AlertCircle className="w-4 h-4 inline mr-2" />
                    질병 이력
                  </label>
                  <textarea
                    value={formData.medicalHistory}
                    onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="질병 이력을 입력하세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <AlertCircle className="w-4 h-4 inline mr-2" />
                    알레르기
                  </label>
                  <textarea
                    value={formData.allergies}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="알레르기를 입력하세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Target className="w-4 h-4 inline mr-2" />
                    운동 목표
                  </label>
                  <textarea
                    value={formData.fitnessGoals}
                    onChange={(e) => setFormData({ ...formData, fitnessGoals: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="운동 목표를 입력하세요"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    근무 가능 센터 *
                  </label>
                  <textarea
                    value={formData.availableCenters}
                    onChange={(e) => setFormData({ ...formData, availableCenters: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.availableCenters ? 'border-red-500' : 'border-gray-300'
                    }`}
                    rows={3}
                    placeholder="근무 가능한 센터를 입력하세요 (예: 강남센터, 송파센터 등)"
                  />
                  {errors.availableCenters && <p className="text-red-500 text-sm mt-1">{errors.availableCenters}</p>}
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
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                  className={`mt-1 mr-3 ${errors.agreeTerms ? 'border-red-500' : ''}`}
                />
                <label htmlFor="agreeTerms" className="text-sm text-gray-700">
                  <span className="text-red-500">*</span> 이용약관에 동의합니다
                </label>
              </div>
              {errors.agreeTerms && <p className="text-red-500 text-sm">{errors.agreeTerms}</p>}

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="agreePrivacy"
                  checked={formData.agreePrivacy}
                  onChange={(e) => setFormData({ ...formData, agreePrivacy: e.target.checked })}
                  className={`mt-1 mr-3 ${errors.agreePrivacy ? 'border-red-500' : ''}`}
                />
                <label htmlFor="agreePrivacy" className="text-sm text-gray-700">
                  <span className="text-red-500">*</span> 개인정보처리방침에 동의합니다
                </label>
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
    </div>
  );
}