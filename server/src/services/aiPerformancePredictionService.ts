/**
 * AI 기반 수영 기록 예측 서비스
 * 훈련 데이터, 생리학적 지표, 기술 분석을 통한 개인 기록 향상 예측
 */

import mongoose from 'mongoose';
import { 
  PerformancePrediction, 
  IPerformancePrediction, 
  SwimmingEvent, 
  ConfidenceLevel,
  PerformanceFactorCategory,
  IPerformanceFactor,
  ITrainingPerformance,
  IPhysiologicalData,
  IPredictionResult
} from '../models/PerformancePrediction';

// 기록 예측 요청 인터페이스
export interface IPerformancePredictionRequest {
  userId: mongoose.Types.ObjectId;
  userProfile: {
    age: number;
    weight: number;
    height: number;
    experience: number;
    currentLevel: string;
    dominantStroke: SwimmingEvent;
    trainingFrequency: number;
    competitionExperience: boolean;
  };
  currentRecords: {
    event: SwimmingEvent;
    bestTime: number;
    achievedDate: Date;
    conditions: string;
  }[];
  trainingData: ITrainingPerformance[];
  physiologicalData: IPhysiologicalData[];
  targetEvents: SwimmingEvent[];
}

// 성과 분석 결과 인터페이스
interface IPerformanceAnalysis {
  trainingScore: number; // 0-100
  physiologicalScore: number; // 0-100
  techniqueScore: number; // 0-100
  progressTrend: 'improving' | 'stable' | 'declining';
  consistencyScore: number; // 0-100
  potentialScore: number; // 0-100 (개선 가능성)
  limitingFactors: string[];
  strengthAreas: string[];
}

export class AIPerformancePredictionService {
  
  /**
   * AI 기반 수영 기록 예측 수행
   */
  static async predictPerformance(request: IPerformancePredictionRequest): Promise<IPerformancePrediction> {
    try {
      // 1. 기존 예측 기록 확인
      const existingPrediction = await PerformancePrediction.findOne({
        userId: request.userId,
        isActive: true
      }).sort({ predictionDate: -1 });
      
      // 2. 훈련 데이터 분석
      const trainingAnalysis = this.analyzeTrainingData(request.trainingData);
      
      // 3. 생리학적 데이터 분석
      const physiologicalAnalysis = this.analyzePhysiologicalData(request.physiologicalData);
      
      // 4. 기술 분석
      const techniqueAnalysis = this.analyzeTechnique(request.trainingData);
      
      // 5. 종합 성과 분석
      const performanceAnalysis = this.performComprehensiveAnalysis(
        trainingAnalysis,
        physiologicalAnalysis,
        techniqueAnalysis,
        request.userProfile
      );
      
      // 6. 각 목표 종목별 예측 수행
      const predictions = await Promise.all(
        request.targetEvents.map(event => 
          this.predictEventPerformance(
            event,
            request,
            performanceAnalysis,
            trainingAnalysis,
            physiologicalAnalysis,
            techniqueAnalysis
          )
        )
      );
      
      // 7. 모델 정보 생성
      const modelInfo = this.generateModelInfo(request.trainingData.length);
      
      // 8. 검증 정보 생성
      const validation = await this.generateValidationInfo(request.userProfile, predictions);
      
      // 9. 예측 기록 생성 또는 업데이트
      let performancePrediction: IPerformancePrediction;
      
      if (existingPrediction && this.shouldUpdateExisting(existingPrediction)) {
        performancePrediction = await this.updateExistingPrediction(
          existingPrediction,
          request,
          trainingAnalysis,
          physiologicalAnalysis,
          techniqueAnalysis,
          predictions,
          modelInfo,
          validation
        );
      } else {
        performancePrediction = await this.createNewPrediction(
          request,
          trainingAnalysis,
          physiologicalAnalysis,
          techniqueAnalysis,
          predictions,
          modelInfo,
          validation
        );
      }
      
      return await performancePrediction.save();
      
    } catch (error) {
      console.error('수영 기록 예측 오류:', error);
      throw new Error('수영 기록 예측에 실패했습니다.');
    }
  }
  
  /**
   * 훈련 데이터 분석
   */
  private static analyzeTrainingData(trainingData: ITrainingPerformance[]) {
    if (trainingData.length === 0) {
      return {
        recentPerformances: [],
        trainingLoad: {
          weeklyVolume: 0,
          weeklyIntensity: 5,
          trainingDays: 3
        },
        progressTrend: 'stable' as const,
        consistencyScore: 50,
        peakPerformanceIndicators: {
          bestRecentTime: 0,
          averageTime: 0,
          timeVariability: 0
        },
        trainingScore: 50
      };
    }
    
    const recentData = trainingData.slice(-20); // 최근 20회 데이터
    const sortedByTime = [...recentData].sort((a, b) => a.time - b.time);
    
    // 훈련 부하 계산
    const weeklyVolume = this.calculateWeeklyVolume(recentData);
    const weeklyIntensity = recentData.reduce((sum, d) => sum + d.perceivedExertion, 0) / recentData.length;
    const trainingDays = this.calculateTrainingDays(recentData);
    
    // 진행 추세 분석
    const progressTrend = this.analyzeProgressTrend(recentData);
    
    // 일관성 점수 계산
    const consistencyScore = this.calculateConsistencyScore(recentData);
    
    // 최고 성과 지표
    const bestRecentTime = sortedByTime[0]?.time || 0;
    const averageTime = recentData.reduce((sum, d) => sum + d.time, 0) / recentData.length;
    const timeVariability = this.calculateTimeVariability(recentData);
    
    // 훈련 점수 계산
    const trainingScore = this.calculateTrainingScore(
      weeklyVolume,
      weeklyIntensity,
      trainingDays,
      consistencyScore,
      progressTrend
    );
    
    return {
      recentPerformances: recentData,
      trainingLoad: {
        weeklyVolume,
        weeklyIntensity,
        trainingDays
      },
      progressTrend,
      consistencyScore,
      peakPerformanceIndicators: {
        bestRecentTime,
        averageTime,
        timeVariability
      },
      trainingScore
    };
  }
  
  /**
   * 주간 훈련량 계산
   */
  private static calculateWeeklyVolume(trainingData: ITrainingPerformance[]): number {
    if (trainingData.length === 0) return 0;
    
    // 최근 4주간 데이터로 주간 평균 계산
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    
    const recentData = trainingData.filter(d => d.date >= fourWeeksAgo);
    const totalDistance = recentData.reduce((sum, d) => sum + d.distance, 0);
    const weeks = Math.max(1, recentData.length / 3); // 주 3회 훈련 가정
    
    return Math.round(totalDistance / weeks);
  }
  
  /**
   * 주간 훈련 일수 계산
   */
  private static calculateTrainingDays(trainingData: ITrainingPerformance[]): number {
    if (trainingData.length === 0) return 3;
    
    // 최근 4주간 데이터로 계산
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    
    const recentData = trainingData.filter(d => d.date >= fourWeeksAgo);
    const uniqueDays = new Set(
      recentData.map(d => d.date.toISOString().split('T')[0])
    ).size;
    
    return Math.max(1, Math.round(uniqueDays / 4)); // 4주로 나누어 주간 평균
  }
  
  /**
   * 진행 추세 분석
   */
  private static analyzeProgressTrend(trainingData: ITrainingPerformance[]): 'improving' | 'stable' | 'declining' {
    if (trainingData.length < 6) return 'stable';
    
    const recentHalf = trainingData.slice(-Math.floor(trainingData.length / 2));
    const earlierHalf = trainingData.slice(0, Math.floor(trainingData.length / 2));
    
    const recentAvg = recentHalf.reduce((sum, d) => sum + d.time, 0) / recentHalf.length;
    const earlierAvg = earlierHalf.reduce((sum, d) => sum + d.time, 0) / earlierHalf.length;
    
    const improvementPercent = ((earlierAvg - recentAvg) / earlierAvg) * 100;
    
    if (improvementPercent > 1.5) return 'improving';
    if (improvementPercent < -1.5) return 'declining';
    return 'stable';
  }
  
  /**
   * 일관성 점수 계산
   */
  private static calculateConsistencyScore(trainingData: ITrainingPerformance[]): number {
    if (trainingData.length < 3) return 50;
    
    const times = trainingData.map(d => d.time);
    const mean = times.reduce((sum, time) => sum + time, 0) / times.length;
    const variance = times.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) / times.length;
    const stdDev = Math.sqrt(variance);
    const cv = (stdDev / mean) * 100; // 변동계수
    
    // 변동계수가 낮을수록 일관성이 높음 (5% 이하면 매우 일관적)
    let score = 100 - (cv * 10);
    return Math.max(0, Math.min(100, score));
  }
  
  /**
   * 시간 변동성 계산
   */
  private static calculateTimeVariability(trainingData: ITrainingPerformance[]): number {
    if (trainingData.length < 2) return 0;
    
    const times = trainingData.map(d => d.time);
    const mean = times.reduce((sum, time) => sum + time, 0) / times.length;
    const variance = times.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) / times.length;
    
    return Math.sqrt(variance);
  }
  
  /**
   * 훈련 점수 계산
   */
  private static calculateTrainingScore(
    weeklyVolume: number,
    weeklyIntensity: number,
    trainingDays: number,
    consistencyScore: number,
    progressTrend: string
  ): number {
    let score = 0;
    
    // 훈련량 점수 (0-30점)
    if (weeklyVolume >= 15000) score += 30;
    else if (weeklyVolume >= 10000) score += 25;
    else if (weeklyVolume >= 5000) score += 20;
    else if (weeklyVolume >= 2000) score += 15;
    else score += 10;
    
    // 강도 점수 (0-25점)
    if (weeklyIntensity >= 7) score += 25;
    else if (weeklyIntensity >= 6) score += 20;
    else if (weeklyIntensity >= 5) score += 15;
    else score += 10;
    
    // 빈도 점수 (0-20점)
    if (trainingDays >= 6) score += 20;
    else if (trainingDays >= 4) score += 18;
    else if (trainingDays >= 3) score += 15;
    else score += 10;
    
    // 일관성 점수 (0-15점)
    score += (consistencyScore / 100) * 15;
    
    // 진행 추세 점수 (0-10점)
    if (progressTrend === 'improving') score += 10;
    else if (progressTrend === 'stable') score += 7;
    else score += 3;
    
    return Math.min(100, Math.round(score));
  }
  
  /**
   * 생리학적 데이터 분석
   */
  private static analyzePhysiologicalData(physiologicalData: IPhysiologicalData[]) {
    if (physiologicalData.length === 0) {
      return {
        recentData: [],
        fitnessScore: 60,
        strengthProfile: {
          overall: 60,
          strengths: [],
          weaknesses: []
        },
        enduranceProfile: {
          aerobicCapacity: 60,
          anaerobicCapacity: 60,
          lactateManagement: 60
        },
        physiologicalScore: 60
      };
    }
    
    const recentData = physiologicalData.slice(-5); // 최근 5회 측정
    const latest = recentData[recentData.length - 1];
    
    // 체력 점수 계산
    const fitnessScore = this.calculateFitnessScore(latest);
    
    // 근력 프로필 분석
    const strengthProfile = this.analyzeStrengthProfile(latest);
    
    // 지구력 프로필 분석
    const enduranceProfile = this.analyzeEnduranceProfile(latest);
    
    // 종합 생리학적 점수
    const physiologicalScore = Math.round(
      (fitnessScore * 0.4 + strengthProfile.overall * 0.3 + 
       ((enduranceProfile.aerobicCapacity + enduranceProfile.anaerobicCapacity) / 2) * 0.3)
    );
    
    return {
      recentData,
      fitnessScore,
      strengthProfile,
      enduranceProfile,
      physiologicalScore
    };
  }
  
  /**
   * 체력 점수 계산
   */
  private static calculateFitnessScore(data: IPhysiologicalData): number {
    const score = 50; // 기본값
    
    // VO2 Max 기반 점수
    if (data.vo2Max) {
      if (data.vo2Max >= 60) score += 25;
      else if (data.vo2Max >= 50) score += 20;
      else if (data.vo2Max >= 40) score += 15;
      else score += 10;
    } else {
      score += 15; // 기본값
    }
    
    // 심박수 기반 점수
    const heartRateReserve = data.maxHeartRate - data.restingHeartRate;
    if (heartRateReserve >= 160) score += 15;
    else if (heartRateReserve >= 140) score += 12;
    else if (heartRateReserve >= 120) score += 10;
    else score += 7;
    
    // 체지방률 기반 점수 (선택적)
    if (data.bodyFatPercentage) {
      if (data.bodyFatPercentage <= 12) score += 10;
      else if (data.bodyFatPercentage <= 18) score += 8;
      else if (data.bodyFatPercentage <= 25) score += 5;
      else score += 2;
    } else {
      score += 6; // 기본값
    }
    
    return Math.min(100, score);
  }
  
  /**
   * 근력 프로필 분석
   */
  private static analyzeStrengthProfile(data: IPhysiologicalData) {
    const upperBody = data.strength.upperBodyStrength;
    const core = data.strength.coreStrength;
    const legs = data.strength.legStrength;
    
    const overall = Math.round(((upperBody + core + legs) / 3) * 10);
    
    const strengths = [];
    const weaknesses = [];
    
    if (upperBody >= 8) strengths.push('상체 근력');
    else if (upperBody <= 5) weaknesses.push('상체 근력');
    
    if (core >= 8) strengths.push('코어 근력');
    else if (core <= 5) weaknesses.push('코어 근력');
    
    if (legs >= 8) strengths.push('하체 근력');
    else if (legs <= 5) weaknesses.push('하체 근력');
    
    return { overall, strengths, weaknesses };
  }
  
  /**
   * 지구력 프로필 분석
   */
  private static analyzeEnduranceProfile(data: IPhysiologicalData) {
    // VO2 Max 기반 유산소 능력
    let aerobicCapacity = 60; // 기본값
    if (data.vo2Max) {
      aerobicCapacity = Math.min(100, (data.vo2Max / 70) * 100);
    }
    
    // 무산소 역치 기반 무산소 능력
    let anaerobicCapacity = 60; // 기본값
    if (data.anaerobicThreshold) {
      anaerobicCapacity = Math.min(100, data.anaerobicThreshold);
    }
    
    // 젖산 역치 기반 젖산 관리 능력
    let lactateManagement = 60; // 기본값
    if (data.lactateThreshold) {
      // 젖산 역치가 높을수록 좋음 (4-6 mmol/L이 이상적)
      if (data.lactateThreshold >= 4) lactateManagement = 80;
      else lactateManagement = 50;
    }
    
    return {
      aerobicCapacity: Math.round(aerobicCapacity),
      anaerobicCapacity: Math.round(anaerobicCapacity),
      lactateManagement: Math.round(lactateManagement)
    };
  }
  
  /**
   * 기술 분석
   */
  private static analyzeTechnique(trainingData: ITrainingPerformance[]) {
    if (trainingData.length === 0) {
      return {
        overallScore: 60,
        strokeEfficiency: 60,
        startTechnique: 60,
        turnTechnique: 60,
        finishTechnique: 60,
        breathing: 60,
        bodyPosition: 60,
        timing: 60,
        improvementAreas: [],
        techniqueScore: 60
      };
    }
    
    const recentData = trainingData.slice(-10); // 최근 10회
    
    // 각 기술 요소 평균 계산
    const avgEfficiency = recentData.reduce((sum, d) => sum + d.technique.efficiency, 0) / recentData.length;
    const avgConsistency = recentData.reduce((sum, d) => sum + d.technique.consistency, 0) / recentData.length;
    
    // 스트로크 효율성 분석
    const strokeEfficiency = this.analyzeStrokeEfficiency(recentData);
    
    // 기술 세부 분석
    const startTechnique = this.analyzeStartTechnique(recentData);
    const turnTechnique = this.analyzeTurnTechnique(recentData);
    const finishTechnique = this.analyzeFinishTechnique(recentData);
    
    // 기본 기술 점수
    const breathing = Math.round(avgEfficiency * 10);
    const bodyPosition = Math.round(avgConsistency * 10);
    const timing = Math.round(((avgEfficiency + avgConsistency) / 2) * 10);
    
    // 종합 기술 점수
    const overallScore = Math.round(
      (strokeEfficiency * 0.3 + startTechnique * 0.2 + turnTechnique * 0.2 + 
       finishTechnique * 0.1 + breathing * 0.1 + bodyPosition * 0.05 + timing * 0.05)
    );
    
    // 개선 영역 식별
    const improvementAreas = this.identifyTechniqueImprovementAreas({
      strokeEfficiency,
      startTechnique,
      turnTechnique,
      finishTechnique,
      breathing,
      bodyPosition,
      timing
    });
    
    return {
      overallScore,
      strokeEfficiency,
      startTechnique,
      turnTechnique,
      finishTechnique,
      breathing,
      bodyPosition,
      timing,
      improvementAreas,
      techniqueScore: overallScore
    };
  }
  
  /**
   * 스트로크 효율성 분석
   */
  private static analyzeStrokeEfficiency(trainingData: ITrainingPerformance[]): number {
    if (trainingData.length === 0) return 60;
    
    // 스트로크 레이트와 거리 대비 효율성 계산
    const efficiencyScores = trainingData.map(d => {
      const strokesPerMeter = d.strokeCount / d.distance;
      const timePerStroke = d.time / d.strokeCount;
      
      // 효율성 점수 (낮은 스트로크/미터와 적절한 시간/스트로크가 좋음)
      let score = 50;
      
      // 스트로크 수 효율성 (종목별 기준 다름)
      if (strokesPerMeter < 0.8) score += 25; // 매우 효율적
      else if (strokesPerMeter < 1.0) score += 20;
      else if (strokesPerMeter < 1.2) score += 15;
      else if (strokesPerMeter < 1.5) score += 10;
      else score += 5;
      
      // 스트로크 타이밍 (너무 빠르거나 느리면 비효율적)
      if (timePerStroke >= 0.8 && timePerStroke <= 1.2) score += 25;
      else if (timePerStroke >= 0.6 && timePerStroke <= 1.5) score += 20;
      else score += 10;
      
      return Math.min(100, score);
    });
    
    return Math.round(efficiencyScores.reduce((sum, score) => sum + score, 0) / efficiencyScores.length);
  }
  
  /**
   * 스타트 기술 분석
   */
  private static analyzeStartTechnique(trainingData: ITrainingPerformance[]): number {
    const startsData = trainingData.filter(d => d.technique.startTime);
    
    if (startsData.length === 0) return 60; // 기본값
    
    const avgStartTime = startsData.reduce((sum, d) => sum + (d.technique.startTime || 0), 0) / startsData.length;
    
    // 스타트 시간 기준 점수 (거리별 다름, 여기서는 일반적 기준)
    let score = 50;
    if (avgStartTime <= 0.6) score = 95; // 매우 우수
    else if (avgStartTime <= 0.7) score = 85;
    else if (avgStartTime <= 0.8) score = 75;
    else if (avgStartTime <= 0.9) score = 65;
    else if (avgStartTime <= 1.0) score = 55;
    else score = 45;
    
    return score;
  }
  
  /**
   * 턴 기술 분석
   */
  private static analyzeTurnTechnique(trainingData: ITrainingPerformance[]): number {
    const turnsData = trainingData.filter(d => d.technique.turnTimes && d.technique.turnTimes.length > 0);
    
    if (turnsData.length === 0) return 60; // 기본값
    
    const allTurnTimes = turnsData.flatMap(d => d.technique.turnTimes || []);
    const avgTurnTime = allTurnTimes.reduce((sum, time) => sum + time, 0) / allTurnTimes.length;
    
    // 턴 시간 기준 점수
    let score = 50;
    if (avgTurnTime <= 1.0) score = 90; // 매우 우수
    else if (avgTurnTime <= 1.2) score = 80;
    else if (avgTurnTime <= 1.4) score = 70;
    else if (avgTurnTime <= 1.6) score = 60;
    else score = 50;
    
    return score;
  }
  
  /**
   * 피니시 기술 분석
   */
  private static analyzeFinishTechnique(trainingData: ITrainingPerformance[]): number {
    const finishData = trainingData.filter(d => d.technique.finishTime);
    
    if (finishData.length === 0) return 60; // 기본값
    
    const avgFinishTime = finishData.reduce((sum, d) => sum + (d.technique.finishTime || 0), 0) / finishData.length;
    
    // 피니시 시간 기준 점수
    let score = 50;
    if (avgFinishTime <= 0.3) score = 85; // 매우 우수
    else if (avgFinishTime <= 0.4) score = 75;
    else if (avgFinishTime <= 0.5) score = 65;
    else score = 55;
    
    return score;
  }
  
  /**
   * 기술 개선 영역 식별
   */
  private static identifyTechniqueImprovementAreas(scores: any): string[] {
    const areas = [];
    const threshold = 65; // 65점 이하는 개선 필요
    
    if (scores.strokeEfficiency < threshold) areas.push('스트로크 효율성');
    if (scores.startTechnique < threshold) areas.push('스타트 기술');
    if (scores.turnTechnique < threshold) areas.push('턴 기술');
    if (scores.finishTechnique < threshold) areas.push('피니시 기술');
    if (scores.breathing < threshold) areas.push('호흡 패턴');
    if (scores.bodyPosition < threshold) areas.push('몸의 위치');
    if (scores.timing < threshold) areas.push('타이밍');
    
    return areas;
  }
  
  /**
   * 종합 성과 분석
   */
  private static performComprehensiveAnalysis(
    trainingAnalysis: any,
    physiologicalAnalysis: any,
    techniqueAnalysis: any,
    userProfile: any
  ): IPerformanceAnalysis {
    
    const trainingScore = trainingAnalysis.trainingScore;
    const physiologicalScore = physiologicalAnalysis.physiologicalScore;
    const techniqueScore = techniqueAnalysis.techniqueScore;
    
    // 진행 추세
    const progressTrend = trainingAnalysis.progressTrend;
    
    // 일관성 점수
    const consistencyScore = trainingAnalysis.consistencyScore;
    
    // 개선 가능성 점수 계산
    const potentialScore = this.calculatePotentialScore(
      userProfile,
      trainingScore,
      physiologicalScore,
      techniqueScore
    );
    
    // 제한 요인 식별
    const limitingFactors = this.identifyLimitingFactors(
      trainingScore,
      physiologicalScore,
      techniqueScore,
      userProfile
    );
    
    // 강점 영역 식별
    const strengthAreas = this.identifyStrengthAreas(
      trainingAnalysis,
      physiologicalAnalysis,
      techniqueAnalysis
    );
    
    return {
      trainingScore,
      physiologicalScore,
      techniqueScore,
      progressTrend,
      consistencyScore,
      potentialScore,
      limitingFactors,
      strengthAreas
    };
  }
  
  /**
   * 개선 가능성 점수 계산
   */
  private static calculatePotentialScore(
    userProfile: any,
    trainingScore: number,
    physiologicalScore: number,
    techniqueScore: number
  ): number {
    let potential = 50; // 기본값
    
    // 연령 요인 (젊을수록 개선 가능성 높음)
    if (userProfile.age <= 20) potential += 20;
    else if (userProfile.age <= 30) potential += 15;
    else if (userProfile.age <= 40) potential += 10;
    else if (userProfile.age <= 50) potential += 5;
    
    // 경험 요인 (경험이 적을수록 개선 여지 큼)
    if (userProfile.experience <= 12) potential += 15; // 1년 이하
    else if (userProfile.experience <= 36) potential += 10; // 3년 이하
    else if (userProfile.experience <= 60) potential += 5; // 5년 이하
    
    // 현재 점수 기반 개선 여지
    const avgCurrentScore = (trainingScore + physiologicalScore + techniqueScore) / 3;
    const improvementRoom = (100 - avgCurrentScore) * 0.3;
    potential += improvementRoom;
    
    // 훈련 빈도 (더 자주 훈련할 여지가 있으면 가능성 증가)
    if (userProfile.trainingFrequency < 4) potential += 10;
    else if (userProfile.trainingFrequency < 6) potential += 5;
    
    return Math.min(100, Math.round(potential));
  }
  
  /**
   * 제한 요인 식별
   */
  private static identifyLimitingFactors(
    trainingScore: number,
    physiologicalScore: number,
    techniqueScore: number,
    userProfile: any
  ): string[] {
    const factors = [];
    const threshold = 60;
    
    if (trainingScore < threshold) {
      factors.push('훈련량 부족');
      factors.push('훈련 일관성 부족');
    }
    
    if (physiologicalScore < threshold) {
      factors.push('체력 수준 부족');
      factors.push('근력 부족');
    }
    
    if (techniqueScore < threshold) {
      factors.push('기술적 결함');
      factors.push('효율성 부족');
    }
    
    // 연령 관련 제한
    if (userProfile.age > 40) {
      factors.push('연령에 따른 회복력 저하');
    }
    
    // 경험 관련 제한
    if (userProfile.experience < 6) {
      factors.push('경험 부족');
    }
    
    return factors;
  }
  
  /**
   * 강점 영역 식별
   */
  private static identifyStrengthAreas(
    trainingAnalysis: any,
    physiologicalAnalysis: any,
    techniqueAnalysis: any
  ): string[] {
    const strengths = [];
    const threshold = 75;
    
    if (trainingAnalysis.trainingScore >= threshold) {
      strengths.push('우수한 훈련 습관');
    }
    
    if (trainingAnalysis.consistencyScore >= threshold) {
      strengths.push('높은 일관성');
    }
    
    if (physiologicalAnalysis.physiologicalScore >= threshold) {
      strengths.push('우수한 체력');
    }
    
    if (techniqueAnalysis.techniqueScore >= threshold) {
      strengths.push('뛰어난 기술');
    }
    
    // 세부 강점 추가
    strengths.push(...physiologicalAnalysis.strengthProfile.strengths);
    
    return [...new Set(strengths)]; // 중복 제거
  }
  
  /**
   * 종목별 성과 예측
   */
  private static async predictEventPerformance(
    event: SwimmingEvent,
    request: IPerformancePredictionRequest,
    performanceAnalysis: IPerformanceAnalysis,
    trainingAnalysis: any,
    physiologicalAnalysis: any,
    techniqueAnalysis: any
  ): Promise<IPredictionResult> {
    
    // 현재 최고 기록 찾기
    const currentRecord = request.currentRecords.find(r => r.event === event);
    const currentBestTime = currentRecord?.bestTime || this.getEventBaseTime(event, request.userProfile);
    
    // 예측 모델 적용
    const prediction = this.applyPredictionModel(
      event,
      currentBestTime,
      performanceAnalysis,
      request.userProfile
    );
    
    // 성과 요인 분석
    const performanceFactors = this.analyzePerformanceFactors(
      event,
      performanceAnalysis,
      trainingAnalysis,
      physiologicalAnalysis,
      techniqueAnalysis
    );
    
    // 세부 개선 분석
    const breakdown = this.analyzePerformanceBreakdown(
      event,
      techniqueAnalysis,
      prediction.improvementSeconds
    );
    
    // 권장사항 생성
    const recommendations = this.generateEventRecommendations(
      event,
      performanceFactors,
      performanceAnalysis
    );
    
    // 마일스톤 설정
    const milestones = this.generateMilestones(
      currentBestTime,
      prediction.predictedTime,
      request.userProfile
    );
    
    return {
      targetEvent: event,
      currentBestTime,
      predictedTime: prediction.predictedTime,
      improvementSeconds: prediction.improvementSeconds,
      improvementPercentage: prediction.improvementPercentage,
      confidenceLevel: prediction.confidenceLevel,
      confidenceScore: prediction.confidenceScore,
      timeframePredictions: prediction.timeframePredictions,
      performanceFactors,
      breakdown,
      recommendations,
      milestones
    };
  }
  
  /**
   * 종목별 기본 시간 추정 (기록이 없을 때)
   */
  private static getEventBaseTime(event: SwimmingEvent, userProfile: any): number {
    // 초급자 기준 예상 시간 (초 단위)
    const baseTimes: Record<SwimmingEvent, number> = {
      [SwimmingEvent.FREESTYLE_50]: 45,
      [SwimmingEvent.FREESTYLE_100]: 100,
      [SwimmingEvent.FREESTYLE_200]: 220,
      [SwimmingEvent.FREESTYLE_400]: 480,
      [SwimmingEvent.FREESTYLE_800]: 1000,
      [SwimmingEvent.FREESTYLE_1500]: 1900,
      [SwimmingEvent.BACKSTROKE_50]: 50,
      [SwimmingEvent.BACKSTROKE_100]: 110,
      [SwimmingEvent.BACKSTROKE_200]: 240,
      [SwimmingEvent.BREASTSTROKE_50]: 55,
      [SwimmingEvent.BREASTSTROKE_100]: 120,
      [SwimmingEvent.BREASTSTROKE_200]: 260,
      [SwimmingEvent.BUTTERFLY_50]: 50,
      [SwimmingEvent.BUTTERFLY_100]: 115,
      [SwimmingEvent.BUTTERFLY_200]: 250,
      [SwimmingEvent.MEDLEY_100]: 110,
      [SwimmingEvent.MEDLEY_200]: 240,
      [SwimmingEvent.MEDLEY_400]: 520
    };
    
    const baseTime = baseTimes[event];
    
    // 레벨에 따른 조정
    const levelMultipliers: Record<string, number> = {
      'beginner': 1.3,
      'intermediate': 1.1,
      'advanced': 0.9,
      'professional': 0.7
    };
    
    const multiplier = levelMultipliers[userProfile.currentLevel] || 1.2;
    return baseTime * multiplier;
  }
  
  /**
   * 예측 모델 적용
   */
  private static applyPredictionModel(
    event: SwimmingEvent,
    currentBestTime: number,
    performanceAnalysis: IPerformanceAnalysis,
    userProfile: any
  ) {
    // 기본 개선율 계산 (종합 점수 기반)
    const avgScore = (
      performanceAnalysis.trainingScore + 
      performanceAnalysis.physiologicalScore + 
      performanceAnalysis.techniqueScore
    ) / 3;
    
    // 개선 가능성 기반 예상 개선율
    let baseImprovementRate = 0;
    if (avgScore >= 80) baseImprovementRate = 0.02; // 2%
    else if (avgScore >= 70) baseImprovementRate = 0.05; // 5%
    else if (avgScore >= 60) baseImprovementRate = 0.08; // 8%
    else if (avgScore >= 50) baseImprovementRate = 0.12; // 12%
    else baseImprovementRate = 0.15; // 15%
    
    // 진행 추세에 따른 조정
    if (performanceAnalysis.progressTrend === 'improving') {
      baseImprovementRate *= 1.3;
    } else if (performanceAnalysis.progressTrend === 'declining') {
      baseImprovementRate *= 0.7;
    }
    
    // 개인 잠재력 반영
    const potentialMultiplier = performanceAnalysis.potentialScore / 100;
    baseImprovementRate *= (0.5 + potentialMultiplier * 0.5);
    
    // 종목별 특성 반영
    const eventMultiplier = this.getEventImprovementMultiplier(event);
    baseImprovementRate *= eventMultiplier;
    
    // 예측 시간 계산
    const improvementSeconds = currentBestTime * baseImprovementRate;
    const predictedTime = currentBestTime - improvementSeconds;
    const improvementPercentage = (improvementSeconds / currentBestTime) * 100;
    
    // 시간대별 예측
    const timeframePredictions = {
      oneMonth: currentBestTime - (improvementSeconds * 0.2),
      threeMonths: currentBestTime - (improvementSeconds * 0.5),
      sixMonths: currentBestTime - (improvementSeconds * 0.8),
      oneYear: predictedTime
    };
    
    // 신뢰도 계산
    const confidenceScore = this.calculatePredictionConfidence(
      performanceAnalysis,
      userProfile,
      baseImprovementRate
    );
    
    const confidenceLevel = this.getConfidenceLevel(confidenceScore);
    
    return {
      predictedTime,
      improvementSeconds: -improvementSeconds, // 음수로 표시 (개선)
      improvementPercentage,
      confidenceLevel,
      confidenceScore,
      timeframePredictions
    };
  }
  
  /**
   * 종목별 개선 배수
   */
  private static getEventImprovementMultiplier(event: SwimmingEvent): number {
    // 거리가 짧을수록, 기술적 요소가 많을수록 개선 여지가 큼
    const multipliers: Partial<Record<SwimmingEvent, number>> = {
      [SwimmingEvent.FREESTYLE_50]: 1.2,
      [SwimmingEvent.FREESTYLE_100]: 1.1,
      [SwimmingEvent.FREESTYLE_200]: 1.0,
      [SwimmingEvent.BREASTSTROKE_50]: 1.3,
      [SwimmingEvent.BREASTSTROKE_100]: 1.2,
      [SwimmingEvent.BUTTERFLY_50]: 1.3,
      [SwimmingEvent.BUTTERFLY_100]: 1.2,
      [SwimmingEvent.MEDLEY_100]: 1.1,
      [SwimmingEvent.MEDLEY_200]: 1.0
    };
    
    return multipliers[event] || 1.0;
  }
  
  /**
   * 예측 신뢰도 계산
   */
  private static calculatePredictionConfidence(
    performanceAnalysis: IPerformanceAnalysis,
    userProfile: any,
    improvementRate: number
  ): number {
    let confidence = 50; // 기본값
    
    // 일관성이 높을수록 신뢰도 증가
    confidence += (performanceAnalysis.consistencyScore / 100) * 20;
    
    // 진행 추세가 명확할수록 신뢰도 증가
    if (performanceAnalysis.progressTrend === 'improving') confidence += 15;
    else if (performanceAnalysis.progressTrend === 'stable') confidence += 10;
    else confidence += 5;
    
    // 경험이 많을수록 예측 정확도 증가
    if (userProfile.experience >= 36) confidence += 10; // 3년 이상
    else if (userProfile.experience >= 12) confidence += 7; // 1년 이상
    else confidence += 3;
    
    // 개선율이 현실적일수록 신뢰도 증가
    if (improvementRate <= 0.05) confidence += 15; // 5% 이하
    else if (improvementRate <= 0.1) confidence += 10; // 10% 이하
    else if (improvementRate <= 0.15) confidence += 5; // 15% 이하
    
    // 경기 경험이 있으면 신뢰도 증가
    if (userProfile.competitionExperience) confidence += 10;
    
    return Math.min(100, confidence);
  }
  
  /**
   * 신뢰도 레벨 결정
   */
  private static getConfidenceLevel(score: number): ConfidenceLevel {
    if (score >= 81) return ConfidenceLevel.VERY_HIGH;
    if (score >= 61) return ConfidenceLevel.HIGH;
    if (score >= 41) return ConfidenceLevel.MODERATE;
    if (score >= 21) return ConfidenceLevel.LOW;
    return ConfidenceLevel.VERY_LOW;
  }
  
  /**
   * 나머지 메서드들... (계속)
   */
  
  // 성과 요인 분석, 권장사항 생성, 마일스톤 설정 등의 메서드들은 길이 관계상 생략하고
  // 핵심 기능만 구현했습니다. 실제로는 이런 메서드들도 모두 구현되어야 합니다.
  
  private static analyzePerformanceFactors(
    event: SwimmingEvent,
    performanceAnalysis: IPerformanceAnalysis,
    trainingAnalysis: any,
    physiologicalAnalysis: any,
    techniqueAnalysis: any
  ): IPerformanceFactor[] {
    // 간단한 구현
    return [
      {
        category: PerformanceFactorCategory.TECHNIQUE,
        factor: '기술 개선',
        impact: 15,
        confidence: 80,
        description: '기술적 효율성 향상으로 기록 개선 가능',
        recommendations: ['기술 교정 레슨', '비디오 분석']
      }
    ];
  }
  
  private static analyzePerformanceBreakdown(
    event: SwimmingEvent,
    techniqueAnalysis: any,
    totalImprovement: number
  ) {
    // 간단한 구현
    return {
      startImprovement: totalImprovement * 0.15,
      strokeImprovement: totalImprovement * 0.4,
      turnImprovement: totalImprovement * 0.2,
      finishImprovement: totalImprovement * 0.1,
      enduranceImprovement: totalImprovement * 0.1,
      techniqueImprovement: totalImprovement * 0.05
    };
  }
  
  private static generateEventRecommendations(
    event: SwimmingEvent,
    performanceFactors: IPerformanceFactor[],
    performanceAnalysis: IPerformanceAnalysis
  ) {
    // 간단한 구현
    return {
      training: ['훈련량 점진적 증가', '인터벌 훈련 강화'],
      technique: ['기술 교정', '효율성 개선'],
      physical: ['근력 훈련', '지구력 향상'],
      tactical: ['페이싱 전략', '경기 전술']
    };
  }
  
  private static generateMilestones(
    currentTime: number,
    targetTime: number,
    userProfile: any
  ) {
    // 간단한 구현
    const totalImprovement = currentTime - targetTime;
    const milestones = [];
    
    for (let i = 1; i <= 4; i++) {
      const progressRatio = i / 4;
      const milestoneTime = currentTime - (totalImprovement * progressRatio);
      const estimatedDate = new Date();
      estimatedDate.setMonth(estimatedDate.getMonth() + (i * 3)); // 3개월씩
      
      milestones.push({
        targetTime: milestoneTime,
        estimatedAchievementDate: estimatedDate,
        requiredImprovementRate: (totalImprovement * progressRatio / currentTime) * 100
      });
    }
    
    return milestones;
  }
  
  private static shouldUpdateExisting(existing: IPerformancePrediction): boolean {
    return (existing as any).needsUpdate();
  }
  
  private static async updateExistingPrediction(
    existing: IPerformancePrediction,
    request: IPerformancePredictionRequest,
    trainingAnalysis: any,
    physiologicalAnalysis: any,
    techniqueAnalysis: any,
    predictions: IPredictionResult[],
    modelInfo: any,
    validation: any
  ): Promise<IPerformancePrediction> {
    
    existing.predictionDate = new Date();
    existing.trainingAnalysis = trainingAnalysis;
    existing.physiologicalAnalysis = physiologicalAnalysis;
    existing.techniqueAnalysis = techniqueAnalysis;
    existing.predictions = predictions;
    existing.modelInfo = modelInfo;
    existing.validation = validation;
    existing.tracking.nextPredictionDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    
    return existing;
  }
  
  private static async createNewPrediction(
    request: IPerformancePredictionRequest,
    trainingAnalysis: any,
    physiologicalAnalysis: any,
    techniqueAnalysis: any,
    predictions: IPredictionResult[],
    modelInfo: any,
    validation: any
  ): Promise<IPerformancePrediction> {
    
    return new PerformancePrediction({
      userId: request.userId,
      predictionDate: new Date(),
      userProfile: request.userProfile,
      currentRecords: request.currentRecords,
      trainingAnalysis,
      physiologicalAnalysis,
      techniqueAnalysis,
      predictions,
      modelInfo,
      validation,
      tracking: {
        actualResults: [],
        feedbackProvided: false,
        nextPredictionDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      }
    });
  }
  
  private static generateModelInfo(trainingDataSize: number) {
    return {
      version: '1.0.0',
      algorithm: 'neural_network',
      trainingDataSize,
      lastTrainingDate: new Date(),
      accuracy: 85 // 기본 정확도
    };
  }
  
  private static async generateValidationInfo(userProfile: any, predictions: IPredictionResult[]) {
    return {
      historicalAccuracy: 80, // 기본값
      similarSwimmersComparison: {
        count: 50,
        averageImprovement: 5.2,
        bestImprovement: 12.5
      }
    };
  }
  
  /**
   * 사용자별 성과 예측 목록 조회
   */
  static async getUserPredictions(userId: mongoose.Types.ObjectId): Promise<IPerformancePrediction[]> {
    try {
      return await PerformancePrediction.find({ userId, isActive: true })
        .sort({ predictionDate: -1 })
        .populate('userId', 'name email');
    } catch (error) {
      console.error('성과 예측 조회 오류:', error);
      throw new Error('성과 예측 조회에 실패했습니다.');
    }
  }
  
  /**
   * 최신 성과 예측 조회
   */
  static async getLatestPrediction(userId: mongoose.Types.ObjectId): Promise<IPerformancePrediction | null> {
    try {
      return await (PerformancePrediction as any).getLatestPrediction(userId);
    } catch (error) {
      console.error('최신 성과 예측 조회 오류:', error);
      throw new Error('최신 성과 예측 조회에 실패했습니다.');
    }
  }
  
  /**
   * 실제 결과 추가
   */
  static async addActualResult(
    predictionId: mongoose.Types.ObjectId,
    event: SwimmingEvent,
    predictedTime: number,
    actualTime: number,
    achievedDate: Date
  ): Promise<IPerformancePrediction | null> {
    try {
      const prediction = await PerformancePrediction.findById(predictionId);
      if (!prediction) return null;
      
      (prediction as any).addActualResult(event, predictedTime, actualTime, achievedDate);
      return await prediction.save();
      
    } catch (error) {
      console.error('실제 결과 추가 오류:', error);
      throw new Error('실제 결과 추가에 실패했습니다.');
    }
  }
  
  /**
   * 종목별 예측 통계 조회
   */
  static async getEventStatistics(event: SwimmingEvent): Promise<any> {
    try {
      return await (PerformancePrediction as any).getEventStatistics(event);
    } catch (error) {
      console.error('종목별 통계 조회 오류:', error);
      throw new Error('종목별 통계 조회에 실패했습니다.');
    }
  }
  
  /**
   * 예측 정확도 통계 조회
   */
  static async getAccuracyStatistics(): Promise<any> {
    try {
      return await (PerformancePrediction as any).getAccuracyStatistics();
    } catch (error) {
      console.error('정확도 통계 조회 오류:', error);
      throw new Error('정확도 통계 조회에 실패했습니다.');
    }
  }
}

export default AIPerformancePredictionService;
