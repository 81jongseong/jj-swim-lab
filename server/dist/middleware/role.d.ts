import { Request, Response, NextFunction } from 'express';
export interface AuthenticatedRequest extends Request {
    user?: {
        _id: string;
        userType: string;
        email: string;
        name: string;
        centerId?: string;
    };
}
export declare const roleMiddleware: (allowedRoles: string[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export declare const requireRole: (role: string) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export declare const requireSuperAdmin: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export declare const requireCenterAdmin: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export declare const requireInstructor: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export declare const requireStudent: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export declare const requireAdmin: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export declare const requireInstructorOrAdmin: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export declare const requireAuthenticated: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export declare const requireCenterAccess: (centerIdField?: string) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
//# sourceMappingURL=role.d.ts.map