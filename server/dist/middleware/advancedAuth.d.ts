import { Request, Response, NextFunction } from 'express';
import { UserRole, Permission, SecurityContext } from '../utils/advancedTypes';
interface AuthenticatedRequest extends Omit<Request, 'user'> {
    user?: SecurityContext;
    token?: string;
    sessionID?: string;
}
interface JWTPayload {
    userId: string;
    role: UserRole;
    permissions: Permission[];
    centerId?: string;
    iat: number;
    exp: number;
}
interface AuthOptions {
    required?: boolean;
    roles?: UserRole[];
    permissions?: Permission[];
    centerId?: string;
    allowGuest?: boolean;
}
export declare function verifyToken(token: string): JWTPayload | null;
export declare function extractUserFromToken(token: string): SecurityContext | null;
export declare function hasPermission(userPermissions: Permission[], requiredPermissions: Permission[]): boolean;
export declare function hasRole(userRole: UserRole, requiredRoles: UserRole[]): boolean;
export declare function hasCenterAccess(userCenterId: string | undefined, requiredCenterId: string): boolean;
export declare function authenticate(options?: AuthOptions): (req: AuthenticatedRequest, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const requireSuperAdmin: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const requireCenterAdmin: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const requireInstructor: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const requireStudent: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const requireGuest: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const requireReadPermission: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const requireWritePermission: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const requireDeletePermission: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const requireAdminPermission: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare function requireCenterAccess(centerId: string): (req: AuthenticatedRequest, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare function checkPermission(permission: Permission): (req: AuthenticatedRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export declare function checkRole(role: UserRole): (req: AuthenticatedRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export declare function refreshToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void;
export declare function validateSession(req: AuthenticatedRequest, res: Response, next: NextFunction): void | Response<any, Record<string, any>>;
export declare function securityHeaders(req: Request, res: Response, next: NextFunction): void;
export declare function requestLogging(req: AuthenticatedRequest, res: Response, next: NextFunction): void;
declare const _default: {
    authenticate: typeof authenticate;
    requireSuperAdmin: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
    requireCenterAdmin: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
    requireInstructor: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
    requireStudent: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
    requireGuest: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
    requireReadPermission: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
    requireWritePermission: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
    requireDeletePermission: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
    requireAdminPermission: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
    requireCenterAccess: typeof requireCenterAccess;
    checkPermission: typeof checkPermission;
    checkRole: typeof checkRole;
    refreshToken: typeof refreshToken;
    validateSession: typeof validateSession;
    securityHeaders: typeof securityHeaders;
    requestLogging: typeof requestLogging;
};
export default _default;
//# sourceMappingURL=advancedAuth.d.ts.map