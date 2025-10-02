/**
 * 🏊 SwimLab - 컨디션 선택 데모 페이지 (리다이렉트)
 * 
 * 이제 통합된 수영엔진 페이지로 이동합니다.
 */

'use client';

import React, { useEffect } from 'react';

export default function SwimLabDemoPage() {
  // 리다이렉트: 데모 페이지를 수영엔진으로 이동
  useEffect(() => {
    window.location.href = '/admin/swim-training-engine?tab=condition-setup';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">수영엔진으로 이동 중...</p>
        <p className="text-sm text-gray-500 mt-2">
          컨디션 설정 탭으로 이동합니다.
        </p>
      </div>
    </div>
  );
}