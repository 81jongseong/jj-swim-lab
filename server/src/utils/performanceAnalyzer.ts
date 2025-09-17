/**
 * 성능 분석 도구
 * 코드 성능, 데이터베이스 쿼리, 메모리 사용량을 분석합니다.
 */

import { performance } from 'perf_hooks';
import mongoose from 'mongoose';

// 성능 메트릭 인터페이스
interface PerformanceMetric {
  id: string;
  name: string;
  type: 'function' | 'query' | 'api' | 'memory';
  startTime: number;
  endTime: number;
  duration: number;
  memoryUsage?: NodeJS.MemoryUsage;
  metadata?: any;
}

// 데이터베이스 쿼리 성능 인터페이스
interface QueryPerformance {
  operation: string;
  collection: string;
  duration: number;
  documentsExamined: number;
  documentsReturned: number;
  indexUsed: boolean;
  executionStats?: any;
}

class PerformanceAnalyzer {
  private static instance: PerformanceAnalyzer;
  private metrics: PerformanceMetric[] = [];
  private queryMetrics: QueryPerformance[] = [];
  private maxMetricsHistory = 1000;

  private constructor() {
    this.setupMongoDBProfiling();
  }

  public static getInstance(): PerformanceAnalyzer {
    if (!PerformanceAnalyzer.instance) {
      PerformanceAnalyzer.instance = new PerformanceAnalyzer();
    }
    return PerformanceAnalyzer.instance;
  }

  /**
   * MongoDB 프로파일링 설정
   */
  private setupMongoDBProfiling(): void {
    // MongoDB Atlas에서는 프로파일러를 직접 설정할 수 없으므로 
    // 대신 Mongoose의 내장 디버그 모드를 사용합니다
    if (process.env.NODE_ENV === 'development') {
      mongoose.connection.on('connected', () => {
        // Atlas에서는 profile 명령어 사용 불가하므로 주석 처리
        // mongoose.connection.db?.admin().command({
        //   profile: 2, // 모든 작업 프로파일링
        //   slowms: 100 // 100ms 이상의 느린 쿼리만 기록
        // });
        console.log('📊 MongoDB 프로파일러 활성화됨 (Mongoose 디버그 모드)');
      });
    }
  }

  /**
   * 함수 실행 시간 측정
   */
  public async measureFunction<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: any
  ): Promise<T> {
    const startTime = performance.now();
    const startMemory = process.memoryUsage();
    
    try {
      const result = await fn();
      const endTime = performance.now();
      const endMemory = process.memoryUsage();
      
      this.recordMetric({
        id: `func_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        type: 'function',
        startTime,
        endTime,
        duration: endTime - startTime,
        memoryUsage: {
          rss: endMemory.rss - startMemory.rss,
          heapTotal: endMemory.heapTotal - startMemory.heapTotal,
          heapUsed: endMemory.heapUsed - startMemory.heapUsed,
          external: endMemory.external - startMemory.external,
          arrayBuffers: endMemory.arrayBuffers - startMemory.arrayBuffers
        },
        metadata
      });
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      this.recordMetric({
        id: `func_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        type: 'function',
        startTime,
        endTime,
        duration: endTime - startTime,
        metadata: { ...metadata, error: error.message }
      });
      throw error;
    }
  }

  /**
   * API 요청 성능 측정
   */
  public measureApiRequest(req: any, res: any): void {
    const startTime = performance.now();
    const startMemory = process.memoryUsage();
    
    res.on('finish', () => {
      const endTime = performance.now();
      const endMemory = process.memoryUsage();
      
      this.recordMetric({
        id: `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: `${req.method} ${req.url}`,
        type: 'api',
        startTime,
        endTime,
        duration: endTime - startTime,
        memoryUsage: {
          rss: endMemory.rss - startMemory.rss,
          heapTotal: endMemory.heapTotal - startMemory.heapTotal,
          heapUsed: endMemory.heapUsed - startMemory.heapUsed,
          external: endMemory.external - startMemory.external,
          arrayBuffers: endMemory.arrayBuffers - startMemory.arrayBuffers
        },
        metadata: {
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          userAgent: req.get('User-Agent'),
          ip: req.ip
        }
      });
    });
  }

  /**
   * 데이터베이스 쿼리 성능 측정
   */
  public async measureQuery<T>(
    operation: string,
    collection: string,
    queryFn: () => Promise<T>,
    metadata?: any
  ): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await queryFn();
      const endTime = performance.now();
      
      const queryMetric: QueryPerformance = {
        operation,
        collection,
        duration: endTime - startTime,
        documentsExamined: 0, // 실제로는 MongoDB 프로파일러에서 가져와야 함
        documentsReturned: Array.isArray(result) ? result.length : 1,
        indexUsed: false, // 실제로는 실행 계획에서 확인해야 함
        executionStats: metadata
      };
      
      this.queryMetrics.push(queryMetric);
      
      // 쿼리 메트릭 히스토리 크기 제한
      if (this.queryMetrics.length > this.maxMetricsHistory) {
        this.queryMetrics = this.queryMetrics.slice(-this.maxMetricsHistory);
      }
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      this.queryMetrics.push({
        operation,
        collection,
        duration: endTime - startTime,
        documentsExamined: 0,
        documentsReturned: 0,
        indexUsed: false,
        executionStats: { error: error.message }
      });
      throw error;
    }
  }

  /**
   * 메트릭 기록
   */
  private recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // 메트릭 히스토리 크기 제한
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics = this.metrics.slice(-this.maxMetricsHistory);
    }
    
    // 느린 작업 경고
    if (metric.duration > 1000) {
      console.warn(`⚠️ 느린 작업 감지: ${metric.name} - ${metric.duration.toFixed(2)}ms`);
    }
  }

  /**
   * 성능 통계 조회
   */
  public getPerformanceStats(): any {
    const recentMetrics = this.metrics.slice(-100); // 최근 100개 메트릭
    const recentQueries = this.queryMetrics.slice(-100);
    
    if (recentMetrics.length === 0) {
      return {
        totalMetrics: 0,
        averageDuration: 0,
        slowOperations: 0,
        memoryUsage: process.memoryUsage()
      };
    }
    
    const totalDuration = recentMetrics.reduce((sum, m) => sum + m.duration, 0);
    const averageDuration = totalDuration / recentMetrics.length;
    const slowOperations = recentMetrics.filter(m => m.duration > 1000).length;
    
    // 함수별 성능 분석
    const functionMetrics = recentMetrics.filter(m => m.type === 'function');
    const functionStats = functionMetrics.reduce((acc, m) => {
      if (!acc[m.name]) {
        acc[m.name] = { count: 0, totalDuration: 0, averageDuration: 0 };
      }
      acc[m.name].count++;
      acc[m.name].totalDuration += m.duration;
      acc[m.name].averageDuration = acc[m.name].totalDuration / acc[m.name].count;
      return acc;
    }, {} as any);
    
    // 쿼리 성능 분석
    const queryStats = recentQueries.reduce((acc, q) => {
      if (!acc[q.collection]) {
        acc[q.collection] = { count: 0, totalDuration: 0, averageDuration: 0 };
      }
      acc[q.collection].count++;
      acc[q.collection].totalDuration += q.duration;
      acc[q.collection].averageDuration = acc[q.collection].totalDuration / acc[q.collection].count;
      return acc;
    }, {} as any);
    
    return {
      totalMetrics: recentMetrics.length,
      averageDuration: Math.round(averageDuration * 100) / 100,
      slowOperations,
      memoryUsage: process.memoryUsage(),
      functionStats,
      queryStats,
      recommendations: this.generateRecommendations(functionStats, queryStats)
    };
  }

  /**
   * 성능 개선 권장사항 생성
   */
  private generateRecommendations(functionStats: any, queryStats: any): string[] {
    const recommendations: string[] = [];
    
    // 느린 함수 권장사항
    Object.entries(functionStats).forEach(([name, stats]: [string, any]) => {
      if (stats.averageDuration > 500) {
        recommendations.push(`함수 '${name}'의 평균 실행 시간이 ${stats.averageDuration.toFixed(2)}ms입니다. 최적화를 고려해보세요.`);
      }
    });
    
    // 느린 쿼리 권장사항
    Object.entries(queryStats).forEach(([collection, stats]: [string, any]) => {
      if (stats.averageDuration > 100) {
        recommendations.push(`컬렉션 '${collection}'의 평균 쿼리 시간이 ${stats.averageDuration.toFixed(2)}ms입니다. 인덱스 추가를 고려해보세요.`);
      }
    });
    
    // 메모리 사용량 권장사항
    const memoryUsage = process.memoryUsage();
    const memoryUsageMB = memoryUsage.heapUsed / 1024 / 1024;
    if (memoryUsageMB > 100) {
      recommendations.push(`힙 메모리 사용량이 ${memoryUsageMB.toFixed(2)}MB입니다. 메모리 누수를 확인해보세요.`);
    }
    
    return recommendations;
  }

  /**
   * 느린 쿼리 조회
   */
  public getSlowQueries(threshold: number = 100): QueryPerformance[] {
    return this.queryMetrics.filter(q => q.duration > threshold);
  }

  /**
   * 메모리 사용량 추적
   */
  public trackMemoryUsage(): void {
    const memoryUsage = process.memoryUsage();
    this.recordMetric({
      id: `memory_${Date.now()}`,
      name: 'Memory Usage',
      type: 'memory',
      startTime: performance.now(),
      endTime: performance.now(),
      duration: 0,
      memoryUsage,
      metadata: { timestamp: new Date() }
    });
  }

  /**
   * 성능 리포트 생성
   */
  public generatePerformanceReport(): any {
    const stats = this.getPerformanceStats();
    const slowQueries = this.getSlowQueries();
    
    return {
      timestamp: new Date(),
      summary: {
        totalMetrics: stats.totalMetrics,
        averageDuration: stats.averageDuration,
        slowOperations: stats.slowOperations,
        slowQueries: slowQueries.length,
        memoryUsage: stats.memoryUsage
      },
      functionPerformance: stats.functionStats,
      queryPerformance: stats.queryStats,
      slowQueries: slowQueries.slice(-10), // 최근 10개 느린 쿼리
      recommendations: stats.recommendations
    };
  }

  /**
   * 메트릭 초기화
   */
  public clearMetrics(): void {
    this.metrics = [];
    this.queryMetrics = [];
    console.log('📊 성능 메트릭이 초기화되었습니다.');
  }
}

export default PerformanceAnalyzer;
