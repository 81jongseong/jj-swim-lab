/**
 * @file 추천 모델
 * @description AI 기반 개인화 추천을 저장하는 모델
 * @date 2025-01-13
 * @author JJ Swim Lab
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IRecommendation extends Document {
  studentId: mongoose.Types.ObjectId;
  type: 'next_lesson' | 'review' | 'challenge' | 'foundation';
  title: string;
  description: string;
  teachingMethodId: mongoose.Types.ObjectId;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: number; // 분
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'active' | 'completed' | 'dismissed' | 'expired';
  completedAt?: Date;
  dismissedAt?: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const recommendationSchema = new Schema<IRecommendation>({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['next_lesson', 'review', 'challenge', 'foundation'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  teachingMethodId: {
    type: Schema.Types.ObjectId,
    ref: 'TeachingMethod',
    required: true
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  estimatedTime: {
    type: Number,
    required: true,
    min: 1
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'dismissed', 'expired'],
    default: 'active'
  },
  completedAt: {
    type: Date
  },
  dismissedAt: {
    type: Date
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7일 후 만료
  }
}, {
  timestamps: true
});

// 추천 인덱스
recommendationSchema.index({ studentId: 1, status: 1 });
recommendationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL 인덱스

// 만료된 추천 자동 처리
recommendationSchema.pre('save', function(next) {
  if (this.expiresAt && this.expiresAt < new Date() && this.status === 'active') {
    this.status = 'expired';
  }
  next();
});

export const Recommendation = mongoose.model<IRecommendation>('Recommendation', recommendationSchema);

