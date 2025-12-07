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
import { LoadingState } from '@/components/common';

export default function InstructorScheduleRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/instructor/bookings');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingState message="예약 관리 페이지로 이동 중..." size="md" />
    </div>
  );
}
