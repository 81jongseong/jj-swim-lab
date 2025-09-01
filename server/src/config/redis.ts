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
});

// Redis 연결 이벤트 처리
redis.on('connect', () => {
  console.log('✅ Redis 연결 성공');
});

redis.on('error', (error) => {
  console.error('❌ Redis 연결 오류:', error);
});

redis.on('close', () => {
  console.log('🔌 Redis 연결 종료');
});

// Redis 연결 테스트
export const testRedisConnection = async (): Promise<boolean> => {
  try {
    await redis.ping();
    console.log('✅ Redis 연결 테스트 성공');
    return true;
  } catch (error) {
    console.error('❌ Redis 연결 테스트 실패:', error);
    return false;
  }
};

// Redis 클라이언트 내보내기
export default redis;

// Redis 유틸리티 함수들
export const redisUtils = {
  // 캐시 설정
  async setCache(key: string, value: any, ttl: number = 3600): Promise<void> {
    try {
      await redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Redis 캐시 설정 오류:', error);
    }
  },

  // 캐시 조회
  async getCache(key: string): Promise<any> {
    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis 캐시 조회 오류:', error);
      return null;
    }
  },

  // 캐시 삭제
  async deleteCache(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      console.error('Redis 캐시 삭제 오류:', error);
    }
  },

  // 패턴으로 캐시 삭제
  async deleteCachePattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error('Redis 패턴 캐시 삭제 오류:', error);
    }
  },

  // 캐시 존재 확인
  async existsCache(key: string): Promise<boolean> {
    try {
      const exists = await redis.exists(key);
      return exists === 1;
    } catch (error) {
      console.error('Redis 캐시 존재 확인 오류:', error);
      return false;
    }
  }
};
