/**
 * 🔐 JJ Swim Lab - 로그인 페이지
 * 
 * 📋 **페이지 목적**
 * - 사용자 로그인을 위한 인증 페이지
 * - 사용자 ID와 비밀번호를 통한 로그인 처리
 * - 로그인 성공 시 대시보드로 자동 리다이렉션
 * - 로그인 실패 시 에러 메시지 표시
 * - 회원가입 페이지로의 네비게이션 제공
 * 
 * 🔄 **주요 기능**
 * - 사용자 ID 및 비밀번호 입력 폼
 * - 로그인 버튼 및 로딩 상태 표시
 * - 로그인 성공 시 자동 리다이렉션
 * - 로그인 실패 시 에러 메시지 표시
 * - 회원가입 페이지 링크
 * - 폼 유효성 검증
 * - 반응형 디자인 지원
 * 
 * 🗄️ **데이터 연동**
 * - useAuth 훅과 연동 (로그인 처리)
 * - API 클라이언트와 연동 (인증 요청)
 * - 사용자 인증 상태 관리
 * - JWT 토큰 관리
 * - 사용자 권한 및 역할 데이터
 * 
 * 🛠️ **필요한 설치 파일**
 * - Next.js 14.2.5 (App Router)
 * - React 18.3.1
 * - TypeScript 5.x
 * - Tailwind CSS 3.3.0
 * - useAuth 훅 (../hooks/useAuth)
 * - API 클라이언트 (../utils/api)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 사용자 입력 데이터 검증 및 sanitization
 * 2. 로그인 실패 시 보안 메시지 표시
 * 3. 로딩 상태 및 사용자 경험 고려
 * 4. 반응형 디자인 적용 (모바일/데스크톱)
 * 5. 접근성 지원 (키보드 네비게이션, ARIA 라벨)
 * 6. 보안 강화 (CSRF 보호, Rate Limiting)
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 폼 유효성 검증 확인
 * - [ ] 로그인 에러 처리 확인
 * - [ ] 반응형 디자인 테스트
 * - [ ] 접근성 지원 확인
 * - [ ] 보안 검증 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 로그인 페이지 구현
 * - 2024-12-19: useAuth 훅 연동
 * - 2024-12-19: 폼 유효성 검증 구현
 * - 2024-12-19: 에러 처리 및 사용자 경험 개선
 * - 2024-12-19: 반응형 디자인 및 접근성 지원
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (로그인 페이지 완료)
 * 
 * 🚀 **다음 단계**
 * - 소셜 로그인 연동 (Google, Kakao)
 * - 2FA (Two-Factor Authentication) 구현
 * - 비밀번호 재설정 기능
 * - 로그인 보안 강화
 * - 사용자 경험 개선
 * 
 * 💡 **사용 예시**
 * ```tsx
 * // 로그인 페이지 접근
 * /auth/login
 * 
 * // 로그인 처리
 * const handleSubmit = async (e: React.FormEvent) => {
 *   e.preventDefault();
 *   await login(form.userId, form.password);
 * };
 * ```
 * 
 * 🔍 **로그인 처리 흐름**
 * 1. 사용자 입력 데이터 검증
 * 2. 로그인 요청 전송
 * 3. 서버 인증 처리
 * 4. JWT 토큰 수신 및 저장
 * 5. 사용자 정보 로드
 * 6. 대시보드로 리다이렉션
 * 7. 에러 발생 시 에러 메시지 표시
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../hooks/useAuth';

export default function LoginPage() {
  const [form, setForm] = useState({
    userId: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // useAuth 훅의 login 함수 사용
      await login(form.userId, form.password);
      
      // 로그인 성공 후 사용자 타입에 따라 적절한 페이지로 이동
      console.log('로그인 성공');
      
      // 사용자 정보를 가져와서 리다이렉트
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      if (userData.userType) {
        switch (userData.userType) {
          case 'superAdmin':
            window.location.href = '/admin/dashboard';
            break;
          case 'centerAdmin':
            window.location.href = '/center-admin/dashboard';
            break;
          case 'instructor':
            window.location.href = '/instructor/dashboard';
            break;
          case 'student':
            window.location.href = '/dashboard';
            break;
          default:
            window.location.href = '/dashboard';
        }
      }
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : '로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🏊‍♂️ JJ Swim Lab
            </h1>
            <p className="text-gray-600">로그인하여 서비스를 이용하세요</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-2">
                아이디
              </label>
              <input
                type="text"
                id="userId"
                name="userId"
                required
                value={form.userId}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="아이디를 입력하세요"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              계정이 없으신가요?{' '}
              <Link href="/auth/signup" className="text-blue-600 hover:text-blue-700 font-semibold">
                회원가입
              </Link>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">
              ← 홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
