/**
 * 🏥 JJ Swim Lab - 건강정보 설정 모델
 * 
 * 📋 **모델 목적**
 * - 건강정보 항목, 정상범주, 운동추천, AI 알고리즘 설정을 관리하는 모델
 * - 최고관리자가 전체 시스템의 건강정보 관련 설정을 관리
 * - 센터별, 사용자별 건강정보 항목의 표시/비표시 설정
 * - AI 기반 운동 추천 알고리즘 파라미터 관리
 * 
 * 🔄 **주요 기능**
 * - 건강정보 항목 정의 및 관리 (키, 몸무게, BMI, 혈압 등)
 * - 각 항목별 정상범주 설정 (연령대별, 성별 구분)
 * - 운동 추천 규칙 및 알고리즘 설정
 * - AI 분석 모델 파라미터 관리
 * - 개인정보 보호 설정 및 권한 관리
 * 
 * 🗄️ **데이터 연동**
 * - User 모델과 연동 (건강정보 프로필)
 * - Center 모델과 연동 (센터별 설정)
 * - AI 분석 시스템과 연동
 * - 운동 추천 시스템과 연동
 * 
 * 🛠️ **필요한 설치 파일**
 * - Mongoose 7.8.7
 * - MongoDB Atlas (데이터 저장)
 * - AI 분석 엔진
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 건강정보의 민감성으로 인한 보안 강화
 * 2. 의료법 및 개인정보보호법 준수
 * 3. AI 알고리즘의 정확성 및 안전성 검증
 * 4. 정상범주 설정의 의학적 근거 확보
 * 5. 데이터 암호화 및 접근 제어
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 의학적 근거 검토
 * - [ ] 개인정보 보호법 준수 확인
 * - [ ] AI 알고리즘 검증
 * - [ ] 데이터 보안 설정 확인
 * - [ ] 접근 권한 검증
 * 
 * 📅 **개발 히스토리**
 * - 2025-01-13: 초기 건강정보 설정 모델 구현
 * - 2025-01-13: 권한별 접근 제어 시스템 구현
 * - 2025-01-13: AI 알고리즘 파라미터 관리 추가
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2025-01-13
 * - 상태: ✅ 개발 중 (건강정보 설정 시스템)
 */

import mongoose, { Document, Schema } from 'mongoose';

// 건강정보 항목 인터페이스
export interface IHealthField {
  id: string;
  name: string;
  type: 'number' | 'string' | 'select' | 'boolean' | 'date';
  unit?: string;
  required: boolean;
  category: 'basic' | 'vital' | 'medical' | 'fitness' | 'custom';
  description?: string;
  isActive: boolean;
  displayOrder: number;
}

// 정상범주 인터페이스  
export interface INormalRange {
  fieldId: string;
  ageGroups: Array<{
    minAge: number;
    maxAge: number;
    gender: 'male' | 'female' | 'all';
    normalRange: {
      min?: number;
      max?: number;
      recommended?: string[];
    };
    riskLevels: Array<{
      level: 'low' | 'normal' | 'high' | 'critical';
      range: { min?: number; max?: number };
      description: string;
      recommendations: string[];
    }>;
  }>;
}

// 운동 추천 규칙 인터페이스
export interface IExerciseRule {
  id: string;
  name: string;
  conditions: Array<{
    fieldId: string;
    operator: 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'between';
    value: any;
  }>;
  recommendations: Array<{
    type: 'swimming' | 'fitness' | 'cardio' | 'strength' | 'flexibility';
    exercise: string;
    duration: number; // minutes
    frequency: number; // times per week
    intensity: 'low' | 'moderate' | 'high';
    description: string;
    precautions?: string[];
  }>;
  priority: number;
  isActive: boolean;
}

// AI 알고리즘 설정 인터페이스
export interface IAIConfig {
  modelVersion: string;
  parameters: {
    learningRate: number;
    confidence: number;
    accuracy: number;
    maxRecommendations: number;
    updateFrequency: number; // days
  };
  features: {
    personalizedRecommendations: boolean;
    riskAssessment: boolean;
    progressTracking: boolean;
    goalSetting: boolean;
    socialComparison: boolean;
  };
  thresholds: {
    riskAlert: number;
    progressAlert: number;
    goalAchievement: number;
  };
  lastUpdated: Date;
  lastTrainedAt: Date;
}

// 건강정보 설정 메인 인터페이스
export interface IHealthConfig extends Document {
  version: string;
  healthFields: IHealthField[];
  normalRanges: INormalRange[];
  exerciseRules: IExerciseRule[];
  aiConfig: IAIConfig;
  privacySettings: {
    defaultVisibility: 'public' | 'center' | 'instructor' | 'private';
    allowUserControl: boolean;
    dataRetentionDays: number;
    anonymizeAfterDays: number;
  };
  permissions: {
    superAdmin: string[];
    centerAdmin: string[];
    instructor: string[];
    student: string[];
  };
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const healthFieldSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['number', 'string', 'select', 'boolean', 'date'],
    required: true 
  },
  unit: { type: String },
  required: { type: Boolean, default: false },
  category: {
    type: String,
    enum: ['basic', 'vital', 'medical', 'fitness', 'custom'],
    default: 'basic'
  },
  description: { type: String },
  isActive: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 }
});

const normalRangeSchema = new Schema({
  fieldId: { type: String, required: true },
  ageGroups: [{
    minAge: { type: Number, required: true },
    maxAge: { type: Number, required: true },
    gender: { 
      type: String, 
      enum: ['male', 'female', 'all'],
      default: 'all'
    },
    normalRange: {
      min: { type: Number },
      max: { type: Number },
      recommended: [{ type: String }]
    },
    riskLevels: [{
      level: {
        type: String,
        enum: ['low', 'normal', 'high', 'critical'],
        required: true
      },
      range: {
        min: { type: Number },
        max: { type: Number }
      },
      description: { type: String, required: true },
      recommendations: [{ type: String }]
    }]
  }]
});

const exerciseRuleSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  conditions: [{
    fieldId: { type: String, required: true },
    operator: {
      type: String,
      enum: ['eq', 'gt', 'lt', 'gte', 'lte', 'in', 'between'],
      required: true
    },
    value: { type: Schema.Types.Mixed, required: true }
  }],
  recommendations: [{
    type: {
      type: String,
      enum: ['swimming', 'fitness', 'cardio', 'strength', 'flexibility'],
      required: true
    },
    exercise: { type: String, required: true },
    duration: { type: Number, required: true },
    frequency: { type: Number, required: true },
    intensity: {
      type: String,
      enum: ['low', 'moderate', 'high'],
      required: true
    },
    description: { type: String, required: true },
    precautions: [{ type: String }]
  }],
  priority: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
});

const aiConfigSchema = new Schema({
  modelVersion: { type: String, required: true, default: '1.0.0' },
  parameters: {
    learningRate: { type: Number, default: 0.001 },
    confidence: { type: Number, default: 0.8 },
    accuracy: { type: Number, default: 0.85 },
    maxRecommendations: { type: Number, default: 5 },
    updateFrequency: { type: Number, default: 7 }
  },
  features: {
    personalizedRecommendations: { type: Boolean, default: true },
    riskAssessment: { type: Boolean, default: true },
    progressTracking: { type: Boolean, default: true },
    goalSetting: { type: Boolean, default: true },
    socialComparison: { type: Boolean, default: false }
  },
  thresholds: {
    riskAlert: { type: Number, default: 0.7 },
    progressAlert: { type: Number, default: 0.8 },
    goalAchievement: { type: Number, default: 0.9 }
  },
  lastUpdated: { type: Date, default: Date.now },
  lastTrainedAt: { type: Date, default: Date.now }
});

const healthConfigSchema = new Schema({
  version: { type: String, required: true, default: '1.0.0' },
  healthFields: [healthFieldSchema],
  normalRanges: [normalRangeSchema],
  exerciseRules: [exerciseRuleSchema],
  aiConfig: { type: aiConfigSchema, default: () => ({}) },
  privacySettings: {
    defaultVisibility: {
      type: String,
      enum: ['public', 'center', 'instructor', 'private'],
      default: 'center'
    },
    allowUserControl: { type: Boolean, default: true },
    dataRetentionDays: { type: Number, default: 365 },
    anonymizeAfterDays: { type: Number, default: 1825 } // 5 years
  },
  permissions: {
    superAdmin: [{ type: String }],
    centerAdmin: [{ type: String }],
    instructor: [{ type: String }],
    student: [{ type: String }]
  },
  isActive: { type: Boolean, default: true },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  updatedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  }
}, {
  timestamps: true
});

// 인덱스 설정
healthConfigSchema.index({ version: 1, isActive: 1 });
healthConfigSchema.index({ 'healthFields.id': 1 });
healthConfigSchema.index({ 'normalRanges.fieldId': 1 });

export const HealthConfig = mongoose.model<IHealthConfig>('HealthConfig', healthConfigSchema);
