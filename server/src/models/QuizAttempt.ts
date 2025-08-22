import mongoose, { Schema, Document } from 'mongoose';

export interface IQuizAttempt extends Document {
  quizId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  answers: Array<{
    questionIndex: number;
    selectedAnswer: string | number;
    isCorrect: boolean;
    pointsEarned: number;
    timeSpent: number;
  }>;
  totalScore: number;
  maxPossibleScore: number;
  percentage: number;
  passed: boolean;
  timeSpent: number; // 총 소요 시간 (초)
  completedAt: Date;
  startedAt: Date;
}

const QuizAttemptSchema = new Schema<IQuizAttempt>({
  quizId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Quiz', 
    required: true 
  },
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  answers: [{
    questionIndex: { 
      type: Number, 
      required: true 
    },
    selectedAnswer: { 
      type: Schema.Types.Mixed, 
      required: true 
    },
    isCorrect: { 
      type: Boolean, 
      required: true 
    },
    pointsEarned: { 
      type: Number, 
      required: true 
    },
    timeSpent: { 
      type: Number, 
      default: 0 
    }
  }],
  totalScore: { 
    type: Number, 
    required: true 
  },
  maxPossibleScore: { 
    type: Number, 
    required: true 
  },
  percentage: { 
    type: Number, 
    required: true 
  },
  passed: { 
    type: Boolean, 
    required: true 
  },
  timeSpent: { 
    type: Number, 
    required: true 
  },
  completedAt: { 
    type: Date, 
    required: true 
  },
  startedAt: { 
    type: Date, 
    default: Date.now 
  }
}, { 
  timestamps: true 
});

// 인덱스 추가
QuizAttemptSchema.index({ quizId: 1, userId: 1 });
QuizAttemptSchema.index({ userId: 1, completedAt: -1 });
QuizAttemptSchema.index({ quizId: 1, completedAt: -1 });

export default mongoose.model<IQuizAttempt>('QuizAttempt', QuizAttemptSchema);

