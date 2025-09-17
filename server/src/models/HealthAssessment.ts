/**
 * 🏥 JJ Swim Lab - 건강 상태 평가 모델
 * 
 * 📋 **모델 목적**
 * - 회원의 건강 상태 종합 평가 및 관리
 * - 만성 질환 및 의학적 상태 기반 운동 추천
 * - 의료진 승인 시스템 및 안전 관리
 * - ACSM 가이드라인 기반 과학적 운동 처방
 * 
 * 🔄 **주요 기능**
 * - 14가지 주요 만성 질환 관리 (고혈압, 당뇨, 심장병 등)
 * - 생체 신호 실시간 모니터링 (혈압, 혈당, 심박수)
 * - 위험도 6단계 자동 계산 및 분류
 * - 질환별 맞춤형 운동 처방 생성
 * - 의료진 승인 및 검토 시스템
 * - 응급상황 대응 프로토콜
 * 
 * 🗄️ **데이터 연동**
 * - User 모델과 연동 (회원 정보)
 * - 의료진 승인 시스템 연동
 * - AI 운동 처방 시스템 연동
 * - 실시간 모니터링 시스템 연동
 * - MongoDB Atlas (클라우드 데이터베이스)
 * 
 * 🛠️ **의학적 근거**
 * - ACSM (American College of Sports Medicine) 가이드라인
 * - Karvonen 공식 (목표 심박수 계산)
 * - 질환별 운동 처방 표준 프로토콜
 * - 의료진 검토 및 승인 시스템
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 의료법 및 개인정보보호법 엄격 준수
 * 2. 의학적 근거 기반 알고리즘 구현
 * 3. 응급상황 대응 체계 구축
 * 4. 의료진 승인 시스템 필수 구현
 * 5. 환자 안전을 최우선으로 고려
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 의학적 근거 및 가이드라인 준수 확인
 * - [ ] 위험도 계산 알고리즘 검증
 * - [ ] 의료진 승인 프로세스 확인
 * - [ ] 응급상황 대응 체계 점검
 * - [ ] 개인정보 보호 설정 검토
 * 
 * 📅 **개발 히스토리**
 * - 2025-01-13: 건강 상태 평가 모델 구현
 * - 2025-01-13: 만성 질환별 위험도 계산 알고리즘 구현
 * - 2025-01-13: 의료진 승인 시스템 구현
 * - 2025-01-13: ACSM 기반 운동 처방 시스템 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2025-01-13
 * - 상태: ✅ 완성 (의학적 건강 평가 시스템)
 */

import mongoose, { Document, Schema } from 'mongoose';

// 건강 위험도 등급
export enum HealthRiskLevel {
  VERY_LOW = 'very_low',      // 매우 낮음
  LOW = 'low',                // 낮음
  MODERATE = 'moderate',      // 보통
  HIGH = 'high',              // 높음
  VERY_HIGH = 'very_high',    // 매우 높음
  CRITICAL = 'critical'       // 위험 (의료진 승인 필수)
}

// 만성 질환 타입
export enum ChronicCondition {
  HYPERTENSION = 'hypertension',           // 고혈압
  DIABETES_TYPE1 = 'diabetes_type1',       // 1형 당뇨병
  DIABETES_TYPE2 = 'diabetes_type2',       // 2형 당뇨병
  HEART_DISEASE = 'heart_disease',         // 심장질환
  ARRHYTHMIA = 'arrhythmia',              // 부정맥
  ASTHMA = 'asthma',                      // 천식
  COPD = 'copd',                          // 만성폐쇄성폐질환
  ARTHRITIS = 'arthritis',                // 관절염
  OSTEOPOROSIS = 'osteoporosis',          // 골다공증
  KIDNEY_DISEASE = 'kidney_disease',       // 신장질환
  THYROID_DISORDER = 'thyroid_disorder',   // 갑상선 질환
  EPILEPSY = 'epilepsy',                  // 간질
  DEPRESSION = 'depression',              // 우울증
  ANXIETY = 'anxiety'                     // 불안장애
}

// 운동 제한사항
export enum ExerciseRestriction {
  NO_HIGH_INTENSITY = 'no_high_intensity',           // 고강도 운동 금지
  LIMITED_DURATION = 'limited_duration',             // 운동 시간 제한
  AVOID_BREATH_HOLDING = 'avoid_breath_holding',     // 호흡 정지 금지
  NO_SUDDEN_MOVEMENTS = 'no_sudden_movements',       // 급작스런 동작 금지
  TEMPERATURE_SENSITIVE = 'temperature_sensitive',   // 온도 민감
  MEDICATION_TIMING = 'medication_timing',           // 약물 복용 시간 고려
  BLOOD_PRESSURE_MONITORING = 'bp_monitoring',       // 혈압 모니터링 필수
  BLOOD_SUGAR_MONITORING = 'bs_monitoring',          // 혈당 모니터링 필수
  HEART_RATE_MONITORING = 'hr_monitoring',           // 심박수 모니터링 필수
  SUPERVISED_ONLY = 'supervised_only'                // 감독하에만 운동
}

// 운동 추천 타입
export enum ExerciseRecommendationType {
  AEROBIC_LOW = 'aerobic_low',             // 저강도 유산소
  AEROBIC_MODERATE = 'aerobic_moderate',   // 중강도 유산소
  RESISTANCE_LIGHT = 'resistance_light',   // 가벼운 저항운동
  FLEXIBILITY = 'flexibility',             // 유연성 운동
  BALANCE = 'balance',                     // 균형 운동
  BREATHING = 'breathing',                 // 호흡 운동
  REHABILITATION = 'rehabilitation',        // 재활 운동
  THERAPEUTIC = 'therapeutic'              // 치료적 운동
}

// 생체 신호 정보
export interface IVitalSigns {
  date: Date;
  systolicBP: number;    // 수축기 혈압
  diastolicBP: number;   // 이완기 혈압
  restingHR: number;     // 안정시 심박수
  bloodGlucose?: number; // 혈당 (mg/dL)
  weight: number;        // 체중
  bodyFat?: number;      // 체지방률
  temperature?: number;  // 체온
  oxygenSaturation?: number; // 산소포화도
  notes: string;         // 특이사항
}

// 약물 정보
export interface IMedication {
  name: string;          // 약물명
  dosage: string;        // 용량
  frequency: string;     // 복용 빈도
  timing: string[];      // 복용 시간
  sideEffects: string[]; // 부작용
  exerciseImpact: string; // 운동에 미치는 영향
  precautions: string[]; // 주의사항
}

// 의료 이력
export interface IMedicalHistory {
  condition: string;     // 질환/수술명
  date: Date;           // 발생/수술 날짜
  severity: 'mild' | 'moderate' | 'severe'; // 심각도
  treatment: string;    // 치료 방법
  currentStatus: 'resolved' | 'ongoing' | 'monitoring'; // 현재 상태
  restrictions: string[]; // 관련 제한사항
}

// 운동 추천 결과
export interface IExerciseRecommendation {
  type: ExerciseRecommendationType;
  intensity: number;     // 1-10 (1=매우 가벼움, 10=최대강도)
  duration: number;      // 분
  frequency: number;     // 주당 횟수
  targetHR: {           // 목표 심박수
    min: number;
    max: number;
  };
  specificExercises: {
    name: string;
    sets?: number;
    reps?: number;
    duration?: number;   // 분
    restTime?: number;   // 초
    modifications: string[]; // 수정사항
  }[];
  precautions: string[]; // 주의사항
  contraindications: string[]; // 금기사항
  progressionPlan: {
    week: number;
    adjustments: string;
  }[];
}

// 건강 상태 평가 인터페이스
export interface IHealthAssessment extends Document {
  userId: mongoose.Types.ObjectId;
  assessmentDate: Date;
  
  // 기본 건강 정보
  basicHealth: {
    age: number;
    gender: 'male' | 'female' | 'other';
    height: number; // cm
    weight: number; // kg
    bmi: number;
    smokingStatus: 'never' | 'former' | 'current';
    alcoholConsumption: 'none' | 'light' | 'moderate' | 'heavy';
    sleepHours: number;
    stressLevel: number; // 1-10
    activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
  };
  
  // 생체 신호 기록
  vitalSigns: IVitalSigns[];
  
  // 만성 질환
  chronicConditions: {
    condition: ChronicCondition;
    diagnosedDate: Date;
    severity: 'mild' | 'moderate' | 'severe';
    controlled: boolean; // 조절 상태
    lastCheckup: Date;
    doctorNotes: string;
    medications: IMedication[];
  }[];
  
  // 의료 이력
  medicalHistory: IMedicalHistory[];
  
  // 현재 증상
  currentSymptoms: {
    symptom: string;
    severity: number; // 1-10
    frequency: 'rarely' | 'sometimes' | 'often' | 'always';
    triggers: string[];
    duration: string; // 지속 기간
  }[];
  
  // 신체적 제한사항
  physicalLimitations: {
    bodyPart: string; // 신체 부위
    limitation: string; // 제한사항
    severity: 'mild' | 'moderate' | 'severe';
    cause: string; // 원인
    recommendations: string[];
  }[];
  
  // 운동 제한사항
  exerciseRestrictions: ExerciseRestriction[];
  
  // 응급 연락처
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
  
  // 담당 의료진
  medicalTeam: {
    doctorName: string;
    specialty: string;
    hospital: string;
    phone: string;
    email?: string;
    lastConsultation: Date;
    nextAppointment?: Date;
  }[];
  
  // 위험도 평가
  riskAssessment: {
    overallRisk: HealthRiskLevel;
    cardiovascularRisk: number; // 0-100
    metabolicRisk: number; // 0-100
    musculoskeletalRisk: number; // 0-100
    respiratoryRisk: number; // 0-100
    riskFactors: {
      factor: string;
      severity: number; // 1-10
      modifiable: boolean; // 수정 가능한지
    }[];
    clearanceRequired: boolean; // 의료진 승인 필요
    clearanceObtained: boolean; // 승인 받았는지
    clearanceDate?: Date;
    clearanceDoctor?: string;
  };
  
  // 운동 추천
  exerciseRecommendations: IExerciseRecommendation[];
  
  // 모니터링 계획
  monitoringPlan: {
    vitalSignsFrequency: 'daily' | 'weekly' | 'monthly'; // 생체신호 측정 빈도
    medicalCheckupFrequency: 'monthly' | 'quarterly' | 'biannually' | 'annually';
    parametersToMonitor: string[]; // 모니터링할 지표들
    alertThresholds: {
      parameter: string;
      minValue?: number;
      maxValue?: number;
      action: string; // 임계값 초과시 행동
    }[];
    reviewDate: Date; // 다음 검토일
  };
  
  // 메타데이터
  assessedBy: mongoose.Types.ObjectId; // 평가자 (의료진/트레이너)
  reviewedBy?: mongoose.Types.ObjectId; // 검토자 (의료진)
  approvedBy?: mongoose.Types.ObjectId; // 승인자 (의료진)
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  version: number;
}

// 생체 신호 스키마
const vitalSignsSchema = new Schema<IVitalSigns>({
  date: { type: Date, required: true },
  systolicBP: { type: Number, required: true, min: 70, max: 250 },
  diastolicBP: { type: Number, required: true, min: 40, max: 150 },
  restingHR: { type: Number, required: true, min: 30, max: 200 },
  bloodGlucose: { type: Number, min: 50, max: 500 },
  weight: { type: Number, required: true, min: 20, max: 300 },
  bodyFat: { type: Number, min: 3, max: 50 },
  temperature: { type: Number, min: 35, max: 42 },
  oxygenSaturation: { type: Number, min: 70, max: 100 },
  notes: { type: String, default: '' }
});

// 약물 정보 스키마
const medicationSchema = new Schema<IMedication>({
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  timing: [{ type: String }],
  sideEffects: [{ type: String }],
  exerciseImpact: { type: String, required: true },
  precautions: [{ type: String }]
});

// 의료 이력 스키마
const medicalHistorySchema = new Schema<IMedicalHistory>({
  condition: { type: String, required: true },
  date: { type: Date, required: true },
  severity: { 
    type: String, 
    enum: ['mild', 'moderate', 'severe'], 
    required: true 
  },
  treatment: { type: String, required: true },
  currentStatus: { 
    type: String, 
    enum: ['resolved', 'ongoing', 'monitoring'], 
    required: true 
  },
  restrictions: [{ type: String }]
});

// 메인 건강 평가 스키마
const healthAssessmentSchema = new Schema<IHealthAssessment>({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  assessmentDate: { type: Date, default: Date.now },
  
  basicHealth: {
    age: { type: Number, required: true, min: 5, max: 120 },
    gender: { 
      type: String, 
      enum: ['male', 'female', 'other'], 
      required: true 
    },
    height: { type: Number, required: true, min: 100, max: 250 },
    weight: { type: Number, required: true, min: 20, max: 300 },
    bmi: { type: Number, required: true, min: 10, max: 60 },
    smokingStatus: { 
      type: String, 
      enum: ['never', 'former', 'current'], 
      required: true 
    },
    alcoholConsumption: { 
      type: String, 
      enum: ['none', 'light', 'moderate', 'heavy'], 
      required: true 
    },
    sleepHours: { type: Number, required: true, min: 3, max: 12 },
    stressLevel: { type: Number, required: true, min: 1, max: 10 },
    activityLevel: { 
      type: String, 
      enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active'], 
      required: true 
    }
  },
  
  vitalSigns: [vitalSignsSchema],
  
  chronicConditions: [{
    condition: { 
      type: String, 
      enum: Object.values(ChronicCondition), 
      required: true 
    },
    diagnosedDate: { type: Date, required: true },
    severity: { 
      type: String, 
      enum: ['mild', 'moderate', 'severe'], 
      required: true 
    },
    controlled: { type: Boolean, required: true },
    lastCheckup: { type: Date, required: true },
    doctorNotes: { type: String, default: '' },
    medications: [medicationSchema]
  }],
  
  medicalHistory: [medicalHistorySchema],
  
  currentSymptoms: [{
    symptom: { type: String, required: true },
    severity: { type: Number, required: true, min: 1, max: 10 },
    frequency: { 
      type: String, 
      enum: ['rarely', 'sometimes', 'often', 'always'], 
      required: true 
    },
    triggers: [{ type: String }],
    duration: { type: String, required: true }
  }],
  
  physicalLimitations: [{
    bodyPart: { type: String, required: true },
    limitation: { type: String, required: true },
    severity: { 
      type: String, 
      enum: ['mild', 'moderate', 'severe'], 
      required: true 
    },
    cause: { type: String, required: true },
    recommendations: [{ type: String }]
  }],
  
  exerciseRestrictions: [{ 
    type: String, 
    enum: Object.values(ExerciseRestriction) 
  }],
  
  emergencyContact: {
    name: { type: String, required: true },
    relationship: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String }
  },
  
  medicalTeam: [{
    doctorName: { type: String, required: true },
    specialty: { type: String, required: true },
    hospital: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    lastConsultation: { type: Date, required: true },
    nextAppointment: { type: Date }
  }],
  
  riskAssessment: {
    overallRisk: { 
      type: String, 
      enum: Object.values(HealthRiskLevel), 
      required: true 
    },
    cardiovascularRisk: { type: Number, required: true, min: 0, max: 100 },
    metabolicRisk: { type: Number, required: true, min: 0, max: 100 },
    musculoskeletalRisk: { type: Number, required: true, min: 0, max: 100 },
    respiratoryRisk: { type: Number, required: true, min: 0, max: 100 },
    riskFactors: [{
      factor: { type: String, required: true },
      severity: { type: Number, required: true, min: 1, max: 10 },
      modifiable: { type: Boolean, required: true }
    }],
    clearanceRequired: { type: Boolean, default: false },
    clearanceObtained: { type: Boolean, default: false },
    clearanceDate: { type: Date },
    clearanceDoctor: { type: String }
  },
  
  exerciseRecommendations: [{
    type: { 
      type: String, 
      enum: Object.values(ExerciseRecommendationType), 
      required: true 
    },
    intensity: { type: Number, required: true, min: 1, max: 10 },
    duration: { type: Number, required: true, min: 5, max: 120 },
    frequency: { type: Number, required: true, min: 1, max: 7 },
    targetHR: {
      min: { type: Number, required: true, min: 50, max: 220 },
      max: { type: Number, required: true, min: 50, max: 220 }
    },
    specificExercises: [{
      name: { type: String, required: true },
      sets: { type: Number, min: 1, max: 10 },
      reps: { type: Number, min: 1, max: 100 },
      duration: { type: Number, min: 1, max: 60 },
      restTime: { type: Number, min: 10, max: 300 },
      modifications: [{ type: String }]
    }],
    precautions: [{ type: String }],
    contraindications: [{ type: String }],
    progressionPlan: [{
      week: { type: Number, required: true, min: 1, max: 52 },
      adjustments: { type: String, required: true }
    }]
  }],
  
  monitoringPlan: {
    vitalSignsFrequency: { 
      type: String, 
      enum: ['daily', 'weekly', 'monthly'], 
      required: true 
    },
    medicalCheckupFrequency: { 
      type: String, 
      enum: ['monthly', 'quarterly', 'biannually', 'annually'], 
      required: true 
    },
    parametersToMonitor: [{ type: String }],
    alertThresholds: [{
      parameter: { type: String, required: true },
      minValue: { type: Number },
      maxValue: { type: Number },
      action: { type: String, required: true }
    }],
    reviewDate: { type: Date, required: true }
  },
  
  assessedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  reviewedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  approvedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  version: { type: Number, default: 1 }
});

// 인덱스 설정
healthAssessmentSchema.index({ userId: 1, assessmentDate: -1 });
healthAssessmentSchema.index({ 'riskAssessment.overallRisk': 1 });
healthAssessmentSchema.index({ 'riskAssessment.clearanceRequired': 1 });
healthAssessmentSchema.index({ 'monitoringPlan.reviewDate': 1 });
healthAssessmentSchema.index({ isActive: 1 });

// 미들웨어: 업데이트 시 updatedAt 자동 갱신
healthAssessmentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // BMI 자동 계산
  if (this.basicHealth.height && this.basicHealth.weight) {
    const heightInMeters = this.basicHealth.height / 100;
    this.basicHealth.bmi = Number((this.basicHealth.weight / (heightInMeters * heightInMeters)).toFixed(1));
  }
  
  next();
});

// 정적 메서드: 고위험군 조회
healthAssessmentSchema.statics.getHighRiskPatients = async function() {
  return await this.find({
    isActive: true,
    'riskAssessment.overallRisk': { $in: [HealthRiskLevel.HIGH, HealthRiskLevel.VERY_HIGH, HealthRiskLevel.CRITICAL] }
  })
  .populate('userId', 'name email phone')
  .sort({ 'riskAssessment.cardiovascularRisk': -1 });
};

// 정적 메서드: 의료진 승인 필요한 케이스 조회
healthAssessmentSchema.statics.getPendingClearances = async function() {
  return await this.find({
    isActive: true,
    'riskAssessment.clearanceRequired': true,
    'riskAssessment.clearanceObtained': false
  })
  .populate('userId', 'name email phone')
  .populate('assessedBy', 'name email')
  .sort({ assessmentDate: -1 });
};

// 정적 메서드: 건강 통계
healthAssessmentSchema.statics.getHealthStatistics = async function() {
  return await this.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$riskAssessment.overallRisk',
        count: { $sum: 1 },
        avgAge: { $avg: '$basicHealth.age' },
        avgBMI: { $avg: '$basicHealth.bmi' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

// 인스턴스 메서드: 위험도 재계산
healthAssessmentSchema.methods.recalculateRisk = function(): HealthRiskLevel {
  // 복합적 위험도 계산 로직
  const avgRisk = (
    this.riskAssessment.cardiovascularRisk +
    this.riskAssessment.metabolicRisk +
    this.riskAssessment.musculoskeletalRisk +
    this.riskAssessment.respiratoryRisk
  ) / 4;
  
  if (avgRisk >= 80) return HealthRiskLevel.CRITICAL;
  if (avgRisk >= 65) return HealthRiskLevel.VERY_HIGH;
  if (avgRisk >= 50) return HealthRiskLevel.HIGH;
  if (avgRisk >= 35) return HealthRiskLevel.MODERATE;
  if (avgRisk >= 20) return HealthRiskLevel.LOW;
  return HealthRiskLevel.VERY_LOW;
};

// 인스턴스 메서드: 의료진 승인 필요 여부
healthAssessmentSchema.methods.requiresMedicalClearance = function(): boolean {
  return this.riskAssessment.overallRisk === HealthRiskLevel.HIGH ||
         this.riskAssessment.overallRisk === HealthRiskLevel.VERY_HIGH ||
         this.riskAssessment.overallRisk === HealthRiskLevel.CRITICAL ||
         this.chronicConditions.some((c: any) => 
           [ChronicCondition.HEART_DISEASE, ChronicCondition.DIABETES_TYPE1].includes(c.condition)
         );
};

// 인스턴스 메서드: 최신 생체신호 조회
healthAssessmentSchema.methods.getLatestVitalSigns = function(): IVitalSigns | null {
  if (this.vitalSigns.length === 0) return null;
  return this.vitalSigns.sort((a: any, b: any) => b.date.getTime() - a.date.getTime())[0];
};

export const HealthAssessment = mongoose.model<IHealthAssessment>('HealthAssessment', healthAssessmentSchema);
export default HealthAssessment;
