/**
 * ⚖️ JJ Swim Lab - 강습 과정 관리 액션 로그 모델
 * 
 * 📋 **모델 목적**
 * - 강습 과정 활성화/비활성화 액션 기록
 * - 관리자 권한 남용 방지 및 투명성 확보
 * - 이의제기 및 심사 절차 지원
 * - 자동화된 품질 관리 시스템
 * 
 * 🔄 **주요 기능**
 * - 모든 강습 과정 상태 변경 로그 기록
 * - 비활성화 사유 및 증빙 자료 관리
 * - 사전 경고 시스템 및 개선 기간 관리
 * - 이의제기 절차 및 심사 결과 기록
 * 
 * 🗄️ **데이터 연동**
 * - Course 모델: 강습 과정 정보
 * - User 모델: 관리자 및 센터 정보
 * - Center 모델: 센터 정보
 * 
 * @date 2025-09-19
 * @author JJ Swim Lab
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface ICourseAction extends Document {
  courseId: mongoose.Types.ObjectId;
  centerId: mongoose.Types.ObjectId;
  actionType: 'activate' | 'deactivate' | 'suspend' | 'warning';
  actionBy: mongoose.Types.ObjectId; // 액션을 수행한 관리자
  
  // 비활성화 사유
  reason: {
    category: 'safety' | 'quality' | 'policy' | 'financial' | 'certification' | 'facility' | 'other';
    description: string;
    evidence?: string[]; // 증빙 자료 URL
  };
  
  // 경고 시스템
  warningLevel?: 1 | 2 | 3; // 1차, 2차, 최종 경고
  improvementPeriod?: {
    startDate: Date;
    endDate: Date;
    requirements: string[];
  };
  
  // 자동화 조건
  automaticTrigger?: {
    condition: 'satisfaction_low' | 'safety_incident' | 'document_missing' | 'payment_overdue' | 'certification_expired';
    value: number | string;
    threshold: number | string;
  };
  
  // 이의제기 절차
  appeal?: {
    submitted: boolean;
    submittedAt?: Date;
    submittedBy: mongoose.Types.ObjectId;
    reason: string;
    evidence?: string[];
    status: 'pending' | 'under_review' | 'approved' | 'rejected';
    reviewedAt?: Date;
    reviewedBy?: mongoose.Types.ObjectId;
    reviewResult?: string;
  };
  
  // 재활성화 조건
  reactivationConditions?: {
    requirements: string[];
    deadline?: Date;
    completed: boolean;
    completedAt?: Date;
  };
  
  // 시스템 메타데이터
  isActive: boolean;
  effectiveDate: Date;
  expiryDate?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const CourseActionSchema = new Schema<ICourseAction>({
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  centerId: {
    type: Schema.Types.ObjectId,
    ref: 'Center',
    required: true
  },
  actionType: {
    type: String,
    enum: ['activate', 'deactivate', 'suspend', 'warning'],
    required: true
  },
  actionBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  reason: {
    category: {
      type: String,
      enum: ['safety', 'quality', 'policy', 'financial', 'certification', 'facility', 'other'],
      required: true
    },
    description: {
      type: String,
      required: true,
      minlength: 50,
      maxlength: 1000
    },
    evidence: [{
      type: String // 파일 URL 또는 참조
    }]
  },
  
  warningLevel: {
    type: Number,
    enum: [1, 2, 3]
  },
  improvementPeriod: {
    startDate: Date,
    endDate: Date,
    requirements: [{
      type: String,
      required: true
    }]
  },
  
  automaticTrigger: {
    condition: {
      type: String,
      enum: ['satisfaction_low', 'safety_incident', 'document_missing', 'payment_overdue', 'certification_expired']
    },
    value: Schema.Types.Mixed,
    threshold: Schema.Types.Mixed
  },
  
  appeal: {
    submitted: {
      type: Boolean,
      default: false
    },
    submittedAt: Date,
    submittedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      maxlength: 1000
    },
    evidence: [{
      type: String
    }],
    status: {
      type: String,
      enum: ['pending', 'under_review', 'approved', 'rejected'],
      default: 'pending'
    },
    reviewedAt: Date,
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewResult: {
      type: String,
      maxlength: 1000
    }
  },
  
  reactivationConditions: {
    requirements: [{
      type: String,
      required: true
    }],
    deadline: Date,
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  effectiveDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: Date
  
}, {
  timestamps: true,
  collection: 'course_actions'
});

// 인덱스 설정
CourseActionSchema.index({ courseId: 1, actionType: 1, createdAt: -1 });
CourseActionSchema.index({ centerId: 1, actionType: 1 });
CourseActionSchema.index({ actionBy: 1, createdAt: -1 });
CourseActionSchema.index({ 'appeal.status': 1, 'appeal.submittedAt': -1 });

export const CourseAction = mongoose.model<ICourseAction>('CourseAction', CourseActionSchema);
