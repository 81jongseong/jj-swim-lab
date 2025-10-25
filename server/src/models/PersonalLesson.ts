/**
 * 🏊‍♂️ JJ Swim Lab - 개인레슨 모델
 * 
 * 개인레슨 신청 및 관리 정보를 저장하는 모델입니다.
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IPersonalLesson extends Document {
  studentId: mongoose.Types.ObjectId;
  instructorId?: mongoose.Types.ObjectId;
  centerId: mongoose.Types.ObjectId;
  date: Date;
  time: string;
  duration: number; // 분 단위
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  lessonType: string; // 'freestyle', 'backstroke', 'breaststroke', 'butterfly'
  skillLevel: string; // 'beginner', 'intermediate', 'advanced'
  goals: string;
  notes?: string;
  price: number;
  specialRequests?: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  assignedLane?: number; // 배정된 레인 번호
  createdAt: Date;
  updatedAt: Date;
}

const personalLessonSchema = new Schema<IPersonalLesson>({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  instructorId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  centerId: {
    type: Schema.Types.ObjectId,
    ref: 'Center',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    default: 60
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  lessonType: {
    type: String,
    required: true
  },
  skillLevel: {
    type: String,
    required: true
  },
  goals: {
    type: String,
    required: true
  },
  notes: {
    type: String
  },
  price: {
    type: Number,
    required: true,
    default: 0
  },
  specialRequests: {
    type: String
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  assignedLane: {
    type: Number,
    min: 1,
    max: 10
  }
}, {
  timestamps: true
});

const PersonalLesson = mongoose.model<IPersonalLesson>('PersonalLesson', personalLessonSchema);
export default PersonalLesson;
export { PersonalLesson };