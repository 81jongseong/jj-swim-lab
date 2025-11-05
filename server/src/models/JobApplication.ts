/**
 * 💼 JJ Swim Lab - 구인구직 지원 모델
 * 
 * 📋 **모델 목적**:
 * - 구인구직 게시글에 대한 강사 지원 정보 관리
 * - 지원 상태 관리 (지원, 서류 통과, 면접, 최종 합격 등)
 * - 면접 일정 관리 및 알림 전송
 * 
 * 🔗 **연동 파일**:
 * - server/src/routes/job-board.ts (지원 API)
 * - server/src/models/Community.ts (구인구직 게시글)
 * - server/src/models/User.ts (강사, 센터 정보)
 * - server/src/models/Notification.ts (면접 알림)
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IJobApplication extends Document {
  // 지원 정보
  postId: mongoose.Types.ObjectId; // 구인구직 게시글 ID
  applicantId: mongoose.Types.ObjectId; // 지원자(강사) ID
  centerId?: mongoose.Types.ObjectId; // 센터 ID (구인 게시글의 센터)
  
  // 지원 상태
  status: 'applied' | 'document_passed' | 'document_failed' | 'interview_scheduled' | 'interview_passed' | 'interview_failed' | 'final_passed' | 'final_failed' | 'withdrawn';
  
  // 지원 내용
  coverLetter?: string; // 자기소개서
  resume?: string; // 이력서 (URL 또는 텍스트)
  
  // 면접 정보
  interviewDate?: Date; // 면접 날짜
  interviewTime?: string; // 면접 시간
  interviewLocation?: string; // 면접 장소
  interviewNotes?: string; // 면접 메모
  
  // 평가 정보
  documentScore?: number; // 서류 평가 점수
  interviewScore?: number; // 면접 평가 점수
  totalScore?: number; // 총점
  evaluationNotes?: string; // 평가 메모
  
  // 알림 정보
  notificationSent?: boolean; // 면접 알림 전송 여부
  notificationSentAt?: Date; // 알림 전송 시간
  
  // 메타데이터
  createdAt: Date;
  updatedAt: Date;
}

const jobApplicationSchema = new Schema<IJobApplication>({
  postId: {
    type: Schema.Types.ObjectId,
    ref: 'CommunityPost',
    required: true,
    index: true
  },
  applicantId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  centerId: {
    type: Schema.Types.ObjectId,
    ref: 'SwimmingCenter',
    index: true
  },
  status: {
    type: String,
    enum: ['applied', 'document_passed', 'document_failed', 'interview_scheduled', 'interview_passed', 'interview_failed', 'final_passed', 'final_failed', 'withdrawn'],
    default: 'applied',
    required: true,
    index: true
  },
  coverLetter: {
    type: String,
    maxlength: 2000
  },
  resume: {
    type: String
  },
  interviewDate: {
    type: Date
  },
  interviewTime: {
    type: String
  },
  interviewLocation: {
    type: String
  },
  interviewNotes: {
    type: String,
    maxlength: 1000
  },
  documentScore: {
    type: Number,
    min: 0,
    max: 100
  },
  interviewScore: {
    type: Number,
    min: 0,
    max: 100
  },
  totalScore: {
    type: Number,
    min: 0,
    max: 200
  },
  evaluationNotes: {
    type: String,
    maxlength: 1000
  },
  notificationSent: {
    type: Boolean,
    default: false
  },
  notificationSentAt: {
    type: Date
  }
}, {
  timestamps: true,
  collection: 'job_applications'
});

// 복합 인덱스: 중복 지원 방지
jobApplicationSchema.index({ postId: 1, applicantId: 1 }, { unique: true });

// 센터별 지원 목록 조회용 인덱스
jobApplicationSchema.index({ centerId: 1, status: 1, createdAt: -1 });

export const JobApplication = mongoose.models.JobApplication || mongoose.model<IJobApplication>('JobApplication', jobApplicationSchema);

