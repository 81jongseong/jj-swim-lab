import { Request, Response, NextFunction } from 'express';
interface AuthenticatedRequest extends Request {
    user?: {
        _id: string;
        userType: 'student' | 'instructor' | 'centerAdmin' | 'superAdmin';
    };
}
export declare const maintenanceModeMiddleware: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export declare const refreshMaintenanceCache: () => void;
export {};
//# sourceMappingURL=maintenanceMode.d.ts.map