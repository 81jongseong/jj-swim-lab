import { Request, Response, NextFunction } from 'express';
interface CacheOptions {
    ttl?: number;
    key?: string;
    condition?: (req: Request, res: Response) => boolean;
    compress?: boolean;
    varyBy?: string[];
}
export declare const cache: (options?: CacheOptions) => (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export declare const conditionalCache: (options?: CacheOptions) => (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export declare const userCache: (options?: CacheOptions) => (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export declare const queryCache: (options?: CacheOptions) => (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export declare const invalidateCache: (pattern: string) => Promise<void>;
export declare const invalidateUserCache: (userId: string) => Promise<void>;
export declare const invalidatePathCache: (path: string) => Promise<void>;
export declare const getCacheStats: () => {
    hitRate: string;
    memoryUsage: {
        rss: number;
        heapTotal: number;
        heapUsed: number;
        external: number;
    };
    hits: number;
    misses: number;
    sets: number;
    errors: number;
    totalRequests: number;
};
export declare const cleanupCache: () => Promise<void>;
export declare const checkCacheHealth: () => Promise<boolean>;
export declare const updateRequestStats: () => void;
export default cache;
//# sourceMappingURL=cache.d.ts.map