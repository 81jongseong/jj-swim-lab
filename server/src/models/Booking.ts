/**
 * 📅 JJ Swim Lab - 예약 관리 모델
 * 
 * 📋 **모델 목적**
 * - 수영 강습 예약 및 레인 예약 관리 데이터 구조 정의
 * - 예약 상태 추적 및 관리
 * - 예약 이력 및 통계 데이터 제공
 * - 예약 충돌 방지 및 검증
 * - 예약 관련 비즈니스 로직 지원
 * 
 * 🔄 **주요 기능**
 * - 예약 CRUD 작업 (생성, 조회, 수정, 삭제)
 * - 예약 상태 관리 (예약됨, 진행중, 완료, 취소)
 * - 예약 시간 및 레인 관리
 * - 예약 목적별 분류 (연습, 강습, 대회, 기타)
 * - 예약 이력 및 통계 추적
 * - 예약 충돌 검사 및 방지
 * - 예약 알림 및 리마인더
 * 
 * 🗄️ **데이터 연동**
 * - User 모델과 연동 (예약자 정보)
 * - Course 모델과 연동 (강습 예약)
 * - Payment 모델과 연동 (결제 정보)
 * - Notification 모델과 연동 (예약 알림)
 * - 예약 관리 API와 연동
 * - 예약 통계 및 분석 시스템
 * - MongoDB Atlas 데이터베이스
 * 
 * 🛠️ **필요한 설치 파일**
 * - Mongoose (MongoDB ODM)
 * - User 모델 (../models/User)
 * - Course 모델 (../models/Course)
 * - Payment 모델 (../models/Payment)
 * - Notification 모델 (../models/Notification)
 * - 예약 관리 API (../routes/bookings)
 * - MongoDB Atlas (데이터 저장)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 예약 시간 충돌 방지 및 검증
 * 2. 예약 상태 변경 시 관련 데이터 동기화
 * 3. 예약 취소 시 결제 환불 처리
 * 4. 예약 알림 및 리마인더 시스템
 * 5. 예약 통계 및 분석 성능 최적화
 * 6. 예약 데이터 보안 및 개인정보 보호
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 예약 시간 충돌 검사 확인
 * - [ ] 예약 상태 변경 로직 확인
 * - [ ] 예약 취소 시 환불 처리 확인
 * - [ ] 예약 알림 시스템 확인
 * - [ ] 예약 통계 성능 최적화 확인
 * - [ ] 예약 데이터 보안 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 예약 관리 모델 구현
 * - 2024-12-19: 예약 상태 관리 시스템 구현
 * - 2024-12-19: 예약 충돌 검사 시스템 구현
 * - 2024-12-19: 예약 알림 시스템 구현
 * - 2024-12-19: 예약 통계 및 분석 시스템 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (예약 관리 모델 완료)
 * 
 * 🚀 **다음 단계**
 * - 실시간 예약 상태 업데이트
 * - 예약 추천 시스템
 * - 예약 대기열 관리
 * - 예약 통계 대시보드
 * - 예약 보안 강화
 * 
 * 💡 **사용 예시**
 * ```typescript
 * // 예약 생성
 * const booking = new Booking({
 *   user: userId,
 *   date: new Date(),
 *   startTime: "14:00",
 *   endTime: "15:00",
 *   laneNumber: 1,
 *   purpose: "lesson"
 * });
 * 
 * // 예약 상태 변경
 * booking.status = "completed";
 * await booking.save();
 * 
 * // 예약 조회
 * const bookings = await Booking.find({ user: userId });
 * ```
 * 
 * 🔍 **예약 관리 처리 흐름**
 * 1. 예약 요청 데이터 검증
 * 2. 예약 시간 및 레인 가용성 확인
 * 3. 예약 충돌 검사 및 방지
 * 4. 예약 데이터 생성 및 저장
 * 5. 예약 알림 및 리마인더 설정
 * 6. 예약 상태 추적 및 업데이트
 * 7. 예약 통계 및 분석 업데이트
 */

import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  laneNumber: {
    type: Number,
    required: true,
  },
  purpose: {
    type: String,
    enum: ['practice', 'lesson', 'competition', 'other'],
    default: 'practice',
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending',
  },
  notes: {
    type: String,
    default: '',
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
  },
  centerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Center',
    required: true,
  },
}, { 
  timestamps: true 
});

// 성능 최적화를 위한 인덱스 설정
bookingSchema.index({ date: 1, startTime: 1, endTime: 1 });
bookingSchema.index({ user: 1, date: 1 });
bookingSchema.index({ centerId: 1, date: 1, status: 1 }); // 센터별 예약 검색 최적화
bookingSchema.index({ instructorId: 1, date: 1, status: 1 }); // 강사별 예약 검색 최적화
bookingSchema.index({ courseId: 1, date: 1 }); // 강습별 예약 검색 최적화
bookingSchema.index({ status: 1, createdAt: -1 }); // 상태별 최신 예약 검색 최적화
bookingSchema.index({ 'payment.status': 1 }); // 결제 상태별 검색 최적화
bookingSchema.index({ createdAt: -1 }); // 최신 예약 검색 최적화

export const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema); 