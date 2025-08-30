/**
 * ✅ JJ Swim Lab - 총매출 관리 API 클라이언트
 * 
 * 📋 **기능**
 * - 총매출 통계 조회
 * - 강사별 매출 현황
 * - 과정별 매출 현황
 * - 최근 거래 내역
 * - 매출 트렌드 분석
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// 인증 토큰 가져오기
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// API 요청 헤더
const getHeaders = (): HeadersInit => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// API 응답 처리
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// 총매출 통계 조회
export const getRevenueStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/revenue/stats`, {
      method: 'GET',
      headers: getHeaders()
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('총매출 통계 조회 실패:', error);
    throw error;
  }
};

// 강사별 상세 매출 현황
export const getInstructorRevenue = async (instructorId: string, startDate?: string, endDate?: string) => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await fetch(`${API_BASE_URL}/api/revenue/instructor/${instructorId}?${params}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('강사별 매출 현황 조회 실패:', error);
    throw error;
  }
};

// 과정별 상세 매출 현황
export const getCourseRevenue = async (courseId: string, startDate?: string, endDate?: string) => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await fetch(`${API_BASE_URL}/api/revenue/course/${courseId}?${params}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('과정별 매출 현황 조회 실패:', error);
    throw error;
  }
};

// 타입 정의
export interface RevenueStats {
  totalRevenue: number;
  instructorRevenue: InstructorRevenue[];
  courseRevenue: CourseRevenue[];
  recentTransactions: RecentTransaction[];
  monthlyTrend: MonthlyTrend[];
}

export interface InstructorRevenue {
  _id: string;
  instructorName: string;
  totalRevenue: number;
  transactionCount: number;
}

export interface CourseRevenue {
  _id: string;
  courseName: string;
  totalRevenue: number;
  enrollmentCount: number;
}

export interface RecentTransaction {
  id: string;
  studentName: string;
  courseName: string;
  instructorName: string;
  amount: number;
  status: string;
  date: string;
}

export interface MonthlyTrend {
  period: string;
  revenue: number;
  count: number;
}

