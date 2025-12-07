/**
 * @file 학생 강습 수강 신청 및 결제 페이지
 * @description 센터 공개 강습 카드에서 진입하는 학생용 결제/신청 플로우를 제공합니다.
 *
 * @연동되는 데이터:
 * - 공개 강습 조회 API (/api/courses/public/:courseId)
 * - 공개 강습 신청 API (/api/courses/public/:courseId/apply)
 *
 * @연동되는 파일:
 * - client/app/center/[centerSlug]/admin/courses/page.tsx (viewOnly 강습 카드 → 신청 버튼)
 * - client/utils/api.ts (apiClient)
 */

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui';
import withAuth from '@/components/withAuth';
import apiClient from '@/utils/api';
import { LoadingState, ErrorState } from '@/components/common';

interface PublicCourseDetail {
  _id: string;
  name: string;
  description: string;
  level: string;
  duration: number;
  price: number;
  maxStudents: number;
  currentStudents: number;
  status: string;
  schedule: Array<{ day: string; startTime: string; endTime?: string }>;
  instructor?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  center?: {
    _id: string;
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    region?: string;
    district?: string;
    city?: string;
    province?: string;
  } | null;
  tags?: string[];
  classInfo?: {
    className?: string;
    classType?: string;
    startDate?: string;
    endDate?: string;
  } | null;
  isPersonalLesson?: boolean;
  courseType?: string;
}

interface PaymentResult {
  paymentId: string;
  status: string;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  course: {
    _id: string;
    name: string;
    price: number;
  };
}

type PageState = 'loading' | 'ready' | 'error';
type SubmitState = 'idle' | 'processing' | 'success' | 'error';

const dayLabels: Record<string, string> = {
  monday: '월요일',
  tuesday: '화요일',
  wednesday: '수요일',
  thursday: '목요일',
  friday: '금요일',
  saturday: '토요일',
  sunday: '일요일',
};

const paymentOptions = [
  {
    id: 'card',
    label: '신용/체크카드',
    description: '온라인 카드 결제로 즉시 결제 진행',
  },
  {
    id: 'transfer',
    label: '계좌이체',
    description: '센터 지정 계좌로 입금 후 확인',
  },
  {
    id: 'cash',
    label: '현장 결제',
    description: '센터 방문 시 현장 결제',
  },
  {
    id: 'online',
    label: '간편결제',
    description: '카카오페이/네이버페이 등 간편결제 요청',
  },
];

function StudentCourseApplyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const courseId = searchParams.get('courseId');
  const centerSlug = searchParams.get('center') || '';

  const [pageState, setPageState] = useState<PageState>('loading');
  const [pageError, setPageError] = useState<string>('');
  const [course, setCourse] = useState<PublicCourseDetail | null>(null);

  const [selectedMethod, setSelectedMethod] = useState<string>('card');
  const [notes, setNotes] = useState<string>('');
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [submitError, setSubmitError] = useState<string>('');
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);

  useEffect(() => {
    if (!courseId) {
      setPageError('수강 신청할 강습 정보가 전달되지 않았습니다.');
      setPageState('error');
      return;
    }

    const load = async () => {
      setPageState('loading');
      setPageError('');

      const response = await apiClient.getPublicCourse(courseId);
      if (!response.success) {
        setPageError(response.message || response.error || '강습 정보를 불러오는 중 오류가 발생했습니다.');
        setPageState('error');
        return;
      }

      setCourse(response.data as PublicCourseDetail);
      setPageState('ready');
    };

    load();
  }, [courseId]);

  const scheduleText = useMemo(() => {
    if (!course) return '';
    if (!course.schedule || course.schedule.length === 0) return '시간표 정보가 없습니다.';

    return course.schedule
      .map((item) => {
        const label = dayLabels[item.day?.toLowerCase?.() || item.day] || item.day;
        return `${label || ''} ${item.startTime || ''}${item.endTime ? ` - ${item.endTime}` : ''}`.trim();
      })
      .join(', ');
  }, [course]);

  const seatsInfo = useMemo(() => {
    if (!course) return null;
    const percent = course.maxStudents > 0 ? Math.min((course.currentStudents / course.maxStudents) * 100, 100) : 0;
    return {
      percent,
      highlight: percent >= 100,
    };
  }, [course]);

  const handleSubmit = async () => {
    if (!course || !courseId) return;

    setSubmitState('processing');
    setSubmitError('');

    const response = await apiClient.applyForPublicCourse(courseId, {
      paymentMethod: selectedMethod,
      notes: notes.trim() || undefined,
    });

    if (!response.success) {
      setSubmitState('error');
      setSubmitError(response.message || response.error || '결제 요청 중 오류가 발생했습니다. 다시 시도해주세요.');
      return;
    }

    setPaymentResult(response.data as PaymentResult);
    setSubmitState('success');
  };

  const handleViewPayments = () => {
    router.push('/payments');
  };

  const handleBackToCenter = () => {
    if (centerSlug) {
      router.push(`/center/${centerSlug}/admin/courses?viewOnly=true`);
    } else {
      router.push('/map');
    }
  };

  if (pageState === 'loading') {
    return <LoadingState message="강습 정보를 불러오는 중입니다..." size="lg" fullScreen />;
  }

  if (pageState === 'error' || !course) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 pb-12">
        <div className="max-w-3xl mx-auto px-4">
          <ErrorState
            message={pageError || '강습 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.'}
            onRetry={handleBackToCenter}
            retryText="강습 목록으로 돌아가기"
            className="py-24"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-10">
          <button
            onClick={handleBackToCenter}
            className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700"
          >
            ← 강습 목록으로 돌아가기
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-8">
          <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6">
            <header className="space-y-3">
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                <ShieldCheck className="h-4 w-4" /> 공식 강습 신청
              </span>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight">
                {course.name}
              </h1>
              <p className="text-slate-600 leading-relaxed">
                {course.description}
              </p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <Calendar className="h-5 w-5 text-blue-500 mt-1" />
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">강습 일정</p>
                  <p className="text-sm text-slate-700 mt-1 leading-relaxed break-words">{scheduleText}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <Clock className="h-5 w-5 text-blue-500 mt-1" />
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">강습 시간</p>
                  <p className="text-sm text-slate-700 mt-1">{course.duration}분</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3 sm:col-span-2">
                <Users className="h-5 w-5 text-blue-500 mt-1" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase">정원</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-slate-700">
                      {course.currentStudents} / {course.maxStudents}명
                    </span>
                    {seatsInfo && (
                      <span
                        className={`text-xs font-semibold ${
                          seatsInfo.highlight ? 'text-red-500' : 'text-blue-600'
                        }`}
                      >
                        {seatsInfo.percent.toFixed(0)}% 예약됨
                      </span>
                    )}
                  </div>
                  <div className="mt-3 w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        seatsInfo?.highlight ? 'bg-red-400' : 'bg-blue-500'
                      } transition-all duration-500`}
                      style={{ width: `${seatsInfo?.percent ?? 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {course.center && (
              <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-inner space-y-3">
                <h2 className="text-lg font-semibold text-slate-900">센터 정보</h2>
                <div className="flex flex-col gap-2 text-sm text-slate-600">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span>{course.center.address || '주소 정보 없음'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Users className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span>{course.center.name}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CreditCard className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span>{course.center.phone || '대표 번호 미등록'}</span>
                  </div>
                </div>
              </div>
            )}
          </section>

          <aside className="bg-white rounded-3xl border border-slate-100 shadow-lg p-7 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">결제 정보</h2>
              <p className="text-sm text-slate-500 mt-1">
                결제 요청 후 센터/관리자 확인을 거쳐 결제가 완료됩니다.
              </p>
            </div>

            <div className="p-4 border border-blue-100 rounded-2xl bg-blue-50">
              <p className="text-xs font-semibold text-blue-600 uppercase">결제 금액</p>
              <p className="text-3xl font-extrabold text-blue-700 mt-2">
                {course.price.toLocaleString()}원
              </p>
              <p className="text-xs text-blue-600 mt-1">
                ※ 결제 완료 후 강습이 확정됩니다.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-700">결제 방법 선택</p>
              <div className="space-y-2">
                {paymentOptions.map((method) => {
                  const isSelected = selectedMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedMethod(method.id)}
                      className={`w-full text-left border rounded-2xl px-4 py-3 transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 shadow-sm'
                          : 'border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-900">{method.label}</span>
                        {isSelected && <CheckCircle className="h-4 w-4 text-blue-500" />}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{method.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="apply-notes" className="text-sm font-semibold text-slate-700">
                센터 전달 메모 (선택)
              </label>
              <textarea
                id="apply-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                className="w-full border border-slate-200 rounded-2xl px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none"
                placeholder="레슨 희망 사항이나 문의사항을 적어주세요."
              />
            </div>

            {submitError && submitState === 'error' && (
              <div className="border border-red-100 bg-red-50 text-red-600 rounded-2xl px-4 py-3 text-sm">
                {submitError}
              </div>
            )}

            {submitState === 'success' && paymentResult && (
              <div className="border border-green-100 bg-green-50 rounded-2xl p-4 space-y-2 text-sm text-green-700">
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle className="h-4 w-4" />
                  수강 신청이 접수되었습니다.
                </div>
                <p>결제 상태: <strong className="font-semibold">{paymentResult.status === 'pending' ? '결제 대기' : paymentResult.status}</strong></p>
                <p>결제번호: <span className="font-mono">{paymentResult.transactionId}</span></p>
                <p className="text-xs text-green-600">
                  관리자가 결제를 확인하면 자동으로 강습이 확정됩니다. 결제 내역에서 진행 상황을 확인하세요.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Button
                onClick={handleSubmit}
                disabled={submitState === 'processing' || submitState === 'success'}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-base font-semibold rounded-2xl flex items-center justify-center gap-2"
              >
                {submitState === 'processing' ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    결제 요청 중...
                  </>
                ) : submitState === 'success' ? (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    결제 요청 완료
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    결제 요청하기
                  </>
                )}
              </Button>

              {submitState === 'success' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <Button
                    onClick={handleViewPayments}
                    className="w-full bg-slate-900 hover:bg-black text-white py-2.5 rounded-2xl flex items-center justify-center gap-2"
                  >
                    결제 내역 보기
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleBackToCenter}
                    className="w-full py-2.5 rounded-2xl border-slate-300 hover:bg-slate-100"
                  >
                    다른 강습 둘러보기
                  </Button>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default withAuth(StudentCourseApplyPage, { requireTypes: ['student'] });
