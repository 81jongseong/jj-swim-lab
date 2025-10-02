'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Calendar, Clock, User, MapPin, Phone, Mail, CheckCircle, XCircle, Search, Filter } from 'lucide-react';
import withAuth from '@/components/withAuth';

interface Booking {
  _id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  instructorId: string;
  instructorName: string;
  courseId: string;
  courseName: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

function InstructorBookingsManagement() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    if (user) {
      loadBookings();
    }
  }, [user]);

  const loadBookings = async () => {
    try {
      setIsLoading(true);
      // 임시 데이터
      const tempBookings: Booking[] = [
        {
          _id: '1',
          studentId: 'student001',
          studentName: '김학생',
          studentEmail: 'student1@example.com',
          studentPhone: '010-1234-5678',
          instructorId: user?.id || 'instructor001',
          instructorName: '김강사',
          courseId: 'course001',
          courseName: '초급 자유형 클래스',
          date: new Date('2024-01-22'),
          startTime: '10:00',
          endTime: '11:00',
          status: 'confirmed',
          notes: '첫 수업입니다.',
          createdAt: new Date('2024-01-20'),
          updatedAt: new Date('2024-01-20')
        },
        {
          _id: '2',
          studentId: 'student002',
          studentName: '이학생',
          studentEmail: 'student2@example.com',
          studentPhone: '010-2345-6789',
          instructorId: user?.id || 'instructor001',
          instructorName: '김강사',
          courseId: 'course002',
          courseName: '중급 배영 클래스',
          date: new Date('2024-01-22'),
          startTime: '14:00',
          endTime: '15:00',
          status: 'pending',
          notes: '배영 기술 향상 목표',
          createdAt: new Date('2024-01-21'),
          updatedAt: new Date('2024-01-21')
        },
        {
          _id: '3',
          studentId: 'student003',
          studentName: '박학생',
          studentEmail: 'student3@example.com',
          studentPhone: '010-3456-7890',
          instructorId: user?.id || 'instructor001',
          instructorName: '김강사',
          courseId: 'course003',
          courseName: '고급 접영 클래스',
          date: new Date('2024-01-23'),
          startTime: '16:00',
          endTime: '17:00',
          status: 'completed',
          notes: '접영 폼 교정',
          createdAt: new Date('2024-01-18'),
          updatedAt: new Date('2024-01-23')
        }
      ];
      setBookings(tempBookings);
    } catch (error) {
      console.error('예약 목록 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.studentEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || booking.status === statusFilter;
    const matchesDate = dateFilter === '' || 
                       booking.date.toDateString() === new Date(dateFilter).toDateString();
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusLabel = (status: string) => {
    const statuses: { [key: string]: string } = {
      'pending': '대기중',
      'confirmed': '확정',
      'completed': '완료',
      'cancelled': '취소'
    };
    return statuses[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const updateBookingStatus = (bookingId: string, newStatus: string) => {
    setBookings(prev => prev.map(booking => 
      booking._id === bookingId 
        ? { ...booking, status: newStatus as any, updatedAt: new Date() }
        : booking
    ));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">예약 목록을 불러오는 중...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          예약 관리
        </h1>
        <p className="text-gray-600">학생들의 수업 예약을 관리하고 확인하세요</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 예약</p>
              <p className="text-2xl font-bold text-gray-900">{bookings.length}건</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">확정된 예약</p>
              <p className="text-2xl font-bold text-gray-900">
                {bookings.filter(b => b.status === 'confirmed').length}건
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">대기중인 예약</p>
              <p className="text-2xl font-bold text-gray-900">
                {bookings.filter(b => b.status === 'pending').length}건
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <User className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">완료된 수업</p>
              <p className="text-2xl font-bold text-gray-900">
                {bookings.filter(b => b.status === 'completed').length}건
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="학생명, 강의명, 이메일로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">모든 상태</option>
              <option value="pending">대기중</option>
              <option value="confirmed">확정</option>
              <option value="completed">완료</option>
              <option value="cancelled">취소</option>
            </select>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* 예약 목록 */}
      <div className="space-y-4">
        {filteredBookings.map((booking) => (
          <div key={booking._id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  {getStatusIcon(booking.status)}
                  <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                    {getStatusLabel(booking.status)}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{booking.courseName}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    <span>{booking.studentName}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    <span>{booking.studentEmail}</span>
                  </div>
                  {booking.studentPhone && (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      <span>{booking.studentPhone}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{booking.date.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{booking.startTime} - {booking.endTime}</span>
                  </div>
                </div>
                {booking.notes && (
                  <div className="mt-3 p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-700">{booking.notes}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-xs text-gray-500">
                예약일: {booking.createdAt.toLocaleDateString()}
              </div>
              
              <div className="flex space-x-2">
                {booking.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updateBookingStatus(booking._id, 'confirmed')}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      확정
                    </button>
                    <button
                      onClick={() => updateBookingStatus(booking._id, 'cancelled')}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                    >
                      취소
                    </button>
                  </>
                )}
                {booking.status === 'confirmed' && (
                  <button
                    onClick={() => updateBookingStatus(booking._id, 'completed')}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                  >
                    완료
                  </button>
                )}
                <button className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors">
                  상세보기
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredBookings.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">검색 결과가 없습니다.</p>
        </div>
      )}
    </div>
  );
}

export default withAuth(InstructorBookingsManagement, { 
  requireTypes: ['instructor'] 
});