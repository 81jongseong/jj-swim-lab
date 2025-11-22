/**
 * 지역구분 네비게이션 컴포넌트
 * 
 * 연동되는 데이터:
 * - regionData: 지역별 구/시 데이터
 * - centerData: 지역별 센터 데이터
 * 
 * 연동되는 파일:
 * - 사용하는 페이지: admin/revenue-management, admin/center-statistics 등
 */

'use client';

import React from 'react';
import RegionSelectorWrapper from './common/RegionSelectorWrapper';

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

// 전국 시/도, 시/군/구 데이터 (컴포넌트 내장)
const DEFAULT_REGION_DATA: { [key: string]: string[] } = {
  '서울시': ['강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'],
  '경기도': ['고양시', '과천시', '광명시', '광주시', '구리시', '군포시', '김포시', '남양주시', '동두천시', '부천시', '성남시', '수원시', '시흥시', '안산시', '안성시', '안양시', '양주시', '오산시', '용인시', '의왕시', '의정부시', '이천시', '파주시', '평택시', '포천시', '하남시', '화성시'],
  '인천시': ['계양구', '남동구', '동구', '미추홀구', '부평구', '서구', '연수구', '중구', '강화군', '옹진군'],
  '부산시': ['강서구', '금정구', '남구', '동구', '동래구', '부산진구', '북구', '사상구', '사하구', '서구', '수영구', '연제구', '영도구', '중구', '해운대구', '기장군'],
  '대구시': ['남구', '달서구', '동구', '북구', '서구', '수성구', '중구', '달성군'],
  '광주시': ['광산구', '남구', '동구', '북구', '서구'],
  '대전시': ['대덕구', '동구', '서구', '유성구', '중구'],
  '울산시': ['남구', '동구', '북구', '중구', '울주군'],
  '세종시': ['세종시'],
  '강원도': ['강릉시', '동해시', '삼척시', '속초시', '원주시', '춘천시', '태백시', '고성군', '양구군', '양양군', '영월군', '인제군', '정선군', '철원군', '평창군', '홍천군', '화천군', '횡성군'],
  '충청북도': ['제천시', '청주시', '충주시', '괴산군', '단양군', '보은군', '영동군', '옥천군', '음성군', '증평군', '진천군'],
  '충청남도': ['계룡시', '공주시', '논산시', '당진시', '보령시', '서산시', '아산시', '천안시', '금산군', '부여군', '서천군', '예산군', '청양군', '태안군', '홍성군'],
  '전라북도': ['군산시', '김제시', '남원시', '익산시', '전주시', '정읍시', '고창군', '무주군', '부안군', '순창군', '완주군', '임실군', '장수군', '진안군'],
  '전라남도': ['광양시', '나주시', '목포시', '순천시', '여수시', '강진군', '고흥군', '곡성군', '구례군', '담양군', '무안군', '보성군', '신안군', '영광군', '영암군', '완도군', '장성군', '장흥군', '진도군', '함평군', '해남군', '화순군'],
  '경상북도': ['경산시', '경주시', '구미시', '김천시', '문경시', '상주시', '안동시', '영주시', '영천시', '포항시', '고령군', '군위군', '봉화군', '성주군', '영덕군', '영양군', '예천군', '울릉군', '울진군', '의성군', '청도군', '청송군', '칠곡군'],
  '경상남도': ['거제시', '김해시', '밀양시', '사천시', '양산시', '진주시', '창원시', '통영시', '거창군', '고성군', '남해군', '산청군', '의령군', '창녕군', '하동군', '함안군', '함양군', '합천군'],
  '제주도': ['서귀포시', '제주시']
};

interface RegionNavigationProps {
  selectedRegions: string[];
  setSelectedRegions: React.Dispatch<React.SetStateAction<string[]>>;
  selectedDistricts: string[];
  setSelectedDistricts: React.Dispatch<React.SetStateAction<string[]>>;
  selectedCenters: string[];
  setSelectedCenters: React.Dispatch<React.SetStateAction<string[]>>;
  regionData?: { [key: string]: string[] }; // Optional - 기본값 사용
  centerData: { [key: string]: { [key: string]: string[] } };
  comparisonMode?: boolean;
  layout?: 'dropdown' | 'list';
  centerDataMap?: { [centerName: string]: CenterData };
}

// 센터의 수익 상태를 판단하는 함수
function getCenterStatus(center: CenterData | null): 'profit' | 'break-even' | 'loss' | 'unknown' {
  if (!center) return 'unknown';
  if (center.netProfit > 0) return 'profit';
  if (center.netProfit < 0) return 'loss';
  return 'break-even';
}

// 센터명 색상 클래스를 반환하는 함수
function getCenterNameColorClass(status: 'profit' | 'break-even' | 'loss' | 'unknown'): string {
  switch (status) {
    case 'profit':
      return 'text-blue-600 font-semibold';
    case 'break-even':
      return 'text-gray-600 font-medium';
    case 'loss':
      return 'text-red-600 font-semibold';
    case 'unknown':
    default:
      return 'text-gray-700';
  }
}

export default function RegionNavigation({
  selectedRegions,
  setSelectedRegions,
  selectedDistricts,
  setSelectedDistricts,
  selectedCenters,
  setSelectedCenters,
  regionData = DEFAULT_REGION_DATA,
  centerData,
  comparisonMode = false,
  layout = 'dropdown',
  centerDataMap = {}
}: RegionNavigationProps) {
  
  // 지역 필터 핸들러
  const handleRegionChange = (region: string) => {
    // 항상 다중 선택 가능하도록 변경
    if (!selectedRegions.includes(region)) {
      setSelectedRegions([...selectedRegions, region]);
    }
  };

  const handleDistrictToggle = (district: string) => {
    setSelectedDistricts(prev => 
      prev.includes(district) 
        ? prev.filter(d => d !== district)
        : [...prev, district]
    );
  };

  const handleCenterToggle = (center: string) => {
    setSelectedCenters(prev => 
      prev.includes(center) 
        ? prev.filter(c => c !== center)
        : [...prev, center]
    );
  };

  const allCentersInSelectedDistricts = selectedDistricts.flatMap(district => {
    const regionOfDistrict = Object.keys(centerData).find(region => 
      Object.keys(centerData[region]).includes(district)
    );
    return regionOfDistrict ? centerData[regionOfDistrict][district] || [] : [];
  });

  // RegionSelectorWrapper와 호환을 위해 Set으로 변환
  const selectedRegionsSet = new Set(selectedRegions);
  const selectedDistrictsSet = new Set(selectedDistricts);

  // RegionSelectorWrapper의 변경사항을 배열로 변환하여 처리
  const handleRegionsChange = (regions: Set<string>) => {
    const newRegions = Array.from(regions);
    setSelectedRegions(newRegions);
    
    // 선택 해제된 지역의 구/시와 센터도 제거
    const removedRegions = selectedRegions.filter(r => !regions.has(r));
    removedRegions.forEach(region => {
      const districtsToRemove = regionData[region] || [];
      setSelectedDistricts(prev => prev.filter(d => !districtsToRemove.includes(d)));
      
      const centersToRemove = districtsToRemove.flatMap(district => 
        centerData[region]?.[district] || []
      );
      setSelectedCenters(prev => prev.filter(c => !centersToRemove.includes(c)));
    });
  };

  if (layout === 'list') {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">지역 필터</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 시/도 및 시/군/구 선택 - RegionSelectorWrapper 사용 */}
          <div className="lg:col-span-2">
            <RegionSelectorWrapper
              selectedRegions={selectedDistrictsSet} // 시/군/구를 선택된 지역으로 사용
              onRegionsChange={(regions) => {
                const newDistricts = Array.from(regions);
                setSelectedDistricts(newDistricts);
                
                // 선택 해제된 구/시의 센터도 제거
                const removedDistricts = selectedDistricts.filter(d => !regions.has(d));
                removedDistricts.forEach(district => {
                  const regionOfDistrict = Object.keys(centerData).find(region => 
                    Object.keys(centerData[region]).includes(district)
                  );
                  if (regionOfDistrict) {
                    const centersToRemove = centerData[regionOfDistrict]?.[district] || [];
                    setSelectedCenters(prev => prev.filter(c => !centersToRemove.includes(c)));
                  }
                });
              }}
              centerData={centerData}
              layout="list"
              className="mb-4"
            />
          </div>

          {/* 센터 선택 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">센터</label>
              {selectedDistricts.length > 0 && (
                <button
                  onClick={() => setSelectedCenters(allCentersInSelectedDistricts)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  선택된 지역 센터 모두 선택
                </button>
              )}
            </div>
            
            {selectedCenters.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {selectedCenters.map(center => {
                  const centerInfo = centerDataMap[center];
                  const status = getCenterStatus(centerInfo);
                  const statusEmoji = status === 'profit' ? '💰' : status === 'loss' ? '📉' : '📊';
                  
                  return (
                    <span
                      key={center}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        status === 'profit' ? 'bg-blue-100 text-blue-800' :
                        status === 'loss' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {center} {statusEmoji}
                    </span>
                  );
                })}
              </div>
            )}

            {selectedDistricts.length > 0 ? (
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md p-2 space-y-3">
                {selectedRegions.map(region => {
                  const districtsInRegion = regionData[region] || [];
                  const filteredDistrictsInRegion = districtsInRegion.filter(district => 
                    selectedDistricts.includes(district)
                  );

                  if (filteredDistrictsInRegion.length === 0) return null;

                  return (
                    <div key={region} className="space-y-2">
                      <h4 className="text-sm font-semibold text-gray-800 bg-gray-100 px-2 py-1 rounded-md">
                        {region}
                      </h4>
                      <div className="grid grid-cols-2 gap-1 ml-4">
                        {filteredDistrictsInRegion.map(district => {
                          const centersInDistrict = centerData[region]?.[district] || [];
                          return (
                            <div key={district} className="space-y-1">
                              <p className="text-xs font-medium text-gray-700">{district}</p>
                              <div className="flex flex-col gap-1 ml-2">
                                {centersInDistrict.map(center => {
                                  const centerInfo = centerDataMap[center];
                                  const status = getCenterStatus(centerInfo);
                                  const statusEmoji = status === 'profit' ? '💰' : status === 'loss' ? '📉' : '📊';
                                  const nameColorClass = getCenterNameColorClass(status);
                                  
                                  return (
                                    <button
                                      key={center}
                                      onClick={() => handleCenterToggle(center)}
                                      className={`text-left px-2 py-1 text-xs rounded-md transition-colors flex items-center gap-1 ${
                                        selectedCenters.includes(center)
                                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                          : 'hover:bg-gray-100'
                                      }`}
                                    >
                                      <span className={nameColorClass}>
                                        {center}
                                      </span>
                                      <span>{statusEmoji}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : selectedRegions.length > 0 ? (
              <div className="text-gray-500 text-sm py-4 text-center">
                시/군/구를 먼저 선택해주세요
              </div>
            ) : (
              <div className="text-gray-500 text-sm py-4 text-center">
                시/도를 먼저 선택해주세요
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 기본 드롭다운 레이아웃 (세로 방향)
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
      <h2 className="text-xl font-semibold mb-6">지역 및 센터 필터</h2>
      
      <div className="space-y-6">
        {/* 시/도 및 시/군/구 선택 - RegionSelectorWrapper 사용 (회원분포 페이지와 동일한 컴포넌트) */}
        <div>
          <RegionSelectorWrapper
            selectedRegions={new Set(selectedDistricts)} // 시/군/구를 선택된 지역으로 사용
            onRegionsChange={(regions) => {
              const newDistricts = Array.from(regions);
              setSelectedDistricts(newDistricts);
              
              // 선택 해제된 구/시의 센터도 제거
              const removedDistricts = selectedDistricts.filter(d => !regions.has(d));
              removedDistricts.forEach(district => {
                const regionOfDistrict = Object.keys(centerData).find(region => 
                  Object.keys(centerData[region]).includes(district)
                );
                if (regionOfDistrict) {
                  const centersToRemove = centerData[regionOfDistrict]?.[district] || [];
                  setSelectedCenters(prev => prev.filter(c => !centersToRemove.includes(c)));
                }
              });
            }}
            centerData={centerData}
            layout={layout === 'dropdown' ? 'dropdown' : 'simple'}
            className="mb-4"
          />
        </div>

        {/* 센터 선택 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">센터</label>
            {selectedDistricts.length > 0 && (
              <button
                onClick={() => setSelectedCenters(allCentersInSelectedDistricts)}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                선택된 지역 센터 모두 선택
              </button>
            )}
          </div>
          
          {selectedCenters.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {selectedCenters.map(center => {
                const centerInfo = centerDataMap[center];
                const status = getCenterStatus(centerInfo);
                const statusEmoji = status === 'profit' ? '💰' : status === 'loss' ? '📉' : '📊';
                
                return (
                  <span
                    key={center}
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      status === 'profit' ? 'bg-blue-100 text-blue-800' :
                      status === 'loss' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {center} {statusEmoji}
                  </span>
                );
              })}
            </div>
          )}

          {selectedDistricts.length > 0 ? (
            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md p-3 space-y-4">
              {selectedRegions.map(region => {
                const districtsInRegion = regionData[region] || [];
                const filteredDistrictsInRegion = districtsInRegion.filter(district => 
                  selectedDistricts.includes(district)
                );

                if (filteredDistrictsInRegion.length === 0) return null;

                return (
                  <div key={region} className="space-y-3">
                    <div className="flex items-center gap-2 sticky top-0 bg-white pb-2">
                      <h4 className="text-sm font-semibold text-gray-800 bg-gradient-to-r from-blue-100 to-blue-50 px-3 py-1.5 rounded-md border border-blue-200">
                        {region}
                      </h4>
                      <span className="text-xs text-gray-500 font-medium">
                        ({filteredDistrictsInRegion.length}개 구/시)
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 ml-2">
                      {filteredDistrictsInRegion.map(district => {
                        const centersInDistrict = centerData[region]?.[district] || [];
                        return (
                          <div key={district} className="space-y-1.5 p-2 bg-gray-50 rounded-md">
                            <p className="text-xs font-semibold text-gray-700 border-b border-gray-200 pb-1">
                              {district}
                            </p>
                            <div className="flex flex-col gap-1">
                              {centersInDistrict.map(center => {
                                const centerInfo = centerDataMap[center];
                                const status = getCenterStatus(centerInfo);
                                const statusEmoji = status === 'profit' ? '💰' : status === 'loss' ? '📉' : '📊';
                                const nameColorClass = getCenterNameColorClass(status);
                                
                                return (
                                  <button
                                    key={center}
                                    onClick={() => handleCenterToggle(center)}
                                    className={`text-left px-2 py-1 text-xs rounded transition-all flex items-center justify-between gap-1 ${
                                      selectedCenters.includes(center)
                                        ? 'bg-blue-600 text-white font-semibold shadow-sm'
                                        : 'bg-white hover:bg-gray-100 border border-gray-200'
                                    }`}
                                  >
                                    <span className={selectedCenters.includes(center) ? 'text-white' : nameColorClass}>
                                      {center}
                                    </span>
                                    <span>{statusEmoji}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : selectedRegions.length > 0 ? (
            <div className="text-gray-500 text-sm py-4 text-center border border-gray-200 rounded-md">
              시/군/구를 먼저 선택해주세요
            </div>
          ) : (
            <div className="text-gray-500 text-sm py-4 text-center border border-gray-200 rounded-md">
              시/도를 먼저 선택해주세요
            </div>
          )}
        </div>
      </div>
    </div>
  );
}