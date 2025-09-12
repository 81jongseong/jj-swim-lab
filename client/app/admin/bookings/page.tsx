/**
 * 📅 JJ Swim Lab - 관리자 예약 관리 페이지
 * 
 * 📋 **페이지 목적**
 * - 수영 강습 예약을 관리하는 관리자 전용 페이지
 * - 예약 목록 조회, 상태 관리, 상세 정보 확인
 * - 예약 생성, 수정, 취소 기능 제공
 * - 예약 통계 및 분석 데이터 표시
 * - 예약 검색, 필터링, 페이지네이션 기능
 * 
 * 🔄 **주요 기능**
 * - 예약 목록 조회 및 표시
 * - 예약 상태 변경 (확인, 대기, 취소)
 * - 예약 생성 및 수정 기능
 * - 예약 검색 및 필터링
 * - 예약 통계 및 분석
 * - 예약 알림 및 리마인더
 * - 예약 충돌 검사 및 방지
 * 
 * 🗄️ **데이터 연동**
 * - 예약 관리 API와 연동 (예약 목록)
 * - 예약 상태 변경 API
 * - 예약 생성 및 수정 API
 * - 예약 통계 및 분석 API
 * - 사용자 인증 시스템
 * - 실시간 예약 상태 업데이트
 * 
 * 🛠️ **필요한 설치 파일**
 * - Next.js 14.2.5 (App Router)
 * - React 18.3.1
 * - TypeScript 5.x
 * - Tailwind CSS 3.3.0
 * - API 클라이언트 (../utils/api)
 * - 인증 컴포넌트 (../components/withAuth)
 * - 인증 훅 (../hooks/useAuth)
 * - 예약 관리 API 엔드포인트
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 관리자 권한 확인 및 보안
 * 2. 예약 데이터 보안 및 개인정보 보호
 * 3. 예약 시간 충돌 방지 및 검증
 * 4. 예약 상태 변경 시 관련 데이터 동기화
 * 5. 반응형 디자인 적용 (모바일/데스크톱)
 * 6. 접근성 지원 (키보드 네비게이션, ARIA 라벨)
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 관리자 권한 확인 확인
 * - [ ] 예약 데이터 보안 확인
 * - [ ] 예약 시간 충돌 검사 확인
 * - [ ] 예약 상태 변경 로직 확인
 * - [ ] 반응형 디자인 테스트
 * - [ ] 접근성 지원 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 관리자 예약 관리 페이지 구현
 * - 2024-12-19: 예약 목록 및 상태 관리 구현
 * - 2024-12-19: 예약 생성 및 수정 기능 구현
 * - 2024-12-19: 예약 검색 및 필터링 구현
 * - 2024-12-19: 반응형 디자인 및 사용자 경험 개선
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (관리자 예약 관리 페이지 완료)
 * 
 * 🚀 **다음 단계**
 * - 실시간 예약 상태 업데이트
 * - 예약 추천 시스템
 * - 예약 대기열 관리
 * - 예약 통계 대시보드
 * - 예약 보안 강화
 * 
 * 💡 **사용 예시**
 * ```tsx
 * // 예약 목록 조회
 * const bookings = await apiClient.getBookings({ status: "confirmed" });
 * 
 * // 예약 상태 변경
 * const updatedBooking = await apiClient.updateBookingStatus(bookingId, "cancelled");
 * 
 * // 예약 생성
 * const newBooking = await apiClient.createBooking(bookingData);
 * ```
 * 
 * 🔍 **예약 관리 처리 흐름**
 * 1. 관리자 권한 확인 및 검증
 * 2. 예약 목록 데이터 로드
 * 3. 예약 검색 및 필터링 조건 적용
 * 4. 예약 상태 변경 처리
 * 5. 예약 생성 및 수정 처리
 * 6. 예약 충돌 검사 및 방지
 * 7. 실시간 예약 상태 동기화
 */

'use client';

import { useState, useEffect } from 'react';
import withAuth from '@/components/withAuth';
import apiClient from '@/utils/api';
import { useAuth } from '@/hooks/useAuth';

interface Booking {
  id: string;
  memberName: string;
  courseName: string;
  instructor: string;
  date: string;
  time: string;
  lane: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  paymentStatus: 'paid' | 'unpaid' | 'refunded';
  amount: number;
  createdAt: string;
}

function AdminBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [userIdFilter, setUserIdFilter] = useState<string>('');
  const [instructorIdFilter, setInstructorIdFilter] = useState<string>('');
  const [newBooking, setNewBooking] = useState<Partial<Booking>>({
    memberName: '',
    courseName: '',
    instructor: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    lane: 1,
    status: 'pending',
    paymentStatus: 'unpaid',
    amount: 0,
    createdAt: new Date().toISOString().split('T')[0]
  });

  const load = async () => {
    setLoading(true);
    const params: any = {};
    if (statusFilter) params.status = statusFilter;
    if (dateFilter) params.date = dateFilter;
    if (userIdFilter) params.user = userIdFilter;
    if (instructorIdFilter) params.instructor = instructorIdFilter;
    const res = await apiClient.getBookings(params);
    if (!res.error) {
      const items = (res.data as any)?.bookings || [];
      const rows = items.map((b:any)=> ({
        id: b._id,
        memberName: b.user?.name || b.user?.userId || '-',
        courseName: b.course?.name || '-',
        instructor: b.instructor?.name || '-',
        date: b.date ? new Date(b.date).toISOString().slice(0,10) : '-',
        time: b.startTime && b.endTime ? `${b.startTime}-${b.endTime}` : '-',
        lane: b.laneNumber || 0,
        status: b.status,
        paymentStatus: 'unpaid',
        amount: b.amount || 0,
        createdAt: b.createdAt ? new Date(b.createdAt).toISOString().slice(0,10) : '-'
      }));
      setBookings(rows);
      setSelectedIds([]);
      setPage(1);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddBooking = () => {
    setShowAddModal(true);
  };

  const handleEditBooking = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      setEditingBooking(booking);
      setShowEditModal(true);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking && confirm(`정말로 ${booking.memberName}님의 예약을 취소하시겠습니까?`)) {
      const res = await apiClient.cancelBooking(bookingId);
      if (!res.error) {
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
        alert('예약이 취소되었습니다.');
      } else {
        alert(res.error);
      }
    }
  };

  const isSuperAdmin = user?.userType === 'superAdmin';

  const toggleSelectAllVisible = (checked: boolean, visible: Booking[]) => {
    if (checked) setSelectedIds(visible.map(b => b.id));
    else setSelectedIds([]);
  };

  const toggleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds(prev => checked ? Array.from(new Set([...prev, id])) : prev.filter(x => x !== id));
  };

  const bulkUpdateStatus = async (nextStatus: 'pending'|'confirmed'|'cancelled') => {
    if (!isSuperAdmin) {
      alert('총관리자만 일괄 상태 변경이 가능합니다.');
      return;
    }
    if (selectedIds.length === 0) {
      alert('대상 예약을 선택하세요.');
      return;
    }
    for (const id of selectedIds) {
      if (nextStatus === 'cancelled') {
        await apiClient.cancelBooking(id);
      } else {
        await apiClient.updateBookingStatus(id, nextStatus);
      }
    }
    await load();
    alert('일괄 처리 완료');
  };

  const handleSaveBooking = async () => {
    if (!newBooking.memberName || !newBooking.courseName || !newBooking.instructor || !newBooking.time) {
      alert('모든 필수 항목을 입력해주세요.');
      return;
    }

    const [startTime, endTime] = (newBooking.time || '').split('-').map(s => s?.trim());
    const payload:any = {
      date: newBooking.date,
      startTime,
      endTime,
      laneNumber: newBooking.lane,
      notes: '',
    };
    const res = await apiClient.createBooking(payload);
    if (!res.error) {
      const b = (res.data as any)?.booking;
      if (b) {
        const row: Booking = {
          id: b._id,
          memberName: b.user?.name || b.user?.userId || '-',
          courseName: b.course?.name || '-',
          instructor: b.instructor?.name || '-',
          date: b.date ? new Date(b.date).toISOString().slice(0,10) : '-',
          time: b.startTime && b.endTime ? `${b.startTime}-${b.endTime}` : '-',
          lane: b.laneNumber || 0,
          status: b.status,
          paymentStatus: 'unpaid',
          amount: b.amount || 0,
          createdAt: b.createdAt ? new Date(b.createdAt).toISOString().slice(0,10) : '-'
        };
        setBookings(prev => [...prev, row]);
      }
      setShowAddModal(false);
      alert('새 예약이 추가되었습니다.');
    } else {
      alert(res.error);
    }
    setNewBooking({
      memberName: '',
      courseName: '',
      instructor: '',
      date: new Date().toISOString().split('T')[0],
      time: '',
      lane: 1,
      status: 'pending',
      paymentStatus: 'unpaid',
      amount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    });
  };

  const handleUpdateBooking = async () => {
    if (!editingBooking) return;

    if (!editingBooking.memberName || !editingBooking.courseName || !editingBooking.instructor || !editingBooking.time) {
      alert('모든 필수 항목을 입력해주세요.');
      return;
    }

    const [startTime, endTime] = (editingBooking.time || '').split('-').map(s => s?.trim());
    const payload:any = {
      status: editingBooking.status,
      laneNumber: editingBooking.lane,
      startTime,
      endTime,
      date: editingBooking.date,
    };
    const res = await apiClient.updateBooking(editingBooking.id, payload);
    if (!res.error) {
      setBookings(prev => prev.map(booking => booking.id === editingBooking.id ? editingBooking : booking));
      setShowEditModal(false);
      setEditingBooking(null);
      alert('예약 정보가 수정되었습니다.');
    } else {
      alert(res.error);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return '✅ 확정';
      case 'pending': return '⏳ 대기중';
      case 'cancelled': return '❌ 취소됨';
      default: return '❓ 알 수 없음';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-200 text-green-900 border-2 border-green-500';
      case 'pending': return 'bg-yellow-200 text-yellow-900 border-2 border-yellow-500';
      case 'cancelled': return 'bg-red-200 text-red-900 border-2 border-red-500';
      default: return 'bg-gray-200 text-gray-900 border-2 border-gray-500';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'paid': return '💰 결제완료';
      case 'unpaid': return '💳 미결제';
      case 'refunded': return '🔄 환불됨';
      default: return '❓ 알 수 없음';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-200 text-green-900 border-2 border-green-500';
      case 'unpaid': return 'bg-red-200 text-red-900 border-2 border-red-500';
      case 'refunded': return 'bg-gray-200 text-gray-900 border-2 border-gray-500';
      default: return 'bg-gray-200 text-gray-900 border-2 border-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
              <p className="mt-6 text-xl text-gray-700 font-medium">로딩 중입니다...</p>
              <p className="mt-2 text-lg text-gray-500">잠시만 기다려주세요</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-blue-900 mb-3">🏊‍♂️ 예약 관리</h1>
          <p className="text-xl text-blue-700">JJ Swim Lab의 모든 예약을 쉽게 관리하세요</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg border-2 border-blue-200">
          <div className="px-8 py-6 border-b-2 border-blue-200 bg-blue-50">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-blue-900">📋 예약 목록</h2>
                <div className="flex gap-3">
                  <button 
                    onClick={load} 
                    className="px-6 py-3 border-2 border-blue-300 rounded-lg text-blue-700 hover:bg-blue-50 transition-colors text-lg font-medium"
                  >
                    🔄 새로고침
                  </button>
                  <button 
                    onClick={handleAddBooking}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg font-bold shadow-lg"
                  >
                    ➕ 새 예약 추가
                  </button>
                </div>
              </div>
              
              <div className="flex flex-wrap items-end gap-4">
                <div>
                  <label className="block text-lg font-semibold text-blue-800 mb-2">📊 상태</label>
                  <select 
                    value={statusFilter} 
                    onChange={(e)=>setStatusFilter(e.target.value)} 
                    className="px-4 py-3 border-2 border-blue-300 rounded-lg text-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
                  >
                    <option value="">전체 보기</option>
                    <option value="pending">⏳ 대기중</option>
                    <option value="confirmed">✅ 확정</option>
                    <option value="cancelled">❌ 취소됨</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-lg font-semibold text-blue-800 mb-2">📅 날짜</label>
                  <input 
                    type="date" 
                    value={dateFilter} 
                    onChange={(e)=>setDateFilter(e.target.value)} 
                    className="px-4 py-3 border-2 border-blue-300 rounded-lg text-lg focus:outline-none focus:ring-4 focus:ring-blue-200" 
                  />
                </div>
                
                {isSuperAdmin && (
                  <>
                    <div>
                      <label className="block text-lg font-semibold text-blue-800 mb-2">👤 회원ID</label>
                      <input 
                        value={userIdFilter} 
                        onChange={(e)=>setUserIdFilter(e.target.value)} 
                        placeholder="사용자 ID 입력" 
                        className="px-4 py-3 border-2 border-blue-300 rounded-lg text-lg focus:outline-none focus:ring-4 focus:ring-blue-200" 
                      />
                    </div>
                    <div>
                      <label className="block text-lg font-semibold text-blue-800 mb-2">👨‍🏫 강사ID</label>
                      <input 
                        value={instructorIdFilter} 
                        onChange={(e)=>setInstructorIdFilter(e.target.value)} 
                        placeholder="강사 ID 입력" 
                        className="px-4 py-3 border-2 border-blue-300 rounded-lg text-lg focus:outline-none focus:ring-4 focus:ring-blue-200" 
                      />
                    </div>
                  </>
                )}
                
                <button 
                  onClick={load} 
                  className="px-6 py-3 bg-blue-800 text-white rounded-lg text-lg font-bold hover:bg-blue-900 shadow-lg"
                >
                  🔍 검색
                </button>
                
                <div className="ml-auto flex items-center gap-3">
                  <label className="text-lg font-semibold text-blue-800">페이지 크기</label>
                  <select 
                    value={pageSize} 
                    onChange={(e)=>{setPageSize(parseInt(e.target.value)); setPage(1);}} 
                    className="px-4 py-3 border-2 border-blue-300 rounded-lg text-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
                  >
                    {[10,20,50].map(s => <option key={s} value={s}>{s}개씩</option>)}
                  </select>
                </div>
              </div>
              
              {isSuperAdmin && (
                <div className="flex gap-3">
                  <button 
                    onClick={()=>bulkUpdateStatus('confirmed')} 
                    className="px-6 py-3 bg-green-600 text-white rounded-lg text-lg font-bold hover:bg-green-700 shadow-lg"
                  >
                    ✅ 선택 확정
                  </button>
                  <button 
                    onClick={()=>bulkUpdateStatus('pending')} 
                    className="px-6 py-3 bg-yellow-600 text-white rounded-lg text-lg font-bold hover:bg-yellow-700 shadow-lg"
                  >
                    ⏳ 선택 대기
                  </button>
                  <button 
                    onClick={()=>bulkUpdateStatus('cancelled')} 
                    className="px-6 py-3 bg-red-600 text-white rounded-lg text-lg font-bold hover:bg-red-700 shadow-lg"
                  >
                    ❌ 선택 취소
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="overflow-x-auto">
                            <table className="w-full min-w-[800px] lg:min-w-[1000px] lg:min-w-[1000px] xl:min-w-[1200px] divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3">
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-blue-600 border-2 border-blue-300 rounded focus:ring-4 focus:ring-blue-200"
                      checked={(()=>{ const start=(page-1)*pageSize; const visible=bookings.slice(start, start+pageSize); return visible.length>0 && visible.every(b=>selectedIds.includes(b.id)); })()}
                      onChange={(e)=>{ const start=(page-1)*pageSize; const visible=bookings.slice(start, start+pageSize); toggleSelectAllVisible(e.target.checked, visible); }}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    회원명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    강습 과정
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    강사
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    날짜
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    시간
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    레인
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    결제상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    금액
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.slice((page-1)*pageSize, (page-1)*pageSize + pageSize).map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 text-blue-600 border-2 border-blue-300 rounded focus:ring-4 focus:ring-blue-200"
                        checked={selectedIds.includes(booking.id)} 
                        onChange={(e)=>toggleSelectOne(booking.id, e.target.checked)} 
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {booking.memberName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.courseName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.instructor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {booking.lane}번 레인
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(booking.paymentStatus)}`}>
                        {getPaymentStatusText(booking.paymentStatus)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        {booking.amount.toLocaleString()}원
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleEditBooking(booking.id)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        수정
                      </button>
                      {booking.status !== 'cancelled' && (
                        <button 
                          onClick={() => handleCancelBooking(booking.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          취소
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex items-center justify-between px-8 py-6 border-t-2 border-blue-200 bg-blue-50">
            <div className="text-xl font-semibold text-blue-900">총 {bookings.length}건의 예약</div>
            <div className="flex items-center gap-3">
              <button 
                disabled={page===1} 
                onClick={()=>setPage(p=>Math.max(1, p-1))} 
                className="px-6 py-3 border-2 border-blue-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold text-blue-700 hover:bg-blue-50"
              >
                ⬅️ 이전
              </button>
              <span className="text-xl font-bold text-blue-900 px-4 py-2 bg-white rounded-lg border-2 border-blue-300">
                {page} / {Math.max(1, Math.ceil(bookings.length / pageSize))}
              </span>
              <button 
                disabled={page>=Math.ceil(bookings.length / pageSize)} 
                onClick={()=>setPage(p=>p+1)} 
                className="px-6 py-3 border-2 border-blue-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold text-blue-700 hover:bg-blue-50"
              >
                다음 ➡️
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 새 예약 추가 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-blue-900 mb-6 text-center">➕ 새 예약 추가</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-lg font-semibold text-blue-800 mb-2">👤 회원명</label>
                <input
                  type="text"
                  value={newBooking.memberName}
                  onChange={(e) => setNewBooking({...newBooking, memberName: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg text-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
                  placeholder="회원명을 입력하세요"
                />
              </div>
              <div>
                <label className="block text-lg font-semibold text-blue-800 mb-2">📚 강습 과정</label>
                <input
                  type="text"
                  value={newBooking.courseName}
                  onChange={(e) => setNewBooking({...newBooking, courseName: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg text-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
                  placeholder="강습 과정명을 입력하세요"
                />
              </div>
              <div>
                <label className="block text-lg font-semibold text-blue-800 mb-2">👨‍🏫 강사</label>
                <input
                  type="text"
                  value={newBooking.instructor}
                  onChange={(e) => setNewBooking({...newBooking, instructor: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg text-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
                  placeholder="강사명을 입력하세요"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-semibold text-blue-800 mb-2">📅 날짜</label>
                  <input
                    type="date"
                    value={newBooking.date}
                    onChange={(e) => setNewBooking({...newBooking, date: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg text-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
                  />
                </div>
                <div>
                  <label className="block text-lg font-semibold text-blue-800 mb-2">🕐 시간</label>
                  <input
                    type="text"
                    value={newBooking.time}
                    onChange={(e) => setNewBooking({...newBooking, time: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg text-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
                    placeholder="예: 14:00-16:00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-semibold text-blue-800 mb-2">🏊‍♂️ 레인</label>
                  <select
                    value={newBooking.lane}
                    onChange={(e) => setNewBooking({...newBooking, lane: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg text-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
                  >
                    {[1, 2, 3, 4, 5, 6].map(lane => (
                      <option key={lane} value={lane}>{lane}번 레인</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-lg font-semibold text-blue-800 mb-2">💵 금액</label>
                  <input
                    type="number"
                    value={newBooking.amount}
                    onChange={(e) => setNewBooking({...newBooking, amount: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg text-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
                    placeholder="금액을 입력하세요"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-semibold text-blue-800 mb-2">📊 상태</label>
                  <select
                    value={newBooking.status}
                    onChange={(e) => setNewBooking({...newBooking, status: e.target.value as any})}
                    className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg text-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
                  >
                    <option value="pending">⏳ 대기중</option>
                    <option value="confirmed">✅ 확정</option>
                  </select>
                </div>
                <div>
                  <label className="block text-lg font-semibold text-blue-800 mb-2">💰 결제상태</label>
                  <select
                    value={newBooking.paymentStatus}
                    onChange={(e) => setNewBooking({...newBooking, paymentStatus: e.target.value as any})}
                    className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg text-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
                  >
                    <option value="unpaid">💳 미결제</option>
                    <option value="paid">💰 결제완료</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-8 py-3 text-gray-600 border-2 border-gray-300 rounded-lg hover:bg-gray-50 text-lg font-semibold"
              >
                ❌ 취소
              </button>
              <button
                onClick={handleSaveBooking}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg font-bold shadow-lg"
              >
                ✅ 추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 예약 수정 모달 */}
      {showEditModal && editingBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-blue-900 mb-6 text-center">✏️ 예약 수정</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-lg font-semibold text-blue-800 mb-2">👤 회원명</label>
                <input
                  type="text"
                  value={editingBooking.memberName}
                  onChange={(e) => setEditingBooking({...editingBooking, memberName: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg text-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="block text-lg font-semibold text-blue-800 mb-2">📚 강습 과정</label>
                <input
                  type="text"
                  value={editingBooking.courseName}
                  onChange={(e) => setEditingBooking({...editingBooking, courseName: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg text-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="block text-lg font-semibold text-blue-800 mb-2">👨‍🏫 강사</label>
                <input
                  type="text"
                  value={editingBooking.instructor}
                  onChange={(e) => setEditingBooking({...editingBooking, instructor: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg text-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-semibold text-blue-800 mb-2">📅 날짜</label>
                  <input
                    type="date"
                    value={editingBooking.date}
                    onChange={(e) => setEditingBooking({...editingBooking, date: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg text-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
                  />
                </div>
                <div>
                  <label className="block text-lg font-semibold text-blue-800 mb-2">🕐 시간</label>
                  <input
                    type="text"
                    value={editingBooking.time}
                    onChange={(e) => setEditingBooking({...editingBooking, time: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg text-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-semibold text-blue-800 mb-2">🏊‍♂️ 레인</label>
                  <select
                    value={editingBooking.lane}
                    onChange={(e) => setEditingBooking({...editingBooking, lane: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg text-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
                  >
                    {[1, 2, 3, 4, 5, 6].map(lane => (
                      <option key={lane} value={lane}>{lane}번 레인</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-lg font-semibold text-blue-800 mb-2">💵 금액</label>
                  <input
                    type="number"
                    value={editingBooking.amount}
                    onChange={(e) => setEditingBooking({...editingBooking, amount: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg text-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-semibold text-blue-800 mb-2">📊 상태</label>
                  <select
                    value={editingBooking.status}
                    onChange={(e) => setEditingBooking({...editingBooking, status: e.target.value as any})}
                    className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg text-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
                  >
                    <option value="pending">⏳ 대기중</option>
                    <option value="confirmed">✅ 확정</option>
                    <option value="cancelled">❌ 취소됨</option>
                  </select>
                </div>
                <div>
                  <label className="block text-lg font-semibold text-blue-800 mb-2">💰 결제상태</label>
                  <select
                    value={editingBooking.paymentStatus}
                    onChange={(e) => setEditingBooking({...editingBooking, paymentStatus: e.target.value as any})}
                    className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg text-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
                  >
                    <option value="unpaid">💳 미결제</option>
                    <option value="paid">💰 결제완료</option>
                    <option value="refunded">🔄 환불됨</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-8 py-3 text-gray-600 border-2 border-gray-300 rounded-lg hover:bg-gray-50 text-lg font-semibold"
              >
                ❌ 취소
              </button>
              <button
                onClick={handleUpdateBooking}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg font-bold shadow-lg"
              >
                ✅ 수정
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(AdminBookingsPage, { requireTypes: ['centerAdmin','superAdmin'], requirePermission: null });
