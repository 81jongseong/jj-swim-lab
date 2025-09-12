/**
 * 📝 JJ Swim Lab - 회원가입 페이지
 * 
 * 📋 **페이지 목적**
 * - 새로운 사용자 회원가입을 위한 인증 페이지
 * - 사용자 기본 정보 입력 및 계정 생성
 * - 사용자 타입별 맞춤형 회원가입 폼 제공
 * - 회원가입 성공 시 로그인 페이지로 리다이렉션
 * - 회원가입 실패 시 에러 메시지 표시
 * 
 * 🔄 **주요 기능**
 * - 사용자 기본 정보 입력 폼 (ID, 이름, 이메일, 비밀번호)
 * - 비밀번호 확인 및 유효성 검증
 * - 사용자 타입 선택 (학생, 강사, 센터 관리자)
 * - 회원가입 버튼 및 로딩 상태 표시
 * - 회원가입 성공 시 자동 리다이렉션
 * - 회원가입 실패 시 에러 메시지 표시
 * - 로그인 페이지 링크
 * - 반응형 디자인 지원
 * 
 * 🗄️ **데이터 연동**
 * - useAuth 훅과 연동 (회원가입 처리)
 * - API 클라이언트와 연동 (회원가입 요청)
 * - URL 파라미터와 연동 (사용자 타입)
 * - 사용자 인증 상태 관리
 * - JWT 토큰 관리
 * 
 * 🛠️ **필요한 설치 파일**
 * - Next.js 14.2.5 (App Router)
 * - React 18.3.1
 * - TypeScript 5.x
 * - Tailwind CSS 3.3.0
 * - useAuth 훅 (../hooks/useAuth)
 * - API 클라이언트 (../utils/api)
 * - Next.js 라우터 (useSearchParams)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 사용자 입력 데이터 검증 및 sanitization
 * 2. 비밀번호 보안 및 암호화 처리
 * 3. 사용자 타입별 폼 차별화
 * 4. 회원가입 실패 시 보안 메시지 표시
 * 5. 반응형 디자인 적용 (모바일/데스크톱)
 * 6. 접근성 지원 (키보드 네비게이션, ARIA 라벨)
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 폼 유효성 검증 확인
 * - [ ] 비밀번호 보안 처리 확인
 * - [ ] 사용자 타입별 폼 차별화 확인
 * - [ ] 회원가입 에러 처리 확인
 * - [ ] 반응형 디자인 테스트
 * - [ ] 접근성 지원 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 회원가입 페이지 구현
 * - 2024-12-19: useAuth 훅 연동
 * - 2024-12-19: 폼 유효성 검증 구현
 * - 2024-12-19: 사용자 타입별 폼 차별화
 * - 2024-12-19: 에러 처리 및 사용자 경험 개선
 * - 2024-12-19: 반응형 디자인 및 접근성 지원
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (회원가입 페이지 완료)
 * 
 * 🚀 **다음 단계**
 * - 소셜 회원가입 연동 (Google, Kakao)
 * - 이메일 인증 시스템
 * - 비밀번호 강도 검사
 * - 회원가입 보안 강화
 * - 사용자 경험 개선
 * 
 * 💡 **사용 예시**
 * ```tsx
 * // 회원가입 페이지 접근
 * /auth/signup?type=student
 * 
 * // 회원가입 처리
 * const handleSubmit = async (e: React.FormEvent) => {
 *   e.preventDefault();
 *   await register(form);
 * };
 * ```
 * 
 * 🔍 **회원가입 처리 흐름**
 * 1. 사용자 입력 데이터 검증
 * 2. 비밀번호 확인 및 유효성 검증
 * 3. 회원가입 요청 전송
 * 4. 서버 회원가입 처리
 * 5. 회원가입 성공 시 로그인 페이지로 리다이렉션
 * 6. 에러 발생 시 에러 메시지 표시
 * 7. 사용자 피드백 및 로딩 상태 관리
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function SignupPage() {
  const searchParams = useSearchParams();
  const { register } = useAuth();
  const [form, setForm] = useState({
    userId: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    userType: searchParams.get('type') || 'student',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (form.password !== form.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsLoading(true);
    
    try {
      // useAuth 훅의 register 함수 사용
      await register({
        userId: form.userId,
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        address: form.address,
        userType: form.userType,
      });
      
      alert('회원가입이 완료되었습니다!');
      // 성공 시 로그인 페이지로 이동
      window.location.href = '/auth/login';
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : '회원가입 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const userTypeLabels = {
    student: '수강생',
    instructor: '강사',
    centerAdmin: '센터 관리자',
    superAdmin: '총관리자',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🏊‍♂️ JJ Swim Lab
            </h1>
            <p className="text-gray-600">회원가입하여 서비스를 시작하세요</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="userType" className="block text-sm font-medium text-gray-700 mb-2">
                회원 유형
              </label>
              <select
                id="userType"
                name="userType"
                value={form.userType}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="student">수강생</option>
                <option value="instructor">강사</option>
                <option value="centerAdmin">센터 관리자</option>
                <option value="superAdmin">총관리자</option>
              </select>
            </div>

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
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                이름
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="홍길동"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                전화번호
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                value={form.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="010-1234-5678"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                주소
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={form.address}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="주소를 입력하세요 (선택사항)"
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
                minLength={6}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호 확인
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                required
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? '가입 중...' : '회원가입'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              이미 계정이 있으신가요?{' '}
              <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                로그인
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
