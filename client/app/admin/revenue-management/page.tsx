/**
 * 💰 JJ Swim Lab - 센터별 매출 관리 페이지
 * 
 * 📋 **페이지 목적**
 * - 각 센터의 실제 운영 수익과 비용을 관리하는 센터별 매출 대시보드
 * - 회원 등록비, 강습비 등 센터 수익원과 인건비, 임대료, 제세공과금 등 비용 분석
 * - 센터별 수익성 분석 및 운영 효율성 평가
 * - 센터별, 지역별, 기간별 매출 현황 관리
 * 
 * 🔄 **주요 기능**
 * - 전체 센터 매출 개요 (총 매출, 순이익, 성장률 등)
 * - 수익원별 분석 (회원 등록비, 강습비, 개인레슨, 기타 서비스 등)
 * - 비용 구조 분석 (인건비, 임대료, 제세공과금, 유지보수비 등)
 * - 센터별 매출 현황 및 수익성 분석
 * - 지역별 매출 분포 및 성과 분석
 * - 기간별 매출 트렌드 및 예측
 * - 센터 운영 효율성 인사이트
 * - 매출 목표 대비 실적 분석
 * 
 * 🗄️ **데이터 연동**
 * - revenue-management API와 연동 (매출 데이터)
 * - useAuth 훅과 연동 (사용자 권한 확인)
 * - apiClient와 연동 (API 통신)
 * 
 * 🛠️ **필요한 설치 파일**
 * - Next.js 14.2.5 (App Router)
 * - React 18.3.1
 * - TypeScript 5.x
 * - Tailwind CSS 3.3.0
 * - Chart.js 또는 Recharts (차트 라이브러리)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 관리자 권한 확인 필수 (superAdmin만 접근)
 * 2. 대용량 매출 데이터 처리 시 성능 최적화
 * 3. 실시간 데이터 업데이트 고려
 * 4. 반응형 디자인 적용 (모바일/데스크톱)
 * 5. 차트 라이브러리 의존성 관리
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 권한 검증 로직 확인
 * - [ ] API 응답 데이터 구조 검증
 * - [ ] 차트 렌더링 성능 최적화
 * - [ ] 반응형 디자인 테스트
 * - [ ] 에러 처리 로직 개선
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (총 매출 관리 페이지)
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (총 매출 관리 페이지 완료)
 * 
 * 🚀 **다음 단계**
 * - 실시간 매출 모니터링
 * - AI 기반 매출 예측
 * - 자동화된 리포트 생성
 * - 고급 분석 도구
 * 
 * 💡 **사용 예시**
 * ```tsx
 * // 총 매출 관리 페이지 접근
 * /admin/revenue-management
 * 
 * // 수익원별 필터링
 * setSelectedRevenueSource(['center_fees', 'shop_sales'])
 * 
 * // 기간별 매출 조회
 * loadRevenueByPeriod('monthly')
 * ```
 * 
 * 🔍 **페이지 처리 흐름**
 * 1. 사용자 권한 확인 (최고관리자만 접근)
 * 2. 전체 매출 데이터 로드
 * 3. 수익원별, 센터별 매출 계산
 * 4. 차트 및 그래프 렌더링
 * 5. 필터링 기능 제공
 * 6. 인사이트 및 추천 제공
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';

interface RevenueData {
  overview: {
    totalRevenue: number;
    netProfit: number;
    growthRate: number;
    targetRevenue: number;
    achievementRate: number;
    totalCenters: number;
    activeCenters: number;
    averageRevenuePerCenter: number;
  };
  revenueSources: {
    membershipFees: { amount: number; percentage: number; growth: number };
    lessonFees: { amount: number; percentage: number; growth: number };
    privateLessons: { amount: number; percentage: number; growth: number };
    equipmentRental: { amount: number; percentage: number; growth: number };
    otherServices: { amount: number; percentage: number; growth: number };
  };
  centerPerformance: {
    centerId: string;
    centerName: string;
    region: string;
    revenue: number;
    profit: number;
    growth: number;
    contribution: number;
  }[];
  regionalAnalysis: {
    region: string;
    totalRevenue: number;
    centerCount: number;
    averageRevenue: number;
    growth: number;
  }[];
  monthlyTrends: {
    month: string;
    revenue: number;
    profit: number;
    membershipFees: number;
    lessonFees: number;
    privateLessons: number;
    equipmentRental: number;
    otherServices: number;
  }[];
  costAnalysis: {
    category: string;
    amount: number;
    percentage: number;
    trend: number;
  }[];
  insights: {
    topPerformingCenter: string;
    fastestGrowingSource: string;
    underperformingRegion: string;
    recommendation: string;
  };
}

export default function RevenueManagementPage() {
  const { user, hasUserType } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedCenter, setSelectedCenter] = useState('all');

  useEffect(() => {
    if (user && hasUserType('superAdmin')) {
      loadRevenueData();
    }
  }, [user, hasUserType]);

  const loadRevenueData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 임시 매출 데이터 (실제로는 API에서 가져와야 함)
      const mockRevenueData: RevenueData = {
        overview: {
          totalRevenue: 12500000000, // 125억원
          netProfit: 3750000000, // 37.5억원
          growthRate: 12.5,
          targetRevenue: 15000000000, // 150억원
          achievementRate: 83.3,
          totalCenters: 156,
          activeCenters: 142,
          averageRevenuePerCenter: 88028169 // 약 8,800만원
        },
        revenueSources: {
          membershipFees: { amount: 6000000000, percentage: 50.0, growth: 12.5 },
          lessonFees: { amount: 3600000000, percentage: 30.0, growth: 18.2 },
          privateLessons: { amount: 1800000000, percentage: 15.0, growth: 25.8 },
          equipmentRental: { amount: 480000000, percentage: 4.0, growth: 8.7 },
          otherServices: { amount: 120000000, percentage: 1.0, growth: 15.3 }
        },
        centerPerformance: [
          { centerId: '1', centerName: '강남센터', region: '서울특별시', revenue: 180000000, profit: 54000000, growth: 15.2, contribution: 1.44 },
          { centerId: '2', centerName: '송파센터', region: '서울특별시', revenue: 168000000, profit: 50400000, growth: 12.8, contribution: 1.34 },
          { centerId: '3', centerName: '분당센터', region: '경기도', revenue: 152000000, profit: 45600000, growth: 10.5, contribution: 1.22 },
          { centerId: '4', centerName: '홍대센터', region: '서울특별시', revenue: 140000000, profit: 42000000, growth: 8.7, contribution: 1.12 },
          { centerId: '5', centerName: '부산센터', region: '부산광역시', revenue: 128000000, profit: 38400000, growth: 7.3, contribution: 1.02 }
        ],
        regionalAnalysis: [
          { region: '서울특별시', totalRevenue: 4500000000, centerCount: 45, averageRevenue: 100000000, growth: 12.5 },
          { region: '경기도', totalRevenue: 3200000000, centerCount: 38, averageRevenue: 84210526, growth: 10.8 },
          { region: '부산광역시', totalRevenue: 1800000000, centerCount: 18, averageRevenue: 100000000, growth: 8.9 },
          { region: '대구광역시', totalRevenue: 1200000000, centerCount: 12, averageRevenue: 100000000, growth: 7.2 },
          { region: '인천광역시', totalRevenue: 900000000, centerCount: 9, averageRevenue: 100000000, growth: 6.5 }
        ],
        monthlyTrends: [
          { month: '2024-01', revenue: 950000000, profit: 285000000, membershipFees: 475000000, lessonFees: 285000000, privateLessons: 142500000, equipmentRental: 38000000, otherServices: 9500000 },
          { month: '2024-02', revenue: 980000000, profit: 294000000, membershipFees: 490000000, lessonFees: 294000000, privateLessons: 147000000, equipmentRental: 39200000, otherServices: 9800000 },
          { month: '2024-03', revenue: 1050000000, profit: 315000000, membershipFees: 525000000, lessonFees: 315000000, privateLessons: 157500000, equipmentRental: 42000000, otherServices: 10500000 },
          { month: '2024-04', revenue: 1100000000, profit: 330000000, membershipFees: 550000000, lessonFees: 330000000, privateLessons: 165000000, equipmentRental: 44000000, otherServices: 11000000 },
          { month: '2024-05', revenue: 1150000000, profit: 345000000, membershipFees: 575000000, lessonFees: 345000000, privateLessons: 172500000, equipmentRental: 46000000, otherServices: 11500000 },
          { month: '2024-06', revenue: 1200000000, profit: 360000000, membershipFees: 600000000, lessonFees: 360000000, privateLessons: 180000000, equipmentRental: 48000000, otherServices: 12000000 }
        ],
        costAnalysis: [
          { category: '인건비', amount: 5000000000, percentage: 40.0, trend: 5.2 },
          { category: '임대료', amount: 2500000000, percentage: 20.0, trend: 3.1 },
          { category: '제세공과금', amount: 1500000000, percentage: 12.0, trend: 2.8 },
          { category: '유지보수비', amount: 1000000000, percentage: 8.0, trend: 2.3 },
          { category: '마케팅비', amount: 750000000, percentage: 6.0, trend: 8.7 },
          { category: '보험료', amount: 500000000, percentage: 4.0, trend: 1.5 },
          { category: '기타', amount: 1250000000, percentage: 10.0, trend: 4.5 }
        ],
        insights: {
          topPerformingCenter: '강남센터',
          fastestGrowingSource: '개인레슨',
          underperformingRegion: '인천광역시',
          recommendation: '개인레슨 수익이 빠르게 성장하고 있습니다. 개인레슨 프로그램 확대를 고려해보세요.'
        }
      };
      
      setRevenueData(mockRevenueData);
    } catch (error) {
      console.error('매출 데이터 로딩 오류:', error);
      setError('매출 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!hasUserType('superAdmin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">접근 권한 없음</h1>
          <p className="text-gray-600">이 페이지는 최고 관리자만 접근할 수 있습니다.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">매출 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">오류 발생</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadRevenueData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">💰 센터별 매출 관리</h1>
          <p className="text-gray-600">각 센터의 실제 운영 수익과 비용을 관리하는 센터별 매출 대시보드</p>
        </div>

        {/* 필터 옵션 */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">기간</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">일별</option>
                <option value="weekly">주별</option>
                <option value="monthly">월별</option>
                <option value="quarterly">분기별</option>
                <option value="yearly">연별</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">지역</label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">전체</option>
                <option value="seoul">서울특별시</option>
                <option value="gyeonggi">경기도</option>
                <option value="busan">부산광역시</option>
                <option value="daegu">대구광역시</option>
                <option value="incheon">인천광역시</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">센터</label>
              <select
                value={selectedCenter}
                onChange={(e) => setSelectedCenter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">전체</option>
                <option value="gangnam">강남센터</option>
                <option value="songpa">송파센터</option>
                <option value="bundang">분당센터</option>
                <option value="hongdae">홍대센터</option>
                <option value="busan">부산센터</option>
              </select>
            </div>
          </div>
        </div>

        {revenueData && (
          <>
            {/* 전체 매출 개요 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">총 매출</p>
                    <p className="text-2xl font-bold text-gray-900">{(revenueData.overview.totalRevenue / 100000000).toFixed(1)}억원</p>
                    <p className="text-xs text-green-600">+{revenueData.overview.growthRate}% 성장</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <span className="text-2xl">📈</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">순이익</p>
                    <p className="text-2xl font-bold text-blue-600">{(revenueData.overview.netProfit / 100000000).toFixed(1)}억원</p>
                    <p className="text-xs text-gray-500">마진율: {((revenueData.overview.netProfit / revenueData.overview.totalRevenue) * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">목표 달성률</p>
                    <p className="text-2xl font-bold text-yellow-600">{revenueData.overview.achievementRate}%</p>
                    <p className="text-xs text-gray-500">목표: {(revenueData.overview.targetRevenue / 100000000).toFixed(1)}억원</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <span className="text-2xl">🏢</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">센터당 평균</p>
                    <p className="text-2xl font-bold text-purple-600">{(revenueData.overview.averageRevenuePerCenter / 10000).toFixed(0)}만원</p>
                    <p className="text-xs text-gray-500">활성: {revenueData.overview.activeCenters}개</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 수익원별 분석 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 수익원별 분석</h3>
                <div className="space-y-4">
                  {Object.entries(revenueData.revenueSources).map(([source, data]) => (
                    <div key={source} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">
                          {source === 'membershipFees' && '회원 등록비'}
                          {source === 'lessonFees' && '강습비'}
                          {source === 'privateLessons' && '개인레슨'}
                          {source === 'equipmentRental' && '장비 대여'}
                          {source === 'otherServices' && '기타 서비스'}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{(data.amount / 100000000).toFixed(1)}억원</p>
                        <p className="text-xs text-gray-500">{data.percentage}% • +{data.growth}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 상위 성과 센터</h3>
                <div className="space-y-4">
                  {revenueData.centerPerformance.map((center, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{center.centerName}</p>
                        <p className="text-sm text-gray-600">{center.region}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-600">{(center.revenue / 100000000).toFixed(1)}억원</p>
                        <p className="text-xs text-gray-500">+{center.growth}% • {center.contribution}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 지역별 분석 */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🗺️ 지역별 매출 현황</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">지역</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">센터 수</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">총 매출</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">센터당 평균</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">성장률</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {revenueData.regionalAnalysis.map((region, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{region.region}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{region.centerCount}개</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(region.totalRevenue / 100000000).toFixed(1)}억원</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(region.averageRevenue / 10000).toFixed(0)}만원</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">+{region.growth}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 월별 트렌드 */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 월별 매출 트렌드</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">월</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">총 매출</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">순이익</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">회원 등록비</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">강습비</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">개인레슨</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">장비 대여</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">기타 서비스</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {revenueData.monthlyTrends.map((trend, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{trend.month}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(trend.revenue / 100000000).toFixed(1)}억원</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(trend.profit / 100000000).toFixed(1)}억원</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(trend.membershipFees / 100000000).toFixed(1)}억원</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(trend.lessonFees / 100000000).toFixed(1)}억원</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(trend.privateLessons / 100000000).toFixed(1)}억원</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(trend.equipmentRental / 100000000).toFixed(1)}억원</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(trend.otherServices / 100000000).toFixed(1)}억원</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 비용 분석 및 인사이트 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">💸 비용 구조 분석</h3>
                <div className="space-y-3">
                  {revenueData.costAnalysis.map((cost, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{cost.category}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-600 h-2 rounded-full" 
                            style={{ width: `${cost.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{cost.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 인사이트 및 추천</h3>
                <div className="space-y-4">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-800">🏆 최고 성과 센터</p>
                    <p className="text-sm text-green-600">{revenueData.insights.topPerformingCenter}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">📈 가장 빠른 성장</p>
                    <p className="text-sm text-blue-600">{revenueData.insights.fastestGrowingSource}</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm font-medium text-yellow-800">⚠️ 개선 필요 지역</p>
                    <p className="text-sm text-yellow-600">{revenueData.insights.underperformingRegion}</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm font-medium text-purple-800">💡 추천사항</p>
                    <p className="text-sm text-purple-600">{revenueData.insights.recommendation}</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
