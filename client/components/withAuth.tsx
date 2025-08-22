'use client';

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










