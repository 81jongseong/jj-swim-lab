/**
 * 📅 JJ Swim Lab - 센터 운영 스케줄 모델
 * 
 * 📋 **모델 목적**
 * - 센터의 운영 시간 및 예약 가능 시간 관리
 * - 개인레슨 및 레인대여 가능 시간 설정
 * - 강사별 가능 시간 및 인원 제한 관리
 * - 레인별 사용 가능 시간 및 상태 관리
 * 
 * 🔄 **주요 기능**
 * - 센터 운영 시간 설정 (평일/주말/공휴일)
 * - 개인레슨 가능 시간 설정
 * - 레인대여 가능 시간 설정
 * - 강사별 가능 시간 및 인원 제한
 * - 레인별 사용 가능 상태 관리
 * 
 * 🗄️ **데이터 연동**
 * - SwimmingCenter 모델과 연동
 * - User 모델(강사)과 연동
 * - PersonalLesson 및 LaneRental 모델과 연동
 * - 예약 시스템과 연동
 * 
 * 📅 **개발 히스토리**
 * - 2025-01-12: 초기 센터 스케줄 모델 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2025-01-12
 * - 상태: ✅ 완성
 */

import mongoose from 'mongoose';

const centerScheduleSchema = new mongoose.Schema({
  centerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SwimmingCenter',
    required: true,
  },
  
  // 센터 운영 시간 설정
  operatingHours: {
    weekdays: {
      isOpen: { type: Boolean, default: true },
      openTime: { type: String, default: '06:00' }, // HH:MM 형식
      closeTime: { type: String, default: '22:00' },
      breaks: [{
        startTime: String,
        endTime: String,
        reason: String
      }]
    },
    weekends: {
      isOpen: { type: Boolean, default: true },
      openTime: { type: String, default: '08:00' },
      closeTime: { type: String, default: '20:00' },
      breaks: [{
        startTime: String,
        endTime: String,
        reason: String
      }]
    },
    holidays: {
      isOpen: { type: Boolean, default: false },
      openTime: { type: String, default: '09:00' },
      closeTime: { type: String, default: '18:00' },
      breaks: [{
        startTime: String,
        endTime: String,
        reason: String
      }]
    }
  },

  // 개인레슨 가능 시간 설정
  personalLessonSettings: {
    isAvailable: { type: Boolean, default: true },
    availableDays: [{ type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] }],
    timeSlots: [{
      startTime: String, // HH:MM 형식
      endTime: String,
      isActive: { type: Boolean, default: true }, // 해당 시간 슬롯 활성화 여부
      maxLessons: { type: Number, default: 1 }, // 해당 시간대 최대 레슨 수
      instructorCapacity: { type: Number, default: 1 }, // 강사당 최대 인원
      poolType: { type: String, enum: ['mainPool', 'kidsPool', 'auxiliaryPool'], default: 'mainPool' },
      price: { type: Number, default: 0 }, // 해당 시간대 가격 (선택사항)
      notes: { type: String, default: '' } // 시간대별 특이사항
    }],
    advanceBookingDays: { type: Number, default: 7 }, // 예약 가능 일수
    cancellationHours: { type: Number, default: 24 }, // 취소 가능 시간
    lessonDuration: { type: Number, default: 60 }, // 기본 레슨 시간 (분)
    bufferTime: { type: Number, default: 15 }, // 레슨 간 버퍼 시간 (분)
    slotInterval: { type: Number, default: 60 } // 시간 슬롯 간격 (분)
  },

  // 레인대여 가능 시간 설정
  laneRentalSettings: {
    isAvailable: { type: Boolean, default: true },
    availableDays: [{ type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] }],
    timeSlots: [{
      startTime: String,
      endTime: String,
      isActive: { type: Boolean, default: true }, // 해당 시간 슬롯 활성화 여부
      maxRentals: { type: Number, default: 1 }, // 해당 시간대 최대 대여 수
      poolType: { type: String, enum: ['mainPool', 'kidsPool', 'auxiliaryPool'], default: 'mainPool' },
      hourlyRate: { type: Number, default: 0 }, // 해당 시간대 시간당 요금
      notes: { type: String, default: '' } // 시간대별 특이사항
    }],
    advanceBookingDays: { type: Number, default: 14 }, // 예약 가능 일수
    cancellationHours: { type: Number, default: 48 }, // 취소 가능 시간
    minRentalDuration: { type: Number, default: 60 }, // 최소 대여 시간 (분)
    maxRentalDuration: { type: Number, default: 240 }, // 최대 대여 시간 (분)
    bufferTime: { type: Number, default: 30 }, // 대여 간 버퍼 시간 (분)
    slotInterval: { type: Number, default: 60 } // 시간 슬롯 간격 (분)
  },

  // 강사별 가능 시간 및 인원 제한
  instructorAvailability: [{
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    instructorName: { type: String, required: true }, // 강사 이름 (캐시)
    instructorType: { 
      type: String, 
      enum: ['instructor', 'lifeguard'], 
      default: 'instructor' 
    },
    availableDays: [{ type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] }],
    timeSlots: [{
      startTime: String,
      endTime: String,
      maxStudents: { type: Number, default: 1 }, // 강사당 최대 학생 수
      lessonTypes: [{ type: String, enum: ['freestyle', 'backstroke', 'breaststroke', 'butterfly', 'private', 'group'] }],
      poolType: { type: String, enum: ['mainPool', 'kidsPool', 'auxiliaryPool'], default: 'mainPool' },
      isActive: { type: Boolean, default: true }, // 해당 시간 슬롯 활성화 여부
      price: { type: Number, default: 0 }, // 해당 강사의 해당 시간대 가격
      skillLevels: [{ type: String }], // 가르칠 수 있는 수준 (예: ['beginner', 'intermediate', 'advanced'])
      notes: { type: String, default: '' }, // 강사별 특이사항
      currentBookings: { type: Number, default: 0 } // 현재 예약된 학생 수
    }],
    weeklySchedule: {
      monday: [{ startTime: String, endTime: String, isAvailable: { type: Boolean, default: true } }],
      tuesday: [{ startTime: String, endTime: String, isAvailable: { type: Boolean, default: true } }],
      wednesday: [{ startTime: String, endTime: String, isAvailable: { type: Boolean, default: true } }],
      thursday: [{ startTime: String, endTime: String, isAvailable: { type: Boolean, default: true } }],
      friday: [{ startTime: String, endTime: String, isAvailable: { type: Boolean, default: true } }],
      saturday: [{ startTime: String, endTime: String, isAvailable: { type: Boolean, default: true } }],
      sunday: [{ startTime: String, endTime: String, isAvailable: { type: Boolean, default: true } }]
    },
    isActive: { type: Boolean, default: true }, // 강사 전체 활성화 여부
    lastUpdated: { type: Date, default: Date.now }
  }],

  // 레인별 사용 가능 상태
  laneAvailability: [{
    poolType: { type: String, enum: ['mainPool', 'kidsPool', 'auxiliaryPool'], required: true },
    laneNumber: { type: Number, required: true },
    isAvailable: { type: Boolean, default: true },
    maintenanceSchedule: [{
      startDate: Date,
      endDate: Date,
      reason: String,
      isRecurring: { type: Boolean, default: false },
      recurringPattern: String // 'weekly', 'monthly' 등
    }],
    restrictions: [{
      startTime: String,
      endTime: String,
      days: [{ type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] }],
      reason: String
    }]
  }],

  // 특별 일정 (휴무일, 이벤트 등)
  specialSchedules: [{
    date: Date,
    type: { type: String, enum: ['holiday', 'event', 'maintenance', 'closure'], required: true },
    title: String,
    description: String,
    isOpen: { type: Boolean, default: false },
    openTime: String,
    closeTime: String,
    affectedServices: [{ type: String, enum: ['personalLesson', 'laneRental', 'all'] }]
  }],

  // 설정 메타데이터
  settings: {
    timeZone: { type: String, default: 'Asia/Seoul' },
    currency: { type: String, default: 'KRW' },
    language: { type: String, default: 'ko' },
    autoConfirm: { type: Boolean, default: false }, // 자동 승인 여부
    requireApproval: { type: Boolean, default: true }, // 승인 필요 여부
    maxConcurrentBookings: { type: Number, default: 10 }, // 동시 예약 최대 수
    notificationSettings: {
      emailNotifications: { type: Boolean, default: true },
      smsNotifications: { type: Boolean, default: false },
      reminderHours: { type: Number, default: 24 } // 알림 시간
    }
  },

  // 상태 및 메타데이터
  isActive: { type: Boolean, default: true },
  lastUpdated: { type: Date, default: Date.now },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
});

// 인덱스 설정
centerScheduleSchema.index({ centerId: 1 });
centerScheduleSchema.index({ 'instructorAvailability.instructorId': 1 });
centerScheduleSchema.index({ 'laneAvailability.poolType': 1, 'laneAvailability.laneNumber': 1 });
centerScheduleSchema.index({ 'specialSchedules.date': 1 });

export const CenterSchedule = mongoose.models.CenterSchedule || mongoose.model('CenterSchedule', centerScheduleSchema);
