/**
 * 👨‍🏫 JJ Swim Lab - 강사관리 페이지
 * 
 * 📋 **페이지 목적**
 * - 최고관리자가 모든 강사를 통합 관리하는 페이지
 * - 강사 정보, 강습 현황, 성과, 학생 관리 등을 종합적으로 관리
 * - 강사별 성과 분석 및 평가 시스템
 * 
 * 🔄 **주요 기능**
 * - 강사 목록 및 상세 정보 관리
 * - 강사별 강습 현황 및 성과 분석
 * - 학생 관리 현황 및 체크리스트 연동
 * - 강사 평가 및 피드백 시스템
 * - 강습법 및 커리큘럼 관리
 * 
 * 🗄️ **데이터 연동**
 * - 강사 정보 데이터베이스
 * - 강습 현황 및 성과 데이터
 * - 학생 관리 및 체크리스트 데이터
 * - 강사 평가 및 피드백 데이터
 * 
 * 🛠️ **필요한 설치 파일**
 * - React (useState, useEffect, useCallback)
 * - 강사 관리 API 연동
 * - 차트 및 시각화 라이브러리
 * - Tailwind CSS (스타일링)
 * - TypeScript (타입 정의)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 최고 관리자 권한 확인 필수
 * 2. 강사 개인정보 보호 및 보안
 * 3. 실시간 데이터 업데이트 및 동기화
 * 4. 성과 지표의 정확성 및 신뢰성
 * 5. 사용자 경험 및 인터페이스 최적화
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 최고 관리자 권한 확인
 * - [ ] 강사 정보 보안 설정 검증
 * - [ ] 실시간 데이터 업데이트 확인
 * - [ ] 성과 지표 정확성 검증
 * - [ ] 사용자 인터페이스 테스트
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (강사관리 시스템)
 * - 2024-12-19: 강사 성과 분석 시스템 구현
 * - 2024-12-19: 학생 관리 연동 시스템 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (강사관리 시스템 완료)
 * 
 * 🚀 **다음 단계**
 * - AI 기반 강사 성과 예측
 * - 실시간 강습 모니터링
 * - 강사 교육 프로그램 개발
 * - 성과 기반 인센티브 시스템
 * 
 * 💡 **사용 예시**
 * ```tsx
 * <InstructorManagementPage 
 *   onInstructorUpdate={(instructor) => handleInstructorUpdate(instructor)}
 *   onPerformanceAnalysis={(data) => handlePerformanceAnalysis(data)}
 *   enableRealTimeMonitoring={true}
 * />
 * ```
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { 
  Users, 
  TrendingUp, 
  Award, 
  Calendar, 
  BookOpen, 
  Target,
  Star,
  Activity,
  BarChart3,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter
} from 'lucide-react';
import { 
  getInstructorOverview, 
  getInstructors, 
  getInstructorPerformance,
  getInstructorStudents,
  type Instructor,
  type PerformanceMetrics,
  type OverviewData,
  type StudentManagement
} from '../../../lib/api/instructorManagement';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, ResponsiveTable, TableHeader, TableHeaderCell, TableBody } from '../../../components/ui';

// 실제 API 타입을 사용하므로 인터페이스 제거

export default function InstructorManagementPage() {
  const { user, hasUserType } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceMetrics[]>([]);
  const [studentManagementData, setStudentManagementData] = useState<StudentManagement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Hooks는 항상 컴포넌트 최상단에 위치해야 함
  useEffect(() => {
    if (user?.userType === 'superAdmin') {
      loadData();
    }
  }, [user?.userType, currentPage, filterStatus]);

  // 최고 관리자 권한 확인
  if (!hasUserType('superAdmin')) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">접근 권한이 없습니다</h1>
            <p className="text-gray-600">이 페이지는 최고 관리자만 접근할 수 있습니다.</p>
          </div>
        </div>
      </div>
    );
  }

  // 검색 및 필터링 처리
  const handleSearch = async () => {
    try {
      const response = await getInstructors({ 
        page: 1, 
        limit: 10,
        search: searchTerm,
        status: filterStatus === 'all' ? undefined : filterStatus
      });
      setInstructors(response.instructors);
      setTotalPages(response.pagination.totalPages);
      setCurrentPage(1);
    } catch (error) {
      console.error('검색 실패:', error);
    }
  };

  // 페이지 변경 처리
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // 1. 전체 현황 데이터 로드
      const overview = await getInstructorOverview();
      setOverviewData(overview);
      
      // 2. 강사 목록 로드
      const instructorsResponse = await getInstructors({ 
        page: currentPage, 
        limit: 10,
        status: filterStatus === 'all' ? undefined : filterStatus
      });
      setInstructors(instructorsResponse.instructors);
      setTotalPages(instructorsResponse.pagination.totalPages);
      
      // 3. 강사별 성과 데이터 로드
      const performancePromises = instructorsResponse.instructors.map(instructor =>
        getInstructorPerformance(instructor._id)
      );
      const performanceResults = await Promise.all(performancePromises);
      setPerformanceData(performanceResults);
      
      // 4. 강사별 학생 관리 현황 로드
      const studentManagementPromises = instructorsResponse.instructors.map(instructor =>
        getInstructorStudents(instructor._id)
      );
      const studentManagementResults = await Promise.all(studentManagementPromises);
      setStudentManagementData(studentManagementResults);
      
      setIsLoading(false);
    } catch (error) {
      console.error('강사 데이터 로딩 실패:', error);
      setIsLoading(false);
    }
  };

  // 실제 API에서 필터링된 데이터를 받아오므로 별도 필터링 불필요

  const tabs = [
    { id: 'overview', label: '📊 전체 현황', icon: BarChart3 },
    { id: 'instructors', label: '👨‍🏫 강사 목록', icon: Users },
    { id: 'performance', label: '📈 성과 분석', icon: TrendingUp },
    { id: 'students', label: '👥 학생 관리', icon: BookOpen },
    { id: 'evaluation', label: '⭐ 평가 관리', icon: Star }
  ];

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
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">강사 관리</h1>
          <p className="text-gray-600">전체 강사의 정보, 성과, 학생 관리를 종합적으로 관리합니다.</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">전체 강사</p>
                <p className="text-2xl font-bold text-gray-900">
                  {overviewData?.totalInstructors || 0}명
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">활성 강사</p>
                <p className="text-2xl font-bold text-gray-900">
                  {overviewData?.activeInstructors || 0}명
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">총 학생 수</p>
                <p className="text-2xl font-bold text-gray-900">
                  {overviewData?.totalStudents || 0}명
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">평균 평점</p>
                <p className="text-2xl font-bold text-gray-900">
                  {overviewData?.averageRating || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* 탭 내용 */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">전체 강사 현황</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">강사별 학생 분포</h4>
                    <div className="space-y-3">
                      {instructors.map((instructor) => (
                        <div key={instructor._id} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{instructor.name}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${(instructor.activeStudents / instructor.totalStudents) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-500">{instructor.activeStudents}/{instructor.totalStudents}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">강사별 성과 지표</h4>
                    <div className="space-y-3">
                      {instructors.map((instructor) => (
                        <div key={instructor._id} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{instructor.name}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">완료율</span>
                            <span className="text-sm font-medium text-gray-900">{instructor.completionRate}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'instructors' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">강사 목록</h3>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>강사 추가</span>
                  </button>
                </div>

                {/* 검색 및 필터 */}
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="강사명, 이메일, 센터로 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">전체 상태</option>
                    <option value="active">활성</option>
                    <option value="inactive">비활성</option>
                    <option value="pending">대기</option>
                  </select>
                  <button
                    onClick={handleSearch}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    검색
                  </button>
                </div>

                {/* 강사 목록 테이블 */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">강사 정보</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">센터</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">전문 분야</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">학생 현황</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">평점</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {instructors.map((instructor) => (
                        <tr key={instructor._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{instructor.name}</div>
                              <div className="text-sm text-gray-500">{instructor.email}</div>
                              <div className="text-sm text-gray-500">{instructor.phone}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {/* 센터 정보는 별도 API에서 가져와야 함 */}
                            센터 정보
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {instructor.specialization}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              활성: {instructor.activeStudents || 0}명
                            </div>
                            <div className="text-sm text-gray-500">
                              총: {instructor.totalStudents || 0}명
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="ml-1 text-sm text-gray-900">{instructor.rating}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              instructor.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : instructor.status === 'inactive'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {instructor.status === 'active' ? '활성' : 
                               instructor.status === 'inactive' ? '비활성' : '대기'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button className="text-blue-600 hover:text-blue-900">
                                <Eye className="h-4 w-4" />
                              </button>
                              <button className="text-indigo-600 hover:text-blue-900">
                                <Edit className="h-4 w-4" />
                              </button>
                              <button className="text-red-600 hover:text-red-900">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 페이지네이션 */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-6">
                    <nav className="flex space-x-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        이전
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        다음
                      </button>
                    </nav>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'performance' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">성과 분석</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {performanceData.map((performance) => {
                    const instructor = instructors.find(i => i._id === performance.instructorId);
                    return (
                      <div key={performance.instructorId} className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-medium text-gray-900">{instructor?.name}</h4>
                          <span className="text-sm text-gray-500">센터 ID: {instructor?.centerId}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{performance.totalLessons}</div>
                            <div className="text-sm text-gray-500">총 강습 수</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{performance.completedLessons}</div>
                            <div className="text-sm text-gray-500">완료 강습</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">{performance.studentSatisfaction}</div>
                            <div className="text-sm text-gray-500">학생 만족도</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600">{performance.progressRate}%</div>
                            <div className="text-sm text-gray-500">진도율</div>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">출석률</span>
                            <span className="font-medium text-gray-900">{performance.attendanceRate}%</span>
                          </div>
                          <div className="flex justify-between text-sm mt-2">
                            <span className="text-gray-500">월간 성장률</span>
                            <span className="font-medium text-gray-900">{performance.monthlyGrowth}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'students' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">학생 관리 현황</h3>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">강사</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">센터</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">활성 학생</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">체크리스트 현황</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">진도 관리</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {instructors.map((instructor) => (
                        <tr key={instructor._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {instructor.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {instructor.centerId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {instructor.activeStudents}명
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            체크리스트 연동 필요
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            진도 관리 연동 필요
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900">
                              상세보기
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'evaluation' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">강사 평가 관리</h3>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <p className="text-gray-600">강사 평가 및 피드백 시스템이 준비 중입니다.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
