import mongoose, { Schema, Document } from 'mongoose';

export interface ITeachingMethod extends Document {
  name: string;
  description: string;
  category: string;
  level: string; // 자유로운 레벨 설정 (입문, 기초, 초급, 중급, 상급, 마스터 등)
  steps: string[];
  tips: string[];
  videoUrl?: string;
  imageUrl?: string;
  createdBy?: mongoose.Types.ObjectId;
  isActive: boolean;
  order?: number; // 순서 정보 추가
  createdAt: Date;
  updatedAt: Date;
}

const TeachingMethodSchema = new Schema<ITeachingMethod>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  level: {
    type: String,
    required: true,
    trim: true,
    default: '초급'
  },
  steps: [{
    type: String,
    trim: true
  }],
  tips: [{
    type: String,
    trim: true
  }],
  videoUrl: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
    trim: true
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
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.model<ITeachingMethod>('TeachingMethod', TeachingMethodSchema);

