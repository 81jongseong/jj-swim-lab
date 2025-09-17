/**
 * @file 수업 계획 모델
 * @description 강사가 강습법을 기반으로 수업 계획을 세우는 모델
 * @date 2025-01-13
 * @author JJ Swim Lab
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface ILessonPlan extends Document {
  instructorId: mongoose.Types.ObjectId;
  centerId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  teachingMethods: mongoose.Types.ObjectId[];
  students: mongoose.Types.ObjectId[];
  duration: number; // 분
  date: Date;
  time: string;
  location: string;
  objectives: string[];
  materials: string[];
  notes: string;
  status: 'draft' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  actualDuration?: number; // 실제 수업 시간 (분)
  attendance: Array<{
    studentId: mongoose.Types.ObjectId;
    attended: boolean;
    notes?: string;
  }>;
  feedback: Array<{
    studentId: mongoose.Types.ObjectId;
    rating: number; // 1-5
    comment?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const lessonPlanSchema = new Schema<ILessonPlan>({
  instructorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  centerId: {
    type: Schema.Types.ObjectId,
    ref: 'Center',
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
  teachingMethods: [{
    type: Schema.Types.ObjectId,
    ref: 'TeachingMethod'
  }],
  students: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  duration: {
    type: Number,
    required: true,
    min: 30,
    max: 180
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  objectives: [{
    type: String,
    trim: true
  }],
  materials: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'in_progress', 'completed', 'cancelled'],
    default: 'draft'
  },
  actualDuration: {
    type: Number,
    min: 0
  },
  attendance: [{
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    attended: {
      type: Boolean,
      default: false
    },
    notes: {
      type: String,
      default: ''
    }
  }],
  feedback: [{
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    comment: {
      type: String,
      default: ''
    }
  }]
}, {
  timestamps: true
});

// 수업 계획 인덱스
lessonPlanSchema.index({ instructorId: 1, date: 1 });
lessonPlanSchema.index({ centerId: 1, date: 1 });
lessonPlanSchema.index({ status: 1, date: 1 });

export const LessonPlan = mongoose.model<ILessonPlan>('LessonPlan', lessonPlanSchema);