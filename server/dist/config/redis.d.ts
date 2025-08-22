import Redis from 'ioredis';
declare class RedisClient {
    private client;
    private subscriber;
    connect(): Promise<boolean>;
    get(key: string): Promise<string | null>;
    set(key: string, value: string, ttl?: number): Promise<boolean>;
    del(key: string): Promise<boolean>;
    exists(key: string): Promise<boolean>;
    flushdb(): Promise<boolean>;
    disconnect(): Promise<void>;
    getClient(): Redis | null;
}
export declare const redisClient: RedisClient;
export default redisClient;
//# sourceMappingURL=redis.d.ts.map