/**
 * 🏊‍♂️ JJ Swim Lab - 수영 커뮤니티 모델
 * 
 * 📋 **모델 목적**
 * - 수영 커뮤니티의 다양한 소셜 기능 지원
 * - 방별 게시글, 댓글, 좋아요 시스템
 * - 번개모임, 용품 리뷰, 팁 공유 등 특화 기능
 */

import mongoose, { Document, Schema } from 'mongoose';

// 커뮤니티 방 타입
export type RoomType = 'chat' | 'tips' | 'equipment' | 'equipment_reviews' | 'reviews' | 'meetup' | 'job_board';

// 게시글 인터페이스
export interface ICommunityPost extends Document {
  roomType: RoomType;
  title: string;
  content: string;
  authorId: mongoose.Types.ObjectId;
  authorName: string;
  authorRole: 'student' | 'instructor' | 'centerAdmin' | 'superAdmin';
  
  // 이미지/파일 첨부
  attachments: {
    type: 'image' | 'file';
    url: string;
    filename: string;
    size: number;
  }[];
  
  // 상호작용
  likes: mongoose.Types.ObjectId[];
  likesCount: number;
  comments: mongoose.Types.ObjectId[];
  commentsCount: number;
  views: number;
  
  // 방별 특화 필드
  roomSpecific: {
    // 용품 소개방 전용
    equipment?: {
      productName: string;
      brand: string;
      price?: number;
      rating: number;
      purchaseLink?: string;
      category: 'swimsuit' | 'goggles' | 'cap' | 'fins' | 'kickboard' | 'other';
    };
    
    // 용품 후기방 전용
    equipmentReview?: {
      productName: string;
      brand: string;
      model?: string;
      category: 'swimsuit' | 'goggles' | 'cap' | 'fins' | 'kickboard' | 'accessories' | 'other';
      rating: number; // 1-5점
      usagePeriod: string; // '3개월', '1년' 등
      purchasePrice?: number;
      purchaseDate?: Date;
      purchaseLocation?: string;
      
      // 세부 평가
      detailedRating: {
        durability: number; // 내구성
        comfort: number; // 편안함
        performance: number; // 성능
        valueForMoney: number; // 가성비
        design: number; // 디자인
      };
      
      // 장단점
      pros: string[]; // 장점들
      cons: string[]; // 단점들
      
      // 추천 대상
      recommendedFor: ('beginner' | 'intermediate' | 'advanced' | 'competitive')[];
      
      // 구매 정보
      wouldBuyAgain: boolean;
      recommendToOthers: boolean;
      
      // 비교 제품
      comparedProducts?: {
        productName: string;
        brand: string;
        comparison: string;
      }[];
      
      // 사용 후기 이미지
      beforeAfterImages?: {
        before?: string;
        after?: string;
        usage?: string[];
      };
    };
    
    // 번개모임 전용
    meetup?: {
      meetupDate: Date;
      location: string;
      maxParticipants: number;
      currentParticipants: number;
      participants: mongoose.Types.ObjectId[];
      meetupType: 'practice' | 'lesson' | 'competition' | 'social';
      skill_level: 'beginner' | 'intermediate' | 'advanced' | 'all';
      fee?: number;
      status: 'recruiting' | 'confirmed' | 'completed' | 'cancelled';
      
      // 세분화된 수영 정보
      swimmingDetails: {
        // 영법 정보
        strokes: ('freestyle' | 'backstroke' | 'breaststroke' | 'butterfly' | 'medley')[];
        primaryStroke: 'freestyle' | 'backstroke' | 'breaststroke' | 'butterfly' | 'medley';
        
        // 페이스 정보
        pace: {
          type: 'easy' | 'moderate' | 'fast' | 'sprint' | 'mixed';
          description: string;
          targetTime?: string; // 예: "100m 2분"
          restInterval?: number; // 휴식 시간 (초)
        };
        
        // 훈련 구성
        training: {
          warmup: {
            duration: number; // 분
            intensity: 'light' | 'moderate';
            strokes: string[];
          };
          main: {
            sets: {
              distance: number; // 미터
              repetitions: number;
              stroke: string;
              pace: string;
              rest: number; // 초
            }[];
            totalDistance: number;
          };
          cooldown: {
            duration: number;
            type: 'easy_swim' | 'stretching' | 'both';
          };
        };
        
        // 목적 및 초점
        focus: ('technique' | 'endurance' | 'speed' | 'strength' | 'fun' | 'recovery')[];
        primaryGoal: string;
        
        // 수준별 세부 요구사항
        levelRequirements: {
          minimumDistance: number; // 연속으로 수영할 수 있는 최소 거리
          requiredStrokes: string[]; // 필수로 할 줄 알아야 하는 영법
          experienceMonths?: number; // 최소 경험 개월 수
        };
        
        // 장비 요구사항
        equipment: {
          required: string[]; // 필수 장비
          recommended: string[]; // 권장 장비
          provided: string[]; // 제공되는 장비
        };
      };
      
      // 추가 편의 기능
      convenience: {
        carpoolAvailable: boolean; // 카풀 가능
        equipmentSharing: boolean; // 장비 공유 가능
        beginnerFriendly: boolean; // 초보자 환영
        photoSession: boolean; // 사진 촬영 세션
        afterMeetup: string; // 모임 후 계획 (식사, 카페 등)
      };
      
      // 날씨 및 조건
      conditions: {
        weatherDependent: boolean; // 날씨 의존성
        backupPlan?: string; // 우천 시 대안
        minTemperature?: number; // 최소 기온 (야외 수영장)
      };
    };
    
    // 후기방 전용
    review?: {
      centerId?: mongoose.Types.ObjectId;
      instructorId?: mongoose.Types.ObjectId;
      courseId?: mongoose.Types.ObjectId;
      rating: number;
      reviewType: 'center' | 'instructor' | 'course' | 'general';
    };
    
    // 팁방 전용
    tip?: {
      category: 'technique' | 'training' | 'equipment' | 'safety' | 'nutrition';
      difficulty: 'beginner' | 'intermediate' | 'advanced';
      tags: string[];
      isVerified: boolean;
      verifiedBy?: mongoose.Types.ObjectId;
    };
    
    // 구인구직 전용
    jobBoard?: {
      jobType: 'job_post' | 'resume' | 'freelance'; // 구인 / 구직 / 프리랜스
      position: 'instructor' | 'lifeguard' | 'front_desk' | 'office' | 'manager' | 'other'; // 강사, 안전요원, 인포데스크, 사무직, 관리자, 기타
      employmentType: 'full_time' | 'part_time' | 'contract' | 'freelance'; // 정규직, 파트타임, 계약직, 프리랜스
      location?: string; // 근무 지역
      centerId?: mongoose.Types.ObjectId; // 해당 센터 (구인인 경우)
      salary?: {
        min?: number;
        max?: number;
        type: 'monthly' | 'hourly' | 'per_class'; // 월급제, 시급제, 회당
      };
      requirements?: string[]; // 자격 요건
      benefits?: string[]; // 혜택
      incentives?: string[]; // 인센티브
      instructorFeeRate?: number; // 강사 수수료 비율 (%)
      workSchedule?: {
        daysOfWeek?: number[]; // 0=일요일, 6=토요일
        timeSlots?: string[]; // ['09:00-18:00']
      };
      contactInfo?: {
        email?: string;
        phone?: string;
      };
      applicationDeadline?: Date; // 마감일
      status: 'open' | 'closed' | 'filled'; // 모집중, 마감, 채용완료
    };
  };
  
  // 메타데이터
  isPinned: boolean;
  isHidden: boolean;
  isReported: boolean;
  reportCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// 댓글 인터페이스
export interface ICommunityComment extends Document {
  postId: mongoose.Types.ObjectId;
  parentCommentId?: mongoose.Types.ObjectId; // 대댓글용
  authorId: mongoose.Types.ObjectId;
  authorName: string;
  authorRole: 'student' | 'instructor' | 'centerAdmin' | 'superAdmin';
  content: string;
  
  // 상호작용
  likes: mongoose.Types.ObjectId[];
  likesCount: number;
  replies: mongoose.Types.ObjectId[];
  repliesCount: number;
  
  // 메타데이터
  isHidden: boolean;
  isReported: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 번개모임 참가 인터페이스
export interface IMeetupParticipant extends Document {
  meetupPostId: mongoose.Types.ObjectId;
  participantId: mongoose.Types.ObjectId;
  participantName: string;
  joinedAt: Date;
  status: 'pending' | 'confirmed' | 'cancelled';
  message?: string;
  emergencyContact?: string;
}

// 커뮤니티 게시글 스키마
const communityPostSchema = new Schema<ICommunityPost>({
  roomType: {
    type: String,
    enum: ['chat', 'tips', 'equipment', 'equipment_reviews', 'reviews', 'meetup', 'job_board'],
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  authorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  authorName: {
    type: String,
    required: true
  },
  authorRole: {
    type: String,
    enum: ['student', 'instructor', 'centerAdmin', 'superAdmin'],
    required: true
  },
  
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'file']
    },
    url: String,
    filename: String,
    size: Number
  }],
  
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  likesCount: {
    type: Number,
    default: 0
  },
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'CommunityComment'
  }],
  commentsCount: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  
  // 방별 특화 필드
  roomSpecific: {
    // 용품 소개방
    equipment: {
      productName: String,
      brand: String,
      price: Number,
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      purchaseLink: String,
      category: {
        type: String,
        enum: ['swimsuit', 'goggles', 'cap', 'fins', 'kickboard', 'other']
      }
    },
    
    // 용품 후기방
    equipmentReview: {
      productName: {
        type: String,
        required: function() { return this.roomType === 'equipment_reviews'; }
      },
      brand: {
        type: String,
        required: function() { return this.roomType === 'equipment_reviews'; }
      },
      model: String,
      category: {
        type: String,
        enum: ['swimsuit', 'goggles', 'cap', 'fins', 'kickboard', 'accessories', 'other'],
        required: function() { return this.roomType === 'equipment_reviews'; }
      },
      rating: {
        type: Number,
        min: 1,
        max: 5,
        required: function() { return this.roomType === 'equipment_reviews'; }
      },
      usagePeriod: {
        type: String,
        required: function() { return this.roomType === 'equipment_reviews'; }
      },
      purchasePrice: Number,
      purchaseDate: Date,
      purchaseLocation: String,
      
      // 세부 평가
      detailedRating: {
        durability: {
          type: Number,
          min: 1,
          max: 5,
          required: function() { return this.roomType === 'equipment_reviews'; }
        },
        comfort: {
          type: Number,
          min: 1,
          max: 5,
          required: function() { return this.roomType === 'equipment_reviews'; }
        },
        performance: {
          type: Number,
          min: 1,
          max: 5,
          required: function() { return this.roomType === 'equipment_reviews'; }
        },
        valueForMoney: {
          type: Number,
          min: 1,
          max: 5,
          required: function() { return this.roomType === 'equipment_reviews'; }
        },
        design: {
          type: Number,
          min: 1,
          max: 5,
          required: function() { return this.roomType === 'equipment_reviews'; }
        }
      },
      
      // 장단점
      pros: [String],
      cons: [String],
      
      // 추천 대상
      recommendedFor: [{
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'competitive']
      }],
      
      // 구매 정보
      wouldBuyAgain: {
        type: Boolean,
        required: function() { return this.roomType === 'equipment_reviews'; }
      },
      recommendToOthers: {
        type: Boolean,
        required: function() { return this.roomType === 'equipment_reviews'; }
      },
      
      // 비교 제품
      comparedProducts: [{
        productName: String,
        brand: String,
        comparison: String
      }],
      
      // 사용 후기 이미지
      beforeAfterImages: {
        before: String,
        after: String,
        usage: [String]
      }
    },
    
    // 번개모임
    meetup: {
      meetupDate: Date,
      location: String,
      maxParticipants: {
        type: Number,
        min: 2,
        max: 50
      },
      currentParticipants: {
        type: Number,
        default: 0
      },
      participants: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
      }],
      meetupType: {
        type: String,
        enum: ['practice', 'lesson', 'competition', 'social']
      },
      skill_level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'all']
      },
      fee: Number,
      status: {
        type: String,
        enum: ['recruiting', 'confirmed', 'completed', 'cancelled'],
        default: 'recruiting'
      },
      
      // 세분화된 수영 정보
      swimmingDetails: {
        strokes: [{
          type: String,
          enum: ['freestyle', 'backstroke', 'breaststroke', 'butterfly', 'medley']
        }],
        primaryStroke: {
          type: String,
          enum: ['freestyle', 'backstroke', 'breaststroke', 'butterfly', 'medley']
        },
        
        pace: {
          type: {
            type: String,
            enum: ['easy', 'moderate', 'fast', 'sprint', 'mixed']
          },
          description: String,
          targetTime: String,
          restInterval: Number
        },
        
        training: {
          warmup: {
            duration: Number,
            intensity: {
              type: String,
              enum: ['light', 'moderate']
            },
            strokes: [String]
          },
          main: {
            sets: [{
              distance: Number,
              repetitions: Number,
              stroke: String,
              pace: String,
              rest: Number
            }],
            totalDistance: Number
          },
          cooldown: {
            duration: Number,
            type: {
              type: String,
              enum: ['easy_swim', 'stretching', 'both']
            }
          }
        },
        
        focus: [{
          type: String,
          enum: ['technique', 'endurance', 'speed', 'strength', 'fun', 'recovery']
        }],
        primaryGoal: String,
        
        levelRequirements: {
          minimumDistance: Number,
          requiredStrokes: [String],
          experienceMonths: Number
        },
        
        equipment: {
          required: [String],
          recommended: [String],
          provided: [String]
        }
      },
      
      convenience: {
        carpoolAvailable: {
          type: Boolean,
          default: false
        },
        equipmentSharing: {
          type: Boolean,
          default: false
        },
        beginnerFriendly: {
          type: Boolean,
          default: true
        },
        photoSession: {
          type: Boolean,
          default: false
        },
        afterMeetup: String
      },
      
      conditions: {
        weatherDependent: {
          type: Boolean,
          default: false
        },
        backupPlan: String,
        minTemperature: Number
      }
    },
    
    // 후기방
    review: {
      centerId: {
        type: Schema.Types.ObjectId,
        ref: 'Center'
      },
      instructorId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      courseId: {
        type: Schema.Types.ObjectId,
        ref: 'Course'
      },
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      reviewType: {
        type: String,
        enum: ['center', 'instructor', 'course', 'general']
      }
    },
    
    // 팁방
    tip: {
      category: {
        type: String,
        enum: ['technique', 'training', 'equipment', 'safety', 'nutrition']
      },
      difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced']
      },
      tags: [String],
      isVerified: {
        type: Boolean,
        default: false
      },
      verifiedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    },
    
    // 구인구직
    jobBoard: {
      jobType: {
        type: String,
        enum: ['job_post', 'resume', 'freelance']
      },
      position: {
        type: String,
        enum: ['instructor', 'lifeguard', 'front_desk', 'office', 'manager', 'other']
      },
      employmentType: {
        type: String,
        enum: ['full_time', 'part_time', 'contract', 'freelance']
      },
      location: String,
      centerId: {
        type: Schema.Types.ObjectId,
        ref: 'SwimmingCenter'
      },
      salary: {
        min: Number,
        max: Number,
        type: {
          type: String,
          enum: ['monthly', 'hourly', 'per_class']
        }
      },
      requirements: [String],
      benefits: [String],
      incentives: [String],
      instructorFeeRate: Number,
      workSchedule: {
        daysOfWeek: [Number],
        timeSlots: [String]
      },
      contactInfo: {
        email: String,
        phone: String
      },
      applicationDeadline: Date,
      status: {
        type: String,
        enum: ['open', 'closed', 'filled'],
        default: 'open'
      }
    }
  },
  
  isPinned: {
    type: Boolean,
    default: false
  },
  isHidden: {
    type: Boolean,
    default: false
  },
  isReported: {
    type: Boolean,
    default: false
  },
  reportCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  collection: 'community_posts'
});

// 댓글 스키마
const communityCommentSchema = new Schema<ICommunityComment>({
  postId: {
    type: Schema.Types.ObjectId,
    ref: 'CommunityPost',
    required: true,
    index: true
  },
  parentCommentId: {
    type: Schema.Types.ObjectId,
    ref: 'CommunityComment',
    default: null
  },
  authorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorName: {
    type: String,
    required: true
  },
  authorRole: {
    type: String,
    enum: ['student', 'instructor', 'centerAdmin', 'superAdmin'],
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  likesCount: {
    type: Number,
    default: 0
  },
  replies: [{
    type: Schema.Types.ObjectId,
    ref: 'CommunityComment'
  }],
  repliesCount: {
    type: Number,
    default: 0
  },
  
  isHidden: {
    type: Boolean,
    default: false
  },
  isReported: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  collection: 'community_comments'
});

// 번개모임 참가자 스키마
const meetupParticipantSchema = new Schema<IMeetupParticipant>({
  meetupPostId: {
    type: Schema.Types.ObjectId,
    ref: 'CommunityPost',
    required: true,
    index: true
  },
  participantId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participantName: {
    type: String,
    required: true
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  message: String,
  emergencyContact: String
}, {
  timestamps: true,
  collection: 'meetup_participants'
});

// 인덱스 설정
communityPostSchema.index({ roomType: 1, createdAt: -1 });
communityPostSchema.index({ authorId: 1, createdAt: -1 });
communityPostSchema.index({ isPinned: -1, createdAt: -1 });
communityPostSchema.index({ 'roomSpecific.meetup.meetupDate': 1, 'roomSpecific.meetup.status': 1 });
communityPostSchema.index({ 'roomSpecific.equipment.category': 1 });
communityPostSchema.index({ 'roomSpecific.tip.category': 1, 'roomSpecific.tip.difficulty': 1 });

communityCommentSchema.index({ postId: 1, createdAt: -1 });
communityCommentSchema.index({ authorId: 1, createdAt: -1 });
communityCommentSchema.index({ parentCommentId: 1 });

meetupParticipantSchema.index({ meetupPostId: 1, status: 1 });
meetupParticipantSchema.index({ participantId: 1 });

// 가상 필드 및 메서드
communityPostSchema.virtual('isActive').get(function() {
  if (this.roomType === 'meetup') {
    return this.roomSpecific?.meetup?.status === 'recruiting';
  }
  return !this.isHidden;
});

communityPostSchema.methods.canEdit = function(userId: string, userRole: string) {
  // 작성자 본인 또는 관리자만 수정 가능
  return this.authorId.toString() === userId || ['centerAdmin', 'superAdmin'].includes(userRole);
};

communityPostSchema.methods.canDelete = function(userId: string, userRole: string) {
  // 작성자 본인 또는 관리자만 삭제 가능
  return this.authorId.toString() === userId || ['centerAdmin', 'superAdmin'].includes(userRole);
};

communityPostSchema.methods.addLike = async function(userId: string) {
  if (!this.likes.includes(userId)) {
    this.likes.push(userId);
    this.likesCount = this.likes.length;
    await this.save();
  }
};

communityPostSchema.methods.removeLike = async function(userId: string) {
  const index = this.likes.indexOf(userId);
  if (index > -1) {
    this.likes.splice(index, 1);
    this.likesCount = this.likes.length;
    await this.save();
  }
};

// 번개모임 참가 메서드
communityPostSchema.methods.joinMeetup = async function(participantData: any) {
  if (this.roomType !== 'meetup') {
    throw new Error('번개모임 게시글이 아닙니다.');
  }
  
  const meetup = this.roomSpecific?.meetup;
  if (!meetup) {
    throw new Error('번개모임 정보가 없습니다.');
  }
  
  if (meetup.currentParticipants >= meetup.maxParticipants) {
    throw new Error('참가 인원이 마감되었습니다.');
  }
  
  if (meetup.status !== 'recruiting') {
    throw new Error('모집이 종료된 번개모임입니다.');
  }
  
  // 참가자 추가
  const participant = new MeetupParticipant(participantData);
  await participant.save();
  
  // 번개모임 참가자 수 업데이트
  meetup.currentParticipants += 1;
  meetup.participants.push(participantData.participantId);
  
  // 마감 체크
  if (meetup.currentParticipants >= meetup.maxParticipants) {
    meetup.status = 'confirmed';
  }
  
  await this.save();
  return participant;
};

// 정적 메서드들
communityPostSchema.statics.getPopularPosts = function(roomType?: RoomType, limit = 10) {
  const query: any = { isHidden: false };
  if (roomType) query.roomType = roomType;
  
  return this.find(query)
    .sort({ likesCount: -1, commentsCount: -1, views: -1 })
    .limit(limit)
    .populate('authorId', 'name profileImage')
    .populate('comments', '', '', { limit: 3, sort: { createdAt: -1 } });
};

communityPostSchema.statics.getActiveMeetups = function() {
  return this.find({
    roomType: 'meetup',
    'roomSpecific.meetup.status': 'recruiting',
    'roomSpecific.meetup.meetupDate': { $gte: new Date() },
    isHidden: false
  })
  .sort({ 'roomSpecific.meetup.meetupDate': 1 })
  .populate('authorId', 'name profileImage');
};

communityPostSchema.statics.getTopRatedEquipment = function(category?: string) {
  const query: any = {
    roomType: 'equipment',
    'roomSpecific.equipment.rating': { $gte: 4 },
    isHidden: false
  };
  
  if (category) {
    query['roomSpecific.equipment.category'] = category;
  }
  
  return this.find(query)
    .sort({ 'roomSpecific.equipment.rating': -1, likesCount: -1 })
    .limit(20)
    .populate('authorId', 'name profileImage');
};

// 용품 후기 관련 정적 메서드들
communityPostSchema.statics.getDetailedEquipmentReviews = function(filters: {
  category?: string;
  brand?: string;
  productName?: string;
  minRating?: number;
  sortBy?: 'rating' | 'date' | 'helpful';
}) {
  const query: any = {
    roomType: 'equipment_reviews',
    isHidden: false
  };
  
  if (filters.category) {
    query['roomSpecific.equipmentReview.category'] = filters.category;
  }
  if (filters.brand) {
    query['roomSpecific.equipmentReview.brand'] = new RegExp(filters.brand, 'i');
  }
  if (filters.productName) {
    query['roomSpecific.equipmentReview.productName'] = new RegExp(filters.productName, 'i');
  }
  if (filters.minRating) {
    query['roomSpecific.equipmentReview.rating'] = { $gte: filters.minRating };
  }
  
  let sortOptions: any = { createdAt: -1 };
  if (filters.sortBy === 'rating') {
    sortOptions = { 'roomSpecific.equipmentReview.rating': -1, likesCount: -1 };
  } else if (filters.sortBy === 'helpful') {
    sortOptions = { likesCount: -1, commentsCount: -1 };
  }
  
  return this.find(query)
    .sort(sortOptions)
    .populate('authorId', 'name profileImage userType')
    .populate('comments', '', '', { limit: 5, sort: { createdAt: -1 } });
};

communityPostSchema.statics.getEquipmentComparisonData = function(productName: string, brand?: string) {
  const query: any = {
    roomType: 'equipment_reviews',
    'roomSpecific.equipmentReview.productName': new RegExp(productName, 'i'),
    isHidden: false
  };
  
  if (brand) {
    query['roomSpecific.equipmentReview.brand'] = new RegExp(brand, 'i');
  }
  
  return this.find(query)
    .select('roomSpecific.equipmentReview authorId authorName createdAt likesCount')
    .populate('authorId', 'name profileImage')
    .sort({ 'roomSpecific.equipmentReview.rating': -1 });
};

communityPostSchema.statics.getEquipmentStats = function(category?: string) {
  const matchStage: any = {
    roomType: 'equipment_reviews',
    isHidden: false
  };
  
  if (category) {
    matchStage['roomSpecific.equipmentReview.category'] = category;
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          brand: '$roomSpecific.equipmentReview.brand',
          productName: '$roomSpecific.equipmentReview.productName'
        },
        avgRating: { $avg: '$roomSpecific.equipmentReview.rating' },
        avgDurability: { $avg: '$roomSpecific.equipmentReview.detailedRating.durability' },
        avgComfort: { $avg: '$roomSpecific.equipmentReview.detailedRating.comfort' },
        avgPerformance: { $avg: '$roomSpecific.equipmentReview.detailedRating.performance' },
        avgValueForMoney: { $avg: '$roomSpecific.equipmentReview.detailedRating.valueForMoney' },
        avgDesign: { $avg: '$roomSpecific.equipmentReview.detailedRating.design' },
        reviewCount: { $sum: 1 },
        wouldBuyAgainCount: {
          $sum: {
            $cond: ['$roomSpecific.equipmentReview.wouldBuyAgain', 1, 0]
          }
        },
        recommendCount: {
          $sum: {
            $cond: ['$roomSpecific.equipmentReview.recommendToOthers', 1, 0]
          }
        },
        totalLikes: { $sum: '$likesCount' }
      }
    },
    {
      $addFields: {
        wouldBuyAgainRate: {
          $multiply: [
            { $divide: ['$wouldBuyAgainCount', '$reviewCount'] },
            100
          ]
        },
        recommendRate: {
          $multiply: [
            { $divide: ['$recommendCount', '$reviewCount'] },
            100
          ]
        }
      }
    },
    { $sort: { avgRating: -1, reviewCount: -1 } }
  ]);
};

// 모델 생성
export const CommunityPost = mongoose.model<ICommunityPost>('CommunityPost', communityPostSchema);
export const CommunityComment = mongoose.model<ICommunityComment>('CommunityComment', communityCommentSchema);
export const MeetupParticipant = mongoose.model<IMeetupParticipant>('MeetupParticipant', meetupParticipantSchema);

// 방별 설정
export const ROOM_CONFIGS = {
  chat: {
    name: '수다방',
    description: '자유로운 대화를 나누는 공간',
    icon: '💬',
    color: 'blue',
    allowAttachments: true,
    maxContentLength: 1000
  },
  tips: {
    name: '팁방',
    description: '수영 노하우와 팁을 공유하는 공간',
    icon: '💡',
    color: 'green',
    allowAttachments: true,
    maxContentLength: 3000,
    requiresVerification: true
  },
  equipment: {
    name: '용품 소개방',
    description: '수영 용품 추천과 정보를 공유하는 공간',
    icon: '🛍️',
    color: 'purple',
    allowAttachments: true,
    maxContentLength: 2000,
    requiresRating: true
  },
  equipment_reviews: {
    name: '용품 후기방',
    description: '실제 사용한 수영 용품의 상세 후기를 공유하는 공간',
    icon: '📝',
    color: 'indigo',
    allowAttachments: true,
    maxContentLength: 3000,
    requiresRating: true,
    requiresDetailedRating: true,
    requiresUsagePeriod: true
  },
  reviews: {
    name: '후기방',
    description: '강습 후기와 경험담을 나누는 공간',
    icon: '⭐',
    color: 'yellow',
    allowAttachments: true,
    maxContentLength: 2000,
    requiresRating: true
  },
  meetup: {
    name: '번개모임',
    description: '즉석 수영 모임을 모집하는 공간',
    icon: '⚡',
    color: 'red',
    allowAttachments: false,
    maxContentLength: 1000,
    requiresDateTime: true,
    requiresLocation: true
  }
};

export default {
  CommunityPost,
  CommunityComment,
  MeetupParticipant,
  ROOM_CONFIGS
};
