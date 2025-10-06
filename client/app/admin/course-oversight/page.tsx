/**
 * @file 최고관리자 강습 과정 감독 페이지
 * @description 전체 센터의 강습 과정 현황 감독 및 모니터링
 * @date 2025-01-13
 * @author JJ Swim Lab
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import StatCard from '@/components/StatCard';
import SimpleBarChart from '@/components/SimpleBarChart';
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  BarChart3, 
  Users, 
  DollarSign,
  Clock,
  Settings,
  AlertTriangle,
  Filter,
  Search,
  Download,
  RefreshCw,
  Star
} from 'lucide-react';

interface CourseOversightStats {
  totalCourses: number;
  activeCourses: number;
  inactiveCourses: number;
  totalRevenue: number;
  averageRating: number;
  totalStudents: number;
}

interface CenterCourseData {
  centerId: string;
  centerName: string;
  totalCourses: number;
  activeCourses: number;
  revenue: number;
  rating: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
}

const CourseOversightPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<CourseOversightStats>({
    totalCourses: 0,
    activeCourses: 0,
    inactiveCourses: 0,
    totalRevenue: 0,
    averageRating: 0,
    totalStudents: 0
  });

  const [centerData, setCenterData] = useState<CenterCourseData[]>([
    {
      centerId: '1',
      centerName: 'JJ Swim Lab 본점',
      totalCourses: 25,
      activeCourses: 22,
      revenue: 2500000,
      rating: 4.8,
      status: 'excellent'
    },
    {
      centerId: '2',
      centerName: 'JJ Swim Lab 강남점',
      totalCourses: 18,
      activeCourses: 15,
      revenue: 1800000,
      rating: 4.5,
      status: 'good'
    },
    {
      centerId: '3',
      centerName: 'JJ Swim Lab 분당점',
      totalCourses: 12,
      activeCourses: 8,
      revenue: 1200000,
      rating: 4.2,
      status: 'warning'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
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

  const centerLocationData = {
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

  // 필터링된 센터 데이터
  const filteredCenterData = centerData.filter(center => {
    if (selectedRegions.length === 0 && selectedDistricts.length === 0 && selectedCenters.length === 0) {
      return true;
    }
    
    if (selectedCenters.length > 0) {
      return selectedCenters.includes(center.centerName);
    }
    
    if (selectedDistricts.length > 0) {
      // 센터명에서 지역 정보 추출하여 필터링
      return selectedDistricts.some(district => center.centerName.includes(district));
    }
    
    if (selectedRegions.length > 0) {
      // 센터명에서 지역 정보 추출하여 필터링
      return selectedRegions.some(region => center.centerName.includes(region));
    }
    
    return true;
  });

  useEffect(() => {
    const loadCourseOversightData = async () => {
      try {
        console.log('강습 과정 감독 데이터 로드 중...');
        
        // 임시 데이터 설정
        setStats({
          totalCourses: 55,
          activeCourses: 45,
          inactiveCourses: 10,
          totalRevenue: 5500000,
          averageRating: 4.5,
          totalStudents: 320
        });
      } catch (error) {
        console.error('강습 과정 감독 데이터 로드 실패:', error);
      }
    };

    loadCourseOversightData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'excellent': return '우수';
      case 'good': return '양호';
      case 'warning': return '주의';
      case 'critical': return '위험';
      default: return '알 수 없음';
    }
  };

  const finalFilteredCenterData = filteredCenterData.filter(center => {
    const matchesSearch = center.centerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || center.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">강습 과정 감독</h1>
        <p className="text-gray-600 mt-2">전체 센터의 강습 과정 현황을 감독하고 모니터링합니다.</p>
      </div>

      {/* 주요 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="총 강습 과정"
          value={`${stats.totalCourses}개`}
          icon="📚"
          color="blue"
          subtitle="전체 센터 합계"
          href="/admin/courses"
        />

        <StatCard
          title="활성 과정"
          value={`${stats.activeCourses}개`}
          icon="✅"
          color="green"
          subtitle="현재 운영 중"
          href="/admin/courses"
        />

        <StatCard
          title="총 수익"
          value={`${stats.totalRevenue.toLocaleString()}원`}
          icon="💰"
          color="purple"
          subtitle="월간 총 수익"
          href="/admin/revenue-management"
        />

        <StatCard
          title="평균 평점"
          value={stats.averageRating}
          icon="⭐"
          color="yellow"
          subtitle="전체 평균"
          href="/admin/courses"
        />
      </div>

      {/* 추가 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <StatCard
          title="비활성 과정"
          value={`${stats.inactiveCourses}개`}
          icon="❌"
          color="red"
          subtitle="운영 중단"
          href="/admin/courses"
        />

        <StatCard
          title="총 수강생"
          value={`${stats.totalStudents}명`}
          icon="👥"
          color="orange"
          subtitle="전체 수강생"
          href="/admin/users"
        />
      </div>

      {/* 지역 필터 */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
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
                    const allCenters = selectedDistricts.flatMap(district => centerLocationData[district] || []);
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
                selectedDistricts.flatMap(district => centerLocationData[district] || []).map(center => (
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
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="센터명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">전체 상태</option>
              <option value="excellent">우수</option>
              <option value="good">양호</option>
              <option value="warning">주의</option>
              <option value="critical">위험</option>
            </select>
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 센터별 강습 과정 현황 */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">센터별 강습 과정 현황</h3>
              <p className="text-sm text-gray-600">각 센터의 강습 과정 운영 현황을 확인하세요.</p>
            </div>
            <button 
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              onClick={() => {/* 리포트 다운로드 로직 */}}
            >
              <Download className="h-4 w-4 mr-2" />
              리포트 다운로드
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  센터명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  총 과정
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  활성 과정
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  수익
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  평점
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  액션
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {finalFilteredCenterData.map((center) => (
                <tr key={center.centerId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {center.centerName.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{center.centerName}</div>
                        <div className="text-sm text-gray-500">ID: {center.centerId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {center.totalCourses}개
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {center.activeCourses}개
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {center.revenue.toLocaleString()}원
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <span className="mr-1">{center.rating}</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${i < Math.floor(center.rating) ? 'text-yellow-400' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`px-2 py-1 rounded-full text-sm ${getStatusColor(center.status)}`}>
                      {getStatusLabel(center.status)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => {/* 상세보기 로직 */}}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        className="text-green-600 hover:text-green-900"
                        onClick={() => {/* 설정 로직 */}}
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CourseOversightPage;