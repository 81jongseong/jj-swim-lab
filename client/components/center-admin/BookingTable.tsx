/**
 * 예약 관리 테이블 컴포넌트
 * 
 * 연동되는 데이터: Booking[], PersonalLesson, LaneRental
 * 연동되는 파일: client/app/center-admin/manage/page.tsx
 */

import React from 'react';
import { User, MapPin, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '../Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui';

interface Booking {
  _id: string;
  type: 'personal-lesson' | 'lane-rental';
  memberName: string;
  date: string;
  time: string;
  duration?: number;
  price?: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  instructorName?: string;
  createdAt?: Date | string;
  laneNumber?: number; // 레인대여 현재 레인 표시용
}

interface BookingTableProps {
  bookings: Booking[];
  type?: 'personal-lesson' | 'lane-rental' | 'all';
  onApprove?: (bookingId: string) => void;
  onReject?: (bookingId: string) => void;
  onChangeCourse?: (bookingId: string) => void;
  onChangeLane?: (bookingId: string) => void;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'approved':
    case 'completed':
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    case 'rejected':
    case 'cancelled':
      return <XCircle className="w-5 h-5 text-red-600" />;
    case 'pending':
      return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    default:
      return <AlertCircle className="w-5 h-5 text-gray-600" />;
  }
};

const getStatusText = (status: string) => {
  const statusMap: { [key: string]: string } = {
    'approved': '승인됨',
    'rejected': '거절됨',
    'pending': '대기중',
    'completed': '완료됨',
    'cancelled': '취소됨'
  };
  return statusMap[status] || status;
};

const getStatusColor = (status: string) => {
  const colorMap: { [key: string]: string } = {
    'approved': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800',
    'pending': 'bg-yellow-100 text-yellow-800',
    'completed': 'bg-green-100 text-green-800',
    'cancelled': 'bg-gray-100 text-gray-800'
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
};

export default function BookingTable({ 
  bookings, 
  type = 'all',
  onApprove,
  onReject,
  onChangeCourse,
  onChangeLane
}: BookingTableProps) {
  const formatDate = (value?: string) => {
    if (!value) return '';
    const d = new Date(value);
    if (isNaN(d.getTime())) return value; // 이미 포맷된 문자열이면 그대로
    return d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const formatTime = (value?: string) => {
    if (!value) return '';
    // HH:mm 또는 ISO일 수 있음
    if (/^\d{2}:\d{2}$/.test(value)) return value;
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const getWeekday = (value?: string) => {
    if (!value) return '';
    const d = new Date(value);
    if (isNaN(d.getTime())) return '';
    const days = ['일','월','화','수','목','금','토'];
    return days[d.getDay()];
  };
  const filteredBookings = type === 'all' 
    ? bookings 
    : bookings.filter(b => b.type === type);

  const title = type === 'personal-lesson' 
    ? '개인레슨 예약' 
    : type === 'lane-rental'
    ? '레인대여 예약'
    : '예약 목록';

  const description = type === 'personal-lesson'
    ? '개인레슨/단체강습 반변경을 수행하세요'
    : type === 'lane-rental'
    ? '레인대여의 레인 번호를 변경하세요'
    : '예약의 반배정/레인 변경을 관리하세요';

  if (filteredBookings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            {type === 'personal-lesson' ? (
              <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            ) : (
              <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            )}
            <p>{title}이 없습니다.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredBookings.map((booking) => (
            <div key={booking._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow h-full overflow-visible">
              <div className="flex items-start justify-between mb-3 flex-wrap gap-3">
                <div className="flex items-start space-x-3 min-w-0">
                  <div className="min-w-0 break-words">
                    <h4 className="font-semibold">{booking.memberName}</h4>
                    <div className="flex items-center flex-wrap gap-2 text-sm text-gray-600 mt-1">
                      <Calendar className="w-4 h-4" />
                      <span className="whitespace-nowrap">{formatDate(booking.date)}({getWeekday(booking.date)})</span>
                      <Clock className="w-4 h-4 ml-2" />
                      <span className="whitespace-nowrap">{formatTime(booking.time || booking.date)}</span>
                      {booking.duration && (
                        <span className="whitespace-nowrap text-gray-500">({booking.duration}분)</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      반: {((booking as any).courseName) || ((booking as any).className) || (booking.type === 'personal-lesson' ? '개인레슨' : '레인대여')}
                    </div>
                    {booking.type === 'lane-rental' && (
                      <div className="text-xs text-purple-700 mt-1">
                        레인: {(booking as any).laneNumber ? `${(booking as any).laneNumber}번` : '-'}
                      </div>
                    )}
                    {booking.instructorName && (
                      <div className="text-xs text-blue-600 mt-1">
                        강사: {booking.instructorName}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right ml-auto whitespace-nowrap">
                  <span className="text-lg font-bold align-middle">
                    {(booking.price || 0).toLocaleString()} 원
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 mt-3 pt-3 border-t">
                {booking.type !== 'lane-rental' && onChangeCourse && (
                  <Button
                    onClick={() => onChangeCourse(booking._id)}
                    size="sm"
                  >
                    반변경
                  </Button>
                )}
                {booking.type === 'lane-rental' && onChangeLane && (
                  <Button
                    onClick={() => onChangeLane(booking._id)}
                    size="sm"
                  >
                    레인변경
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

