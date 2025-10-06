'use client';

import React, { useState } from 'react';
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

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      // 회원가입 처리
      console.log('회원가입 데이터:', formData);
      alert('회원가입이 완료되었습니다!');
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                주소 *
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="주소를 입력하세요"
              />
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