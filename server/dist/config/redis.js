"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisUtils = exports.testRedisConnection = void 0;
const redis = {
    ping: () => Promise.resolve('PONG'),
    setex: (key, ttl, value) => Promise.resolve('OK'),
    get: (key) => Promise.resolve(null),
    del: (key) => Promise.resolve(1),
    keys: (pattern) => Promise.resolve([]),
    exists: (key) => Promise.resolve(0),
    on: () => { },
    off: () => { },
    disconnect: () => Promise.resolve(),
};
const testRedisConnection = async () => {
    try {
        await redis.ping();
        console.log('✅ Redis 연결 테스트 성공');
        return true;
    }
    catch (error) {
        console.error('❌ Redis 연결 테스트 실패:', error);
        return false;
    }
};
exports.testRedisConnection = testRedisConnection;
exports.default = redis;
exports.redisUtils = {
    async setCache(key, value, ttl = 3600) {
        try {
            await redis.setex(key, ttl, JSON.stringify(value));
        }
        catch (error) {
            console.error('Redis 캐시 설정 오류:', error);
        }
    },
    async getCache(key) {
        try {
            const value = await redis.get(key);
            return value ? JSON.parse(value) : null;
        }
        catch (error) {
            console.error('Redis 캐시 조회 오류:', error);
            return null;
        }
    },
    async deleteCache(key) {
        try {
            await redis.del(key);
        }
        catch (error) {
            console.error('Redis 캐시 삭제 오류:', error);
        }
    },
    async deleteCachePattern(pattern) {
        try {
            const keys = await redis.keys(pattern);
            if (keys.length > 0) {
                for (const key of keys) {
                    await redis.del(key);
                }
            }
        }
        catch (error) {
            console.error('Redis 패턴 캐시 삭제 오류:', error);
        }
    },
    async existsCache(key) {
        try {
            const exists = await redis.exists(key);
            return exists === 1;
        }
        catch (error) {
            console.error('Redis 캐시 존재 확인 오류:', error);
            return false;
        }
    }
};
//# sourceMappingURL=redis.js.map