import mongoose, { Schema, Document } from 'mongoose';

export interface IQuiz extends Document {
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  type: 'multiple-choice' | 'essay';
  questions: Array<{
    question: string;
    type: 'multiple-choice' | 'essay';
    options?: string[]; // 4지선다용
    correctAnswer: string | string[]; // 4지선다: 정답 인덱스, 주관식: 정답 텍스트
    explanation?: string;
    points: number;
  }>;
  timeLimit?: number; // 분 단위
  passingScore: number;
  maxAttempts: number;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId[]; // 특정 사용자/그룹에게 할당
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const QuizSchema = new Schema<IQuiz>({
  title: { 
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
  difficulty: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced'], 
    default: 'beginner' 
  },
  type: { 
    type: String, 
    enum: ['multiple-choice', 'essay'], 
    required: true 
  },
  questions: [{
    question: { 
      type: String, 
      required: true, 
      trim: true 
    },
    type: { 
      type: String, 
      enum: ['multiple-choice', 'essay'], 
      required: true 
    },
    options: [{ 
      type: String, 
      trim: true 
    }], // 4지선다용
    correctAnswer: { 
      type: Schema.Types.Mixed, 
      required: true 
    }, // 4지선다: 정답 인덱스, 주관식: 정답 텍스트
    explanation: { 
      type: String, 
      trim: true 
    },
    points: { 
      type: Number, 
      required: true, 
      default: 1 
    }
  }],
  timeLimit: { 
    type: Number, 
    min: 1, 
    max: 180 
  }, // 분 단위, 최대 3시간
  passingScore: { 
    type: Number, 
    required: true, 
    min: 0, 
    max: 100 
  },
  maxAttempts: { 
    type: Number, 
    default: 3, 
    min: 1 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  assignedTo: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  tags: [{ 
    type: String, 
    trim: true 
  }]
}, { 
  timestamps: true 
});

// 인덱스 추가
QuizSchema.index({ title: 'text', description: 'text', category: 1 });
QuizSchema.index({ createdBy: 1, isActive: 1 });
QuizSchema.index({ difficulty: 1, category: 1 });

export const Quiz = mongoose.model<IQuiz>('Quiz', QuizSchema); 