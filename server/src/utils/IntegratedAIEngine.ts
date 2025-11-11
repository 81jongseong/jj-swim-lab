/**
 * 🧠 JJ Swim Lab - 통합 AI 분석 엔진
 * 
 * 📋 **엔진 목적**
 * - 스마트 워치 데이터와 영상 분석을 통합한 종합 AI 평가
 * - 다중 데이터 소스 기반 정확한 성과 분석
 * - 실시간 피드백 및 개인화된 운동 계획 수립
 * - 강사와 AI가 협력하는 지능형 평가 시스템
 * 
 * 🔄 **주요 기능**
 * - 스마트 워치 데이터 분석
 * - 영상 분석 결과 통합
 * - 강사 관찰과 AI 분석 융합
 * - 종합적 성과 평가 및 추천
 */

import { SmartWatchData } from '../models/SmartWatchData';
import { VideoAnalysisResult } from '../models/VideoAnalysisCriteria';
import { VideoAnalysisCriteria } from '../models/VideoAnalysisCriteria';
import { AIEvaluationResult } from '../models/AIEvaluationCriteria';

// 통합 분석 입력 데이터
export interface IntegratedAnalysisInput {
  studentId: string;
  technique: string;
  smartWatchData?: any; // 스마트 워치 데이터
  videoAnalysisData?: any; // 영상 분석 데이터
  instructorObservations: {
    posture: number;
    breathing: number;
    movement: number;
    efficiency: number;
  };
  manualMetrics?: {
    speed?: number;
    endurance?: number;
    strokeCount?: number;
    heartRate?: number;
    distance?: number;
  };
}

// 통합 분석 결과
export interface IntegratedAnalysisResult {
  overallScore: number;
  dataSources: {
    smartWatch: {
      available: boolean;
      score: number;
      confidence: number;
    };
    videoAnalysis: {
      available: boolean;
      score: number;
      confidence: number;
    };
    instructorObservation: {
      score: number;
      confidence: number;
    };
  };
  categoryScores: {
    posture: number;
    breathing: number;
    movement: number;
    efficiency: number;
  };
  detailedAnalysis: {
    smartWatchInsights: any;
    videoAnalysisInsights: any;
    instructorInsights: any;
  };
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  exercisePlan: any;
  progressPrediction: any;
}

export class IntegratedAIEngine {
  
  /**
   * 통합 AI 분석 수행
   */
  static async performIntegratedAnalysis(
    input: IntegratedAnalysisInput
  ): Promise<IntegratedAnalysisResult> {
    try {
      const [storedSmartWatch, storedVideoResult, lastEvaluation, analysisCriteria] = await Promise.all([
        SmartWatchData.findOne({ studentId: input.studentId }).sort({ recordedAt: -1 }).lean(),
        VideoAnalysisResult.findOne({ studentId: input.studentId, technique: input.technique }).sort({ createdAt: -1 }).lean(),
        AIEvaluationResult.findOne({ studentId: input.studentId, technique: input.technique }).sort({ evaluationDate: -1 }).lean(),
        VideoAnalysisCriteria.findOne({ technique: input.technique }).lean()
      ]);

      const enrichedInput: IntegratedAnalysisInput = {
        ...input,
        smartWatchData: input.smartWatchData || storedSmartWatch || undefined,
        videoAnalysisData: input.videoAnalysisData || storedVideoResult || undefined
      };
      // 1. 스마트 워치 데이터 분석
      const smartWatchAnalysis = await this.analyzeSmartWatchData(enrichedInput);
      
      // 2. 영상 분석 데이터 처리
      const videoAnalysis = await this.analyzeVideoData(enrichedInput, analysisCriteria);
      
      // 3. 강사 관찰 데이터 처리
      const instructorAnalysis = this.analyzeInstructorObservations(enrichedInput.instructorObservations);
      
      // 4. 데이터 소스별 가중치 계산
      const dataSourceWeights = this.calculateDataSourceWeights(
        smartWatchAnalysis,
        videoAnalysis,
        instructorAnalysis
      );
      
      // 5. 종합 점수 계산
      const overallScore = this.calculateOverallScore(
        smartWatchAnalysis,
        videoAnalysis,
        instructorAnalysis,
        dataSourceWeights
      );
      
      // 6. 카테고리별 점수 계산
      const categoryScores = this.calculateCategoryScores(
        smartWatchAnalysis,
        videoAnalysis,
        instructorAnalysis,
        dataSourceWeights
      );
      
      // 7. 상세 분석 및 인사이트 생성
      const detailedAnalysis = this.generateDetailedAnalysis(
        smartWatchAnalysis,
        videoAnalysis,
        instructorAnalysis
      );
      
      // 8. 개인화된 추천사항 생성
      const recommendations = this.generateRecommendations(
        overallScore,
        categoryScores,
        detailedAnalysis,
        analysisCriteria
      );
      
      // 9. 운동 계획 수립
      const exercisePlan = this.generateExercisePlan(
        overallScore,
        categoryScores,
        input.technique
      );
      
      // 10. 진도 예측
      const progressPrediction = this.predictProgress(
        overallScore,
        categoryScores,
        input.studentId,
        lastEvaluation
      );
      
      return {
        overallScore,
        dataSources: {
          smartWatch: {
            available: smartWatchAnalysis.available,
            score: smartWatchAnalysis.overallScore,
            confidence: smartWatchAnalysis.confidence
          },
          videoAnalysis: {
            available: videoAnalysis.available,
            score: videoAnalysis.overallScore,
            confidence: videoAnalysis.confidence
          },
          instructorObservation: {
            score: instructorAnalysis.overallScore,
            confidence: instructorAnalysis.confidence
          }
        },
        categoryScores,
        detailedAnalysis,
        recommendations,
        exercisePlan,
        progressPrediction
      };
      
    } catch (error) {
      console.error('통합 AI 분석 오류:', error);
      throw error;
    }
  }

  /**
   * 스마트 워치 데이터 분석
   */
  private static async analyzeSmartWatchData(input: IntegratedAnalysisInput): Promise<any> {
    if (!input.smartWatchData) {
      return {
        available: false,
        overallScore: 0,
        confidence: 0,
        insights: {}
      };
    }

    const data = input.smartWatchData;
    
    // 심박수 분석
    const heartRateAnalysis = this.analyzeHeartRateData(data.performanceMetrics);
    
    // 스트로크 분석
    const strokeAnalysis = this.analyzeStrokeData(data.performanceMetrics);
    
    // 속도 및 효율성 분석
    const efficiencyAnalysis = this.analyzeEfficiencyData(data.performanceMetrics);
    
    // 종합 점수 계산
    const overallScore = (
      heartRateAnalysis.score * 0.3 +
      strokeAnalysis.score * 0.4 +
      efficiencyAnalysis.score * 0.3
    );
    
    return {
      available: true,
      overallScore: Math.round(overallScore),
      confidence: 0.9, // 스마트 워치 데이터는 높은 신뢰도
      insights: {
        heartRate: heartRateAnalysis,
        stroke: strokeAnalysis,
        efficiency: efficiencyAnalysis
      }
    };
  }

  /**
   * 영상 분석 데이터 처리
   */
  private static async analyzeVideoData(input: IntegratedAnalysisInput, criteria?: any): Promise<any> {
    if (!input.videoAnalysisData) {
      return {
        available: false,
        overallScore: 0,
        confidence: 0,
        insights: {}
      };
    }

    const data = input.videoAnalysisData;
    
    // 자세 분석
    const postureAnalysis = this.analyzePostureFromVideo(data.detailedAnalysis.postureAnalysis);
    
    // 동작 분석
    const movementAnalysis = this.analyzeMovementFromVideo(data.detailedAnalysis.movementAnalysis);
    
    // 타이밍 분석
    const timingAnalysis = this.analyzeTimingFromVideo(data.detailedAnalysis.timingAnalysis);
    
    const calibration = criteria?.calibration || {};
    const postureWeight = calibration.postureWeight ?? 0.35;
    const movementWeight = calibration.movementWeight ?? 0.35;
    const timingWeight = calibration.timingWeight ?? 0.3;
    const confidenceBoost = calibration.confidenceBoost ?? 0;

    // 종합 점수 계산
    const overallScore = (
      postureAnalysis.score * postureWeight +
      movementAnalysis.score * movementWeight +
      timingAnalysis.score * timingWeight
    );
    
    return {
      available: true,
      overallScore: Math.round(overallScore),
      confidence: Math.min(1, 0.8 + confidenceBoost),
      insights: {
        posture: postureAnalysis,
        movement: movementAnalysis,
        timing: timingAnalysis
      }
    };
  }

  /**
   * 강사 관찰 데이터 분석
   */
  private static analyzeInstructorObservations(observations: any): any {
    const scores = Object.values(observations) as number[];
    const overallScore = scores.reduce((sum, score) => sum + score, 0) / scores.length * 10;
    
    return {
      overallScore: Math.round(overallScore),
      confidence: 0.7, // 강사 관찰은 중간 신뢰도
      insights: {
        posture: observations.posture * 10,
        breathing: observations.breathing * 10,
        movement: observations.movement * 10,
        efficiency: observations.efficiency * 10
      }
    };
  }

  /**
   * 데이터 소스별 가중치 계산
   */
  private static calculateDataSourceWeights(
    smartWatch: any,
    video: any,
    instructor: any
  ): any {
    const smartWeight = smartWatch.available ? smartWatch.confidence ?? 0.8 : 0;
    const videoWeight = video.available ? video.confidence ?? 0.7 : 0;
    const instructorWeight = instructor?.confidence ?? 0.6;

    const total = smartWeight + videoWeight + instructorWeight;
    if (total === 0) {
      return { smartWatch: 0, video: 0, instructor: 1 };
    }

    return {
      smartWatch: smartWeight / total,
      video: videoWeight / total,
      instructor: instructorWeight / total
    };
  }

  /**
   * 종합 점수 계산
   */
  private static calculateOverallScore(
    smartWatch: any,
    video: any,
    instructor: any,
    weights: any
  ): number {
    let totalScore = 0;
    let totalWeight = 0;
    
    if (smartWatch.available) {
      totalScore += smartWatch.overallScore * weights.smartWatch;
      totalWeight += weights.smartWatch;
    }
    
    if (video.available) {
      totalScore += video.overallScore * weights.video;
      totalWeight += weights.video;
    }
    
    totalScore += instructor.overallScore * weights.instructor;
    totalWeight += weights.instructor;
    
    return Math.round(totalScore / totalWeight);
  }

  /**
   * 카테고리별 점수 계산
   */
  private static calculateCategoryScores(
    smartWatch: any,
    video: any,
    instructor: any,
    weights: any
  ): any {
    const categories = ['posture', 'breathing', 'movement', 'efficiency'];
    const categoryScores: any = {};
    
    categories.forEach(category => {
      let totalScore = 0;
      let totalWeight = 0;
      
      if (smartWatch.available && smartWatch.insights[category]) {
        totalScore += smartWatch.insights[category] * weights.smartWatch;
        totalWeight += weights.smartWatch;
      }
      
      if (video.available && video.insights[category]) {
        totalScore += video.insights[category] * weights.video;
        totalWeight += weights.video;
      }
      
      if (instructor.insights[category]) {
        totalScore += instructor.insights[category] * weights.instructor;
        totalWeight += weights.instructor;
      }
      
      categoryScores[category] = Math.round(totalScore / totalWeight);
    });
    
    return categoryScores;
  }

  /**
   * 상세 분석 생성
   */
  private static generateDetailedAnalysis(
    smartWatch: any,
    video: any,
    instructor: any
  ): any {
    return {
      smartWatchInsights: smartWatch.available ? smartWatch.insights : null,
      videoAnalysisInsights: video.available ? video.insights : null,
      instructorInsights: instructor.insights
    };
  }

  /**
   * 추천사항 생성
   */
  private static generateRecommendations(
    overallScore: number,
    categoryScores: any,
    detailedAnalysis: any,
    criteria?: any
  ): any {
    const recommendations = {
      immediate: [] as string[],
      shortTerm: [] as string[],
      longTerm: [] as string[]
    };
    
    // 즉시 개선사항
    if (categoryScores.posture < 60) {
      recommendations.immediate.push('자세 교정 운동을 시작하세요');
      if (criteria?.posture?.recommendations) {
        recommendations.immediate.push(...criteria.posture.recommendations);
      }
    }
    if (categoryScores.breathing < 60) {
      recommendations.immediate.push('호흡 타이밍 연습을 강화하세요');
      if (criteria?.breathing?.recommendations) {
        recommendations.immediate.push(...criteria.breathing.recommendations);
      }
    }
    
    // 단기 목표
    if (overallScore < 70) {
      recommendations.shortTerm.push('기본 동작 연습을 집중적으로 하세요');
      if (criteria?.movement?.recommendations) {
        recommendations.shortTerm.push(...criteria.movement.recommendations);
      }
    }
    
    // 장기 목표
    if (overallScore > 80) {
      recommendations.longTerm.push('고급 기술 습득을 목표로 하세요');
      if (criteria?.efficiency?.recommendations) {
        recommendations.longTerm.push(...criteria.efficiency.recommendations);
      }
    }
    
    return recommendations;
  }

  /**
   * 운동 계획 생성
   */
  private static generateExercisePlan(
    overallScore: number,
    categoryScores: any,
    technique: string
  ): any {
    // 기본 운동 계획 로직
    const baseDuration = Math.max(30, overallScore * 0.5);
    
    return {
      totalDuration: Math.round(baseDuration),
      warmUp: {
        duration: Math.round(baseDuration * 0.15),
        exercises: ['어깨 스트레칭', '가벼운 수영 동작']
      },
      mainTraining: {
        duration: Math.round(baseDuration * 0.7),
        exercises: this.getTechniqueSpecificExercises(technique, categoryScores)
      },
      coolDown: {
        duration: Math.round(baseDuration * 0.15),
        exercises: ['가벼운 스트레칭', '호흡 정리']
      }
    };
  }

  /**
   * 진도 예측
   */
  private static predictProgress(
    overallScore: number,
    categoryScores: any,
    studentId: string,
    lastEvaluation: any
  ): any {
    // 기본 진도 예측 로직
    const previousScore = lastEvaluation?.overallScore ?? 0;
    const delta = overallScore - previousScore;
    const improvementRate = delta !== 0 ? Math.max(0.2, Math.min(1, delta / 10 + 0.5)) : 0.5;
    const categoryFocus = Object.entries(categoryScores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([category]) => category);

    return {
      expectedImprovement: Math.round(overallScore * improvementRate * 0.1),
      timeToNextLevel: Math.max(1, Math.round((100 - overallScore) / improvementRate)),
      confidence: Math.min(0.95, 0.6 + (delta >= 0 ? 0.1 : -0.05)),
      referenceEvaluationId: lastEvaluation?._id ?? null,
      focusCategories: categoryFocus,
      studentId
    };
  }

  // 헬퍼 메서드들
  private static analyzeHeartRateData(metrics: any): any {
    const avgHR = metrics.averageHeartRate;
    const maxHR = metrics.maxHeartRate;
    
    // 심박수 효율성 계산 (간단한 예시)
    const efficiency = Math.max(0, 100 - Math.abs(avgHR - 150) / 2);
    
    return {
      score: Math.round(efficiency),
      insights: {
        averageHeartRate: avgHR,
        maxHeartRate: maxHR,
        efficiency: efficiency
      }
    };
  }

  private static analyzeStrokeData(metrics: any): any {
    const strokeRate = metrics.strokeRate;
    const strokeCount = metrics.strokeCount;
    
    // 스트로크 효율성 계산
    const efficiency = Math.max(0, 100 - Math.abs(strokeRate - 60) / 2);
    
    return {
      score: Math.round(efficiency),
      insights: {
        strokeRate: strokeRate,
        strokeCount: strokeCount,
        efficiency: efficiency
      }
    };
  }

  private static analyzeEfficiencyData(metrics: any): any {
    const speed = metrics.averageSpeed;
    const efficiency = metrics.efficiency;
    
    return {
      score: Math.round(efficiency),
      insights: {
        speed: speed,
        efficiency: efficiency
      }
    };
  }

  private static analyzePostureFromVideo(postureData: any): any {
    const scores = Object.values(postureData) as number[];
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    return {
      score: Math.round(averageScore),
      insights: postureData
    };
  }

  private static analyzeMovementFromVideo(movementData: any): any {
    const scores = Object.values(movementData) as number[];
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    return {
      score: Math.round(averageScore),
      insights: movementData
    };
  }

  private static analyzeTimingFromVideo(timingData: any): any {
    const scores = Object.values(timingData) as number[];
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    return {
      score: Math.round(averageScore),
      insights: timingData
    };
  }

  private static getTechniqueSpecificExercises(technique: string, categoryScores: any): string[] {
    const baseExercises = {
      freestyle: ['프리스트로크 기본 동작', '호흡 타이밍 연습'],
      backstroke: ['백스트로크 기본 동작', '호흡 연습'],
      breaststroke: ['브레스트스트로크 기본 동작', '호흡 타이밍 연습'],
      butterfly: ['버터플라이 기본 동작', '호흡 타이밍 연습']
    };
    
    const exercises = baseExercises[technique as keyof typeof baseExercises] || baseExercises.freestyle;
    
    // 약한 영역에 따른 추가 운동
    if (categoryScores.posture < 60) {
      exercises.push('자세 교정 운동');
    }
    if (categoryScores.breathing < 60) {
      exercises.push('호흡 개선 운동');
    }
    
    return exercises;
  }
}

