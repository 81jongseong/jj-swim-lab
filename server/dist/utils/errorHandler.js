"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectErrorMetrics = exports.retryOperation = exports.notFoundHandler = exports.errorHandler = exports.asyncHandler = exports.AppError = exports.ErrorSeverity = exports.ErrorCode = void 0;
const logger_1 = require("./logger");
var ErrorCode;
(function (ErrorCode) {
    ErrorCode["UNAUTHORIZED"] = "UNAUTHORIZED";
    ErrorCode["FORBIDDEN"] = "FORBIDDEN";
    ErrorCode["TOKEN_EXPIRED"] = "TOKEN_EXPIRED";
    ErrorCode["INVALID_TOKEN"] = "INVALID_TOKEN";
    ErrorCode["USER_NOT_FOUND"] = "USER_NOT_FOUND";
    ErrorCode["USER_ALREADY_EXISTS"] = "USER_ALREADY_EXISTS";
    ErrorCode["INVALID_CREDENTIALS"] = "INVALID_CREDENTIALS";
    ErrorCode["USER_DISABLED"] = "USER_DISABLED";
    ErrorCode["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    ErrorCode["DATA_NOT_FOUND"] = "DATA_NOT_FOUND";
    ErrorCode["DUPLICATE_DATA"] = "DUPLICATE_DATA";
    ErrorCode["INVALID_DATA_FORMAT"] = "INVALID_DATA_FORMAT";
    ErrorCode["INTERNAL_SERVER_ERROR"] = "INTERNAL_SERVER_ERROR";
    ErrorCode["DATABASE_ERROR"] = "DATABASE_ERROR";
    ErrorCode["EXTERNAL_SERVICE_ERROR"] = "EXTERNAL_SERVICE_ERROR";
    ErrorCode["RATE_LIMIT_EXCEEDED"] = "RATE_LIMIT_EXCEEDED";
    ErrorCode["FILE_TOO_LARGE"] = "FILE_TOO_LARGE";
    ErrorCode["INVALID_FILE_TYPE"] = "INVALID_FILE_TYPE";
    ErrorCode["FILE_UPLOAD_FAILED"] = "FILE_UPLOAD_FAILED";
    ErrorCode["INSUFFICIENT_PERMISSIONS"] = "INSUFFICIENT_PERMISSIONS";
    ErrorCode["OPERATION_NOT_ALLOWED"] = "OPERATION_NOT_ALLOWED";
    ErrorCode["RESOURCE_CONFLICT"] = "RESOURCE_CONFLICT";
    ErrorCode["QUOTA_EXCEEDED"] = "QUOTA_EXCEEDED";
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));
var ErrorSeverity;
(function (ErrorSeverity) {
    ErrorSeverity["LOW"] = "low";
    ErrorSeverity["MEDIUM"] = "medium";
    ErrorSeverity["HIGH"] = "high";
    ErrorSeverity["CRITICAL"] = "critical";
})(ErrorSeverity || (exports.ErrorSeverity = ErrorSeverity = {}));
class AppError extends Error {
    constructor(message, statusCode = 500, errorCode = ErrorCode.INTERNAL_SERVER_ERROR, severity = ErrorSeverity.MEDIUM, context) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.severity = severity;
        this.isOperational = true;
        this.timestamp = new Date();
        this.context = context;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, AppError);
        }
        else {
            const stack = new Error().stack;
            if (stack) {
                this.stack = `AppError: ${message}\n${stack.split('\n').slice(1).join('\n')}`;
            }
        }
    }
}
exports.AppError = AppError;
const logErrorDetails = (error, req) => {
    const errorDetails = {
        message: error.message,
        code: error.errorCode,
        statusCode: error.statusCode,
        severity: error.severity,
        context: error.context,
        stack: error.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id,
        timestamp: error.timestamp.toISOString()
    };
    switch (error.severity) {
        case ErrorSeverity.CRITICAL:
        case ErrorSeverity.HIGH:
            (0, logger_1.logError)('Critical/High Error', errorDetails);
            break;
        case ErrorSeverity.MEDIUM:
            (0, logger_1.logWarn)('Medium Error', errorDetails);
            break;
        case ErrorSeverity.LOW:
            (0, logger_1.logInfo)('Low Error', errorDetails);
            break;
    }
    console.error('Error logged:', errorDetails);
};
const createErrorResponse = (error, req) => {
    const response = {
        success: false,
        error: {
            message: error.message,
            code: error.errorCode,
            statusCode: error.statusCode,
            timestamp: error.timestamp.toISOString(),
            requestId: req.headers['x-request-id']
        }
    };
    if (process.env.NODE_ENV === 'development') {
        response.error.details = {
            stack: error.stack,
            context: error.context
        };
    }
    return response;
};
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
const errorHandler = (error, req, res, next) => {
    let appError;
    if (error instanceof AppError) {
        appError = error;
    }
    else {
        appError = new AppError(error.message || '예상치 못한 오류가 발생했습니다.', 500, ErrorCode.INTERNAL_SERVER_ERROR, ErrorSeverity.HIGH, {
            originalError: error,
            stack: error.stack
        });
    }
    if (res.headersSent) {
        return next(appError);
    }
    logErrorDetails(appError, req);
    const errorResponse = createErrorResponse(appError, req);
    res.status(appError.statusCode).json(errorResponse);
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res, next) => {
    const error = new AppError(`요청한 리소스를 찾을 수 없습니다: ${req.originalUrl}`, 404, ErrorCode.DATA_NOT_FOUND, ErrorSeverity.LOW);
    next(error);
};
exports.notFoundHandler = notFoundHandler;
const retryOperation = async (operation, maxRetries = 3, delay = 1000) => {
    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        }
        catch (error) {
            lastError = error;
            if (attempt === maxRetries) {
                throw lastError;
            }
            await new Promise(resolve => setTimeout(resolve, delay * attempt));
            (0, logger_1.logWarn)(`Operation retry attempt ${attempt}/${maxRetries}`, {
                error: lastError.message,
                attempt,
                maxRetries
            });
        }
    }
    throw lastError;
};
exports.retryOperation = retryOperation;
const collectErrorMetrics = (error, req) => {
    (0, logger_1.logInfo)('Error Metrics Collected', {
        errorCode: error.errorCode,
        severity: error.severity,
        statusCode: error.statusCode,
        responseTime: Date.now() - req.startTime,
        endpoint: `${req.method} ${req.originalUrl}`
    });
};
exports.collectErrorMetrics = collectErrorMetrics;
exports.default = {
    AppError,
    ErrorCode,
    ErrorSeverity,
    errorHandler: exports.errorHandler,
    notFoundHandler: exports.notFoundHandler,
    asyncHandler: exports.asyncHandler,
    retryOperation: exports.retryOperation,
    collectErrorMetrics: exports.collectErrorMetrics
};
//# sourceMappingURL=errorHandler.js.map