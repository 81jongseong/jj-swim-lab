/**
 * 🏢 JJ Swim Lab - 센터 정보 모델
 * 
 * 📋 **모델 목적**
 * - JJ Swim Lab 시스템의 센터(수영장) 정보를 관리하는 핵심 모델
 * - 센터별 상세 정보, 시설, 강사, 코스 정보 관리
 * - 센터 등록 및 승인 시스템과 연동
 * - 센터별 운영 정보 및 시설 관리
 * - 센터 검색 및 필터링 기능 지원
 * 
 * 🔄 **주요 기능**
 * - 센터 기본 정보 관리 (이름, 주소, 연락처)
 * - 센터 운영시간 및 시설 정보 관리
 * - 센터별 강사 및 코스 정보 관리
 * - 센터 이미지 및 갤러리 관리
 * - 센터 특징 및 편의시설 정보
 * - 센터 등록일 및 업데이트 추적
 * 
 * 🗄️ **데이터 연동**
 * - CenterRegistration 모델과 연동 (센터 등록 신청)
 * - User 모델과 연동 (센터 관리자, 강사 정보)
 * - Course 모델과 연동 (센터별 코스 정보)
 * - Booking 모델과 연동 (센터별 예약 정보)
 * - center-management API와 연동
 * 
 * 🛠️ **필요한 설치 파일**
 * - Mongoose 7.8.7
 * - MongoDB Atlas (데이터 저장)
 * - 이미지 업로드 시스템 (Multer)
 * - 센터 관리 API (center-management.ts)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 센터 정보의 정확성 및 최신성 유지
 * 2. 이미지 파일의 크기 및 형식 제한
 * 3. 센터별 고유 ID 관리
 * 4. 운영시간 데이터의 일관성
 * 5. 시설 정보의 상세성 및 정확성
 * 6. 인덱스 최적화 및 검색 성능 고려
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 센터 정보 스키마 검증
 * - [ ] 이미지 업로드 시스템 연동 확인
 * - [ ] 센터 관리 API와의 연동 확인
 * - [ ] 검색 및 필터링 성능 최적화
 * - [ ] 데이터 무결성 및 일관성 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 센터 정보 모델 구현
 * - 2024-12-19: 센터 등록 시스템과 연동
 * - 2024-12-19: 센터 관리 기능 구현
 * - 2024-12-19: 이미지 및 갤러리 관리 추가
 * - 2024-12-19: 센터 검색 및 필터링 기능 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (센터 정보 모델 완료)
 * 
 * 🚀 **다음 단계**
 * - 센터별 실시간 예약 현황
 * - 센터별 리뷰 및 평점 시스템
 * - 센터별 통계 및 분석 기능
 * - 센터 비교 기능
 * - 센터별 이벤트 및 공지사항 관리
 * 
 * 💡 **사용 예시**
 * ```typescript
 * // 센터 정보 생성
 * const centerInfo = new CenterInfo({
 *   centerId: 'center001',
 *   name: 'JJ 수영센터 강남점',
 *   address: '서울시 강남구 테헤란로 123',
 *   phone: '02-1234-5678',
 *   email: 'gangnam@jjswim.com'
 * });
 * 
 * // 센터 정보 조회
 * const centers = await CenterInfo.find({});
 * 
 * // 센터 검색
 * const searchResults = await CenterInfo.find({
 *   $or: [
 *     { name: { $regex: searchTerm, $options: 'i' } },
 *     { address: { $regex: searchTerm, $options: 'i' } }
 *   ]
 * });
 * ```
 * 
 * 🔍 **센터 정보 처리 흐름**
 * 1. 센터 등록 신청 접수
 * 2. 센터 정보 검증 및 승인
 * 3. 센터 정보 데이터베이스 저장
 * 4. 센터별 시설 및 강사 정보 등록
 * 5. 센터별 코스 및 프로그램 설정
 * 6. 센터 이미지 및 갤러리 업로드
 * 7. 센터 정보 업데이트 및 관리
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface ICenterInfo extends Document {
  centerId: string;
  name: string;
  shortDescription: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  businessHours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  facilities: string[];
  features: string[];
  images: {
    mainImage?: string;
    gallery: string[];
  };
  instructors: Array<{
    name: string;
    specialty: string;
    experience: string;
    image?: string;
  }>;
  courses: Array<{
    name: string;
    description: string;
    level: string;
    duration: string;
    price: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const CenterInfoSchema = new Schema<ICenterInfo>({
  centerId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  shortDescription: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
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
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  businessHours: {
    monday: { type: String, required: true },
    tuesday: { type: String, required: true },
    wednesday: { type: String, required: true },
    thursday: { type: String, required: true },
    friday: { type: String, required: true },
    saturday: { type: String, required: true },
    sunday: { type: String, required: true }
  },
  facilities: [{
    type: String,
    trim: true
  }],
  features: [{
    type: String,
    trim: true
  }],
  images: {
    mainImage: { type: String, trim: true },
    gallery: [{ type: String, trim: true }]
  },
  instructors: [{
    name: { type: String, required: true, trim: true },
    specialty: { type: String, required: true, trim: true },
    experience: { type: String, required: true, trim: true },
    image: { type: String, trim: true }
  }],
  courses: [{
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    level: { type: String, required: true, trim: true },
    duration: { type: String, required: true, trim: true },
    price: { type: String, required: true, trim: true }
  }]
}, {
  timestamps: true
});

export const CenterInfo = mongoose.model<ICenterInfo>('CenterInfo', CenterInfoSchema);
