import mongoose from 'mongoose';

// 운동 데이터 인터페이스
interface IExerciseData extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  sessionId: string;
  exerciseType: 'swimming' | 'pose_analysis' | 'intensity_training' | 'general_workout';
  startTime: Date;
  endTime?: Date;
  duration: number; // 분 단위
  
  // 운동량 데이터
  intensityData: {
    averageIntensity: number; // 0-100%
    maxIntensity: number;
    intensityHistory: Array<{
      timestamp: Date;
      intensity: number;
      heartRate?: number;
      movementSpeed: number;
      calories: number;
    }>;
    totalCalories: number;
    averageHeartRate: number;
    maxHeartRate: number;
  };
  
  // 자세 분석 데이터
  poseAnalysis?: {
    overallScore: number; // 0-100
    poseType: string;
    quality: 'Poor' | 'Needs Improvement' | 'Fair' | 'Good' | 'Excellent';
    detailedAnalysis: {
      shoulderAlignment: number;
      hipAlignment: number;
      legPosition: number;
      armMovement: number;
      breathingPattern: number;
    };
    corrections: string[];
    improvements: string[];
    landmarks: Array<{
      timestamp: Date;
      landmarks: Array<{
        x: number;
        y: number;
        z: number;
        visibility: number;
      }>;
    }>;
  };
  
  // 수영 특화 데이터
  swimmingData?: {
    stroke: 'freestyle' | 'butterfly' | 'breaststroke' | 'backstroke' | 'mixed';
    distance: number; // 미터
    laps: number;
    strokeCount: number;
    strokeRate: number; // 분당 스트로크 수
    efficiency: number; // 0-100%
    techniqueScore: number;
    breathingPattern: string;
    turnEfficiency: number;
  };
  
  // 개인 목표 대비 성과
  performanceMetrics: {
    goalAchievement: number; // 0-100%
    improvement: number; // 이전 기록 대비 개선도
    consistency: number; // 일관성 점수
    effort: number; // 노력도
  };
  
  // AI 추천사항
  aiRecommendations: {
    nextWorkout: string;
    focusAreas: string[];
    restDays: number;
    intensityAdjustment: string;
    techniqueImprovements: string[];
    nutritionTips: string[];
  };
  
  // 메타데이터
  notes?: string;
  tags?: string[];
  weather?: string;
  temperature?: number;
  humidity?: number;
  
  createdAt: Date;
  updatedAt: Date;
}

const exerciseDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  exerciseType: {
    type: String,
    enum: ['swimming', 'pose_analysis', 'intensity_training', 'general_workout'],
    required: true
  },
  startTime: {
    type: Date,
    required: true,
    index: true
  },
  endTime: {
    type: Date,
    index: true
  },
  duration: {
    type: Number,
    required: true,
    min: 0
  },
  
  // 운동량 데이터
  intensityData: {
    averageIntensity: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    maxIntensity: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    intensityHistory: [{
      timestamp: {
        type: Date,
        required: true
      },
      intensity: {
        type: Number,
        required: true,
        min: 0,
        max: 100
      },
      heartRate: {
        type: Number,
        min: 0
      },
      movementSpeed: {
        type: Number,
        required: true,
        min: 0,
        max: 100
      },
      calories: {
        type: Number,
        required: true,
        min: 0
      }
    }],
    totalCalories: {
      type: Number,
      required: true,
      min: 0
    },
    averageHeartRate: {
      type: Number,
      min: 0
    },
    maxHeartRate: {
      type: Number,
      min: 0
    }
  },
  
  // 자세 분석 데이터
  poseAnalysis: {
    overallScore: {
      type: Number,
      min: 0,
      max: 100
    },
    poseType: String,
    quality: {
      type: String,
      enum: ['Poor', 'Needs Improvement', 'Fair', 'Good', 'Excellent']
    },
    detailedAnalysis: {
      shoulderAlignment: {
        type: Number,
        min: 0,
        max: 100
      },
      hipAlignment: {
        type: Number,
        min: 0,
        max: 100
      },
      legPosition: {
        type: Number,
        min: 0,
        max: 100
      },
      armMovement: {
        type: Number,
        min: 0,
        max: 100
      },
      breathingPattern: {
        type: Number,
        min: 0,
        max: 100
      }
    },
    corrections: [String],
    improvements: [String],
    landmarks: [{
      timestamp: {
        type: Date,
        required: true
      },
      landmarks: [{
        x: Number,
        y: Number,
        z: Number,
        visibility: Number
      }]
    }]
  },
  
  // 수영 특화 데이터
  swimmingData: {
    stroke: {
      type: String,
      enum: ['freestyle', 'butterfly', 'breaststroke', 'backstroke', 'mixed']
    },
    distance: {
      type: Number,
      min: 0
    },
    laps: {
      type: Number,
      min: 0
    },
    strokeCount: {
      type: Number,
      min: 0
    },
    strokeRate: {
      type: Number,
      min: 0
    },
    efficiency: {
      type: Number,
      min: 0,
      max: 100
    },
    techniqueScore: {
      type: Number,
      min: 0,
      max: 100
    },
    breathingPattern: String,
    turnEfficiency: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  
  // 개인 목표 대비 성과
  performanceMetrics: {
    goalAchievement: {
      type: Number,
      min: 0,
      max: 100
    },
    improvement: {
      type: Number
    },
    consistency: {
      type: Number,
      min: 0,
      max: 100
    },
    effort: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  
  // AI 추천사항
  aiRecommendations: {
    nextWorkout: String,
    focusAreas: [String],
    restDays: {
      type: Number,
      min: 0
    },
    intensityAdjustment: String,
    techniqueImprovements: [String],
    nutritionTips: [String]
  },
  
  // 메타데이터
  notes: String,
  tags: [String],
  weather: String,
  temperature: Number,
  humidity: Number
}, {
  timestamps: true
});

// 인덱스 설정
exerciseDataSchema.index({ userId: 1, startTime: -1 });
exerciseDataSchema.index({ exerciseType: 1, startTime: -1 });
exerciseDataSchema.index({ 'intensityData.averageIntensity': -1 });
exerciseDataSchema.index({ 'poseAnalysis.overallScore': -1 });

// 가상 필드: BMI 계산
exerciseDataSchema.virtual('bmi').get(function() {
  // 이 필드는 User 모델의 healthProfile에서 가져와야 함
  return null;
});

// 메서드: 운동 세션 완료
exerciseDataSchema.methods.completeSession = function(endTime: Date) {
  this.endTime = endTime;
  this.duration = Math.round((endTime.getTime() - this.startTime.getTime()) / (1000 * 60));
  return this.save();
};

// 메서드: 성과 점수 계산
exerciseDataSchema.methods.calculatePerformanceScore = function() {
  let score = 0;
  
  // 운동량 점수 (40%)
  if (this.intensityData.averageIntensity >= 80) score += 40;
  else if (this.intensityData.averageIntensity >= 60) score += 30;
  else if (this.intensityData.averageIntensity >= 40) score += 20;
  else score += 10;
  
  // 자세 점수 (30%)
  if (this.poseAnalysis?.overallScore) {
    if (this.poseAnalysis.overallScore >= 90) score += 30;
    else if (this.poseAnalysis.overallScore >= 80) score += 25;
    else if (this.poseAnalysis.overallScore >= 70) score += 20;
    else if (this.poseAnalysis.overallScore >= 60) score += 15;
    else score += 10;
  }
  
  // 지속시간 점수 (20%)
  if (this.duration >= 60) score += 20;
  else if (this.duration >= 45) score += 15;
  else if (this.duration >= 30) score += 10;
  else if (this.duration >= 15) score += 5;
  
  // 일관성 점수 (10%)
  score += (this.performanceMetrics.consistency || 0) * 0.1;
  
  return Math.round(score);
};

// 정적 메서드: 사용자별 운동 통계
exerciseDataSchema.statics.getUserStats = async function(userId: string, days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const stats = await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        startTime: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        totalDuration: { $sum: '$duration' },
        totalCalories: { $sum: '$intensityData.totalCalories' },
        averageIntensity: { $avg: '$intensityData.averageIntensity' },
        averagePoseScore: { $avg: '$poseAnalysis.overallScore' },
        bestIntensity: { $max: '$intensityData.maxIntensity' },
        bestPoseScore: { $max: '$poseAnalysis.overallScore' }
      }
    }
  ]);
  
  return stats[0] || {
    totalSessions: 0,
    totalDuration: 0,
    totalCalories: 0,
    averageIntensity: 0,
    averagePoseScore: 0,
    bestIntensity: 0,
    bestPoseScore: 0
  };
};

// 정적 메서드: AI 추천 생성
exerciseDataSchema.statics.generateAIRecommendations = async function(userId: string) {
  const userStats = await (this.constructor as any).getUserStats(userId, 7); // 최근 7일
  const recentSessions = await this.find({ userId })
    .sort({ startTime: -1 })
    .limit(5);
  
  let recommendations: {
    nextWorkout: string;
    focusAreas: string[];
    restDays: number;
    intensityAdjustment: string;
    techniqueImprovements: string[];
    nutritionTips: string[];
  } = {
    nextWorkout: '',
    focusAreas: [],
    restDays: 1,
    intensityAdjustment: '',
    techniqueImprovements: [],
    nutritionTips: []
  };
  
  if (userStats.totalSessions === 0) {
    recommendations.nextWorkout = '가벼운 워밍업과 기본 자세 연습을 시작해보세요.';
    recommendations.focusAreas = ['기본 자세', '호흡법', '물에 대한 적응'];
  } else {
    // 운동 강도에 따른 추천
    if (userStats.averageIntensity < 50) {
      recommendations.intensityAdjustment = '운동 강도를 점진적으로 높여보세요.';
      recommendations.focusAreas.push('지구력 향상');
    } else if (userStats.averageIntensity > 80) {
      recommendations.intensityAdjustment = '과도한 운동을 피하고 적절한 휴식을 취하세요.';
      recommendations.restDays = 2;
    }
    
    // 자세 점수에 따른 추천
    if (userStats.averagePoseScore < 70) {
      recommendations.techniqueImprovements.push('기본 자세 연습에 집중하세요.');
      recommendations.focusAreas.push('자세 교정');
    }
    
    // 운동 빈도에 따른 추천
    if (userStats.totalSessions >= 5) {
      recommendations.restDays = 1;
      recommendations.nextWorkout = '휴식 후 다음 운동을 계획하세요.';
    } else if (userStats.totalSessions < 3) {
      recommendations.nextWorkout = '규칙적인 운동 습관을 만들어보세요.';
      recommendations.focusAreas.push('일관성');
    }
  }
  
  // 영양 팁
  if (userStats.totalCalories > 500) {
    recommendations.nutritionTips.push('충분한 수분 섭취와 단백질 보충이 필요합니다.');
  }
  
  return recommendations;
};

const ExerciseData = mongoose.model<IExerciseData>('ExerciseData', exerciseDataSchema);

export default ExerciseData;
