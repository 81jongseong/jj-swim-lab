/**
 * 🏊 SwimLab - 컨디션 선택 데모 페이지 (리다이렉트)
 * 
 * 이제 통합된 수영엔진 페이지로 이동합니다.
 */

'use client';

import React, { useEffect } from 'react';
import { LoadingState } from '@/components/common';

export default function SwimLabDemoPage() {
  // 리다이렉트: 데모 페이지를 수영엔진으로 이동
  useEffect(() => {
    window.location.href = '/admin/swim-training-engine?tab=condition-setup';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
      <LoadingState message="수영엔진으로 이동 중..." size="lg" />
    </div>
  );
}