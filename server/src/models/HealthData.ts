import mongoose, { Document, Schema } from 'mongoose';

export interface IHealthData extends Document {
  studentId: mongoose.Types.ObjectId;
  height: number;
  weight: number;
  bmi: number;
  bloodPressure: string;
  heartRate: number;
  flexibility: number;
  strength: number;
  endurance: number;
  exerciseLevel: string;
  swimmingExperience: string;
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
  exerciseCompliance: number;
  lastHealthCheck: Date;
  aiRecommendations: {
    exerciseIntensity: number;
    duration: number;
    frequency: number;
    restPeriod: number;
    specialNotes: string;
  };
  privacySettings: {
    height: boolean;
    weight: boolean;
    bmi: boolean;
    bloodPressure: boolean;
    heartRate: boolean;
    flexibility: boolean;
    strength: boolean;
    endurance: boolean;
    exerciseLevel: boolean;
    swimmingExperience: boolean;
    healthStatus: boolean;
    exerciseCompliance: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const healthDataSchema = new Schema<IHealthData>({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  height: {
    type: Number,
    min: 50,
    max: 250,
    required: true
  },
  weight: {
    type: Number,
    min: 20,
    max: 200,
    required: true
  },
  bmi: {
    type: Number,
    min: 10,
    max: 50
  },
  bloodPressure: {
    type: String,
    trim: true
  },
  heartRate: {
    type: Number,
    min: 40,
    max: 200
  },
  flexibility: {
    type: Number,
    min: 0,
    max: 10
  },
  strength: {
    type: Number,
    min: 0,
    max: 10
  },
  endurance: {
    type: Number,
    min: 0,
    max: 10
  },
  exerciseLevel: {
    type: String,
    enum: ['초급', '중급', '고급', '전문가'],
    default: '초급'
  },
  swimmingExperience: {
    type: String,
    trim: true
  },
  healthStatus: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor'],
    default: 'good'
  },
  exerciseCompliance: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  lastHealthCheck: {
    type: Date,
    default: Date.now
  },
  aiRecommendations: {
    exerciseIntensity: {
      type: Number,
      min: 1,
      max: 10,
      default: 5
    },
    duration: {
      type: Number,
      min: 15,
      max: 120,
      default: 30
    },
    frequency: {
      type: Number,
      min: 1,
      max: 7,
      default: 3
    },
    restPeriod: {
      type: Number,
      min: 12,
      max: 72,
      default: 48
    },
    specialNotes: {
      type: String,
      trim: true
    }
  },
  privacySettings: {
    height: { type: Boolean, default: true },
    weight: { type: Boolean, default: true },
    bmi: { type: Boolean, default: true },
    bloodPressure: { type: Boolean, default: false },
    heartRate: { type: Boolean, default: false },
    flexibility: { type: Boolean, default: true },
    strength: { type: Boolean, default: true },
    endurance: { type: Boolean, default: true },
    exerciseLevel: { type: Boolean, default: true },
    swimmingExperience: { type: Boolean, default: true },
    healthStatus: { type: Boolean, default: true },
    exerciseCompliance: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

// BMI 자동 계산 미들웨어
healthDataSchema.pre('save', function(next) {
  if (this.height && this.weight) {
    this.bmi = parseFloat((this.weight / Math.pow(this.height / 100, 2)).toFixed(1));
  }
  next();
});

// 인덱스 생성
healthDataSchema.index({ studentId: 1 });
healthDataSchema.index({ healthStatus: 1 });
healthDataSchema.index({ exerciseCompliance: 1 });
healthDataSchema.index({ lastHealthCheck: 1 });

export const HealthData = mongoose.model<IHealthData>('HealthData', healthDataSchema);
export default HealthData;
