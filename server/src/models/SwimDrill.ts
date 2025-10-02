/**
 * 🏊 JJ Swim Lab - 수영 드릴 모델
 * 
 * 📋 **모델 목적**
 * - 수영 드릴 데이터 구조 정의
 * - 드릴 카테고리, 설명, 사용 예시 관리
 * - 드릴 태그 및 조건별 필터링 지원
 * 
 * 🗄️ **데이터 연동**
 * - client/src/swimlab/data/drills.ts (기존 하드코딩 데이터)
 * - client/app/admin/swim-training-engine/page.tsx (프로그램 생성 엔진)
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface ISwimDrill extends Document {
  id: string; // 고유 ID (예: 'D01', 'D02')
  name: string; // 드릴 이름
  category: string; // 카테고리 (예: 'technique', 'breathing')
  description: string; // 설명
  tags?: string[]; // 태그 (예: 'shoulder-friendly', 'beginner')
  cues?: string[]; // 코칭 큐
  examples?: string[]; // 사용 예시
  videoUrl?: string; // 영상 URL
  recommendedFor?: string[]; // 추천 질환/상황
  avoidFor?: string[]; // 회피해야 할 질환
  targetStroke?: string[]; // 대상 영법 (freestyle, backstroke, breaststroke, butterfly)
  difficulty?: string; // 난이도 (easy, medium, hard)
  isActive: boolean;
  order?: number;
  centerId?: mongoose.Types.ObjectId; // 센터별 커스텀 드릴
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SwimDrillSchema = new Schema<ISwimDrill>({
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
  tags: [{
    type: String,
    trim: true
  }],
  cues: [{
    type: String,
    trim: true
  }],
  examples: [{
    type: String,
    trim: true
  }],
  videoUrl: {
    type: String,
    trim: true
  },
  recommendedFor: [{
    type: String,
    trim: true
  }],
  avoidFor: [{
    type: String,
    trim: true
  }],
  targetStroke: [{
    type: String,
    enum: ['freestyle', 'backstroke', 'breaststroke', 'butterfly', 'all'],
    trim: true
  }],
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
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
SwimDrillSchema.index({ id: 1 });
SwimDrillSchema.index({ category: 1 });
SwimDrillSchema.index({ tags: 1 });
SwimDrillSchema.index({ isActive: 1 });
SwimDrillSchema.index({ centerId: 1 });

export const SwimDrill = mongoose.models.SwimDrill || mongoose.model<ISwimDrill>('SwimDrill', SwimDrillSchema);

