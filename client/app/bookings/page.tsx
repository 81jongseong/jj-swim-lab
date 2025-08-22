'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import ResponsiveTable from '@/components/ResponsiveTable';

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
      const response = await fetch('/api/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error('예약 목록을 가져오는데 실패했습니다:', error);
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
      console.error('예약 취소에 실패했습니다:', error);
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
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">예약 관리</h1>
        
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

        <ResponsiveTable headers={["사용자", "강사", "날짜", "시간", "상태", "작업"]}>
          {filteredBookings.map((booking) => (
            <div key={booking._id} className="bg-white rounded-lg shadow p-4 mb-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium">
                    사용자: {typeof booking.user === "string" ? booking.user : booking.user?.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    강사: {typeof booking.instructor === "string" ? booking.instructor : booking.instructor?.name || "-"}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                  {getStatusText(booking.status)}
                </span>
              </div>
              
              <div className="text-sm text-gray-600 mb-2">
                <p>날짜: {new Date(booking.date).toISOString().slice(0, 10)}</p>
                <p>시간: {booking.startTime} - {booking.endTime}</p>
              </div>

              <div className="flex justify-end">
                {booking.status === "confirmed" && (
                  <button
                    onClick={() => handleCancelBooking(booking._id)}
                    className="text-red-600 hover:text-red-900 text-sm"
                  >
                    취소
                  </button>
                )}
                {booking.status === "pending" && <span className="text-gray-400">대기중</span>}
                {booking.status === "cancelled" && <span className="text-gray-400">취소됨</span>}
                {booking.status === "completed" && <span className="text-gray-400">완료</span>}
              </div>
            </div>
          ))}
        </ResponsiveTable>

        {filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">해당 상태의 예약이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}

