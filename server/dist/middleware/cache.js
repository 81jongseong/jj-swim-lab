"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRequestStats = exports.checkCacheHealth = exports.cleanupCache = exports.getCacheStats = exports.invalidatePathCache = exports.invalidateUserCache = exports.invalidateCache = exports.queryCache = exports.userCache = exports.conditionalCache = exports.cache = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const redis = new ioredis_1.default({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    keepAlive: 30000,
    connectTimeout: 10000,
    commandTimeout: 5000,
    keyPrefix: 'jjswim:'
});
const generateCacheKey = (req, options) => {
    const baseKey = options.key || `${req.method}:${req.originalUrl}`;
    const userKey = req.user?._id ? `:user:${req.user._id}` : '';
    const headerKeys = options.varyBy?.map(header => req.headers[header.toLowerCase()] ? `:${header}:${req.headers[header.toLowerCase()]}` : '').join('') || '';
    const queryKeys = Object.keys(req.query).length > 0 ?
        `:query:${JSON.stringify(req.query)}` : '';
    return `${baseKey}${userKey}${headerKeys}${queryKeys}`;
};
const compressResponse = (data) => {
    try {
        const jsonString = JSON.stringify(data);
        return Buffer.from(jsonString);
    }
    catch (error) {
        console.warn('응답 압축 실패:', error);
        return Buffer.from(JSON.stringify(data));
    }
};
const decompressResponse = (compressedData) => {
    try {
        const jsonString = compressedData.toString();
        return JSON.parse(jsonString);
    }
    catch (error) {
        console.warn('응답 압축 해제 실패:', error);
        return null;
    }
};
const getMemoryUsage = () => {
    const usage = process.memoryUsage();
    return {
        rss: Math.round(usage.rss / 1024 / 1024),
        heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
        heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
        external: Math.round(usage.external / 1024 / 1024)
    };
};
let cacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    errors: 0,
    totalRequests: 0
};
const cache = (options = {}) => {
    const { ttl = 300, condition = () => true, compress = false, varyBy = [] } = options;
    return async (req, res, next) => {
        if (!condition(req, res)) {
            return next();
        }
        const cacheKey = generateCacheKey(req, options);
        try {
            const cachedData = await redis.get(cacheKey);
            if (cachedData) {
                cacheStats.hits++;
                const data = compress ? decompressResponse(Buffer.from(cachedData)) : JSON.parse(cachedData);
                res.set({
                    'X-Cache': 'HIT',
                    'X-Cache-Key': cacheKey,
                    'Cache-Control': `public, max-age=${ttl}`,
                    'X-Cache-TTL': ttl.toString()
                });
                return res.json(data);
            }
            cacheStats.misses++;
            const originalSend = res.json;
            res.json = function (data) {
                const dataToCache = compress ? compressResponse(data) : JSON.stringify(data);
                redis.setex(cacheKey, ttl, dataToCache)
                    .then(() => {
                    cacheStats.sets++;
                    console.log(`캐시 저장 완료: ${cacheKey} (TTL: ${ttl}s)`);
                })
                    .catch((error) => {
                    cacheStats.errors++;
                    console.error('캐시 저장 실패:', error);
                });
                res.set({
                    'X-Cache': 'MISS',
                    'X-Cache-Key': cacheKey,
                    'Cache-Control': `public, max-age=${ttl}`,
                    'X-Cache-TTL': ttl.toString()
                });
                return originalSend.call(this, data);
            };
            next();
        }
        catch (error) {
            cacheStats.errors++;
            console.error('캐시 처리 오류:', error);
            next();
        }
    };
};
exports.cache = cache;
const conditionalCache = (options = {}) => {
    return (0, exports.cache)({
        ...options,
        condition: (req) => req.method === 'GET'
    });
};
exports.conditionalCache = conditionalCache;
const userCache = (options = {}) => {
    return (0, exports.cache)({
        ...options,
        condition: (req) => !!req.user?._id
    });
};
exports.userCache = userCache;
const queryCache = (options = {}) => {
    return (0, exports.cache)({
        ...options,
        condition: (req) => Object.keys(req.query).length > 0
    });
};
exports.queryCache = queryCache;
const invalidateCache = async (pattern) => {
    try {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
            await redis.del(...keys);
            console.log(`캐시 무효화 완료: ${keys.length}개 키`);
        }
    }
    catch (error) {
        console.error('캐시 무효화 실패:', error);
    }
};
exports.invalidateCache = invalidateCache;
const invalidateUserCache = async (userId) => {
    await (0, exports.invalidateCache)(`*:user:${userId}*`);
};
exports.invalidateUserCache = invalidateUserCache;
const invalidatePathCache = async (path) => {
    await (0, exports.invalidateCache)(`*${path}*`);
};
exports.invalidatePathCache = invalidatePathCache;
const getCacheStats = () => {
    const hitRate = cacheStats.totalRequests > 0 ?
        (cacheStats.hits / cacheStats.totalRequests * 100).toFixed(2) : '0.00';
    return {
        ...cacheStats,
        hitRate: `${hitRate}%`,
        memoryUsage: getMemoryUsage()
    };
};
exports.getCacheStats = getCacheStats;
const cleanupCache = async () => {
    try {
        console.log('캐시 정리 완료 (Redis 자동 정리)');
    }
    catch (error) {
        console.error('캐시 정리 실패:', error);
    }
};
exports.cleanupCache = cleanupCache;
const checkCacheHealth = async () => {
    try {
        await redis.ping();
        return true;
    }
    catch (error) {
        console.error('Redis 연결 실패:', error);
        return false;
    }
};
exports.checkCacheHealth = checkCacheHealth;
setInterval(exports.cleanupCache, 60 * 60 * 1000);
const updateRequestStats = () => {
    cacheStats.totalRequests++;
};
exports.updateRequestStats = updateRequestStats;
exports.default = exports.cache;
//# sourceMappingURL=cache.js.map