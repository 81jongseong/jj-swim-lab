"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityLogger = exports.sessionManager = exports.validatePasswordStrength = exports.verifyPassword = exports.hashPassword = exports.refreshTokenMiddleware = exports.requireCenterOwnership = exports.requireRole = exports.requirePermission = exports.requireCenterAdmin = exports.requireStudent = exports.requireInstructor = exports.requireAdmin = exports.auth = exports.authMiddleware = exports.verifyToken = exports.generateTokens = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = require("../models/User");
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
const generateTokens = (user) => {
    const payload = {
        id: user._id,
        email: user.email,
        name: user.name,
        userType: user.userType,
        centerId: user.centerId,
        permissions: user.permissions || [],
    };
    const accessToken = jsonwebtoken_1.default.sign(payload, JWT_SECRET, {
        expiresIn: '1h'
    });
    const refreshToken = jsonwebtoken_1.default.sign({ id: user._id, type: 'refresh' }, JWT_REFRESH_SECRET, {
        expiresIn: '7d'
    });
    return { accessToken, refreshToken };
};
exports.generateTokens = generateTokens;
const verifyToken = (token, secret) => {
    return new Promise((resolve, reject) => {
        jsonwebtoken_1.default.verify(token, secret, (err, decoded) => {
            if (err) {
                console.error('❌ JWT 토큰 검증 실패:', err.message);
                reject(err);
            }
            else {
                console.log('✅ JWT 토큰 검증 성공:', decoded);
                resolve(decoded);
            }
        });
    });
};
exports.verifyToken = verifyToken;
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        console.log('🔍 Authorization 헤더 확인:', {
            hasAuthHeader: !!authHeader,
            authHeader: authHeader ? authHeader.substring(0, 50) + '...' : 'none',
            endpoint: req.originalUrl,
            method: req.method
        });
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('❌ Authorization 헤더 없음 또는 Bearer 형식 아님');
            return res.status(401).json({
                error: '인증이 필요합니다.',
                message: 'Bearer 토큰을 제공해주세요.',
            });
        }
        const token = authHeader.substring(7);
        console.log('🔍 JWT 토큰 검증 시작:', {
            tokenLength: token.length,
            tokenStart: token.substring(0, 20) + '...',
            secretLength: JWT_SECRET.length,
            endpoint: req.originalUrl,
            method: req.method
        });
        const decoded = await (0, exports.verifyToken)(token, JWT_SECRET);
        console.log('🔍 JWT 토큰 디코딩 결과:', {
            id: decoded.id,
            userType: decoded.userType,
            email: decoded.email,
            name: decoded.name,
            centerId: decoded.centerId,
            permissions: decoded.permissions,
            defaultCenterId: decoded.defaultCenterId,
            memberships: decoded.memberships
        });
        req.user = {
            id: decoded.id,
            _id: decoded.id,
            userId: decoded.id,
            userType: decoded.userType,
            email: decoded.email,
            name: decoded.name,
            centerId: decoded.centerId || decoded.defaultCenterId || decoded.memberships?.[0]?.centerId,
            permissions: decoded.permissions || [],
            defaultCenterId: decoded.defaultCenterId,
            memberships: decoded.memberships
        };
        if (!req.user.centerId) {
            req.user.centerId = decoded.defaultCenterId || decoded.memberships?.[0]?.centerId;
        }
        console.log('🔍 설정된 사용자 정보:', req.user);
        next();
    }
    catch (error) {
        console.error('인증 오류:', error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: '토큰이 만료되었습니다.',
                message: '다시 로그인해주세요.',
                code: 'TOKEN_EXPIRED',
            });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: '유효하지 않은 토큰입니다.',
                message: '올바른 토큰을 제공해주세요.',
                code: 'INVALID_TOKEN',
            });
        }
        return res.status(401).json({
            error: '인증에 실패했습니다.',
            message: '다시 로그인해주세요.',
        });
    }
};
exports.authMiddleware = authMiddleware;
exports.auth = exports.authMiddleware;
const requireAdmin = (req, res, next) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({
            error: '인증이 필요합니다.',
            message: '로그인해주세요.',
        });
    }
    if (user.userType !== 'admin') {
        console.warn('관리자 권한 없는 접근 시도:', {
            userId: user.id,
            userType: user.userType,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            url: req.url,
            method: req.method,
            timestamp: new Date().toISOString(),
        });
        return res.status(403).json({
            error: '관리자 권한이 필요합니다.',
            message: '이 기능을 사용할 권한이 없습니다.',
        });
    }
    next();
};
exports.requireAdmin = requireAdmin;
const requireInstructor = (req, res, next) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({
            error: '인증이 필요합니다.',
            message: '로그인해주세요.',
        });
    }
    if (!['admin', 'instructor'].includes(user.userType)) {
        console.warn('강사 권한 없는 접근 시도:', {
            userId: user.id,
            userType: user.userType,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            url: req.url,
            method: req.method,
            timestamp: new Date().toISOString(),
        });
        return res.status(403).json({
            error: '강사 권한이 필요합니다.',
            message: '이 기능을 사용할 권한이 없습니다.',
        });
    }
    next();
};
exports.requireInstructor = requireInstructor;
const requireStudent = (req, res, next) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({
            error: '인증이 필요합니다.',
            message: '로그인해주세요.',
        });
    }
    if (!['admin', 'instructor', 'student'].includes(user.userType)) {
        console.warn('학생 권한 없는 접근 시도:', {
            userId: user.id,
            userType: user.userType,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            url: req.url,
            method: req.method,
            timestamp: new Date().toISOString(),
        });
        return res.status(403).json({
            error: '학생 권한이 필요합니다.',
            message: '이 기능을 사용할 권한이 없습니다.',
        });
    }
    next();
};
exports.requireStudent = requireStudent;
const requireCenterAdmin = (req, res, next) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({
            error: '인증이 필요합니다.',
            message: '로그인해주세요.',
        });
    }
    if (!['admin', 'center_admin', 'centerAdmin'].includes(user.userType)) {
        console.warn('센터 관리자 권한 없는 접근 시도:', {
            userId: user.id,
            userType: user.userType,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            url: req.url,
            method: req.method,
            timestamp: new Date().toISOString(),
        });
        return res.status(403).json({
            error: '센터 관리자 권한이 필요합니다.',
            message: '이 기능을 사용할 권한이 없습니다.',
        });
    }
    next();
};
exports.requireCenterAdmin = requireCenterAdmin;
const requirePermission = (permission) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                error: '인증이 필요합니다.',
                message: '로그인해주세요.',
            });
        }
        const hasPermissionInArray = user.permissions && Array.isArray(user.permissions) && user.permissions.includes(permission);
        const hasPermissionInObject = user.permissions && typeof user.permissions === 'object' && !Array.isArray(user.permissions) && user.permissions[permission] === true;
        const hasAccessPermission = user.accessPermissions && user.accessPermissions[permission] === true;
        const isSuperAdmin = user.userType === 'superAdmin';
        if (!hasPermissionInArray && !hasPermissionInObject && !hasAccessPermission && !isSuperAdmin) {
            console.warn('권한 없는 접근 시도:', {
                userId: user.id,
                userType: user.userType,
                requiredPermission: permission,
                userPermissions: user.permissions,
                accessPermissions: user.accessPermissions,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                url: req.url,
                method: req.method,
                timestamp: new Date().toISOString(),
            });
            return res.status(403).json({
                error: '권한이 없습니다.',
                message: `이 기능을 사용하려면 '${permission}' 권한이 필요합니다.`,
            });
        }
        next();
    };
};
exports.requirePermission = requirePermission;
const requireRole = (roles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                error: '인증이 필요합니다.',
                message: '로그인해주세요.',
            });
        }
        if (user.userType === 'superAdmin') {
            return next();
        }
        if (!roles.includes(user.userType)) {
            console.warn('역할 기반 접근 거부:', {
                userId: user.id,
                userType: user.userType,
                requiredRoles: roles,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                url: req.url,
                method: req.method,
                timestamp: new Date().toISOString(),
            });
            return res.status(403).json({
                error: '접근 권한이 없습니다.',
                message: `이 작업을 수행하기 위해서는 다음 역할 중 하나가 필요합니다: ${roles.join(', ')}`,
                requiredRoles: roles,
                userRole: user.userType,
            });
        }
        next();
    };
};
exports.requireRole = requireRole;
const requireCenterOwnership = (req, res, next) => {
    const user = req.user;
    const centerId = req.params.centerId || req.body.centerId;
    if (!user) {
        return res.status(401).json({
            error: '인증이 필요합니다.',
            message: '로그인해주세요.',
        });
    }
    if (user.userType === 'admin') {
        return next();
    }
    if (user.userType === 'center_admin' && user.centerId === centerId) {
        return next();
    }
    console.warn('센터 소유권 없는 접근 시도:', {
        userId: user.id,
        userType: user.userType,
        userCenterId: user.centerId,
        requestedCenterId: centerId,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString(),
    });
    return res.status(403).json({
        error: '센터 소유권이 없습니다.',
        message: '이 센터에 접근할 권한이 없습니다.',
    });
};
exports.requireCenterOwnership = requireCenterOwnership;
const refreshTokenMiddleware = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({
                error: '리프레시 토큰이 필요합니다.',
                message: '리프레시 토큰을 제공해주세요.',
            });
        }
        const decoded = await (0, exports.verifyToken)(refreshToken, JWT_REFRESH_SECRET);
        if (decoded.type !== 'refresh') {
            return res.status(401).json({
                error: '유효하지 않은 리프레시 토큰입니다.',
                message: '올바른 리프레시 토큰을 제공해주세요.',
            });
        }
        const user = await User_1.User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({
                error: '사용자를 찾을 수 없습니다.',
                message: '다시 로그인해주세요.',
            });
        }
        const { accessToken, refreshToken: newRefreshToken } = (0, exports.generateTokens)(user);
        res.json({
            accessToken,
            refreshToken: newRefreshToken,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                userType: user.userType,
                centerId: user.centerId,
                permissions: user.permissions || [],
            },
        });
    }
    catch (error) {
        console.error('토큰 갱신 오류:', error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: '리프레시 토큰이 만료되었습니다.',
                message: '다시 로그인해주세요.',
                code: 'REFRESH_TOKEN_EXPIRED',
            });
        }
        return res.status(401).json({
            error: '토큰 갱신에 실패했습니다.',
            message: '다시 로그인해주세요.',
        });
    }
};
exports.refreshTokenMiddleware = refreshTokenMiddleware;
const hashPassword = async (password) => {
    const saltRounds = 12;
    return await bcryptjs_1.default.hash(password, saltRounds);
};
exports.hashPassword = hashPassword;
const verifyPassword = async (password, hashedPassword) => {
    return await bcryptjs_1.default.compare(password, hashedPassword);
};
exports.verifyPassword = verifyPassword;
const validatePasswordStrength = (password) => {
    const errors = [];
    if (password.length < 8) {
        errors.push('비밀번호는 최소 8자 이상이어야 합니다.');
    }
    if (password.length > 128) {
        errors.push('비밀번호는 최대 128자 이하여야 합니다.');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('비밀번호는 소문자를 포함해야 합니다.');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('비밀번호는 대문자를 포함해야 합니다.');
    }
    if (!/\d/.test(password)) {
        errors.push('비밀번호는 숫자를 포함해야 합니다.');
    }
    if (!/[@$!%*?&]/.test(password)) {
        errors.push('비밀번호는 특수문자(@$!%*?&)를 포함해야 합니다.');
    }
    if (/(.)\1{2,}/.test(password)) {
        errors.push('비밀번호는 연속된 문자를 3개 이상 사용할 수 없습니다.');
    }
    const commonPatterns = [
        /123456/,
        /password/i,
        /qwerty/i,
        /abc123/i,
        /admin/i,
        /user/i,
    ];
    if (commonPatterns.some(pattern => pattern.test(password))) {
        errors.push('비밀번호는 일반적인 패턴을 사용할 수 없습니다.');
    }
    return {
        isValid: errors.length === 0,
        errors,
    };
};
exports.validatePasswordStrength = validatePasswordStrength;
exports.sessionManager = {
    createSession: async (userId, userAgent, ip) => {
        const sessionData = {
            userId,
            userAgent,
            ip,
            createdAt: new Date(),
            lastAccessedAt: new Date(),
            isActive: true,
        };
        console.log('세션 생성:', sessionData);
        return sessionData;
    },
    validateSession: async (sessionId) => {
        console.log('세션 검증:', sessionId);
        return true;
    },
    refreshSession: async (sessionId) => {
        console.log('세션 갱신:', sessionId);
        return true;
    },
    deleteSession: async (sessionId) => {
        console.log('세션 삭제:', sessionId);
        return true;
    },
    cleanupUserSessions: async (userId) => {
        console.log('사용자 세션 정리:', userId);
        return true;
    },
};
exports.securityLogger = {
    logAuthAttempt: (email, success, ip, userAgent) => {
        console.log('인증 시도:', {
            email,
            success,
            ip,
            userAgent,
            timestamp: new Date().toISOString(),
        });
    },
    logPermissionDenied: (userId, permission, ip, userAgent) => {
        console.warn('권한 거부:', {
            userId,
            permission,
            ip,
            userAgent,
            timestamp: new Date().toISOString(),
        });
    },
    logTokenRefresh: (userId, success, ip) => {
        console.log('토큰 갱신:', {
            userId,
            success,
            ip,
            timestamp: new Date().toISOString(),
        });
    },
};
exports.default = {
    authMiddleware: exports.authMiddleware,
    requireAdmin: exports.requireAdmin,
    requireInstructor: exports.requireInstructor,
    requireStudent: exports.requireStudent,
    requireCenterAdmin: exports.requireCenterAdmin,
    requirePermission: exports.requirePermission,
    requireCenterOwnership: exports.requireCenterOwnership,
    refreshTokenMiddleware: exports.refreshTokenMiddleware,
    generateTokens: exports.generateTokens,
    verifyToken: exports.verifyToken,
    hashPassword: exports.hashPassword,
    verifyPassword: exports.verifyPassword,
    validatePasswordStrength: exports.validatePasswordStrength,
    sessionManager: exports.sessionManager,
    securityLogger: exports.securityLogger,
};
//# sourceMappingURL=auth.js.map