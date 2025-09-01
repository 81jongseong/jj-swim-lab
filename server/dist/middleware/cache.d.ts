import { Request, Response, NextFunction } from 'express';
interface CacheOptions {
    ttl?: number;
    keyGenerator?: (req: Request) => string;
    skipCache?: (req: Request) => boolean;
}
export declare const cache: (options?: CacheOptions) => (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export declare const cacheMiddleware: {
    userList: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
    instructorList: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
    centerInfo: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
    aiAnalysis: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
    video3DAnalysis: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
    dashboard: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
    statistics: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
};
export declare const invalidateCache: {
    user: (userId: string) => Promise<void>;
    instructor: (instructorId: string) => Promise<void>;
    center: (centerId: string) => Promise<void>;
    aiAnalysis: (studentId: string) => Promise<void>;
    video3DAnalysis: (analysisId: string) => Promise<void>;
    all: () => Promise<void>;
};
export {};
//# sourceMappingURL=cache.d.ts.map