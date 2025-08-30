/**
 * ✅ JJ Swim Lab - Approval 모델
 * 
 * 📋 **목적**
 * - 승인 요청 및 처리 상태 관리
 * - 다양한 유형의 승인 프로세스 지원
 * - 승인 이력 및 상태 추적
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IApproval extends Document {
  type: string;
  userId: string;
  instructorId?: string;
  centerId?: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: Date;
  approvalDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const approvalSchema = new Schema<IApproval>({
  type: {
    type: String,
    required: true,
    enum: ['course_registration', 'instructor_certification', 'center_registration', 'payment_refund']
  },
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  instructorId: {
    type: String,
    ref: 'User'
  },
  centerId: {
    type: String,
    ref: 'SwimmingCenter'
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  requestDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  approvalDate: {
    type: Date
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// 인덱스 설정
approvalSchema.index({ userId: 1, type: 1 });
approvalSchema.index({ status: 1 });
approvalSchema.index({ createdAt: -1 });

export const Approval = mongoose.model<IApproval>('Approval', approvalSchema);
