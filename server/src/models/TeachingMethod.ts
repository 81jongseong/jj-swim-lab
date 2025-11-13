import mongoose, { Schema, Document } from 'mongoose';

export interface ITeachingMethod extends Document {
  name: string;
  description: string;
  category: string;
  level: string; // 자유로운 레벨 설정 (입문, 기초, 초급, 중급, 상급, 마스터 등)
  steps: string[];
  tips: string[];
  checklist: string[]; // 체크리스트 필드 추가
  videoUrl?: string;
  imageUrl?: string;
  createdBy?: mongoose.Types.ObjectId;
  createdByRole?: string; // 생성자 역할 (superAdmin, instructor, centerAdmin)
  isActive: boolean;
  order?: number; // 순서 정보 추가
  instructorComments?: string; // 강사 코멘트
  overridesSuperAdminMethod?: boolean; // 최고 관리자 강습법을 대체하는지 여부
  originalSuperAdminMethodId?: mongoose.Types.ObjectId; // 대체하는 원본 최고 관리자 강습법 ID
  levelChangeHistory?: Array<{ // 레벨 변경 이력
    fromLevel: string;
    toLevel: string;
    changedBy: mongoose.Types.ObjectId;
    changedAt: Date;
    reason?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const TeachingMethodSchema = new Schema<ITeachingMethod>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  level: {
    type: String,
    required: true,
    trim: true,
    default: '초급'
  },
  steps: [{
    type: String,
    trim: true
  }],
  tips: [{
    type: String,
    trim: true
  }],
  checklist: [{
    type: String,
    trim: true
  }],
  videoUrl: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
    trim: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  createdByRole: {
    type: String,
    enum: ['superAdmin', 'instructor', 'centerAdmin'],
    required: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  overridesSuperAdminMethod: {
    type: Boolean,
    default: false
  },
  originalSuperAdminMethodId: {
    type: Schema.Types.ObjectId,
    ref: 'TeachingMethod',
    required: false
  },
  order: {
    type: Number,
    default: 0
  },
  instructorComments: {
    type: String,
    trim: true
  },
  levelChangeHistory: [{
    fromLevel: {
      type: String,
      required: true
    },
    toLevel: {
      type: String,
      required: true
    },
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    reason: {
      type: String,
      trim: true
    }
  }]
}, {
  timestamps: true
});

export const TeachingMethod = mongoose.model<ITeachingMethod>('TeachingMethod', TeachingMethodSchema);

