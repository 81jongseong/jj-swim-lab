import { useState, useEffect } from 'react';
import apiClient from '../../utils/api';

export default function AdminBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('전체');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.getBookings();
        
        if (response.data && Array.isArray(response.data)) {
          setBookings(response.data);
        } else if (response.data && !Array.isArray(response.data)) {
          // If response.data exists but is not an array, set empty array
          setBookings([]);
        } else if (response.error) {
          setError(response.error);
          setBookings([]);
        } else {
          // If no data or error, set empty array
          setBookings([]);
        }
      } catch (err) {
        setError('예약 목록을 불러오는데 실패했습니다.');
        setBookings([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleFilter = (filterType: string) => {
    setFilter(filterType);
  };

  const handleViewDetail = (booking: any) => {
    setSelectedBooking(booking);
    setShowDetailModal(true);
  };

  const handleApproveBooking = async (bookingId: string) => {
    if (window.confirm('이 예약을 승인하시겠습니까?')) {
      try {
        const response = await apiClient.updateBookingStatus(bookingId, 'approved');
        if (response.data) {
          setBookings(bookings.map(booking => 
            booking._id === bookingId ? { ...booking, status: 'approved' } : booking
          ));
          alert('예약이 승인되었습니다.');
        } else {
          alert('승인에 실패했습니다.');
        }
      } catch (err) {
        alert('승인 중 오류가 발생했습니다.');
      }
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    if (window.confirm('이 예약을 거절하시겠습니까?')) {
      try {
        const response = await apiClient.updateBookingStatus(bookingId, 'rejected');
        if (response.data) {
          setBookings(bookings.map(booking => 
            booking._id === bookingId ? { ...booking, status: 'rejected' } : booking
          ));
          alert('예약이 거절되었습니다.');
        } else {
          alert('거절에 실패했습니다.');
        }
      } catch (err) {
        alert('거절 중 오류가 발생했습니다.');
      }
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (window.confirm('이 예약을 취소하시겠습니까?')) {
      try {
        const response = await apiClient.cancelBooking(bookingId);
        if (response.data) {
          setBookings(bookings.map(booking => 
            booking._id === bookingId ? { ...booking, status: 'cancelled' } : booking
          ));
          alert('예약이 취소되었습니다.');
        } else {
          alert('취소에 실패했습니다.');
        }
      } catch (err) {
        alert('취소 중 오류가 발생했습니다.');
      }
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === '전체') return true;
    if (filter === '승인 대기') return booking.status === 'pending';
    if (filter === '승인됨') return booking.status === 'approved';
    if (filter === '취소됨') return booking.status === 'cancelled' || booking.status === 'rejected';
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'cancelled':
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '승인 대기';
      case 'approved': return '승인됨';
      case 'cancelled': return '취소됨';
      case 'rejected': return '거절됨';
      default: return '알 수 없음';
    }
  };

  const getPendingCount = () => {
    return bookings.filter(booking => booking.status === 'pending').length;
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">예약 관리</h1>
          <p className="text-gray-600">예약 현황을 관리하세요</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">로딩 중...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">예약 목록</h3>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleFilter('승인 대기')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    승인 대기 ({getPendingCount()})
                  </button>
                  <button 
                    onClick={() => handleFilter('전체')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    전체 보기
                  </button>
                </div>
              </div>
              
              <div className="flex space-x-4 mb-6">
                <button 
                  onClick={() => handleFilter('전체')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filter === '전체' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  전체
                </button>
                <button 
                  onClick={() => handleFilter('승인 대기')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filter === '승인 대기' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  승인 대기
                </button>
                <button 
                  onClick={() => handleFilter('승인됨')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filter === '승인됨' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  승인됨
                </button>
                <button 
                  onClick={() => handleFilter('취소됨')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filter === '취소됨' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  취소됨
                </button>
              </div>

              <div className="space-y-4">
                {filteredBookings.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {filter === '전체' ? '등록된 예약이 없습니다.' : `${filter} 예약이 없습니다.`}
                  </div>
                ) : (
                  filteredBookings.map((booking) => (
                    <div key={booking._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {booking.userName?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="text-gray-900 font-semibold">
                            {booking.userName || '사용자'} - {booking.courseName || '강습 과정'}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {booking.date || '날짜 미정'} {booking.time || '시간 미정'}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {booking.instructorName || '강사 미지정'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 ${getStatusColor(booking.status)} text-xs rounded-full`}>
                          {getStatusText(booking.status)}
                        </span>
                        {booking.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleApproveBooking(booking._id)}
                              className="text-green-600 hover:text-green-800 text-sm"
                            >
                              승인
                            </button>
                            <button 
                              onClick={() => handleRejectBooking(booking._id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              거절
                            </button>
                          </>
                        )}
                        {booking.status === 'approved' && (
                          <>
                            <button 
                              onClick={() => handleViewDetail(booking)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              상세보기
                            </button>
                            <button 
                              onClick={() => handleCancelBooking(booking._id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              취소
                            </button>
                          </>
                        )}
                        {(booking.status === 'cancelled' || booking.status === 'rejected') && (
                          <button 
                            onClick={() => handleViewDetail(booking)}
                            className="text-gray-600 hover:text-gray-800 text-sm"
                          >
                            상세보기
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Booking Detail Modal */}
      {showDetailModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">예약 상세 정보</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">예약자</label>
                <p className="text-gray-900">{selectedBooking.userName || '이름 없음'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">강습 과정</label>
                <p className="text-gray-900">{selectedBooking.courseName || '과정명 없음'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">예약 날짜</label>
                <p className="text-gray-900">{selectedBooking.date || '날짜 미정'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">예약 시간</label>
                <p className="text-gray-900">{selectedBooking.time || '시간 미정'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">담당 강사</label>
                <p className="text-gray-900">{selectedBooking.instructorName || '강사 미지정'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
                <span className={`px-3 py-1 ${getStatusColor(selectedBooking.status)} text-xs rounded-full`}>
                  {getStatusText(selectedBooking.status)}
                </span>
              </div>
              {selectedBooking.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">특이사항</label>
                  <p className="text-gray-900">{selectedBooking.notes}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowDetailModal(false)}
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 