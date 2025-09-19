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
exports.AIAnalysis = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const AIAnalysisSchema = new mongoose_1.Schema({
    studentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    instructorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    analysisType: {
        type: String,
        enum: ['posture', 'progress', 'recommendation', 'performance'],
        required: true
    },
    postureAnalysis: {
        technique: {
            type: String,
            enum: ['freestyle', 'backstroke', 'breaststroke', 'butterfly']
        },
        score: {
            type: Number,
            min: 0,
            max: 100
        },
        strengths: [String],
        improvements: [String],
        detailedFeedback: String
    },
    progressPrediction: {
        currentLevel: String,
        predictedNextLevel: String,
        estimatedWeeks: Number,
        confidence: {
            type: Number,
            min: 0,
            max: 1
        },
        factors: [String]
    },
    personalizedRecommendation: {
        recommendedExercises: [String],
        focusAreas: [String],
        difficultyAdjustment: {
            type: String,
            enum: ['easier', 'same', 'harder']
        },
        estimatedImprovement: String
    },
    performanceAnalysis: {
        overallScore: Number,
        improvementRate: Number,
        consistencyScore: Number,
        recommendations: [String]
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});
AIAnalysisSchema.index({ studentId: 1, analysisType: 1, createdAt: -1 });
AIAnalysisSchema.index({ instructorId: 1, analysisType: 1 });
exports.AIAnalysis = mongoose_1.default.model('AIAnalysis', AIAnalysisSchema);
//# sourceMappingURL=AIAnalysis.js.map