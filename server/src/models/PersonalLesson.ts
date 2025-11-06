/**
 * 🏊‍♂️ JJ Swim Lab - 개인레슨 모델
 * 
 * 개인레슨 신청 및 관리 정보를 저장하는 모델입니다.
 * 
 * 🔄 **연동 파일**
 * - server/src/routes/personal-lessons.ts (개인레슨 API)
 * - server/src/routes/bookings.ts (예약 통합 API)
 * - server/src/routes/lane-rentals.ts (레인대여 연동)
 * - client/app/center/[centerSlug]/admin/schedule/page.tsx (일정관리 페이지)
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IPersonalLesson extends Document {
  studentId: mongoose.Types.ObjectId;
  instructorId?: mongoose.Types.ObjectId;
  centerId: mongoose.Types.ObjectId; // 최종 확정된 센터
  requestedCenterId?: mongoose.Types.ObjectId; // ⭐ 외부 회원이 요청한 센터 (장소 섭외)
  isExternalMember: boolean; // ⭐ 외부 회원 여부 (센터 소속이 아닌 회원)
  isExternalInstructor?: boolean; // ⭐ 외부 강사 여부 (해당 센터 소속이 아닌 강사)
  date: Date;
  startTime: string; // ⭐ 시작 시간 (기존 time 필드와 호환)
  endTime?: string; // ⭐ 종료 시간 추가
  time: string; // 하위 호환성 유지
  duration: number; // 분 단위
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  lessonType: string; // 'freestyle', 'backstroke', 'breaststroke', 'butterfly'
  skillLevel: string; // 'beginner', 'intermediate', 'advanced'
  goals: string;
  notes?: string;
  price: number; // 하위 호환성 (총 금액)
  instructorFee?: number; // ⭐ 강사 수업료
  laneRentalFee?: number; // ⭐ 레인대여 비용
  platformFee?: number; // ⭐ 플랫폼 수수료
  totalAmount?: number; // ⭐ 총 결제 금액 (instructorFee + laneRentalFee + platformFee)
  paymentId?: mongoose.Types.ObjectId; // ⭐ 결제 ID (Payment 모델 참조)
  specialRequests?: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  assignedLane?: number; // 배정된 레인 번호
  laneRentalId?: mongoose.Types.ObjectId; // ⭐ 연동된 레인대여 ID (장소 섭외)
  poolType?: 'mainPool' | 'kidsPool' | 'auxiliaryPool'; // ⭐ 풀 타입
  locationStatus: 'pending' | 'confirmed' | 'rejected'; // ⭐ 장소 섭외 상태
  locationNotes?: string; // ⭐ 장소 섭외 관련 메모
  createdAt: Date;
  updatedAt: Date;
}

const personalLessonSchema = new Schema<IPersonalLesson>({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  instructorId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  centerId: {
    type: Schema.Types.ObjectId,
    ref: 'Center',
    required: true
  },
  requestedCenterId: {
    type: Schema.Types.ObjectId,
    ref: 'Center' // ⭐ 외부 회원이 요청한 센터
  },
  isExternalMember: {
    type: Boolean,
    default: false // ⭐ 외부 회원 여부
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true // ⭐ 시작 시간
  },
  endTime: {
    type: String // ⭐ 종료 시간
  },
  time: {
    type: String // 하위 호환성 유지 (startTime과 동일하게 설정)
  },
  duration: {
    type: Number,
    required: true,
    default: 60
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  lessonType: {
    type: String,
    required: true
  },
  skillLevel: {
    type: String,
    required: true
  },
  goals: {
    type: String,
    required: true
  },
  notes: {
    type: String
  },
  price: {
    type: Number,
    required: true,
    default: 0
  },
  instructorFee: {
    type: Number,
    default: 0 // ⭐ 강사 수업료
  },
  laneRentalFee: {
    type: Number,
    default: 0 // ⭐ 레인대여 비용
  },
  platformFee: {
    type: Number,
    default: 0 // ⭐ 플랫폼 수수료 (강사 수업료의 일정 비율)
  },
  totalAmount: {
    type: Number,
    default: 0 // ⭐ 총 결제 금액
  },
  paymentId: {
    type: Schema.Types.ObjectId,
    ref: 'Payment' // ⭐ 결제 ID
  },
  isExternalInstructor: {
    type: Boolean,
    default: false // ⭐ 외부 강사 여부
  },
  specialRequests: {
    type: String
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  assignedLane: {
    type: Number,
    default: 1 // 기본값: 1레인
  },
  laneRentalId: {
    type: Schema.Types.ObjectId,
    ref: 'LaneRental' // ⭐ 연동된 레인대여 ID
  },
  poolType: {
    type: String,
    enum: ['mainPool', 'kidsPool', 'auxiliaryPool'],
    default: 'mainPool' // ⭐ 풀 타입
  },
  locationStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected'],
    default: 'pending' // ⭐ 장소 섭외 상태
  },
  locationNotes: {
    type: String // ⭐ 장소 섭외 관련 메모
  }
}, {
  timestamps: true
});

// ⭐ time 필드 자동 설정 (하위 호환성)
personalLessonSchema.pre('save', function(next) {
  if (this.startTime && !this.time) {
    this.time = this.startTime;
  }
  next();
});

const PersonalLesson = mongoose.model<IPersonalLesson>('PersonalLesson', personalLessonSchema);
export default PersonalLesson;
export { PersonalLesson };