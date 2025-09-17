/**
 * @file 리포트 모델
 * @description 센터 리포트 데이터 스키마를 정의합니다.
 * @date 2025-09-14
 * @author JJ Swim Lab
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IReport extends Document {
  period: string;
  totalStudents: number;
  totalRevenue: number;
  totalClasses: number;
  averageRating: number;
  newStudents: number;
  retentionRate: number;
  centerId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema: Schema = new Schema({
  period: {
    type: String,
    required: true,
    enum: ['week', 'month', 'year']
  },
  totalStudents: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  },
  totalClasses: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  newStudents: {
    type: Number,
    default: 0
  },
  retentionRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  centerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Center',
    required: true
  }
}, {
  timestamps: true
});

// 인덱스 설정
ReportSchema.index({ centerId: 1, period: 1 }, { unique: true });
ReportSchema.index({ createdAt: -1 });

export const Report = mongoose.model<IReport>('Report', ReportSchema);