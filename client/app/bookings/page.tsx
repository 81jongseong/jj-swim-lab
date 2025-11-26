'use client';
import { logger } from '@/lib/logger';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LoadingState, PageHeader } from '@/components/common';
// 테이블 제거 - 카드만 사용

interface Booking {
  _id: string;
  user: string | { name: string };
  instructor: string | { name: string };
  date: string;
  startTime: string;
  endTime: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
}

export default function BookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, statusFilter]);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/student/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.ok) {
        const result = await response.json();
        logger.info('🔍 예약 API 응답:', result);
        setBookings(result.data || []);
      }
    } catch (error) {
      logger.error('예약 목록을 가져오는데 실패했습니다:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    if (statusFilter === 'all') {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(bookings.filter(booking => booking.status === statusFilter));
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchBookings();
      }
    } catch (error) {
      logger.error('예약 취소에 실패했습니다:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '확정';
      case 'pending':
        return '대기중';
      case 'cancelled':
        return '취소됨';
      case 'completed':
        return '완료';
      default:
        return status;
    }
  };

  if (loading) {
    return <LoadingState message="예약 정보를 불러오는 중..." size="lg" fullScreen />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="예약 관리"
        description="예약 내역을 확인하고 관리할 수 있습니다"
        className="mb-6"
      />
      
      <div className="flex gap-4 mb-6">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">전체</option>
            <option value="confirmed">확정</option>
            <option value="pending">대기중</option>
            <option value="cancelled">취소됨</option>
            <option value="completed">완료</option>
          </select>
        </div>

        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div key={booking._id} className="bg-white rounded-lg shadow-sm p-4 mb-3 border-l-3 border-blue-500">
              {/* 헤더 섹션 */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900 mb-1">
                    {(booking as any).courseName || '강습과정'}
                  </h3>
                  <p className="text-xs text-gray-600">
                    🏊‍♂️ {(booking as any).instructorName || (typeof booking.instructor === "string" ? booking.instructor : booking.instructor?.name) || "강사"}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                  {getStatusText(booking.status)}
                </span>
              </div>
              
              {/* 상세 정보 그리드 */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                <div>
                  <p className="text-xs text-gray-900 font-medium">
                    📅 {new Date(booking.date).toLocaleDateString('ko-KR')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-900 font-medium">
                    ⏰ {booking.startTime}-{booking.endTime}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-900 font-medium">
                    🏊 {(booking as any).location || '수영장'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-900 font-medium">
                    🏊‍♀️ {(booking as any).laneNumber || '미정'}번
                  </p>
                </div>
              </div>

              {/* 비용 및 레벨 정보 */}
              <div className="flex justify-between items-center mb-2 p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-green-600">
                    💰 {((booking as any).price || 50000).toLocaleString()}원
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    (booking as any).level === 'beginner' ? 'bg-green-100 text-green-800' :
                    (booking as any).level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    (booking as any).level === 'advanced' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {(booking as any).level === 'beginner' ? '초급' :
                     (booking as any).level === 'intermediate' ? '중급' :
                     (booking as any).level === 'advanced' ? '고급' :
                     (booking as any).level === 'expert' ? '전문가' :
                     (booking as any).level === 'custom' ? '맞춤' : '기본'}
                  </span>
                </div>
              </div>

              {/* 메모 및 특이사항 */}
              {(booking as any).notes && (
                <div className="mb-2 p-2 bg-blue-50 rounded">
                  <p className="text-xs text-gray-700">📝 {(booking as any).notes}</p>
                </div>
              )}

              {/* 액션 버튼 */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">
                  예약: {new Date((booking as any).bookingDate || booking.date).toLocaleDateString('ko-KR')}
                </span>
                {booking.status === "confirmed" && (
                  <button
                    onClick={() => handleCancelBooking(booking._id)}
                    className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    취소
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">해당 상태의 예약이 없습니다.</p>
          </div>
        )}
    </div>
  );
}

