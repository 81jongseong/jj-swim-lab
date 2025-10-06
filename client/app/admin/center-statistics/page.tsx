/**
 * 센터 통계 페이지
 * 
 * 연동되는 데이터:
 * - 센터별 사용자 수, 수익, 성과 지표 비교 및 트렌드 분석
 * - 데이터 기반 의사결정을 위한 고급 통계 정보 및 인사이트 제공
 * - 센터 성과 예측 및 개선 방안 제시
 * 
 * 연동되는 파일:
 * - RegionNavigation: 지역 필터 컴포넌트
 * - StatCard: 통계 카드 컴포넌트
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import apiClient from '../../../utils/api';
import RegionNavigation from '@/components/RegionNavigation';
import StatCard from '@/components/StatCard';

interface CenterData {
  id: string;
  name: string;
  region: string;
  district: string;
  revenue: {
    registration: number;
    lessons: number;
    shop: number;
    total: number;
  };
  costs: {
    labor: number;
    utilities: number;
    rent: number;
    other: number;
    total: number;
  };
  netProfit: number;
  profitMargin: number;
}

interface CenterStats {
  total: number;
  active: number;
  inactive: number;
}

interface UserStats {
  total: number;
  active: number;
  newThisMonth: number;
}

interface RevenueStats {
  total: number;
  monthly: number;
  growth: number;
}

interface StatisticsData {
  overview: {
    totalCenters: number;
    activeCenters: number;
    totalUsers: number;
    totalRevenue: number;
    averageSatisfaction: number;
    monthlyGrowth: number;
    averageROI: number;
    totalInstructors: number;
    averageUtilization: number;
  };
  regionStats: {
    region: string;
    totalCenters: number;
    activeCenters: number;
    totalUsers: number;
    totalRevenue: number;
    averageRating: number;
  }[];
  centerStats: {
    centerName: string;
    region: string;
    totalUsers: number;
    revenue: number;
    satisfaction: number;
    utilization: number;
  }[];
  topPerformers: {
    centerName: string;
    region: string;
    metric: string;
    value: number;
  }[];
}

export default function CenterStatisticsPage() {
  const { user, hasUserType } = useAuth();
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailModalContent, setDetailModalContent] = useState<{title: string, content: any}>({title: '', content: null});

  // 지역 필터 상태
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [selectedCenters, setSelectedCenters] = useState<string[]>([]);

  // Mock data for center status (실제 구현에서는 API에서 가져옴)
  const mockCenterData: CenterData[] = [
    {
      id: '1',
      name: '강남센터',
      region: '서울시',
      district: '강남구',
      revenue: { registration: 5000000, lessons: 8000000, shop: 2000000, total: 15000000 },
      costs: { labor: 6000000, utilities: 1000000, rent: 4000000, other: 1000000, total: 12000000 },
      netProfit: 3000000,
      profitMargin: 20
    },
    {
      id: '2',
      name: '서초센터',
      region: '서울시',
      district: '서초구',
      revenue: { registration: 4000000, lessons: 7000000, shop: 1500000, total: 12500000 },
      costs: { labor: 5000000, utilities: 800000, rent: 3500000, other: 800000, total: 10100000 },
      netProfit: 2400000,
      profitMargin: 19.2
    },
    {
      id: '3',
      name: '송파센터',
      region: '서울시',
      district: '송파구',
      revenue: { registration: 3000000, lessons: 6000000, shop: 1000000, total: 10000000 },
      costs: { labor: 4500000, utilities: 700000, rent: 3000000, other: 700000, total: 8900000 },
      netProfit: 1100000,
      profitMargin: 11
    },
    {
      id: '4',
      name: '수원센터',
      region: '경기도',
      district: '수원시',
      revenue: { registration: 3500000, lessons: 6500000, shop: 1200000, total: 11200000 },
      costs: { labor: 4800000, utilities: 750000, rent: 2800000, other: 750000, total: 9100000 },
      netProfit: 2100000,
      profitMargin: 18.75
    },
    {
      id: '5',
      name: '성남센터',
      region: '경기도',
      district: '성남시',
      revenue: { registration: 2500000, lessons: 4500000, shop: 800000, total: 7800000 },
      costs: { labor: 3500000, utilities: 600000, rent: 2200000, other: 600000, total: 6900000 },
      netProfit: 900000,
      profitMargin: 11.54
    },
    {
      id: '6',
      name: '용인센터',
      region: '경기도',
      district: '용인시',
      revenue: { registration: 2800000, lessons: 5000000, shop: 900000, total: 8700000 },
      costs: { labor: 3800000, utilities: 650000, rent: 2500000, other: 650000, total: 7600000 },
      netProfit: 1100000,
      profitMargin: 12.64
    },
    {
      id: '7',
      name: '부천센터',
      region: '경기도',
      district: '부천시',
      revenue: { registration: 2000000, lessons: 3500000, shop: 600000, total: 6100000 },
      costs: { labor: 3200000, utilities: 500000, rent: 2200000, other: 500000, total: 6400000 },
      netProfit: -300000,
      profitMargin: -4.92
    },
    {
      id: '8',
      name: '안양센터',
      region: '경기도',
      district: '안양시',
      revenue: { registration: 2200000, lessons: 3800000, shop: 700000, total: 6700000 },
      costs: { labor: 3400000, utilities: 550000, rent: 2300000, other: 550000, total: 6800000 },
      netProfit: -100000,
      profitMargin: -1.49
    }
  ];

  // 지역 데이터 (revenue-management와 동일)
  // 센터 데이터만 정의 (시/도, 시/군/구는 컴포넌트 내장)
  const centerData = {
    '서울시': {
      '강남구': ['강남센터', '논현센터', '역삼센터'],
      '서초구': ['서초센터', '방배센터', '반포센터'],
      '송파구': ['송파센터', '잠실센터', '문정센터'],
      '강동구': ['강동센터', '천호센터', '길동센터'],
      '마포구': ['마포센터', '홍대센터', '상암센터'],
      '용산구': ['용산센터', '이태원센터', '한남센터'],
      '영등포구': ['영등포센터', '여의도센터', '당산센터'],
      '관악구': ['관악센터', '신림센터', '봉천센터'],
      '서대문구': ['서대문센터', '신촌센터', '홍제센터'],
      '동대문구': ['동대문센터', '청량리센터', '회기센터'],
      '중랑구': ['중랑센터', '상봉센터', '망우센터'],
      '성북구': ['성북센터', '길음센터', '석계센터'],
      '강북구': ['강북센터', '미아센터', '수유센터'],
      '도봉구': ['도봉센터', '방학센터', '쌍문센터'],
      '노원구': ['노원센터', '상계센터', '하계센터'],
      '은평구': ['은평센터', '불광센터', '응암센터'],
      '종로구': ['종로센터', '혜화센터', '인사동센터'],
      '중구': ['중구센터', '명동센터', '회현센터']
    },
    '경기도': {
      '고양시': ['고양센터', '일산센터', '덕양센터'],
      '과천시': ['과천센터'],
      '광명시': ['광명센터'],
      '광주시': ['광주센터'],
      '구리시': ['구리센터'],
      '군포시': ['군포센터'],
      '김포시': ['김포센터'],
      '남양주시': ['남양주센터'],
      '동두천시': ['동두천센터'],
      '부천시': ['부천센터', '원미센터', '소사센터'],
      '성남시': ['성남센터', '분당센터', '수정센터'],
      '수원시': ['수원센터', '영통센터', '팔달센터'],
      '시흥시': ['시흥센터'],
      '안산시': ['안산센터'],
      '안성시': ['안성센터'],
      '안양시': ['안양센터', '만안센터', '동안센터'],
      '양주시': ['양주센터'],
      '여주시': ['여주센터'],
      '오산시': ['오산센터'],
      '용인시': ['용인센터', '기흥센터', '수지센터'],
      '의왕시': ['의왕센터'],
      '의정부시': ['의정부센터'],
      '이천시': ['이천센터'],
      '파주시': ['파주센터'],
      '평택시': ['평택센터'],
      '포천시': ['포천센터'],
      '하남시': ['하남센터'],
      '화성시': ['화성센터', '동탄센터', '병점센터']
    }
  };

  useEffect(() => {
    if (user && hasUserType('superAdmin')) {
      loadStatistics();
    }
  }, [user, hasUserType]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 임시 통계 데이터 (실제로는 API에서 가져와야 함)
      const mockStatistics: StatisticsData = {
        overview: {
          totalCenters: 156,
          activeCenters: 142,
          totalUsers: 12450,
          totalRevenue: 2450000000,
          averageSatisfaction: 4.2,
          monthlyGrowth: 8.5,
          averageROI: 24.3,
          totalInstructors: 312,
          averageUtilization: 78.5
        },
        regionStats: [
          { region: '서울시', totalCenters: 45, activeCenters: 42, totalUsers: 5200, totalRevenue: 1200000000, averageRating: 4.3 },
          { region: '경기도', totalCenters: 38, activeCenters: 35, totalUsers: 3100, totalRevenue: 650000000, averageRating: 4.1 },
          { region: '부산광역시', totalCenters: 22, activeCenters: 20, totalUsers: 1800, totalRevenue: 320000000, averageRating: 4.0 },
          { region: '대구광역시', totalCenters: 18, activeCenters: 16, totalUsers: 1200, totalRevenue: 180000000, averageRating: 3.9 },
          { region: '인천광역시', totalCenters: 15, activeCenters: 14, totalUsers: 950, totalRevenue: 150000000, averageRating: 4.2 }
        ],
        centerStats: [
          { centerName: '강남센터', region: '서울시', totalUsers: 450, revenue: 85000000, satisfaction: 4.5, utilization: 85 },
          { centerName: '서초센터', region: '서울시', totalUsers: 380, revenue: 72000000, satisfaction: 4.3, utilization: 82 },
          { centerName: '송파센터', region: '서울시', totalUsers: 320, revenue: 68000000, satisfaction: 4.4, utilization: 80 },
          { centerName: '수원센터', region: '경기도', totalUsers: 280, revenue: 55000000, satisfaction: 4.1, utilization: 78 },
          { centerName: '성남센터', region: '경기도', totalUsers: 250, revenue: 48000000, satisfaction: 4.0, utilization: 75 }
        ],
        topPerformers: [
          { centerName: '강남센터', region: '서울시', metric: '수익', value: 85000000 },
          { centerName: '서초센터', region: '서울시', metric: '만족도', value: 4.3 },
          { centerName: '송파센터', region: '서울시', metric: '이용률', value: 80 },
          { centerName: '수원센터', region: '경기도', metric: '신규가입', value: 45 }
        ]
      };

      setStatistics(mockStatistics);
    } catch (err) {
      setError('통계 데이터를 불러오는 중 오류가 발생했습니다.');
      console.error('Statistics loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  // 지역 필터 핸들러
  const handleRegionToggle = (region: string) => {
    setSelectedRegions(prev => {
      if (prev.includes(region)) {
        return prev.filter(r => r !== region);
      } else {
        return [...prev, region];
      }
    });
  };

  const handleDistrictToggle = (district: string) => {
    setSelectedDistricts(prev => {
      if (prev.includes(district)) {
        return prev.filter(d => d !== district);
      } else {
        return [...prev, district];
      }
    });
  };

  const handleCenterToggle = (center: string) => {
    setSelectedCenters(prev => {
      if (prev.includes(center)) {
        return prev.filter(c => c !== center);
      } else {
        return [...prev, center];
      }
    });
  };

  // 필터링된 통계 데이터
  const filteredStatistics = statistics ? {
    ...statistics,
    regionStats: selectedRegions.length > 0 
      ? statistics.regionStats.filter(stat => selectedRegions.includes(stat.region))
      : statistics.regionStats,
    centerStats: selectedCenters.length > 0 
      ? statistics.centerStats.filter(stat => selectedCenters.includes(stat.centerName))
      : statistics.centerStats,
    topPerformers: selectedCenters.length > 0
      ? statistics.topPerformers.filter(performer => selectedCenters.includes(performer.centerName))
      : statistics.topPerformers
  } : null;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">오류 발생</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 센터 통계</h1>
        <p className="text-gray-600">전체 센터의 통계 데이터를 분석하고 성과를 모니터링합니다.</p>
      </div>

      {/* 지역 필터 */}
      <RegionNavigation
        selectedRegions={selectedRegions}
        setSelectedRegions={setSelectedRegions}
        selectedDistricts={selectedDistricts}
        setSelectedDistricts={setSelectedDistricts}
        selectedCenters={selectedCenters}
        setSelectedCenters={setSelectedCenters}
        centerData={centerData}
        comparisonMode={false}
        layout="dropdown"
        centerDataMap={mockCenterData.reduce((acc, center) => {
          acc[center.name] = center;
          return acc;
        }, {} as { [key: string]: CenterData })}
      />

      {filteredStatistics && (
        <>
          {/* 전체 통계 개요 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <StatCard
              title="전체 센터"
              value={filteredStatistics.overview.totalCenters}
              icon="🏢"
              color="blue"
              subtitle={`활성: ${filteredStatistics.overview.activeCenters}개`}
              href="/admin/center-management"
            />
            
            <StatCard
              title="전체 사용자"
              value={filteredStatistics.overview.totalUsers.toLocaleString()}
              icon="👥"
              color="purple"
              change={{
                value: filteredStatistics.overview.monthlyGrowth,
                type: 'increase'
              }}
              href="/admin/users"
            />
            
            <StatCard
              title="총 수익"
              value={`${(filteredStatistics.overview.totalRevenue / 100000000).toFixed(1)}억원`}
              icon="💰"
              color="yellow"
              subtitle={`ROI: ${filteredStatistics.overview.averageROI}%`}
              href="/admin/revenue-management"
            />
            
            <StatCard
              title="평균 만족도"
              value={filteredStatistics.overview.averageSatisfaction}
              icon="⭐"
              color="orange"
              subtitle={`강사: ${filteredStatistics.overview.totalInstructors}명`}
              onClick={() => {
                setDetailModalContent({
                  title: '평균 만족도 상세 정보',
                  content: (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-orange-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">평균 만족도</p>
                          <p className="text-2xl font-bold text-orange-600">{filteredStatistics.overview.averageSatisfaction}</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">총 강사 수</p>
                          <p className="text-2xl font-bold text-blue-600">{filteredStatistics.overview.totalInstructors}명</p>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">만족도 분포</p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">5점 (매우 만족)</span>
                            <span className="text-sm font-semibold">45%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">4점 (만족)</span>
                            <span className="text-sm font-semibold">35%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">3점 (보통)</span>
                            <span className="text-sm font-semibold">15%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">2점 이하</span>
                            <span className="text-sm font-semibold">5%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                });
                setShowDetailModal(true);
              }}
            />
            
            <StatCard
              title="평균 이용률"
              value={`${filteredStatistics.overview.averageUtilization}%`}
              icon="📊"
              color="green"
              subtitle="시설 활용도"
              onClick={() => {
                setDetailModalContent({
                  title: '평균 이용률 상세 정보',
                  content: (
                    <div className="space-y-4">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">전체 평균 이용률</p>
                        <p className="text-3xl font-bold text-green-600">{filteredStatistics.overview.averageUtilization}%</p>
                        <p className="text-xs text-gray-500 mt-1">시설 활용도 기준</p>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-blue-50 p-3 rounded-lg text-center">
                          <p className="text-xs text-gray-600">수영장</p>
                          <p className="text-lg font-bold text-blue-600">85%</p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg text-center">
                          <p className="text-xs text-gray-600">강의실</p>
                          <p className="text-lg font-bold text-purple-600">72%</p>
                        </div>
                        <div className="bg-yellow-50 p-3 rounded-lg text-center">
                          <p className="text-xs text-gray-600">샤워실</p>
                          <p className="text-lg font-bold text-yellow-600">90%</p>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm font-semibold text-gray-700 mb-2">시간대별 이용률</p>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs">오전 (06:00-12:00)</span>
                            <span className="text-sm font-bold">65%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs">오후 (12:00-18:00)</span>
                            <span className="text-sm font-bold">82%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs">저녁 (18:00-22:00)</span>
                            <span className="text-sm font-bold">95%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                });
                setShowDetailModal(true);
              }}
            />
          </div>

          {/* 지역별 통계 */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">지역별 센터 현황</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">지역</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">전체 센터</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">활성 센터</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">사용자 수</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">수익</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">평균 만족도</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStatistics.regionStats.map((stat, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{stat.region}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stat.totalCenters}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stat.activeCenters}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stat.totalUsers.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(stat.totalRevenue / 100000000).toFixed(1)}억원</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stat.averageRating}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>


          {/* 상위 성과 센터 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">상위 성과 센터</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredStatistics.topPerformers.map((performer, index) => {
                const getColor = (metric: string) => {
                  if (metric === '수익') return 'blue';
                  if (metric === '만족도') return 'orange';
                  if (metric === '이용률') return 'green';
                  return 'purple';
                };
                
                const getIcon = (metric: string) => {
                  if (metric === '수익') return '💰';
                  if (metric === '만족도') return '⭐';
                  if (metric === '이용률') return '📊';
                  return '👥';
                };
                
                const getValue = () => {
                  if (performer.metric === '수익') return `${(performer.value / 100000000).toFixed(1)}억`;
                  if (performer.metric === '만족도') return performer.value.toFixed(1);
                  if (performer.metric === '이용률') return `${performer.value}%`;
                  return performer.value;
                };

                return (
                  <StatCard
                    key={index}
                    title={performer.metric}
                    value={getValue()}
                    icon={getIcon(performer.metric)}
                    color={getColor(performer.metric) as any}
                    subtitle={`${performer.centerName} (${performer.region})`}
                    onClick={() => {
                      setDetailModalContent({
                        title: `${performer.centerName} 상세 정보`,
                        content: (
                          <div className="space-y-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <p className="text-sm text-gray-600">센터명</p>
                              <p className="text-2xl font-bold text-blue-600">{performer.centerName}</p>
                              <p className="text-sm text-gray-500 mt-1">{performer.region}</p>
                            </div>
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                              <p className="text-sm text-gray-600">{performer.metric} 성과</p>
                              <p className="text-3xl font-bold text-blue-600">{getValue()}</p>
                              <p className="text-xs text-gray-500 mt-1">상위 성과 센터</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <p className="text-sm font-semibold text-gray-700 mb-2">기타 정보</p>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">평가 기준</span>
                                  <span className="text-sm font-semibold">{performer.metric}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">순위</span>
                                  <span className="text-sm font-semibold">#{index + 1}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">지역</span>
                                  <span className="text-sm font-semibold">{performer.region}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      });
                      setShowDetailModal(true);
                    }}
                  />
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* 상세 정보 모달 */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowDetailModal(false)}>
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">{detailModalContent.title}</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div>{detailModalContent.content}</div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}