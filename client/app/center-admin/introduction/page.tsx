/**
 * @file 센터 소개 편집 페이지 리다이렉트
 * @description 센터 소개 편집은 홈페이지에서 직접 할 수 있으므로 대시보드로 리다이렉트합니다.
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function IntroductionPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/center-admin/dashboard');
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🔄</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          센터 대시보드로 이동 중...
        </h1>
        <p className="text-gray-600">
          센터 소개 편집은 홈페이지에서 바로 할 수 있습니다
        </p>
      </div>
    </div>
  );
}
