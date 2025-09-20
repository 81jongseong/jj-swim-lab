/**
 * @file 로그인 로그 모델
 * @description 사용자 로그인 활동을 추적하는 모델입니다.
 * @date 2025-09-19
 * @author JJ Swim Lab
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface ILoginLog extends Document {
  userId: mongoose.Types.ObjectId;
  userType: 'student' | 'instructor' | 'centerAdmin' | 'superAdmin';
  loginTime: Date;
  logoutTime?: Date;
  ipAddress: string;
  userAgent: string;
  sessionDuration?: number; // seconds
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LoginLogSchema: Schema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userType: {
    type: String,
    enum: ['student', 'instructor', 'centerAdmin', 'superAdmin'],
    required: true
  },
  loginTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  logoutTime: {
    type: Date
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  sessionDuration: {
    type: Number // seconds
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// 인덱스 설정
LoginLogSchema.index({ userId: 1, loginTime: -1 });
LoginLogSchema.index({ loginTime: -1 });
LoginLogSchema.index({ userType: 1, loginTime: -1 });
LoginLogSchema.index({ isActive: 1, loginTime: -1 });

export const LoginLog = mongoose.model<ILoginLog>('LoginLog', LoginLogSchema);
