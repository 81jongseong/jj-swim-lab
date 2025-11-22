/**
 * 📍 지역 선택 래퍼 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - UnifiedRegionSelector를 사용하는 공통 로직을 래핑
 * - 시/도 선택 시 구/군 선택 자동 표시
 * - 상태 관리 로직 통합
 * 
 * 🔗 **연동 파일**:
 * - client/components/common/UnifiedRegionSelector.tsx
 * - client/app/map/page.tsx
 * - client/app/admin/center-management/page.tsx
 * - 기타 지역 선택을 사용하는 페이지들
 */

'use client';

import { useState } from 'react';
import UnifiedRegionSelector from './UnifiedRegionSelector';

interface RegionSelectorWrapperProps {
  /** 선택된 지역 (Set) */
  selectedRegions?: Set<string>;
  /** 지역 변경 핸들러 */
  onRegionsChange?: (regions: Set<string>) => void;
  /** 시/도 변경 핸들러 (선택사항) */
  onSidoChange?: (sido: string) => void;
  /** 레이아웃 옵션 */
  layout?: 'simple' | 'dropdown' | 'list';
  /** 추가 클래스명 */
  className?: string;
  /** 센터 데이터 (선택사항) */
  centerData?: { [key: string]: { [key: string]: string[] } };
  /** 여러 시/도 비교 모드 (true일 경우 시/도 선택 시 기존 선택 유지) */
  allowMultipleSidos?: boolean;
}

export default function RegionSelectorWrapper({
  selectedRegions: externalSelectedRegions,
  onRegionsChange: externalOnRegionsChange,
  onSidoChange: externalOnSidoChange,
  layout = 'simple',
  className = '',
  centerData = {},
  allowMultipleSidos = false
}: RegionSelectorWrapperProps) {
  // 내부 상태 관리 (외부에서 전달되지 않은 경우)
  const [internalSelectedRegions, setInternalSelectedRegions] = useState<Set<string>>(new Set());
  const [selectedSido, setSelectedSido] = useState('');
  const [showDistrictSelection, setShowDistrictSelection] = useState(false);

  // 외부 상태 또는 내부 상태 사용
  const selectedRegions = externalSelectedRegions ?? internalSelectedRegions;

  // 지역 변경 핸들러
  const handleRegionsChange = (regions: Set<string> | string[]) => {
    const newRegions = regions instanceof Set ? regions : new Set(regions);
    
    // 외부 핸들러가 있으면 호출
    if (externalOnRegionsChange) {
      externalOnRegionsChange(newRegions);
    } else {
      setInternalSelectedRegions(newRegions);
    }
    
    // 주의: onSidoChange에서 setSelectedRegions(new Set())를 호출할 수 있으므로
    // 여기서 selectedSido를 초기화하지 않습니다.
    // 사용자가 직접 모든 지역을 해제한 경우에만 초기화합니다.
    if (newRegions.size === 0 && !newRegions.has('전국') && !selectedSido) {
      setShowDistrictSelection(false);
    }
  };

  // 시/도 변경 핸들러
  const handleSidoChange = (sido: string) => {
    // 외부 핸들러 호출
    if (externalOnSidoChange) {
      externalOnSidoChange(sido);
    }
    
    if (sido === '전국') {
      const newRegions = new Set(['전국']);
      if (externalOnRegionsChange) {
        externalOnRegionsChange(newRegions);
      } else {
        setInternalSelectedRegions(newRegions);
      }
      setSelectedSido('');
      setShowDistrictSelection(false);
    } else {
      // 상태 업데이트 순서 중요: 먼저 selectedSido를 설정하고, 그 다음 regions를 처리
      setSelectedSido(sido);
      setShowDistrictSelection(true);
      
      // 여러 시/도 비교 모드인 경우 기존 선택 유지, 아닌 경우 초기화
      if (allowMultipleSidos) {
        // 기존 선택 유지 (UnifiedRegionSelector가 이미 처리함)
        // 여기서는 아무것도 하지 않음
      } else {
        // 기존 동작: 시/도 선택 시 지역 선택 초기화
        const emptyRegions = new Set<string>();
        if (externalOnRegionsChange) {
          externalOnRegionsChange(emptyRegions);
        } else {
          setInternalSelectedRegions(emptyRegions);
        }
      }
    }
  };

  return (
    <UnifiedRegionSelector
      selectedRegions={selectedRegions}
      onRegionsChange={handleRegionsChange}
      selectedSido={selectedSido}
      onSidoChange={handleSidoChange}
      selectedDistricts={[]}
      centerData={centerData}
      layout={layout}
      showDistricts={true}
      className={className}
    />
  );
}

