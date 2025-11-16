/**
 * 📋 JJ Swim Lab - 센터 관리자 예약·결제 관리 페이지
 * 
 * 📋 **페이지 목적**
 * - 예약 관리, 결제 관리, 승인 관리를 하나의 페이지로 통합
 * - 센터 관리자가 예약과 결제를 효율적으로 관리
 * - 대시보드에서 전체 현황 한눈에 파악
 * 
 * 🔄 **주요 기능**
 * - 통합 대시보드 (예약/결제/승인 현황)
 * - 예약 관리 (개인레슨, 레인대여)
 * - 결제 관리 (결제 내역, 환불)
 * - 승인 관리 (강습 신청, 결제 승인, 일정 변경, 환불 요청)
 * 
 * 🗄️ **데이터 연동**
 * - PersonalLesson, LaneRental 모델과 연동
 * - Payment 모델과 연동
 * - Approval 모델과 연동
 * - User 모델과 연동 (강사, 학생)
 * - MongoDB Atlas 데이터베이스
 * 
 * 📅 **개발 히스토리**
 * - 2025-01-09: 예약/결제/승인 통합 페이지 생성
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2025-01-09
 * - 상태: ✅ 통합 완료
 */

'use client';
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import Modal from '@/components/ui/modal';
import ThemedStatCard from '@/components/ThemedStatCard';
import { Button } from '@/components/Button';
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
import SimplePersonalLessonModal from '@/components/center-admin/SimplePersonalLessonModal';
import SimpleLaneRentalModal from '@/components/center-admin/SimpleLaneRentalModal';
import BookingTable from '@/components/center-admin/BookingTable';
import PaymentTable from '@/components/center-admin/PaymentTable';
import apiClient from '@/utils/api';

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
  paymentId?: string;
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
  refundCount: number; // 환불 건수
  refundRate: number; // 환불률 = 환불건/총결제건
  averageTicketSize: number; // 평균 결제 금액(완료 건 기준)
  paymentCompletionRate: number; // 결제 완료율 = 완료건/총결제건
}

type TabType = 'dashboard' | 'bookings' | 'payments';

function IntegratedManagement() {
  const { user, loading: authLoading } = useAuth();
  // URL 쿼리 파라미터에서 탭 읽기
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
  const [changeCourseForBookingId, setChangeCourseForBookingId] = useState<string | null>(null);
  const [changeCourseOptions, setChangeCourseOptions] = useState<any[]>([]);

  // (debug) 개발 중 디버그가 필요할 경우 true로 변경
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

  // 탭 전환 시 상단으로 스크롤
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeTab]);

  // 대시보드 통계 업데이트 함수 (useCallback으로 메모이제이션)
  const updateDashboardStats = useCallback(() => {
    // payments와 approvals 배열에서 직접 계산
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
    
    // 날짜 기준 계산
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // 이번 주 시작일 (일요일 기준)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    
    // 오늘 예약 계산
    const todayBookings = bookings.filter(b => {
      if (!b.date) return false;
      const bookingDate = new Date(b.date);
      bookingDate.setHours(0, 0, 0, 0);
      return bookingDate.getTime() >= today.getTime() && bookingDate.getTime() < tomorrow.getTime();
    }).length;

    // 이번 주 예약 계산
    const weekBookings = bookings.filter(b => {
      if (!b.date) return false;
      const bookingDate = new Date(b.date);
      bookingDate.setHours(0, 0, 0, 0);
      return bookingDate.getTime() >= startOfWeek.getTime() && bookingDate.getTime() < endOfWeek.getTime();
    }).length;

    // 개인레슨과 레인대여 개수 계산
    const personalLessons = bookings.filter(b => b.type === 'personal-lesson').length;
    const laneRentals = bookings.filter(b => b.type === 'lane-rental').length;

    setDashboardStats(prev => ({
      ...prev,
      todayBookings: todayBookings,
      weekBookings: weekBookings,
      personalLessons: personalLessons,
      laneRentals: laneRentals,
      pendingPayments,
      completedPayments,
      pendingApprovalCount,
      totalRevenue: totalRevenue || prev.totalRevenue || 0,
      refundCount: refundedPayments,
      refundRate,
      averageTicketSize,
      paymentCompletionRate
    }));
  }, [payments, approvals, bookings]);

  const loadBookings = async () => {
    try {
      const response = await apiClient.get('/api/center-admin/bookings');
      if (response.success) {
        setBookings(response.data?.bookings || []);
      }
    } catch (error) {
      if (DEBUG) console.error('예약 데이터 로딩 실패:', error);
    }
  };

  const loadPayments = async () => {
    try {
      const response = await apiClient.get('/api/center-admin/payments');
      if (response.success) {
        // Payment 모델은 user 필드 사용 (populate로 name, email 포함)
        const formattedPayments = (response.data?.payments || []).map((payment: any) => {
          const purposeLabel = payment.purpose === 'personal-lesson'
            ? '개인레슨'
            : payment.purpose === 'lane-rental'
            ? '레인대여'
            : payment.purpose;
          // 코스 결제는 항상 승인됨으로 표시(과거 pending 데이터도 표시상 completed로)
          const displayStatus = payment.purpose === 'course' && payment.status === 'pending' ? 'completed' : payment.status;
          return {
          _id: payment._id,
          userId: payment.user?._id || payment.user || payment.userId,
          userName: payment.user?.name || payment.userName || '알 수 없음',
          userEmail: payment.user?.email || payment.userEmail || '',
          amount: payment.amount,
          currency: payment.currency || 'KRW',
          paymentMethod: payment.paymentMethod,
            status: displayStatus,
          description: payment.relatedCourse?.name || (payment.purpose === 'course' ? '강습 결제' : purposeLabel || ''),
          createdAt: payment.createdAt ? new Date(payment.createdAt) : new Date(),
          completedAt: payment.processedAt ? new Date(payment.processedAt) : undefined,
          transactionId: payment.transactionId,
          refundAmount: payment.refundAmount
        }})
        // 취소/환불된 카드는 결제 관리에서 노출하지 않음
        .filter((p: any) => !['cancelled', 'refunded'].includes(p.status));
        // (debug) 결제 데이터 로드 로그
        if (DEBUG) console.log('💳 결제 데이터 로드:', formattedPayments.length, '건');
        setPayments(formattedPayments);
      } else {
        if (DEBUG) console.error('결제 데이터 로딩 실패:', response.message);
      }
    } catch (error) {
      if (DEBUG) console.error('결제 데이터 로딩 실패:', error);
    }
  };

  const loadApprovals = async () => {
    try {
      const response = await apiClient.get('/api/approvals');
      if (response.success) {
        // Approval 모델 구조에 맞게 변환
        const formattedApprovals: ApprovalItem[] = ((response.data?.approvals || response.data || [])).map((approval: any) => {
          // userId populate된 경우 user.name, user.email 사용
          const user = approval.userId && typeof approval.userId === 'object' 
            ? approval.userId 
            : null;
          const course = approval.courseId && typeof approval.courseId === 'object'
            ? approval.courseId
            : null;

          return {
            id: approval._id?.toString() || approval.id,
            type: approval.type,
            title: approval.title,
            description: approval.description,
            paymentId: approval.paymentId,
            requesterName: user?.name || approval.requesterName || '알 수 없음',
            requesterEmail: user?.email || approval.requesterEmail || '',
            requestDate: approval.requestDate 
              ? new Date(approval.requestDate).toLocaleDateString('ko-KR')
              : new Date(approval.createdAt).toLocaleDateString('ko-KR'),
            status: approval.status,
            priority: approval.priority || 'medium',
            estimatedAmount: approval.estimatedAmount,
            courseName: course?.name || approval.courseName,
            scheduleInfo: approval.scheduleInfo,
            refundInfo: approval.refundInfo,
          };
        });
        // (debug) 승인 데이터 로드 로그
        if (DEBUG) console.log('✅ 승인 데이터 로드:', formattedApprovals.length, '건');
        setApprovals(formattedApprovals);
      } else {
        if (DEBUG) console.error('승인 데이터 로딩 실패:', response.message);
      }
    } catch (error) {
      if (DEBUG) console.error('승인 데이터 로딩 실패:', error);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      // 모든 데이터를 병렬로 로드
      await Promise.all([
        loadBookings(),
        loadPayments(),
        loadApprovals()
      ]);
      // 상태 업데이트 완료를 위해 다음 렌더링 사이클까지 대기
      // React 18에서는 상태 업데이트가 배치되므로 requestAnimationFrame 사용
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          updateDashboardStats();
          setLoading(false);
        });
      });
    } catch (error) {
      if (DEBUG) console.error('데이터 로딩 실패:', error);
      setLoading(false);
    }
  };

  // 데이터 로딩 useEffect
  useEffect(() => {
    if (!authLoading && user) {
      // 권한 확인 (로딩 완료 후에만 체크)
      const isCenterAdmin = (
        ['centerAdmin', 'center-admin', 'superAdmin'].includes(user.userType) ||
        user.email === 'center@swim.com'
      );
      
      if (isCenterAdmin) {
        loadAllData();
      }
    }
  }, [authLoading, user]);

  // payments와 approvals, bookings 상태가 업데이트될 때마다 대시보드 통계 업데이트
  useEffect(() => {
    // loading이 false일 때만 업데이트 (로딩 완료 후)
    if (!loading) {
      updateDashboardStats();
    }
  }, [payments, approvals, bookings, loading, updateDashboardStats]);

  // 권한 확인 (로딩 완료 후에만 체크)
  const isCenterAdmin = !authLoading && user && (
    ['centerAdmin', 'center-admin', 'superAdmin'].includes(user.userType) ||
    user.email === 'center@swim.com'
  );
  
  // 인증 로딩 중이면 로딩 화면 표시
  if (authLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">인증 확인 중...</p>
          </div>
        </div>
      </div>
    );
  }

  // 권한이 없으면 리다이렉트 (인증 로딩 완료 후)
  if (!authLoading && user && !isCenterAdmin) {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
    return null;
  }

  // 인증 로딩은 완료되었지만 user가 아직 없는 경우 (토큰 만료 등)
  if (!authLoading && !user) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">사용자 정보를 확인하는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">데이터를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleBookingAction = async (bookingId: string, action: 'approve' | 'reject', instructorId?: string, bookingType?: 'personal-lesson' | 'lane-rental') => {
    try {
      const endpoint = bookingType === 'lane-rental'
        ? `/api/bookings/lane-rentals/${bookingId}/status`
        : `/api/bookings/personal-lessons/${bookingId}/status`;
      const status = action === 'approve' ? (bookingType === 'lane-rental' ? 'approved' : 'accepted') : 'rejected';

      // 개인레슨 승인 시 강사 ID가 필수 → 간단 선택 프롬프트 제공
      let finalInstructorId = instructorId;
      if (bookingType === 'personal-lesson' && action === 'approve' && !finalInstructorId) {
        try {
          const res = await apiClient.get('/api/center-admin/instructors');
          const instructors: any[] = res.data?.instructors || res.data || [];
          if (instructors.length === 0) {
            alert('배정 가능한 강사가 없습니다. 강사를 먼저 등록해 주세요.');
            return;
          }
          const list = instructors.map((i, idx) => `${idx + 1}. ${i.name} (${i._id})`).join('\n');
          const picked = prompt(`승인하려면 강사를 선택하세요. 숫자를 입력:
${list}`);
          const idx = picked ? parseInt(picked, 10) - 1 : -1;
          if (isNaN(idx) || idx < 0 || idx >= instructors.length) {
            alert('올바른 번호를 입력해주세요.');
            return;
          }
          finalInstructorId = instructors[idx]._id;
        } catch (e) {
          if (DEBUG) console.error('강사 목록 조회 실패:', e);
          alert('강사 목록을 불러올 수 없습니다. 잠시 후 다시 시도하세요.');
          return;
        }
      }

      // 1) 낙관적 업데이트로 즉시 반영
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status, instructorId: finalInstructorId || b.instructorId } as any : b));
      updateDashboardStats();

      const response = await apiClient.patch(endpoint, {
        status,
        instructorId: finalInstructorId
      });

      if (response.success) {
        await loadAllData();
      } else {
        if (DEBUG) console.warn('예약 상태 변경 API 실패:', response.message);
      }
    } catch (error) {
      if (DEBUG) console.error('예약 처리 실패:', error);
    }
  };

  const handleChangeCourse = async (bookingId: string) => {
    try {
      // 과정 목록 로드
      const res = await apiClient.get('/api/center-admin/courses');
      const courses: any[] = res.data || res.data?.courses || [];
      if (!Array.isArray(courses) || courses.length === 0) {
        alert('변경할 수 있는 과정이 없습니다.');
        return;
      }
      // 기준 예약(가격/요일/시간) 추출
      const baseBooking = bookings.find(b => b._id === bookingId) as any;
      const basePrice = Number(baseBooking?.price || 0);
      const baseDate = baseBooking?.date ? new Date(baseBooking.date) : null;
      const baseDay = baseDate ? ['일','월','화','수','목','금','토'][baseDate.getDay()] : null;
      const baseTime = (baseBooking?.time || '').slice(0,5); // HH:mm

      // 같은 가격 필터 + 동일 요일/시간대 우선 필터
      const dayName = (v: any) => {
        const d = String(v || '').toLowerCase();
        const map: any = { mon: '월', tue: '화', wed: '수', thu: '목', fri: '금', sat: '토', sun: '일' };
        if (['월','화','수','목','금','토','일'].includes(v)) return v;
        return map[d] || v || '';
      };
      const withinSameSlot = (c: any) => {
        const slots = Array.isArray(c.schedule) ? c.schedule : [];
        return slots.some((s: any) => {
          const d = dayName(s?.day ?? s?.dayOfWeek);
          const st = (s?.startTime || '').slice(0,5);
          return (!baseDay || d === baseDay) && (!baseTime || st === baseTime);
        });
      };
      const bySamePrice = (c: any) => Number(c.price || 0) === basePrice;

      let filtered = courses.filter((c: any) => bySamePrice(c) && withinSameSlot(c));
      // 시간/요일 정확히 일치하는 반이 없으면, 같은 가격만 기준으로 전체 제시
      if (filtered.length === 0) {
        filtered = courses.filter(bySamePrice);
      }
      if (filtered.length === 0) {
        alert('해당 요일/시간대의 반이 없습니다.');
        return;
      }
      // 준비된 옵션을 모달로 표시 (모든 요일 표시, 한글 변환)
      const toLabel = (c: any) => {
        const slots: any[] = Array.isArray(c.schedule) ? c.schedule : [];
        const dn = (v: any) => {
          const raw = String(v || '').trim();
          if (['월','화','수','목','금','토','일'].includes(raw)) return raw;
          const lower = raw.toLowerCase();
          const mapShort: any = { mon: '월', tue: '화', wed: '수', thu: '목', fri: '금', sat: '토', sun: '일' };
          const mapFull: any = { monday: '월', tuesday: '화', wednesday: '수', thursday: '목', friday: '금', saturday: '토', sunday: '일' };
          if (mapFull[lower]) return mapFull[lower];
          if (mapShort[lower]) return mapShort[lower];
          // 숫자/요일번호 매핑 (0/7=일, 1=월 ... 6=토)
          const n = Number(lower);
          if (!Number.isNaN(n)) {
            const arr = ['일','월','화','수','목','금','토','일'];
            if (n >= 0 && n <= 7) return arr[n];
          }
          // 앞 3글자 줄임이 들어온 경우
          const first3 = lower.slice(0,3);
          if (mapShort[first3]) return mapShort[first3];
          return raw;
        };
        const dayList = Array.from(new Set(slots.map(s => dn(s?.day ?? s?.dayOfWeek)).filter(Boolean)));
        const timeList = Array.from(new Set(slots.map(s => {
          const st = s?.startTime || '';
          const et = s?.endTime || '';
          return st && et ? `${st}-${et}` : '';
        }).filter(Boolean)));
        const dayText = dayList.join(', ');
        const timeText = timeList.length === 1 ? timeList[0] : (timeList.length > 1 ? '다양' : '');
        const instructor = c.instructorName || c.instructor?.name || '';
        const current = Number(c.classInfo?.currentEnrollment ?? (c.enrolledStudents?.length || 0));
        const max = Number(c.maxStudents ?? 0);
        const cap = max ? `${current}/${max}` : `${current}`;
        return { id: c._id, name: c.name, day: dayText, time: timeText, instructor, capacity: cap, price: c.price };
      };
      setChangeCourseOptions(filtered.map(toLabel));
      setChangeCourseForBookingId(bookingId);
      return;
    } catch (e) {
      if (DEBUG) console.error('반 변경 실패:', e);
      alert('반 변경에 실패했습니다.');
    }
  };

  const handleChangeLane = async (bookingId: string) => {
    try {
      const value = prompt('변경할 레인 번호를 입력하세요 (숫자)');
      const laneNumber = value ? parseInt(value, 10) : NaN;
      if (!laneNumber || isNaN(laneNumber) || laneNumber <= 0) {
        alert('올바른 레인 번호를 입력해주세요.');
        return;
      }
      const res = await apiClient.patch(`/api/bookings/lane-rentals/${bookingId}/lane`, { laneNumber });
      if (res.success) {
        await loadAllData();
        alert('레인 번호가 변경되었습니다.');
      } else {
        alert(res.message || '레인 변경 중 오류가 발생했습니다.');
      }
    } catch (e) {
      if (DEBUG) console.error('레인 변경 실패:', e);
      alert('레인 변경에 실패했습니다.');
    }
  };

  const handlePaymentAction = async (paymentId: string, action: 'refund' | 'cancel') => {
    try {
      // 1) 낙관적 업데이트: UI를 즉시 변경
      setPayments(prev => prev.map(p => p._id === paymentId ? {
        ...p,
        status: action === 'refund' ? 'refunded' : 'cancelled',
        refundAmount: action === 'refund' ? (p.refundAmount || p.amount) : p.refundAmount
      } : p));
      // 대시보드 통계 즉시 반영
      updateDashboardStats();

      // 2) 실제 API 호출
      const url = action === 'refund'
        ? `/api/center-admin/payments/${paymentId}/refund`
        : `/api/center-admin/payments/${paymentId}/cancel`;
      const res = await apiClient.patch(url, action === 'refund' ? {} : {});
      if (res.success) {
        await loadAllData();
        alert(action === 'refund' ? '결제가 환불되었습니다.' : '결제가 취소되었습니다.');
      } else {
        alert(res.message || '처리 중 오류가 발생했습니다.');
      }
    } catch (error) {
      if (DEBUG) console.error('결제 처리 실패:', error);
    }
  };

  const handleApprovePayment = async (paymentId: string) => {
    try {
      // 승인 화면 없이 결제 직접 완료 처리
      const res = await apiClient.patch(`/api/center-admin/payments/${paymentId}/complete`, {});
      if (res.success) {
        await loadAllData();
        alert('결제가 완료되었습니다.');
      } else {
        alert(res.message || '결제 완료 처리 중 오류가 발생했습니다.');
      }
    } catch (e) {
      if (DEBUG) console.error('결제 완료 실패:', e);
      alert('결제 완료 처리에 실패했습니다.');
    }
  };

  const handleApproval = async (id: string, action: 'approve' | 'reject') => {
    try {
      const response = await apiClient.put(`/api/approvals/${id}/process`, {
        action: action,
        comments: action === 'approve' ? '센터에서 승인되었습니다.' : '센터에서 거부되었습니다.',
        rejectionReason: action === 'reject' ? '센터 정책에 따른 거부' : undefined
      });
      
      if (response.success) {
        await loadAllData();
        alert(`요청이 ${action === 'approve' ? '승인' : '거부'}되었습니다.`);
      }
    } catch (error) {
      // API 실패 시 로컬 상태 업데이트
      setApprovals(prev => 
        prev.map(item => 
          item.id === id 
            ? { ...item, status: action === 'approve' ? 'approved' : 'rejected' }
            : item
        )
      );
      updateDashboardStats();
      alert(`요청이 ${action === 'approve' ? '승인' : '거부'}되었습니다.`);
    }
  };

  const handlePersonalLessonSubmit = async (data: any) => {
    try {
      // center-admin 전용 신청 엔드포인트로 매핑
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
        instructorId: data.instructorId, // 선택 UI가 없는 경우 서버에서 배정 실패 시 메시지 안내
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

      const response = await apiClient.post('/api/center-admin/bookings/personal-lessons/request', payload);

      if (response.success) {
        await loadAllData();
        setShowPersonalLessonModal(false);
        alert('개인레슨 신청이 완료되었습니다.');
      } else {
        if (DEBUG) console.warn('개인레슨 신청 실패:', response.message);
        alert('개인레슨 신청에 실패했습니다. 입력 값을 확인해 주세요.');
      }
    } catch (error) {
      if (DEBUG) console.error('개인레슨 신청 실패:', error);
      alert('개인레슨 신청에 실패했습니다.');
    }
  };

  const handleLaneRentalSubmit = async (data: any) => {
    try {
      const response = await apiClient.post('/api/lane-rentals', data);

      if (response.success) {
        await loadAllData();
        setShowLaneRentalModal(false);
        alert('레인대여 신청이 완료되었습니다.');
      } else {
        if (DEBUG) console.error('레인대여 신청 실패:', response.message);
        alert('레인대여 신청에 실패했습니다.');
      }
    } catch (error) {
      if (DEBUG) console.error('레인대여 신청 실패:', error);
      alert('레인대여 신청에 실패했습니다.');
    }
  };

  // 유틸리티 함수들
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected': case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
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

  const formatCurrency = (amount: number, currency: string = 'KRW') => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods: { [key: string]: string } = {
      'card': '카드',
      'bank_transfer': '계좌이체',
      'cash': '현금',
      'mobile': '모바일'
    };
    return methods[method] || method;
  };

  const getTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'course_enrollment': '강습 신청',
      'payment_approval': '결제 승인',
      'schedule_change': '일정 변경',
      'refund_request': '환불 요청'
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">데이터를 불러오는 중...</p>
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
              📋 예약·결제 관리
            </h1>
            <p className="text-gray-600">예약, 결제, 승인을 한 곳에서 관리하세요</p>
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
          {/* 통합 통계 카드 (1행 핵심 KPI) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <ThemedStatCard
              title="승인대기"
              value={`${dashboardStats.pendingApprovalCount}건`}
              icon={<AlertCircle className="h-4 w-4" />}
              color="yellow"
              description="승인 대기 중인 요청"
            />
            <ThemedStatCard
              title="오늘 예약"
              value={dashboardStats.todayBookings}
              icon={<Calendar className="h-4 w-4" />}
              color="blue"
              description="오늘 처리된 예약 수"
            />
            <ThemedStatCard
              title="개인레슨 예약"
              value={`${dashboardStats.personalLessons}건`}
              icon={<User className="h-4 w-4" />}
              color="purple"
              description="전체 개인레슨 예약"
            />
            <ThemedStatCard
              title="레인대여 예약"
              value={`${dashboardStats.laneRentals}건`}
              icon={<MapPin className="h-4 w-4" />}
              color="indigo"
              description="전체 레인대여 예약"
            />
            <ThemedStatCard
              title="총 매출"
              value={formatCurrency(dashboardStats.totalRevenue || payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0))}
              icon={<TrendingUp className="h-4 w-4" />}
              color="green"
              description="이번달 총 수익"
            />
            <ThemedStatCard
              title="결제 대기"
              value={`${dashboardStats.pendingPayments}건`}
              icon={<Clock className="h-4 w-4" />}
              color="orange"
              description="결제 대기 중"
            />
          </div>
          
          {/* 통합 통계 카드 (2행 결제 KPI) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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
          </div>

          {/* 최근 활동 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 최근 예약 */}
            <Card>
              <CardHeader>
                <CardTitle>최근 예약</CardTitle>
                <CardDescription>최근 처리된 예약 현황</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {bookings.slice(0, 5).map((booking) => (
                    <div key={booking._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {booking.type === 'personal-lesson' ? (
                          <User className="w-5 h-5 text-blue-600" />
                        ) : (
                          <MapPin className="w-5 h-5 text-green-600" />
                        )}
                        <div>
                          <p className="font-medium text-sm">{booking.memberName}</p>
                          <p className="text-xs text-gray-600">{booking.date} {booking.time}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </span>
                    </div>
                  ))}
                  {bookings.length === 0 && (
                    <p className="text-center text-gray-500 py-4">최근 예약이 없습니다.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 최근 승인 요청 */}
            <Card>
              <CardHeader>
                <CardTitle>최근 승인 요청</CardTitle>
                <CardDescription>결제 승인/강습 신청 등 대기중 항목</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {approvals
                    .filter(a => a.status === 'pending')
                    .slice(0, 5)
                    .map((item) => (
                      <div key={item.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(item.status)}
                            <div>
                              <p className="font-medium text-sm">{item.title}</p>
                              <p className="text-xs text-gray-600">
                                {getTypeLabel(item.type)} · {item.requesterName} · {item.requestDate}
                                {typeof item.estimatedAmount === 'number' ? ` · ${formatCurrency(item.estimatedAmount)}` : ''}
                              </p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                            {getStatusText(item.status)}
                          </span>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <Button size="sm" onClick={() => handleApproval(item.id, 'approve')}>승인</Button>
                          <Button size="sm" variant="outline" onClick={() => handleApproval(item.id, 'reject')}>거부</Button>
                        </div>
                      </div>
                    ))}
                  {approvals.filter(a => a.status === 'pending').length === 0 && (
                    <p className="text-center text-gray-500 py-4">승인 대기 요청이 없습니다.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 빠른 액션 */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>빠른 액션</CardTitle>
              <CardDescription>자주 사용하는 기능들에 빠르게 접근하세요.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button 
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center space-y-2 hover:bg-blue-50 hover:border-blue-300 transition-all"
                  onClick={() => setActiveTab('bookings')}
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium">예약 관리</span>
                </Button>
                <Button 
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center space-y-2 hover:bg-green-50 hover:border-green-300 transition-all"
                  onClick={() => setActiveTab('payments')}
                >
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="text-sm font-medium">결제 관리</span>
                </Button>

                <Button 
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center space-y-2 hover:bg-orange-50 hover:border-orange-300 transition-all"
                  onClick={() => setShowPersonalLessonModal(true)}
                >
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <User className="h-6 w-6 text-orange-600" />
                  </div>
                  <span className="text-sm font-medium">개인레슨 신청</span>
                </Button>
                <Button 
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center space-y-2 hover:bg-indigo-50 hover:border-indigo-300 transition-all"
                  onClick={() => setShowLaneRentalModal(true)}
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-indigo-600" />
                  </div>
                  <span className="text-sm font-medium">레인대여 신청</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 예약 관리 탭 */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          {/* 개인레슨 섹션 */}
          <BookingTable
            bookings={bookings}
            type="personal-lesson"
            onChangeCourse={handleChangeCourse}
          />

          {/* 레인대여 섹션 */}
          <BookingTable
            bookings={bookings}
            type="lane-rental"
            onChangeLane={handleChangeLane}
          />
        </div>
      )}

      {/* 결제 관리 탭 */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          {/* 통계 카드 */}
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

          {/* 결제 내역 목록 */}
          <PaymentTable
            payments={payments}
            onCancel={(id) => handlePaymentAction(id, 'cancel')}
            onRefund={(id) => handlePaymentAction(id, 'refund')}
          />
        </div>
      )}

      {/* 승인 관리 탭 제거 */}

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

      {/* 반변경 모달 */}
      <Modal isOpen={!!changeCourseForBookingId} onClose={() => { setChangeCourseForBookingId(null); setChangeCourseOptions([]); }} title="반 변경" size="lg">
        <div className="max-h-[60vh] overflow-auto divide-y">
          {changeCourseOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                // confirmChangeCourse inline to avoid adding another function
                (async () => {
                  const bookingForMember = bookings.find(b => b._id === changeCourseForBookingId) as any;
                  const memberId = bookingForMember?.memberId || bookingForMember?.studentId;
                  if (!memberId) { alert('회원 정보를 찾을 수 없습니다.'); return; }
                  const putRes = await apiClient.put(`/api/center-admin/members/${memberId}/course`, { courseId: opt.id });
                  if (putRes.success) {
                    setChangeCourseForBookingId(null);
                    setChangeCourseOptions([]);
                    await loadAllData();
                  } else {
                    alert(putRes.message || '반 변경 중 오류가 발생했습니다.');
                  }
                })();
              }}
              className="w-full text-left px-5 py-3 hover:bg-gray-50 focus:outline-none"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{opt.name}</div>
                  <div className="text-sm text-gray-600 mt-0.5">{opt.day} {opt.time} · {opt.instructor || '강사 미지정'}</div>
                  <div className="text-xs text-gray-500 mt-0.5">정원/등록: {opt.capacity}</div>
                </div>
                <div className="text-sm font-semibold text-gray-800 whitespace-nowrap">{(Number(opt.price)||0).toLocaleString()} 원</div>
              </div>
            </button>
          ))}
          {changeCourseOptions.length === 0 && (
            <div className="px-5 py-6 text-center text-gray-500">표시할 반이 없습니다.</div>
          )}
        </div>
        <div className="px-5 py-3 flex justify-end gap-2 border-t">
          <button onClick={() => { setChangeCourseForBookingId(null); setChangeCourseOptions([]); }} className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50">닫기</button>
        </div>
      </Modal>
    </div>
  );
}

export default IntegratedManagement;

