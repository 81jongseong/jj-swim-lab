"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROOM_CONFIGS = exports.MeetupParticipant = exports.CommunityComment = exports.CommunityPost = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const communityPostSchema = new mongoose_1.Schema({
    roomType: {
        type: String,
        enum: ['chat', 'tips', 'equipment', 'equipment_reviews', 'reviews', 'meetup'],
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
        type: mongoose_1.Schema.Types.ObjectId,
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
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        }],
    likesCount: {
        type: Number,
        default: 0
    },
    comments: [{
            type: mongoose_1.Schema.Types.ObjectId,
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
    roomSpecific: {
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
        equipmentReview: {
            productName: {
                type: String,
                required: function () { return this.roomType === 'equipment_reviews'; }
            },
            brand: {
                type: String,
                required: function () { return this.roomType === 'equipment_reviews'; }
            },
            model: String,
            category: {
                type: String,
                enum: ['swimsuit', 'goggles', 'cap', 'fins', 'kickboard', 'accessories', 'other'],
                required: function () { return this.roomType === 'equipment_reviews'; }
            },
            rating: {
                type: Number,
                min: 1,
                max: 5,
                required: function () { return this.roomType === 'equipment_reviews'; }
            },
            usagePeriod: {
                type: String,
                required: function () { return this.roomType === 'equipment_reviews'; }
            },
            purchasePrice: Number,
            purchaseDate: Date,
            purchaseLocation: String,
            detailedRating: {
                durability: {
                    type: Number,
                    min: 1,
                    max: 5,
                    required: function () { return this.roomType === 'equipment_reviews'; }
                },
                comfort: {
                    type: Number,
                    min: 1,
                    max: 5,
                    required: function () { return this.roomType === 'equipment_reviews'; }
                },
                performance: {
                    type: Number,
                    min: 1,
                    max: 5,
                    required: function () { return this.roomType === 'equipment_reviews'; }
                },
                valueForMoney: {
                    type: Number,
                    min: 1,
                    max: 5,
                    required: function () { return this.roomType === 'equipment_reviews'; }
                },
                design: {
                    type: Number,
                    min: 1,
                    max: 5,
                    required: function () { return this.roomType === 'equipment_reviews'; }
                }
            },
            pros: [String],
            cons: [String],
            recommendedFor: [{
                    type: String,
                    enum: ['beginner', 'intermediate', 'advanced', 'competitive']
                }],
            wouldBuyAgain: {
                type: Boolean,
                required: function () { return this.roomType === 'equipment_reviews'; }
            },
            recommendToOthers: {
                type: Boolean,
                required: function () { return this.roomType === 'equipment_reviews'; }
            },
            comparedProducts: [{
                    productName: String,
                    brand: String,
                    comparison: String
                }],
            beforeAfterImages: {
                before: String,
                after: String,
                usage: [String]
            }
        },
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
                    type: mongoose_1.Schema.Types.ObjectId,
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
        review: {
            centerId: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'Center'
            },
            instructorId: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User'
            },
            courseId: {
                type: mongoose_1.Schema.Types.ObjectId,
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
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User'
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
const communityCommentSchema = new mongoose_1.Schema({
    postId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'CommunityPost',
        required: true,
        index: true
    },
    parentCommentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'CommunityComment',
        default: null
    },
    authorId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        }],
    likesCount: {
        type: Number,
        default: 0
    },
    replies: [{
            type: mongoose_1.Schema.Types.ObjectId,
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
const meetupParticipantSchema = new mongoose_1.Schema({
    meetupPostId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'CommunityPost',
        required: true,
        index: true
    },
    participantId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
communityPostSchema.virtual('isActive').get(function () {
    if (this.roomType === 'meetup') {
        return this.roomSpecific?.meetup?.status === 'recruiting';
    }
    return !this.isHidden;
});
communityPostSchema.methods.canEdit = function (userId, userRole) {
    return this.authorId.toString() === userId || ['centerAdmin', 'superAdmin'].includes(userRole);
};
communityPostSchema.methods.canDelete = function (userId, userRole) {
    return this.authorId.toString() === userId || ['centerAdmin', 'superAdmin'].includes(userRole);
};
communityPostSchema.methods.addLike = async function (userId) {
    if (!this.likes.includes(userId)) {
        this.likes.push(userId);
        this.likesCount = this.likes.length;
        await this.save();
    }
};
communityPostSchema.methods.removeLike = async function (userId) {
    const index = this.likes.indexOf(userId);
    if (index > -1) {
        this.likes.splice(index, 1);
        this.likesCount = this.likes.length;
        await this.save();
    }
};
communityPostSchema.methods.joinMeetup = async function (participantData) {
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
    const participant = new exports.MeetupParticipant(participantData);
    await participant.save();
    meetup.currentParticipants += 1;
    meetup.participants.push(participantData.participantId);
    if (meetup.currentParticipants >= meetup.maxParticipants) {
        meetup.status = 'confirmed';
    }
    await this.save();
    return participant;
};
communityPostSchema.statics.getPopularPosts = function (roomType, limit = 10) {
    const query = { isHidden: false };
    if (roomType)
        query.roomType = roomType;
    return this.find(query)
        .sort({ likesCount: -1, commentsCount: -1, views: -1 })
        .limit(limit)
        .populate('authorId', 'name profileImage')
        .populate('comments', '', '', { limit: 3, sort: { createdAt: -1 } });
};
communityPostSchema.statics.getActiveMeetups = function () {
    return this.find({
        roomType: 'meetup',
        'roomSpecific.meetup.status': 'recruiting',
        'roomSpecific.meetup.meetupDate': { $gte: new Date() },
        isHidden: false
    })
        .sort({ 'roomSpecific.meetup.meetupDate': 1 })
        .populate('authorId', 'name profileImage');
};
communityPostSchema.statics.getTopRatedEquipment = function (category) {
    const query = {
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
communityPostSchema.statics.getDetailedEquipmentReviews = function (filters) {
    const query = {
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
    let sortOptions = { createdAt: -1 };
    if (filters.sortBy === 'rating') {
        sortOptions = { 'roomSpecific.equipmentReview.rating': -1, likesCount: -1 };
    }
    else if (filters.sortBy === 'helpful') {
        sortOptions = { likesCount: -1, commentsCount: -1 };
    }
    return this.find(query)
        .sort(sortOptions)
        .populate('authorId', 'name profileImage userType')
        .populate('comments', '', '', { limit: 5, sort: { createdAt: -1 } });
};
communityPostSchema.statics.getEquipmentComparisonData = function (productName, brand) {
    const query = {
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
communityPostSchema.statics.getEquipmentStats = function (category) {
    const matchStage = {
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
exports.CommunityPost = mongoose_1.default.model('CommunityPost', communityPostSchema);
exports.CommunityComment = mongoose_1.default.model('CommunityComment', communityCommentSchema);
exports.MeetupParticipant = mongoose_1.default.model('MeetupParticipant', meetupParticipantSchema);
exports.ROOM_CONFIGS = {
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
exports.default = {
    CommunityPost: exports.CommunityPost,
    CommunityComment: exports.CommunityComment,
    MeetupParticipant: exports.MeetupParticipant,
    ROOM_CONFIGS: exports.ROOM_CONFIGS
};
//# sourceMappingURL=Community.js.map