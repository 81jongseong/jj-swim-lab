/**
 * 💳 JJ Swim Lab - 센터 관리자 결제관리 페이지 (리다이렉트)
 * 
 * 이 페이지는 /center-admin/manage로 리다이렉트됩니다.
 * 
 * 📅 **개발 히스토리**
 * - 2025-01-09: 통합 페이지로 리다이렉트 처리
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PaymentsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/center-admin/manage?tab=payments');
  }, [router]);

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">예약·결제 관리 페이지로 이동 중...</p>
        </div>
      </div>
    </div>
  );
}
