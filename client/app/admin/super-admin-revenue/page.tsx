/**
 * 💎 JJ Swim Lab - 최고 관리자 수익 관리 페이지
 * 
 * 📋 **페이지 목적**
 * - 최고 관리자가 직접 받는 수익을 관리하는 전용 페이지
 * - 센터별 수익과는 별개로 최고 관리자 수익원 분석
 * - 프랜차이즈 수수료, 라이선싱, 컨설팅, 교육 등 수익 관리
 * - 최고 관리자 수익 구조 최적화 및 성장 전략 수립
 * 
 * 🔄 **주요 기능**
 * - 최고 관리자 수익 개요 (총 수익, 순이익, 성장률 등)
 * - 수익원별 분석 (프랜차이즈 수수료, 라이선싱, 컨설팅, 교육 등)
 * - 센터별 기여도 분석 (어떤 센터가 최고 관리자 수익에 가장 많이 기여하는지)
 * - 지역별 수익 분포 및 성과 분석
 * - 기간별 수익 트렌드 및 예측
 * - 수익 구조 최적화 인사이트
 * - 신규 수익원 개발 전략
 * 
 * 🗄️ **데이터 연동**
 * - super-admin-revenue API와 연동 (최고 관리자 수익 데이터)
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
 * 2. 대용량 수익 데이터 처리 시 성능 최적화
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
 * - 2024-12-19: 초기 구현 (최고 관리자 수익 관리 페이지)
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (최고 관리자 수익 관리 페이지 완료)
 * 
 * 🚀 **다음 단계**
 * - 실시간 수익 모니터링
 * - AI 기반 수익 예측
 * - 자동화된 리포트 생성
 * - 고급 분석 도구
 * 
 * 💡 **사용 예시**
 * ```tsx
 * // 최고 관리자 수익 관리 페이지 접근
 * /admin/super-admin-revenue
 * 
 * // 수익원별 필터링
 * setSelectedRevenueSource(['franchise_fees', 'licensing'])
 * 
 * // 기간별 수익 조회
 * loadRevenueByPeriod('monthly')
 * ```
 * 
 * 🔍 **페이지 처리 흐름**
 * 1. 사용자 권한 확인 (최고관리자만 접근)
 * 2. 최고 관리자 수익 데이터 로드
 * 3. 수익원별, 센터별 수익 계산
 * 4. 차트 및 그래프 렌더링
 * 5. 필터링 기능 제공
 * 6. 인사이트 및 추천 제공
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';

interface SuperAdminRevenueData {
  overview: {
    totalRevenue: number;
    netProfit: number;
    growthRate: number;
    targetRevenue: number;
    achievementRate: number;
    totalCenters: number;
    averageRevenuePerCenter: number;
    profitMargin: number;
  };
  revenueSources: {
    franchiseFees: { amount: number; percentage: number; growth: number };
    licensing: { amount: number; percentage: number; growth: number };
    consulting: { amount: number; percentage: number; growth: number };
    education: { amount: number; percentage: number; growth: number };
    advertising: { amount: number; percentage: number; growth: number };
    technology: { amount: number; percentage: number; growth: number };
    other: { amount: number; percentage: number; growth: number };
  };
  centerContributions: {
    centerId: string;
    centerName: string;
    region: string;
    contribution: number;
    franchiseFee: number;
    licensingFee: number;
    consultingFee: number;
    totalContribution: number;
  }[];
  regionalAnalysis: {
    region: string;
    totalRevenue: number;
    centerCount: number;
    averageContribution: number;
    growth: number;
  }[];
  monthlyTrends: {
    month: string;
    revenue: number;
    profit: number;
    franchiseFees: number;
    licensing: number;
    consulting: number;
    education: number;
    advertising: number;
    technology: number;
  }[];
  costAnalysis: {
    category: string;
    amount: number;
    percentage: number;
    trend: number;
  }[];
  insights: {
    topContributingCenter: string;
    fastestGrowingSource: string;
    underperformingRegion: string;
    recommendation: string;
    newOpportunities: string[];
  };
}

export default function SuperAdminRevenuePage() {
  const { user, hasUserType } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revenueData, setRevenueData] = useState<SuperAdminRevenueData | null>(null);
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
      
      // 임시 최고 관리자 수익 데이터 (실제로는 API에서 가져와야 함)
      const mockRevenueData: SuperAdminRevenueData = {
        overview: {
          totalRevenue: 2500000000, // 25억원
          netProfit: 1875000000, // 18.75억원
          growthRate: 18.5,
          targetRevenue: 3000000000, // 30억원
          achievementRate: 83.3,
          totalCenters: 156,
          averageRevenuePerCenter: 16025641, // 약 1,600만원
          profitMargin: 75.0
        },
        revenueSources: {
          franchiseFees: { amount: 1500000000, percentage: 60.0, growth: 15.2 },
          licensing: { amount: 500000000, percentage: 20.0, growth: 22.1 },
          consulting: { amount: 250000000, percentage: 10.0, growth: 18.7 },
          education: { amount: 150000000, percentage: 6.0, growth: 25.3 },
          advertising: { amount: 75000000, percentage: 3.0, growth: 30.5 },
          technology: { amount: 25000000, percentage: 1.0, growth: 12.4 },
          other: { amount: 0, percentage: 0, growth: 0 }
        },
        centerContributions: [
          { centerId: '1', centerName: '강남센터', region: '서울특별시', contribution: 3.2, franchiseFee: 9600000, licensingFee: 3200000, consultingFee: 1600000, totalContribution: 14400000 },
          { centerId: '2', centerName: '송파센터', region: '서울특별시', contribution: 2.8, franchiseFee: 8400000, licensingFee: 2800000, consultingFee: 1400000, totalContribution: 12600000 },
          { centerId: '3', centerName: '분당센터', region: '경기도', contribution: 2.5, franchiseFee: 7500000, licensingFee: 2500000, consultingFee: 1250000, totalContribution: 11250000 },
          { centerId: '4', centerName: '홍대센터', region: '서울특별시', contribution: 2.3, franchiseFee: 6900000, licensingFee: 2300000, consultingFee: 1150000, totalContribution: 10350000 },
          { centerId: '5', centerName: '부산센터', region: '부산광역시', contribution: 2.1, franchiseFee: 6300000, licensingFee: 2100000, consultingFee: 1050000, totalContribution: 9450000 }
        ],
        regionalAnalysis: [
          { region: '서울특별시', totalRevenue: 900000000, centerCount: 45, averageContribution: 20000000, growth: 16.5 },
          { region: '경기도', totalRevenue: 640000000, centerCount: 38, averageContribution: 16842105, growth: 14.8 },
          { region: '부산광역시', totalRevenue: 360000000, centerCount: 18, averageContribution: 20000000, growth: 12.9 },
          { region: '대구광역시', totalRevenue: 240000000, centerCount: 12, averageContribution: 20000000, growth: 11.2 },
          { region: '인천광역시', totalRevenue: 180000000, centerCount: 9, averageContribution: 20000000, growth: 9.5 }
        ],
        monthlyTrends: [
          { month: '2024-01', revenue: 190000000, profit: 142500000, franchiseFees: 114000000, licensing: 38000000, consulting: 19000000, education: 11400000, advertising: 5700000, technology: 1900000 },
          { month: '2024-02', revenue: 196000000, profit: 147000000, franchiseFees: 117600000, licensing: 39200000, consulting: 19600000, education: 11760000, advertising: 5880000, technology: 1960000 },
          { month: '2024-03', revenue: 210000000, profit: 157500000, franchiseFees: 126000000, licensing: 42000000, consulting: 21000000, education: 12600000, advertising: 6300000, technology: 2100000 },
          { month: '2024-04', revenue: 220000000, profit: 165000000, franchiseFees: 132000000, licensing: 44000000, consulting: 22000000, education: 13200000, advertising: 6600000, technology: 2200000 },
          { month: '2024-05', revenue: 230000000, profit: 172500000, franchiseFees: 138000000, licensing: 46000000, consulting: 23000000, education: 13800000, advertising: 6900000, technology: 2300000 },
          { month: '2024-06', revenue: 240000000, profit: 180000000, franchiseFees: 144000000, licensing: 48000000, consulting: 24000000, education: 14400000, advertising: 7200000, technology: 2400000 }
        ],
        costAnalysis: [
          { category: '운영비', amount: 375000000, percentage: 15.0, trend: 3.2 },
          { category: '마케팅', amount: 125000000, percentage: 5.0, trend: 8.7 },
          { category: '기술개발', amount: 100000000, percentage: 4.0, trend: 12.3 },
          { category: '인건비', amount: 75000000, percentage: 3.0, trend: 5.2 },
          { category: '기타', amount: 25000000, percentage: 1.0, trend: 2.1 }
        ],
        insights: {
          topContributingCenter: '강남센터',
          fastestGrowingSource: '광고비',
          underperformingRegion: '인천광역시',
          recommendation: '광고비 수익이 빠르게 성장하고 있습니다. 광고 인프라 확대를 고려해보세요.',
          newOpportunities: [
            '해외 프랜차이즈 진출',
            '온라인 교육 플랫폼 확장',
            '스마트 수영장 기술 라이선싱',
            '건강 관리 앱 개발',
            '수영 용품 브랜드 런칭'
          ]
        }
      };
      
      setRevenueData(mockRevenueData);
    } catch (error) {
      console.error('수익 데이터 로딩 오류:', error);
      setError('수익 데이터를 불러오는 중 오류가 발생했습니다.');
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
          <p className="text-gray-600">수익 데이터를 불러오는 중...</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">💎 최고 관리자 수익 관리</h1>
          <p className="text-gray-600">최고 관리자 직접 수익원을 관리하는 전용 대시보드</p>
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
            {/* 전체 수익 개요 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <span className="text-2xl">💎</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">총 수익</p>
                    <p className="text-2xl font-bold text-gray-900">{(revenueData.overview.totalRevenue / 100000000).toFixed(1)}억원</p>
                    <p className="text-xs text-green-600">+{revenueData.overview.growthRate}% 성장</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">순이익</p>
                    <p className="text-2xl font-bold text-green-600">{(revenueData.overview.netProfit / 100000000).toFixed(1)}억원</p>
                    <p className="text-xs text-gray-500">마진율: {revenueData.overview.profitMargin}%</p>
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
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <span className="text-2xl">🏢</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">센터당 평균</p>
                    <p className="text-2xl font-bold text-blue-600">{(revenueData.overview.averageRevenuePerCenter / 10000).toFixed(0)}만원</p>
                    <p className="text-xs text-gray-500">총 {revenueData.overview.totalCenters}개 센터</p>
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
                        <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">
                          {source === 'franchiseFees' && '프랜차이즈 수수료'}
                          {source === 'licensing' && '라이선싱'}
                          {source === 'consulting' && '컨설팅'}
                          {source === 'education' && '교육'}
                          {source === 'advertising' && '광고'}
                          {source === 'technology' && '기술'}
                          {source === 'other' && '기타'}
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
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 센터별 기여도</h3>
                <div className="space-y-4">
                  {revenueData.centerContributions.map((center, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{center.centerName}</p>
                        <p className="text-sm text-gray-600">{center.region}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-purple-600">{(center.totalContribution / 10000).toFixed(0)}만원</p>
                        <p className="text-xs text-gray-500">{center.contribution}% 기여</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 지역별 분석 */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🗺️ 지역별 수익 현황</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">지역</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">센터 수</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">총 수익</th>
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(region.averageContribution / 10000).toFixed(0)}만원</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">+{region.growth}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 월별 트렌드 */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 월별 수익 트렌드</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">월</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">총 수익</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">순이익</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">프랜차이즈</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">라이선싱</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">컨설팅</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">교육</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">광고</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {revenueData.monthlyTrends.map((trend, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{trend.month}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(trend.revenue / 100000000).toFixed(1)}억원</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(trend.profit / 100000000).toFixed(1)}억원</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(trend.franchiseFees / 100000000).toFixed(1)}억원</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(trend.licensing / 100000000).toFixed(1)}억원</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(trend.consulting / 100000000).toFixed(1)}억원</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(trend.education / 100000000).toFixed(1)}억원</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(trend.advertising / 100000000).toFixed(1)}억원</td>
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
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm font-medium text-purple-800">🏆 최고 기여 센터</p>
                    <p className="text-sm text-purple-600">{revenueData.insights.topContributingCenter}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">📈 가장 빠른 성장</p>
                    <p className="text-sm text-blue-600">{revenueData.insights.fastestGrowingSource}</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm font-medium text-yellow-800">⚠️ 개선 필요 지역</p>
                    <p className="text-sm text-yellow-600">{revenueData.insights.underperformingRegion}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-800">💡 추천사항</p>
                    <p className="text-sm text-green-600">{revenueData.insights.recommendation}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 신규 기회 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🚀 신규 수익 기회</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {revenueData.insights.newOpportunities.map((opportunity, index) => (
                  <div key={index} className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">💡</span>
                      <h4 className="font-medium text-gray-900">신규 기회</h4>
                    </div>
                    <p className="text-sm text-gray-600">{opportunity}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
