import { Request, Response, NextFunction } from 'express';
interface AuthenticatedRequest extends Request {
    user?: {
        _id: string;
        userType: 'student' | 'instructor' | 'centerAdmin' | 'superAdmin';
    };
}
export declare const pageTrackingMiddleware: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const cleanupOldPageVisits: () => Promise<void>;
export {};
//# sourceMappingURL=pageTracking.d.ts.map