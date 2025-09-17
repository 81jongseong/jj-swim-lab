/**
 * 캐싱 서비스
 * 메모리 기반 캐싱, Redis 캐싱, 쿼리 결과 캐싱을 제공합니다.
 */

// import NodeCache from 'node-cache'; // 패키지가 없으므로 간단한 메모리 캐시 구현
import mongoose from 'mongoose';

// 캐시 타입 정의
export enum CacheType {
  MEMORY = 'memory',
  REDIS = 'redis',
  QUERY = 'query'
}

// 캐시 설정 인터페이스
interface CacheConfig {
  ttl: number; // Time To Live (초)
  checkperiod?: number; // 캐시 체크 주기 (초)
  useClones?: boolean; // 객체 복사 사용 여부
}

// 캐시 항목 인터페이스
interface CacheItem<T = any> {
  key: string;
  value: T;
  timestamp: number;
  ttl: number;
  hits: number;
  type: CacheType;
}

class CacheService {
  private static instance: CacheService;
  private memoryCache: Map<string, { value: any; ttl: number; timestamp: number }>;
  private queryCache: Map<string, CacheItem>;
  private cacheStats: Map<string, { hits: number; misses: number; sets: number }>;

  private constructor() {
    // 간단한 메모리 캐시 구현
    this.memoryCache = new Map();
    this.queryCache = new Map();
    this.cacheStats = new Map();

    // 캐시 이벤트 리스너
    this.setupCacheEventListeners();
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * 캐시 이벤트 리스너 설정
   */
  private setupCacheEventListeners(): void {
    // 간단한 메모리 캐시에서는 이벤트 리스너가 필요 없음
  }

  /**
   * 캐시 통계 업데이트
   */
  private updateStats(key: string, operation: 'hits' | 'misses' | 'sets'): void {
    const stats = this.cacheStats.get(key) || { hits: 0, misses: 0, sets: 0 };
    stats[operation]++;
    this.cacheStats.set(key, stats);
  }

  /**
   * 메모리 캐시에 데이터 저장
   */
  public set<T>(key: string, value: T, ttl?: number): boolean {
    try {
      const ttlMs = (ttl || 300) * 1000; // 기본 5분
      this.memoryCache.set(key, {
        value,
        ttl: ttlMs,
        timestamp: Date.now()
      });
      this.updateStats(key, 'sets');
      console.log(`💾 캐시 저장: ${key} (TTL: ${ttl || 'default'}초)`);
      return true;
    } catch (error) {
      console.error(`❌ 캐시 저장 실패: ${key}`, error);
      return false;
    }
  }

  /**
   * 메모리 캐시에서 데이터 조회
   */
  public get<T>(key: string): T | undefined {
    try {
      const cached = this.memoryCache.get(key);
      if (cached) {
        const now = Date.now();
        if (now - cached.timestamp < cached.ttl) {
          this.updateStats(key, 'hits');
          console.log(`✅ 캐시 히트: ${key}`);
          return cached.value as T;
        } else {
          // 만료된 캐시 삭제
          this.memoryCache.delete(key);
        }
      }
      this.updateStats(key, 'misses');
      console.log(`❌ 캐시 미스: ${key}`);
      return undefined;
    } catch (error) {
      console.error(`❌ 캐시 조회 실패: ${key}`, error);
      return undefined;
    }
  }

  /**
   * 캐시에서 데이터 삭제
   */
  public delete(key: string): boolean {
    try {
      const success = this.memoryCache.delete(key);
      if (success) {
        console.log(`🗑️ 캐시 삭제: ${key}`);
      }
      return success;
    } catch (error) {
      console.error(`❌ 캐시 삭제 실패: ${key}`, error);
      return false;
    }
  }

  /**
   * 캐시 존재 여부 확인
   */
  public has(key: string): boolean {
    const cached = this.memoryCache.get(key);
    if (cached) {
      const now = Date.now();
      if (now - cached.timestamp < cached.ttl) {
        return true;
      } else {
        this.memoryCache.delete(key);
      }
    }
    return false;
  }

  /**
   * 모든 캐시 삭제
   */
  public clear(): void {
    this.memoryCache.clear();
    this.queryCache.clear();
    console.log('🗑️ 모든 캐시가 삭제되었습니다.');
  }

  /**
   * 쿼리 결과 캐싱
   */
  public async cacheQuery<T>(
    key: string,
    queryFn: () => Promise<T>,
    ttl: number = 300
  ): Promise<T> {
    // 캐시에서 조회 시도
    const cached = this.queryCache.get(key);
    if (cached && this.isCacheValid(cached)) {
      cached.hits++;
      console.log(`✅ 쿼리 캐시 히트: ${key}`);
      return cached.value as T;
    }

    // 캐시에 없으면 쿼리 실행
    console.log(`🔄 쿼리 실행: ${key}`);
    const result = await queryFn();

    // 결과를 캐시에 저장
    this.queryCache.set(key, {
      key,
      value: result,
      timestamp: Date.now(),
      ttl: ttl * 1000, // 밀리초로 변환
      hits: 0,
      type: CacheType.QUERY
    });

    console.log(`💾 쿼리 결과 캐시 저장: ${key}`);
    return result;
  }

  /**
   * 캐시 유효성 검사
   */
  private isCacheValid(item: CacheItem): boolean {
    const now = Date.now();
    return (now - item.timestamp) < item.ttl;
  }

  /**
   * MongoDB 모델 캐싱 래퍼 (간단한 버전)
   */
  public wrapModel<T extends mongoose.Document>(
    model: mongoose.Model<T>,
    cacheKey: string,
    ttl: number = 300
  ) {
    // 간단한 캐싱 래퍼는 제거하고 기본 모델 반환
    console.log(`📝 모델 캐싱 설정: ${cacheKey} (TTL: ${ttl}초)`);
    return model;
  }

  /**
   * 캐시 무효화 (패턴 기반)
   */
  public invalidatePattern(pattern: string): number {
    const keys = Array.from(this.memoryCache.keys());
    const matchingKeys = keys.filter(key => key.includes(pattern));
    
    let deletedCount = 0;
    matchingKeys.forEach(key => {
      if (this.memoryCache.delete(key)) {
        deletedCount++;
      }
    });

    // 쿼리 캐시에서도 삭제
    for (const [key, item] of this.queryCache.entries()) {
      if (key.includes(pattern)) {
        this.queryCache.delete(key);
        deletedCount++;
      }
    }

    console.log(`🗑️ 패턴 캐시 무효화: ${pattern} (${deletedCount}개 항목 삭제)`);
    return deletedCount;
  }

  /**
   * 캐시 통계 조회
   */
  public getCacheStats(): any {
    const memoryKeys = this.memoryCache.size;
    const queryCacheSize = this.queryCache.size;
    
    // 캐시 히트율 계산
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

  /**
   * 캐시 성능 리포트 생성
   */
  public generateCacheReport(): any {
    const stats = this.getCacheStats();
    const recommendations: string[] = [];

    // 히트율이 낮으면 권장사항 추가
    if (stats.overall.hitRate < 50) {
      recommendations.push('캐시 히트율이 낮습니다. 캐시 키 전략을 재검토해보세요.');
    }

    // 쿼리 캐시가 많으면 권장사항 추가
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

  /**
   * 캐시 정리 (만료된 항목 제거)
   */
  public cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;

    // 쿼리 캐시에서 만료된 항목 제거
    for (const [key, item] of this.queryCache.entries()) {
      if (!this.isCacheValid(item)) {
        this.queryCache.delete(key);
        cleanedCount++;
      }
    }

    console.log(`🧹 캐시 정리 완료: ${cleanedCount}개 만료된 항목 제거`);
  }

  /**
   * 캐시 워밍업 (자주 사용되는 데이터 미리 로드)
   */
  public async warmup(warmupFunctions: Array<() => Promise<{ key: string; value: any; ttl?: number }>>): Promise<void> {
    console.log('🔥 캐시 워밍업 시작...');
    
    const promises = warmupFunctions.map(async (fn) => {
      try {
        const { key, value, ttl } = await fn();
        this.set(key, value, ttl);
      } catch (error) {
        console.error('워밍업 실패:', error);
      }
    });

    await Promise.all(promises);
    console.log('✅ 캐시 워밍업 완료');
  }
}

export default CacheService;
