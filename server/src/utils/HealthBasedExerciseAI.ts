/**
 * 🏥 JJ Swim Lab - 건강정보 기반 운동량 조정 AI 엔진
 * 
 * 📋 **기능**
 * - 개인 건강정보를 기반으로 한 맞춤형 운동량 계산
 * - 건강 상태별 위험도 평가 및 운동 강도 조정
 * - 실시간 건강 모니터링 및 운동량 자동 조절
 * - 건강정보 가중치를 활용한 개인화된 운동 추천
 * 
 * 🔄 **주요 기능**
 * - 건강정보 기반 운동 강도 계산
 * - 위험 요소 감지 및 운동량 제한
 * - 개인별 최적 운동량 추천
 * - 건강 상태 변화에 따른 동적 조정
 * 
 * 🗄️ **데이터 연동**
 * - 건강정보 데이터베이스
 * - 운동 기록 데이터
 * - AI 알고리즘 설정
 * - 의료 가이드라인 데이터
 * 
 * 📅 **개발 히스토리**
 * - 2025-01-22: 건강정보 기반 운동량 조정 AI 엔진 구현
 */

import { HealthData } from '../models/HealthData';
import { HealthConfig } from '../models/HealthConfig';
import { User } from '../models/User';
import { 
  MedicalGuidelineWeights, 
  MedicalRiskFactors, 
  ExerciseRiskClassification,
  MedicalWeightingSystem 
} from './MedicalGuidelineWeights';

// 건강정보 기반 운동 추천 인터페이스
export interface HealthBasedExerciseInput {
  userId: string;
  healthData: any;
  currentFitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  exerciseGoals: string[];
  medicalConditions?: string[];
  currentExerciseCapacity?: number;
}

export interface ExerciseRecommendation {
  exerciseType: string;
  intensity: 'low' | 'moderate' | 'high';
  duration: number; // 분
  frequency: number; // 주당 횟수
  calorieTarget: number;
  heartRateRange: {
    min: number;
    max: number;
  };
  precautions: string[];
  modifications: string[];
}

export interface HealthRiskAssessment {
  overallRisk: 'low' | 'moderate' | 'high' | 'critical';
  riskFactors: string[];
  recommendations: string[];
  exerciseLimitations: string[];
  monitoringRequired: boolean;
}

export interface HealthBasedExerciseResult {
  exerciseRecommendation: ExerciseRecommendation;
  riskAssessment: HealthRiskAssessment;
  medicalClassification: ExerciseRiskClassification;
  medicalWeighting: MedicalWeightingSystem;
  healthWeights: { [key: string]: number };
  adjustmentFactors: { [key: string]: number };
  medicalRecommendations: string[];
  swimmingSpecificGuidance: {
    restrictions: string[];
    benefits: string[];
    considerations: string[];
  };
  nextReviewDate: Date;
}

export class HealthBasedExerciseAI {
  
  /**
   * 건강정보 기반 운동량 조정 수행
   */
  static async calculateHealthBasedExercise(
    input: HealthBasedExerciseInput
  ): Promise<{ success: boolean; data?: HealthBasedExerciseResult; message?: string }> {
    try {
      console.log(`🏥 건강정보 기반 운동량 조정 시작: 사용자 ${input.userId}`);
      
      // 1. 의학적 위험 요소 변환
      const medicalFactors: MedicalRiskFactors = this.convertToMedicalFactors(input.healthData, input.medicalConditions);
      
      // 2. 의학적 가이드라인 기반 위험도 평가
      const medicalAssessment = MedicalGuidelineWeights.calculateMedicalWeights(medicalFactors);
      
      // 3. 수영 특화 가이드라인
      const swimmingGuidance = MedicalGuidelineWeights.assessSwimmingSpecificRisks(medicalFactors);
      
      // 4. 기존 건강정보 가중치 계산 (의학적 가중치와 결합)
      const healthWeights = await this.calculateHealthWeights(input.healthData, medicalAssessment.weighting);
      
      // 5. 기존 위험도 평가 (의학적 평가와 결합)
      const riskAssessment = this.assessHealthRisks(input.healthData, input.medicalConditions, medicalAssessment.classification);
      
      // 6. 조정 팩터 계산 (의학적 가이드라인 반영)
      const adjustmentFactors = this.calculateAdjustmentFactors(
        input.healthData,
        riskAssessment,
        input.currentFitnessLevel,
        medicalAssessment.weighting
      );
      
      // 7. 운동 추천 생성 (의학적 제약사항 반영)
      const exerciseRecommendation = this.generateExerciseRecommendation(
        input,
        healthWeights,
        adjustmentFactors,
        riskAssessment,
        medicalAssessment.classification
      );
      
      // 8. 다음 검토 날짜 계산
      const nextReviewDate = this.calculateNextReviewDate(riskAssessment, medicalAssessment.classification);
      
      const result: HealthBasedExerciseResult = {
        exerciseRecommendation,
        riskAssessment,
        medicalClassification: medicalAssessment.classification,
        medicalWeighting: medicalAssessment.weighting,
        healthWeights,
        adjustmentFactors,
        medicalRecommendations: medicalAssessment.recommendations,
        swimmingSpecificGuidance: {
          restrictions: swimmingGuidance.swimmingRestrictions,
          benefits: swimmingGuidance.swimmingBenefits,
          considerations: swimmingGuidance.specialConsiderations
        },
        nextReviewDate
      };
      
      console.log(`✅ 의학적 가이드라인 기반 운동량 조정 완료:`);
      console.log(`   - 의학적 위험도: ${medicalAssessment.classification.riskLevel}`);
      console.log(`   - 권장 강도: ${medicalAssessment.classification.recommendedIntensity}`);
      console.log(`   - 의료진 승인 필요: ${medicalAssessment.classification.medicalClearanceRequired ? '예' : '아니오'}`);
      
      return { success: true, data: result };
      
    } catch (error) {
      console.error('❌ 건강정보 기반 운동량 조정 오류:', error);
      return { 
        success: false, 
        message: '건강정보 기반 운동량 조정 중 오류가 발생했습니다.' 
      };
    }
  }
  
  /**
   * 건강정보를 의학적 위험 요소 형식으로 변환
   */
  private static convertToMedicalFactors(healthData: any, medicalConditions?: string[]): MedicalRiskFactors {
    return {
      age: healthData.age || 30,
      gender: healthData.gender || 'male',
      bmi: healthData.bmi || this.calculateBMI(healthData.weight, healthData.height),
      systolicBP: healthData.bloodPressure?.systolic || healthData.systolicBP || 120,
      diastolicBP: healthData.bloodPressure?.diastolic || healthData.diastolicBP || 80,
      restingHR: healthData.restingHeartRate || healthData.heartRate || 70,
      bloodSugar: healthData.bloodSugar || healthData.glucose || 90,
      cholesterol: healthData.cholesterol || undefined,
      smokingStatus: healthData.smokingStatus || 'never',
      familyHistory: healthData.familyHistory || [],
      medications: healthData.medications || [],
      medicalConditions: medicalConditions || []
    };
  }
  
  /**
   * BMI 계산 (체중과 신장이 있는 경우)
   */
  private static calculateBMI(weight?: number, height?: number): number {
    if (!weight || !height) return 23; // 평균값 반환
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
  }
  
  /**
   * 건강정보 가중치 계산
   */
  private static async calculateHealthWeights(healthData: any): Promise<{ [key: string]: number }> {
    const weights: { [key: string]: number } = {};
    
    // 기본 가중치 설정
    const defaultWeights = {
      age: 0.15,
      weight: 0.10,
      height: 0.05,
      bmi: 0.15,
      bloodPressure: 0.20,
      heartRate: 0.15,
      bloodSugar: 0.10,
      cholesterol: 0.10
    };
    
    // 건강 상태에 따른 가중치 조정
    Object.keys(defaultWeights).forEach(key => {
      let weight = defaultWeights[key as keyof typeof defaultWeights];
      
      // 나이별 가중치 조정
      if (key === 'age' && healthData.age) {
        if (healthData.age > 60) weight *= 1.5;
        else if (healthData.age > 45) weight *= 1.2;
        else if (healthData.age < 25) weight *= 0.8;
      }
      
      // BMI별 가중치 조정
      if (key === 'bmi' && healthData.bmi) {
        if (healthData.bmi > 30) weight *= 1.8; // 비만
        else if (healthData.bmi > 25) weight *= 1.3; // 과체중
        else if (healthData.bmi < 18.5) weight *= 1.4; // 저체중
      }
      
      // 혈압별 가중치 조정
      if (key === 'bloodPressure' && healthData.bloodPressure) {
        const systolic = healthData.bloodPressure.systolic;
        const diastolic = healthData.bloodPressure.diastolic;
        
        if (systolic > 140 || diastolic > 90) weight *= 2.0; // 고혈압
        else if (systolic > 130 || diastolic > 85) weight *= 1.5; // 전고혈압
        else if (systolic < 90 || diastolic < 60) weight *= 1.3; // 저혈압
      }
      
      weights[key] = weight;
    });
    
    return weights;
  }
  
  /**
   * 건강 위험도 평가
   */
  private static assessHealthRisks(
    healthData: any, 
    medicalConditions?: string[]
  ): HealthRiskAssessment {
    const riskFactors: string[] = [];
    const recommendations: string[] = [];
    const exerciseLimitations: string[] = [];
    let riskScore = 0;
    
    // 나이 위험도
    if (healthData.age > 65) {
      riskScore += 2;
      riskFactors.push('고령 (65세 이상)');
      recommendations.push('저강도 운동부터 시작하세요');
      exerciseLimitations.push('고강도 운동 제한');
    } else if (healthData.age > 50) {
      riskScore += 1;
      riskFactors.push('중년 (50세 이상)');
    }
    
    // BMI 위험도
    if (healthData.bmi > 30) {
      riskScore += 3;
      riskFactors.push('비만 (BMI > 30)');
      recommendations.push('체중 감량을 위한 유산소 운동 집중');
      exerciseLimitations.push('관절에 부담을 주는 운동 주의');
    } else if (healthData.bmi > 25) {
      riskScore += 1;
      riskFactors.push('과체중 (BMI > 25)');
      recommendations.push('균형잡힌 운동과 식단 관리');
    } else if (healthData.bmi < 18.5) {
      riskScore += 2;
      riskFactors.push('저체중 (BMI < 18.5)');
      recommendations.push('근력 운동과 영양 보충');
      exerciseLimitations.push('과도한 유산소 운동 제한');
    }
    
    // 혈압 위험도
    if (healthData.bloodPressure) {
      const systolic = healthData.bloodPressure.systolic;
      const diastolic = healthData.bloodPressure.diastolic;
      
      if (systolic > 180 || diastolic > 110) {
        riskScore += 4;
        riskFactors.push('중증 고혈압');
        recommendations.push('의사와 상담 후 운동 시작');
        exerciseLimitations.push('고강도 운동 금지');
      } else if (systolic > 140 || diastolic > 90) {
        riskScore += 2;
        riskFactors.push('고혈압');
        recommendations.push('저-중강도 운동 권장');
        exerciseLimitations.push('급격한 강도 변화 주의');
      }
    }
    
    // 심박수 위험도
    if (healthData.restingHeartRate) {
      if (healthData.restingHeartRate > 100) {
        riskScore += 2;
        riskFactors.push('빈맥 (안정시 심박수 > 100)');
        recommendations.push('심박수 모니터링 필수');
      } else if (healthData.restingHeartRate < 50) {
        riskScore += 1;
        riskFactors.push('서맥 (안정시 심박수 < 50)');
        recommendations.push('운동 중 심박수 확인');
      }
    }
    
    // 의료 조건 위험도
    if (medicalConditions) {
      medicalConditions.forEach(condition => {
        switch (condition.toLowerCase()) {
          case 'diabetes':
          case '당뇨병':
            riskScore += 2;
            riskFactors.push('당뇨병');
            recommendations.push('혈당 모니터링 필수');
            exerciseLimitations.push('공복 운동 주의');
            break;
          case 'heart_disease':
          case '심장병':
            riskScore += 4;
            riskFactors.push('심장병');
            recommendations.push('심장 재활 전문의 상담');
            exerciseLimitations.push('고강도 운동 금지');
            break;
          case 'asthma':
          case '천식':
            riskScore += 1;
            riskFactors.push('천식');
            recommendations.push('흡입기 준비');
            exerciseLimitations.push('찬 공기 운동 주의');
            break;
        }
      });
    }
    
    // 전체 위험도 결정
    let overallRisk: 'low' | 'moderate' | 'high' | 'critical';
    if (riskScore >= 8) overallRisk = 'critical';
    else if (riskScore >= 5) overallRisk = 'high';
    else if (riskScore >= 2) overallRisk = 'moderate';
    else overallRisk = 'low';
    
    return {
      overallRisk,
      riskFactors,
      recommendations,
      exerciseLimitations,
      monitoringRequired: riskScore >= 2
    };
  }
  
  /**
   * 조정 팩터 계산
   */
  private static calculateAdjustmentFactors(
    healthData: any,
    riskAssessment: HealthRiskAssessment,
    fitnessLevel: string
  ): { [key: string]: number } {
    const factors: { [key: string]: number } = {
      intensity: 1.0,
      duration: 1.0,
      frequency: 1.0,
      recovery: 1.0
    };
    
    // 위험도에 따른 조정
    switch (riskAssessment.overallRisk) {
      case 'critical':
        factors.intensity *= 0.3;
        factors.duration *= 0.5;
        factors.frequency *= 0.6;
        factors.recovery *= 2.0;
        break;
      case 'high':
        factors.intensity *= 0.5;
        factors.duration *= 0.7;
        factors.frequency *= 0.8;
        factors.recovery *= 1.5;
        break;
      case 'moderate':
        factors.intensity *= 0.8;
        factors.duration *= 0.9;
        factors.frequency *= 0.9;
        factors.recovery *= 1.2;
        break;
      case 'low':
        // 기본값 유지
        break;
    }
    
    // 체력 수준에 따른 조정
    switch (fitnessLevel) {
      case 'beginner':
        factors.intensity *= 0.7;
        factors.duration *= 0.8;
        factors.recovery *= 1.3;
        break;
      case 'intermediate':
        // 기본값 유지
        break;
      case 'advanced':
        factors.intensity *= 1.2;
        factors.duration *= 1.1;
        factors.recovery *= 0.8;
        break;
    }
    
    // 나이에 따른 조정
    if (healthData.age > 60) {
      factors.intensity *= 0.8;
      factors.recovery *= 1.3;
    } else if (healthData.age > 45) {
      factors.intensity *= 0.9;
      factors.recovery *= 1.1;
    }
    
    // BMI에 따른 조정
    if (healthData.bmi > 30) {
      factors.intensity *= 0.7;
      factors.duration *= 1.2; // 더 긴 저강도 운동
      factors.recovery *= 1.2;
    } else if (healthData.bmi < 18.5) {
      factors.intensity *= 0.8;
      factors.duration *= 0.9;
    }
    
    return factors;
  }
  
  /**
   * 운동 추천 생성
   */
  private static generateExerciseRecommendation(
    input: HealthBasedExerciseInput,
    healthWeights: { [key: string]: number },
    adjustmentFactors: { [key: string]: number },
    riskAssessment: HealthRiskAssessment
  ): ExerciseRecommendation {
    
    // 기본 운동 파라미터
    let baseIntensity = 'moderate' as 'low' | 'moderate' | 'high';
    let baseDuration = 45; // 분
    let baseFrequency = 3; // 주당 횟수
    let baseCalories = 300;
    
    // 체력 수준에 따른 기본값 조정
    switch (input.currentFitnessLevel) {
      case 'beginner':
        baseIntensity = 'low';
        baseDuration = 30;
        baseFrequency = 2;
        baseCalories = 200;
        break;
      case 'advanced':
        baseIntensity = 'high';
        baseDuration = 60;
        baseFrequency = 4;
        baseCalories = 450;
        break;
    }
    
    // 조정 팩터 적용
    const adjustedDuration = Math.round(baseDuration * adjustmentFactors.duration);
    const adjustedFrequency = Math.round(baseFrequency * adjustmentFactors.frequency);
    const adjustedCalories = Math.round(baseCalories * adjustmentFactors.intensity);
    
    // 강도 조정
    let finalIntensity = baseIntensity;
    if (adjustmentFactors.intensity < 0.6) {
      finalIntensity = 'low';
    } else if (adjustmentFactors.intensity > 1.2) {
      finalIntensity = 'high';
    }
    
    // 심박수 범위 계산
    const maxHeartRate = 220 - (input.healthData.age || 30);
    let heartRateRange: { min: number; max: number };
    
    switch (finalIntensity) {
      case 'low':
        heartRateRange = {
          min: Math.round(maxHeartRate * 0.5),
          max: Math.round(maxHeartRate * 0.6)
        };
        break;
      case 'moderate':
        heartRateRange = {
          min: Math.round(maxHeartRate * 0.6),
          max: Math.round(maxHeartRate * 0.7)
        };
        break;
      case 'high':
        heartRateRange = {
          min: Math.round(maxHeartRate * 0.7),
          max: Math.round(maxHeartRate * 0.8)
        };
        break;
    }
    
    // 주의사항 생성
    const precautions = [...riskAssessment.recommendations];
    if (riskAssessment.monitoringRequired) {
      precautions.push('운동 중 심박수 및 혈압 모니터링 필수');
    }
    
    // 운동 수정사항
    const modifications = [...riskAssessment.exerciseLimitations];
    if (input.healthData.bmi > 30) {
      modifications.push('수중 운동으로 관절 부담 최소화');
    }
    
    return {
      exerciseType: 'swimming',
      intensity: finalIntensity,
      duration: adjustedDuration,
      frequency: adjustedFrequency,
      calorieTarget: adjustedCalories,
      heartRateRange,
      precautions,
      modifications
    };
  }
  
  /**
   * 다음 검토 날짜 계산
   */
  private static calculateNextReviewDate(riskAssessment: HealthRiskAssessment): Date {
    const now = new Date();
    let daysToAdd: number;
    
    switch (riskAssessment.overallRisk) {
      case 'critical':
        daysToAdd = 7; // 1주일
        break;
      case 'high':
        daysToAdd = 14; // 2주일
        break;
      case 'moderate':
        daysToAdd = 30; // 1개월
        break;
      case 'low':
        daysToAdd = 90; // 3개월
        break;
    }
    
    return new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
  }
  
  /**
   * 실시간 운동량 조정
   */
  static async adjustExerciseInRealTime(
    userId: string,
    currentHeartRate: number,
    currentIntensity: number,
    exerciseRecommendation: ExerciseRecommendation
  ): Promise<{ adjustedIntensity: number; warning?: string; shouldStop?: boolean }> {
    
    let adjustedIntensity = currentIntensity;
    let warning: string | undefined;
    let shouldStop = false;
    
    // 심박수 기반 조정
    if (currentHeartRate > exerciseRecommendation.heartRateRange.max * 1.1) {
      adjustedIntensity = Math.max(currentIntensity * 0.8, 0.3);
      warning = '심박수가 너무 높습니다. 강도를 낮춰주세요.';
      
      if (currentHeartRate > exerciseRecommendation.heartRateRange.max * 1.3) {
        shouldStop = true;
        warning = '심박수가 위험 수준입니다. 운동을 중단하고 휴식하세요.';
      }
    } else if (currentHeartRate < exerciseRecommendation.heartRateRange.min * 0.9) {
      adjustedIntensity = Math.min(currentIntensity * 1.1, 1.0);
      warning = '강도를 조금 높여도 좋습니다.';
    }
    
    return {
      adjustedIntensity,
      warning,
      shouldStop
    };
  }
}
