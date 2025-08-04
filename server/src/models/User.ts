import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    default: '',
  },
  userType: {
    type: String,
    enum: ['member', 'instructor', 'admin'],
    default: 'member',
  },
  // 강사 전용 필드
  experience: {
    type: String,
    default: '',
  },
  certifications: {
    type: String,
    default: '',
  },
  specialties: {
    type: String,
    default: '',
  },
  // 센터 관리자 전용 필드
  centerName: {
    type: String,
    default: '',
  },
  centerAddress: {
    type: String,
    default: '',
  },
  centerPhone: {
    type: String,
    default: '',
  },
  // 공통 필드
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLoginAt: {
    type: Date,
    default: null,
  },
}, { 
  timestamps: true 
});

// 이메일과 userId 중복 체크를 위한 인덱스
userSchema.index({ email: 1 });
userSchema.index({ userId: 1 });

export const User = mongoose.model('User', userSchema);
