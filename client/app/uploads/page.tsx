/**
 * 📁 JJ Swim Lab - 영상 업로드 페이지 (리다이렉트)
 * 
 * 📋 **페이지 목적**
 * - /video-feedback 페이지로 리다이렉트
 * - 동영상 업로드 및 분석 요청은 /video-feedback 페이지에서 통합 제공
 * 
 * 🔄 **변경 사항**
 * - 2025-01-XX: /video-feedback로 통합하여 리다이렉트 처리
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingState } from '@/components/common';

export default function UploadsPage() {
  const router = useRouter();
  
  useEffect(() => {
    // /video-feedback 페이지로 리다이렉트
    router.replace('/video-feedback');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
      <LoadingState message="동영상 분석 요청 페이지로 이동 중..." size="md" />
    </div>
  );
}
