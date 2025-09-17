"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdminPermission = exports.requireDeletePermission = exports.requireWritePermission = exports.requireReadPermission = exports.requireGuest = exports.requireStudent = exports.requireInstructor = exports.requireCenterAdmin = exports.requireSuperAdmin = void 0;
exports.verifyToken = verifyToken;
exports.extractUserFromToken = extractUserFromToken;
exports.hasPermission = hasPermission;
exports.hasRole = hasRole;
exports.hasCenterAccess = hasCenterAccess;
exports.authenticate = authenticate;
exports.requireCenterAccess = requireCenterAccess;
exports.checkPermission = checkPermission;
exports.checkRole = checkRole;
exports.refreshToken = refreshToken;
exports.validateSession = validateSession;
exports.securityHeaders = securityHeaders;
exports.requestLogging = requestLogging;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function verifyToken(token) {
    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET is not defined');
        }
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        return decoded;
    }
    catch (error) {
        console.error('Token verification failed:', error);
        return null;
    }
}
function extractUserFromToken(token) {
    const payload = verifyToken(token);
    if (!payload)
        return null;
    return {
        userId: payload.userId,
        role: payload.role,
        permissions: payload.permissions,
        ipAddress: '',
        userAgent: '',
        sessionId: '',
        tokenExpiry: new Date(payload.exp * 1000)
    };
}
function hasPermission(userPermissions, requiredPermissions) {
    return requiredPermissions.every(permission => userPermissions.includes(permission));
}
function hasRole(userRole, requiredRoles) {
    return requiredRoles.includes(userRole);
}
function hasCenterAccess(userCenterId, requiredCenterId) {
    return userCenterId === requiredCenterId;
}
function authenticate(options = {}) {
    return (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                if (options.allowGuest) {
                    req.user = {
                        role: 'guest',
                        permissions: [],
                        ipAddress: req.ip || req.connection.remoteAddress || '',
                        userAgent: req.get('User-Agent') || '',
                        sessionId: req.sessionID || '',
                        tokenExpiry: new Date()
                    };
                    return next();
                }
                if (options.required !== false) {
                    return res.status(401).json({
                        success: false,
                        error: '인증이 필요합니다.',
                        message: '로그인해주세요.'
                    });
                }
                return next();
            }
            const token = authHeader.startsWith('Bearer ')
                ? authHeader.slice(7)
                : authHeader;
            const user = extractUserFromToken(token);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: '유효하지 않은 토큰입니다.',
                    message: '토큰을 확인해주세요.'
                });
            }
            if (user.tokenExpiry < new Date()) {
                return res.status(401).json({
                    success: false,
                    error: '토큰이 만료되었습니다.',
                    message: '다시 로그인해주세요.'
                });
            }
            user.ipAddress = req.ip || req.connection.remoteAddress || '';
            user.userAgent = req.get('User-Agent') || '';
            user.sessionId = req.sessionID || '';
            if (options.roles && !hasRole(user.role, options.roles)) {
                return res.status(403).json({
                    success: false,
                    error: '권한이 없습니다.',
                    message: '접근할 수 있는 역할이 아닙니다.'
                });
            }
            if (options.permissions && !hasPermission(user.permissions, options.permissions)) {
                return res.status(403).json({
                    success: false,
                    error: '권한이 없습니다.',
                    message: '필요한 권한이 없습니다.'
                });
            }
            req.user = user;
            req.token = token;
            next();
        }
        catch (error) {
            console.error('Authentication error:', error);
            return res.status(500).json({
                success: false,
                error: '인증 처리 중 오류가 발생했습니다.',
                message: '서버 오류입니다.'
            });
        }
    };
}
exports.requireSuperAdmin = authenticate({ roles: ['superAdmin'] });
exports.requireCenterAdmin = authenticate({ roles: ['superAdmin', 'centerAdmin'] });
exports.requireInstructor = authenticate({ roles: ['superAdmin', 'centerAdmin', 'instructor'] });
exports.requireStudent = authenticate({ roles: ['superAdmin', 'centerAdmin', 'instructor', 'student'] });
exports.requireGuest = authenticate({ allowGuest: true });
exports.requireReadPermission = authenticate({ permissions: ['read'] });
exports.requireWritePermission = authenticate({ permissions: ['write'] });
exports.requireDeletePermission = authenticate({ permissions: ['delete'] });
exports.requireAdminPermission = authenticate({ permissions: ['admin'] });
function requireCenterAccess(centerId) {
    return authenticate({ centerId });
}
function checkPermission(permission) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: '인증이 필요합니다.',
                message: '로그인해주세요.'
            });
        }
        if (!req.user.permissions.includes(permission)) {
            return res.status(403).json({
                success: false,
                error: '권한이 없습니다.',
                message: `'${permission}' 권한이 필요합니다.`
            });
        }
        next();
    };
}
function checkRole(role) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: '인증이 필요합니다.',
                message: '로그인해주세요.'
            });
        }
        if (req.user.role !== role) {
            return res.status(403).json({
                success: false,
                error: '권한이 없습니다.',
                message: `'${role}' 역할이 필요합니다.`
            });
        }
        next();
    };
}
function refreshToken(req, res, next) {
    if (!req.user || !req.token) {
        return next();
    }
    const now = new Date();
    const tokenExpiry = req.user.tokenExpiry;
    const timeUntilExpiry = tokenExpiry.getTime() - now.getTime();
    const refreshThreshold = 15 * 60 * 1000;
    if (timeUntilExpiry < refreshThreshold) {
        const newToken = generateRefreshToken(req.user);
        res.setHeader('X-New-Token', newToken);
    }
    next();
}
function generateRefreshToken(user) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not defined');
    }
    const payload = {
        userId: user.userId,
        role: user.role,
        permissions: user.permissions
    };
    return jsonwebtoken_1.default.sign(payload, secret, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    });
}
function validateSession(req, res, next) {
    if (!req.user) {
        return next();
    }
    if (req.user.sessionId && req.sessionID && req.user.sessionId !== req.sessionID) {
        return res.status(401).json({
            success: false,
            error: '세션이 일치하지 않습니다.',
            message: '다시 로그인해주세요.'
        });
    }
    next();
}
function securityHeaders(req, res, next) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    res.setHeader('Content-Security-Policy', "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: https:; " +
        "connect-src 'self' https:; " +
        "font-src 'self' https:; " +
        "object-src 'none'; " +
        "base-uri 'self'; " +
        "form-action 'self';");
    next();
}
function requestLogging(req, res, next) {
    const startTime = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const logData = {
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration,
            userAgent: req.get('User-Agent'),
            ip: req.ip || req.connection.remoteAddress,
            userId: req.user?.userId,
            sessionId: req.user?.sessionId
        };
        console.log('Request completed:', logData);
    });
    next();
}
exports.default = {
    authenticate,
    requireSuperAdmin: exports.requireSuperAdmin,
    requireCenterAdmin: exports.requireCenterAdmin,
    requireInstructor: exports.requireInstructor,
    requireStudent: exports.requireStudent,
    requireGuest: exports.requireGuest,
    requireReadPermission: exports.requireReadPermission,
    requireWritePermission: exports.requireWritePermission,
    requireDeletePermission: exports.requireDeletePermission,
    requireAdminPermission: exports.requireAdminPermission,
    requireCenterAccess,
    checkPermission,
    checkRole,
    refreshToken,
    validateSession,
    securityHeaders,
    requestLogging
};
//# sourceMappingURL=advancedAuth.js.map