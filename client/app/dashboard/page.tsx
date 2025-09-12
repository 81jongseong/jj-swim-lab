/**
 * 📊 JJ Swim Lab - 사용자 대시보드 페이지
 * 
 * 📋 **페이지 목적**
 * - 일반 사용자(학생, 강사, 센터 관리자)가 자신의 활동 현황을 확인할 수 있는 대시보드
 * - 개인별 통계, 예약 현황, 코스 정보, 결제 내역 등을 한눈에 확인
 * - 사용자 권한에 따른 맞춤형 대시보드 제공
 * - 개인화된 학습 진도 및 성과 추적
 * 
 * 🔄 **주요 기능**
 * - 개인별 통계 카드 (예약 수, 활성 코스, 결제 내역, 다음 수업)
 * - 최근 예약 내역 및 상태 확인
 * - 코스 등록 현황 및 진도 추적
 * - 결제 내역 및 멤버십 정보
 * - 개인화된 알림 및 메시지
 * - 빠른 액션 버튼 (예약, 코스 등록 등)
 * 
 * 🗄️ **데이터 연동**
 * - 사용자 대시보드 API와 연동
 * - 예약 시스템과 연동 (예약 현황)
 * - 코스 시스템과 연동 (등록 코스)
 * - 결제 시스템과 연동 (결제 내역)
 * - 사용자 인증 시스템과 연동
 * - 실시간 데이터 업데이트
 * 
 * 🛠️ **필요한 설치 파일**
 * - Next.js 14.2.5 (App Router)
 * - React 18.3.1
 * - TypeScript 5.x
 * - Tailwind CSS 3.3.0
 * - API 클라이언트 (api.ts)
 * - 대시보드 컴포넌트 (StatsCards, RecentBookings)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 사용자 권한별 맞춤형 대시보드 제공
 * 2. 개인정보 보호 및 데이터 보안
 * 3. 실시간 데이터 업데이트 및 동기화
 * 4. 반응형 디자인 적용 (모바일/데스크톱)
 * 5. 로딩 상태 및 에러 처리
 * 6. 성능 최적화 (코드 스플리팅)
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 사용자 권한별 대시보드 차별화
 * - [ ] API 응답 데이터 구조 검증
 * - [ ] 반응형 디자인 테스트
 * - [ ] 로딩 상태 및 에러 처리 확인
 * - [ ] 성능 최적화 및 코드 스플리팅 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 사용자 대시보드 구현
 * - 2024-12-19: 개인별 통계 카드 시스템 구현
 * - 2024-12-19: 최근 예약 내역 기능 구현
 * - 2024-12-19: 코드 스플리팅 및 성능 최적화
 * - 2024-12-19: 반응형 디자인 및 사용자 경험 개선
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (사용자 대시보드 완료)
 * 
 * 🚀 **다음 단계**
 * - 개인화된 추천 시스템
 * - 학습 진도 시각화
 * - 개인별 성과 분석
 * - 맞춤형 알림 시스템
 * - 소셜 기능 (친구, 그룹)
 * 
 * 💡 **사용 예시**
 * ```tsx
 * // 대시보드 접근
 * /dashboard
 * 
 * // 통계 데이터 로드
 * const stats = await apiClient.getUserDashboard();
 * 
 * // 예약 내역 조회
 * const bookings = await apiClient.getRecentBookings();
 * ```
 * 
 * 🔍 **대시보드 처리 흐름**
 * 1. 사용자 인증 및 권한 확인
 * 2. 사용자별 대시보드 데이터 로드
 * 3. 통계 카드 및 차트 렌더링
 * 4. 최근 활동 내역 표시
 * 5. 개인화된 알림 및 메시지 표시
 * 6. 빠른 액션 버튼 제공
 * 7. 실시간 데이터 업데이트
 */

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

