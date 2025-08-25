import mongoose, { Schema, Document } from 'mongoose';

export interface IStudentProgressItem extends Document {
  stepName: string;
  stepOrder: number;
  isCompleted: boolean;
  completedAt?: Date;
  instructorNotes?: string;
  studentNotes?: string;
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  tips?: string;
}

export interface IStudentProgress extends Document {
  studentId: mongoose.Types.ObjectId; // 학생 ID
  classId: mongoose.Types.ObjectId; // 반 ID
  classChecklistId: mongoose.Types.ObjectId; // 반 체크리스트 ID
  items: IStudentProgressItem[]; // 학생별 진행도
  overallProgress: number; // 전체 진행률
  lastUpdated: Date;
  startDate: Date;
  targetCompletionDate?: Date;
  status: 'active' | 'completed' | 'paused';
  notes?: string;
}

const StudentProgressItemSchema = new Schema<IStudentProgressItem>({
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
  instructorNotes: {
    type: String,
    trim: true
  },
  studentNotes: {
    type: String,
    trim: true
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
  }
}, {
  timestamps: true
});

const StudentProgressSchema = new Schema<IStudentProgress>({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  classId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  classChecklistId: {
    type: Schema.Types.ObjectId,
    ref: 'ClassChecklist',
    required: true
  },
  items: {
    type: [StudentProgressItemSchema],
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
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// 학생과 반으로 유니크 인덱스 생성
StudentProgressSchema.index({ studentId: 1, classId: 1 }, { unique: true });

export const StudentProgress = mongoose.model<IStudentProgress>('StudentProgress', StudentProgressSchema);
