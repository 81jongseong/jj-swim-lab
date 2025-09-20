/**
 * @file 페이지 방문 로그 모델
 * @description 사용자의 페이지 방문을 추적하는 모델입니다.
 * @date 2025-09-19
 * @author JJ Swim Lab
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IPageVisit extends Document {
  userId?: mongoose.Types.ObjectId;
  userType?: 'student' | 'instructor' | 'centerAdmin' | 'superAdmin' | 'guest';
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  statusCode: number;
  responseTime: number; // milliseconds
  ipAddress: string;
  userAgent: string;
  referrer?: string;
  visitTime: Date;
  sessionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PageVisitSchema: Schema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  userType: {
    type: String,
    enum: ['student', 'instructor', 'centerAdmin', 'superAdmin', 'guest']
  },
  path: {
    type: String,
    required: true,
    maxlength: 500
  },
  method: {
    type: String,
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    default: 'GET'
  },
  statusCode: {
    type: Number,
    required: true
  },
  responseTime: {
    type: Number,
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  referrer: {
    type: String,
    maxlength: 500
  },
  visitTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  sessionId: {
    type: String,
    maxlength: 100
  }
}, {
  timestamps: true
});

// 인덱스 설정
PageVisitSchema.index({ path: 1, visitTime: -1 });
PageVisitSchema.index({ userId: 1, visitTime: -1 });
PageVisitSchema.index({ visitTime: -1 });
PageVisitSchema.index({ userType: 1, visitTime: -1 });

export const PageVisit = mongoose.model<IPageVisit>('PageVisit', PageVisitSchema);
