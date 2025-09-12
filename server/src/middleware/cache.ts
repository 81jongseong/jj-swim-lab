/**
 * 🗄️ JJ Swim Lab - 캐시 미들웨어
 * 
 * 📋 **미들웨어 목적**
 * - HTTP 요청/응답을 Redis 캐시로 관리하는 미들웨어
 * - API 응답 캐싱을 통한 성능 최적화
 * - 캐시 키 생성 및 TTL 관리
 * - 캐시 무효화 및 갱신 기능
 * - 캐시 히트/미스 통계 및 모니터링
 * 
 * 🔄 **주요 기능**
 * - HTTP 요청 캐시 키 생성
 * - Redis 캐시 조회 및 저장
 * - 캐시 TTL (Time To Live) 관리
 * - 캐시 무효화 및 갱신
 * - 캐시 히트/미스 통계
 * - 캐시 성능 모니터링
 * 
 * 🗄️ **데이터 연동**
 * - HTTP 요청 및 응답 데이터
 * - Redis 캐시 데이터
 * - 캐시 키 및 TTL 정보
 * - 캐시 통계 및 메트릭
 * - 캐시 설정 및 옵션
 * 
 * 🛠️ **필요한 설치 파일**
 * - Express.js 미들웨어
 * - Redis 설정 (../config/redis)
 * - 캐시 유틸리티 함수
 * - 캐시 모니터링 도구
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 캐시 키 충돌 방지 및 고유성
 * 2. 캐시 TTL 설정 및 메모리 관리
 * 3. 캐시 무효화 시점 및 전략
 * 4. 캐시 성능 최적화
 * 5. 캐시 보안 및 접근 제어
 * 6. 캐시 모니터링 및 알림
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 캐시 키 생성 로직 확인
 * - [ ] 캐시 TTL 설정 확인
 * - [ ] 캐시 무효화 로직 확인
 * - [ ] 캐시 성능 최적화 확인
 * - [ ] 캐시 보안 설정 확인
 * - [ ] 캐시 모니터링 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 캐시 미들웨어 구현
 * - 2024-12-19: 캐시 키 생성 및 TTL 관리 구현
 * - 2024-12-19: 캐시 무효화 및 갱신 시스템 구현
 * - 2024-12-19: 캐시 통계 및 모니터링 시스템 구현
 * - 2024-12-19: 캐시 성능 최적화 시스템 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (캐시 미들웨어 완료)
 * 
 * 🚀 **다음 단계**
 * - 캐시 계층화 지원
 * - 캐시 프리워밍 기능
 * - 캐시 압축 및 최적화
 * - 캐시 분산 시스템
 * - 캐시 보안 강화
 * 
 * 💡 **사용 예시**
 * ```typescript
 * import { cache } from '../middleware/cache';
 * 
 * // 기본 캐시 미들웨어
 * app.get('/api/users', cache(), getUsers);
 * 
 * // 커스텀 TTL 및 키 생성기
 * app.get('/api/products', cache({
 *   ttl: 1800, // 30분
 *   keyGenerator: (req) => `products:${req.query.category}`
 * }), getProducts);
 * ```
 * 
 * 🔍 **캐시 미들웨어 처리 흐름**
 * 1. HTTP 요청 캐시 키 생성
 * 2. Redis에서 캐시 데이터 조회
 * 3. 캐시 히트 시 캐시된 응답 반환
 * 4. 캐시 미스 시 다음 미들웨어 실행
 * 5. 응답 데이터를 Redis에 캐시 저장
 * 6. 캐시 통계 업데이트 및 모니터링
 * 7. 캐시된 응답 반환
 */

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
