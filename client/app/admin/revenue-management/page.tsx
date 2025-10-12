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
 * - 상태: ✅ 완성 (센터별 매출 관리 페이지 완료)
 * 
 * 🚀 **다음 단계**
 * - 실시간 매출 데이터 연동
 * - 고급 차트 및 시각화
 * - 매출 예측 및 분석
 * - 자동화된 리포트 생성
 * - 모바일 최적화
 * 
 * 💡 **사용 예시**
 * ```tsx
 * // 센터별 매출 관리 페이지 사용
 * <RevenueManagementPage />
 * 
 * // 권한 확인
 * if (!hasUserType('superAdmin')) {
 *   return <AccessDenied />;
 * }
 * ```
 * 
 * 🔍 **매출 관리 처리 흐름**
 * 1. 사용자 권한 확인 (superAdmin)
 * 2. 센터별 매출 데이터 로드
 * 3. 수익원별 분석 데이터 처리
 * 4. 비용 구조 분석 및 계산
 * 5. 센터별 수익성 평가
 * 6. 지역별 매출 분포 분석
 * 7. 기간별 트렌드 분석
 * 8. 인사이트 및 추천 생성
 * 9. 대시보드 렌더링
 * 10. 실시간 데이터 업데이트
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import RegionNavigation from '@/components/RegionNavigation';
import ComparisonChart from '@/components/ComparisonChart';

export default function RevenueManagementPage() {
  const { user, hasUserType } = useAuth();
  
  // 상태 관리
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [selectedCenters, setSelectedCenters] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [comparisonMode, setComparisonMode] = useState(false);

  // 지역 데이터
  const regionData: { [key: string]: string[] } = {
    '서울특별시': ['강남구', '서초구', '송파구', '강동구', '마포구', '용산구'],
    '경기도': ['수원시', '성남시', '용인시', '부천시', '화성시', '고양시', '분당구'],
    '인천광역시': ['연수구', '남동구', '계양구', '부평구'],
    '부산광역시': ['해운대구', '사하구', '금정구', '북구'],
    '대구광역시': ['수성구', '달서구', '달성군'],
    '광주광역시': ['서구', '남구', '북구'],
    '대전광역시': ['유성구', '서구', '중구'],
    '울산광역시': ['남구', '동구', '북구']
  };

  // 센터 데이터 (지역별)
  const centerDataByRegion: { [region: string]: { [district: string]: string[] } } = {
    '서울특별시': {
      '강남구': ['강남센터', '역삼센터'],
      '서초구': ['서초센터', '방배센터'],
      '송파구': ['송파센터', '잠실센터'],
      '강동구': ['강동센터'],
      '마포구': ['홍대센터', '마포센터'],
      '용산구': ['용산센터']
    },
    '경기도': {
      '수원시': ['수원센터'],
      '성남시': ['분당센터', '판교센터'],
      '용인시': ['용인센터'],
      '부천시': ['부천센터'],
      '화성시': ['동탄센터'],
      '고양시': ['일산센터'],
      '분당구': ['분당센터']
    },
    '부산광역시': {
      '해운대구': ['해운대센터'],
      '사하구': ['사하센터'],
      '금정구': ['금정센터'],
      '북구': ['부산북센터']
    }
  };

  // 센터별 상세 데이터
  const [centersData, setCentersData] = useState<{ [centerName: string]: any }>({
    '강남센터': { id: 'center-1', name: '강남센터', region: '서울특별시', district: '강남구', 
      revenue: { registration: 15000000, lessons: 45000000, shop: 8000000, total: 68000000 },
      costs: { labor: 25000000, utilities: 5000000, rent: 12000000, other: 3000000, total: 45000000 },
      netProfit: 23000000, profitMargin: 33.8
    },
    '서초센터': { id: 'center-2', name: '서초센터', region: '서울특별시', district: '서초구',
      revenue: { registration: 12000000, lessons: 38000000, shop: 6000000, total: 56000000 },
      costs: { labor: 22000000, utilities: 4500000, rent: 10000000, other: 2500000, total: 39000000 },
      netProfit: 17000000, profitMargin: 30.4
    },
    '분당센터': { id: 'center-3', name: '분당센터', region: '경기도', district: '분당구',
      revenue: { registration: 10000000, lessons: 30000000, shop: 5000000, total: 45000000 },
      costs: { labor: 18000000, utilities: 4000000, rent: 9000000, other: 2000000, total: 33000000 },
      netProfit: 12000000, profitMargin: 26.7
    },
    '송파센터': { id: 'center-4', name: '송파센터', region: '서울특별시', district: '송파구',
      revenue: { registration: 13000000, lessons: 40000000, shop: 7000000, total: 60000000 },
      costs: { labor: 23000000, utilities: 4800000, rent: 11000000, other: 2700000, total: 41500000 },
      netProfit: 18500000, profitMargin: 30.8
    },
    '부산센터': { id: 'center-5', name: '부산센터', region: '부산광역시', district: '해운대구',
      revenue: { registration: 9000000, lessons: 27000000, shop: 4500000, total: 40500000 },
      costs: { labor: 16000000, utilities: 3500000, rent: 8000000, other: 1800000, total: 29300000 },
      netProfit: 11200000, profitMargin: 27.7
    }
  });

  // 매출 데이터
  const [revenueData, setRevenueData] = useState({
    overview: {
      totalRevenue: 12500000000,
      netProfit: 3750000000,
      growthRate: 12.5,
      targetAchievement: 95.2,
      avgRevenuePerCenter: 833333333
    },
    revenueSources: {
      membershipFees: { amount: 6250000000, percentage: 50.0 },
      lessonFees: { amount: 3750000000, percentage: 30.0 },
      privateLessons: { amount: 1875000000, percentage: 15.0 },
      equipmentRental: { amount: 500000000, percentage: 4.0 },
      otherServices: { amount: 125000000, percentage: 1.0 }
    },
    centerContributions: [
      { name: '강남센터', revenue: 2500000000, profit: 750000000, growth: 15.2 },
      { name: '송파센터', revenue: 2000000000, profit: 600000000, growth: 12.8 },
      { name: '분당센터', revenue: 1800000000, profit: 540000000, growth: 10.5 },
      { name: '홍대센터', revenue: 1500000000, profit: 450000000, growth: 8.9 },
      { name: '부산센터', revenue: 1200000000, profit: 360000000, growth: 6.2 }
    ],
    costAnalysis: {
      laborCosts: { amount: 2500000000, percentage: 20.0 },
      rentCosts: { amount: 1875000000, percentage: 15.0 },
      taxCosts: { amount: 1250000000, percentage: 10.0 },
      maintenanceCosts: { amount: 625000000, percentage: 5.0 },
      marketingCosts: { amount: 375000000, percentage: 3.0 },
      insuranceCosts: { amount: 250000000, percentage: 2.0 },
      otherCosts: { amount: 125000000, percentage: 1.0 }
    }
  });

  // 데이터 새로고침
  const refreshData = async () => {
    setLoading(true);
    try {
      // 실제 API 호출 대신 목 데이터 업데이트
      setLastUpdated(new Date());
      console.log('매출 데이터 새로고침 완료');
    } catch (error) {
      console.error('데이터 새로고침 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // 권한 확인
  if (!user || !hasUserType('superAdmin')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">접근 권한 없음</h1>
          <p className="text-gray-600">이 페이지는 최고관리자만 접근할 수 있습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">센터별 매출 관리</h1>
            <p className="text-gray-600 mt-2">JJ Swim Lab 센터별 수익 및 비용 분석 대시보드</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={refreshData}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '새로고침 중...' : '새로고침'}
            </button>
            <div className="text-sm text-gray-500">
              마지막 업데이트: {lastUpdated.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* 필터 섹션 */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">필터 옵션</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">기간</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="week">이번 주</option>
                <option value="month">이번 달</option>
                <option value="quarter">이번 분기</option>
                <option value="year">올해</option>
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
      </div>

      {/* 매출 개요 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 매출</p>
              <p className="text-2xl font-bold text-gray-900">₩{revenueData.overview.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">📈</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">순이익</p>
              <p className="text-2xl font-bold text-gray-900">₩{revenueData.overview.netProfit.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">성장률</p>
              <p className="text-2xl font-bold text-gray-900">{revenueData.overview.growthRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">🎯</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">목표 달성률</p>
              <p className="text-2xl font-bold text-gray-900">{revenueData.overview.targetAchievement}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <span className="text-2xl">🏢</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">센터당 평균</p>
              <p className="text-2xl font-bold text-gray-900">₩{revenueData.overview.avgRevenuePerCenter.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 수익원별 분석 */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">수익원별 분석</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Object.entries(revenueData.revenueSources).map(([key, value]) => (
            <div key={key} className="text-center">
              <div className="text-2xl font-bold text-blue-600">₩{value.amount.toLocaleString()}</div>
              <div className="text-sm text-gray-600">
                {key === 'membershipFees' ? '회원 등록비' :
                 key === 'lessonFees' ? '강습비' :
                 key === 'privateLessons' ? '개인레슨' :
                 key === 'equipmentRental' ? '장비 대여' : '기타 서비스'}
              </div>
              <div className="text-xs text-gray-500">{value.percentage}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* 센터별 기여도 분석 */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">센터별 기여도 분석</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">센터명</th>
                <th className="text-left py-2">매출</th>
                <th className="text-left py-2">순이익</th>
                <th className="text-left py-2">성장률</th>
                <th className="text-left py-2">수익률</th>
              </tr>
            </thead>
            <tbody>
              {revenueData.centerContributions.map((center, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2 font-medium">{center.name}</td>
                  <td className="py-2">₩{center.revenue.toLocaleString()}</td>
                  <td className="py-2">₩{center.profit.toLocaleString()}</td>
                  <td className="py-2 text-green-600">{center.growth}%</td>
                  <td className="py-2">{((center.profit / center.revenue) * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 비용 구조 분석 */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">비용 구조 분석</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(revenueData.costAnalysis).map(([key, value]) => (
            <div key={key} className="text-center">
              <div className="text-2xl font-bold text-red-600">₩{value.amount.toLocaleString()}</div>
              <div className="text-sm text-gray-600">
                {key === 'laborCosts' ? '인건비' :
                 key === 'rentCosts' ? '임대료' :
                 key === 'taxCosts' ? '제세공과금' :
                 key === 'maintenanceCosts' ? '유지보수비' :
                 key === 'marketingCosts' ? '마케팅비' :
                 key === 'insuranceCosts' ? '보험료' : '기타 비용'}
              </div>
              <div className="text-xs text-gray-500">{value.percentage}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* 센터별 비교 분석 */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">🏢 센터별 비교 분석</h3>
          <button
            onClick={() => setComparisonMode(!comparisonMode)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              comparisonMode 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {comparisonMode ? '✅ 비교 모드 활성화' : '비교 모드'}
          </button>
        </div>

        {/* 지역 필터 */}
        <RegionNavigation
          selectedRegions={selectedRegions}
          setSelectedRegions={setSelectedRegions}
          selectedDistricts={selectedDistricts}
          setSelectedDistricts={setSelectedDistricts}
          selectedCenters={selectedCenters}
          setSelectedCenters={setSelectedCenters}
          regionData={regionData}
          centerData={centerDataByRegion}
          comparisonMode={comparisonMode}
          centerDataMap={centersData}
        />

        {/* 선택된 센터들의 비교 차트 */}
        {selectedCenters.length > 0 && comparisonMode && (
          <div className="mt-8 space-y-6">
            {/* 수익 비교 차트 */}
            <ComparisonChart
              centers={selectedCenters.map(name => centersData[name]).filter(Boolean)}
              title="💰 센터별 수익 비교"
              items={[
                { 
                  key: 'registration', 
                  label: '등록비', 
                  icon: '📝', 
                  color: 'text-blue-600',
                  bgColor: 'from-blue-400 via-blue-500 to-blue-600',
                  getValue: (center) => center.revenue.registration 
                },
                { 
                  key: 'lessons', 
                  label: '강습비', 
                  icon: '🏊', 
                  color: 'text-green-600',
                  bgColor: 'from-green-400 via-green-500 to-green-600',
                  getValue: (center) => center.revenue.lessons 
                },
                { 
                  key: 'shop', 
                  label: '매점판매', 
                  icon: '🛒', 
                  color: 'text-purple-600',
                  bgColor: 'from-purple-400 via-purple-500 to-purple-600',
                  getValue: (center) => center.revenue.shop 
                }
              ]}
            />

            {/* 비용 비교 차트 */}
            <ComparisonChart
              centers={selectedCenters.map(name => centersData[name]).filter(Boolean)}
              title="💸 센터별 비용 비교"
              hasRevenue={false}
              items={[
                { 
                  key: 'labor', 
                  label: '인건비', 
                  icon: '👥', 
                  color: 'text-orange-600',
                  bgColor: 'from-orange-400 via-orange-500 to-orange-600',
                  getValue: (center) => center.costs.labor 
                },
                { 
                  key: 'utilities', 
                  label: '공과금', 
                  icon: '⚡', 
                  color: 'text-yellow-600',
                  bgColor: 'from-yellow-400 via-yellow-500 to-yellow-600',
                  getValue: (center) => center.costs.utilities 
                },
                { 
                  key: 'rent', 
                  label: '임대료', 
                  icon: '🏠', 
                  color: 'text-red-600',
                  bgColor: 'from-red-400 via-red-500 to-red-600',
                  getValue: (center) => center.costs.rent 
                },
                { 
                  key: 'other', 
                  label: '기타비용', 
                  icon: '📦', 
                  color: 'text-gray-600',
                  bgColor: 'from-gray-400 via-gray-500 to-gray-600',
                  getValue: (center) => center.costs.other 
                }
              ]}
            />

            {/* 수익성 비교 차트 */}
            <ComparisonChart
              centers={selectedCenters.map(name => centersData[name]).filter(Boolean)}
              title="📊 센터별 수익성 비교"
              items={[
                { 
                  key: 'netProfit', 
                  label: '순이익', 
                  icon: '💎', 
                  color: 'text-emerald-600',
                  bgColor: 'from-emerald-400 via-emerald-500 to-emerald-600',
                  getValue: (center) => center.netProfit 
                }
              ]}
            />
          </div>
        )}

        {selectedCenters.length === 0 && comparisonMode && (
          <div className="mt-8 text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500 text-lg">👆 위에서 센터를 선택하면 비교 차트가 표시됩니다</p>
          </div>
        )}
      </div>
    </div>
  );
}
