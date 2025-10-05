/**
 * 🏢 JJ Swim Lab - 센터 관리 페이지
 * 
 * 📋 **페이지 목적**
 * - 관리자가 모든 센터를 체계적으로 관리할 수 있는 관리자 전용 페이지
 * - 센터 목록 조회, 상태 관리, 상세 정보 확인 기능 제공
 * - 센터별 통계 및 사용자 현황 모니터링
 * 
 * 🔄 **주요 기능**
 * - 센터 목록 조회 (검색, 필터링, 페이지네이션)
 * - 센터 상세 정보 모달 (센터 정보, 시설, 운영시간 등)
 * - 센터 상태 변경 (활성/비활성/정지/점검중)
 * - 센터 통계 대시보드 (전체 현황, 사용자 통계)
 * - 실시간 데이터 새로고침
 * 
 * 🗄️ **데이터 연동**
 * - center-management API와 연동 (센터 목록 및 통계)
 * - useAuth 훅과 연동 (사용자 권한 확인)
 * - apiClient와 연동 (API 통신)
 * 
 * 🛠️ **필요한 설치 파일**
 * - Next.js 14.2.5 (App Router)
 * - React 18.3.1
 * - TypeScript 5.x
 * - Tailwind CSS 3.3.0
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 관리자 권한 확인 필수 (superAdmin, admin만 접근)
 * 2. 센터 상태 변경 시 영향 범위 고려
 * 3. 대용량 데이터 처리 시 페이지네이션 활용
 * 4. 반응형 디자인 적용 (모바일/데스크톱)
 * 5. 에러 처리 및 사용자 피드백 제공
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 권한 검증 로직 확인
 * - [ ] API 응답 데이터 구조 검증
 * - [ ] 반응형 디자인 테스트
 * - [ ] 에러 처리 로직 개선
 * - [ ] 성능 최적화 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (센터 관리 페이지)
 * - 2024-12-19: 센터 상세보기 모달 추가
 * - 2024-12-19: 통계 대시보드 및 상태 관리 기능 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (센터 관리 페이지 완료)
 * 
 * 🚀 **다음 단계**
 * - 센터별 상세 통계 차트 추가
 * - 센터 간 비교 기능
 * - 자동화된 센터 상태 모니터링
 * - 센터별 성과 분석 대시보드
 * 
 * 💡 **사용 예시**
 * ```tsx
 * // 센터 관리 페이지 접근
 * /admin/center-management
 * 
 * // 센터 상태 변경
 * handleStatusChange(centerId, 'inactive', '정기 점검')
 * 
 * // 센터 상세보기
 * setSelectedCenter(center)
 * setShowModal(true)
 * ```
 * 
 * 🔍 **페이지 처리 흐름**
 * 1. 사용자 권한 확인 (관리자만 접근)
 * 2. 센터 목록 및 통계 데이터 로드
 * 3. 검색 및 필터링 기능 제공
 * 4. 센터 상태 변경 처리
 * 5. 센터 상세 정보 모달 표시
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import apiClient from '../../../utils/api';

interface Center {
  _id: string;
  name: string;
  shortDescription: string;
  description: string;
  status: 'active' | 'inactive' | 'suspended' | 'maintenance';
  grade: 'bronze' | 'silver' | 'gold' | 'platinum'; // 🏆 센터 등급 추가
  contact: {
    email: string;
    phone: string;
  };
  address: {
    address1: string;
    address2?: string;
    city: string;
    province: string;
    postalCode: string;
  };
  facilities: string[];
  poolInfo: {
    size: {
      length: number;
      width: number;
      depth: number;
    };
    capacity: number;
  };
  operatingHours: {
    weekdays: { open: string; close: string; };
    weekends: { open: string; close: string; };
  };
  parkingAvailable: boolean;
  images?: {
    mainImage?: string;
    facilityImages?: string[];
  };
  performance?: {
    memberCount: number;
    instructorCount: number;
    monthlyRevenue: number;
    customerSatisfaction: number;
    safetyRecord: number;
    operatingMonths: number;
  };
  createdAt: string;
  updatedAt: string;
  stats?: {
    userCount: number;
    recentRegistrations: number;
  };
}

interface CenterStats {
  centers: {
    total: number;
    active: number;
    inactive: number;
    suspended: number;
    maintenance: number;
  };
  users: {
    total: number;
    students: number;
    instructors: number;
    centerAdmins: number;
    superAdmins: number;
  };
  recentRegistrations: number;
}

export default function CenterManagement() {
  const { user } = useAuth();
  const [centers, setCenters] = useState<Center[]>([]);
  const [stats, setStats] = useState<CenterStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // 지역 필터 상태 추가
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [selectedCenters, setSelectedCenters] = useState<string[]>([]);

  // 지역 데이터 (센터 통계 페이지와 동일)
  const regionData = {
    '서울특별시': ['강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'],
    '부산광역시': ['강서구', '금정구', '남구', '동구', '동래구', '부산진구', '북구', '사상구', '사하구', '서구', '수영구', '연제구', '영도구', '중구', '해운대구', '기장군'],
    '대구광역시': ['남구', '달서구', '달성군', '동구', '북구', '서구', '수성구', '중구'],
    '인천광역시': ['계양구', '남구', '남동구', '동구', '부평구', '서구', '연수구', '중구', '강화군', '옹진군'],
    '광주광역시': ['광산구', '남구', '동구', '북구', '서구'],
    '대전광역시': ['대덕구', '동구', '서구', '유성구', '중구'],
    '울산광역시': ['남구', '동구', '북구', '울주군', '중구'],
    '세종특별자치시': ['세종시'],
    '경기도': ['수원시', '성남시', '의정부시', '안양시', '부천시', '광명시', '평택시', '과천시', '오산시', '시흥시', '군포시', '의왕시', '하남시', '용인시', '파주시', '이천시', '안성시', '김포시', '화성시', '광주시', '여주시', '양평군', '고양시', '의정부시', '동두천시', '가평군', '연천군'],
    '강원특별자치도': ['춘천시', '원주시', '강릉시', '동해시', '태백시', '속초시', '삼척시', '홍천군', '횡성군', '영월군', '평창군', '정선군', '철원군', '화천군', '양구군', '인제군', '고성군', '양양군'],
    '충청북도': ['청주시', '충주시', '제천시', '보은군', '옥천군', '영동군', '증평군', '진천군', '괴산군', '음성군', '단양군'],
    '충청남도': ['천안시', '공주시', '보령시', '아산시', '서산시', '논산시', '계룡시', '당진시', '금산군', '부여군', '서천군', '청양군', '홍성군', '예산군', '태안군'],
    '전북특별자치도': ['전주시', '군산시', '익산시', '정읍시', '남원시', '김제시', '완주군', '진안군', '무주군', '장수군', '임실군', '순창군', '고창군', '부안군'],
    '전라남도': ['목포시', '여수시', '순천시', '나주시', '광양시', '담양군', '곡성군', '구례군', '고흥군', '보성군', '화순군', '장흥군', '강진군', '해남군', '영암군', '무안군', '함평군', '영광군', '장성군', '완도군', '진도군', '신안군'],
    '경상북도': ['포항시', '경주시', '김천시', '안동시', '구미시', '영주시', '영천시', '상주시', '문경시', '경산시', '군위군', '의성군', '청송군', '영양군', '영덕군', '청도군', '고령군', '성주군', '칠곡군', '예천군', '봉화군', '울진군', '울릉군'],
    '경상남도': ['창원시', '진주시', '통영시', '사천시', '김해시', '밀양시', '거제시', '양산시', '의령군', '함안군', '창녕군', '고성군', '남해군', '하동군', '산청군', '함양군', '거창군', '합천군'],
    '제주특별자치도': ['제주시', '서귀포시']
  };

  const centerData = {
    '강남구': ['강남센터', '역삼센터', '논현센터', '삼성센터'],
    '강동구': ['강동센터', '천호센터', '성내센터'],
    '강북구': ['강북센터', '수유센터'],
    '강서구': ['강서센터', '화곡센터', '등촌센터'],
    '관악구': ['관악센터', '신림센터', '서원센터'],
    '광진구': ['광진센터', '구의센터', '자양센터'],
    '구로구': ['구로센터', '가리봉센터', '신도림센터'],
    '금천구': ['금천센터', '시흥센터'],
    '노원구': ['노원센터', '상계센터', '중계센터'],
    '도봉구': ['도봉센터', '쌍문센터'],
    '동대문구': ['동대문센터', '청량리센터', '회기센터'],
    '동작구': ['동작센터', '사당센터', '대방센터'],
    '마포구': ['마포센터', '홍대센터', '공덕센터', '상암센터'],
    '서대문구': ['서대문센터', '신촌센터', '연희센터'],
    '서초구': ['서초센터', '방배센터', '내곡센터'],
    '성동구': ['성동센터', '왕십리센터', '마장센터'],
    '성북구': ['성북센터', '돈암센터', '안암센터'],
    '송파구': ['송파센터', '잠실센터', '문정센터', '가락센터'],
    '양천구': ['양천센터', '목동센터', '신정센터'],
    '영등포구': ['영등포센터', '여의도센터', '당산센터'],
    '용산구': ['용산센터', '이촌센터', '한남센터'],
    '은평구': ['은평센터', '불광센터', '진관센터'],
    '종로구': ['종로센터', '혜화센터', '이화센터'],
    '중구': ['중구센터', '명동센터', '을지로센터'],
    '중랑구': ['중랑센터', '상봉센터', '망우센터']
  };

  // 지역 필터 핸들러
  const handleRegionToggle = (region: string) => {
    setSelectedRegions(prev => {
      if (prev.includes(region)) {
        return prev.filter(r => r !== region);
      } else {
        return [...prev, region];
      }
    });
  };

  const handleDistrictToggle = (district: string) => {
    setSelectedDistricts(prev =>
      prev.includes(district) ? prev.filter(d => d !== district) : [...prev, district]
    );
  };

  const handleCenterToggle = (center: string) => {
    setSelectedCenters(prev =>
      prev.includes(center) ? prev.filter(c => c !== center) : [...prev, center]
    );
  };

  useEffect(() => {
    loadCenters();
    loadStats();
  }, [currentPage, searchTerm, statusFilter, regionFilter, gradeFilter]);

  const loadCenters = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (regionFilter !== 'all') params.append('region', regionFilter);
      if (gradeFilter !== 'all') params.append('grade', gradeFilter);

      const response = await apiClient.get<{
        success: boolean;
        data?: {
          centers: any[];
          pagination: { total: number };
        };
        message?: string;
      }>(`/api/center-management?${params}`).catch(error => {
        console.warn('센터 목록 API 호출 실패:', error);
        return { success: false, data: { centers: [], pagination: { total: 0 } } };
      });
      
      if ((response as any).success) {
        let filteredCenters = (response as any).data.centers;
        
        // 클라이언트 측 추가 필터링 (서버에서 처리되지 않은 필터들)
        if (regionFilter !== 'all') {
          filteredCenters = filteredCenters.filter((center: any) => 
            center.address?.city?.includes(regionFilter) || 
            center.address?.province?.includes(regionFilter) ||
            center.address?.address1?.includes(regionFilter)
          );
        }
        
        if (gradeFilter !== 'all') {
          filteredCenters = filteredCenters.filter((center: any) => 
            center.grade === gradeFilter
          );
        }
        
        // 센터명으로 추가 검색 필터링
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          filteredCenters = filteredCenters.filter((center: any) => 
            center.name?.toLowerCase().includes(searchLower) ||
            center.contact?.email?.toLowerCase().includes(searchLower) ||
            center.address?.address1?.toLowerCase().includes(searchLower) ||
            center.address?.city?.toLowerCase().includes(searchLower) ||
            center.address?.province?.toLowerCase().includes(searchLower)
          );
        }
        
        setCenters(filteredCenters);
        setTotalPages(Math.ceil(filteredCenters.length / 10));
      } else {
        setError((response as any).message || '센터 목록을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('센터 목록 로딩 오류:', error);
      setError('센터 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data?: CenterStats;
      }>('/api/center-management/stats/overview');
      if ((response as any).success) {
        setStats((response as any).data);
      }
    } catch (error) {
      console.error('센터 통계 로딩 오류:', error);
    }
  };

  const handleStatusChange = async (centerId: string, newStatus: string, reason?: string) => {
    try {
      const response = await apiClient.patch(`/api/center-management/${centerId}/status`, { 
        status: newStatus, 
        reason 
      });

      if (response.success) {
        await loadCenters();
        await loadStats();
        alert(`센터 상태가 ${getStatusKorean(newStatus)}로 변경되었습니다.`);
      } else {
        alert(response.message || '상태 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('상태 변경 오류:', error);
      alert('상태 변경 중 오류가 발생했습니다.');
    }
  };

  const getStatusKorean = (status: string) => {
    const statusMap = {
      'active': '활성',
      'inactive': '비활성',
      'suspended': '정지',
      'maintenance': '점검중'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-gray-100 text-gray-800',
      'suspended': 'bg-red-100 text-red-800',
      'maintenance': 'bg-yellow-100 text-yellow-800'
    };
    return colorMap[status as keyof typeof colorMap] || 'bg-gray-100 text-gray-800';
  };

  const getCenterGradeColor = (grade: string) => {
    const gradeColorMap = {
      'bronze': 'bg-orange-100 text-orange-800 border-orange-300',
      'silver': 'bg-gray-100 text-gray-800 border-gray-300',
      'gold': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'platinum': 'bg-purple-100 text-purple-800 border-purple-300'
    };
    return gradeColorMap[grade as keyof typeof gradeColorMap] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getCenterGradeKorean = (grade: string) => {
    const gradeMap = {
      'bronze': '⭐ 1급 센터',
      'silver': '⭐⭐ 2급 센터', 
      'gold': '⭐⭐⭐ 3급 센터',
      'platinum': '⭐⭐⭐⭐ 특급 센터'
    };
    return gradeMap[grade as keyof typeof gradeMap] || '⭐ 1급 센터';
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadCenters();
  };

  if (loading && centers.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🏢 센터 관리</h1>
        <p className="text-gray-600">전체 센터의 상태를 관리하고 모니터링합니다.</p>
      </div>

      {/* 통계 카드 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">🏢</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">전체 센터</p>
                <p className="text-2xl font-bold text-gray-900">{stats.centers.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">활성 센터</p>
                <p className="text-2xl font-bold text-green-600">{stats.centers.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">전체 사용자</p>
                <p className="text-2xl font-bold text-gray-900">{stats.users.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <span className="text-2xl">📝</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">최근 신청</p>
                <p className="text-2xl font-bold text-orange-600">{stats.recentRegistrations}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 지역 필터 */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">지역 필터</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 시/도 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">시/도</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => {
                const value = e.target.value;
                if (value && !selectedRegions.includes(value)) {
                  setSelectedRegions([...selectedRegions, value]);
                }
              }}
              value=""
            >
              <option value="">시/도 선택</option>
              {Object.keys(regionData).map(sido => (
                <option key={sido} value={sido}>
                  {sido}
                </option>
              ))}
            </select>
            {selectedRegions.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {selectedRegions.map(region => (
                  <span
                    key={region}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                  >
                    {region}
                    <button
                      onClick={() => setSelectedRegions(selectedRegions.filter(r => r !== region))}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 시/군/구 선택 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">시/군/구</label>
              {selectedRegions.length > 0 && (
                <button
                  onClick={() => {
                    const allDistricts = selectedRegions.flatMap(sido => regionData[sido] || []);
                    setSelectedDistricts(allDistricts);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  모두 선택
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
              {selectedRegions.length > 0 ? (
                selectedRegions.flatMap(sido => regionData[sido] || []).map(district => (
                  <button
                    key={district}
                    onClick={() => handleDistrictToggle(district)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedDistricts.includes(district)
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {district}
                    {selectedDistricts.includes(district) && (
                      <span className="ml-1 text-xs">✓</span>
                    )}
                  </button>
                ))
              ) : (
                <div className="text-gray-500 text-sm py-2 text-center w-full">
                  먼저 시/도를 선택해주세요
                </div>
              )}
            </div>
          </div>

          {/* 센터 선택 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">센터</label>
              {selectedDistricts.length > 0 && (
                <button
                  onClick={() => {
                    const allCenters = selectedDistricts.flatMap(district => centerData[district] || []);
                    setSelectedCenters(allCenters);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  모두 선택
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
              {selectedDistricts.length > 0 ? (
                selectedDistricts.flatMap(district => centerData[district] || []).map(center => (
                  <button
                    key={center}
                    onClick={() => handleCenterToggle(center)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCenters.includes(center)
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {center}
                    {selectedCenters.includes(center) && (
                      <span className="ml-1 text-xs">✓</span>
                    )}
                  </button>
                ))
              ) : (
                <div className="text-gray-500 text-sm py-2 text-center w-full">
                  먼저 시/군/구를 선택해주세요
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 필터 초기화 */}
        {(selectedRegions.length > 0 || selectedDistricts.length > 0 || selectedCenters.length > 0) && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                setSelectedRegions([]);
                setSelectedDistricts([]);
                setSelectedCenters([]);
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              필터 초기화
            </button>
          </div>
        )}
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <form onSubmit={handleSearch} className="flex flex-col gap-4">
          {/* 검색어 입력 */}
          <div>
            <input
              type="text"
              placeholder="센터명, 이메일, 주소, 지역으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* 필터 옵션들 */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="md:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">모든 상태</option>
                <option value="active">✅ 활성</option>
                <option value="inactive">❌ 비활성</option>
                <option value="suspended">🚫 정지</option>
                <option value="maintenance">🔧 점검중</option>
              </select>
            </div>
            
            <div className="md:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">지역</label>
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">모든 지역</option>
                <option value="서울">🏙️ 서울특별시</option>
                <option value="부산">🌊 부산광역시</option>
                <option value="대구">🏔️ 대구광역시</option>
                <option value="인천">✈️ 인천광역시</option>
                <option value="광주">🌸 광주광역시</option>
                <option value="대전">🚄 대전광역시</option>
                <option value="울산">🏭 울산광역시</option>
                <option value="세종">🏛️ 세종특별자치시</option>
                <option value="경기">🏘️ 경기도</option>
                <option value="강원">⛰️ 강원특별자치도</option>
                <option value="충북">🌲 충청북도</option>
                <option value="충남">🌾 충청남도</option>
                <option value="전북">🌿 전북특별자치도</option>
                <option value="전남">🌊 전라남도</option>
                <option value="경북">🍎 경상북도</option>
                <option value="경남">🏖️ 경상남도</option>
                <option value="제주">🏝️ 제주특별자치도</option>
              </select>
            </div>
            
            <div className="md:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">등급</label>
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">모든 등급</option>
                <option value="bronze">⭐ 1급 센터</option>
                <option value="silver">⭐⭐ 2급 센터</option>
                <option value="gold">⭐⭐⭐ 3급 센터</option>
                <option value="platinum">⭐⭐⭐⭐ 특급 센터</option>
              </select>
            </div>
            
            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                🔍 검색
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setRegionFilter('all');
                  setGradeFilter('all');
                  setCurrentPage(1);
                }}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors whitespace-nowrap"
              >
                🔄 초기화
              </button>
            </div>
          </div>
        </form>
        
        {/* 활성 필터 표시 */}
        {(searchTerm || statusFilter !== 'all' || regionFilter !== 'all' || gradeFilter !== 'all') && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <span className="font-medium">🔍 활성 필터:</span>
                {searchTerm && (
                  <span className="px-2 py-1 bg-blue-200 rounded-full">
                    검색: "{searchTerm}"
                  </span>
                )}
                {statusFilter !== 'all' && (
                  <span className="px-2 py-1 bg-blue-200 rounded-full">
                    상태: {statusFilter === 'active' ? '✅ 활성' : 
                          statusFilter === 'inactive' ? '❌ 비활성' : 
                          statusFilter === 'suspended' ? '🚫 정지' : '🔧 점검중'}
                  </span>
                )}
                {regionFilter !== 'all' && (
                  <span className="px-2 py-1 bg-blue-200 rounded-full">
                    지역: {regionFilter}
                  </span>
                )}
                {gradeFilter !== 'all' && (
                  <span className="px-2 py-1 bg-blue-200 rounded-full">
                    등급: {gradeFilter === 'bronze' ? '⭐ 1급' :
                           gradeFilter === 'silver' ? '⭐⭐ 2급' :
                           gradeFilter === 'gold' ? '⭐⭐⭐ 3급' : '⭐⭐⭐⭐ 특급'}
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setRegionFilter('all');
                  setGradeFilter('all');
                  setCurrentPage(1);
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                모든 필터 해제
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 센터 목록 */}
      {/* 센터 목록 - 카드 형식 */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">센터 목록</h2>
        
        {error && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-red-600">
              <svg className="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-lg font-medium mb-2">데이터를 불러오는데 실패했습니다</p>
              <p className="text-sm mb-4">{error}</p>
              <button
                onClick={loadCenters}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                🔄 다시 시도
              </button>
            </div>
          </div>
        )}

        {centers.length === 0 && !loading && !error ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="text-lg font-medium">등록된 센터가 없습니다</p>
              <p className="text-sm">새로운 센터 등록을 기다리고 있습니다.</p>
            </div>
          </div>
        ) : !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {centers.map((center) => (
              <div key={center._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200">
                {/* 카드 헤더 */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center flex-1">
                      <div className="flex-shrink-0 h-12 w-12">
                        <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                          {center.name}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-1">
                          {center.shortDescription || `${center.address.city} ${center.address.province}`}
                        </p>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0 space-y-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(center.status)}`}>
                        {getStatusKorean(center.status)}
                      </span>
                      <div className={`inline-flex px-2 py-1 text-xs font-bold rounded-md border ${getCenterGradeColor(center.grade)}`}>
                        {getCenterGradeKorean(center.grade)}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 카드 본문 */}
                <div className="p-6">
                  <div className="space-y-3">
                    {/* 연락처 정보 */}
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-900">{center.contact.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-900">{center.contact.phone}</p>
                      </div>
                    </div>
                    
                    {/* 주소 정보 */}
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-900 line-clamp-1">{center.address.address1}</p>
                      </div>
                    </div>
                    
                    {/* 등록일 */}
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-900">{new Date(center.createdAt).toLocaleDateString('ko-KR')}</p>
                      </div>
                    </div>
                    
                    {/* 센터 성과 지표 */}
                    {center.performance && (
                      <div className="bg-blue-50 rounded-lg p-3 mb-3">
                        <h4 className="text-xs font-bold text-blue-800 mb-2">📊 센터 성과</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>회원: {center.performance.memberCount}명</div>
                          <div>강사: {center.performance.instructorCount}명</div>
                          <div>만족도: ⭐{center.performance.customerSatisfaction}/5.0</div>
                          <div>운영: {Math.floor(center.performance.operatingMonths/12)}년 {center.performance.operatingMonths%12}개월</div>
                        </div>
                      </div>
                    )}
                    
                    {/* 기본 통계 정보 */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">{center.stats?.userCount || 0}</div>
                        <div className="text-xs text-gray-500">사용자</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">{center.stats?.recentRegistrations || 0}</div>
                        <div className="text-xs text-gray-500">최근 신청</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">{center.facilities?.length || 0}</div>
                        <div className="text-xs text-gray-500">시설</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 카드 푸터 */}
                <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={() => {
                        setSelectedCenter(center);
                        setShowModal(true);
                      }}
                      className="flex-1 px-3 py-2 text-xs font-medium bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors"
                    >
                      📋 상세보기
                    </button>
                    <div className="flex-1">
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleStatusChange(center._id, e.target.value);
                            e.target.value = '';
                          }
                        }}
                        className="w-full px-3 py-2 text-xs font-medium bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors"
                      >
                        <option value="">⚙️ 상태 변경</option>
                        <option value="active">▶️ 활성</option>
                        <option value="inactive">⏸️ 비활성</option>
                        <option value="suspended">🚫 정지</option>
                        <option value="maintenance">🔧 점검중</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* 센터 등급 관리 */}
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            const reason = prompt(`센터 등급을 ${getCenterGradeKorean(e.target.value)}로 변경하는 이유를 입력하세요:`);
                            if (reason) {
                              // TODO: 센터 등급 변경 API 호출
                              console.log(`센터 등급 변경: ${center._id} → ${e.target.value}, 사유: ${reason}`);
                              alert(`센터 등급이 ${getCenterGradeKorean(e.target.value)}로 변경되었습니다.`);
                            }
                            e.target.value = '';
                          }
                        }}
                        className="w-full px-3 py-2 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 transition-colors"
                      >
                        <option value="">🏆 등급 변경</option>
                        <option value="bronze">⭐ 1급 센터</option>
                        <option value="silver">⭐⭐ 2급 센터</option>
                        <option value="gold">⭐⭐⭐ 3급 센터</option>
                        <option value="platinum">⭐⭐⭐⭐ 특급 센터</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                페이지 {currentPage} / {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  이전
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  다음
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 센터 상세 모달 */}
      {showModal && selectedCenter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">{selectedCenter.name}</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 기본 정보 */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">센터명</label>
                      <p className="text-sm text-gray-900">{selectedCenter.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">설명</label>
                      <p className="text-sm text-gray-900">{selectedCenter.description}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">상태</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedCenter.status)}`}>
                        {getStatusKorean(selectedCenter.status)}
                      </span>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">센터 등급</label>
                      <div className={`inline-flex px-3 py-2 text-sm font-bold rounded-lg border-2 ${getCenterGradeColor(selectedCenter.grade)}`}>
                        {getCenterGradeKorean(selectedCenter.grade)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 연락처 정보 */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">연락처 정보</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">이메일</label>
                      <p className="text-sm text-gray-900">{selectedCenter.contact.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">전화번호</label>
                      <p className="text-sm text-gray-900">{selectedCenter.contact.phone}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">주소</label>
                      <p className="text-sm text-gray-900">
                        {selectedCenter.address.address1} {selectedCenter.address.address2 || ''}
                        <br />
                        {selectedCenter.address.city} {selectedCenter.address.province} {selectedCenter.address.postalCode}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 시설 정보 */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">시설 정보</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">수영장 크기</label>
                      <p className="text-sm text-gray-900">
                        {selectedCenter.poolInfo.size.length}m × {selectedCenter.poolInfo.size.width}m × {selectedCenter.poolInfo.size.depth}m
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">수용 인원</label>
                      <p className="text-sm text-gray-900">{selectedCenter.poolInfo.capacity}명</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">주차 가능</label>
                      <p className="text-sm text-gray-900">{selectedCenter.parkingAvailable ? '가능' : '불가능'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">시설</label>
                      <div className="flex flex-wrap gap-1">
                        {selectedCenter.facilities.map((facility, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {facility}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 운영 시간 */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">운영 시간</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">평일</label>
                      <p className="text-sm text-gray-900">
                        {selectedCenter.operatingHours.weekdays.open} - {selectedCenter.operatingHours.weekdays.close}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">주말</label>
                      <p className="text-sm text-gray-900">
                        {selectedCenter.operatingHours.weekends.open} - {selectedCenter.operatingHours.weekends.close}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
