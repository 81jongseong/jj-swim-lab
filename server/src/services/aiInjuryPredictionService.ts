/**
 * AI 기반 부상 위험 예측 서비스
 * 운동 패턴, 생체역학, 회복 데이터 분석을 통한 부상 위험도 계산
 */

import mongoose from 'mongoose';
import { 
  InjuryPrediction, 
  IInjuryPrediction, 
  InjuryRiskLevel, 
  InjuryType, 
  RiskFactorCategory,
  IRiskFactor,
  ITrainingLoad,
  IBiomechanicalData,
  IRecoveryData,
  IPredictionResult
} from '../models/InjuryPrediction';

// 부상 위험 평가 요청 인터페이스
export interface IInjuryAssessmentRequest {
  userId: mongoose.Types.ObjectId;
  userProfile: {
    age: number;
    weight: number;
    height: number;
    experience: number;
    currentLevel: string;
    medicalHistory: string[];
    previousInjuries: any[];
  };
  trainingData: ITrainingLoad[];
  biomechanicalData: IBiomechanicalData[];
  recoveryData: IRecoveryData[];
  environmentalFactors: {
    poolConditions: {
      temperature: number;
      chlorineLevel: number;
      crowdedness: number;
    };
    equipmentCondition: number;
    coachingQuality: number;
    trainingEnvironment: number;
  };
}

// AI 분석 결과 인터페이스
interface IAnalysisResult {
  trainingLoadRisk: number; // 0-100
  biomechanicalRisk: number; // 0-100
  recoveryRisk: number; // 0-100
  environmentalRisk: number; // 0-100
  historicalRisk: number; // 0-100
  overallRisk: number; // 0-100
  riskFactors: IRiskFactor[];
  confidenceScore: number; // 0-100
}

export class AIInjuryPredictionService {
  
  /**
   * AI 기반 부상 위험 예측 수행
   */
  static async predictInjuryRisk(request: IInjuryAssessmentRequest): Promise<IInjuryPrediction> {
    try {
      // 1. 기존 예측 기록 확인
      const existingPrediction = await InjuryPrediction.findOne({
        userId: request.userId,
        isActive: true
      }).sort({ assessmentDate: -1 });
      
      // 2. 훈련 부하 분석
      const trainingAnalysis = this.analyzeTrainingLoad(request.trainingData);
      
      // 3. 생체역학 분석
      const biomechanicalAnalysis = this.analyzeBiomechanics(request.biomechanicalData);
      
      // 4. 회복 분석
      const recoveryAnalysis = this.analyzeRecovery(request.recoveryData);
      
      // 5. 종합 AI 분석 수행
      const aiAnalysis = this.performComprehensiveAnalysis(
        request.userProfile,
        trainingAnalysis,
        biomechanicalAnalysis,
        recoveryAnalysis,
        request.environmentalFactors
      );
      
      // 6. 부상 유형별 예측
      const injuryTypePredictions = this.predictInjuryTypes(aiAnalysis, request.userProfile);
      
      // 7. 권장사항 생성
      const recommendations = this.generateRecommendations(aiAnalysis, injuryTypePredictions);
      
      // 8. 예측 결과 객체 생성
      const prediction: IPredictionResult = {
        overallRisk: aiAnalysis.overallRisk,
        riskLevel: this.calculateRiskLevel(aiAnalysis.overallRisk),
        confidenceScore: aiAnalysis.confidenceScore,
        primaryRiskFactors: aiAnalysis.riskFactors.slice(0, 5), // 상위 5개
        injuryTypePredictions,
        recommendations,
        monitoringPoints: this.generateMonitoringPoints(aiAnalysis)
      };
      
      // 9. 부상 예측 기록 생성 또는 업데이트
      let injuryPrediction: IInjuryPrediction;
      
      if (existingPrediction && this.shouldUpdateExisting(existingPrediction)) {
        // 기존 기록 업데이트
        injuryPrediction = await this.updateExistingPrediction(
          existingPrediction,
          request,
          trainingAnalysis,
          biomechanicalAnalysis,
          recoveryAnalysis,
          prediction
        );
      } else {
        // 새로운 기록 생성
        injuryPrediction = await this.createNewPrediction(
          request,
          trainingAnalysis,
          biomechanicalAnalysis,
          recoveryAnalysis,
          prediction
        );
      }
      
      // 10. 고위험 시 알림 생성
      if (prediction.riskLevel === InjuryRiskLevel.HIGH || prediction.riskLevel === InjuryRiskLevel.VERY_HIGH) {
        (injuryPrediction as any).generateAlert(
          prediction.riskLevel === InjuryRiskLevel.VERY_HIGH ? 'critical' : 'warning',
          `부상 위험도가 ${prediction.riskLevel}로 평가되었습니다. 즉시 조치가 필요합니다.`
        );
      }
      
      return await injuryPrediction.save();
      
    } catch (error) {
      console.error('부상 위험 예측 오류:', error);
      throw new Error('부상 위험 예측에 실패했습니다.');
    }
  }
  
  /**
   * 훈련 부하 분석
   */
  private static analyzeTrainingLoad(trainingData: ITrainingLoad[]) {
    if (trainingData.length === 0) {
      return {
        recentLoads: [],
        averageWeeklyLoad: 0,
        loadTrend: 'stable' as const,
        acuteChronicRatio: 1.0,
        loadSpikes: [],
        riskScore: 50 // 중간값
      };
    }
    
    // 최근 4주간 데이터 분석
    const recentData = trainingData.slice(-28);
    const weeklyLoads = this.calculateWeeklyLoads(recentData);
    
    // 급성:만성 부하 비율 계산 (최근 1주 vs 최근 4주 평균)
    const acuteLoad = weeklyLoads.slice(-1)[0] || 0;
    const chronicLoad = weeklyLoads.reduce((sum, load) => sum + load, 0) / weeklyLoads.length;
    const acuteChronicRatio = chronicLoad > 0 ? acuteLoad / chronicLoad : 1.0;
    
    // 부하 급증 감지
    const loadSpikes = this.detectLoadSpikes(recentData);
    
    // 트렌드 분석
    const loadTrend = this.analyzeLoadTrend(weeklyLoads);
    
    // 위험 점수 계산
    let riskScore = 0;
    
    // 급성:만성 비율 위험도 (이상적: 0.8-1.3)
    if (acuteChronicRatio > 1.5) riskScore += 30;
    else if (acuteChronicRatio > 1.3) riskScore += 15;
    else if (acuteChronicRatio < 0.5) riskScore += 20;
    
    // 부하 급증 위험도
    riskScore += loadSpikes.length * 10;
    
    // 트렌드 위험도
    if (loadTrend === 'increasing') riskScore += 10;
    
    // 과도한 훈련량 체크
    const avgIntensity = recentData.reduce((sum, d) => sum + d.intensity, 0) / recentData.length;
    const avgDuration = recentData.reduce((sum, d) => sum + d.duration, 0) / recentData.length;
    
    if (avgIntensity > 8 && avgDuration > 120) riskScore += 20;
    
    return {
      recentLoads: recentData,
      averageWeeklyLoad: chronicLoad,
      loadTrend,
      acuteChronicRatio,
      loadSpikes,
      riskScore: Math.min(riskScore, 100)
    };
  }
  
  /**
   * 주간 훈련 부하 계산
   */
  private static calculateWeeklyLoads(trainingData: ITrainingLoad[]): number[] {
    const weeklyLoads: number[] = [];
    const sortedData = trainingData.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    if (sortedData.length === 0) return weeklyLoads;
    
    const startDate = new Date(sortedData[0].date);
    const endDate = new Date(sortedData[sortedData.length - 1].date);
    
    // 주별로 그룹화
    for (let weekStart = new Date(startDate); weekStart <= endDate; weekStart.setDate(weekStart.getDate() + 7)) {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      const weekData = sortedData.filter(d => 
        d.date >= weekStart && d.date <= weekEnd
      );
      
      // 주간 부하 계산 (강도 × 시간 × 빈도)
      const weeklyLoad = weekData.reduce((sum, session) => {
        return sum + (session.intensity * session.duration * (session.volume / 1000));
      }, 0);
      
      weeklyLoads.push(weeklyLoad);
    }
    
    return weeklyLoads;
  }
  
  /**
   * 부하 급증 감지
   */
  private static detectLoadSpikes(trainingData: ITrainingLoad[]) {
    const spikes = [];
    
    for (let i = 1; i < trainingData.length; i++) {
      const current = trainingData[i];
      const previous = trainingData[i - 1];
      
      // 강도 급증 (50% 이상)
      if (current.intensity / previous.intensity > 1.5) {
        spikes.push({
          date: current.date,
          magnitude: (current.intensity / previous.intensity - 1) * 100,
          type: 'intensity' as const
        });
      }
      
      // 시간 급증 (100% 이상)
      if (current.duration / previous.duration > 2.0) {
        spikes.push({
          date: current.date,
          magnitude: (current.duration / previous.duration - 1) * 100,
          type: 'duration' as const
        });
      }
      
      // 볼륨 급증 (150% 이상)
      if (current.volume / previous.volume > 2.5) {
        spikes.push({
          date: current.date,
          magnitude: (current.volume / previous.volume - 1) * 100,
          type: 'volume' as const
        });
      }
    }
    
    return spikes;
  }
  
  /**
   * 부하 트렌드 분석
   */
  private static analyzeLoadTrend(weeklyLoads: number[]): 'increasing' | 'stable' | 'decreasing' {
    if (weeklyLoads.length < 2) return 'stable';
    
    const recentWeeks = weeklyLoads.slice(-3);
    const earlierWeeks = weeklyLoads.slice(-6, -3);
    
    if (recentWeeks.length === 0 || earlierWeeks.length === 0) return 'stable';
    
    const recentAvg = recentWeeks.reduce((sum, load) => sum + load, 0) / recentWeeks.length;
    const earlierAvg = earlierWeeks.reduce((sum, load) => sum + load, 0) / earlierWeeks.length;
    
    const changePercent = ((recentAvg - earlierAvg) / earlierAvg) * 100;
    
    if (changePercent > 20) return 'increasing';
    if (changePercent < -20) return 'decreasing';
    return 'stable';
  }
  
  /**
   * 생체역학 분석
   */
  private static analyzeBiomechanics(biomechanicalData: IBiomechanicalData[]) {
    if (biomechanicalData.length === 0) {
      return {
        recentData: [],
        techniqueScore: 70,
        asymmetryIssues: [],
        movementPatterns: [],
        riskScore: 30
      };
    }
    
    const recentData = biomechanicalData.slice(-10); // 최근 10회 데이터
    
    // 기술 점수 계산
    const avgEfficiency = recentData.reduce((sum, d) => sum + d.strokeEfficiency, 0) / recentData.length;
    const avgPosition = recentData.reduce((sum, d) => sum + d.bodyPosition, 0) / recentData.length;
    const avgBreathing = recentData.reduce((sum, d) => sum + d.breathingPattern, 0) / recentData.length;
    const avgSymmetry = recentData.reduce((sum, d) => sum + d.symmetry, 0) / recentData.length;
    
    const techniqueScore = Math.round(((avgEfficiency + avgPosition + avgBreathing + avgSymmetry) / 4) * 10);
    
    // 비대칭성 문제 식별
    const asymmetryIssues = [];
    if (avgSymmetry < 6) {
      asymmetryIssues.push('좌우 스트로크 불균형');
    }
    
    const avgFlexibility = recentData.reduce((sum, d) => sum + d.flexibility, 0) / recentData.length;
    if (avgFlexibility < 6) {
      asymmetryIssues.push('유연성 부족');
    }
    
    // 움직임 패턴 분석
    const movementPatterns = [
      {
        pattern: '스트로크 효율성',
        quality: Math.round(avgEfficiency),
        riskLevel: Math.round(10 - avgEfficiency)
      },
      {
        pattern: '몸의 위치',
        quality: Math.round(avgPosition),
        riskLevel: Math.round(10 - avgPosition)
      },
      {
        pattern: '호흡 패턴',
        quality: Math.round(avgBreathing),
        riskLevel: Math.round(10 - avgBreathing)
      }
    ];
    
    // 위험 점수 계산
    let riskScore = 0;
    
    if (techniqueScore < 50) riskScore += 40;
    else if (techniqueScore < 70) riskScore += 20;
    
    riskScore += asymmetryIssues.length * 15;
    
    // 스트로크 레이트 변동성
    const strokeRates = recentData.map(d => d.strokeRate);
    const strokeRateVariability = this.calculateVariability(strokeRates);
    if (strokeRateVariability > 20) riskScore += 15;
    
    return {
      recentData,
      techniqueScore,
      asymmetryIssues,
      movementPatterns,
      riskScore: Math.min(riskScore, 100)
    };
  }
  
  /**
   * 회복 분석
   */
  private static analyzeRecovery(recoveryData: IRecoveryData[]) {
    if (recoveryData.length === 0) {
      return {
        recentData: [],
        recoveryScore: 70,
        sleepDebt: 0,
        stressAccumulation: 50,
        fatigueLevel: 50,
        riskScore: 30
      };
    }
    
    const recentData = recoveryData.slice(-14); // 최근 2주 데이터
    
    // 수면 분석
    const avgSleepHours = recentData.reduce((sum, d) => sum + d.sleepHours, 0) / recentData.length;
    const avgSleepQuality = recentData.reduce((sum, d) => sum + d.sleepQuality, 0) / recentData.length;
    const sleepDebt = Math.max(0, (8 - avgSleepHours) * recentData.length); // 권장 8시간 기준
    
    // 스트레스 누적
    const avgStress = recentData.reduce((sum, d) => sum + d.stressLevel, 0) / recentData.length;
    const stressAccumulation = Math.min(100, avgStress * 10);
    
    // 피로도
    const avgFatigue = recentData.reduce((sum, d) => sum + d.fatigue, 0) / recentData.length;
    const fatigueLevel = Math.min(100, avgFatigue * 10);
    
    // 근육통
    const avgSoreness = recentData.reduce((sum, d) => sum + d.soreness, 0) / recentData.length;
    
    // 영양 및 수분 섭취
    const avgNutrition = recentData.reduce((sum, d) => sum + d.nutrition, 0) / recentData.length;
    const avgHydration = recentData.reduce((sum, d) => sum + d.hydration, 0) / recentData.length;
    
    // 회복 점수 계산
    const recoveryScore = Math.round(
      (avgSleepQuality * 0.3 + 
       (10 - avgStress) * 0.2 + 
       (10 - avgFatigue) * 0.2 + 
       (10 - avgSoreness) * 0.15 + 
       avgNutrition * 0.075 + 
       avgHydration * 0.075) * 10
    );
    
    // 위험 점수 계산
    let riskScore = 0;
    
    if (sleepDebt > 10) riskScore += 30;
    else if (sleepDebt > 5) riskScore += 15;
    
    if (avgStress > 7) riskScore += 20;
    if (avgFatigue > 7) riskScore += 20;
    if (avgSoreness > 7) riskScore += 15;
    
    if (avgNutrition < 6) riskScore += 10;
    if (avgHydration < 6) riskScore += 10;
    
    return {
      recentData,
      recoveryScore,
      sleepDebt,
      stressAccumulation,
      fatigueLevel,
      riskScore: Math.min(riskScore, 100)
    };
  }
  
  /**
   * 종합 AI 분석 수행
   */
  private static performComprehensiveAnalysis(
    userProfile: any,
    trainingAnalysis: any,
    biomechanicalAnalysis: any,
    recoveryAnalysis: any,
    environmentalFactors: any
  ): IAnalysisResult {
    
    // 각 영역별 위험도
    const trainingLoadRisk = trainingAnalysis.riskScore;
    const biomechanicalRisk = biomechanicalAnalysis.riskScore;
    const recoveryRisk = recoveryAnalysis.riskScore;
    
    // 환경적 위험도 계산
    const environmentalRisk = this.calculateEnvironmentalRisk(environmentalFactors);
    
    // 개인 이력 기반 위험도
    const historicalRisk = this.calculateHistoricalRisk(userProfile);
    
    // 가중치 적용한 종합 위험도 계산
    const weights = {
      training: 0.35,
      biomechanical: 0.25,
      recovery: 0.25,
      environmental: 0.05,
      historical: 0.10
    };
    
    const overallRisk = Math.round(
      trainingLoadRisk * weights.training +
      biomechanicalRisk * weights.biomechanical +
      recoveryRisk * weights.recovery +
      environmentalRisk * weights.environmental +
      historicalRisk * weights.historical
    );
    
    // 위험 요인 식별
    const riskFactors = this.identifyRiskFactors(
      trainingAnalysis,
      biomechanicalAnalysis,
      recoveryAnalysis,
      environmentalFactors,
      userProfile
    );
    
    // 신뢰도 점수 계산
    const confidenceScore = this.calculateConfidenceScore(
      trainingAnalysis.recentLoads.length,
      biomechanicalAnalysis.recentData.length,
      recoveryAnalysis.recentData.length
    );
    
    return {
      trainingLoadRisk,
      biomechanicalRisk,
      recoveryRisk,
      environmentalRisk,
      historicalRisk,
      overallRisk,
      riskFactors,
      confidenceScore
    };
  }
  
  /**
   * 환경적 위험도 계산
   */
  private static calculateEnvironmentalRisk(environmentalFactors: any): number {
    let risk = 0;
    
    // 수영장 조건
    const { temperature, chlorineLevel, crowdedness } = environmentalFactors.poolConditions;
    
    if (temperature < 24 || temperature > 28) risk += 10;
    if (chlorineLevel > 3) risk += 5;
    if (crowdedness > 7) risk += 10;
    
    // 장비 및 환경
    if (environmentalFactors.equipmentCondition < 6) risk += 10;
    if (environmentalFactors.coachingQuality < 6) risk += 15;
    if (environmentalFactors.trainingEnvironment < 6) risk += 10;
    
    return Math.min(risk, 100);
  }
  
  /**
   * 개인 이력 기반 위험도 계산
   */
  private static calculateHistoricalRisk(userProfile: any): number {
    let risk = 0;
    
    // 연령 요인
    if (userProfile.age > 50) risk += 15;
    else if (userProfile.age > 40) risk += 10;
    else if (userProfile.age < 18) risk += 5;
    
    // 경험 요인
    if (userProfile.experience < 6) risk += 10; // 6개월 미만
    
    // 기존 부상 이력
    const recentInjuries = userProfile.previousInjuries.filter((injury: any) => {
      const injuryDate = new Date(injury.date);
      const monthsAgo = (Date.now() - injuryDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
      return monthsAgo <= 12; // 최근 1년 내
    });
    
    risk += recentInjuries.length * 20;
    
    // 재발성 부상
    const recurrentInjuries = userProfile.previousInjuries.filter((injury: any) => injury.recurrence);
    risk += recurrentInjuries.length * 15;
    
    // 의학적 기록
    risk += userProfile.medicalHistory.length * 10;
    
    return Math.min(risk, 100);
  }
  
  /**
   * 위험 요인 식별
   */
  private static identifyRiskFactors(
    trainingAnalysis: any,
    biomechanicalAnalysis: any,
    recoveryAnalysis: any,
    environmentalFactors: any,
    userProfile: any
  ): IRiskFactor[] {
    void environmentalFactors;
    void userProfile;
    
    const riskFactors: IRiskFactor[] = [];
    
    // 훈련 부하 관련 위험 요인
    if (trainingAnalysis.acuteChronicRatio > 1.5) {
      riskFactors.push({
        category: RiskFactorCategory.TRAINING_LOAD,
        factor: '급격한 훈련량 증가',
        severity: Math.min(10, Math.round(trainingAnalysis.acuteChronicRatio * 2)),
        confidence: 85,
        description: `최근 훈련량이 평소보다 ${Math.round((trainingAnalysis.acuteChronicRatio - 1) * 100)}% 증가했습니다.`,
        recommendations: [
          '훈련량을 점진적으로 조절하세요',
          '휴식일을 늘려주세요',
          '강도를 일시적으로 낮춰주세요'
        ]
      });
    }
    
    // 생체역학 관련 위험 요인
    if (biomechanicalAnalysis.techniqueScore < 60) {
      riskFactors.push({
        category: RiskFactorCategory.TECHNIQUE,
        factor: '기술적 결함',
        severity: Math.round((100 - biomechanicalAnalysis.techniqueScore) / 10),
        confidence: 80,
        description: `수영 기술 점수가 ${biomechanicalAnalysis.techniqueScore}점으로 개선이 필요합니다.`,
        recommendations: [
          '기술 교정 레슨을 받으세요',
          '비디오 분석을 통한 자세 점검',
          '드릴 연습을 늘려주세요'
        ]
      });
    }
    
    // 회복 관련 위험 요인
    if (recoveryAnalysis.sleepDebt > 5) {
      riskFactors.push({
        category: RiskFactorCategory.RECOVERY,
        factor: '수면 부족',
        severity: Math.min(10, Math.round(recoveryAnalysis.sleepDebt / 2)),
        confidence: 90,
        description: `누적 수면 부족이 ${recoveryAnalysis.sleepDebt.toFixed(1)}시간입니다.`,
        recommendations: [
          '충분한 수면을 취하세요 (7-9시간)',
          '수면 환경을 개선하세요',
          '훈련 강도를 일시적으로 조절하세요'
        ]
      });
    }
    
    // 비대칭성 문제
    if (biomechanicalAnalysis.asymmetryIssues.length > 0) {
      riskFactors.push({
        category: RiskFactorCategory.BIOMECHANICAL,
        factor: '움직임 비대칭',
        severity: biomechanicalAnalysis.asymmetryIssues.length * 2,
        confidence: 75,
        description: `${biomechanicalAnalysis.asymmetryIssues.join(', ')} 문제가 발견되었습니다.`,
        recommendations: [
          '교정 운동을 실시하세요',
          '일방향 훈련을 피하세요',
          '전문가 상담을 받으세요'
        ]
      });
    }
    
    // 스트레스 관련
    if (recoveryAnalysis.stressAccumulation > 70) {
      riskFactors.push({
        category: RiskFactorCategory.PSYCHOLOGICAL,
        factor: '높은 스트레스 수준',
        severity: Math.round(recoveryAnalysis.stressAccumulation / 10),
        confidence: 70,
        description: `스트레스 수준이 ${recoveryAnalysis.stressAccumulation}%로 높습니다.`,
        recommendations: [
          '스트레스 관리 기법을 적용하세요',
          '충분한 휴식을 취하세요',
          '정신적 회복 시간을 확보하세요'
        ]
      });
    }
    
    // 위험도 순으로 정렬
    return riskFactors.sort((a, b) => b.severity - a.severity);
  }
  
  /**
   * 부상 유형별 예측
   */
  private static predictInjuryTypes(analysis: IAnalysisResult, userProfile: any) {
    const predictions = [];
    
    // 어깨 부상 예측
    const shoulderRisk = this.calculateShoulderInjuryRisk(analysis, userProfile);
    if (shoulderRisk.probability > 20) {
      predictions.push({
        injuryType: InjuryType.SHOULDER,
        probability: shoulderRisk.probability,
        timeframe: shoulderRisk.timeframe
      });
    }
    
    // 허리 부상 예측
    const backRisk = this.calculateBackInjuryRisk(analysis, userProfile);
    if (backRisk.probability > 20) {
      predictions.push({
        injuryType: InjuryType.BACK,
        probability: backRisk.probability,
        timeframe: backRisk.timeframe
      });
    }
    
    // 무릎 부상 예측
    const kneeRisk = this.calculateKneeInjuryRisk(analysis, userProfile);
    if (kneeRisk.probability > 20) {
      predictions.push({
        injuryType: InjuryType.KNEE,
        probability: kneeRisk.probability,
        timeframe: kneeRisk.timeframe
      });
    }
    
    // 과사용 증후군 예측
    const overuseRisk = this.calculateOveruseRisk(analysis);
    if (overuseRisk.probability > 30) {
      predictions.push({
        injuryType: InjuryType.OVERUSE,
        probability: overuseRisk.probability,
        timeframe: overuseRisk.timeframe
      });
    }
    
    return predictions.sort((a, b) => b.probability - a.probability);
  }
  
  /**
   * 어깨 부상 위험 계산
   */
  private static calculateShoulderInjuryRisk(analysis: IAnalysisResult, userProfile: any) {
    let probability = 0;
    
    // 기술적 요인 (어깨 회전, 스트로크 효율성)
    const techniqueRisk = analysis.biomechanicalRisk * 0.4;
    probability += techniqueRisk;
    
    // 훈련 부하 (반복적 동작)
    const loadRisk = analysis.trainingLoadRisk * 0.3;
    probability += loadRisk;
    
    // 연령 요인
    if (userProfile.age > 40) probability += 10;
    
    // 과거 어깨 부상 이력
    const shoulderHistory = userProfile.previousInjuries.filter((injury: any) => 
      injury.injuryType === InjuryType.SHOULDER
    );
    probability += shoulderHistory.length * 15;
    
    probability = Math.min(probability, 100);
    
    const timeframe = probability > 70 ? '1-2주' : 
                     probability > 50 ? '2-4주' : 
                     probability > 30 ? '1-2개월' : '2-3개월';
    
    return { probability: Math.round(probability), timeframe };
  }
  
  /**
   * 허리 부상 위험 계산
   */
  private static calculateBackInjuryRisk(analysis: IAnalysisResult, userProfile: any) {
    let probability = 0;
    
    // 자세 관련 요인
    const postureRisk = analysis.biomechanicalRisk * 0.3;
    probability += postureRisk;
    
    // 유연성 부족
    const flexibilityIssues = analysis.riskFactors.filter(rf => 
      rf.factor.includes('유연성') || rf.factor.includes('비대칭')
    );
    probability += flexibilityIssues.length * 10;
    
    // 연령 및 경험
    if (userProfile.age > 35) probability += 15;
    if (userProfile.experience < 12) probability += 10;
    
    probability = Math.min(probability, 100);
    
    const timeframe = probability > 60 ? '2-3주' : 
                     probability > 40 ? '1-2개월' : '2-4개월';
    
    return { probability: Math.round(probability), timeframe };
  }
  
  /**
   * 무릎 부상 위험 계산
   */
  private static calculateKneeInjuryRisk(analysis: IAnalysisResult, userProfile: any) {
    let probability = 0;
    
    // 킥 기술 관련
    const techniqueRisk = analysis.biomechanicalRisk * 0.2;
    probability += techniqueRisk;
    
    // 훈련량 증가
    if (analysis.trainingLoadRisk > 60) probability += 20;
    
    // 연령 요인
    if (userProfile.age > 45) probability += 15;
    
    // 과거 무릎 부상
    const kneeHistory = userProfile.previousInjuries.filter((injury: any) => 
      injury.injuryType === InjuryType.KNEE
    );
    probability += kneeHistory.length * 20;
    
    probability = Math.min(probability, 100);
    
    const timeframe = probability > 50 ? '2-4주' : 
                     probability > 30 ? '1-3개월' : '3-6개월';
    
    return { probability: Math.round(probability), timeframe };
  }
  
  /**
   * 과사용 증후군 위험 계산
   */
  private static calculateOveruseRisk(analysis: IAnalysisResult) {
    let probability = 0;
    
    // 훈련 부하가 가장 중요한 요인
    probability += analysis.trainingLoadRisk * 0.6;
    
    // 회복 부족
    probability += analysis.recoveryRisk * 0.4;
    
    probability = Math.min(probability, 100);
    
    const timeframe = probability > 70 ? '1-2주' : 
                     probability > 50 ? '2-3주' : 
                     probability > 30 ? '1-2개월' : '2-3개월';
    
    return { probability: Math.round(probability), timeframe };
  }
  
  /**
   * 권장사항 생성
   */
  private static generateRecommendations(analysis: IAnalysisResult, injuryPredictions: any[]) {
    const immediate = [];
    const shortTerm = [];
    const longTerm = [];
    
    // 즉시 조치사항
    if (analysis.overallRisk > 80) {
      immediate.push('훈련을 일시 중단하고 전문가 상담을 받으세요');
      immediate.push('통증이나 불편함이 있는지 즉시 점검하세요');
    } else if (analysis.overallRisk > 60) {
      immediate.push('훈련 강도를 50% 줄이세요');
      immediate.push('충분한 휴식을 취하세요');
    }
    
    // 주요 위험 요인별 즉시 조치
    analysis.riskFactors.slice(0, 3).forEach(factor => {
      if (factor.severity >= 7) {
        immediate.push(...factor.recommendations.slice(0, 1));
      }
    });
    
    // 단기 권장사항 (1-4주)
    if (analysis.trainingLoadRisk > 50) {
      shortTerm.push('훈련 계획을 점진적으로 조정하세요');
      shortTerm.push('주 2-3회 휴식일을 확보하세요');
    }
    
    if (analysis.biomechanicalRisk > 50) {
      shortTerm.push('기술 교정 레슨을 예약하세요');
      shortTerm.push('폼 체크를 위한 비디오 촬영을 하세요');
    }
    
    if (analysis.recoveryRisk > 50) {
      shortTerm.push('수면 패턴을 개선하세요');
      shortTerm.push('스트레스 관리 방법을 도입하세요');
    }
    
    // 장기 예방책 (1-3개월)
    longTerm.push('정기적인 건강 검진을 받으세요');
    longTerm.push('예방 운동 프로그램을 시작하세요');
    longTerm.push('영양 및 수분 섭취 계획을 수립하세요');
    
    if (injuryPredictions.length > 0) {
      const topRisk = injuryPredictions[0];
      longTerm.push(`${topRisk.injuryType} 부상 예방을 위한 특화 운동을 실시하세요`);
    }
    
    return {
      immediate: [...new Set(immediate)].slice(0, 5),
      shortTerm: [...new Set(shortTerm)].slice(0, 5),
      longTerm: [...new Set(longTerm)].slice(0, 5)
    };
  }
  
  /**
   * 모니터링 포인트 생성
   */
  private static generateMonitoringPoints(analysis: IAnalysisResult): string[] {
    const points = [];
    
    if (analysis.trainingLoadRisk > 50) {
      points.push('훈련 후 피로도 및 회복 시간 모니터링');
      points.push('주간 훈련량 추적 및 기록');
    }
    
    if (analysis.biomechanicalRisk > 50) {
      points.push('수영 자세 및 기술 정기 점검');
      points.push('좌우 대칭성 및 움직임 패턴 관찰');
    }
    
    if (analysis.recoveryRisk > 50) {
      points.push('수면의 질 및 시간 기록');
      points.push('스트레스 수준 및 기분 변화 추적');
    }
    
    points.push('통증이나 불편함의 조기 발견');
    points.push('훈련 중 몸의 반응 및 신호 주의 깊게 관찰');
    
    return points;
  }
  
  /**
   * 위험도 레벨 계산
   */
  private static calculateRiskLevel(overallRisk: number): InjuryRiskLevel {
    if (overallRisk >= 81) return InjuryRiskLevel.VERY_HIGH;
    if (overallRisk >= 61) return InjuryRiskLevel.HIGH;
    if (overallRisk >= 41) return InjuryRiskLevel.MODERATE;
    if (overallRisk >= 21) return InjuryRiskLevel.LOW;
    return InjuryRiskLevel.VERY_LOW;
  }
  
  /**
   * 신뢰도 점수 계산
   */
  private static calculateConfidenceScore(
    trainingDataPoints: number,
    biomechanicalDataPoints: number,
    recoveryDataPoints: number
  ): number {
    let confidence = 50; // 기본값
    
    // 데이터 포인트가 많을수록 신뢰도 증가
    confidence += Math.min(trainingDataPoints * 2, 20);
    confidence += Math.min(biomechanicalDataPoints * 1.5, 15);
    confidence += Math.min(recoveryDataPoints * 1.5, 15);
    
    return Math.min(confidence, 100);
  }
  
  /**
   * 변동성 계산 헬퍼 함수
   */
  private static calculateVariability(values: number[]): number {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    return (stdDev / mean) * 100; // 변동계수 (%)
  }
  
  /**
   * 기존 예측 업데이트 여부 결정
   */
  private static shouldUpdateExisting(existing: IInjuryPrediction): boolean {
    const daysSinceUpdate = Math.floor(
      (Date.now() - existing.updatedAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    return daysSinceUpdate >= 7 || // 1주일 경과
           existing.prediction.riskLevel === InjuryRiskLevel.VERY_HIGH || // 매우 높은 위험
           existing.monitoring.followUpRequired; // 후속 조치 필요
  }
  
  /**
   * 기존 예측 업데이트
   */
  private static async updateExistingPrediction(
    existing: IInjuryPrediction,
    request: IInjuryAssessmentRequest,
    trainingAnalysis: any,
    biomechanicalAnalysis: any,
    recoveryAnalysis: any,
    prediction: IPredictionResult
  ): Promise<IInjuryPrediction> {
    
    existing.assessmentDate = new Date();
    existing.trainingLoadAnalysis = trainingAnalysis;
    existing.biomechanicalAnalysis = biomechanicalAnalysis;
    existing.recoveryAnalysis = recoveryAnalysis;
    existing.environmentalFactors = request.environmentalFactors;
    existing.prediction = prediction;
    existing.monitoring.nextAssessmentDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    existing.dataQuality = this.calculateDataQuality(request);
    
    return existing;
  }
  
  /**
   * 새로운 예측 생성
   */
  private static async createNewPrediction(
    request: IInjuryAssessmentRequest,
    trainingAnalysis: any,
    biomechanicalAnalysis: any,
    recoveryAnalysis: any,
    prediction: IPredictionResult
  ): Promise<IInjuryPrediction> {
    
    return new InjuryPrediction({
      userId: request.userId,
      assessmentDate: new Date(),
      userProfile: request.userProfile,
      trainingLoadAnalysis: trainingAnalysis,
      biomechanicalAnalysis: biomechanicalAnalysis,
      recoveryAnalysis: recoveryAnalysis,
      environmentalFactors: request.environmentalFactors,
      prediction: prediction,
      monitoring: {
        alertsGenerated: [],
        followUpRequired: prediction.riskLevel === InjuryRiskLevel.VERY_HIGH,
        nextAssessmentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        interventionsRecommended: prediction.recommendations.immediate
      },
      modelVersion: '1.0.0',
      dataQuality: this.calculateDataQuality(request)
    });
  }
  
  /**
   * 데이터 품질 계산
   */
  private static calculateDataQuality(request: IInjuryAssessmentRequest): number {
    let quality = 70; // 기본값
    
    if (request.trainingData.length >= 14) quality += 10; // 2주 이상 데이터
    if (request.biomechanicalData.length >= 5) quality += 10; // 5회 이상 분석
    if (request.recoveryData.length >= 7) quality += 10; // 1주 이상 회복 데이터
    
    return Math.min(quality, 100);
  }
  
  /**
   * 사용자별 부상 위험 예측 목록 조회
   */
  static async getUserPredictions(userId: mongoose.Types.ObjectId): Promise<IInjuryPrediction[]> {
    try {
      return await InjuryPrediction.find({ userId, isActive: true })
        .sort({ assessmentDate: -1 })
        .populate('userId', 'name email');
    } catch (error) {
      console.error('부상 예측 조회 오류:', error);
      throw new Error('부상 예측 조회에 실패했습니다.');
    }
  }
  
  /**
   * 고위험 사용자 목록 조회
   */
  static async getHighRiskUsers(): Promise<IInjuryPrediction[]> {
    try {
      return await (InjuryPrediction as any).getHighRiskUsers();
    } catch (error) {
      console.error('고위험 사용자 조회 오류:', error);
      throw new Error('고위험 사용자 조회에 실패했습니다.');
    }
  }
  
  /**
   * 부상 통계 조회
   */
  static async getInjuryStatistics(): Promise<any> {
    try {
      return await (InjuryPrediction as any).getInjuryStatistics();
    } catch (error) {
      console.error('부상 통계 조회 오류:', error);
      throw new Error('부상 통계 조회에 실패했습니다.');
    }
  }
}

export default AIInjuryPredictionService;
