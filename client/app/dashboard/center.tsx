"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/utils/api";
import withAuth from "@/components/withAuth";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

interface CenterStats {
  totalInstructors: number;
  totalStudents: number;
  totalCourses: number;
  activeCourses: number;
  totalBookings: number;
  totalRevenue: number;
}

function CenterDashboard() {
  const [stats, setStats] = useState<CenterStats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadStats = async () => {
      try {
        // 센터 통계 데이터 로드
        const response = await apiClient.get('/centers/dashboard');
        
        if (response.success && response.data) {
          const data = response.data;
          const overview = data.overview || {};
          setStats({
            totalInstructors: overview.totalInstructors || 0,
            totalStudents: overview.totalStudents || 0,
            totalCourses: overview.totalCourses || 0,
            activeCourses: overview.totalCourses || 0, // 활성 과정은 전체 과정과 동일
            totalBookings: overview.activeBookings || 0,
            totalRevenue: overview.recentPayments || 0,
          });
        }
      } catch (error) {
        console.error('센터 통계 로드 실패:', error);
        // 폴백으로 기본값 설정
        setStats({
          totalInstructors: 0,
          totalStudents: 0,
          totalCourses: 0,
          activeCourses: 0,
          totalBookings: 0,
          totalRevenue: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const quickActions = [
    {
      title: "사용자 관리",
      description: "강사와 회원 정보 관리",
      icon: "👥",
      color: "bg-blue-500",
      href: "/admin/users/center-users"
    },
    {
      title: "강습과정 관리",
      description: "강습과정 등록 및 관리",
      icon: "🏊",
      color: "bg-green-500",
      href: "/courses"
    },
    {
      title: "체크리스트 관리",
      description: "학습 체크리스트 관리",
      icon: "✅",
      color: "bg-purple-500",
      href: "/admin/checklists"
    },
    {
      title: "예약 관리",
      description: "강습 예약 및 일정 관리",
      icon: "📅",
      color: "bg-orange-500",
      href: "/admin/bookings"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">센터 대시보드</h1>
          <p className="text-gray-600">센터 운영 현황을 한눈에 확인하세요.</p>
        </div>

        {/* 통계 카드 */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <span className="text-2xl">👨‍🏫</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">전체 강사</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalInstructors}명</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <span className="text-2xl">👥</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">전체 회원</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}명</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <span className="text-2xl">🏊</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">전체 과정</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}개</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <span className="text-2xl">✅</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">활성 과정</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeCourses}개</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* 빠른 작업 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">빠른 작업</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow cursor-pointer" 
                    onClick={() => router.push(action.href)}>
                <div className="text-center">
                  <div className={`w-16 h-16 ${action.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <span className="text-2xl">{action.icon}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* 최근 활동 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 최근 등록된 사용자 */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 등록된 사용자</h3>
            <div className="space-y-3">
              {/* 여기에 최근 등록된 사용자 목록 표시 */}
              <div className="text-center text-gray-500 py-8">
                <p>최근 등록된 사용자가 없습니다.</p>
              </div>
            </div>
          </Card>

          {/* 최근 등록된 과정 */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 등록된 과정</h3>
            <div className="space-y-3">
              {/* 여기에 최근 등록된 과정 목록 표시 */}
              <div className="text-center text-gray-500 py-8">
                <p>최근 등록된 과정이 없습니다.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default withAuth(CenterDashboard, { requireTypes: ['centerAdmin'] });
