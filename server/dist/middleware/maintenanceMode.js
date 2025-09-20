"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshMaintenanceCache = exports.maintenanceModeMiddleware = void 0;
const SystemConfig_1 = require("../models/SystemConfig");
let maintenanceCache = {
    enabled: false,
    message: '',
    lastChecked: 0
};
const CACHE_DURATION = 30 * 1000;
const maintenanceModeMiddleware = async (req, res, next) => {
    try {
        const now = Date.now();
        if (now - maintenanceCache.lastChecked < CACHE_DURATION) {
            if (maintenanceCache.enabled) {
                return handleMaintenanceMode(req, res, maintenanceCache.message);
            }
            return next();
        }
        const systemConfig = await SystemConfig_1.SystemConfig.findOne({ isActive: true });
        if (systemConfig && systemConfig.maintenance.enabled) {
            maintenanceCache = {
                enabled: true,
                message: systemConfig.maintenance.message,
                lastChecked: now
            };
            return handleMaintenanceMode(req, res, systemConfig.maintenance.message);
        }
        else {
            maintenanceCache = {
                enabled: false,
                message: '',
                lastChecked: now
            };
            return next();
        }
    }
    catch (error) {
        console.error('점검 모드 확인 오류:', error);
        return next();
    }
};
exports.maintenanceModeMiddleware = maintenanceModeMiddleware;
function handleMaintenanceMode(req, res, message) {
    if (req.user?.userType === 'superAdmin') {
        return;
    }
    if (req.path.startsWith('/api/system/') || req.path.startsWith('/api/auth/')) {
        return;
    }
    return res.status(503).json({
        success: false,
        error: 'MAINTENANCE_MODE',
        message: message || '시스템 점검 중입니다. 잠시 후 다시 시도해주세요.',
        maintenanceMode: true,
        retryAfter: '1시간 후'
    });
}
const refreshMaintenanceCache = () => {
    maintenanceCache.lastChecked = 0;
};
exports.refreshMaintenanceCache = refreshMaintenanceCache;
//# sourceMappingURL=maintenanceMode.js.map