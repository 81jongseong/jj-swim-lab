/**
 * ⚡ JJ Swim Lab - 성능 측정 유틸리티
 * 
 * 📋 **유틸리티 목적**
 * - 애플리케이션 성능 측정 및 모니터링을 위한 유틸리티
 * - 함수 실행 시간 측정 및 성능 분석
 * - 데이터베이스 쿼리 성능 측정 및 최적화
 * - 메모리 사용량 모니터링 및 관리
 * - 성능 병목 지점 식별 및 해결
 * 
 * 🔄 **주요 기능**
 * - 함수 실행 시간 측정 데코레이터
 * - 데이터베이스 쿼리 성능 측정
 * - 메모리 사용량 모니터링
 * - 성능 병목 지점 식별
 * - 성능 로깅 및 분석
 * - 성능 최적화 권장사항 제공
 * 
 * 🗄️ **데이터 연동**
 * - 함수 실행 시간 데이터
 * - 데이터베이스 쿼리 성능 데이터
 * - 메모리 사용량 데이터
 * - 성능 로그 및 분석 데이터
 * - 성능 메트릭 및 통계
 * 
 * 🛠️ **필요한 설치 파일**
 * - 로거 유틸리티 (./logger)
 * - Node.js 성능 모니터링 API
 * - 성능 측정 도구
 * - 성능 분석 라이브러리
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 성능 측정 오버헤드 최소화
 * 2. 성능 데이터 수집 및 저장 최적화
 * 3. 성능 로그 보안 및 접근 권한
 * 4. 성능 병목 지점 식별 및 해결
 * 5. 성능 최적화 권장사항 적용
 * 6. 성능 모니터링 시스템 안정성
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 성능 측정 오버헤드 최소화 확인
 * - [ ] 성능 데이터 수집 최적화 확인
 * - [ ] 성능 로그 보안 확인
 * - [ ] 성능 병목 지점 식별 확인
 * - [ ] 성능 최적화 권장사항 적용 확인
 * - [ ] 성능 모니터링 시스템 안정성 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 성능 측정 유틸리티 구현
 * - 2024-12-19: 함수 실행 시간 측정 데코레이터 구현
 * - 2024-12-19: 데이터베이스 쿼리 성능 측정 구현
 * - 2024-12-19: 메모리 사용량 모니터링 구현
 * - 2024-12-19: 성능 분석 및 최적화 시스템 구현
 * - 2024-12-19: TypeScript 타입 정의 강화 (any 타입을 구체적인 타입으로 교체)
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (성능 측정 유틸리티 완료)
 * 
 * 🚀 **다음 단계**
 * - 실시간 성능 모니터링
 * - 성능 기반 자동 스케일링
 * - 성능 예측 및 분석
 * - 성능 최적화 자동화
 * - 성능 보안 강화
 * 
 * 💡 **사용 예시**
 * ```typescript
 * import { measurePerformance, measureDatabaseQuery } from '../utils/performance';
 * 
 * // 함수 성능 측정
 * @measurePerformance('User Management')
 * async function createUser(userData: any) {
 *   // 사용자 생성 로직
 * }
 * 
 * // 데이터베이스 쿼리 성능 측정
 * @measureDatabaseQuery('users')
 * async function findUsers(filter: any) {
 *   // 사용자 조회 로직
 * }
 * ```
 * 
 * 🔍 **성능 측정 처리 흐름**
 * 1. 성능 측정 대상 함수 식별
 * 2. 성능 측정 데코레이터 적용
 * 3. 함수 실행 시간 측정 시작
 * 4. 함수 실행 및 결과 수집
 * 5. 성능 데이터 분석 및 로깅
 * 6. 성능 병목 지점 식별
 * 7. 성능 최적화 권장사항 제공
 */

import { logPerformance, logDatabase } from './logger';
import { Request, Response, NextFunction } from 'express';

// 성능 측정 데코레이터
export const measurePerformance = (operation: string) => {
  return function (target: object, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: unknown[]) {
      const start = Date.now();
      try {
        const result = await method.apply(this, args);
        const duration = Date.now() - start;
        logPerformance(`${operation} - ${propertyName}`, { method: propertyName, duration });
        return result;
      } catch (error) {
        const duration = Date.now() - start;
        logPerformance(`${operation} - ${propertyName} (ERROR)`, { 
          method: propertyName, 
          error: (error as any).message,
          duration
        });
        throw error;
      }
    };
  };
};

// 데이터베이스 쿼리 성능 측정
export const measureDatabaseQuery = (collection: string) => {
  return function (target: object, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: unknown[]) {
      const start = Date.now();
      try {
        const result = await method.apply(this, args);
        const duration = Date.now() - start;
                logDatabase(`Database Query: ${collection}.${propertyName}`, {
          method: propertyName,
          resultCount: Array.isArray(result) ? result.length : 1,
          duration
        });
        return result;
      } catch (error) {
        const duration = Date.now() - start;
        logDatabase(`Database Error: ${collection}.${propertyName}`, { 
          method: propertyName, 
          error: (error as any).message,
          duration
        });
        throw error;
      }
    };
  };
};

// 메모리 사용량 모니터링
export const getMemoryUsage = () => {
  const usage = process.memoryUsage();
  return {
    rss: Math.round(usage.rss / 1024 / 1024), // MB
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
    external: Math.round(usage.external / 1024 / 1024), // MB
    arrayBuffers: Math.round(usage.arrayBuffers / 1024 / 1024) // MB
  };
};

// CPU 사용량 모니터링
export const getCpuUsage = () => {
  const startUsage = process.cpuUsage();
  return {
    user: startUsage.user,
    system: startUsage.system
  };
};

// 응답 시간 측정 미들웨어
export const responseTimeMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logPerformance(`API Response: ${req.method} ${req.originalUrl}`, {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration
    });
  });
  
  next();
};

// 배치 처리 최적화
export const batchProcess = async <T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize: number = 100
): Promise<R[]> => {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(item => processor(item))
    );
    results.push(...batchResults);
    
    // 배치 간 짧은 지연 (메모리 정리)
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }
  
  return results;
};

// 캐시 성능 최적화
export const memoize = <T extends (...args: unknown[]) => unknown>(
  fn: T,
  ttl: number = 300000 // 5분
): T => {
  const cache = new Map<string, { value: unknown; timestamp: number }>();
  
  return ((...args: unknown[]) => {
    const key = JSON.stringify(args);
    const now = Date.now();
    const cached = cache.get(key);
    
    if (cached && now - cached.timestamp < ttl) {
      return cached.value;
    }
    
    const result = fn(...args);
    cache.set(key, { value: result, timestamp: now });
    
    return result;
  }) as T;
};

// 데이터베이스 인덱스 최적화 제안
interface QueryInfo {
  collection: string;
  query: Record<string, unknown>;
  frequency: number;
}

interface IndexSuggestion {
  collection: string;
  fields: string[];
  frequency: number;
  priority: 'high' | 'medium' | 'low';
  reason: string;
}

export const suggestIndexes = (queries: QueryInfo[]) => {
  const suggestions: IndexSuggestion[] = [];
  
  queries.forEach(({ collection, query, frequency }) => {
    const fields = Object.keys(query);
    if (fields.length > 0 && frequency > 10) {
      suggestions.push({
        collection,
        fields,
        frequency,
        priority: frequency > 100 ? 'high' : frequency > 50 ? 'medium' : 'low',
        reason: `Frequently used query on fields: ${fields.join(', ')}`
      });
    }
  });
  
  return suggestions.sort((a, b) => b.frequency - a.frequency);
};

// 연결 풀 최적화
export const optimizeConnectionPool = (poolSize: number = 10) => {
  return {
    maxPoolSize: poolSize,
    minPoolSize: Math.floor(poolSize / 2),
    maxIdleTimeMS: 30000,
    waitQueueTimeoutMS: 10000,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    heartbeatFrequencyMS: 10000
  };
};

// 쿼리 최적화
export const optimizeQuery = (query: Record<string, unknown>) => {
  const optimized = { ...query };
  
  // 불필요한 필드 제거
  if (optimized.select && Object.keys(optimized.select).length === 0) {
    delete optimized.select;
  }
  
  // 정렬 최적화
  if (optimized.sort && Object.keys(optimized.sort).length === 0) {
    delete optimized.sort;
  }
  
  // 페이지네이션 최적화
  if (optimized.limit && typeof optimized.limit === 'number' && optimized.limit > 1000) {
    optimized.limit = 1000;
  }
  
  return optimized;
};

