/**
 * ✅ JJ Swim Lab - 승인대기 관리 API 클라이언트
 * 
 * 📋 **기능**
 * - 승인 요청 목록 조회
 * - 승인/거부 처리
 * - 승인 상태별 필터링
 * - 승인 이력 관리
 * - 승인 통계 조회
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

// 승인 요청 목록 조회
export const getApprovals = async (params?: {
  status?: string;
  type?: string;
  page?: number;
  limit?: number;
}) => {
  try {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.type) searchParams.append('type', params.type);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const response = await fetch(`${API_BASE_URL}/api/approvals?${searchParams}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('승인 요청 목록 조회 실패:', error);
    throw error;
  }
};

// 승인 요청 상세 조회
export const getApprovalDetail = async (id: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/approvals/${id}`, {
      method: 'GET',
      headers: getHeaders()
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('승인 요청 상세 조회 실패:', error);
    throw error;
  }
};

// 승인/거부 처리
export const processApproval = async (id: string, action: 'approve' | 'reject', reason?: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/approvals/${id}/process`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ action, reason })
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('승인 처리 실패:', error);
    throw error;
  }
};

// 승인 통계 조회
export const getApprovalStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/approvals/stats/overview`, {
      method: 'GET',
      headers: getHeaders()
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('승인 통계 조회 실패:', error);
    throw error;
  }
};

// 타입 정의
export interface ApprovalItem {
  id: string;
  type: 'course_enrollment' | 'instructor_registration' | 'payment_approval' | 'schedule_change' | 'refund_request';
  title: string;
  description: string;
  requesterName: string;
  requesterType: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  estimatedAmount?: number;
  courseName?: string;
  instructorName?: string;
  createdAt: string;
}

export interface ApprovalListResponse {
  success: boolean;
  data: {
    approvals: ApprovalItem[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface ApprovalStats {
  statusStats: Array<{ _id: string; count: number }>;
  typeStats: Array<{ _id: string; count: number }>;
  priorityStats: Array<{ _id: string; count: number }>;
  dailyTrend: Array<{ _id: { date: string; status: string }; count: number }>;
}

