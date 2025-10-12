/**
 * 🎯 SwimLab - 개인별 프로그램 조정 모델
 * 
 * 📋 **모델 목적**
 * - 단체반 공통 프로그램에 대한 개인별 조정사항 저장
 * - 질환/컨디션 기반 페이스 조정 및 주의사항
 * - 회원이 자신의 상황에 맞는 맞춤 안내 확인
 * 
 * 🔄 **연동되는 데이터**
 * - SwimProgram 모델 (단체반 공통 프로그램)
 * - User 모델 (회원 정보)
 * - GroupClass 모델 (단체반 정보)
 * 
 * 💡 **주요 필드**
 * - programId: 단체반 공통 프로그램 ID
 * - userId: 회원 ID
 * - adjustments: 세션별 조정사항
 * - warnings: 주의사항
 * - paceAdjustment: 페이스 조정 (느리게/빠르게)
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IPersonalProgramAdjustment extends Document {
  programId: mongoose.Types.ObjectId; // 단체반 공통 프로그램
  userId: mongoose.Types.ObjectId; // 회원
  groupClassId: mongoose.Types.ObjectId; // 단체반
  
  // 개인별 조정사항
  adjustments: {
    // 전체 페이스 조정
    globalPaceAdjustment: number; // -10 ~ +10 (%)
    globalPaceReason: string;
    
    // 회피해야 할 영법/세트
    avoidStrokes: string[];
    avoidDrills: string[];
    avoidEquipment: string[];
    
    // 주의사항
    warnings: Array<{
      type: 'health' | 'condition' | 'technique';
      severity: 'info' | 'warning' | 'critical';
      message: string;
      relatedCondition?: string;
    }>;
    
    // 세션별 상세 조정
    sessionAdjustments: Array<{
      sessionDate: string; // YYYY-MM-DD
      dayOfWeek: string;
      paceAdjustment: number; // 해당 세션의 페이스 조정 (%)
      restAdjustment: number; // 휴식 시간 조정 (초)
      skipBlocks: number[]; // 건너뛸 블록 인덱스
      modifiedBlocks: Array<{
        blockIndex: number;
        originalDescription: string;
        modifiedDescription: string;
        reason: string;
      }>;
      notes: string;
    }>;
  };
  
  // 자동 생성 정보
  generatedBy: {
    conditionIds: string[]; // 적용된 컨디션들
    healthConditions: string[]; // 적용된 건강 질환들
    currentCondition: string; // 당일 컨디션
    generatedAt: Date;
  };
  
  // 회원 확인 여부
  viewedByMember: boolean;
  viewedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const PersonalProgramAdjustmentSchema = new Schema<IPersonalProgramAdjustment>({
  programId: {
    type: Schema.Types.ObjectId,
    ref: 'SwimProgram',
    required: true,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  groupClassId: {
    type: Schema.Types.ObjectId,
    ref: 'GroupClass',
    required: true,
    index: true
  },
  
  adjustments: {
    globalPaceAdjustment: { type: Number, default: 0 },
    globalPaceReason: { type: String, default: '' },
    
    avoidStrokes: [{ type: String }],
    avoidDrills: [{ type: String }],
    avoidEquipment: [{ type: String }],
    
    warnings: [{
      type: { type: String, enum: ['health', 'condition', 'technique'], required: true },
      severity: { type: String, enum: ['info', 'warning', 'critical'], required: true },
      message: { type: String, required: true },
      relatedCondition: { type: String }
    }],
    
    sessionAdjustments: [{
      sessionDate: { type: String, required: true },
      dayOfWeek: { type: String, required: true },
      paceAdjustment: { type: Number, default: 0 },
      restAdjustment: { type: Number, default: 0 },
      skipBlocks: [{ type: Number }],
      modifiedBlocks: [{
        blockIndex: { type: Number, required: true },
        originalDescription: { type: String, required: true },
        modifiedDescription: { type: String, required: true },
        reason: { type: String, required: true }
      }],
      notes: { type: String }
    }]
  },
  
  generatedBy: {
    conditionIds: [{ type: String }],
    healthConditions: [{ type: String }],
    currentCondition: { type: String },
    generatedAt: { type: Date, default: Date.now }
  },
  
  viewedByMember: { type: Boolean, default: false },
  viewedAt: { type: Date }
}, {
  timestamps: true
});

// 복합 인덱스: 특정 프로그램의 특정 회원 조정사항 빠르게 조회
PersonalProgramAdjustmentSchema.index({ programId: 1, userId: 1 });
PersonalProgramAdjustmentSchema.index({ groupClassId: 1, userId: 1 });

export default mongoose.model<IPersonalProgramAdjustment>('PersonalProgramAdjustment', PersonalProgramAdjustmentSchema);








