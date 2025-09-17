import { CacheEntry, CacheOptions } from '../utils/advancedTypes';

// 고급 캐시 서비스
export class AdvancedCacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private tags = new Map<string, Set<string>>();
  private version = '1.0.0';

  // 캐시 설정
  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: options.ttl || 300000, // 5분 기본값
      tags: options.tags || [],
      version: options.version || this.version
    };

    this.cache.set(key, entry);

    // 태그 인덱싱
    entry.tags.forEach(tag => {
      if (!this.tags.has(tag)) {
        this.tags.set(tag, new Set());
      }
      this.tags.get(tag)!.add(key);
    });
  }

  // 캐시 조회
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // TTL 검사
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.delete(key);
      return null;
    }

    return entry.data;
  }

  // 캐시 존재 여부 확인
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  // 캐시 삭제
  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // 태그에서 제거
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

  // 태그별 캐시 삭제
  deleteByTag(tag: string): number {
    const keys = this.tags.get(tag);
    if (!keys) return 0;

    let deletedCount = 0;
    keys.forEach(key => {
      if (this.delete(key)) {
        deletedCount++;
      }
    });

    return deletedCount;
  }

  // 모든 캐시 삭제
  clear(): void {
    this.cache.clear();
    this.tags.clear();
  }

  // 캐시 통계
  getStats(): {
    size: number;
    memoryUsage: number;
    tagCount: number;
    hitRate: number;
  } {
    let memoryUsage = 0;
    this.cache.forEach(entry => {
      memoryUsage += JSON.stringify(entry).length;
    });

    return {
      size: this.cache.size,
      memoryUsage,
      tagCount: this.tags.size,
      hitRate: 0 // TODO: 히트율 계산 로직 추가
    };
  }

  // 캐시 키 패턴 검색
  findKeys(pattern: string): string[] {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return Array.from(this.cache.keys()).filter(key => regex.test(key));
  }

  // 캐시 만료 정리
  cleanup(): number {
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

  // 캐시 백업
  backup(): string {
    const backup = {
      version: this.version,
      timestamp: Date.now(),
      entries: Array.from(this.cache.entries()),
      tags: Array.from(this.tags.entries())
    };

    return JSON.stringify(backup);
  }

  // 캐시 복원
  restore(backupData: string): boolean {
    try {
      const backup = JSON.parse(backupData);
      
      this.clear();
      this.version = backup.version;

      // 엔트리 복원
      backup.entries.forEach(([key, entry]: [string, CacheEntry<any>]) => {
        this.cache.set(key, entry);
      });

      // 태그 복원
      backup.tags.forEach(([tag, keys]: [string, Set<string>]) => {
        this.tags.set(tag, new Set(keys));
      });

      return true;
    } catch (error) {
      console.error('Cache restore failed:', error);
      return false;
    }
  }
}

// 전역 캐시 인스턴스
export const cacheService = new AdvancedCacheService();

// 캐시 데코레이터
export function Cacheable(options: CacheOptions = {}) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${target.constructor.name}.${propertyName}.${JSON.stringify(args)}`;
      
      // 캐시에서 조회
      const cached = cacheService.get(cacheKey);
      if (cached !== null) {
        return cached;
      }

      // 메서드 실행
      const result = await method.apply(this, args);
      
      // 결과 캐시
      cacheService.set(cacheKey, result, options);
      
      return result;
    };

    return descriptor;
  };
}

// 캐시 무효화 데코레이터
export function CacheInvalidate(tags: string[]) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await method.apply(this, args);
      
      // 태그별 캐시 무효화
      tags.forEach(tag => {
        cacheService.deleteByTag(tag);
      });
      
      return result;
    };

    return descriptor;
  };
}

// 캐시 미들웨어
export function cacheMiddleware(options: CacheOptions = {}) {
  return (req: any, res: any, next: any) => {
    const cacheKey = `req:${req.method}:${req.originalUrl}:${JSON.stringify(req.query)}`;
    
    // 캐시에서 조회
    const cached = cacheService.get(cacheKey);
    if (cached !== null) {
      return res.json(cached);
    }

    // 원본 응답 함수 저장
    const originalJson = res.json;
    
    // 응답 인터셉트
    res.json = function (data: any) {
      // 캐시에 저장
      cacheService.set(cacheKey, data, options);
      
      // 원본 응답 함수 호출
      return originalJson.call(this, data);
    };

    next();
  };
}

// 캐시 태그 관리
export class CacheTagManager {
  private static instance: CacheTagManager;
  private tagHierarchy = new Map<string, string[]>();

  static getInstance(): CacheTagManager {
    if (!CacheTagManager.instance) {
      CacheTagManager.instance = new CacheTagManager();
    }
    return CacheTagManager.instance;
  }

  // 태그 계층 설정
  setHierarchy(parentTag: string, childTags: string[]): void {
    this.tagHierarchy.set(parentTag, childTags);
  }

  // 태그 무효화 (계층 포함)
  invalidateTag(tag: string): number {
    let invalidatedCount = 0;
    
    // 직접 태그 무효화
    invalidatedCount += cacheService.deleteByTag(tag);
    
    // 하위 태그 무효화
    const childTags = this.tagHierarchy.get(tag);
    if (childTags) {
      childTags.forEach(childTag => {
        invalidatedCount += this.invalidateTag(childTag);
      });
    }
    
    return invalidatedCount;
  }

  // 모든 태그 무효화
  invalidateAll(): number {
    let invalidatedCount = 0;
    
    this.tagHierarchy.forEach((childTags, parentTag) => {
      invalidatedCount += this.invalidateTag(parentTag);
    });
    
    return invalidatedCount;
  }
}

// 캐시 모니터링
export class CacheMonitor {
  private static instance: CacheMonitor;
  private metrics = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    cleanups: 0
  };

  static getInstance(): CacheMonitor {
    if (!CacheMonitor.instance) {
      CacheMonitor.instance = new CacheMonitor();
    }
    return CacheMonitor.instance;
  }

  // 메트릭 기록
  recordHit(): void {
    this.metrics.hits++;
  }

  recordMiss(): void {
    this.metrics.misses++;
  }

  recordSet(): void {
    this.metrics.sets++;
  }

  recordDelete(): void {
    this.metrics.deletes++;
  }

  recordCleanup(): void {
    this.metrics.cleanups++;
  }

  // 메트릭 조회
  getMetrics(): typeof this.metrics & { hitRate: number } {
    const total = this.metrics.hits + this.metrics.misses;
    const hitRate = total > 0 ? this.metrics.hits / total : 0;
    
    return {
      ...this.metrics,
      hitRate
    };
  }

  // 메트릭 초기화
  resetMetrics(): void {
    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      cleanups: 0
    };
  }
}

// 캐시 정리 스케줄러
export class CacheScheduler {
  private static instance: CacheScheduler;
  private intervalId: NodeJS.Timeout | null = null;

  static getInstance(): CacheScheduler {
    if (!CacheScheduler.instance) {
      CacheScheduler.instance = new CacheScheduler();
    }
    return CacheScheduler.instance;
  }

  // 정리 스케줄 시작
  start(intervalMs: number = 300000): void { // 5분 기본값
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.intervalId = setInterval(() => {
      const cleanedCount = cacheService.cleanup();
      if (cleanedCount > 0) {
        console.log(`Cache cleanup: ${cleanedCount} entries removed`);
      }
    }, intervalMs);
  }

  // 정리 스케줄 중지
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export default {
  AdvancedCacheService,
  cacheService,
  Cacheable,
  CacheInvalidate,
  cacheMiddleware,
  CacheTagManager,
  CacheMonitor,
  CacheScheduler
};
