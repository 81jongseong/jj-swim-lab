/**
 * 📖 JJ Swim Lab - 센터 관리자용 이용안내 페이지
 * 
 * 📋 **페이지 목적**
 * - 센터 관리자에게 JJ Swim Lab 플랫폼 이용 방법 안내
 * - 연락처 및 지원 정보 제공
 * - 주요 기능 및 서비스 소개
 * 
 * 📅 **개발 히스토리**
 * - 2025-11-01: 센터 관리자용 이용안내 페이지 생성
 */

'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingState } from '@/components/common';

export default function CenterAdminGuideRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const slug = localStorage.getItem('centerSlug') || 'default';
      router.replace(`/center/${slug}/admin/guide`);
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingState message="페이지를 이동하는 중..." size="lg" />
    </div>
  );
}

