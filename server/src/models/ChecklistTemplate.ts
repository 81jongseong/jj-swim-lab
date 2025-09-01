import mongoose, { Schema, Document } from 'mongoose';

export interface IChecklistTemplateItem extends Document {
  stepName: string;
  stepOrder: number;
  category: string;
  difficulty: string; // 커스텀 난이도 (기초, 초급, 중급, 상급, 마스터 등)
  tips: string;
  teachingMethodId: mongoose.Types.ObjectId;
  isRequired: boolean; // 필수 항목 여부
  prerequisites: string[]; // 선행 조건 (예: "자유형 기초 완료")
  healthRestrictions: string[]; // 건강상 제한사항 (예: "허리질환", "어깨부상")
  alternativeSteps: string[]; // 대체 동작 (예: "평영 대신 자유형")
}

export interface IChecklistTemplate extends Document {
  name: string; // 템플릿 이름 (예: "센터A 초급 과정")
  creatorId: mongoose.Types.ObjectId; // 생성자 ID (센터 또는 강사)
  creatorType: 'center' | 'instructor'; // 생성자 타입
  centerId?: mongoose.Types.ObjectId; // 센터 ID (강사가 생성한 경우)
  levels: string[]; // 커스텀 레벨 (예: ["기초", "초급", "중급", "상급", "마스터"])
  items: IChecklistTemplateItem[]; // 체크리스트 항목들
  isActive: boolean;
  isPublic: boolean; // 다른 센터/강사가 사용 가능한지
  description: string; // 템플릿 설명
  tags: string[]; // 태그 (예: ["초급자", "건강관리", "안전"])
}

const ChecklistTemplateItemSchema = new Schema<IChecklistTemplateItem>({
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
    required: true,
    trim: true
  },
  difficulty: {
    type: String,
    required: true,
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
  isRequired: {
    type: Boolean,
    default: true
  },
  prerequisites: [{
    type: String,
    trim: true
  }],
  healthRestrictions: [{
    type: String,
    trim: true
  }],
  alternativeSteps: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

const ChecklistTemplateSchema = new Schema<IChecklistTemplate>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  creatorId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  creatorType: {
    type: String,
    enum: ['center', 'instructor'],
    required: true
  },
  centerId: {
    type: Schema.Types.ObjectId,
    ref: 'Center'
  },
  levels: [{
    type: String,
    required: true,
    trim: true
  }],
  items: {
    type: [ChecklistTemplateItemSchema],
    default: []
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// 생성자별로 템플릿 이름 유니크
ChecklistTemplateSchema.index({ creatorId: 1, name: 1 }, { unique: true });

export const ChecklistTemplate = mongoose.model<IChecklistTemplate>('ChecklistTemplate', ChecklistTemplateSchema);






