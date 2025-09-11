/**
 * 🔄 JJ Swim Lab - React Query 설정
 * 
 * 📋 **목적**
 * - 데이터 페칭, 캐싱, 동기화를 위한 React Query 설정
 * - API 호출 최적화 및 사용자 경험 개선
 * - 자동 재검증 및 백그라운드 업데이트
 * 
 * 🔄 **주요 기능**
 * - 쿼리 캐싱 및 무효화
 * - 자동 재시도 및 에러 처리
 * - 백그라운드 데이터 동기화
 * - 낙관적 업데이트
 */

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 데이터가 오래된 것으로 간주되는 시간 (5분)
            staleTime: 5 * 60 * 1000,
            // 캐시에서 데이터를 유지하는 시간 (10분)
            gcTime: 10 * 60 * 1000,
            // 자동 재시도 횟수
            retry: 3,
            // 재시도 간격 (지수 백오프)
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            // 윈도우 포커스 시 자동 재검증
            refetchOnWindowFocus: true,
            // 네트워크 재연결 시 자동 재검증
            refetchOnReconnect: true,
            // 에러 발생 시 재시도
            refetchOnMount: true,
          },
          mutations: {
            // 뮤테이션 재시도 횟수
            retry: 1,
            // 뮤테이션 재시도 간격
            retryDelay: 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* 개발 환경에서만 DevTools 표시 */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}

