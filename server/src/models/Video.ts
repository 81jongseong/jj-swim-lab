/**
 * 🎥 JJ Swim Lab - 동영상 피드백 모델
 * 
 * 📋 **모델 목적**
 * - 회원이 업로드한 유튜브 동영상 링크 저장
 * - 강사 및 회원들의 피드백 수집
 * - 공개 범위 설정 (본인 센터 강사, 모든 강사, 센터 회원, 전체 회원)
 * 
 * 🔄 **연동 파일**
 * - server/src/routes/uploads.ts (동영상 업로드/조회 API)
 * - client/app/video-feedback/page.tsx (동영상 피드백 페이지)
 * - client/app/community/page.tsx (커뮤니티 통합)
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IVideo extends Document {
  owner?: mongoose.Types.ObjectId; // 업로드한 회원
  ownerCenterId?: mongoose.Types.ObjectId; // 회원이 속한 센터
  
  // ⭐ 유튜브 링크 저장 (파일 업로드 대신)
  youtubeUrl: string; // 유튜브 URL (필수)
  title?: string; // 동영상 제목
  description?: string; // 동영상 설명
  
  // 공개 범위 설정 (복수 선택 가능)
  visibility: {
    myCenterInstructors: boolean; // 본인 센터 강사만
    allInstructors: boolean; // 모든 센터 강사
    myCenterMembers: boolean; // 본인 센터 회원들
    allMembers: boolean; // 모든 회원들
  };
  
  // 분석 요청 설정
  analysisRequest: {
    type: 'public' | 'center' | 'specific'; // 공개, 센터, 특정 강사
    requestedInstructors?: mongoose.Types.ObjectId[]; // 특정 강사 ID 배열
    analysisFee?: number; // 분석 요청 비용 (특정 강사 요청 시)
    paymentId?: mongoose.Types.ObjectId; // 결제 ID (과금된 경우)
    paymentStatus?: 'pending' | 'completed' | 'failed'; // 결제 상태
  };
  
  // 피드백 시스템
  feedbacks: {
    reviewer: mongoose.Types.ObjectId; // 피드백 작성자
    reviewerType: 'instructor' | 'member'; // 강사 또는 회원
    reviewerCenterId?: mongoose.Types.ObjectId; // 피드백 작성자 센터
    content: string; // 피드백 내용
    rating?: number; // 평가 점수 (1-5)
    createdAt: Date;
  }[];
  
  // 기존 필드 (하위 호환성 유지)
  status?: 'pending' | 'reviewed';
  analysisResult?: any;
  feedback?: string; // 단일 피드백 (하위 호환성)
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  reviews?: {
    reviewedBy: mongoose.Types.ObjectId;
    feedback?: string;
    analysisResult?: any;
    visibility?: 'private' | 'center' | 'public';
    reviewedAt: Date;
  }[];
  
  createdAt: Date;
  updatedAt: Date;
}

const videoSchema = new Schema<IVideo>({
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  ownerCenterId: { type: Schema.Types.ObjectId, ref: 'Center' },
  
  // ⭐ 유튜브 링크 (필수)
  youtubeUrl: { type: String, required: true },
  title: { type: String },
  description: { type: String },
  
  // 공개 범위 설정
  visibility: {
    myCenterInstructors: { type: Boolean, default: false },
    allInstructors: { type: Boolean, default: false },
    myCenterMembers: { type: Boolean, default: false },
    allMembers: { type: Boolean, default: false }
  },
  
  // 분석 요청 설정
  analysisRequest: {
    type: { type: String, enum: ['public', 'center', 'specific'], default: 'public' },
    requestedInstructors: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    analysisFee: { type: Number, default: 0 },
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
    paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' }
  },
  
  // 피드백 배열
  feedbacks: [{
    reviewer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reviewerType: { type: String, enum: ['instructor', 'member'], required: true },
    reviewerCenterId: { type: Schema.Types.ObjectId, ref: 'Center' },
    content: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5 },
    createdAt: { type: Date, default: Date.now }
  }],
  
  // 하위 호환성을 위한 기존 필드 (선택적)
  status: { type: String, enum: ['pending', 'reviewed'], default: 'pending' },
  analysisResult: Schema.Types.Mixed,
  feedback: { type: String },
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
  reviews: [{
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    feedback: { type: String },
    analysisResult: Schema.Types.Mixed,
    visibility: { type: String, enum: ['private', 'center', 'public'] },
    reviewedAt: { type: Date, required: true },
  }],
}, { timestamps: true });

// 인덱스 추가
videoSchema.index({ owner: 1, createdAt: -1 });
videoSchema.index({ ownerCenterId: 1, createdAt: -1 });
videoSchema.index({ 'visibility.allMembers': 1, createdAt: -1 });

export const Video = mongoose.model<IVideo>('Video', videoSchema);
export default Video;


