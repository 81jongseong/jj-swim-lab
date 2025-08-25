import mongoose, { Schema, Document } from 'mongoose';

export interface ICenterLevel extends Document {
  centerId: mongoose.Types.ObjectId;
  levelName: string; // 레벨 이름 (입문, 기초, 초급, 중급, 상급, 마스터 등)
  levelOrder: number; // 레벨 순서 (1, 2, 3, 4, 5, 6...)
  levelColor: string; // 레벨별 색상 (bg-green-500, bg-yellow-500, bg-red-500 등)
  description?: string; // 레벨 설명
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CenterLevelSchema = new Schema<ICenterLevel>({
  centerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  levelName: {
    type: String,
    required: true,
    trim: true
  },
  levelOrder: {
    type: Number,
    required: true,
    min: 1
  },
  levelColor: {
    type: String,
    required: true,
    trim: true,
    default: 'bg-gray-500'
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

// 센터별로 레벨 순서가 유일해야 함
CenterLevelSchema.index({ centerId: 1, levelOrder: 1 }, { unique: true });

export default mongoose.model<ICenterLevel>('CenterLevel', CenterLevelSchema);
