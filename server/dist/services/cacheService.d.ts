import mongoose from 'mongoose';
export declare enum CacheType {
    MEMORY = "memory",
    REDIS = "redis",
    QUERY = "query"
}
declare class CacheService {
    private static instance;
    private memoryCache;
    private queryCache;
    private cacheStats;
    private constructor();
    static getInstance(): CacheService;
    private setupCacheEventListeners;
    private updateStats;
    set<T>(key: string, value: T, ttl?: number): boolean;
    get<T>(key: string): T | undefined;
    delete(key: string): boolean;
    has(key: string): boolean;
    clear(): void;
    cacheQuery<T>(key: string, queryFn: () => Promise<T>, ttl?: number): Promise<T>;
    private isCacheValid;
    wrapModel<T extends mongoose.Document>(model: mongoose.Model<T>, cacheKey: string, ttl?: number): mongoose.Model<T, {}, {}, {}, mongoose.IfAny<T, any, mongoose.Document<unknown, {}, T> & mongoose.Require_id<T>>, any>;
    invalidatePattern(pattern: string): number;
    getCacheStats(): any;
    generateCacheReport(): any;
    cleanup(): void;
    warmup(warmupFunctions: Array<() => Promise<{
        key: string;
        value: any;
        ttl?: number;
    }>>): Promise<void>;
}
export default CacheService;
//# sourceMappingURL=cacheService.d.ts.map