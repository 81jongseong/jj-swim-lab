import { Request, Response, NextFunction } from 'express';
export declare enum ErrorCode {
    UNAUTHORIZED = "UNAUTHORIZED",
    FORBIDDEN = "FORBIDDEN",
    TOKEN_EXPIRED = "TOKEN_EXPIRED",
    INVALID_TOKEN = "INVALID_TOKEN",
    USER_NOT_FOUND = "USER_NOT_FOUND",
    USER_ALREADY_EXISTS = "USER_ALREADY_EXISTS",
    INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
    USER_DISABLED = "USER_DISABLED",
    VALIDATION_ERROR = "VALIDATION_ERROR",
    DATA_NOT_FOUND = "DATA_NOT_FOUND",
    DUPLICATE_DATA = "DUPLICATE_DATA",
    INVALID_DATA_FORMAT = "INVALID_DATA_FORMAT",
    INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
    DATABASE_ERROR = "DATABASE_ERROR",
    EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR",
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
    FILE_TOO_LARGE = "FILE_TOO_LARGE",
    INVALID_FILE_TYPE = "INVALID_FILE_TYPE",
    FILE_UPLOAD_FAILED = "FILE_UPLOAD_FAILED",
    INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",
    OPERATION_NOT_ALLOWED = "OPERATION_NOT_ALLOWED",
    RESOURCE_CONFLICT = "RESOURCE_CONFLICT",
    QUOTA_EXCEEDED = "QUOTA_EXCEEDED"
}
export declare enum ErrorSeverity {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
export declare class AppError extends Error {
    readonly statusCode: number;
    readonly errorCode: ErrorCode;
    readonly severity: ErrorSeverity;
    readonly isOperational: boolean;
    readonly timestamp: Date;
    readonly context?: Record<string, unknown>;
    constructor(message: string, statusCode?: number, errorCode?: ErrorCode, severity?: ErrorSeverity, context?: Record<string, unknown>);
}
export declare const asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
export declare const errorHandler: (error: Error | AppError, req: Request, res: Response, next: NextFunction) => void;
export declare const notFoundHandler: (req: Request, res: Response, next: NextFunction) => void;
export declare const retryOperation: <T>(operation: () => Promise<T>, maxRetries?: number, delay?: number) => Promise<T>;
export declare const collectErrorMetrics: (error: AppError, req: Request) => void;
declare const _default: {
    AppError: typeof AppError;
    ErrorCode: typeof ErrorCode;
    ErrorSeverity: typeof ErrorSeverity;
    errorHandler: (error: Error | AppError, req: Request, res: Response, next: NextFunction) => void;
    notFoundHandler: (req: Request, res: Response, next: NextFunction) => void;
    asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
    retryOperation: <T>(operation: () => Promise<T>, maxRetries?: number, delay?: number) => Promise<T>;
    collectErrorMetrics: (error: AppError, req: Request) => void;
};
export default _default;
//# sourceMappingURL=errorHandler.d.ts.map