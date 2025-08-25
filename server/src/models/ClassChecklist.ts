import mongoose, { Schema, Document } from 'mongoose';

export interface IClassChecklistItem extends Document {
  stepName: string;
  stepOrder: number;
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  tips?: string;
  teachingMethodId: mongoose.Types.ObjectId;
}

export interface IClassChecklist extends Document {
  classId: mongoose.Types.ObjectId; // 반 ID
  level: 'beginner' | 'intermediate' | 'advanced'; // 반 레벨
  items: IClassChecklistItem[]; // 표준 체크리스트 항목들
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
    enum: ['beginner', 'intermediate', 'advanced']
  },
  tips: {
    type: String,
    trim: true
  },
  teachingMethodId: {
    type: Schema.Types.ObjectId,
    ref: 'TeachingMethod',
    required: true
  }
}, {
  timestamps: true
});

const ClassChecklistSchema = new Schema<IClassChecklist>({
  classId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  items: {
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

// 반 ID와 레벨로 유니크 인덱스 생성
ClassChecklistSchema.index({ classId: 1, level: 1 }, { unique: true });

export const ClassChecklist = mongoose.model<IClassChecklist>('ClassChecklist', ClassChecklistSchema);
