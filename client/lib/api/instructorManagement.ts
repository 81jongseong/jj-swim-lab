/**
 * 🌐 JJ Swim Lab - 강사관리 API 클라이언트
 * 
 * 📋 **클라이언트 목적**
 * - 강사관리 시스템의 모든 API 호출을 담당
 * - 데이터 타입 정의 및 검증
 * - 에러 처리 및 응답 표준화
 * - 인증 토큰 자동 관리
 * 
 * 🔄 **주요 기능**
 * - 강사 현황 및 목록 조회
 * - 강사 정보 CRUD 작업
 * - 강사별 성과 데이터 조회
 * - 학생 관리 현황 조회
 * - 센터별 강사 현황 조회
 * 
 * 🗄️ **API 엔드포인트**
 * - GET /api/instructor-management/overview
 * - GET /api/instructor-management/instructors
 * - GET /api/instructor-management/instructors/:id
 * - PUT /api/instructor-management/instructors/:id
 * - GET /api/instructor-management/performance/:instructorId
 * - GET /api/instructor-management/students/:instructorId
 * - GET /api/instructor-management/centers
 * 
 * 🛠️ **필요한 설치 파일**
 * - fetch API (브라우저 내장)
 * - TypeScript (타입 정의)
 * - 인증 토큰 관리
 * - 에러 처리 유틸리티
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 인증 토큰 자동 갱신
 * 2. 에러 처리 및 사용자 피드백
 * 3. 데이터 타입 안전성
 * 4. API 응답 시간 최적화
 * 5. 오프라인 상태 처리
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] API 엔드포인트 URL 확인
 * - [ ] 데이터 타입 정의 검증
 * - [ ] 에러 처리 로직 확인
 * - [ ] 인증 토큰 관리 검증
 * - [ ] API 응답 시간 테스트
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (강사관리 API 클라이언트)
 * - 2024-12-19: 데이터 타입 정의 구현
 * - 2024-12-19: 에러 처리 시스템 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (강사관리 API 클라이언트 완료)
 * 
 * 🚀 **다음 단계**
 * - 실시간 데이터 업데이트
 * - 캐싱 시스템 구현
 * - 오프라인 지원
 * - 성능 최적화
 * 
 * 💡 **사용 예시**
 * ```typescript
 * // 강사 목록 조회
 * const instructors = await getInstructors({ page: 1, limit: 10 });
 * 
 * // 강사 성과 데이터 조회
 * const performance = await getInstructorPerformance('instructorId');
 * 
 * // 강사 정보 업데이트
 * const updated = await updateInstructor('instructorId', updateData);
 * ```
 */

// 인증 토큰 가져오기 함수
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// 기본 API 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// 공통 응답 타입
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 에러 타입
interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// 공통 API 호출 함수
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const token = getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API 호출 실패 (${endpoint}):`, error);
    throw error;
  }
}

// ==================== 타입 정의 ====================

export interface Instructor {
  _id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  userType: 'instructor';
  centerId: string;
  specialization: string;
  experience: number;
  rating: number;
  status: 'active' | 'inactive' | 'pending';
  joinDate: string;
  lastActive: string;
  bio?: string;
  totalStudents?: number;
  activeStudents?: number;
  completionRate?: number;
}

export interface InstructorDetail extends Instructor {
  center: {
    _id: string;
    name: string;
    address: string;
    phone: string;
  };
  students: StudentSummary[];
  recentBookings: BookingSummary[];
  recentChecklists: ChecklistSummary[];
}

export interface StudentSummary {
  _id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  lastActive: string;
}

export interface BookingSummary {
  _id: string;
  date: string;
  time: string;
  status: string;
  student: { _id: string; name: string };
  course: { _id: string; name: string; level: string };
}

export interface ChecklistSummary {
  _id: string;
  title: string;
  status: string;
  createdAt: string;
  student: { _id: string; name: string };
}

export interface PerformanceMetrics {
  instructorId: string;
  period: string;
  totalLessons: number;
  completedLessons: number;
  studentSatisfaction: number;
  progressRate: number;
  attendanceRate: number;
  monthlyGrowth: number;
}

export interface StudentManagement {
  instructorId: string;
  students: StudentManagementDetail[];
}

export interface StudentManagementDetail {
  _id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  lastActive: string;
  joinDate: string;
  checklistProgress: number;
  courseProgress: number;
  hasHealthData: boolean;
  totalChecklists: number;
}

export interface CenterInstructorSummary {
  _id: string;
  name: string;
  address: string;
  phone: string;
  instructorCount: number;
  studentCount: number;
  instructors: InstructorSummary[];
  students: StudentSummary[];
}

export interface InstructorSummary {
  _id: string;
  name: string;
  email: string;
  status: string;
  rating: number;
}

export interface OverviewData {
  totalInstructors: number;
  activeInstructors: number;
  totalStudents: number;
  averageRating: number;
  centerDistribution: Array<{
    _id: string;
    centerName: string;
    count: number;
  }>;
}

export interface InstructorListResponse {
  instructors: Instructor[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface InstructorFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  center?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface InstructorUpdateData {
  name?: string;
  email?: string;
  phone?: string;
  specialization?: string;
  experience?: number;
  status?: string;
  centerId?: string;
  rating?: number;
  bio?: string;
}

// ==================== API 함수들 ====================

/**
 * 🎯 **전체 강사 현황 조회**
 * GET /api/instructor-management/overview
 */
export async function getInstructorOverview(): Promise<OverviewData> {
  const response: ApiResponse<OverviewData> = await apiCall('/api/instructor-management/overview');
  return response.data!;
}

/**
 * 🎯 **강사 목록 조회**
 * GET /api/instructor-management/instructors
 */
export async function getInstructors(filters: InstructorFilters = {}): Promise<InstructorListResponse> {
  const queryParams = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      queryParams.append(key, String(value));
    }
  });
  
  const endpoint = `/api/instructor-management/instructors${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response: ApiResponse<InstructorListResponse> = await apiCall(endpoint);
  return response.data!;
}

/**
 * 🎯 **강사 상세 정보 조회**
 * GET /api/instructor-management/instructors/:id
 */
export async function getInstructorDetail(id: string): Promise<InstructorDetail> {
  const response: ApiResponse<InstructorDetail> = await apiCall(`/api/instructor-management/instructors/${id}`);
  return response.data!;
}

/**
 * 🎯 **강사 정보 업데이트**
 * PUT /api/instructor-management/instructors/:id
 */
export async function updateInstructor(id: string, updateData: InstructorUpdateData): Promise<Instructor> {
  const response: ApiResponse<Instructor> = await apiCall(`/api/instructor-management/instructors/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updateData),
  });
  return response.data!;
}

/**
 * 🎯 **강사 성과 데이터 조회**
 * GET /api/instructor-management/performance/:instructorId
 */
export async function getInstructorPerformance(
  instructorId: string, 
  period: 'week' | 'month' | 'quarter' | 'year' = 'month'
): Promise<PerformanceMetrics> {
  const response: ApiResponse<PerformanceMetrics> = await apiCall(
    `/api/instructor-management/performance/${instructorId}?period=${period}`
  );
  return response.data!;
}

/**
 * 🎯 **강사별 학생 관리 현황 조회**
 * GET /api/instructor-management/students/:instructorId
 */
export async function getInstructorStudents(instructorId: string): Promise<StudentManagement> {
  const response: ApiResponse<StudentManagement> = await apiCall(`/api/instructor-management/students/${instructorId}`);
  return response.data!;
}

/**
 * 🎯 **센터별 강사 현황 조회**
 * GET /api/instructor-management/centers
 */
export async function getCenterInstructorSummary(): Promise<CenterInstructorSummary[]> {
  const response: ApiResponse<CenterInstructorSummary[]> = await apiCall('/api/instructor-management/centers');
  return response.data!;
}

// ==================== 유틸리티 함수들 ====================

/**
 * 🔍 **강사 검색 및 필터링**
 */
export function filterInstructors(
  instructors: Instructor[],
  searchTerm: string,
  statusFilter: string,
  centerFilter: string
): Instructor[] {
  return instructors.filter(instructor => {
    const matchesSearch = !searchTerm || 
      instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || instructor.status === statusFilter;
    const matchesCenter = centerFilter === 'all' || instructor.centerId === centerFilter;
    
    return matchesSearch && matchesStatus && matchesCenter;
  });
}

/**
 * 📊 **강사 성과 등급 계산**
 */
export function calculateInstructorGrade(performance: PerformanceMetrics): string {
  const { studentSatisfaction, attendanceRate } = performance;
  
  const averageScore = (studentSatisfaction * 20 + attendanceRate) / 2;
  
  if (averageScore >= 90) return 'A+';
  if (averageScore >= 80) return 'A';
  if (averageScore >= 70) return 'B+';
  if (averageScore >= 60) return 'B';
  if (averageScore >= 50) return 'C+';
  return 'C';
}

/**
 * 📈 **성과 트렌드 분석**
 */
export function analyzePerformanceTrend(performance: PerformanceMetrics): {
  trend: 'improving' | 'stable' | 'declining';
  message: string;
} {
  const { monthlyGrowth } = performance;
  
  if (monthlyGrowth > 5) {
    return {
      trend: 'improving',
      message: `월간 성장률 ${monthlyGrowth}%로 우수한 성과를 보이고 있습니다.`
    };
  } else if (monthlyGrowth > -5) {
    return {
      trend: 'stable',
      message: `월간 성장률 ${monthlyGrowth}%로 안정적인 성과를 유지하고 있습니다.`
    };
  } else {
    return {
      trend: 'declining',
      message: `월간 성장률 ${monthlyGrowth}%로 개선이 필요한 상황입니다.`
    };
  }
}

/**
 * 🎯 **강사 추천 시스템**
 */
export function recommendInstructors(
  instructors: Instructor[],
  criteria: 'rating' | 'experience' | 'completionRate' | 'activeStudents'
): Instructor[] {
  return [...instructors].sort((a, b) => {
    const aValue = a[criteria] || 0;
    const bValue = b[criteria] || 0;
    return bValue - aValue;
  });
}

// ==================== 에러 처리 ====================

/**
 * ❌ **API 에러 처리**
 */
export function handleApiError(error: any): ApiError {
  if (error instanceof Error) {
    return {
      message: error.message,
      status: 500,
      code: 'UNKNOWN_ERROR'
    };
  }
  
  return {
    message: '알 수 없는 오류가 발생했습니다.',
    status: 500,
    code: 'UNKNOWN_ERROR'
  };
}

/**
 * 🔄 **재시도 로직**
 */
export async function retryApiCall<T>(
  apiFunction: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiFunction();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // 지수 백오프
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
    }
  }
  
  throw lastError;
}

// ==================== 내보내기 ====================

export default {
  // 기본 API 함수들
  getInstructorOverview,
  getInstructors,
  getInstructorDetail,
  updateInstructor,
  getInstructorPerformance,
  getInstructorStudents,
  getCenterInstructorSummary,
  
  // 유틸리티 함수들
  filterInstructors,
  calculateInstructorGrade,
  analyzePerformanceTrend,
  recommendInstructors,
  
  // 에러 처리
  handleApiError,
  retryApiCall
};

