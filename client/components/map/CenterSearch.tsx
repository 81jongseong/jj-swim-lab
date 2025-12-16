/**
 * 🏊 JJ Swim Lab - 센터 검색 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 센터명으로 검색
 * - 지역 선택 (시/도, 시/군/구)
 * - 검색 결과 필터링
 * 
 * 🔗 **연동 파일**:
 * - client/app/map/page.tsx
 * - client/components/common/UnifiedRegionSelector.tsx
 */

'use client';

import { useState } from 'react';
import UnifiedRegionSelector from '@/components/common/UnifiedRegionSelector';
import { Button } from '@/components/ui';

interface CenterSearchProps {
  /** 검색어 */
  searchTerm?: string;
  /** 검색어 변경 핸들러 */
  onSearchTermChange?: (term: string) => void;
  /** 검색 실행 핸들러 */
  onSearch?: (term: string) => void;
  /** 선택된 지역 (Set) */
  selectedRegions?: Set<string>;
  /** 지역 변경 핸들러 */
  onRegionsChange?: (regions: Set<string>) => void;
  /** 선택된 시/도 */
  selectedSido?: string;
  /** 시/도 변경 핸들러 */
  onSidoChange?: (sido: string) => void;
  /** 구/군 선택 표시 여부 */
  showDistrictSelection?: boolean;
  /** 구/군 선택 표시 여부 변경 핸들러 */
  onShowDistrictSelectionChange?: (show: boolean) => void;
}

export default function CenterSearch({
  searchTerm = '',
  onSearchTermChange,
  onSearch,
  selectedRegions = new Set(),
  onRegionsChange,
  selectedSido = '',
  onSidoChange,
  showDistrictSelection = false,
  onShowDistrictSelectionChange
}: CenterSearchProps) {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  const handleSearch = () => {
    if (onSearch) {
      onSearch(localSearchTerm);
    }
  };

  const handleSidoChange = (sido: string) => {
    if (onSidoChange) {
      onSidoChange(sido);
    }
    // 시/도 선택 시 구/군 선택 표시
    if (sido && sido !== '전국' && onShowDistrictSelectionChange) {
      onShowDistrictSelectionChange(true);
    } else if (onShowDistrictSelectionChange) {
      onShowDistrictSelectionChange(false);
    }
  };

  const handleRegionsChange = (regions: Set<string> | string[]) => {
    const newRegions = regions instanceof Set ? regions : new Set(regions);
    if (onRegionsChange) {
      onRegionsChange(newRegions);
    }
    // 지역이 모두 해제되면 시/도도 초기화
    if (newRegions.size === 0 && onSidoChange) {
      onSidoChange('');
      if (onShowDistrictSelectionChange) {
        onShowDistrictSelectionChange(false);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* 센터명 검색 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">센터명 입력</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={localSearchTerm}
            onChange={(e) => {
              setLocalSearchTerm(e.target.value);
              if (onSearchTermChange) {
                onSearchTermChange(e.target.value);
              }
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            placeholder="예: JJ Swim Lab 강남점"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button
            onClick={handleSearch}
            variant="primary"
            size="md"
          >
            🔍 검색
          </Button>
        </div>
      </div>

      {/* 지역 선택 - UnifiedRegionSelector 사용 */}
      <div>
        <UnifiedRegionSelector
          selectedRegions={selectedRegions}
          onRegionsChange={handleRegionsChange}
          selectedSido={selectedSido}
          onSidoChange={handleSidoChange}
          layout="simple"
          showDistricts={showDistrictSelection && !!selectedSido}
        />
      </div>
    </div>
  );
}

