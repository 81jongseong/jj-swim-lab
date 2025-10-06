/**
 * 강사 관리 페이지
 * 최고 관리자가 강사 정보, 성과, 스케줄을 종합적으로 관리하는 페이지
 * 연동 데이터: 강사 정보, 자격증, 급여, 스케줄, 성과 데이터
 * 연동 파일: useAuth.tsx, 강사 관련 API
 */

"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import StatCard from '@/components/StatCard';
import Button from '@/components/Button';
import InstructorScheduleCard from '@/components/InstructorScheduleCard';

export default function InstructorManagementPage() {
  const { user, hasUserType } = useAuth();
  const [isLoading, setIsLoading] = useState(false); // 초기 로딩 비활성화
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [showInstructorDetail, setShowInstructorDetail] = useState(false);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [selectedDistricts, setSelectedDistricts] = useState([]);
  const [selectedCenters, setSelectedCenters] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week', 'day'
  const [searchMode, setSearchMode] = useState('center'); // 'center', 'address'
  const [showDeactivationModal, setShowDeactivationModal] = useState(false);
  const [deactivationReason, setDeactivationReason] = useState('');
  const [deactivationDetails, setDeactivationDetails] = useState('');
  const [vacationFilter, setVacationFilter] = useState<'all' | 'current' | 'scheduled' | 'pending'>('all');
  const [vacationPeriod, setVacationPeriod] = useState<'week' | 'month' | 'quarter' | 'custom'>('month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [evaluationFilter, setEvaluationFilter] = useState<'all' | 'monthly' | 'completed' | 'pending'>('all');
  const [approvalFilter, setApprovalFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM 형식
  const [showEvaluationDetail, setShowEvaluationDetail] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<any>(null);

  // 강사 비활성화 처리 함수
  const handleDeactivateInstructor = async () => {
    if (!selectedInstructor || !deactivationReason) {
      alert('비활성화 사유를 선택해주세요.');
      return;
    }

    try {
      // 실제 API 호출 (임시로 콘솔 로그)
      console.log('강사 비활성화:', {
        instructorId: selectedInstructor.id,
        instructorName: selectedInstructor.name,
        reason: deactivationReason,
        details: deactivationDetails,
        deactivatedBy: user?.name || '관리자',
        deactivatedAt: new Date().toISOString()
      });

      // 성공 메시지
      alert(`${selectedInstructor.name} 강사가 비활성화되었습니다.`);
      
      // 모달 닫기 및 상태 초기화
      setShowDeactivationModal(false);
      setShowInstructorDetail(false);
      setDeactivationReason('');
      setDeactivationDetails('');
      setSelectedInstructor(null);

      // 강사 목록 새로고침 (실제로는 API 호출)
      // loadInstructors();
      
    } catch (error) {
      console.error('강사 비활성화 오류:', error);
      alert('강사 비활성화 중 오류가 발생했습니다.');
    }
  };

  // 샘플 강사 데이터 (최적화됨 - 지연 로딩)
  const [sampleInstructors, setSampleInstructors] = useState([]);

  // 강사 데이터 지연 로딩 (최적화됨)
  useEffect(() => {
    const loadInstructorData = () => {
      const instructors = [
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
          evaluationCount: 4,
          specialties: ['자유형', '배영', '접영'],
          certifications: [
            {
              name: '수영지도사 2급',
              issuer: '대한수영연맹',
              issueDate: '2020-03-15',
              expiryDate: '2025-03-15',
              status: 'valid'
            }
          ],
          emergencyContact: {
            name: '김영희',
            relationship: '어머니',
            phone: '010-9876-5432'
          },
          salary: {
            base: 3000000,
            bonus: 500000,
            total: 3500000
          }
        },
        {
          id: 2,
          name: '이영수',
          email: 'lee.swim@email.com',
          phone: '010-2345-6789',
          address: '서울시 강남구 테헤란로 456, 201동 1502호',
          center: '강남센터',
          region: '서울시',
          district: '강남구',
          status: 'active',
          experience: '3년',
          rating: 4.6,
          students: 32,
          evaluationCount: 16,
          specialties: ['평영', '접영'],
          certifications: [
            {
              name: '수영지도사 3급',
              issuer: '대한수영연맹',
              issueDate: '2021-06-20',
              expiryDate: '2026-06-20',
              status: 'valid'
            }
          ],
          emergencyContact: {
            name: '이철수',
            relationship: '아버지',
            phone: '010-8765-4321'
          },
          salary: {
            base: 2500000,
            bonus: 300000,
            total: 2800000
          }
        }
      ];
      
      setSampleInstructors(instructors);
    };

    // 지연 로딩 (100ms 후)
    const timer = setTimeout(loadInstructorData, 100);
    return () => clearTimeout(timer);
  }, []);

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

  // 휴가 신청 데이터 (2025년 10월 기준)
  const vacationRequests = [
    {
      id: 1,
      instructorName: '김수영',
      center: '홍대센터',
      startDate: '2025-10-01',
      endDate: '2025-10-05',
      reason: '개인 사정',
      status: 'approved',
      submittedDate: '2025-09-25'
    },
    {
      id: 2,
      instructorName: '이영수',
      center: '강남센터',
      startDate: '2025-10-15',
      endDate: '2025-10-17',
      reason: '가족 행사',
      status: 'approved',
      submittedDate: '2025-10-01'
    },
    {
      id: 3,
      instructorName: '박수영',
      center: '송파센터',
      startDate: '2025-10-20',
      endDate: '2025-10-22',
      reason: '병가',
      status: 'pending',
      submittedDate: '2025-10-05'
    },
    {
      id: 4,
      instructorName: '최해영',
      center: '수원센터',
      startDate: '2025-11-01',
      endDate: '2025-11-07',
      reason: '연차',
      status: 'approved',
      submittedDate: '2025-10-10'
    },
    {
      id: 5,
      instructorName: '정민수',
      center: '성남센터',
      startDate: '2025-10-25',
      endDate: '2025-10-28',
      reason: '경조사',
      status: 'pending',
      submittedDate: '2025-10-18'
    },
    {
      id: 6,
      instructorName: '한지우',
      center: '강남센터',
      startDate: '2025-09-28',
      endDate: '2025-10-02',
      reason: '개인 휴가',
      status: 'approved',
      submittedDate: '2025-09-20'
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
      submittedDate: '2024-01-05',
      approvalStatus: 'pending',
      approvalDate: null
    }
  ];

  // 승인/거부된 강사 데이터 (월별)
  const approvedInstructors = [
    { id: 201, name: '강승인1', email: 'approved1@email.com', approvalDate: '2025-10-01', status: 'approved', center: '강남센터' },
    { id: 202, name: '강승인2', email: 'approved2@email.com', approvalDate: '2025-10-05', status: 'approved', center: '서초센터' },
    { id: 203, name: '강승인3', email: 'approved3@email.com', approvalDate: '2025-10-10', status: 'approved', center: '송파센터' },
    { id: 204, name: '이거부1', email: 'rejected1@email.com', approvalDate: '2025-10-03', status: 'rejected', center: '홍대센터', rejectReason: '자격 미달' }
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
            <StatCard
              title="전체 강사"
              value={`${sampleInstructors.length}명`}
              icon="👥"
              color="blue"
              subtitle="등록된 강사"
              onClick={() => setActiveTab('instructors')}
            />
            <StatCard
              title="활성 강사"
              value={`${sampleInstructors.filter(i => i.status === 'active').length}명`}
              icon="✅"
              color="green"
              subtitle="현재 활동 중"
              onClick={() => setActiveTab('instructors')}
            />
            <StatCard
              title="평균 평점"
              value={(sampleInstructors.reduce((sum, i) => sum + i.rating, 0) / sampleInstructors.length).toFixed(1)}
              icon="⭐"
              color="yellow"
              subtitle="강사 평균 점수"
              onClick={() => setActiveTab('evaluation')}
            />
            <StatCard
              title="총 학생 수"
              value={`${sampleInstructors.reduce((sum, i) => sum + i.students, 0)}명`}
              icon="🎓"
              color="purple"
              subtitle="전체 수강생"
              href="/admin/users"
            />
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
              <Button variant="primary" size="md">
                + 새 강사 등록
              </Button>
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
                    <Button
                      onClick={() => setSearchMode('center')}
                      variant={searchMode === 'center' ? 'primary' : 'ghost'}
                      size="sm"
                    >
                      센터 기준
                    </Button>
                    <Button
                      onClick={() => setSearchMode('address')}
                      variant={searchMode === 'address' ? 'primary' : 'ghost'}
                      size="sm"
                    >
                      주소지 기준
                    </Button>
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
                  <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto border border-gray-300 rounded-md p-2">
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
                      <div className="text-gray-500 text-sm py-4 text-center w-full">
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
                  <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto border border-gray-300 rounded-md p-2">
                    {selectedDistricts.flatMap(district => centerData[district] || []).map(center => (
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
                      ))}
                    </div>
                              </div>
              )}
                  </div>

            {/* 현재 선택된 필터 */}
            {(selectedRegions.length > 0 || selectedDistricts.length > 0 || selectedCenters.length > 0) && (
              <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-blue-900">현재 선택된 필터</h4>
                  <Button
                    onClick={() => {
                      setSelectedRegions([]);
                      setSelectedDistricts([]);
                      setSelectedCenters([]);
                    }}
                    variant="danger"
                    size="sm"
                  >
                    모든 필터 초기화
                  </Button>
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
                      <Button
                    onClick={() => setViewMode('month')}
                    variant={viewMode === 'month' ? 'primary' : 'ghost'}
                    size="sm"
                  >
                    월간
                      </Button>
                        <Button
                    onClick={() => setViewMode('week')}
                    variant={viewMode === 'week' ? 'primary' : 'ghost'}
                    size="sm"
                  >
                    주간
                        </Button>
                      <Button
                    onClick={() => setViewMode('day')}
                    variant={viewMode === 'day' ? 'primary' : 'ghost'}
                    size="sm"
                  >
                    일간
                      </Button>
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
                    <InstructorScheduleCard
                      key={instructor.id}
                      instructor={instructor}
                      onClick={() => {
                        setSelectedInstructor(instructor);
                        setShowInstructorDetail(true);
                      }}
                    />
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
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-gray-900">휴가 현황</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">기간:</span>
                            <Button
                      onClick={() => setVacationPeriod('week')}
                      variant={vacationPeriod === 'week' ? 'primary' : 'ghost'}
                              size="sm"
                            >
                      1주일
                            </Button>
                            <Button
                      onClick={() => setVacationPeriod('month')}
                      variant={vacationPeriod === 'month' ? 'primary' : 'ghost'}
                              size="sm"
                    >
                      1개월
                    </Button>
                    <Button
                      onClick={() => setVacationPeriod('quarter')}
                      variant={vacationPeriod === 'quarter' ? 'primary' : 'ghost'}
                      size="sm"
                    >
                      3개월
                    </Button>
                    <Button
                      onClick={() => setVacationPeriod('custom')}
                      variant={vacationPeriod === 'custom' ? 'primary' : 'ghost'}
                      size="sm"
                    >
                      직접 입력
                            </Button>
                            </div>
                </div>

                {/* 직접 입력 날짜 범위 */}
                {vacationPeriod === 'custom' && (
                  <div className="flex items-center space-x-3 bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-gray-700 font-medium">시작일:</label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                  </div>
                    <span className="text-gray-500">~</span>
                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-gray-700 font-medium">종료일:</label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    {customStartDate && customEndDate && (
                      <span className="text-xs text-blue-600 font-medium">
                        {Math.ceil((new Date(customEndDate).getTime() - new Date(customStartDate).getTime()) / (1000 * 60 * 60 * 24))}일
                      </span>
                )}
              </div>
            )}
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <StatCard
                    title="현재 휴가"
                    value={`${vacationRequests.filter(req => {
                      if (req.status !== 'approved') return false;
                      const today = new Date();
                      const start = new Date(req.startDate);
                      const end = new Date(req.endDate);
                      return start <= today && end >= today;
                    }).length}명`}
                    icon="🚫"
                    color="red"
                    subtitle="휴가 중인 강사"
                    onClick={() => setVacationFilter(vacationFilter === 'current' ? 'all' : 'current')}
                  />
                  
                  <StatCard
                    title="예정 휴가"
                    value={`${vacationRequests.filter(req => {
                      if (req.status !== 'approved') return false;
                      const today = new Date();
                      const start = new Date(req.startDate);
                      let periodEnd = new Date();
                      
                      if (vacationPeriod === 'week') {
                        periodEnd.setDate(today.getDate() + 7);
                      } else if (vacationPeriod === 'month') {
                        periodEnd.setMonth(today.getMonth() + 1);
                      } else if (vacationPeriod === 'quarter') {
                        periodEnd.setMonth(today.getMonth() + 3);
                      } else if (vacationPeriod === 'custom' && customEndDate) {
                        periodEnd = new Date(customEndDate);
                      }
                      
                      return start > today && start <= periodEnd;
                    }).length}명`}
                    icon="⏰"
                    color="yellow"
                    subtitle={vacationPeriod === 'custom' && customStartDate && customEndDate 
                      ? `${customStartDate} ~ ${customEndDate}` 
                      : `${vacationPeriod === 'week' ? '1주일' : vacationPeriod === 'month' ? '1개월' : '3개월'} 내 예정`}
                    onClick={() => setVacationFilter(vacationFilter === 'scheduled' ? 'all' : 'scheduled')}
                  />
                  
                  <StatCard
                    title="신청 대기"
                    value={`${vacationRequests.filter(req => req.status === 'pending').length}명`}
                    icon="📋"
                    color="blue"
                    subtitle="승인 대기 중"
                    onClick={() => setVacationFilter(vacationFilter === 'pending' ? 'all' : 'pending')}
                      />
                    </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-md font-medium text-gray-900">휴가 신청 현황</h4>
                    {vacationFilter !== 'all' && (
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {vacationFilter === 'current' && '현재 휴가 중'}
                          {vacationFilter === 'scheduled' && '예정 휴가'}
                          {vacationFilter === 'pending' && '신청 대기'}
                        </span>
                        <Button
                          onClick={() => setVacationFilter('all')}
                          variant="ghost"
                          size="sm"
                        >
                          전체 보기
                        </Button>
                  </div>
                    )}
                </div>
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
                            if (selectedCenters.length > 0 && !selectedCenters.includes(request.center)) {
                              return false;
                            }
                            
                            const today = new Date();
                            const start = new Date(request.startDate);
                            const end = new Date(request.endDate);
                            
                            // 휴가 상태 필터 적용 (우선 순위)
                            if (vacationFilter === 'current') {
                              return request.status === 'approved' && start <= today && end >= today;
                            } else if (vacationFilter === 'pending') {
                              return request.status === 'pending';
                            } else if (vacationFilter === 'scheduled') {
                              // 예정 휴가만 기간 필터 적용
                              let periodEnd = new Date();
                              
                              if (vacationPeriod === 'week') {
                                periodEnd.setDate(today.getDate() + 7);
                              } else if (vacationPeriod === 'month') {
                                periodEnd.setMonth(today.getMonth() + 1);
                              } else if (vacationPeriod === 'quarter') {
                                periodEnd.setMonth(today.getMonth() + 3);
                              } else if (vacationPeriod === 'custom' && customEndDate) {
                                periodEnd = new Date(customEndDate);
                              }
                              
                              return request.status === 'approved' && start > today && start <= periodEnd;
                            }
                            
                            // 'all' 필터일 때는 기간 필터 적용 안 함
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="총 강사 수"
                value={`${filteredInstructors.length}명`}
                icon="👥"
                color="blue"
                subtitle="등록된 강사"
                onClick={() => setActiveTab('instructors')}
              />
              
              <StatCard
                title="평균 평점"
                value={(filteredInstructors.reduce((sum, instructor) => sum + instructor.rating, 0) / filteredInstructors.length).toFixed(1)}
                icon="⭐"
                color="green"
                subtitle="강사 평균 점수"
                onClick={() => setActiveTab('evaluation')}
              />
              
              <StatCard
                title="총 학생 수"
                value={`${filteredInstructors.reduce((sum, instructor) => sum + instructor.students, 0)}명`}
                icon="🎓"
                color="purple"
                subtitle="전체 수강생"
                href="/admin/users"
              />
              
              <StatCard
                title="평균 급여"
                value={`${Math.round(filteredInstructors.reduce((sum, instructor) => sum + instructor.salary, 0) / filteredInstructors.length / 10000)}만원`}
                icon="💰"
                color="yellow"
                subtitle="강사 평균"
              />
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
            {/* 월 선택 */}
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <div className="flex items-center space-x-3">
                <label className="text-sm font-medium text-gray-700">조회 월:</label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-xs text-gray-500">
                  {new Date(selectedMonth + '-01').toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}
                </span>
                                </div>
                                </div>
            
            {/* 평가 현황 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                title={`${selectedMonth.slice(5)}월 평가`}
                value={`${filteredInstructors.reduce((sum, i) => sum + (i.evaluationCount || 0), 0)}건`}
                icon="📝"
                color="blue"
                subtitle="전체 평가 건수"
                onClick={() => setEvaluationFilter(evaluationFilter === 'monthly' ? 'all' : 'monthly')}
              />
              
              <StatCard
                title={`${selectedMonth.slice(5)}월 완료`}
                value={`${filteredInstructors.reduce((sum, i) => sum + Math.ceil((i.evaluationCount || 0) * 0.75), 0)}건`}
                icon="✅"
                color="green"
                subtitle="평가 완료"
                onClick={() => setEvaluationFilter(evaluationFilter === 'completed' ? 'all' : 'completed')}
              />
              
              <StatCard
                title={`${selectedMonth.slice(5)}월 대기`}
                value={`${filteredInstructors.reduce((sum, i) => {
                  const total = i.evaluationCount || 0;
                  const completed = Math.ceil(total * 0.75);
                  return sum + (total - completed);
                }, 0)}건`}
                icon="⏳"
                color="yellow"
                subtitle="평가 대기"
                onClick={() => setEvaluationFilter(evaluationFilter === 'pending' ? 'all' : 'pending')}
              />
                            </div>
                            
            {/* 평가 목록 */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">평가 목록</h3>
                {evaluationFilter !== 'all' && (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {evaluationFilter === 'monthly' && '이번 달 평가'}
                      {evaluationFilter === 'completed' && '완료된 평가'}
                      {evaluationFilter === 'pending' && '대기 중'}
                    </span>
                              <Button
                      onClick={() => setEvaluationFilter('all')}
                      variant="ghost"
                                size="sm"
                              >
                      전체 보기
                              </Button>
                  </div>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">강사명</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">센터</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">평가 건수</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">평균 평점</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">완료</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">대기</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">액션</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredInstructors
                      .filter(instructor => {
                        const totalEvals = instructor.evaluationCount || 0;
                        const completedEvals = Math.ceil(totalEvals * 0.75); // 75% 완료
                        const pendingEvals = totalEvals - completedEvals;
                        
                        if (evaluationFilter === 'completed') return completedEvals > 0;
                        if (evaluationFilter === 'pending') return pendingEvals > 0;
                        return totalEvals > 0;
                      })
                      .map((instructor) => {
                        const totalEvals = instructor.evaluationCount || 0;
                        const completedEvals = Math.ceil(totalEvals * 0.75); // 75% 완료
                        const pendingEvals = totalEvals - completedEvals;
                        
                        return (
                      <tr key={instructor.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {instructor.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {instructor.center}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="font-bold text-blue-600">{totalEvals}건</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="font-bold text-green-600">{instructor.rating}</span>/5.0
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            {completedEvals}건
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                            {pendingEvals}건
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => {
                              setSelectedEvaluation({
                                instructor: instructor,
                                evaluations: Array.from({ length: totalEvals }, (_, i) => ({
                                  id: i + 1,
                                  evaluator: `학생${i + 1}`,
                                  category: ['수업 품질', '친절도', '전문성'][i % 3],
                                  score: (Math.random() * 2 + 3).toFixed(1),
                                  comment: ['매우 만족합니다', '좋은 강사님입니다', '수영 실력이 많이 늘었어요', '설명이 명확해요', '친절하십니다'][i % 5],
                                  date: `2025-10-${String((i % 30) + 1).padStart(2, '0')}`,
                                  status: i >= completedEvals ? 'pending' : 'completed'
                                }))
                              });
                              setShowEvaluationDetail(true);
                            }}
                          >
                            📋 상세보기
                              </Button>
                        </td>
                      </tr>
                    );
                  })}
                  </tbody>
                </table>
                </div>
                </div>
              </div>
            )}

        {activeTab === 'approval' && (
              <div className="space-y-6">
            {/* 월 선택 */}
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <div className="flex items-center space-x-3">
                <label className="text-sm font-medium text-gray-700">조회 월:</label>
                    <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-xs text-gray-500">
                  {new Date(selectedMonth + '-01').toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}
                                </span>
                              </div>
                                </div>
            
            {/* 승인 현황 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                title="승인 대기"
                value={`${pendingInstructors.length}명`}
                icon="⏳"
                color="yellow"
                subtitle="대기 중인 강사"
                onClick={() => setApprovalFilter(approvalFilter === 'pending' ? 'all' : 'pending')}
              />
              
              <StatCard
                title={`${selectedMonth.slice(5)}월 승인`}
                value={`${approvedInstructors.filter(i => i.status === 'approved' && i.approvalDate.startsWith(selectedMonth)).length}명`}
                icon="✅"
                color="green"
                subtitle="승인 완료"
                onClick={() => setApprovalFilter(approvalFilter === 'approved' ? 'all' : 'approved')}
              />
              
              <StatCard
                title={`${selectedMonth.slice(5)}월 거부`}
                value={`${approvedInstructors.filter(i => i.status === 'rejected' && i.approvalDate.startsWith(selectedMonth)).length}명`}
                icon="❌"
                color="red"
                subtitle="승인 거부"
                onClick={() => setApprovalFilter(approvalFilter === 'rejected' ? 'all' : 'rejected')}
              />
                            </div>
                            
            {/* 승인 대기 목록 */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">강사 승인 목록</h3>
                {approvalFilter !== 'all' && (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {approvalFilter === 'pending' && '승인 대기'}
                      {approvalFilter === 'approved' && '승인 완료'}
                      {approvalFilter === 'rejected' && '승인 거부'}
                    </span>
                              <Button
                      onClick={() => setApprovalFilter('all')}
                      variant="ghost"
                                size="sm"
                    >
                      전체 보기
                              </Button>
                            </div>
                )}
                          </div>
                          <div className="space-y-4">
                {/* 1. 승인 대기 강사 표시 (우선 표시) */}
                {(approvalFilter === 'pending' || approvalFilter === 'all') && (
                  <>
                    {pendingInstructors.length > 0 && approvalFilter === 'all' && (
                      <div className="bg-yellow-50 px-4 py-2 rounded-lg border-l-4 border-yellow-500">
                        <p className="text-sm font-semibold text-yellow-800">⏳ 승인 대기 ({pendingInstructors.length}명)</p>
                      </div>
                    )}
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
                  </>
                )}
                
                {/* 2. 승인 완료 강사 표시 */}
                {(approvalFilter === 'approved' || approvalFilter === 'all') && (
                  <>
                    {approvedInstructors.filter(i => i.status === 'approved' && i.approvalDate.startsWith(selectedMonth)).length > 0 && approvalFilter === 'all' && (
                      <div className="bg-green-50 px-4 py-2 rounded-lg border-l-4 border-green-500 mt-6">
                        <p className="text-sm font-semibold text-green-800">
                          ✅ 승인 완료 ({approvedInstructors.filter(i => i.status === 'approved' && i.approvalDate.startsWith(selectedMonth)).length}명)
                        </p>
                      </div>
                    )}
                    {approvedInstructors
                      .filter(i => i.status === 'approved' && i.approvalDate.startsWith(selectedMonth))
                      .map(instructor => (
                  <div key={instructor.id} className="border border-green-200 bg-green-50 rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-4">
                          <div>
                            <h4 className="text-lg font-medium text-gray-900">{instructor.name}</h4>
                            <p className="text-sm text-gray-500">{instructor.email}</p>
                    </div>
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            ✅ 승인 완료
                          </span>
                      </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">센터:</span> {instructor.center}
                    </div>
                          <div>
                            <span className="font-medium">승인일:</span> {instructor.approvalDate}
                      </div>
                    </div>
                  </div>
                </div>
                  </div>
                    ))}
                  </>
                )}
                
                {/* 3. 승인 거부 강사 표시 */}
                {(approvalFilter === 'rejected' || approvalFilter === 'all') && (
                  <>
                    {approvedInstructors.filter(i => i.status === 'rejected' && i.approvalDate.startsWith(selectedMonth)).length > 0 && approvalFilter === 'all' && (
                      <div className="bg-red-50 px-4 py-2 rounded-lg border-l-4 border-red-500 mt-6">
                        <p className="text-sm font-semibold text-red-800">
                          ❌ 승인 거부 ({approvedInstructors.filter(i => i.status === 'rejected' && i.approvalDate.startsWith(selectedMonth)).length}명)
                        </p>
                      </div>
                    )}
                    {approvedInstructors
                      .filter(i => i.status === 'rejected' && i.approvalDate.startsWith(selectedMonth))
                      .map(instructor => (
                  <div key={instructor.id} className="border border-red-200 bg-red-50 rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-4">
                          <div>
                            <h4 className="text-lg font-medium text-gray-900">{instructor.name}</h4>
                            <p className="text-sm text-gray-500">{instructor.email}</p>
                    </div>
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            ❌ 승인 거부
                          </span>
                  </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">센터:</span> {instructor.center}
                </div>
                          <div>
                            <span className="font-medium">거부일:</span> {instructor.approvalDate}
                      </div>
                          <div className="col-span-2">
                            <span className="font-medium">거부 사유:</span> {instructor.rejectReason || '미기재'}
                    </div>
                      </div>
                    </div>
                      </div>
                  </div>
                    ))}
                  </>
                )}
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
              {selectedInstructor?.status === 'active' && (
              <button
                  onClick={() => setShowDeactivationModal(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                  강사 비활성화
              </button>
              )}
                            </div>
                          </div>
                </div>
                    </div>
      )}

      {/* 평가 상세 모달 */}
      {showEvaluationDetail && selectedEvaluation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowEvaluationDetail(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{selectedEvaluation.instructor.name} 강사 평가 상세</h3>
                <p className="text-sm text-gray-600 mt-1">총 {selectedEvaluation.evaluations.length}건의 평가</p>
                        </div>
              <button
                onClick={() => setShowEvaluationDetail(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
                    </div>
                    
            <div className="p-6">
              {/* 평가 요약 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">평균 평점</p>
                  <p className="text-3xl font-bold text-blue-600">{selectedEvaluation.instructor.rating}</p>
                  <p className="text-xs text-gray-500 mt-1">/ 5.0</p>
                    </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">완료된 평가</p>
                  <p className="text-3xl font-bold text-green-600">
                    {selectedEvaluation.evaluations.filter((e: any) => e.status === 'completed').length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">건</p>
                    </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">대기 중</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {selectedEvaluation.evaluations.filter((e: any) => e.status === 'pending').length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">건</p>
                    </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">총 학생 수</p>
                  <p className="text-3xl font-bold text-purple-600">{selectedEvaluation.instructor.students}</p>
                  <p className="text-xs text-gray-500 mt-1">명</p>
                    </div>
                  </div>
                  
              {/* 평가 목록 */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">평가 내역</h4>
                {selectedEvaluation.evaluations.map((evaluation: any) => (
                  <div key={evaluation.id} className={`border rounded-lg p-4 ${
                    evaluation.status === 'completed' ? 'bg-white border-gray-200' : 'bg-yellow-50 border-yellow-200'
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-sm font-semibold text-gray-700">{evaluation.evaluator}</span>
                          <span className="text-xs text-gray-500">{evaluation.date}</span>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            evaluation.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {evaluation.status === 'completed' ? '완료' : '대기'}
                          </span>
                    </div>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div className="text-sm">
                            <span className="text-gray-600">평가 항목:</span> 
                            <span className="ml-1 font-medium">{evaluation.category}</span>
                  </div>
                          <div className="text-sm">
                            <span className="text-gray-600">점수:</span> 
                            <span className="ml-1 font-bold text-blue-600">{evaluation.score} / 5.0</span>
                </div>
              </div>
                        <div className="bg-gray-50 p-3 rounded text-sm text-gray-700">
                          <p className="font-medium text-xs text-gray-500 mb-1">평가 의견:</p>
                          {evaluation.comment}
          </div>
        </div>
      </div>
            </div>
                ))}
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button
                  onClick={() => setShowEvaluationDetail(false)}
                  variant="secondary"
                  size="md"
                >
                  닫기
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 강사 비활성화 모달 */}
      {showDeactivationModal && selectedInstructor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">강사 비활성화</h3>
              <button
                onClick={() => {
                  setShowDeactivationModal(false);
                  setDeactivationReason('');
                  setDeactivationDetails('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium text-gray-900">{selectedInstructor.name}</span> 강사를 비활성화하시겠습니까?
                </p>
                <p className="text-xs text-red-600">
                  ⚠️ 비활성화된 강사는 수업을 진행할 수 없으며, 기존 학생들은 다른 강사에게 재배정됩니다.
                </p>
              </div>
              
              <div className="space-y-4">
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    비활성화 사유 <span className="text-red-500">*</span>
                  </label>
                <select
                    value={deactivationReason}
                    onChange={(e) => setDeactivationReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">사유를 선택해주세요</option>
                    <option value="contract_violation">계약 위반</option>
                    <option value="professional_misconduct">직업윤리 위반</option>
                    <option value="safety_violation">안전 규정 위반</option>
                    <option value="license_expired">자격증 만료</option>
                    <option value="performance_issues">성과 부진</option>
                    <option value="disciplinary_action">징계 조치</option>
                    <option value="criminal_record">범죄 전과</option>
                    <option value="health_issues">건강상 문제</option>
                    <option value="personal_reasons">개인적 사유</option>
                    <option value="other">기타</option>
                </select>
              </div>
              
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    상세 내용
                  </label>
                <textarea
                    value={deactivationDetails}
                    onChange={(e) => setDeactivationDetails(e.target.value)}
                    placeholder="비활성화 사유에 대한 상세 내용을 입력해주세요..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>
            
              <div className="mt-6 flex justify-end space-x-3">
              <button
                  onClick={() => {
                    setShowDeactivationModal(false);
                    setDeactivationReason('');
                    setDeactivationDetails('');
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  취소
              </button>
              <button
                  onClick={handleDeactivateInstructor}
                  disabled={!deactivationReason}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                  비활성화
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
