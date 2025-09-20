/**
 * @file 강습 계획 템플릿 모델
 * @description 최고관리자가 생성하는 강습 계획 템플릿 모델
 * @date 2025-09-20
 * @author JJ Swim Lab
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface ILessonPlanTemplate extends Document {
  templateName: string; // 예: "자유형 마스터 과정"
  description: string;
  category: 'freestyle' | 'backstroke' | 'breaststroke' | 'butterfly' | 'mixed' | 'basic' | 'advanced';
  level: 'beginner' | 'intermediate' | 'advanced';
  totalDuration: number; // 전체 과정 기간 (주 단위)
  totalSessions: number; // 총 세션 수
  sessionDuration: number; // 1회 수업 시간 (분)
  
  // 단계별 커리큘럼
  stages: Array<{
    stageNumber: number; // 1, 2, 3...
    stageName: string; // "물 적응 및 기본 자세"
    duration: number; // 이 단계의 기간 (주 단위)
    sessions: number; // 이 단계의 세션 수
    objectives: string[]; // 이 단계의 목표
    teachingMethods: string[]; // 사용할 강습법들
    assessmentCriteria: string[]; // 평가 기준
    materials: string[]; // 필요한 준비물
    safetyNotes: string[]; // 안전 주의사항
    progressRequirements: string[]; // 다음 단계 진급 조건
  }>;
  
  // 선택적 특별 단계
  specialStages?: Array<{
    stageName: string; // "경영 준비반", "개인 교정"
    description: string;
    isOptional: boolean;
    duration: number; // 주 단위
    prerequisites: string[]; // 선수 조건
    objectives: string[];
    teachingMethods: string[];
  }>;
  
  isActive: boolean;
  isPublic: boolean; // 모든 센터에서 사용 가능한지
  createdBy: mongoose.Types.ObjectId; // 생성한 관리자
  usageCount: number; // 사용된 횟수
  rating: number; // 센터들의 평가 평균
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const lessonPlanTemplateSchema = new Schema<ILessonPlanTemplate>({
  templateName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  category: {
    type: String,
    enum: ['freestyle', 'backstroke', 'breaststroke', 'butterfly', 'mixed', 'basic', 'advanced'],
    required: true,
    index: true
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true,
    index: true
  },
  totalDuration: {
    type: Number,
    required: true,
    min: 1,
    max: 52 // 최대 1년
  },
  totalSessions: {
    type: Number,
    required: true,
    min: 4,
    max: 200
  },
  sessionDuration: {
    type: Number,
    required: true,
    min: 30,
    max: 180
  },
  stages: [{
    stageNumber: {
      type: Number,
      required: true,
      min: 1
    },
    stageName: {
      type: String,
      required: true,
      trim: true
    },
    duration: {
      type: Number,
      required: true,
      min: 1
    },
    sessions: {
      type: Number,
      required: true,
      min: 1
    },
    objectives: [{
      type: String,
      required: true,
      trim: true
    }],
    teachingMethods: [{
      type: String,
      required: true,
      trim: true
    }],
    assessmentCriteria: [{
      type: String,
      trim: true
    }],
    materials: [{
      type: String,
      trim: true
    }],
    safetyNotes: [{
      type: String,
      trim: true
    }],
    progressRequirements: [{
      type: String,
      trim: true
    }]
  }],
  specialStages: [{
    stageName: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    isOptional: {
      type: Boolean,
      default: true
    },
    duration: {
      type: Number,
      required: true,
      min: 1
    },
    prerequisites: [{
      type: String,
      trim: true
    }],
    objectives: [{
      type: String,
      trim: true
    }],
    teachingMethods: [{
      type: String,
      trim: true
    }]
  }],
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isPublic: {
    type: Boolean,
    default: true,
    index: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  usageCount: {
    type: Number,
    default: 0,
    min: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true,
  collection: 'lessonplantemplates'
});

// 복합 인덱스
lessonPlanTemplateSchema.index({ category: 1, level: 1, isActive: 1 });
lessonPlanTemplateSchema.index({ isPublic: 1, isActive: 1 });
lessonPlanTemplateSchema.index({ createdBy: 1, isActive: 1 });

// 가상 필드 - 전체 단계 시간
lessonPlanTemplateSchema.virtual('totalStageDuration').get(function() {
  return this.stages.reduce((total: number, stage: any) => total + stage.duration, 0);
});

// 가상 필드 - 단계 개수
lessonPlanTemplateSchema.virtual('stageCount').get(function() {
  return this.stages.length;
});

export const LessonPlanTemplate = mongoose.model<ILessonPlanTemplate>('LessonPlanTemplate', lessonPlanTemplateSchema);
