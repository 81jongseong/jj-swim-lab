/**
 * @file 학습 진도 모델
 * @description 학생의 강습법 학습 진도를 추적하는 모델
 * @date 2025-01-13
 * @author JJ Swim Lab
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface ILearningProgress extends Document {
  studentId: mongoose.Types.ObjectId;
  teachingMethodId: mongoose.Types.ObjectId;
  completedSteps: number[];
  totalSteps: number;
  progress: number; // 0-100
  lastStudied: Date;
  notes?: string;
  rating?: number; // 1-5
  studyTime: number; // 총 학습 시간 (분)
  difficulty: 'easy' | 'medium' | 'hard';
  masteryLevel: 'learning' | 'practicing' | 'mastered';
  createdAt: Date;
  updatedAt: Date;
}

const learningProgressSchema = new Schema<ILearningProgress>({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  teachingMethodId: {
    type: Schema.Types.ObjectId,
    ref: 'TeachingMethod',
    required: true,
    index: true
  },
  completedSteps: [{
    type: Number,
    default: []
  }],
  totalSteps: {
    type: Number,
    required: true,
    default: 0
  },
  progress: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    max: 100
  },
  lastStudied: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  studyTime: {
    type: Number,
    default: 0,
    min: 0
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  masteryLevel: {
    type: String,
    enum: ['learning', 'practicing', 'mastered'],
    default: 'learning'
  }
}, {
  timestamps: true
});

// 복합 인덱스 - 학생과 강습법 조합으로 유니크하게
learningProgressSchema.index({ studentId: 1, teachingMethodId: 1 }, { unique: true });

// 진도 업데이트 시 자동 계산
learningProgressSchema.pre('save', function(next) {
  if (this.completedSteps && this.totalSteps > 0) {
    this.progress = Math.round((this.completedSteps.length / this.totalSteps) * 100);
    
    // 마스터리 레벨 자동 설정
    if (this.progress === 100) {
      this.masteryLevel = 'mastered';
    } else if (this.progress >= 70) {
      this.masteryLevel = 'practicing';
    } else {
      this.masteryLevel = 'learning';
    }
  }
  next();
});

export const LearningProgress = mongoose.model<ILearningProgress>('LearningProgress', learningProgressSchema);

