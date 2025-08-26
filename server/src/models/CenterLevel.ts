import mongoose, { Schema, Document } from 'mongoose';

export interface ICenterLevel extends Document {
  centerId: mongoose.Types.ObjectId;
  name: string;           // 레벨 이름 (예: "입문", "기초", "마스터")
  displayName: string;    // 표시용 이름 (예: "입문반", "기초반")
  order: number;          // 정렬 순서
  color: string;          // UI 색상 (예: "blue", "green", "red")
  description?: string;   // 레벨 설명
  isActive: boolean;      // 활성화 여부
  createdAt: Date;
  updatedAt: Date;
}

const centerLevelSchema = new Schema<ICenterLevel>({
  centerId: {
    type: Schema.Types.ObjectId,
    ref: 'SwimmingCenter',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  order: {
    type: Number,
    required: true,
    default: 0
  },
  color: {
    type: String,
    required: true,
    default: 'blue'
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// 센터별로 레벨 이름은 유일해야 함
centerLevelSchema.index({ centerId: 1, name: 1 }, { unique: true });

// 센터별로 정렬 순서도 유일해야 함
centerLevelSchema.index({ centerId: 1, order: 1 }, { unique: true });

export default mongoose.model<ICenterLevel>('CenterLevel', centerLevelSchema);
