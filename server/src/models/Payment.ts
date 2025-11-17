/**
 * 💳 JJ Swim Lab - 결제 관리 모델
 * 
 * 📋 **모델 목적**
 * - 수영 강습 관련 결제 및 결제 이력 관리 데이터 구조 정의
 * - 결제 상태 추적 및 관리
 * - 결제 방법별 분류 및 처리
 * - 결제 통계 및 분석 데이터 제공
 * - 결제 보안 및 검증 로직 지원
 * 
 * 🔄 **주요 기능**
 * - 결제 CRUD 작업 (생성, 조회, 수정, 삭제)
 * - 결제 상태 관리 (대기, 완료, 실패, 환불)
 * - 결제 방법별 분류 (카드, 현금, 이체, 온라인)
 * - 결제 목적별 분류 (강습, 예약, 회원권, 기타)
 * - 결제 이력 및 통계 추적
 * - 결제 보안 및 검증
 * - 결제 환불 및 취소 처리
 * 
 * 🗄️ **데이터 연동**
 * - User 모델과 연동 (결제자 정보)
 * - Course 모델과 연동 (강습 결제)
 * - Booking 모델과 연동 (예약 결제)
 * - Payment 모델과 연동 (결제 정보)
 * - 결제 관리 API와 연동
 * - 결제 통계 및 분석 시스템
 * - MongoDB Atlas 데이터베이스
 * 
 * 🛠️ **필요한 설치 파일**
 * - Mongoose (MongoDB ODM)
 * - User 모델 (../models/User)
 * - Course 모델 (../models/Course)
 * - Booking 모델 (../models/Booking)
 * - 결제 관리 API (../routes/payments)
 * - 결제 게이트웨이 (외부 결제 시스템)
 * - MongoDB Atlas (데이터 저장)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 결제 데이터 보안 및 암호화
 * 2. 결제 상태 변경 시 관련 데이터 동기화
 * 3. 결제 환불 시 정확한 금액 계산
 * 4. 결제 방법별 처리 로직 차별화
 * 5. 결제 통계 및 분석 성능 최적화
 * 6. 결제 데이터 개인정보 보호
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 결제 데이터 보안 및 암호화 확인
 * - [ ] 결제 상태 변경 로직 확인
 * - [ ] 결제 환불 처리 확인
 * - [ ] 결제 방법별 처리 로직 확인
 * - [ ] 결제 통계 성능 최적화 확인
 * - [ ] 결제 데이터 개인정보 보호 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 결제 관리 모델 구현
 * - 2024-12-19: 결제 상태 관리 시스템 구현
 * - 2024-12-19: 결제 방법별 처리 시스템 구현
 * - 2024-12-19: 결제 환불 시스템 구현
 * - 2024-12-19: 결제 통계 및 분석 시스템 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (결제 관리 모델 완료)
 * 
 * 🚀 **다음 단계**
 * - 실시간 결제 상태 업데이트
 * - 결제 추천 시스템
 * - 결제 대기열 관리
 * - 결제 통계 대시보드
 * - 결제 보안 강화
 * 
 * 💡 **사용 예시**
 * ```typescript
 * // 결제 생성
 * const payment = new Payment({
 *   user: userId,
 *   amount: 50000,
 *   currency: "KRW",
 *   paymentMethod: "card",
 *   purpose: "course"
 * });
 * 
 * // 결제 상태 변경
 * payment.status = "completed";
 * await payment.save();
 * 
 * // 결제 조회
 * const payments = await Payment.find({ user: userId });
 * ```
 * 
 * 🔍 **결제 관리 처리 흐름**
 * 1. 결제 요청 데이터 검증
 * 2. 결제 방법별 처리 로직 실행
 * 3. 결제 게이트웨이 연동 및 처리
 * 4. 결제 상태 업데이트 및 저장
 * 5. 결제 완료 시 관련 데이터 동기화
 * 6. 결제 통계 및 분석 업데이트
 * 7. 결제 알림 및 사용자 피드백
 */

import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'KRW',
  },
  // 요금 체계 정보 추가
  pricingInfo: {
    userType: {
      type: String,
      enum: ['student', 'instructor', 'centerAdmin', 'superAdmin'],
      required: true,
    },
    pricingTier: {
      type: String,
      enum: ['standard', 'instructor_discount', 'center_managed', 'free'],
      default: 'standard',
    },
    baseAmount: {
      type: Number,
      required: true,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    discountReason: {
      type: String,
      default: '',
    },
    centerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SwimmingCenter',
      default: null,
    },
    isCenterSponsored: {
      type: Boolean,
      default: false,
    },
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'cash', 'transfer', 'online'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending',
  },
  purpose: {
    type: String,
    enum: ['course', 'booking', 'membership', 'other'],
    required: true,
  },
  relatedCourse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
  },
  relatedBooking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
  },
  transactionId: {
    type: String,
    unique: true,
  },
  receiptUrl: {
    type: String,
  },
  notes: {
    type: String,
    default: '',
  },
  centerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Center',
    required: true,
  },
  processedAt: {
    type: Date,
  },
  // ⭐ 환불 관련 필드
  refundAmount: {
    type: Number,
    default: 0,
  },
  refundedAt: {
    type: Date,
  },
  refundedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { 
  timestamps: true 
});

// 사용자별 결제 내역 조회를 위한 인덱스
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });

export const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema); 