import mongoose, { Document, Schema } from 'mongoose';

export interface ICenter extends Document {
  name: string;
  address: string;
  phone: string;
  email: string;
  managerId: mongoose.Types.ObjectId;
  instructors: mongoose.Types.ObjectId[];
  students: mongoose.Types.ObjectId[];
  courses: mongoose.Types.ObjectId[];
  capacity: number;
  status: 'active' | 'inactive' | 'maintenance';
  facilities: string[];
  operatingHours: {
    open: string;
    close: string;
    days: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const centerSchema = new Schema<ICenter>({
  name: {
    type: String,
    required: true,
    unique: true,
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
    trim: true,
    lowercase: true
  },
  managerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  instructors: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  students: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  courses: [{
    type: Schema.Types.ObjectId,
    ref: 'Course'
  }],
  capacity: {
    type: Number,
    default: 100,
    min: 1
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
  },
  facilities: [{
    type: String,
    trim: true
  }],
  operatingHours: {
    open: {
      type: String,
      default: '09:00'
    },
    close: {
      type: String,
      default: '22:00'
    },
    days: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      default: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    }]
  }
}, {
  timestamps: true
});

// 인덱스 생성
centerSchema.index({ name: 1 });
centerSchema.index({ managerId: 1 });
centerSchema.index({ status: 1 });

export const Center = mongoose.model<ICenter>('Center', centerSchema);
export default Center;
