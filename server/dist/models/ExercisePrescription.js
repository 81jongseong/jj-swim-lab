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
exports.ExercisePrescription = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ExercisePrescriptionSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    centerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Center',
        index: true
    },
    instructorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    healthGrade: {
        obesityGrade: {
            type: String,
            enum: ['normal', 'overweight', 'obesity1', 'obesity2', 'obesity3'],
            required: true
        },
        cardiovascularGrade: {
            type: String,
            enum: ['low', 'moderate', 'high', 'very_high'],
            required: true
        },
        fitnessGrade: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced'],
            required: true
        },
        ageGrade: {
            type: String,
            enum: ['young', 'middle', 'senior'],
            required: true
        },
        overallGrade: {
            type: String,
            enum: ['A', 'B', 'C', 'D', 'E'],
            required: true
        }
    },
    currentPrescription: {
        sessionDuration: { type: Number, required: true },
        totalDistance: { type: Number, required: true },
        targetHeartRate: {
            min: { type: Number, required: true },
            max: { type: Number, required: true },
            optimal: { type: Number, required: true }
        },
        recommendedExercises: {
            warmUp: {
                duration: { type: Number, required: true },
                intensity: { type: String, required: true }
            },
            mainExercise: {
                duration: { type: Number, required: true },
                intensity: { type: String, required: true },
                sets: { type: Number }
            },
            coolDown: {
                duration: { type: Number, required: true },
                intensity: { type: String, required: true }
            }
        },
        weeklyFrequency: { type: Number, required: true },
        progressionPlan: {
            currentWeek: { type: Number, required: true },
            totalWeeks: { type: Number, required: true },
            weeklyIncrease: { type: Number, required: true }
        },
        safetyGuidelines: [{ type: String }],
        contraindications: [{ type: String }]
    },
    prescriptionInfo: {
        createdBy: {
            type: String,
            enum: ['system', 'instructor', 'center_admin', 'user'],
            required: true
        },
        createdByUserId: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        },
        creationReason: { type: String, required: true },
        baseHealthData: { type: mongoose_1.Schema.Types.Mixed },
        algorithmVersion: { type: String, default: '1.0' }
    },
    adjustmentHistory: [{
            adjustmentId: { type: String, required: true },
            date: { type: Date, required: true },
            type: {
                type: String,
                enum: ['increase', 'maintain', 'decrease'],
                required: true
            },
            amount: { type: Number, required: true },
            reason: [{ type: String }],
            confidence: { type: Number, required: true },
            adjustedBy: {
                type: String,
                enum: ['system', 'instructor', 'center_admin', 'user'],
                required: true
            },
            adjustedByUserId: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User'
            },
            previousPrescription: { type: mongoose_1.Schema.Types.Mixed },
            newPrescription: { type: mongoose_1.Schema.Types.Mixed }
        }],
    exerciseHistory: [{
            sessionId: { type: String, required: true },
            date: { type: Date, required: true },
            prescribedExercise: { type: mongoose_1.Schema.Types.Mixed },
            actualPerformance: {
                duration: { type: Number, required: true },
                distance: { type: Number, required: true },
                averageHeartRate: { type: Number, required: true },
                maxHeartRate: { type: Number, required: true },
                perceivedExertion: { type: Number, required: true },
                completionRate: { type: Number, required: true }
            },
            feedback: {
                difficulty: {
                    type: String,
                    enum: ['too_easy', 'appropriate', 'too_hard'],
                    required: true
                },
                fatigue: {
                    type: String,
                    enum: ['low', 'moderate', 'high'],
                    required: true
                },
                enjoyment: {
                    type: String,
                    enum: ['low', 'moderate', 'high'],
                    required: true
                },
                instructorNotes: { type: String }
            },
            nextAdjustment: {
                intensityChange: { type: Number, required: true },
                durationChange: { type: Number, required: true },
                reason: { type: String, required: true }
            }
        }],
    status: {
        isActive: { type: Boolean, default: true },
        lastUpdated: { type: Date, default: Date.now },
        nextReviewDate: { type: Date, required: true },
        totalSessions: { type: Number, default: 0 },
        averageCompletionRate: { type: Number, default: 0 },
        currentStreak: { type: Number, default: 0 },
        longestStreak: { type: Number, default: 0 }
    }
}, {
    timestamps: true,
    collection: 'exercise_prescriptions'
});
ExercisePrescriptionSchema.index({ userId: 1, isActive: 1 });
ExercisePrescriptionSchema.index({ centerId: 1, status: 1 });
ExercisePrescriptionSchema.index({ instructorId: 1, status: 1 });
ExercisePrescriptionSchema.index({ 'status.nextReviewDate': 1 });
ExercisePrescriptionSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true
});
ExercisePrescriptionSchema.virtual('center', {
    ref: 'Center',
    localField: 'centerId',
    foreignField: '_id',
    justOne: true
});
ExercisePrescriptionSchema.virtual('instructor', {
    ref: 'User',
    localField: 'instructorId',
    foreignField: '_id',
    justOne: true
});
ExercisePrescriptionSchema.pre('save', function (next) {
    this.status.lastUpdated = new Date();
    next();
});
exports.ExercisePrescription = mongoose_1.default.model('ExercisePrescription', ExercisePrescriptionSchema);
//# sourceMappingURL=ExercisePrescription.js.map