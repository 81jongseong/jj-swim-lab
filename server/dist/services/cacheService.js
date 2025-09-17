"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheType = void 0;
var CacheType;
(function (CacheType) {
    CacheType["MEMORY"] = "memory";
    CacheType["REDIS"] = "redis";
    CacheType["QUERY"] = "query";
})(CacheType || (exports.CacheType = CacheType = {}));
class CacheService {
    constructor() {
        this.memoryCache = new Map();
        this.queryCache = new Map();
        this.cacheStats = new Map();
        this.setupCacheEventListeners();
    }
    static getInstance() {
        if (!CacheService.instance) {
            CacheService.instance = new CacheService();
        }
        return CacheService.instance;
    }
    setupCacheEventListeners() {
    }
    updateStats(key, operation) {
        const stats = this.cacheStats.get(key) || { hits: 0, misses: 0, sets: 0 };
        stats[operation]++;
        this.cacheStats.set(key, stats);
    }
    set(key, value, ttl) {
        try {
            const ttlMs = (ttl || 300) * 1000;
            this.memoryCache.set(key, {
                value,
                ttl: ttlMs,
                timestamp: Date.now()
            });
            this.updateStats(key, 'sets');
            console.log(`💾 캐시 저장: ${key} (TTL: ${ttl || 'default'}초)`);
            return true;
        }
        catch (error) {
            console.error(`❌ 캐시 저장 실패: ${key}`, error);
            return false;
        }
    }
    get(key) {
        try {
            const cached = this.memoryCache.get(key);
            if (cached) {
                const now = Date.now();
                if (now - cached.timestamp < cached.ttl) {
                    this.updateStats(key, 'hits');
                    console.log(`✅ 캐시 히트: ${key}`);
                    return cached.value;
                }
                else {
                    this.memoryCache.delete(key);
                }
            }
            this.updateStats(key, 'misses');
            console.log(`❌ 캐시 미스: ${key}`);
            return undefined;
        }
        catch (error) {
            console.error(`❌ 캐시 조회 실패: ${key}`, error);
            return undefined;
        }
    }
    delete(key) {
        try {
            const success = this.memoryCache.delete(key);
            if (success) {
                console.log(`🗑️ 캐시 삭제: ${key}`);
            }
            return success;
        }
        catch (error) {
            console.error(`❌ 캐시 삭제 실패: ${key}`, error);
            return false;
        }
    }
    has(key) {
        const cached = this.memoryCache.get(key);
        if (cached) {
            const now = Date.now();
            if (now - cached.timestamp < cached.ttl) {
                return true;
            }
            else {
                this.memoryCache.delete(key);
            }
        }
        return false;
    }
    clear() {
        this.memoryCache.clear();
        this.queryCache.clear();
        console.log('🗑️ 모든 캐시가 삭제되었습니다.');
    }
    async cacheQuery(key, queryFn, ttl = 300) {
        const cached = this.queryCache.get(key);
        if (cached && this.isCacheValid(cached)) {
            cached.hits++;
            console.log(`✅ 쿼리 캐시 히트: ${key}`);
            return cached.value;
        }
        console.log(`🔄 쿼리 실행: ${key}`);
        const result = await queryFn();
        this.queryCache.set(key, {
            key,
            value: result,
            timestamp: Date.now(),
            ttl: ttl * 1000,
            hits: 0,
            type: CacheType.QUERY
        });
        console.log(`💾 쿼리 결과 캐시 저장: ${key}`);
        return result;
    }
    isCacheValid(item) {
        const now = Date.now();
        return (now - item.timestamp) < item.ttl;
    }
    wrapModel(model, cacheKey, ttl = 300) {
        console.log(`📝 모델 캐싱 설정: ${cacheKey} (TTL: ${ttl}초)`);
        return model;
    }
    invalidatePattern(pattern) {
        const keys = Array.from(this.memoryCache.keys());
        const matchingKeys = keys.filter(key => key.includes(pattern));
        let deletedCount = 0;
        matchingKeys.forEach(key => {
            if (this.memoryCache.delete(key)) {
                deletedCount++;
            }
        });
        for (const [key, item] of this.queryCache.entries()) {
            if (key.includes(pattern)) {
                this.queryCache.delete(key);
                deletedCount++;
            }
        }
        console.log(`🗑️ 패턴 캐시 무효화: ${pattern} (${deletedCount}개 항목 삭제)`);
        return deletedCount;
    }
    getCacheStats() {
        const memoryKeys = this.memoryCache.size;
        const queryCacheSize = this.queryCache.size;
        let totalHits = 0;
        let totalMisses = 0;
        let totalSets = 0;
        this.cacheStats.forEach(stats => {
            totalHits += stats.hits;
            totalMisses += stats.misses;
            totalSets += stats.sets;
        });
        const hitRate = totalHits + totalMisses > 0 ?
            (totalHits / (totalHits + totalMisses)) * 100 : 0;
        return {
            memory: {
                keys: memoryKeys,
                hits: totalHits,
                misses: totalMisses,
                ksize: 0,
                vsize: 0
            },
            query: {
                size: queryCacheSize,
                items: Array.from(this.queryCache.entries()).map(([key, item]) => ({
                    key,
                    hits: item.hits,
                    age: Date.now() - item.timestamp,
                    ttl: item.ttl
                }))
            },
            overall: {
                totalHits,
                totalMisses,
                totalSets,
                hitRate: Math.round(hitRate * 100) / 100
            }
        };
    }
    generateCacheReport() {
        const stats = this.getCacheStats();
        const recommendations = [];
        if (stats.overall.hitRate < 50) {
            recommendations.push('캐시 히트율이 낮습니다. 캐시 키 전략을 재검토해보세요.');
        }
        if (stats.query.size > 100) {
            recommendations.push('쿼리 캐시 항목이 많습니다. TTL을 줄이거나 불필요한 캐시를 정리해보세요.');
        }
        return {
            timestamp: new Date(),
            stats,
            recommendations,
            summary: {
                memoryKeys: stats.memory.keys,
                queryCacheSize: stats.query.size,
                hitRate: stats.overall.hitRate,
                totalOperations: stats.overall.totalHits + stats.overall.totalMisses
            }
        };
    }
    cleanup() {
        const now = Date.now();
        let cleanedCount = 0;
        for (const [key, item] of this.queryCache.entries()) {
            if (!this.isCacheValid(item)) {
                this.queryCache.delete(key);
                cleanedCount++;
            }
        }
        console.log(`🧹 캐시 정리 완료: ${cleanedCount}개 만료된 항목 제거`);
    }
    async warmup(warmupFunctions) {
        console.log('🔥 캐시 워밍업 시작...');
        const promises = warmupFunctions.map(async (fn) => {
            try {
                const { key, value, ttl } = await fn();
                this.set(key, value, ttl);
            }
            catch (error) {
                console.error('워밍업 실패:', error);
            }
        });
        await Promise.all(promises);
        console.log('✅ 캐시 워밍업 완료');
    }
}
exports.default = CacheService;
//# sourceMappingURL=cacheService.js.map