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
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
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
  introduction: {
    type: String,
  },
  guide: {
    type: String,
  },
  facilities: {
    // 메인 수영장
    mainPool: {
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
    },
    // 유아풀
    kidsPool: {
      hasKidsPool: {
        type: Boolean,
        default: false,
      },
      kidsPoolLanes: {
        type: Number,
        default: 0,
      },
      kidsPoolLength: {
        type: Number,
        default: 0,
      },
      kidsPoolDepth: {
        type: Number,
        default: 0,
      },
      kidsPoolTemperature: {
        type: Number,
        default: 0,
      },
    },
    // 엔드리스 풀
    endlessPool: {
      hasEndlessPool: {
        type: Boolean,
        default: false,
      },
      endlessPoolCount: {
        type: Number,
        default: 0,
      },
      endlessPoolLength: {
        type: Number,
        default: 0,
      },
      endlessPoolWidth: {
        type: Number,
        default: 0,
      },
    },
    // 부대시설
    amenities: {
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
      hasJacuzzi: {
        type: Boolean,
        default: false,
      },
      hasSteamRoom: {
        type: Boolean,
        default: false,
      },
      hasFitnessRoom: {
        type: Boolean,
        default: false,
      },
      hasCafeteria: {
        type: Boolean,
        default: false,
      },
      hasParking: {
        type: Boolean,
        default: false,
      },
      parkingSpaces: {
        type: Number,
        default: 0,
      },
      additionalFacilities: {
        type: String,
        default: '',
      },
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
  // 지역 정보 (검색 및 필터링용)
  province: {
    type: String,
  },
  city: {
    type: String,
  },
  gu: {
    type: String,
  },
  dong: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  images: [{
    url: String,
    caption: String,
  }],
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  instructors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { 
  timestamps: true 
});

// 위치 기반 검색을 위한 인덱스
swimmingCenterSchema.index({ location: '2dsphere' });

export const SwimmingCenter = mongoose.models.SwimmingCenter || mongoose.model('SwimmingCenter', swimmingCenterSchema); 