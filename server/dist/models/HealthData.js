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
exports.HealthData = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const healthDataSchema = new mongoose_1.Schema({
    studentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    height: {
        type: Number,
        min: 50,
        max: 250,
        required: true
    },
    weight: {
        type: Number,
        min: 20,
        max: 200,
        required: true
    },
    bmi: {
        type: Number,
        min: 10,
        max: 50
    },
    bloodPressure: {
        type: String,
        trim: true
    },
    heartRate: {
        type: Number,
        min: 40,
        max: 200
    },
    flexibility: {
        type: Number,
        min: 0,
        max: 10
    },
    strength: {
        type: Number,
        min: 0,
        max: 10
    },
    endurance: {
        type: Number,
        min: 0,
        max: 10
    },
    exerciseLevel: {
        type: String,
        enum: ['초급', '중급', '고급', '전문가'],
        default: '초급'
    },
    swimmingExperience: {
        type: String,
        trim: true
    },
    healthStatus: {
        type: String,
        enum: ['excellent', 'good', 'fair', 'poor'],
        default: 'good'
    },
    exerciseCompliance: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    lastHealthCheck: {
        type: Date,
        default: Date.now
    },
    aiRecommendations: {
        exerciseIntensity: {
            type: Number,
            min: 1,
            max: 10,
            default: 5
        },
        duration: {
            type: Number,
            min: 15,
            max: 120,
            default: 30
        },
        frequency: {
            type: Number,
            min: 1,
            max: 7,
            default: 3
        },
        restPeriod: {
            type: Number,
            min: 12,
            max: 72,
            default: 48
        },
        specialNotes: {
            type: String,
            trim: true
        }
    },
    privacySettings: {
        height: { type: Boolean, default: true },
        weight: { type: Boolean, default: true },
        bmi: { type: Boolean, default: true },
        bloodPressure: { type: Boolean, default: false },
        heartRate: { type: Boolean, default: false },
        flexibility: { type: Boolean, default: true },
        strength: { type: Boolean, default: true },
        endurance: { type: Boolean, default: true },
        exerciseLevel: { type: Boolean, default: true },
        swimmingExperience: { type: Boolean, default: true },
        healthStatus: { type: Boolean, default: true },
        exerciseCompliance: { type: Boolean, default: true }
    }
}, {
    timestamps: true
});
healthDataSchema.pre('save', function (next) {
    if (this.height && this.weight) {
        this.bmi = parseFloat((this.weight / Math.pow(this.height / 100, 2)).toFixed(1));
    }
    next();
});
healthDataSchema.index({ healthStatus: 1 });
healthDataSchema.index({ exerciseCompliance: 1 });
healthDataSchema.index({ lastHealthCheck: 1 });
exports.HealthData = mongoose_1.default.model('HealthData', healthDataSchema);
exports.default = exports.HealthData;
//# sourceMappingURL=HealthData.js.map