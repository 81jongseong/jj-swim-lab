/**
 * @file 센터별 매출관리 페이지
 * @description 최고 관리자가 각 센터별 매출과 비용을 관리하는 페이지입니다.
 * @date 2025-01-22
 * @author JJ Swim Lab
 * 
 * 📋 **의존성**:
 * - ../../components/ui/index.ts (UI 컴포넌트들)
 * - ../../hooks/useAuth.tsx (인증 훅)
 * 
 * 🔄 **연동 데이터**:
 * - /api/revenue-management (매출관리 API)
 * - 추후 실시간 데이터 연동 예정
 * 
 * 🎨 **레이아웃**:
 * - 상단: 통계 카드 (총 매출, 순이익, 성장률)
 * - 중간: 지역별 필터 및 센터 선택
 * - 하단: 매출 분석 차트 및 센터별 상세 정보
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useRouter } from 'next/navigation';

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

export default function RevenueManagementPage() {
  const { user, hasUserType } = useAuth();
  const router = useRouter();
  
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [selectedCenters, setSelectedCenters] = useState<string[]>([]);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedComparisonCenters, setSelectedComparisonCenters] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // 지역 데이터
  const regionData = {
    '서울특별시': ['강남구', '서초구', '송파구', '강동구', '마포구', '용산구'],
    '경기도': ['수원시', '성남시', '용인시', '부천시', '화성시', '고양시'],
    '인천광역시': ['연수구', '남동구', '계양구', '부평구'],
    '부산광역시': ['해운대구', '사하구', '금정구', '북구'],
    '대구광역시': ['수성구', '달서구', '달성군'],
    '광주광역시': ['서구', '남구', '북구'],
    '대전광역시': ['유성구', '서구', '중구'],
    '울산광역시': ['남구', '동구', '북구']
  };

  // 센터 데이터
  const centerData: CenterData[] = [
    {
      id: 'center-1',
      name: '강남 수영센터',
      region: '서울특별시',
      district: '강남구',
      revenue: { registration: 15000000, lessons: 45000000, shop: 8000000, total: 68000000 },
      costs: { labor: 25000000, utilities: 5000000, rent: 12000000, other: 3000000, total: 45000000 },
      netProfit: 23000000,
      profitMargin: 33.8
    },
    {
      id: 'center-2',
      name: '서초 수영센터',
      region: '서울특별시',
      district: '서초구',
      revenue: { registration: 12000000, lessons: 38000000, shop: 6000000, total: 56000000 },
      costs: { labor: 22000000, utilities: 4500000, rent: 10000000, other: 2500000, total: 39000000 },
      netProfit: 17000000,
      profitMargin: 30.4
    },
    {
      id: 'center-3',
      name: '수원 수영센터',
      region: '경기도',
      district: '수원시',
      revenue: { registration: 8000000, lessons: 25000000, shop: 4000000, total: 37000000 },
      costs: { labor: 15000000, utilities: 3000000, rent: 8000000, other: 2000000, total: 28000000 },
      netProfit: 9000000,
      profitMargin: 24.3
    }
  ];

  const [sampleCenters, setSampleCenters] = useState<CenterData[]>([]);

  useEffect(() => {
    if (user && hasUserType('superAdmin')) {
      loadData();
    } else if (user && !hasUserType('superAdmin')) {
      router.push('/dashboard');
    }
  }, [user, hasUserType]);

  const loadData = async () => {
    setLoading(false);
    try {
      setTimeout(() => {
        setSampleCenters(centerData);
        setLoading(false);
      }, 100);
    } catch (error) {
      console.error('매출 데이터 로드 실패:', error);
      setLoading(false);
    }
  };

  const handleRegionChange = (region: string) => {
    setSelectedRegions([region]);
    setSelectedDistricts([]);
    setSelectedCenters([]);
  };

  const handleDistrictToggle = (district: string) => {
    setSelectedDistricts(prev => 
      prev.includes(district) 
        ? prev.filter(d => d !== district)
        : [...prev, district]
    );
  };

  const handleCenterToggle = (centerId: string) => {
    setSelectedCenters(prev => 
      prev.includes(centerId) 
        ? prev.filter(c => c !== centerId)
        : [...prev, centerId]
    );
  };

  const toggleComparisonMode = () => {
    setComparisonMode(!comparisonMode);
    if (!comparisonMode) {
      setSelectedComparisonCenters(selectedCenters);
    } else {
      setSelectedComparisonCenters([]);
    }
  };

  // 비율 재계산 함수 (정확히 100%가 되도록 조정, 마이너스 완전 방지)
  const recalculatePercentages = (data: any, total: number) => {
    const keys = Object.keys(data);
    const recalculated = {};
    
    if (total === 0) {
      // 총합이 0이면 균등 분배
      const equalPercentage = 100 / keys.length;
      keys.forEach(key => {
        recalculated[key] = {
          ...data[key],
          percentage: Math.round(equalPercentage * 10) / 10
        };
      });
      return recalculated;
    }
    
    // 각 항목의 비율을 계산 (소수점 1자리까지)
    const rawPercentages = keys.map(key => {
      const percentage = (data[key].amount / total) * 100;
      return { key, percentage: Math.max(0, Math.round(percentage * 10) / 10) }; // 마이너스 방지
    });
    
    // 실제 비율의 합계 계산
    const totalRawPercentage = rawPercentages.reduce((sum, item) => sum + item.percentage, 0);
    
    if (totalRawPercentage === 0) {
      // 모든 비율이 0이면 균등 분배
      const equalPercentage = 100 / keys.length;
      keys.forEach(key => {
        recalculated[key] = {
          ...data[key],
          percentage: Math.round(equalPercentage * 10) / 10
        };
      });
      return recalculated;
    }
    
    // 비율을 정규화하여 100%가 되도록 조정
    const normalizationFactor = 100 / totalRawPercentage;
    
    rawPercentages.forEach((item, index) => {
      let normalizedPercentage = item.percentage * normalizationFactor;
      
      // 마지막 항목인 경우, 나머지 비율로 설정하여 정확히 100%가 되도록 함
      if (index === rawPercentages.length - 1) {
        const previousSum = rawPercentages.slice(0, -1).reduce((sum, p) => sum + (p.percentage * normalizationFactor), 0);
        normalizedPercentage = Math.max(0, 100 - previousSum); // 마이너스 방지
      }
      
      recalculated[item.key] = {
        ...data[item.key],
        percentage: Math.round(normalizedPercentage * 10) / 10
      };
    });
    
    return recalculated;
  };

  // 필터링된 센터 데이터
  const filteredCenters = sampleCenters.filter(center => {
    const matchesRegion = selectedRegions.length === 0 || selectedRegions.includes(center.region);
    const matchesDistrict = selectedDistricts.length === 0 || selectedDistricts.includes(center.district);
    const matchesCenter = selectedCenters.length === 0 || selectedCenters.includes(center.id);
    
    return matchesRegion && matchesDistrict && matchesCenter;
  });

  // 선택된 센터들의 통계
  const selectedStats = filteredCenters.reduce((stats, center) => ({
    totalRevenue: stats.totalRevenue + center.revenue.total,
    totalCosts: stats.totalCosts + center.costs.total,
    totalProfit: stats.totalProfit + center.netProfit,
    centerCount: stats.centerCount + 1
  }), { totalRevenue: 0, totalCosts: 0, totalProfit: 0, centerCount: 0 });

  if (!user || !hasUserType('superAdmin')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">접근 권한 없음</h1>
          <p className="text-gray-600">이 페이지에 접근할 권한이 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">💰 센터별 매출 관리</h1>
        <p className="text-gray-600 mt-2">각 센터별 매출과 비용을 분석하고 관리합니다.</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 매출</p>
              <p className="text-2xl font-bold text-green-600">{selectedStats.totalRevenue.toLocaleString()}원</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <span className="text-2xl">💸</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 비용</p>
              <p className="text-2xl font-bold text-red-600">{selectedStats.totalCosts.toLocaleString()}원</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">📈</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">순이익</p>
              <p className="text-2xl font-bold text-blue-600">{selectedStats.totalProfit.toLocaleString()}원</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">🏢</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">선택된 센터</p>
              <p className="text-2xl font-bold text-purple-600">{selectedStats.centerCount}개</p>
            </div>
          </div>
        </div>
      </div>

      {/* 필터 섹션 */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">🔍 지역 및 센터 필터</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 시/도 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">시/도</label>
            <select
              value={selectedRegions[0] || ''}
              onChange={(e) => handleRegionChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">전체</option>
              {Object.keys(regionData).map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>

          {/* 시/군/구 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">시/군/구</label>
            <div className="flex flex-wrap gap-2">
              {selectedRegions.length > 0 && regionData[selectedRegions[0]]?.map(district => (
                <button
                  key={district}
                  onClick={() => handleDistrictToggle(district)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedDistricts.includes(district)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {district}
                </button>
              ))}
              {selectedRegions.length === 0 && (
                <p className="text-sm text-gray-500">시/도를 먼저 선택해주세요</p>
              )}
            </div>
          </div>

          {/* 센터 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">해당 센터</label>
            <div className="flex flex-wrap gap-2">
              {sampleCenters
                .filter(center => 
                  selectedRegions.length === 0 || selectedRegions.includes(center.region)
                )
                .filter(center => 
                  selectedDistricts.length === 0 || selectedDistricts.includes(center.district)
                )
                .map(center => (
                  <button
                    key={center.id}
                    onClick={() => handleCenterToggle(center.id)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedCenters.includes(center.id)
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {center.name}
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* 비교 모드 토글 */}
        <div className="mt-4">
          <button
            onClick={toggleComparisonMode}
            className={`px-4 py-2 rounded-lg font-medium ${
              comparisonMode
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {comparisonMode ? '비교 모드 해제' : '비교 모드 활성화'}
          </button>
        </div>
      </div>

      {/* 센터별 상세 정보 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">🏢 센터별 상세 정보</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">센터명</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">지역</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">총 매출</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">총 비용</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">순이익</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">수익률</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">액션</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    로딩 중...
                  </td>
                </tr>
              ) : filteredCenters.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    선택된 조건에 맞는 센터가 없습니다.
                  </td>
                </tr>
              ) : (
                filteredCenters.map((center) => (
                  <tr key={center.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{center.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{center.region} {center.district}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">{center.revenue.total.toLocaleString()}원</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-red-600">{center.costs.total.toLocaleString()}원</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${center.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        {center.netProfit.toLocaleString()}원
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${center.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {center.profitMargin.toFixed(1)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900">
                        상세보기
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
