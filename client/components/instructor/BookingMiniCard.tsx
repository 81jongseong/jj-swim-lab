/**
 * 📅 JJ Swim Lab - 예약 미니 카드 컴포넌트 (주간/월간 뷰용)
 * 
 * 📋 **컴포넌트 목적**
 * - 주간/월간 뷰에서 사용하는 작은 예약 카드
 * - 호버 효과 포함
 * - 재사용 가능한 컴포넌트
 * 
 * 🔄 **연동 파일**
 * - client/app/instructor/bookings/page.tsx
 */

'use client';

import React from 'react';

interface BookingMiniCardProps {
  booking: {
    _id: string;
    startTime: string;
    endTime: string;
    user?: { name: string } | null;
    course?: { name: string } | null;
  };
  formatTime: (time: string | undefined | null) => string;
  variant?: 'weekly' | 'monthly';
}

export default function BookingMiniCard({
  booking,
  formatTime,
  variant = 'weekly'
}: BookingMiniCardProps) {
  if (variant === 'monthly') {
    return (
      <div 
        className="text-xs p-1 bg-green-50 rounded border border-green-200 hover:bg-green-100 hover:border-green-300 hover:shadow-md transition-all cursor-pointer"
        title={`${formatTime(booking.startTime)} - ${booking.user?.name || '미정'}`}
      >
        <div className="font-semibold text-green-900">{formatTime(booking.startTime)}</div>
        <div className="text-green-700 truncate">{booking.user?.name || '미정'}</div>
      </div>
    );
  }

  return (
    <div 
      className="text-xs p-2 bg-blue-50 rounded border border-blue-200 hover:bg-blue-100 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
      title={`${formatTime(booking.startTime)}-${formatTime(booking.endTime)} - ${booking.user?.name || '미정'}`}
    >
      <div className="font-semibold text-blue-900">{formatTime(booking.startTime)}-{formatTime(booking.endTime)}</div>
      <div className="text-blue-700">{booking.user?.name || '미정'}</div>
      {booking.course?.name && (
        <div className="text-blue-600 truncate">{booking.course.name}</div>
      )}
    </div>
  );
}

