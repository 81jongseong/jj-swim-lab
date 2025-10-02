/**
 * 🏊 JJ Swim Lab - 수영 훈련법 모델
 * 
 * 📋 **모델 목적**
 * - 수영 훈련법 데이터 구조 정의
 * - 훈련법 카테고리, 설명, 추천 드릴 관리
 * - 훈련법 근거 및 효과 데이터 관리
 * 
 * 🗄️ **데이터 연동**
 * - client/src/swimlab/data/trainingMethods.ts (기존 하드코딩 데이터)
 * - client/app/admin/swim-training-engine/page.tsx (프로그램 생성 엔진)
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface ISwimTrainingMethod extends Document {
  id: string; // 고유 ID (예: '01', '02')
  title: string; // 훈련법 이름
  category: string; // 카테고리 (예: 'technique', 'endurance')
  description: string; // 설명
  recommendedDrills?: string[]; // 추천 드릴 ID 목록
  avoidForConditions?: string[]; // 회피해야 할 질환 ID 목록
  recommendForConditions?: string[]; // 추천되는 질환 ID 목록
  evidence?: Array<{
    label: string;
    url: string;
  }>; // 의학적 근거
  targetLevel?: string[]; // 대상 수준 (beginner, intermediate, advanced)
  intensity?: string; // 강도 (low, medium, high)
  isActive: boolean;
  order?: number;
  centerId?: mongoose.Types.ObjectId; // 센터별 커스텀 훈련법
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SwimTrainingMethodSchema = new Schema<ISwimTrainingMethod>({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  recommendedDrills: [{
    type: String,
    trim: true
  }],
  avoidForConditions: [{
    type: String,
    trim: true
  }],
  recommendForConditions: [{
    type: String,
    trim: true
  }],
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
  targetLevel: [{
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    trim: true
  }],
  intensity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    trim: true
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
SwimTrainingMethodSchema.index({ id: 1 });
SwimTrainingMethodSchema.index({ category: 1 });
SwimTrainingMethodSchema.index({ isActive: 1 });
SwimTrainingMethodSchema.index({ centerId: 1 });

export const SwimTrainingMethod = mongoose.models.SwimTrainingMethod || mongoose.model<ISwimTrainingMethod>('SwimTrainingMethod', SwimTrainingMethodSchema);

