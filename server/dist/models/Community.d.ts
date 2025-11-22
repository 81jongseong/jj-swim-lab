import mongoose, { Document } from 'mongoose';
export type RoomType = 'chat' | 'tips' | 'equipment' | 'equipment_reviews' | 'reviews' | 'meetup' | 'job_board';
export interface ICommunityPost extends Document {
    roomType: RoomType;
    title: string;
    content: string;
    authorId: mongoose.Types.ObjectId;
    authorName: string;
    authorRole: 'student' | 'instructor' | 'centerAdmin' | 'superAdmin';
    attachments: {
        type: 'image' | 'file';
        url: string;
        filename: string;
        size: number;
    }[];
    likes: mongoose.Types.ObjectId[];
    likesCount: number;
    comments: mongoose.Types.ObjectId[];
    commentsCount: number;
    views: number;
    roomSpecific: {
        equipment?: {
            productName: string;
            brand: string;
            price?: number;
            rating: number;
            purchaseLink?: string;
            category: 'swimsuit' | 'goggles' | 'cap' | 'fins' | 'kickboard' | 'other';
        };
        equipmentReview?: {
            productName: string;
            brand: string;
            model?: string;
            category: 'swimsuit' | 'goggles' | 'cap' | 'fins' | 'kickboard' | 'accessories' | 'other';
            rating: number;
            usagePeriod: string;
            purchasePrice?: number;
            purchaseDate?: Date;
            purchaseLocation?: string;
            detailedRating: {
                durability: number;
                comfort: number;
                performance: number;
                valueForMoney: number;
                design: number;
            };
            pros: string[];
            cons: string[];
            recommendedFor: ('beginner' | 'intermediate' | 'advanced' | 'competitive')[];
            wouldBuyAgain: boolean;
            recommendToOthers: boolean;
            comparedProducts?: {
                productName: string;
                brand: string;
                comparison: string;
            }[];
            beforeAfterImages?: {
                before?: string;
                after?: string;
                usage?: string[];
            };
        };
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
            swimmingDetails: {
                strokes: ('freestyle' | 'backstroke' | 'breaststroke' | 'butterfly' | 'medley')[];
                primaryStroke: 'freestyle' | 'backstroke' | 'breaststroke' | 'butterfly' | 'medley';
                pace: {
                    type: 'easy' | 'moderate' | 'fast' | 'sprint' | 'mixed';
                    description: string;
                    targetTime?: string;
                    restInterval?: number;
                };
                training: {
                    warmup: {
                        duration: number;
                        intensity: 'light' | 'moderate';
                        strokes: string[];
                    };
                    main: {
                        sets: {
                            distance: number;
                            repetitions: number;
                            stroke: string;
                            pace: string;
                            rest: number;
                        }[];
                        totalDistance: number;
                    };
                    cooldown: {
                        duration: number;
                        type: 'easy_swim' | 'stretching' | 'both';
                    };
                };
                focus: ('technique' | 'endurance' | 'speed' | 'strength' | 'fun' | 'recovery')[];
                primaryGoal: string;
                levelRequirements: {
                    minimumDistance: number;
                    requiredStrokes: string[];
                    experienceMonths?: number;
                };
                equipment: {
                    required: string[];
                    recommended: string[];
                    provided: string[];
                };
            };
            convenience: {
                carpoolAvailable: boolean;
                equipmentSharing: boolean;
                beginnerFriendly: boolean;
                photoSession: boolean;
                afterMeetup: string;
            };
            conditions: {
                weatherDependent: boolean;
                backupPlan?: string;
                minTemperature?: number;
            };
        };
        review?: {
            centerId?: mongoose.Types.ObjectId;
            instructorId?: mongoose.Types.ObjectId;
            courseId?: mongoose.Types.ObjectId;
            rating: number;
            reviewType: 'center' | 'instructor' | 'course' | 'general';
        };
        tip?: {
            category: 'technique' | 'training' | 'equipment' | 'safety' | 'nutrition';
            difficulty: 'beginner' | 'intermediate' | 'advanced';
            tags: string[];
            isVerified: boolean;
            verifiedBy?: mongoose.Types.ObjectId;
        };
        jobBoard?: {
            jobType: 'job_post' | 'resume' | 'freelance';
            position: 'instructor' | 'lifeguard' | 'front_desk' | 'office' | 'manager' | 'other';
            employmentType: 'full_time' | 'part_time' | 'contract' | 'freelance';
            location?: string;
            centerId?: mongoose.Types.ObjectId;
            salary?: {
                min?: number;
                max?: number;
                type: 'monthly' | 'hourly' | 'per_class';
            };
            requirements?: string[];
            benefits?: string[];
            incentives?: string[];
            instructorFeeRate?: number;
            workSchedule?: {
                daysOfWeek?: number[];
                timeSlots?: string[];
            };
            contactInfo?: {
                email?: string;
                phone?: string;
            };
            applicationDeadline?: Date;
            status: 'open' | 'closed' | 'filled';
        };
    };
    isPinned: boolean;
    isHidden: boolean;
    isReported: boolean;
    reportCount: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface ICommunityComment extends Document {
    postId: mongoose.Types.ObjectId;
    parentCommentId?: mongoose.Types.ObjectId;
    authorId: mongoose.Types.ObjectId;
    authorName: string;
    authorRole: 'student' | 'instructor' | 'centerAdmin' | 'superAdmin';
    content: string;
    likes: mongoose.Types.ObjectId[];
    likesCount: number;
    replies: mongoose.Types.ObjectId[];
    repliesCount: number;
    isHidden: boolean;
    isReported: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface IMeetupParticipant extends Document {
    meetupPostId: mongoose.Types.ObjectId;
    participantId: mongoose.Types.ObjectId;
    participantName: string;
    joinedAt: Date;
    status: 'pending' | 'confirmed' | 'cancelled';
    message?: string;
    emergencyContact?: string;
}
export declare const CommunityPost: mongoose.Model<ICommunityPost, {}, {}, {}, mongoose.Document<unknown, {}, ICommunityPost> & ICommunityPost & {
    _id: mongoose.Types.ObjectId;
}, any>;
export declare const CommunityComment: mongoose.Model<ICommunityComment, {}, {}, {}, mongoose.Document<unknown, {}, ICommunityComment> & ICommunityComment & {
    _id: mongoose.Types.ObjectId;
}, any>;
export declare const MeetupParticipant: mongoose.Model<IMeetupParticipant, {}, {}, {}, mongoose.Document<unknown, {}, IMeetupParticipant> & IMeetupParticipant & {
    _id: mongoose.Types.ObjectId;
}, any>;
export declare const ROOM_CONFIGS: {
    chat: {
        name: string;
        description: string;
        icon: string;
        color: string;
        allowAttachments: boolean;
        maxContentLength: number;
    };
    tips: {
        name: string;
        description: string;
        icon: string;
        color: string;
        allowAttachments: boolean;
        maxContentLength: number;
        requiresVerification: boolean;
    };
    equipment: {
        name: string;
        description: string;
        icon: string;
        color: string;
        allowAttachments: boolean;
        maxContentLength: number;
        requiresRating: boolean;
    };
    equipment_reviews: {
        name: string;
        description: string;
        icon: string;
        color: string;
        allowAttachments: boolean;
        maxContentLength: number;
        requiresRating: boolean;
        requiresDetailedRating: boolean;
        requiresUsagePeriod: boolean;
    };
    reviews: {
        name: string;
        description: string;
        icon: string;
        color: string;
        allowAttachments: boolean;
        maxContentLength: number;
        requiresRating: boolean;
    };
    meetup: {
        name: string;
        description: string;
        icon: string;
        color: string;
        allowAttachments: boolean;
        maxContentLength: number;
        requiresDateTime: boolean;
        requiresLocation: boolean;
    };
};
declare const _default: {
    CommunityPost: mongoose.Model<ICommunityPost, {}, {}, {}, mongoose.Document<unknown, {}, ICommunityPost> & ICommunityPost & {
        _id: mongoose.Types.ObjectId;
    }, any>;
    CommunityComment: mongoose.Model<ICommunityComment, {}, {}, {}, mongoose.Document<unknown, {}, ICommunityComment> & ICommunityComment & {
        _id: mongoose.Types.ObjectId;
    }, any>;
    MeetupParticipant: mongoose.Model<IMeetupParticipant, {}, {}, {}, mongoose.Document<unknown, {}, IMeetupParticipant> & IMeetupParticipant & {
        _id: mongoose.Types.ObjectId;
    }, any>;
    ROOM_CONFIGS: {
        chat: {
            name: string;
            description: string;
            icon: string;
            color: string;
            allowAttachments: boolean;
            maxContentLength: number;
        };
        tips: {
            name: string;
            description: string;
            icon: string;
            color: string;
            allowAttachments: boolean;
            maxContentLength: number;
            requiresVerification: boolean;
        };
        equipment: {
            name: string;
            description: string;
            icon: string;
            color: string;
            allowAttachments: boolean;
            maxContentLength: number;
            requiresRating: boolean;
        };
        equipment_reviews: {
            name: string;
            description: string;
            icon: string;
            color: string;
            allowAttachments: boolean;
            maxContentLength: number;
            requiresRating: boolean;
            requiresDetailedRating: boolean;
            requiresUsagePeriod: boolean;
        };
        reviews: {
            name: string;
            description: string;
            icon: string;
            color: string;
            allowAttachments: boolean;
            maxContentLength: number;
            requiresRating: boolean;
        };
        meetup: {
            name: string;
            description: string;
            icon: string;
            color: string;
            allowAttachments: boolean;
            maxContentLength: number;
            requiresDateTime: boolean;
            requiresLocation: boolean;
        };
    };
};
export default _default;
//# sourceMappingURL=Community.d.ts.map