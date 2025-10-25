'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { BarChart3, TrendingUp, Users, Calendar, Download, Filter } from 'lucide-react';
import withAuth from '@/components/withAuth';

interface ReportData {
  period: string;
  totalRevenue: number;
  totalStudents: number;
  totalClasses: number;
  averageRating: number;
  newStudents: number;
  retentionRate: number;
  popularClasses: Array<{
    name: string;
    enrollment: number;
    revenue: number;
  }>;
  instructorPerformance: Array<{
    name: string;
    classes: number;
    students: number;
    rating: number;
  }>;
}

function ReportsManagement() {
  const { user } = useAuth();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    if (user) {
      loadReportData();
    }
  }, [user, selectedPeriod]);

  const loadReportData = async () => {
    try {
      setIsLoading(true);
      // 임시 데이터
      const tempData: ReportData = {
        period: selectedPeriod === 'month' ? '2024년 1월' : '2024년 1분기',
        totalRevenue: 2500000,
        totalStudents: 85,
        totalClasses: 320,
        averageRating: 4.6,
        newStudents: 12,
        retentionRate: 78.5,
        popularClasses: [
          { name: '초급 자유형', enrollment: 25, revenue: 2000000 },
          { name: '중급 배영', enrollment: 18, revenue: 1800000 },
          { name: '고급 접영', enrollment: 12, revenue: 1440000 }
        ],
        instructorPerformance: [
          { name: '김강사', classes: 45, students: 25, rating: 4.8 },
          { name: '이코치', classes: 38, students: 22, rating: 4.7 },
          { name: '박트레이너', classes: 32, students: 18, rating: 4.5 }
        ]
      };
      setReportData(tempData);
    } catch (error) {
      console.error('리포트 데이터 로드 실패:', error);
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

  const exportReport = () => {
    // 실제로는 PDF나 Excel 파일을 생성
    console.log('리포트 내보내기');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          센터 리포트
        </h1>
        <p className="text-gray-600">센터의 운영 현황과 성과를 분석하세요</p>
      </div>

      {/* 기간 선택 및 내보내기 */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">보고 기간:</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="month">월간</option>
              <option value="quarter">분기</option>
              <option value="year">연간</option>
            </select>
          </div>
          <button
            onClick={exportReport}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            리포트 내보내기
          </button>
        </div>
      </div>

      {reportData && (
        <>
          {/* 주요 지표 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <BarChart3 className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">총 매출</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(reportData.totalRevenue)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">총 학생 수</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.totalStudents}명</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">총 수업 수</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.totalClasses}회</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">평균 평점</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.averageRating}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 상세 분석 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {/* 인기 클래스 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">인기 클래스</h3>
              <div className="space-y-4">
                {reportData.popularClasses.map((cls, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{cls.name}</p>
                      <p className="text-sm text-gray-600">{cls.enrollment}명 수강</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(cls.revenue)}
                      </p>
                      <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ 
                            width: `${(cls.revenue / Math.max(...reportData.popularClasses.map(c => c.revenue))) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 강사 성과 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">강사 성과</h3>
              <div className="space-y-4">
                {reportData.instructorPerformance.map((instructor, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{instructor.name}</p>
                      <p className="text-sm text-gray-600">
                        {instructor.classes}회 수업, {instructor.students}명 담당
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{instructor.rating}</p>
                      <div className="flex">
                        {Array.from({ length: 5 }, (_, i) => (
                          <span
                            key={i}
                            className={`text-sm ${
                              i < Math.floor(instructor.rating) 
                                ? 'text-yellow-400' 
                                : 'text-gray-300'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 추가 통계 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">신규 학생</h3>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{reportData.newStudents}명</p>
                <p className="text-sm text-gray-600">이번 기간 신규 가입</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">재등록률</h3>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{reportData.retentionRate}%</p>
                <p className="text-sm text-gray-600">학생 재등록 비율</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">평균 수업료</h3>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">
                  {formatCurrency(reportData.totalRevenue / reportData.totalClasses)}
                </p>
                <p className="text-sm text-gray-600">수업당 평균 수익</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default withAuth(ReportsManagement, { 
  requireTypes: ['centerAdmin', 'superAdmin'] 
});