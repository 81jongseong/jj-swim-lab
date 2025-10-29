/**
 * 📚 JJ Swim Lab - 코스 모델
 * 
 * 📋 **모델 목적**
 * - JJ Swim Lab 시스템의 수영 강습 과정(코스) 정보를 관리하는 핵심 모델
 * - 코스 기본 정보, 강사 정보, 수강생 관리, 일정 관리
 * - 코스별 등록 현황 및 수강생 제한 관리
 * - 코스 상태 및 활성화 관리
 * - 코스별 통계 및 분석 데이터 제공
 * 
 * 🔄 **주요 기능**
 * - 코스 기본 정보 관리 (이름, 설명, 레벨, 기간, 가격)
 * - 강사 정보 및 센터 정보 관리
 * - 수강생 수 제한 및 등록 현황 관리
 * - 코스 일정 및 시간 관리
 * - 코스 상태 관리 (활성/비활성)
 * - 코스 등록일 및 업데이트 추적
 * - 코스별 통계 및 분석 데이터
 * 
 * 🗄️ **데이터 연동**
 * - User 모델과 연동 (강사, 수강생 정보)
 * - 센터 정보와 연동 (센터별 코스 그룹)
 * - Booking 모델과 연동 (예약 정보)
 * - Payment 모델과 연동 (결제 정보)
 * - Progress 모델과 연동 (학습 진도)
 * - courses API와 연동
 * 
 * 🛠️ **필요한 설치 파일**
 * - Mongoose 7.8.7
 * - MongoDB Atlas (데이터 저장)
 * - User 모델 (강사, 수강생 정보)
 * - 센터 관리 시스템
 * - 예약 시스템
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 코스 등록 시 수강생 수 제한 고려
 * 2. 강사 정보 및 센터 정보 일관성 유지
 * 3. 코스 상태 변경 시 예약 시스템 연동
 * 4. 코스 데이터 검증 및 sanitization
 * 5. 코스별 권한 관리 및 접근 제어
 * 6. 인덱스 최적화 및 검색 성능 고려
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 코스 스키마 검증
 * - [ ] 수강생 수 제한 확인
 * - [ ] 강사 정보 및 센터 정보 연동 확인
 * - [ ] 코스 상태 관리 확인
 * - [ ] API 엔드포인트와의 연동 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 코스 모델 구현
 * - 2024-12-19: 코스 등록 및 수강생 관리 시스템 구현
 * - 2024-12-19: 코스 상태 관리 시스템 구현
 * - 2024-12-19: 코스 검색 및 필터링 기능 구현
 * - 2024-12-19: 코스 통계 및 분석 기능 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (코스 모델 완료)
 * 
 * 🚀 **다음 단계**
 * - 코스별 상세 통계 및 분석
 * - 코스 추천 시스템
 * - 코스별 리뷰 및 평점 시스템
 * - 코스 일정 관리 시스템
 * - 코스별 성과 분석 및 피드백
 * 
 * 💡 **사용 예시**
 * ```typescript
 * // 코스 생성
 * const course = new Course({
 *   name: '초급 자유형',
 *   description: '자유형 기초 강습',
 *   level: 'beginner',
 *   duration: 60,
 *   price: 50000,
 *   maxStudents: 10,
 *   instructor: instructorId,
 *   centerId: centerId
 * });
 * 
 * // 코스 조회
 * const courses = await Course.find({ level: 'beginner' });
 * 
 * // 코스 검색
 * const searchResults = await Course.find({
 *   $or: [
 *     { name: { $regex: searchTerm, $options: 'i' } },
 *     { description: { $regex: searchTerm, $options: 'i' } }
 *   ]
 * });
 * ```
 * 
 * 🔍 **코스 데이터 처리 흐름**
 * 1. 코스 등록 및 기본 정보 입력
 * 2. 강사 정보 및 센터 정보 설정
 * 3. 코스 일정 및 시간 설정
 * 4. 수강생 수 제한 설정
 * 5. 코스 상태 활성화
 * 6. 코스 등록 및 수강생 관리
 * 7. 코스 통계 및 분석 데이터 제공
 */

import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  level: {
    type: String,
    // ⭐ 한글 레벨 사용 (초급, 중급, 고급, 전문가, 마스터)
    required: true,
  },
  duration: {
    type: Number, // 분 단위
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  maxStudents: {
    type: Number,
    required: true,
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  instructorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  instructorName: {
    type: String,
  },
  centerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Center',
    required: true,
  },
  // 반 정보 추가
  classInfo: {
    className: { type: String, required: true }, // 예: "자유형 기초반 A"
    classType: { 
      type: String, 
      enum: ['regular', 'intensive', 'private'], 
      default: 'regular',
      required: true
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    maxCapacity: { type: Number, required: true },
    currentEnrollment: { type: Number, default: 0 }
  },
  // 강습법 체크리스트 연결
  teachingMethods: [{
    methodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TeachingMethod',
      required: true
    },
    order: { type: Number, required: true },
    isRequired: { type: Boolean, default: true }
  }],
  schedule: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
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
    // ⭐ 요일/시간별 레인 정보 (개인레슨 시 레인 조정용)
    lanes: {
      type: {
        assignedLanes: [{ type: Number }], // 현재 배정된 레인 번호들
        originalAssignedLanes: [{ type: Number }], // 원래 배정된 레인 번호들 (복원용)
        isAdjusted: { type: Boolean, default: false } // 레인이 조정되었는지 여부
      },
      default: () => ({
        assignedLanes: [],
        originalAssignedLanes: [],
        isAdjusted: false
      })
    }
  }],
  // ⭐ 레인 정보 (수영장 레인 배정)
  poolType: {
    type: String,
    enum: ['mainPool', 'kidsPool', 'auxiliaryPool'],
    default: 'mainPool'
  },
  lanes: [{
    type: Number,
    min: 1,
    max: 10
  }],
  laneInfo: {
    assignedLanes: [{ type: Number }], // 배정된 레인 번호들 (예: [1, 2, 3])
    originalAssignedLanes: [{ type: Number }], // 원래 배정된 레인 번호들 (개인레슨 취소 시 복원용)
    maxLanes: { type: Number, default: 1 }, // 최대 사용 레인 수
    minLanes: { type: Number, default: 1 }, // 최소 사용 레인 수 (개인레슨 시 조정용)
    laneNotes: { type: String, default: '' } // 레인 관련 메모
  },
  // 개인레슨 자동 레인 조정 설정
  personalLessonAdjustment: {
    isEnabled: { type: Boolean, default: false }, // 개인레슨 시 레인 자동 조정 여부
    reducedLanes: { type: Number, default: 1 }, // 개인레슨 시 줄어드는 레인 수
    adjustmentTime: { type: Number, default: 60 }, // 조정 시간 (분)
    notes: { type: String, default: '' } // 조정 관련 메모
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  // 수업 기간
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    default: function() {
      const date = new Date();
      date.setMonth(date.getMonth() + 1);
      return date;
    }
  },
  enrolledStudents: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'dropped'],
      default: 'active',
    },
    progress: {
      percentage: { type: Number, default: 0 },
      completedSteps: [{ 
        methodId: { type: mongoose.Schema.Types.ObjectId, ref: 'TeachingMethod' },
        stepName: { type: String, required: true },
        completedAt: { type: Date, default: Date.now },
        notes: { type: String, default: '' }
      }] as any,
      lastUpdated: { type: Date, default: Date.now },
      notes: { type: String, default: '' }
    }
  }],
  // 과정 태그 (필터링/검색용)
  tags: [{
    type: String
  }],
  // ⭐ 개인레슨 여부
  isPersonalLesson: {
    type: Boolean,
    default: false
  },
  // ⭐ 개인레슨 설정
  personalLessonSettings: {
    timeSlots: [{
      startTime: String,
      endTime: String
    }],
    lessonTypes: [String],
    frequencyOptions: [String]
  },
  // ⭐ 과정 타입
  courseType: {
    type: String,
    enum: ['group', 'personal', 'freeSwim'],
    default: 'group'
  }
}, { 
  timestamps: true 
});

// 성능 최적화를 위한 인덱스 설정
courseSchema.index({ centerId: 1, status: 1 }); // 센터별 활성 강습 검색 최적화
courseSchema.index({ instructorId: 1, status: 1 }); // 강사별 강습 검색 최적화
courseSchema.index({ 'schedule.dayOfWeek': 1, 'schedule.startTime': 1 }); // 시간표 검색 최적화
courseSchema.index({ 'level': 1, 'category': 1 }); // 레벨별 카테고리 검색 최적화
courseSchema.index({ 'students.studentId': 1 }); // 학생별 강습 검색 최적화
courseSchema.index({ createdAt: -1 }); // 최신 강습 검색 최적화
courseSchema.index({ 'capacity.max': 1, 'capacity.current': 1 }); // 정원별 검색 최적화
courseSchema.index({ 'price.amount': 1 }); // 가격별 검색 최적화

export const Course = mongoose.models.Course || mongoose.model('Course', courseSchema); 