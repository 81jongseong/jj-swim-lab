/**
 * 🏃‍♂️ JJ Swim Lab - 운동 처방 데이터 모델
 * 
 * 📋 **모델 개요**
 * - 개인별 맞춤 운동 처방 정보 저장
 * - 운동 이력 및 성과 추적
 * - 강사/센터 관리자용 조정 이력 관리
 * - 일반회원용 자동 조정 로그
 * 
 * 🔗 **연동 데이터**
 * - User: 사용자 기본 정보
 * - HealthData: 건강 정보
 * - Center: 센터 정보 (강사 처방 시)
 * - Instructor: 강사 정보
 * 
 * 📅 **개발 히스토리**
 * - 2025-01-22: 운동 처방 모델 구현
 */

import mongoose, { Document, Schema } from 'mongoose';

// 운동 처방 인터페이스
export interface IExercisePrescription extends Document {
  userId: mongoose.Types.ObjectId;
  centerId?: mongoose.Types.ObjectId;
  instructorId?: mongoose.Types.ObjectId;
  
  // 건강 상태 등급
  healthGrade: {
    obesityGrade: 'normal' | 'overweight' | 'obesity1' | 'obesity2' | 'obesity3';
    cardiovascularGrade: 'low' | 'moderate' | 'high' | 'very_high';
    fitnessGrade: 'beginner' | 'intermediate' | 'advanced';
    ageGrade: 'young' | 'middle' | 'senior';
    overallGrade: 'A' | 'B' | 'C' | 'D' | 'E';
  };
  
  // 현재 운동 처방
  currentPrescription: {
    sessionDuration: number; // 분
    totalDistance: number; // 미터
    targetHeartRate: {
      min: number;
      max: number;
      optimal: number;
    };
    recommendedExercises: {
      warmUp: { duration: number; intensity: string; };
      mainExercise: { duration: number; intensity: string; sets?: number; };
      coolDown: { duration: number; intensity: string; };
    };
    weeklyFrequency: number;
    progressionPlan: {
      currentWeek: number;
      totalWeeks: number;
      weeklyIncrease: number;
    };
    safetyGuidelines: string[];
    contraindications: string[];
  };
  
  // 처방 생성 정보
  prescriptionInfo: {
    createdBy: 'system' | 'instructor' | 'center_admin' | 'user';
    createdByUserId?: mongoose.Types.ObjectId;
    creationReason: string;
    baseHealthData: any; // 처방 당시 건강 정보 스냅샷
    algorithmVersion: string;
  };
  
  // 조정 이력
  adjustmentHistory: Array<{
    adjustmentId: string;
    date: Date;
    type: 'increase' | 'maintain' | 'decrease';
    amount: number; // 변화량 (%)
    reason: string[];
    confidence: number;
    adjustedBy: 'system' | 'instructor' | 'center_admin' | 'user';
    adjustedByUserId?: mongoose.Types.ObjectId;
    previousPrescription: any;
    newPrescription: any;
  }>;
  
  // 운동 이력
  exerciseHistory: Array<{
    sessionId: string;
    date: Date;
    prescribedExercise: any;
    actualPerformance: {
      duration: number;
      distance: number;
      averageHeartRate: number;
      maxHeartRate: number;
      perceivedExertion: number;
      completionRate: number;
    };
    feedback: {
      difficulty: 'too_easy' | 'appropriate' | 'too_hard';
      fatigue: 'low' | 'moderate' | 'high';
      enjoyment: 'low' | 'moderate' | 'high';
      instructorNotes?: string;
    };
    nextAdjustment: {
      intensityChange: number;
      durationChange: number;
      reason: string;
    };
  }>;
  
  // 상태 정보
  status: {
    isActive: boolean;
    lastUpdated: Date;
    nextReviewDate: Date;
    totalSessions: number;
    averageCompletionRate: number;
    currentStreak: number; // 연속 운동 일수
    longestStreak: number;
  };
  
  // 메타데이터
  createdAt: Date;
  updatedAt: Date;
}

// 운동 처방 스키마
const ExercisePrescriptionSchema = new Schema<IExercisePrescription>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  centerId: {
    type: Schema.Types.ObjectId,
    ref: 'Center',
    index: true
  },
  instructorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  
  healthGrade: {
    obesityGrade: {
      type: String,
      enum: ['normal', 'overweight', 'obesity1', 'obesity2', 'obesity3'],
      required: true
    },
    cardiovascularGrade: {
      type: String,
      enum: ['low', 'moderate', 'high', 'very_high'],
      required: true
    },
    fitnessGrade: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: true
    },
    ageGrade: {
      type: String,
      enum: ['young', 'middle', 'senior'],
      required: true
    },
    overallGrade: {
      type: String,
      enum: ['A', 'B', 'C', 'D', 'E'],
      required: true
    }
  },
  
  currentPrescription: {
    sessionDuration: { type: Number, required: true },
    totalDistance: { type: Number, required: true },
    targetHeartRate: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
      optimal: { type: Number, required: true }
    },
    recommendedExercises: {
      warmUp: {
        duration: { type: Number, required: true },
        intensity: { type: String, required: true }
      },
      mainExercise: {
        duration: { type: Number, required: true },
        intensity: { type: String, required: true },
        sets: { type: Number }
      },
      coolDown: {
        duration: { type: Number, required: true },
        intensity: { type: String, required: true }
      }
    },
    weeklyFrequency: { type: Number, required: true },
    progressionPlan: {
      currentWeek: { type: Number, required: true },
      totalWeeks: { type: Number, required: true },
      weeklyIncrease: { type: Number, required: true }
    },
    safetyGuidelines: [{ type: String }],
    contraindications: [{ type: String }]
  },
  
  prescriptionInfo: {
    createdBy: {
      type: String,
      enum: ['system', 'instructor', 'center_admin', 'user'],
      required: true
    },
    createdByUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    creationReason: { type: String, required: true },
    baseHealthData: { type: Schema.Types.Mixed },
    algorithmVersion: { type: String, default: '1.0' }
  },
  
  adjustmentHistory: [{
    adjustmentId: { type: String, required: true },
    date: { type: Date, required: true },
    type: {
      type: String,
      enum: ['increase', 'maintain', 'decrease'],
      required: true
    },
    amount: { type: Number, required: true },
    reason: [{ type: String }],
    confidence: { type: Number, required: true },
    adjustedBy: {
      type: String,
      enum: ['system', 'instructor', 'center_admin', 'user'],
      required: true
    },
    adjustedByUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    previousPrescription: { type: Schema.Types.Mixed },
    newPrescription: { type: Schema.Types.Mixed }
  }],
  
  exerciseHistory: [{
    sessionId: { type: String, required: true },
    date: { type: Date, required: true },
    prescribedExercise: { type: Schema.Types.Mixed },
    actualPerformance: {
      duration: { type: Number, required: true },
      distance: { type: Number, required: true },
      averageHeartRate: { type: Number, required: true },
      maxHeartRate: { type: Number, required: true },
      perceivedExertion: { type: Number, required: true },
      completionRate: { type: Number, required: true }
    },
    feedback: {
      difficulty: {
        type: String,
        enum: ['too_easy', 'appropriate', 'too_hard'],
        required: true
      },
      fatigue: {
        type: String,
        enum: ['low', 'moderate', 'high'],
        required: true
      },
      enjoyment: {
        type: String,
        enum: ['low', 'moderate', 'high'],
        required: true
      },
      instructorNotes: { type: String }
    },
    nextAdjustment: {
      intensityChange: { type: Number, required: true },
      durationChange: { type: Number, required: true },
      reason: { type: String, required: true }
    }
  }],
  
  status: {
    isActive: { type: Boolean, default: true },
    lastUpdated: { type: Date, default: Date.now },
    nextReviewDate: { type: Date, required: true },
    totalSessions: { type: Number, default: 0 },
    averageCompletionRate: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 }
  }
}, {
  timestamps: true,
  collection: 'exercise_prescriptions'
});

// 인덱스 설정
ExercisePrescriptionSchema.index({ userId: 1, isActive: 1 });
ExercisePrescriptionSchema.index({ centerId: 1, status: 1 });
ExercisePrescriptionSchema.index({ instructorId: 1, status: 1 });
ExercisePrescriptionSchema.index({ 'status.nextReviewDate': 1 });

// 가상 필드
ExercisePrescriptionSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

ExercisePrescriptionSchema.virtual('center', {
  ref: 'Center',
  localField: 'centerId',
  foreignField: '_id',
  justOne: true
});

ExercisePrescriptionSchema.virtual('instructor', {
  ref: 'User',
  localField: 'instructorId',
  foreignField: '_id',
  justOne: true
});

// 미들웨어
ExercisePrescriptionSchema.pre('save', function(next) {
  this.status.lastUpdated = new Date();
  next();
});

export const ExercisePrescription = mongoose.model<IExercisePrescription>('ExercisePrescription', ExercisePrescriptionSchema);
