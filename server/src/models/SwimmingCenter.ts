import mongoose from 'mongoose';

const swimmingCenterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  location: {
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  website: {
    type: String,
  },
  description: {
    type: String,
  },
  facilities: {
    lanes: {
      type: Number,
      required: true,
    },
    poolLength: {
      type: Number, // 미터
      required: true,
    },
    poolDepth: {
      type: Number, // 미터
      required: true,
    },
    temperature: {
      type: Number, // 섭씨
      required: true,
    },
    hasSauna: {
      type: Boolean,
      default: false,
    },
    hasShower: {
      type: Boolean,
      default: true,
    },
    hasLocker: {
      type: Boolean,
      default: true,
    },
  },
  operatingHours: {
    monday: {
      open: String,
      close: String,
      isOpen: { type: Boolean, default: true },
    },
    tuesday: {
      open: String,
      close: String,
      isOpen: { type: Boolean, default: true },
    },
    wednesday: {
      open: String,
      close: String,
      isOpen: { type: Boolean, default: true },
    },
    thursday: {
      open: String,
      close: String,
      isOpen: { type: Boolean, default: true },
    },
    friday: {
      open: String,
      close: String,
      isOpen: { type: Boolean, default: true },
    },
    saturday: {
      open: String,
      close: String,
      isOpen: { type: Boolean, default: true },
    },
    sunday: {
      open: String,
      close: String,
      isOpen: { type: Boolean, default: true },
    },
  },
  pricing: {
    freeSwim: {
      adult: Number,
      child: Number,
      student: Number,
    },
    lesson: {
      perSession: Number,
      monthly: Number,
    },
  },
  currentCapacity: {
    type: Number,
    default: 0,
  },
  maxCapacity: {
    type: Number,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  images: [{
    url: String,
    caption: String,
  }],
}, { 
  timestamps: true 
});

// 위치 기반 검색을 위한 인덱스
swimmingCenterSchema.index({ location: '2dsphere' });

export const SwimmingCenter = mongoose.model('SwimmingCenter', swimmingCenterSchema); 