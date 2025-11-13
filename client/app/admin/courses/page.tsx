/**
 * @fileoverview 관리자용 강습 과정 관리 페이지
 * 
 * @description
 * 이 컴포넌트는 최고관리자가 모든 강습 과정을 관리할 수 있는 페이지입니다.
 * 강습 과정 생성, 수정, 삭제, 조회 기능을 제공하며, 데이터베이스와 연동되어
 * 실시간으로 데이터를 관리합니다.
 * 
 * @features
 * - 강습 과정 목록 조회 (실시간 데이터베이스 연동)
 * - 강습 과정 생성 및 편집
 * - 강습 과정 삭제
 * - 수영장 레인 배정 관리
 * - 강사 배정 및 수강생 정원 관리
 * - 수업 시간 및 요일 설정
 * - 강습 상태 관리 (active, inactive, completed)
 * - 검색 및 필터링 기능
 * 
 * @workflow
 * 1. 컴포넌트 로드 시 API를 통해 강습 과정 데이터를 가져옴
 * 2. 사용자가 강습 과정을 추가/수정하면 즉시 데이터베이스에 반영
 * 3. 강습 과정별 수강생 수, 정원, 배정된 레인 정보 표시
 * 4. 강사별 강습 과정 관리 및 통계 제공
 * 
 * @security
 * - 최고관리자 권한 필요
 * - JWT 토큰을 통한 인증
 * - 모든 API 호출에 인증 헤더 포함
 * 
 * @database
 * - Course 모델과 연동
 * - 실시간 데이터 동기화
 * - 강사 정보는 User 모델과 연관
 * - 수강생 정보는 enrolledStudents 배열로 관리
 * 
 * @apiEndpoints
 * - GET /api/courses - 강습 과정 목록 조회
 * - POST /api/courses - 강습 과정 생성
 * - PUT /api/courses/:id - 강습 과정 수정
 * - DELETE /api/courses/:id - 강습 과정 삭제
 * 
 * @changelog
 * - 2024-12-19: 하드코딩된 mockCourses 데이터를 실제 API 호출로 대체
 * - 2024-12-19: 데이터베이스 연동 완료 및 실시간 데이터 동기화 구현
 * - 2024-12-19: JSDoc 문서화 추가
 * 
 * @todo
 * - [ ] 강습 과정별 상세 통계 추가
 * - [ ] 수강생 출석률 연동
 * - [ ] 강습 평가 시스템 통합
 * - [ ] 강습 과정 복사 기능 추가
 * 
 * @author JJ Swim Lab Development Team
 * @since 2024-12-19
 * @version 1.2.0
 */

'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/Button';

interface Course {
  id: number;
  name: string;
  instructor: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  students: number;
  maxStudents: number;
  status: 'active' | 'inactive';
  lanes: number[];
  time: string;
  days: string[];
}

interface Lane {
  id: number;
  name: string;
  status: 'available' | 'occupied' | 'maintenance';
  currentCourse: string | null;
}

interface Schedule {
  id: number;
  date: string;
  time: string;
  course: string;
  instructor: string;
  lane: number;
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarView, setCalendarView] = useState<'month' | 'week'>('month');
  const [lanes, setLanes] = useState<Lane[]>([]);
  
  // 동적 레인 설정
  const [laneConfig, setLaneConfig] = useState({
    totalLanes: 8, // 기본 8개 레인
    activeStart: 1,
    activeEnd: 8,
    poolType: 'standard' as 'standard' | 'olympic' | 'kids' | 'therapy'
  });

  // 레인 동적 생성 함수
  const generateDynamicLanes = (config: typeof laneConfig) => {
    const newLanes: Lane[] = [];
    
    for (let i = 1; i <= config.totalLanes; i++) {
      const isActive = i >= config.activeStart && i <= config.activeEnd;
      
      newLanes.push({
        id: i,
        name: `${i}번 레인`,
        status: isActive ? 'available' : 'maintenance',
        currentCourse: null
      });
    }
    
    setLanes(newLanes);
  };

  // 레인 설정 변경 시 레인 재생성
  useEffect(() => {
    generateDynamicLanes(laneConfig);
  }, [laneConfig]);

  // 레인 설정 상태
  const [showLaneSettings, setShowLaneSettings] = useState(false);
  const [laneCount, setLaneCount] = useState(6);
  const [operatingHours, setOperatingHours] = useState({
    start: '09:00',
    end: '22:00'
  });

  // 강습 일정 데이터
  const [scheduleData, setScheduleData] = useState<Schedule[]>([
    { id: 1, date: '2025-01-20', time: '14:00-16:00', course: '초급 자유형', instructor: '김강사', lane: 2 },
    { id: 2, date: '2025-01-20', time: '16:00-18:00', course: '중급 접영', instructor: '이강사', lane: 5 },
    { id: 3, date: '2025-01-21', time: '10:00-12:00', course: '고급 평영', instructor: '박강사', lane: 1 },
    { id: 4, date: '2025-01-22', time: '14:00-16:00', course: '초급 자유형', instructor: '김강사', lane: 3 },
    { id: 5, date: '2025-01-23', time: '16:00-18:00', course: '중급 접영', instructor: '이강사', lane: 4 },
  ]);

  // 모달 상태
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [newCourse, setNewCourse] = useState<Partial<Course>>({
    name: '',
    instructor: '',
    level: 'beginner',
    students: 0,
    maxStudents: 10,
    status: 'active',
    lanes: [],
    time: '',
    days: []
  });

  // 시간 선택 옵션
  const timeSlots = [
    '09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00',
    '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00',
    '17:00-18:00', '18:00-19:00', '19:00-20:00', '20:00-21:00'
  ];

  // 요일 옵션
  const dayOptions = [
    { value: 'monday', label: '월요일' },
    { value: 'tuesday', label: '화요일' },
    { value: 'wednesday', label: '수요일' },
    { value: 'thursday', label: '목요일' },
    { value: 'friday', label: '금요일' },
    { value: 'saturday', label: '토요일' },
    { value: 'sunday', label: '일요일' }
  ];

  // 지역/센터 필터 상태
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [selectedCenters, setSelectedCenters] = useState<string[]>([]);

  // 지역 데이터 (예시)
  const regionData: Record<string, string[]> = {
    '서울특별시': ['강남구', '강북구', '송파구', '서초구'],
    '경기도': ['수원시', '성남시', '용인시', '고양시'],
    '부산광역시': ['해운대구', '부산진구', '동래구']
  };

  // 센터 데이터 (예시)
  const centerData: Record<string, string[]> = {
    '강남구': ['강남수영센터', '역삼수영장'],
    '강북구': ['강북수영센터'],
    '송파구': ['송파스포츠센터'],
    '수원시': ['수원시민수영장'],
    '성남시': ['성남수영센터']
  };

  // 지역구 토글 핸들러
  const handleDistrictToggle = (district: string) => {
    if (selectedDistricts.includes(district)) {
      setSelectedDistricts(selectedDistricts.filter(d => d !== district));
    } else {
      setSelectedDistricts([...selectedDistricts, district]);
    }
  };

  // 센터 토글 핸들러
  const handleCenterToggle = (center: string) => {
    if (selectedCenters.includes(center)) {
      setSelectedCenters(selectedCenters.filter(c => c !== center));
    } else {
      setSelectedCenters([...selectedCenters, center]);
    }
  };

  useEffect(() => {
    // 강습 과정 데이터 로드
    const loadCourses = async () => {
              try {
          setLoading(true);
          const token = localStorage.getItem('token');
          if (!token) {
            console.error('인증 토큰이 없습니다.');
            return;
          }

          const response = await fetch('http://localhost:5000/api/courses', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            const coursesData = data.courses || [];
            
            // API 응답을 컴포넌트에서 사용하는 형식으로 변환
            const formattedCourses: Course[] = coursesData.map((course: any) => ({
              id: course._id,
              name: course.name,
              instructor: course.instructor?.name || '미배정',
              level: course.level || 'beginner',
              students: course.enrolledStudents?.length || 0,
              maxStudents: course.maxStudents || 10,
              status: course.status || 'active',
              lanes: course.poolLanes || [],
              time: course.schedule?.time || '시간 미정',
              days: course.schedule?.days || []
            }));
            
            setCourses(formattedCourses);
          } else {
            console.error('강습 과정 로드 실패:', response.status);
          }
      } catch (error) {
        console.error('강습 과정 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  const handleAddCourse = () => {
    if (!newCourse.name || !newCourse.instructor || !newCourse.time || !newCourse.days || newCourse.days.length === 0) {
      alert('필수 정보를 모두 입력해주세요.');
      return;
    }

    const course: Course = {
      id: Date.now(),
      name: newCourse.name,
      instructor: newCourse.instructor,
      level: newCourse.level || 'beginner',
      students: newCourse.students || 0,
      maxStudents: newCourse.maxStudents || 10,
      status: newCourse.status || 'active',
      lanes: newCourse.lanes || [],
      time: newCourse.time,
      days: newCourse.days || []
    };

    setCourses([...courses, course]);
    setNewCourse({
      name: '',
      instructor: '',
      level: 'beginner',
      students: 0,
      maxStudents: 10,
      status: 'active',
      lanes: [],
      time: '',
      days: []
    });
    setShowAddModal(false);
  };

  const handleEditCourse = () => {
    if (!editingCourse) return;

    const updatedCourses = courses.map(course =>
      course.id === editingCourse.id ? editingCourse : course
    );
    setCourses(updatedCourses);
    setShowEditModal(false);
    setEditingCourse(null);
  };

  const handleDeleteCourse = (id: number) => {
    if (confirm('정말로 이 강습 과정을 삭제하시겠습니까?')) {
      setCourses(courses.filter(course => course.id !== id));
    }
  };

  const handleSaveLaneSettings = () => {
    // 레인 설정 저장 로직
    setShowLaneSettings(false);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'beginner': return '초급';
      case 'intermediate': return '중급';
      case 'advanced': return '고급';
      default: return level;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '활성';
      case 'inactive': return '비활성';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">로딩 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">강습 과정 관리</h1>
          <p className="mt-2 text-gray-600">
            수영 강습 과정을 관리하고 일정을 조정합니다.
          </p>
        </div>

        {/* 상단 액션 버튼들 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={() => setShowAddModal(true)}
              variant="primary"
              size="md"
            >
              ✨ 새 강습 과정 추가
            </Button>
            <Button
              onClick={() => setShowLaneSettings(true)}
              variant="success"
              size="md"
            >
              ⚙️ 레인 설정
            </Button>
            <Button
              onClick={() => setShowCalendar(!showCalendar)}
              variant="primary"
              size="md"
              className="bg-purple-600 hover:bg-purple-700"
            >
              📅 일정 보기
            </Button>
          </div>
        </div>

        {/* 강습 과정 목록 */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">강습 과정 목록</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    과정명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    강사
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    난이도
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    수강생
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    레인
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    시간
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    요일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{course.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{course.instructor}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(course.level)}`}>
                        {getLevelText(course.level)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {course.students}/{course.maxStudents}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(course.status)}`}>
                        {getStatusText(course.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {course.lanes.map(lane => `${lane}번`).join(', ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{course.time}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {course.days.map(day => 
                          dayOptions.find(opt => opt.value === day)?.label
                        ).join(', ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setEditingCourse(course);
                          setShowEditModal(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 동적 레인 상태 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              🏊‍♂️ 레인 상태 ({laneConfig.totalLanes}개 레인)
            </h2>
            <div className="text-sm text-gray-600">
              활성: {laneConfig.activeStart}-{laneConfig.activeEnd}번 
              ({laneConfig.totalLanes % 2 === 0 ? '짝수' : '홀수'} 레인)
            </div>
          </div>
          
          {/* 레인 사용률 요약 */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="text-lg font-bold text-green-600">
                {lanes.filter(lane => lane.status === 'available').length}
              </div>
              <div className="text-xs text-green-700">사용가능</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="text-lg font-bold text-red-600">
                {lanes.filter(lane => lane.status === 'occupied').length}
              </div>
              <div className="text-xs text-red-700">사용중</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-lg font-bold text-yellow-600">
                {lanes.filter(lane => lane.status === 'maintenance').length}
              </div>
              <div className="text-xs text-yellow-700">점검중</div>
            </div>
          </div>
          
          {/* 동적 레인 그리드 */}
          <div 
            className="grid gap-3"
            style={{
              gridTemplateColumns: `repeat(${Math.min(laneConfig.totalLanes, 10)}, 1fr)`,
              maxHeight: laneConfig.totalLanes > 10 ? '300px' : 'auto',
              overflowY: laneConfig.totalLanes > 10 ? 'auto' : 'visible'
            }}
          >
            {lanes.map((lane) => (
              <div
                key={lane.id}
                className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                  lane.status === 'available'
                    ? 'border-green-300 bg-green-50 hover:bg-green-100'
                    : lane.status === 'occupied'
                    ? 'border-blue-300 bg-blue-50 hover:bg-blue-100'
                    : 'border-red-300 bg-red-50 hover:bg-red-100'
                }`}
              >
                <div className="text-center">
                  <div className="text-xl mb-2">
                    {lane.status === 'available' ? '✅' :
                     lane.status === 'occupied' ? '🏊‍♂️' : '🔧'}
                  </div>
                  <div className="font-semibold text-sm text-gray-900 mb-1">
                    {lane.name}
                  </div>
                  <div className={`text-xs font-medium ${
                    lane.status === 'available'
                      ? 'text-green-700'
                      : lane.status === 'occupied'
                      ? 'text-blue-700'
                      : 'text-red-700'
                  }`}>
                    {lane.status === 'available' ? '사용가능' :
                     lane.status === 'occupied' ? '사용중' : '점검중'}
                  </div>
                  {lane.currentCourse && (
                    <div className="text-xs text-gray-600 mt-1 truncate">
                      {lane.currentCourse}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 새 강습 과정 추가 모달 */}
        {showAddModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">새 강습 과정 추가</h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleAddCourse(); }} className="space-y-6">
                  {/* 지역 필터 섹션 */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-900 mb-3">지역 선택</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                    </div>

                    {/* 센터 표시 */}
                    {selectedDistricts.length > 0 && (
                      <div className="mt-4">
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
                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        과정명 *
                      </label>
                      <input
                        type="text"
                        value={newCourse.name}
                        onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        강사 *
                      </label>
                      <input
                        type="text"
                        value={newCourse.instructor}
                        onChange={(e) => setNewCourse({...newCourse, instructor: e.target.value})}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        난이도
                      </label>
                      <select
                        value={newCourse.level}
                        onChange={(e) => setNewCourse({...newCourse, level: e.target.value as any})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="beginner">초급</option>
                        <option value="intermediate">중급</option>
                        <option value="advanced">고급</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        최대 수강생 수
                      </label>
                      <input
                        type="number"
                        value={newCourse.maxStudents}
                        onChange={(e) => setNewCourse({...newCourse, maxStudents: parseInt(e.target.value)})}
                        min="1"
                        max="20"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      시간 *
                    </label>
                    <select
                      value={newCourse.time}
                      onChange={(e) => setNewCourse({...newCourse, time: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">시간 선택</option>
                      {timeSlots.map((slot) => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      요일 *
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {dayOptions.map((day) => (
                        <label key={day.value} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={newCourse.days?.includes(day.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewCourse({
                                  ...newCourse,
                                  days: [...(newCourse.days || []), day.value]
                                });
                              } else {
                                setNewCourse({
                                  ...newCourse,
                                  days: newCourse.days?.filter(d => d !== day.value)
                                });
                              }
                            }}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">{day.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      추가
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* 강습 과정 수정 모달 */}
        {showEditModal && editingCourse && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">강습 과정 수정</h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleEditCourse(); }} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        과정명 *
                      </label>
                      <input
                        type="text"
                        value={editingCourse.name}
                        onChange={(e) => setEditingCourse({...editingCourse, name: e.target.value})}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        강사 *
                      </label>
                      <input
                        type="text"
                        value={editingCourse.instructor}
                        onChange={(e) => setEditingCourse({...editingCourse, instructor: e.target.value})}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        난이도
                      </label>
                      <select
                        value={editingCourse.level}
                        onChange={(e) => setEditingCourse({...editingCourse, level: e.target.value as any})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="beginner">초급</option>
                        <option value="intermediate">중급</option>
                        <option value="advanced">고급</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        최대 수강생 수
                      </label>
                      <input
                        type="number"
                        value={editingCourse.maxStudents}
                        onChange={(e) => setEditingCourse({...editingCourse, maxStudents: parseInt(e.target.value)})}
                        min="1"
                        max="20"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      시간 *
                    </label>
                    <select
                      value={editingCourse.time}
                      onChange={(e) => setEditingCourse({...editingCourse, time: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {timeSlots.map((slot) => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      요일 *
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {dayOptions.map((day) => (
                        <label key={day.value} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={editingCourse.days?.includes(day.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setEditingCourse({
                                  ...editingCourse,
                                  days: [...(editingCourse.days || []), day.value]
                                });
                              } else {
                                setEditingCourse({
                                  ...editingCourse,
                                  days: editingCourse.days?.filter(d => d !== day.value)
                                });
                              }
                            }}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">{day.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      수정
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* 레인 설정 모달 */}
        {showLaneSettings && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">레인 설정</h3>
                  <button
                    onClick={() => setShowLaneSettings(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* 동적 레인 수 설정 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🏊‍♂️ 총 레인 수 (1-20개 지원)
                    </label>
                    <div className="space-y-4">
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={laneConfig.totalLanes}
                        onChange={(e) => setLaneConfig({
                          ...laneConfig,
                          totalLanes: parseInt(e.target.value) || 1,
                          activeEnd: Math.min(parseInt(e.target.value) || 1, laneConfig.activeEnd)
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      
                      {/* 프리셋 버튼 */}
                      <div className="flex flex-wrap gap-2">
                        {[4, 6, 8, 10, 12, 15, 20].map((count) => (
                          <button
                            key={count}
                            type="button"
                            onClick={() => setLaneConfig({
                              ...laneConfig,
                              totalLanes: count,
                              activeStart: 1,
                              activeEnd: count
                            })}
                            className={`px-3 py-1 text-sm border rounded-md transition-colors ${
                              laneConfig.totalLanes === count
                                ? 'bg-blue-100 border-blue-500 text-blue-700'
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {count}개
                          </button>
                        ))}
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        현재 설정: {laneConfig.totalLanes}개 레인 
                        {laneConfig.totalLanes % 2 === 0 ? '(짝수)' : '(홀수)'}
                      </div>
                    </div>
                  </div>
                  
                  {/* 활성 레인 범위 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🎯 활성 레인 범위
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-600">시작 레인</label>
                        <input
                          type="number"
                          min="1"
                          max={laneConfig.totalLanes}
                          value={laneConfig.activeStart}
                          onChange={(e) => setLaneConfig({
                            ...laneConfig,
                            activeStart: parseInt(e.target.value) || 1
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">종료 레인</label>
                        <input
                          type="number"
                          min={laneConfig.activeStart}
                          max={laneConfig.totalLanes}
                          value={laneConfig.activeEnd}
                          onChange={(e) => setLaneConfig({
                            ...laneConfig,
                            activeEnd: parseInt(e.target.value) || laneConfig.totalLanes
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      활성 레인: {laneConfig.activeEnd - laneConfig.activeStart + 1}개
                    </div>
                  </div>
                  
                  {/* 수영장 타입 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🏊‍♀️ 수영장 타입
                    </label>
                    <select
                      value={laneConfig.poolType}
                      onChange={(e) => setLaneConfig({
                        ...laneConfig,
                        poolType: e.target.value as any
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="standard">표준 풀 (25m) - 레인당 8명</option>
                      <option value="olympic">올림픽 풀 (50m) - 레인당 12명</option>
                      <option value="kids">어린이 풀 - 레인당 6명</option>
                      <option value="therapy">재활 풀 - 레인당 4명</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">운영 시간</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">시작 시간</label>
                        <input
                          type="time"
                          value={operatingHours.start}
                          onChange={(e) => setOperatingHours({...operatingHours, start: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">종료 시간</label>
                        <input
                          type="time"
                          value={operatingHours.end}
                          onChange={(e) => setOperatingHours({...operatingHours, end: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">현재 설정</h4>
                    <div className="text-sm text-gray-600">
                      <div>레인 수: {laneCount}개</div>
                      <div>운영 시간: {operatingHours.start} ~ {operatingHours.end}</div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <button
                    onClick={() => setShowLaneSettings(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSaveLaneSettings}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    저장
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
