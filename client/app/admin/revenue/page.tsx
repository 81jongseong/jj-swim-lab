'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { DollarSign, TrendingUp, Users, Calendar, BarChart3 } from 'lucide-react';
import withAuth from '../../../components/withAuth';

interface RevenueData {
  totalRevenue: number;
  monthlyRevenue: number;
  totalStudents: number;
  totalClasses: number;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
    students: number;
  }>;
}

function RevenueManagement() {
  const { user } = useAuth();
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadRevenueData();
    }
  }, [user]);

  const loadRevenueData = async () => {
    try {
      setIsLoading(true);
      // 임시 데이터
      const tempData: RevenueData = {
        totalRevenue: 12500000,
        monthlyRevenue: 1500000,
        totalStudents: 85,
        totalClasses: 320,
        revenueByMonth: [
          { month: '2024-01', revenue: 1200000, students: 75 },
          { month: '2024-02', revenue: 1350000, students: 80 },
          { month: '2024-03', revenue: 1500000, students: 85 },
          { month: '2024-04', revenue: 1400000, students: 82 },
          { month: '2024-05', revenue: 1600000, students: 88 },
          { month: '2024-06', revenue: 1500000, students: 85 }
        ]
      };
      setRevenueData(tempData);
    } catch (error) {
      console.error('매출 데이터 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">💰 총 매출 관리</h1>
          <p className="text-gray-600 mt-2">센터의 매출 현황과 통계를 확인하세요</p>
        </div>
      </div>

      {revenueData && (
        <>
          {/* 주요 지표 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <DollarSign className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">총 매출</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(revenueData.totalRevenue)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">이번 달 매출</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(revenueData.monthlyRevenue)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">총 학생 수</p>
                  <p className="text-2xl font-bold text-gray-900">{revenueData.totalStudents}명</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">총 수업 수</p>
                  <p className="text-2xl font-bold text-gray-900">{revenueData.totalClasses}회</p>
                </div>
              </div>
            </div>
          </div>

          {/* 월별 매출 차트 */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                월별 매출 현황
              </h3>
            </div>
            
            <div className="space-y-4">
              {revenueData.revenueByMonth.map((monthData, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{monthData.month}</p>
                    <p className="text-sm text-gray-600">{monthData.students}명</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(monthData.revenue)}
                    </p>
                    <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${(monthData.revenue / Math.max(...revenueData.revenueByMonth.map(m => m.revenue))) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 매출 분석 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">매출 분석</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">학생당 평균 매출</span>
                  <span className="font-semibold">
                    {formatCurrency(revenueData.totalRevenue / revenueData.totalStudents)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">수업당 평균 매출</span>
                  <span className="font-semibold">
                    {formatCurrency(revenueData.totalRevenue / revenueData.totalClasses)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">월평균 매출</span>
                  <span className="font-semibold">
                    {formatCurrency(revenueData.totalRevenue / revenueData.revenueByMonth.length)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">성장 지표</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">전월 대비 성장률</span>
                  <span className="font-semibold text-green-600">+7.1%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">학생 증가율</span>
                  <span className="font-semibold text-green-600">+6.3%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">수업 증가율</span>
                  <span className="font-semibold text-green-600">+8.5%</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default withAuth(RevenueManagement, { 
  requireTypes: ['centerAdmin', 'superAdmin'] 
});