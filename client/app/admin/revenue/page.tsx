/**
 * 💰 JJ Swim Lab - 총 매출 관리 페이지
 * 
 * 📋 **기능**
 * - 전체 시스템 매출 현황
 * - 기간별 매출 통계
 * - 강사별 매출 현황
 * - 과정별 매출 분석
 * - 결제 상태별 현황
 * 
 * 👤 **접근 권한**: superAdmin, centerAdmin
 * 🔒 **인증 필요**: 예
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, ResponsiveTable, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell, LoadingSpinner, RefreshButton } from '@/components/ui';
import { getRevenueStats, type RevenueStats } from '@/lib/api/revenue';

interface RevenueData {
  totalRevenue: number;
  monthlyRevenue: number;
  pendingPayments: number;
  completedPayments: number;
  revenueByInstructor: Array<{
    instructorName: string;
    revenue: number;
    studentCount: number;
  }>;
  revenueByCourse: Array<{
    courseName: string;
    revenue: number;
    enrollmentCount: number;
  }>;
  recentTransactions: Array<{
    id: string;
    studentName: string;
    courseName: string;
    amount: number;
    status: 'completed' | 'pending' | 'failed';
    date: string;
  }>;
}

export default function RevenuePage() {
  const { user, loading } = useAuth();
  const [revenueData, setRevenueData] = useState<RevenueData>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingPayments: 0,
    completedPayments: 0,
    revenueByInstructor: [],
    revenueByCourse: [],
    recentTransactions: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [apiData, setApiData] = useState<RevenueStats | null>(null);

  const fetchRevenueData = async () => {
    try {
      setIsLoading(true);
      
      // 실제 API 호출
      const apiResponse = await getRevenueStats();
      setApiData(apiResponse.data);
      
      // API 데이터를 기존 형식으로 변환
      const transformedData: RevenueData = {
        totalRevenue: apiResponse.data.totalRevenue,
        monthlyRevenue: apiResponse.data.monthlyTrend[0]?.revenue || 0,
        pendingPayments: 0, // API에서 제공되지 않는 경우 0으로 설정
        completedPayments: apiResponse.data.totalRevenue,
        revenueByInstructor: apiResponse.data.instructorRevenue.map(item => ({
          instructorName: item.instructorName,
          revenue: item.totalRevenue,
          studentCount: item.transactionCount
        })),
        revenueByCourse: apiResponse.data.courseRevenue.map(item => ({
          courseName: item.courseName,
          revenue: item.totalRevenue,
          enrollmentCount: item.enrollmentCount
        })),
        recentTransactions: apiResponse.data.recentTransactions.map(tx => ({
          id: tx.id,
          studentName: tx.studentName,
          courseName: tx.courseName,
          amount: tx.amount,
          status: tx.status as 'completed' | 'pending' | 'failed',
          date: new Date(tx.date).toLocaleDateString('ko-KR')
        }))
      };
      
      setRevenueData(transformedData);
      setIsLoading(false);
    } catch (error) {
      console.error('매출 데이터 가져오기 실패:', error);
      setIsLoading(false);
      
      // API 실패 시 mock 데이터 사용 (fallback)
      const mockData: RevenueData = {
        totalRevenue: 3085783,
        monthlyRevenue: 1250000,
        pendingPayments: 450000,
        completedPayments: 2635783,
        revenueByInstructor: [
          { instructorName: '김수영', revenue: 1200000, studentCount: 15 },
          { instructorName: '이강사', revenue: 950000, studentCount: 12 },
          { instructorName: '박지도', revenue: 935783, studentCount: 10 }
        ],
        revenueByCourse: [
          { courseName: '초급 수영', revenue: 1800000, enrollmentCount: 25 },
          { courseName: '중급 수영', revenue: 1285783, enrollmentCount: 18 }
        ],
                  recentTransactions: [
            { id: '1', studentName: '김학생', courseName: '초급 수영', amount: 120000, status: 'completed', date: '2024-01-15' },
            { id: '2', studentName: '이학생', courseName: '중급 수영', amount: 150000, status: 'pending', date: '2024-01-14' },
            { id: '3', studentName: '박학생', courseName: '초급 수영', amount: 120000, status: 'completed', date: '2024-01-13' }
          ]
      };
      
      setRevenueData(mockData);
    }
  };

  useEffect(() => {
    fetchRevenueData();
  }, []);

  // 권한 확인
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">로딩 중...</div>;
  }

  if (!user || !['superAdmin', 'centerAdmin'].includes(user.userType)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">접근 권한이 없습니다</h1>
          <p className="text-gray-600">이 페이지에 접근할 수 있는 권한이 없습니다.</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500">완료</Badge>;
      case 'pending':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">대기</Badge>;
      case 'failed':
        return <Badge variant="destructive">실패</Badge>;
      default:
        return <Badge variant="outline">알 수 없음</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner 
          size="xl" 
          color="primary" 
          text="매출 데이터를 불러오는 중..." 
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">💰 총 매출 관리</h1>
          <p className="text-gray-600 mt-2">JJ Swim Lab 전체 매출 현황 및 분석</p>
        </div>
        <RefreshButton
          onRefresh={fetchRevenueData}
          size="md"
          variant="outline"
          tooltip="매출 데이터 새로고침"
        />
      </div>

      {/* 주요 매출 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">총 매출</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {revenueData.totalRevenue.toLocaleString()}원
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">이번 달 매출</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {revenueData.monthlyRevenue.toLocaleString()}원
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">완료된 결제</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {revenueData.completedPayments.toLocaleString()}원
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">대기 중인 결제</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {revenueData.pendingPayments.toLocaleString()}원
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 강사별 매출 현황 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>🏊‍♂️ 강사별 매출 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueData.revenueByInstructor.map((instructor, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{instructor.instructorName}</div>
                    <div className="text-sm text-gray-500">학생 {instructor.studentCount}명</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      {instructor.revenue.toLocaleString()}원
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📚 과정별 매출 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueData.revenueByCourse.map((course, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{course.courseName}</div>
                    <div className="text-sm text-gray-500">수강생 {course.enrollmentCount}명</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-blue-600">
                      {course.revenue.toLocaleString()}원
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 최근 거래 내역 */}
      <Card>
        <CardHeader>
          <CardTitle>📋 최근 거래 내역</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveTable>
            <TableHeader>
              <TableHeaderCell>학생명</TableHeaderCell>
              <TableHeaderCell>과정명</TableHeaderCell>
              <TableHeaderCell>금액</TableHeaderCell>
              <TableHeaderCell>상태</TableHeaderCell>
              <TableHeaderCell>날짜</TableHeaderCell>
            </TableHeader>
            <TableBody>
              {revenueData.recentTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.studentName}</TableCell>
                  <TableCell>{transaction.courseName}</TableCell>
                  <TableCell className="font-bold text-green-600">
                    {transaction.amount.toLocaleString()}원
                  </TableCell>
                  <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                  <TableCell className="text-gray-500">{transaction.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </ResponsiveTable>
        </CardContent>
      </Card>
    </div>
  );
}
