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
import RegionNavigation from '@/components/RegionNavigation';

// 동적 import로 SSR 문제 방지 및 성능 최적화
let maplibregl: any;
let MapboxOverlay: any;
let ScatterplotLayer: any;

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
  
  const colors: Record<string, [number, number, number, number]> = {
    '강남센터': [255, 99, 132, 200],   // 빨간색
    '홍대센터': [54, 162, 235, 200],   // 파란색
    '송파센터': [255, 205, 86, 200],   // 노란색
    '마포센터': [75, 192, 192, 200],   // 청록색
    '수원센터': [153, 102, 255, 200],  // 보라색
    '성남센터': [255, 159, 64, 200],   // 주황색
    '인천센터': [199, 199, 199, 200],  // 회색
    '부산센터': [83, 102, 255, 200],   // 진파랑
    '대구센터': [255, 99, 255, 200],   // 분홍색
    '광주센터': [99, 255, 132, 200],   // 연두색
    '대전센터': [255, 205, 86, 200],   // 노란색
    '울산센터': [255, 99, 132, 200],   // 빨간색
    '세종센터': [54, 162, 235, 200],   // 파란색
    '춘천센터': [75, 192, 192, 200],   // 청록색
    '강릉센터': [255, 159, 64, 200],   // 주황색
    'anonymous': [200, 200, 200, 150], // 익명화된 센터
  };
  return colors[centerId] || [153, 102, 255, 200]; // 기본 보라색
};

const getCenterColorCSS = (centerId: string, isVisible: boolean = true): string => {
  if (!isVisible) {
    return 'rgb(128, 128, 128)'; // 비공개 센터는 회색
  }
  
  const colors: Record<string, string> = {
    '강남센터': 'rgb(255, 99, 132)',
    '홍대센터': 'rgb(54, 162, 235)',
    '송파센터': 'rgb(255, 205, 86)',
    '마포센터': 'rgb(75, 192, 192)',
    '수원센터': 'rgb(153, 102, 255)',
    '성남센터': 'rgb(255, 159, 64)',
    '인천센터': 'rgb(199, 199, 199)',
    '부산센터': 'rgb(83, 102, 255)',
    '대구센터': 'rgb(255, 99, 255)',
    '광주센터': 'rgb(99, 255, 132)',
    '대전센터': 'rgb(255, 205, 86)',
    '울산센터': 'rgb(255, 99, 132)',
    '세종센터': 'rgb(54, 162, 235)',
    '춘천센터': 'rgb(75, 192, 192)',
    '강릉센터': 'rgb(255, 159, 64)',
    'anonymous': 'rgb(200, 200, 200)',
  };
  return colors[centerId] || 'rgb(153, 102, 255)';
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
  const [librariesLoaded, setLibrariesLoaded] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(12);
  
  // 필터 상태
  const [memberType, setMemberType] = useState<'all' | 'member' | 'instructor' | 'guest' | 'center'>('all');
  const [centerList, setCenterList] = useState<string[]>([]);
  const [activeCenters, setActiveCenters] = useState<Set<string>>(new Set());
  
  // 지역 선택 상태
  const [selectedRegions, setSelectedRegions] = useState<Set<string>>(new Set());
  const [regionCenters, setRegionCenters] = useState<Record<string, string[]>>({});
  
  // 2단계 선택 상태
  const [selectedSido, setSelectedSido] = useState<string>('');
  const [showDistrictSelection, setShowDistrictSelection] = useState(false);

  // 지역별 센터 매핑 초기화
  useEffect(() => {
    // 실제로는 API에서 가져와야 하지만, 모의 데이터로 초기화
    const mockRegionCenters: Record<string, string[]> = {
      '전국': ['홍대센터', '강남센터', '송파센터', '마포센터', '기타'],
      
      // 서울시
      '서울시': ['홍대센터', '강남센터', '송파센터', '마포센터', '기타'],
      '강남구': ['강남센터'],
      '송파구': ['송파센터'],
      '마포구': ['홍대센터', '마포센터'],
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
      '경기도': ['수원센터', '성남센터', '기타'],
      '수원시': ['수원센터'],
      '성남시': ['성남센터'],
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
      
      // 인천시
      '인천시': ['인천센터', '기타'],
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
      
      // 부산시
      '부산시': ['부산센터', '해운대센터', '기타'],
      '부산중구': ['부산센터'],
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
      
      // 대구시
      '대구시': ['대구센터', '기타'],
      '대구중구': ['대구센터'],
      '대구동구': ['기타'],
      '대구서구': ['기타'],
      '대구남구': ['기타'],
      '대구북구': ['기타'],
      '수성구': ['기타'],
      '달서구': ['기타'],
      '달성군': ['기타'],
      '대구군위군': ['기타'],
      
      // 광주시
      '광주시': ['광주센터', '기타'],
      '광주동구': ['광주센터'],
      '광주서구': ['기타'],
      '광주남구': ['기타'],
      '광주북구': ['기타'],
      '광산구': ['기타'],
      
      // 대전시
      '대전시': ['대전센터', '기타'],
      '대전동구': ['대전센터'],
      '대전중구': ['기타'],
      '대전서구': ['기타'],
      '유성구': ['기타'],
      '대덕구': ['기타'],
      
      // 울산시
      '울산시': ['울산센터', '기타'],
      '울산중구': ['울산센터'],
      '울산남구': ['기타'],
      '울산동구': ['기타'],
      '울산북구': ['기타'],
      '울주군': ['기타'],
      
      // 세종시
      '세종시': ['세종센터', '기타'],
      
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
      
      // 제주도
      '제주도': ['기타'],
      '제주시': ['기타'],
      '서귀포시': ['기타']
    };
    setRegionCenters(mockRegionCenters);
  }, []);

  // 선택된 지역에 따른 센터 목록 업데이트
  useEffect(() => {
    console.log('🔍 지역 선택 변경 감지:', Array.from(selectedRegions));
    console.log('🗺️ 지역별 센터 매핑:', regionCenters);
    
    const selectedRegionList = Array.from(selectedRegions);
    let availableCenters: string[] = [];
    
    if (selectedRegionList.length === 0) {
      availableCenters = [];
      console.log('🚫 지역 미선택 - 센터 없음');
    } else if (selectedRegionList.includes('전국')) {
      availableCenters = regionCenters['전국'] || [];
      console.log('🌏 전국 선택 - 모든 센터:', availableCenters);
    } else {
      for (const region of selectedRegionList) {
        if (regionCenters[region]) {
          console.log(`📍 ${region} 센터:`, regionCenters[region]);
          availableCenters = [...availableCenters, ...regionCenters[region]];
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
    
    setCenterList(availableCenters);
    
    // 현재 활성화된 센터 중에서 사용 가능한 센터만 유지
    const validActiveCenters = new Set<string>();
    const activeCentersArray = Array.from(activeCenters);
    for (const center of activeCentersArray) {
      if (availableCenters.includes(center)) {
        validActiveCenters.add(center);
      }
    }
    console.log('✅ 유효한 활성 센터:', Array.from(validActiveCenters));
    setActiveCenters(validActiveCenters);
  }, [selectedRegions, regionCenters]);

  // 지역 선택 변경 시 데이터 다시 로딩
  useEffect(() => {
    if (selectedRegions.size > 0 && mapInstanceRef.current) {
      console.log('🔄 지역 선택 변경 - 데이터 다시 로딩');
      fetchSpotsData();
    } else if (selectedRegions.size === 0) {
      console.log('🚫 지역 선택 해제 - 스팟 데이터 초기화');
      setSpots([]);
      setMetadata(null);
    }
  }, [selectedRegions]);

  // 인증 확인
  useEffect(() => {
    if (!loading && (!user || user.userType !== 'superAdmin')) {
      router.push('/');
      return;
    }
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
        
        console.log('✅ MapboxOverlay 설정:', !!MapboxOverlay);
        console.log('✅ ScatterplotLayer 설정:', !!ScatterplotLayer);

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
  const fetchSpotsData = async () => {
    setLoadingData(true);
    try {
      console.log('🗺️ 지오해시 블록 스팟 데이터 로딩 시작');
      
      const params = new URLSearchParams({
        k: '5',
        memberType: memberType,
        zoom: currentZoom.toString()
      });

      const response = await fetch(`/api/geo/spots?${params}`, { cache: 'no-store' });
      const result = await response.json();
      
      console.log('📊 스팟 데이터 응답:', result);

      if (result.success) {
        setSpots(result.data.spots);
        setMetadata(result.data.metadata);
        
        // 센터 목록 업데이트 (중복 제거)
        const centers = Array.from(new Set(result.data.spots.map((s: Spot) => s.dominantCenter))) as string[];
        console.log('🏢 센터 목록 (중복 제거):', centers);
        setCenterList(centers);
        setActiveCenters(new Set(centers));
        
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
  };

  // 필터 변경 시 데이터 재로딩 (줌 레벨 제외)
  useEffect(() => {
    if (librariesLoaded) {
      console.log('🔄 필터 변경 감지 - 데이터 재로딩:', { memberType });
      fetchSpotsData();
    }
  }, [librariesLoaded, memberType]);

  // 줌 레벨 변경 시 데이터 재로딩 (디바운스 적용)
  useEffect(() => {
    if (!librariesLoaded) return;
    
    const timeoutId = setTimeout(() => {
      console.log('🔍 줌 레벨 변경 감지 - 데이터 재로딩:', currentZoom);
      fetchSpotsData();
    }, 500); // 500ms 디바운스

    return () => clearTimeout(timeoutId);
  }, [currentZoom, librariesLoaded]);

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
    const filteredSpots = spots.filter(s => {
      // null/undefined 체크
      if (!s || !s.dominantCenter) {
        console.warn('⚠️ 유효하지 않은 스팟 데이터:', s);
        return false;
      }
      return s.dominantCenter === '기타' || activeCenters.has(s.dominantCenter);
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
    
    // 스팟 위치 중복 확인
    const positions = filteredSpots.map(s => `${s.lat.toFixed(6)},${s.lng.toFixed(6)}`);
    const uniquePositions = new Set(positions);
    console.log('📍 위치 중복 확인:', positions.length, '개 위치,', uniquePositions.size, '개 고유 위치');
    
    return new ScatterplotLayer({
      id: 'spots',
      data: filteredSpots,
      pickable: true,
      getPosition: (d: Spot) => {
        if (!d || typeof d.lng !== 'number' || typeof d.lat !== 'number') {
          console.warn('⚠️ 스팟 데이터가 null이거나 좌표가 없습니다:', d);
          return [126.9780, 37.5665]; // 서울 시청 좌표 (기본값)
        }
        return [d.lng, d.lat];
      },
      getFillColor: (d: Spot) => {
        if (!d || !d.dominantCenter) {
          console.warn('⚠️ 스팟 데이터가 null이거나 dominantCenter가 없습니다:', d);
          return [128, 128, 128, 150]; // 기본 회색
        }
        const color = getCenterColor(d.dominantCenter, true);
        console.log('🎨 스팟 색상:', d.dominantCenter, color);
        return color;
      },
             getRadius: (d: Spot) => {
               if (!d || typeof d.totalApprox !== 'number') {
                 console.warn('⚠️ 스팟 데이터가 null이거나 totalApprox가 없습니다:', d);
                 return 50; // 기본 크기
               }
               const radius = scaleRadius(d.totalApprox, d.memberType);
               const blockSizeMeters = 153; // 기본 블록 크기
                console.log('📏 스팟 크기:', d.totalApprox, '명 →', radius.toFixed(1), 'm (줌', currentZoom.toFixed(1), '지도비율맞춤, 겹치지않는크기)', d.memberType);
               return radius;
             },
      radiusUnits: 'meters',
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
        } else {
          setHoveredSpot(null);
        }
      }
    });
  }, [spots, activeCenters, currentZoom, scaleRadius]);

  // 스팟 레이어 업데이트
  useEffect(() => {
    if (!overlayRef.current || !spots || !spots.length) {
      console.log('⚠️ 스팟 레이어 업데이트 건너뜀:', {
        hasOverlay: !!overlayRef.current,
        spotsLength: spots?.length || 0
      });
      return;
    }

    console.log('🔧 스팟 레이어 업데이트 시작:', spots.length, '개 스팟');
    console.log('🗺️ 현재 줌 레벨:', currentZoom);
    console.log('🎯 활성 센터:', Array.from(activeCenters));
    
    const layer = buildSpotsLayer();
    console.log('📦 생성된 레이어:', layer);
    
    overlayRef.current.setProps({
      layers: [layer]
    });
    
    console.log('✅ 스팟 레이어 업데이트 완료');
  }, [spots, activeCenters, memberType, currentZoom, buildSpotsLayer]);

  // 센터 필터 토글
  const toggleCenter = (centerId: string, checked: boolean) => {
    const newActiveCenters = new Set(activeCenters);
    if (checked) {
      newActiveCenters.add(centerId);
    } else {
      newActiveCenters.delete(centerId);
    }
    setActiveCenters(newActiveCenters);
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
            <div className="text-sm w-full">
              <label className="block font-medium mb-3">지역 선택:</label>
              {/* 1단계: 시/도 선택 */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-600 mb-2">시/도 선택:</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {[
                    { id: '전국', name: '🌏 전국' },
                    { id: '서울시', name: '🏙️ 서울시' },
                    { id: '경기도', name: '🌳 경기도' },
                    { id: '인천시', name: '🌊 인천시' },
                    { id: '부산시', name: '🌊 부산시' },
                    { id: '대구시', name: '🏔️ 대구시' },
                    { id: '광주시', name: '🌅 광주시' },
                    { id: '대전시', name: '🔬 대전시' },
                    { id: '울산시', name: '🏭 울산시' },
                    { id: '세종시', name: '🏛️ 세종시' },
                    { id: '강원도', name: '⛰️ 강원도' },
                    { id: '충청북도', name: '🌲 충청북도' },
                    { id: '충청남도', name: '🌾 충청남도' },
                    { id: '전라북도', name: '🌾 전라북도' },
                    { id: '전라남도', name: '🌊 전라남도' },
                    { id: '경상북도', name: '🏔️ 경상북도' },
                    { id: '경상남도', name: '🌊 경상남도' },
                    { id: '제주도', name: '🏝️ 제주도' }
                  ].map(sido => (
                    <button
                      key={sido.id}
                      onClick={() => {
                        setSelectedSido(sido.id);
                        setShowDistrictSelection(sido.id !== '전국');
                        if (sido.id === '전국') {
                          setSelectedRegions(new Set(['전국']));
                        } else {
                          setSelectedRegions(new Set());
                        }
                      }}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        selectedSido === sido.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {sido.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2단계: 구/군 선택 (시/도가 선택된 경우만) */}
              {showDistrictSelection && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-gray-600">
                      {selectedSido} 구/군 선택:
                    </label>
                    <button
                      onClick={() => setShowDistrictSelection(false)}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      ✕ 닫기
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <DistrictSelector 
                      sido={selectedSido}
                      selectedRegions={selectedRegions}
                      setSelectedRegions={setSelectedRegions}
                      setSelectedSido={setSelectedSido}
                      setShowDistrictSelection={setShowDistrictSelection}
                    />
                  </div>
                </div>
              )}

              {/* 선택된 지역 표시 */}
              <div className="mt-3">
                <div className="text-xs font-medium text-gray-600 mb-2">
                  선택된 지역 ({selectedRegions.size}개):
                </div>
                <div className="flex flex-wrap gap-1">
                  {Array.from(selectedRegions).map(region => (
                    <span
                      key={region}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                    >
                      {region}
                      <button
                        onClick={() => {
                          const newRegions = new Set(selectedRegions);
                          newRegions.delete(region);
                          setSelectedRegions(newRegions);
                        }}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
                {selectedRegions.size === 0 && (
                  <div className="text-xs text-gray-400 italic">
                    지역을 선택해주세요 (지역 선택 후 센터 필터가 활성화됩니다)
                  </div>
                )}
              </div>
            </div>

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

        {/* 센터 필터 - 지역이 선택된 경우만 표시 */}
        {selectedRegions.size > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">센터 필터</label>
              <div className="text-xs text-gray-500">
                선택된 지역: {Array.from(selectedRegions).join(', ')} ({centerList.length}개 센터)
              </div>
            </div>
            {centerList.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {centerList.map((centerId, index) => (
                  <label key={`center-filter-${centerId}-${index}`} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={activeCenters.has(centerId)}
                      onChange={(e) => toggleCenter(centerId, e.target.checked)}
                      className="rounded"
                    />
                    <span 
                      className="px-2 py-1 rounded text-white text-xs"
                      style={{ backgroundColor: getCenterColorCSS(centerId, true) }}
                    >
                      {centerId}
                    </span>
                  </label>
                ))}
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
              📍 집계 구역: {hoveredSpot.data.geohash} ({metadata?.administrativeUnit || '동 단위'})
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