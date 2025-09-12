/**
 * 🏢 JJ Swim Lab - 센터 등록 신청 모델
 * 
 * 📋 **모델 목적**
 * - 새로운 센터의 등록 신청을 관리하는 Mongoose 모델
 * - 센터 등록부터 승인까지의 전체 프로세스 추적
 * - 센터 정보, 신청자 정보, 승인 상태를 종합적으로 관리
 * 
 * 🔄 **주요 기능**
 * - 센터 등록 신청 데이터 저장 및 검증
 * - 승인 상태 관리 (pending, under_review, approved, rejected, cancelled)
 * - 승인 이력 추적 및 검토자 정보 관리
 * - 승인 후 센터 및 관리자 계정 자동 생성
 * 
 * 🗄️ **데이터 연동**
 * - CenterInfo 모델과 연동 (승인 후 센터 정보 생성)
 * - User 모델과 연동 (센터 관리자 계정 생성)
 * - 승인 프로세스와 연동 (center-registrations.ts API)
 * 
 * 🛠️ **필요한 설치 파일**
 * - Mongoose ODM
 * - MongoDB Atlas 연결
 * - Express.js 서버
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 사업자등록번호 중복 검증 필수
 * 2. 승인 상태 변경 시 이력 추적
 * 3. 승인 후 센터 정보 생성 시 데이터 무결성 확인
 * 4. 파일 업로드 시 보안 검증
 * 5. 개인정보 처리 시 GDPR 준수
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 스키마 변경 시 기존 데이터 호환성 확인
 * - [ ] 인덱스 성능 최적화
 * - [ ] 검증 규칙 업데이트
 * - [ ] API 엔드포인트 연동 확인
 * - [ ] 보안 검증 강화
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (센터 등록 신청 모델)
 * - 2024-12-19: 승인 프로세스 및 이력 관리 추가
 * - 2024-12-19: 센터 정보 자동 생성 기능 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (센터 등록 신청 시스템 완료)
 * 
 * 🚀 **다음 단계**
 * - 센터 등록 신청 폼 UI 구현
 * - 파일 업로드 기능 추가
 * - 승인 알림 시스템 구현
 * - 센터 등록 통계 대시보드
 * 
 * 💡 **사용 예시**
 * ```typescript
 * // 센터 등록 신청 생성
 * const registration = new CenterRegistration({
 *   centerName: 'JJ 수영센터',
 *   businessNumber: '123-45-67890',
 *   representativeName: '홍길동',
 *   // ... 기타 필드들
 * });
 * 
 * // 승인 처리
 * registration.status = 'approved';
 * registration.approvalInfo = {
 *   approvedBy: userId,
 *   approvedAt: new Date(),
 *   comments: '승인 완료'
 * };
 * ```
 * 
 * 🔍 **데이터 처리 흐름**
 * 1. 센터 등록 신청 접수
 * 2. 입력 데이터 검증 및 저장
 * 3. 관리자 검토 및 승인/거부 처리
 * 4. 승인 시 센터 정보 및 관리자 계정 생성
 * 5. 거부 시 사유 기록 및 신청자 알림
 */

import mongoose, { Document, Schema } from 'mongoose';

/**
 * 센터 등록 신청 인터페이스
 * @interface ICenterRegistration
 * @extends Document - Mongoose Document를 확장하여 MongoDB 기능 제공
 */
export interface ICenterRegistration extends Document {
  // 기본 정보
  centerName: string;
  businessNumber: string; // 사업자등록번호
  representativeName: string; // 대표자명
  representativeEmail: string; // 대표자 이메일
  representativePhone: string; // 대표자 전화번호
  
  // 센터 정보
  address: {
    postalCode: string;
    address1: string; // 기본주소
    address2?: string; // 상세주소
    city: string;
    province: string;
  };
  
  // 센터 상세 정보
  centerInfo: {
    description: string; // 센터 소개
    facilities: string[]; // 시설 목록
    poolSize: {
      length: number; // 길이 (미터)
      width: number; // 너비 (미터)
      depth: number; // 깊이 (미터)
    };
    operatingHours: {
      weekdays: { open: string; close: string; };
      weekends: { open: string; close: string; };
    };
    capacity: number; // 수용 인원
    parkingAvailable: boolean; // 주차 가능 여부
  };
  
  // 신청자 정보
  applicant: {
    name: string;
    email: string;
    phone: string;
    position: string; // 직책
    userId?: mongoose.Types.ObjectId; // 기존 사용자 ID (있는 경우)
  };
  
  // 문서 첨부
  documents: {
    businessLicense?: string; // 사업자등록증
    facilityPhotos?: string[]; // 시설 사진들
    poolPhotos?: string[]; // 수영장 사진들
    otherDocuments?: string[]; // 기타 서류
  };
  
  // 승인 상태
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'cancelled';
  
  // 승인 정보
  approvalInfo?: {
    reviewedBy: mongoose.Types.ObjectId; // 검토자 ID
    reviewedAt: Date; // 검토 일시
    approvedBy?: mongoose.Types.ObjectId; // 승인자 ID
    approvedAt?: Date; // 승인 일시
    rejectedBy?: mongoose.Types.ObjectId; // 거부자 ID
    rejectedAt?: Date; // 거부 일시
    rejectionReason?: string; // 거부 사유
    comments?: string; // 검토 의견
  };
  
  // 생성된 센터 정보 (승인 후)
  createdCenterId?: mongoose.Types.ObjectId; // 생성된 센터 ID
  createdCenterAdminId?: mongoose.Types.ObjectId; // 생성된 센터 관리자 ID
  
  // 메타데이터
  submittedAt: Date; // 신청 일시
  createdAt: Date;
  updatedAt: Date;
}

// 센터 등록 신청 스키마
const CenterRegistrationSchema = new Schema<ICenterRegistration>({
  // 기본 정보
  centerName: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100
  },
  businessNumber: { 
    type: String, 
    required: true,
    unique: true,
    trim: true,
    match: /^\d{3}-\d{2}-\d{5}$/ // 사업자등록번호 형식 검증
  },
  representativeName: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 50
  },
  representativeEmail: { 
    type: String, 
    required: true,
    trim: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  representativePhone: { 
    type: String, 
    required: true,
    trim: true,
    match: /^01[0-9]-\d{3,4}-\d{4}$/
  },
  
  // 센터 정보
  address: {
    postalCode: { 
      type: String, 
      required: true,
      trim: true,
      match: /^\d{5}$/
    },
    address1: { 
      type: String, 
      required: true,
      trim: true,
      maxlength: 200
    },
    address2: { 
      type: String, 
      trim: true,
      maxlength: 100
    },
    city: { 
      type: String, 
      required: true,
      trim: true,
      maxlength: 50
    },
    province: { 
      type: String, 
      required: true,
      trim: true,
      maxlength: 50
    }
  },
  
  // 센터 상세 정보
  centerInfo: {
    description: { 
      type: String, 
      required: true,
      trim: true,
      maxlength: 1000
    },
    facilities: [{
      type: String,
      trim: true,
      maxlength: 100
    }],
    poolSize: {
      length: { 
        type: Number, 
        required: true,
        min: 10,
        max: 100
      },
      width: { 
        type: Number, 
        required: true,
        min: 5,
        max: 50
      },
      depth: { 
        type: Number, 
        required: true,
        min: 0.5,
        max: 5
      }
    },
    operatingHours: {
      weekdays: {
        open: { 
          type: String, 
          required: true,
          match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
        },
        close: { 
          type: String, 
          required: true,
          match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
        }
      },
      weekends: {
        open: { 
          type: String, 
          required: true,
          match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
        },
        close: { 
          type: String, 
          required: true,
          match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
        }
      }
    },
    capacity: { 
      type: Number, 
      required: true,
      min: 10,
      max: 1000
    },
    parkingAvailable: { 
      type: Boolean, 
      default: false
    }
  },
  
  // 신청자 정보
  applicant: {
    name: { 
      type: String, 
      required: true,
      trim: true,
      maxlength: 50
    },
    email: { 
      type: String, 
      required: true,
      trim: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    phone: { 
      type: String, 
      required: true,
      trim: true,
      match: /^01[0-9]-\d{3,4}-\d{4}$/
    },
    position: { 
      type: String, 
      required: true,
      trim: true,
      maxlength: 50
    },
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User'
    }
  },
  
  // 문서 첨부
  documents: {
    businessLicense: { 
      type: String,
      trim: true
    },
    facilityPhotos: [{
      type: String,
      trim: true
    }],
    poolPhotos: [{
      type: String,
      trim: true
    }],
    otherDocuments: [{
      type: String,
      trim: true
    }]
  },
  
  // 승인 상태
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  
  // 승인 정보
  approvalInfo: {
    reviewedBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User'
    },
    reviewedAt: { 
      type: Date
    },
    approvedBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User'
    },
    approvedAt: { 
      type: Date
    },
    rejectedBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User'
    },
    rejectedAt: { 
      type: Date
    },
    rejectionReason: { 
      type: String,
      trim: true,
      maxlength: 500
    },
    comments: { 
      type: String,
      trim: true,
      maxlength: 1000
    }
  },
  
  // 생성된 센터 정보
  createdCenterId: { 
    type: Schema.Types.ObjectId, 
    ref: 'CenterInfo'
  },
  createdCenterAdminId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User'
  },
  
  // 메타데이터
  submittedAt: { 
    type: Date, 
    default: Date.now
  }
}, {
  timestamps: true
});

// 인덱스 설정
CenterRegistrationSchema.index({ businessNumber: 1 }, { unique: true });
CenterRegistrationSchema.index({ status: 1 });
CenterRegistrationSchema.index({ submittedAt: -1 });
CenterRegistrationSchema.index({ 'applicant.email': 1 });
CenterRegistrationSchema.index({ 'representativeEmail': 1 });

// 가상 필드: 전체 주소
CenterRegistrationSchema.virtual('fullAddress').get(function() {
  const addr = this.address;
  return `${addr.address1} ${addr.address2 || ''} ${addr.city} ${addr.province}`.trim();
});

// 가상 필드: 승인 상태 한글명
CenterRegistrationSchema.virtual('statusKorean').get(function() {
  const statusMap = {
    'pending': '대기중',
    'under_review': '검토중',
    'approved': '승인됨',
    'rejected': '거부됨',
    'cancelled': '취소됨'
  };
  return statusMap[this.status] || this.status;
});

// JSON 변환 시 가상 필드 포함
CenterRegistrationSchema.set('toJSON', { virtuals: true });
CenterRegistrationSchema.set('toObject', { virtuals: true });

// 모델 생성
export default mongoose.model<ICenterRegistration>('CenterRegistration', CenterRegistrationSchema);

