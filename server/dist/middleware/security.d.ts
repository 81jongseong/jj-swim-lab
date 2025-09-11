import { Request, Response, NextFunction } from 'express';
import { ValidationChain } from './validation';
export declare const securityHeaders: (req: Request, res: Response, next: NextFunction) => void;
export declare const corsMiddleware: (req: Request, res: Response, next: NextFunction) => void;
export declare const rateLimitMiddleware: (req: Request, res: Response, next: NextFunction) => void;
export declare const apiRateLimitMiddleware: (req: Request, res: Response, next: NextFunction) => void;
export declare const sanitizeInput: (req: Request, res: Response, next: NextFunction) => void;
export declare const sqlInjectionCheck: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export declare const xssProtection: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export declare const inputLengthLimit: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export declare const fileUploadSecurity: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export declare const createValidationMiddleware: (validations: ValidationChain[]) => (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
export declare const commonValidations: {
    email: (email: string) => {
        isValid: boolean;
        message?: string;
    };
    password: (password: string) => {
        isValid: boolean;
        message?: string;
    };
    name: (name: string) => {
        isValid: boolean;
        message?: string;
    };
    phone: (phone: string) => {
        isValid: boolean;
        message?: string;
    };
    id: (id: string) => {
        isValid: boolean;
        message?: string;
    };
    page: (page: any) => {
        isValid: boolean;
        message?: string;
    };
    limit: (limit: any) => {
        isValid: boolean;
        message?: string;
    };
};
export declare const securityLogging: (req: Request, res: Response, next: NextFunction) => void;
export declare const securityMiddleware: ((req: Request, res: Response, next: NextFunction) => void)[];
export default securityMiddleware;
//# sourceMappingURL=security.d.ts.map