/**
 * 수영 기록 예측 모델
 * AI 기반 훈련 데이터 분석 및 개인 기록 향상 예측
 */

import mongoose, { Document, Schema } from 'mongoose';

// 수영 종목
export enum SwimmingEvent {
  FREESTYLE_50 = 'freestyle_50',
  FREESTYLE_100 = 'freestyle_100',
  FREESTYLE_200 = 'freestyle_200',
  FREESTYLE_400 = 'freestyle_400',
  FREESTYLE_800 = 'freestyle_800',
  FREESTYLE_1500 = 'freestyle_1500',
  BACKSTROKE_50 = 'backstroke_50',
  BACKSTROKE_100 = 'backstroke_100',
  BACKSTROKE_200 = 'backstroke_200',
  BREASTSTROKE_50 = 'breaststroke_50',
  BREASTSTROKE_100 = 'breaststroke_100',
  BREASTSTROKE_200 = 'breaststroke_200',
  BUTTERFLY_50 = 'butterfly_50',
  BUTTERFLY_100 = 'butterfly_100',
  BUTTERFLY_200 = 'butterfly_200',
  MEDLEY_100 = 'medley_100',
  MEDLEY_200 = 'medley_200',
  MEDLEY_400 = 'medley_400'
}

// 예측 신뢰도 레벨
export enum ConfidenceLevel {
  VERY_LOW = 'very_low',      // 0-20%
  LOW = 'low',                // 21-40%
  MODERATE = 'moderate',      // 41-60%
  HIGH = 'high',              // 61-80%
  VERY_HIGH = 'very_high'     // 81-100%
}

// 성과 요인 카테고리
export enum PerformanceFactorCategory {
  TECHNIQUE = 'technique',           // 기술적 요인
  PHYSICAL = 'physical',             // 신체적 요인
  TRAINING = 'training',             // 훈련 요인
  PSYCHOLOGICAL = 'psychological',   // 심리적 요인
  ENVIRONMENTAL = 'environmental',   // 환경적 요인
  EQUIPMENT = 'equipment',           // 장비 요인
  TACTICAL = 'tactical'              // 전술적 요인
}

// 성과 요인 인터페이스
export interface IPerformanceFactor {
  category: PerformanceFactorCategory;
  factor: string;
  impact: number; // -100 to +100 (음수는 부정적, 양수는 긍정적 영향)
  confidence: number; // 0-100%
  description: string;
  recommendations: string[];
}

// 훈련 성과 데이터
export interface ITrainingPerformance {
  date: Date;
  event: SwimmingEvent;
  time: number; // 초 단위
  distance: number; // 미터
  strokeCount: number;
  strokeRate: number; // strokes per minute
  splitTimes: number[]; // 구간 기록 (초)
  heartRateAvg?: number;
  heartRateMax?: number;
  lactateLevel?: number; // mmol/L
  perceivedExertion: number; // 1-10 RPE
  conditions: {
    poolLength: number; // 25m or 50m
    waterTemp: number;
    weather?: string;
    competition: boolean;
  };
  technique: {
    efficiency: number; // 1-10
    consistency: number; // 1-10
    startTime?: number; // 초
    turnTimes?: number[]; // 초
    finishTime?: number; // 초
  };
}

// 생리학적 지표
export interface IPhysiologicalData {
  date: Date;
  vo2Max?: number; // ml/kg/min
  anaerobicThreshold?: number; // % of VO2 max
  lactateThreshold?: number; // mmol/L
  restingHeartRate: number;
  maxHeartRate: number;
  bodyFatPercentage?: number;
  muscleMass?: number; // kg
  flexibility: {
    shoulderFlexibility: number; // 1-10
    ankleFlexibility: number; // 1-10
    spinalFlexibility: number; // 1-10
  };
  strength: {
    upperBodyStrength: number; // 1-10
    coreStrength: number; // 1-10
    legStrength: number; // 1-10
  };
}

// 예측 결과 인터페이스
export interface IPredictionResult {
  targetEvent: SwimmingEvent;
  currentBestTime: number; // 초
  predictedTime: number; // 초
  improvementSeconds: number; // 개선 예상 시간 (음수면 향상)
  improvementPercentage: number; // 개선 예상 비율
  confidenceLevel: ConfidenceLevel;
  confidenceScore: number; // 0-100%
  
  timeframePredictions: {
    oneMonth: number; // 1개월 후 예상 기록
    threeMonths: number; // 3개월 후 예상 기록
    sixMonths: number; // 6개월 후 예상 기록
    oneYear: number; // 1년 후 예상 기록
  };
  
  performanceFactors: IPerformanceFactor[];
  
  breakdown: {
    startImprovement: number; // 초 (스타트 개선)
    strokeImprovement: number; // 초 (스트로크 개선)
    turnImprovement: number; // 초 (턴 개선)
    finishImprovement: number; // 초 (피니시 개선)
    enduranceImprovement: number; // 초 (지구력 개선)
    techniqueImprovement: number; // 초 (기술 개선)
  };
  
  recommendations: {
    training: string[];
    technique: string[];
    physical: string[];
    tactical: string[];
  };
  
  milestones: {
    targetTime: number; // 초
    estimatedAchievementDate: Date;
    requiredImprovementRate: number; // 주당 개선율
  }[];
}

// 수영 기록 예측 인터페이스
export interface IPerformancePrediction extends Document {
  userId: mongoose.Types.ObjectId;
  predictionDate: Date;
  
  // 기본 정보
  userProfile: {
    age: number;
    weight: number;
    height: number;
    experience: number; // 개월
    currentLevel: string;
    dominantStroke: SwimmingEvent;
    trainingFrequency: number; // 주당 횟수
    competitionExperience: boolean;
  };
  
  // 현재 기록
  currentRecords: {
    event: SwimmingEvent;
    bestTime: number; // 초
    achievedDate: Date;
    conditions: string; // 대회, 연습, 시간측정 등
  }[];
  
  // 훈련 성과 분석
  trainingAnalysis: {
    recentPerformances: ITrainingPerformance[];
    trainingLoad: {
      weeklyVolume: number; // 주간 총 거리
      weeklyIntensity: number; // 평균 강도
      trainingDays: number; // 주간 훈련 일수
    };
    progressTrend: 'improving' | 'stable' | 'declining';
    consistencyScore: number; // 1-100
    peakPerformanceIndicators: {
      bestRecentTime: number;
      averageTime: number;
      timeVariability: number; // 표준편차
    };
  };
  
  // 생리학적 분석
  physiologicalAnalysis: {
    recentData: IPhysiologicalData[];
    fitnessScore: number; // 1-100
    strengthProfile: {
      overall: number; // 1-100
      strengths: string[];
      weaknesses: string[];
    };
    enduranceProfile: {
      aerobicCapacity: number; // 1-100
      anaerobicCapacity: number; // 1-100
      lactateManagement: number; // 1-100
    };
  };
  
  // 기술 분석
  techniqueAnalysis: {
    overallScore: number; // 1-100
    strokeEfficiency: number; // 1-100
    startTechnique: number; // 1-100
    turnTechnique: number; // 1-100
    finishTechnique: number; // 1-100
    breathing: number; // 1-100
    bodyPosition: number; // 1-100
    timing: number; // 1-100
    improvementAreas: string[];
  };
  
  // AI 예측 결과
  predictions: IPredictionResult[];
  
  // 모델 정보
  modelInfo: {
    version: string;
    algorithm: string;
    trainingDataSize: number;
    lastTrainingDate: Date;
    accuracy: number; // 0-100%
  };
  
  // 검증 데이터
  validation: {
    historicalAccuracy: number; // 과거 예측 정확도
    similarSwimmersComparison: {
      count: number;
      averageImprovement: number;
      bestImprovement: number;
    };
    expertValidation?: {
      coachReview: string;
      adjustments: string[];
      approvalStatus: 'pending' | 'approved' | 'rejected';
    };
  };
  
  // 추적 정보
  tracking: {
    actualResults: {
      event: SwimmingEvent;
      predictedTime: number;
      actualTime: number;
      achievedDate: Date;
      accuracy: number; // 예측 정확도
    }[];
    feedbackProvided: boolean;
    nextPredictionDate: Date;
  };
  
  // 메타데이터
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

// 훈련 성과 스키마
const trainingPerformanceSchema = new Schema<ITrainingPerformance>({
  date: { type: Date, required: true },
  event: { 
    type: String, 
    enum: Object.values(SwimmingEvent), 
    required: true 
  },
  time: { type: Number, required: true, min: 0 },
  distance: { type: Number, required: true, min: 25 },
  strokeCount: { type: Number, required: true, min: 1 },
  strokeRate: { type: Number, required: true, min: 10, max: 100 },
  splitTimes: [{ type: Number, min: 0 }],
  heartRateAvg: { type: Number, min: 40, max: 220 },
  heartRateMax: { type: Number, min: 40, max: 220 },
  lactateLevel: { type: Number, min: 0, max: 30 },
  perceivedExertion: { type: Number, required: true, min: 1, max: 10 },
  conditions: {
    poolLength: { type: Number, required: true, enum: [25, 50] },
    waterTemp: { type: Number, required: true, min: 15, max: 35 },
    weather: { type: String },
    competition: { type: Boolean, default: false }
  },
  technique: {
    efficiency: { type: Number, required: true, min: 1, max: 10 },
    consistency: { type: Number, required: true, min: 1, max: 10 },
    startTime: { type: Number, min: 0 },
    turnTimes: [{ type: Number, min: 0 }],
    finishTime: { type: Number, min: 0 }
  }
});

// 생리학적 데이터 스키마
const physiologicalDataSchema = new Schema<IPhysiologicalData>({
  date: { type: Date, required: true },
  vo2Max: { type: Number, min: 20, max: 90 },
  anaerobicThreshold: { type: Number, min: 50, max: 100 },
  lactateThreshold: { type: Number, min: 1, max: 20 },
  restingHeartRate: { type: Number, required: true, min: 30, max: 100 },
  maxHeartRate: { type: Number, required: true, min: 150, max: 220 },
  bodyFatPercentage: { type: Number, min: 3, max: 50 },
  muscleMass: { type: Number, min: 20, max: 100 },
  flexibility: {
    shoulderFlexibility: { type: Number, required: true, min: 1, max: 10 },
    ankleFlexibility: { type: Number, required: true, min: 1, max: 10 },
    spinalFlexibility: { type: Number, required: true, min: 1, max: 10 }
  },
  strength: {
    upperBodyStrength: { type: Number, required: true, min: 1, max: 10 },
    coreStrength: { type: Number, required: true, min: 1, max: 10 },
    legStrength: { type: Number, required: true, min: 1, max: 10 }
  }
});

// 성과 요인 스키마
const performanceFactorSchema = new Schema<IPerformanceFactor>({
  category: { 
    type: String, 
    enum: Object.values(PerformanceFactorCategory), 
    required: true 
  },
  factor: { type: String, required: true },
  impact: { type: Number, required: true, min: -100, max: 100 },
  confidence: { type: Number, required: true, min: 0, max: 100 },
  description: { type: String, required: true },
  recommendations: [{ type: String }]
});

// 메인 성능 예측 스키마
const performancePredictionSchema = new Schema<IPerformancePrediction>({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  predictionDate: { type: Date, default: Date.now },
  
  userProfile: {
    age: { type: Number, required: true, min: 5, max: 100 },
    weight: { type: Number, required: true, min: 20, max: 300 },
    height: { type: Number, required: true, min: 100, max: 250 },
    experience: { type: Number, required: true, min: 0 },
    currentLevel: { type: String, required: true },
    dominantStroke: { 
      type: String, 
      enum: Object.values(SwimmingEvent), 
      required: true 
    },
    trainingFrequency: { type: Number, required: true, min: 1, max: 14 },
    competitionExperience: { type: Boolean, default: false }
  },
  
  currentRecords: [{
    event: { 
      type: String, 
      enum: Object.values(SwimmingEvent), 
      required: true 
    },
    bestTime: { type: Number, required: true, min: 0 },
    achievedDate: { type: Date, required: true },
    conditions: { type: String, required: true }
  }],
  
  trainingAnalysis: {
    recentPerformances: [trainingPerformanceSchema],
    trainingLoad: {
      weeklyVolume: { type: Number, required: true, min: 0 },
      weeklyIntensity: { type: Number, required: true, min: 1, max: 10 },
      trainingDays: { type: Number, required: true, min: 1, max: 7 }
    },
    progressTrend: { 
      type: String, 
      enum: ['improving', 'stable', 'declining'],
      required: true 
    },
    consistencyScore: { type: Number, required: true, min: 1, max: 100 },
    peakPerformanceIndicators: {
      bestRecentTime: { type: Number, required: true },
      averageTime: { type: Number, required: true },
      timeVariability: { type: Number, required: true, min: 0 }
    }
  },
  
  physiologicalAnalysis: {
    recentData: [physiologicalDataSchema],
    fitnessScore: { type: Number, required: true, min: 1, max: 100 },
    strengthProfile: {
      overall: { type: Number, required: true, min: 1, max: 100 },
      strengths: [{ type: String }],
      weaknesses: [{ type: String }]
    },
    enduranceProfile: {
      aerobicCapacity: { type: Number, required: true, min: 1, max: 100 },
      anaerobicCapacity: { type: Number, required: true, min: 1, max: 100 },
      lactateManagement: { type: Number, required: true, min: 1, max: 100 }
    }
  },
  
  techniqueAnalysis: {
    overallScore: { type: Number, required: true, min: 1, max: 100 },
    strokeEfficiency: { type: Number, required: true, min: 1, max: 100 },
    startTechnique: { type: Number, required: true, min: 1, max: 100 },
    turnTechnique: { type: Number, required: true, min: 1, max: 100 },
    finishTechnique: { type: Number, required: true, min: 1, max: 100 },
    breathing: { type: Number, required: true, min: 1, max: 100 },
    bodyPosition: { type: Number, required: true, min: 1, max: 100 },
    timing: { type: Number, required: true, min: 1, max: 100 },
    improvementAreas: [{ type: String }]
  },
  
  predictions: [{
    targetEvent: { 
      type: String, 
      enum: Object.values(SwimmingEvent), 
      required: true 
    },
    currentBestTime: { type: Number, required: true, min: 0 },
    predictedTime: { type: Number, required: true, min: 0 },
    improvementSeconds: { type: Number, required: true },
    improvementPercentage: { type: Number, required: true },
    confidenceLevel: { 
      type: String, 
      enum: Object.values(ConfidenceLevel), 
      required: true 
    },
    confidenceScore: { type: Number, required: true, min: 0, max: 100 },
    
    timeframePredictions: {
      oneMonth: { type: Number, required: true, min: 0 },
      threeMonths: { type: Number, required: true, min: 0 },
      sixMonths: { type: Number, required: true, min: 0 },
      oneYear: { type: Number, required: true, min: 0 }
    },
    
    performanceFactors: [performanceFactorSchema],
    
    breakdown: {
      startImprovement: { type: Number, required: true },
      strokeImprovement: { type: Number, required: true },
      turnImprovement: { type: Number, required: true },
      finishImprovement: { type: Number, required: true },
      enduranceImprovement: { type: Number, required: true },
      techniqueImprovement: { type: Number, required: true }
    },
    
    recommendations: {
      training: [{ type: String }],
      technique: [{ type: String }],
      physical: [{ type: String }],
      tactical: [{ type: String }]
    },
    
    milestones: [{
      targetTime: { type: Number, required: true, min: 0 },
      estimatedAchievementDate: { type: Date, required: true },
      requiredImprovementRate: { type: Number, required: true }
    }]
  }],
  
  modelInfo: {
    version: { type: String, default: '1.0.0' },
    algorithm: { type: String, default: 'neural_network' },
    trainingDataSize: { type: Number, required: true },
    lastTrainingDate: { type: Date, required: true },
    accuracy: { type: Number, required: true, min: 0, max: 100 }
  },
  
  validation: {
    historicalAccuracy: { type: Number, required: true, min: 0, max: 100 },
    similarSwimmersComparison: {
      count: { type: Number, required: true, min: 0 },
      averageImprovement: { type: Number, required: true },
      bestImprovement: { type: Number, required: true }
    },
    expertValidation: {
      coachReview: { type: String },
      adjustments: [{ type: String }],
      approvalStatus: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      }
    }
  },
  
  tracking: {
    actualResults: [{
      event: { 
        type: String, 
        enum: Object.values(SwimmingEvent), 
        required: true 
      },
      predictedTime: { type: Number, required: true },
      actualTime: { type: Number, required: true },
      achievedDate: { type: Date, required: true },
      accuracy: { type: Number, required: true, min: 0, max: 100 }
    }],
    feedbackProvided: { type: Boolean, default: false },
    nextPredictionDate: { type: Date, required: true }
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

// 인덱스 설정
performancePredictionSchema.index({ userId: 1, predictionDate: -1 });
performancePredictionSchema.index({ 'predictions.targetEvent': 1 });
performancePredictionSchema.index({ 'predictions.confidenceLevel': 1 });
performancePredictionSchema.index({ isActive: 1 });
performancePredictionSchema.index({ 'tracking.nextPredictionDate': 1 });

// 미들웨어: 업데이트 시 updatedAt 자동 갱신
performancePredictionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// 정적 메서드: 사용자별 최신 예측 조회
performancePredictionSchema.statics.getLatestPrediction = async function(userId: mongoose.Types.ObjectId) {
  return await this.findOne({ userId, isActive: true })
    .sort({ predictionDate: -1 })
    .populate('userId', 'name email');
};

// 정적 메서드: 종목별 예측 통계
performancePredictionSchema.statics.getEventStatistics = async function(event: SwimmingEvent) {
  return await this.aggregate([
    { $match: { isActive: true, 'predictions.targetEvent': event } },
    { $unwind: '$predictions' },
    { $match: { 'predictions.targetEvent': event } },
    {
      $group: {
        _id: '$predictions.confidenceLevel',
        count: { $sum: 1 },
        avgImprovement: { $avg: '$predictions.improvementPercentage' },
        avgConfidence: { $avg: '$predictions.confidenceScore' }
      }
    },
    { $sort: { avgConfidence: -1 } }
  ]);
};

// 정적 메서드: 예측 정확도 통계
performancePredictionSchema.statics.getAccuracyStatistics = async function() {
  return await this.aggregate([
    { $match: { isActive: true, 'tracking.actualResults.0': { $exists: true } } },
    { $unwind: '$tracking.actualResults' },
    {
      $group: {
        _id: '$tracking.actualResults.event',
        count: { $sum: 1 },
        avgAccuracy: { $avg: '$tracking.actualResults.accuracy' },
        bestAccuracy: { $max: '$tracking.actualResults.accuracy' },
        worstAccuracy: { $min: '$tracking.actualResults.accuracy' }
      }
    },
    { $sort: { avgAccuracy: -1 } }
  ]);
};

// 인스턴스 메서드: 예측 업데이트 필요 여부
performancePredictionSchema.methods.needsUpdate = function(): boolean {
  const daysSinceUpdate = Math.floor(
    (Date.now() - this.updatedAt.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  return daysSinceUpdate >= 14 || // 2주 경과
         this.tracking.nextPredictionDate <= new Date() || // 다음 예측일 도래
         this.trainingAnalysis.recentPerformances.length >= 10; // 새로운 성과 데이터 충분
};

// 인스턴스 메서드: 실제 결과 추가
performancePredictionSchema.methods.addActualResult = function(
  event: SwimmingEvent,
  predictedTime: number,
  actualTime: number,
  achievedDate: Date
) {
  const accuracy = Math.max(0, 100 - Math.abs((actualTime - predictedTime) / predictedTime) * 100);
  
  this.tracking.actualResults.push({
    event,
    predictedTime,
    actualTime,
    achievedDate,
    accuracy
  });
  
  // 다음 예측일 설정 (3개월 후)
  this.tracking.nextPredictionDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
};

// 인스턴스 메서드: 예측 정확도 계산
performancePredictionSchema.methods.calculateOverallAccuracy = function(): number {
  if (this.tracking.actualResults.length === 0) return 0;
  
  const totalAccuracy = this.tracking.actualResults.reduce(
    (sum: number, result: any) => sum + result.accuracy, 0
  );
  
  return totalAccuracy / this.tracking.actualResults.length;
};

// 인스턴스 메서드: 개선 추세 분석
performancePredictionSchema.methods.analyzeImprovementTrend = function() {
  const performances = this.trainingAnalysis.recentPerformances
    .sort((a: any, b: any) => a.date.getTime() - b.date.getTime());
  
  if (performances.length < 3) return 'insufficient_data';
  
  const recentPerfs = performances.slice(-3);
  const earlierPerfs = performances.slice(-6, -3);
  
  if (earlierPerfs.length === 0) return 'insufficient_data';
  
  const recentAvg = recentPerfs.reduce((sum: number, p: any) => sum + p.time, 0) / recentPerfs.length;
  const earlierAvg = earlierPerfs.reduce((sum: number, p: any) => sum + p.time, 0) / earlierPerfs.length;
  
  const improvementPercent = ((earlierAvg - recentAvg) / earlierAvg) * 100;
  
  if (improvementPercent > 2) return 'improving';
  if (improvementPercent < -2) return 'declining';
  return 'stable';
};

export const PerformancePrediction = mongoose.model<IPerformancePrediction>('PerformancePrediction', performancePredictionSchema);
export default PerformancePrediction;
