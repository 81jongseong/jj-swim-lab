import mongoose, { Document, Schema } from 'mongoose';

// AI 평가 기준 인터페이스
export interface IEvaluationCriteria extends Document {
  technique: string; // 'freestyle', 'backstroke', 'breaststroke', 'butterfly'
  level: string; // 'beginner', 'intermediate', 'advanced', 'expert'
  
  // 평가 카테고리별 기준
  categories: {
    posture: {
      weight: number; // 가중치 (0-1)
      subCategories: {
        bodyAlignment: { weight: number; criteria: string[]; };
        headPosition: { weight: number; criteria: string[]; };
        coreStability: { weight: number; criteria: string[]; };
      };
    };
    breathing: {
      weight: number;
      subCategories: {
        timing: { weight: number; criteria: string[]; };
        technique: { weight: number; criteria: string[]; };
        consistency: { weight: number; criteria: string[]; };
      };
    };
    movement: {
      weight: number;
      subCategories: {
        strokeTechnique: { weight: number; criteria: string[]; };
        rhythm: { weight: number; criteria: string[]; };
        coordination: { weight: number; criteria: string[]; };
      };
    };
    efficiency: {
      weight: number;
      subCategories: {
        power: { weight: number; criteria: string[]; };
        endurance: { weight: number; criteria: string[]; };
        speed: { weight: number; criteria: string[]; };
      };
    };
  };
  
  // 성과 지표 기준
  performanceMetrics: {
    speed: {
      beginner: { min: number; max: number; unit: string; };
      intermediate: { min: number; max: number; unit: string; };
      advanced: { min: number; max: number; unit: string; };
      expert: { min: number; max: number; unit: string; };
    };
    endurance: {
      beginner: { min: number; max: number; unit: string; };
      intermediate: { min: number; max: number; unit: string; };
      advanced: { min: number; max: number; unit: string; };
      expert: { min: number; max: number; unit: string; };
    };
    strokeCount: {
      beginner: { min: number; max: number; unit: string; };
      intermediate: { min: number; max: number; unit: string; };
      advanced: { min: number; max: number; unit: string; };
      expert: { min: number; max: number; unit: string; };
    };
    heartRate: {
      beginner: { min: number; max: number; unit: string; };
      intermediate: { min: number; max: number; unit: string; };
      advanced: { min: number; max: number; unit: string; };
      expert: { min: number; max: number; unit: string; };
    };
  };
  
  // 점수 계산 방식
  scoringMethod: {
    type: 'weighted' | 'threshold' | 'progressive';
    parameters: any;
  };
  
  // 피드백 템플릿
  feedbackTemplates: {
    excellent: string[];
    good: string[];
    average: string[];
    poor: string[];
  };
  
  // 개선 제안
  improvementSuggestions: {
    posture: string[];
    breathing: string[];
    movement: string[];
    efficiency: string[];
  };
  
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 운동 추천 인터페이스
export interface IExerciseRecommendation extends Document {
  technique: string;
  level: string;
  category: 'posture' | 'breathing' | 'movement' | 'efficiency';
  
  // 운동 정보
  exercises: {
    name: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    duration: number; // 분
    repetitions?: number;
    sets?: number;
    equipment: string[];
    instructions: string[];
    benefits: string[];
    precautions: string[];
  }[];
  
  // 운동 계획
  workoutPlan: {
    name: string;
    description: string;
    totalDuration: number; // 분
    exercises: {
      exerciseName: string;
      duration: number;
      order: number;
    }[];
    frequency: number; // 주당 횟수
    progression: {
      week1: any;
      week2: any;
      week3: any;
      week4: any;
    };
  }[];
  
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// AI 평가 결과 인터페이스
export interface IAIEvaluationResult extends Document {
  studentId: mongoose.Types.ObjectId;
  instructorId: mongoose.Types.ObjectId;
  technique: string;
  level: string;
  
  // 평가 입력 데이터
  inputData: {
    performanceMetrics: {
      speed?: number;
      endurance?: number;
      strokeCount?: number;
      heartRate?: number;
      distance?: number;
    };
    instructorObservations: {
      posture: number;
      breathing: number;
      movement: number;
      efficiency: number;
    };
  };
  
  // AI 분석 결과
  analysisResult: {
    overallScore: number; // 0-100
    categoryScores: {
      posture: number;
      breathing: number;
      movement: number;
      efficiency: number;
    };
    levelAssessment: string;
    strengths: string[];
    weaknesses: string[];
    improvementAreas: string[];
  };
  
  // 추천 사항
  recommendations: {
    exercises: {
      name: string;
      priority: 'high' | 'medium' | 'low';
      reason: string;
      duration: number;
    }[];
    workoutPlan: {
      name: string;
      description: string;
      duration: number;
      frequency: number;
    };
    nextEvaluationDate: Date;
  };
  
  // 피드백
  feedback: {
    summary: string;
    detailedFeedback: string;
    encouragement: string;
    goals: string[];
  };
  
  evaluationDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 평가 기준 스키마
const EvaluationCriteriaSchema = new Schema<IEvaluationCriteria>({
  technique: {
    type: String,
    required: true,
    enum: ['freestyle', 'backstroke', 'breaststroke', 'butterfly']
  },
  level: {
    type: String,
    required: true,
    enum: ['beginner', 'intermediate', 'advanced', 'expert']
  },
  categories: {
    posture: {
      weight: { type: Number, required: true, min: 0, max: 1 },
      subCategories: {
        bodyAlignment: {
          weight: { type: Number, required: true, min: 0, max: 1 },
          criteria: [{ type: String }]
        },
        headPosition: {
          weight: { type: Number, required: true, min: 0, max: 1 },
          criteria: [{ type: String }]
        },
        coreStability: {
          weight: { type: Number, required: true, min: 0, max: 1 },
          criteria: [{ type: String }]
        }
      }
    },
    breathing: {
      weight: { type: Number, required: true, min: 0, max: 1 },
      subCategories: {
        timing: {
          weight: { type: Number, required: true, min: 0, max: 1 },
          criteria: [{ type: String }]
        },
        technique: {
          weight: { type: Number, required: true, min: 0, max: 1 },
          criteria: [{ type: String }]
        },
        consistency: {
          weight: { type: Number, required: true, min: 0, max: 1 },
          criteria: [{ type: String }]
        }
      }
    },
    movement: {
      weight: { type: Number, required: true, min: 0, max: 1 },
      subCategories: {
        strokeTechnique: {
          weight: { type: Number, required: true, min: 0, max: 1 },
          criteria: [{ type: String }]
        },
        rhythm: {
          weight: { type: Number, required: true, min: 0, max: 1 },
          criteria: [{ type: String }]
        },
        coordination: {
          weight: { type: Number, required: true, min: 0, max: 1 },
          criteria: [{ type: String }]
        }
      }
    },
    efficiency: {
      weight: { type: Number, required: true, min: 0, max: 1 },
      subCategories: {
        power: {
          weight: { type: Number, required: true, min: 0, max: 1 },
          criteria: [{ type: String }]
        },
        endurance: {
          weight: { type: Number, required: true, min: 0, max: 1 },
          criteria: [{ type: String }]
        },
        speed: {
          weight: { type: Number, required: true, min: 0, max: 1 },
          criteria: [{ type: String }]
        }
      }
    }
  },
  performanceMetrics: {
    speed: {
      beginner: { min: Number, max: Number, unit: String },
      intermediate: { min: Number, max: Number, unit: String },
      advanced: { min: Number, max: Number, unit: String },
      expert: { min: Number, max: Number, unit: String }
    },
    endurance: {
      beginner: { min: Number, max: Number, unit: String },
      intermediate: { min: Number, max: Number, unit: String },
      advanced: { min: Number, max: Number, unit: String },
      expert: { min: Number, max: Number, unit: String }
    },
    strokeCount: {
      beginner: { min: Number, max: Number, unit: String },
      intermediate: { min: Number, max: Number, unit: String },
      advanced: { min: Number, max: Number, unit: String },
      expert: { min: Number, max: Number, unit: String }
    },
    heartRate: {
      beginner: { min: Number, max: Number, unit: String },
      intermediate: { min: Number, max: Number, unit: String },
      advanced: { min: Number, max: Number, unit: String },
      expert: { min: Number, max: Number, unit: String }
    }
  },
  scoringMethod: {
    type: { type: String, enum: ['weighted', 'threshold', 'progressive'], default: 'weighted' },
    parameters: Schema.Types.Mixed
  },
  feedbackTemplates: {
    excellent: [{ type: String }],
    good: [{ type: String }],
    average: [{ type: String }],
    poor: [{ type: String }]
  },
  improvementSuggestions: {
    posture: [{ type: String }],
    breathing: [{ type: String }],
    movement: [{ type: String }],
    efficiency: [{ type: String }]
  },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// 운동 추천 스키마
const ExerciseRecommendationSchema = new Schema<IExerciseRecommendation>({
  technique: {
    type: String,
    required: true,
    enum: ['freestyle', 'backstroke', 'breaststroke', 'butterfly']
  },
  level: {
    type: String,
    required: true,
    enum: ['beginner', 'intermediate', 'advanced', 'expert']
  },
  category: {
    type: String,
    required: true,
    enum: ['posture', 'breathing', 'movement', 'efficiency']
  },
  exercises: [{
    name: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
    duration: { type: Number, required: true },
    repetitions: Number,
    sets: Number,
    equipment: [{ type: String }],
    instructions: [{ type: String }],
    benefits: [{ type: String }],
    precautions: [{ type: String }]
  }],
  workoutPlan: [{
    name: { type: String, required: true },
    description: { type: String, required: true },
    totalDuration: { type: Number, required: true },
    exercises: [{
      exerciseName: { type: String, required: true },
      duration: { type: Number, required: true },
      order: { type: Number, required: true }
    }],
    frequency: { type: Number, required: true },
    progression: Schema.Types.Mixed
  }],
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// AI 평가 결과 스키마
const AIEvaluationResultSchema = new Schema<IAIEvaluationResult>({
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
  technique: {
    type: String,
    required: true,
    enum: ['freestyle', 'backstroke', 'breaststroke', 'butterfly']
  },
  level: {
    type: String,
    required: true,
    enum: ['beginner', 'intermediate', 'advanced', 'expert']
  },
  inputData: {
    performanceMetrics: {
      speed: Number,
      endurance: Number,
      strokeCount: Number,
      heartRate: Number,
      distance: Number
    },
    instructorObservations: {
      posture: { type: Number, required: true, min: 0, max: 100 },
      breathing: { type: Number, required: true, min: 0, max: 100 },
      movement: { type: Number, required: true, min: 0, max: 100 },
      efficiency: { type: Number, required: true, min: 0, max: 100 }
    }
  },
  analysisResult: {
    overallScore: { type: Number, required: true, min: 0, max: 100 },
    categoryScores: {
      posture: { type: Number, required: true, min: 0, max: 100 },
      breathing: { type: Number, required: true, min: 0, max: 100 },
      movement: { type: Number, required: true, min: 0, max: 100 },
      efficiency: { type: Number, required: true, min: 0, max: 100 }
    },
    levelAssessment: { type: String, required: true },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    improvementAreas: [{ type: String }]
  },
  recommendations: {
    exercises: [{
      name: { type: String, required: true },
      priority: { type: String, enum: ['high', 'medium', 'low'], required: true },
      reason: { type: String, required: true },
      duration: { type: Number, required: true }
    }],
    workoutPlan: {
      name: { type: String, required: true },
      description: { type: String, required: true },
      duration: { type: Number, required: true },
      frequency: { type: Number, required: true }
    },
    nextEvaluationDate: { type: Date, required: true }
  },
  feedback: {
    summary: { type: String, required: true },
    detailedFeedback: { type: String, required: true },
    encouragement: { type: String, required: true },
    goals: [{ type: String }]
  },
  evaluationDate: { type: Date, required: true }
}, {
  timestamps: true
});

// 인덱스 설정
EvaluationCriteriaSchema.index({ technique: 1, level: 1 }, { unique: true });
ExerciseRecommendationSchema.index({ technique: 1, level: 1, category: 1 });
AIEvaluationResultSchema.index({ studentId: 1, technique: 1, evaluationDate: -1 });

// 모델 생성
export const EvaluationCriteria = mongoose.model<IEvaluationCriteria>('EvaluationCriteria', EvaluationCriteriaSchema);
export const ExerciseRecommendation = mongoose.model<IExerciseRecommendation>('ExerciseRecommendation', ExerciseRecommendationSchema);
export const AIEvaluationResult = mongoose.model<IAIEvaluationResult>('AIEvaluationResult', AIEvaluationResultSchema);