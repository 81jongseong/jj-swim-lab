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
exports.SmartWatchData = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const SmartWatchDataSchema = new mongoose_1.Schema({
    studentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sessionId: {
        type: String,
        required: true
    },
    deviceInfo: {
        deviceType: {
            type: String,
            required: true,
            enum: ['apple_watch', 'samsung_galaxy_watch', 'fitbit', 'garmin', 'other']
        },
        deviceModel: { type: String, required: true },
        firmwareVersion: { type: String, required: true }
    },
    sessionInfo: {
        startTime: { type: Date, required: true },
        endTime: { type: Date, required: true },
        duration: { type: Number, required: true },
        technique: {
            type: String,
            required: true,
            enum: ['freestyle', 'backstroke', 'breaststroke', 'butterfly']
        },
        poolLength: { type: Number, required: true },
        totalDistance: { type: Number, required: true }
    },
    performanceMetrics: {
        averageSpeed: { type: Number, required: true },
        maxSpeed: { type: Number, required: true },
        averageHeartRate: { type: Number, required: true },
        maxHeartRate: { type: Number, required: true },
        minHeartRate: { type: Number, required: true },
        strokeCount: { type: Number, required: true },
        strokeRate: { type: Number, required: true },
        caloriesBurned: { type: Number, required: true },
        efficiency: { type: Number, required: true, min: 0, max: 100 }
    },
    detailedData: {
        heartRateData: [{
                timestamp: { type: Date, required: true },
                heartRate: { type: Number, required: true }
            }],
        strokeData: [{
                timestamp: { type: Date, required: true },
                strokeType: { type: String, required: true },
                strokeCount: { type: Number, required: true },
                strokeRate: { type: Number, required: true }
            }],
        speedData: [{
                timestamp: { type: Date, required: true },
                speed: { type: Number, required: true },
                distance: { type: Number, required: true }
            }],
        restPeriods: [{
                startTime: { type: Date, required: true },
                endTime: { type: Date, required: true },
                duration: { type: Number, required: true }
            }]
    },
    aiAnalysis: {
        postureScore: { type: Number, min: 0, max: 100 },
        breathingPattern: {
            averageBreathRate: { type: Number },
            breathConsistency: { type: Number, min: 0, max: 100 },
            breathEfficiency: { type: Number, min: 0, max: 100 }
        },
        strokeAnalysis: {
            strokeConsistency: { type: Number, min: 0, max: 100 },
            strokeEfficiency: { type: Number, min: 0, max: 100 },
            strokePower: { type: Number, min: 0, max: 100 }
        },
        overallEfficiency: { type: Number, min: 0, max: 100 },
        recommendations: [{ type: String }]
    },
    syncedAt: {
        type: Date,
        default: Date.now
    },
    isProcessed: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});
SmartWatchDataSchema.index({ studentId: 1, 'sessionInfo.startTime': -1 });
SmartWatchDataSchema.index({ sessionId: 1 });
SmartWatchDataSchema.index({ isProcessed: 1 });
exports.SmartWatchData = mongoose_1.default.model('SmartWatchData', SmartWatchDataSchema);
//# sourceMappingURL=SmartWatchData.js.map