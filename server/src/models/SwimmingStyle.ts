/**
 * 🏊‍♂️ 수영 영법 모델
 * 
 * 📋 용도: 3D 뷰어에서 사용할 영법 데이터 관리
 * 
 * 🔄 연동:
 * - /admin/3d-viewer/swimming-styles (관리)
 * - /3d-viewer (체험 - isPublicDemo=true만)
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface ISwimmingStyle extends Document {
  name: string; // 영법 영어명 (예: freestyle)
  displayName: string; // 한글명 (예: 자유형)
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isActive: boolean;
  isPublicDemo: boolean; // 체험 모드 공개 여부
  modelUrl?: string; // 3D 모델 파일 URL (GLB/GLTF)
  poster?: string; // 썸네일 이미지
  tags?: string[]; // 태그 (예: 속도, 초보자 추천)
  cues?: string[]; // 코칭 큐
  cautions?: string[]; // 주의사항
  createdAt: Date;
  updatedAt: Date;
}

const swimmingStyleSchema = new Schema<ISwimmingStyle>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPublicDemo: {
    type: Boolean,
    default: false
  },
  modelUrl: {
    type: String,
    trim: true
  },
  poster: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  cues: [{
    type: String,
    trim: true
  }],
  cautions: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

export const SwimmingStyle = mongoose.models.SwimmingStyle || mongoose.model<ISwimmingStyle>('SwimmingStyle', swimmingStyleSchema);

