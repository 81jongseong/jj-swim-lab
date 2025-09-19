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