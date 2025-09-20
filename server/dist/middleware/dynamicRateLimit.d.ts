import { Request, Response, NextFunction } from 'express';
interface AuthenticatedRequest extends Request {
    user?: {
        _id: string;
        userType: 'student' | 'instructor' | 'centerAdmin' | 'superAdmin';
    };
}
export declare const dynamicRateLimitMiddleware: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const refreshRateLimitCache: () => void;
export declare const clearRequestCounts: () => void;
export {};
//# sourceMappingURL=dynamicRateLimit.d.ts.map