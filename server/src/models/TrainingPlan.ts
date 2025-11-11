/**
 * 🏊‍♂️ JJ Swim Lab - AI 기반 개인별 훈련 계획 모델
 * 
 * 📋 **모델 목적**
 * - 사용자 개인별 맞춤형 훈련 계획 자동 생성 및 관리
 * - AI 분석을 통한 최적화된 훈련 프로그램 제공
 * - 사용자 레벨, 목표, 진도에 따른 동적 계획 조정
 * - 훈련 성과 추적 및 계획 최적화
 * 
 * 🔄 **주요 기능**
 * - 사용자 프로필 기반 훈련 계획 생성
 * - 목표별 맞춤형 주간 훈련 프로그램
 * - 실시간 진도 추적 및 성과 분석
 * - AI 기반 계획 조정 및 최적화
 * - 훈련 세션 완료 처리 및 피드백
 * - 개인별 운동 강도 및 빈도 관리
 * 
 * 🗄️ **데이터 연동**
 * - User 모델과 연동 (사용자 정보)
 * - AI 분석 시스템과 연동 (성과 분석)
 * - 부상 예측 시스템과 연동 (안전성)
 * - 성과 예측 시스템과 연동 (목표 달성)
 * - MongoDB Atlas (클라우드 데이터베이스)
 * 
 * 🛠️ **필요한 설치 파일**
 * - Mongoose 7.8.7 (MongoDB ODM)
 * - AI 분석 엔진
 * - 성과 추적 시스템
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 개인별 신체 조건 및 제한사항 고려
 * 2. 훈련 강도의 점진적 증가 원칙 준수
 * 3. 부상 위험 최소화를 위한 안전 장치
 * 4. 개인정보 보호 및 데이터 보안
 * 5. AI 알고리즘의 정확성 및 신뢰성
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 훈련 계획 생성 알고리즘 검증
 * - [ ] 사용자 안전성 확인
 * - [ ] 성과 추적 정확성 검증
 * - [ ] AI 분석 결과 신뢰성 확인
 * - [ ] 데이터 보안 설정 검토
 * 
 * 📅 **개발 히스토리**
 * - 2025-01-13: AI 기반 개인별 훈련 계획 모델 구현
 * - 2025-01-13: 목표별 맞춤형 계획 생성 알고리즘 구현
 * - 2025-01-13: 실시간 진도 추적 및 조정 시스템 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2025-01-13
 * - 상태: ✅ 완성 (AI 훈련 계획 시스템)
 */

import mongoose, { Document, Schema } from 'mongoose';

// 훈련 강도 레벨
export enum TrainingIntensity {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  PROFESSIONAL = 'professional'
}

// 훈련 목표 타입
export enum TrainingGoal {
  FITNESS = 'fitness',           // 체력 증진
  TECHNIQUE = 'technique',       // 기술 향상
  SPEED = 'speed',              // 속도 향상
  ENDURANCE = 'endurance',      // 지구력 향상
  COMPETITION = 'competition',   // 대회 준비
  REHABILITATION = 'rehabilitation' // 재활
}

// 수영 스타일
export enum SwimmingStroke {
  FREESTYLE = 'freestyle',
  BACKSTROKE = 'backstroke',
  BREASTSTROKE = 'breaststroke',
  BUTTERFLY = 'butterfly',
  MEDLEY = 'medley'
}

// 훈련 세션 구조
export interface ITrainingSession {
  sessionNumber: number;
  title: string;
  description: string;
  duration: number; // 분
  warmUp: {
    exercises: string[];
    duration: number;
  };
  mainSet: {
    exercises: string[];
    sets: number;
    reps: number;
    restTime: number; // 초
    intensity: number; // 1-10
  };
  coolDown: {
    exercises: string[];
    duration: number;
  };
  focusAreas: string[]; // 집중 훈련 부위
  equipment: string[]; // 필요 장비
  calories: number; // 예상 소모 칼로리
  difficulty: number; // 1-10
}

// 주간 훈련 계획
export interface IWeeklyPlan {
  week: number;
  goal: string;
  sessions: ITrainingSession[];
  restDays: number[];
  progressMetrics: {
    expectedImprovement: string;
    keyFocus: string[];
    milestones: string[];
  };
}

// 개인별 훈련 계획 인터페이스
export interface ITrainingPlan extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  
  // 사용자 프로필 기반 정보
  userProfile: {
    currentLevel: TrainingIntensity;
    experience: number; // 개월
    age: number;
    weight: number;
    height: number;
    medicalConditions: string[];
    availableTime: number; // 주당 훈련 시간 (시간)
    preferredDays: number[]; // 0=일요일, 6=토요일
    preferredTimes: string[]; // ['morning', 'afternoon', 'evening']
  };
  
  // 훈련 목표 및 설정
  goals: {
    primary: TrainingGoal;
    secondary: TrainingGoal[];
    targetDate: Date;
    specificTargets: {
      distance?: number; // 목표 거리 (미터)
      time?: number; // 목표 시간 (초)
      stroke?: SwimmingStroke;
      competition?: string; // 대회명
    };
  };
  
  // 현재 실력 평가
  currentAssessment: {
    technique: {
      freestyle: number; // 1-10
      backstroke: number;
      breaststroke: number;
      butterfly: number;
    };
    endurance: number; // 1-10
    speed: number; // 1-10
    flexibility: number; // 1-10
    strength: number; // 1-10
    overallScore: number; // 1-100
  };
  
  // AI 생성 훈련 계획
  planDetails: {
    duration: number; // 총 훈련 기간 (주)
    sessionsPerWeek: number;
    totalSessions: number;
    weeklyPlans: IWeeklyPlan[];
    progressionStrategy: string;
    adaptationRules: string[];
  };
  
  // 진행 상황 추적
  progress: {
    currentWeek: number;
    currentSession: number;
    completedSessions: number;
    totalSessions: number;
    adherenceRate: number; // 0-100
    performanceMetrics: {
      date: Date;
      sessionId: number;
      completion: number; // 0-100
      perceivedExertion: number; // 1-10
      actualDuration: number;
      notes: string;
    }[];
  };
  
  // AI 분석 및 조정
  aiAnalysis: {
    lastAnalysisDate: Date;
    performanceTrend: 'improving' | 'stable' | 'declining';
    recommendedAdjustments: string[];
    riskFactors: string[];
    strengthAreas: string[];
    improvementAreas: string[];
    nextReviewDate: Date;
  };
  
  // 메타데이터
  createdBy: 'ai' | 'instructor';
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  version: number;
}

// 훈련 세션 스키마
const trainingSessionSchema = new Schema<ITrainingSession>({
  sessionNumber: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  warmUp: {
    exercises: [{ type: String }],
    duration: { type: Number, required: true }
  },
  mainSet: {
    exercises: [{ type: String }],
    sets: { type: Number, required: true },
    reps: { type: Number, required: true },
    restTime: { type: Number, required: true },
    intensity: { type: Number, min: 1, max: 10, required: true }
  },
  coolDown: {
    exercises: [{ type: String }],
    duration: { type: Number, required: true }
  },
  focusAreas: [{ type: String }],
  equipment: [{ type: String }],
  calories: { type: Number, required: true },
  difficulty: { type: Number, min: 1, max: 10, required: true }
});

// 주간 계획 스키마
const weeklyPlanSchema = new Schema<IWeeklyPlan>({
  week: { type: Number, required: true },
  goal: { type: String, required: true },
  sessions: [trainingSessionSchema],
  restDays: [{ type: Number }],
  progressMetrics: {
    expectedImprovement: { type: String, required: true },
    keyFocus: [{ type: String }],
    milestones: [{ type: String }]
  }
});

// 메인 훈련 계획 스키마
const trainingPlanSchema = new Schema<ITrainingPlan>({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  
  userProfile: {
    currentLevel: { 
      type: String, 
      enum: Object.values(TrainingIntensity), 
      required: true 
    },
    experience: { type: Number, required: true, min: 0 },
    age: { type: Number, required: true, min: 5, max: 100 },
    weight: { type: Number, required: true, min: 20, max: 300 },
    height: { type: Number, required: true, min: 100, max: 250 },
    medicalConditions: [{ type: String }],
    availableTime: { type: Number, required: true, min: 1, max: 40 },
    preferredDays: [{ type: Number, min: 0, max: 6 }],
    preferredTimes: [{ 
      type: String, 
      enum: ['morning', 'afternoon', 'evening'] 
    }]
  },
  
  goals: {
    primary: { 
      type: String, 
      enum: Object.values(TrainingGoal), 
      required: true 
    },
    secondary: [{ 
      type: String, 
      enum: Object.values(TrainingGoal) 
    }],
    targetDate: { type: Date, required: true },
    specificTargets: {
      distance: { type: Number, min: 25 },
      time: { type: Number, min: 10 },
      stroke: { 
        type: String, 
        enum: Object.values(SwimmingStroke) 
      },
      competition: { type: String }
    }
  },
  
  currentAssessment: {
    technique: {
      freestyle: { type: Number, min: 1, max: 10, required: true },
      backstroke: { type: Number, min: 1, max: 10, required: true },
      breaststroke: { type: Number, min: 1, max: 10, required: true },
      butterfly: { type: Number, min: 1, max: 10, required: true }
    },
    endurance: { type: Number, min: 1, max: 10, required: true },
    speed: { type: Number, min: 1, max: 10, required: true },
    flexibility: { type: Number, min: 1, max: 10, required: true },
    strength: { type: Number, min: 1, max: 10, required: true },
    overallScore: { type: Number, min: 1, max: 100, required: true }
  },
  
  planDetails: {
    duration: { type: Number, required: true, min: 1, max: 52 },
    sessionsPerWeek: { type: Number, required: true, min: 1, max: 7 },
    totalSessions: { type: Number, required: true },
    weeklyPlans: [weeklyPlanSchema],
    progressionStrategy: { type: String, required: true },
    adaptationRules: [{ type: String }]
  },
  
  progress: {
    currentWeek: { type: Number, default: 1 },
    currentSession: { type: Number, default: 1 },
    completedSessions: { type: Number, default: 0 },
    totalSessions: { type: Number, required: true },
    adherenceRate: { type: Number, default: 0, min: 0, max: 100 },
    performanceMetrics: [{
      date: { type: Date, required: true },
      sessionId: { type: Number, required: true },
      completion: { type: Number, required: true, min: 0, max: 100 },
      perceivedExertion: { type: Number, required: true, min: 1, max: 10 },
      actualDuration: { type: Number, required: true },
      notes: { type: String, default: '' }
    }]
  },
  
  aiAnalysis: {
    lastAnalysisDate: { type: Date, default: Date.now },
    performanceTrend: { 
      type: String, 
      enum: ['improving', 'stable', 'declining'],
      default: 'stable'
    },
    recommendedAdjustments: [{ type: String }],
    riskFactors: [{ type: String }],
    strengthAreas: [{ type: String }],
    improvementAreas: [{ type: String }],
    nextReviewDate: { type: Date, required: true }
  },
  
  createdBy: { 
    type: String, 
    enum: ['ai', 'instructor'], 
    default: 'ai' 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  version: { type: Number, default: 1 }
});

// 인덱스 설정
trainingPlanSchema.index({ userId: 1, isActive: 1 });
trainingPlanSchema.index({ 'goals.primary': 1 });
trainingPlanSchema.index({ 'userProfile.currentLevel': 1 });
trainingPlanSchema.index({ createdAt: -1 });

// 미들웨어: 업데이트 시 updatedAt 자동 갱신
trainingPlanSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// 정적 메서드: AI 분석 기반 계획 생성
trainingPlanSchema.statics.generateAIPlan = async function(
  userId: mongoose.Types.ObjectId, 
  userInput: any
) {
  void userId;
  void userInput;
  // AI 로직은 서비스에서 구현
  return null;
};

// 인스턴스 메서드: 진행률 계산
trainingPlanSchema.methods.calculateProgress = function(): number {
  if (this.progress.totalSessions === 0) return 0;
  return Math.round((this.progress.completedSessions / this.progress.totalSessions) * 100);
};

// 인스턴스 메서드: 다음 세션 정보
trainingPlanSchema.methods.getNextSession = function(): ITrainingSession | null {
  const currentWeekPlan = this.planDetails.weeklyPlans.find(
    (week: IWeeklyPlan) => week.week === this.progress.currentWeek
  );
  
  if (!currentWeekPlan) return null;
  
  const nextSession = currentWeekPlan.sessions.find(
    (session: ITrainingSession) => session.sessionNumber === this.progress.currentSession
  );
  
  return nextSession || null;
};

// 인스턴스 메서드: 계획 조정 필요 여부
trainingPlanSchema.methods.needsAdjustment = function(): boolean {
  const daysSinceLastAnalysis = Math.floor(
    (Date.now() - this.aiAnalysis.lastAnalysisDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  return daysSinceLastAnalysis >= 7 || // 1주일 경과
         this.progress.adherenceRate < 70 || // 이행률 70% 미만
         this.aiAnalysis.performanceTrend === 'declining'; // 성과 하락
};

export const TrainingPlan = mongoose.model<ITrainingPlan>('TrainingPlan', trainingPlanSchema);
export default TrainingPlan;
