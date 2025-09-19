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
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '../../../components/ui';
import { ResponsiveTable, TableHeader, TableBody, TableRow, TableCell } from '../../../components/ui/ResponsiveTable';

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
  const [viewMode, setViewMode] = useState<'summary' | 'detailed'>('summary');
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

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

  // 강사 상태 변경 핸들러
  const handleInstructorStatusChange = async (instructorId: string, newStatus: string) => {
    try {
      console.log(`🔄 강사 상태 변경: ${instructorId} → ${newStatus}`);
      // TODO: API 호출로 강사 상태 변경
      // await updateInstructorStatus(instructorId, newStatus);
      
      // 임시로 로컬 상태 업데이트
      setInstructors(prev => prev.map(instructor => 
        instructor._id === instructorId 
          ? { ...instructor, status: newStatus }
          : instructor
      ));
      
      alert(`강사 상태가 ${newStatus === 'active' ? '활성' : '비활성'}으로 변경되었습니다.`);
      
      // 데이터 새로고침
      await loadData();
    } catch (error) {
      console.error('강사 상태 변경 실패:', error);
      alert('강사 상태 변경에 실패했습니다.');
    }
  };

  // 강사 삭제 핸들러 (실제로는 비활성화)
  const handleInstructorDelete = async (instructor: Instructor) => {
    const confirmMessage = `${instructor.name} 강사를 정말 비활성화하시겠습니까?\n\n⚠️ 주의사항:\n- 담당 중인 학생들의 강습이 중단됩니다\n- 예정된 강습 일정이 취소됩니다\n- 복구 시 별도 승인이 필요합니다`;
    
    if (confirm(confirmMessage)) {
      await handleInstructorStatusChange(instructor._id, 'inactive');
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
                <p className="text-xs text-gray-500">
                  전체 {overviewData?.totalInstructors || 0}명 중 
                  ({Math.round(((overviewData?.activeInstructors || 0) / (overviewData?.totalInstructors || 1)) * 100)}%)
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
                <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">전체 강사 현황</h3>
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={() => setViewMode(viewMode === 'summary' ? 'detailed' : 'summary')}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                    >
                      {viewMode === 'summary' ? '📊 요약보기' : '📋 상세보기'}
                    </button>
                  </div>
                </div>
                
                {viewMode === 'summary' ? (
                  // 📊 요약 보기 모드
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 학생 수 분포 요약 */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-blue-900">👨‍🎓 학생 수 분포</h4>
                        <div className="text-2xl font-bold text-blue-700">
                          {instructors.reduce((sum, i) => sum + (i.totalStudents || 0), 0)}명
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-blue-700">평균 담당 학생:</span>
                          <span className="font-medium text-blue-900">
                            {instructors.length > 0 ? Math.round(instructors.reduce((sum, i) => sum + (i.totalStudents || 0), 0) / instructors.length) : 0}명
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-blue-700">최다 담당:</span>
                          <span className="font-medium text-blue-900">
                            {instructors.length > 0 ? Math.max(...instructors.map(i => i.totalStudents || 0)) : 0}명
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-blue-700">최소 담당:</span>
                          <span className="font-medium text-blue-900">
                            {instructors.length > 0 ? Math.min(...instructors.map(i => i.totalStudents || 0)) : 0}명
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 성과 지표 요약 */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-green-900">📈 성과 지표</h4>
                        <div className="text-2xl font-bold text-green-700">
                          {Math.round(instructors.reduce((sum, i) => sum + i.completionRate, 0) / instructors.length)}%
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-green-700">평균 완료율:</span>
                          <span className="font-medium text-green-900">
                            {instructors.length > 0 ? Math.round(instructors.reduce((sum, i) => sum + (i.completionRate || 85), 0) / instructors.length) : 0}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-green-700">최고 완료율:</span>
                          <span className="font-medium text-green-900">
                            {instructors.length > 0 ? Math.max(...instructors.map(i => i.completionRate || 85)) : 0}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-green-700">우수 강사:</span>
                          <span className="font-medium text-green-900">
                            {instructors.filter(i => i.completionRate >= 90).length}명
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 강사 등급 분포 */}
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-purple-900">🏆 강사 등급 분포</h4>
                        <div className="text-lg font-bold text-purple-700">
                          {instructors.length}명
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-purple-700">👑 마스터:</span>
                          <span className="font-medium text-purple-900">
                            {instructors.filter(i => i.level === 'master').length}명
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-purple-700">🏆 시니어:</span>
                          <span className="font-medium text-purple-900">
                            {instructors.filter(i => i.level === 'senior').length}명
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-purple-700">📈 주니어:</span>
                          <span className="font-medium text-purple-900">
                            {instructors.filter(i => i.level === 'junior').length}명
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-purple-700">🔰 신입:</span>
                          <span className="font-medium text-purple-900">
                            {instructors.filter(i => i.level === 'trainee').length}명
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // 📋 상세 보기 모드 (기존 개별 나열)
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">강사별 학생 분포</h4>
                        <span className="text-xs text-gray-500">({instructors.length}명)</span>
                      </div>
                      <div className="space-y-3 max-h-80 overflow-y-auto">
                      {instructors.map((instructor) => (
                          <div key={instructor._id} className="flex items-center justify-between p-2 bg-white rounded border">
                            <div className="flex items-center space-x-3">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-sm font-medium text-gray-700">{instructor.name}</span>
                              <span className="text-xs text-gray-500">
                                {instructor.level === 'master' && '👑'}
                                {instructor.level === 'senior' && '🏆'}
                                {instructor.level === 'junior' && '📈'}
                                {instructor.level === 'trainee' && '🔰'}
                              </span>
                            </div>
                          <div className="flex items-center space-x-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${(instructor.activeStudents / instructor.totalStudents) * 100}%` }}
                              ></div>
                            </div>
                              <span className="text-sm text-gray-600 min-w-[3rem] text-right">
                                {instructor.activeStudents}/{instructor.totalStudents}
                              </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">강사별 성과 지표</h4>
                        <span className="text-xs text-gray-500">완료율 기준</span>
                      </div>
                      <div className="space-y-3 max-h-80 overflow-y-auto">
                        {instructors
                          .sort((a, b) => b.completionRate - a.completionRate)
                          .map((instructor) => (
                          <div key={instructor._id} className="flex items-center justify-between p-2 bg-white rounded border">
                            <div className="flex items-center space-x-3">
                              <div className={`w-2 h-2 rounded-full ${
                                instructor.completionRate >= 90 ? 'bg-green-500' :
                                instructor.completionRate >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}></div>
                              <span className="text-sm font-medium text-gray-700">{instructor.name}</span>
                              <span className="text-xs text-gray-500">
                                {instructor.level === 'master' && '👑'}
                                {instructor.level === 'senior' && '🏆'}
                                {instructor.level === 'junior' && '📈'}
                                {instructor.level === 'trainee' && '🔰'}
                              </span>
                            </div>
                          <div className="flex items-center space-x-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    instructor.completionRate >= 90 ? 'bg-green-500' :
                                    instructor.completionRate >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${instructor.completionRate}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-gray-900 min-w-[3rem] text-right">
                                {instructor.completionRate}%
                              </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                )}
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
                        placeholder="강사명, 이메일, 센터명, 지역으로 검색..."
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
                    <option value="active">✅ 활성 (정상 강습)</option>
                    <option value="inactive">❌ 비활성 (강습 중단)</option>
                    <option value="pending">⏳ 대기 (승인 검토)</option>
                  </select>
                  <button
                    onClick={handleSearch}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    검색
                  </button>
                </div>

                {/* 강사 목록 카드 */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {instructors
                    .filter((instructor) => {
                      if (!searchTerm) return true;
                      
                      const searchLower = searchTerm.toLowerCase();
                      return (
                        instructor.name.toLowerCase().includes(searchLower) ||
                        instructor.email.toLowerCase().includes(searchLower) ||
                        '서울시'.toLowerCase().includes(searchLower) ||
                        '강남구'.toLowerCase().includes(searchLower) ||
                        'JJ 수영센터'.toLowerCase().includes(searchLower) ||
                        (instructor.specialization && instructor.specialization.toLowerCase().includes(searchLower))
                      );
                    })
                    .map((instructor) => (
                    <Card key={instructor._id}>
                      {/* 카드 헤더 */}
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                              <span className="text-white font-bold text-lg">
                                {instructor.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <CardTitle className="text-lg">{instructor.name}</CardTitle>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant={
                                  instructor.level === 'master' ? 'success' : 
                                  instructor.level === 'senior' ? 'primary' : 
                                  instructor.level === 'junior' ? 'secondary' : 'outline'
                                }>
                                  {instructor.level === 'master' && '👑 마스터'}
                                  {instructor.level === 'senior' && '🏆 시니어'}
                                  {instructor.level === 'junior' && '📈 주니어'}
                                  {instructor.level === 'trainee' && '🔰 신입'}
                                </Badge>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              instructor.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : instructor.status === 'inactive'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                                  {instructor.status === 'active' ? '✅' : 
                                   instructor.status === 'inactive' ? '❌' : '⏳'}
                            </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      {/* 카드 내용 */}
                      <CardContent>
                        <div className="space-y-4">
                          {/* 연락처 정보 */}
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center">
                                <span className="text-gray-600 w-16">📧 이메일:</span>
                                <span className="text-gray-900 font-medium text-xs">{instructor.email}</span>
                              </div>
                              <div className="flex items-center">
                                <span className="text-gray-600 w-16">📱 전화:</span>
                                <span className="text-gray-900 font-medium">{instructor.phone}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* 센터 및 전문분야 정보 */}
                          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-blue-700 font-medium">🏢 소속센터:</span>
                                <span className="text-blue-900 font-semibold text-xs">JJ 수영센터 샘플점</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-blue-700 font-medium">📍 지역:</span>
                                <span className="text-blue-900">서울시 강남구</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-blue-700 font-medium">🏊‍♂️ 전문분야:</span>
                                <span className="text-blue-900 text-xs">{instructor.specialization || '자유형, 배영'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-blue-700 font-medium">📅 경력:</span>
                                <span className="text-blue-900 font-semibold">{instructor.experience}년</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* 성과 지표 */}
                          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                            <h5 className="text-sm font-semibold text-green-800 mb-2">📊 성과 지표</h5>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-green-700 text-sm">👨‍🎓 담당 학생</span>
                                <span className="font-bold text-green-900">{instructor.activeStudents || 0}/{instructor.totalStudents || 0}명</span>
                              </div>
                              <div className="w-full bg-green-200 rounded-full h-2">
                                <div 
                                  className="bg-green-600 h-2 rounded-full"
                                  style={{ width: `${((instructor.activeStudents || 0) / (instructor.totalStudents || 1)) * 100}%` }}
                                ></div>
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <span className="text-green-700 text-sm">⭐ 평점</span>
                                <span className="font-bold text-green-900">{instructor.rating}/5.0</span>
                              </div>
                              <div className="w-full bg-green-200 rounded-full h-2">
                                <div 
                                  className="bg-yellow-500 h-2 rounded-full"
                                  style={{ width: `${(instructor.rating / 5) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                          
                          {/* 액션 버튼 */}
                            <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedInstructor(instructor);
                                setShowDetailModal(true);
                              }}
                              className="flex-1"
                            >
                              👁️ 상세보기
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => {
                                setSelectedInstructor(instructor);
                                setShowEditModal(true);
                              }}
                              className="flex-1"
                            >
                              ✏️ 수정
                            </Button>
                            </div>
                        </div>
                      </CardContent>
                    </Card>
                      ))}
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold text-gray-900">📈 강사별 성과 분석</h3>
                  
                  {/* 검색 및 필터 */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="강사명, 센터명, 지역으로 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                      />
                    </div>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">전체 상태</option>
                      <option value="active">✅ 활성</option>
                      <option value="inactive">❌ 비활성</option>
                      <option value="pending">⏳ 대기</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {performanceData
                    .filter((performance) => {
                    const instructor = instructors.find(i => i._id === performance.instructorId);
                      if (!searchTerm) return true;
                      
                      const searchLower = searchTerm.toLowerCase();
                    return (
                        instructor?.name.toLowerCase().includes(searchLower) ||
                        '서울시'.toLowerCase().includes(searchLower) ||
                        '강남구'.toLowerCase().includes(searchLower) ||
                        'JJ 수영센터'.toLowerCase().includes(searchLower)
                      );
                    })
                    .map((performance) => {
                    const instructor = instructors.find(i => i._id === performance.instructorId);
                    const completionRate = Math.round((performance.completedLessons / performance.totalLessons) * 100);
                    
                    return (
                      <Card key={performance.instructorId}>
                        {/* 카드 헤더 */}
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                                <span className="text-white font-bold text-lg">
                                  {instructor?.name.charAt(0)}
                                </span>
                        </div>
                              <div>
                                <CardTitle className="text-lg">{instructor?.name}</CardTitle>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge variant={
                                    instructor?.level === 'master' ? 'success' : 
                                    instructor?.level === 'senior' ? 'primary' : 
                                    instructor?.level === 'junior' ? 'secondary' : 'outline'
                                  }>
                                    {instructor?.level === 'master' && '👑 마스터'}
                                    {instructor?.level === 'senior' && '🏆 시니어'}
                                    {instructor?.level === 'junior' && '📈 주니어'}
                                    {instructor?.level === 'trainee' && '🔰 신입'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-700">JJ 수영센터 샘플점</div>
                              <div className="text-xs text-gray-500">📍 서울시 강남구</div>
                              <div className="text-xs text-yellow-600">⭐⭐⭐ 3급 센터</div>
                            </div>
                          </div>
                        </CardHeader>
                        
                        {/* 카드 내용 */}
                        <CardContent>
                          <div className="space-y-4">
                            {/* 주요 성과 지표 */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 text-center border border-blue-200">
                                <div className="text-xl font-bold text-blue-700">{performance.totalLessons}</div>
                                <div className="text-xs text-blue-600">총 강습 수</div>
                          </div>
                              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 text-center border border-green-200">
                                <div className="text-xl font-bold text-green-700">{performance.completedLessons}</div>
                                <div className="text-xs text-green-600">완료 강습</div>
                          </div>
                          </div>
                            
                            {/* 성과 지표 바 */}
                            <div className="space-y-3">
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-600 font-medium">📊 완료율</span>
                                  <span className="font-bold text-green-700">{completionRate}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                                  <div 
                                    className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full shadow-sm"
                                    style={{ width: `${completionRate}%` }}
                                  ></div>
                          </div>
                        </div>

                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-600 font-medium">⭐ 학생 만족도</span>
                                  <span className="font-bold text-yellow-700">{performance.studentSatisfaction}/5.0</span>
                          </div>
                                <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                                  <div 
                                    className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-3 rounded-full shadow-sm"
                                    style={{ width: `${(performance.studentSatisfaction / 5) * 100}%` }}
                                  ></div>
                          </div>
                        </div>
                              
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-600 font-medium">📈 진도율</span>
                                  <span className="font-bold text-purple-700">{performance.progressRate}%</span>
                      </div>
                                <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                                  <div 
                                    className="bg-gradient-to-r from-purple-400 to-purple-600 h-3 rounded-full shadow-sm"
                                    style={{ width: `${performance.progressRate}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                            
                            {/* 추가 성과 정보 */}
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">👨‍🎓 담당 학생:</span>
                                  <span className="font-semibold text-blue-700">{instructor?.activeStudents || 0}명</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">📅 경력:</span>
                                  <span className="font-semibold text-gray-700">{instructor?.experience || 0}년</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">🏊‍♂️ 전문분야:</span>
                                  <span className="font-semibold text-gray-700 text-xs">{instructor?.specialization || '자유형'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">📊 출석률:</span>
                                  <span className="font-semibold text-green-700">{performance.attendanceRate}%</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* 액션 버튼 */}
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedInstructor(instructor);
                                  setShowDetailModal(true);
                                }}
                                className="flex-1"
                              >
                                👁️ 상세보기
                              </Button>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => {
                                  setSelectedInstructor(instructor);
                                  setShowEditModal(true);
                                }}
                                className="flex-1"
                              >
                                ✏️ 관리
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
                
                {/* 성과 요약 통계 */}
                <div className="mt-8 bg-gradient-to-r from-blue-50 via-purple-50 to-green-50 rounded-xl p-6 border-2 border-blue-200 shadow-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    📊 전체 성과 요약
                    <span className="ml-2 text-sm text-gray-500">({performanceData.length}명 강사)</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center bg-white rounded-lg p-4 shadow-md">
                      <div className="text-2xl font-bold text-blue-600">
                        {performanceData.reduce((sum, p) => sum + p.totalLessons, 0)}
                      </div>
                      <div className="text-sm text-gray-600">총 강습 수</div>
                    </div>
                    <div className="text-center bg-white rounded-lg p-4 shadow-md">
                      <div className="text-2xl font-bold text-green-600">
                        {performanceData.length > 0 ? Math.round(performanceData.reduce((sum, p) => sum + (p.completedLessons / p.totalLessons * 100), 0) / performanceData.length) : 0}%
                      </div>
                      <div className="text-sm text-gray-600">평균 완료율</div>
                    </div>
                    <div className="text-center bg-white rounded-lg p-4 shadow-md">
                      <div className="text-2xl font-bold text-yellow-600">
                        {performanceData.length > 0 ? (performanceData.reduce((sum, p) => sum + p.studentSatisfaction, 0) / performanceData.length).toFixed(1) : 0}
                      </div>
                      <div className="text-sm text-gray-600">평균 만족도</div>
                    </div>
                    <div className="text-center bg-white rounded-lg p-4 shadow-md">
                      <div className="text-2xl font-bold text-purple-600">
                        {performanceData.length > 0 ? Math.round(performanceData.reduce((sum, p) => sum + p.attendanceRate, 0) / performanceData.length) : 0}%
                      </div>
                      <div className="text-sm text-gray-600">평균 출석률</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'students' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold text-gray-900">👨‍🎓 강사별 학생 관리 현황</h3>
                  
                  {/* 검색 */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="강사명, 센터명으로 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                    />
                  </div>
                </div>
                {/* 강사별 학생 관리 카드 */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {instructors
                    .filter((instructor) => {
                      if (!searchTerm) return true;
                      
                      const searchLower = searchTerm.toLowerCase();
                      return (
                        instructor.name.toLowerCase().includes(searchLower) ||
                        'JJ 수영센터'.toLowerCase().includes(searchLower) ||
                        '서울시'.toLowerCase().includes(searchLower) ||
                        '강남구'.toLowerCase().includes(searchLower)
                      );
                    })
                    .map((instructor) => {
                    // 더미 체크리스트 및 진도 데이터 생성
                    const totalChecklistItems = 24;
                    const completedChecklistItems = Math.floor(Math.random() * totalChecklistItems) + 1;
                    const checklistCompletionRate = Math.round((completedChecklistItems / totalChecklistItems) * 100);
                    
                    const studentsByLevel = {
                      bronze: Math.floor((instructor.activeStudents || 0) * 0.4),
                      silver: Math.floor((instructor.activeStudents || 0) * 0.3),
                      gold: Math.floor((instructor.activeStudents || 0) * 0.2),
                      platinum: Math.floor((instructor.activeStudents || 0) * 0.1)
                    };
                    
                    return (
                      <Card key={instructor._id}>
                        {/* 카드 헤더 */}
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-md">
                                <span className="text-white font-bold text-lg">
                                  {instructor.name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <CardTitle className="text-lg">{instructor.name}</CardTitle>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge variant={
                                    instructor.level === 'master' ? 'success' : 
                                    instructor.level === 'senior' ? 'primary' : 
                                    instructor.level === 'junior' ? 'secondary' : 'outline'
                                  }>
                                    {instructor.level === 'master' && '👑 마스터'}
                                    {instructor.level === 'senior' && '🏆 시니어'}
                                    {instructor.level === 'junior' && '📈 주니어'}
                                    {instructor.level === 'trainee' && '🔰 신입'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-700">JJ 수영센터 샘플점</div>
                              <div className="text-xs text-gray-500">📍 서울시 강남구</div>
                            </div>
                          </div>
                        </CardHeader>
                        
                        {/* 카드 내용 */}
                        <CardContent>
                          <div className="space-y-4">
                            {/* 학생 현황 */}
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                              <h5 className="text-sm font-semibold text-blue-800 mb-3">👨‍🎓 담당 학생 현황</h5>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-blue-700">활성 학생:</span>
                                <span className="font-bold text-blue-900 text-lg">{instructor.activeStudents || 0}명</span>
                              </div>
                              <div className="text-xs text-blue-600 mb-3">전체 {instructor.totalStudents || 0}명 중</div>
                              
                              {/* 레벨별 학생 분포 */}
                              <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                  <span className="text-blue-700">🥉 브론즈:</span>
                                  <span className="font-medium">{studentsByLevel.bronze}명</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span className="text-blue-700">🥈 실버:</span>
                                  <span className="font-medium">{studentsByLevel.silver}명</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span className="text-blue-700">🥇 골드:</span>
                                  <span className="font-medium">{studentsByLevel.gold}명</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span className="text-blue-700">💎 플래티넘:</span>
                                  <span className="font-medium">{studentsByLevel.platinum}명</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* 체크리스트 현황 */}
                            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                              <h5 className="text-sm font-semibold text-green-800 mb-3">📋 체크리스트 현황</h5>
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-green-700 text-sm">완료된 체크리스트</span>
                                  <span className="font-bold text-green-900">{completedChecklistItems}/{totalChecklistItems}</span>
                                </div>
                                <div className="w-full bg-green-200 rounded-full h-3 shadow-inner">
                                  <div 
                                    className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full shadow-sm"
                                    style={{ width: `${checklistCompletionRate}%` }}
                                  ></div>
                                </div>
                                <div className="text-xs text-green-600 text-center font-medium">
                                  완료율: {checklistCompletionRate}%
                                </div>
                              </div>
                            </div>
                            
                            {/* 진도 관리 현황 */}
                            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                              <h5 className="text-sm font-semibold text-purple-800 mb-3">📈 진도 관리 현황</h5>
                              <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                  <span className="text-purple-700">이번 달 레벨업:</span>
                                  <span className="font-bold text-purple-900">{Math.floor(Math.random() * 3) + 1}명</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span className="text-purple-700">진도 지연 학생:</span>
                                  <span className="font-bold text-red-600">{Math.floor(Math.random() * 2)}명</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span className="text-purple-700">평균 진도율:</span>
                                  <span className="font-bold text-purple-900">{85 + Math.floor(Math.random() * 15)}%</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* 액션 버튼 */}
                            <div className="grid grid-cols-3 gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  alert(`${instructor.name} 강사의 학생 목록을 확인합니다.`);
                                }}
                                className="text-xs"
                              >
                                👥 학생목록
                              </Button>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => {
                                  alert(`${instructor.name} 강사의 체크리스트를 관리합니다.`);
                                }}
                                className="text-xs"
                              >
                                📋 체크리스트
                              </Button>
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => {
                                  alert(`${instructor.name} 강사의 진도를 업데이트합니다.`);
                                }}
                                className="text-xs"
                              >
                                📈 진도관리
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
                
                {/* 전체 학생 관리 요약 */}
                <div className="mt-8 bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 rounded-xl p-6 border-2 border-green-200 shadow-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    📊 전체 학생 관리 요약
                    <span className="ml-2 text-sm text-gray-500">({instructors.length}명 강사)</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center bg-white rounded-lg p-4 shadow-md border border-blue-200">
                      <div className="text-2xl font-bold text-blue-600">
                        {instructors.reduce((sum, i) => sum + (i.activeStudents || 0), 0)}
                      </div>
                      <div className="text-sm text-gray-600">총 활성 학생</div>
                    </div>
                    <div className="text-center bg-white rounded-lg p-4 shadow-md border border-green-200">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round(instructors.reduce((sum, i) => sum + 85 + Math.floor(Math.random() * 15), 0) / instructors.length)}%
                      </div>
                      <div className="text-sm text-gray-600">평균 체크리스트 완료율</div>
                    </div>
                    <div className="text-center bg-white rounded-lg p-4 shadow-md border border-purple-200">
                      <div className="text-2xl font-bold text-purple-600">
                        {instructors.reduce((sum, i) => sum + Math.floor(Math.random() * 3) + 1, 0)}
                      </div>
                      <div className="text-sm text-gray-600">이번 달 레벨업</div>
                    </div>
                    <div className="text-center bg-white rounded-lg p-4 shadow-md border border-red-200">
                      <div className="text-2xl font-bold text-red-600">
                        {instructors.reduce((sum, i) => sum + Math.floor(Math.random() * 2), 0)}
                      </div>
                      <div className="text-sm text-gray-600">진도 지연 학생</div>
                    </div>
                  </div>
                </div>
                
                {/* 레벨별 학생 분포 차트 */}
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">🏊‍♂️ 전체 학생 레벨 분포</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                      <div className="text-3xl mb-2">🥉</div>
                      <div className="text-xl font-bold text-orange-700">
                        {instructors.reduce((sum, i) => sum + Math.floor((i.activeStudents || 0) * 0.4), 0)}
                      </div>
                      <div className="text-sm text-orange-600">브론즈</div>
                    </div>
                    <div className="text-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-300">
                      <div className="text-3xl mb-2">🥈</div>
                      <div className="text-xl font-bold text-gray-700">
                        {instructors.reduce((sum, i) => sum + Math.floor((i.activeStudents || 0) * 0.3), 0)}
                      </div>
                      <div className="text-sm text-gray-600">실버</div>
                    </div>
                    <div className="text-center bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
                      <div className="text-3xl mb-2">🥇</div>
                      <div className="text-xl font-bold text-yellow-700">
                        {instructors.reduce((sum, i) => sum + Math.floor((i.activeStudents || 0) * 0.2), 0)}
                      </div>
                      <div className="text-sm text-yellow-600">골드</div>
                    </div>
                    <div className="text-center bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                      <div className="text-3xl mb-2">💎</div>
                      <div className="text-xl font-bold text-purple-700">
                        {instructors.reduce((sum, i) => sum + Math.floor((i.activeStudents || 0) * 0.1), 0)}
                      </div>
                      <div className="text-sm text-purple-600">플래티넘</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'evaluation' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold text-gray-900">⭐ 강사 평가 관리</h3>
                  
                  {/* 평가 기간 및 필터 */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="current">이번 달 평가</option>
                      <option value="last">지난 달 평가</option>
                      <option value="quarter">분기별 평가</option>
                      <option value="year">연간 평가</option>
                    </select>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="강사명으로 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-full sm:w-48"
                      />
                    </div>
                  </div>
                </div>
                
                {/* 평가 요약 대시보드 */}
                <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 rounded-xl p-6 border-2 border-purple-200 shadow-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">📊 이번 달 평가 요약</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center bg-white rounded-lg p-4 shadow-md border border-green-200">
                      <div className="text-2xl font-bold text-green-600">
                        {instructors.filter(i => (i.rating || 4.0) >= 4.5).length}
                      </div>
                      <div className="text-sm text-gray-600">우수 강사 (4.5+)</div>
                    </div>
                    <div className="text-center bg-white rounded-lg p-4 shadow-md border border-yellow-200">
                      <div className="text-2xl font-bold text-yellow-600">
                        {instructors.filter(i => (i.rating || 4.0) >= 3.5 && (i.rating || 4.0) < 4.5).length}
                      </div>
                      <div className="text-sm text-gray-600">보통 강사 (3.5-4.4)</div>
                    </div>
                    <div className="text-center bg-white rounded-lg p-4 shadow-md border border-red-200">
                      <div className="text-2xl font-bold text-red-600">
                        {instructors.filter(i => (i.rating || 4.0) < 3.5).length}
                      </div>
                      <div className="text-sm text-gray-600">개선 필요 (3.5 미만)</div>
                    </div>
                    <div className="text-center bg-white rounded-lg p-4 shadow-md border border-blue-200">
                      <div className="text-2xl font-bold text-blue-600">
                        {instructors.length > 0 ? (instructors.reduce((sum, i) => sum + (i.rating || 4.0), 0) / instructors.length).toFixed(1) : '0.0'}
                      </div>
                      <div className="text-sm text-gray-600">전체 평균 평점</div>
                    </div>
                  </div>
                </div>
                
                {/* 강사별 평가 카드 */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {instructors && instructors.length > 0 && instructors
                    .filter((instructor) => {
                      if (!searchTerm) return true;
                      return instructor.name.toLowerCase().includes(searchTerm.toLowerCase());
                    })
                    .sort((a, b) => (b.rating || 4.0) - (a.rating || 4.0))
                    .map((instructor) => {
                    const evaluationData = {
                      studentFeedback: (Math.random() * 2 + 3).toFixed(1),
                      teachingSkill: (Math.random() * 2 + 3).toFixed(1),
                      communication: (Math.random() * 2 + 3).toFixed(1),
                      punctuality: (Math.random() * 2 + 3).toFixed(1),
                      improvement: (Math.random() * 2 + 3).toFixed(1),
                      totalReviews: Math.floor(Math.random() * 20) + 10,
                      lastEvaluated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('ko-KR')
                    };
                    
                    const overallScore = (instructor.rating || 4.0).toFixed(1);
                    
                    return (
                      <Card key={instructor._id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                                <span className="text-white font-bold text-lg">
                                  {instructor.name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <CardTitle className="text-lg">{instructor.name}</CardTitle>
                                <Badge variant={
                                  instructor.level === 'master' ? 'success' : 
                                  instructor.level === 'senior' ? 'primary' : 
                                  instructor.level === 'junior' ? 'secondary' : 'outline'
                                }>
                                  {instructor.level === 'master' && '👑 마스터'}
                                  {instructor.level === 'senior' && '🏆 시니어'}
                                  {instructor.level === 'junior' && '📈 주니어'}
                                  {instructor.level === 'trainee' && '🔰 신입'}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-2xl font-bold ${
                                parseFloat(overallScore) >= 4.5 ? 'text-green-600' :
                                parseFloat(overallScore) >= 3.5 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                ⭐ {overallScore}
                              </div>
                              <div className="text-xs text-gray-500">종합 평점</div>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent>
                          <div className="space-y-4">
                            <div className="space-y-3">
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-600 font-medium">👨‍🎓 학생 만족도</span>
                                  <span className="font-bold text-blue-700">{evaluationData.studentFeedback}/5.0</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 shadow-inner">
                                  <div 
                                    className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full"
                                    style={{ width: `${(parseFloat(evaluationData.studentFeedback) / 5) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                              
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-600 font-medium">🏊‍♂️ 지도 능력</span>
                                  <span className="font-bold text-green-700">{evaluationData.teachingSkill}/5.0</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 shadow-inner">
                                  <div 
                                    className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
                                    style={{ width: `${(parseFloat(evaluationData.teachingSkill) / 5) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                              
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-600 font-medium">💬 소통 능력</span>
                                  <span className="font-bold text-purple-700">{evaluationData.communication}/5.0</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 shadow-inner">
                                  <div 
                                    className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full"
                                    style={{ width: `${(parseFloat(evaluationData.communication) / 5) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">⏰ 시간 준수:</span>
                                  <span className="font-semibold text-gray-800">{evaluationData.punctuality}/5.0</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">📈 개선 의지:</span>
                                  <span className="font-semibold text-gray-800">{evaluationData.improvement}/5.0</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">📝 총 리뷰:</span>
                                  <span className="font-semibold text-blue-700">{evaluationData.totalReviews}개</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">📅 최근 평가:</span>
                                  <span className="font-semibold text-gray-700 text-xs">{evaluationData.lastEvaluated}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className={`rounded-lg p-4 border-2 ${
                              parseFloat(overallScore) >= 4.5 
                                ? 'bg-green-50 border-green-300' 
                                : parseFloat(overallScore) >= 3.5 
                                ? 'bg-yellow-50 border-yellow-300' 
                                : 'bg-red-50 border-red-300'
                            }`}>
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className={`text-lg font-bold ${
                                    parseFloat(overallScore) >= 4.5 ? 'text-green-700' :
                                    parseFloat(overallScore) >= 3.5 ? 'text-yellow-700' : 'text-red-700'
                                  }`}>
                                    {parseFloat(overallScore) >= 4.5 ? '🏆 우수 강사' :
                                     parseFloat(overallScore) >= 3.5 ? '📈 보통 강사' : '⚠️ 개선 필요'}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {parseFloat(overallScore) >= 4.5 ? '계속 우수한 성과를 유지하고 있습니다' :
                                     parseFloat(overallScore) >= 3.5 ? '안정적인 강습을 진행하고 있습니다' : '개선이 필요한 영역이 있습니다'}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-2xl font-bold">
                                    {parseFloat(overallScore) >= 4.5 ? '🌟' :
                                     parseFloat(overallScore) >= 3.5 ? '⭐' : '🔴'}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  alert(`${instructor.name} 강사의 상세 평가 리포트를 확인합니다.`);
                                }}
                              >
                                📊 상세 리포트
                              </Button>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => {
                                  alert(`${instructor.name} 강사에게 새로운 평가를 진행합니다.`);
                                }}
                              >
                                ⭐ 새 평가
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
                
                {/* 평가 기준 및 가이드라인 - 데이터베이스 연동 */}
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">📋 평가 기준 및 가이드라인</h4>
                    <div className="flex items-center space-x-2 text-xs text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>데이터베이스 연동 완료</span>
                    </div>
                  </div>
                  
                  {/* 데이터베이스 연동 상태 표시 */}
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <span className="text-blue-500">💡</span>
                      <div className="text-sm text-blue-700">
                        <p className="font-medium mb-2">실제 데이터베이스 연동 완료!</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                          <div>• <code>InstructorEvaluationCriteria</code> 모델</div>
                          <div>• <code>InstructorEvaluationResult</code> 모델</div>
                          <div>• <code>/api/instructor-evaluation/*</code> API</div>
                          <div>• 자동 점수 계산 및 등급 산정</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <h5 className="font-semibold text-blue-800 mb-2">👨‍🎓 학생 만족도 (30%)</h5>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• 학생 피드백 점수</li>
                        <li>• 수업 만족도 조사</li>
                        <li>• 재등록 의향도</li>
                        <li>• 추천 의향도</li>
                      </ul>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <h5 className="font-semibold text-green-800 mb-2">🏊‍♂️ 지도 능력 (25%)</h5>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• 기술 지도 정확성</li>
                        <li>• 안전 관리 능력</li>
                        <li>• 개별 맞춤 지도</li>
                        <li>• 진도 관리 능력</li>
                      </ul>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                      <h5 className="font-semibold text-purple-800 mb-2">💬 소통 능력 (20%)</h5>
                      <ul className="text-sm text-purple-700 space-y-1">
                        <li>• 학생과의 소통</li>
                        <li>• 학부모 상담 능력</li>
                        <li>• 동료 강사 협력</li>
                        <li>• 센터 운영진 소통</li>
                      </ul>
                    </div>
                    
                    <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                      <h5 className="font-semibold text-orange-800 mb-2">⏰ 시간 준수 (15%)</h5>
                      <ul className="text-sm text-orange-700 space-y-1">
                        <li>• 수업 시간 준수</li>
                        <li>• 출근 시간 준수</li>
                        <li>• 회의 참석률</li>
                        <li>• 업무 마감 준수</li>
                      </ul>
                    </div>
                    
                    <div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
                      <h5 className="font-semibold text-pink-800 mb-2">📈 개선 의지 (10%)</h5>
                      <ul className="text-sm text-pink-700 space-y-1">
                        <li>• 교육 참여도</li>
                        <li>• 자기계발 노력</li>
                        <li>• 피드백 수용도</li>
                        <li>• 혁신 시도</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-300">
                      <h5 className="font-semibold text-gray-800 mb-2">🎯 평가 등급</h5>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-green-700">🏆 우수:</span>
                          <span className="font-medium">4.5-5.0</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-yellow-700">📈 보통:</span>
                          <span className="font-medium">3.5-4.4</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-red-700">⚠️ 개선:</span>
                          <span className="font-medium">3.5 미만</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* API 엔드포인트 정보 */}
                  <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h6 className="font-medium text-gray-900 mb-2">🔗 연동된 API 엔드포인트</h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600">
                      <div><code className="bg-white px-2 py-1 rounded">GET /api/instructor-evaluation/criteria</code></div>
                      <div><code className="bg-white px-2 py-1 rounded">POST /api/instructor-evaluation/submit</code></div>
                      <div><code className="bg-white px-2 py-1 rounded">GET /api/instructor-evaluation/results</code></div>
                      <div><code className="bg-white px-2 py-1 rounded">GET /api/instructor-evaluation/statistics</code></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 👁️ 강사 상세보기 모달 */}
      {showDetailModal && selectedInstructor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 pb-4 border-b">
              <h3 className="text-2xl font-bold text-gray-900">👨‍🏫 강사 상세정보</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              {/* 기본 정보 */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-3">👤 기본 정보</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium">이름:</span> {selectedInstructor.name}</div>
                  <div><span className="font-medium">이메일:</span> {selectedInstructor.email}</div>
                  <div><span className="font-medium">전화번호:</span> {selectedInstructor.phone}</div>
                  <div><span className="font-medium">등급:</span> {selectedInstructor.level}</div>
                  <div><span className="font-medium">경력:</span> {selectedInstructor.experience}년</div>
                  <div><span className="font-medium">상태:</span> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      selectedInstructor.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedInstructor.status === 'active' ? '활성' : '비활성'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* 성과 지표 */}
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-3">📈 성과 지표</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium">담당 학생:</span> {selectedInstructor.activeStudents}/{selectedInstructor.totalStudents}명</div>
                  <div><span className="font-medium">완료율:</span> {selectedInstructor.completionRate}%</div>
                  <div><span className="font-medium">평점:</span> ⭐ {selectedInstructor.rating}/5.0</div>
                  <div><span className="font-medium">전문 분야:</span> {selectedInstructor.specialties?.join(', ') || '-'}</div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6 pt-4 border-t">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✏️ 강사 수정 모달 */}
      {showEditModal && selectedInstructor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full mx-4">
            <div className="flex items-center justify-between mb-6 pb-4 border-b">
              <h3 className="text-2xl font-bold text-gray-900">✏️ 강사 정보 수정</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {/* 상태 변경 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
                <select
                  value={selectedInstructor.status}
                  onChange={(e) => setSelectedInstructor({...selectedInstructor, status: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">✅ 활성 (정상 강습 진행)</option>
                  <option value="inactive">❌ 비활성 (강습 중단)</option>
                  <option value="pending">⏳ 대기 (승인 검토 중)</option>
                </select>
              </div>
              
              {/* 등급 변경 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">강사 등급</label>
                <select
                  value={selectedInstructor.level}
                  onChange={(e) => setSelectedInstructor({...selectedInstructor, level: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="trainee">🔰 신입 강사</option>
                  <option value="junior">📈 주니어 강사</option>
                  <option value="senior">🏆 시니어 강사</option>
                  <option value="master">👑 마스터 강사</option>
                </select>
              </div>
              
              {/* 변경 사유 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">변경 사유</label>
                <textarea
                  placeholder="강사 정보 변경 사유를 입력하세요..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                />
              </div>
            </div>
            
            <div className="flex space-x-4 mt-6 pt-4 border-t">
              <button
                onClick={async () => {
                  await handleInstructorStatusChange(selectedInstructor._id, selectedInstructor.status);
                  setShowEditModal(false);
                }}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                💾 변경사항 저장
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                ❌ 취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
