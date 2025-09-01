import mongoose, { Schema, Document } from 'mongoose';

export interface IChecklistItem extends Document {
  teachingMethodId: mongoose.Types.ObjectId;
  stepName: string;
  stepOrder: number;
  isCompleted: boolean;
  completedAt?: Date;
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  tips?: string;
  notes?: string;
  instructorNotes?: string;
}

export interface IChecklist extends Document {
  studentId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  instructorId: mongoose.Types.ObjectId;
  // teachingMethodId 제거 - items에 이미 포함되어 있음
  items: IChecklistItem[];
  overallProgress: number;
  lastUpdated: Date;
  startDate: Date;
  targetCompletionDate?: Date;
  status: 'active' | 'completed' | 'paused';
  completedAt?: Date;
  notes?: string;
}

const ChecklistItemSchema = new Schema<IChecklistItem>({
  teachingMethodId: {
    type: Schema.Types.ObjectId,
    ref: 'TeachingMethod',
    required: false
  },
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
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
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
  notes: {
    type: String,
    trim: true
  },
  instructorNotes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

const ChecklistSchema = new Schema<IChecklist>({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  instructorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // teachingMethodId 제거 - items에 이미 포함되어 있음
  items: {
    type: [ChecklistItemSchema],
    default: []
  },
  overallProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  targetCompletionDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused'],
    default: 'active'
  },
  completedAt: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// 인덱스 설정
ChecklistSchema.index({ studentId: 1, courseId: 1 });
ChecklistSchema.index({ instructorId: 1, status: 1 });
ChecklistSchema.index({ lastUpdated: -1 });

// 진행률 자동 계산 미들웨어
ChecklistSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    const completedItems = this.items.filter(item => item.isCompleted).length;
    this.overallProgress = Math.round((completedItems / this.items.length) * 100);
  }
  this.lastUpdated = new Date();
  next();
});

export const Checklist = mongoose.model<IChecklist>('Checklist', ChecklistSchema);
