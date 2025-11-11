/**
 * 📅 JJ Swim Lab - 강사 예약 관리 페이지
 * 
 * 📋 **페이지 목적**
 * - 강사가 회원이 신청한 개인레슨 및 레인대여 예약을 관리
 * - 예약 상태 변경 (대기 → 확정 → 완료 → 취소)
 * - 일간/주간/월간 뷰로 예약 현황 확인
 * 
 * 🗄️ **데이터 연동**
 * - GET /api/bookings - 예약 목록 조회 (개인레슨 + 레인대여 통합)
 * - PUT /api/bookings/:id - 예약 상태 변경
 * 
 * 🔄 **연동 파일**
 * - server/src/routes/bookings.ts (예약 관리 API)
 * - client/utils/api.ts (API 클라이언트)
 */

"use client";

import { useEffect, useMemo, useState } from 'react';
import apiClient from '../../../utils/api';
import withAuth from '../../../components/withAuth';
import BookingCard from '../../../components/instructor/BookingCard';
import BookingMiniCard from '../../../components/instructor/BookingMiniCard';
import { StatCard } from '../../../components/StatCard';

type BookingStatus = 'pending' | 'approved' | 'confirmed' | 'rejected' | 'completed' | 'cancelled';
type BookingType = 'personal-lesson' | 'lane-rental';

interface BookingRow {
  _id: string;
  course?: { name: string; level: string } | null;
  date: string;
  startTime: string;
  endTime: string;
  user?: { name: string; phone: string } | null;
  status: BookingStatus;
  laneNumber: number;
  purpose: string;
  notes?: string;
  type: BookingType;
}

interface ScheduleStats {
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  todayBookings: number;
  thisWeekBookings: number;
}

function InstructorBookingsPage() {
  const [rows, setRows] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().slice(0,10));
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [stats, setStats] = useState<ScheduleStats>({
    totalBookings: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    todayBookings: 0,
    thisWeekBookings: 0,
  });

  const load = async () => {
    setLoading(true);
    try {
      // 현재 로그인한 강사 정보 가져오기
      const currentUser = apiClient.getCurrentUser();
      if (!currentUser?.userId) {
        console.error('사용자 정보를 찾을 수 없습니다.');
        return;
      }

      // 선택된 날짜의 예약 목록 로드
      const res = await apiClient.getBookings();
      const bookings = (res.data as any)?.bookings || [];
      
      setRows(bookings.map((b: any) => {
        // ⭐ 데이터 구조에 맞게 매핑 (개인레슨 또는 레인대여)
        const isPersonalLesson = b.type === 'personal-lesson';
        const user = isPersonalLesson ? b.student : b.user;
        const course = isPersonalLesson ? { name: '개인레슨', level: b.skillLevel || '-' } : null;
        const purpose = (isPersonalLesson ? 'lesson' : (b.purpose || 'other')) as string;
        
        return {
          _id: b._id,
          type: (b.type || (isPersonalLesson ? 'personal-lesson' : 'lane-rental')) as BookingType, // ⭐ 타입 추가
          course: course,
          date: b.date ? (typeof b.date === 'string' ? b.date.slice(0, 10) : new Date(b.date).toISOString().slice(0, 10)) : selectedDate,
          startTime: b.startTime || b.time || '',
          endTime: b.endTime || '',
          user: user ? { name: user.name || '-', phone: user.phone || '' } : null,
          status: (b.status || 'pending') as BookingStatus,
          laneNumber: b.laneNumber || b.assignedLane || 1,
          purpose: purpose,
          notes: b.notes || '',
        };
      }));

      // 통계 데이터 로드 (DB에 있는 데이터만)
      const today = selectedDate;
      setStats({
        totalBookings: bookings.length,
        confirmedBookings: bookings.filter((b: any) => b.status === 'approved' || b.status === 'confirmed').length,
        pendingBookings: bookings.filter((b: any) => b.status === 'pending').length,
        completedBookings: bookings.filter((b: any) => b.status === 'completed').length,
        cancelledBookings: bookings.filter((b: any) => b.status === 'cancelled').length,
        todayBookings: bookings.filter((b: any) => {
          const bookingDate = b.date ? (typeof b.date === 'string' ? b.date.slice(0, 10) : new Date(b.date).toISOString().slice(0, 10)) : '';
          return bookingDate === today;
        }).length,
        thisWeekBookings: bookings.length, // 임시
      });
    } catch (error) {
      console.error('예약 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    load(); 
  }, [selectedDate]);

  // 실시간 업데이트 (5분마다)
  useEffect(() => {
    const interval = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [selectedDate]);

  const getStatusText = (status: BookingStatus) => {
    switch (status) {
      case 'pending': return '대기';
      case 'approved': return '확정';
      case 'confirmed': return '확정'; // 하위 호환성
      case 'rejected': return '거절';
      case 'completed': return '완료';
      case 'cancelled': return '취소';
      default: return status;
    }
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800'; // 하위 호환성
      case 'rejected': return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPurposeText = (purpose: string) => {
    switch (purpose) {
      case 'practice': return '연습';
      case 'lesson': return '강습';
      case 'competition': return '대회';
      case 'other': return '기타';
      default: return purpose;
    }
  };

  const getPurposeColor = (purpose: string) => {
    switch (purpose) {
      case 'practice': return 'bg-blue-100 text-blue-800';
      case 'lesson': return 'bg-green-100 text-green-800';
      case 'competition': return 'bg-purple-100 text-purple-800';
      case 'other': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
    try {
      const statusToSend: 'pending' | 'confirmed' | 'cancelled' | 'completed' =
        newStatus === 'approved'
          ? 'confirmed'
          : newStatus === 'rejected'
            ? 'cancelled'
            : newStatus === 'pending'
              ? 'pending'
              : newStatus === 'cancelled'
                ? 'cancelled'
                : newStatus === 'confirmed'
                  ? 'confirmed'
                  : 'completed';

      const res = await apiClient.updateBooking(bookingId, { status: statusToSend });
      if (!res.error) {
        await load(); // 목록 새로고침
        alert('예약 상태가 업데이트되었습니다.');
      } else {
        alert(res.error);
      }
    } catch (error) {
      console.error('상태 변경 오류:', error);
      alert('상태 변경 중 오류가 발생했습니다.');
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };

  const getWeekDates = () => {
    const dates: string[] = [];
    const currentDate = new Date(selectedDate);
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date.toISOString().slice(0, 10));
    }
    return dates;
  };

  const getMonthDates = () => {
    const dates: string[] = [];
    const currentDate = new Date(selectedDate);
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    for (let i = 0; i < endOfMonth.getDate(); i++) {
      const date = new Date(startOfMonth);
      date.setDate(startOfMonth.getDate() + i);
      dates.push(date.toISOString().slice(0, 10));
    }
    return dates;
  };

  const getBookingsForDate = (date: string) => {
    return rows.filter(booking => booking.date === date);
  };

  const formatTime = (time: string | undefined | null) => {
    if (!time) return '-';
    return time.slice(0, 5);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">예약 관리</h1>
          <p className="text-xl text-gray-600">회원이 신청한 개인레슨 및 레인대여 예약을 관리하세요</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <StatCard
            title="전체 예약"
            value={stats.totalBookings}
            icon="📅"
            color="blue"
          />
          <StatCard
            title="확정된 예약"
            value={stats.confirmedBookings}
            icon="✅"
            color="green"
          />
          <StatCard
            title="대기 중"
            value={stats.pendingBookings}
            icon="⏳"
            color="yellow"
          />
          <StatCard
            title="오늘 예약"
            value={stats.todayBookings}
            icon="🎯"
            color="purple"
          />
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <label className="text-lg font-semibold text-gray-900">보기 모드:</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setViewMode('daily')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    viewMode === 'daily' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  일간
                </button>
                <button
                  onClick={() => setViewMode('weekly')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    viewMode === 'weekly' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  주간
                </button>
                <button
                  onClick={() => setViewMode('monthly')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    viewMode === 'monthly' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  월간
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => handleDateChange(e.target.value)} 
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              />
              <button
                onClick={load}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                새로고침
              </button>
            </div>
          </div>
        </div>

        {/* 예약 목록 - 카드 형태 */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">예약을 불러오는 중...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {viewMode === 'daily' && (
              <>
                {rows.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                    <div className="text-6xl mb-4">📅</div>
                    <p className="text-xl text-gray-500">선택된 날짜에 예약이 없습니다.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {rows.map((r) => (
                      <BookingCard
                        key={r._id}
                        booking={r}
                        onStatusChange={handleStatusChange}
                        getStatusText={getStatusText}
                        getStatusColor={getStatusColor}
                        getPurposeText={getPurposeText}
                        getPurposeColor={getPurposeColor}
                        formatTime={formatTime}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {viewMode === 'weekly' && (
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">주간 예약</h3>
                <div className="grid grid-cols-7 gap-4">
                  {getWeekDates().map((date) => (
                    <div key={date} className="border border-gray-200 rounded-lg p-4">
                      <div className="text-center mb-3">
                        <div className="text-sm text-gray-500">
                          {new Date(date).toLocaleDateString('ko-KR', { weekday: 'short' })}
                        </div>
                        <div className="text-lg font-semibold text-gray-900">
                          {new Date(date).getDate()}
                        </div>
                      </div>
                      <div className="space-y-2">
                        {getBookingsForDate(date).map((booking) => (
                          <BookingMiniCard
                            key={booking._id}
                            booking={booking}
                            formatTime={formatTime}
                            variant="weekly"
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {viewMode === 'monthly' && (
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">월간 예약</h3>
                <div className="grid grid-cols-7 gap-2">
                  {getMonthDates().map((date) => (
                    <div key={date} className="border border-gray-200 rounded-lg p-2 min-h-[80px]">
                      <div className="text-center mb-2">
                        <div className="text-sm font-semibold text-gray-900">
                          {new Date(date).getDate()}
                        </div>
                      </div>
                      <div className="space-y-1">
                        {getBookingsForDate(date).slice(0, 2).map((booking) => (
                          <BookingMiniCard
                            key={booking._id}
                            booking={booking}
                            formatTime={formatTime}
                            variant="monthly"
                          />
                        ))}
                        {getBookingsForDate(date).length > 2 && (
                          <div className="text-xs text-gray-500 text-center hover:text-gray-700 transition-colors cursor-pointer" title={`${getBookingsForDate(date).length - 2}개의 추가 예약이 있습니다`}>
                            +{getBookingsForDate(date).length - 2}개 더
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Notes Section */}
        {rows.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">예약 메모</h3>
            <div className="space-y-3">
              {rows.filter(r => r.notes).map((r) => (
                <div key={r._id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500 min-w-[100px]">
                    {new Date(r.date).toLocaleDateString('ko-KR')} {formatTime(r.startTime)}
                  </div>
                  <div className="text-sm text-gray-700">
                    <span className="font-semibold">{r.user?.name || '미정'}</span>: {r.notes}
                  </div>
                </div>
              ))}
              {rows.filter(r => r.notes).length === 0 && (
                <p className="text-gray-500 text-center py-4">메모가 있는 예약이 없습니다.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(InstructorBookingsPage, { requireTypes: ['instructor'], requirePermission: null });
