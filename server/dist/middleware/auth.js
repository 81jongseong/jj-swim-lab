"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireCenterAdminCenterAccess = exports.requireInstructorCenterAccess = exports.requireSuperAdminPermission = exports.requireCenterAdminPermission = exports.requireFeatureSequence = exports.requirePermission = exports.requireLevel = exports.requireRole = exports.auth = void 0;
const jwt = __importStar(require("jsonwebtoken"));
const User_1 = require("../models/User");
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: '인증 토큰이 필요합니다.' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
        const user = await User_1.User.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
        }
        if (!user.isActive) {
            return res.status(403).json({ error: '비활성화된 계정입니다.' });
        }
        if (decoded.centerId) {
            user.centerId = decoded.centerId;
        }
        if (user.userType === 'centerAdmin') {
            console.log('🔍 auth 미들웨어 - 센터 관리자 centerId:', {
                centerId: user.centerId,
                centerIdType: typeof user.centerId,
                centerIdConstructor: user.centerId?.constructor?.name,
                fromJWT: !!decoded.centerId
            });
        }
        req.user = user;
        return next();
    }
    catch (error) {
        console.error('인증 오류:', error);
        return res.status(401).json({ error: '인증에 실패했습니다.' });
    }
};
exports.auth = auth;
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: '인증이 필요합니다.' });
        }
        if (req.user.userType === 'superAdmin') {
            return next();
        }
        if (!roles.includes(req.user.userType)) {
            return res.status(403).json({ error: '접근 권한이 없습니다.' });
        }
        return next();
    };
};
exports.requireRole = requireRole;
const requireLevel = (userType, minLevel) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: '인증이 필요합니다.' });
        }
        if (req.user.userType === 'superAdmin') {
            return next();
        }
        if (req.user.userType !== userType) {
            return res.status(403).json({ error: '잘못된 사용자 유형입니다.' });
        }
        const userLevel = getUserLevel(req.user);
        const minLevelIndex = getLevelIndex(userType, minLevel);
        const userLevelIndex = getLevelIndex(userType, userLevel);
        if (userLevelIndex < minLevelIndex) {
            return res.status(403).json({
                error: '레벨이 부족합니다.',
                requiredLevel: minLevel,
                currentLevel: userLevel
            });
        }
        return next();
    };
};
exports.requireLevel = requireLevel;
const requirePermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: '인증이 필요합니다.' });
        }
        if (req.user.userType === 'superAdmin') {
            return next();
        }
        if (!req.user.accessPermissions || !req.user.accessPermissions[permission]) {
            return res.status(403).json({ error: '해당 기능에 대한 접근 권한이 없습니다.' });
        }
        return next();
    };
};
exports.requirePermission = requirePermission;
const requireFeatureSequence = (feature) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: '인증이 필요합니다.' });
        }
        if (req.user.userType === 'superAdmin') {
            return next();
        }
        if (!req.user.featureSequence) {
            return res.status(403).json({ error: '기능 시퀀스가 설정되지 않았습니다.' });
        }
        const { availableSteps, completedSteps } = req.user.featureSequence;
        if (!availableSteps.includes(feature)) {
            return res.status(403).json({
                error: '해당 기능에 접근할 수 없습니다.',
                availableSteps,
                currentStep: req.user.featureSequence.currentStep
            });
        }
        return next();
    };
};
exports.requireFeatureSequence = requireFeatureSequence;
function getUserLevel(user) {
    switch (user.userType) {
        case 'student':
            return user.studentInfo?.swimmingLevel || 'beginner';
        case 'instructor':
            return user.instructorInfo?.instructorLevel || 'junior';
        case 'centerAdmin':
            return user.centerAdminInfo?.adminLevel || 'assistant';
        case 'superAdmin':
            return user.superAdminInfo?.adminLevel || 'admin';
        default:
            return 'beginner';
    }
}
function getLevelIndex(userType, level) {
    const levelMaps = {
        student: ['beginner', 'intermediate', 'advanced', 'expert'],
        instructor: ['junior', 'senior', 'master', 'expert'],
        centerAdmin: ['assistant', 'manager', 'director'],
        superAdmin: ['admin', 'superAdmin', 'systemAdmin']
    };
    const levels = levelMaps[userType] || [];
    return levels.indexOf(level);
}
const requireCenterAdminPermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: '인증이 필요합니다.' });
        }
        if (req.user.userType === 'superAdmin') {
            return next();
        }
        if (req.user.userType !== 'centerAdmin') {
            return res.status(403).json({ error: '센터 관리자 권한이 필요합니다.' });
        }
        if (!req.user.centerAdminInfo?.permissions?.[permission]) {
            return res.status(403).json({ error: '해당 권한이 없습니다.' });
        }
        return next();
    };
};
exports.requireCenterAdminPermission = requireCenterAdminPermission;
const requireSuperAdminPermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: '인증이 필요합니다.' });
        }
        if (req.user.userType === 'superAdmin') {
            return next();
        }
        if (req.user.userType !== 'superAdmin') {
            return res.status(403).json({ error: '총관리자 권한이 필요합니다.' });
        }
        if (!req.user.superAdminInfo?.systemPermissions?.[permission]) {
            return res.status(403).json({ error: '해당 권한이 없습니다.' });
        }
        return next();
    };
};
exports.requireSuperAdminPermission = requireSuperAdminPermission;
const requireInstructorCenterAccess = (centerId) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: '인증이 필요합니다.' });
        }
        if (req.user.userType === 'superAdmin') {
            return next();
        }
        if (req.user.userType !== 'instructor') {
            return res.status(403).json({ error: '강사 권한이 필요합니다.' });
        }
        const assignedCenters = req.user.instructorInfo?.assignedCenters || [];
        if (!assignedCenters.includes(centerId)) {
            return res.status(403).json({ error: '해당 센터에 대한 접근 권한이 없습니다.' });
        }
        return next();
    };
};
exports.requireInstructorCenterAccess = requireInstructorCenterAccess;
const requireCenterAdminCenterAccess = (centerId) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: '인증이 필요합니다.' });
        }
        if (req.user.userType === 'superAdmin') {
            return next();
        }
        if (req.user.userType !== 'centerAdmin') {
            return res.status(403).json({ error: '센터 관리자 권한이 필요합니다.' });
        }
        const managedCenters = req.user.centerAdminInfo?.managedCenters || [];
        if (!managedCenters.includes(centerId)) {
            return res.status(403).json({ error: '해당 센터에 대한 관리 권한이 없습니다.' });
        }
        return next();
    };
};
exports.requireCenterAdminCenterAccess = requireCenterAdminCenterAccess;
//# sourceMappingURL=auth.js.map