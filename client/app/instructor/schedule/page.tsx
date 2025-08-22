"use client";

import { useEffect, useMemo, useState } from 'react';
import apiClient from '@/utils/api';
import withAuth from '@/components/withAuth';

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

function InstructorSchedulePage() {
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
      if (!currentUser?.id) {
        console.error('사용자 정보를 찾을 수 없습니다.');
        return;
      }

      // 선택된 날짜의 예약 목록 로드
      const res = await apiClient.getBookings();
      const bookings = (res.data as any)?.bookings || [];
      
      setRows(bookings.map((b: any) => ({
        _id: b._id,
        course: b.course || null,
        date: new Date(b.date).toISOString().slice(0,10),
        startTime: b.startTime,
        endTime: b.endTime,
        user: b.user || null,
        status: b.status,
        laneNumber: b.laneNumber,
        purpose: b.purpose,
        notes: b.notes,
      })));

      // 통계 데이터 로드 (임시로 기본값 사용)
      setStats({
        totalBookings: bookings.length,
        confirmedBookings: bookings.filter((b: any) => b.status === 'confirmed').length,
        pendingBookings: bookings.filter((b: any) => b.status === 'pending').length,
        completedBookings: bookings.filter((b: any) => b.status === 'completed').length,
        cancelledBookings: bookings.filter((b: any) => b.status === 'cancelled').length,
        todayBookings: bookings.filter((b: any) => b.date === selectedDate).length,
        thisWeekBookings: bookings.length, // 임시
      });
    } catch (error) {
      console.error('스케줄 로드 실패:', error);
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '대기';
      case 'confirmed': return '확정';
      case 'completed': return '완료';
      case 'cancelled': return '취소';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
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

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      const res = await apiClient.put(`/bookings/${bookingId}`, { status: newStatus });
      if (!res.error) {
        await load(); // 목록 새로고침
        alert('예약 상태가 업데이트되었습니다.');
      } else {
        alert(res.error);
      }
    } catch (error) {
      alert('상태 변경 중 오류가 발생했습니다.');
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };

  const getWeekDates = () => {
    const dates = [];
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
    const dates = [];
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

  const formatTime = (time: string) => {
    return time.slice(0, 5);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">일정 관리</h1>
          <p className="text-xl text-gray-600">강습 일정 및 예약 현황을 관리하세요</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <span className="text-3xl">📅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">전체 예약</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <span className="text-3xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">확정된 예약</p>
                <p className="text-3xl font-bold text-gray-900">{stats.confirmedBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <span className="text-3xl">⏳</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">대기 중</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pendingBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <span className="text-3xl">🎯</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">오늘 예약</p>
                <p className="text-3xl font-bold text-gray-900">{stats.todayBookings}</p>
              </div>
            </div>
          </div>
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

        {/* Schedule View */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">일정을 불러오는 중...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {viewMode === 'daily' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-lg font-bold text-blue-900">강습</th>
                      <th className="px-6 py-4 text-left text-lg font-bold text-blue-900">날짜</th>
                      <th className="px-6 py-4 text-left text-lg font-bold text-blue-900">시간</th>
                      <th className="px-6 py-4 text-left text-lg font-bold text-blue-900">레인</th>
                      <th className="px-6 py-4 text-left text-lg font-bold text-blue-900">목적</th>
                      <th className="px-6 py-4 text-left text-lg font-bold text-blue-900">회원</th>
                      <th className="px-6 py-4 text-left text-lg font-bold text-blue-900">상태</th>
                      <th className="px-6 py-4 text-left text-lg font-bold text-blue-900">작업</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y-2 divide-blue-100">
                    {rows.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-8 text-center text-gray-500 text-lg">
                          선택된 날짜에 예약이 없습니다.
                        </td>
                      </tr>
                    ) : (
                      rows.map((r) => (
                        <tr key={r._id} className="hover:bg-blue-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-lg font-medium text-gray-900">
                            {r.course?.name || '-'}
                            {r.course?.level && (
                              <span className="ml-2 text-sm text-gray-500">({r.course.level})</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-700">
                            {new Date(r.date).toLocaleDateString('ko-KR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-700">
                            {formatTime(r.startTime)} - {formatTime(r.endTime)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-700">
                            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-semibold">
                              {r.laneNumber}번 레인
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-lg">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPurposeColor(r.purpose)}`}>
                              {getPurposeText(r.purpose)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-700">
                            <div>
                              <div className="font-semibold">{r.user?.name || '-'}</div>
                              {r.user?.phone && (
                                <div className="text-sm text-gray-500">{r.user.phone}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-lg">
                            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(r.status)}`}>
                              {getStatusText(r.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-lg">
                            <div className="flex space-x-2">
                              {r.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleStatusChange(r._id, 'confirmed')}
                                    className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors text-sm"
                                  >
                                    확정
                                  </button>
                                  <button
                                    onClick={() => handleStatusChange(r._id, 'cancelled')}
                                    className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors text-sm"
                                  >
                                    취소
                                  </button>
                                </>
                              )}
                              {r.status === 'confirmed' && (
                                <button
                                  onClick={() => handleStatusChange(r._id, 'completed')}
                                  className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                >
                                  완료
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {viewMode === 'weekly' && (
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">주간 일정</h3>
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
                          <div key={booking._id} className="text-xs p-2 bg-blue-50 rounded border border-blue-200">
                            <div className="font-semibold text-blue-900">{formatTime(booking.startTime)}-{formatTime(booking.endTime)}</div>
                            <div className="text-blue-700">{booking.user?.name || '미정'}</div>
                            <div className="text-blue-600">{booking.course?.name || '-'}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {viewMode === 'monthly' && (
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">월간 일정</h3>
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
                          <div key={booking._id} className="text-xs p-1 bg-green-50 rounded border border-green-200">
                            <div className="font-semibold text-green-900">{formatTime(booking.startTime)}</div>
                            <div className="text-green-700 truncate">{booking.user?.name || '미정'}</div>
                          </div>
                        ))}
                        {getBookingsForDate(date).length > 2 && (
                          <div className="text-xs text-gray-500 text-center">
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

export default withAuth(InstructorSchedulePage, { requireTypes: ['instructor'], requirePermission: null });

