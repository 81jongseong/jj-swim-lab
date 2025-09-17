import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { useState, useCallback, useMemo } from 'react';

// 고급 TypeScript 패턴: Generic Types와 Utility Types 활용
type QueryKey = readonly unknown[];
type QueryData = unknown;
type MutationData = unknown;
type MutationVariables = unknown;

// 고급 타입 정의
interface AdvancedQueryOptions<TData = QueryData, TError = Error> extends Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'> {
  queryKey: QueryKey;
  queryFn: () => Promise<TData>;
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean;
  retry?: boolean | number;
  retryDelay?: number | ((retryAttempt: number, error: TError) => number);
}

interface AdvancedMutationOptions<TData = MutationData, TError = Error, TVariables = MutationVariables> extends Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onSuccess?: (data: TData, variables: TVariables, context: unknown) => void | Promise<void>;
  onError?: (error: TError, variables: TVariables, context: unknown) => void | Promise<void>;
  onSettled?: (data: TData | undefined, error: TError | null, variables: TVariables, context: unknown) => void | Promise<void>;
}

// 고급 쿼리 훅
export function useAdvancedQuery<TData = QueryData, TError = Error>(
  options: AdvancedQueryOptions<TData, TError>
) {
  const [isRefetching, setIsRefetching] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);

  const query = useQuery({
    ...options,
    onSuccess: (data) => {
      setLastFetchTime(new Date());
      options.onSuccess?.(data);
    },
    onError: (error) => {
      options.onError?.(error);
    },
  });

  const refetch = useCallback(async () => {
    setIsRefetching(true);
    try {
      await query.refetch();
    } finally {
      setIsRefetching(false);
    }
  }, [query]);

  const invalidate = useCallback(() => {
    const queryClient = useQueryClient();
    queryClient.invalidateQueries({ queryKey: options.queryKey });
  }, [options.queryKey]);

  const prefetch = useCallback(async () => {
    const queryClient = useQueryClient();
    await queryClient.prefetchQuery({
      queryKey: options.queryKey,
      queryFn: options.queryFn,
    });
  }, [options.queryKey, options.queryFn]);

  const memoizedValue = useMemo(() => ({
    ...query,
    isRefetching,
    lastFetchTime,
    refetch,
    invalidate,
    prefetch,
  }), [query, isRefetching, lastFetchTime, refetch, invalidate, prefetch]);

  return memoizedValue;
}

// 고급 뮤테이션 훅
export function useAdvancedMutation<TData = MutationData, TError = Error, TVariables = MutationVariables>(
  options: AdvancedMutationOptions<TData, TError, TVariables>
) {
  const queryClient = useQueryClient();
  const [isOptimistic, setIsOptimistic] = useState(false);

  const mutation = useMutation({
    ...options,
    onMutate: async (variables) => {
      setIsOptimistic(true);
      return options.onMutate?.(variables);
    },
    onSuccess: (data, variables, context) => {
      setIsOptimistic(false);
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      setIsOptimistic(false);
      options.onError?.(error, variables, context);
    },
    onSettled: (data, error, variables, context) => {
      setIsOptimistic(false);
      options.onSettled?.(data, error, variables, context);
    },
  });

  const optimisticUpdate = useCallback(async <TQueryData>(
    queryKey: QueryKey,
    updater: (oldData: TQueryData | undefined) => TQueryData,
    rollback: () => void
  ) => {
    await queryClient.cancelQueries({ queryKey });
    
    const previousData = queryClient.getQueryData<TQueryData>(queryKey);
    
    queryClient.setQueryData(queryKey, updater);
    
    return { previousData, rollback };
  }, [queryClient]);

  const memoizedValue = useMemo(() => ({
    ...mutation,
    isOptimistic,
    optimisticUpdate,
  }), [mutation, isOptimistic, optimisticUpdate]);

  return memoizedValue;
}

// 쿼리 키 팩토리 패턴
export const queryKeys = {
  all: ['queries'] as const,
  lists: () => [...queryKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...queryKeys.lists(), { filters }] as const,
  details: () => [...queryKeys.all, 'detail'] as const,
  detail: (id: string) => [...queryKeys.details(), id] as const,
  user: {
    all: ['user'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
    activities: () => [...queryKeys.user.all, 'activities'] as const,
    progress: () => [...queryKeys.user.all, 'progress'] as const,
  },
  teachingMethods: {
    all: ['teachingMethods'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.teachingMethods.all, 'list', filters].filter(Boolean) as const,
    detail: (id: string) => [...queryKeys.teachingMethods.all, 'detail', id] as const,
    categories: () => [...queryKeys.teachingMethods.all, 'categories'] as const,
  },
  quizzes: {
    all: ['quizzes'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.quizzes.all, 'list', filters].filter(Boolean) as const,
    detail: (id: string) => [...queryKeys.quizzes.all, 'detail', id] as const,
    results: (userId: string) => [...queryKeys.quizzes.all, 'results', userId] as const,
  },
} as const;

// 타입 안전한 API 클라이언트
export class TypedApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string, defaultHeaders: Record<string, string> = {}) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = defaultHeaders;
  }

  async request<TResponse = unknown, TRequest = unknown>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
      body?: TRequest;
      headers?: Record<string, string>;
      params?: Record<string, string>;
    } = {}
  ): Promise<TResponse> {
    const { method = 'GET', body, headers = {}, params } = options;
    
    const url = new URL(endpoint, this.baseUrl);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...this.defaultHeaders,
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // 타입 안전한 메서드들
  get<TResponse = unknown>(endpoint: string, params?: Record<string, string>) {
    return this.request<TResponse>(endpoint, { method: 'GET', params });
  }

  post<TResponse = unknown, TRequest = unknown>(endpoint: string, body: TRequest) {
    return this.request<TResponse, TRequest>(endpoint, { method: 'POST', body });
  }

  put<TResponse = unknown, TRequest = unknown>(endpoint: string, body: TRequest) {
    return this.request<TResponse, TRequest>(endpoint, { method: 'PUT', body });
  }

  delete<TResponse = unknown>(endpoint: string) {
    return this.request<TResponse>(endpoint, { method: 'DELETE' });
  }

  patch<TResponse = unknown, TRequest = unknown>(endpoint: string, body: TRequest) {
    return this.request<TResponse, TRequest>(endpoint, { method: 'PATCH', body });
  }
}

// 전역 API 클라이언트 인스턴스
export const apiClient = new TypedApiClient(
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  {
    'Authorization': typeof window !== 'undefined' ? `Bearer ${localStorage.getItem('token')}` : '',
  }
);
