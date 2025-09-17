/**
 * @file 센터 관리자 리포트 페이지
 * @description 센터 관리자가 다양한 리포트를 확인할 수 있는 페이지입니다.
 * @date 2025-09-14
 * @author JJ Swim Lab
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { BarChart3, TrendingUp, Users, Calendar, Download, Filter } from 'lucide-react';

interface ReportData {
  period: string;
  totalStudents: number;
  totalRevenue: number;
  totalClasses: number;
  averageRating: number;
  newStudents: number;
  retentionRate: number;
}

const CenterAdminReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    fetchReportData();
  }, [selectedPeriod]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      // 실제 API 호출
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/centers/reports?period=${selectedPeriod}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('리포트 데이터를 가져올 수 없습니다.');
      }

      const result = await response.json();
      
      if (result.success) {
        setReportData(result.data);
      } else {
        throw new Error(result.message || '리포트 데이터 조회에 실패했습니다.');
      }
    } catch (error) {
      console.error('리포트 데이터 로딩 실패:', error);
      
      // 임시 데이터 (개발용)
      const mockData: ReportData = {
        period: selectedPeriod,
        totalStudents: 156,
        totalRevenue: 23400000,
        totalClasses: 89,
        averageRating: 4.7,
        newStudents: 23,
        retentionRate: 87.5,
      };
      
      setReportData(mockData);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    // 리포트 내보내기 기능
    const reportContent = `
JJ Swim Lab 센터 리포트
기간: ${selectedPeriod === 'month' ? '이번 달' : selectedPeriod === 'week' ? '이번 주' : '이번 년도'}

총 학생 수: ${reportData?.totalStudents}명
총 수익: ${reportData?.totalRevenue.toLocaleString()}원
총 강의 수: ${reportData?.totalClasses}회
평균 평점: ${reportData?.averageRating}점
신규 학생: ${reportData?.newStudents}명
재등록률: ${reportData?.retentionRate}%

생성일: ${new Date().toLocaleDateString()}
    `;
    
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `center_report_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
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
          센터 리포트
        </h1>
        <p className="text-gray-600">
          센터 운영 현황을 확인하고 분석하세요.
        </p>
      </div>

      {/* 기간 선택 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>리포트 기간 선택</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={selectedPeriod === 'week' ? 'default' : 'outline'}
              onClick={() => setSelectedPeriod('week')}
            >
              이번 주
            </Button>
            <Button
              variant={selectedPeriod === 'month' ? 'default' : 'outline'}
              onClick={() => setSelectedPeriod('month')}
            >
              이번 달
            </Button>
            <Button
              variant={selectedPeriod === 'year' ? 'default' : 'outline'}
              onClick={() => setSelectedPeriod('year')}
            >
              이번 년도
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 주요 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">총 학생 수</p>
                <p className="text-3xl font-bold text-blue-600">
                  {reportData?.totalStudents}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">총 수익</p>
                <p className="text-3xl font-bold text-green-600">
                  {reportData?.totalRevenue.toLocaleString()}원
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">총 강의 수</p>
                <p className="text-3xl font-bold text-purple-600">
                  {reportData?.totalClasses}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">평균 평점</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {reportData?.averageRating}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 상세 리포트 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>신규 학생 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-600 mb-2">
                {reportData?.newStudents}명
              </p>
              <p className="text-gray-600">
                {selectedPeriod === 'week' ? '이번 주' : 
                 selectedPeriod === 'month' ? '이번 달' : '이번 년도'} 신규 가입
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>재등록률</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-4xl font-bold text-green-600 mb-2">
                {reportData?.retentionRate}%
              </p>
              <p className="text-gray-600">
                학생 재등록 비율
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 액션 버튼 */}
      <div className="flex justify-end gap-4">
        <Button onClick={handleExportReport} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          리포트 내보내기
        </Button>
        <Button onClick={fetchReportData}>
          <Filter className="h-4 w-4 mr-2" />
          데이터 새로고침
        </Button>
      </div>

      <div className="mt-8 p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-800">
        <p className="font-semibold">개발 참고:</p>
        <p>이 페이지의 데이터는 하드코딩이 아닌 데이터베이스에서 관리되어야 합니다.</p>
        <p>관련 API 엔드포인트 (`/api/centers/reports` 등) 개발이 필요합니다.</p>
      </div>
    </div>
  );
};

export default CenterAdminReportsPage;
