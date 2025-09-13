/**
 * @file 강사 대시보드 페이지
 * @description 강사가 자신의 강의, 수강생, 일정 등을 한눈에 볼 수 있는 대시보드입니다.
 * @date 2025-09-13
 * @author JJ Swim Lab
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Calendar, Users, BookOpen, TrendingUp, Clock, Star } from 'lucide-react';

interface DashboardStats {
  totalStudents: number;
  activeCourses: number;
  todayBookings: number;
  averageRating: number;
  totalHours: number;
  monthlyRevenue: number;
}

interface UpcomingBooking {
  id: string;
  studentName: string;
  courseName: string;
  time: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

const InstructorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    activeCourses: 0,
    todayBookings: 0,
    averageRating: 0,
    totalHours: 0,
    monthlyRevenue: 0,
  });
  const [upcomingBookings, setUpcomingBookings] = useState<UpcomingBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // 실제 API 호출로 교체 필요
      // 현재는 샘플 데이터
      const mockStats: DashboardStats = {
        totalStudents: 25,
        activeCourses: 8,
        todayBookings: 6,
        averageRating: 4.8,
        totalHours: 120,
        monthlyRevenue: 2400000,
      };

      const mockBookings: UpcomingBooking[] = [
        {
          id: '1',
          studentName: '김학생',
          courseName: '자유형 기초',
          time: '09:00 - 10:00',
          status: 'confirmed',
        },
        {
          id: '2',
          studentName: '이학생',
          courseName: '배영 중급',
          time: '10:30 - 11:30',
          status: 'confirmed',
        },
        {
          id: '3',
          studentName: '박학생',
          courseName: '접영 고급',
          time: '14:00 - 15:00',
          status: 'pending',
        },
      ];

      setStats(mockStats);
      setUpcomingBookings(mockBookings);
    } catch (error) {
      console.error('대시보드 데이터 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          안녕하세요, {user?.name}님! 👋
        </h1>
        <p className="text-gray-600">
          오늘도 좋은 하루 되세요. 오늘의 강의 일정을 확인해보세요.
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 수강생</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}명</div>
            <p className="text-xs text-muted-foreground">
              활성 수강생 기준
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">진행 중인 강의</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCourses}개</div>
            <p className="text-xs text-muted-foreground">
              현재 진행 중인 강의
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">오늘 예약</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayBookings}건</div>
            <p className="text-xs text-muted-foreground">
              오늘 예정된 수업
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 평점</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating}</div>
            <p className="text-xs text-muted-foreground">
              수강생 평가 기준
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 강의 시간</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHours}시간</div>
            <p className="text-xs text-muted-foreground">
              이번 달 누적
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">이번 달 수익</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.monthlyRevenue.toLocaleString()}원
            </div>
            <p className="text-xs text-muted-foreground">
              이번 달 기준
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 오늘의 예약 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>오늘의 예약</CardTitle>
          <CardDescription>
            오늘 예정된 수업 일정을 확인하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingBookings.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              오늘 예정된 수업이 없습니다.
            </p>
          ) : (
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{booking.studentName}</h4>
                    <p className="text-sm text-gray-600">{booking.courseName}</p>
                    <p className="text-sm text-gray-500">{booking.time}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        booking.status === 'confirmed'
                          ? 'default'
                          : booking.status === 'pending'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {booking.status === 'confirmed'
                        ? '확정'
                        : booking.status === 'pending'
                        ? '대기'
                        : '취소'}
                    </Badge>
                    <Button size="sm" variant="outline">
                      상세보기
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 빠른 액션 */}
      <Card>
        <CardHeader>
          <CardTitle>빠른 액션</CardTitle>
          <CardDescription>
            자주 사용하는 기능들에 빠르게 접근하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col">
              <BookOpen className="h-6 w-6 mb-2" />
              <span>강의 관리</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col">
              <Users className="h-6 w-6 mb-2" />
              <span>수강생 관리</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col">
              <Calendar className="h-6 w-6 mb-2" />
              <span>일정 관리</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col">
              <TrendingUp className="h-6 w-6 mb-2" />
              <span>리포트 보기</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-800">
        <p className="font-semibold">개발 참고:</p>
        <p>이 페이지의 데이터는 하드코딩이 아닌 데이터베이스에서 관리되어야 합니다.</p>
        <p>관련 API 엔드포인트 (`/api/instructor/dashboard` 등) 개발이 필요합니다.</p>
      </div>
    </div>
  );
};

export default InstructorDashboard;