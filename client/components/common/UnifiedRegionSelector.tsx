/**
 * 통합 지역 선택 컴포넌트
 * 
 * 컴포넌트 목적:
 * - RegionSelector와 RegionNavigation을 통합한 일관된 지역 선택 컴포넌트
 * - Set<string> 또는 string[] 모두 지원
 * - 다양한 레이아웃 옵션 제공
 * 
 * 연동 파일:
 * - client/app/map/page.tsx
 * - client/app/auth/signup/page.tsx
 * - client/app/admin 페이지들
 */

'use client';

import React, { useMemo } from 'react';

// 전국 시/도, 시/군/구 데이터
export const CITIES_BY_PROVINCE: Record<string, string[]> = {
  '서울특별시': ['강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'],
  '경기도': ['수원시', '성남시', '고양시', '용인시', '부천시', '안산시', '안양시', '남양주시', '화성시', '평택시', '의정부시', '시흥시', '파주시', '김포시', '광명시', '광주시', '군포시', '하남시', '오산시', '양주시'],
  '부산광역시': ['중구', '서구', '동구', '영도구', '부산진구', '동래구', '남구', '북구', '해운대구', '사하구', '금정구', '강서구', '연제구', '수영구', '사상구', '기장군'],
  '인천광역시': ['중구', '동구', '미추홀구', '연수구', '남동구', '부평구', '계양구', '서구', '강화군', '옹진군'],
  '대구광역시': ['중구', '동구', '서구', '남구', '북구', '수성구', '달서구', '달성군'],
  '광주광역시': ['동구', '서구', '남구', '북구', '광산구'],
  '대전광역시': ['동구', '중구', '서구', '유성구', '대덕구'],
  '울산광역시': ['중구', '남구', '동구', '북구', '울주군'],
  '세종특별자치시': ['세종시'],
  '강원도': ['춘천시', '원주시', '강릉시', '동해시', '태백시', '속초시', '삼척시'],
  '충청북도': ['청주시', '충주시', '제천시', '보은군', '옥천군', '영동군'],
  '충청남도': ['천안시', '공주시', '보령시', '아산시', '서산시', '논산시'],
  '전라북도': ['전주시', '군산시', '익산시', '정읍시', '남원시', '김제시'],
  '전라남도': ['목포시', '여수시', '순천시', '나주시', '광양시'],
  '경상북도': ['포항시', '경주시', '김천시', '안동시', '구미시', '영주시'],
  '경상남도': ['창원시', '진주시', '통영시', '사천시', '김해시', '밀양시', '거제시', '양산시'],
  '제주특별자치도': ['제주시', '서귀포시']
};

const PROVINCES = [
  { id: '전국', name: '🌏 전국', special: true },
  { id: '서울특별시', name: '🏙️ 서울', special: false },
  { id: '경기도', name: '🌳 경기', special: false },
  { id: '인천광역시', name: '🌊 인천', special: false },
  { id: '부산광역시', name: '🌊 부산', special: false },
  { id: '대구광역시', name: '🏔️ 대구', special: false },
  { id: '광주광역시', name: '🌅 광주', special: false },
  { id: '대전광역시', name: '🔬 대전', special: false },
  { id: '울산광역시', name: '🏭 울산', special: false },
  { id: '세종특별자치시', name: '🏛️ 세종', special: false },
  { id: '강원도', name: '⛰️ 강원', special: false },
  { id: '충청북도', name: '🌲 충북', special: false },
  { id: '충청남도', name: '🌾 충남', special: false },
  { id: '전라북도', name: '🌾 전북', special: false },
  { id: '전라남도', name: '🌊 전남', special: false },
  { id: '경상북도', name: '🏔️ 경북', special: false },
  { id: '경상남도', name: '🌊 경남', special: false },
  { id: '제주특별자치도', name: '🏝️ 제주', special: false }
];

interface UnifiedRegionSelectorProps {
  // 선택된 지역 (Set 또는 Array 모두 지원)
  selectedRegions: Set<string> | string[];
  onRegionsChange: (regions: Set<string> | string[]) => void;
  
  // 선택된 시/도 (선택사항)
  selectedSido?: string;
  onSidoChange?: (sido: string) => void;
  
  // 선택된 구/군 (선택사항, admin 페이지용)
  selectedDistricts?: string[];
  onDistrictsChange?: (districts: string[]) => void;
  
  // 선택된 센터 (선택사항, admin 페이지용)
  selectedCenters?: string[];
  onCentersChange?: (centers: string[]) => void;
  
  // 센터 데이터 (선택사항)
  centerData?: { [key: string]: { [key: string]: string[] } };
  
  // 레이아웃 옵션
  layout?: 'simple' | 'dropdown' | 'list';
  variant?: 'button' | 'select';
  showCenters?: boolean;
  showDistricts?: boolean; // 구/군 선택 표시 여부
  
  // 스타일 옵션
  className?: string;
}

export default function UnifiedRegionSelector({
  selectedRegions,
  onRegionsChange,
  selectedSido,
  onSidoChange,
  selectedDistricts,
  onDistrictsChange,
  selectedCenters,
  onCentersChange,
  centerData = {},
  layout = 'simple',
  variant = 'button',
  showCenters = false,
  showDistricts = true,
  className = ''
}: UnifiedRegionSelectorProps) {
  
  // Set 또는 Array를 Set으로 변환
  const regionsSet = useMemo(() => {
    if (selectedRegions instanceof Set) {
      return selectedRegions;
    }
    return new Set(selectedRegions);
  }, [selectedRegions]);
  
  // Set을 Array로 변환하는 헬퍼
  const regionsArray = useMemo(() => Array.from(regionsSet), [regionsSet]);
  
  // 시/도 선택 핸들러
  const handleSidoSelect = (sido: string) => {
    if (sido === '전국') {
      const newRegions = new Set(['전국']);
      onRegionsChange(newRegions);
      if (onSidoChange) onSidoChange('');
    } else {
      if (onSidoChange) onSidoChange(sido);
      // 시/도 선택 시 기존 지역 선택은 유지하되, 전국 선택은 해제
      const newRegions = new Set(regionsSet);
      newRegions.delete('전국');
      onRegionsChange(newRegions);
    }
  };
  
  // 구/군 토글 핸들러
  const handleDistrictToggle = (district: string) => {
    const newRegions = new Set(regionsSet);
    if (newRegions.has(district)) {
      newRegions.delete(district);
    } else {
      newRegions.delete('전국'); // 전국 선택 해제
      newRegions.add(district);
    }
    onRegionsChange(newRegions);
  };
  
  // 모두 선택/해제 핸들러
  const handleSelectAll = () => {
    if (selectedSido && CITIES_BY_PROVINCE[selectedSido]) {
      const allDistricts = CITIES_BY_PROVINCE[selectedSido];
      const allSelected = allDistricts.every(d => regionsSet.has(d));
      
      const newRegions = new Set(regionsSet);
      if (allSelected) {
        allDistricts.forEach(d => newRegions.delete(d));
      } else {
        allDistricts.forEach(d => newRegions.add(d));
      }
      onRegionsChange(newRegions);
    }
  };
  
  // 간단한 레이아웃 (기본)
  if (layout === 'simple') {
    return (
      <div className={className}>
        {/* 시/도 선택 */}
        <div className="mb-6">
          <label className="block text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-2xl">📍</span>
            시/도 선택
          </label>
          <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-9 gap-2">
            {PROVINCES.map((sido) => {
              const isSelected = selectedSido === sido.id || (sido.id === '전국' && regionsSet.has('전국'));
              
              return (
                <button
                  key={sido.id}
                  onClick={() => handleSidoSelect(sido.id)}
                  className={`px-3 py-3 rounded-xl font-bold text-sm transition-all transform hover:scale-105 hover:-translate-y-1 ${
                    isSelected
                      ? sido.special
                        ? 'bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 text-white shadow-xl ring-2 ring-purple-300'
                        : 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-xl ring-2 ring-blue-300'
                      : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-400 hover:shadow-md'
                  }`}
                >
                  {sido.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* 구/군 선택 - selectedSido가 있고 전국이 아니고 해당 시/도의 구/군 데이터가 있을 때 표시 (showDistricts가 false가 아닌 경우) */}
        {selectedSido && selectedSido !== '전국' && CITIES_BY_PROVINCE[selectedSido] && (showDistricts !== false) && (
          <div className="mb-6 p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span className="text-2xl">🏘️</span>
                {selectedSido} 구/군 선택
              </h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSelectAll}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                    CITIES_BY_PROVINCE[selectedSido]?.every(city => regionsSet.has(city))
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {CITIES_BY_PROVINCE[selectedSido]?.every(city => regionsSet.has(city)) ? '✓ 모두 선택됨' : '전체 선택'}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {CITIES_BY_PROVINCE[selectedSido].map((city) => (
                <button
                  key={city}
                  onClick={() => handleDistrictToggle(city)}
                  className={`px-3 py-2.5 rounded-lg font-semibold text-sm transition-all transform hover:scale-105 ${
                    regionsSet.has(city)
                      ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg'
                      : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-400'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 선택된 지역 표시 */}
        {regionsSet.size > 0 && (
          <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-xl">✅</span>
              선택된 지역 ({regionsSet.size}개)
            </h4>
            <div className="flex flex-wrap gap-2">
              {regionsArray.map((region) => (
                <span
                  key={region}
                  className="inline-flex items-center px-4 py-2 bg-white text-blue-700 font-semibold text-sm rounded-lg shadow-sm border border-blue-300"
                >
                  {region}
                  <button
                    onClick={() => {
                      const newRegions = new Set(regionsSet);
                      newRegions.delete(region);
                      onRegionsChange(newRegions);
                    }}
                    className="ml-2 text-blue-600 hover:text-blue-800 font-bold"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // 드롭다운 레이아웃 (admin 페이지용)
  if (layout === 'dropdown') {
    return (
      <div className={`bg-white rounded-lg p-6 shadow-sm mb-6 ${className}`}>
        <h2 className="text-xl font-semibold mb-6">지역 및 센터 필터</h2>
        
        <div className="space-y-6">
          {/* 시/도 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">시/도</label>
            <select
              value={selectedSido || ''}
              onChange={(e) => {
                if (e.target.value && onSidoChange) {
                  onSidoChange(e.target.value);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">시/도 선택</option>
              {Object.keys(CITIES_BY_PROVINCE).map(sido => (
                <option key={sido} value={sido}>
                  {sido}
                </option>
              ))}
            </select>
            
            {regionsArray.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {regionsArray.map(region => (
                  <button
                    key={region}
                    onClick={() => {
                      const newRegions = new Set(regionsSet);
                      newRegions.delete(region);
                      onRegionsChange(newRegions);
                    }}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200"
                  >
                    {region} ×
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 구/군 선택 - selectedSido가 있고 전국이 아닐 때 표시 (showDistricts가 false가 아닌 경우) */}
          {selectedSido && selectedSido !== '전국' && (showDistricts !== false) && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">시/군/구</label>
                {selectedSido && (
                  <button
                    onClick={handleSelectAll}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    모두 선택
                  </button>
                )}
              </div>
              
              {selectedSido && CITIES_BY_PROVINCE[selectedSido] && (
                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md p-3 space-y-4">
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1.5">
                    {CITIES_BY_PROVINCE[selectedSido].map(district => (
                      <button
                        key={district}
                        onClick={() => handleDistrictToggle(district)}
                        className={`text-left px-2 py-1.5 text-xs rounded-md transition-colors ${
                          regionsSet.has(district)
                            ? 'bg-blue-600 text-white font-semibold'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        {district}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // 리스트 레이아웃 (기존 RegionNavigation과 유사)
  return (
    <div className={`bg-white p-6 rounded-lg shadow-md mb-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">지역 필터</h3>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 시/도 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">시/도</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => {
              const value = e.target.value;
              if (value && onSidoChange) {
                onSidoChange(value);
              }
            }}
            value={selectedSido || ''}
          >
            <option value="">시/도 선택</option>
            {Object.keys(CITIES_BY_PROVINCE).map(sido => (
              <option key={sido} value={sido}>
                {sido}
              </option>
            ))}
          </select>
        </div>

        {/* 구/군 선택 - selectedSido가 있고 전국이 아닐 때 표시 (showDistricts가 false가 아닌 경우) */}
        {selectedSido && selectedSido !== '전국' && (showDistricts !== false) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">시/군/구</label>
            {selectedSido && CITIES_BY_PROVINCE[selectedSido] && (
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md p-2 space-y-3">
                <div className="grid grid-cols-2 gap-1">
                  {CITIES_BY_PROVINCE[selectedSido].map(district => (
                    <button
                      key={district}
                      onClick={() => handleDistrictToggle(district)}
                      className={`text-left px-2 py-1 text-xs rounded-md transition-colors ${
                        regionsSet.has(district)
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {district}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

