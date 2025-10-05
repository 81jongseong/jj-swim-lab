"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityMiddleware = exports.securityLogging = exports.commonValidations = exports.createValidationMiddleware = exports.fileUploadSecurity = exports.inputLengthLimit = exports.xssProtection = exports.sqlInjectionCheck = exports.sanitizeInput = exports.apiRateLimitMiddleware = exports.rateLimitMiddleware = exports.corsMiddleware = exports.securityHeaders = void 0;
const validation_1 = require("./validation");
const securityHeaders = (req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
};
exports.securityHeaders = securityHeaders;
const corsMiddleware = (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    next();
};
exports.corsMiddleware = corsMiddleware;
const requestCounts = new Map();
const rateLimitMiddleware = (req, res, next) => {
    if (process.env.NODE_ENV === 'development') {
        next();
        return;
    }
    const clientId = req.ip || 'unknown';
    const now = Date.now();
    const windowMs = 15 * 60 * 1000;
    const maxRequests = 1000;
    const clientData = requestCounts.get(clientId);
    if (!clientData || now > clientData.resetTime) {
        requestCounts.set(clientId, { count: 1, resetTime: now + windowMs });
        next();
    }
    else if (clientData.count >= maxRequests) {
        res.status(429).json({
            error: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.',
            retryAfter: '15분',
        });
    }
    else {
        clientData.count++;
        next();
    }
};
exports.rateLimitMiddleware = rateLimitMiddleware;
const apiRateLimitMiddleware = (req, res, next) => {
    if (process.env.NODE_ENV === 'development') {
        next();
        return;
    }
    const clientId = req.ip || 'unknown';
    const now = Date.now();
    const windowMs = 15 * 60 * 1000;
    const maxRequests = 500;
    const clientData = requestCounts.get(clientId);
    if (!clientData || now > clientData.resetTime) {
        requestCounts.set(clientId, { count: 1, resetTime: now + windowMs });
        next();
    }
    else if (clientData.count >= maxRequests) {
        res.status(429).json({
            error: 'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
            retryAfter: '15분',
        });
    }
    else {
        clientData.count++;
        next();
    }
};
exports.apiRateLimitMiddleware = apiRateLimitMiddleware;
const sanitizeInput = (req, res, next) => {
    try {
        if (req.body && typeof req.body === 'object') {
            req.body = sanitizeObject(req.body);
        }
        if (req.query && typeof req.query === 'object') {
            req.query = sanitizeObject(req.query);
        }
        if (req.params && typeof req.params === 'object') {
            req.params = sanitizeObject(req.params);
        }
        next();
    }
    catch (error) {
        console.error('입력 데이터 sanitization 오류:', error);
        res.status(400).json({
            error: '잘못된 입력 데이터입니다.',
            message: '입력 데이터를 확인해주세요.',
        });
    }
};
exports.sanitizeInput = sanitizeInput;
const sanitizeObject = (obj) => {
    if (obj === null || obj === undefined) {
        return obj;
    }
    if (typeof obj === 'string') {
        return obj
            .replace(/<[^>]*>/g, '')
            .replace(/[<>]/g, '')
            .trim();
    }
    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }
    if (typeof obj === 'object') {
        const sanitized = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const sanitizedKey = key
                    .replace(/<[^>]*>/g, '')
                    .replace(/[<>]/g, '')
                    .trim();
                sanitized[sanitizedKey] = sanitizeObject(obj[key]);
            }
        }
        return sanitized;
    }
    return obj;
};
const sqlInjectionCheck = (req, res, next) => {
    try {
        const sqlPatterns = [
            /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
            /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
            /(\b(OR|AND)\s+['"]\s*=\s*['"])/i,
            /(\b(OR|AND)\s+['"]\s*LIKE\s*['"])/i,
            /(\b(OR|AND)\s+['"]\s*IN\s*\()/i,
            /(\b(OR|AND)\s+['"]\s*BETWEEN\s+)/i,
            /(\b(OR|AND)\s+['"]\s*IS\s+NULL)/i,
            /(\b(OR|AND)\s+['"]\s*IS\s+NOT\s+NULL)/i,
            /(\b(OR|AND)\s+['"]\s*EXISTS\s*\()/i,
            /(\b(OR|AND)\s+['"]\s*NOT\s+EXISTS\s*\()/i,
            /(\b(OR|AND)\s+['"]\s*HAVING\s+)/i,
            /(\b(OR|AND)\s+['"]\s*GROUP\s+BY\s+)/i,
            /(\b(OR|AND)\s+['"]\s*ORDER\s+BY\s+)/i,
            /(\b(OR|AND)\s+['"]\s*LIMIT\s+)/i,
            /(\b(OR|AND)\s+['"]\s*OFFSET\s+)/i,
            /(\b(OR|AND)\s+['"]\s*UNION\s+SELECT)/i,
            /(\b(OR|AND)\s+['"]\s*UNION\s+ALL\s+SELECT)/i,
            /(\b(OR|AND)\s+['"]\s*UNION\s+DISTINCT\s+SELECT)/i,
            /(\b(OR|AND)\s+['"]\s*UNION\s+ALL\s+DISTINCT\s+SELECT)/i,
        ];
        const checkForSQLInjection = (data) => {
            if (typeof data === 'string') {
                return sqlPatterns.some(pattern => pattern.test(data));
            }
            if (Array.isArray(data)) {
                return data.some(item => checkForSQLInjection(item));
            }
            if (typeof data === 'object' && data !== null) {
                return Object.values(data).some(value => checkForSQLInjection(value));
            }
            return false;
        };
        if (checkForSQLInjection(req.body) ||
            checkForSQLInjection(req.query) ||
            checkForSQLInjection(req.params)) {
            console.warn('SQL 인젝션 시도 감지:', {
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                body: req.body,
                query: req.query,
                params: req.params,
                timestamp: new Date().toISOString(),
            });
            return res.status(400).json({
                error: '잘못된 요청입니다.',
                message: '입력 데이터를 확인해주세요.',
            });
        }
        next();
    }
    catch (error) {
        console.error('SQL 인젝션 검사 오류:', error);
        res.status(500).json({
            error: '서버 오류가 발생했습니다.',
            message: '잠시 후 다시 시도해주세요.',
        });
    }
};
exports.sqlInjectionCheck = sqlInjectionCheck;
const xssProtection = (req, res, next) => {
    try {
        const xssPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
            /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
            /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
            /<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi,
            /<meta\b[^<]*(?:(?!<\/meta>)<[^<]*)*<\/meta>/gi,
            /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
            /<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi,
            /<meta\b[^<]*(?:(?!<\/meta>)<[^<]*)*<\/meta>/gi,
            /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
            /javascript:/gi,
            /vbscript:/gi,
            /onload\s*=/gi,
            /onerror\s*=/gi,
            /onclick\s*=/gi,
            /onmouseover\s*=/gi,
            /onfocus\s*=/gi,
            /onblur\s*=/gi,
            /onchange\s*=/gi,
            /onsubmit\s*=/gi,
            /onreset\s*=/gi,
            /onselect\s*=/gi,
            /onkeydown\s*=/gi,
            /onkeyup\s*=/gi,
            /onkeypress\s*=/gi,
            /onmousedown\s*=/gi,
            /onmouseup\s*=/gi,
            /onmousemove\s*=/gi,
            /onmouseout\s*=/gi,
            /onmouseover\s*=/gi,
            /onmouseenter\s*=/gi,
            /onmouseleave\s*=/gi,
            /oncontextmenu\s*=/gi,
            /ondblclick\s*=/gi,
            /onwheel\s*=/gi,
            /ontouchstart\s*=/gi,
            /ontouchend\s*=/gi,
            /ontouchmove\s*=/gi,
            /ontouchcancel\s*=/gi,
        ];
        const checkForXSS = (data) => {
            if (typeof data === 'string') {
                return xssPatterns.some(pattern => pattern.test(data));
            }
            if (Array.isArray(data)) {
                return data.some(item => checkForXSS(item));
            }
            if (typeof data === 'object' && data !== null) {
                return Object.values(data).some(value => checkForXSS(value));
            }
            return false;
        };
        if (checkForXSS(req.body) ||
            checkForXSS(req.query) ||
            checkForXSS(req.params)) {
            console.warn('XSS 공격 시도 감지:', {
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                body: req.body,
                query: req.query,
                params: req.params,
                timestamp: new Date().toISOString(),
            });
            return res.status(400).json({
                error: '잘못된 요청입니다.',
                message: '입력 데이터를 확인해주세요.',
            });
        }
        next();
    }
    catch (error) {
        console.error('XSS 검사 오류:', error);
        res.status(500).json({
            error: '서버 오류가 발생했습니다.',
            message: '잠시 후 다시 시도해주세요.',
        });
    }
};
exports.xssProtection = xssProtection;
const inputLengthLimit = (req, res, next) => {
    try {
        const limits = {
            body: 1024 * 1024,
            query: 2048,
            params: 512,
            headers: 8192,
        };
        if (req.body && JSON.stringify(req.body).length > limits.body) {
            return res.status(413).json({
                error: '요청 본문이 너무 큽니다.',
                message: '요청 데이터 크기를 줄여주세요.',
            });
        }
        if (req.query && JSON.stringify(req.query).length > limits.query) {
            return res.status(413).json({
                error: '쿼리 파라미터가 너무 큽니다.',
                message: '쿼리 파라미터를 줄여주세요.',
            });
        }
        if (req.params && JSON.stringify(req.params).length > limits.params) {
            return res.status(413).json({
                error: 'URL 파라미터가 너무 큽니다.',
                message: 'URL 파라미터를 줄여주세요.',
            });
        }
        const headerLength = Object.keys(req.headers).reduce((total, key) => {
            return total + key.length + (req.headers[key]?.length || 0);
        }, 0);
        if (headerLength > limits.headers) {
            return res.status(413).json({
                error: '헤더가 너무 큽니다.',
                message: '헤더를 줄여주세요.',
            });
        }
        next();
    }
    catch (error) {
        console.error('입력 길이 제한 검사 오류:', error);
        res.status(500).json({
            error: '서버 오류가 발생했습니다.',
            message: '잠시 후 다시 시도해주세요.',
        });
    }
};
exports.inputLengthLimit = inputLengthLimit;
const fileUploadSecurity = (req, res, next) => {
    try {
        if (req.files) {
            const allowedTypes = [
                'image/jpeg',
                'image/png',
                'image/gif',
                'image/webp',
                'video/mp4',
                'video/webm',
                'application/pdf',
                'text/plain',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ];
            const maxFileSize = 10 * 1024 * 1024;
            const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
            for (const file of files) {
                if (!allowedTypes.includes(file.mimetype)) {
                    return res.status(400).json({
                        error: '허용되지 않는 파일 타입입니다.',
                        message: '지원되는 파일 형식만 업로드 가능합니다.',
                    });
                }
                if (file.size > maxFileSize) {
                    return res.status(413).json({
                        error: '파일 크기가 너무 큽니다.',
                        message: '파일 크기는 10MB 이하여야 합니다.',
                    });
                }
                const fileNamePattern = /^[a-zA-Z0-9._-]+$/;
                if (!fileNamePattern.test(file.originalname)) {
                    return res.status(400).json({
                        error: '잘못된 파일명입니다.',
                        message: '파일명에는 영문, 숫자, 점, 하이픈, 언더스코어만 사용 가능합니다.',
                    });
                }
            }
        }
        next();
    }
    catch (error) {
        console.error('파일 업로드 보안 검사 오류:', error);
        res.status(500).json({
            error: '서버 오류가 발생했습니다.',
            message: '잠시 후 다시 시도해주세요.',
        });
    }
};
exports.fileUploadSecurity = fileUploadSecurity;
const createValidationMiddleware = (validations) => {
    return async (req, res, next) => {
        try {
            await Promise.all(validations.map(validation => validation(req, res, () => { })));
            const errors = (0, validation_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    error: '입력 데이터 검증 실패',
                    message: '입력 데이터를 확인해주세요.',
                    details: errors.array(),
                });
            }
            next();
        }
        catch (error) {
            console.error('입력 데이터 검증 오류:', error);
            res.status(500).json({
                error: '서버 오류가 발생했습니다.',
                message: '잠시 후 다시 시도해주세요.',
            });
        }
    };
};
exports.createValidationMiddleware = createValidationMiddleware;
exports.commonValidations = {
    email: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            return { isValid: false, message: '유효한 이메일 주소를 입력해주세요.' };
        }
        return { isValid: true };
    },
    password: (password) => {
        if (!password || password.length < 8 || password.length > 128) {
            return { isValid: false, message: '비밀번호는 8-128자 사이여야 합니다.' };
        }
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
        if (!strongPasswordRegex.test(password)) {
            return { isValid: false, message: '비밀번호는 대소문자, 숫자, 특수문자를 포함해야 합니다.' };
        }
        return { isValid: true };
    },
    name: (name) => {
        if (!name || name.length < 1 || name.length > 50) {
            return { isValid: false, message: '이름은 1-50자 사이여야 합니다.' };
        }
        const nameRegex = /^[가-힣a-zA-Z\s]+$/;
        if (!nameRegex.test(name)) {
            return { isValid: false, message: '이름은 한글 또는 영문만 사용 가능합니다.' };
        }
        return { isValid: true };
    },
    phone: (phone) => {
        if (!phone) {
            return { isValid: false, message: '전화번호를 입력해주세요.' };
        }
        const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
        if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
            return { isValid: false, message: '유효한 전화번호를 입력해주세요.' };
        }
        return { isValid: true };
    },
    id: (id) => {
        if (!id) {
            return { isValid: false, message: 'ID를 입력해주세요.' };
        }
        const objectIdRegex = /^[0-9a-fA-F]{24}$/;
        if (!objectIdRegex.test(id)) {
            return { isValid: false, message: '유효한 ID를 입력해주세요.' };
        }
        return { isValid: true };
    },
    page: (page) => {
        const pageNum = parseInt(page);
        if (isNaN(pageNum) || pageNum < 1 || pageNum > 1000) {
            return { isValid: false, message: '페이지 번호는 1-1000 사이의 정수여야 합니다.' };
        }
        return { isValid: true };
    },
    limit: (limit) => {
        const limitNum = parseInt(limit);
        if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
            return { isValid: false, message: '페이지 크기는 1-100 사이의 정수여야 합니다.' };
        }
        return { isValid: true };
    },
};
const securityLogging = (req, res, next) => {
    const startTime = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const logData = {
            timestamp: new Date().toISOString(),
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            referer: req.get('Referer'),
            userId: req.user?.id || 'anonymous',
        };
        if (res.statusCode >= 400) {
            console.warn('보안 이벤트:', logData);
        }
        else {
            console.log('API 요청:', logData);
        }
    });
    next();
};
exports.securityLogging = securityLogging;
exports.securityMiddleware = [
    exports.securityHeaders,
    exports.corsMiddleware,
    exports.rateLimitMiddleware,
    exports.sanitizeInput,
    exports.sqlInjectionCheck,
    exports.xssProtection,
    exports.inputLengthLimit,
    exports.fileUploadSecurity,
    exports.securityLogging,
];
exports.default = exports.securityMiddleware;
//# sourceMappingURL=security.js.map