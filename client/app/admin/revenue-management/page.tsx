/**
 * 센터별 매출 관리 페이지
 * 
 * 연동되는 데이터:
 * - 센터별 수익과 비용 데이터
 * - 지역별 센터 데이터
 * 
 * 연동되는 파일:
 * - RegionNavigation: 지역 필터 컴포넌트
 * - ComparisonChart: 비교 차트 컴포넌트
 */

'use client';
import { logger } from '@/lib/logger';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import RegionNavigation from '@/components/RegionNavigation';
import ComparisonChart from '@/components/ComparisonChart';
import TrendLineChart from '@/components/TrendLineChart';
import type { TrendLineData, TrendMetric } from '@/components/TrendLineChart';
import { CardGrid, PageHeader } from '@/components/common';

export default function RevenueManagementPage() {
  const { user, hasUserType } = useAuth();
  
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [selectedCenters, setSelectedCenters] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [selectedCategory, setSelectedCategory] = useState<'revenue' | 'cost'>('revenue');
  const [selectedMetric, setSelectedMetric] = useState<string>('registration');
  
  // 기간 설정
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');
  const [periodUnit, setPeriodUnit] = useState<'week' | 'month' | 'quarter' | 'half' | 'year'>('month');

  // centerData: 전국 시/도별 센터 데이터
  const centerDataByRegion: { [region: string]: { [district: string]: string[] } } = {
    '서울시': {
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
      '고양시': ['일산센터']
    },
    '부산시': {
      '해운대구': ['해운대센터'],
      '사하구': ['사하센터'],
      '금정구': ['금정센터'],
      '북구': ['부산북센터']
    },
    '대구시': {
      '수성구': ['수성센터'],
      '달서구': ['달서센터']
    },
    '인천시': {
      '연수구': ['연수센터'],
      '남동구': ['남동센터']
    },
    '광주시': {
      '서구': ['광주서구센터'],
      '남구': ['광주남구센터']
    },
    '대전시': {
      '유성구': ['유성센터'],
      '서구': ['대전서구센터']
    },
    '울산시': {
      '남구': ['울산남구센터']
    }
  };

  const [centersData, setCentersData] = useState<{ [centerName: string]: any }>({
    '강남센터': { 
      id: 'center-1', name: '강남센터', region: '서울시', district: '강남구', 
      revenue: { registration: 15000000, lessons: 45000000, shop: 8000000, total: 68000000 },
      costs: { labor: 25000000, utilities: 5000000, rent: 12000000, other: 3000000, total: 45000000 },
      netProfit: 23000000, profitMargin: 33.8
    },
    '서초센터': { 
      id: 'center-2', name: '서초센터', region: '서울시', district: '서초구',
      revenue: { registration: 12000000, lessons: 38000000, shop: 6000000, total: 56000000 },
      costs: { labor: 22000000, utilities: 4500000, rent: 10000000, other: 2500000, total: 39000000 },
      netProfit: 17000000, profitMargin: 30.4
    },
    '분당센터': { 
      id: 'center-3', name: '분당센터', region: '경기도', district: '성남시',
      revenue: { registration: 10000000, lessons: 30000000, shop: 5000000, total: 45000000 },
      costs: { labor: 18000000, utilities: 4000000, rent: 9000000, other: 2000000, total: 33000000 },
      netProfit: 12000000, profitMargin: 26.7
    },
    '송파센터': { 
      id: 'center-4', name: '송파센터', region: '서울시', district: '송파구',
      revenue: { registration: 13000000, lessons: 40000000, shop: 7000000, total: 60000000 },
      costs: { labor: 23000000, utilities: 4800000, rent: 11000000, other: 2700000, total: 41500000 },
      netProfit: 18500000, profitMargin: 30.8
    },
    '부산센터': { 
      id: 'center-5', name: '부산센터', region: '부산시', district: '해운대구',
      revenue: { registration: 9000000, lessons: 27000000, shop: 4500000, total: 40500000 },
      costs: { labor: 16000000, utilities: 3500000, rent: 8000000, other: 1800000, total: 29300000 },
      netProfit: 11200000, profitMargin: 27.7
    },
    '홍대센터': { 
      id: 'center-6', name: '홍대센터', region: '서울시', district: '마포구',
      revenue: { registration: 11000000, lessons: 33000000, shop: 5500000, total: 49500000 },
      costs: { labor: 19000000, utilities: 4200000, rent: 9500000, other: 2100000, total: 34800000 },
      netProfit: 14700000, profitMargin: 29.7
    }
  });

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

  const refreshData = async () => {
    setLoading(true);
    try {
      setLastUpdated(new Date());
      logger.info('매출 데이터 새로고침 완료');
    } catch (error) {
      logger.error('데이터 새로고침 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // 금액을 한글로 변환하는 함수
  const formatKoreanCurrency = (amount: number): string => {
    if (amount >= 100000000) {
      return `${(amount / 100000000).toFixed(1)}억원`;
    } else if (amount >= 10000) {
      return `${(amount / 10000).toFixed(0)}만원`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}천원`;
    }
    return `${amount}원`;
  };

  // 선택된 센터들의 추세 데이터 생성
  const generateTrendData = (): TrendLineData[] => {
    if (selectedCenters.length === 0) return [];

    // 시작/종료 날짜 기반 기간 계산
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    // 주기별 라벨 생성
    const periods: string[] = [];
    const current = new Date(start);
    
    if (periodUnit === 'week') {
      while (current <= end) {
        const weekNum = Math.ceil((current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7)) + 1;
        periods.push(`${weekNum}주차`);
        current.setDate(current.getDate() + 7);
      }
    } else if (periodUnit === 'month') {
      while (current <= end) {
        periods.push(`${current.getFullYear()}.${String(current.getMonth() + 1).padStart(2, '0')}`);
        current.setMonth(current.getMonth() + 1);
      }
    } else if (periodUnit === 'quarter') {
      while (current <= end) {
        const quarter = Math.floor(current.getMonth() / 3) + 1;
        periods.push(`${current.getFullYear()}.Q${quarter}`);
        current.setMonth(current.getMonth() + 3);
      }
    } else if (periodUnit === 'half') {
      while (current <= end) {
        const half = current.getMonth() < 6 ? '상반기' : '하반기';
        periods.push(`${current.getFullYear()}.${half}`);
        current.setMonth(current.getMonth() + 6);
      }
    } else { // year
      while (current <= end) {
        periods.push(`${current.getFullYear()}년`);
        current.setFullYear(current.getFullYear() + 1);
      }
    }
    
    // 최소 2개 이상의 데이터 포인트 보장
    if (periods.length < 2) {
      if (periodUnit === 'month') {
        periods.push('1월', '2월', '3월', '4월', '5월', '6월');
      } else {
        periods.push('기간1', '기간2');
      }
    }

    return selectedCenters
      .map(centerName => {
        const center = centersData[centerName];
        if (!center) return null;

        const baseValue = selectedCategory === 'revenue'
          ? (selectedMetric === 'registration' ? center.revenue.registration :
             selectedMetric === 'lessons' ? center.revenue.lessons :
             selectedMetric === 'shop' ? center.revenue.shop :
             center.revenue.total)
          : (selectedMetric === 'labor' ? center.costs.labor :
             selectedMetric === 'utilities' ? center.costs.utilities :
             selectedMetric === 'rent' ? center.costs.rent :
             selectedMetric === 'other' ? center.costs.other :
             center.costs.total);

        // 값이 유효한지 확인
        if (!baseValue || baseValue === 0) return null;

        // 추세 데이터 생성 (성장 추세 시뮬레이션)
        const growthRate = (center.profitMargin || 10) / 1000; // 작은 성장률 적용
        const data = periods.map((period, idx) => {
          const variation = 1 + (growthRate * idx);
          const randomFactor = 0.95 + (Math.sin(idx) * 0.1); // 95%~105% 변동
          const value = Math.round(baseValue * variation * randomFactor);
          return {
            date: period,
            value: value > 0 ? value : baseValue // 음수 방지
      };
    });
    
        // 센터별 색상 지정
        const colors: { [key: string]: string } = {
          '강남센터': '#3b82f6',
          '서초센터': '#10b981',
          '분당센터': '#8b5cf6',
          '송파센터': '#f59e0b',
          '부산센터': '#ef4444',
          '홍대센터': '#ec4899'
        };

        return {
          name: centerName,
          color: colors[centerName] || '#6b7280',
          data
        };
      })
      .filter(Boolean) as TrendLineData[];
  };

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
      <PageHeader
        title="센터별 매출 관리"
        description="JJ Swim Lab 센터별 수익 및 비용 분석 대시보드"
        actions={
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
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 매출</p>
              <p className="text-2xl font-bold text-gray-900">{formatKoreanCurrency(revenueData.overview.totalRevenue)}</p>
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
              <p className="text-2xl font-bold text-gray-900">{formatKoreanCurrency(revenueData.overview.netProfit)}</p>
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
              <p className="text-2xl font-bold text-gray-900">{formatKoreanCurrency(revenueData.overview.avgRevenuePerCenter)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">수익원별 분석</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Object.entries(revenueData.revenueSources).map(([key, value]) => (
            <div key={key} className="text-center">
              <div className="text-2xl font-bold text-blue-600">{formatKoreanCurrency(value.amount)}</div>
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

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">비용 구조 분석</h3>
        <CardGrid gap={4}>
          {Object.entries(revenueData.costAnalysis).map(([key, value]) => (
            <div key={key} className="text-center">
              <div className="text-2xl font-bold text-red-600">{formatKoreanCurrency(value.amount)}</div>
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
        </CardGrid>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="mb-6">
          <h3 className="text-lg font-semibold">🏢 센터별 비교 분석</h3>
          <p className="text-sm text-gray-500 mt-1">여러 센터를 선택하여 수익과 비용을 비교하세요</p>
        </div>

        <RegionNavigation
          selectedRegions={selectedRegions}
          setSelectedRegions={setSelectedRegions}
          selectedDistricts={selectedDistricts}
          setSelectedDistricts={setSelectedDistricts}
          selectedCenters={selectedCenters}
          setSelectedCenters={setSelectedCenters}
          centerData={centerDataByRegion}
          comparisonMode={true}
          centerDataMap={centersData}
        />

        {selectedCenters.length > 0 && (
          <div className="mt-8 space-y-6">
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

            {/* 추세 그래프 섹션 */}
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-2xl">📈</span>
                <span>기간별 추세 분석</span>
              </h3>

              {/* 기간 설정 */}
              <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                <label className="block text-sm font-medium text-blue-900 mb-3">📅 분석 기간 설정</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">시작일</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">종료일</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
          <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">표시 주기</label>
                    <select
                      value={periodUnit}
                      onChange={(e) => setPeriodUnit(e.target.value as any)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="week">주 단위</option>
                      <option value="month">월 단위</option>
                      <option value="quarter">분기 단위</option>
                      <option value="half">반기 단위</option>
                      <option value="year">년 단위</option>
                    </select>
            </div>
          </div>
        </div>

              {/* 카테고리 및 지표 선택 */}
              <div className="flex gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedCategory('revenue');
                        setSelectedMetric('registration');
                      }}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        selectedCategory === 'revenue'
                          ? 'bg-green-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      💰 수익 항목
                    </button>
          <button
                      onClick={() => {
                        setSelectedCategory('cost');
                        setSelectedMetric('labor');
                      }}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        selectedCategory === 'cost'
                          ? 'bg-red-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      💸 비용 항목
          </button>
        </div>
      </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {selectedCategory === 'revenue' ? '수익 지표' : '비용 지표'}
                  </label>
                  <select
                    value={selectedMetric}
                    onChange={(e) => setSelectedMetric(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {selectedCategory === 'revenue' ? (
                      <>
                        <option value="registration">📝 등록비</option>
                        <option value="lessons">🏊 강습비</option>
                        <option value="shop">🛒 매점판매</option>
                        <option value="total">💰 총 수익</option>
                      </>
                    ) : (
                      <>
                        <option value="labor">👥 인건비</option>
                        <option value="utilities">⚡ 공과금</option>
                        <option value="rent">🏠 임대료</option>
                        <option value="other">📦 기타비용</option>
                        <option value="total">💸 총 비용</option>
                      </>
                    )}
                  </select>
                      </div>
                      </div>

              {/* 추세 그래프 */}
              <TrendLineChart
                data={generateTrendData()}
                metric={{
                  label: selectedCategory === 'revenue' 
                    ? (selectedMetric === 'registration' ? '등록비' :
                       selectedMetric === 'lessons' ? '강습비' :
                       selectedMetric === 'shop' ? '매점판매' : '총 수익')
                    : (selectedMetric === 'labor' ? '인건비' :
                       selectedMetric === 'utilities' ? '공과금' :
                       selectedMetric === 'rent' ? '임대료' :
                       selectedMetric === 'other' ? '기타비용' : '총 비용'),
                  unit: '원',
                  decimals: 0
                }}
                height="400px"
              />
        </div>
          </div>
        )}

        {selectedCenters.length === 0 && (
          <div className="mt-8 text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500 text-lg">👆 위에서 센터를 선택하면 비교 차트가 표시됩니다</p>
          </div>
        )}
      </div>
    </div>
  );
}
