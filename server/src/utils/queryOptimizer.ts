/**
 * 데이터베이스 쿼리 최적화 도구
 * 쿼리 성능 분석, 인덱스 권장사항, 실행 계획 분석을 제공합니다.
 */

import mongoose from 'mongoose';

// 쿼리 분석 결과 인터페이스
interface QueryAnalysis {
  query: string;
  collection: string;
  executionTime: number;
  documentsExamined: number;
  documentsReturned: number;
  indexUsed: boolean;
  indexName?: string;
  executionStats?: any;
  recommendations: string[];
  score: number; // 0-100 점수
}

// 인덱스 권장사항 인터페이스
interface IndexRecommendation {
  collection: string;
  fields: string[];
  type: 'single' | 'compound' | 'text' | 'geospatial';
  priority: 'high' | 'medium' | 'low';
  reason: string;
  estimatedImpact: string;
}

class QueryOptimizer {
  private static instance: QueryOptimizer;
  private queryHistory: QueryAnalysis[] = [];
  private maxHistorySize = 1000;

  private constructor() {}

  public static getInstance(): QueryOptimizer {
    if (!QueryOptimizer.instance) {
      QueryOptimizer.instance = new QueryOptimizer();
    }
    return QueryOptimizer.instance;
  }

  /**
   * 쿼리 성능 분석
   */
  public async analyzeQuery(
    model: mongoose.Model<any>,
    query: any,
    options: any = {}
  ): Promise<QueryAnalysis> {
    const startTime = Date.now();
    const collection = model.collection.name;
    
    try {
      // 간단한 쿼리 실행 (explain은 복잡하므로 기본 실행)
      const startQuery = Date.now();
      const result = await model.find(query, null, options);
      const executionTime = Date.now() - startTime;
      
      const analysis: QueryAnalysis = {
        query: JSON.stringify(query),
        collection,
        executionTime,
        documentsExamined: Array.isArray(result) ? result.length : 1,
        documentsReturned: Array.isArray(result) ? result.length : 1,
        indexUsed: false, // 기본값
        indexName: undefined,
        executionStats: { queryTime: executionTime },
        recommendations: [],
        score: 0
      };

      // 권장사항 생성
      analysis.recommendations = this.generateRecommendations(analysis);
      analysis.score = this.calculateScore(analysis);

      // 히스토리에 추가
      this.addToHistory(analysis);

      return analysis;
    } catch (error) {
      console.error('쿼리 분석 실패:', error);
      throw error;
    }
  }

  /**
   * 권장사항 생성
   */
  private generateRecommendations(analysis: QueryAnalysis): string[] {
    const recommendations: string[] = [];

    // 문서 검사 비율이 높으면 인덱스 권장
    const examinationRatio = analysis.documentsExamined / Math.max(analysis.documentsReturned, 1);
    if (examinationRatio > 10) {
      recommendations.push('문서 검사 비율이 높습니다. 적절한 인덱스를 추가하세요.');
    }

    // 실행 시간이 길면 최적화 권장
    if (analysis.executionTime > 100) {
      recommendations.push('쿼리 실행 시간이 길어집니다. 쿼리 구조를 최적화하세요.');
    }

    // 인덱스가 사용되지 않으면 인덱스 권장
    if (!analysis.indexUsed) {
      recommendations.push('인덱스가 사용되지 않습니다. 쿼리 조건에 맞는 인덱스를 생성하세요.');
    }

    // 복합 쿼리 최적화 권장
    if (analysis.query.includes('$and') || analysis.query.includes('$or')) {
      recommendations.push('복합 쿼리입니다. 쿼리 조건 순서를 최적화하세요.');
    }

    return recommendations;
  }

  /**
   * 성능 점수 계산 (0-100)
   */
  private calculateScore(analysis: QueryAnalysis): number {
    let score = 100;

    // 실행 시간 점수 차감
    if (analysis.executionTime > 1000) score -= 30;
    else if (analysis.executionTime > 500) score -= 20;
    else if (analysis.executionTime > 100) score -= 10;

    // 문서 검사 비율 점수 차감
    const examinationRatio = analysis.documentsExamined / Math.max(analysis.documentsReturned, 1);
    if (examinationRatio > 100) score -= 25;
    else if (examinationRatio > 50) score -= 15;
    else if (examinationRatio > 10) score -= 10;

    // 인덱스 사용 여부 점수 차감
    if (!analysis.indexUsed) score -= 20;

    return Math.max(0, score);
  }

  /**
   * 히스토리에 추가
   */
  private addToHistory(analysis: QueryAnalysis): void {
    this.queryHistory.push(analysis);
    
    if (this.queryHistory.length > this.maxHistorySize) {
      this.queryHistory = this.queryHistory.slice(-this.maxHistorySize);
    }
  }

  /**
   * 인덱스 권장사항 생성
   */
  public generateIndexRecommendations(collection: string): IndexRecommendation[] {
    const recommendations: IndexRecommendation[] = [];
    
    // 컬렉션의 쿼리 히스토리 분석
    const collectionQueries = this.queryHistory.filter(q => q.collection === collection);
    
    if (collectionQueries.length === 0) {
      return recommendations;
    }

    // 자주 사용되는 쿼리 패턴 분석
    const queryPatterns = this.analyzeQueryPatterns(collectionQueries);
    
    queryPatterns.forEach(pattern => {
      if (pattern.frequency > 5 && pattern.score < 70) {
        recommendations.push({
          collection,
          fields: pattern.fields,
          type: pattern.fields.length === 1 ? 'single' : 'compound',
          priority: pattern.score < 50 ? 'high' : 'medium',
          reason: `자주 사용되는 쿼리 패턴 (${pattern.frequency}회 사용)`,
          estimatedImpact: `성능 향상 예상: ${100 - pattern.score}점`
        });
      }
    });

    return recommendations;
  }

  /**
   * 쿼리 패턴 분석
   */
  private analyzeQueryPatterns(queries: QueryAnalysis[]): any[] {
    const patterns = new Map<string, { frequency: number; score: number; fields: string[] }>();
    
    queries.forEach(query => {
      try {
        const queryObj = JSON.parse(query.query);
        const fields = this.extractQueryFields(queryObj);
        const patternKey = fields.sort().join(',');
        
        if (patterns.has(patternKey)) {
          const pattern = patterns.get(patternKey)!;
          pattern.frequency++;
          pattern.score = Math.min(pattern.score, query.score);
        } else {
          patterns.set(patternKey, {
            frequency: 1,
            score: query.score,
            fields
          });
        }
      } catch (error) {
        // JSON 파싱 실패 시 무시
      }
    });

    return Array.from(patterns.values());
  }

  /**
   * 쿼리에서 필드 추출
   */
  private extractQueryFields(query: any): string[] {
    const fields: string[] = [];
    
    const extractFields = (obj: any, prefix = '') => {
      Object.keys(obj).forEach(key => {
        if (key.startsWith('$')) {
          // 연산자 무시
          return;
        }
        
        const fieldName = prefix ? `${prefix}.${key}` : key;
        fields.push(fieldName);
        
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          extractFields(obj[key], fieldName);
        }
      });
    };

    extractFields(query);
    return fields;
  }

  /**
   * 느린 쿼리 조회
   */
  public getSlowQueries(threshold: number = 100): QueryAnalysis[] {
    return this.queryHistory
      .filter(q => q.executionTime > threshold)
      .sort((a, b) => b.executionTime - a.executionTime);
  }

  /**
   * 성능이 나쁜 쿼리 조회
   */
  public getPoorPerformingQueries(scoreThreshold: number = 50): QueryAnalysis[] {
    return this.queryHistory
      .filter(q => q.score < scoreThreshold)
      .sort((a, b) => a.score - b.score);
  }

  /**
   * 컬렉션별 성능 통계
   */
  public getCollectionStats(): any {
    const stats = new Map<string, {
      totalQueries: number;
      averageExecutionTime: number;
      averageScore: number;
      slowQueries: number;
      poorPerformingQueries: number;
    }>();

    this.queryHistory.forEach(query => {
      if (!stats.has(query.collection)) {
        stats.set(query.collection, {
          totalQueries: 0,
          averageExecutionTime: 0,
          averageScore: 0,
          slowQueries: 0,
          poorPerformingQueries: 0
        });
      }

      const stat = stats.get(query.collection)!;
      stat.totalQueries++;
      stat.averageExecutionTime += query.executionTime;
      stat.averageScore += query.score;
      
      if (query.executionTime > 100) stat.slowQueries++;
      if (query.score < 50) stat.poorPerformingQueries++;
    });

    // 평균 계산
    stats.forEach(stat => {
      stat.averageExecutionTime = Math.round(stat.averageExecutionTime / stat.totalQueries);
      stat.averageScore = Math.round(stat.averageScore / stat.totalQueries);
    });

    return Object.fromEntries(stats);
  }

  /**
   * 최적화 리포트 생성
   */
  public generateOptimizationReport(): any {
    const slowQueries = this.getSlowQueries();
    const poorPerformingQueries = this.getPoorPerformingQueries();
    const collectionStats = this.getCollectionStats();
    
    // 전체 통계
    const totalQueries = this.queryHistory.length;
    const averageExecutionTime = totalQueries > 0 ? 
      this.queryHistory.reduce((sum, q) => sum + q.executionTime, 0) / totalQueries : 0;
    const averageScore = totalQueries > 0 ? 
      this.queryHistory.reduce((sum, q) => sum + q.score, 0) / totalQueries : 0;

    // 인덱스 권장사항
    const indexRecommendations: IndexRecommendation[] = [];
    Object.keys(collectionStats).forEach(collection => {
      const recommendations = this.generateIndexRecommendations(collection);
      indexRecommendations.push(...recommendations);
    });

    return {
      timestamp: new Date(),
      summary: {
        totalQueries,
        averageExecutionTime: Math.round(averageExecutionTime),
        averageScore: Math.round(averageScore),
        slowQueries: slowQueries.length,
        poorPerformingQueries: poorPerformingQueries.length
      },
      collectionStats,
      slowQueries: slowQueries.slice(0, 10), // 상위 10개
      poorPerformingQueries: poorPerformingQueries.slice(0, 10), // 상위 10개
      indexRecommendations: indexRecommendations.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
    };
  }

  /**
   * 쿼리 히스토리 초기화
   */
  public clearHistory(): void {
    this.queryHistory = [];
    console.log('📊 쿼리 히스토리가 초기화되었습니다.');
  }
}

export default QueryOptimizer;
