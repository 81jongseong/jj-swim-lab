/**
 * 🗺️ JJ Swim Lab - 회원 분포도 (지오해시 블록 스팟)
 * 
 * 📋 **페이지 목적**
 * - 지오해시 블록 기반 스팟 시각화
 * - k-익명성, 노이즈, 반올림을 통한 프라이버시 보호
 * - 회원/강사/게스트별 필터링
 * - 줌 레벨에 따른 동적 스팟 크기 조절
 * 
 * 🔄 **주요 기능**
 * - 지오해시 블록별 스팟 표시
 * - 회원 유형별 필터링 (전체/회원/강사/게스트)
 * - 센터별 색상 구분
 * - 줌 레벨에 따른 스팟 크기 조절
 * - 실시간 툴팁 정보
 * 
 * 🗄️ **데이터 연동**
 * - /api/geo/spots API (지오해시 블록 스팟)
 * - VWorld 지도 타일 서비스
 * 
 * 🛠️ **필요한 설치 파일**
 * - maplibre-gl
 * - deck.gl
 * - @deck.gl/mapbox
 * - @deck.gl/layers
 * - ngeohash
 */

'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { getAddressFromGeohash, getBlockCenterCoordinates } from '../../../lib/utils/address-utils';
import RegionSelectorWrapper from '@/components/common/RegionSelectorWrapper';

// 동적 import로 SSR 문제 방지 및 성능 최적화
let maplibregl: any;
let MapboxOverlay: any;
let ScatterplotLayer: any;
let TextLayer: any;

// 지연 로딩을 위한 상태 (컴포넌트 내부로 이동)

// 타입 정의
interface Spot {
  geohash: string;
  lat: number;
  lng: number;
  totalApprox: number;
  dominantCenter: string;
  centers: Array<{ centerId: string; countApprox: number }>;
  memberType?: 'member' | 'instructor' | 'guest' | 'center';
}

interface SpotsData {
  spots: Spot[];
  metadata: {
    totalSpots: number;
    hiddenBlocks: number;
    totalOriginalCount: number;
    totalApproxCount: number;
    precision: number;
    kAnonymity: number;
    noiseEpsilon: number;
    roundingUnit: number;
    memberType: string;
  };
}

const ZOOM_THRESHOLD = 10; // 줌 레벨 임계값

// 센터별 색상 매핑 (가시성 정책 반영)
const getCenterColor = (centerId: string, isVisible: boolean = true): [number, number, number, number] => {
  if (!isVisible) {
    return [128, 128, 128, 150]; // 비공개 센터는 회색
  }
  
  // 실제 센터 이름 매핑 (예: 'JJ 수영장 강남점' -> '강남센터')
  const centerNameMap: Record<string, string> = {
    'JJ 수영장 강남점': '강남센터',
    'JJ 수영장 홍대점': '홍대센터',
    'JJ 수영장 송파점': '송파센터',
    'JJ 수영장 마포점': '마포센터',
    'JJ 수영장 수원점': '수원센터',
    'JJ 수영장 성남점': '성남센터',
    'JJ 수영장 인천점': '인천센터',
    'JJ 수영장 부산점': '부산센터',
    'JJ 수영장 해운대점': '해운대센터',
    'JJ 수영장 대구점': '대구센터',
    'JJ 수영장 광주점': '광주센터',
    'JJ 수영장 대전점': '대전센터',
    'JJ 수영장 울산점': '울산센터',
    'JJ 수영장 세종점': '세종센터',
    'JJ 수영장 춘천점': '춘천센터',
    'JJ 수영장 강릉점': '강릉센터',
  };
  
  // 센터 이름 정규화
  const normalizedCenterId = centerNameMap[centerId] || centerId;
  
  const colors: Record<string, [number, number, number, number]> = {
    '강남센터': [255, 99, 132, 200],   // 빨간색
    '홍대센터': [54, 162, 235, 200],   // 파란색
    '송파센터': [255, 205, 86, 200],   // 노란색
    '마포센터': [75, 192, 192, 200],   // 청록색
    '수원센터': [153, 102, 255, 200],  // 보라색
    '성남센터': [255, 159, 64, 200],   // 주황색
    '인천센터': [199, 199, 199, 200],  // 회색
    '부산센터': [83, 102, 255, 200],   // 진파랑
    '해운대센터': [255, 140, 0, 200],  // 주황색
    '대구센터': [255, 99, 255, 200],   // 분홍색
    '광주센터': [99, 255, 132, 200],   // 연두색
    '대전센터': [255, 205, 86, 200],   // 노란색
    '울산센터': [255, 99, 132, 200],   // 빨간색
    '세종센터': [54, 162, 235, 200],   // 파란색
    '춘천센터': [75, 192, 192, 200],   // 청록색
    '강릉센터': [255, 159, 64, 200],   // 주황색
    'anonymous': [200, 200, 200, 150], // 익명화된 센터
  };
  
  // 색상이 없으면 해시 기반으로 고유 색상 생성
  if (!colors[normalizedCenterId]) {
    let hash = 0;
    for (let i = 0; i < normalizedCenterId.length; i++) {
      hash = normalizedCenterId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const r = Math.max(50, (hash & 0xFF0000) >> 16);
    const g = Math.max(50, (hash & 0x00FF00) >> 8);
    const b = Math.max(50, hash & 0x0000FF);
    return [r, g, b, 200];
  }
  
  return colors[normalizedCenterId];
};

const getCenterColorCSS = (centerId: string, isVisible: boolean = true): string => {
  if (!isVisible) {
    return 'rgb(128, 128, 128)'; // 비공개 센터는 회색
  }
  
  // 실제 센터 이름 매핑 (예: 'JJ 수영장 강남점' -> '강남센터')
  const centerNameMap: Record<string, string> = {
    'JJ 수영장 강남점': '강남센터',
    'JJ 수영장 홍대점': '홍대센터',
    'JJ 수영장 송파점': '송파센터',
    'JJ 수영장 마포점': '마포센터',
    'JJ 수영장 수원점': '수원센터',
    'JJ 수영장 성남점': '성남센터',
    'JJ 수영장 인천점': '인천센터',
    'JJ 수영장 부산점': '부산센터',
    'JJ 수영장 해운대점': '해운대센터',
    'JJ 수영장 대구점': '대구센터',
    'JJ 수영장 광주점': '광주센터',
    'JJ 수영장 대전점': '대전센터',
    'JJ 수영장 울산점': '울산센터',
    'JJ 수영장 세종점': '세종센터',
    'JJ 수영장 춘천점': '춘천센터',
    'JJ 수영장 강릉점': '강릉센터',
  };
  
  // 센터 이름 정규화
  const normalizedCenterId = centerNameMap[centerId] || centerId;
  
  const colors: Record<string, string> = {
    '강남센터': 'rgb(255, 99, 132)',
    '홍대센터': 'rgb(54, 162, 235)',
    '송파센터': 'rgb(255, 205, 86)',
    '마포센터': 'rgb(75, 192, 192)',
    '수원센터': 'rgb(153, 102, 255)',
    '성남센터': 'rgb(255, 159, 64)',
    '인천센터': 'rgb(199, 199, 199)',
    '부산센터': 'rgb(83, 102, 255)',
    '해운대센터': 'rgb(255, 140, 0)',
    '대구센터': 'rgb(255, 99, 255)',
    '광주센터': 'rgb(99, 255, 132)',
    '대전센터': 'rgb(255, 205, 86)',
    '울산센터': 'rgb(255, 99, 132)',
    '세종센터': 'rgb(54, 162, 235)',
    '춘천센터': 'rgb(75, 192, 192)',
    '강릉센터': 'rgb(255, 159, 64)',
    'anonymous': 'rgb(200, 200, 200)',
  };
  
  // 색상이 없으면 해시 기반으로 고유 색상 생성
  if (!colors[normalizedCenterId]) {
    // 센터 이름을 해시하여 일관된 색상 생성
    let hash = 0;
    for (let i = 0; i < normalizedCenterId.length; i++) {
      hash = normalizedCenterId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const r = (hash & 0xFF0000) >> 16;
    const g = (hash & 0x00FF00) >> 8;
    const b = hash & 0x0000FF;
    return `rgb(${Math.max(50, r)}, ${Math.max(50, g)}, ${Math.max(50, b)})`;
  }
  
  return colors[normalizedCenterId];
};

// 구/군 선택 컴포넌트
function DistrictSelector({ 
  sido, 
  selectedRegions, 
  setSelectedRegions,
  setSelectedSido,
  setShowDistrictSelection
}: { 
  sido: string; 
  selectedRegions: Set<string>; 
  setSelectedRegions: (regions: Set<string>) => void;
  setSelectedSido: (sido: string) => void;
  setShowDistrictSelection: (show: boolean) => void;
}) {
  const getDistrictsForSido = (sido: string): string[] => {
    const districts: Record<string, string[]> = {
      '서울시': ['강남구', '송파구', '마포구', '서초구', '용산구', '성동구', '광진구', '동대문구', '중랑구', '성북구', '강북구', '도봉구', '노원구', '은평구', '서대문구', '종로구', '서울중구', '영등포구', '동작구', '관악구', '강동구'],
      '경기도': ['수원시', '성남시', '의정부시', '안양시', '부천시', '광명시', '평택시', '과천시', '오산시', '시흥시', '군포시', '의왕시', '하남시', '용인시', '파주시', '이천시', '안성시', '김포시', '화성시', '경기광주시', '여주시', '양평군', '고양시', '동두천시', '가평군', '연천군'],
      '인천시': ['인천중구', '인천동구', '미추홀구', '연수구', '남동구', '부평구', '계양구', '인천서구', '강화군', '옹진군'],
      '부산시': ['부산중구', '부산서구', '부산동구', '영도구', '부산진구', '동래구', '부산남구', '부산북구', '해운대구', '사하구', '금정구', '부산강서구', '연제구', '수영구', '사상구', '기장군'],
      '대구시': ['대구중구', '대구동구', '대구서구', '대구남구', '대구북구', '수성구', '달서구', '달성군', '대구군위군'],
      '광주시': ['광주동구', '광주서구', '광주남구', '광주북구', '광산구'],
      '대전시': ['대전동구', '대전중구', '대전서구', '유성구', '대덕구'],
      '울산시': ['울산중구', '울산남구', '울산동구', '울산북구', '울주군'],
      '세종시': ['세종시'],
      '강원도': ['춘천시', '원주시', '강릉시', '동해시', '태백시', '속초시', '삼척시', '홍천군', '횡성군', '영월군', '평창군', '정선군', '철원군', '화천군', '양구군', '인제군', '강원고성군', '양양군'],
      '충청북도': ['청주시', '충주시', '제천시', '보은군', '옥천군', '영동군', '증평군', '진천군', '괴산군', '음성군', '단양군'],
      '충청남도': ['천안시', '공주시', '보령시', '아산시', '서산시', '논산시', '계룡시', '당진시', '금산군', '부여군', '서천군', '청양군', '홍성군', '예산군', '태안군'],
      '전라북도': ['전주시', '군산시', '익산시', '정읍시', '남원시', '김제시', '완주군', '진안군', '무주군', '장수군', '임실군', '순창군', '고창군', '부안군'],
      '전라남도': ['목포시', '여수시', '순천시', '나주시', '광양시', '담양군', '곡성군', '구례군', '고흥군', '보성군', '화순군', '장흥군', '강진군', '해남군', '영암군', '무안군', '함평군', '영광군', '장성군', '완도군', '진도군', '신안군'],
      '경상북도': ['포항시', '경주시', '김천시', '안동시', '구미시', '영주시', '영천시', '상주시', '문경시', '경산시', '경북군위군', '의성군', '청송군', '영양군', '영덕군', '청도군', '고령군', '성주군', '칠곡군', '예천군', '봉화군', '울진군', '울릉군'],
      '경상남도': ['창원시', '진주시', '통영시', '사천시', '김해시', '밀양시', '거제시', '양산시', '의령군', '함안군', '창녕군', '경남고성군', '남해군', '하동군', '산청군', '함양군', '거창군', '합천군'],
      '제주도': ['제주시', '서귀포시']
    };
    return districts[sido] || [];
  };

  const districts = getDistrictsForSido(sido);
  const hasSelectedDistricts = districts.some(district => selectedRegions.has(district));
  
  const handleDistrictToggle = (district: string, checked: boolean) => {
    const newRegions = new Set(selectedRegions);
    
    if (checked) {
      newRegions.add(district);
      // 선택된 지역이 있으면 시도 선택을 해제하고 구/군 선택 모드로 전환
      setSelectedSido('');
      setShowDistrictSelection(true);
    } else {
      newRegions.delete(district);
    }
    
    setSelectedRegions(newRegions);
  };

  const handleSelectAll = () => {
    const newRegions = new Set(selectedRegions);
    
    if (hasSelectedDistricts) {
      // 모든 지역 해제
      districts.forEach(district => newRegions.delete(district));
    } else {
      // 모든 지역 선택
      districts.forEach(district => newRegions.add(district));
      // 선택된 지역이 있으면 시도 선택을 해제하고 구/군 선택 모드로 전환
      setSelectedSido('');
      setShowDistrictSelection(true);
    }
    
    setSelectedRegions(newRegions);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={hasSelectedDistricts}
            onChange={handleSelectAll}
            className="rounded w-4 h-4"
          />
          <span className="font-medium text-gray-700">
            전체 선택 ({districts.length}개)
          </span>
        </label>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {districts.map(district => (
          <label key={district} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedRegions.has(district)}
              onChange={(e) => handleDistrictToggle(district, e.target.checked)}
              className="rounded w-4 h-4"
            />
            <span className="px-2 py-1 bg-white rounded text-gray-700 border border-gray-200 hover:bg-gray-100 transition-colors text-sm">
              {district}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default function GeoDistributionPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const overlayRef = useRef<any>(null);
  
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // 상태 관리
  const [spots, setSpots] = useState<Spot[]>([]);
  const [metadata, setMetadata] = useState<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false); // 지도 로딩 상태
  const [loadingData, setLoadingData] = useState(false); // 초기 로딩 비활성화
  const [hoveredSpot, setHoveredSpot] = useState<any>(null);
  const [hoveredAddress, setHoveredAddress] = useState<string | null>(null);
  const [librariesLoaded, setLibrariesLoaded] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(12);
  
  // 필터 상태
  const [memberType, setMemberType] = useState<'all' | 'member' | 'instructor' | 'guest' | 'center'>('all');
  const [centerList, setCenterList] = useState<string[]>([]);
  const [activeCenters, setActiveCenters] = useState<Set<string>>(new Set());
  
  // 지역 선택 상태
  const [selectedRegions, setSelectedRegions] = useState<Set<string>>(new Set());
  const [regionCenters, setRegionCenters] = useState<Record<string, string[]>>({});
  
  // RegionSelectorWrapper에서 선택된 시/도 추적 (센터 목록 표시용)
  const [currentSelectedSido, setCurrentSelectedSido] = useState<string>('');
  
  // 센터 관리 상태 (centerAdmin용, 최고관리자는 사용하지 않음)
  const [selectedCenterId, setSelectedCenterId] = useState<string | null>(null);
  const [managedCenters, setManagedCenters] = useState<Array<{ _id: string; name: string }>>([]);

  // 지역별 센터 매핑 초기화
  useEffect(() => {
    console.log('🔄 regionCenters 초기화 시작');
    
    // 실제 DB의 센터 이름 사용 (API 응답에서 가져온 센터 이름과 일치하도록)
    // 주의: 실제 DB의 센터 이름을 사용해야 함 ('JJ 수영장 강남점' 등)
    const mockRegionCenters: Record<string, string[]> = {
      '전국': ['JJ 수영장 홍대점', 'JJ 수영장 강남점', 'JJ Swim Center', 'JJ 수영장 송파점', 'JJ 수영장 마포점', '기타'],
      
      // 서울시 (UnifiedRegionSelector는 '서울특별시' 사용)
      '서울시': ['JJ 수영장 홍대점', 'JJ 수영장 강남점', 'JJ Swim Center', 'JJ 수영장 송파점', 'JJ 수영장 마포점', '기타'],
      '서울특별시': ['JJ 수영장 홍대점', 'JJ 수영장 강남점', 'JJ Swim Center', 'JJ 수영장 송파점', 'JJ 수영장 마포점', '기타'],
      '강남구': ['JJ 수영장 강남점', 'JJ Swim Center'], // 강남구에 등록된 센터 (실제 DB 기준)
      '송파구': ['JJ 수영장 송파점'],
      '마포구': ['JJ 수영장 홍대점', 'JJ 수영장 마포점'],
      '서초구': ['기타'],
      '용산구': ['기타'],
      '성동구': ['기타'],
      '광진구': ['기타'],
      '동대문구': ['기타'],
      '중랑구': ['기타'],
      '성북구': ['기타'],
      '강북구': ['기타'],
      '도봉구': ['기타'],
      '노원구': ['기타'],
      '은평구': ['기타'],
      '서대문구': ['기타'],
      '종로구': ['기타'],
      '서울중구': ['기타'],
      '영등포구': ['기타'],
      '동작구': ['기타'],
      '관악구': ['기타'],
      '강동구': ['기타'],
      
      // 경기도
      '경기도': ['JJ 수영장 수원점', 'JJ 수영장 성남점', '기타'],
      '수원시': ['JJ 수영장 수원점'],
      '성남시': ['JJ 수영장 성남점'],
      '의정부시': ['기타'],
      '안양시': ['기타'],
      '부천시': ['기타'],
      '광명시': ['기타'],
      '평택시': ['기타'],
      '과천시': ['기타'],
      '오산시': ['기타'],
      '시흥시': ['기타'],
      '군포시': ['기타'],
      '의왕시': ['기타'],
      '하남시': ['기타'],
      '용인시': ['기타'],
      '파주시': ['기타'],
      '이천시': ['기타'],
      '안성시': ['기타'],
      '김포시': ['기타'],
      '화성시': ['기타'],
      '경기광주시': ['기타'],
      '여주시': ['기타'],
      '양평군': ['기타'],
      '고양시': ['기타'],
      '동두천시': ['기타'],
      '가평군': ['기타'],
      '연천군': ['기타'],
      
      // 인천시 (UnifiedRegionSelector는 '인천광역시' 사용)
      '인천시': ['인천센터', '기타'],
      '인천광역시': ['인천센터', '기타'],
      '인천중구': ['인천센터'],
      '인천동구': ['기타'],
      '미추홀구': ['기타'],
      '연수구': ['기타'],
      '남동구': ['기타'],
      '부평구': ['기타'],
      '계양구': ['기타'],
      '인천서구': ['기타'],
      '강화군': ['기타'],
      '옹진군': ['기타'],
      
      // 부산시 (UnifiedRegionSelector는 '부산광역시' 사용)
      '부산시': ['JJ 수영장 부산점', 'JJ 수영장 해운대점', '기타'],
      '부산광역시': ['JJ 수영장 부산점', 'JJ 수영장 해운대점', '기타'],
      '부산중구': ['JJ 수영장 부산점'],
      '부산서구': ['기타'],
      '부산동구': ['기타'],
      '영도구': ['기타'],
      '부산진구': ['기타'],
      '동래구': ['기타'],
      '부산남구': ['기타'],
      '부산북구': ['기타'],
      '해운대구': ['해운대센터'],
      '사하구': ['기타'],
      '금정구': ['기타'],
      '부산강서구': ['기타'],
      '연제구': ['기타'],
      '수영구': ['기타'],
      '사상구': ['기타'],
      '기장군': ['기타'],
      
      // 대구시 (UnifiedRegionSelector는 '대구광역시' 사용)
      '대구시': ['대구센터', '기타'],
      '대구광역시': ['대구센터', '기타'],
      '대구중구': ['대구센터'],
      '대구동구': ['기타'],
      '대구서구': ['기타'],
      '대구남구': ['기타'],
      '대구북구': ['기타'],
      '수성구': ['기타'],
      '달서구': ['기타'],
      '달성군': ['기타'],
      '대구군위군': ['기타'],
      
      // 광주시 (UnifiedRegionSelector는 '광주광역시' 사용)
      '광주시': ['JJ 수영장 광주점', '기타'],
      '광주광역시': ['JJ 수영장 광주점', '기타'],
      '광주동구': ['JJ 수영장 광주점'],
      '광주서구': ['기타'],
      '광주남구': ['기타'],
      '광주북구': ['기타'],
      '광산구': ['기타'],
      
      // 대전시 (UnifiedRegionSelector는 '대전광역시' 사용)
      '대전시': ['대전센터', '기타'],
      '대전광역시': ['대전센터', '기타'],
      '대전동구': ['대전센터'],
      '대전중구': ['기타'],
      '대전서구': ['기타'],
      '유성구': ['기타'],
      '대덕구': ['기타'],
      
      // 울산시 (UnifiedRegionSelector는 '울산광역시' 사용)
      '울산시': ['울산센터', '기타'],
      '울산광역시': ['울산센터', '기타'],
      '울산중구': ['울산센터'],
      '울산남구': ['기타'],
      '울산동구': ['기타'],
      '울산북구': ['기타'],
      '울주군': ['기타'],
      
      // 세종시 (UnifiedRegionSelector는 '세종특별자치시' 사용)
      '세종시': ['JJ 수영장 세종점', '기타'],
      '세종특별자치시': ['JJ 수영장 세종점', '기타'],
      
      // 강원도
      '강원도': ['춘천센터', '강릉센터', '기타'],
      '춘천시': ['춘천센터'],
      '원주시': ['기타'],
      '강릉시': ['강릉센터'],
      '동해시': ['기타'],
      '태백시': ['기타'],
      '속초시': ['기타'],
      '삼척시': ['기타'],
      '홍천군': ['기타'],
      '횡성군': ['기타'],
      '영월군': ['기타'],
      '평창군': ['기타'],
      '정선군': ['기타'],
      '철원군': ['기타'],
      '화천군': ['기타'],
      '양구군': ['기타'],
      '인제군': ['기타'],
      '강원고성군': ['기타'],
      '양양군': ['기타'],
      
      // 충청북도
      '충청북도': ['기타'],
      '청주시': ['기타'],
      '충주시': ['기타'],
      '제천시': ['기타'],
      '보은군': ['기타'],
      '옥천군': ['기타'],
      '영동군': ['기타'],
      '증평군': ['기타'],
      '진천군': ['기타'],
      '괴산군': ['기타'],
      '음성군': ['기타'],
      '단양군': ['기타'],
      
      // 충청남도
      '충청남도': ['기타'],
      '천안시': ['기타'],
      '공주시': ['기타'],
      '보령시': ['기타'],
      '아산시': ['기타'],
      '서산시': ['기타'],
      '논산시': ['기타'],
      '계룡시': ['기타'],
      '당진시': ['기타'],
      '금산군': ['기타'],
      '부여군': ['기타'],
      '서천군': ['기타'],
      '청양군': ['기타'],
      '홍성군': ['기타'],
      '예산군': ['기타'],
      '태안군': ['기타'],
      
      // 전라북도
      '전라북도': ['기타'],
      '전주시': ['기타'],
      '군산시': ['기타'],
      '익산시': ['기타'],
      '정읍시': ['기타'],
      '남원시': ['기타'],
      '김제시': ['기타'],
      '완주군': ['기타'],
      '진안군': ['기타'],
      '무주군': ['기타'],
      '장수군': ['기타'],
      '임실군': ['기타'],
      '순창군': ['기타'],
      '고창군': ['기타'],
      '부안군': ['기타'],
      
      // 전라남도
      '전라남도': ['기타'],
      '목포시': ['기타'],
      '여수시': ['기타'],
      '순천시': ['기타'],
      '나주시': ['기타'],
      '광양시': ['기타'],
      '담양군': ['기타'],
      '곡성군': ['기타'],
      '구례군': ['기타'],
      '고흥군': ['기타'],
      '보성군': ['기타'],
      '화순군': ['기타'],
      '장흥군': ['기타'],
      '강진군': ['기타'],
      '해남군': ['기타'],
      '영암군': ['기타'],
      '무안군': ['기타'],
      '함평군': ['기타'],
      '영광군': ['기타'],
      '장성군': ['기타'],
      '완도군': ['기타'],
      '진도군': ['기타'],
      '신안군': ['기타'],
      
      // 경상북도
      '경상북도': ['기타'],
      '포항시': ['기타'],
      '경주시': ['기타'],
      '김천시': ['기타'],
      '안동시': ['기타'],
      '구미시': ['기타'],
      '영주시': ['기타'],
      '영천시': ['기타'],
      '상주시': ['기타'],
      '문경시': ['기타'],
      '경산시': ['기타'],
      '경북군위군': ['기타'],
      '의성군': ['기타'],
      '청송군': ['기타'],
      '영양군': ['기타'],
      '영덕군': ['기타'],
      '청도군': ['기타'],
      '고령군': ['기타'],
      '성주군': ['기타'],
      '칠곡군': ['기타'],
      '예천군': ['기타'],
      '봉화군': ['기타'],
      '울진군': ['기타'],
      '울릉군': ['기타'],
      
      // 경상남도
      '경상남도': ['기타'],
      '창원시': ['기타'],
      '진주시': ['기타'],
      '통영시': ['기타'],
      '사천시': ['기타'],
      '김해시': ['기타'],
      '밀양시': ['기타'],
      '거제시': ['기타'],
      '양산시': ['기타'],
      '의령군': ['기타'],
      '함안군': ['기타'],
      '창녕군': ['기타'],
      '경남고성군': ['기타'],
      '남해군': ['기타'],
      '하동군': ['기타'],
      '산청군': ['기타'],
      '함양군': ['기타'],
      '거창군': ['기타'],
      '합천군': ['기타'],
      
      // 제주도 (UnifiedRegionSelector는 '제주특별자치도' 사용)
      '제주도': ['기타'],
      '제주특별자치도': ['기타'],
      '제주시': ['기타'],
      '서귀포시': ['기타']
    };
    console.log('✅ regionCenters 초기화 완료:', Object.keys(mockRegionCenters).length, '개 지역');
    console.log('📋 regionCenters 샘플 키:', Object.keys(mockRegionCenters).slice(0, 10));
    setRegionCenters(mockRegionCenters);
  }, []);

  // 지역 이름 매핑 (UnifiedRegionSelector의 지역 이름을 regionCenters 키로 변환)
  const normalizeRegionName = (region: string): string => {
    const mapping: Record<string, string> = {
      '서울특별시': '서울시',
      '인천광역시': '인천시',
      '부산광역시': '부산시',
      '대구광역시': '대구시',
      '광주광역시': '광주시',
      '대전광역시': '대전시',
      '울산광역시': '울산시',
      '세종특별자치시': '세종시',
      '제주특별자치도': '제주도'
    };
    return mapping[region] || region;
  };

  // 선택된 지역에 따른 센터 목록 업데이트
  useEffect(() => {
    console.log('🔍 지역 선택 변경 감지:', Array.from(selectedRegions));
    console.log('🗺️ regionCenters 키 목록:', Object.keys(regionCenters));
    console.log('🗺️ regionCenters 전체 데이터:', regionCenters);
    
    const selectedRegionList = Array.from(selectedRegions);
    let availableCenters: string[] = [];
    
    if (selectedRegionList.length === 0) {
      availableCenters = [];
      console.log('🚫 지역 미선택 - 센터 없음');
    } else if (selectedRegionList.includes('전국')) {
      availableCenters = regionCenters['전국'] || [];
      console.log('🌏 전국 선택 - 모든 센터:', availableCenters);
    } else {
      // 구/군이 선택된 경우
      if (selectedRegionList.length > 0) {
        for (const region of selectedRegionList) {
          console.log(`🔎 처리 중인 지역: "${region}"`);
          // UnifiedRegionSelector의 지역 이름을 regionCenters 키로 변환
          const normalizedRegion = normalizeRegionName(region);
          console.log(`   → 정규화된 지역: "${normalizedRegion}"`);
          
          // 1. 정규화된 이름으로 찾기
          if (regionCenters[normalizedRegion]) {
            console.log(`   ✅ ${normalizedRegion} 키로 찾음:`, regionCenters[normalizedRegion]);
            availableCenters = [...availableCenters, ...regionCenters[normalizedRegion]];
          } 
          // 2. 원래 이름으로 찾기
          else if (regionCenters[region]) {
            console.log(`   ✅ ${region} 키로 찾음:`, regionCenters[region]);
            availableCenters = [...availableCenters, ...regionCenters[region]];
          } 
          // 3. 찾지 못한 경우
          else {
            console.log(`   ❌ ${region} (${normalizedRegion})에 대한 센터 매핑이 없습니다.`);
            console.log(`   📋 사용 가능한 키들:`, Object.keys(regionCenters).filter(k => k.includes(region) || k.includes(normalizedRegion)));
          }
        }
      }
      
      // 시/도만 선택하고 구/군을 선택하지 않은 경우
      if (currentSelectedSido && currentSelectedSido !== '전국' && availableCenters.length === 0) {
        const normalizedSido = normalizeRegionName(currentSelectedSido);
        const sidoCenters = regionCenters[normalizedSido] || regionCenters[currentSelectedSido] || [];
        if (sidoCenters.length > 0) {
          console.log(`📍 시/도만 선택됨 - ${currentSelectedSido} (${normalizedSido}) 센터:`, sidoCenters);
          availableCenters = sidoCenters;
        }
      }
      // 중복 제거
      const uniqueCenters: string[] = [];
      for (const center of availableCenters) {
        if (!uniqueCenters.includes(center)) {
          uniqueCenters.push(center);
        }
      }
      availableCenters = uniqueCenters;
      console.log('🎯 최종 사용 가능한 센터:', availableCenters);
    }
    
    console.log('📊 센터 목록 업데이트:', availableCenters);
    
    // ⚠️ 중요: 지역 선택 시 센터 목록만 표시하고, activeCenters는 비워둠
    // 사용자가 센터를 선택할 때까지 데이터 로딩하지 않음
    setCenterList(availableCenters);
    
    // activeCenters는 사용자가 직접 선택할 때까지 비워둠
    // 기존에 선택된 센터가 새로운 센터 목록에 없으면 제거
    if (activeCenters.size > 0) {
      const validActiveCenters = new Set<string>();
      for (const center of activeCenters) {
        if (availableCenters.includes(center)) {
          validActiveCenters.add(center);
        }
      }
      // 유효하지 않은 센터가 있으면 제거
      if (validActiveCenters.size !== activeCenters.size) {
        setActiveCenters(validActiveCenters);
      }
    } else {
      // activeCenters가 비어있으면 그대로 유지 (사용자가 선택할 때까지)
      setActiveCenters(new Set());
    }
    
    // 지역 선택 시 데이터 초기화 (센터 선택 전까지는 데이터 표시 안 함)
    if (availableCenters.length === 0) {
      setSpots([]);
      setMetadata(null);
    } else if (activeCenters.size === 0) {
      // 센터 목록은 있지만 선택되지 않은 경우 - 데이터 초기화
      setSpots([]);
      setMetadata(null);
    }
    
    console.log('✅ 센터 목록 업데이트 완료:', {
      availableCenters: availableCenters.length,
      activeCenters: activeCenters.size,
      selectedRegions: Array.from(selectedRegions)
    });
  }, [selectedRegions, regionCenters, currentSelectedSido]);

  // activeCenters가 업데이트된 후 데이터 로딩 (fetchSpotsData 정의 후에 useEffect 추가)

  // 인증 확인 - 최고 관리자만 접근
  useEffect(() => {
    // 로딩 중이면 아무것도 하지 않음
    if (loading) return;
    
    // 사용자가 없으면 홈으로 리다이렉트
    if (!user) {
      router.push('/');
      return;
    }
    
    // 최고관리자가 아니면 홈으로 리다이렉트
    if (user.userType !== 'superAdmin') {
      console.warn('⚠️ 최고관리자 권한이 없습니다. 홈으로 리다이렉트합니다.');
      router.push('/');
      return;
    }
    
    // 최고관리자이면 페이지에 머무름
    console.log('✅ 최고관리자 인증 확인 완료');
  }, [user, loading, router]);

  // 라이브러리 동적 로딩
  useEffect(() => {
    const loadLibraries = async () => {
      try {
        console.log('📦 라이브러리 로딩 시작...');
        
        maplibregl = (await import('maplibre-gl')).default;
        console.log('✅ maplibre-gl 로딩 완료');
        
        const deckGl = await import('@deck.gl/mapbox');
        console.log('✅ @deck.gl/mapbox 로딩 완료:', Object.keys(deckGl));
        
        const coreLayers = await import('@deck.gl/layers');
        console.log('✅ @deck.gl/layers 로딩 완료:', Object.keys(coreLayers));

        // Deck.gl 컴포넌트 설정
        MapboxOverlay = deckGl.MapboxOverlay;
        ScatterplotLayer = coreLayers.ScatterplotLayer;
        TextLayer = coreLayers.TextLayer;
        
        console.log('✅ MapboxOverlay 설정:', !!MapboxOverlay);
        console.log('✅ ScatterplotLayer 설정:', !!ScatterplotLayer);
        console.log('✅ TextLayer 설정:', !!TextLayer);

        // CSS 로딩 (타입 선언 오류 무시)
        // @ts-ignore
        await import('maplibre-gl/dist/maplibre-gl.css');

        console.log('✅ MapLibre + deck.gl 라이브러리 로딩 완료');
        setLibrariesLoaded(true);
      } catch (error) {
        console.error('🚨 라이브러리 로딩 실패:', error);
      }
    };

    loadLibraries();
  }, []);

  // 지도 초기화
  useEffect(() => {
    console.log('🗺️ 지도 초기화 useEffect 실행:', {
      hasMapRef: !!mapRef.current,
      hasMaplibregl: !!maplibregl,
      hasMapboxOverlay: !!MapboxOverlay,
      librariesLoaded
    });

    if (!librariesLoaded || !mapRef.current || !maplibregl || !MapboxOverlay) {
      console.log('⏳ 지도 초기화 대기 중 - 라이브러리 또는 DOM 요소 대기');
      return;
    }

    // VWorld 지도 사용
    const style: any = {
      version: 8,
      sources: {
        'vworld': {
          type: 'raster',
          tiles: [
            `https://api.vworld.kr/req/wmts/1.0.0/${process.env.NEXT_PUBLIC_VWORLD_KEY}/Base/{z}/{y}/{x}.png`
          ],
          tileSize: 256
        }
      },
      layers: [
        {
          id: 'vworld-base',
          type: 'raster',
          source: 'vworld'
        }
      ]
    };

    const map = new maplibregl.Map({
      container: mapRef.current,
      style,
      center: [127.0276, 37.4979], // 서울 강남구 중심
      zoom: 12,
      maxZoom: 18,
      minZoom: 8,
      pitch: 0,
      bearing: 0,
      scrollZoom: true,
      boxZoom: true,
      dragRotate: false,
      dragPan: true,
      keyboard: true,
      doubleClickZoom: true,
      touchZoomRotate: true
    });

    mapInstanceRef.current = map;

    // MapboxOverlay 인스턴스 생성
    const overlay = new MapboxOverlay({
      interleaved: true,
      layers: []
    });
    
    // MapboxOverlay를 지도에 추가
    map.addControl(overlay);
    overlayRef.current = overlay;

    // 줌 레벨 변경 감지
    map.on('zoom', () => {
      setCurrentZoom(map.getZoom());
    });

    // 지도 로딩 완료
    map.on('load', () => {
      console.log('🗺️ VWorld 지도 로딩 완료');
      
      // 지역이 선택된 경우에만 데이터 로딩
      if (selectedRegions.size > 0) {
        fetchSpotsData();
      }
    });

    // 스팟 데이터 로딩 함수
    const fetchSpotsData = async () => {
      // 지역이 선택되지 않은 경우 데이터 로딩하지 않음
      if (selectedRegions.size === 0) {
        console.log('🚫 지역이 선택되지 않음 - 데이터 로딩 건너뜀');
        setSpots([]);
        setMetadata(null);
        return;
      }

      setLoadingData(true);
      try {
        console.log('🗺️ 지오해시 블록 스팟 데이터 로딩 시작');
        
        const activeCenterList = Array.from(activeCenters);
        const params = new URLSearchParams({
          k: '5',
          memberType: memberType,
          ...(activeCenterList.length > 0 && { centers: activeCenterList.join(',') })
        });

        const response = await fetch(`/api/geo/spots?${params}`, { cache: 'no-store' });
        const result = await response.json();
        
        console.log('📊 스팟 데이터 응답:', result);

        setSpots(result.spots);
        setMetadata(result.metadata);
        
        const uniq = new Set<string>();
        result.spots.forEach((s: Spot) => s.centers.forEach((c: any) => uniq.add(c.centerId)));
        const list = Array.from(uniq).filter(x => x !== '기타').sort();
        setCenterList(list);
        setActiveCenters(new Set(list));
      } catch (error) {
        console.error('❌ 스팟 데이터 로딩 오류:', error);
      } finally {
        setLoadingData(false);
      }
    };


    // 정리 함수
    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [librariesLoaded]);


  // 스팟 데이터 로딩 함수 (useEffect 밖으로 이동)
  const fetchSpotsData = useCallback(async () => {
    setLoadingData(true);
    try {
      // 최신 activeCenters 상태 가져오기
      const currentActiveCenters = activeCenters;
      console.log('🗺️ 지오해시 블록 스팟 데이터 로딩 시작');
      console.log('🔍 활성 센터:', Array.from(currentActiveCenters));
      console.log('🔍 선택된 지역:', Array.from(selectedRegions));
      
      const params = new URLSearchParams({
        k: '5',
        memberType: memberType,
        zoom: currentZoom.toString(),
        // 최고관리자는 실제 DB 데이터를 볼 수 있도록 노이즈/반올림 제거 옵션 추가
        noNoise: 'true', // 노이즈 제거
        noRound: 'true'  // 반올림 제거
      });
      
      // 활성 센터가 있으면 전달 (여러 센터는 쉼표로 구분)
      if (currentActiveCenters.size > 0) {
        const centersArray = Array.from(currentActiveCenters);
        // API가 여러 센터를 받을 수 있도록 쉼표로 구분된 문자열로 전달
        const centersString = centersArray.join(',');
        params.append('centerIds', centersString);
        console.log('📤 centerIds 파라미터 전달:', centersString);
      } else {
        console.log('⚠️ 활성 센터가 없어서 centerIds 파라미터를 전달하지 않습니다.');
      }

      // 인증 토큰 가져오기
      const token = typeof window !== 'undefined' 
        ? localStorage.getItem('token') || sessionStorage.getItem('token')
        : null;
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🔑 클라이언트에서 인증 토큰 전달');
      } else {
        console.warn('⚠️ 인증 토큰이 없습니다.');
      }

      const response = await fetch(`/api/geo/spots?${params}`, { 
        cache: 'no-store',
        headers
      });
      const result = await response.json();
      
      console.log('📊 스팟 데이터 응답:', result);

      if (result.success) {
        console.log('📦 API 응답 데이터:', {
          spotsCount: result.data.spots?.length || 0,
          spots: result.data.spots?.slice(0, 3),
          metadata: result.data.metadata
        });
        
        setSpots(result.data.spots);
        setMetadata(result.data.metadata);
        
        // API 응답에서 센터 목록 추출 (중복 제거, "기타" 제외)
        const allCenters = Array.from(new Set(result.data.spots.map((s: Spot) => s.dominantCenter))) as string[];
        const centers = allCenters.filter(c => c !== '기타'); // "기타" 센터 제외
        console.log('🏢 API 응답 센터 목록 (중복 제거):', allCenters);
        console.log('🏢 API 응답 활성 센터 (기타 제외):', centers);
        
        // ⚠️ 중요: centerList는 지역 선택 시 설정된 센터 목록을 유지해야 함
        // API 응답의 센터 목록으로 centerList를 덮어쓰지 않음 (선택하지 않은 센터가 사라지는 것을 방지)
        // API 응답의 센터 목록은 참고용으로만 사용
        if (centers.length > 0) {
          console.log('✅ API 응답 센터 목록 (참고용):', centers);
          console.log('📋 현재 centerList (유지):', centerList);
          
          // ⚠️ 중요: centerList는 지역 선택 시 설정된 목록을 유지
          // API 응답의 센터 목록으로 업데이트하지 않음
          // 대신, centerList에 있는 센터 중 API 응답에 없는 센터는 제거하지 않음
          // (사용자가 선택하지 않은 센터도 목록에 계속 표시되어야 함)
          
          // ⚠️ 중요: activeCenters는 사용자가 직접 선택한 것이므로 변경하지 않음
          // API 응답에 없는 센터가 activeCenters에 있어도 제거하지 않음
          // (사용자가 선택한 센터는 유지)
        }
        
        console.log('✅ 스팟 데이터 로딩 완료:', result.data.spots.length, '개 스팟');
        console.log('📊 스팟 통계:', result.data.metadata);
      } else {
        console.error('❌ 스팟 데이터 로딩 실패:', result.error);
      }
    } catch (error) {
      console.error('❌ 스팟 데이터 로딩 오류:', error);
    } finally {
      setLoadingData(false);
    }
  }, [activeCenters, selectedRegions, memberType, currentZoom, currentSelectedSido]); // currentSelectedSido 추가

  // ⚠️ 중요: activeCenters가 업데이트된 후에만 데이터 로딩 (사용자가 센터를 선택했을 때)
  useEffect(() => {
    if (!librariesLoaded || !mapInstanceRef.current || loadingData) return;
    
    // 센터가 선택되었고, 지역도 선택된 경우에만 데이터 로딩
    if (activeCenters.size > 0 && selectedRegions.size > 0) {
      const timeoutId = setTimeout(() => {
        if (loadingData) return; // 로딩 중이면 건너뜀
        console.log('🔄 사용자가 센터를 선택함 - 데이터 로딩 시작');
        console.log('🔍 활성 센터:', Array.from(activeCenters));
        fetchSpotsData();
      }, 500); // 500ms 디바운스
      
      return () => clearTimeout(timeoutId);
    } else if (activeCenters.size === 0 && selectedRegions.size > 0) {
      // 지역은 선택되었지만 센터가 선택되지 않은 경우 - 데이터 초기화
      console.log('⏳ 지역 선택됨, 센터 선택 대기 중 - 데이터 초기화');
      setSpots([]);
      setMetadata(null);
    } else if (selectedRegions.size === 0) {
      // 지역 선택 해제
      console.log('🚫 지역 선택 해제 - 스팟 데이터 초기화');
      setSpots([]);
      setMetadata(null);
    }
  }, [activeCenters, selectedRegions, librariesLoaded]); // fetchSpotsData 의존성 제거

  // 필터 변경 시 데이터 재로딩 (디바운스 적용, 중복 호출 방지)
  useEffect(() => {
    if (!librariesLoaded || loadingData) return;
    
    const timeoutId = setTimeout(() => {
      if (loadingData) return; // 로딩 중이면 건너뜀
      console.log('🔄 필터 변경 감지 - 데이터 재로딩:', { memberType, selectedCenterId });
      fetchSpotsData();
    }, 500); // 500ms 디바운스 증가
    
    return () => clearTimeout(timeoutId);
  }, [librariesLoaded, memberType, selectedCenterId]); // fetchSpotsData 의존성 제거

  // 줌 레벨 변경 시 데이터 재로딩 (디바운스 적용, 중복 호출 방지)
  useEffect(() => {
    if (!librariesLoaded || loadingData) return;
    
    const timeoutId = setTimeout(() => {
      if (loadingData) return; // 로딩 중이면 건너뜀
      console.log('🔍 줌 레벨 변경 감지 - 데이터 재로딩:', currentZoom);
      fetchSpotsData();
    }, 800); // 800ms 디바운스 증가 (줌은 더 자주 변경되므로)

    return () => clearTimeout(timeoutId);
  }, [currentZoom, librariesLoaded]); // fetchSpotsData 의존성 제거

  // 스팟 크기 계산 함수 (지도 비율에 맞춘 적절한 크기)
  const scaleRadius = useCallback((n: number, memberType?: string) => {
    // 센터는 고정 크기 사용
    if (memberType === 'center') {
      if (currentZoom >= 15) {
        return 25;   // 25m - 센터는 작게
      } else if (currentZoom >= 12) {
        return 40;   // 40m
      } else if (currentZoom >= 10) {
        return 60;   // 60m
      } else if (currentZoom >= 9) {
        return 80;   // 80m
      } else {
        return 100;  // 100m
      }
    }
    
    // 일반 회원/강사/게스트는 인원수에 따른 크기
    let baseRadius: number;
    
    if (currentZoom >= 16) {
      // 도로명주소 단위: 작은 크기
      baseRadius = 30;   // 30m
    } else if (currentZoom >= 15) {
      // 도로명주소 단위: 작은 크기
      baseRadius = 50;   // 50m
    } else if (currentZoom >= 12) {
      // 지번주소 단위: 중간 크기
      baseRadius = 100;  // 100m
    } else if (currentZoom >= 10) {
      // 행정동 단위: 큰 크기
      baseRadius = 200;  // 200m
    } else if (currentZoom >= 9) {
      // 행정구 단위: 큰 크기
      baseRadius = 500;  // 500m
    } else {
      // 시 단위: 매우 큰 크기
      baseRadius = 1000;  // 1000m
    }
    
    // 지도 비율에 맞춘 적절한 크기
    return baseRadius;
  }, [currentZoom]);

  // 스팟 레이어 생성
  const buildSpotsLayer = useCallback(() => {
    // ⚠️ 중요: 필터링 시 "기타" 센터 제외 (센터별 색상 구분을 위해)
    // - activeCenters에 포함된 센터만 표시
    // - "기타"는 색상 구분이 없으므로 제외
    // - activeCenters가 비어있으면 아무것도 표시하지 않음
    const filteredSpots = spots.filter(s => {
      // null/undefined 체크
      if (!s || !s.dominantCenter) {
        console.warn('⚠️ 유효하지 않은 스팟 데이터:', s);
        return false;
      }
      // activeCenters가 비어있으면 아무것도 표시하지 않음
      if (activeCenters.size === 0) {
        return false;
      }
      // activeCenters에 포함된 센터만 표시 ("기타" 제외)
      return activeCenters.has(s.dominantCenter) && s.dominantCenter !== '기타';
    });
    
    console.log('🔧 스팟 레이어 생성:', filteredSpots.length, '개 스팟');
    console.log('🎯 활성 센터:', Array.from(activeCenters));
    console.log('📍 스팟 위치 샘플:', filteredSpots.slice(0, 3).map(s => ({ 
      geohash: s.geohash, 
      lat: s.lat, 
      lng: s.lng, 
      totalApprox: s.totalApprox,
      dominantCenter: s.dominantCenter 
    })));
    
    // 스팟 위치 중복 확인 및 겹침 방지 데이터 준비
    const positions = filteredSpots.map(s => `${s.lat.toFixed(6)},${s.lng.toFixed(6)}`);
    const uniquePositions = new Set(positions);
    console.log('📍 위치 중복 확인:', positions.length, '개 위치,', uniquePositions.size, '개 고유 위치');
    
    // ✅ 겹침 방지: 같은 위치의 스팟들을 약간 분산시키기 위한 맵 생성
    const positionCountMap = new Map<string, number>();
    filteredSpots.forEach((spot) => {
      const posKey = `${spot.lat.toFixed(6)},${spot.lng.toFixed(6)}`;
      positionCountMap.set(posKey, (positionCountMap.get(posKey) || 0) + 1);
    });
    
    // 위치별 인덱스 추적 (동일 위치의 여러 스팟 분산용)
    const positionIndexMap = new Map<string, number>();
    
    // ✅ 상대적 크기 스케일링: 현재 화면에 표시된 스팟들 중 최소/최대 회원 수 기준
    // - 줌 아웃 시 숫자가 커져도 상대적으로 표현 (가장 큰 스팟 = 최대 크기, 가장 작은 스팟 = 최소 크기)
    const memberCounts = filteredSpots.map(s => s.totalApprox || 0).filter(c => c > 0);
    const minCount = memberCounts.length > 0 ? Math.min(...memberCounts) : 30;
    const maxCount = memberCounts.length > 0 ? Math.max(...memberCounts) : 300;
    const minRadius = 30; // 최소 스팟 크기 (미터)
    const maxRadius = 300; // 최대 스팟 크기 (미터)
    
    // 첫 로그에만 상대적 스케일링 정보 출력
    if (filteredSpots.length > 0) {
      console.log(`📊 상대적 크기 스케일링: 회원 수 ${minCount}~${maxCount}명 → 크기 ${minRadius}~${maxRadius}m`);
    }
    
    // 첫 3개 스팟만 로그 출력 (전체 로그는 너무 많음)
    let loggedCount = 0;
    
    // 스팟 레이어 생성
    const spotsLayer = new ScatterplotLayer({
      id: 'spots',
      data: filteredSpots,
      pickable: true,
      getPosition: (d: Spot) => {
        if (!d || typeof d.lng !== 'number' || typeof d.lat !== 'number') {
          console.warn('⚠️ 스팟 데이터가 null이거나 좌표가 없습니다:', d);
          return [126.9780, 37.5665]; // 서울 시청 좌표 (기본값)
        }
        
        // ✅ 겹침 방지: 같은 위치에 여러 스팟이 있을 때 약간 분산
        const posKey = `${d.lat.toFixed(6)},${d.lng.toFixed(6)}`;
        const countAtPosition = positionCountMap.get(posKey) || 1;
        const currentIndex = positionIndexMap.get(posKey) || 0;
        
        // 같은 위치에 여러 스팟이 있는 경우만 약간 분산 (최대 15m 이내)
        if (countAtPosition > 1) {
          const angle = (currentIndex / countAtPosition) * 2 * Math.PI;
          const offsetDistance = Math.min(15, 5 * countAtPosition); // 스팟 개수에 비례하여 최대 15m
          const offsetLat = (offsetDistance / 111320) * Math.sin(angle);
          const offsetLng = (offsetDistance / (111320 * Math.cos(d.lat * Math.PI / 180))) * Math.cos(angle);
          
          // 인덱스 증가 (다음 스팟을 위한)
          positionIndexMap.set(posKey, currentIndex + 1);
          
          return [d.lng + offsetLng, d.lat + offsetLat];
        }
        
        // 단일 스팟은 원래 위치 사용
        // ⚠️ 중요: API에서 이미 계산된 블록 중심 좌표를 사용
        return [d.lng, d.lat];
      },
      getFillColor: (d: Spot) => {
        // ⚠️ 중요: 색상은 센터별 고정 색상만 사용 (회원 수와 무관)
        // - dominantCenter만 사용하여 센터별 색상 결정
        // - 회원 수(totalApprox)는 색상에 영향을 주지 않음
        if (!d || !d.dominantCenter) {
          console.warn('⚠️ 스팟 데이터가 null이거나 dominantCenter가 없습니다:', d);
          return [128, 128, 128, 150]; // 기본 회색
        }
        // 센터별 고정 색상 사용 (회원 수와 무관)
        const color = getCenterColor(d.dominantCenter, true);
        if (loggedCount < 3) {
          console.log('🎨 스팟 색상 (센터별 고정):', d.dominantCenter, '→', color, '(회원 수:', d.totalApprox, '명과 무관)');
          loggedCount++;
        }
        return color;
      },
      getRadius: (d: Spot) => {
        // ✅ 화면상 픽셀 크기 고정 (줌 레벨 무관) - 제곱근 스케일링으로 배수 관계 완화
        // - 화면에서 보이는 원의 크기는 항상 고정된 픽셀 크기로 표시
        // - 줌 레벨에 상관없이 화면상에서 같은 크기 유지
        // - 회원 수에 따라 상대적 크기 표현 (제곱근 스케일링으로 배수보다 부드럽게)
        if (!d || typeof d.totalApprox !== 'number') {
          console.warn('⚠️ 스팟 데이터가 null이거나 totalApprox가 없습니다:', d);
          return 18; // 최소 픽셀 크기 반환
        }
        
        const memberCount = d.totalApprox || minCount;
        
        // ✅ 제곱근 스케일링으로 배수 관계 완화 (50명과 10명의 차이가 5배가 아닌 더 부드럽게)
        // 최소/최대 픽셀 크기 조정 (최소 크기 증가, 차이 완화)
        const minPixels = 18; // 최소 크기 증가 (이전 8px → 18px)
        const maxPixels = 38; // 최대 크기 감소 (이전 50px → 38px) - 차이 완화
        
        let radiusPixels: number;
        if (maxCount === minCount) {
          // 모든 스팟이 같은 회원 수인 경우 중간 크기 반환
          radiusPixels = (minPixels + maxPixels) / 2;
        } else {
          // 제곱근 스케일링: memberCount의 제곱근을 사용하여 배수 관계 완화
          // 예: 10명 → sqrt(10) ≈ 3.16, 50명 → sqrt(50) ≈ 7.07 (비율: 약 2.24배)
          // 선형 스케일링: 10명 → 1.0, 50명 → 5.0 (비율: 5배) ← 이전 방식
          const sqrtMin = Math.sqrt(Math.max(1, minCount)); // 최소값의 제곱근
          const sqrtMax = Math.sqrt(Math.max(1, maxCount)); // 최대값의 제곱근
          const sqrtCurrent = Math.sqrt(Math.max(1, memberCount)); // 현재값의 제곱근
          
          // 제곱근 값을 픽셀 범위로 매핑
          const ratio = (sqrtCurrent - sqrtMin) / (sqrtMax - sqrtMin);
          radiusPixels = minPixels + ratio * (maxPixels - minPixels);
        }
        
        // 범위 제한 (안전장치)
        radiusPixels = Math.max(minPixels, Math.min(maxPixels, radiusPixels));
        
        // 첫 3개만 로그 출력
        const index = filteredSpots.indexOf(d);
        if (index >= 0 && index < 3) {
          console.log(`📏 스팟 크기: ${d.totalApprox}명 → ${radiusPixels.toFixed(1)}px (제곱근 스케일링, ${minCount}~${maxCount}명 범위)`);
        }
        return radiusPixels;
      },
      radiusUnits: 'pixels', // ✅ 픽셀 단위로 고정 (줌 레벨과 무관하게 화면상 크기 일정)
      radiusMinPixels: 12, // 최소 픽셀 크기 보장 (작은 스팟도 보이도록) - 증가
      radiusMaxPixels: 45, // 최대 픽셀 크기 제한 - 감소하여 차이 완화
      stroked: true,
      getLineColor: [255, 255, 255, 255],
      lineWidthMinPixels: 2,
      onHover: ({ object, x, y }) => {
        if (object) {
          setHoveredSpot({
            x,
            y,
            data: object
          });
          // Geohash를 한글 주소로 변환
          if (object.geohash) {
            getAddressFromGeohash(object.geohash)
              .then(address => setHoveredAddress(address))
              .catch(() => setHoveredAddress(null));
          } else {
            setHoveredAddress(null);
          }
        } else {
          setHoveredSpot(null);
          setHoveredAddress(null);
        }
      }
    });
    
    // 회원 수를 표시하는 TextLayer 생성 (가독성 개선)
    // ⚠️ 작은 스팟(회원 수 적음)은 숫자 표시 안 함 - 겹침 방지
    const textSpots = filteredSpots.filter(s => {
      const memberCount = s.totalApprox || 0;
      // 최소 단위는 1명이므로 1명 이상 모두 표시
      return memberCount >= 1; // 최소 1명 이상만 숫자 표시
    });
    
    if (TextLayer && textSpots.length > 0) {
      // ✅ 텍스트 가독성 향상: 외곽선 효과 (어두운 배경 레이어 + 밝은 텍스트 레이어)
      // 1단계: 어두운 외곽선 레이어 (배경)
      const textBackgroundLayer = new TextLayer({
        id: 'spots-text-background',
        data: textSpots,
        pickable: false,
        getPosition: (d: Spot) => {
          if (!d || typeof d.lng !== 'number' || typeof d.lat !== 'number') {
            return [126.9780, 37.5665];
          }
          return [d.lng, d.lat];
        },
        getText: (d: Spot) => String(d.totalApprox || 0),
        getColor: [0, 0, 0, 220], // 검은색 반투명 (외곽선 효과)
        getSize: 18, // 배경은 조금 더 크게
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'bold',
        sizeScale: 1,
        sizeMaxPixels: 24,
        sizeMinPixels: 14,
        getTextAnchor: 'middle',
        getAlignmentBaseline: 'center',
        characterSet: 'auto'
      });
      
      // 2단계: 밝은 텍스트 레이어 (전면)
      const textForegroundLayer = new TextLayer({
        id: 'spots-text-foreground',
        data: textSpots,
        pickable: false,
        getPosition: (d: Spot) => {
          if (!d || typeof d.lng !== 'number' || typeof d.lat !== 'number') {
            return [126.9780, 37.5665];
          }
          return [d.lng, d.lat];
        },
        getText: (d: Spot) => String(d.totalApprox || 0),
        getColor: [255, 255, 255, 255], // 흰색 텍스트
        getSize: 16, // 텍스트 크기 증가
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'bold',
        sizeScale: 1,
        sizeMaxPixels: 22,
        sizeMinPixels: 14,
        getTextAnchor: 'middle',
        getAlignmentBaseline: 'center',
        characterSet: 'auto'
      });
      
      return [spotsLayer, textBackgroundLayer, textForegroundLayer];
    }
    
    return spotsLayer;
  }, [spots, activeCenters, currentZoom, scaleRadius]);

  // 스팟 레이어 업데이트 (디바운스 적용하여 불필요한 업데이트 방지)
  useEffect(() => {
    if (!overlayRef.current) {
      return;
    }
    
    // activeCenters가 비어있으면 레이어 제거
    if (activeCenters.size === 0) {
      try {
        overlayRef.current?.setProps({
          layers: []
        });
        console.log('🚫 활성 센터가 없어서 레이어 제거');
      } catch (error) {
        console.error('❌ 레이어 제거 오류:', error);
      }
      return;
    }
    
    // spots가 없으면 레이어 제거
    if (!spots || !spots.length) {
      try {
        overlayRef.current?.setProps({
          layers: []
        });
      } catch (error) {
        console.error('❌ 레이어 제거 오류:', error);
      }
      return;
    }

    // 디바운스 적용 (300ms) - 불필요한 리렌더링 방지
    const timeoutId = setTimeout(() => {
      const layer = buildSpotsLayer();
      const layersArray = Array.isArray(layer) ? layer : [layer];
      
      // MapboxOverlay에 레이어 전달
      try {
        overlayRef.current?.setProps({
          layers: layersArray
        });
        console.log('✅ 스팟 레이어 업데이트 완료:', layersArray.length, '개 레이어');
      } catch (error) {
        console.error('❌ 레이어 설정 오류:', error);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [spots, activeCenters, buildSpotsLayer]); // activeCenters 추가

  // 센터 필터 토글
  const toggleCenter = (centerId: string, checked: boolean, event?: React.MouseEvent | MouseEvent) => {
    // 이벤트 전파 방지 (Navigation 컴포넌트로 이벤트가 전파되어 페이지 이동 방지)
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.(); // 즉시 전파 중지
    }
    
    console.log('🔘 센터 토글:', { centerId, checked, activeCenters: Array.from(activeCenters) });
    
    const newActiveCenters = new Set(activeCenters);
    if (checked) {
      newActiveCenters.add(centerId);
    } else {
      newActiveCenters.delete(centerId);
    }
    setActiveCenters(newActiveCenters);
    
    // activeCenters가 변경되면 스팟 레이어가 자동으로 업데이트됨 (buildSpotsLayer가 activeCenters를 의존성으로 사용)
    // 하지만 API에서 데이터를 다시 가져올 필요는 없음 (이미 모든 스팟 데이터가 있으므로)
  };

  // CSV 내보내기
  const exportToCSV = () => {
    if (spots.length === 0) return;

    const headers = ['Geohash', 'Latitude', 'Longitude', 'Total_Approx', 'Dominant_Center'];
    const rows = spots.map(spot => [
      spot.geohash,
      spot.lat,
      spot.lng,
      spot.totalApprox,
      spot.dominantCenter
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `geohash_spots_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">회원 분포도 (지오해시 블록 스팟)</h1>
          <p className="text-gray-600">지오해시 블록 기반 스팟으로 프라이버시 보호된 회원 분포 시각화</p>
        </div>

        {/* 컨트롤 패널 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            {/* 지역 선택 */}
            <div className="w-full mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-3">지역 선택:</label>
              {/* 지역 선택 - RegionSelectorWrapper 적용 */}
              <div className="bg-white p-3 rounded border">
                <RegionSelectorWrapper
                selectedRegions={selectedRegions}
                onRegionsChange={(regions) => {
                  console.log('🔍 회원분포도 - 지역 선택 변경:', Array.from(regions));
                  setSelectedRegions(regions);
                }}
                onSidoChange={(sido) => {
                  console.log('🔍 회원분포도 - 시/도 선택:', sido);
                  console.log('🔍 현재 selectedRegions:', Array.from(selectedRegions));
                  console.log('🔍 regionCenters 상태:', Object.keys(regionCenters).length > 0 ? '초기화됨' : '초기화 안됨');
                  setCurrentSelectedSido(sido);
                  // regionCenters가 초기화된 후에만 센터 목록 업데이트
                  if (Object.keys(regionCenters).length > 0) {
                    // 시/도만 선택하고 구/군을 선택하지 않은 경우 즉시 센터 목록 업데이트
                    if (sido && sido !== '전국' && selectedRegions.size === 0) {
                      const normalizedSido = normalizeRegionName(sido);
                      const sidoCenters = regionCenters[normalizedSido] || regionCenters[sido] || [];
                      console.log(`📍 시/도만 선택 - ${sido} (${normalizedSido}) 센터 찾기:`, sidoCenters);
                      console.log(`📋 regionCenters에서 찾은 키:`, normalizedSido, sido);
                      if (sidoCenters.length > 0) {
                        console.log(`✅ 시/도 센터 목록 설정:`, sidoCenters);
                        setCenterList(sidoCenters);
                      } else {
                        console.log(`⚠️ ${sido} (${normalizedSido})에 대한 센터가 없습니다.`);
                        console.log(`📋 regionCenters 전체 키:`, Object.keys(regionCenters));
                        console.log(`📋 관련 키들:`, Object.keys(regionCenters).filter(k => k.includes(sido) || k.includes(normalizedSido)));
                      }
                    }
                  } else {
                    console.log('⏳ regionCenters가 아직 초기화되지 않았습니다. useEffect에서 처리됩니다.');
                  }
                }}
                layout="simple"
                className="w-full"
              />
              </div>
              <div className="mt-2 text-xs text-gray-500">
                💡 시/도를 선택하면 해당 지역의 센터 목록이 표시됩니다.
              </div>
            </div>

            {/* 센터 선택 필터 (centerAdmin인 경우 항상 표시) */}
            {user?.userType === 'centerAdmin' && managedCenters.length > 0 && (
              <label className="text-sm flex items-center gap-2">
                센터:
                <select 
                  className="border rounded px-3 py-1 min-w-[150px]" 
                  value={selectedCenterId || 'all'} 
                  onChange={e => {
                    const value = e.target.value;
                    setSelectedCenterId(value === 'all' ? null : value);
                  }}
                >
                  <option value="all">📊 전체 통계</option>
                  {managedCenters.map((center) => (
                    <option key={center._id} value={center._id}>
                      {center.name}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {/* 유형 필터 */}
            <label className="text-sm flex items-center gap-2">
              유형:
              <select 
                className="border rounded px-3 py-1" 
                value={memberType} 
                onChange={e => setMemberType(e.target.value as any)}
              >
                <option value="all">전체</option>
                <option value="member">회원</option>
                <option value="instructor">강사</option>
                <option value="guest">게스트</option>
                <option value="center">센터</option>
              </select>
            </label>

            {/* 새로고침 버튼 */}
            <button
              onClick={fetchSpotsData}
              disabled={loadingData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loadingData ? '로딩 중...' : '🔄 새로고침'}
            </button>

            {/* CSV 내보내기 */}
            <button
              onClick={exportToCSV}
              disabled={!spots || spots.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              📊 CSV 내보내기
            </button>
          </div>

          {/* 현재 줌 레벨 표시 */}
          <div className="text-sm text-blue-600">
            📍 현재 줌: {currentZoom.toFixed(1)} (줌 레벨에 따른 자동 집계)
            <br />
            📏 행정단위: {metadata?.administrativeUnit || '지번주소 단위'} (줌 {metadata?.zoom || currentZoom}) - 동그라미 개수 = 행정구역 개수
            <br />
            🏛️ 자동 분할: 줌 레벨에 따라 행정단위 자동 전환 (동→구→시→도→광역)
            <br />
            🔒 프라이버시: k-익명성(5명), 라플라스 노이즈, 반올림(10단위) 적용
          </div>
        </div>

        {/* 센터 필터 - 지역이 선택되었거나 센터 목록이 있는 경우 표시 */}
        {(selectedRegions.size > 0 || currentSelectedSido || centerList.length > 0) && (
          <div 
            className="mb-4 relative" 
            style={{ zIndex: 10000, position: 'relative' }} // Navigation 드롭다운(z-9999)보다 높게 설정
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            onMouseUp={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">센터 필터</label>
              <div className="text-xs text-gray-500">
                선택된 지역: {selectedRegions.size > 0 
                  ? Array.from(selectedRegions).join(', ') 
                  : currentSelectedSido || '없음'} ({centerList.length}개 센터)
              </div>
            </div>
            {centerList.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {centerList.map((centerId, index) => {
                  const isActive = activeCenters.has(centerId);
                  const centerColor = getCenterColorCSS(centerId, true);
                  
                  return (
                    <button
                      key={`center-filter-${centerId}-${index}`}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation?.(); // 즉시 전파 중지
                        console.log('🔘 센터 버튼 클릭:', { centerId, isActive, event: e.type });
                        toggleCenter(centerId, !isActive, e);
                        return false; // 추가 안전장치
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault(); // mousedown 이벤트도 차단
                        e.stopPropagation();
                        e.stopImmediatePropagation?.();
                        console.log('🔘 센터 버튼 mousedown:', { centerId });
                        return false;
                      }}
                      onMouseUp={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation?.();
                        return false;
                      }}
                      className={`
                        px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                        flex items-center gap-2 relative
                        ${isActive 
                          ? 'text-white shadow-md transform scale-105' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                        }
                      `}
                      style={isActive ? { 
                        backgroundColor: centerColor,
                        borderColor: centerColor,
                        zIndex: 10001, // Navigation 드롭다운보다 높게
                        position: 'relative'
                      } : {
                        zIndex: 10001, // Navigation 드롭다운보다 높게
                        position: 'relative'
                      }}
                    >
                      <div 
                        className={`w-3 h-3 rounded-full ${isActive ? 'bg-white' : 'bg-gray-400'}`}
                        style={!isActive ? { backgroundColor: centerColor } : {}}
                      ></div>
                      <span>{centerId}</span>
                      {isActive && (
                        <span className="text-xs opacity-90">✓</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-xs text-gray-400 italic">
                선택된 지역에 등록된 센터가 없습니다.
              </div>
            )}
          </div>
        )}

        {/* 지도 컨테이너 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden relative">
          <div 
            ref={mapRef} 
            className="w-full h-[600px]"
            style={{ minHeight: '600px' }}
          />
          
          {/* 지도 배율 표시 */}
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm border border-gray-300 rounded-lg px-3 py-2 shadow-lg">
            <div className="text-sm font-medium text-gray-700">
              📏 지도 배율: 1:{Math.round(Math.pow(2, currentZoom) * 256).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              줌 레벨: {currentZoom.toFixed(1)}
            </div>
            <div className="text-xs text-gray-500">
              단위: {metadata?.administrativeUnit || '지번주소 단위'}
            </div>
          </div>
        </div>

        {/* 툴팁 */}
        {hoveredSpot && (
          <div 
            className="fixed z-50 px-3 py-2 text-xs bg-white/95 border border-gray-300 rounded-lg shadow-lg pointer-events-none"
            style={{ 
              left: hoveredSpot.x + 15, 
              top: hoveredSpot.y + 15 
            }}
          >
            <div className="font-semibold mb-1">
              📍 집계 구역: {hoveredAddress || hoveredSpot.data.geohash} ({metadata?.administrativeUnit || '동 단위'})
            </div>
            <div className="text-sm text-blue-600 mb-2">
              🏠 해당 구역 내 총 인원: <strong>약 {hoveredSpot.data.totalApprox}명 (익명처리)</strong>
              {hoveredSpot.data.blockCount && (
                <span className="text-xs text-gray-500 ml-2">
                  ({hoveredSpot.data.blockCount}개 블록 집계)
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500 mb-2">
              💡 이 스팟은 행정단위별로 집계된 지오해시 블록 내 {memberType === 'all' ? '전체' : memberType === 'member' ? '회원' : memberType === 'instructor' ? '강사' : '게스트'}들의 집계입니다 (k≥20, ε=1.5, 10명 단위 반올림)
            </div>
            <div className="text-xs font-medium text-gray-700 mb-1">센터별 분포:</div>
            {hoveredSpot.data.centers
              .sort((a: any, b: any) => b.countApprox - a.countApprox)
              .slice(0, 3)
              .map((center: any, i: number) => (
                <div key={`tooltip-center-${center.centerId}-${i}`} className="text-xs text-gray-600 mb-1">
                  {i + 1}. <strong>{center.centerId}</strong>: 약 {center.countApprox}명 
                  ({((center.countApprox / hoveredSpot.data.totalApprox) * 100).toFixed(1)}%)
                </div>
              ))}
          </div>
        )}

        {/* 범례 */}
        <div className="mt-4 bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-semibold mb-3">센터별 색상</h3>
          <div className="flex items-center gap-4 mb-2">
            {centerList.map((centerId, index) => {
              const color = getCenterColorCSS(centerId, true);

              return (
                <div key={`center-legend-${centerId}-${index}`} className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: color }}
                  ></div>
                  <span className="text-sm">
                    {centerId}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 프라이버시 안내 */}
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="text-yellow-600 mr-2">🔒</div>
            <div>
              <h3 className="text-sm font-semibold text-yellow-800 mb-1">프라이버시 보호</h3>
              <p className="text-sm text-yellow-700">
                이 지도의 스팟은 행정단위별로 동적으로 집계되는 지오해시 블록 기반 데이터이며, 개인 주소는 표시/저장하지 않습니다.
              </p>
              <ul className="text-sm text-yellow-700 mt-1 ml-4 list-disc">
                 <li>정밀도별 구역 분할: 줌≥16(도로명), 15(지번), 12-14(지번), 10-11(행정동), 9(행정구), &lt;9(시)</li>
                <li>k-익명성(k≥20), 라플라스 노이즈(ε=1.5), 10명 단위 반올림</li>
                 <li>지도 비율에 맞춘 적절한 스팟 크기 (30m-1km, 겹치지 않는 크기)</li>
                 <li>동그라미 개수 = 정밀도별 구역 개수 (지번주소 단위로 구역 분할)</li>
                <li>블록 중심 위치 고정, 인원수에 비례한 크기</li>
                <li>모든 수치는 추정치이며 익명처리됨</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 기술 정보 */}
        {metadata && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">동적 집계 통계</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-blue-700">
              <div>
                <div className="font-semibold">총 스팟 수</div>
                <div>{metadata?.totalSpots?.toLocaleString() || 0}개</div>
              </div>
              <div>
                <div className="font-semibold">숨김 블록</div>
                <div>{metadata?.hiddenBlocks?.toLocaleString() || 0}개</div>
              </div>
              <div>
                <div className="font-semibold">원본 총합</div>
                <div>{metadata?.totalOriginalCount?.toLocaleString() || 0}명</div>
              </div>
              <div>
                <div className="font-semibold">근사 총합</div>
                <div>{metadata?.totalApproxCount?.toLocaleString() || 0}명</div>
              </div>
            </div>
            <div className="mt-2 text-xs text-blue-600">
              집계 단위: {metadata?.administrativeUnit || '동 단위'} | 줌: {metadata?.zoom || currentZoom} | k-익명성: {metadata?.kAnonymity || 20} | 노이즈: ε={metadata?.noiseEpsilon || 1.5} | 반올림: {metadata?.roundingUnit || 10}단위
            </div>
            <div className="mt-2 text-xs text-blue-600">
              회원 유형: {metadata?.memberType || 'all'} | 현재 줌: {currentZoom.toFixed(1)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}