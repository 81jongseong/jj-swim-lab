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
exports.WorkoutPlanSchema = exports.ExerciseSchema = void 0;
const mongoose_1 = __importStar(require("mongoose"));
exports.ExerciseSchema = new mongoose_1.Schema({
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
exports.WorkoutPlanSchema = new mongoose_1.Schema({
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
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        required: true
    },
    category: { type: String, required: true },
    duration: { type: Number, required: true },
    frequency: { type: mongoose_1.Schema.Types.Mixed },
    equipment: [{ type: String }],
    instructions: [{ type: String, required: true }],
    benefits: [{ type: String, required: true }]
}, {
    timestamps: true
});
ExerciseRecommendationSchema.index({ category: 1, difficulty: 1 });
exports.default = mongoose_1.default.model('ExerciseRecommendation', ExerciseRecommendationSchema);
//# sourceMappingURL=ExerciseRecommendation.js.map