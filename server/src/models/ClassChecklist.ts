import mongoose, { Schema, Document } from 'mongoose';

export interface IClassChecklistItem extends Document {
  stepName: string;
  stepOrder: number;
  category?: string;
  difficulty?: string; // 커스텀 난이도 (기초, 초급, 중급, 상급, 마스터 등)
  tips?: string;
  teachingMethodId: mongoose.Types.ObjectId;
  instructorMessage?: string; // 강사/센터가 추가하는 메시지
  messageUpdatedAt?: Date; // 메시지 업데이트 시간
  isCompleted?: boolean; // 완료 상태
}

export interface IClassChecklist extends Document {
  classId: string | mongoose.Types.ObjectId; // 반 ID (문자열 또는 ObjectId 허용)
  level?: string; // 기존 레벨 (beginner, intermediate, advanced) - 호환성 유지
  templateId?: mongoose.Types.ObjectId; // 체크리스트 템플릿 ID (선택사항)
  customLevel?: string; // 커스텀 레벨 (예: "기초", "초급", "중급", "상급", "마스터")
  items: IClassChecklistItem[]; // 체크리스트 항목들 (템플릿 기반)
  hiddenItems: string[]; // 숨겨진 항목 ID들 (개인레슨 등에서 사용)
  customItems: IClassChecklistItem[]; // 추가된 커스텀 항목들
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ClassChecklistItemSchema = new Schema<IClassChecklistItem>({
  stepName: {
    type: String,
    required: true,
    trim: true
  },
  stepOrder: {
    type: Number,
    required: true,
    default: 0
  },
  category: {
    type: String,
    trim: true
  },
  difficulty: {
    type: String,
    trim: true
  },
  tips: {
    type: String,
    trim: true
  },
  teachingMethodId: {
    type: Schema.Types.ObjectId,
    ref: 'TeachingMethod',
    required: true
  },
  instructorMessage: {
    type: String,
    trim: true
  },
  messageUpdatedAt: {
    type: Date
  },
  isCompleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const ClassChecklistSchema = new Schema<IClassChecklist>({
  classId: {
    type: Schema.Types.Mixed, // 문자열 또는 ObjectId 허용
    required: true
  },
  level: {
    type: String,
    trim: true
  },
  templateId: {
    type: Schema.Types.ObjectId,
    ref: 'ChecklistTemplate'
  },
  customLevel: {
    type: String,
    trim: true
  },
  items: {
    type: [ClassChecklistItemSchema],
    default: []
  },
  hiddenItems: [{
    type: String
  }],
  customItems: {
    type: [ClassChecklistItemSchema],
    default: []
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// 반 ID로 유니크 인덱스 생성 (템플릿 기반이므로 레벨은 제거)
ClassChecklistSchema.index({ classId: 1 }, { unique: true });

export const ClassChecklist = mongoose.model<IClassChecklist>('ClassChecklist', ClassChecklistSchema);
