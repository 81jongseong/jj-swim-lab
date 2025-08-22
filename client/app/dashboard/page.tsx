"use client";

import { useEffect, useState, Suspense, lazy } from "react";
import apiClient from "@/utils/api";

// 동적 임포트로 코드 스플리팅 적용
const StatsCards = lazy(() => import('@/components/dashboard/StatsCards'));
const RecentBookings = lazy(() => import('@/components/dashboard/RecentBookings'));

interface MemberStats {
  totalBookings: number;
  activeCourses: number;
  totalPayments: number;
  nextLesson: string | null;
}

export default function MemberDashboard() {
  const [stats, setStats] = useState<MemberStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiClient.getUserDashboard();
        if (res.data) {
          const d = res.data;
          setStats({
            totalBookings: d?.stats?.totalBookings ?? 0,
            activeCourses: d?.stats?.enrolledCourses ?? d?.stats?.totalCourses ?? 0,
            totalPayments: d?.stats?.totalPaymentsAmount ?? d?.stats?.totalPayments ?? 0,
            nextLesson: d?.data?.recentBookings?.[0]
              ? `${new Date(d.data.recentBookings[0].date).toISOString().slice(0, 10)} ${
                  d.data.recentBookings[0].startTime
                }-${d.data.recentBookings[0].endTime}`
              : null,
          });
          setRecentBookings(d?.data?.recentBookings || []);
        }
      } catch (error) {
        console.error('대시보드 데이터 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">로딩 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-single-line">회원 대시보드</h1>

        {/* 통계 카드 - 코드 스플리팅 적용 */}
        <Suspense fallback={
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                <div className="flex items-center">
                  <div className="p-2 bg-gray-200 rounded-lg w-12 h-12"></div>
                  <div className="ml-4 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        }>
          <StatsCards stats={stats} />
        </Suspense>

        {/* 최근 예약 - 코드 스플리팅 적용 */}
        <Suspense fallback={
          <div className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        }>
          <RecentBookings bookings={recentBookings} />
        </Suspense>
      </div>
    </div>
  );
}

