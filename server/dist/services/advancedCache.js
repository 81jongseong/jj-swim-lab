"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheScheduler = exports.CacheMonitor = exports.CacheTagManager = exports.cacheMiddleware = exports.CacheInvalidate = exports.Cacheable = exports.cacheService = exports.AdvancedCacheService = void 0;
class AdvancedCacheService {
    constructor() {
        this.cache = new Map();
        this.tags = new Map();
        this.version = '1.0.0';
    }
    set(key, data, options = {}) {
        const entry = {
            data,
            timestamp: Date.now(),
            ttl: options.ttl || 300000,
            tags: options.tags || [],
            version: options.version || this.version
        };
        this.cache.set(key, entry);
        entry.tags.forEach(tag => {
            if (!this.tags.has(tag)) {
                this.tags.set(tag, new Set());
            }
            this.tags.get(tag).add(key);
        });
    }
    get(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return null;
        if (Date.now() - entry.timestamp > entry.ttl) {
            this.delete(key);
            return null;
        }
        return entry.data;
    }
    has(key) {
        return this.get(key) !== null;
    }
    delete(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return false;
        entry.tags.forEach(tag => {
            const tagSet = this.tags.get(tag);
            if (tagSet) {
                tagSet.delete(key);
                if (tagSet.size === 0) {
                    this.tags.delete(tag);
                }
            }
        });
        return this.cache.delete(key);
    }
    deleteByTag(tag) {
        const keys = this.tags.get(tag);
        if (!keys)
            return 0;
        let deletedCount = 0;
        keys.forEach(key => {
            if (this.delete(key)) {
                deletedCount++;
            }
        });
        return deletedCount;
    }
    clear() {
        this.cache.clear();
        this.tags.clear();
    }
    getStats() {
        let memoryUsage = 0;
        this.cache.forEach(entry => {
            memoryUsage += JSON.stringify(entry).length;
        });
        return {
            size: this.cache.size,
            memoryUsage,
            tagCount: this.tags.size,
            hitRate: 0
        };
    }
    findKeys(pattern) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return Array.from(this.cache.keys()).filter(key => regex.test(key));
    }
    cleanup() {
        const now = Date.now();
        let cleanedCount = 0;
        this.cache.forEach((entry, key) => {
            if (now - entry.timestamp > entry.ttl) {
                this.delete(key);
                cleanedCount++;
            }
        });
        return cleanedCount;
    }
    backup() {
        const backup = {
            version: this.version,
            timestamp: Date.now(),
            entries: Array.from(this.cache.entries()),
            tags: Array.from(this.tags.entries())
        };
        return JSON.stringify(backup);
    }
    restore(backupData) {
        try {
            const backup = JSON.parse(backupData);
            this.clear();
            this.version = backup.version;
            backup.entries.forEach(([key, entry]) => {
                this.cache.set(key, entry);
            });
            backup.tags.forEach(([tag, keys]) => {
                this.tags.set(tag, new Set(keys));
            });
            return true;
        }
        catch (error) {
            console.error('Cache restore failed:', error);
            return false;
        }
    }
}
exports.AdvancedCacheService = AdvancedCacheService;
exports.cacheService = new AdvancedCacheService();
function Cacheable(options = {}) {
    return function (target, propertyName, descriptor) {
        const method = descriptor.value;
        descriptor.value = async function (...args) {
            const cacheKey = `${target.constructor.name}.${propertyName}.${JSON.stringify(args)}`;
            const cached = exports.cacheService.get(cacheKey);
            if (cached !== null) {
                return cached;
            }
            const result = await method.apply(this, args);
            exports.cacheService.set(cacheKey, result, options);
            return result;
        };
        return descriptor;
    };
}
exports.Cacheable = Cacheable;
function CacheInvalidate(tags) {
    return function (target, propertyName, descriptor) {
        const method = descriptor.value;
        descriptor.value = async function (...args) {
            const result = await method.apply(this, args);
            tags.forEach(tag => {
                exports.cacheService.deleteByTag(tag);
            });
            return result;
        };
        return descriptor;
    };
}
exports.CacheInvalidate = CacheInvalidate;
function cacheMiddleware(options = {}) {
    return (req, res, next) => {
        const cacheKey = `req:${req.method}:${req.originalUrl}:${JSON.stringify(req.query)}`;
        const cached = exports.cacheService.get(cacheKey);
        if (cached !== null) {
            return res.json(cached);
        }
        const originalJson = res.json;
        res.json = function (data) {
            exports.cacheService.set(cacheKey, data, options);
            return originalJson.call(this, data);
        };
        next();
    };
}
exports.cacheMiddleware = cacheMiddleware;
class CacheTagManager {
    constructor() {
        this.tagHierarchy = new Map();
    }
    static getInstance() {
        if (!CacheTagManager.instance) {
            CacheTagManager.instance = new CacheTagManager();
        }
        return CacheTagManager.instance;
    }
    setHierarchy(parentTag, childTags) {
        this.tagHierarchy.set(parentTag, childTags);
    }
    invalidateTag(tag) {
        let invalidatedCount = 0;
        invalidatedCount += exports.cacheService.deleteByTag(tag);
        const childTags = this.tagHierarchy.get(tag);
        if (childTags) {
            childTags.forEach(childTag => {
                invalidatedCount += this.invalidateTag(childTag);
            });
        }
        return invalidatedCount;
    }
    invalidateAll() {
        let invalidatedCount = 0;
        this.tagHierarchy.forEach((childTags, parentTag) => {
            invalidatedCount += this.invalidateTag(parentTag);
        });
        return invalidatedCount;
    }
}
exports.CacheTagManager = CacheTagManager;
class CacheMonitor {
    constructor() {
        this.metrics = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0,
            cleanups: 0
        };
    }
    static getInstance() {
        if (!CacheMonitor.instance) {
            CacheMonitor.instance = new CacheMonitor();
        }
        return CacheMonitor.instance;
    }
    recordHit() {
        this.metrics.hits++;
    }
    recordMiss() {
        this.metrics.misses++;
    }
    recordSet() {
        this.metrics.sets++;
    }
    recordDelete() {
        this.metrics.deletes++;
    }
    recordCleanup() {
        this.metrics.cleanups++;
    }
    getMetrics() {
        const total = this.metrics.hits + this.metrics.misses;
        const hitRate = total > 0 ? this.metrics.hits / total : 0;
        return {
            ...this.metrics,
            hitRate
        };
    }
    resetMetrics() {
        this.metrics = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0,
            cleanups: 0
        };
    }
}
exports.CacheMonitor = CacheMonitor;
class CacheScheduler {
    constructor() {
        this.intervalId = null;
    }
    static getInstance() {
        if (!CacheScheduler.instance) {
            CacheScheduler.instance = new CacheScheduler();
        }
        return CacheScheduler.instance;
    }
    start(intervalMs = 300000) {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        this.intervalId = setInterval(() => {
            const cleanedCount = exports.cacheService.cleanup();
            if (cleanedCount > 0) {
                console.log(`Cache cleanup: ${cleanedCount} entries removed`);
            }
        }, intervalMs);
    }
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
}
exports.CacheScheduler = CacheScheduler;
exports.default = {
    AdvancedCacheService,
    cacheService: exports.cacheService,
    Cacheable,
    CacheInvalidate,
    cacheMiddleware,
    CacheTagManager,
    CacheMonitor,
    CacheScheduler
};
//# sourceMappingURL=advancedCache.js.map