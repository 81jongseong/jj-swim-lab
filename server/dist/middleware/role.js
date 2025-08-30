"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireCenterAccess = exports.requireAuthenticated = exports.requireInstructorOrAdmin = exports.requireAdmin = exports.requireStudent = exports.requireInstructor = exports.requireCenterAdmin = exports.requireSuperAdmin = exports.requireRole = exports.roleMiddleware = void 0;
const roleMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: '인증이 필요합니다.'
                });
            }
            if (!allowedRoles.includes(req.user.userType)) {
                return res.status(403).json({
                    success: false,
                    message: '이 작업을 수행할 권한이 없습니다.',
                    requiredRoles: allowedRoles,
                    userRole: req.user.userType
                });
            }
            next();
        }
        catch (error) {
            console.error('역할 확인 중 오류 발생:', error);
            return res.status(500).json({
                success: false,
                message: '권한 확인 중 오류가 발생했습니다.'
            });
        }
    };
};
exports.roleMiddleware = roleMiddleware;
const requireRole = (role) => {
    return (0, exports.roleMiddleware)([role]);
};
exports.requireRole = requireRole;
exports.requireSuperAdmin = (0, exports.roleMiddleware)(['superAdmin']);
exports.requireCenterAdmin = (0, exports.roleMiddleware)(['centerAdmin']);
exports.requireInstructor = (0, exports.roleMiddleware)(['instructor']);
exports.requireStudent = (0, exports.roleMiddleware)(['student']);
exports.requireAdmin = (0, exports.roleMiddleware)(['superAdmin', 'centerAdmin']);
exports.requireInstructorOrAdmin = (0, exports.roleMiddleware)(['instructor', 'superAdmin', 'centerAdmin']);
const requireAuthenticated = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: '로그인이 필요합니다.'
        });
    }
    next();
};
exports.requireAuthenticated = requireAuthenticated;
const requireCenterAccess = (centerIdField = 'centerId') => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: '인증이 필요합니다.'
                });
            }
            if (req.user.userType === 'superAdmin') {
                return next();
            }
            const requestedCenterId = req.params[centerIdField] || req.body[centerIdField] || req.query[centerIdField];
            if (!requestedCenterId) {
                return res.status(400).json({
                    success: false,
                    message: '센터 ID가 필요합니다.'
                });
            }
            if (req.user.centerId !== requestedCenterId) {
                return res.status(403).json({
                    success: false,
                    message: '해당 센터에 접근할 권한이 없습니다.'
                });
            }
            next();
        }
        catch (error) {
            console.error('센터 접근 권한 확인 중 오류 발생:', error);
            return res.status(500).json({
                success: false,
                message: '권한 확인 중 오류가 발생했습니다.'
            });
        }
    };
};
exports.requireCenterAccess = requireCenterAccess;
//# sourceMappingURL=role.js.map