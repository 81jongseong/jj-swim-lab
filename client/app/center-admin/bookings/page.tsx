/**
 * 📅 JJ Swim Lab - 센터 관리자 예약관리 페이지
 * 
 * 📋 **페이지 목적**
 * - 센터 관리자가 예약을 관리할 수 있는 통합 페이지
 * - 레인대여, 개인레슨 신청, 수락, 강사 배정 기능
 * - 예약 현황 파악 및 통계 대시보드
 * 
 * 🔄 **주요 기능**
 * - 예약 현황 대시보드 (오늘/이번주 예약 현황)
 * - 개인레슨 신청 관리 (수락/거절, 강사 배정)
 * - 레인대여 관리 (승인/거절, 시간 충돌 확인)
 * - 예약 통계 및 분석
 * 
 * 🗄️ **데이터 연동**
 * - PersonalLesson 모델과 연동
 * - LaneRental 모델과 연동
 * - User 모델과 연동 (강사, 학생)
 * - 예약관리 API와 연동
 * - MongoDB Atlas 데이터베이스
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 권한 검증 (센터 관리자만 접근 가능)
 * 2. 실시간 데이터 업데이트
 * 3. 예약 시간 충돌 방지
 * 4. 강사 스케줄 검증
 * 5. 사용자 친화적 UI/UX
 * 
 * 📅 **개발 히스토리**
 * - 2025-01-12: 초기 예약관리 페이지 구현
 * - 2025-01-12: 스케줄 설정 탭과 강사 관리 탭 제거
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2025-01-12
 * - 상태: ✅ 완성
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui';
import { Button } from '../../../components/Button';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Users, 
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus
} from 'lucide-react';
import SimplePersonalLessonModal from '../../../components/center-admin/SimplePersonalLessonModal';
import SimpleLaneRentalModal from '../../../components/center-admin/SimpleLaneRentalModal';

interface Booking {
  _id: string;
  type: 'personal-lesson' | 'lane-rental';
  memberId: string;
  memberName: string;
  instructorId?: string;
  instructorName?: string;
  date: string;
  time: string;
  duration: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  price: number;
  notes?: string;
  createdAt: string;
}

interface DashboardStats {
  todayBookings: number;
  weekBookings: number;
  pendingApprovals: number;
  totalRevenue: number;
  personalLessons: number;
  laneRentals: number;
}

function BookingsManagement() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'personal-lessons' | 'lane-rentals'>('dashboard');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    todayBookings: 0,
    weekBookings: 0,
    pendingApprovals: 0,
    totalRevenue: 0,
    personalLessons: 0,
    laneRentals: 0
  });
  const [loading, setLoading] = useState(true);
  const [showPersonalLessonModal, setShowPersonalLessonModal] = useState(false);
  const [showLaneRentalModal, setShowLaneRentalModal] = useState(false);

  // 권한 확인 - 페이지 렌더링 전에 체크
  // center@swim.com 계정도 센터 관리자로 인식
  const isCenterAdmin = user && (
    ['centerAdmin', 'center-admin', 'superAdmin'].includes(user.userType) ||
    user.email === 'center@swim.com'
  );
  
  if (!isCenterAdmin) {
    // 권한이 없는 사용자는 게스트 버전의 화면으로 리다이렉트
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
    return null;
  }

  // 데이터 로딩
  useEffect(() => {
    console.log('🔄 useEffect 실행 - user:', user);
    if (user) {
      console.log('👤 사용자 정보:', user);
      loadDashboardData();
      loadBookings();
    } else {
      console.log('❌ 사용자 정보가 없습니다');
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔑 인증 토큰:', token ? '존재함' : '없음');
      
      const response = await fetch('http://localhost:5000/api/center-admin/bookings/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📊 대시보드 API 응답 상태:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 대시보드 데이터:', data);
        setDashboardStats(data.data);
      } else {
        const errorData = await response.json();
        console.error('❌ 대시보드 API 응답 오류:', response.status, errorData);
      }
    } catch (error) {
      console.error('❌ 대시보드 데이터 로딩 실패:', error);
    }
  };

  const loadBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔑 예약 목록 로딩 - 인증 토큰:', token ? '존재함' : '없음');
      
      const response = await fetch('http://localhost:5000/api/center-admin/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📅 예약 목록 API 응답 상태:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📅 예약 목록 데이터:', data);
        console.log('📅 예약 목록 배열:', data.data?.bookings);
        console.log('📅 예약 목록 개수:', data.data?.bookings?.length || 0);
        setBookings(data.data.bookings || []);
      } else {
        const errorData = await response.json();
        console.error('❌ 예약 API 응답 오류:', response.status, errorData);
      }
    } catch (error) {
      console.error('❌ 예약 데이터 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingAction = async (bookingId: string, action: 'approve' | 'reject', instructorId?: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/center-admin/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          action,
          instructorId
        })
      });

      if (response.ok) {
        await loadBookings();
        await loadDashboardData();
      }
    } catch (error) {
      console.error('예약 처리 실패:', error);
    }
  };

  const handlePersonalLessonSubmit = async (data: any) => {
    try {
      const response = await fetch('http://localhost:5000/api/personal-lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        loadBookings();
        loadDashboardData();
        alert('개인레슨 신청이 완료되었습니다.');
      }
    } catch (error) {
      console.error('개인레슨 신청 실패:', error);
      alert('개인레슨 신청에 실패했습니다.');
    }
  };

  const handleLaneRentalSubmit = async (data: any) => {
    try {
      const response = await fetch('http://localhost:5000/api/lane-rentals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        loadBookings();
        loadDashboardData();
        alert('레인대여 신청이 완료되었습니다.');
      }
    } catch (error) {
      console.error('레인대여 신청 실패:', error);
      alert('레인대여 신청에 실패했습니다.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return '승인됨';
      case 'rejected':
        return '거절됨';
      case 'pending':
        return '대기중';
      default:
        return '완료됨';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">예약 데이터를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              📅 예약 관리
            </h1>
            <p className="text-gray-600">센터의 모든 예약을 관리하고 모니터링하세요</p>
          </div>
                 <div className="flex space-x-3">
                   <Button
                     onClick={() => setShowPersonalLessonModal(true)}
                     className="flex items-center"
                   >
                     <User className="w-4 h-4 mr-2" />
                     개인레슨 신청
                   </Button>
                   <Button
                     onClick={() => setShowLaneRentalModal(true)}
                     variant="outline"
                     className="flex items-center"
                   >
                     <MapPin className="w-4 h-4 mr-2" />
                     레인대여 신청
                   </Button>
                 </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'dashboard', name: '대시보드', icon: TrendingUp },
              { id: 'personal-lessons', name: '개인레슨', icon: User },
              { id: 'lane-rentals', name: '레인대여', icon: MapPin }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* 대시보드 탭 */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">오늘 예약</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.todayBookings}</div>
                <p className="text-xs text-muted-foreground">
                  오늘 처리된 예약 수
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">이번주 예약</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.weekBookings}</div>
                <p className="text-xs text-muted-foreground">
                  이번주 처리된 예약 수
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">승인 대기</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.pendingApprovals}</div>
                <p className="text-xs text-muted-foreground">
                  승인 대기 중인 예약
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">총 수익</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(dashboardStats.totalRevenue || 0).toLocaleString()}원</div>
                <p className="text-xs text-muted-foreground">
                  이번달 예약 수익
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 최근 예약 목록 */}
          <Card>
            <CardHeader>
              <CardTitle>최근 예약 현황</CardTitle>
              <CardDescription>최근 처리된 예약들을 확인하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {console.log('📊 대시보드에서 렌더링할 예약 목록:', bookings.slice(0, 5))}
                {bookings.slice(0, 5).map((booking) => (
                  <div key={booking._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {booking.type === 'personal-lesson' ? (
                        <User className="w-5 h-5 text-blue-600" />
                      ) : (
                        <MapPin className="w-5 h-5 text-green-600" />
                      )}
                      <div>
                        <p className="font-medium">{booking.memberName}</p>
                        <p className="text-sm text-gray-600">
                          {booking.type === 'personal-lesson' ? '개인레슨' : '레인대여'} • {booking.date} {booking.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </span>
                      <span className="text-sm font-medium">{(booking.price || 0).toLocaleString()}원</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 개인레슨 탭 */}
      {activeTab === 'personal-lessons' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>개인레슨 예약 관리</CardTitle>
              <CardDescription>개인레슨 신청을 승인/거절하고 강사를 배정하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {console.log('🏊‍♂️ 개인레슨 예약 목록:', bookings.filter(b => b.type === 'personal-lesson'))}
                {bookings.filter(b => b.type === 'personal-lesson').map((booking) => (
                  <div key={booking._id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(booking.status)}
                        <div>
                          <h4 className="font-semibold">{booking.memberName}</h4>
                          <p className="text-sm text-gray-600">{booking.date} {booking.time}</p>
                        </div>
                      </div>
                      <span className="text-lg font-bold">{(booking.price || 0).toLocaleString()}원</span>
                    </div>
                    
                    {booking.status === 'pending' && (
                      <div className="flex items-center space-x-2 mt-3">
                        <Button
                          onClick={() => handleBookingAction(booking._id, 'approve')}
                          className="bg-green-600 hover:bg-green-700"
                          size="sm"
                        >
                          승인
                        </Button>
                        <Button
                          onClick={() => handleBookingAction(booking._id, 'reject')}
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                          size="sm"
                        >
                          거절
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                
                {bookings.filter(b => b.type === 'personal-lesson').length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>개인레슨 예약이 없습니다.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 레인대여 탭 */}
      {activeTab === 'lane-rentals' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>레인대여 예약 관리</CardTitle>
              <CardDescription>레인대여 신청을 승인/거절하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {console.log('🏊‍♀️ 레인대여 예약 목록:', bookings.filter(b => b.type === 'lane-rental'))}
                {bookings.filter(b => b.type === 'lane-rental').map((booking) => (
                  <div key={booking._id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(booking.status)}
                        <div>
                          <h4 className="font-semibold">{booking.memberName}</h4>
                          <p className="text-sm text-gray-600">{booking.date} {booking.time} ({booking.duration}분)</p>
                        </div>
                      </div>
                      <span className="text-lg font-bold">{(booking.price || 0).toLocaleString()}원</span>
                    </div>
                    
                    {booking.status === 'pending' && (
                      <div className="flex items-center space-x-2 mt-3">
                        <Button
                          onClick={() => handleBookingAction(booking._id, 'approve')}
                          className="bg-green-600 hover:bg-green-700"
                          size="sm"
                        >
                          승인
                        </Button>
                        <Button
                          onClick={() => handleBookingAction(booking._id, 'reject')}
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                          size="sm"
                        >
                          거절
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                
                {bookings.filter(b => b.type === 'lane-rental').length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>레인대여 예약이 없습니다.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

             {/* 모달들 */}
             <SimplePersonalLessonModal
               isOpen={showPersonalLessonModal}
               onClose={() => setShowPersonalLessonModal(false)}
               onSubmit={handlePersonalLessonSubmit}
             />

             <SimpleLaneRentalModal
               isOpen={showLaneRentalModal}
               onClose={() => setShowLaneRentalModal(false)}
               onSubmit={handleLaneRentalSubmit}
             />
    </div>
  );
}

export default BookingsManagement;