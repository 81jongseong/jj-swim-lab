'use client';

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Navigation from "../../components/Navigation";
import "../../app/globals.css";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    userId: "",
    password: "",
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!form.userId.trim()) newErrors.userId = "ID를 입력해주세요";
    if (!form.password) newErrors.password = "비밀번호를 입력해주세요";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        // 로그인 성공
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // 사용자 유형에 따라 리다이렉트
        const redirectPath = data.user.userType === 'admin' ? '/admin/dashboard' : 
                           data.user.userType === 'instructor' ? '/instructor/dashboard' : 
                           '/dashboard';
        router.push(redirectPath);
      } else {
        setError(data.error || '로그인에 실패했습니다.');
      }
    } catch (err) {
      console.error('로그인 오류:', err);
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: 'google' | 'kakao') => {
    // 소셜 로그인 구현 (추후 OAuth 연동)
    alert(`${provider} 로그인은 추후 구현 예정입니다.`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="pt-16 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {/* 로그인 카드 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            {/* 헤더 */}
            <div className="text-center mb-6">
              <div className="mx-auto h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-xl">🏊‍♂️</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                로그인
              </h2>
              <p className="text-gray-600 text-sm">
                JJ Swim Lab에 오신 것을 환영합니다
              </p>
            </div>

            {/* 폼 */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* ID 입력 */}
              <div>
                <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
                  아이디
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
                  placeholder="아이디를 입력하세요"
                />
                {errors.userId && (
                  <p className="text-red-500 text-xs mt-1">{errors.userId}</p>
                )}
              </div>

              {/* 비밀번호 입력 */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  비밀번호
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

              {/* 에러 메시지 */}
              {error && (
                <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">
                  {error}
                </div>
              )}

              {/* 로그인 버튼 */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? '로그인 중...' : '로그인'}
              </button>
            </form>

            {/* 소셜 로그인 */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">또는</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleSocialLogin('google')}
                  className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm">Google</span>
                </button>
                <button
                  onClick={() => handleSocialLogin('kakao')}
                  className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm">Kakao</span>
                </button>
              </div>
            </div>

            {/* 회원가입 링크 */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                계정이 없으신가요?{' '}
                <Link href="/auth/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                  회원가입
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
