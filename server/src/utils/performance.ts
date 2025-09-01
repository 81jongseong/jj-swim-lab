import { logPerformance, logDatabase } from './logger';

// 성능 측정 데코레이터
export const measurePerformance = (operation: string) => {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
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
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
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
export const responseTimeMiddleware = (req: any, res: any, next: any) => {
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
export const memoize = <T extends (...args: any[]) => any>(
  fn: T,
  ttl: number = 300000 // 5분
): T => {
  const cache = new Map<string, { value: any; timestamp: number }>();
  
  return ((...args: any[]) => {
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
export const suggestIndexes = (queries: Array<{ collection: string; query: any; frequency: number }>) => {
  const suggestions: any[] = [];
  
  queries.forEach(({ collection, query, frequency }) => {
    const fields = Object.keys(query);
    if (fields.length > 0 && frequency > 10) {
      suggestions.push({
        collection,
        fields,
        frequency,
        priority: frequency > 100 ? 'high' : frequency > 50 ? 'medium' : 'low'
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
export const optimizeQuery = (query: any) => {
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
  if (optimized.limit && optimized.limit > 1000) {
    optimized.limit = 1000;
  }
  
  return optimized;
};

