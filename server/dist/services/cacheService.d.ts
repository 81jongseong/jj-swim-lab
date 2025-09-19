/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose/types/inferschematype" />
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