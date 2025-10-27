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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Center = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const centerSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    managerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    instructors: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        }],
    students: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        }],
    courses: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Course'
        }],
    capacity: {
        type: Number,
        default: 100,
        min: 1
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'maintenance'],
        default: 'active'
    },
    facilities: [{
            type: String,
            trim: true
        }],
    poolConfiguration: {
        mainPool: {
            name: { type: String, default: '메인 풀' },
            lanes: { type: Number, default: 6 },
            depth: { type: String, default: '1.2m~1.8m' },
            size: { type: String, default: '25m x 15m' }
        },
        kidsPool: {
            name: { type: String, default: '유아 풀' },
            lanes: { type: Number, default: 0 },
            depth: { type: String, default: '0.8m~1.0m' },
            size: { type: String, default: '10m x 5m' }
        },
        auxiliaryPool: {
            name: { type: String, default: '보조 풀' },
            lanes: { type: Number, default: 0 },
            depth: { type: String, default: '1.0m~1.5m' },
            size: { type: String, default: '15m x 8m' }
        }
    },
    operatingHours: {
        open: {
            type: String,
            default: '09:00'
        },
        close: {
            type: String,
            default: '22:00'
        },
        days: [{
                type: String,
                enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
                default: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
            }]
    },
    customLevels: [{
            id: { type: String, required: true },
            name: { type: String, required: true },
            description: { type: String, default: '' },
            color: { type: String, default: '#3b82f6' },
            mappedToAdminLevel: { type: String, default: 'beginner' },
            order: { type: Number, default: 0 }
        }],
    availabilitySettings: {
        personalLesson: {
            enabled: { type: Boolean, default: true },
            availableDays: [{
                    type: String,
                    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
                    default: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
                }],
            availableTimes: [{
                    startTime: { type: String, default: '09:00' },
                    endTime: { type: String, default: '18:00' },
                    maxDuration: { type: Number, default: 120, required: false }
                }],
            dayTimeSlots: [{
                    day: { type: String, required: true },
                    timeSlots: [{
                            startTime: { type: String, required: true },
                            endTime: { type: String, required: true }
                        }]
                }],
            advanceBookingDays: { type: Number, default: 7, required: false },
            cancellationPolicy: { type: String, default: '24시간 전 취소 가능' }
        },
        laneRental: {
            enabled: { type: Boolean, default: true },
            availableDays: [{
                    type: String,
                    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
                    default: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
                }],
            availableTimes: [{
                    startTime: { type: String, default: '06:00' },
                    endTime: { type: String, default: '22:00' },
                    maxDuration: { type: Number, default: 180 }
                }],
            availableLanes: [{ type: Number, min: 1, max: 10 }],
            advanceBookingDays: { type: Number, default: 14 },
            cancellationPolicy: { type: String, default: '12시간 전 취소 가능' }
        }
    },
    introduction: {
        shortDescription: { type: String, default: '' },
        fullDescription: { type: String, default: '' },
        features: [{ type: String }],
        certifications: [{ type: String }],
        images: [{ type: String }],
        videoUrl: { type: String },
        achievements: [{ type: String }],
        specialPrograms: [{ type: String }],
        targetAudience: [{ type: String }],
        philosophy: { type: String, default: '' },
        history: { type: String, default: '' },
        staff: [{
                name: { type: String, required: true },
                position: { type: String, required: true },
                experience: { type: String, default: '' },
                certifications: [{ type: String }],
                photo: { type: String }
            }],
        contactInfo: {
            website: { type: String },
            socialMedia: {
                facebook: { type: String },
                instagram: { type: String },
                youtube: { type: String },
                kakao: { type: String }
            },
            parkingInfo: { type: String },
            publicTransport: { type: String }
        },
        pricing: {
            membershipFees: [{
                    type: { type: String, required: true },
                    price: { type: Number, required: true },
                    duration: { type: String, required: true },
                    description: { type: String, default: '' }
                }],
            lessonFees: [{
                    type: { type: String, required: true },
                    price: { type: Number, required: true },
                    duration: { type: String, required: true },
                    description: { type: String, default: '' }
                }]
        },
        visibility: {
            isPublic: { type: Boolean, default: true },
            showToMembers: { type: Boolean, default: true },
            showToInstructors: { type: Boolean, default: true },
            lastUpdated: { type: Date, default: Date.now },
            updatedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }
        }
    }
}, {
    timestamps: true
});
centerSchema.index({ managerId: 1 });
centerSchema.index({ status: 1 });
centerSchema.index({ 'location.coordinates': '2dsphere' });
centerSchema.index({ 'operatingHours.days': 1 });
centerSchema.index({ capacity: 1 });
centerSchema.index({ 'facilities': 1 });
centerSchema.index({ createdAt: -1 });
centerSchema.index({ 'introduction.features': 'text' });
centerSchema.index({ 'introduction.targetAudience': 1 });
exports.Center = mongoose_1.default.model('Center', centerSchema);
exports.default = exports.Center;
//# sourceMappingURL=Center.js.map