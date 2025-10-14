/**
 * 🔧 최고관리자 대시보드
 * 
 * 📋 **목적**: 전체 시스템 관리 (Super Admin)
 * 
 * 🔗 **리다이렉트**: 기존 /admin/dashboard로 이동
 * 
 * ⚠️ **TODO**: 향후 admin → super-admin 완전 마이그레이션
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SuperAdminPage() {
  const router = useRouter();
  
  useEffect(() => {
    // 임시: 기존 admin 대시보드로 리다이렉트
    router.push('/admin/dashboard');
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🔧</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          최고관리자 페이지로 이동 중...
        </h1>
        <p className="text-gray-600">
          잠시만 기다려주세요
        </p>
      </div>
    </div>
  );
}

