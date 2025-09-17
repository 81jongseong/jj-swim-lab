"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorTracking = exports.securityEventTracking = exports.userActivityTracking = exports.apiMonitoring = void 0;
const systemMonitor_1 = __importDefault(require("../monitoring/systemMonitor"));
const apiMonitoring = (req, res, next) => {
    const startTime = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        systemMonitor_1.default.getInstance().recordApiRequest(req, res, duration);
    });
    next();
};
exports.apiMonitoring = apiMonitoring;
const userActivityTracking = (req, res, next) => {
    if (req.user) {
        const userId = req.user.id;
        const action = `${req.method} ${req.url}`;
        const ip = req.ip || req.connection.remoteAddress || 'unknown';
        const importantActions = ['POST', 'PUT', 'DELETE'];
        if (importantActions.includes(req.method)) {
            systemMonitor_1.default.getInstance().recordUserActivity(userId, action, {
                method: req.method,
                url: req.url,
                timestamp: new Date()
            }, ip);
        }
    }
    next();
};
exports.userActivityTracking = userActivityTracking;
const securityEventTracking = (req, res, next) => {
    const originalSend = res.send;
    res.send = function (data) {
        if (res.statusCode === 401 || res.statusCode === 403) {
            const userId = req.user?.id || 'anonymous';
            const ip = req.ip || req.connection.remoteAddress || 'unknown';
            systemMonitor_1.default.getInstance().recordUserActivity(userId, 'SECURITY_EVENT', {
                statusCode: res.statusCode,
                method: req.method,
                url: req.url,
                userAgent: req.get('User-Agent'),
                timestamp: new Date()
            }, ip);
            console.log(`🔒 보안 이벤트: ${req.method} ${req.url} - ${res.statusCode} (${ip})`);
        }
        return originalSend.call(this, data);
    };
    next();
};
exports.securityEventTracking = securityEventTracking;
const errorTracking = (error, req, res, next) => {
    const userId = req.user?.id || 'anonymous';
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    systemMonitor_1.default.getInstance().recordUserActivity(userId, 'ERROR', {
        error: error.message,
        stack: error.stack,
        method: req.method,
        url: req.url,
        timestamp: new Date()
    }, ip);
    console.error(`❌ 에러 발생: ${req.method} ${req.url} - ${error.message}`);
    next(error);
};
exports.errorTracking = errorTracking;
//# sourceMappingURL=monitoring.js.map