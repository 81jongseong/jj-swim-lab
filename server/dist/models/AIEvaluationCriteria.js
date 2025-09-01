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
exports.AIEvaluationResult = exports.ExerciseRecommendation = exports.EvaluationCriteria = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const EvaluationCriteriaSchema = new mongoose_1.Schema({
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
    categories: {
        posture: {
            weight: { type: Number, required: true, min: 0, max: 1 },
            subCategories: {
                bodyAlignment: {
                    weight: { type: Number, required: true, min: 0, max: 1 },
                    criteria: [{ type: String }]
                },
                headPosition: {
                    weight: { type: Number, required: true, min: 0, max: 1 },
                    criteria: [{ type: String }]
                },
                coreStability: {
                    weight: { type: Number, required: true, min: 0, max: 1 },
                    criteria: [{ type: String }]
                }
            }
        },
        breathing: {
            weight: { type: Number, required: true, min: 0, max: 1 },
            subCategories: {
                timing: {
                    weight: { type: Number, required: true, min: 0, max: 1 },
                    criteria: [{ type: String }]
                },
                technique: {
                    weight: { type: Number, required: true, min: 0, max: 1 },
                    criteria: [{ type: String }]
                },
                consistency: {
                    weight: { type: Number, required: true, min: 0, max: 1 },
                    criteria: [{ type: String }]
                }
            }
        },
        movement: {
            weight: { type: Number, required: true, min: 0, max: 1 },
            subCategories: {
                strokeTechnique: {
                    weight: { type: Number, required: true, min: 0, max: 1 },
                    criteria: [{ type: String }]
                },
                rhythm: {
                    weight: { type: Number, required: true, min: 0, max: 1 },
                    criteria: [{ type: String }]
                },
                coordination: {
                    weight: { type: Number, required: true, min: 0, max: 1 },
                    criteria: [{ type: String }]
                }
            }
        },
        efficiency: {
            weight: { type: Number, required: true, min: 0, max: 1 },
            subCategories: {
                power: {
                    weight: { type: Number, required: true, min: 0, max: 1 },
                    criteria: [{ type: String }]
                },
                endurance: {
                    weight: { type: Number, required: true, min: 0, max: 1 },
                    criteria: [{ type: String }]
                },
                speed: {
                    weight: { type: Number, required: true, min: 0, max: 1 },
                    criteria: [{ type: String }]
                }
            }
        }
    },
    performanceMetrics: {
        speed: {
            beginner: { min: Number, max: Number, unit: String },
            intermediate: { min: Number, max: Number, unit: String },
            advanced: { min: Number, max: Number, unit: String },
            expert: { min: Number, max: Number, unit: String }
        },
        endurance: {
            beginner: { min: Number, max: Number, unit: String },
            intermediate: { min: Number, max: Number, unit: String },
            advanced: { min: Number, max: Number, unit: String },
            expert: { min: Number, max: Number, unit: String }
        },
        strokeCount: {
            beginner: { min: Number, max: Number, unit: String },
            intermediate: { min: Number, max: Number, unit: String },
            advanced: { min: Number, max: Number, unit: String },
            expert: { min: Number, max: Number, unit: String }
        },
        heartRate: {
            beginner: { min: Number, max: Number, unit: String },
            intermediate: { min: Number, max: Number, unit: String },
            advanced: { min: Number, max: Number, unit: String },
            expert: { min: Number, max: Number, unit: String }
        }
    },
    scoringMethod: {
        type: { type: String, enum: ['weighted', 'threshold', 'progressive'], default: 'weighted' },
        parameters: mongoose_1.Schema.Types.Mixed
    },
    feedbackTemplates: {
        excellent: [{ type: String }],
        good: [{ type: String }],
        average: [{ type: String }],
        poor: [{ type: String }]
    },
    improvementSuggestions: {
        posture: [{ type: String }],
        breathing: [{ type: String }],
        movement: [{ type: String }],
        efficiency: [{ type: String }]
    },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});
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
    exercises: [{
            name: { type: String, required: true },
            description: { type: String, required: true },
            difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
            duration: { type: Number, required: true },
            repetitions: Number,
            sets: Number,
            equipment: [{ type: String }],
            instructions: [{ type: String }],
            benefits: [{ type: String }],
            precautions: [{ type: String }]
        }],
    workoutPlan: [{
            name: { type: String, required: true },
            description: { type: String, required: true },
            totalDuration: { type: Number, required: true },
            exercises: [{
                    exerciseName: { type: String, required: true },
                    duration: { type: Number, required: true },
                    order: { type: Number, required: true }
                }],
            frequency: { type: Number, required: true },
            progression: mongoose_1.Schema.Types.Mixed
        }],
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});
const AIEvaluationResultSchema = new mongoose_1.Schema({
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
    inputData: {
        performanceMetrics: {
            speed: Number,
            endurance: Number,
            strokeCount: Number,
            heartRate: Number,
            distance: Number
        },
        instructorObservations: {
            posture: { type: Number, required: true, min: 0, max: 100 },
            breathing: { type: Number, required: true, min: 0, max: 100 },
            movement: { type: Number, required: true, min: 0, max: 100 },
            efficiency: { type: Number, required: true, min: 0, max: 100 }
        }
    },
    analysisResult: {
        overallScore: { type: Number, required: true, min: 0, max: 100 },
        categoryScores: {
            posture: { type: Number, required: true, min: 0, max: 100 },
            breathing: { type: Number, required: true, min: 0, max: 100 },
            movement: { type: Number, required: true, min: 0, max: 100 },
            efficiency: { type: Number, required: true, min: 0, max: 100 }
        },
        levelAssessment: { type: String, required: true },
        strengths: [{ type: String }],
        weaknesses: [{ type: String }],
        improvementAreas: [{ type: String }]
    },
    recommendations: {
        exercises: [{
                name: { type: String, required: true },
                priority: { type: String, enum: ['high', 'medium', 'low'], required: true },
                reason: { type: String, required: true },
                duration: { type: Number, required: true }
            }],
        workoutPlan: {
            name: { type: String, required: true },
            description: { type: String, required: true },
            duration: { type: Number, required: true },
            frequency: { type: Number, required: true }
        },
        nextEvaluationDate: { type: Date, required: true }
    },
    feedback: {
        summary: { type: String, required: true },
        detailedFeedback: { type: String, required: true },
        encouragement: { type: String, required: true },
        goals: [{ type: String }]
    },
    evaluationDate: { type: Date, required: true }
}, {
    timestamps: true
});
EvaluationCriteriaSchema.index({ technique: 1, level: 1 }, { unique: true });
ExerciseRecommendationSchema.index({ technique: 1, level: 1, category: 1 });
AIEvaluationResultSchema.index({ studentId: 1, technique: 1, evaluationDate: -1 });
exports.EvaluationCriteria = mongoose_1.default.model('EvaluationCriteria', EvaluationCriteriaSchema);
exports.ExerciseRecommendation = mongoose_1.default.model('ExerciseRecommendation', ExerciseRecommendationSchema);
exports.AIEvaluationResult = mongoose_1.default.model('AIEvaluationResult', AIEvaluationResultSchema);
//# sourceMappingURL=AIEvaluationCriteria.js.map