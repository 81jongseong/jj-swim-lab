"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearRequestCounts = exports.refreshRateLimitCache = exports.dynamicRateLimitMiddleware = void 0;
const SystemConfig_1 = require("../models/SystemConfig");
const requestCounts = new Map();
let rateLimitCache = {
    maxRequestsPerMinute: 100,
    rateLimitEnabled: true,
    lastChecked: 0
};
const CACHE_DURATION = 60 * 1000;
const dynamicRateLimitMiddleware = async (req, res, next) => {
    try {
        const now = Date.now();
        const clientId = req.ip || 'unknown';
        if (now - rateLimitCache.lastChecked > CACHE_DURATION) {
            const systemConfig = await SystemConfig_1.SystemConfig.findOne({ isActive: true });
            if (systemConfig) {
                rateLimitCache = {
                    maxRequestsPerMinute: systemConfig.security.maxRequestsPerMinute,
                    rateLimitEnabled: systemConfig.security.rateLimitEnabled,
                    lastChecked: now
                };
            }
        }
        if (!rateLimitCache.rateLimitEnabled) {
            return next();
        }
        if (req.user?.userType === 'superAdmin') {
            return next();
        }
        const windowMs = 60 * 1000;
        const maxRequests = rateLimitCache.maxRequestsPerMinute;
        const clientData = requestCounts.get(clientId);
        if (!clientData || now > clientData.resetTime) {
            requestCounts.set(clientId, {
                count: 1,
                resetTime: now + windowMs,
                maxRequests
            });
            next();
        }
        else if (clientData.count >= maxRequests) {
            console.log(`🚨 API 요청 한도 초과: ${clientId} (${clientData.count}/${maxRequests})`);
            res.status(429).json({
                success: false,
                error: 'RATE_LIMIT_EXCEEDED',
                message: `API 요청 한도를 초과했습니다. (${maxRequests}요청/분)`,
                retryAfter: Math.ceil((clientData.resetTime - now) / 1000),
                currentRequests: clientData.count,
                maxRequests
            });
        }
        else {
            clientData.count++;
            next();
        }
    }
    catch (error) {
        console.error('동적 Rate Limit 확인 오류:', error);
        next();
    }
};
exports.dynamicRateLimitMiddleware = dynamicRateLimitMiddleware;
const refreshRateLimitCache = () => {
    rateLimitCache.lastChecked = 0;
};
exports.refreshRateLimitCache = refreshRateLimitCache;
const clearRequestCounts = () => {
    requestCounts.clear();
};
exports.clearRequestCounts = clearRequestCounts;
//# sourceMappingURL=dynamicRateLimit.js.map