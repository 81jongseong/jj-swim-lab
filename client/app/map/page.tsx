/**
 * 🗺️ JJ Swim Lab - 수영 센터 찾기 지도 (VWorld + Leaflet)
 * 
 * 📋 **페이지 목적**
 * - VWorld WMTS 타일 기반 국내 무료 지도
 * - 전국 JJ Swim Lab 센터 위치 표시
 * - 주소 검색 및 센터 정보 확인
 * - 모든 사용자 접근 가능
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import StatCard from '@/components/StatCard';
import Button from '@/components/Button';

// 동적 import로 SSR 문제 방지
let L: any;

interface SwimmingCenter {
  id: string;
  name: string;
  position: { lat: number; lng: number };
  address: string;
  phone: string;
  rating: number;
  courses: string[];
  description: string;
  schedules: {
    freeSwimming: string[];
    lessons: Array<{
      course: string;
      time: string;
      price: number;
      instructor: string;
    }>;
  };
  facilities: string[];
  pricing: {
    lessons: {
      min: number;
      max: number;
    };
    dailyFreeSwimming: {
      adult: number;
      child: number;
    };
    monthlyFreeSwimming: {
      adult: number;
      child: number;
    };
  };
  poolInfo: {
    lanes: number;
    length: number; // 미터
    freeSwimmingLanes: number;
    depth: {
      shallow: number;
      deep: number;
    };
    temperature: number; // 섭씨
    capacity: number; // 수용인원
  };
  usageHistory: {
    totalUsers: number; // 총 이용인원
    peakUsers: number; // 최대 이용인원
    averageUsers: number; // 평균 이용인원
    lastUpdated: string; // 마지막 업데이트 날짜
  };
}

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const [selectedCenter, setSelectedCenter] = useState<SwimmingCenter | null>(null);
  const [searchAddress, setSearchAddress] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [leafletReady, setLeafletReady] = useState(false);
  
  // 지역 선택 (2단계)
  const [selectedSido, setSelectedSido] = useState('');
  const [selectedRegions, setSelectedRegions] = useState<Set<string>>(new Set());
  const [showDistrictSelection, setShowDistrictSelection] = useState(false);
  const [searchType, setSearchType] = useState<'address' | 'region' | 'center'>('region');
  const [filters, setFilters] = useState({
    selectedPriceTypes: [] as string[],
    selectedPrices: [] as string[],
    preferredTimes: [] as string[],
    preferredDays: [] as string[],
    includeHolidays: false,
    selectedLanes: [] as string[],
    selectedLengths: [] as string[],
    selectedCapacities: [] as string[],
    selectedUsageHistory: [] as string[]
  });

  // 시/도 목록
  const provinces = [
    '서울특별시', '부산광역시', '대구광역시', '인천광역시', '광주광역시',
    '대전광역시', '울산광역시', '세종특별자치시', '경기도', '강원도',
    '충청북도', '충청남도', '전라북도', '전라남도', '경상북도', '경상남도', '제주특별자치도'
  ];

  // 시/군/구 목록 (시/도별)
  const citiesByProvince: Record<string, string[]> = {
    '서울특별시': ['강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'],
    '경기도': ['수원시', '성남시', '고양시', '용인시', '부천시', '안산시', '안양시', '남양주시', '화성시', '평택시', '의정부시', '시흥시', '파주시', '김포시', '광명시', '광주시', '군포시', '하남시', '오산시', '양주시', '이천시', '구리시', '안성시', '포천시', '의왕시', '양평군', '여주시', '동두천시', '과천시', '가평군', '연천군'],
    '부산광역시': ['중구', '서구', '동구', '영도구', '부산진구', '동래구', '남구', '북구', '해운대구', '사하구', '금정구', '강서구', '연제구', '수영구', '사상구', '기장군'],
    '대구광역시': ['중구', '동구', '서구', '남구', '북구', '수성구', '달서구', '달성군'],
    '인천광역시': ['중구', '동구', '미추홀구', '연수구', '남동구', '부평구', '계양구', '서구', '강화군', '옹진군'],
    '광주광역시': ['동구', '서구', '남구', '북구', '광산구'],
    '대전광역시': ['동구', '중구', '서구', '유성구', '대덕구'],
    '울산광역시': ['중구', '남구', '동구', '북구', '울주군'],
    '세종특별자치시': ['세종시'],
    '강원도': ['춘천시', '원주시', '강릉시', '동해시', '태백시', '속초시', '삼척시', '홍천군', '횡성군', '영월군', '평창군', '정선군', '철원군', '화천군', '양구군', '인제군', '고성군', '양양군'],
    '충청북도': ['청주시', '충주시', '제천시', '보은군', '옥천군', '영동군', '증평군', '진천군', '괴산군', '음성군', '단양군'],
    '충청남도': ['천안시', '공주시', '보령시', '아산시', '서산시', '논산시', '계룡시', '당진시', '금산군', '부여군', '서천군', '청양군', '홍성군', '예산군', '태안군'],
    '전라북도': ['전주시', '군산시', '익산시', '정읍시', '남원시', '김제시', '완주군', '진안군', '무주군', '장수군', '임실군', '순창군', '고창군', '부안군'],
    '전라남도': ['목포시', '여수시', '순천시', '나주시', '광양시', '담양군', '곡성군', '구례군', '고흥군', '보성군', '화순군', '장흥군', '강진군', '해남군', '영암군', '무안군', '함평군', '영광군', '장성군', '완도군', '진도군', '신안군'],
    '경상북도': ['포항시', '경주시', '김천시', '안동시', '구미시', '영주시', '영천시', '상주시', '문경시', '경산시', '군위군', '의성군', '청송군', '영양군', '영덕군', '청도군', '고령군', '성주군', '칠곡군', '예천군', '봉화군', '울진군', '울릉군'],
    '경상남도': ['창원시', '진주시', '통영시', '사천시', '김해시', '밀양시', '거제시', '양산시', '의령군', '함안군', '창녕군', '고성군', '남해군', '하동군', '산청군', '함양군', '거창군', '합천군'],
    '제주특별자치도': ['제주시', '서귀포시']
  };

  // 샘플 수영 센터 데이터
  const swimmingCenters: SwimmingCenter[] = [
    {
      id: '1',
      name: 'JJ Swim Lab 강남점',
      position: { lat: 37.4979, lng: 127.0276 },
      address: '서울특별시 강남구 테헤란로 123',
      phone: '02-1234-5678',
      rating: 4.8,
      courses: ['초급 자유형', '중급 접영', '고급 평영'],
      description: '강남 지역 최고의 수영 교육 센터입니다.',
      schedules: {
        freeSwimming: ['06:00-09:00', '12:00-14:00', '18:00-22:00'],
        lessons: [
          { course: '초급 자유형', time: '09:00-10:00', price: 50000, instructor: '김수영' },
          { course: '중급 접영', time: '10:00-11:00', price: 60000, instructor: '박수영' },
          { course: '고급 평영', time: '11:00-12:00', price: 70000, instructor: '이수영' },
          { course: '초급 자유형', time: '14:00-15:00', price: 50000, instructor: '김수영' },
          { course: '중급 접영', time: '15:00-16:00', price: 60000, instructor: '박수영' }
        ]
      },
      facilities: ['25m 풀', '사우나', '락커룸', '주차장'],
      pricing: {
        lessons: { min: 50000, max: 70000 },
        dailyFreeSwimming: { adult: 15000, child: 10000 },
        monthlyFreeSwimming: { adult: 120000, child: 80000 }
      },
      poolInfo: {
        lanes: 8,
        length: 25,
        freeSwimmingLanes: 6,
        depth: { shallow: 1.2, deep: 2.0 },
        temperature: 28,
        capacity: 150
      },
      usageHistory: {
        totalUsers: 3250,
        peakUsers: 120,
        averageUsers: 65,
        lastUpdated: '2024-01-15'
      }
    },
    {
      id: '2',
      name: 'JJ Swim Lab 홍대점',
      position: { lat: 37.5563, lng: 126.9237 },
      address: '서울특별시 마포구 와우산로 123',
      phone: '02-2345-6789',
      rating: 4.6,
      courses: ['초급 자유형', '중급 접영', '고급 평영', '혼영'],
      description: '홍대 지역의 프리미엄 수영 교육 센터입니다.',
      schedules: {
        freeSwimming: ['05:30-08:30', '13:00-15:00', '19:00-22:30'],
        lessons: [
          { course: '초급 자유형', time: '08:30-09:30', price: 45000, instructor: '정수영' },
          { course: '중급 접영', time: '09:30-10:30', price: 55000, instructor: '최수영' },
          { course: '고급 평영', time: '10:30-11:30', price: 65000, instructor: '한수영' },
          { course: '혼영', time: '15:00-16:00', price: 70000, instructor: '정수영' }
        ]
      },
      facilities: ['25m 풀', '사우나', '락커룸', '주차장', '휘트니스'],
      pricing: {
        lessons: { min: 45000, max: 70000 },
        dailyFreeSwimming: { adult: 12000, child: 8000 },
        monthlyFreeSwimming: { adult: 100000, child: 70000 }
      },
      poolInfo: {
        lanes: 6,
        length: 25,
        freeSwimmingLanes: 4,
        depth: { shallow: 1.0, deep: 1.8 },
        temperature: 29,
        capacity: 100
      },
      usageHistory: {
        totalUsers: 1850,
        peakUsers: 75,
        averageUsers: 35,
        lastUpdated: '2024-01-14'
      }
    },
    {
      id: '3',
      name: 'JJ Swim Lab 잠실점',
      position: { lat: 37.5139, lng: 127.1006 },
      address: '서울특별시 송파구 올림픽로 123',
      phone: '02-3456-7890',
      rating: 4.9,
      courses: ['초급 자유형', '중급 접영', '고급 평영', '혼영', '수구'],
      description: '잠실 지역의 대형 수영 교육 센터입니다.',
      schedules: {
        freeSwimming: ['05:00-08:00', '12:00-14:00', '17:00-21:00'],
        lessons: [
          { course: '초급 자유형', time: '08:00-09:00', price: 60000, instructor: '강수영' },
          { course: '중급 접영', time: '09:00-10:00', price: 70000, instructor: '윤수영' },
          { course: '고급 평영', time: '10:00-11:00', price: 80000, instructor: '임수영' },
          { course: '혼영', time: '14:00-15:00', price: 75000, instructor: '강수영' },
          { course: '수구', time: '15:00-16:00', price: 85000, instructor: '윤수영' }
        ]
      },
      facilities: ['50m 풀', '25m 풀', '사우나', '락커룸', '주차장', '카페'],
      pricing: {
        lessons: { min: 60000, max: 85000 },
        dailyFreeSwimming: { adult: 20000, child: 15000 },
        monthlyFreeSwimming: { adult: 150000, child: 120000 }
      },
      poolInfo: {
        lanes: 10,
        length: 50,
        freeSwimmingLanes: 8,
        depth: { shallow: 1.5, deep: 2.5 },
        temperature: 26,
        capacity: 200
      },
      usageHistory: {
        totalUsers: 4200,
        peakUsers: 160,
        averageUsers: 80,
        lastUpdated: '2024-01-16'
      }
    },
    {
      id: '4',
      name: 'JJ Swim Lab 분당점',
      position: { lat: 37.3504, lng: 127.1085 },
      address: '경기도 성남시 분당구 정자로 123',
      phone: '031-4567-8901',
      rating: 4.7,
      courses: ['초급 자유형', '중급 접영', '고급 평영', '혼영'],
      description: '분당 지역의 프리미엄 수영 교육 센터입니다.',
      schedules: {
        freeSwimming: ['06:00-09:00', '13:00-15:00', '18:00-21:00'],
        lessons: [
          { course: '초급 자유형', time: '09:00-10:00', price: 40000, instructor: '조수영' },
          { course: '중급 접영', time: '10:00-11:00', price: 50000, instructor: '신수영' },
          { course: '고급 평영', time: '11:00-12:00', price: 60000, instructor: '오수영' },
          { course: '혼영', time: '15:00-16:00', price: 65000, instructor: '조수영' }
        ]
      },
      facilities: ['25m 풀', '사우나', '락커룸', '주차장'],
      pricing: {
        lessons: { min: 40000, max: 65000 },
        dailyFreeSwimming: { adult: 10000, child: 7000 },
        monthlyFreeSwimming: { adult: 80000, child: 60000 }
      },
      poolInfo: {
        lanes: 6,
        length: 25,
        freeSwimmingLanes: 5,
        depth: { shallow: 1.1, deep: 1.9 },
        temperature: 28,
        capacity: 110
      },
      usageHistory: {
        totalUsers: 1950,
        peakUsers: 85,
        averageUsers: 40,
        lastUpdated: '2024-01-13'
      }
    },
    {
      id: '5',
      name: 'JJ Swim Lab 일산점',
      position: { lat: 37.6584, lng: 126.7698 },
      address: '경기도 고양시 일산동구 중앙로 123',
      phone: '031-5678-9012',
      rating: 4.5,
      courses: ['초급 자유형', '중급 접영', '고급 평영'],
      description: '일산 지역의 친근한 수영 교육 센터입니다.',
      schedules: {
        freeSwimming: ['06:30-09:30', '12:30-14:30', '18:30-21:30'],
        lessons: [
          { course: '초급 자유형', time: '09:30-10:30', price: 35000, instructor: '백수영' },
          { course: '중급 접영', time: '10:30-11:30', price: 45000, instructor: '서수영' },
          { course: '고급 평영', time: '11:30-12:30', price: 55000, instructor: '남수영' }
        ]
      },
      facilities: ['25m 풀', '사우나', '락커룸'],
      pricing: {
        lessons: { min: 35000, max: 55000 },
        dailyFreeSwimming: { adult: 8000, child: 5000 },
        monthlyFreeSwimming: { adult: 60000, child: 40000 }
      },
      poolInfo: {
        lanes: 4,
        length: 25,
        freeSwimmingLanes: 3,
        depth: { shallow: 0.9, deep: 1.6 },
        temperature: 30,
        capacity: 80
      },
      usageHistory: {
        totalUsers: 1250,
        peakUsers: 60,
        averageUsers: 25,
        lastUpdated: '2024-01-12'
      }
    }
  ];

  // DistrictSelector 컴포넌트
  const DistrictSelector = ({ 
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
  }) => {
    const getDistrictsForSido = (sido: string): string[] => {
      const districtMap: Record<string, string[]> = {
        '서울시': ['강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'],
        '경기도': ['수원시', '성남시', '의정부시', '안양시', '부천시', '광명시', '평택시', '과천시', '오산시', '시흥시', '군포시', '의왕시', '하남시', '용인시', '파주시', '이천시', '안성시', '김포시', '화성시', '광주시', '여주시', '양평군', '고양시', '의정부시', '동두천시', '가평군', '연천군'],
        '인천시': ['중구', '동구', '미추홀구', '연수구', '남동구', '부평구', '계양구', '서구', '강화군', '옹진군'],
        '부산시': ['중구', '서구', '동구', '영도구', '부산진구', '동래구', '남구', '북구', '해운대구', '사하구', '금정구', '강서구', '연제구', '수영구', '사상구', '기장군'],
        '대구시': ['중구', '동구', '서구', '남구', '북구', '수성구', '달서구', '달성군', '군위군'],
        '광주시': ['동구', '서구', '남구', '북구', '광산구'],
        '대전시': ['동구', '중구', '서구', '유성구', '대덕구'],
        '울산시': ['중구', '남구', '동구', '북구', '울주군'],
        '세종시': ['세종시'],
        '강원도': ['춘천시', '원주시', '강릉시', '동해시', '태백시', '속초시', '삼척시', '홍천군', '횡성군', '영월군', '평창군', '정선군', '철원군', '화천군', '양구군', '인제군', '고성군', '양양군'],
        '충청북도': ['청주시', '충주시', '제천시', '보은군', '옥천군', '영동군', '증평군', '진천군', '괴산군', '음성군', '단양군'],
        '충청남도': ['천안시', '공주시', '보령시', '아산시', '서산시', '논산시', '계룡시', '당진시', '금산군', '부여군', '서천군', '청양군', '홍성군', '예산군', '태안군'],
        '전라북도': ['전주시', '군산시', '익산시', '정읍시', '남원시', '김제시', '완주군', '진안군', '무주군', '장수군', '임실군', '순창군', '고창군', '부안군'],
        '전라남도': ['목포시', '여수시', '순천시', '나주시', '광양시', '담양군', '곡성군', '구례군', '고흥군', '보성군', '화순군', '장흥군', '강진군', '해남군', '영암군', '무안군', '함평군', '영광군', '장성군', '완도군', '진도군', '신안군'],
        '경상북도': ['포항시', '경주시', '김천시', '안동시', '구미시', '영주시', '영천시', '상주시', '문경시', '경산시', '군위군', '의성군', '청송군', '영양군', '영덕군', '청도군', '고령군', '성주군', '칠곡군', '예천군', '봉화군', '울진군', '울릉군'],
        '경상남도': ['창원시', '진주시', '통영시', '사천시', '김해시', '밀양시', '거제시', '양산시', '의령군', '함안군', '창녕군', '고성군', '남해군', '하동군', '산청군', '함양군', '거창군', '합천군'],
        '제주도': ['제주시', '서귀포시']
      };
      return districtMap[sido] || [];
    };

    const districts = getDistrictsForSido(sido);

    const handleDistrictToggle = (district: string) => {
      const newRegions = new Set(selectedRegions);
      if (newRegions.has(district)) {
        newRegions.delete(district);
      } else {
        newRegions.add(district);
      }
      setSelectedRegions(newRegions);
    };

    const handleSelectAll = () => {
      if (selectedRegions.size === districts.length) {
        setSelectedRegions(new Set());
      } else {
        setSelectedRegions(new Set(districts));
    }
  };

  return (
      <div className="border border-gray-200 rounded p-3 bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedRegions.size === districts.length && districts.length > 0}
              onChange={handleSelectAll}
              className="rounded w-4 h-4"
            />
            <span className="font-medium text-gray-700">전체 선택</span>
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
          {districts.map((district) => (
            <label key={district} className="flex items-center">
              <input
                type="checkbox"
                checked={selectedRegions.has(district)}
                onChange={() => handleDistrictToggle(district)}
                className="mr-2"
              />
              <span className="text-sm">{district}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  // 요일 목록
  const weekDays = [
    { value: 'monday', label: '월요일' },
    { value: 'tuesday', label: '화요일' },
    { value: 'wednesday', label: '수요일' },
    { value: 'thursday', label: '목요일' },
    { value: 'friday', label: '금요일' },
    { value: 'saturday', label: '토요일' },
    { value: 'sunday', label: '일요일' }
  ];

  // 시간대 목록
  const timeSlots = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
    '20:00', '21:00', '22:00'
  ];

  // 지역별 센터 매핑
  const regionCenters: Record<string, string[]> = {
    '전국': ['JJ Swim Lab 강남점', 'JJ Swim Lab 홍대점', 'JJ Swim Lab 송파점', 'JJ Swim Lab 마포점', 'JJ Swim Lab 일산점'],
    '서울시': ['JJ Swim Lab 강남점', 'JJ Swim Lab 홍대점', 'JJ Swim Lab 송파점', 'JJ Swim Lab 마포점'],
    '강남구': ['JJ Swim Lab 강남점'],
    '마포구': ['JJ Swim Lab 홍대점', 'JJ Swim Lab 마포점'],
    '송파구': ['JJ Swim Lab 송파점'],
    '경기도': ['JJ Swim Lab 일산점'],
    '고양시': ['JJ Swim Lab 일산점'],
  };

  // 필터링된 센터 목록
  const filteredCenters = swimmingCenters.filter(center => {
    // 지역 필터
    if (selectedRegions.size > 0) {
      const selectedRegionList = Array.from(selectedRegions);
      const centerInSelectedRegions = selectedRegionList.some(region => {
        const centersInRegion = regionCenters[region] || [];
        return centersInRegion.includes(center.name);
      });
      if (!centerInSelectedRegions) return false;
    }
    
    // 가격 유형 필터
    if (filters.selectedPriceTypes.length > 0) {
      const hasMatchingPriceType = filters.selectedPriceTypes.some(priceType => {
        if (priceType === 'lessons') {
          return center.pricing.lessons.min <= parseInt(filters.selectedPrices.find(p => p.startsWith('lessons_'))?.split('_')[1] || '999999');
        } else if (priceType === 'dailyFreeSwimming') {
          return center.pricing.dailyFreeSwimming.adult <= parseInt(filters.selectedPrices.find(p => p.startsWith('dailyFreeSwimming_'))?.split('_')[1] || '999999');
        } else if (priceType === 'monthlyFreeSwimming') {
          return center.pricing.monthlyFreeSwimming.adult <= parseInt(filters.selectedPrices.find(p => p.startsWith('monthlyFreeSwimming_'))?.split('_')[1] || '999999');
        }
        return false;
      });
      if (!hasMatchingPriceType) return false;
    }
    
    // 레인 수 필터
    if (filters.selectedLanes.length > 0) {
      const hasMatchingLanes = filters.selectedLanes.some(laneStr => {
        const minLanes = parseInt(laneStr);
        return center.poolInfo.lanes >= minLanes;
      });
      if (!hasMatchingLanes) return false;
    }
    
    // 수영장 거리 필터
    if (filters.selectedLengths.length > 0) {
      const hasMatchingLength = filters.selectedLengths.some(lengthStr => {
        const minLength = parseInt(lengthStr);
        return center.poolInfo.length >= minLength;
      });
      if (!hasMatchingLength) return false;
    }
    
    // 시간대 필터 (선택된 시간대 중 하나라도 해당하는지 확인)
    if (filters.preferredTimes.length > 0) {
      const hasMatchingTime = filters.preferredTimes.some(time => {
        const hasFreeSwimming = center.schedules.freeSwimming.some(freeTime => 
          freeTime.includes(time.substring(0, 2))
        );
        const hasLesson = center.schedules.lessons.some(lesson => 
          lesson.time.includes(time)
        );
        return hasFreeSwimming || hasLesson;
      });
      if (!hasMatchingTime) return false;
    }
    
    // 수용인원 필터
    if (filters.selectedCapacities.length > 0) {
      const hasMatchingCapacity = filters.selectedCapacities.some(capacityStr => {
        const minCapacity = parseInt(capacityStr);
        return center.poolInfo.capacity >= minCapacity;
      });
      if (!hasMatchingCapacity) return false;
    }
    
    // 이용인원 필터 (과거 이용인원 기준)
    if (filters.selectedUsageHistory.length > 0) {
      const hasMatchingUsage = filters.selectedUsageHistory.some(usageType => {
        if (usageType === 'high') {
          return center.usageHistory.averageUsers >= 70;
        } else if (usageType === 'medium') {
          return center.usageHistory.averageUsers >= 40 && center.usageHistory.averageUsers < 70;
        } else if (usageType === 'low') {
          return center.usageHistory.averageUsers < 40;
        }
        return false;
      });
      if (!hasMatchingUsage) return false;
    }
    
    return true;
  });

  // Leaflet 라이브러리 로딩
  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        // Leaflet 동적 로딩
        if (typeof window !== 'undefined') {
          L = (await import('leaflet')).default;

          // Leaflet CSS 로딩
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);

          console.log('✅ Leaflet 라이브러리 로딩 완료');
          
          // Leaflet 로딩 완료 상태 설정
          setLeafletReady(true);
        }
      } catch (error) {
        console.error('❌ Leaflet 로딩 오류:', error);
      }
    };

    loadLeaflet();
  }, []);

  // 지도 초기화
  useEffect(() => {
    console.log('🔍 지도 초기화 useEffect 실행:', { 
      hasMapRef: !!mapRef.current, 
      hasL: !!L,
      leafletReady,
      hasMapInstance: !!mapInstanceRef.current 
    });

    if (!mapRef.current) {
      console.log('⚠️ mapRef.current 없음');
      return;
    }
    
    if (!L) {
      console.log('⚠️ Leaflet 라이브러리 없음');
      return;
    }

    if (!leafletReady) {
      console.log('⚠️ Leaflet 준비 안됨');
      return;
    }
    
    // 이미 초기화되었으면 스킵
    if (mapInstanceRef.current) {
      console.log('⚠️ 지도가 이미 초기화되어 있습니다');
      return;
    }

    const VWORLD_KEY = process.env.NEXT_PUBLIC_VWORLD_KEY || 'demo_key';

    console.log('🔑 VWorld 키 확인:', VWORLD_KEY);
    console.log('📍 지도 초기화 시작...');

    // 지도 생성
    const map = L.map(mapRef.current).setView([37.5665, 126.9780], 11);

    // 타일 레이어 추가
    // VWorld 키가 유효하면 VWorld, 아니면 OSM 사용
    let tileLayer;
    
    if (VWORLD_KEY && VWORLD_KEY !== 'demo_key') {
      console.log('🗺️ VWorld 타일 시도 중...');
      
      // VWorld Base Map (XYZ 타일 형식)
      tileLayer = L.tileLayer(
        `https://api.vworld.kr/req/wmts/1.0.0/${VWORLD_KEY}/Base/{z}/{y}/{x}.png`,
        {
          attribution: '© VWorld / NGII',
          maxZoom: 18,
          minZoom: 6
        }
      );

      let tileErrorCount = 0;
      tileLayer.on('tileerror', (error: any) => {
        tileErrorCount++;
        if (tileErrorCount === 1) {
          console.error('❌ VWorld 타일 로딩 실패');
          console.log('🔑 키:', VWORLD_KEY);
          console.log('📍 타일 URL:', error.tile?.src);
          console.log('⚠️ OSM 타일로 대체합니다...');
          
          // VWorld 레이어 제거하고 OSM으로 교체
          map.removeLayer(tileLayer);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
          }).addTo(map);
        }
      });

      tileLayer.on('tileload', () => {
        if (tileErrorCount === 0) {
          console.log('✅ VWorld 타일 로딩 성공');
        }
      });
    } else {
      console.log('🗺️ VWorld 키가 없어 OSM 타일 사용');
      tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      });
    }

    tileLayer.addTo(map);

    mapInstanceRef.current = map;
    setMapReady(true);

    console.log('🗺️ VWorld + Leaflet 지도 초기화 완료');

    // 센터 마커 추가
    swimmingCenters.forEach(center => {
      // 커스텀 아이콘
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            width: 40px;
            height: 40px;
            background-color: #3b82f6;
            border: 3px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            cursor: pointer;
          ">
            🏊
                </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      // 마커 생성
      const marker = L.marker([center.position.lat, center.position.lng], {
        icon: customIcon
      }).addTo(map);

      // 팝업 추가
      marker.bindPopup(`
        <div style="padding: 12px; min-width: 250px;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #1f2937;">
                          ${center.name}
                        </h3>
          <p style="margin: 0 0 6px 0; font-size: 13px; color: #6b7280;">
                          ${center.address}
                        </p>
          <p style="margin: 0 0 6px 0; font-size: 13px; color: #6b7280;">
                          📞 ${center.phone}
                        </p>
          <div style="margin: 0 0 6px 0;">
                          <span style="color: #f59e0b; font-weight: bold;">⭐ ${center.rating}</span>
                        </div>
          <p style="margin: 0; font-size: 12px; color: #374151;">
                          ${center.description}
                        </p>
                      </div>
      `);

      // 마커 클릭 이벤트
      marker.on('click', () => {
        setSelectedCenter(center);
      });

      markersRef.current.push(marker);
    });

    // 정리 함수
    return () => {
      if (map) {
        console.log('🗑️ 지도 정리 중...');
        map.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [leafletReady]);

  // 주소 검색
  const handleSearch = async (addressToSearch?: string) => {
    const targetAddress = addressToSearch || searchAddress;
    
    if (!targetAddress.trim()) {
      alert('주소를 입력하세요.');
      return;
    }

    setSearchLoading(true);
    try {
      const key = process.env.NEXT_PUBLIC_VWORLD_KEY;

      const url = new URL('https://api.vworld.kr/req/address');
      url.searchParams.set('service', 'address');
      url.searchParams.set('request', 'getCoord');
      url.searchParams.set('version', '2.0');
      url.searchParams.set('crs', 'EPSG:4326');
      url.searchParams.set('type', 'ROAD');
      url.searchParams.set('format', 'json');
      url.searchParams.set('key', key!);
      url.searchParams.set('address', targetAddress);

      const response = await fetch(url.toString());
      const data = await response.json();

      const point = data?.response?.result?.point;

      if (!point) {
        alert('주소를 찾을 수 없습니다. 다시 시도해주세요.');
        return;
      }

      const lng = Number(point.x);
      const lat = Number(point.y);

      // 지도 이동
      if (mapInstanceRef.current && L) {
        mapInstanceRef.current.flyTo([lat, lng], 15, {
          duration: 1.5
        });

        // 검색 위치에 임시 마커 추가
        const searchIcon = L.divIcon({
          className: 'search-marker',
          html: `
            <div style="
              width: 30px;
              height: 30px;
              background-color: #ef4444;
              border: 2px solid white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 16px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            ">
              📍
            </div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });

        const searchMarker = L.marker([lat, lng], { icon: searchIcon })
          .addTo(mapInstanceRef.current)
          .bindPopup(`
            <div style="padding: 10px;">
              <strong>검색 위치</strong><br/>
              ${targetAddress}
            </div>
          `)
          .openPopup();

        // 5초 후 제거
        setTimeout(() => {
          mapInstanceRef.current?.removeLayer(searchMarker);
        }, 5000);
      }

      console.log(`✅ 주소 검색 성공: ${targetAddress} → (${lng}, ${lat})`);
    } catch (error) {
      console.error('❌ 주소 검색 오류:', error);
      alert('주소 검색 중 오류가 발생했습니다.');
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-2 sm:px-4 lg:px-6 py-4 pt-20">
        {/* 헤더 */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">🗺️ 수영 센터 찾기</h1>
          <p className="text-sm text-gray-600">가까운 JJ Swim Lab 센터를 찾아보세요 (VWorld 무료 지도)</p>
        </div>


        {/* 검색 및 필터 패널 */}
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h3 className="text-base font-semibold text-gray-900 mb-3">🔍 센터 검색 및 필터</h3>
          
          {/* 검색 타입 선택 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">검색 방식</label>
            <div className="flex gap-2">
              <Button
                onClick={() => setSearchType('center')}
                variant={searchType === 'center' ? 'primary' : 'outline'}
                size="md"
                className="flex-1"
              >
                🏊 센터명 검색
              </Button>
              <Button
                onClick={() => setSearchType('region')}
                variant={searchType === 'region' ? 'primary' : 'outline'}
                size="md"
                className="flex-1"
              >
                📍 지역 선택
              </Button>
              <Button
                onClick={() => setSearchType('address')}
                variant={searchType === 'address' ? 'primary' : 'outline'}
                size="md"
                className="flex-1"
              >
                🔍 주소 검색
              </Button>
            </div>
          </div>

          {/* 센터명 검색 */}
          {searchType === 'center' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">센터명 입력</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="예: JJ Swim Lab 강남점"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button
                  onClick={() => alert('센터 검색 기능은 준비 중입니다.')}
                  variant="primary"
                  size="md"
                >
                  🔍 검색
                </Button>
              </div>
            </div>
          )}

          {/* 지역 선택 */}
          {searchType === 'region' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">지역 선택</label>
              {/* 1단계: 시/도 선택 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-2">시/도 선택:</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {[
                    { id: '전국', name: '🌏 전국' },
                    { id: '서울특별시', name: '🏙️ 서울시' },
                    { id: '경기도', name: '🌳 경기도' },
                    { id: '인천광역시', name: '🌊 인천시' },
                    { id: '부산광역시', name: '🌊 부산시' },
                    { id: '대구광역시', name: '🏔️ 대구시' },
                    { id: '광주광역시', name: '🌅 광주시' },
                    { id: '대전광역시', name: '🔬 대전시' },
                    { id: '울산광역시', name: '🏭 울산시' },
                    { id: '세종특별자치시', name: '🏛️ 세종시' },
                    { id: '강원도', name: '⛰️ 강원도' },
                    { id: '충청북도', name: '🌲 충청북도' },
                    { id: '충청남도', name: '🌾 충청남도' },
                    { id: '전라북도', name: '🌾 전라북도' },
                    { id: '전라남도', name: '🌊 전라남도' },
                    { id: '경상북도', name: '🏔️ 경상북도' },
                    { id: '경상남도', name: '🌊 경상남도' },
                    { id: '제주특별자치도', name: '🏝️ 제주도' }
                  ].map((sido) => (
                    <Button
                      key={sido.id}
                      onClick={() => {
                        if (sido.id === '전국') {
                          setSelectedRegions(new Set(['전국']));
                          setSelectedSido('');
                          setShowDistrictSelection(false);
                        } else {
                          setSelectedSido(sido.id);
                          setShowDistrictSelection(true);
                          setSelectedRegions(new Set());
                        }
                      }}
                      variant={selectedSido === sido.id || (sido.id === '전국' && selectedRegions.has('전국')) ? 'primary' : 'outline'}
                      size="sm"
                      className="text-xs"
                    >
                      {sido.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* 2단계: 구/군 선택 */}
              {showDistrictSelection && selectedSido && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700">{selectedSido} 구/군 선택:</h4>
                    <Button
                      onClick={() => {
                        setShowDistrictSelection(false);
                        setSelectedSido('');
                      }}
                      variant="ghost"
                      size="sm"
                    >
                      ✕ 닫기
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {citiesByProvince[selectedSido]?.map((city) => (
                      <Button
                        key={city}
                        onClick={() => {
                          const newRegions = new Set(selectedRegions);
                          if (newRegions.has(city)) {
                            newRegions.delete(city);
                          } else {
                            newRegions.add(city);
                          }
                          setSelectedRegions(newRegions);
                        }}
                        variant={selectedRegions.has(city) ? 'primary' : 'outline'}
                        size="sm"
                        className="text-xs"
                      >
                        {city}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* 선택된 지역 표시 */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  선택된 지역 ({selectedRegions.size}개):
                </h4>
                {selectedRegions.size === 0 ? (
                  <div className="text-gray-500 text-sm">
                    지역을 선택해주세요
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {Array.from(selectedRegions).map((region) => (
                      <span
                        key={region}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {region}
                        <button
                          onClick={() => {
                            const newRegions = new Set(selectedRegions);
                            newRegions.delete(region);
                            setSelectedRegions(newRegions);
                            if (newRegions.size === 0) {
                              setSelectedSido('');
                              setShowDistrictSelection(false);
                            }
                          }}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 주소 검색 */}
          {searchType === 'address' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">주소 입력</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="예: 서울특별시 강남구 테헤란로 123"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button
                  onClick={() => handleSearch()}
                  disabled={searchLoading || !mapReady}
                  variant="primary"
                  size="md"
                >
                  {searchLoading ? '검색 중...' : '🔍 검색'}
                </Button>
              </div>
            </div>
          )}

          {/* 선택된 옵션들 표시 박스 */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">📋 선택된 옵션들</h4>
            
            <div className="space-y-3">
              {/* 지역 */}
              {selectedRegions.size > 0 && (
                <div>
                  <span className="text-xs font-medium text-gray-600">📍 지역:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {Array.from(selectedRegions).map((region) => (
                      <span
                        key={region}
                        className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
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
                </div>
              )}


              {/* 가격 유형 */}
              {filters.selectedPriceTypes.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-gray-600">💰 가격 유형:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {filters.selectedPriceTypes.map((priceType) => (
                      <span
                        key={priceType}
                        className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                      >
                        {priceType === 'lessons' ? '강습' : priceType === 'dailyFreeSwimming' ? '일일 자유수영' : '월 자유수영'}
                        <button
                          onClick={() => {
                            setFilters({...filters, selectedPriceTypes: filters.selectedPriceTypes.filter(p => p !== priceType)});
                          }}
                          className="ml-1 text-purple-600 hover:text-purple-800"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 시간대 */}
              {filters.preferredTimes.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-gray-600">⏰ 시간대:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {filters.preferredTimes.map((time) => (
                      <span
                        key={time}
                        className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full"
                      >
                        {time}
                        <button
                          onClick={() => {
                            setFilters({...filters, preferredTimes: filters.preferredTimes.filter(t => t !== time)});
                          }}
                          className="ml-1 text-orange-600 hover:text-orange-800"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 요일 */}
              {filters.preferredDays.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-gray-600">📅 요일:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {filters.preferredDays.map((day) => (
                      <span
                        key={day}
                        className="inline-flex items-center px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full"
                      >
                        {weekDays.find(wd => wd.value === day)?.label}
                        <button
                          onClick={() => {
                            setFilters({...filters, preferredDays: filters.preferredDays.filter(d => d !== day)});
                          }}
                          className="ml-1 text-indigo-600 hover:text-indigo-800"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                    {filters.includeHolidays && (
                      <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                        공휴일 포함
                        <button
                          onClick={() => {
                            setFilters({...filters, includeHolidays: false});
                          }}
                          className="ml-1 text-red-600 hover:text-red-800"
                        >
                          ✕
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* 레인 수 */}
              {filters.selectedLanes.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-gray-600">🏊‍♂️ 레인 수:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {filters.selectedLanes.map((lane) => (
                      <span
                        key={lane}
                        className="inline-flex items-center px-2 py-1 bg-cyan-100 text-cyan-800 text-xs rounded-full"
                      >
                        {lane}레인 이상
                        <button
                          onClick={() => {
                            setFilters({...filters, selectedLanes: filters.selectedLanes.filter(l => l !== lane)});
                          }}
                          className="ml-1 text-cyan-600 hover:text-cyan-800"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 수영장 거리 */}
              {filters.selectedLengths.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-gray-600">📏 수영장 거리:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {filters.selectedLengths.map((length) => (
                      <span
                        key={length}
                        className="inline-flex items-center px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded-full"
                      >
                        {length}m 이상
                        <button
                          onClick={() => {
                            setFilters({...filters, selectedLengths: filters.selectedLengths.filter(l => l !== length)});
                          }}
                          className="ml-1 text-teal-600 hover:text-teal-800"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 수용인원 */}
              {filters.selectedCapacities.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-gray-600">👥 수용인원:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {filters.selectedCapacities.map((capacity) => (
                      <span
                        key={capacity}
                        className="inline-flex items-center px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full"
                      >
                        {capacity}명 이상
                        <button
                          onClick={() => {
                            setFilters({...filters, selectedCapacities: filters.selectedCapacities.filter(c => c !== capacity)});
                          }}
                          className="ml-1 text-emerald-600 hover:text-emerald-800"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 과거 이용인원 */}
              {filters.selectedUsageHistory.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-gray-600">📊 과거 이용인원:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {filters.selectedUsageHistory.map((usage) => (
                      <span
                        key={usage}
                        className="inline-flex items-center px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full"
                      >
                        {usage === 'high' ? '높음 (70명 이상)' : usage === 'medium' ? '보통 (40-69명)' : '낮음 (40명 미만)'}
                        <button
                          onClick={() => {
                            setFilters({...filters, selectedUsageHistory: filters.selectedUsageHistory.filter(u => u !== usage)});
                          }}
                          className="ml-1 text-amber-600 hover:text-amber-800"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 선택된 옵션이 없을 때 */}
              {selectedRegions.size === 0 && 
               filters.selectedPriceTypes.length === 0 && 
               filters.preferredTimes.length === 0 && 
               filters.preferredDays.length === 0 && 
               filters.selectedLanes.length === 0 && 
               filters.selectedLengths.length === 0 && 
               filters.selectedCapacities.length === 0 && 
               filters.selectedUsageHistory.length === 0 && (
                <div className="text-gray-500 text-sm">선택된 옵션이 없습니다. 아래에서 옵션을 선택해주세요.</div>
              )}
            </div>
          </div>

          {/* 필터 옵션들 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* 가격 유형 (다중 선택) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">💰 가격 유형</label>
              <div className="border border-gray-300 rounded-lg p-2">
                {[
                  { value: 'lessons', label: '강습' },
                  { value: 'dailyFreeSwimming', label: '일일 자유수영' },
                  { value: 'monthlyFreeSwimming', label: '월 자유수영' }
                ].map(priceType => (
                  <label key={priceType.value} className="flex items-center mb-1">
                    <input
                      type="checkbox"
                      checked={filters.selectedPriceTypes.includes(priceType.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters({...filters, selectedPriceTypes: [...filters.selectedPriceTypes, priceType.value]});
                        } else {
                          setFilters({...filters, selectedPriceTypes: filters.selectedPriceTypes.filter(p => p !== priceType.value)});
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{priceType.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 선호 시간대 (다중 선택) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">⏰ 선호 시간대</label>
              <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2">
                {timeSlots.map(time => (
                  <label key={time} className="flex items-center mb-1">
                    <input
                      type="checkbox"
                      checked={filters.preferredTimes.includes(time)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters({...filters, preferredTimes: [...filters.preferredTimes, time]});
                        } else {
                          setFilters({...filters, preferredTimes: filters.preferredTimes.filter(t => t !== time)});
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{time}</span>
                  </label>
                ))}
              </div>
          </div>

            {/* 선호 요일 (다중 선택) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">📅 선호 요일</label>
              <div className="border border-gray-300 rounded-lg p-2">
                {weekDays.map(day => (
                  <label key={day.value} className="flex items-center mb-1">
                    <input
                      type="checkbox"
                      checked={filters.preferredDays.includes(day.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters({...filters, preferredDays: [...filters.preferredDays, day.value]});
                        } else {
                          setFilters({...filters, preferredDays: filters.preferredDays.filter(d => d !== day.value)});
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{day.label}</span>
                  </label>
                ))}
                <label className="flex items-center mt-2 pt-2 border-t border-gray-200">
                  <input
                    type="checkbox"
                    checked={filters.includeHolidays}
                    onChange={(e) => setFilters({...filters, includeHolidays: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm text-red-600">공휴일 포함</span>
                </label>
            </div>
          </div>

            {/* 레인 수 (다중 선택) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">🏊‍♂️ 레인 수</label>
              <div className="border border-gray-300 rounded-lg p-2">
                {['4', '6', '8', '10', '12'].map(lane => (
                  <label key={lane} className="flex items-center mb-1">
                    <input
                      type="checkbox"
                      checked={filters.selectedLanes.includes(lane)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters({...filters, selectedLanes: [...filters.selectedLanes, lane]});
                        } else {
                          setFilters({...filters, selectedLanes: filters.selectedLanes.filter(l => l !== lane)});
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{lane}레인 이상</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 수영장 거리 (다중 선택) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">📏 수영장 거리</label>
              <div className="border border-gray-300 rounded-lg p-2">
                {[
                  { value: '25', label: '25m' },
                  { value: '50', label: '50m' }
                ].map(length => (
                  <label key={length.value} className="flex items-center mb-1">
                    <input
                      type="checkbox"
                      checked={filters.selectedLengths.includes(length.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters({...filters, selectedLengths: [...filters.selectedLengths, length.value]});
                        } else {
                          setFilters({...filters, selectedLengths: filters.selectedLengths.filter(l => l !== length.value)});
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{length.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 수용인원 (다중 선택) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">👥 수용인원</label>
              <div className="border border-gray-300 rounded-lg p-2">
                {[
                  { value: '80', label: '80명 이상' },
                  { value: '100', label: '100명 이상' },
                  { value: '120', label: '120명 이상' },
                  { value: '150', label: '150명 이상' },
                  { value: '200', label: '200명 이상' }
                ].map(capacity => (
                  <label key={capacity.value} className="flex items-center mb-1">
                    <input
                      type="checkbox"
                      checked={filters.selectedCapacities.includes(capacity.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters({...filters, selectedCapacities: [...filters.selectedCapacities, capacity.value]});
                        } else {
                          setFilters({...filters, selectedCapacities: filters.selectedCapacities.filter(c => c !== capacity.value)});
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{capacity.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 과거 이용인원 (다중 선택) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">📊 과거 이용인원</label>
              <div className="border border-gray-300 rounded-lg p-2">
                {[
                  { value: 'low', label: '낮음 (40명 미만)' },
                  { value: 'medium', label: '보통 (40-69명)' },
                  { value: 'high', label: '높음 (70명 이상)' }
                ].map(usage => (
                  <label key={usage.value} className="flex items-center mb-1">
                    <input
                      type="checkbox"
                      checked={filters.selectedUsageHistory.includes(usage.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters({...filters, selectedUsageHistory: [...filters.selectedUsageHistory, usage.value]});
                        } else {
                          setFilters({...filters, selectedUsageHistory: filters.selectedUsageHistory.filter(u => u !== usage.value)});
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{usage.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* 센터명 검색 */}
          {searchType === 'center' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">센터 선택</label>
              <select
                onChange={(e) => {
                  const center = filteredCenters.find(c => c.id === e.target.value);
                  if (center && mapInstanceRef.current) {
                    setSelectedCenter(center);
                    mapInstanceRef.current.flyTo([center.position.lat, center.position.lng], 15, { duration: 1.5 });
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">센터를 선택하세요</option>
                {filteredCenters.map(center => (
                  <option key={center.id} value={center.id}>
                    {center.name} - {center.address}
                  </option>
                ))}
              </select>
            </div>
          )}

        </div>

        {/* 지도 및 사이드바 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 지도 */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-2">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">지도</h3>
                <div className="text-sm text-gray-500">
                  VWorld 배경 지도
                </div>
              </div>
              
              <div
                ref={mapRef}
                className="w-full rounded-lg border border-gray-200"
                style={{ height: '80vh', minHeight: '600px' }}
              />
            </div>
          </div>

          {/* 사이드바 */}
          <div className="space-y-4">
            {/* 선택된 센터 정보 */}
            {selectedCenter && (
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-base font-semibold text-gray-900 mb-3">선택된 센터</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg">{selectedCenter.name}</h4>
                    <p className="text-gray-600 text-sm">{selectedCenter.address}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-500 text-lg">⭐</span>
                    <span className="font-semibold text-gray-900">{selectedCenter.rating}</span>
                    <span className="text-gray-500 text-sm">/ 5.0</span>
                  </div>
                  
                  <div>
                    <p className="text-gray-600 text-sm mb-2">📞 {selectedCenter.phone}</p>
                    <p className="text-gray-700 text-sm">{selectedCenter.description}</p>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-2">개설 과정</h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedCenter.courses.map((course, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {course}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-2">💰 가격 정보</h5>
                    <div className="text-sm text-gray-600 space-y-1 mb-4">
                      <div className="bg-blue-50 p-2 rounded-lg">
                        <div className="font-medium text-blue-800">🏊‍♂️ 강습</div>
                        <div>{selectedCenter.pricing.lessons.min.toLocaleString()}원 ~ {selectedCenter.pricing.lessons.max.toLocaleString()}원</div>
                      </div>
                      <div className="bg-green-50 p-2 rounded-lg">
                        <div className="font-medium text-green-800">🏊‍♀️ 일일 자유수영</div>
                        <div>성인: {selectedCenter.pricing.dailyFreeSwimming.adult.toLocaleString()}원 | 아동: {selectedCenter.pricing.dailyFreeSwimming.child.toLocaleString()}원</div>
                      </div>
                      <div className="bg-purple-50 p-2 rounded-lg">
                        <div className="font-medium text-purple-800">📅 월 자유수영</div>
                        <div>성인: {selectedCenter.pricing.monthlyFreeSwimming.adult.toLocaleString()}원 | 아동: {selectedCenter.pricing.monthlyFreeSwimming.child.toLocaleString()}원</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold text-gray-900 mb-2">🏊‍♂️ 수영장 정보</h5>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-blue-600 font-medium">총 레인 수</div>
                        <div className="text-gray-900 font-bold text-lg">{selectedCenter.poolInfo.lanes}레인</div>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="text-green-600 font-medium">수영장 거리</div>
                        <div className="text-gray-900 font-bold text-lg">{selectedCenter.poolInfo.length}m</div>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <div className="text-purple-600 font-medium">자유수영 레인</div>
                        <div className="text-gray-900 font-bold text-lg">{selectedCenter.poolInfo.freeSwimmingLanes}레인</div>
                      </div>
                      <div className="bg-orange-50 p-3 rounded-lg">
                        <div className="text-orange-600 font-medium">수온</div>
                        <div className="text-gray-900 font-bold text-lg">{selectedCenter.poolInfo.temperature}°C</div>
                      </div>
                      <div className="bg-indigo-50 p-3 rounded-lg">
                        <div className="text-indigo-600 font-medium">수심 (얕은 곳)</div>
                        <div className="text-gray-900 font-bold text-lg">{selectedCenter.poolInfo.depth.shallow}m</div>
                      </div>
                      <div className="bg-red-50 p-3 rounded-lg">
                        <div className="text-red-600 font-medium">수심 (깊은 곳)</div>
                        <div className="text-gray-900 font-bold text-lg">{selectedCenter.poolInfo.depth.deep}m</div>
                      </div>
                      <div className="bg-emerald-50 p-3 rounded-lg">
                        <div className="text-emerald-600 font-medium">수용인원</div>
                        <div className="text-gray-900 font-bold text-lg">{selectedCenter.poolInfo.capacity}명</div>
                      </div>
                    </div>

                    <h5 className="font-semibold text-gray-900 mb-2 mt-4">📊 이용 현황</h5>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-amber-50 p-3 rounded-lg">
                        <div className="text-amber-600 font-medium">총 이용인원</div>
                        <div className="text-gray-900 font-bold text-lg">{selectedCenter.usageHistory.totalUsers.toLocaleString()}명</div>
                      </div>
                      <div className="bg-red-50 p-3 rounded-lg">
                        <div className="text-red-600 font-medium">최대 이용인원</div>
                        <div className="text-gray-900 font-bold text-lg">{selectedCenter.usageHistory.peakUsers}명</div>
                      </div>
                      <div className="bg-indigo-50 p-3 rounded-lg">
                        <div className="text-indigo-600 font-medium">평균 이용인원</div>
                        <div className="text-gray-900 font-bold text-lg">{selectedCenter.usageHistory.averageUsers}명</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-gray-600 font-medium">마지막 업데이트</div>
                        <div className="text-gray-900 font-bold text-sm">{selectedCenter.usageHistory.lastUpdated}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold text-gray-900 mb-2">🕐 자유수영 시간</h5>
                    <div className="space-y-1">
                      {selectedCenter.schedules.freeSwimming.map((time, index) => (
                        <div key={index} className="bg-green-50 px-3 py-2 rounded-lg text-sm">
                          <span className="text-green-700 font-medium">{time}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold text-gray-900 mb-2">📚 강습 시간표</h5>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedCenter.schedules.lessons.map((lesson, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg text-sm">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium text-gray-900">{lesson.course}</div>
                              <div className="text-gray-600">👨‍🏫 {lesson.instructor}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-gray-900 font-medium">{lesson.time}</div>
                              <div className="text-blue-600 font-bold">{lesson.price.toLocaleString()}원</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold text-gray-900 mb-2">🏢 시설</h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedCenter.facilities.map((facility, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {facility}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => {
                      if (mapInstanceRef.current) {
                        mapInstanceRef.current.flyTo(
                          [selectedCenter.position.lat, selectedCenter.position.lng],
                          15,
                          { duration: 1.5 }
                        );
                      }
                    }}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    지도에서 보기
                  </button>
                </div>
              </div>
            )}

            {/* 필터링된 센터 목록 */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-base font-semibold text-gray-900 mb-3">
                📊 검색된 센터 ({filteredCenters.length}개)
              </h3>
              <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
                {filteredCenters.map((center) => (
                  <div 
                    key={center.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedCenter?.id === center.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setSelectedCenter(center);
                      if (mapInstanceRef.current) {
                        mapInstanceRef.current.flyTo(
                          [center.position.lat, center.position.lng],
                          15,
                          { duration: 1 }
                        );
                      }
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">
                          {center.name}
                        </h4>
                        <p className="text-gray-600 text-xs mb-2">{center.address}</p>
                        <div className="flex items-center space-x-2">
                          <span className="text-yellow-500 text-sm">⭐</span>
                          <span className="text-gray-700 text-xs font-semibold">{center.rating}</span>
                          <span className="text-gray-500 text-xs">/ 5.0</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500 mb-1">
                          {center.courses.length}개 과정
                        </div>
                        <div className="text-xs text-blue-600 font-semibold">
                          {center.courses[0]}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 지도 사용법 */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-base font-semibold text-gray-900 mb-3">지도 사용법</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <span className="text-blue-600">🗺️</span>
                  <span>VWorld 국내 무료 지도 서비스</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">📍</span>
                  <span>마커를 클릭하여 센터 정보 확인</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-purple-600">🔍</span>
                  <span>주소 검색으로 원하는 지역 찾기</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-orange-600">🏊</span>
                  <span>마우스 드래그로 지도 이동</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-red-600">🔎</span>
                  <span>마우스 휠로 확대/축소</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
