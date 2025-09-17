/**
 * @file 리뷰 모델
 * @description 수강생 리뷰 데이터 스키마를 정의합니다.
 * @date 2025-09-14
 * @author JJ Swim Lab
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  studentName: string;
  instructorName: string;
  courseName: string;
  rating: number;
  comment: string;
  status: 'approved' | 'pending' | 'rejected';
  date: Date;
  centerId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema = new Schema({
  studentName: {
    type: String,
    required: true,
    trim: true
  },
  instructorName: {
    type: String,
    required: true,
    trim: true
  },
  courseName: {
    type: String,
    required: true,
    trim: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['approved', 'pending', 'rejected'],
    default: 'pending'
  },
  date: {
    type: Date,
    default: Date.now
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
ReviewSchema.index({ centerId: 1, date: -1 });
ReviewSchema.index({ status: 1 });
ReviewSchema.index({ rating: 1 });

export const Review = mongoose.model<IReview>('Review', ReviewSchema);
