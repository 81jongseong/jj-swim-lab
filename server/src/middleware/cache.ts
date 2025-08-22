import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';

// Redis 클라이언트 설정
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
  keyPrefix: 'jjswim:'
});

// 캐시 설정
interface CacheOptions {
  ttl?: number; // 초 단위
  key?: string;
  condition?: (req: Request, res: Response) => boolean;
  compress?: boolean;
  varyBy?: string[]; // 캐시 키에 포함할 헤더들
}

// 고급 캐시 키 생성
const generateCacheKey = (req: Request, options: CacheOptions): string => {
  const baseKey = options.key || `${req.method}:${req.originalUrl}`;
  
  // 사용자별 캐시 (인증된 사용자의 경우)
  const userKey = (req as any).user?._id ? `:user:${(req as any).user._id}` : '';
  
  // 헤더 기반 캐시 변형
  const headerKeys = options.varyBy?.map(header => 
    req.headers[header.toLowerCase()] ? `:${header}:${req.headers[header.toLowerCase()]}` : ''
  ).join('') || '';
  
  // 쿼리 파라미터 기반 캐시 변형
  const queryKeys = Object.keys(req.query).length > 0 ? 
    `:query:${JSON.stringify(req.query)}` : '';
  
  return `${baseKey}${userKey}${headerKeys}${queryKeys}`;
};

// 캐시 응답 압축
const compressResponse = (data: any): Buffer => {
  try {
    const jsonString = JSON.stringify(data);
    // 간단한 압축 (실제로는 zlib 사용 권장)
    return Buffer.from(jsonString);
  } catch (error) {
    console.warn('응답 압축 실패:', error);
    return Buffer.from(JSON.stringify(data));
  }
};

// 캐시 응답 압축 해제
const decompressResponse = (compressedData: Buffer): any => {
  try {
    const jsonString = compressedData.toString();
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('응답 압축 해제 실패:', error);
    return null;
  }
};

// 메모리 사용량 모니터링
const getMemoryUsage = () => {
  const usage = process.memoryUsage();
  return {
    rss: Math.round(usage.rss / 1024 / 1024), // MB
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
    external: Math.round(usage.external / 1024 / 1024) // MB
  };
};

// 캐시 성능 통계
let cacheStats = {
  hits: 0,
  misses: 0,
  sets: 0,
  errors: 0,
  totalRequests: 0
};

// 캐시 미들웨어
export const cache = (options: CacheOptions = {}) => {
  const {
    ttl = 300, // 기본 5분
    condition = () => true,
    compress = false,
    varyBy = []
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    // 캐시 조건 확인
    if (!condition(req, res)) {
      return next();
    }

    // 캐시 키 생성
    const cacheKey = generateCacheKey(req, options);
    
    try {
      // 캐시에서 데이터 조회
      const cachedData = await redis.get(cacheKey);
      
      if (cachedData) {
        // 캐시 히트
        cacheStats.hits++;
        
        const data = compress ? decompressResponse(Buffer.from(cachedData)) : JSON.parse(cachedData);
        
        // 응답 헤더 설정
        res.set({
          'X-Cache': 'HIT',
          'X-Cache-Key': cacheKey,
          'Cache-Control': `public, max-age=${ttl}`,
          'X-Cache-TTL': ttl.toString()
        });
        
        return res.json(data);
      }
      
      // 캐시 미스
      cacheStats.misses++;
      
      // 원본 응답을 가로채서 캐시에 저장
      const originalSend = res.json;
      res.json = function(data: any) {
        // 응답 데이터를 캐시에 저장
        const dataToCache = compress ? compressResponse(data) : JSON.stringify(data);
        
        redis.setex(cacheKey, ttl, dataToCache)
          .then(() => {
            cacheStats.sets++;
            console.log(`캐시 저장 완료: ${cacheKey} (TTL: ${ttl}s)`);
          })
          .catch((error) => {
            cacheStats.errors++;
            console.error('캐시 저장 실패:', error);
          });
        
        // 응답 헤더 설정
        res.set({
          'X-Cache': 'MISS',
          'X-Cache-Key': cacheKey,
          'Cache-Control': `public, max-age=${ttl}`,
          'X-Cache-TTL': ttl.toString()
        });
        
        // 원본 응답 메서드 호출
        return originalSend.call(this, data);
      };
      
      next();
      
    } catch (error) {
      cacheStats.errors++;
      console.error('캐시 처리 오류:', error);
      next();
    }
  };
};

// 조건부 캐시 (GET 요청만)
export const conditionalCache = (options: CacheOptions = {}) => {
  return cache({
    ...options,
    condition: (req: Request) => req.method === 'GET'
  });
};

// 사용자별 캐시
export const userCache = (options: CacheOptions = {}) => {
  return cache({
    ...options,
    condition: (req: Request) => !!(req as any).user?._id
  });
};

// 쿼리 기반 캐시
export const queryCache = (options: CacheOptions = {}) => {
  return cache({
    ...options,
    condition: (req: Request) => Object.keys(req.query).length > 0
  });
};

// 캐시 무효화
export const invalidateCache = async (pattern: string): Promise<void> => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`캐시 무효화 완료: ${keys.length}개 키`);
    }
  } catch (error) {
    console.error('캐시 무효화 실패:', error);
  }
};

// 특정 사용자 캐시 무효화
export const invalidateUserCache = async (userId: string): Promise<void> => {
  await invalidateCache(`*:user:${userId}*`);
};

// 특정 경로 캐시 무효화
export const invalidatePathCache = async (path: string): Promise<void> => {
  await invalidateCache(`*${path}*`);
};

// 캐시 통계 조회
export const getCacheStats = () => {
  const hitRate = cacheStats.totalRequests > 0 ? 
    (cacheStats.hits / cacheStats.totalRequests * 100).toFixed(2) : '0.00';
  
  return {
    ...cacheStats,
    hitRate: `${hitRate}%`,
    memoryUsage: getMemoryUsage()
  };
};

// 캐시 정리 (TTL 만료된 키들)
export const cleanupCache = async (): Promise<void> => {
  try {
    // Redis는 자동으로 TTL 만료된 키를 정리하므로 별도 작업 불필요
    console.log('캐시 정리 완료 (Redis 자동 정리)');
  } catch (error) {
    console.error('캐시 정리 실패:', error);
  }
};

// 캐시 상태 확인
export const checkCacheHealth = async (): Promise<boolean> => {
  try {
    await redis.ping();
    return true;
  } catch (error) {
    console.error('Redis 연결 실패:', error);
    return false;
  }
};

// 주기적 캐시 정리 (1시간마다)
setInterval(cleanupCache, 60 * 60 * 1000);

// 요청 통계 업데이트
export const updateRequestStats = () => {
  cacheStats.totalRequests++;
};

export default cache;











