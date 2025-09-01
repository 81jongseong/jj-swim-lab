import mongoose, { Document, Schema } from 'mongoose';

// AI 분석 결과 인터페이스
export interface IAIAnalysis extends Document {
  studentId: mongoose.Types.ObjectId;
  instructorId: mongoose.Types.ObjectId;
  analysisType: 'posture' | 'progress' | 'recommendation' | 'performance';
  
  // 수영 자세 분석
  postureAnalysis?: {
    technique: string; // 'freestyle', 'backstroke', 'breaststroke', 'butterfly'
    score: number; // 0-100점
    strengths: string[];
    improvements: string[];
    detailedFeedback: string;
  };
  
  // 진도 예측
  progressPrediction?: {
    currentLevel: string;
    predictedNextLevel: string;
    estimatedWeeks: number;
    confidence: number; // 0-1
    factors: string[];
  };
  
  // 개인화 추천
  personalizedRecommendation?: {
    recommendedExercises: string[];
    focusAreas: string[];
    difficultyAdjustment: 'easier' | 'same' | 'harder';
    estimatedImprovement: string;
  };
  
  // 성과 분석
  performanceAnalysis?: {
    overallScore: number;
    improvementRate: number;
    consistencyScore: number;
    recommendations: string[];
  };
  
  // 메타데이터
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

const AIAnalysisSchema = new Schema<IAIAnalysis>({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  instructorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  analysisType: {
    type: String,
    enum: ['posture', 'progress', 'recommendation', 'performance'],
    required: true
  },
  
  // 수영 자세 분석
  postureAnalysis: {
    technique: {
      type: String,
      enum: ['freestyle', 'backstroke', 'breaststroke', 'butterfly']
    },
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    strengths: [String],
    improvements: [String],
    detailedFeedback: String
  },
  
  // 진도 예측
  progressPrediction: {
    currentLevel: String,
    predictedNextLevel: String,
    estimatedWeeks: Number,
    confidence: {
      type: Number,
      min: 0,
      max: 1
    },
    factors: [String]
  },
  
  // 개인화 추천
  personalizedRecommendation: {
    recommendedExercises: [String],
    focusAreas: [String],
    difficultyAdjustment: {
      type: String,
      enum: ['easier', 'same', 'harder']
    },
    estimatedImprovement: String
  },
  
  // 성과 분석
  performanceAnalysis: {
    overallScore: Number,
    improvementRate: Number,
    consistencyScore: Number,
    recommendations: [String]
  },
  
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// 복합 인덱스
AIAnalysisSchema.index({ studentId: 1, analysisType: 1, createdAt: -1 });
AIAnalysisSchema.index({ instructorId: 1, analysisType: 1 });

export const AIAnalysis = mongoose.model<IAIAnalysis>('AIAnalysis', AIAnalysisSchema);
