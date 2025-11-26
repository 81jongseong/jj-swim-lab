/**
 * 📋 예약·결제 관리 콘텐츠 컴포넌트
 * 
 * 센터 강의 관리 페이지의 탭으로 사용되는 예약·결제 관리 콘텐츠
 * 기존 manage 페이지의 내용을 재사용
 */

'use client';
import { logger } from '@/lib/logger';
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui';
import ThemedStatCard from '../../../components/ThemedStatCard';
import { CardGrid, LoadingState } from '@/components/common';
import { Button } from '@/components/ui';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  CreditCard,
  LayoutDashboard
} from 'lucide-react';
import SimplePersonalLessonModal from '../../../components/center-admin/SimplePersonalLessonModal';
import SimpleLaneRentalModal from '../../../components/center-admin/SimpleLaneRentalModal';
import BookingTable from '../../../components/center-admin/BookingTable';
import PaymentTable from '../../../components/center-admin/PaymentTable';
import apiClient from '../../../utils/api';

// 예약 인터페이스
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

// 결제 인터페이스
interface Payment {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  currency: string;
  paymentMethod: 'card' | 'bank_transfer' | 'cash' | 'mobile';
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  description: string;
  createdAt: Date | string;
  completedAt?: Date | string;
  transactionId?: string;
  refundAmount?: number;
  refundReason?: string;
}

// 승인 인터페이스
interface ApprovalItem {
  id: string;
  type: 'course_enrollment' | 'payment_approval' | 'schedule_change' | 'refund_request';
  title: string;
  description: string;
  requesterName: string;
  requesterEmail: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  estimatedAmount?: number;
  courseName?: string;
  scheduleInfo?: {
    originalDate: string;
    requestedDate: string;
    reason: string;
  };
  refundInfo?: {
    refundAmount: number;
    reason: string;
    bankAccount: string;
  };
}

// 통합 대시보드 통계
interface DashboardStats {
  todayBookings: number;
  weekBookings: number;
  pendingApprovals: number;
  totalRevenue: number;
  personalLessons: number;
  laneRentals: number;
  pendingPayments: number;
  completedPayments: number;
  pendingApprovalCount: number;
  refundCount: number;
  refundRate: number;
  averageTicketSize: number;
  paymentCompletionRate: number;
}

type TabType = 'dashboard' | 'bookings' | 'payments';

export default function BookingManagementContent() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    todayBookings: 0,
    weekBookings: 0,
    pendingApprovals: 0,
    totalRevenue: 0,
    personalLessons: 0,
    laneRentals: 0,
    pendingPayments: 0,
    completedPayments: 0,
    pendingApprovalCount: 0,
    refundCount: 0,
    refundRate: 0,
    averageTicketSize: 0,
    paymentCompletionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [showPersonalLessonModal, setShowPersonalLessonModal] = useState(false);
  const [showLaneRentalModal, setShowLaneRentalModal] = useState(false);

  const DEBUG = false;

  // URL 쿼리 파라미터 확인
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as TabType;
      if (tabParam && ['dashboard', 'bookings', 'payments'].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  // 대시보드 통계 업데이트 함수
  const updateDashboardStats = useCallback(() => {
    const totalPayments = payments.length;
    const pendingPayments = payments.filter(p => p.status === 'pending').length;
    const completedPayments = payments.filter(p => p.status === 'completed').length;
    const refundedPayments = payments.filter(p => p.status === 'refunded' || (p as any).refundAmount > 0).length;
    const pendingApprovalCount = approvals.filter(a => a.status === 'pending').length;
    const completedAmounts = payments.filter(p => p.status === 'completed').map(p => p.amount);
    const totalRevenue = completedAmounts.reduce((sum, amount) => sum + amount, 0);
    const averageTicketSize = completedAmounts.length > 0 ? Math.round(totalRevenue / completedAmounts.length) : 0;
    const refundRate = totalPayments > 0 ? Math.round((refundedPayments / totalPayments) * 100) : 0;
    const paymentCompletionRate = totalPayments > 0 ? Math.round((completedPayments / totalPayments) * 100) : 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    
    const todayBookings = bookings.filter(b => {
      if (!b.date) return false;
      const bookingDate = new Date(b.date);
      bookingDate.setHours(0, 0, 0, 0);
      return bookingDate.getTime() >= today.getTime() && bookingDate.getTime() < tomorrow.getTime();
    }).length;

    const weekBookings = bookings.filter(b => {
      if (!b.date) return false;
      const bookingDate = new Date(b.date);
      bookingDate.setHours(0, 0, 0, 0);
      return bookingDate.getTime() >= startOfWeek.getTime() && bookingDate.getTime() < endOfWeek.getTime();
    }).length;

    const personalLessons = bookings.filter(b => b.type === 'personal-lesson').length;
    const laneRentals = bookings.filter(b => b.type === 'lane-rental').length;

    setDashboardStats({
      todayBookings,
      weekBookings,
      personalLessons,
      laneRentals,
      pendingPayments,
      completedPayments,
      pendingApprovalCount,
      totalRevenue: totalRevenue || 0,
      refundCount: refundedPayments,
      refundRate,
      averageTicketSize,
      paymentCompletionRate,
      pendingApprovals: pendingApprovalCount
    });
  }, [payments, approvals, bookings]);

  const loadBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/center-admin/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBookings(data.data?.bookings || []);
      }
    } catch (error) {
      if (DEBUG) logger.error('예약 로드 실패:', error);
    }
  };

  const loadPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/center-admin/payments', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPayments(data.data?.payments || []);
      }
    } catch (error) {
      if (DEBUG) logger.error('결제 로드 실패:', error);
    }
  };

  const loadApprovals = async () => {
    try {
      const response = await apiClient.get('/api/approvals');
      if (response.success) {
        setApprovals(response.data?.approvals || []);
      }
    } catch (error) {
      // 404 오류는 조용히 처리 (엔드포인트가 없을 수 있음)
      if (DEBUG) logger.error('승인 로드 실패:', error);
      setApprovals([]);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([loadBookings(), loadPayments(), loadApprovals()]);
    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading && user) {
      loadAllData();
    }
  }, [authLoading, user]);

  useEffect(() => {
    if (!loading) {
      updateDashboardStats();
    }
  }, [payments, approvals, bookings, loading, updateDashboardStats]);

  const handleBookingAction = async (bookingId: string, action: 'approve' | 'reject', instructorId?: string, bookingType?: 'personal-lesson' | 'lane-rental') => {
    try {
      const base = 'http://localhost:5000/api/center-admin/bookings';
      const endpoint = bookingType === 'lane-rental'
        ? `${base}/lane-rentals/${bookingId}/status`
        : `${base}/personal-lessons/${bookingId}/status`;
      const status = action === 'approve' ? (bookingType === 'lane-rental' ? 'approved' : 'accepted') : 'rejected';

      let finalInstructorId = instructorId;
      if (bookingType === 'personal-lesson' && action === 'approve' && !finalInstructorId) {
        try {
          const res = await fetch('http://localhost:5000/api/center-admin/instructors', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          const data = await res.json();
          const instructors: any[] = data?.data?.instructors || [];
          if (instructors.length === 0) {
            alert('배정 가능한 강사가 없습니다. 강사를 먼저 등록해 주세요.');
            return;
          }
          const list = instructors.map((i, idx) => `${idx + 1}. ${i.name} (${i._id})`).join('\n');
          const picked = prompt(`승인하려면 강사를 선택하세요. 숫자를 입력:\n${list}`);
          const idx = picked ? parseInt(picked, 10) - 1 : -1;
          if (isNaN(idx) || idx < 0 || idx >= instructors.length) {
            alert('올바른 번호를 입력해주세요.');
            return;
          }
          finalInstructorId = instructors[idx]._id;
        } catch (e) {
          if (DEBUG) logger.error('강사 목록 조회 실패:', e);
          alert('강사 목록을 불러올 수 없습니다. 잠시 후 다시 시도하세요.');
          return;
        }
      }

      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status, instructorId: finalInstructorId || b.instructorId } as any : b));
      updateDashboardStats();

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status, instructorId: finalInstructorId })
      });

      if (response.ok) {
        await loadAllData();
      }
    } catch (error) {
      if (DEBUG) logger.error('예약 처리 실패:', error);
    }
  };

  const handlePaymentAction = async (paymentId: string, action: 'refund' | 'cancel') => {
    try {
      setPayments(prev => prev.map(p => p._id === paymentId ? {
        ...p,
        status: action === 'refund' ? 'refunded' : 'cancelled',
        refundAmount: action === 'refund' ? (p.refundAmount || p.amount) : p.refundAmount
      } : p));
      updateDashboardStats();
      alert(action === 'refund' ? '결제가 환불되었습니다.' : '결제가 취소되었습니다.');
    } catch (error) {
      if (DEBUG) logger.error('결제 처리 실패:', error);
    }
  };

  const handlePersonalLessonSubmit = async (data: any) => {
    try {
      const addMinutes = (hhmm: string, minutes: number) => {
        const [h, m] = hhmm.split(':').map(Number);
        const d = new Date(2000, 0, 1, h, m || 0, 0, 0);
        d.setMinutes(d.getMinutes() + (minutes || 60));
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        return `${hh}:${mm}`;
      };

      const payload = {
        studentId: data.studentId,
        instructorId: data.instructorId,
        scheduledDate: data.date,
        startTime: data.time,
        endTime: addMinutes(data.time, data.duration),
        poolType: 'mainPool',
        laneNumber: 1,
        lessonType: data.lessonType,
        level: data.skillLevel,
        lessonContent: data.notes || '',
        specialRequests: Array.isArray(data.goals) ? data.goals.join(', ') : (data.goals || '')
      };

      const response = await fetch('http://localhost:5000/api/center-admin/bookings/personal-lessons/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        await loadAllData();
        setShowPersonalLessonModal(false);
        alert('개인레슨 신청이 완료되었습니다.');
      } else {
        alert('개인레슨 신청에 실패했습니다.');
      }
    } catch (error) {
      if (DEBUG) logger.error('개인레슨 신청 실패:', error);
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
        await loadAllData();
        setShowLaneRentalModal(false);
        alert('레인대여 신청이 완료되었습니다.');
      }
    } catch (error) {
      if (DEBUG) logger.error('레인대여 신청 실패:', error);
      alert('레인대여 신청에 실패했습니다.');
    }
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-gray-100 text-gray-800',
      'failed': 'bg-red-100 text-red-800',
      'refunded': 'bg-blue-100 text-blue-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'approved': '승인됨',
      'rejected': '거절됨',
      'pending': '대기중',
      'completed': '완료됨',
      'cancelled': '취소됨',
      'failed': '실패',
      'refunded': '환불됨'
    };
    return statusMap[status] || status;
  };

  const formatCurrency = (amount: number, currency: string = 'KRW') => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingState message="데이터를 불러오는 중..." size="lg" />
      </div>
    );
  }

  return (
    <div>
      {/* 헤더 버튼 */}
      <div className="flex justify-end space-x-3 mb-6">
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

      {/* 하위 탭 네비게이션 */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'dashboard', name: '대시보드', icon: LayoutDashboard },
              { id: 'bookings', name: '예약 관리', icon: Calendar },
              { id: 'payments', name: '결제 관리', icon: DollarSign }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    isActive
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
          <CardGrid gap={6}>
            <ThemedStatCard
              title="오늘 예약"
              value={dashboardStats.todayBookings}
              icon={<Calendar className="h-4 w-4" />}
              color="blue"
              description="오늘 처리된 예약 수"
            />
            <ThemedStatCard
              title="총 매출"
              value={formatCurrency(dashboardStats.totalRevenue || payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0))}
              icon={<TrendingUp className="h-4 w-4" />}
              color="green"
              description="이번달 총 수익"
            />
            <ThemedStatCard
              title="평균 결제액"
              value={formatCurrency(dashboardStats.averageTicketSize)}
              icon={<CreditCard className="h-4 w-4" />}
              color="purple"
              description="완료 건 평균 티켓"
            />
            <ThemedStatCard
              title="결제 완료율"
              value={`${dashboardStats.paymentCompletionRate}%`}
              icon={<CheckCircle className="h-4 w-4" />}
              color="teal"
              description="완료/전체 결제 비율"
            />
          </CardGrid>

          <CardGrid gap={6}>
            <ThemedStatCard
              title="환불 건수"
              value={`${dashboardStats.refundCount}건`}
              icon={<XCircle className="h-4 w-4" />}
              color="red"
              description="처리된 환불"
            />
            <ThemedStatCard
              title="환불률"
              value={`${dashboardStats.refundRate}%`}
              icon={<AlertCircle className="h-4 w-4" />}
              color="orange"
              description="환불/전체 결제 비율"
            />
            <ThemedStatCard
              title="대기 결제"
              value={`${dashboardStats.pendingPayments}건`}
              icon={<Clock className="h-4 w-4" />}
              color="yellow"
              description="승인/처리 대기"
            />
            <ThemedStatCard
              title="완료 결제"
              value={`${dashboardStats.completedPayments}건`}
              icon={<CheckCircle className="h-4 w-4" />}
              color="blue"
              description="처리 완료된 결제"
            />
          </CardGrid>
        </div>
      )}

      {/* 예약 관리 탭 */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          <BookingTable
            bookings={bookings}
            type="personal-lesson"
            onApprove={(id) => handleBookingAction(id, 'approve', undefined, 'personal-lesson')}
            onReject={(id) => handleBookingAction(id, 'reject', undefined, 'personal-lesson')}
          />
          <BookingTable
            bookings={bookings}
            type="lane-rental"
            onApprove={(id) => handleBookingAction(id, 'approve', undefined, 'lane-rental')}
            onReject={(id) => handleBookingAction(id, 'reject', undefined, 'lane-rental')}
          />
        </div>
      )}

      {/* 결제 관리 탭 */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <ThemedStatCard
              title="총 결제액"
              value={formatCurrency(payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0))}
              icon={<DollarSign className="h-4 w-4" />}
              color="green"
              description="완료된 결제 총액"
            />
            <ThemedStatCard
              title="완료된 결제"
              value={`${payments.filter(p => p.status === 'completed').length}건`}
              icon={<CheckCircle className="h-4 w-4" />}
              color="blue"
              description="처리 완료된 결제"
            />
            <ThemedStatCard
              title="환불 건수"
              value={`${payments.filter(p => p.status === 'refunded' || (p as any).refundAmount > 0).length}건`}
              icon={<XCircle className="h-4 w-4" />}
              color="red"
              description="처리된 환불"
            />
            <ThemedStatCard
              title="총 결제 건수"
              value={`${payments.length}건`}
              icon={<CreditCard className="h-4 w-4" />}
              color="purple"
              description="전체 결제 건수"
            />
          </div>
          <PaymentTable
            payments={payments}
            onCancel={(id) => handlePaymentAction(id, 'cancel')}
            onRefund={(id) => handlePaymentAction(id, 'refund')}
          />
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
