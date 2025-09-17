/**
 * 부상 위험 예측 모델
 * AI 기반 운동 패턴 분석 및 부상 위험도 계산
 */

import mongoose, { Document, Schema } from 'mongoose';

// 부상 위험 등급
export enum InjuryRiskLevel {
  VERY_LOW = 'very_low',      // 1-20%
  LOW = 'low',                // 21-40%
  MODERATE = 'moderate',      // 41-60%
  HIGH = 'high',              // 61-80%
  VERY_HIGH = 'very_high'     // 81-100%
}

// 부상 유형
export enum InjuryType {
  SHOULDER = 'shoulder',           // 어깨 부상
  NECK = 'neck',                   // 목 부상
  BACK = 'back',                   // 허리 부상
  KNEE = 'knee',                   // 무릎 부상
  ANKLE = 'ankle',                 // 발목 부상
  WRIST = 'wrist',                 // 손목 부상
  MUSCLE_STRAIN = 'muscle_strain', // 근육 긴장
  JOINT_PAIN = 'joint_pain',       // 관절 통증
  OVERUSE = 'overuse',             // 과사용 증후군
  FATIGUE = 'fatigue'              // 피로 누적
}

// 위험 요인 카테고리
export enum RiskFactorCategory {
  TRAINING_LOAD = 'training_load',         // 훈련 부하
  TECHNIQUE = 'technique',                 // 기술적 요인
  PHYSICAL = 'physical',                   // 신체적 요인
  ENVIRONMENTAL = 'environmental',         // 환경적 요인
  PSYCHOLOGICAL = 'psychological',         // 심리적 요인
  RECOVERY = 'recovery',                   // 회복 요인
  BIOMECHANICAL = 'biomechanical'          // 생체역학적 요인
}

// 위험 요인 인터페이스
export interface IRiskFactor {
  category: RiskFactorCategory;
  factor: string;
  severity: number; // 1-10
  confidence: number; // 0-100%
  description: string;
  recommendations: string[];
}

// 훈련 부하 데이터
export interface ITrainingLoad {
  date: Date;
  duration: number; // 분
  intensity: number; // 1-10
  volume: number; // 총 거리(미터) 또는 세트 수
  perceivedExertion: number; // 1-10 (RPE)
  heartRateAvg?: number;
  heartRateMax?: number;
  strokeCount?: number;
  restTime?: number; // 초
}

// 생체역학 데이터
export interface IBiomechanicalData {
  date: Date;
  strokeEfficiency: number; // 1-10
  bodyPosition: number; // 1-10
  breathingPattern: number; // 1-10
  strokeRate: number; // strokes per minute
  strokeLength: number; // meters per stroke
  symmetry: number; // 1-10 (좌우 대칭성)
  flexibility: number; // 1-10
  strength: number; // 1-10
}

// 회복 데이터
export interface IRecoveryData {
  date: Date;
  sleepHours: number;
  sleepQuality: number; // 1-10
  stressLevel: number; // 1-10
  fatigue: number; // 1-10
  soreness: number; // 1-10
  nutrition: number; // 1-10
  hydration: number; // 1-10
  restDaysTaken: number;
}

// 부상 이력
export interface IInjuryHistory {
  date: Date;
  injuryType: InjuryType;
  severity: number; // 1-10
  recoveryDays: number;
  cause: string;
  treatment: string;
  preventionMeasures: string[];
  recurrence: boolean;
}

// AI 예측 결과
export interface IPredictionResult {
  overallRisk: number; // 0-100%
  riskLevel: InjuryRiskLevel;
  confidenceScore: number; // 0-100%
  primaryRiskFactors: IRiskFactor[];
  injuryTypePredictions: {
    injuryType: InjuryType;
    probability: number; // 0-100%
    timeframe: string; // '1-2 weeks', '2-4 weeks', etc.
  }[];
  recommendations: {
    immediate: string[]; // 즉시 조치사항
    shortTerm: string[]; // 단기 권장사항
    longTerm: string[]; // 장기 예방책
  };
  monitoringPoints: string[]; // 주의 관찰 포인트
}

// 부상 위험 예측 인터페이스
export interface IInjuryPrediction extends Document {
  userId: mongoose.Types.ObjectId;
  assessmentDate: Date;
  
  // 기본 사용자 정보
  userProfile: {
    age: number;
    weight: number;
    height: number;
    experience: number; // 개월
    currentLevel: string;
    medicalHistory: string[];
    previousInjuries: IInjuryHistory[];
  };
  
  // 훈련 부하 분석
  trainingLoadAnalysis: {
    recentLoads: ITrainingLoad[];
    averageWeeklyLoad: number;
    loadTrend: 'increasing' | 'stable' | 'decreasing';
    acuteChronicRatio: number; // 급성:만성 부하 비율
    loadSpikes: {
      date: Date;
      magnitude: number; // 평소 대비 증가율
      type: 'duration' | 'intensity' | 'volume';
    }[];
  };
  
  // 생체역학 분석
  biomechanicalAnalysis: {
    recentData: IBiomechanicalData[];
    techniqueScore: number; // 1-100
    asymmetryIssues: string[];
    movementPatterns: {
      pattern: string;
      quality: number; // 1-10
      riskLevel: number; // 1-10
    }[];
  };
  
  // 회복 분석
  recoveryAnalysis: {
    recentData: IRecoveryData[];
    recoveryScore: number; // 1-100
    sleepDebt: number; // 시간
    stressAccumulation: number; // 1-100
    fatigueLevel: number; // 1-100
  };
  
  // 환경적 요인
  environmentalFactors: {
    poolConditions: {
      temperature: number;
      chlorineLevel: number;
      crowdedness: number; // 1-10
    };
    equipmentCondition: number; // 1-10
    coachingQuality: number; // 1-10
    trainingEnvironment: number; // 1-10
  };
  
  // AI 예측 결과
  prediction: IPredictionResult;
  
  // 모니터링 데이터
  monitoring: {
    alertsGenerated: {
      date: Date;
      level: 'info' | 'warning' | 'critical';
      message: string;
      acknowledged: boolean;
    }[];
    followUpRequired: boolean;
    nextAssessmentDate: Date;
    interventionsRecommended: string[];
  };
  
  // 메타데이터
  modelVersion: string;
  dataQuality: number; // 1-100 (입력 데이터 품질)
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

// 훈련 부하 스키마
const trainingLoadSchema = new Schema<ITrainingLoad>({
  date: { type: Date, required: true },
  duration: { type: Number, required: true, min: 1 },
  intensity: { type: Number, required: true, min: 1, max: 10 },
  volume: { type: Number, required: true, min: 0 },
  perceivedExertion: { type: Number, required: true, min: 1, max: 10 },
  heartRateAvg: { type: Number, min: 40, max: 220 },
  heartRateMax: { type: Number, min: 40, max: 220 },
  strokeCount: { type: Number, min: 0 },
  restTime: { type: Number, min: 0 }
});

// 생체역학 데이터 스키마
const biomechanicalDataSchema = new Schema<IBiomechanicalData>({
  date: { type: Date, required: true },
  strokeEfficiency: { type: Number, required: true, min: 1, max: 10 },
  bodyPosition: { type: Number, required: true, min: 1, max: 10 },
  breathingPattern: { type: Number, required: true, min: 1, max: 10 },
  strokeRate: { type: Number, required: true, min: 10, max: 100 },
  strokeLength: { type: Number, required: true, min: 0.5, max: 5 },
  symmetry: { type: Number, required: true, min: 1, max: 10 },
  flexibility: { type: Number, required: true, min: 1, max: 10 },
  strength: { type: Number, required: true, min: 1, max: 10 }
});

// 회복 데이터 스키마
const recoveryDataSchema = new Schema<IRecoveryData>({
  date: { type: Date, required: true },
  sleepHours: { type: Number, required: true, min: 0, max: 24 },
  sleepQuality: { type: Number, required: true, min: 1, max: 10 },
  stressLevel: { type: Number, required: true, min: 1, max: 10 },
  fatigue: { type: Number, required: true, min: 1, max: 10 },
  soreness: { type: Number, required: true, min: 1, max: 10 },
  nutrition: { type: Number, required: true, min: 1, max: 10 },
  hydration: { type: Number, required: true, min: 1, max: 10 },
  restDaysTaken: { type: Number, required: true, min: 0 }
});

// 부상 이력 스키마
const injuryHistorySchema = new Schema<IInjuryHistory>({
  date: { type: Date, required: true },
  injuryType: { 
    type: String, 
    enum: Object.values(InjuryType), 
    required: true 
  },
  severity: { type: Number, required: true, min: 1, max: 10 },
  recoveryDays: { type: Number, required: true, min: 0 },
  cause: { type: String, required: true },
  treatment: { type: String, required: true },
  preventionMeasures: [{ type: String }],
  recurrence: { type: Boolean, default: false }
});

// 위험 요인 스키마
const riskFactorSchema = new Schema<IRiskFactor>({
  category: { 
    type: String, 
    enum: Object.values(RiskFactorCategory), 
    required: true 
  },
  factor: { type: String, required: true },
  severity: { type: Number, required: true, min: 1, max: 10 },
  confidence: { type: Number, required: true, min: 0, max: 100 },
  description: { type: String, required: true },
  recommendations: [{ type: String }]
});

// 메인 부상 예측 스키마
const injuryPredictionSchema = new Schema<IInjuryPrediction>({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  assessmentDate: { type: Date, default: Date.now },
  
  userProfile: {
    age: { type: Number, required: true, min: 5, max: 100 },
    weight: { type: Number, required: true, min: 20, max: 300 },
    height: { type: Number, required: true, min: 100, max: 250 },
    experience: { type: Number, required: true, min: 0 },
    currentLevel: { type: String, required: true },
    medicalHistory: [{ type: String }],
    previousInjuries: [injuryHistorySchema]
  },
  
  trainingLoadAnalysis: {
    recentLoads: [trainingLoadSchema],
    averageWeeklyLoad: { type: Number, required: true, min: 0 },
    loadTrend: { 
      type: String, 
      enum: ['increasing', 'stable', 'decreasing'],
      required: true 
    },
    acuteChronicRatio: { type: Number, required: true, min: 0, max: 5 },
    loadSpikes: [{
      date: { type: Date, required: true },
      magnitude: { type: Number, required: true },
      type: { 
        type: String, 
        enum: ['duration', 'intensity', 'volume'],
        required: true 
      }
    }]
  },
  
  biomechanicalAnalysis: {
    recentData: [biomechanicalDataSchema],
    techniqueScore: { type: Number, required: true, min: 1, max: 100 },
    asymmetryIssues: [{ type: String }],
    movementPatterns: [{
      pattern: { type: String, required: true },
      quality: { type: Number, required: true, min: 1, max: 10 },
      riskLevel: { type: Number, required: true, min: 1, max: 10 }
    }]
  },
  
  recoveryAnalysis: {
    recentData: [recoveryDataSchema],
    recoveryScore: { type: Number, required: true, min: 1, max: 100 },
    sleepDebt: { type: Number, required: true, min: 0 },
    stressAccumulation: { type: Number, required: true, min: 1, max: 100 },
    fatigueLevel: { type: Number, required: true, min: 1, max: 100 }
  },
  
  environmentalFactors: {
    poolConditions: {
      temperature: { type: Number, required: true, min: 15, max: 35 },
      chlorineLevel: { type: Number, required: true, min: 0, max: 10 },
      crowdedness: { type: Number, required: true, min: 1, max: 10 }
    },
    equipmentCondition: { type: Number, required: true, min: 1, max: 10 },
    coachingQuality: { type: Number, required: true, min: 1, max: 10 },
    trainingEnvironment: { type: Number, required: true, min: 1, max: 10 }
  },
  
  prediction: {
    overallRisk: { type: Number, required: true, min: 0, max: 100 },
    riskLevel: { 
      type: String, 
      enum: Object.values(InjuryRiskLevel), 
      required: true 
    },
    confidenceScore: { type: Number, required: true, min: 0, max: 100 },
    primaryRiskFactors: [riskFactorSchema],
    injuryTypePredictions: [{
      injuryType: { 
        type: String, 
        enum: Object.values(InjuryType), 
        required: true 
      },
      probability: { type: Number, required: true, min: 0, max: 100 },
      timeframe: { type: String, required: true }
    }],
    recommendations: {
      immediate: [{ type: String }],
      shortTerm: [{ type: String }],
      longTerm: [{ type: String }]
    },
    monitoringPoints: [{ type: String }]
  },
  
  monitoring: {
    alertsGenerated: [{
      date: { type: Date, default: Date.now },
      level: { 
        type: String, 
        enum: ['info', 'warning', 'critical'],
        required: true 
      },
      message: { type: String, required: true },
      acknowledged: { type: Boolean, default: false }
    }],
    followUpRequired: { type: Boolean, default: false },
    nextAssessmentDate: { type: Date, required: true },
    interventionsRecommended: [{ type: String }]
  },
  
  modelVersion: { type: String, default: '1.0.0' },
  dataQuality: { type: Number, required: true, min: 1, max: 100 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

// 인덱스 설정
injuryPredictionSchema.index({ userId: 1, assessmentDate: -1 });
injuryPredictionSchema.index({ 'prediction.riskLevel': 1 });
injuryPredictionSchema.index({ 'prediction.overallRisk': -1 });
injuryPredictionSchema.index({ 'monitoring.followUpRequired': 1 });
injuryPredictionSchema.index({ isActive: 1 });

// 미들웨어: 업데이트 시 updatedAt 자동 갱신
injuryPredictionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// 정적 메서드: 고위험 사용자 조회
injuryPredictionSchema.statics.getHighRiskUsers = async function() {
  return await this.find({
    isActive: true,
    'prediction.riskLevel': { $in: [InjuryRiskLevel.HIGH, InjuryRiskLevel.VERY_HIGH] }
  })
  .populate('userId', 'name email')
  .sort({ 'prediction.overallRisk': -1 });
};

// 정적 메서드: 부상 통계
injuryPredictionSchema.statics.getInjuryStatistics = async function() {
  return await this.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$prediction.riskLevel',
        count: { $sum: 1 },
        avgRisk: { $avg: '$prediction.overallRisk' }
      }
    },
    { $sort: { avgRisk: -1 } }
  ]);
};

// 인스턴스 메서드: 위험도 업데이트 필요 여부
injuryPredictionSchema.methods.needsUpdate = function(): boolean {
  const daysSinceUpdate = Math.floor(
    (Date.now() - this.updatedAt.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  return daysSinceUpdate >= 7 || // 1주일 경과
         this.monitoring.followUpRequired || // 후속 조치 필요
         this.prediction.riskLevel === InjuryRiskLevel.VERY_HIGH; // 매우 높은 위험
};

// 인스턴스 메서드: 알림 생성
injuryPredictionSchema.methods.generateAlert = function(
  level: 'info' | 'warning' | 'critical',
  message: string
) {
  this.monitoring.alertsGenerated.push({
    date: new Date(),
    level,
    message,
    acknowledged: false
  });
  
  if (level === 'critical') {
    this.monitoring.followUpRequired = true;
  }
};

// 인스턴스 메서드: 권장사항 업데이트
injuryPredictionSchema.methods.updateRecommendations = function(
  immediate: string[],
  shortTerm: string[],
  longTerm: string[]
) {
  this.prediction.recommendations = {
    immediate: immediate || this.prediction.recommendations.immediate,
    shortTerm: shortTerm || this.prediction.recommendations.shortTerm,
    longTerm: longTerm || this.prediction.recommendations.longTerm
  };
};

export const InjuryPrediction = mongoose.model<IInjuryPrediction>('InjuryPrediction', injuryPredictionSchema);
export default InjuryPrediction;
