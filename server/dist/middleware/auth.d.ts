import { Request, Response, NextFunction } from 'express';
export interface AuthenticatedUser {
    id: string;
    email: string;
    name: string;
    userType: 'admin' | 'instructor' | 'student' | 'center_admin' | 'superAdmin' | 'centerAdmin';
    centerId?: string;
    permissions: string[];
    accessPermissions?: any;
    type?: string;
    iat: number;
    exp: number;
}
export declare const generateTokens: (user: any) => {
    accessToken: string;
    refreshToken: string;
};
export declare const verifyToken: (token: string, secret: string) => Promise<AuthenticatedUser>;
export declare const authMiddleware: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
export declare const auth: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
export declare const requireAdmin: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export declare const requireInstructor: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export declare const requireStudent: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export declare const requireCenterAdmin: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export declare const requirePermission: (permission: string) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export declare const requireRole: (roles: string[]) => (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const requireCenterOwnership: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const refreshTokenMiddleware: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const hashPassword: (password: string) => Promise<string>;
export declare const verifyPassword: (password: string, hashedPassword: string) => Promise<boolean>;
export declare const validatePasswordStrength: (password: string) => {
    isValid: boolean;
    errors: string[];
};
export declare const sessionManager: {
    createSession: (userId: string, userAgent: string, ip: string) => Promise<{
        userId: string;
        userAgent: string;
        ip: string;
        createdAt: Date;
        lastAccessedAt: Date;
        isActive: boolean;
    }>;
    validateSession: (sessionId: string) => Promise<boolean>;
    refreshSession: (sessionId: string) => Promise<boolean>;
    deleteSession: (sessionId: string) => Promise<boolean>;
    cleanupUserSessions: (userId: string) => Promise<boolean>;
};
export declare const securityLogger: {
    logAuthAttempt: (email: string, success: boolean, ip: string, userAgent: string) => void;
    logPermissionDenied: (userId: string, permission: string, ip: string, userAgent: string) => void;
    logTokenRefresh: (userId: string, success: boolean, ip: string) => void;
};
declare const _default: {
    authMiddleware: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
    requireAdmin: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
    requireInstructor: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
    requireStudent: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
    requireCenterAdmin: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
    requirePermission: (permission: string) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
    requireCenterOwnership: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
    refreshTokenMiddleware: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    generateTokens: (user: any) => {
        accessToken: string;
        refreshToken: string;
    };
    verifyToken: (token: string, secret: string) => Promise<AuthenticatedUser>;
    hashPassword: (password: string) => Promise<string>;
    verifyPassword: (password: string, hashedPassword: string) => Promise<boolean>;
    validatePasswordStrength: (password: string) => {
        isValid: boolean;
        errors: string[];
    };
    sessionManager: {
        createSession: (userId: string, userAgent: string, ip: string) => Promise<{
            userId: string;
            userAgent: string;
            ip: string;
            createdAt: Date;
            lastAccessedAt: Date;
            isActive: boolean;
        }>;
        validateSession: (sessionId: string) => Promise<boolean>;
        refreshSession: (sessionId: string) => Promise<boolean>;
        deleteSession: (sessionId: string) => Promise<boolean>;
        cleanupUserSessions: (userId: string) => Promise<boolean>;
    };
    securityLogger: {
        logAuthAttempt: (email: string, success: boolean, ip: string, userAgent: string) => void;
        logPermissionDenied: (userId: string, permission: string, ip: string, userAgent: string) => void;
        logTokenRefresh: (userId: string, success: boolean, ip: string) => void;
    };
};
export default _default;
//# sourceMappingURL=auth.d.ts.map