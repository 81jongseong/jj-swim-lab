import mongoose, { Document, Schema } from 'mongoose';

// 동영상 분석 기준 인터페이스
export interface IVideoAnalysisCriteria extends Document {
  technique: string; // 'freestyle', 'backstroke', 'breaststroke', 'butterfly'
  level: string; // 'beginner', 'intermediate', 'advanced', 'expert'
  
  // 동영상 분석 기준
  analysisCriteria: {
    // 자세 분석 기준
    posture: {
      bodyAlignment: {
        criteria: string[];
        weight: number;
        thresholds: {
          excellent: number;
          good: number;
          average: number;
          poor: number;
        };
      };
      headPosition: {
        criteria: string[];
        weight: number;
        thresholds: {
          excellent: number;
          good: number;
          average: number;
          poor: number;
        };
      };
      coreStability: {
        criteria: string[];
        weight: number;
        thresholds: {
          excellent: number;
          good: number;
          average: number;
          poor: number;
        };
      };
    };
    
    // 호흡 분석 기준
    breathing: {
      timing: {
        criteria: string[];
        weight: number;
        thresholds: {
          excellent: number;
          good: number;
          average: number;
          poor: number;
        };
      };
      technique: {
        criteria: string[];
        weight: number;
        thresholds: {
          excellent: number;
          good: number;
          average: number;
          poor: number;
        };
      };
      consistency: {
        criteria: string[];
        weight: number;
        thresholds: {
          excellent: number;
          good: number;
          average: number;
          poor: number;
        };
      };
    };
    
    // 동작 분석 기준
    movement: {
      strokeTechnique: {
        criteria: string[];
        weight: number;
        thresholds: {
          excellent: number;
          good: number;
          average: number;
          poor: number;
        };
      };
      rhythm: {
        criteria: string[];
        weight: number;
        thresholds: {
          excellent: number;
          good: number;
          average: number;
          poor: number;
        };
      };
      coordination: {
        criteria: string[];
        weight: number;
        thresholds: {
          excellent: number;
          good: number;
          average: number;
          poor: number;
        };
      };
    };
    
    // 효율성 분석 기준
    efficiency: {
      power: {
        criteria: string[];
        weight: number;
        thresholds: {
          excellent: number;
          good: number;
          average: number;
          poor: number;
        };
      };
      endurance: {
        criteria: string[];
        weight: number;
        thresholds: {
          excellent: number;
          good: number;
          average: number;
          poor: number;
        };
      };
      speed: {
        criteria: string[];
        weight: number;
        thresholds: {
          excellent: number;
          good: number;
          average: number;
          poor: number;
        };
      };
    };
  };
  
  // 동영상 분석 설정
  videoAnalysisSettings: {
    frameRate: number; // 분석할 프레임 레이트
    keyFrameInterval: number; // 키 프레임 간격
    analysisRegions: {
      body: { x: number; y: number; width: number; height: number; };
      head: { x: number; y: number; width: number; height: number; };
      arms: { x: number; y: number; width: number; height: number; };
      legs: { x: number; y: number; width: number; height: number; };
    };
    detectionSensitivity: number; // 감지 민감도 (0-1)
    trackingAccuracy: number; // 추적 정확도 (0-1)
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

// 동영상 분석 결과 인터페이스
export interface IVideoAnalysisResult extends Document {
  studentId: mongoose.Types.ObjectId;
  instructorId: mongoose.Types.ObjectId;
  videoId: string; // 동영상 파일 ID
  technique: string;
  level: string;
  
  // 동영상 분석 입력 데이터
  videoMetadata: {
    duration: number; // 동영상 길이 (초)
    frameRate: number; // 프레임 레이트
    resolution: { width: number; height: number; };
    fileSize: number; // 파일 크기 (bytes)
    uploadDate: Date;
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
    detailedAnalysis: {
      posture: {
        bodyAlignment: { score: number; details: string[]; };
        headPosition: { score: number; details: string[]; };
        coreStability: { score: number; details: string[]; };
      };
      breathing: {
        timing: { score: number; details: string[]; };
        technique: { score: number; details: string[]; };
        consistency: { score: number; details: string[]; };
      };
      movement: {
        strokeTechnique: { score: number; details: string[]; };
        rhythm: { score: number; details: string[]; };
        coordination: { score: number; details: string[]; };
      };
      efficiency: {
        power: { score: number; details: string[]; };
        endurance: { score: number; details: string[]; };
        speed: { score: number; details: string[]; };
      };
    };
    keyFrames: {
      frameNumber: number;
      timestamp: number;
      analysis: string;
      score: number;
    }[];
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
    nextAnalysisDate: Date;
  };
  
  // 피드백
  feedback: {
    summary: string;
    detailedFeedback: string;
    encouragement: string;
    goals: string[];
  };
  
  analysisDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 동영상 분석 기준 스키마
const VideoAnalysisCriteriaSchema = new Schema<IVideoAnalysisCriteria>({
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
  analysisCriteria: {
    posture: {
      bodyAlignment: {
        criteria: [{ type: String }],
        weight: { type: Number, required: true, min: 0, max: 1 },
        thresholds: {
          excellent: { type: Number, required: true, min: 0, max: 100 },
          good: { type: Number, required: true, min: 0, max: 100 },
          average: { type: Number, required: true, min: 0, max: 100 },
          poor: { type: Number, required: true, min: 0, max: 100 }
        }
      },
      headPosition: {
        criteria: [{ type: String }],
        weight: { type: Number, required: true, min: 0, max: 1 },
        thresholds: {
          excellent: { type: Number, required: true, min: 0, max: 100 },
          good: { type: Number, required: true, min: 0, max: 100 },
          average: { type: Number, required: true, min: 0, max: 100 },
          poor: { type: Number, required: true, min: 0, max: 100 }
        }
      },
      coreStability: {
        criteria: [{ type: String }],
        weight: { type: Number, required: true, min: 0, max: 1 },
        thresholds: {
          excellent: { type: Number, required: true, min: 0, max: 100 },
          good: { type: Number, required: true, min: 0, max: 100 },
          average: { type: Number, required: true, min: 0, max: 100 },
          poor: { type: Number, required: true, min: 0, max: 100 }
        }
      }
    },
    breathing: {
      timing: {
        criteria: [{ type: String }],
        weight: { type: Number, required: true, min: 0, max: 1 },
        thresholds: {
          excellent: { type: Number, required: true, min: 0, max: 100 },
          good: { type: Number, required: true, min: 0, max: 100 },
          average: { type: Number, required: true, min: 0, max: 100 },
          poor: { type: Number, required: true, min: 0, max: 100 }
        }
      },
      technique: {
        criteria: [{ type: String }],
        weight: { type: Number, required: true, min: 0, max: 1 },
        thresholds: {
          excellent: { type: Number, required: true, min: 0, max: 100 },
          good: { type: Number, required: true, min: 0, max: 100 },
          average: { type: Number, required: true, min: 0, max: 100 },
          poor: { type: Number, required: true, min: 0, max: 100 }
        }
      },
      consistency: {
        criteria: [{ type: String }],
        weight: { type: Number, required: true, min: 0, max: 1 },
        thresholds: {
          excellent: { type: Number, required: true, min: 0, max: 100 },
          good: { type: Number, required: true, min: 0, max: 100 },
          average: { type: Number, required: true, min: 0, max: 100 },
          poor: { type: Number, required: true, min: 0, max: 100 }
        }
      }
    },
    movement: {
      strokeTechnique: {
        criteria: [{ type: String }],
        weight: { type: Number, required: true, min: 0, max: 1 },
        thresholds: {
          excellent: { type: Number, required: true, min: 0, max: 100 },
          good: { type: Number, required: true, min: 0, max: 100 },
          average: { type: Number, required: true, min: 0, max: 100 },
          poor: { type: Number, required: true, min: 0, max: 100 }
        }
      },
      rhythm: {
        criteria: [{ type: String }],
        weight: { type: Number, required: true, min: 0, max: 1 },
        thresholds: {
          excellent: { type: Number, required: true, min: 0, max: 100 },
          good: { type: Number, required: true, min: 0, max: 100 },
          average: { type: Number, required: true, min: 0, max: 100 },
          poor: { type: Number, required: true, min: 0, max: 100 }
        }
      },
      coordination: {
        criteria: [{ type: String }],
        weight: { type: Number, required: true, min: 0, max: 1 },
        thresholds: {
          excellent: { type: Number, required: true, min: 0, max: 100 },
          good: { type: Number, required: true, min: 0, max: 100 },
          average: { type: Number, required: true, min: 0, max: 100 },
          poor: { type: Number, required: true, min: 0, max: 100 }
        }
      }
    },
    efficiency: {
      power: {
        criteria: [{ type: String }],
        weight: { type: Number, required: true, min: 0, max: 1 },
        thresholds: {
          excellent: { type: Number, required: true, min: 0, max: 100 },
          good: { type: Number, required: true, min: 0, max: 100 },
          average: { type: Number, required: true, min: 0, max: 100 },
          poor: { type: Number, required: true, min: 0, max: 100 }
        }
      },
      endurance: {
        criteria: [{ type: String }],
        weight: { type: Number, required: true, min: 0, max: 1 },
        thresholds: {
          excellent: { type: Number, required: true, min: 0, max: 100 },
          good: { type: Number, required: true, min: 0, max: 100 },
          average: { type: Number, required: true, min: 0, max: 100 },
          poor: { type: Number, required: true, min: 0, max: 100 }
        }
      },
      speed: {
        criteria: [{ type: String }],
        weight: { type: Number, required: true, min: 0, max: 1 },
        thresholds: {
          excellent: { type: Number, required: true, min: 0, max: 100 },
          good: { type: Number, required: true, min: 0, max: 100 },
          average: { type: Number, required: true, min: 0, max: 100 },
          poor: { type: Number, required: true, min: 0, max: 100 }
        }
      }
    }
  },
  videoAnalysisSettings: {
    frameRate: { type: Number, default: 30 },
    keyFrameInterval: { type: Number, default: 10 },
    analysisRegions: {
      body: {
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 },
        width: { type: Number, default: 100 },
        height: { type: Number, default: 100 }
      },
      head: {
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 },
        width: { type: Number, default: 100 },
        height: { type: Number, default: 100 }
      },
      arms: {
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 },
        width: { type: Number, default: 100 },
        height: { type: Number, default: 100 }
      },
      legs: {
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 },
        width: { type: Number, default: 100 },
        height: { type: Number, default: 100 }
      }
    },
    detectionSensitivity: { type: Number, default: 0.7, min: 0, max: 1 },
    trackingAccuracy: { type: Number, default: 0.8, min: 0, max: 1 }
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

// 동영상 분석 결과 스키마
const VideoAnalysisResultSchema = new Schema<IVideoAnalysisResult>({
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
  videoId: {
    type: String,
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
  videoMetadata: {
    duration: { type: Number, required: true },
    frameRate: { type: Number, required: true },
    resolution: {
      width: { type: Number, required: true },
      height: { type: Number, required: true }
    },
    fileSize: { type: Number, required: true },
    uploadDate: { type: Date, required: true }
  },
  analysisResult: {
    overallScore: { type: Number, required: true, min: 0, max: 100 },
    categoryScores: {
      posture: { type: Number, required: true, min: 0, max: 100 },
      breathing: { type: Number, required: true, min: 0, max: 100 },
      movement: { type: Number, required: true, min: 0, max: 100 },
      efficiency: { type: Number, required: true, min: 0, max: 100 }
    },
    detailedAnalysis: Schema.Types.Mixed,
    keyFrames: [{
      frameNumber: { type: Number, required: true },
      timestamp: { type: Number, required: true },
      analysis: { type: String, required: true },
      score: { type: Number, required: true, min: 0, max: 100 }
    }],
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
    nextAnalysisDate: { type: Date, required: true }
  },
  feedback: {
    summary: { type: String, required: true },
    detailedFeedback: { type: String, required: true },
    encouragement: { type: String, required: true },
    goals: [{ type: String }]
  },
  analysisDate: { type: Date, required: true }
}, {
  timestamps: true
});

// 인덱스 설정
VideoAnalysisCriteriaSchema.index({ technique: 1, level: 1 }, { unique: true });
VideoAnalysisResultSchema.index({ studentId: 1, technique: 1, analysisDate: -1 });
VideoAnalysisResultSchema.index({ videoId: 1 });

// 모델 생성
export const VideoAnalysisCriteria = mongoose.model<IVideoAnalysisCriteria>('VideoAnalysisCriteria', VideoAnalysisCriteriaSchema);
export const VideoAnalysisResult = mongoose.model<IVideoAnalysisResult>('VideoAnalysisResult', VideoAnalysisResultSchema);