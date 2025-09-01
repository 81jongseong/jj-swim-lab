/**
 * ⌚ JJ Swim Lab - 스마트 워치 데이터 모델
 * 
 * 📋 **모델 목적**
 * - 스마트 워치에서 수집된 실시간 생체 데이터 관리
 * - 수영 중 심박수, 스트로크 수, 속도, 거리 등 자동 측정
 * - AI 평가 시스템과 연동하여 객관적 성과 지표 제공
 * - 개인화된 운동 계획 수립을 위한 데이터 축적
 * 
 * 🔄 **주요 기능**
 * - 실시간 생체 데이터 수집 및 저장
 * - 수영 세션별 성과 분석
 * - AI 평가 시스템과의 자동 연동
 * - 개인별 성과 트렌드 분석
 */

import mongoose, { Document, Schema } from 'mongoose';

// 스마트 워치 데이터 타입
export interface ISmartWatchData {
  studentId: mongoose.Types.ObjectId;
  sessionId: string; // 수영 세션 고유 ID
  deviceInfo: {
    deviceType: string; // 'apple_watch', 'samsung_galaxy_watch', 'fitbit', 'garmin'
    deviceModel: string;
    firmwareVersion: string;
  };
  sessionInfo: {
    startTime: Date;
    endTime: Date;
    duration: number; // 분
    technique: string; // 'freestyle', 'backstroke', 'breaststroke', 'butterfly'
    poolLength: number; // 미터
    totalDistance: number; // 미터
  };
  performanceMetrics: {
    averageSpeed: number; // m/s
    maxSpeed: number; // m/s
    averageHeartRate: number; // bpm
    maxHeartRate: number; // bpm
    minHeartRate: number; // bpm
    strokeCount: number; // 총 스트로크 수
    strokeRate: number; // 스트로크/분
    caloriesBurned: number; // 칼로리
    efficiency: number; // 효율성 점수 (0-100)
  };
  detailedData: {
    heartRateData: Array<{
      timestamp: Date;
      heartRate: number;
    }>;
    strokeData: Array<{
      timestamp: Date;
      strokeType: string;
      strokeCount: number;
      strokeRate: number;
    }>;
    speedData: Array<{
      timestamp: Date;
      speed: number;
      distance: number;
    }>;
    restPeriods: Array<{
      startTime: Date;
      endTime: Date;
      duration: number;
    }>;
  };
  aiAnalysis: {
    postureScore: number; // 0-100
    breathingPattern: {
      averageBreathRate: number; // 호흡/분
      breathConsistency: number; // 0-100
      breathEfficiency: number; // 0-100
    };
    strokeAnalysis: {
      strokeConsistency: number; // 0-100
      strokeEfficiency: number; // 0-100
      strokePower: number; // 0-100
    };
    overallEfficiency: number; // 0-100
    recommendations: string[];
  };
  syncedAt: Date;
  isProcessed: boolean; // AI 분석 완료 여부
}

// 스마트 워치 데이터 스키마
const SmartWatchDataSchema = new Schema<ISmartWatchData & Document>({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true
  },
  deviceInfo: {
    deviceType: {
      type: String,
      required: true,
      enum: ['apple_watch', 'samsung_galaxy_watch', 'fitbit', 'garmin', 'other']
    },
    deviceModel: { type: String, required: true },
    firmwareVersion: { type: String, required: true }
  },
  sessionInfo: {
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    duration: { type: Number, required: true },
    technique: {
      type: String,
      required: true,
      enum: ['freestyle', 'backstroke', 'breaststroke', 'butterfly']
    },
    poolLength: { type: Number, required: true },
    totalDistance: { type: Number, required: true }
  },
  performanceMetrics: {
    averageSpeed: { type: Number, required: true },
    maxSpeed: { type: Number, required: true },
    averageHeartRate: { type: Number, required: true },
    maxHeartRate: { type: Number, required: true },
    minHeartRate: { type: Number, required: true },
    strokeCount: { type: Number, required: true },
    strokeRate: { type: Number, required: true },
    caloriesBurned: { type: Number, required: true },
    efficiency: { type: Number, required: true, min: 0, max: 100 }
  },
  detailedData: {
    heartRateData: [{
      timestamp: { type: Date, required: true },
      heartRate: { type: Number, required: true }
    }],
    strokeData: [{
      timestamp: { type: Date, required: true },
      strokeType: { type: String, required: true },
      strokeCount: { type: Number, required: true },
      strokeRate: { type: Number, required: true }
    }],
    speedData: [{
      timestamp: { type: Date, required: true },
      speed: { type: Number, required: true },
      distance: { type: Number, required: true }
    }],
    restPeriods: [{
      startTime: { type: Date, required: true },
      endTime: { type: Date, required: true },
      duration: { type: Number, required: true }
    }]
  },
  aiAnalysis: {
    postureScore: { type: Number, min: 0, max: 100 },
    breathingPattern: {
      averageBreathRate: { type: Number },
      breathConsistency: { type: Number, min: 0, max: 100 },
      breathEfficiency: { type: Number, min: 0, max: 100 }
    },
    strokeAnalysis: {
      strokeConsistency: { type: Number, min: 0, max: 100 },
      strokeEfficiency: { type: Number, min: 0, max: 100 },
      strokePower: { type: Number, min: 0, max: 100 }
    },
    overallEfficiency: { type: Number, min: 0, max: 100 },
    recommendations: [{ type: String }]
  },
  syncedAt: {
    type: Date,
    default: Date.now
  },
  isProcessed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// 인덱스 설정
SmartWatchDataSchema.index({ studentId: 1, 'sessionInfo.startTime': -1 });
SmartWatchDataSchema.index({ sessionId: 1 });
SmartWatchDataSchema.index({ isProcessed: 1 });

export const SmartWatchData = mongoose.model<ISmartWatchData & Document>('SmartWatchData', SmartWatchDataSchema);

