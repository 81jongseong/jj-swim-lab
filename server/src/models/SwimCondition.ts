/**
 * 🏊 JJ Swim Lab - 수영 질환/컨디션 모델
 * 
 * 📋 **모델 목적**
 * - 수영 관련 질환 및 컨디션 데이터 구조 정의
 * - 질환별 가이드라인, 추천/회피 운동 관리
 * - 의학적 근거 및 영법별 안전도 관리
 * 
 * 🗄️ **데이터 연동**
 * - client/src/swimlab/data/conditions_full.ts (기존 하드코딩 데이터)
 * - client/app/admin/swim-training-engine/page.tsx (프로그램 생성 엔진)
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface ISwimCondition extends Document {
  id: string; // 고유 ID (예: 'shoulder_impingement')
  name: string; // 질환 이름
  label?: string; // 표시용 라벨
  category: string; // 카테고리 (어깨, 무릎, 허리 등)
  group: string; // 그룹 (CHRONIC, ACUTE, TEMP)
  description?: string; // 설명
  swimmingGuidance?: string; // 수영 가이드라인
  recommendedStrokes?: string[]; // 추천 영법
  avoidStrokes?: string[]; // 회피 영법
  recommendedMethods?: string[]; // 추천 훈련법 ID
  avoidMethods?: string[]; // 회피 훈련법 ID
  recommendedDrills?: string[]; // 추천 드릴 ID
  avoidDrills?: string[]; // 회피 드릴 ID
  rationale?: string; // 의학적 근거 설명
  evidence?: Array<{
    label: string;
    url: string;
  }>; // 의학적 근거 논문
  keywords?: string[]; // 검색 키워드
  severity?: string; // 심각도 (mild, moderate, severe)
  isMSK28?: boolean; // MSK 28개 질환 여부
  isActive: boolean;
  order?: number;
  centerId?: mongoose.Types.ObjectId; // 센터별 커스텀 질환
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SwimConditionSchema = new Schema<ISwimCondition>({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  label: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  group: {
    type: String,
    required: true,
    enum: ['CHRONIC', 'ACUTE', 'TEMP'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  swimmingGuidance: {
    type: String,
    trim: true
  },
  recommendedStrokes: [{
    type: String,
    trim: true
  }],
  avoidStrokes: [{
    type: String,
    trim: true
  }],
  recommendedMethods: [{
    type: String,
    trim: true
  }],
  avoidMethods: [{
    type: String,
    trim: true
  }],
  recommendedDrills: [{
    type: String,
    trim: true
  }],
  avoidDrills: [{
    type: String,
    trim: true
  }],
  rationale: {
    type: String,
    trim: true
  },
  evidence: [{
    label: {
      type: String,
      trim: true
    },
    url: {
      type: String,
      trim: true
    }
  }],
  keywords: [{
    type: String,
    trim: true
  }],
  severity: {
    type: String,
    enum: ['mild', 'moderate', 'severe'],
    trim: true
  },
  isMSK28: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  centerId: {
    type: Schema.Types.ObjectId,
    ref: 'Center',
    required: false
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
}, {
  timestamps: true
});

// 인덱스
SwimConditionSchema.index({ id: 1 });
SwimConditionSchema.index({ category: 1 });
SwimConditionSchema.index({ group: 1 });
SwimConditionSchema.index({ keywords: 1 });
SwimConditionSchema.index({ isMSK28: 1 });
SwimConditionSchema.index({ isActive: 1 });
SwimConditionSchema.index({ centerId: 1 });

export const SwimCondition = mongoose.models.SwimCondition || mongoose.model<ISwimCondition>('SwimCondition', SwimConditionSchema);

