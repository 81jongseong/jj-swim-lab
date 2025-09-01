import { Request, Response, NextFunction } from 'express';
import { redisUtils } from '../config/redis';

// 캐시 미들웨어 인터페이스
interface CacheOptions {
  ttl?: number; // Time to live in seconds
  keyGenerator?: (req: Request) => string;
  skipCache?: (req: Request) => boolean;
}

// 기본 키 생성기
const defaultKeyGenerator = (req: Request): string => {
  const { method, originalUrl, query, body } = req;
  const key = `${method}:${originalUrl}:${JSON.stringify(query)}:${JSON.stringify(body)}`;
  return Buffer.from(key).toString('base64');
};

// 캐시 미들웨어 생성
export const cache = (options: CacheOptions = {}) => {
  const {
    ttl = 3600, // 기본 1시간
    keyGenerator = defaultKeyGenerator,
    skipCache = () => false
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 캐시 스킵 조건 확인
      if (skipCache(req)) {
        return next();
      }

      // 캐시 키 생성
      const cacheKey = `cache:${keyGenerator(req)}`;

      // 캐시에서 데이터 조회
      const cachedData = await redisUtils.getCache(cacheKey);

      if (cachedData) {
        console.log(`✅ 캐시 히트: ${cacheKey}`);
        return res.json(cachedData);
      }

      // 캐시 미스 - 원본 응답을 캐시하도록 응답 객체 수정
      const originalJson = res.json;
      res.json = function(data: any) {
        // 성공적인 응답만 캐시
        if (res.statusCode >= 200 && res.statusCode < 300) {
          redisUtils.setCache(cacheKey, data, ttl).catch(error => {
            console.error('캐시 설정 오류:', error);
          });
        }
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('캐시 미들웨어 오류:', error);
      next(); // 오류가 발생해도 요청은 계속 진행
    }
  };
};

// 특정 경로용 캐시 미들웨어들
export const cacheMiddleware = {
  // 사용자 목록 캐시 (5분)
  userList: cache({
    ttl: 300,
    keyGenerator: (req) => `users:${req.query.userType || 'all'}:${req.query.page || 1}`
  }),

  // 강사 목록 캐시 (10분)
  instructorList: cache({
    ttl: 600,
    keyGenerator: (req) => `instructors:${req.query.centerId || 'all'}:${req.query.page || 1}`
  }),

  // 센터 정보 캐시 (30분)
  centerInfo: cache({
    ttl: 1800,
    keyGenerator: (req) => `center:${req.params.id || req.query.centerId}`
  }),

  // AI 분석 결과 캐시 (1시간)
  aiAnalysis: cache({
    ttl: 3600,
    keyGenerator: (req) => `ai:${req.params.studentId}:${req.query.technique || 'all'}`
  }),

  // 3D 분석 결과 캐시 (2시간)
  video3DAnalysis: cache({
    ttl: 7200,
    keyGenerator: (req) => `3d:${req.params.analysisId || req.query.studentId}`
  }),

  // 대시보드 데이터 캐시 (5분)
  dashboard: cache({
    ttl: 300,
    keyGenerator: (req) => `dashboard:${req.params.centerId || req.user?._id}`
  }),

  // 통계 데이터 캐시 (15분)
  statistics: cache({
    ttl: 900,
    keyGenerator: (req) => `stats:${req.query.period || 'month'}:${req.query.centerId || 'all'}`
  })
};

// 캐시 무효화 헬퍼
export const invalidateCache = {
  // 사용자 관련 캐시 무효화
  user: async (userId: string) => {
    await redisUtils.deleteCachePattern(`*users*`);
    await redisUtils.deleteCachePattern(`*user:${userId}*`);
  },

  // 강사 관련 캐시 무효화
  instructor: async (instructorId: string) => {
    await redisUtils.deleteCachePattern(`*instructors*`);
    await redisUtils.deleteCachePattern(`*instructor:${instructorId}*`);
  },

  // 센터 관련 캐시 무효화
  center: async (centerId: string) => {
    await redisUtils.deleteCachePattern(`*center:${centerId}*`);
    await redisUtils.deleteCachePattern(`*dashboard:${centerId}*`);
  },

  // AI 분석 관련 캐시 무효화
  aiAnalysis: async (studentId: string) => {
    await redisUtils.deleteCachePattern(`*ai:${studentId}*`);
  },

  // 3D 분석 관련 캐시 무효화
  video3DAnalysis: async (analysisId: string) => {
    await redisUtils.deleteCachePattern(`*3d:${analysisId}*`);
  },

  // 모든 캐시 무효화
  all: async () => {
    await redisUtils.deleteCachePattern(`cache:*`);
  }
};
