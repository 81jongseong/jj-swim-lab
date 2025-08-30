'use client';

/**
 * 🔐 JJ Swim Lab - withAuth HOC (Higher-Order Component)
 * 
 * 📋 **컴포넌트 목적**
 * - 페이지 및 컴포넌트에 대한 인증 및 권한 검증
 * - 사용자 로그인 상태 확인 및 리다이렉트 처리
 * - 계정 유형별 접근 제어 (student, instructor, centerAdmin, superAdmin)
 * - 세부 권한 기반 접근 제어 (accessPermissions)
 * 
 * 🔄 **주요 기능**
 * - 인증 상태 확인 (로그인 여부)
 * - 사용자 타입별 접근 권한 검증
 * - 세부 권한 검증 (accessPermissions)
 * - 인증 실패 시 자동 리다이렉트
 * - 로딩 상태 처리
 * 
 * 🗄️ **데이터 연동**
 * - useAuth 훅을 통한 사용자 인증 상태 확인
 * - localStorage 기반 토큰 검증
 * - 사용자 권한 및 계정 유형 정보
 * 
 * 🛠️ **필요한 설치 파일**
 * - React (ComponentType, HOC 패턴)
 * - useAuth 훅 (인증 상태 관리)
 * - TypeScript 타입 정의
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. Wrapped 컴포넌트에 올바른 props 타입 전달
 * 2. requireTypes 배열에 유효한 계정 유형만 포함
 * 3. requirePermission은 user.accessPermissions에 존재하는 키여야 함
 * 4. 클라이언트 사이드에서만 동작 (typeof window !== 'undefined' 체크)
 * 5. 리다이렉트 경로 설정 확인
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] useAuth 훅 연동 상태 확인
 * - [ ] 계정 유형 검증 로직 검증
 * - [ ] 권한 검증 로직 검증
 * - [ ] 리다이렉트 경로 설정 확인
 * - [ ] 로딩 상태 처리 검증
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 인증 HOC)
 * - 2024-12-19: 계정 유형별 접근 제어 구현
 * - 2024-12-19: 세부 권한 검증 시스템 구현
 * - 2024-12-19: 클라이언트 사이드 안전성 개선
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (인증 및 권한 검증 완료)
 * 
 * 🚀 **다음 단계**
 * - 역할 기반 접근 제어 (RBAC) 고도화
 * - 다중 권한 조합 검증
 * - 권한 캐싱 시스템
 * - 감사 로그 시스템
 * 
 * 🔐 **권한 시스템**
 * - student: 학생 전용 기능 접근
 * - instructor: 강사 전용 기능 접근
 * - centerAdmin: 센터 관리자 기능 접근
 * - superAdmin: 시스템 관리자 기능 접근
 * - accessPermissions: 세부 기능별 권한
 * 
 * 💡 **사용 예시**
 * ```tsx
 * // 강사만 접근 가능
 * export default withAuth(InstructorDashboard, { 
 *   requireTypes: ['instructor', 'superAdmin'] 
 * });
 * 
 * // 특정 권한 필요
 * export default withAuth(AdminPanel, { 
 *   requireTypes: ['superAdmin'],
 *   requirePermission: 'manageUsers'
 * });
 * ```
 */

import React, { ComponentType } from 'react';
import { useAuth } from '@/hooks/useAuth';

type Options = {
  requireTypes?: Array<'student'|'instructor'|'centerAdmin'|'superAdmin'>;
  requirePermission?: keyof ReturnType<typeof useAuth>['user']['accessPermissions'] | null;
};

export default function withAuth<P>(Wrapped: ComponentType<P>, options: Options = {}) {
  return function Guarded(props: P) {
    const { user, loading } = useAuth();
    
    if (loading) return <div className="min-h-screen pt-16 p-6">로딩중...</div>;
    
    if (!user) {
      if (typeof window !== 'undefined') window.location.href = '/auth/login';
      return null;
    }
    
    // 사용자 타입 확인
    if (options.requireTypes && options.requireTypes.length > 0 && !options.requireTypes.includes(user.userType)) {
      if (typeof window !== 'undefined') window.location.href = '/';
      return null;
    }
    
    // 권한 확인 (accessPermissions가 undefined일 수 있음)
    if (options.requirePermission) {
      const hasPermission = user.accessPermissions && user.accessPermissions[options.requirePermission];
      if (!hasPermission) {
        if (typeof window !== 'undefined') window.location.href = '/';
        return null;
      }
    }
    
    return <Wrapped {...props} />;
  };
}










