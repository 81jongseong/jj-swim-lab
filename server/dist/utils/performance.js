"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optimizeQuery = exports.optimizeConnectionPool = exports.suggestIndexes = exports.memoize = exports.batchProcess = exports.responseTimeMiddleware = exports.getCpuUsage = exports.getMemoryUsage = exports.measureDatabaseQuery = exports.measurePerformance = void 0;
const logger_1 = require("./logger");
const measurePerformance = (operation) => {
    return function (target, propertyName, descriptor) {
        const method = descriptor.value;
        descriptor.value = async function (...args) {
            const start = Date.now();
            try {
                const result = await method.apply(this, args);
                const duration = Date.now() - start;
                (0, logger_1.logPerformance)(`${operation} - ${propertyName}`, { method: propertyName, duration });
                return result;
            }
            catch (error) {
                const duration = Date.now() - start;
                (0, logger_1.logPerformance)(`${operation} - ${propertyName} (ERROR)`, {
                    method: propertyName,
                    error: error.message,
                    duration
                });
                throw error;
            }
        };
    };
};
exports.measurePerformance = measurePerformance;
const measureDatabaseQuery = (collection) => {
    return function (target, propertyName, descriptor) {
        const method = descriptor.value;
        descriptor.value = async function (...args) {
            const start = Date.now();
            try {
                const result = await method.apply(this, args);
                const duration = Date.now() - start;
                (0, logger_1.logDatabase)(`Database Query: ${collection}.${propertyName}`, {
                    method: propertyName,
                    resultCount: Array.isArray(result) ? result.length : 1,
                    duration
                });
                return result;
            }
            catch (error) {
                const duration = Date.now() - start;
                (0, logger_1.logDatabase)(`Database Error: ${collection}.${propertyName}`, {
                    method: propertyName,
                    error: error.message,
                    duration
                });
                throw error;
            }
        };
    };
};
exports.measureDatabaseQuery = measureDatabaseQuery;
const getMemoryUsage = () => {
    const usage = process.memoryUsage();
    return {
        rss: Math.round(usage.rss / 1024 / 1024),
        heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
        heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
        external: Math.round(usage.external / 1024 / 1024),
        arrayBuffers: Math.round(usage.arrayBuffers / 1024 / 1024)
    };
};
exports.getMemoryUsage = getMemoryUsage;
const getCpuUsage = () => {
    const startUsage = process.cpuUsage();
    return {
        user: startUsage.user,
        system: startUsage.system
    };
};
exports.getCpuUsage = getCpuUsage;
const responseTimeMiddleware = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        (0, logger_1.logPerformance)(`API Response: ${req.method} ${req.originalUrl}`, {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            duration
        });
    });
    next();
};
exports.responseTimeMiddleware = responseTimeMiddleware;
const batchProcess = async (items, processor, batchSize = 100) => {
    const results = [];
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchResults = await Promise.all(batch.map(item => processor(item)));
        results.push(...batchResults);
        if (i + batchSize < items.length) {
            await new Promise(resolve => setTimeout(resolve, 10));
        }
    }
    return results;
};
exports.batchProcess = batchProcess;
const memoize = (fn, ttl = 300000) => {
    const cache = new Map();
    return ((...args) => {
        const key = JSON.stringify(args);
        const now = Date.now();
        const cached = cache.get(key);
        if (cached && now - cached.timestamp < ttl) {
            return cached.value;
        }
        const result = fn(...args);
        cache.set(key, { value: result, timestamp: now });
        return result;
    });
};
exports.memoize = memoize;
const suggestIndexes = (queries) => {
    const suggestions = [];
    queries.forEach(({ collection, query, frequency }) => {
        const fields = Object.keys(query);
        if (fields.length > 0 && frequency > 10) {
            suggestions.push({
                collection,
                fields,
                frequency,
                priority: frequency > 100 ? 'high' : frequency > 50 ? 'medium' : 'low'
            });
        }
    });
    return suggestions.sort((a, b) => b.frequency - a.frequency);
};
exports.suggestIndexes = suggestIndexes;
const optimizeConnectionPool = (poolSize = 10) => {
    return {
        maxPoolSize: poolSize,
        minPoolSize: Math.floor(poolSize / 2),
        maxIdleTimeMS: 30000,
        waitQueueTimeoutMS: 10000,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        heartbeatFrequencyMS: 10000
    };
};
exports.optimizeConnectionPool = optimizeConnectionPool;
const optimizeQuery = (query) => {
    const optimized = { ...query };
    if (optimized.select && Object.keys(optimized.select).length === 0) {
        delete optimized.select;
    }
    if (optimized.sort && Object.keys(optimized.sort).length === 0) {
        delete optimized.sort;
    }
    if (optimized.limit && optimized.limit > 1000) {
        optimized.limit = 1000;
    }
    return optimized;
};
exports.optimizeQuery = optimizeQuery;
//# sourceMappingURL=performance.js.map