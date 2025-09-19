"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const eventSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['meetup', 'competition', 'lesson', 'social', 'training'],
        default: 'meetup'
    },
    category: {
        type: String,
        enum: ['번개모임', '대회', '강습', '소셜', '훈련'],
        default: '번개모임'
    },
    organizer: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    dateTime: {
        type: Date,
        required: true
    },
    duration: {
        type: Number,
        required: true,
        default: 60
    },
    location: {
        centerId: {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'Center'
        },
        address: String,
        latitude: Number,
        longitude: Number,
        poolType: {
            type: String,
            enum: ['indoor', 'outdoor', 'both'],
            default: 'indoor'
        }
    },
    participants: [{
            user: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            joinedAt: {
                type: Date,
                default: Date.now
            },
            status: {
                type: String,
                enum: ['pending', 'confirmed', 'attended', 'no_show'],
                default: 'pending'
            },
            role: {
                type: String,
                enum: ['participant', 'helper', 'observer'],
                default: 'participant'
            }
        }],
    maxParticipants: {
        type: Number,
        required: true,
        default: 10
    },
    minParticipants: {
        type: Number,
        default: 2
    },
    skillLevel: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'mixed'],
        default: 'mixed'
    },
    ageGroup: {
        type: String,
        enum: ['child', 'teen', 'adult', 'senior', 'mixed'],
        default: 'mixed'
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'full', 'cancelled', 'completed'],
        default: 'published'
    },
    isPrivate: {
        type: Boolean,
        default: false
    },
    requiresApproval: {
        type: Boolean,
        default: false
    },
    cost: {
        type: Number,
        default: 0
    },
    costType: {
        type: String,
        enum: ['free', 'shared', 'individual'],
        default: 'free'
    },
    requirements: [{
            item: String,
            isRequired: Boolean,
            description: String
        }],
    reviews: [{
            reviewer: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            rating: {
                type: Number,
                min: 1,
                max: 5,
                required: true
            },
            comment: String,
            reviewDate: {
                type: Date,
                default: Date.now
            }
        }],
    stats: {
        totalViews: { type: Number, default: 0 },
        totalInterested: { type: Number, default: 0 },
        averageRating: { type: Number, default: 0 },
        completionRate: { type: Number, default: 0 }
    },
    tags: [{
            type: String,
            trim: true
        }],
    images: [{
            url: String,
            caption: String,
            uploadedBy: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'User'
            }
        }],
}, {
    timestamps: true
});
eventSchema.index({ dateTime: 1, status: 1 });
eventSchema.index({ 'location.centerId': 1, dateTime: 1 });
eventSchema.index({ organizer: 1, status: 1 });
eventSchema.index({ category: 1, skillLevel: 1 });
eventSchema.index({ tags: 1 });
exports.Event = mongoose_1.default.model('Event', eventSchema);
//# sourceMappingURL=Event.js.map