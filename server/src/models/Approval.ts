/**
 * ✅ JJ Swim Lab - 승인 요청 모델
 * 
 * 📋 **기능**
 * - 승인 요청 데이터 구조 정의
 * - 승인 상태 관리
 * - 승인 이력 추적
 * - 권한 기반 접근 제어
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IApproval extends Document {
  type: 'course_enrollment' | 'instructor_registration' | 'payment_approval' | 'schedule_change' | 'refund_request';
  userId: mongoose.Types.ObjectId;
  courseId?: mongoose.Types.ObjectId;
  instructorId?: mongoose.Types.ObjectId;
  paymentId?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  estimatedAmount?: number;
  requestDate: Date;
  processedBy?: mongoose.Types.ObjectId;
  processedAt?: Date;
  reason?: string;
  centerId?: mongoose.Types.ObjectId;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ApprovalSchema = new Schema<IApproval>({
  type: {
    type: String,
    enum: ['course_enrollment', 'instructor_registration', 'payment_approval', 'schedule_change', 'refund_request'],
    required: true,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    index: true
  },
  instructorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  paymentId: {
    type: Schema.Types.ObjectId,
    ref: 'Payment',
    index: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
    index: true
  },
  estimatedAmount: {
    type: Number,
    min: 0
  },
  requestDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  processedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  processedAt: {
    type: Date
  },
  reason: {
    type: String,
    maxlength: 500
  },
  centerId: {
    type: Schema.Types.ObjectId,
    ref: 'Center',
    index: true
  },
  attachments: [{
    type: String
  }]
}, {
  timestamps: true,
  collection: 'approvals'
});

// 복합 인덱스 생성
ApprovalSchema.index({ userId: 1, type: 1, status: 1 });
ApprovalSchema.index({ centerId: 1, status: 1, requestDate: -1 });
ApprovalSchema.index({ status: 1, priority: 1, requestDate: -1 });

// 가상 필드: 승인 대기 시간 (일)
ApprovalSchema.virtual('waitingDays').get(function() {
  if (this.status === 'pending') {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.requestDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// 가상 필드: 처리 시간 (일)
ApprovalSchema.virtual('processingDays').get(function() {
  if (this.processedAt && this.requestDate) {
    const diffTime = Math.abs(this.processedAt.getTime() - this.requestDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// JSON 변환 시 가상 필드 포함
ApprovalSchema.set('toJSON', { virtuals: true });
ApprovalSchema.set('toObject', { virtuals: true });

// 미들웨어: 승인 상태 변경 시 처리 시간 자동 업데이트
ApprovalSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status !== 'pending') {
    this.processedAt = new Date();
  }
  next();
});

// 정적 메서드: 승인 대기 중인 요청 개수 조회
ApprovalSchema.statics.getPendingCount = function(centerId?: mongoose.Types.ObjectId) {
  const query: any = { status: 'pending' };
  if (centerId) {
    query.centerId = centerId;
  }
  return this.countDocuments(query);
};

// 정적 메서드: 우선순위별 승인 요청 개수 조회
ApprovalSchema.statics.getPriorityCounts = function(centerId?: mongoose.Types.ObjectId) {
  const query: any = { status: 'pending' };
  if (centerId) {
    query.centerId = centerId;
  }
  return this.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$priority',
        count: { $sum: 1 }
      }
    }
  ]);
};

// 인스턴스 메서드: 승인 처리
ApprovalSchema.methods.approve = function(processedBy: mongoose.Types.ObjectId, reason?: string) {
  this.status = 'approved';
  this.processedBy = processedBy;
  this.processedAt = new Date();
  if (reason) {
    this.reason = reason;
  }
  return this.save();
};

// 인스턴스 메서드: 거부 처리
ApprovalSchema.methods.reject = function(processedBy: mongoose.Types.ObjectId, reason: string) {
  this.status = 'rejected';
  this.processedBy = processedBy;
  this.processedAt = new Date();
  this.reason = reason;
  return this.save();
};

export const Approval = mongoose.model<IApproval>('Approval', ApprovalSchema);
export default Approval;
