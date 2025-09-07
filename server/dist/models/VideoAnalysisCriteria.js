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
exports.VideoAnalysisResult = exports.VideoAnalysisCriteria = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const VideoAnalysisCriteriaSchema = new mongoose_1.Schema({
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
    analysisCriteria: {
        posture: {
            bodyAlignment: {
                criteria: [{ type: String }],
                weight: { type: Number, required: true, min: 0, max: 1 },
                thresholds: {
                    excellent: { type: Number, required: true, min: 0, max: 100 },
                    good: { type: Number, required: true, min: 0, max: 100 },
                    average: { type: Number, required: true, min: 0, max: 100 },
                    poor: { type: Number, required: true, min: 0, max: 100 }
                }
            },
            headPosition: {
                criteria: [{ type: String }],
                weight: { type: Number, required: true, min: 0, max: 1 },
                thresholds: {
                    excellent: { type: Number, required: true, min: 0, max: 100 },
                    good: { type: Number, required: true, min: 0, max: 100 },
                    average: { type: Number, required: true, min: 0, max: 100 },
                    poor: { type: Number, required: true, min: 0, max: 100 }
                }
            },
            coreStability: {
                criteria: [{ type: String }],
                weight: { type: Number, required: true, min: 0, max: 1 },
                thresholds: {
                    excellent: { type: Number, required: true, min: 0, max: 100 },
                    good: { type: Number, required: true, min: 0, max: 100 },
                    average: { type: Number, required: true, min: 0, max: 100 },
                    poor: { type: Number, required: true, min: 0, max: 100 }
                }
            }
        },
        breathing: {
            timing: {
                criteria: [{ type: String }],
                weight: { type: Number, required: true, min: 0, max: 1 },
                thresholds: {
                    excellent: { type: Number, required: true, min: 0, max: 100 },
                    good: { type: Number, required: true, min: 0, max: 100 },
                    average: { type: Number, required: true, min: 0, max: 100 },
                    poor: { type: Number, required: true, min: 0, max: 100 }
                }
            },
            technique: {
                criteria: [{ type: String }],
                weight: { type: Number, required: true, min: 0, max: 1 },
                thresholds: {
                    excellent: { type: Number, required: true, min: 0, max: 100 },
                    good: { type: Number, required: true, min: 0, max: 100 },
                    average: { type: Number, required: true, min: 0, max: 100 },
                    poor: { type: Number, required: true, min: 0, max: 100 }
                }
            },
            consistency: {
                criteria: [{ type: String }],
                weight: { type: Number, required: true, min: 0, max: 1 },
                thresholds: {
                    excellent: { type: Number, required: true, min: 0, max: 100 },
                    good: { type: Number, required: true, min: 0, max: 100 },
                    average: { type: Number, required: true, min: 0, max: 100 },
                    poor: { type: Number, required: true, min: 0, max: 100 }
                }
            }
        },
        movement: {
            strokeTechnique: {
                criteria: [{ type: String }],
                weight: { type: Number, required: true, min: 0, max: 1 },
                thresholds: {
                    excellent: { type: Number, required: true, min: 0, max: 100 },
                    good: { type: Number, required: true, min: 0, max: 100 },
                    average: { type: Number, required: true, min: 0, max: 100 },
                    poor: { type: Number, required: true, min: 0, max: 100 }
                }
            },
            rhythm: {
                criteria: [{ type: String }],
                weight: { type: Number, required: true, min: 0, max: 1 },
                thresholds: {
                    excellent: { type: Number, required: true, min: 0, max: 100 },
                    good: { type: Number, required: true, min: 0, max: 100 },
                    average: { type: Number, required: true, min: 0, max: 100 },
                    poor: { type: Number, required: true, min: 0, max: 100 }
                }
            },
            coordination: {
                criteria: [{ type: String }],
                weight: { type: Number, required: true, min: 0, max: 1 },
                thresholds: {
                    excellent: { type: Number, required: true, min: 0, max: 100 },
                    good: { type: Number, required: true, min: 0, max: 100 },
                    average: { type: Number, required: true, min: 0, max: 100 },
                    poor: { type: Number, required: true, min: 0, max: 100 }
                }
            }
        },
        efficiency: {
            power: {
                criteria: [{ type: String }],
                weight: { type: Number, required: true, min: 0, max: 1 },
                thresholds: {
                    excellent: { type: Number, required: true, min: 0, max: 100 },
                    good: { type: Number, required: true, min: 0, max: 100 },
                    average: { type: Number, required: true, min: 0, max: 100 },
                    poor: { type: Number, required: true, min: 0, max: 100 }
                }
            },
            endurance: {
                criteria: [{ type: String }],
                weight: { type: Number, required: true, min: 0, max: 1 },
                thresholds: {
                    excellent: { type: Number, required: true, min: 0, max: 100 },
                    good: { type: Number, required: true, min: 0, max: 100 },
                    average: { type: Number, required: true, min: 0, max: 100 },
                    poor: { type: Number, required: true, min: 0, max: 100 }
                }
            },
            speed: {
                criteria: [{ type: String }],
                weight: { type: Number, required: true, min: 0, max: 1 },
                thresholds: {
                    excellent: { type: Number, required: true, min: 0, max: 100 },
                    good: { type: Number, required: true, min: 0, max: 100 },
                    average: { type: Number, required: true, min: 0, max: 100 },
                    poor: { type: Number, required: true, min: 0, max: 100 }
                }
            }
        }
    },
    videoAnalysisSettings: {
        frameRate: { type: Number, default: 30 },
        keyFrameInterval: { type: Number, default: 10 },
        analysisRegions: {
            body: {
                x: { type: Number, default: 0 },
                y: { type: Number, default: 0 },
                width: { type: Number, default: 100 },
                height: { type: Number, default: 100 }
            },
            head: {
                x: { type: Number, default: 0 },
                y: { type: Number, default: 0 },
                width: { type: Number, default: 100 },
                height: { type: Number, default: 100 }
            },
            arms: {
                x: { type: Number, default: 0 },
                y: { type: Number, default: 0 },
                width: { type: Number, default: 100 },
                height: { type: Number, default: 100 }
            },
            legs: {
                x: { type: Number, default: 0 },
                y: { type: Number, default: 0 },
                width: { type: Number, default: 100 },
                height: { type: Number, default: 100 }
            }
        },
        detectionSensitivity: { type: Number, default: 0.7, min: 0, max: 1 },
        trackingAccuracy: { type: Number, default: 0.8, min: 0, max: 1 }
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
const VideoAnalysisResultSchema = new mongoose_1.Schema({
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
    videoId: {
        type: String,
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
    videoMetadata: {
        duration: { type: Number, required: true },
        frameRate: { type: Number, required: true },
        resolution: {
            width: { type: Number, required: true },
            height: { type: Number, required: true }
        },
        fileSize: { type: Number, required: true },
        uploadDate: { type: Date, required: true }
    },
    analysisResult: {
        overallScore: { type: Number, required: true, min: 0, max: 100 },
        categoryScores: {
            posture: { type: Number, required: true, min: 0, max: 100 },
            breathing: { type: Number, required: true, min: 0, max: 100 },
            movement: { type: Number, required: true, min: 0, max: 100 },
            efficiency: { type: Number, required: true, min: 0, max: 100 }
        },
        detailedAnalysis: mongoose_1.Schema.Types.Mixed,
        keyFrames: [{
                frameNumber: { type: Number, required: true },
                timestamp: { type: Number, required: true },
                analysis: { type: String, required: true },
                score: { type: Number, required: true, min: 0, max: 100 }
            }],
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
        nextAnalysisDate: { type: Date, required: true }
    },
    feedback: {
        summary: { type: String, required: true },
        detailedFeedback: { type: String, required: true },
        encouragement: { type: String, required: true },
        goals: [{ type: String }]
    },
    filePaths: {
        video3D: { type: String },
        originalFrames: [{ type: String }],
        depthMaps: [{ type: String }],
        reconstructed3D: [{ type: String }]
    },
    analysisDate: { type: Date, required: true }
}, {
    timestamps: true
});
VideoAnalysisCriteriaSchema.index({ technique: 1, level: 1 }, { unique: true });
VideoAnalysisResultSchema.index({ studentId: 1, technique: 1, analysisDate: -1 });
VideoAnalysisResultSchema.index({ videoId: 1 });
exports.VideoAnalysisCriteria = mongoose_1.default.model('VideoAnalysisCriteria', VideoAnalysisCriteriaSchema);
exports.VideoAnalysisResult = mongoose_1.default.model('VideoAnalysisResult', VideoAnalysisResultSchema);
//# sourceMappingURL=VideoAnalysisCriteria.js.map