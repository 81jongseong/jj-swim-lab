/**
 * 🏃‍♂️ JJ Swim Lab - 개인별 맞춤 운동 처방 시스템
 * 
 * 📋 **시스템 개요**
 * - 개인의 건강 상태(비만도, 심혈관 위험도 등)에 따른 운동 등급 분류
 * - 심박수 기반 운동 강도 계산 및 시간/거리 결정
 * - 운동 이력 기반 동적 강도 조정
 * - 강사/센터 관리자용 개인별 운동량 조절 인터페이스
 * - 일반회원용 자동 운동량 조절 시스템
 * 
 * 🔬 **의학적 근거**
 * - ACSM Exercise Prescription Guidelines
 * - WHO Physical Activity Guidelines
 * - 한국인 비만 진료지침 (대한비만학회)
 * - 심박수 기반 운동 강도 산정법 (Karvonen Formula)
 * 
 * 📅 **개발 히스토리**
 * - 2025-01-22: 개인별 맞춤 운동 처방 시스템 구현
 */

import { HealthData } from '../models/HealthData';
import { User } from '../models/User';

// 건강 상태 등급 분류 (확장된 버전)
export interface HealthGrade {
  // 기본 지표
  obesityGrade: 'normal' | 'overweight' | 'obesity1' | 'obesity2' | 'obesity3';
  cardiovascularGrade: 'low' | 'moderate' | 'high' | 'very_high';
  fitnessGrade: 'beginner' | 'intermediate' | 'advanced';
  ageGrade: 'young' | 'middle' | 'senior';
  
  // 추가 건강 지표
  metabolicGrade: 'normal' | 'prediabetes' | 'diabetes' | 'metabolic_syndrome';
  musculoskeletalGrade: 'normal' | 'mild_risk' | 'moderate_risk' | 'high_risk';
  respiratoryGrade: 'normal' | 'mild_impairment' | 'moderate_impairment' | 'severe_impairment';
  neurologicalGrade: 'normal' | 'mild_concern' | 'moderate_concern' | 'high_concern';
  
  // 생활습관 지표
  lifestyleGrade: 'excellent' | 'good' | 'fair' | 'poor';
  stressGrade: 'low' | 'moderate' | 'high' | 'very_high';
  sleepGrade: 'excellent' | 'good' | 'fair' | 'poor';
  
  // 운동 관련 지표
  exerciseHistory: 'none' | 'beginner' | 'intermediate' | 'advanced' | 'elite';
  injuryHistory: 'none' | 'minor' | 'moderate' | 'major';
  flexibilityGrade: 'excellent' | 'good' | 'fair' | 'poor';
  
  overallGrade: 'A' | 'B' | 'C' | 'D' | 'E'; // 종합 등급
}

// 운동 강도 계산 알고리즘 타입
export type IntensityCalculationMethod = 
  | 'karvonen'           // Karvonen Formula (심박수 예비량법)
  | 'max_hr_percentage'  // 최대 심박수 백분율법
  | 'vo2_max_percentage' // 최대 산소섭취량 백분율법
  | 'rpe_based'          // 자각적 운동강도 기반
  | 'hybrid'             // 하이브리드 (여러 방법 조합)
  | 'ai_adaptive';        // AI 적응형 알고리즘

// 운동 강도 설정 (확장된 버전)
export interface ExerciseIntensity {
  // 심박수 기반 강도
  targetHeartRate: {
    min: number;
    max: number;
    optimal: number;
    method: IntensityCalculationMethod;
  };
  
  // 자각적 운동강도 (RPE)
  perceivedExertion: {
    scale: number; // 1-10 스케일
    description: string;
    borgScale?: number; // 6-20 스케일
  };
  
  // 수영 특화 강도
  swimmingPace: {
    metersPerMinute: number;
    strokeRate: number; // 분당 스트로크 수
    strokeEfficiency: number; // 스트로크 효율성
  };
  
  // 산소섭취량 기반 강도 (VO2 Max)
  vo2Intensity?: {
    percentage: number;
    estimatedVO2Max: number;
    targetVO2: number;
  };
  
  // 복합 강도 지표
  compositeIntensity: {
    score: number; // 0-100 점수
    factors: string[]; // 고려된 요소들
    confidence: number; // 신뢰도 (0-1)
  };
}

// 운동 처방 결과
export interface ExercisePrescription {
  sessionDuration: number; // 분 단위
  totalDistance: number; // 미터 단위
  targetHeartRate: ExerciseIntensity['targetHeartRate'];
  recommendedExercises: {
    warmUp: { duration: number; intensity: string; };
    mainExercise: { duration: number; intensity: string; sets?: number; };
    coolDown: { duration: number; intensity: string; };
  };
  weeklyFrequency: number; // 주당 횟수
  progressionPlan: {
    currentWeek: number;
    totalWeeks: number;
    weeklyIncrease: number; // 주당 증가량 (%)
  };
  safetyGuidelines: string[];
  contraindications: string[];
}

// 운동 이력 및 성과 추적
export interface ExerciseHistory {
  sessionId: string;
  userId: string;
  date: Date;
  prescribedExercise: ExercisePrescription;
  actualPerformance: {
    duration: number;
    distance: number;
    averageHeartRate: number;
    maxHeartRate: number;
    perceivedExertion: number;
    completionRate: number; // 완주율 (%)
  };
  feedback: {
    difficulty: 'too_easy' | 'appropriate' | 'too_hard';
    fatigue: 'low' | 'moderate' | 'high';
    enjoyment: 'low' | 'moderate' | 'high';
    instructorNotes?: string;
  };
  nextAdjustment: {
    intensityChange: number; // 강도 변화 (%)
    durationChange: number; // 시간 변화 (%)
    reason: string;
  };
}

// 동적 조정 알고리즘 결과
export interface DynamicAdjustment {
  adjustmentType: 'increase' | 'maintain' | 'decrease';
  adjustmentAmount: number; // 변화량 (%)
  newPrescription: ExercisePrescription;
  reasoning: string[];
  confidence: number; // 조정 신뢰도 (0-1)
  insights: {
    completionRate: number;
    perceivedExertion: number;
    difficultyTrend: number;
  };
}

export class ExercisePrescriptionSystem {
  
  /**
   * 개인별 건강 상태 등급 분류
   */
  static classifyHealthGrade(healthData: any, user: any): HealthGrade {
    const age = healthData.age || user.age || 30;
    const bmi = healthData.bmi || this.calculateBMI(healthData.weight, healthData.height);
    const systolicBP = healthData.systolicBP || healthData.bloodPressure?.systolic || 120;
    const diastolicBP = healthData.diastolicBP || healthData.bloodPressure?.diastolic || 80;
    const restingHR = healthData.restingHeartRate || healthData.heartRate || 70;
    
    // 1. 비만도 등급 분류 (WHO 기준)
    let obesityGrade: HealthGrade['obesityGrade'];
    if (bmi < 23) {
      obesityGrade = 'normal';
    } else if (bmi < 25) {
      obesityGrade = 'overweight';
    } else if (bmi < 30) {
      obesityGrade = 'obesity1';
    } else if (bmi < 35) {
      obesityGrade = 'obesity2';
    } else {
      obesityGrade = 'obesity3';
    }
    
    // 2. 심혈관 위험도 등급
    let cardiovascularGrade: HealthGrade['cardiovascularGrade'] = 'low';
    let riskScore = 0;
    
    // 연령 위험도
    if (user.gender === 'male' && age >= 45) riskScore += 1;
    else if (user.gender === 'female' && age >= 55) riskScore += 1;
    
    // 혈압 위험도
    if (systolicBP >= 140 || diastolicBP >= 90) riskScore += 1;
    
    // 심박수 위험도 (안정시 심박수)
    if (restingHR >= 100) riskScore += 1;
    else if (restingHR >= 80) riskScore += 0.5;
    
    if (riskScore <= 0.5) cardiovascularGrade = 'low';
    else if (riskScore <= 1.5) cardiovascularGrade = 'moderate';
    else if (riskScore <= 2.5) cardiovascularGrade = 'high';
    else cardiovascularGrade = 'very_high';
    
    // 3. 체력 등급 (연령과 BMI 기반 추정)
    let fitnessGrade: HealthGrade['fitnessGrade'] = 'beginner';
    if (age < 30 && bmi < 25) fitnessGrade = 'advanced';
    else if (age < 50 && bmi < 30) fitnessGrade = 'intermediate';
    
    // 4. 연령 등급
    let ageGrade: HealthGrade['ageGrade'];
    if (age < 30) ageGrade = 'young';
    else if (age < 60) ageGrade = 'middle';
    else ageGrade = 'senior';
    
    // 5. 종합 등급 계산
    const overallGrade = this.calculateOverallGrade({
      obesityGrade,
      cardiovascularGrade,
      fitnessGrade,
      ageGrade,
      exerciseHistory: 'beginner', // 기본값
      metabolicGrade: 'normal',
      musculoskeletalGrade: 'normal',
      respiratoryGrade: 'normal',
      neurologicalGrade: 'normal',
      lifestyleGrade: 'good',
      sleepGrade: 'good',
      stressGrade: 'low',
      injuryHistory: 'none',
      flexibilityGrade: 'good'
    });
    
    return {
      obesityGrade,
      cardiovascularGrade,
      fitnessGrade,
      ageGrade,
      exerciseHistory: 'beginner',
      metabolicGrade: 'normal',
      musculoskeletalGrade: 'normal',
      respiratoryGrade: 'normal',
      neurologicalGrade: 'normal',
      lifestyleGrade: 'good',
      sleepGrade: 'good',
      stressGrade: 'low',
      injuryHistory: 'none',
      flexibilityGrade: 'good',
      overallGrade
    };
  }
  
  /**
   * 종합 등급 계산
   */
  private static calculateOverallGrade(grades: Omit<HealthGrade, 'overallGrade'>): HealthGrade['overallGrade'] {
    let score = 0;
    
    // 비만도 점수 (가중치 40%)
    const obesityScores = { normal: 5, overweight: 4, obesity1: 3, obesity2: 2, obesity3: 1 };
    score += obesityScores[grades.obesityGrade] * 0.4;
    
    // 심혈관 위험도 점수 (가중치 30%)
    const cardioScores = { low: 5, moderate: 4, high: 2, very_high: 1 };
    score += cardioScores[grades.cardiovascularGrade] * 0.3;
    
    // 체력 등급 점수 (가중치 20%)
    const fitnessScores = { beginner: 2, intermediate: 4, advanced: 5 };
    score += fitnessScores[grades.fitnessGrade] * 0.2;
    
    // 연령 등급 점수 (가중치 10%)
    const ageScores = { young: 5, middle: 4, senior: 2 };
    score += ageScores[grades.ageGrade] * 0.1;
    
    // 등급 변환
    if (score >= 4.5) return 'A';
    else if (score >= 3.5) return 'B';
    else if (score >= 2.5) return 'C';
    else if (score >= 1.5) return 'D';
    else return 'E';
  }
  
  /**
   * 다양한 운동 강도 계산 알고리즘
   */
  static calculateExerciseIntensity(
    restingHR: number,
    maxHR: number,
    targetIntensity: number, // 0.5-0.9 (50%-90%)
    healthGrade: HealthGrade,
    method: IntensityCalculationMethod = 'karvonen',
    additionalData?: {
      vo2Max?: number;
      age?: number;
      weight?: number;
      height?: number;
      gender?: string;
      exerciseHistory?: string;
    }
  ): ExerciseIntensity {
    // 최대 심박수 계산 (연령 기반)
    const ageBasedMaxHR = 220 - (healthGrade.ageGrade === 'young' ? 25 : 
                                 healthGrade.ageGrade === 'middle' ? 45 : 65);
    const actualMaxHR = Math.min(maxHR || ageBasedMaxHR, ageBasedMaxHR);
    
    // 건강 상태에 따른 강도 조정
    let adjustedIntensity = targetIntensity;
    const adjustmentFactors: string[] = [];
    
    // 심혈관 위험도 조정
    if (healthGrade.cardiovascularGrade === 'high' || healthGrade.cardiovascularGrade === 'very_high') {
      adjustedIntensity *= 0.8;
      adjustmentFactors.push('심혈관 위험도 높음 (-20%)');
    }
    
    // 비만도 조정
    if (healthGrade.obesityGrade === 'obesity2' || healthGrade.obesityGrade === 'obesity3') {
      adjustedIntensity *= 0.85;
      adjustmentFactors.push('고도비만 (-15%)');
    }
    
    // 대사 질환 조정
    if (healthGrade.metabolicGrade === 'diabetes' || healthGrade.metabolicGrade === 'metabolic_syndrome') {
      adjustedIntensity *= 0.9;
      adjustmentFactors.push('대사 질환 (-10%)');
    }
    
    // 근골격계 위험도 조정
    if (healthGrade.musculoskeletalGrade === 'moderate_risk' || healthGrade.musculoskeletalGrade === 'high_risk') {
      adjustedIntensity *= 0.85;
      adjustmentFactors.push('근골격계 위험 (-15%)');
    }
    
    // 운동 경험 조정
    if (healthGrade.exerciseHistory === 'none' || healthGrade.exerciseHistory === 'beginner') {
      adjustedIntensity *= 0.8;
      adjustmentFactors.push('운동 초보자 (-20%)');
    }
    
    // 알고리즘별 목표 심박수 계산
    let targetHR: number;
    let calculationMethod: IntensityCalculationMethod;
    
    switch (method) {
      case 'karvonen': {
        // Karvonen Formula (심박수 예비량법)
        const hrReserve = actualMaxHR - restingHR;
        targetHR = restingHR + (hrReserve * adjustedIntensity);
        calculationMethod = 'karvonen';
        break;
      }

      case 'max_hr_percentage': {
        // 최대 심박수 백분율법
        targetHR = actualMaxHR * adjustedIntensity;
        calculationMethod = 'max_hr_percentage';
        break;
      }

      case 'vo2_max_percentage': {
        // VO2 Max 백분율법 (추정)
        const estimatedVO2Max = this.estimateVO2Max(additionalData);
        const targetVO2 = estimatedVO2Max * adjustedIntensity;
        targetHR = this.convertVO2ToHeartRate(targetVO2, actualMaxHR, restingHR);
        calculationMethod = 'vo2_max_percentage';
        break;
      }

      case 'rpe_based': {
        // 자각적 운동강도 기반
        const rpeScale = Math.round(adjustedIntensity * 10);
        targetHR = this.convertRPEToHeartRate(rpeScale, actualMaxHR, restingHR);
        calculationMethod = 'rpe_based';
        break;
      }

      case 'hybrid': {
        // 하이브리드 방법 (여러 방법의 평균)
        const karvonenHR = restingHR + ((actualMaxHR - restingHR) * adjustedIntensity);
        const maxHRPercentage = actualMaxHR * adjustedIntensity;
        const rpeHR = this.convertRPEToHeartRate(Math.round(adjustedIntensity * 10), actualMaxHR, restingHR);
        targetHR = (karvonenHR + maxHRPercentage + rpeHR) / 3;
        calculationMethod = 'hybrid';
        break;
      }

      case 'ai_adaptive':
        // AI 적응형 알고리즘
        targetHR = this.calculateAIAdaptiveIntensity(
          restingHR, actualMaxHR, adjustedIntensity, healthGrade, additionalData
        );
        calculationMethod = 'ai_adaptive';
        break;

      default: {
        // 기본값: Karvonen
        const defaultHRReserve = actualMaxHR - restingHR;
        targetHR = restingHR + (defaultHRReserve * adjustedIntensity);
        calculationMethod = 'karvonen';
      }
    }
    
    // VO2 Max 정보 계산 (추정)
    const estimatedVO2Max = this.estimateVO2Max(additionalData);
    const targetVO2 = estimatedVO2Max * adjustedIntensity;
    
    // 복합 강도 점수 계산
    const compositeScore = this.calculateCompositeIntensityScore(
      adjustedIntensity, healthGrade, targetHR, actualMaxHR
    );
    
    return {
      targetHeartRate: {
        min: Math.round(targetHR * 0.9),
        max: Math.round(targetHR * 1.1),
        optimal: Math.round(targetHR),
        method: calculationMethod
      },
      perceivedExertion: {
        scale: Math.round(adjustedIntensity * 10),
        description: this.getExertionDescription(adjustedIntensity),
        borgScale: Math.round(adjustedIntensity * 14) + 6 // 6-20 스케일로 변환
      },
      swimmingPace: {
        metersPerMinute: this.calculateSwimmingPace(adjustedIntensity, healthGrade),
        strokeRate: this.calculateStrokeRate(adjustedIntensity, healthGrade),
        strokeEfficiency: this.calculateStrokeEfficiency(healthGrade)
      },
      vo2Intensity: {
        percentage: adjustedIntensity * 100,
        estimatedVO2Max,
        targetVO2
      },
      compositeIntensity: {
        score: compositeScore,
        factors: adjustmentFactors,
        confidence: this.calculateConfidenceScore(healthGrade, additionalData)
      }
    };
  }
  
  /**
   * 개인별 운동 처방 생성
   */
  static generateExercisePrescription(
    healthGrade: HealthGrade,
    healthData: any,
    user: any,
    exerciseHistory?: ExerciseHistory[]
  ): ExercisePrescription {
    const restingHR = healthData.restingHeartRate || healthData.heartRate || 70;
    const maxHR = healthData.maxHeartRate || (220 - (healthData.age || user.age || 30));
    
    // 기본 운동 강도 결정
    let baseIntensity = 0.6; // 60% 강도로 시작
    let sessionDuration = 30; // 30분으로 시작
    let weeklyFrequency = 3; // 주 3회
    
    // 등급별 기본 설정 조정
    switch (healthGrade.overallGrade) {
      case 'A':
        baseIntensity = 0.7;
        sessionDuration = 45;
        weeklyFrequency = 4;
        break;
      case 'B':
        baseIntensity = 0.65;
        sessionDuration = 40;
        weeklyFrequency = 3;
        break;
      case 'C':
        baseIntensity = 0.6;
        sessionDuration = 35;
        weeklyFrequency = 3;
        break;
      case 'D':
        baseIntensity = 0.5;
        sessionDuration = 25;
        weeklyFrequency = 2;
        break;
      case 'E':
        baseIntensity = 0.4;
        sessionDuration = 20;
        weeklyFrequency = 2;
        break;
    }
    
    // 비만도별 특별 조정
    if (healthGrade.obesityGrade === 'obesity2' || healthGrade.obesityGrade === 'obesity3') {
      sessionDuration = Math.min(sessionDuration, 30); // 고도비만 시 최대 30분
      baseIntensity *= 0.8; // 강도 20% 감소
    }
    
    // 심혈관 위험도별 조정
    if (healthGrade.cardiovascularGrade === 'high' || healthGrade.cardiovascularGrade === 'very_high') {
      sessionDuration = Math.min(sessionDuration, 25); // 위험도 높으면 최대 25분
      baseIntensity *= 0.7; // 강도 30% 감소
    }
    
    // 운동 강도 계산
    const intensity = this.calculateExerciseIntensity(restingHR, maxHR, baseIntensity, healthGrade);
    
    // 거리 계산 (수영 속도 기반)
    const totalDistance = Math.round(sessionDuration * intensity.swimmingPace.metersPerMinute);
    
    // 운동 이력 기반 조정
    const adjustment = exerciseHistory ? this.calculateHistoryBasedAdjustment(exerciseHistory) : null;
    const adjustedDuration = adjustment ? 
      Math.round(sessionDuration * (1 + adjustment.adjustmentAmount / 100)) : sessionDuration;
    const adjustedIntensity = adjustment ? 
      this.calculateExerciseIntensity(restingHR, maxHR, baseIntensity * (1 + adjustment.adjustmentAmount / 100), healthGrade) : intensity;
    
    return {
      sessionDuration: adjustedDuration,
      totalDistance: Math.round(totalDistance * (adjustedDuration / sessionDuration)),
      targetHeartRate: adjustedIntensity.targetHeartRate,
      recommendedExercises: {
        warmUp: {
          duration: Math.round(adjustedDuration * 0.15), // 15%
          intensity: '낮음 (50-60% 최대심박수)'
        },
        mainExercise: {
          duration: Math.round(adjustedDuration * 0.7), // 70%
          intensity: `${adjustedIntensity.perceivedExertion.scale}/10 (${adjustedIntensity.perceivedExertion.description})`,
          sets: healthGrade.overallGrade === 'A' || healthGrade.overallGrade === 'B' ? 2 : 1
        },
        coolDown: {
          duration: Math.round(adjustedDuration * 0.15), // 15%
          intensity: '낮음 (40-50% 최대심박수)'
        }
      },
      weeklyFrequency,
      progressionPlan: {
        currentWeek: 1,
        totalWeeks: 12,
        weeklyIncrease: healthGrade.overallGrade === 'A' ? 5 : 
                       healthGrade.overallGrade === 'B' ? 4 : 
                       healthGrade.overallGrade === 'C' ? 3 : 2
      },
      safetyGuidelines: this.generateSafetyGuidelines(healthGrade),
      contraindications: this.generateContraindications(healthGrade)
    };
  }
  
  /**
   * 사용자 프로필 기반 처방 생성
   */
  static async buildPrescriptionForUser(
    userId: string,
    options: {
      exerciseHistory?: ExerciseHistory[];
      overrideHealthData?: Record<string, any>;
    } = {}
  ) {
    const [user, healthData] = await Promise.all([
      User.findById(userId).lean(),
      HealthData.findOne({ studentId: userId }).lean()
    ]);

    if (!user || (!healthData && !options.overrideHealthData)) {
      throw new Error('처방을 생성할 사용자 또는 건강 데이터를 찾을 수 없습니다.');
    }

    const mergedHealthData = {
      ...(healthData || {}),
      ...(options.overrideHealthData || {})
    };

    const healthGrade = this.classifyHealthGrade(mergedHealthData, user);
    const prescription = this.generateExercisePrescription(
      healthGrade,
      mergedHealthData,
      user,
      options.exerciseHistory
    );

    return {
      healthGrade,
      prescription
    };
  }
  
  /**
   * 운동 이력 기반 동적 조정
   */
  static calculateHistoryBasedAdjustment(history: ExerciseHistory[]): DynamicAdjustment {
    const recentSessions = history.slice(-3);
    const completionRateSum = recentSessions.reduce((sum, session) =>
      sum + (session.actualPerformance.completionRate || 0), 0);
    const exertionSum = recentSessions.reduce((sum, session) =>
      sum + (session.actualPerformance.perceivedExertion || 0), 0);
    const diffSum = recentSessions.reduce((sum, session) => {
      const difficultyScore = session.feedback.difficulty === 'too_easy' ? 1 :
                             session.feedback.difficulty === 'appropriate' ? 0 : -1;
      return sum + difficultyScore;
    }, 0);

    const completionDenominator = recentSessions.length || 1;
    const avgCompletionRate = completionRateSum / completionDenominator;
    const avgPerceivedExertion = exertionSum / completionDenominator;
    const avgDifficulty = diffSum / completionDenominator;

    if (history.length < 3) {
      return {
        adjustmentType: 'maintain',
        adjustmentAmount: 0,
        newPrescription: {} as ExercisePrescription,
        reasoning: ['충분한 운동 이력이 없어 현재 강도 유지'],
        confidence: 0.3,
        insights: {
          completionRate: Math.round(avgCompletionRate),
          perceivedExertion: parseFloat(avgPerceivedExertion.toFixed(1)),
          difficultyTrend: parseFloat(avgDifficulty.toFixed(2))
        }
      };
    }
    
    let adjustmentType: 'increase' | 'maintain' | 'decrease' = 'maintain';
    let adjustmentAmount = 0;
    const reasoning: string[] = [];
    
    // 완주율 기반 조정
    if (avgCompletionRate >= 95) {
      adjustmentType = 'increase';
      adjustmentAmount = 5;
      reasoning.push('완주율 95% 이상으로 강도 증가 가능');
    } else if (avgCompletionRate <= 70) {
      adjustmentType = 'decrease';
      adjustmentAmount = 10;
      reasoning.push('완주율 70% 이하로 강도 감소 필요');
    }
    
    // 주관적 난이도 기반 조정
    if (avgDifficulty > 0.3) {
      if (adjustmentType === 'increase') adjustmentAmount += 3;
      else if (adjustmentType === 'maintain') {
        adjustmentType = 'increase';
        adjustmentAmount = 5;
      }
      reasoning.push('운동이 너무 쉬워 강도 증가');
    } else if (avgDifficulty < -0.3) {
      if (adjustmentType === 'decrease') adjustmentAmount += 5;
      else if (adjustmentType === 'maintain') {
        adjustmentType = 'decrease';
        adjustmentAmount = 10;
      }
      reasoning.push('운동이 너무 어려워 강도 감소');
    }
    
    // 피로도 기반 조정
    const highFatigueCount = recentSessions.filter(s => s.feedback.fatigue === 'high').length;
    if (highFatigueCount >= 2) {
      adjustmentType = 'decrease';
      adjustmentAmount = Math.max(adjustmentAmount, 8);
      reasoning.push('높은 피로도로 인한 강도 감소');
    }

    reasoning.push(`평균 RPE ${avgPerceivedExertion.toFixed(1)} 수준을 기록했습니다.`);
    
    return {
      adjustmentType,
      adjustmentAmount: Math.min(adjustmentAmount, 20), // 최대 20% 조정
      newPrescription: {} as ExercisePrescription, // 실제 처방은 별도 생성
      reasoning,
      confidence: Math.min(0.9, 0.5 + (history.length * 0.1)),
      insights: {
        completionRate: Math.round(avgCompletionRate),
        perceivedExertion: parseFloat(avgPerceivedExertion.toFixed(1)),
        difficultyTrend: parseFloat(avgDifficulty.toFixed(2))
      }
    };
  }
  
  /**
   * BMI 계산
   */
  private static calculateBMI(weight?: number, height?: number): number {
    if (!weight || !height) return 23;
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
  }
  
  /**
   * VO2 Max 추정 (간접 측정법)
   */
  private static estimateVO2Max(data?: {
    age?: number;
    weight?: number;
    height?: number;
    gender?: string;
    exerciseHistory?: string;
  }): number {
    if (!data) return 35; // 기본값
    
    const { age = 30, weight = 70, height = 170, gender = 'male', exerciseHistory = 'beginner' } = data;
    const bmi = weight / Math.pow(height / 100, 2);
    
    // Bruce Protocol 기반 추정
    let baseVO2 = 0;
    if (gender === 'male') {
      baseVO2 = 14.8 - (1.379 * age) + (0.451 * Math.pow(age, 2)) - (0.012 * Math.pow(age, 3));
    } else {
      baseVO2 = 4.38 * age - 3.9;
    }
    
    // BMI 보정
    if (bmi > 30) baseVO2 *= 0.8;
    else if (bmi > 25) baseVO2 *= 0.9;
    
    // 운동 경험 보정
    const exerciseMultiplier = {
      'none': 0.7,
      'beginner': 0.8,
      'intermediate': 1.0,
      'advanced': 1.2,
      'elite': 1.4
    };
    
    return Math.max(15, baseVO2 * (exerciseMultiplier[exerciseHistory] || 1.0));
  }
  
  /**
   * VO2를 심박수로 변환
   */
  private static convertVO2ToHeartRate(vo2: number, maxHR: number, restingHR: number): number {
    // VO2와 심박수의 선형 관계 가정
    const vo2Reserve = vo2 / 50; // 정규화
    return restingHR + ((maxHR - restingHR) * vo2Reserve);
  }
  
  /**
   * RPE를 심박수로 변환
   */
  private static convertRPEToHeartRate(rpe: number, maxHR: number, restingHR: number): number {
    // RPE 1-10 스케일을 심박수로 변환
    const intensity = (rpe - 1) / 9; // 0-1 범위로 정규화
    return restingHR + ((maxHR - restingHR) * intensity);
  }
  
  /**
   * AI 적응형 강도 계산
   */
  private static calculateAIAdaptiveIntensity(
    restingHR: number,
    maxHR: number,
    baseIntensity: number,
    healthGrade: HealthGrade,
    data?: any
  ): number {
    // 복합 알고리즘으로 최적 강도 계산
    let adaptiveIntensity = baseIntensity;
    
    // 건강 지표별 가중치 적용
    const healthScore = this.calculateHealthScore(healthGrade);
    adaptiveIntensity *= (healthScore / 100);
    
    // 연령별 적응
    if (healthGrade.ageGrade === 'senior') {
      adaptiveIntensity *= 0.85;
    } else if (healthGrade.ageGrade === 'young') {
      adaptiveIntensity *= 1.1;
    }
    
    // 운동 경험 적응
    if (healthGrade.exerciseHistory === 'elite') {
      adaptiveIntensity *= 1.2;
    } else if (healthGrade.exerciseHistory === 'none') {
      adaptiveIntensity *= 0.7;
    }

    if (data?.recentFatigueScore !== undefined) {
      adaptiveIntensity *= 1 - Math.min(0.3, data.recentFatigueScore * 0.05);
    }
    if (data?.performanceTrend === 'up') {
      adaptiveIntensity *= 1.05;
    } else if (data?.performanceTrend === 'down') {
      adaptiveIntensity *= 0.9;
    }
    
    // 최종 심박수 계산
    const hrReserve = maxHR - restingHR;
    return restingHR + (hrReserve * Math.min(adaptiveIntensity, 0.95));
  }
  
  /**
   * 건강 점수 계산 (0-100)
   */
  private static calculateHealthScore(healthGrade: HealthGrade): number {
    let score = 100;
    
    // 각 지표별 감점
    const deductions = {
      cardiovascularGrade: { low: 0, moderate: -10, high: -20, very_high: -30 },
      obesityGrade: { normal: 0, overweight: -5, obesity1: -10, obesity2: -20, obesity3: -30 },
      metabolicGrade: { normal: 0, prediabetes: -10, diabetes: -20, metabolic_syndrome: -25 },
      musculoskeletalGrade: { normal: 0, mild_risk: -5, moderate_risk: -15, high_risk: -25 },
      exerciseHistory: { none: -20, beginner: -10, intermediate: 0, advanced: 10, elite: 15 }
    };
    
    score += deductions.cardiovascularGrade[healthGrade.cardiovascularGrade];
    score += deductions.obesityGrade[healthGrade.obesityGrade];
    score += deductions.metabolicGrade[healthGrade.metabolicGrade];
    score += deductions.musculoskeletalGrade[healthGrade.musculoskeletalGrade];
    score += deductions.exerciseHistory[healthGrade.exerciseHistory];
    
    return Math.max(20, Math.min(100, score));
  }
  
  /**
   * 복합 강도 점수 계산
   */
  private static calculateCompositeIntensityScore(
    intensity: number,
    healthGrade: HealthGrade,
    targetHR: number,
    maxHR: number
  ): number {
    const hrPercentage = (targetHR / maxHR) * 100;
    const healthScore = this.calculateHealthScore(healthGrade);
    
    // 가중 평균으로 복합 점수 계산
    return Math.round((intensity * 40) + (hrPercentage * 0.3) + (healthScore * 0.3));
  }
  
  /**
   * 신뢰도 점수 계산
   */
  private static calculateConfidenceScore(
    healthGrade: HealthGrade,
    data?: any
  ): number {
    let confidence = 0.8; // 기본 신뢰도
    
    // 데이터 완성도에 따른 조정
    if (data?.vo2Max) confidence += 0.1;
    if (data?.age && data?.weight && data?.height) confidence += 0.05;
    
    // 건강 지표의 일관성에 따른 조정
    const healthConsistency = this.calculateHealthConsistency(healthGrade);
    confidence += healthConsistency * 0.1;
    
    return Math.min(1.0, confidence);
  }
  
  /**
   * 건강 지표 일관성 계산
   */
  private static calculateHealthConsistency(healthGrade: HealthGrade): number {
    // 건강 지표들 간의 일관성 평가
    const grades = [
      healthGrade.cardiovascularGrade,
      healthGrade.obesityGrade,
      healthGrade.metabolicGrade,
      healthGrade.musculoskeletalGrade
    ];
    
    // 등급별 점수화
    const gradeScores = grades.map(grade => {
      if (typeof grade === 'string') {
        const scoreMap: { [key: string]: number } = {
          'low': 4, 'moderate': 3, 'high': 2, 'very_high': 1,
          'normal': 4, 'overweight': 3, 'obesity1': 2, 'obesity2': 1, 'obesity3': 0,
          'prediabetes': 2, 'diabetes': 1, 'metabolic_syndrome': 0,
          'mild_risk': 3, 'moderate_risk': 2, 'high_risk': 1
        };
        return scoreMap[grade] || 2;
      }
      return 2;
    });
    
    // 표준편차가 낮을수록 일관성 높음
    const mean = gradeScores.reduce((sum, score) => sum + score, 0) / gradeScores.length;
    const variance = gradeScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / gradeScores.length;
    const consistency = Math.max(0, 1 - (variance / 4)); // 정규화
    
    return consistency;
  }
  
  /**
   * 스트로크 효율성 계산
   */
  private static calculateStrokeEfficiency(healthGrade: HealthGrade): number {
    let efficiency = 0.8; // 기본 효율성
    
    // 유연성에 따른 조정
    const flexibilityMultiplier = {
      'excellent': 1.1,
      'good': 1.0,
      'fair': 0.9,
      'poor': 0.8
    };
    efficiency *= flexibilityMultiplier[healthGrade.flexibilityGrade];
    
    // 운동 경험에 따른 조정
    const experienceMultiplier = {
      'none': 0.7,
      'beginner': 0.8,
      'intermediate': 0.9,
      'advanced': 1.0,
      'elite': 1.1
    };
    efficiency *= experienceMultiplier[healthGrade.exerciseHistory];
    
    return Math.min(1.0, efficiency);
  }
  
  /**
   * 주관적 운동 강도 설명
   */
  private static getExertionDescription(intensity: number): string {
    if (intensity <= 0.3) return '매우 쉬움';
    else if (intensity <= 0.5) return '쉬움';
    else if (intensity <= 0.6) return '약간 힘듦';
    else if (intensity <= 0.7) return '힘듦';
    else if (intensity <= 0.8) return '매우 힘듦';
    else return '극도로 힘듦';
  }
  
  /**
   * 수영 속도 계산 (분당 미터)
   */
  private static calculateSwimmingPace(intensity: number, healthGrade: HealthGrade): number {
    let basePace = 30; // 기본 30m/min
    
    // 강도별 속도 조정
    basePace *= intensity;
    
    // 등급별 속도 조정
    switch (healthGrade.overallGrade) {
      case 'A': basePace *= 1.2; break;
      case 'B': basePace *= 1.0; break;
      case 'C': basePace *= 0.8; break;
      case 'D': basePace *= 0.6; break;
      case 'E': basePace *= 0.4; break;
    }
    
    return Math.round(basePace);
  }
  
  /**
   * 스트로크 레이트 계산 (분당 스트로크 수)
   */
  private static calculateStrokeRate(intensity: number, healthGrade: HealthGrade): number {
    let baseRate = 20; // 기본 20 strokes/min
    
    baseRate *= intensity;
    
    // 등급별 조정
    switch (healthGrade.overallGrade) {
      case 'A': baseRate *= 1.1; break;
      case 'B': baseRate *= 1.0; break;
      case 'C': baseRate *= 0.9; break;
      case 'D': baseRate *= 0.8; break;
      case 'E': baseRate *= 0.7; break;
    }
    
    return Math.round(baseRate);
  }
  
  /**
   * 안전 가이드라인 생성
   */
  private static generateSafetyGuidelines(healthGrade: HealthGrade): string[] {
    const guidelines: string[] = [
      '운동 전 충분한 준비운동 필수',
      '운동 중 충분한 수분 섭취',
      '이상 증상 발생 시 즉시 운동 중단'
    ];
    
    if (healthGrade.cardiovascularGrade === 'high' || healthGrade.cardiovascularGrade === 'very_high') {
      guidelines.push('심박수 모니터링 필수');
      guidelines.push('의료진 상담 후 운동 시작 권장');
    }
    
    if (healthGrade.obesityGrade === 'obesity2' || healthGrade.obesityGrade === 'obesity3') {
      guidelines.push('관절 부담 최소화를 위한 저충격 운동');
      guidelines.push('점진적 강도 증가');
    }
    
    if (healthGrade.ageGrade === 'senior') {
      guidelines.push('고령자 특화 안전 수칙 준수');
      guidelines.push('낙상 예방에 특별 주의');
    }
    
    return guidelines;
  }
  
  /**
   * 금기사항 생성
   */
  private static generateContraindications(healthGrade: HealthGrade): string[] {
    const contraindications: string[] = [];
    
    if (healthGrade.cardiovascularGrade === 'very_high') {
      contraindications.push('고강도 운동 금지');
      contraindications.push('의료진 감독 하에서만 운동');
    }
    
    if (healthGrade.obesityGrade === 'obesity3') {
      contraindications.push('관절 부담이 큰 운동 제한');
      contraindications.push('급격한 강도 증가 금지');
    }
    
    return contraindications;
  }
}
