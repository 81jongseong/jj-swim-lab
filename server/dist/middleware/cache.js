"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidateCache = exports.cacheMiddleware = exports.cache = void 0;
const redis_1 = require("../config/redis");
const defaultKeyGenerator = (req) => {
    const { method, originalUrl, query, body } = req;
    const key = `${method}:${originalUrl}:${JSON.stringify(query)}:${JSON.stringify(body)}`;
    return Buffer.from(key).toString('base64');
};
const cache = (options = {}) => {
    const { ttl = 3600, keyGenerator = defaultKeyGenerator, skipCache = () => false } = options;
    return async (req, res, next) => {
        try {
            if (skipCache(req)) {
                return next();
            }
            const cacheKey = `cache:${keyGenerator(req)}`;
            const cachedData = await redis_1.redisUtils.getCache(cacheKey);
            if (cachedData) {
                console.log(`✅ 캐시 히트: ${cacheKey}`);
                return res.json(cachedData);
            }
            const originalJson = res.json;
            res.json = function (data) {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    redis_1.redisUtils.setCache(cacheKey, data, ttl).catch(error => {
                        console.error('캐시 설정 오류:', error);
                    });
                }
                return originalJson.call(this, data);
            };
            next();
        }
        catch (error) {
            console.error('캐시 미들웨어 오류:', error);
            next();
        }
    };
};
exports.cache = cache;
exports.cacheMiddleware = {
    userList: (0, exports.cache)({
        ttl: 300,
        keyGenerator: (req) => `users:${req.query.userType || 'all'}:${req.query.page || 1}`
    }),
    instructorList: (0, exports.cache)({
        ttl: 600,
        keyGenerator: (req) => `instructors:${req.query.centerId || 'all'}:${req.query.page || 1}`
    }),
    centerInfo: (0, exports.cache)({
        ttl: 1800,
        keyGenerator: (req) => `center:${req.params.id || req.query.centerId}`
    }),
    aiAnalysis: (0, exports.cache)({
        ttl: 3600,
        keyGenerator: (req) => `ai:${req.params.studentId}:${req.query.technique || 'all'}`
    }),
    video3DAnalysis: (0, exports.cache)({
        ttl: 7200,
        keyGenerator: (req) => `3d:${req.params.analysisId || req.query.studentId}`
    }),
    dashboard: (0, exports.cache)({
        ttl: 300,
        keyGenerator: (req) => `dashboard:${req.params.centerId || req.user?._id}`
    }),
    statistics: (0, exports.cache)({
        ttl: 900,
        keyGenerator: (req) => `stats:${req.query.period || 'month'}:${req.query.centerId || 'all'}`
    })
};
exports.invalidateCache = {
    user: async (userId) => {
        await redis_1.redisUtils.deleteCachePattern(`*users*`);
        await redis_1.redisUtils.deleteCachePattern(`*user:${userId}*`);
    },
    instructor: async (instructorId) => {
        await redis_1.redisUtils.deleteCachePattern(`*instructors*`);
        await redis_1.redisUtils.deleteCachePattern(`*instructor:${instructorId}*`);
    },
    center: async (centerId) => {
        await redis_1.redisUtils.deleteCachePattern(`*center:${centerId}*`);
        await redis_1.redisUtils.deleteCachePattern(`*dashboard:${centerId}*`);
    },
    aiAnalysis: async (studentId) => {
        await redis_1.redisUtils.deleteCachePattern(`*ai:${studentId}*`);
    },
    video3DAnalysis: async (analysisId) => {
        await redis_1.redisUtils.deleteCachePattern(`*3d:${analysisId}*`);
    },
    all: async () => {
        await redis_1.redisUtils.deleteCachePattern(`cache:*`);
    }
};
//# sourceMappingURL=cache.js.map