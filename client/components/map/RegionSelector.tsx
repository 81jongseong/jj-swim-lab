/**
 * 📍 지역 선택 컴포넌트
 * 
 * 📋 **컴포넌트 목적**:
 * - 시/도 선택
 * - 구/군 선택
 * - 선택된 지역 표시
 * 
 * 🔗 **연동 파일**:
 * - client/app/map/page.tsx
 */

'use client';

interface RegionSelectorProps {
  selectedSido: string;
  selectedRegions: Set<string>;
  showDistrictSelection: boolean;
  onSidoSelect: (sido: string) => void;
  onDistrictToggle: (district: string) => void;
  onClose: () => void;
  onSelectAll?: () => void;
}

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

export default function RegionSelector({
  selectedSido,
  selectedRegions,
  showDistrictSelection,
  onSidoSelect,
  onDistrictToggle,
  onClose,
  onSelectAll
}: RegionSelectorProps) {
  // 모든 구/군 선택 여부 확인
  const allDistrictsSelected = selectedSido && CITIES_BY_PROVINCE[selectedSido] 
    ? CITIES_BY_PROVINCE[selectedSido].every(city => selectedRegions.has(city))
    : false;
  
  // 모두 선택/해제 핸들러
  const handleSelectAll = () => {
    if (onSelectAll) {
      onSelectAll();
    } else {
      // 기본 동작: 모든 구/군 선택 또는 해제
      if (selectedSido && CITIES_BY_PROVINCE[selectedSido]) {
        if (allDistrictsSelected) {
          // 모두 해제
          CITIES_BY_PROVINCE[selectedSido].forEach(city => {
            if (selectedRegions.has(city)) {
              onDistrictToggle(city);
            }
          });
        } else {
          // 모두 선택
          CITIES_BY_PROVINCE[selectedSido].forEach(city => {
            if (!selectedRegions.has(city)) {
              onDistrictToggle(city);
            }
          });
        }
      }
    }
  };
  return (
    <div>
      {/* 1단계: 시/도 선택 */}
      <div className="mb-6">
        <label className="block text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span className="text-2xl">📍</span>
          시/도 선택
        </label>
        <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-9 gap-2">
          {PROVINCES.map((sido) => {
            const isSelected = selectedSido === sido.id || (sido.id === '전국' && selectedRegions.has('전국'));
            
            return (
              <button
                key={sido.id}
                onClick={() => onSidoSelect(sido.id)}
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

      {/* 2단계: 구/군 선택 */}
      {showDistrictSelection && selectedSido && CITIES_BY_PROVINCE[selectedSido] && (
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
                  allDistrictsSelected
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {allDistrictsSelected ? '✓ 모두 선택됨' : '전체 선택'}
              </button>
              <button
                onClick={onClose}
                className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                ✕ 닫기
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {CITIES_BY_PROVINCE[selectedSido].map((city) => (
              <button
                key={city}
                onClick={() => onDistrictToggle(city)}
                className={`px-3 py-2.5 rounded-lg font-semibold text-sm transition-all transform hover:scale-105 ${
                  selectedRegions.has(city)
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
      {selectedRegions.size > 0 && (
        <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-xl">✅</span>
            선택된 지역 ({selectedRegions.size}개)
          </h4>
          <div className="flex flex-wrap gap-2">
            {(() => {
              // 시/도의 모든 구/군이 선택되었는지 확인하고 "전지역"으로 표시
              const displayRegions: string[] = [];
              const processedSidos = new Set<string>();
              
              // 각 시/도에 대해 모든 구/군이 선택되었는지 확인
              for (const [sido, districts] of Object.entries(CITIES_BY_PROVINCE)) {
                if (districts.every(district => selectedRegions.has(district)) && 
                    districts.length > 0) {
                  // 모든 구/군이 선택된 경우 "전지역"으로 표시
                  displayRegions.push(`${sido} 전지역`);
                  processedSidos.add(sido);
                  // 해당 시/도의 모든 구/군을 processedSidos에 추가하여 중복 방지
                  districts.forEach(district => processedSidos.add(district));
                }
              }
              
              // 전지역이 아닌 개별 지역만 추가
              Array.from(selectedRegions).forEach(region => {
                if (!processedSidos.has(region)) {
                  displayRegions.push(region);
                }
              });
              
              return displayRegions.map((region, idx) => {
                // "전지역"인 경우 삭제 버튼을 다르게 처리
                const isFullRegion = region.includes(' 전지역');
                const regionName = isFullRegion ? region : region;
                
                return (
                  <span
                    key={idx}
                    className="inline-flex items-center px-4 py-2 bg-white text-blue-700 font-semibold text-sm rounded-lg shadow-sm border border-blue-300"
                  >
                    {regionName}
                    <button
                      onClick={() => {
                        if (isFullRegion) {
                          // 전지역인 경우 모든 구/군 제거
                          const sido = region.replace(' 전지역', '');
                          if (CITIES_BY_PROVINCE[sido]) {
                            CITIES_BY_PROVINCE[sido].forEach(city => {
                              if (selectedRegions.has(city)) {
                                onDistrictToggle(city);
                              }
                            });
                          }
                        } else {
                          onDistrictToggle(region);
                        }
                      }}
                      className="ml-2 text-blue-600 hover:text-blue-800 font-bold"
                    >
                      ✕
                    </button>
                  </span>
                );
              });
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

