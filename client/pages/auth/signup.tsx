'use client';

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navigation from "../../components/Navigation";
import "../../app/globals.css";

export default function SignupPage() {
  const searchParams = useSearchParams();
  const userType = searchParams?.get('type') || 'member';
  
  const [form, setForm] = useState({
    userId: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    userType: userType,
    // 강사 전용 필드
    experience: "",
    certifications: "",
    specialties: "",
    // 센터 관리자 전용 필드
    centerName: "",
    centerAddress: "",
    centerPhone: "",
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // 에러 메시지 초기화
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!form.userId.trim()) newErrors.userId = "아이디를 입력해주세요";
    if (!form.name.trim()) newErrors.name = "이름을 입력해주세요";
    if (!form.email.trim()) newErrors.email = "이메일을 입력해주세요";
    if (!form.password) newErrors.password = "비밀번호를 입력해주세요";
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = "비밀번호가 일치하지 않습니다";
    if (!form.phone.trim()) newErrors.phone = "전화번호를 입력해주세요";

    if (userType === 'instructor') {
      if (!form.experience.trim()) newErrors.experience = "경력을 입력해주세요";
      if (!form.certifications.trim()) newErrors.certifications = "자격증을 입력해주세요";
    }

    if (userType === 'admin') {
      if (!form.centerName.trim()) newErrors.centerName = "센터명을 입력해주세요";
      if (!form.centerAddress.trim()) newErrors.centerAddress = "센터 주소를 입력해주세요";
      if (!form.centerPhone.trim()) newErrors.centerPhone = "센터 전화번호를 입력해주세요";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        alert(`가입 완료: ${data.message}`);
        // 로그인 페이지로 리다이렉트
        window.location.href = '/auth/login';
      } else {
        alert("가입 중 오류 발생: " + (data.error || "회원가입 실패"));
      }
    } catch (err) {
      console.error('회원가입 오류:', err);
      alert("네트워크 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const getUserTypeLabel = (type: string) => {
    switch (type) {
      case 'member': return '회원';
      case 'instructor': return '강사';
      case 'admin': return '센터 관리자';
      default: return '회원';
    }
  };

  const getUserTypeIcon = (type: string) => {
    switch (type) {
      case 'member': return '👤';
      case 'instructor': return '👨‍🏫';
      case 'admin': return '🏢';
      default: return '👤';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="pt-16 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* 회원가입 카드 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            {/* 헤더 */}
            <div className="text-center mb-6">
              <div className="mx-auto h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-xl">{getUserTypeIcon(userType)}</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {getUserTypeLabel(userType)} 가입
              </h2>
              <p className="text-gray-600 text-sm">
                JJ Swim Lab에 함께하세요
              </p>
            </div>

            {/* 폼 */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 아이디 입력 */}
              <div>
                <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
                  아이디 *
                </label>
                <input
                  type="text"
                  id="userId"
                  name="userId"
                  value={form.userId}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.userId ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="사용할 아이디를 입력하세요"
                />
                {errors.userId && (
                  <p className="text-red-500 text-xs mt-1">{errors.userId}</p>
                )}
              </div>

              {/* 이름 입력 */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  이름 *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="실명을 입력하세요"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              {/* 이메일 입력 */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  이메일 *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="이메일을 입력하세요"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* 비밀번호 입력 */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  비밀번호 *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="비밀번호를 입력하세요"
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              {/* 비밀번호 확인 */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  비밀번호 확인 *
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="비밀번호를 다시 입력하세요"
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              {/* 전화번호 입력 */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  전화번호 *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.phone ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="전화번호를 입력하세요"
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>

              {/* 주소 입력 */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  주소
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="주소를 입력하세요 (선택사항)"
                />
              </div>

              {/* 강사 전용 필드 */}
              {userType === 'instructor' && (
                <>
                  <div>
                    <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                      경력 *
                    </label>
                    <input
                      type="text"
                      id="experience"
                      name="experience"
                      value={form.experience}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.experience ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="수영 강사 경력을 입력하세요"
                    />
                    {errors.experience && (
                      <p className="text-red-500 text-xs mt-1">{errors.experience}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="certifications" className="block text-sm font-medium text-gray-700 mb-1">
                      자격증 *
                    </label>
                    <input
                      type="text"
                      id="certifications"
                      name="certifications"
                      value={form.certifications}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.certifications ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="보유 자격증을 입력하세요"
                    />
                    {errors.certifications && (
                      <p className="text-red-500 text-xs mt-1">{errors.certifications}</p>
                    )}
                  </div>
                </>
              )}

              {/* 센터 관리자 전용 필드 */}
              {userType === 'admin' && (
                <>
                  <div>
                    <label htmlFor="centerName" className="block text-sm font-medium text-gray-700 mb-1">
                      센터명 *
                    </label>
                    <input
                      type="text"
                      id="centerName"
                      name="centerName"
                      value={form.centerName}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.centerName ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="센터명을 입력하세요"
                    />
                    {errors.centerName && (
                      <p className="text-red-500 text-xs mt-1">{errors.centerName}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="centerAddress" className="block text-sm font-medium text-gray-700 mb-1">
                      센터 주소 *
                    </label>
                    <input
                      type="text"
                      id="centerAddress"
                      name="centerAddress"
                      value={form.centerAddress}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.centerAddress ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="센터 주소를 입력하세요"
                    />
                    {errors.centerAddress && (
                      <p className="text-red-500 text-xs mt-1">{errors.centerAddress}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="centerPhone" className="block text-sm font-medium text-gray-700 mb-1">
                      센터 전화번호 *
                    </label>
                    <input
                      type="tel"
                      id="centerPhone"
                      name="centerPhone"
                      value={form.centerPhone}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.centerPhone ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="센터 전화번호를 입력하세요"
                    />
                    {errors.centerPhone && (
                      <p className="text-red-500 text-xs mt-1">{errors.centerPhone}</p>
                    )}
                  </div>
                </>
              )}

              {/* 회원가입 버튼 */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? '가입 중...' : '회원가입'}
              </button>
            </form>

            {/* 로그인 링크 */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                이미 계정이 있으신가요?{' '}
                <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
                  로그인
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
