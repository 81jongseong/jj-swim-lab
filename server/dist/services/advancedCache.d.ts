import { CacheOptions } from '../utils/advancedTypes';
export declare class AdvancedCacheService {
    private cache;
    private tags;
    private version;
    set<T>(key: string, data: T, options?: CacheOptions): void;
    get<T>(key: string): T | null;
    has(key: string): boolean;
    delete(key: string): boolean;
    deleteByTag(tag: string): number;
    clear(): void;
    getStats(): {
        size: number;
        memoryUsage: number;
        tagCount: number;
        hitRate: number;
    };
    findKeys(pattern: string): string[];
    cleanup(): number;
    backup(): string;
    restore(backupData: string): boolean;
}
export declare const cacheService: AdvancedCacheService;
export declare function Cacheable(options?: CacheOptions): (target: any, propertyName: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare function CacheInvalidate(tags: string[]): (target: any, propertyName: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare function cacheMiddleware(options?: CacheOptions): (req: any, res: any, next: any) => any;
export declare class CacheTagManager {
    private static instance;
    private tagHierarchy;
    static getInstance(): CacheTagManager;
    setHierarchy(parentTag: string, childTags: string[]): void;
    invalidateTag(tag: string): number;
    invalidateAll(): number;
}
export declare class CacheMonitor {
    private static instance;
    private metrics;
    static getInstance(): CacheMonitor;
    recordHit(): void;
    recordMiss(): void;
    recordSet(): void;
    recordDelete(): void;
    recordCleanup(): void;
    getMetrics(): typeof this.metrics & {
        hitRate: number;
    };
    resetMetrics(): void;
}
export declare class CacheScheduler {
    private static instance;
    private intervalId;
    static getInstance(): CacheScheduler;
    start(intervalMs?: number): void;
    stop(): void;
}
declare const _default: {
    AdvancedCacheService: typeof AdvancedCacheService;
    cacheService: AdvancedCacheService;
    Cacheable: typeof Cacheable;
    CacheInvalidate: typeof CacheInvalidate;
    cacheMiddleware: typeof cacheMiddleware;
    CacheTagManager: typeof CacheTagManager;
    CacheMonitor: typeof CacheMonitor;
    CacheScheduler: typeof CacheScheduler;
};
export default _default;
//# sourceMappingURL=advancedCache.d.ts.map