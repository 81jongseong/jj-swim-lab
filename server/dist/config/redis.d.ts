declare const redis: {
    ping: () => Promise<string>;
    setex: (key: string, ttl: number, value: string) => Promise<string>;
    get: (key: string) => Promise<any>;
    del: (key: string) => Promise<number>;
    keys: (pattern: string) => Promise<any[]>;
    exists: (key: string) => Promise<number>;
    on: () => void;
    off: () => void;
    disconnect: () => Promise<void>;
};
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