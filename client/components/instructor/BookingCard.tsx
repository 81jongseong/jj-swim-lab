/**
 * 📅 JJ Swim Lab - 예약 카드 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 예약 정보를 카드 형태로 표시
 * - 상태별 액션 버튼 제공
 * - 재사용 가능한 컴포넌트
 * 
 * 🔄 **연동 파일**
 * - client/app/instructor/bookings/page.tsx
 * 
 * 🗄️ **데이터 연동**
 * - BookingRow 인터페이스 사용
 */

'use client';

import React from 'react';
import { Card, CardContent } from '../ui';

interface BookingRow {
  _id: string;
  course?: { name: string; level: string } | null;
  date: string;
  startTime: string;
  endTime: string;
  user?: { name: string; phone: string } | null;
  status: string;
  laneNumber: number;
  purpose: string;
  notes?: string;
  type?: 'personal-lesson' | 'lane-rental'; // ⭐ 예약 타입 추가
}

interface BookingCardProps {
  booking: BookingRow;
  onStatusChange: (bookingId: string, newStatus: string) => void;
  getStatusText: (status: string) => string;
  getStatusColor: (status: string) => string;
  getPurposeText: (purpose: string) => string;
  getPurposeColor: (purpose: string) => string;
  formatTime: (time: string | undefined | null) => string;
}

export default function BookingCard({
  booking: r,
  onStatusChange,
  getStatusText,
  getStatusColor,
  getPurposeText,
  getPurposeColor,
  formatTime
}: BookingCardProps) {
  // 상태별 테마
  const statusThemes: Record<string, { bg: string; border: string; hoverBg: string; hoverBorder: string }> = {
    pending: { bg: 'bg-yellow-50', border: 'border-yellow-200', hoverBg: 'hover:bg-yellow-100', hoverBorder: 'hover:border-yellow-300' },
    confirmed: { bg: 'bg-blue-50', border: 'border-blue-200', hoverBg: 'hover:bg-blue-100', hoverBorder: 'hover:border-blue-300' },
    completed: { bg: 'bg-green-50', border: 'border-green-200', hoverBg: 'hover:bg-green-100', hoverBorder: 'hover:border-green-300' },
    cancelled: { bg: 'bg-red-50', border: 'border-red-200', hoverBg: 'hover:bg-red-100', hoverBorder: 'hover:border-red-300' },
  };
  const theme = statusThemes[r.status] || { bg: 'bg-gray-50', border: 'border-gray-200', hoverBg: 'hover:bg-gray-100', hoverBorder: 'hover:border-gray-300' };

  return (
    <Card className={`border-2 ${theme.border} ${theme.bg} ${theme.hoverBg} ${theme.hoverBorder} hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer`}>
      {/* 카드 헤더 */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">
              {r.course?.name || '레인대여'}
            </h3>
            {r.course?.level && (
              <p className="text-sm text-blue-100 mt-1">
                레벨: {r.course.level}
              </p>
            )}
          </div>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(r.status)}`}>
            {getStatusText(r.status)}
          </span>
        </div>
      </div>

      <CardContent className="p-6 space-y-4">
        {/* 날짜 및 시간 */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <span className="text-2xl">📅</span>
          </div>
          <div>
            <p className="text-sm text-gray-600">날짜</p>
            <p className="text-base font-semibold text-gray-900">
              {new Date(r.date).toLocaleDateString('ko-KR', {
                month: 'long',
                day: 'numeric',
                weekday: 'short'
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <span className="text-2xl">⏰</span>
          </div>
          <div>
            <p className="text-sm text-gray-600">시간</p>
            <p className="text-base font-semibold text-gray-900">
              {formatTime(r.startTime)} - {formatTime(r.endTime)}
            </p>
          </div>
        </div>

        {/* 회원 정보 */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <span className="text-2xl">👤</span>
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600">회원</p>
            <p className="text-base font-semibold text-gray-900">
              {r.user?.name || '미정'}
            </p>
            {r.user?.phone && (
              <p className="text-sm text-gray-500 mt-1">{r.user.phone}</p>
            )}
          </div>
        </div>

        {/* 레인 및 목적 */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-semibold">
              {r.laneNumber}번 레인
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPurposeColor(r.purpose)}`}>
              {getPurposeText(r.purpose)}
            </span>
          </div>
        </div>

        {/* 메모 */}
        {r.notes && (
          <div className="pt-3 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-1">메모</p>
            <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
              {r.notes}
            </p>
          </div>
        )}

        {/* 액션 버튼 - 개인레슨만 확정/취소 가능 (레인대여는 센터 관리자가 처리) */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex space-x-2">
            {/* 개인레슨만 확정/취소 버튼 표시 */}
            {r.type === 'personal-lesson' && r.status === 'pending' && (
              <>
                <button
                  onClick={() => onStatusChange(r._id, 'approved')}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
                >
                  확정
                </button>
                <button
                  onClick={() => onStatusChange(r._id, 'cancelled')}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
                >
                  취소
                </button>
              </>
            )}
            {/* 개인레슨만 완료 처리 버튼 표시 */}
            {r.type === 'personal-lesson' && (r.status === 'approved' || r.status === 'confirmed') && (
              <button
                onClick={() => onStatusChange(r._id, 'completed')}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
              >
                완료 처리
              </button>
            )}
            {/* 레인대여는 읽기 전용 메시지 */}
            {r.type === 'lane-rental' && (
              <div className="w-full text-center text-sm text-gray-500 py-2">
                레인대여는 센터 관리자에게 문의하세요
              </div>
            )}
            {r.status === 'completed' && (
              <div className="w-full text-center text-sm text-gray-500 py-2">
                완료된 예약
              </div>
            )}
            {r.status === 'cancelled' && (
              <div className="w-full text-center text-sm text-gray-500 py-2">
                취소된 예약
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

