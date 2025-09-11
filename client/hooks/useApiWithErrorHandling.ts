/**
 * 🛠️ JJ Swim Lab - useApiWithErrorHandling 훅
 * 
 * 📋 **훅 목적**
 * - API 호출과 에러 처리를 통합한 커스텀 훅
 * - React Query와 에러 핸들러를 결합하여 안정적인 API 호출
 * - 사용자 친화적인 에러 메시지 자동 제공
 * - 에러 복구 및 재시도 기능 내장
 * 
 * 🔄 **주요 기능**
 * - API 호출과 에러 처리 통합
 * - 자동 에러 토스트 표시
 * - 에러 복구 및 재시도 기능
 * - 로딩 상태 및 에러 상태 관리
 * - 사용자 친화적인 에러 메시지
 * 
 * 🗄️ **데이터 연동**
 * - API 요청 및 응답 데이터
 * - 에러 정보 및 컨텍스트
 * - 로딩 및 에러 상태
 * - 재시도 및 복구 상태
 * - 사용자 액션 및 피드백
 * 
 * 🛠️ **필요한 설치 파일**
 * - React Query (@tanstack/react-query)
 * - useErrorHandler 훅
 * - API 클라이언트 함수들
 * - 에러 토스트 시스템
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. API 호출의 성능 최적화
 * 2. 에러 처리의 일관성 유지
 * 3. 메모리 누수 방지
 * 4. 사용자 경험 고려
 * 5. 에러 로깅의 민감한 데이터 보호
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] API 호출 및 에러 처리 동작 확인
 * - [ ] 에러 토스트 표시 검증
 * - [ ] 재시도 및 복구 기능 확인
 * - [ ] 로딩 상태 관리 확인
 * - [ ] 성능 및 메모리 사용량 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 API 에러 처리)
 * - 2024-12-19: React Query 통합 구현
 * - 2024-12-19: 에러 복구 및 재시도 시스템 구현
 * - 2024-12-19: 사용자 친화적인 에러 메시지 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (API 에러 처리 시스템 완료)
 * 
 * 🚀 **다음 단계**
 * - 고급 에러 분석 및 예측
 * - 자동 에러 복구 시스템
 * - 성능 최적화
 * - 사용자 경험 개선
 * 
 * 💡 **사용 예시**
 * ```tsx
 * const { data, isLoading, error, refetch } = useApiWithErrorHandling(
 *   'users',
 *   () => fetchUsers(),
 *   { retry: 3, retryDelay: 1000 }
 * );
 * ```
 */

'use client';

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { useErrorHandler } from './useErrorHandler';

interface UseApiWithErrorHandlingOptions<T> extends Omit<UseQueryOptions<T>, 'queryFn' | 'queryKey'> {
  retry?: number;
  retryDelay?: number;
  onError?: (error: Error) => void;
  onSuccess?: (data: T) => void;
}

interface UseMutationWithErrorHandlingOptions<T, V> extends Omit<UseMutationOptions<T, Error, V>, 'mutationFn'> {
  retry?: number;
  retryDelay?: number;
  onError?: (error: Error) => void;
  onSuccess?: (data: T) => void;
}

export const useApiWithErrorHandling = <T>(
  queryKey: string | string[],
  queryFn: () => Promise<T>,
  options: UseApiWithErrorHandlingOptions<T> = {}
) => {
  const { handleError } = useErrorHandler();
  const {
    retry = 3,
    retryDelay = 1000,
    onError,
    onSuccess,
    ...queryOptions
  } = options;

  const query = useQuery({
    queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
    queryFn: async () => {
      try {
        const data = await queryFn();
        if (onSuccess) {
          onSuccess(data);
        }
        return data;
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        
        // 에러 핸들러에 전달
        handleError(errorObj, {
          context: 'API 호출',
          action: 'query',
          metadata: { queryKey: Array.isArray(queryKey) ? queryKey : [queryKey] }
        });

        // 커스텀 에러 핸들러 호출
        if (onError) {
          onError(errorObj);
        }

        throw errorObj;
      }
    },
    retry: (failureCount, error) => {
      // 재시도 횟수 확인
      if (failureCount >= retry) {
        return false;
      }

      // 특정 에러 타입은 재시도하지 않음
      if (error instanceof Error) {
        const message = error.message.toLowerCase();
        if (message.includes('auth') || message.includes('permission') || message.includes('validation')) {
          return false;
        }
      }

      return true;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, retryDelay),
    ...queryOptions,
  });

  return {
    ...query,
    refetch: () => {
      try {
        return query.refetch();
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        handleError(errorObj, {
          context: 'API 재시도',
          action: 'refetch',
          metadata: { queryKey: Array.isArray(queryKey) ? queryKey : [queryKey] }
        });
        throw errorObj;
      }
    },
  };
};

export const useMutationWithErrorHandling = <T, V = void>(
  mutationFn: (variables: V) => Promise<T>,
  options: UseMutationWithErrorHandlingOptions<T, V> = {}
) => {
  const { handleError } = useErrorHandler();
  const queryClient = useQueryClient();
  const {
    retry = 1,
    retryDelay = 1000,
    onError,
    onSuccess,
    ...mutationOptions
  } = options;

  const mutation = useMutation({
    mutationFn: async (variables: V) => {
      try {
        const data = await mutationFn(variables);
        if (onSuccess) {
          onSuccess(data);
        }
        return data;
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        
        // 에러 핸들러에 전달
        handleError(errorObj, {
          context: 'API 뮤테이션',
          action: 'mutation',
          metadata: { variables }
        });

        // 커스텀 에러 핸들러 호출
        if (onError) {
          onError(errorObj);
        }

        throw errorObj;
      }
    },
    retry: (failureCount, error) => {
      // 재시도 횟수 확인
      if (failureCount >= retry) {
        return false;
      }

      // 특정 에러 타입은 재시도하지 않음
      if (error instanceof Error) {
        const message = error.message.toLowerCase();
        if (message.includes('auth') || message.includes('permission') || message.includes('validation')) {
          return false;
        }
      }

      return true;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, retryDelay),
    ...mutationOptions,
  });

  return {
    ...mutation,
    mutate: (variables: V) => {
      try {
        return mutation.mutate(variables);
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        handleError(errorObj, {
          context: 'API 뮤테이션 실행',
          action: 'mutate',
          metadata: { variables }
        });
        throw errorObj;
      }
    },
    mutateAsync: async (variables: V) => {
      try {
        return await mutation.mutateAsync(variables);
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        handleError(errorObj, {
          context: 'API 뮤테이션 비동기 실행',
          action: 'mutateAsync',
          metadata: { variables }
        });
        throw errorObj;
      }
    },
  };
};

// 편의 함수들
export const useApiQuery = useApiWithErrorHandling;
export const useApiMutation = useMutationWithErrorHandling;
