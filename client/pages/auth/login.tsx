'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import apiClient from '../../utils/api';

export default function Login() {
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await apiClient.login({ userId: formData.userId, password: formData.password });
      
      if (response.data?.token) {
        // 토큰을 로컬 스토리지에 저장
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userType', response.data.user.userType);
        localStorage.setItem('userId', response.data.user.userId);
        localStorage.setItem('userName', response.data.user.name);
        
        // 사용자 타입에 따라 리다이렉트
        switch (response.data.user.userType) {
          case 'admin':
            router.push('/admin/dashboard');
            break;
          case 'instructor':
            router.push('/instructor/dashboard');
            break;
          case 'member':
            router.push('/dashboard');
            break;
          default:
            router.push('/dashboard');
        }
      } else if (response.error) {
        setError(response.error);
      }
    } catch (error: any) {
      setError(error.message || '로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-white/10">
            <span className="text-2xl">🏊‍♂️</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            JJ Swim Lab 로그인
          </h2>
          <p className="mt-2 text-center text-sm text-blue-200">
            계정이 없으신가요?{' '}
            <Link href="/auth/signup" className="font-medium text-blue-300 hover:text-blue-200">
              회원가입
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-8 border border-white/20">
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="userId" className="block text-sm font-medium text-blue-200">
                  아이디
                </label>
                <input
                  id="userId"
                  name="userId"
                  type="text"
                  required
                  value={formData.userId}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="아이디를 입력하세요"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-blue-200">
                  비밀번호
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="비밀번호를 입력하세요"
                />
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-blue-900 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    로그인 중...
                  </div>
                ) : (
                  '로그인'
                )}
              </button>
            </div>

            <div className="mt-4 text-center">
              <Link href="/auth/forgot-password" className="text-sm text-blue-300 hover:text-blue-200">
                비밀번호를 잊으셨나요?
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
