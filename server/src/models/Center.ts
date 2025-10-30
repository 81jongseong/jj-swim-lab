import mongoose, { Document, Schema } from 'mongoose';

export interface ICenter extends Document {
  name: string;
  address: string;
  phone: string;
  email: string;
  managerId: mongoose.Types.ObjectId;
  instructors: mongoose.Types.ObjectId[];
  students: mongoose.Types.ObjectId[];
  courses: mongoose.Types.ObjectId[];
  capacity: number;
  status: 'active' | 'inactive' | 'maintenance';
  facilities: string[];
  // 이미지 정보 (로고, 메인 이미지 등)
  images?: {
    logo?: string;
    mainImage?: string;
    [key: string]: string | undefined;
  };
  // ⭐ 풀 구성 정보
  poolConfiguration?: {
    mainPool?: {
      name: string; // 예: "메인 풀", "25m 풀"
      lanes: number; // 레인 수
      depth: string; // 수심 (예: "1.2m~1.8m")
      size: string; // 크기 (예: "25m x 15m")
    };
    kidsPool?: {
      name: string; // 예: "유아 풀", "어린이 풀"
      lanes: number; // 레인 수 (보통 2~4개)
      depth: string; // 수심 (예: "0.8m~1.0m")
      size: string; // 크기
    };
    auxiliaryPool?: {
      name: string; // 예: "보조 풀", "재활 풀"
      lanes: number; // 레인 수
      depth: string; // 수심
      size: string; // 크기
    };
  };
  operatingHours: {
    open: string;
    close: string;
    days: string[];
  };
  // ⭐ 커스텀 급수 관리
  customLevels?: Array<{
    id: string;
    name: string;
    description: string;
    color: string;
    mappedToAdminLevel: string;
    order: number;
  }>;
  // 센터 가능시간 설정 (개인레슨, 레인대여용)
  availabilitySettings: {
    personalLesson: {
      enabled: boolean;
      availableDays: string[]; // ['monday', 'tuesday', ...] - 하위 호환성용 (deprecated)
      availableTimes: Array<{
        startTime: string; // "09:00"
        endTime: string;   // "18:00"
        maxDuration?: number; // 최대 시간 (분) - 선택적
      }>; // 하위 호환성용 (deprecated)
      dayTimeSlots?: Array<{ // ⭐ 새 형식: 요일별 시간대
        day: string; // 'monday', 'tuesday', etc.
        timeSlots: Array<{
          startTime: string; // "09:00"
          endTime: string;   // "18:00"
        }>;
      }>;
      advanceBookingDays?: number; // 예약 가능 일수 - 선택적
      cancellationPolicy: string;
    };
    laneRental: {
      enabled: boolean;
      availableDays: string[]; // ['monday', 'tuesday', ...]
      availableTimes: Array<{
        startTime: string; // "06:00"
        endTime: string;   // "22:00"
        maxDuration: number; // 최대 시간 (분)
      }>;
      availableLanes: number[]; // 대여 가능한 레인 번호들 [1, 2, 3, 4, 5, 6]
      advanceBookingDays: number; // 예약 가능 일수
      cancellationPolicy: string;
    };
    freeSwim?: { // ⭐ 자유수영 운영시간
      enabled: boolean;
      dayTimeSlots?: Array<{ // 요일별 시간대
        day: string; // 'monday', 'tuesday', etc.
        timeSlots: Array<{
          startTime: string; // "09:00"
          endTime: string;   // "18:00"
        }>;
      }>;
      cancellationPolicy?: string;
    };
  };
  // 센터 소개 정보 추가
  introduction: {
    shortDescription: string; // 간단한 설명 (검색 시 표시)
    fullDescription: string; // 상세 설명
    features: string[]; // 특징 및 장점
    certifications: string[]; // 인증 및 자격
    images: string[]; // 이미지 URL 목록
    videoUrl?: string; // 소개 영상 URL
    achievements: string[]; // 수상 경력 및 성과
    specialPrograms: string[]; // 특별 프로그램
    targetAudience: string[]; // 대상 고객층
    philosophy: string; // 운영 철학
    history: string; // 센터 연혁
    staff: Array<{
      name: string;
      position: string;
      experience: string;
      certifications: string[];
      photo?: string;
    }>;
    contactInfo: {
      website?: string;
      socialMedia?: {
        facebook?: string;
        instagram?: string;
        youtube?: string;
        kakao?: string;
      };
      parkingInfo?: string;
      publicTransport?: string;
    };
    pricing: {
      membershipFees?: Array<{
        type: string;
        price: number;
        duration: string;
        description: string;
      }>;
      lessonFees?: Array<{
        type: string;
        price: number;
        duration: string;
        description: string;
      }>;
    };
    visibility: {
      isPublic: boolean; // 비회원에게 공개 여부
      showToMembers: boolean; // 소속 회원에게 공개 여부
      showToInstructors: boolean; // 소속 강사에게 공개 여부
      lastUpdated: Date;
      updatedBy: mongoose.Types.ObjectId;
    };
  };
  // 센터 설정 (브랜딩, 테마 등)
  settings?: {
    theme?: {
      primaryColor?: string;
      secondaryColor?: string;
      mode?: 'light' | 'dark' | 'auto';
      color?: string;
      density?: string;
      [key: string]: any;
    };
    notifications?: {
      email?: boolean;
      sms?: boolean;
    };
    features?: {
      reports?: boolean;
      payments?: boolean;
      bookings?: boolean;
    };
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

const centerSchema = new Schema<ICenter>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  managerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  instructors: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  students: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  courses: [{
    type: Schema.Types.ObjectId,
    ref: 'Course'
  }],
  capacity: {
    type: Number,
    default: 100,
    min: 1
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
  },
  facilities: [{
    type: String,
    trim: true
  }],
  // 이미지 정보 (로고, 메인 이미지 등)
  images: {
    logo: { type: String },
    mainImage: { type: String }
  },
  // ⭐ 풀 구성 정보
  poolConfiguration: {
    mainPool: {
      name: { type: String, default: '메인 풀' },
      lanes: { type: Number, default: 6 },
      depth: { type: String, default: '1.2m~1.8m' },
      size: { type: String, default: '25m x 15m' }
    },
    kidsPool: {
      name: { type: String, default: '유아 풀' },
      lanes: { type: Number, default: 0 }, // 0이면 없음
      depth: { type: String, default: '0.8m~1.0m' },
      size: { type: String, default: '10m x 5m' }
    },
    auxiliaryPool: {
      name: { type: String, default: '보조 풀' },
      lanes: { type: Number, default: 0 }, // 0이면 없음
      depth: { type: String, default: '1.0m~1.5m' },
      size: { type: String, default: '15m x 8m' }
    }
  },
  operatingHours: {
    open: {
      type: String,
      default: '09:00'
    },
    close: {
      type: String,
      default: '22:00'
    },
    days: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      default: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    }]
  },
  // ⭐ 커스텀 급수 관리 (센터별 커스텀 급수)
  customLevels: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    color: { type: String, default: '#3b82f6' },
    mappedToAdminLevel: { type: String, default: 'beginner' },
    order: { type: Number, default: 0 }
  }],
  // 센터 가능시간 설정 (개인레슨, 레인대여용)
  availabilitySettings: {
    personalLesson: {
      enabled: { type: Boolean, default: true },
      availableDays: [{
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        default: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
      }],
      availableTimes: [{
        startTime: { type: String, default: '09:00' },
        endTime: { type: String, default: '18:00' },
        maxDuration: { type: Number, default: 120, required: false }
      }],
      dayTimeSlots: [{ // ⭐ 새 형식: 요일별 시간대
        day: { type: String, required: true },
        timeSlots: [{
          startTime: { type: String, required: true },
          endTime: { type: String, required: true }
        }]
      }],
      advanceBookingDays: { type: Number, default: 7, required: false },
      cancellationPolicy: { type: String, default: '24시간 전 취소 가능' }
    },
    laneRental: {
      enabled: { type: Boolean, default: true },
      availableDays: [{
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        default: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      }],
      availableTimes: [{
        startTime: { type: String, default: '06:00' },
        endTime: { type: String, default: '22:00' },
        maxDuration: { type: Number, default: 180 }
      }],
      availableLanes: [{ type: Number, min: 1, max: 10 }],
      advanceBookingDays: { type: Number, default: 14 },
      cancellationPolicy: { type: String, default: '12시간 전 취소 가능' }
    },
    freeSwim: { // ⭐ 자유수영 운영시간
      enabled: { type: Boolean, default: true },
      dayTimeSlots: [{ // 요일별 시간대
        day: { type: String, required: true },
        timeSlots: [{
          startTime: { type: String, required: true },
          endTime: { type: String, required: true }
        }]
      }],
      cancellationPolicy: { type: String, default: '' }
    }
  },
  // 센터 소개 정보 스키마 추가
  introduction: {
    shortDescription: { type: String, default: '' },
    fullDescription: { type: String, default: '' },
    features: [{ type: String }],
    certifications: [{ type: String }],
    images: [{ type: String }],
    videoUrl: { type: String },
    achievements: [{ type: String }],
    specialPrograms: [{ type: String }],
    targetAudience: [{ type: String }],
    philosophy: { type: String, default: '' },
    history: { type: String, default: '' },
    staff: [{
      name: { type: String, required: true },
      position: { type: String, required: true },
      experience: { type: String, default: '' },
      certifications: [{ type: String }],
      photo: { type: String }
    }],
    contactInfo: {
      website: { type: String },
      socialMedia: {
        facebook: { type: String },
        instagram: { type: String },
        youtube: { type: String },
        kakao: { type: String }
      },
      parkingInfo: { type: String },
      publicTransport: { type: String }
    },
    pricing: {
      membershipFees: [{
        type: { type: String, required: true },
        price: { type: Number, required: true },
        duration: { type: String, required: true },
        description: { type: String, default: '' }
      }],
      lessonFees: [{
        type: { type: String, required: true },
        price: { type: Number, required: true },
        duration: { type: String, required: true },
        description: { type: String, default: '' }
      }]
    },
    visibility: {
      isPublic: { type: Boolean, default: true },
      showToMembers: { type: Boolean, default: true },
      showToInstructors: { type: Boolean, default: true },
      lastUpdated: { type: Date, default: Date.now },
      updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
    }
  },
  // 센터 설정 (브랜딩, 테마 등)
  settings: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// 성능 최적화를 위한 인덱스 설정
centerSchema.index({ managerId: 1 });
centerSchema.index({ status: 1 });
centerSchema.index({ 'location.coordinates': '2dsphere' }); // 지리적 위치 검색 최적화
centerSchema.index({ 'operatingHours.days': 1 }); // 운영 요일별 검색 최적화
centerSchema.index({ capacity: 1 }); // 수용 인원별 검색 최적화
centerSchema.index({ 'facilities': 1 }); // 시설별 검색 최적화
centerSchema.index({ createdAt: -1 }); // 최신 센터 검색 최적화
centerSchema.index({ 'introduction.features': 'text' }); // 텍스트 검색 최적화
centerSchema.index({ 'introduction.targetAudience': 1 }); // 대상 고객별 검색 최적화

export const Center = mongoose.model<ICenter>('Center', centerSchema);
export default Center;
