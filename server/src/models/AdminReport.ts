/**
 * @file 관리자 리포트 모델
 * @description 시스템 이슈, 버그 신고, 기능 요청 등을 관리하는 모델입니다.
 * @date 2025-09-19
 * @author JJ Swim Lab
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IAdminReport extends Document {
  title: string;
  description: string;
  type: 'bug' | 'feature' | 'complaint' | 'suggestion';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reportedBy: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  centerId?: mongoose.Types.ObjectId;
  category?: string;
  tags?: string[];
  attachments?: string[];
  resolution?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AdminReportSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  type: {
    type: String,
    required: true,
    enum: ['bug', 'feature', 'complaint', 'suggestion']
  },
  status: {
    type: String,
    required: true,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  },
  priority: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  centerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Center'
  },
  category: {
    type: String,
    maxlength: 100
  },
  tags: [{
    type: String,
    maxlength: 50
  }],
  attachments: [{
    type: String,
    maxlength: 500
  }],
  resolution: {
    type: String,
    maxlength: 1000
  },
  resolvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// 인덱스 설정
AdminReportSchema.index({ status: 1, priority: -1 });
AdminReportSchema.index({ type: 1, createdAt: -1 });
AdminReportSchema.index({ reportedBy: 1, createdAt: -1 });
AdminReportSchema.index({ assignedTo: 1, status: 1 });

export const AdminReport = mongoose.model<IAdminReport>('AdminReport', AdminReportSchema);
