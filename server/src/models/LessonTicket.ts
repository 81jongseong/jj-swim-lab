/**
 * 🎫 JJ Swim Lab - 수강권 모델
 * 
 * 📋 **모델 목적**
 * - 센터의 수강권(이용권) 시스템 관리
 * - 선불제 기반의 수업 횟수 관리
 * - 수강권 유효기간 및 잔여 횟수 추적
 * - 단체 강습 및 개인 레슨 모두 지원
 * 
 * 🔄 **주요 기능**
 * - 수강권 생성 및 구매 관리
 * - 수업 사용 시 횟수 차감
 * - 유효기간 관리 및 만료 알림
 * - 수강권 이력 추적
 * 
 * 🗄️ **데이터 연동**
 * - User 모델 (회원)
 * - SwimmingCenter 모델 (센터)
 * - Course 모델 (강습)
 * - Booking 모델 (예약/출석)
 * 
 * 💡 **사용 예시**
 * ```typescript
 * // 수강권 생성
 * const ticket = new LessonTicket({
 *   userId: userId,
 *   centerId: centerId,
 *   type: 'group',
 *   totalSessions: 10,
 *   remainingSessions: 10,
 *   expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
 * });
 * 
 * // 수업 사용
 * ticket.remainingSessions -= 1;
 * await ticket.save();
 * ```
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface ILessonTicket extends Document {
  userId: mongoose.Types.ObjectId;        // 회원 ID
  centerId: mongoose.Types.ObjectId;      // 센터 ID
  type: 'group' | 'personal' | 'unlimited'; // 수강권 유형
  name: string;                           // 수강권 이름 (예: "10회 그룹 수강권")
  
  // 횟수 관리
  totalSessions: number;                  // 총 수업 횟수
  remainingSessions: number;              // 남은 수업 횟수
  usedSessions: number;                   // 사용한 수업 횟수
  
  // 기간 관리
  purchaseDate: Date;                     // 구매일
  startDate: Date;                        // 시작일
  expiryDate: Date;                       // 만료일
  
  // 상태 관리
  status: 'active' | 'expired' | 'exhausted' | 'suspended'; // 상태
  
  // 가격 정보
  price: number;                          // 구매 가격
  
  // 제한 사항
  allowedCourseTypes?: string[];          // 사용 가능한 강습 유형
  assignedInstructor?: mongoose.Types.ObjectId; // 지정 강사 (개인 레슨용)
  
  // 메모
  notes?: string;                         // 특이사항 메모
  centerMemo?: string;                    // 센터 내부 메모
  
  // 환불 정보
  isRefunded: boolean;                    // 환불 여부
  refundDate?: Date;                      // 환불일
  refundAmount?: number;                  // 환불 금액
  
  createdAt: Date;
  updatedAt: Date;
  
  // 메서드
  useSession(): Promise<ILessonTicket>;
  cancelSession(): Promise<ILessonTicket>;
}

export interface ILessonTicketModel extends mongoose.Model<ILessonTicket> {
  updateExpiredTickets(): Promise<any>;
  getExpiringSoonTickets(centerId?: mongoose.Types.ObjectId): Promise<ILessonTicket[]>;
}

const lessonTicketSchema = new Schema<ILessonTicket>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  centerId: { 
    type: Schema.Types.ObjectId, 
    ref: 'SwimmingCenter', 
    required: true,
    index: true 
  },
  type: { 
    type: String, 
    enum: ['group', 'personal', 'unlimited'], 
    required: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  
  // 횟수 관리
  totalSessions: { 
    type: Number, 
    required: true,
    min: 0 
  },
  remainingSessions: { 
    type: Number, 
    required: true,
    min: 0 
  },
  usedSessions: { 
    type: Number, 
    default: 0,
    min: 0 
  },
  
  // 기간 관리
  purchaseDate: { 
    type: Date, 
    required: true,
    default: Date.now 
  },
  startDate: { 
    type: Date, 
    required: true,
    default: Date.now 
  },
  expiryDate: { 
    type: Date, 
    required: true,
    index: true 
  },
  
  // 상태 관리
  status: { 
    type: String, 
    enum: ['active', 'expired', 'exhausted', 'suspended'], 
    default: 'active',
    index: true 
  },
  
  // 가격 정보
  price: { 
    type: Number, 
    required: true,
    min: 0 
  },
  
  // 제한 사항
  allowedCourseTypes: [{ type: String }],
  assignedInstructor: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  },
  
  // 메모
  notes: { type: String },
  centerMemo: { type: String },
  
  // 환불 정보
  isRefunded: { 
    type: Boolean, 
    default: false 
  },
  refundDate: { type: Date },
  refundAmount: { type: Number, min: 0 }
}, {
  timestamps: true
});

// 복합 인덱스
lessonTicketSchema.index({ userId: 1, centerId: 1, status: 1 });
lessonTicketSchema.index({ centerId: 1, expiryDate: 1, status: 1 });
lessonTicketSchema.index({ userId: 1, status: 1, expiryDate: 1 });

// 가상 필드: 만료 임박 여부 (7일 이내)
lessonTicketSchema.virtual('isExpiringSoon').get(function() {
  const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  return this.expiryDate <= sevenDaysFromNow && this.status === 'active';
});

// 가상 필드: 사용률
lessonTicketSchema.virtual('usageRate').get(function() {
  if (this.totalSessions === 0) return 0;
  return Math.round((this.usedSessions / this.totalSessions) * 100);
});

// 메서드: 수업 사용 (횟수 차감)
lessonTicketSchema.methods.useSession = async function() {
  if (this.remainingSessions <= 0) {
    throw new Error('남은 수업 횟수가 없습니다.');
  }
  if (this.status !== 'active') {
    throw new Error('활성 상태가 아닌 수강권입니다.');
  }
  if (this.expiryDate < new Date()) {
    this.status = 'expired';
    await this.save();
    throw new Error('만료된 수강권입니다.');
  }
  
  this.remainingSessions -= 1;
  this.usedSessions += 1;
  
  // 횟수를 모두 사용한 경우
  if (this.remainingSessions === 0) {
    this.status = 'exhausted';
  }
  
  return await this.save();
};

// 메서드: 수업 취소 (횟수 복구)
lessonTicketSchema.methods.cancelSession = async function() {
  if (this.usedSessions <= 0) {
    throw new Error('취소할 수업이 없습니다.');
  }
  
  this.remainingSessions += 1;
  this.usedSessions -= 1;
  
  // 상태 복구
  if (this.status === 'exhausted' && this.remainingSessions > 0) {
    this.status = 'active';
  }
  
  return await this.save();
};

// 자동 만료 상태 업데이트 (스케줄러에서 주기적으로 호출)
lessonTicketSchema.statics.updateExpiredTickets = async function() {
  const now = new Date();
  return await this.updateMany(
    { 
      expiryDate: { $lt: now }, 
      status: 'active' 
    },
    { 
      $set: { status: 'expired' } 
    }
  );
};

// 만료 임박 수강권 조회
lessonTicketSchema.statics.getExpiringSoonTickets = async function(centerId?: mongoose.Types.ObjectId) {
  const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const query: any = {
    status: 'active',
    expiryDate: { $lte: sevenDaysFromNow, $gte: new Date() }
  };
  
  if (centerId) {
    query.centerId = centerId;
  }
  
  return await this.find(query)
    .populate('userId', 'name email phone')
    .sort({ expiryDate: 1 });
};

export const LessonTicket = mongoose.model<ILessonTicket, ILessonTicketModel>('LessonTicket', lessonTicketSchema);

