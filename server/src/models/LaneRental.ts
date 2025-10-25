/**
 * 🏊‍♀️ JJ Swim Lab - 레인대여 모델
 * 
 * 레인대여 신청 및 관리 정보를 저장하는 모델입니다.
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface ILaneRental extends Document {
  userId: mongoose.Types.ObjectId;
  centerId: mongoose.Types.ObjectId;
  date: Date;
  startTime: string;
  endTime: string;
  duration: number; // 분 단위
  laneNumber: number;
  poolType: 'mainPool' | 'kidsPool' | 'auxiliaryPool';
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  purpose: string; // '자유수영', '연습', '경기준비' 등
  notes?: string;
  price: number;
  paymentStatus: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const laneRentalSchema = new Schema<ILaneRental>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  centerId: {
    type: Schema.Types.ObjectId,
    ref: 'Center',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  laneNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  poolType: {
    type: String,
    enum: ['mainPool', 'kidsPool', 'auxiliaryPool'],
    default: 'mainPool'
  },
  purpose: {
    type: String,
    required: true,
    default: '자유수영'
  },
  notes: {
    type: String
  },
  price: {
    type: Number,
    required: true,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

const LaneRental = mongoose.model<ILaneRental>('LaneRental', laneRentalSchema);
export default LaneRental;
export { LaneRental };