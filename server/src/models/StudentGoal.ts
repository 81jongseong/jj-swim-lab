/**
 * @file 학생 목표 모델
 * @description 학생의 학습 목표를 설정하고 추적하는 모델
 * @date 2025-01-13
 * @author JJ Swim Lab
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IStudentGoal extends Document {
  studentId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  targetDate: Date;
  teachingMethods: mongoose.Types.ObjectId[];
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  progress: number; // 0-100
  milestones: Array<{
    title: string;
    description: string;
    targetDate: Date;
    completed: boolean;
    completedAt?: Date;
  }>;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const studentGoalSchema = new Schema<IStudentGoal>({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
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
  targetDate: {
    type: Date,
    required: true
  },
  teachingMethods: [{
    type: Schema.Types.ObjectId,
    ref: 'TeachingMethod'
  }],
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'cancelled'],
    default: 'active'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  milestones: [{
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    targetDate: {
      type: Date,
      required: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date
    }
  }],
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// 목표 진행률 자동 계산
studentGoalSchema.pre('save', function(next) {
  if (this.milestones && this.milestones.length > 0) {
    const completedMilestones = this.milestones.filter(m => m.completed).length;
    this.progress = Math.round((completedMilestones / this.milestones.length) * 100);
    
    // 모든 마일스톤이 완료되면 목표 완료
    if (this.progress === 100 && this.status === 'active') {
      this.status = 'completed';
    }
  }
  next();
});

export const StudentGoal = mongoose.model<IStudentGoal>('StudentGoal', studentGoalSchema);

