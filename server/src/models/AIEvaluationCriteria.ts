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
    distance: {
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
  };
  
  // AI 분석 설정
  aiSettings: {
    confidenceThreshold: number; // 신뢰도 임계값
    analysisDepth: 'basic' | 'intermediate' | 'advanced';
    feedbackStyle: 'encouraging' | 'technical' | 'balanced';
    language: string;
  };
  
  // 메타데이터
  isActive: boolean;
  version: string;
  createdBy: mongoose.Types.ObjectId;
  centerId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// AI 평가 결과 인터페이스
export interface IAIEvaluationResult extends Document {
  studentId: mongoose.Types.ObjectId;
  technique: string;
  level: string;
  
  // 분석 결과
  analysis: {
    posture: {
      score: number;
      details: {
        bodyAlignment: { score: number; feedback: string; };
        headPosition: { score: number; feedback: string; };
        coreStability: { score: number; feedback: string; };
      };
    };
    breathing: {
      score: number;
      details: {
        timing: { score: number; feedback: string; };
        technique: { score: number; feedback: string; };
        consistency: { score: number; feedback: string; };
      };
    };
    movement: {
      score: number;
      details: {
        strokeTechnique: { score: number; feedback: string; };
        rhythm: { score: number; feedback: string; };
        coordination: { score: number; feedback: string; };
      };
    };
    efficiency: {
      score: number;
      details: {
        power: { score: number; feedback: string; };
        endurance: { score: number; feedback: string; };
        speed: { score: number; feedback: string; };
      };
    };
  };
  
  // 성과 지표
  performance: {
    speed: { value: number; unit: string; };
    distance: { value: number; unit: string; };
    strokeCount: { value: number; unit: string; };
  };
  
  // 종합 점수
  overallScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  
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
      beginner: {
        min: { type: Number, required: true },
        max: { type: Number, required: true },
        unit: { type: String, required: true, default: 'm/s' }
      },
      intermediate: {
        min: { type: Number, required: true },
        max: { type: Number, required: true },
        unit: { type: String, required: true, default: 'm/s' }
      },
      advanced: {
        min: { type: Number, required: true },
        max: { type: Number, required: true },
        unit: { type: String, required: true, default: 'm/s' }
      },
      expert: {
        min: { type: Number, required: true },
        max: { type: Number, required: true },
        unit: { type: String, required: true, default: 'm/s' }
      }
    },
    distance: {
      beginner: {
        min: { type: Number, required: true },
        max: { type: Number, required: true },
        unit: { type: String, required: true, default: 'm' }
      },
      intermediate: {
        min: { type: Number, required: true },
        max: { type: Number, required: true },
        unit: { type: String, required: true, default: 'm' }
      },
      advanced: {
        min: { type: Number, required: true },
        max: { type: Number, required: true },
        unit: { type: String, required: true, default: 'm' }
      },
      expert: {
        min: { type: Number, required: true },
        max: { type: Number, required: true },
        unit: { type: String, required: true, default: 'm' }
      }
    },
    strokeCount: {
      beginner: {
        min: { type: Number, required: true },
        max: { type: Number, required: true },
        unit: { type: String, required: true, default: 'strokes' }
      },
      intermediate: {
        min: { type: Number, required: true },
        max: { type: Number, required: true },
        unit: { type: String, required: true, default: 'strokes' }
      },
      advanced: {
        min: { type: Number, required: true },
        max: { type: Number, required: true },
        unit: { type: String, required: true, default: 'strokes' }
      },
      expert: {
        min: { type: Number, required: true },
        max: { type: Number, required: true },
        unit: { type: String, required: true, default: 'strokes' }
      }
    }
  },
  aiSettings: {
    confidenceThreshold: { type: Number, required: true, min: 0, max: 1, default: 0.7 },
    analysisDepth: { 
      type: String, 
      enum: ['basic', 'intermediate', 'advanced'], 
      default: 'intermediate' 
    },
    feedbackStyle: { 
      type: String, 
      enum: ['encouraging', 'technical', 'balanced'], 
      default: 'balanced' 
    },
    language: { type: String, default: 'ko' }
  },
  isActive: { type: Boolean, default: true },
  version: { type: String, default: '1.0.0' },
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  centerId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Center', 
    required: true 
  }
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
  analysis: {
    posture: {
      score: { type: Number, required: true, min: 0, max: 100 },
      details: {
        bodyAlignment: {
          score: { type: Number, required: true, min: 0, max: 100 },
          feedback: { type: String, required: true }
        },
        headPosition: {
          score: { type: Number, required: true, min: 0, max: 100 },
          feedback: { type: String, required: true }
        },
        coreStability: {
          score: { type: Number, required: true, min: 0, max: 100 },
          feedback: { type: String, required: true }
        }
      }
    },
    breathing: {
      score: { type: Number, required: true, min: 0, max: 100 },
      details: {
        timing: {
          score: { type: Number, required: true, min: 0, max: 100 },
          feedback: { type: String, required: true }
        },
        technique: {
          score: { type: Number, required: true, min: 0, max: 100 },
          feedback: { type: String, required: true }
        },
        consistency: {
          score: { type: Number, required: true, min: 0, max: 100 },
          feedback: { type: String, required: true }
        }
      }
    },
    movement: {
      score: { type: Number, required: true, min: 0, max: 100 },
      details: {
        strokeTechnique: {
          score: { type: Number, required: true, min: 0, max: 100 },
          feedback: { type: String, required: true }
        },
        rhythm: {
          score: { type: Number, required: true, min: 0, max: 100 },
          feedback: { type: String, required: true }
        },
        coordination: {
          score: { type: Number, required: true, min: 0, max: 100 },
          feedback: { type: String, required: true }
        }
      }
    },
    efficiency: {
      score: { type: Number, required: true, min: 0, max: 100 },
      details: {
        power: {
          score: { type: Number, required: true, min: 0, max: 100 },
          feedback: { type: String, required: true }
        },
        endurance: {
          score: { type: Number, required: true, min: 0, max: 100 },
          feedback: { type: String, required: true }
        },
        speed: {
          score: { type: Number, required: true, min: 0, max: 100 },
          feedback: { type: String, required: true }
        }
      }
    }
  },
  performance: {
    speed: {
      value: { type: Number, required: true },
      unit: { type: String, required: true }
    },
    distance: {
      value: { type: Number, required: true },
      unit: { type: String, required: true }
    },
    strokeCount: {
      value: { type: Number, required: true },
      unit: { type: String, required: true }
    }
  },
  overallScore: { type: Number, required: true, min: 0, max: 100 },
  grade: { 
    type: String, 
    enum: ['A', 'B', 'C', 'D', 'F'], 
    required: true 
  },
  feedback: {
    summary: { type: String, required: true },
    detailedFeedback: { type: String, required: true },
    encouragement: { type: String, required: true },
    goals: [{ type: String }]
  },
  evaluationDate: { type: Date, required: true, default: Date.now }
}, {
  timestamps: true
});

// 인덱스 설정
EvaluationCriteriaSchema.index({ technique: 1, level: 1 }, { unique: true });
AIEvaluationResultSchema.index({ studentId: 1, technique: 1, evaluationDate: -1 });

// 운동 추천 인터페이스
export interface IExerciseRecommendation {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  duration: number; // 분
  equipment?: string[];
  instructions: string[];
  benefits: string[];
}

// 운동 추천 스키마
const ExerciseRecommendationSchema = new Schema<IExerciseRecommendation>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced'], 
    required: true 
  },
  category: { type: String, required: true },
  duration: { type: Number, required: true },
  equipment: [{ type: String }],
  instructions: [{ type: String, required: true }],
  benefits: [{ type: String, required: true }]
}, {
  timestamps: true
});

// 인덱스 설정
ExerciseRecommendationSchema.index({ category: 1, difficulty: 1 });

// 모델 생성
export const EvaluationCriteria = mongoose.model<IEvaluationCriteria>('EvaluationCriteria', EvaluationCriteriaSchema);
export const AIEvaluationResult = mongoose.model<IAIEvaluationResult>('AIEvaluationResult', AIEvaluationResultSchema);
export const ExerciseRecommendation = mongoose.model<IExerciseRecommendation>('ExerciseRecommendation', ExerciseRecommendationSchema);