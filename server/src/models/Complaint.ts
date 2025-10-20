/**
 * 🏢 JJ Swim Lab - 민원 관리 모델
 * 
 * 📋 **모델 목적**
 * - 센터 회원들의 민원을 체계적으로 관리
 * - 익명/실명 민원 모두 지원
 * - 민원 처리 절차 및 담당자 관리
 * - 민원 해결 진행 상황 추적
 * 
 * 🔄 **주요 기능**
 * - 민원 접수 (익명/실명)
 * - 민원 검토 및 담당자 배정
 * - 민원 처리 진행 상황 관리
 * - 민원 해결 및 완료 처리
 * 
 * 🗄️ **연동 데이터**
 * - User (민원 제기자, 담당자)
 * - SwimmingCenter (센터 정보)
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IComplaint extends Document {
  centerId: mongoose.Types.ObjectId; // 센터 ID
  
  // 민원 제기자 정보
  isAnonymous: boolean; // 익명 여부
  reporterId?: mongoose.Types.ObjectId; // 제기자 ID (실명인 경우)
  reporterName?: string; // 제기자 이름 (익명인 경우 "익명")
  reporterEmail?: string; // 제기자 이메일 (익명인 경우 임시 이메일)
  reporterPhone?: string; // 제기자 전화번호 (선택)
  
  // 민원 내용
  title: string; // 민원 제목
  content: string; // 민원 상세 내용
  category: 'facility' | 'instructor' | 'service' | 'schedule' | 'payment' | 'safety' | 'other'; // 민원 카테고리
  priority: 'low' | 'medium' | 'high' | 'urgent'; // 우선순위
  
  // 민원 처리 상태
  status: 'pending' | 'reviewing' | 'assigned' | 'in_progress' | 'resolved' | 'closed'; // 처리 상태
  
  // 담당자 정보
  assignedTo?: mongoose.Types.ObjectId; // 담당자 ID
  assignedToName?: string; // 담당자 이름
  assignedAt?: Date; // 배정 일시
  
  // 민원 처리 진행사항
  progressNotes: Array<{
    content: string; // 진행 내용
    createdBy: mongoose.Types.ObjectId; // 작성자 ID
    createdByName: string; // 작성자 이름
    createdAt: Date; // 작성 일시
    status: 'pending' | 'reviewing' | 'assigned' | 'in_progress' | 'resolved' | 'closed'; // 해당 시점 상태
  }>;
  
  // 체크리스트 (담당자 업무)
  checklist: Array<{
    task: string; // 업무 내용
    isCompleted: boolean; // 완료 여부
    completedBy?: mongoose.Types.ObjectId; // 완료자 ID
    completedByName?: string; // 완료자 이름
    completedAt?: Date; // 완료 일시
  }>;
  
  // 해결 정보
  resolution?: string; // 해결 방법 및 결과
  resolvedAt?: Date; // 해결 일시
  resolvedBy?: mongoose.Types.ObjectId; // 해결자 ID
  resolvedByName?: string; // 해결자 이름
  
  // 민원 평가 (제기자 만족도)
  satisfactionRating?: 1 | 2 | 3 | 4 | 5; // 만족도 평가 (1: 매우 불만족, 5: 매우 만족)
  satisfactionComment?: string; // 만족도 코멘트
  
  // 첨부파일
  attachments?: Array<{
    fileName: string;
    fileUrl: string;
    fileType: string;
    uploadedAt: Date;
  }>;
  
  // 메타 정보
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date; // 종결 일시
}

const ComplaintSchema = new Schema<IComplaint>({
  centerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'SwimmingCenter', 
    required: true,
    index: true 
  },
  
  // 민원 제기자 정보
  isAnonymous: { type: Boolean, default: false },
  reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reporterName: { type: String, required: true },
  reporterEmail: { type: String },
  reporterPhone: { type: String },
  
  // 민원 내용
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['facility', 'instructor', 'service', 'schedule', 'payment', 'safety', 'other'],
    required: true 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium' 
  },
  
  // 민원 처리 상태
  status: { 
    type: String, 
    enum: ['pending', 'reviewing', 'assigned', 'in_progress', 'resolved', 'closed'],
    default: 'pending',
    index: true 
  },
  
  // 담당자 정보
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedToName: { type: String },
  assignedAt: { type: Date },
  
  // 민원 처리 진행사항
  progressNotes: [{
    content: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdByName: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    status: { 
      type: String, 
      enum: ['pending', 'reviewing', 'assigned', 'in_progress', 'resolved', 'closed'],
      required: true 
    }
  }],
  
  // 체크리스트
  checklist: [{
    task: { type: String, required: true },
    isCompleted: { type: Boolean, default: false },
    completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    completedByName: { type: String },
    completedAt: { type: Date }
  }],
  
  // 해결 정보
  resolution: { type: String },
  resolvedAt: { type: Date },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedByName: { type: String },
  
  // 민원 평가
  satisfactionRating: { 
    type: Number, 
    min: 1, 
    max: 5 
  },
  satisfactionComment: { type: String },
  
  // 첨부파일
  attachments: [{
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  closedAt: { type: Date }
}, {
  timestamps: true
});

// 인덱스 설정
ComplaintSchema.index({ centerId: 1, status: 1, createdAt: -1 });
ComplaintSchema.index({ assignedTo: 1, status: 1 });
ComplaintSchema.index({ reporterId: 1 });

export const Complaint = mongoose.model<IComplaint>('Complaint', ComplaintSchema);

