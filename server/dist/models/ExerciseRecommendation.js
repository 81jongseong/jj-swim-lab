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
const mongoose_1 = __importStar(require("mongoose"));
const ExerciseSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true
    },
    duration: { type: Number, required: true, min: 1 },
    repetitions: { type: Number, min: 1 },
    sets: { type: Number, min: 1 },
    equipment: [{ type: String }],
    instructions: [{ type: String }],
    benefits: [{ type: String }],
    precautions: [{ type: String }]
}, { _id: false });
const WorkoutPlanSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    totalDuration: { type: Number, required: true, min: 1 },
    exercises: [{
            exerciseName: { type: String, required: true },
            duration: { type: Number, required: true, min: 1 },
            order: { type: Number, required: true, min: 1 }
        }],
    frequency: { type: Number, required: true, min: 1 },
    progression: { type: mongoose_1.Schema.Types.Mixed }
}, { _id: false });
const ExerciseRecommendationSchema = new mongoose_1.Schema({
    technique: {
        type: String,
        required: true,
        enum: ['freestyle', 'backstroke', 'breaststroke', 'butterfly']
    },
    level: {
        type: String,
        required: true,
        enum: ['beginner', 'intermediate', 'advanced', 'expert']
    },
    category: {
        type: String,
        required: true,
        enum: ['posture', 'breathing', 'movement', 'efficiency']
    },
    exercises: [ExerciseSchema],
    workoutPlan: [WorkoutPlanSchema],
    isActive: { type: Boolean, default: true },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    centerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Center',
        required: true
    }
}, {
    timestamps: true
});
ExerciseRecommendationSchema.index({ technique: 1, level: 1, category: 1 });
ExerciseRecommendationSchema.index({ centerId: 1, isActive: 1 });
ExerciseRecommendationSchema.index({ createdBy: 1 });
exports.default = mongoose_1.default.model('ExerciseRecommendation', ExerciseRecommendationSchema);
//# sourceMappingURL=ExerciseRecommendation.js.map