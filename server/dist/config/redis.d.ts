import Redis from 'ioredis';
declare const redis: Redis;
export declare const testRedisConnection: () => Promise<boolean>;
export default redis;
export declare const redisUtils: {
    setCache(key: string, value: any, ttl?: number): Promise<void>;
    getCache(key: string): Promise<any>;
    deleteCache(key: string): Promise<void>;
    deleteCachePattern(pattern: string): Promise<void>;
    existsCache(key: string): Promise<boolean>;
};
//# sourceMappingURL=redis.d.ts.map