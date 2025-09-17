/**
 * 의학적 운동 처방 서비스
 * 건강 상태 기반 안전하고 효과적인 운동 추천 알고리즘
 * ACSM (American College of Sports Medicine) 가이드라인 기반
 */

import mongoose from 'mongoose';
import { 
  HealthAssessment, 
  IHealthAssessment, 
  HealthRiskLevel, 
  ChronicCondition,
  ExerciseRestriction,
  ExerciseRecommendationType,
  IExerciseRecommendation,
  IVitalSigns
} from '../models/HealthAssessment';

// 운동 처방 요청 인터페이스
export interface IMedicalExercisePrescriptionRequest {
  userId: mongoose.Types.ObjectId;
  healthAssessmentId: mongoose.Types.ObjectId;
  goals: string[]; // 운동 목표
  preferences: {
    exerciseTypes: string[];
    timeAvailable: number; // 분
    daysPerWeek: number;
    intensity: 'low' | 'moderate' | 'high';
  };
  environmentalFactors: {
    poolAvailable: boolean;
    gymAccess: boolean;
    homeEquipment: string[];
    weatherRestrictions: string[];
  };
}

// 운동 처방 결과 인터페이스
export interface IMedicalPrescriptionResult {
  prescriptionId: string;
  patientInfo: {
    userId: mongoose.Types.ObjectId;
    riskLevel: HealthRiskLevel;
    primaryConditions: ChronicCondition[];
    currentMedications: string[];
  };
  exerciseRecommendations: IExerciseRecommendation[];
  safetyGuidelines: {
    preExerciseChecklist: string[];
    duringExerciseMonitoring: string[];
    postExerciseActions: string[];
    warningSignsToStop: string[];
    emergencyProtocol: string[];
  };
  progressionPlan: {
    phase: number;
    duration: string; // 주
    objectives: string[];
    exerciseModifications: string[];
    assessmentSchedule: string;
  }[];
  medicalSupervision: {
    required: boolean;
    frequency: string;
    specialistReferral: boolean;
    clearanceNeeded: boolean;
  };
  contraindications: {
    absolute: string[];
    relative: string[];
  };
}

export class MedicalExercisePrescriptionService {
  
  /**
   * 의학적 운동 처방 생성
   */
  static async createMedicalPrescription(
    request: IMedicalExercisePrescriptionRequest
  ): Promise<IMedicalPrescriptionResult> {
    try {
      // 1. 건강 평가 정보 조회
      const healthAssessment = await HealthAssessment.findById(request.healthAssessmentId)
        .populate('userId', 'name email age');
      
      if (!healthAssessment) {
        throw new Error('건강 평가 정보를 찾을 수 없습니다.');
      }
      
      // 2. 위험도 기반 운동 제한사항 분석
      const riskAnalysis = this.analyzeHealthRisks(healthAssessment);
      
      // 3. 질환별 운동 가이드라인 적용
      const conditionGuidelines = this.getConditionSpecificGuidelines(
        healthAssessment.chronicConditions
      );
      
      // 4. 개인 맞춤 운동 처방 생성
      const exerciseRecommendations = this.generateExerciseRecommendations(
        healthAssessment,
        request,
        riskAnalysis,
        conditionGuidelines
      );
      
      // 5. 안전 가이드라인 생성
      const safetyGuidelines = this.generateSafetyGuidelines(
        healthAssessment,
        riskAnalysis
      );
      
      // 6. 진행 단계별 계획 수립
      const progressionPlan = this.createProgressionPlan(
        healthAssessment,
        exerciseRecommendations
      );
      
      // 7. 의료진 감독 요구사항 결정
      const medicalSupervision = this.determineMedicalSupervision(
        healthAssessment,
        riskAnalysis
      );
      
      // 8. 금기사항 목록 생성
      const contraindications = this.identifyContraindications(
        healthAssessment
      );
      
      // 9. 건강 평가에 운동 처방 저장
      healthAssessment.exerciseRecommendations = exerciseRecommendations;
      await healthAssessment.save();
      
      return {
        prescriptionId: `MP-${Date.now()}-${healthAssessment.userId}`,
        patientInfo: {
          userId: healthAssessment.userId,
          riskLevel: healthAssessment.riskAssessment.overallRisk,
          primaryConditions: healthAssessment.chronicConditions.map(c => c.condition),
          currentMedications: healthAssessment.chronicConditions.flatMap(c => 
            c.medications.map(m => m.name)
          )
        },
        exerciseRecommendations,
        safetyGuidelines,
        progressionPlan,
        medicalSupervision,
        contraindications
      };
      
    } catch (error) {
      console.error('의학적 운동 처방 생성 오류:', error);
      throw new Error('의학적 운동 처방 생성에 실패했습니다.');
    }
  }
  
  /**
   * 건강 위험도 분석
   */
  private static analyzeHealthRisks(healthAssessment: IHealthAssessment) {
    const latestVitals = (healthAssessment as any).getLatestVitalSigns();
    const riskFactors = [];
    let cardiovascularRisk = 0;
    let metabolicRisk = 0;
    let overallRisk = healthAssessment.riskAssessment.overallRisk;
    
    // 혈압 위험도 분석
    if (latestVitals) {
      // 고혈압 단계별 위험도
      if (latestVitals.systolicBP >= 180 || latestVitals.diastolicBP >= 110) {
        cardiovascularRisk += 30;
        riskFactors.push('고혈압 3단계 (위험)');
      } else if (latestVitals.systolicBP >= 160 || latestVitals.diastolicBP >= 100) {
        cardiovascularRisk += 20;
        riskFactors.push('고혈압 2단계 (중등도)');
      } else if (latestVitals.systolicBP >= 140 || latestVitals.diastolicBP >= 90) {
        cardiovascularRisk += 15;
        riskFactors.push('고혈압 1단계 (경도)');
      } else if (latestVitals.systolicBP >= 130 || latestVitals.diastolicBP >= 80) {
        cardiovascularRisk += 10;
        riskFactors.push('고혈압 전단계');
      }
      
      // 혈당 위험도 분석
      if (latestVitals.bloodGlucose) {
        if (latestVitals.bloodGlucose >= 200) {
          metabolicRisk += 25;
          riskFactors.push('혈당 매우 높음 (>200mg/dL)');
        } else if (latestVitals.bloodGlucose >= 140) {
          metabolicRisk += 15;
          riskFactors.push('혈당 높음 (140-199mg/dL)');
        } else if (latestVitals.bloodGlucose >= 100) {
          metabolicRisk += 10;
          riskFactors.push('공복혈당장애 (100-139mg/dL)');
        }
      }
      
      // 안정시 심박수 분석
      if (latestVitals.restingHR > 100) {
        cardiovascularRisk += 10;
        riskFactors.push('빈맥 (안정시 심박수 >100bpm)');
      } else if (latestVitals.restingHR < 50) {
        cardiovascularRisk += 5;
        riskFactors.push('서맥 (안정시 심박수 <50bpm)');
      }
    }
    
    // BMI 위험도 분석
    const bmi = healthAssessment.basicHealth.bmi;
    if (bmi >= 35) {
      metabolicRisk += 20;
      riskFactors.push('고도비만 (BMI ≥35)');
    } else if (bmi >= 30) {
      metabolicRisk += 15;
      riskFactors.push('비만 (BMI 30-34.9)');
    } else if (bmi >= 25) {
      metabolicRisk += 10;
      riskFactors.push('과체중 (BMI 25-29.9)');
    } else if (bmi < 18.5) {
      metabolicRisk += 5;
      riskFactors.push('저체중 (BMI <18.5)');
    }
    
    // 생활습관 위험요인
    if (healthAssessment.basicHealth.smokingStatus === 'current') {
      cardiovascularRisk += 20;
      riskFactors.push('현재 흡연');
    }
    
    if (healthAssessment.basicHealth.alcoholConsumption === 'heavy') {
      metabolicRisk += 10;
      riskFactors.push('과도한 음주');
    }
    
    if (healthAssessment.basicHealth.activityLevel === 'sedentary') {
      cardiovascularRisk += 15;
      riskFactors.push('좌식 생활');
    }
    
    return {
      cardiovascularRisk: Math.min(cardiovascularRisk, 100),
      metabolicRisk: Math.min(metabolicRisk, 100),
      overallRisk,
      riskFactors,
      requiresSupervision: overallRisk === HealthRiskLevel.HIGH || 
                          overallRisk === HealthRiskLevel.VERY_HIGH ||
                          overallRisk === HealthRiskLevel.CRITICAL,
      requiresClearance: healthAssessment.riskAssessment.clearanceRequired
    };
  }
  
  /**
   * 질환별 운동 가이드라인 조회
   */
  private static getConditionSpecificGuidelines(chronicConditions: any[]) {
    const guidelines: Partial<Record<ChronicCondition, any>> = {
      [ChronicCondition.HYPERTENSION]: {
        recommendedTypes: [ExerciseRecommendationType.AEROBIC_MODERATE, ExerciseRecommendationType.RESISTANCE_LIGHT],
        intensityRange: [3, 6], // 1-10 스케일
        durationRange: [20, 45], // 분
        frequencyRange: [3, 5], // 주당 횟수
        targetHR: { min: 0.4, max: 0.7 }, // HRR 비율
        precautions: [
          '운동 전후 혈압 측정',
          '급격한 자세 변화 피하기',
          '발살바 호흡법 금지',
          '수축기 혈압 220mmHg 이상시 운동 중단'
        ],
        contraindications: [
          '안정시 수축기 혈압 >180mmHg',
          '안정시 이완기 혈압 >110mmHg',
          '운동으로 인한 혈압 상승 >250/115mmHg'
        ],
        modifications: [
          '점진적 강도 증가',
          '충분한 워밍업 및 쿨다운',
          '등척성 운동 최소화'
        ]
      },
      
      [ChronicCondition.DIABETES_TYPE2]: {
        recommendedTypes: [ExerciseRecommendationType.AEROBIC_MODERATE, ExerciseRecommendationType.RESISTANCE_LIGHT, ExerciseRecommendationType.FLEXIBILITY],
        intensityRange: [4, 7],
        durationRange: [30, 60],
        frequencyRange: [4, 6],
        targetHR: { min: 0.5, max: 0.8 },
        precautions: [
          '운동 전후 혈당 측정',
          '저혈당 증상 모니터링',
          '발 상태 정기 점검',
          '충분한 수분 섭취'
        ],
        contraindications: [
          '혈당 >300mg/dL',
          '혈당 <100mg/dL (인슐린 사용시)',
          '케톤뇨 양성',
          '당뇨병성 망막증 (고강도 운동)'
        ],
        modifications: [
          '식사 후 1-2시간 후 운동',
          '인슐린 주사 부위 피해서 운동',
          '점진적 운동량 증가'
        ]
      },
      
      [ChronicCondition.HEART_DISEASE]: {
        recommendedTypes: [ExerciseRecommendationType.AEROBIC_LOW, ExerciseRecommendationType.FLEXIBILITY],
        intensityRange: [2, 5],
        durationRange: [15, 30],
        frequencyRange: [3, 4],
        targetHR: { min: 0.3, max: 0.6 },
        precautions: [
          '의료진 감독 하에 운동',
          '심전도 모니터링',
          '흉통, 호흡곤란 즉시 중단',
          '니트로글리세린 휴대'
        ],
        contraindications: [
          '불안정형 협심증',
          '조절되지 않는 부정맥',
          '급성 심근염',
          '심한 대동맥 협착증'
        ],
        modifications: [
          '매우 점진적 진행',
          '짧은 운동 시간으로 시작',
          '상체 운동 제한'
        ]
      },
      
      [ChronicCondition.ASTHMA]: {
        recommendedTypes: [ExerciseRecommendationType.AEROBIC_LOW, ExerciseRecommendationType.FLEXIBILITY, ExerciseRecommendationType.BREATHING],
        intensityRange: [3, 6],
        durationRange: [20, 40],
        frequencyRange: [3, 5],
        targetHR: { min: 0.4, max: 0.7 },
        precautions: [
          '기관지확장제 휴대',
          '충분한 워밍업 (15분)',
          '찬 공기, 건조한 환경 피하기',
          '호흡곤란시 즉시 중단'
        ],
        contraindications: [
          '급성 천식 발작',
          '조절되지 않는 천식',
          '심한 운동유발성 천식'
        ],
        modifications: [
          '간헐적 운동 (인터벌)',
          '수영 권장 (습한 환경)',
          '점진적 강도 증가'
        ]
      },
      
      [ChronicCondition.ARTHRITIS]: {
        recommendedTypes: [ExerciseRecommendationType.FLEXIBILITY, ExerciseRecommendationType.AEROBIC_LOW, ExerciseRecommendationType.BALANCE],
        intensityRange: [2, 5],
        durationRange: [20, 45],
        frequencyRange: [4, 6],
        targetHR: { min: 0.3, max: 0.6 },
        precautions: [
          '관절 통증 모니터링',
          '염증 악화시 운동 중단',
          '관절 보호 장비 착용',
          '충분한 휴식'
        ],
        contraindications: [
          '급성 관절염',
          '심한 관절 변형',
          '관절 불안정성'
        ],
        modifications: [
          '충격이 적은 운동',
          '관절 가동범위 운동',
          '수중 운동 권장'
        ]
      },
      
      [ChronicCondition.OSTEOPOROSIS]: {
        recommendedTypes: [ExerciseRecommendationType.RESISTANCE_LIGHT, ExerciseRecommendationType.BALANCE, ExerciseRecommendationType.FLEXIBILITY],
        intensityRange: [3, 6],
        durationRange: [30, 45],
        frequencyRange: [3, 4],
        targetHR: { min: 0.4, max: 0.7 },
        precautions: [
          '낙상 위험 최소화',
          '척추 굽힘 동작 피하기',
          '충격이 큰 운동 피하기',
          '균형 능력 향상'
        ],
        contraindications: [
          '척추 압박골절',
          '심한 골다공증 (T-score < -3.0)',
          '최근 골절 이력'
        ],
        modifications: [
          '체중 부하 운동',
          '저항 운동 포함',
          '균형 훈련 강화'
        ]
      }
    };
    
    const applicableGuidelines = chronicConditions
      .map(condition => guidelines[condition.condition])
      .filter(Boolean);
    
    return applicableGuidelines;
  }
  
  /**
   * 운동 추천 생성
   */
  private static generateExerciseRecommendations(
    healthAssessment: IHealthAssessment,
    request: IMedicalExercisePrescriptionRequest,
    riskAnalysis: any,
    conditionGuidelines: any[]
  ): IExerciseRecommendation[] {
    
    const recommendations: IExerciseRecommendation[] = [];
    const latestVitals = (healthAssessment as any).getLatestVitalSigns();
    
    // 기본 운동 처방 파라미터 설정
    const baseParams = this.calculateBaseParameters(
      healthAssessment,
      riskAnalysis,
      conditionGuidelines
    );
    
    // 목표 심박수 계산 (Karvonen 공식)
    const targetHR = this.calculateTargetHeartRate(
      healthAssessment.basicHealth.age,
      latestVitals?.restingHR || 70,
      baseParams.intensityRange
    );
    
    // 1. 유산소 운동 추천
    if (baseParams.includeAerobic) {
      recommendations.push({
        type: riskAnalysis.overallRisk === HealthRiskLevel.HIGH || 
              riskAnalysis.overallRisk === HealthRiskLevel.VERY_HIGH ?
              ExerciseRecommendationType.AEROBIC_LOW : 
              ExerciseRecommendationType.AEROBIC_MODERATE,
        intensity: baseParams.aerobicIntensity,
        duration: baseParams.aerobicDuration,
        frequency: baseParams.aerobicFrequency,
        targetHR,
        specificExercises: this.generateAerobicExercises(
          healthAssessment,
          request.environmentalFactors,
          baseParams.aerobicIntensity
        ),
        precautions: this.getAerobicPrecautions(healthAssessment, riskAnalysis),
        contraindications: this.getAerobicContraindications(healthAssessment),
        progressionPlan: this.generateAerobicProgression(baseParams)
      });
    }
    
    // 2. 저항 운동 추천
    if (baseParams.includeResistance) {
      recommendations.push({
        type: ExerciseRecommendationType.RESISTANCE_LIGHT,
        intensity: baseParams.resistanceIntensity,
        duration: baseParams.resistanceDuration,
        frequency: baseParams.resistanceFrequency,
        targetHR: {
          min: targetHR.min - 10,
          max: targetHR.max - 10
        },
        specificExercises: this.generateResistanceExercises(
          healthAssessment,
          request.environmentalFactors,
          baseParams.resistanceIntensity
        ),
        precautions: this.getResistancePrecautions(healthAssessment, riskAnalysis),
        contraindications: this.getResistanceContraindications(healthAssessment),
        progressionPlan: this.generateResistanceProgression(baseParams)
      });
    }
    
    // 3. 유연성 운동 추천
    recommendations.push({
      type: ExerciseRecommendationType.FLEXIBILITY,
      intensity: 3, // 낮은 강도
      duration: 15,
      frequency: 6, // 거의 매일
      targetHR: {
        min: targetHR.min - 20,
        max: targetHR.min - 10
      },
      specificExercises: this.generateFlexibilityExercises(healthAssessment),
      precautions: ['급격한 스트레칭 피하기', '통증 발생시 중단'],
      contraindications: ['급성 근육 손상', '관절 염증'],
      progressionPlan: [{
        week: 1,
        adjustments: '기본 스트레칭 동작 익히기'
      }, {
        week: 4,
        adjustments: '스트레칭 시간 점진적 증가'
      }]
    });
    
    // 4. 특수 상황별 추가 운동
    if (healthAssessment.basicHealth.age >= 65 || 
        healthAssessment.chronicConditions.some(c => c.condition === ChronicCondition.OSTEOPOROSIS)) {
      recommendations.push({
        type: ExerciseRecommendationType.BALANCE,
        intensity: 3,
        duration: 10,
        frequency: 3,
        targetHR: {
          min: targetHR.min - 30,
          max: targetHR.min - 20
        },
        specificExercises: this.generateBalanceExercises(),
        precautions: ['낙상 방지 안전장치 준비', '보조자 동반'],
        contraindications: ['심한 어지럼증', '균형 장애'],
        progressionPlan: [{
          week: 1,
          adjustments: '기본 균형 동작 연습'
        }]
      });
    }
    
    return recommendations;
  }
  
  /**
   * 기본 운동 처방 파라미터 계산
   */
  private static calculateBaseParameters(
    healthAssessment: IHealthAssessment,
    riskAnalysis: any,
    conditionGuidelines: any[]
  ) {
    let aerobicIntensity = 5; // 기본 중간 강도
    let aerobicDuration = 30;
    let aerobicFrequency = 3;
    let resistanceIntensity = 4;
    let resistanceDuration = 20;
    let resistanceFrequency = 2;
    
    // 위험도에 따른 조정
    if (riskAnalysis.overallRisk === HealthRiskLevel.HIGH || 
        riskAnalysis.overallRisk === HealthRiskLevel.VERY_HIGH) {
      aerobicIntensity = Math.max(3, aerobicIntensity - 2);
      aerobicDuration = Math.max(15, aerobicDuration - 10);
      resistanceIntensity = Math.max(2, resistanceIntensity - 2);
    }
    
    // 질환별 가이드라인 적용
    if (conditionGuidelines.length > 0) {
      const avgIntensityRange = conditionGuidelines.reduce((sum, g) => sum + g.intensityRange[1], 0) / conditionGuidelines.length;
      aerobicIntensity = Math.min(aerobicIntensity, avgIntensityRange);
      
      const avgDurationRange = conditionGuidelines.reduce((sum, g) => sum + g.durationRange[1], 0) / conditionGuidelines.length;
      aerobicDuration = Math.min(aerobicDuration, avgDurationRange);
    }
    
    // 연령 조정
    if (healthAssessment.basicHealth.age >= 65) {
      aerobicIntensity = Math.max(3, aerobicIntensity - 1);
      resistanceIntensity = Math.max(2, resistanceIntensity - 1);
    }
    
    // BMI 조정
    if (healthAssessment.basicHealth.bmi >= 30) {
      aerobicDuration = Math.min(aerobicDuration, 25); // 비만시 시간 단축
    }
    
    return {
      aerobicIntensity,
      aerobicDuration,
      aerobicFrequency,
      resistanceIntensity,
      resistanceDuration,
      resistanceFrequency,
      intensityRange: [Math.max(2, aerobicIntensity - 1), aerobicIntensity + 1],
      includeAerobic: true,
      includeResistance: riskAnalysis.overallRisk !== HealthRiskLevel.CRITICAL
    };
  }
  
  /**
   * 목표 심박수 계산 (Karvonen 공식)
   */
  private static calculateTargetHeartRate(age: number, restingHR: number, intensityRange: number[]) {
    const maxHR = 220 - age;
    const heartRateReserve = maxHR - restingHR;
    
    const minIntensity = intensityRange[0] / 10; // 1-10을 0.1-1.0으로 변환
    const maxIntensity = intensityRange[1] / 10;
    
    return {
      min: Math.round(restingHR + (heartRateReserve * minIntensity)),
      max: Math.round(restingHR + (heartRateReserve * maxIntensity))
    };
  }
  
  /**
   * 유산소 운동 생성
   */
  private static generateAerobicExercises(
    healthAssessment: IHealthAssessment,
    environmentalFactors: any,
    intensity: number
  ) {
    const exercises = [];
    
    // 수영장 이용 가능시
    if (environmentalFactors.poolAvailable) {
      exercises.push({
        name: '수영 (자유형/배영)',
        duration: 20,
        modifications: [
          '자신의 페이스로 진행',
          '호흡이 편한 영법 선택',
          '중간중간 휴식'
        ]
      });
      
      exercises.push({
        name: '수중 걷기',
        duration: 15,
        modifications: [
          '물의 저항 이용',
          '관절에 무리가 적음',
          '점진적 속도 증가'
        ]
      });
    }
    
    // 기본 유산소 운동
    exercises.push({
      name: '빠른 걷기',
      duration: 25,
      modifications: [
        '평지에서 시작',
        '편안한 신발 착용',
        '대화 가능한 속도 유지'
      ]
    });
    
    if (intensity >= 5 && healthAssessment.riskAssessment.overallRisk !== HealthRiskLevel.HIGH) {
      exercises.push({
        name: '가벼운 조깅',
        duration: 15,
        modifications: [
          '워킹과 조깅 교대',
          '무릎에 무리가 없도록',
          '충격 흡수 신발 착용'
        ]
      });
    }
    
    // 실내 운동 (체육관 이용 가능시)
    if (environmentalFactors.gymAccess) {
      exercises.push({
        name: '고정식 자전거',
        duration: 20,
        modifications: [
          '저항 단계적 증가',
          '상체 자세 유지',
          '페달링 속도 조절'
        ]
      });
      
      exercises.push({
        name: '트레드밀 걷기',
        duration: 20,
        modifications: [
          '경사도 0-3% 유지',
          '안전바 가볍게 잡기',
          '속도 점진적 증가'
        ]
      });
    }
    
    return exercises;
  }
  
  /**
   * 저항 운동 생성
   */
  private static generateResistanceExercises(
    healthAssessment: IHealthAssessment,
    environmentalFactors: any,
    intensity: number
  ) {
    const exercises = [];
    
    // 기본 체중 운동
    exercises.push({
      name: '의자에서 일어서기',
      sets: 2,
      reps: 10,
      restTime: 60,
      modifications: [
        '팔 사용 최소화',
        '천천히 일어서기',
        '무릎이 발끝을 넘지 않게'
      ]
    });
    
    exercises.push({
      name: '벽 팔굽혀펴기',
      sets: 2,
      reps: 8,
      restTime: 60,
      modifications: [
        '벽에서 팔 길이만큼 떨어져서',
        '천천히 움직이기',
        '호흡 조절'
      ]
    });
    
    // 홈 장비 이용
    if (environmentalFactors.homeEquipment.includes('resistance_bands')) {
      exercises.push({
        name: '밴드 팔 운동',
        sets: 2,
        reps: 12,
        restTime: 45,
        modifications: [
          '적절한 장력 선택',
          '관절 끝까지 움직이기',
          '반동 사용하지 않기'
        ]
      });
    }
    
    if (environmentalFactors.homeEquipment.includes('light_weights')) {
      exercises.push({
        name: '가벼운 덤벨 운동',
        sets: 2,
        reps: 10,
        restTime: 60,
        modifications: [
          '1-2kg 무게로 시작',
          '전체 가동범위 사용',
          '양팔 균등하게'
        ]
      });
    }
    
    // 체육관 이용 가능시
    if (environmentalFactors.gymAccess && intensity >= 5) {
      exercises.push({
        name: '머신 레그 프레스',
        sets: 2,
        reps: 12,
        restTime: 90,
        modifications: [
          '가벼운 무게로 시작',
          '전체 가동범위',
          '호흡 패턴 유지'
        ]
      });
    }
    
    return exercises;
  }
  
  /**
   * 유연성 운동 생성
   */
  private static generateFlexibilityExercises(healthAssessment: IHealthAssessment) {
    return [
      {
        name: '목 스트레칭',
        duration: 2,
        modifications: ['천천히 좌우로', '무리하지 않기']
      },
      {
        name: '어깨 돌리기',
        duration: 2,
        modifications: ['앞뒤로 천천히', '큰 원 그리기']
      },
      {
        name: '허리 비틀기',
        duration: 3,
        modifications: ['앉아서 실시', '양쪽 균등하게']
      },
      {
        name: '다리 스트레칭',
        duration: 4,
        modifications: ['각 다리 2분씩', '무릎 보호']
      },
      {
        name: '발목 돌리기',
        duration: 2,
        modifications: ['앉아서 실시', '양발 모두']
      }
    ];
  }
  
  /**
   * 균형 운동 생성
   */
  private static generateBalanceExercises() {
    return [
      {
        name: '한 발로 서기',
        duration: 1,
        modifications: ['벽이나 의자 옆에서', '30초씩 양발']
      },
      {
        name: '발뒤꿈치-발가락 걷기',
        duration: 2,
        modifications: ['직선으로 천천히', '팔로 균형 잡기']
      },
      {
        name: '의자에서 일어나 앉기',
        duration: 2,
        modifications: ['팔 사용하지 않고', '천천히 반복']
      }
    ];
  }
  
  // 나머지 메서드들... (길이 관계상 핵심 기능만 구현)
  
  private static getAerobicPrecautions(healthAssessment: IHealthAssessment, riskAnalysis: any): string[] {
    const precautions = ['운동 전 5분 워밍업', '운동 후 5분 쿨다운', '충분한 수분 섭취'];
    
    if (riskAnalysis.cardiovascularRisk > 50) {
      precautions.push('심박수 지속적 모니터링', '흉통 발생시 즉시 중단');
    }
    
    return precautions;
  }
  
  private static getAerobicContraindications(healthAssessment: IHealthAssessment): string[] {
    const contraindications = [];
    
    if (healthAssessment.riskAssessment.overallRisk === HealthRiskLevel.CRITICAL) {
      contraindications.push('의료진 승인 없이 운동 금지');
    }
    
    return contraindications;
  }
  
  private static generateAerobicProgression(baseParams: any) {
    return [
      { week: 1, adjustments: '기본 강도로 적응' },
      { week: 4, adjustments: '운동 시간 5분 증가' },
      { week: 8, adjustments: '강도 1단계 증가' },
      { week: 12, adjustments: '목표 수준 도달' }
    ];
  }
  
  private static getResistancePrecautions(healthAssessment: IHealthAssessment, riskAnalysis: any): string[] {
    return [
      '발살바 호흡법 피하기',
      '점진적 부하 증가',
      '관절 가동범위 내에서 실시'
    ];
  }
  
  private static getResistanceContraindications(healthAssessment: IHealthAssessment): string[] {
    return [
      '급성 관절염',
      '조절되지 않는 고혈압',
      '최근 수술 부위'
    ];
  }
  
  private static generateResistanceProgression(baseParams: any) {
    return [
      { week: 1, adjustments: '동작 익히기' },
      { week: 3, adjustments: '반복 횟수 2회 증가' },
      { week: 6, adjustments: '세트 수 1세트 증가' },
      { week: 9, adjustments: '저항 강도 증가' }
    ];
  }
  
  private static generateSafetyGuidelines(healthAssessment: IHealthAssessment, riskAnalysis: any) {
    return {
      preExerciseChecklist: [
        '혈압 측정 (고혈압 환자)',
        '혈당 측정 (당뇨 환자)',
        '약물 복용 시간 확인',
        '컨디션 자가 평가',
        '응급약물 휴대 확인'
      ],
      duringExerciseMonitoring: [
        '목표 심박수 유지',
        '주관적 운동강도 모니터링 (RPE 6-7)',
        '호흡 패턴 유지',
        '수분 섭취',
        '이상 증상 즉시 인지'
      ],
      postExerciseActions: [
        '5-10분 쿨다운',
        '생체신호 기록',
        '운동 일지 작성',
        '이상 증상 기록',
        '다음 운동 계획 검토'
      ],
      warningSignsToStop: [
        '흉통 또는 가슴 압박감',
        '심한 호흡곤란',
        '어지럼증 또는 메스꺼움',
        '비정상적인 피로감',
        '관절 또는 근육 통증',
        '창백함 또는 청색증'
      ],
      emergencyProtocol: [
        '즉시 운동 중단',
        '안전한 자세로 앉거나 눕기',
        '응급연락처로 연락',
        '필요시 119 신고',
        '응급약물 복용 (처방받은 경우)'
      ]
    };
  }
  
  private static createProgressionPlan(healthAssessment: IHealthAssessment, recommendations: IExerciseRecommendation[]) {
    return [
      {
        phase: 1,
        duration: '1-4주',
        objectives: ['운동 적응', '기본 동작 습득', '안전성 확보'],
        exerciseModifications: ['낮은 강도', '짧은 시간', '기본 동작'],
        assessmentSchedule: '2주마다 평가'
      },
      {
        phase: 2,
        duration: '5-8주',
        objectives: ['체력 향상', '운동량 증가', '기술 개선'],
        exerciseModifications: ['강도 점진적 증가', '시간 연장', '다양한 운동'],
        assessmentSchedule: '월 1회 평가'
      },
      {
        phase: 3,
        duration: '9-12주',
        objectives: ['목표 달성', '유지 능력', '독립적 운동'],
        exerciseModifications: ['목표 강도 도달', '완전한 프로그램', '자가 관리'],
        assessmentSchedule: '월 1회 평가'
      }
    ];
  }
  
  private static determineMedicalSupervision(healthAssessment: IHealthAssessment, riskAnalysis: any) {
    const highRiskConditions = [
      ChronicCondition.HEART_DISEASE,
      ChronicCondition.DIABETES_TYPE1,
      ChronicCondition.KIDNEY_DISEASE
    ];
    
    const hasHighRiskCondition = healthAssessment.chronicConditions.some(c => 
      highRiskConditions.includes(c.condition)
    );
    
    return {
      required: riskAnalysis.overallRisk === HealthRiskLevel.HIGH || 
               riskAnalysis.overallRisk === HealthRiskLevel.VERY_HIGH ||
               riskAnalysis.overallRisk === HealthRiskLevel.CRITICAL ||
               hasHighRiskCondition,
      frequency: riskAnalysis.overallRisk === HealthRiskLevel.CRITICAL ? '매 운동시' :
                riskAnalysis.overallRisk === HealthRiskLevel.VERY_HIGH ? '주 2회' :
                riskAnalysis.overallRisk === HealthRiskLevel.HIGH ? '주 1회' : '월 1회',
      specialistReferral: hasHighRiskCondition,
      clearanceNeeded: healthAssessment.riskAssessment.clearanceRequired
    };
  }
  
  private static identifyContraindications(healthAssessment: IHealthAssessment) {
    const absolute = [];
    const relative = [];
    
    // 절대 금기사항
    if (healthAssessment.riskAssessment.overallRisk === HealthRiskLevel.CRITICAL) {
      absolute.push('의료진 승인 없이 운동 금지');
    }
    
    // 상대 금기사항
    if (healthAssessment.chronicConditions.some(c => c.condition === ChronicCondition.HYPERTENSION)) {
      relative.push('혈압 180/110 이상시 운동 연기');
    }
    
    return { absolute, relative };
  }
  
  /**
   * 건강 상태 기반 운동 가능 여부 확인
   */
  static async checkExerciseClearance(
    healthAssessmentId: mongoose.Types.ObjectId
  ): Promise<{ cleared: boolean; reason?: string; recommendations: string[] }> {
    try {
      const assessment = await HealthAssessment.findById(healthAssessmentId);
      if (!assessment) {
        throw new Error('건강 평가를 찾을 수 없습니다.');
      }
      
      const latestVitals = (assessment as any).getLatestVitalSigns();
      const recommendations = [];
      
      // 혈압 체크
      if (latestVitals && (latestVitals.systolicBP >= 180 || latestVitals.diastolicBP >= 110)) {
        return {
          cleared: false,
          reason: '혈압이 너무 높습니다 (≥180/110mmHg)',
          recommendations: ['혈압 조절 후 재평가', '의료진 상담']
        };
      }
      
      // 혈당 체크 (당뇨 환자)
      const diabeticCondition = assessment.chronicConditions.find(c => 
        c.condition === ChronicCondition.DIABETES_TYPE1 || c.condition === ChronicCondition.DIABETES_TYPE2
      );
      
      if (diabeticCondition && latestVitals?.bloodGlucose) {
        if (latestVitals.bloodGlucose > 300) {
          return {
            cleared: false,
            reason: '혈당이 너무 높습니다 (>300mg/dL)',
            recommendations: ['혈당 조절 후 재평가', '인슐린 조절 상담']
          };
        } else if (latestVitals.bloodGlucose < 100) {
          return {
            cleared: false,
            reason: '혈당이 너무 낮습니다 (<100mg/dL)',
            recommendations: ['간식 섭취 후 재측정', '저혈당 회복 후 운동']
          };
        }
      }
      
      // 위험도별 권장사항
      if (assessment.riskAssessment.overallRisk === HealthRiskLevel.HIGH) {
        recommendations.push('의료진 감독 하에 운동', '목표 심박수 엄격히 준수');
      }
      
      return {
        cleared: true,
        recommendations
      };
      
    } catch (error) {
      console.error('운동 허가 확인 오류:', error);
      throw new Error('운동 허가 확인에 실패했습니다.');
    }
  }
  
  /**
   * 사용자별 건강 평가 목록 조회
   */
  static async getUserHealthAssessments(userId: mongoose.Types.ObjectId): Promise<IHealthAssessment[]> {
    try {
      return await HealthAssessment.find({ userId, isActive: true })
        .sort({ assessmentDate: -1 })
        .populate('assessedBy', 'name email')
        .populate('reviewedBy', 'name email');
    } catch (error) {
      console.error('건강 평가 조회 오류:', error);
      throw new Error('건강 평가 조회에 실패했습니다.');
    }
  }
  
  /**
   * 고위험군 환자 목록 조회
   */
  static async getHighRiskPatients(): Promise<IHealthAssessment[]> {
    try {
      return await (HealthAssessment as any).getHighRiskPatients();
    } catch (error) {
      console.error('고위험군 조회 오류:', error);
      throw new Error('고위험군 조회에 실패했습니다.');
    }
  }
  
  /**
   * 의료진 승인 대기 목록 조회
   */
  static async getPendingClearances(): Promise<IHealthAssessment[]> {
    try {
      return await (HealthAssessment as any).getPendingClearances();
    } catch (error) {
      console.error('승인 대기 목록 조회 오류:', error);
      throw new Error('승인 대기 목록 조회에 실패했습니다.');
    }
  }
}

export default MedicalExercisePrescriptionService;
