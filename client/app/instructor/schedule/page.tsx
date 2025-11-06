/**
 * 📅 JJ Swim Lab - 강사 일정 관리 페이지 (리다이렉트)
 * 
 * ⚠️ **이 페이지는 더 이상 사용되지 않습니다.**
 * 강사는 "일정 관리"가 아닌 "예약 관리"만 필요합니다.
 * 
 * 이 페이지는 `/instructor/bookings`로 자동 리다이렉트됩니다.
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function InstructorScheduleRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/instructor/bookings');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">예약 관리 페이지로 이동 중...</p>
      </div>
    </div>
  );
}
