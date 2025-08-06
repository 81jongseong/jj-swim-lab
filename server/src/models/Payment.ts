import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'KRW',
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'cash', 'transfer', 'online'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
  },
  purpose: {
    type: String,
    enum: ['course', 'booking', 'membership', 'other'],
    required: true,
  },
  relatedCourse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
  },
  relatedBooking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
  },
  transactionId: {
    type: String,
    unique: true,
  },
  receiptUrl: {
    type: String,
  },
  notes: {
    type: String,
    default: '',
  },
  processedAt: {
    type: Date,
  },
}, { 
  timestamps: true 
});

// 사용자별 결제 내역 조회를 위한 인덱스
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });

export const Payment = mongoose.model('Payment', paymentSchema); 