/**
 * @file JJ Swim Lab - YouTube 비디오 모델
 * 
 * 📋 **모델 목적**
 * - JJ Swim Lab 시스템의 YouTube 비디오 정보를 관리하는 핵심 모델
 * - 강습법과 연결된 YouTube 비디오 관리
 * - 비디오 메타데이터 및 썸네일 정보 저장
 * - 카테고리별 및 레벨별 비디오 분류
 * - 비디오 활성화 상태 관리
 * 
 * 🔄 **주요 기능**
 * - 비디오 기본 정보 관리 (제목, 설명, YouTube ID)
 * - 썸네일 URL 및 재생 시간 관리
 * - 카테고리 및 레벨 분류
 * - 강습법과의 연결 관계 관리
 * - 비디오 활성화 상태 관리
 * - 생성일 및 업데이트일 추적
 * 
 * 🗄️ **데이터 연동**
 * - TeachingMethod 모델과 연동 (강습법 연결)
 * - User 모델과 연동 (생성자 정보)
 * - youtube-videos API와 연동
 * 
 * 🛠️ **필요한 설치 파일**
 * - Mongoose 7.8.7
 * - MongoDB Atlas (데이터 저장)
 * - TeachingMethod 모델 (강습법 연결)
 * - User 모델 (생성자 정보)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. YouTube URL에서 비디오 ID 추출 검증
 * 2. 썸네일 URL 자동 생성 및 검증
 * 3. 비디오 활성화 상태 관리
 * 4. 카테고리 및 레벨 분류 일관성 유지
 * 5. 강습법과의 연결 관계 무결성 보장
 * 6. 인덱스 최적화 및 검색 성능 고려
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] YouTube 비디오 스키마 검증
 * - [ ] 비디오 ID 추출 로직 확인
 * - [ ] 썸네일 URL 생성 확인
 * - [ ] 카테고리 및 레벨 분류 확인
 * - [ ] 강습법 연결 관계 확인
 * - [ ] API 엔드포인트와의 연동 확인
 * 
 * 📅 **개발 히스토리**
 * - 2025-01-13: 초기 YouTube 비디오 모델 구현
 * - 2025-01-13: 강습법 연결 시스템 구현
 * - 2025-01-13: 썸네일 자동 생성 시스템 구현
 * - 2025-01-13: 카테고리별 분류 시스템 구현
 * - 2025-01-13: 비디오 검색 및 필터링 기능 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2025-01-13
 * - 상태: ✅ 완성 (YouTube 비디오 모델 완료)
 * 
 * 🚀 **다음 단계**
 * - YouTube API 연동으로 메타데이터 자동 수집
 * - 비디오 재생 통계 및 분석
 * - 비디오 추천 시스템
 * - 플레이리스트 관리 기능
 * - 비디오 북마크 및 즐겨찾기 기능
 * 
 * 💡 **사용 예시**
 * ```typescript
 * // YouTube 비디오 생성
 * const video = new YouTubeVideo({
 *   title: '자유형 기초 강습',
 *   description: '자유형 수영의 기본 자세를 배우는 강습',
 *   videoId: 'dQw4w9WgXcQ',
 *   category: '자유형',
 *   level: 'beginner',
 *   teachingMethodId: teachingMethodId
 * });
 * 
 * // 비디오 조회
 * const videos = await YouTubeVideo.find({ category: '자유형' });
 * 
 * // 강습법별 비디오 조회
 * const methodVideos = await YouTubeVideo.find({ teachingMethodId });
 * ```
 * 
 * 🔍 **YouTube 비디오 데이터 처리 흐름**
 * 1. YouTube URL 입력 및 비디오 ID 추출
 * 2. 썸네일 URL 자동 생성
 * 3. 비디오 메타데이터 저장
 * 4. 카테고리 및 레벨 분류
 * 5. 강습법과의 연결 관계 설정
 * 6. 비디오 활성화 및 검색 최적화
 * 7. 비디오 재생 및 통계 수집
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IYouTubeVideo extends Document {
  title: string;
  description: string;
  videoId: string; // YouTube 비디오 ID
  thumbnailUrl: string; // 썸네일 URL
  duration: string; // 재생 시간 (예: "5:30")
  category: string; // 카테고리 (자유형, 배영, 평영 등)
  level: string; // 레벨 (beginner, intermediate, advanced)
  teachingMethodId?: mongoose.Types.ObjectId; // 연결된 강습법 ID
  createdBy?: mongoose.Types.ObjectId; // 생성자 ID
  isActive: boolean; // 활성화 상태
  viewCount?: number; // 조회수 (선택사항)
  likeCount?: number; // 좋아요 수 (선택사항)
  tags?: string[]; // 태그 (선택사항)
  createdAt: Date;
  updatedAt: Date;
}

const YouTubeVideoSchema = new Schema<IYouTubeVideo>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  videoId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  thumbnailUrl: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true,
    enum: ['자유형', '배영', '평영', '접영', '혼영', '기초기술', '호흡법', '발차기', '손짓', '턴', '스타트', '안전수칙', '체력향상', '기타']
  },
  level: {
    type: String,
    required: true,
    trim: true,
    enum: ['beginner', 'intermediate', 'advanced', '초급', '중급', '고급']
  },
  teachingMethodId: {
    type: Schema.Types.ObjectId,
    ref: 'TeachingMethod',
    required: false
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  viewCount: {
    type: Number,
    default: 0
  },
  likeCount: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// 인덱스 설정
YouTubeVideoSchema.index({ videoId: 1 });
YouTubeVideoSchema.index({ category: 1 });
YouTubeVideoSchema.index({ level: 1 });
YouTubeVideoSchema.index({ teachingMethodId: 1 });
YouTubeVideoSchema.index({ isActive: 1 });
YouTubeVideoSchema.index({ createdAt: -1 });

export const YouTubeVideo = mongoose.model<IYouTubeVideo>('YouTubeVideo', YouTubeVideoSchema);

