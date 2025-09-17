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
  operatingHours: {
    open: string;
    close: string;
    days: string[];
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
