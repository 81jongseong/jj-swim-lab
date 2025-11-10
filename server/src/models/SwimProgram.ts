/**
 * 🏊 SwimLab - 수영 프로그램 이력 모델
 * 
 * 📋 **모델 목적**
 * - 생성된 수영 프로그램 저장 및 관리
 * - 사용된 훈련법 ID 이력 추적 (3주 연속 방지)
 * - 회원별 프로그램 조회 및 실행 기록
 * 
 * 🔄 **연동되는 데이터**
 * - User 모델 (회원 정보)
 * - SwimmingCenter 모델 (센터 정보)
 * - client/lib/swimlab/engine-v31.ts (프로그램 생성 엔진)
 * 
 * 💡 **주요 필드**
 * - athleteId: 회원 ID
 * - programType: 'weekly' | 'race'
 * - params: 생성 파라미터 (CSS, 목표, 영법 등)
 * - content: 프로그램 내용 (세션별 세트)
 * - usedMethodIds: 사용된 훈련법 ID 목록 (이력 추적용)
 * - executionHistory: 실행 기록 (날짜별 당일 컨디션)
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface ISwimProgram extends Document {
  athleteId?: mongoose.Types.ObjectId; // 개인 프로그램일 경우
  athleteName?: string;
  groupClassId?: mongoose.Types.ObjectId; // 단체반 프로그램일 경우
  groupClassName?: string;
  centerId?: mongoose.Types.ObjectId;
  programType: 'weekly' | 'race';
  programScope: 'individual' | 'group'; // 개인 PT vs 단체반
  
  // 생성 파라미터
  params: {
    startDate: string;
    daysPerWeek: number;
    selectedDays: string[];
    sessionDuration: number;
    pool: number;
    mainStrokes: string[];
    excludedStrokes: string[];
    cssPer100: Record<string, number>;
    conditionIds: string[];
    goal: string;
  };
  
  // 프로그램 내용
  content: {
    summary: string;
    planExplanation?: string; // 주간 계획 설명
    totalDuration: number;
    totalMeters: number;
    // 🏆 레이스 프로그램 전용 (Base → Build → Peak → Taper)
    phases?: Array<{
      phase: 'base' | 'build' | 'peak' | 'taper';
      weekStart: number;
      weekEnd: number;
      focus: string;
      volumeTarget: number;
      intensityDistribution: {
        z1: number;
        z2: number;
        z3: number;
        z4: number;
        z5: number;
      };
      weeklyPlans: Array<any>; // WeeklyPlan 타입
    }>;
    feasibility?: any; // 실현 가능성 정보
    phaseSummary?: any; // 페이즈 요약
    recommendations?: string[]; // 권장사항
    sessions: Array<{
      day: string;
      date?: string; // 실제 날짜 (YYYY-MM-DD)
      themeDesc?: string; // 테마 설명
      duration: number;
      distance: number;
      intensity: string;
      status?: 'scheduled' | 'postponed' | 'skipped';
      blocks: Array<{
        type: string;
        description: string;
        duration: number;
        distance: number;
        whyPace?: string;
        whyRest?: string;
        whySet?: string;
        evidenceKeys?: string[];
      }>;
      // 완료율 정보
      completion?: {
        completionRate: number; // 0-100
        feeling: 'easy' | 'moderate' | 'hard' | 'very_hard';
        inputBy: mongoose.Types.ObjectId; // 입력자 ID
        inputByRole: 'self' | 'instructor';
        inputAt: Date;
        notes?: string;
        // 상세 완료율 (세트별)
        detailedSets?: Array<{
          setIndex: number;
          planned: {
            distance: number;
            reps: number;
          };
          actual: {
            distance?: number;
            reps?: number;
            time?: number;
            completed: boolean;
          };
        }>;
      };
    }>;
  };
  
  // 🎯 사용된 훈련법 ID 이력 (25개 훈련법 로테이션)
  usedMethodIds: string[];
  
  // 📚 실행 기록 (당일 컨디션 입력)
  executionHistory: Array<{
    date: string;
    dayOfWeek: string;
    condition: 'very_good' | 'good' | 'normal' | 'tired' | 'very_tired';
    hasPain: boolean;
    rpe?: number;
    adjustedPace?: string;
    adjustedRest?: string;
    notes?: string;
    completed: boolean;
  }>;
  
  createdAt: Date;
  updatedAt: Date;
}

const SwimProgramSchema = new Schema<ISwimProgram>({
  athleteId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: false, // 단체반 프로그램은 불필요
    index: true 
  },
  athleteName: { 
    type: String, 
    required: false // 단체반 프로그램은 불필요
  },
  groupClassId: {
    type: Schema.Types.ObjectId,
    ref: 'GroupClass',
    required: false, // 개인 프로그램은 불필요
    index: true
  },
  groupClassName: {
    type: String,
    required: false
  },
  centerId: { 
    type: Schema.Types.ObjectId, 
    ref: 'SwimmingCenter',
    index: true 
  },
  programType: { 
    type: String, 
    enum: ['weekly', 'race'], 
    required: true,
    default: 'weekly'
  },
  programScope: {
    type: String,
    enum: ['individual', 'group'],
    required: true,
    default: 'individual',
    index: true
  },
  
  params: {
    startDate: { type: String, required: true },
    daysPerWeek: { type: Number, required: true },
    selectedDays: [{ type: String }],
    sessionDuration: { type: Number, required: true },
    pool: { type: Number, required: true },
    mainStrokes: [{ type: String }],
    excludedStrokes: [{ type: String }],
    cssPer100: { type: Schema.Types.Mixed },
    conditionIds: [{ type: String }],
    goal: { type: String, required: true }
  },
  
  content: {
    summary: { type: String, required: true },
    planExplanation: { type: String }, // 주간 계획 설명
    totalDuration: { type: Number, required: true },
    totalMeters: { type: Number, required: true },
    // 🏆 레이스 프로그램 전용 (Base → Build → Peak → Taper)
    phases: [{
      phase: { type: String, enum: ['base', 'build', 'peak', 'taper'] },
      weekStart: { type: Number },
      weekEnd: { type: Number },
      focus: { type: String },
      volumeTarget: { type: Number },
      intensityDistribution: {
        z1: { type: Number },
        z2: { type: Number },
        z3: { type: Number },
        z4: { type: Number },
        z5: { type: Number }
      },
      weeklyPlans: [{ type: Schema.Types.Mixed }] // WeeklyPlan 구조 (각 day에 completion, dayCondition 포함)
    }],
    feasibility: { type: Schema.Types.Mixed }, // 실현 가능성 정보
    phaseSummary: { type: Schema.Types.Mixed }, // 페이즈 요약
    recommendations: [{ type: String }], // 권장사항
    sessions: [{
      day: { type: String, required: true },
      date: { type: String }, // 실제 날짜 (YYYY-MM-DD)
      themeDesc: { type: String }, // 테마 설명
      duration: { type: Number },
      distance: { type: Number },
      intensity: { type: String },
      status: {
        type: String,
        enum: ['scheduled', 'postponed', 'skipped'],
        default: 'scheduled'
      },
      // 🌤️ 당일 컨디션 (실행 전 입력)
      dayCondition: {
        condition: { 
          type: String, 
          enum: ['very_good', 'good', 'normal', 'tired', 'very_tired'] 
        },
        hasPain: { type: Boolean },
        painLocation: { type: String },
        sleepQuality: { type: Number, min: 1, max: 10 },
        stressLevel: { type: Number, min: 1, max: 10 },
        inputBy: { type: Schema.Types.ObjectId, ref: 'User' },
        inputByRole: { type: String, enum: ['self', 'instructor'] },
        inputAt: { type: Date }
      },
      blocks: [{
        type: { type: String },
        description: { type: String },
        duration: { type: Number },
        distance: { type: Number },
        whyPace: { type: String },
        whyRest: { type: String },
        whySet: { type: String },
        evidenceKeys: [{ type: String }]
      }],
      // 완료율 정보
      completion: {
        completionRate: { type: Number, min: 0, max: 100 },
        feeling: { 
          type: String, 
          enum: ['easy', 'moderate', 'hard', 'very_hard']
        },
        inputBy: { type: Schema.Types.ObjectId, ref: 'User' },
        inputByRole: { 
          type: String, 
          enum: ['self', 'instructor']
        },
        inputAt: { type: Date },
        notes: { type: String },
        // 상세 완료율 (세트별)
        detailedSets: [{
          setIndex: { type: Number },
          planned: {
            distance: { type: Number },
            reps: { type: Number }
          },
          actual: {
            distance: { type: Number },
            reps: { type: Number },
            time: { type: Number },
            completed: { type: Boolean }
          }
        }]
      }
    }]
  },
  
  // 🎯 사용된 훈련법 ID 이력
  usedMethodIds: [{ type: String }],
  
  // 📚 실행 기록
  executionHistory: [{
    date: { type: String, required: true },
    dayOfWeek: { type: String, required: true },
    condition: { 
      type: String, 
      enum: ['very_good', 'good', 'normal', 'tired', 'very_tired'],
      required: true
    },
    hasPain: { type: Boolean, default: false },
    rpe: { type: Number, min: 1, max: 10 },
    adjustedPace: { type: String },
    adjustedRest: { type: String },
    notes: { type: String },
    completed: { type: Boolean, default: false }
  }]
}, {
  timestamps: true
});

// 인덱스: 회원별 최신 프로그램 조회 최적화
SwimProgramSchema.index({ athleteId: 1, createdAt: -1 });
SwimProgramSchema.index({ centerId: 1, createdAt: -1 });
SwimProgramSchema.index({ 'params.startDate': 1 });

const SwimProgram = mongoose.model<ISwimProgram>('SwimProgram', SwimProgramSchema);

export default SwimProgram;

