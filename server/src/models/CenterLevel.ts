import mongoose, { Schema, Document } from 'mongoose';

export interface ICenterLevel extends Document {
  centerId: string;
  levels: {
    name: string;
    order: number;
    description?: string;
    color?: string;
  }[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CenterLevelSchema = new Schema<ICenterLevel>({
  centerId: {
    type: String,
    required: true
  },
  levels: [{
    name: {
      type: String,
      required: true
    },
    order: {
      type: Number,
      required: true
    },
    description: String,
    color: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// 센터별로 유니크하게 설정
CenterLevelSchema.index({ centerId: 1 }, { unique: true });

export const CenterLevel = mongoose.model<ICenterLevel>('CenterLevel', CenterLevelSchema);
