/**
 * 💰 JJ Swim Lab - 정산 관리 모델
 * 
 * 📋 **모델 목적**
 * - 강사, 센터, 플랫폼 간 정산 내역 관리
 * - 자동 정산 시스템 지원
 * - 정산 상태 추적 및 보고서 생성
 * 
 * 🔄 **주요 기능**
 * - 강사 정산 (개인레슨 수업료 - 플랫폼 수수료)
 * - 센터 정산 (레인대여 비용)
 * - 플랫폼 수수료 관리
 * - 정산 주기별 자동 처리
 * - 정산 상태 추적
 * 
 * 🗄️ **데이터 연동**
 * - PersonalLesson 모델과 연동
 * - Payment 모델과 연동
 * - User 모델과 연동 (강사, 센터)
 * - Center 모델과 연동
 * 
 * 🔄 **연동 파일**
 * - server/src/routes/settlements.ts (정산 API)
 * - server/src/services/settlementService.ts (정산 서비스)
 * - server/src/routes/personal-lessons.ts (개인레슨 결제 완료 시 정산 생성)
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface ISettlement extends Document {
  // 정산 대상 정보
  recipientType: 'instructor' | 'center' | 'platform'; // 정산 수령자 타입
  recipientId: mongoose.Types.ObjectId; // 정산 수령자 ID (강사 또는 센터)
  recipientTypeModel: 'User' | 'Center';
  
  // 정산 기간
  periodType: 'weekly' | 'monthly'; // 정산 주기
  periodStart: Date; // 정산 기간 시작일
  periodEnd: Date; // 정산 기간 종료일
  
  // 정산 금액 정보
  totalAmount: number; // 총 정산 금액
  items: Array<{
    personalLessonId: mongoose.Types.ObjectId; // 개인레슨 ID
    paymentId: mongoose.Types.ObjectId; // 결제 ID
    amount: number; // 정산 금액
    description: string; // 정산 내역 설명
    date: Date; // 개인레슨 날짜
  }>;
  
  // 정산 상세 정보
  breakdown: {
    instructorFee?: number; // 강사 수업료
    laneRentalFee?: number; // 레인대여 비용
    platformFee?: number; // 플랫폼 수수료
    deductedAmount?: number; // 공제 금액 (플랫폼 수수료)
    netAmount: number; // 실수령액
  };
  
  // 정산 상태
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  
  // 정산 처리 정보
  processedAt?: Date; // 정산 처리 일시
  processedBy?: mongoose.Types.ObjectId; // 정산 처리자 (관리자)
  transactionId?: string; // 정산 거래 ID
  receiptUrl?: string; // 정산 영수증 URL
  
  // 메모 및 오류 정보
  notes?: string; // 정산 메모
  errorMessage?: string; // 정산 실패 시 오류 메시지
  
  createdAt: Date;
  updatedAt: Date;
}

const settlementSchema = new Schema<ISettlement>({
  recipientType: {
    type: String,
    enum: ['instructor', 'center', 'platform'],
    required: true
  },
  recipientId: {
    type: Schema.Types.ObjectId,
    refPath: 'recipientTypeModel',
    required: true
  },
  recipientTypeModel: {
    type: String,
    enum: ['User', 'Center'],
    required: true
  },
  periodType: {
    type: String,
    enum: ['weekly', 'monthly'],
    required: true,
    default: 'monthly'
  },
  periodStart: {
    type: Date,
    required: true
  },
  periodEnd: {
    type: Date,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true,
    default: 0
  },
  items: [{
    personalLessonId: {
      type: Schema.Types.ObjectId,
      ref: 'PersonalLesson',
      required: true
    },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      required: true
    }
  }],
  breakdown: {
    instructorFee: { type: Number, default: 0 },
    laneRentalFee: { type: Number, default: 0 },
    platformFee: { type: Number, default: 0 },
    deductedAmount: { type: Number, default: 0 },
    netAmount: {
      type: Number,
      required: true,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  processedAt: {
    type: Date
  },
  processedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  receiptUrl: {
    type: String
  },
  notes: {
    type: String
  },
  errorMessage: {
    type: String
  }
}, {
  timestamps: true
});

// 인덱스 설정
settlementSchema.index({ recipientType: 1, recipientId: 1, periodStart: -1 });
settlementSchema.index({ status: 1, periodStart: -1 });
settlementSchema.index({ periodStart: 1, periodEnd: 1 });

const Settlement = mongoose.model<ISettlement>('Settlement', settlementSchema);
export default Settlement;
export { Settlement };

