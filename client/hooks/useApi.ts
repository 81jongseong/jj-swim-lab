/**
 * 🔄 JJ Swim Lab - API 훅
 * 
 * 📋 **목적**
 * - React Query를 사용한 API 호출 최적화
 * - 데이터 캐싱, 자동 재검증, 에러 처리
 * - 로딩 상태 및 에러 상태 관리
 * 
 * 🔄 **주요 기능**
 * - 쿼리 캐싱 및 무효화
 * - 자동 재시도 및 에러 처리
 * - 백그라운드 데이터 동기화
 * - 낙관적 업데이트
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiWithErrorHandling, useMutationWithErrorHandling } from './useApiWithErrorHandling';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// API 요청 헤더 생성
const getHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// API 요청 함수
const apiRequest = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// 퀴즈 관련 훅들
export const useQuizzes = () => {
  return useApiWithErrorHandling(
    ['quizzes'],
    () => apiRequest('/api/quiz'),
    {
      retry: 3,
      retryDelay: 1000,
      staleTime: 5 * 60 * 1000, // 5분
    }
  );
};

export const useQuizAttempts = () => {
  return useApiWithErrorHandling(
    ['quiz-attempts'],
    () => apiRequest('/api/quiz/attempts/user'),
    {
      retry: 3,
      retryDelay: 1000,
      staleTime: 2 * 60 * 1000, // 2분
    }
  );
};

export const useQuiz = (id: string) => {
  return useApiWithErrorHandling(
    ['quiz', id],
    () => apiRequest(`/api/quiz/${id}`),
    {
      retry: 3,
      retryDelay: 1000,
      enabled: !!id,
    }
  );
};

// 수업 계획 관련 훅들
export const useLessonPlans = () => {
  return useApiWithErrorHandling(
    ['lesson-plans'],
    () => apiRequest('/api/lesson-plans'),
    {
      retry: 3,
      retryDelay: 1000,
      staleTime: 10 * 60 * 1000, // 10분
    }
  );
};

export const useLessonPlan = (id: string) => {
  return useApiWithErrorHandling(
    ['lesson-plan', id],
    () => apiRequest(`/api/lesson-plans/${id}`),
    {
      retry: 3,
      retryDelay: 1000,
      enabled: !!id,
    }
  );
};

// 강습법 관련 훅들
export const useTeachingMethods = () => {
  return useApiWithErrorHandling(
    ['teaching-methods'],
    () => apiRequest('/api/teaching-methods'),
    {
      retry: 3,
      retryDelay: 1000,
      staleTime: 15 * 60 * 1000, // 15분
    }
  );
};

export const useTeachingMethod = (id: string) => {
  return useApiWithErrorHandling(
    ['teaching-method', id],
    () => apiRequest(`/api/teaching-methods/${id}`),
    {
      retry: 3,
      retryDelay: 1000,
      enabled: !!id,
    }
  );
};

// 사용자 대시보드 관련 훅들
export const useUserDashboard = () => {
  return useQuery({
    queryKey: ['user-dashboard'],
    queryFn: () => apiRequest('/api/dashboard'),
    staleTime: 2 * 60 * 1000, // 2분
  });
};

// 강사 대시보드 관련 훅들
export const useInstructorDashboard = () => {
  return useQuery({
    queryKey: ['instructor-dashboard'],
    queryFn: () => apiRequest('/api/instructor/dashboard'),
    staleTime: 2 * 60 * 1000, // 2분
  });
};

// 관리자 대시보드 관련 훅들
export const useAdminDashboard = () => {
  return useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => apiRequest('/api/dashboard/stats'),
    staleTime: 1 * 60 * 1000, // 1분
  });
};

// 매출 관련 훅들
export const useRevenueStats = () => {
  return useQuery({
    queryKey: ['revenue-stats'],
    queryFn: () => apiRequest('/api/revenue/stats'),
    staleTime: 5 * 60 * 1000, // 5분
  });
};

// 승인 관련 훅들
export const useApprovals = () => {
  return useQuery({
    queryKey: ['approvals'],
    queryFn: () => apiRequest('/api/approvals'),
    staleTime: 1 * 60 * 1000, // 1분
  });
};

// 뮤테이션 훅들
export const useCreateQuiz = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => apiRequest('/api/quiz', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
  });
};

export const useUpdateQuiz = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiRequest(`/api/quiz/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      queryClient.invalidateQueries({ queryKey: ['quiz', id] });
    },
  });
};

export const useDeleteQuiz = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiRequest(`/api/quiz/${id}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
  });
};

export const useProcessApproval = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, action, reason }: { id: string; action: string; reason?: string }) => 
      apiRequest(`/api/approvals/${id}/process`, {
        method: 'PUT',
        body: JSON.stringify({ action, reason }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    },
  });
};

// 캐시 무효화 유틸리티
export const useInvalidateQueries = () => {
  const queryClient = useQueryClient();
  
  return {
    invalidateAll: () => queryClient.invalidateQueries(),
    invalidateQuizzes: () => queryClient.invalidateQueries({ queryKey: ['quizzes'] }),
    invalidateLessonPlans: () => queryClient.invalidateQueries({ queryKey: ['lesson-plans'] }),
    invalidateTeachingMethods: () => queryClient.invalidateQueries({ queryKey: ['teaching-methods'] }),
    invalidateDashboard: () => queryClient.invalidateQueries({ queryKey: ['user-dashboard', 'instructor-dashboard', 'admin-dashboard'] }),
  };
};
