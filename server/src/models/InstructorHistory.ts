/**
 * 👨‍🏫 JJ Swim Lab - 강사 이력 관리 모델
 * 
 * 📋 **모델 목적**
 * - 강사의 근무 이력을 불변성으로 관리
 * - 자격증 정보 및 검증 상태 추적
 * - 센터별 강사 검색 및 조회 지원
 * - 이력 변조 방지 및 감사 추적
 */

import mongoose, { Document, Schema } from 'mongoose';

// 강사 근무 이력 인터페이스
export interface IInstructorWorkHistory extends Document {
  instructorId: mongoose.Types.ObjectId;
  centerId: mongoose.Types.ObjectId;
  position: string;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  workType: 'fulltime' | 'parttime' | 'contract' | 'volunteer';
  responsibilities: string[];
  achievements: string[];
  
  // 불변성 보장 필드
  createdAt: Date;
  createdBy: mongoose.Types.ObjectId;
  hashValue: string; // 데이터 무결성 검증용 해시
  previousHash?: string; // 이전 이력과의 연결 해시
  isVerified: boolean;
  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
  
  // 수정 불가 필드 (한번 저장되면 변경 불가)
  readonly: boolean;
}

// 강사 자격증 인터페이스
export interface IInstructorCertification extends Document {
  instructorId: mongoose.Types.ObjectId;
  certificationType: 'lifeguard' | 'sports_instructor' | 'swimming_coach' | 'first_aid' | 'other';
  certificationName: string;
  certificationNumber: string;
  issuingOrganization: string;
  issueDate: Date;
  expiryDate?: Date;
  isValid: boolean;
  
  // 검증 정보
  verificationStatus: 'pending' | 'verified' | 'rejected' | 'expired';
  verificationMethod: 'manual' | 'api' | 'document';
  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
  verificationNotes?: string;
  
  // 문서 첨부
  documentUrl?: string;
  documentHash?: string;
  
  // 불변성 보장
  createdAt: Date;
  updatedAt: Date;
  readonly: boolean;
}

// 자격증 타입 정의
export const CERTIFICATION_TYPES = {
  lifeguard: {
    name: '인명구조원',
    issuingOrgs: ['대한적십자사', '대한수상안전협회', '한국수영장협회'],
    validityPeriod: 2, // 년
    required: true
  },
  sports_instructor: {
    name: '생활체육지도사',
    issuingOrgs: ['국민체육진흥공단', '대한체육회'],
    validityPeriod: null, // 평생
    required: true
  },
  swimming_coach: {
    name: '수영지도자',
    issuingOrgs: ['대한수영연맹', '한국수영장협회'],
    validityPeriod: 3,
    required: false
  },
  first_aid: {
    name: '응급처치',
    issuingOrgs: ['대한적십자사', '대한심폐소생협회'],
    validityPeriod: 2,
    required: true
  }
};

// 강사 근무 이력 스키마
const instructorWorkHistorySchema = new Schema<IInstructorWorkHistory>({
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
  position: {
    type: String,
    required: true,
    enum: ['수영강사', '헬스트레이너', '아쿠아로빅강사', '다이빙강사', '수영부코치', '기타']
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  workType: {
    type: String,
    enum: ['fulltime', 'parttime', 'contract', 'volunteer'],
    required: true
  },
  responsibilities: [{
    type: String
  }],
  achievements: [{
    type: String
  }],
  
  // 불변성 보장 필드
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true // Mongoose 불변 필드
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    immutable: true
  },
  hashValue: {
    type: String,
    required: true,
    immutable: true
  },
  previousHash: {
    type: String,
    immutable: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: {
    type: Date
  },
  readonly: {
    type: Boolean,
    default: true,
    immutable: true
  }
}, {
  timestamps: false, // 수동으로 관리
  collection: 'instructor_work_histories'
});

// 강사 자격증 스키마
const instructorCertificationSchema = new Schema<IInstructorCertification>({
  instructorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  certificationType: {
    type: String,
    enum: ['lifeguard', 'sports_instructor', 'swimming_coach', 'first_aid', 'other'],
    required: true
  },
  certificationName: {
    type: String,
    required: true
  },
  certificationNumber: {
    type: String,
    required: true,
    unique: true
  },
  issuingOrganization: {
    type: String,
    required: true
  },
  issueDate: {
    type: Date,
    required: true
  },
  expiryDate: {
    type: Date
  },
  isValid: {
    type: Boolean,
    default: true
  },
  
  // 검증 정보
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'expired'],
    default: 'pending'
  },
  verificationMethod: {
    type: String,
    enum: ['manual', 'api', 'document'],
    default: 'manual'
  },
  verifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: {
    type: Date
  },
  verificationNotes: {
    type: String
  },
  
  // 문서 첨부
  documentUrl: {
    type: String
  },
  documentHash: {
    type: String
  },
  
  // 불변성 보장
  readonly: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'instructor_certifications'
});

// 이력 수정 방지 미들웨어
instructorWorkHistorySchema.pre('findOneAndUpdate', function() {
  throw new Error('근무 이력은 수정할 수 없습니다. 새로운 이력을 추가해주세요.');
});

instructorWorkHistorySchema.pre('updateOne', function() {
  throw new Error('근무 이력은 수정할 수 없습니다. 새로운 이력을 추가해주세요.');
});

instructorWorkHistorySchema.pre('updateMany', function() {
  throw new Error('근무 이력은 수정할 수 없습니다.');
});

// 자격증 수정 제한 미들웨어
instructorCertificationSchema.pre('findOneAndUpdate', function() {
  const update = this.getUpdate() as any;
  
  // 특정 필드만 수정 허용
  const allowedFields = ['verificationStatus', 'verifiedBy', 'verifiedAt', 'verificationNotes', 'isValid'];
  const updateFields = Object.keys(update.$set || update);
  
  const hasRestrictedFields = updateFields.some(field => !allowedFields.includes(field));
  
  if (hasRestrictedFields) {
    throw new Error('자격증 기본 정보는 수정할 수 없습니다. 검증 상태만 변경 가능합니다.');
  }
});

// 해시 생성 메서드
instructorWorkHistorySchema.methods.generateHash = function() {
  const crypto = require('crypto');
  const data = `${this.instructorId}${this.centerId}${this.position}${this.startDate}${this.workType}`;
  return crypto.createHash('sha256').update(data).digest('hex');
};

// 이력 검증 메서드
instructorWorkHistorySchema.methods.verifyIntegrity = function() {
  const expectedHash = this.generateHash();
  return this.hashValue === expectedHash;
};

// 자격증 만료 확인 메서드
instructorCertificationSchema.methods.isExpired = function() {
  if (!this.expiryDate) return false;
  return new Date() > this.expiryDate;
};

// 자격증 검증 메서드
instructorCertificationSchema.methods.shouldRenew = function() {
  if (!this.expiryDate) return false;
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  return this.expiryDate <= thirtyDaysFromNow;
};

// 인덱스 설정
instructorWorkHistorySchema.index({ instructorId: 1, centerId: 1 });
instructorWorkHistorySchema.index({ centerId: 1, isActive: 1 });
instructorWorkHistorySchema.index({ createdAt: 1 });
instructorWorkHistorySchema.index({ hashValue: 1 }, { unique: true });

instructorCertificationSchema.index({ instructorId: 1, certificationType: 1 });
instructorCertificationSchema.index({ certificationNumber: 1 }, { unique: true });
instructorCertificationSchema.index({ issuingOrganization: 1 });
instructorCertificationSchema.index({ expiryDate: 1 });
instructorCertificationSchema.index({ verificationStatus: 1 });

// 정적 메서드들
instructorWorkHistorySchema.statics.createNewHistory = async function(historyData: any, createdBy: string) {
  const crypto = require('crypto');
  
  // 이전 이력의 해시 조회
  const lastHistory = await this.findOne({ instructorId: historyData.instructorId })
    .sort({ createdAt: -1 });
  
  // 새 이력 데이터 준비
  const newHistoryData = {
    ...historyData,
    createdBy,
    previousHash: lastHistory?.hashValue,
    readonly: true
  };
  
  // 해시 생성
  const hashData = `${newHistoryData.instructorId}${newHistoryData.centerId}${newHistoryData.position}${newHistoryData.startDate}${newHistoryData.workType}`;
  newHistoryData.hashValue = crypto.createHash('sha256').update(hashData).digest('hex');
  
  return this.create(newHistoryData);
};

instructorCertificationSchema.statics.findByCenterAndType = async function(centerId: string, certificationType?: string) {
  const pipeline = [
    // 1. 해당 센터의 활성 강사들 조회
    {
      $lookup: {
        from: 'instructor_work_histories',
        localField: 'instructorId',
        foreignField: 'instructorId',
        as: 'workHistory'
      }
    },
    // 2. 해당 센터에서 근무 중인 강사만 필터링
    {
      $match: {
        'workHistory': {
          $elemMatch: {
            centerId: new mongoose.Types.ObjectId(centerId),
            isActive: true
          }
        }
      }
    },
    // 3. 자격증 타입 필터 (옵션)
    ...(certificationType ? [{ $match: { certificationType } }] : []),
    // 4. 강사 정보 조인
    {
      $lookup: {
        from: 'users',
        localField: 'instructorId',
        foreignField: '_id',
        as: 'instructor'
      }
    },
    // 5. 센터 정보 조인
    {
      $lookup: {
        from: 'centers',
        localField: 'workHistory.centerId',
        foreignField: '_id',
        as: 'center'
      }
    },
    // 6. 결과 정리
    {
      $project: {
        instructorName: { $arrayElemAt: ['$instructor.name', 0] },
        instructorEmail: { $arrayElemAt: ['$instructor.email', 0] },
        certificationType: 1,
        certificationName: 1,
        certificationNumber: 1,
        issuingOrganization: 1,
        issueDate: 1,
        expiryDate: 1,
        verificationStatus: 1,
        isValid: 1,
        isExpired: {
          $cond: {
            if: { $and: [{ $ne: ['$expiryDate', null] }, { $lt: ['$expiryDate', new Date()] }] },
            then: true,
            else: false
          }
        }
      }
    }
  ];
  
  return this.aggregate(pipeline);
};

// 강사 근무 이력 모델
export const InstructorWorkHistory = mongoose.model<IInstructorWorkHistory>(
  'InstructorWorkHistory',
  instructorWorkHistorySchema
);

// 강사 자격증 모델
export const InstructorCertification = mongoose.model<IInstructorCertification>(
  'InstructorCertification',
  instructorCertificationSchema
);

export default {
  InstructorWorkHistory,
  InstructorCertification,
  CERTIFICATION_TYPES
};
