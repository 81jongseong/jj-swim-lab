/**
 * 강사 관리 페이지
 * 최고 관리자가 강사 정보, 성과, 스케줄을 종합적으로 관리하는 페이지
 * 연동 데이터: 강사 정보, 자격증, 급여, 스케줄, 성과 데이터
 * 연동 파일: useAuth.tsx, 강사 관련 API
 */

"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';

export default function InstructorManagementPage() {
  const { user, hasUserType } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [showInstructorDetail, setShowInstructorDetail] = useState(false);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [selectedDistricts, setSelectedDistricts] = useState([]);
  const [selectedCenters, setSelectedCenters] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week', 'day'
  const [searchMode, setSearchMode] = useState('center'); // 'center', 'address'

  // 샘플 강사 데이터 (확장됨)
  const sampleInstructors = [
    {
      id: 1,
      name: '김수영',
      email: 'kim.swim@email.com',
      phone: '010-1234-5678',
      address: '서울시 마포구 홍대입구로 123, 101동 1201호',
      center: '홍대센터',
      region: '서울시',
      district: '마포구',
      status: 'active',
      experience: '5년',
      rating: 4.8,
      students: 45,
      specialties: ['자유형', '배영', '접영'],
      certifications: [
        {
          name: '수영지도사 2급',
          issuer: '대한수영연맹',
          issueDate: '2020-03-15',
          expiryDate: '2025-03-15',
          status: 'valid'
        },
        {
          name: '생존수영지도사',
          issuer: '대한생존수영협회',
          issueDate: '2019-08-20',
          expiryDate: '2024-08-20',
          status: 'expired'
        },
        {
          name: '심폐소생술 자격증',
          issuer: '대한적십자사',
          issueDate: '2023-01-10',
          expiryDate: '2025-01-10',
          status: 'valid'
        }
      ],
      emergencyContact: {
        name: '김민수',
        relationship: '부',
        phone: '010-9876-5432'
      },
      joinDate: '2019-03-15',
      salary: 3500000
    },
    {
      id: 2,
      name: '이영수',
      email: 'lee.swim@email.com',
      phone: '010-2345-6789',
      address: '서울시 강남구 테헤란로 456, 202동 1502호',
      center: '강남센터',
      region: '서울시',
      district: '강남구',
      status: 'active',
      experience: '3년',
      rating: 4.6,
      students: 32,
      specialties: ['평영', '자유형'],
      certifications: [
        {
          name: '수영지도사 3급',
          issuer: '대한수영연맹',
          issueDate: '2021-06-20',
          expiryDate: '2026-06-20',
          status: 'valid'
        },
        {
          name: '심폐소생술 자격증',
          issuer: '대한적십자사',
          issueDate: '2022-05-15',
          expiryDate: '2024-05-15',
          status: 'expiring'
        }
      ],
      emergencyContact: {
        name: '이순자',
        relationship: '모',
        phone: '010-8765-4321'
      },
      joinDate: '2021-06-20',
      salary: 2800000
    },
    {
      id: 3,
      name: '박수영',
      email: 'park.swim@email.com',
      phone: '010-3456-7890',
      address: '서울시 송파구 올림픽로 789, 303동 2003호',
      center: '송파센터',
      region: '서울시',
      district: '송파구',
      status: 'active',
      experience: '7년',
      rating: 4.9,
      students: 58,
      specialties: ['접영', '배영', '평영'],
      certifications: [
        {
          name: '수영지도사 1급',
          issuer: '대한수영연맹',
          issueDate: '2018-09-10',
          expiryDate: '2026-09-10',
          status: 'valid'
        },
        {
          name: '수상안전지도사',
          issuer: '대한수상안전협회',
          issueDate: '2020-07-15',
          expiryDate: '2025-07-15',
          status: 'valid'
        }
      ],
      emergencyContact: {
        name: '박영희',
        relationship: '배우자',
        phone: '010-7654-3210'
      },
      joinDate: '2017-09-10',
      salary: 4200000
    },
    {
      id: 4,
      name: '최수영',
      email: 'choi.swim@email.com',
      phone: '010-4567-8901',
      address: '경기도 수원시 영통구 광교로 101, 404동 3004호',
      center: '수원센터',
      region: '경기도',
      district: '수원시',
      status: 'active',
      experience: '4년',
      rating: 4.7,
      students: 38,
      specialties: ['자유형', '배영'],
      certifications: [
        {
          name: '수영지도사 2급',
          issuer: '대한수영연맹',
          issueDate: '2020-12-05',
          expiryDate: '2025-12-05',
          status: 'valid'
        },
        {
          name: '심폐소생술 자격증',
          issuer: '대한적십자사',
          issueDate: '2022-08-10',
          expiryDate: '2024-08-10',
          status: 'expiring'
        }
      ],
      emergencyContact: {
        name: '최동호',
        relationship: '부',
        phone: '010-6543-2109'
      },
      joinDate: '2020-12-05',
      salary: 3200000
    },
    {
      id: 5,
      name: '정수영',
      email: 'jung.swim@email.com',
      phone: '010-5678-9012',
      address: '경기도 성남시 분당구 판교로 202, 505동 4005호',
      center: '성남센터',
      region: '경기도',
      district: '성남시',
      status: 'active',
      experience: '6년',
      rating: 4.5,
      students: 42,
      specialties: ['평영', '접영'],
      certifications: [
        {
          name: '수영지도사 2급',
          issuer: '대한수영연맹',
          issueDate: '2019-04-12',
          expiryDate: '2024-04-12',
          status: 'expired'
        }
      ],
      emergencyContact: {
        name: '정미영',
        relationship: '모',
        phone: '010-5432-1098'
      },
      joinDate: '2018-04-12',
      salary: 3800000
    }
  ];

  // 필터링된 강사 목록
  const filteredInstructors = sampleInstructors.filter(instructor => {
    if (selectedRegions.length === 0 && selectedDistricts.length === 0 && selectedCenters.length === 0) {
      return true;
    }

    if (searchMode === 'center') {
      // 센터 기준 필터링
      if (selectedCenters.length > 0) {
        return selectedCenters.includes(instructor.center);
      }
      if (selectedDistricts.length > 0) {
        return selectedDistricts.includes(instructor.district);
      }
      if (selectedRegions.length > 0) {
        return selectedRegions.includes(instructor.region);
      }
    } else {
      // 주소지 기준 필터링
      if (selectedDistricts.length > 0) {
        return selectedDistricts.some(district => instructor.address.includes(district));
      }
      if (selectedRegions.length > 0) {
        return selectedRegions.some(region => instructor.address.includes(region));
      }
    }

    return true;
  });

  // 시도/시군구 데이터 (확장됨)
  const regionData = {
    '서울시': ['강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'],
    '경기도': ['수원시', '성남시', '고양시', '용인시', '부천시', '안산시', '안양시', '평택시', '시흥시', '김포시', '화성시', '광주시', '광명시', '군포시', '하남시', '오산시', '이천시', '안성시', '의왕시', '양평군', '여주시', '과천시', '의정부시', '동두천시', '가평군', '연천군', '포천시', '양주시', '남양주시'],
    '인천시': ['남동구', '연수구', '부평구', '서구', '계양구', '미추홀구', '중구', '동구', '옹진군'],
    '부산시': ['해운대구', '사하구', '금정구', '강서구', '연제구', '수영구', '사상구', '기장군', '북구', '동래구', '남구', '중구', '서구', '동구', '영도구'],
    '대구시': ['수성구', '달서구', '달성군', '북구', '서구', '남구', '동구', '중구', '군위군'],
    '광주시': ['서구', '남구', '북구', '광산구', '동구'],
    '대전시': ['유성구', '대덕구', '서구', '중구', '동구'],
    '울산시': ['남구', '동구', '북구', '울주군', '중구'],
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

  // 시군구/센터 데이터 (확장됨)
  const centerData = {
    '마포구': ['홍대센터', '상수센터', '합정센터', '공덕센터'],
    '강남구': ['강남센터', '역삼센터', '논현센터', '삼성센터', '대치센터'],
    '송파구': ['송파센터', '잠실센터', '문정센터', '가락센터'],
    '강동구': ['강동센터', '천호센터', '길동센터'],
    '수원시': ['수원센터', '영통센터', '팔달센터', '권선센터'],
    '성남시': ['성남센터', '분당센터', '수정센터', '중원센터'],
    '고양시': ['고양센터', '일산센터', '덕양센터'],
    '용인시': ['용인센터', '기흥센터', '수지센터', '처인센터'],
    '부천시': ['부천센터', '소사센터', '오정센터'],
    '안산시': ['안산센터', '단원센터', '상록센터'],
    '안양시': ['안양센터', '만안센터', '동안센터'],
    '평택시': ['평택센터', '서정센터', '비전센터'],
    '시흥시': ['시흥센터', '정왕센터', '신천센터'],
    '김포시': ['김포센터', '사우센터', '고촌센터'],
    '화성시': ['화성센터', '동탄센터', '병점센터'],
    '광주시': ['광주센터', '오포센터', '퇴촌센터'],
    '광명시': ['광명센터', '소하센터', '철산센터'],
    '군포시': ['군포센터', '산본센터', '금정센터'],
    '하남시': ['하남센터', '미사센터', '신장센터'],
    '오산시': ['오산센터', '세마센터', '원동센터'],
    '이천시': ['이천센터', '부발센터', '마장센터'],
    '안성시': ['안성센터', '공도센터', '원곡센터'],
    '의왕시': ['의왕센터', '내손센터', '고천센터'],
    '양평군': ['양평센터', '양서센터', '서종센터'],
    '여주시': ['여주센터', '가남센터', '대신센터'],
    '과천시': ['과천센터', '중앙센터', '별양센터'],
    '의정부시': ['의정부센터', '호원센터', '장암센터'],
    '동두천시': ['동두천센터', '생연센터', '상패센터'],
    '가평군': ['가평센터', '청평센터', '상면센터'],
    '연천군': ['연천센터', '전곡센터', '청산센터'],
    '포천시': ['포천센터', '소흘센터', '신북센터'],
    '양주시': ['양주센터', '회천센터', '덕정센터'],
    '남양주시': ['남양주센터', '와부센터', '조안센터'],
    '남동구': ['남동센터', '논현센터', '만수센터'],
    '연수구': ['연수센터', '송도센터', '옥련센터'],
    '부평구': ['부평센터', '산곡센터', '청천센터'],
    '서구': ['서구센터', '가정센터', '가좌센터'],
    '계양구': ['계양센터', '작전센터', '박촌센터'],
    '미추홀구': ['미추홀센터', '학익센터', '주안센터'],
    '중구': ['중구센터', '인현센터', '도원센터'],
    '동구': ['동구센터', '만석센터', '화수센터'],
    '옹진군': ['옹진센터', '북도센터', '연평센터']
  };

  // 휴가 신청 데이터
  const vacationRequests = [
    {
      id: 1,
      instructorName: '김수영',
      center: '홍대센터',
      startDate: '2024-01-15',
      endDate: '2024-01-20',
      reason: '개인 사정',
      status: 'pending',
      submittedDate: '2024-01-10'
    },
    {
      id: 2,
      instructorName: '이영수',
      center: '강남센터',
      startDate: '2024-01-25',
      endDate: '2024-01-27',
      reason: '가족 행사',
      status: 'approved',
      submittedDate: '2024-01-20'
    },
    {
      id: 3,
      instructorName: '박수영',
      center: '송파센터',
      startDate: '2024-02-01',
      endDate: '2024-02-05',
      reason: '여행',
      status: 'rejected',
      submittedDate: '2024-01-25'
    }
  ];

  // 강사 승인 대기 데이터
  const pendingInstructors = [
    {
      id: 101,
      name: '신입강사1',
      email: 'new1@email.com',
      phone: '010-1111-1111',
      experience: '신입',
      certifications: [
        {
          name: '수영지도사 3급',
          issuer: '대한수영연맹',
          issueDate: '2023-12-01',
          status: 'valid'
        }
      ],
      career: '대학교 수영부 출신',
      submittedDate: '2024-01-01'
    },
    {
      id: 102,
      name: '신입강사2',
      email: 'new2@email.com',
      phone: '010-2222-2222',
      experience: '2년',
      certifications: [
        {
          name: '수영지도사 2급',
          issuer: '대한수영연맹',
          issueDate: '2022-06-15',
          status: 'valid'
        },
        {
          name: '생존수영지도사',
          issuer: '대한생존수영협회',
          issueDate: '2023-03-20',
          status: 'valid'
        }
      ],
      career: '전 수영 국가대표',
      submittedDate: '2024-01-05'
    }
  ];

  // 지역 선택 핸들러
  const handleRegionToggle = (region: string) => {
    if (selectedRegions.includes(region)) {
      setSelectedRegions(selectedRegions.filter(r => r !== region));
    } else {
      setSelectedRegions([...selectedRegions, region]);
    }
    setSelectedDistricts([]);
    setSelectedCenters([]);
  };

  // 시군구 선택 핸들러
  const handleDistrictToggle = (district: string) => {
    if (selectedDistricts.includes(district)) {
      setSelectedDistricts(selectedDistricts.filter(d => d !== district));
    } else {
      setSelectedDistricts([...selectedDistricts, district]);
    }
    setSelectedCenters([]);
  };

  // 센터 선택 핸들러
  const handleCenterToggle = (center: string) => {
    if (selectedCenters.includes(center)) {
      setSelectedCenters(selectedCenters.filter(c => c !== center));
    } else {
      setSelectedCenters([...selectedCenters, center]);
    }
  };

  useEffect(() => {
    if (!hasUserType('superAdmin')) {
      return;
    }
    
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, [user?.userType]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">강사 데이터를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">강사 관리</h1>
          <p className="text-gray-600">전체 강사의 정보, 성과, 학생 관리를 종합적으로 관리합니다.</p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
                  <button
                onClick={() => setActiveTab('overview')}
                className={`border-b-2 py-4 px-1 text-sm font-medium ${
                  activeTab === 'overview' 
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                대시보드
                  </button>
                    <button 
                onClick={() => setActiveTab('instructors')}
                className={`border-b-2 py-4 px-1 text-sm font-medium ${
                  activeTab === 'instructors' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                강사 관리
                    </button>
              <button
                onClick={() => setActiveTab('schedule')}
                className={`border-b-2 py-4 px-1 text-sm font-medium ${
                  activeTab === 'schedule' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                스케줄 관리
                  </button>
                      <button
                onClick={() => setActiveTab('performance')}
                className={`border-b-2 py-4 px-1 text-sm font-medium ${
                  activeTab === 'performance' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                성과 분석
                      </button>
                        <button
                onClick={() => setActiveTab('evaluation')}
                className={`border-b-2 py-4 px-1 text-sm font-medium ${
                  activeTab === 'evaluation' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                평가 관리
                        </button>
                      <button
                onClick={() => setActiveTab('approval')}
                className={`border-b-2 py-4 px-1 text-sm font-medium ${
                  activeTab === 'approval' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                강사 승인
                      </button>
                    </nav>
                  </div>
                </div>
                
        {/* 탭 콘텐츠 */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">👥</span>
                        </div>
                      </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">전체 강사</dt>
                    <dd className="text-lg font-medium text-gray-900">{sampleInstructors.length}명</dd>
                  </dl>
                        </div>
                        </div>
                        </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">✅</span>
                      </div>
                    </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">활성 강사</dt>
                    <dd className="text-lg font-medium text-gray-900">{sampleInstructors.filter(i => i.status === 'active').length}명</dd>
                  </dl>
                        </div>
                      </div>
                        </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">⭐</span>
                        </div>
                        </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">평균 평점</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {(sampleInstructors.reduce((sum, i) => sum + i.rating, 0) / sampleInstructors.length).toFixed(1)}
                    </dd>
                  </dl>
                      </div>
                    </div>
                        </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">🎓</span>
                      </div>
                        </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">총 학생 수</dt>
                    <dd className="text-lg font-medium text-gray-900">{sampleInstructors.reduce((sum, i) => sum + i.students, 0)}명</dd>
                  </dl>
                        </div>
                        </div>
                        </div>
                      </div>
            )}

            {activeTab === 'instructors' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                강사 관리 
                <span className="text-sm text-gray-500 ml-2">
                  ({filteredInstructors.length}명)
                              </span>
              </h3>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                + 새 강사 등록
                  </button>
                            </div>
            <div className="p-6">
              <div className="space-y-4">
                {filteredInstructors.length > 0 ? (
                  filteredInstructors.map(instructor => (
                    <div key={instructor.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          instructor.status === 'active' ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          <span className={`font-bold text-lg ${
                            instructor.status === 'active' ? 'text-green-600' : 'text-gray-600'
                          }`}>
                                {instructor.name.charAt(0)}
                              </span>
                          </div>
                            <div>
                          <h4 className="text-lg font-semibold text-gray-900">{instructor.name}</h4>
                          <p className="text-sm text-gray-500">
                            {instructor.experience} 경력 • {instructor.specialties.join(', ')} 전문
                          </p>
                          <p className="text-xs text-gray-400">
                            {instructor.region} {instructor.district} • {instructor.center}
                          </p>
                        </div>
                    </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">담당 학생</p>
                          <p className="text-lg font-semibold text-gray-900">{instructor.students}명</p>
                  </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">평점</p>
                          <p className="text-lg font-semibold text-yellow-600">{instructor.rating}</p>
                      </div>
                            <div className="flex space-x-2">
                          <button 
                              onClick={() => {
                                setSelectedInstructor(instructor);
                              setShowInstructorDetail(true);
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            상세보기
                          </button>
                          <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                            수정
                          </button>
                            </div>
                              </div>
                          </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-lg mb-2">🔍</div>
                    <p className="text-gray-500">선택된 필터에 해당하는 강사가 없습니다.</p>
                    <p className="text-sm text-gray-400 mt-1">다른 필터를 선택해보세요.</p>
                        </div>
                )}
                    </div>
                  </div>
              </div>
            )}

        {activeTab === 'schedule' && (
              <div className="space-y-6">
            {/* 지역 필터 - 혼합 구조 */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">지역 필터</h3>
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-700">검색 기준:</label>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSearchMode('center')}
                      className={`px-3 py-1 text-sm rounded-md ${
                        searchMode === 'center' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      센터 기준
                    </button>
                    <button
                      onClick={() => setSearchMode('address')}
                      className={`px-3 py-1 text-sm rounded-md ${
                        searchMode === 'address' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      주소지 기준
                  </button>
                </div>
                    </div>
                  </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1단계: 시/도 선택 */}
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

                {/* 2단계: 시군구 선택 (버튼 나열) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">시군구</label>
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
                  <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-300 rounded-md p-2">
                    {selectedRegions.length > 0 ? (
                      selectedRegions.flatMap(sido => regionData[sido] || []).map(district => (
                  <button
                          key={district}
                          onClick={() => handleDistrictToggle(district)}
                          className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                            selectedDistricts.includes(district)
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {district}
                          {selectedDistricts.includes(district) && (
                            <span className="ml-2 text-xs">✓</span>
                          )}
                  </button>
                      ))
                    ) : (
                      <div className="text-gray-500 text-sm py-4 text-center">
                        먼저 시/도를 선택해주세요
                              </div>
                    )}
                              </div>
                            </div>
                          </div>
                          
              {/* 센터 표시 */}
              {selectedDistricts.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">해당 센터</label>
                    <button
                      onClick={() => {
                        const allCenters = selectedDistricts.flatMap(district => centerData[district] || []);
                        setSelectedCenters(allCenters);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      모두 선택
                    </button>
                  </div>
                  <select
                    multiple
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => {
                      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                      setSelectedCenters(selectedOptions);
                    }}
                    value={selectedCenters}
                  >
                    {selectedDistricts.flatMap(district => centerData[district] || []).map(center => (
                      <option key={center} value={center}>
                        {center}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Ctrl+클릭으로 다중 선택</p>
                              </div>
              )}
                          </div>
                          
            {/* 현재 선택된 필터 */}
            {(selectedRegions.length > 0 || selectedDistricts.length > 0 || selectedCenters.length > 0) && (
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-blue-900">현재 선택된 필터</h4>
                  <button
                    onClick={() => {
                      setSelectedRegions([]);
                      setSelectedDistricts([]);
                      setSelectedCenters([]);
                    }}
                    className="px-3 py-1 bg-red-100 text-red-800 text-xs rounded-full hover:bg-red-200 transition-colors"
                  >
                    모든 필터 초기화
                  </button>
                              </div>
                            <div className="space-y-2">
                  {selectedRegions.length > 0 && (
                              <div>
                      <span className="text-xs font-medium text-blue-700">시도:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedRegions.map(region => (
                          <span key={region} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {region}
                          </span>
                        ))}
                              </div>
                              </div>
                  )}
                  {selectedDistricts.length > 0 && (
                              <div>
                      <span className="text-xs font-medium text-green-700">시군구:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedDistricts.map(district => (
                          <span key={district} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            {district}
                          </span>
                        ))}
                              </div>
                              </div>
                  )}
                  {selectedCenters.length > 0 && (
                              <div>
                      <span className="text-xs font-medium text-purple-700">센터:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedCenters.map(center => (
                          <span key={center} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                            {center}
                          </span>
                        ))}
                            </div>
                          </div>
                  )}
                            </div>
                        </div>
            )}

            {/* 달력 및 날짜 선택 */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">스케줄 달력</h3>
                <div className="flex items-center space-x-2">
                      <button
                    onClick={() => setViewMode('month')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      viewMode === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    월간
                      </button>
                        <button
                    onClick={() => setViewMode('week')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      viewMode === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    주간
                        </button>
                      <button
                    onClick={() => setViewMode('day')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      viewMode === 'day' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    일간
                      </button>
                  </div>
              </div>

              {/* 달력 헤더 */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => {
                    const newDate = new Date(selectedDate);
                    if (viewMode === 'month') {
                      newDate.setMonth(newDate.getMonth() - 1);
                    } else if (viewMode === 'week') {
                      newDate.setDate(newDate.getDate() - 7);
                    } else {
                      newDate.setDate(newDate.getDate() - 1);
                    }
                    setSelectedDate(newDate);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-md"
                >
                  ←
                </button>
                <div className="flex items-center space-x-4">
                  <h4 className="text-lg font-medium text-gray-900">
                    {selectedDate.getFullYear()}년 {selectedDate.getMonth() + 1}월
                  </h4>
                  <button
                    onClick={() => setSelectedDate(new Date())}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    오늘
                  </button>
                    </div>
                <button
                  onClick={() => {
                    const newDate = new Date(selectedDate);
                    if (viewMode === 'month') {
                      newDate.setMonth(newDate.getMonth() + 1);
                    } else if (viewMode === 'week') {
                      newDate.setDate(newDate.getDate() + 7);
                    } else {
                      newDate.setDate(newDate.getDate() + 1);
                    }
                    setSelectedDate(newDate);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-md"
                >
                  →
                </button>
                </div>
                
              {/* 달력 범례 */}
              <div className="flex items-center justify-center space-x-4 mb-4 text-xs">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-red-50 border border-red-200 rounded"></div>
                  <span>휴가 신청</span>
                        </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-blue-100 rounded"></div>
                  <span>오늘</span>
                                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-blue-600 rounded"></div>
                  <span>선택된 날짜</span>
                              </div>
                            </div>

              {/* 달력 그리드 */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                    {day}
                            </div>
                ))}
                {(() => {
                  const year = selectedDate.getFullYear();
                  const month = selectedDate.getMonth();
                  const firstDay = new Date(year, month, 1);
                  const lastDay = new Date(year, month + 1, 0);
                  const startDate = new Date(firstDay);
                  startDate.setDate(startDate.getDate() - firstDay.getDay());
                  
                  const days = [];
                  for (let i = 0; i < 42; i++) {
                    const date = new Date(startDate);
                    date.setDate(startDate.getDate() + i);
                    days.push(date);
                  }
                  
                  return days.map((date, i) => {
                    const isCurrentMonth = date.getMonth() === month;
                    const isToday = date.toDateString() === new Date().toDateString();
                    const isSelected = date.toDateString() === selectedDate.toDateString();
                    const hasVacation = Math.random() > 0.9; // 랜덤으로 휴가 있는 날 표시
                    
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedDate(date)}
                        className={`p-2 text-sm rounded-md hover:bg-gray-100 ${
                          isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                        } ${
                          isToday ? 'bg-blue-100 text-blue-600' : ''
                        } ${
                          isSelected ? 'bg-blue-600 text-white' : ''
                        } ${
                          hasVacation ? 'bg-red-50 border border-red-200' : ''
                        }`}
                      >
                        {date.getDate()}
                        {hasVacation && (
                          <div className="w-1 h-1 bg-red-500 rounded-full mx-auto mt-1" title="휴가 신청 있음"></div>
                        )}
                      </button>
                    );
                  });
                })()}
                          </div>
                          </div>
                            
            {/* 선택된 날짜의 수업 */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedDate.toLocaleDateString('ko-KR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    weekday: 'long'
                  })} 수업
                </h3>
                <div className="text-sm text-gray-500">
                  총 {filteredInstructors.length}명의 강사
                          </div>
                        </div>

              {filteredInstructors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredInstructors.map(instructor => (
                    <div key={instructor.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{instructor.name}</h4>
                        <span className="text-sm text-gray-500">{instructor.center}</span>
                          </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>오전 10:00 - 11:00 (초급반)</p>
                        <p>오후 2:00 - 3:00 (중급반)</p>
                        <p>오후 4:00 - 5:00 (고급반)</p>
                          </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs text-gray-500">평점: {instructor.rating}/5.0</span>
                        <span className="text-xs text-gray-500">학생: {instructor.students}명</span>
                        </div>
                      </div>
                  ))}
                                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>선택된 지역에 해당하는 강사가 없습니다.</p>
                  <p className="text-sm mt-1">다른 지역을 선택해보세요.</p>
                              </div>
              )}
                            </div>
                            
            {/* 주간 스케줄 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">주간 스케줄</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">강사</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">월</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">화</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">수</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">목</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">금</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">토</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">일</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredInstructors.map(instructor => (
                      <tr key={instructor.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {instructor.name}
                        </td>
                        {['월', '화', '수', '목', '금', '토', '일'].map(day => (
                          <td key={day} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="space-y-1">
                              <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">10:00-11:00</div>
                              <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">14:00-15:00</div>
                              <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">16:00-17:00</div>
                                </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                              </div>
                            </div>
                            
            {/* 휴가 현황 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">휴가 현황</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-red-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                          <span className="text-white text-sm font-medium">🚫</span>
                            </div>
                          </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-red-800">현재 휴가</p>
                        <p className="text-2xl font-bold text-red-900">
                          {vacationRequests.filter(req => req.status === 'approved').length}명
                        </p>
                </div>
                      </div>
                    </div>
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                          <span className="text-white text-sm font-medium">⏰</span>
                      </div>
                    </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-yellow-800">예정 휴가</p>
                        <p className="text-2xl font-bold text-yellow-900">
                          {vacationRequests.filter(req => req.status === 'pending').length}명
                        </p>
                      </div>
                    </div>
                      </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                          <span className="text-white text-sm font-medium">📋</span>
                    </div>
                  </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-blue-800">신청 대기</p>
                        <p className="text-2xl font-bold text-blue-900">
                          {vacationRequests.filter(req => req.status === 'pending').length}명
                        </p>
                </div>
              </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">휴가 신청 현황</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">강사명</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">센터</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">휴가 기간</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">사유</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">신청일</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">액션</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {vacationRequests
                          .filter(request => {
                            // 선택된 센터의 강사만 표시
                            if (selectedCenters.length > 0) {
                              return selectedCenters.includes(request.center);
                            }
                            return true;
                          })
                          .map(request => (
                          <tr key={request.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {request.instructorName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {request.center}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {request.startDate} ~ {request.endDate}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {request.reason}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                request.status === 'approved' ? 'bg-green-100 text-green-800' :
                                request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {request.status === 'approved' ? '승인' :
                                 request.status === 'rejected' ? '거부' : '대기'}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {request.submittedDate}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {request.status === 'pending' && (
                                <div className="flex space-x-2">
                                  <button className="text-green-600 hover:text-green-900">승인</button>
                                  <button className="text-red-600 hover:text-red-900">거부</button>
                              </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                                </div>
                              </div>
                            </div>
                            </div>
                          </div>
            )}

        {activeTab === 'performance' && (
              <div className="space-y-6">
            {/* 성과 요약 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">👥</span>
                              </div>
                                </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">총 강사 수</p>
                    <p className="text-2xl font-bold text-gray-900">{filteredInstructors.length}명</p>
                                </div>
                                </div>
                                </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">⭐</span>
                              </div>
                            </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">평균 평점</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(filteredInstructors.reduce((sum, instructor) => sum + instructor.rating, 0) / filteredInstructors.length).toFixed(1)}
                    </p>
                                </div>
                                </div>
                                </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">🎓</span>
                              </div>
                            </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">총 학생 수</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {filteredInstructors.reduce((sum, instructor) => sum + instructor.students, 0)}명
                    </p>
                                </div>
                                </div>
                                </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">💰</span>
                              </div>
                            </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">평균 급여</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round(filteredInstructors.reduce((sum, instructor) => sum + instructor.salary, 0) / filteredInstructors.length / 10000)}만원
                    </p>
                            </div>
                          </div>
                  </div>
                </div>
                
            {/* 강사별 성과 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">강사별 성과</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">강사명</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">센터</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">학생 수</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">평점</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">경력</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">급여</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">성과</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredInstructors.map(instructor => (
                      <tr key={instructor.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {instructor.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {instructor.center}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {instructor.students}명
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <span className="text-yellow-400">⭐</span>
                            <span className="ml-1">{instructor.rating}</span>
                      </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {instructor.experience}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {Math.round(instructor.salary / 10000)}만원
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            instructor.rating >= 4.5 ? 'bg-green-100 text-green-800' :
                            instructor.rating >= 4.0 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {instructor.rating >= 4.5 ? '우수' :
                             instructor.rating >= 4.0 ? '양호' : '보통'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                    </div>
                </div>
              </div>
            )}

            {activeTab === 'evaluation' && (
              <div className="space-y-6">
            {/* 평가 현황 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">📝</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">이번 달 평가</p>
                    <p className="text-2xl font-bold text-gray-900">12건</p>
                </div>
                      </div>
                    </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">✅</span>
                      </div>
                    </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">완료된 평가</p>
                    <p className="text-2xl font-bold text-gray-900">8건</p>
                      </div>
                    </div>
                      </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">⏳</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">대기 중</p>
                    <p className="text-2xl font-bold text-gray-900">4건</p>
                </div>
                              </div>
                              </div>
                            </div>

            {/* 평가 목록 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">평가 목록</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">강사명</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">평가자</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">평가 항목</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">점수</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">평가일</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredInstructors.slice(0, 5).map(instructor => (
                      <tr key={instructor.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {instructor.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          학생 {Math.floor(Math.random() * 20) + 1}명
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          수업 품질, 친절도, 전문성
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {instructor.rating}/5.0
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            완료
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          2024-01-15
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                              </div>
                            </div>
                          </div>
            )}

        {activeTab === 'approval' && (
              <div className="space-y-6">
            {/* 승인 현황 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">⏳</span>
                                </div>
                                </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">승인 대기</p>
                    <p className="text-2xl font-bold text-gray-900">{pendingInstructors.length}명</p>
                              </div>
                                </div>
                                </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">✅</span>
                              </div>
                                </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">이번 달 승인</p>
                    <p className="text-2xl font-bold text-gray-900">3명</p>
                                </div>
                              </div>
                            </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">❌</span>
                                </div>
                                </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">이번 달 거부</p>
                    <p className="text-2xl font-bold text-gray-900">1명</p>
                                </div>
                                </div>
                              </div>
                            </div>
                            
            {/* 승인 대기 목록 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">승인 대기 목록</h3>
                          <div className="space-y-4">
                {pendingInstructors.map(instructor => (
                  <div key={instructor.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-4">
                                <div>
                            <h4 className="text-lg font-medium text-gray-900">{instructor.name}</h4>
                            <p className="text-sm text-gray-500">{instructor.email}</p>
                                  </div>
                          <div className="text-sm text-gray-500">
                            <p>연락처: {instructor.phone}</p>
                            <p>경력: {instructor.experience}</p>
                                  </div>
                                </div>
                              
                        <div className="mb-4">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">자격증</h5>
                          <div className="space-y-1">
                            {instructor.certifications.map((cert, index) => (
                              <div key={index} className="text-sm text-gray-600">
                                • {cert.name} ({cert.issuer}) - {cert.issueDate}
                                  </div>
                            ))}
                              </div>
                            </div>
                            
                        <div className="mb-4">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">경력</h5>
                          <p className="text-sm text-gray-600">{instructor.career}</p>
                </div>
                
                        <div className="text-sm text-gray-500">
                          신청일: {instructor.submittedDate}
                    </div>
                  </div>
                  
                      <div className="flex space-x-2 ml-4">
                        <button className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700">
                          승인
                        </button>
                        <button className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700">
                          거부
                        </button>
                        </div>
                      </div>
                    </div>
                ))}
                  </div>
                    </div>
                    </div>
        )}

        {/* 강사 상세보기 모달 */}
        {showInstructorDetail && selectedInstructor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">강사 상세 정보</h3>
                <button
                  onClick={() => setShowInstructorDetail(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
                    </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-900">기본 정보</h4>
                    <div className="space-y-3">
                              <div>
                        <label className="text-sm font-medium text-gray-500">이름</label>
                        <p className="text-lg font-semibold text-gray-900">{selectedInstructor.name}</p>
                    </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">경력</label>
                        <p className="text-sm text-gray-900">{selectedInstructor.experience}</p>
                    </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">전문 분야</label>
                        <p className="text-sm text-gray-900">{selectedInstructor.specialties.join(', ')}</p>
                        </div>
                    </div>
                  </div>
                  
                          <div className="space-y-4">
                    <h4 className="text-md font-semibold text-gray-900">연락처 정보</h4>
                            <div className="space-y-3">
                              <div>
                        <label className="text-sm font-medium text-gray-500">이메일</label>
                        <p className="text-sm text-gray-900">{selectedInstructor.email}</p>
                    </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">전화번호</label>
                        <p className="text-sm text-gray-900">{selectedInstructor.phone}</p>
                  </div>
                              <div>
                        <label className="text-sm font-medium text-gray-500">거주지 주소</label>
                        <p className="text-sm text-gray-900">{selectedInstructor.address}</p>
                </div>
                              <div>
                        <label className="text-sm font-medium text-gray-500">급여</label>
                        <p className="text-sm text-gray-900">{selectedInstructor.salary.toLocaleString()}원</p>
              </div>
          </div>
        </div>
      </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-md font-semibold text-gray-900 mb-4">자격증 보유 현황</h4>
                  <div className="space-y-3">
                    {selectedInstructor.certifications.map((cert, index) => (
                      <div key={index} className="p-3 rounded-lg border bg-green-50 border-green-200">
                              <div className="flex items-center justify-between">
                                <div>
                            <h5 className="font-medium text-gray-900">{cert.name}</h5>
                            <p className="text-sm text-gray-600">{cert.issuer}</p>
                            <p className="text-xs text-gray-500">
                              발급일: {cert.issueDate} • 만료일: {cert.expiryDate}
                            </p>
            </div>
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            유효
                    </span>
                  </div>
                </div>
                    ))}
              </div>
            </div>
            
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-md font-semibold text-gray-900 mb-4">성과 정보</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{selectedInstructor.students}</div>
                      <div className="text-sm text-gray-600">담당 학생 수</div>
            </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{selectedInstructor.rating}</div>
                      <div className="text-sm text-gray-600">평균 평점</div>
          </div>
        </div>
            </div>
            
                <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                    onClick={() => setShowInstructorDetail(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                닫기
              </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    정보 수정
              </button>
            </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
