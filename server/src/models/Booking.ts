import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  laneNumber: {
    type: Number,
    required: true,
  },
  purpose: {
    type: String,
    enum: ['practice', 'lesson', 'competition', 'other'],
    default: 'practice',
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending',
  },
  notes: {
    type: String,
    default: '',
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
  },
}, { 
  timestamps: true 
});

// 날짜와 시간으로 인덱스 생성
bookingSchema.index({ date: 1, startTime: 1, endTime: 1 });
bookingSchema.index({ user: 1, date: 1 });

export const Booking = mongoose.model('Booking', bookingSchema); 