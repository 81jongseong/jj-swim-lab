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
exports.AIEvaluationResult = exports.EvaluationCriteria = void 0;
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
            beginner: {
                min: { type: Number, required: true },
                max: { type: Number, required: true },
                unit: { type: String, required: true, default: 'm/s' }
            },
            intermediate: {
                min: { type: Number, required: true },
                max: { type: Number, required: true },
                unit: { type: String, required: true, default: 'm/s' }
            },
            advanced: {
                min: { type: Number, required: true },
                max: { type: Number, required: true },
                unit: { type: String, required: true, default: 'm/s' }
            },
            expert: {
                min: { type: Number, required: true },
                max: { type: Number, required: true },
                unit: { type: String, required: true, default: 'm/s' }
            }
        },
        distance: {
            beginner: {
                min: { type: Number, required: true },
                max: { type: Number, required: true },
                unit: { type: String, required: true, default: 'm' }
            },
            intermediate: {
                min: { type: Number, required: true },
                max: { type: Number, required: true },
                unit: { type: String, required: true, default: 'm' }
            },
            advanced: {
                min: { type: Number, required: true },
                max: { type: Number, required: true },
                unit: { type: String, required: true, default: 'm' }
            },
            expert: {
                min: { type: Number, required: true },
                max: { type: Number, required: true },
                unit: { type: String, required: true, default: 'm' }
            }
        },
        strokeCount: {
            beginner: {
                min: { type: Number, required: true },
                max: { type: Number, required: true },
                unit: { type: String, required: true, default: 'strokes' }
            },
            intermediate: {
                min: { type: Number, required: true },
                max: { type: Number, required: true },
                unit: { type: String, required: true, default: 'strokes' }
            },
            advanced: {
                min: { type: Number, required: true },
                max: { type: Number, required: true },
                unit: { type: String, required: true, default: 'strokes' }
            },
            expert: {
                min: { type: Number, required: true },
                max: { type: Number, required: true },
                unit: { type: String, required: true, default: 'strokes' }
            }
        }
    },
    aiSettings: {
        confidenceThreshold: { type: Number, required: true, min: 0, max: 1, default: 0.7 },
        analysisDepth: {
            type: String,
            enum: ['basic', 'intermediate', 'advanced'],
            default: 'intermediate'
        },
        feedbackStyle: {
            type: String,
            enum: ['encouraging', 'technical', 'balanced'],
            default: 'balanced'
        },
        language: { type: String, default: 'ko' }
    },
    isActive: { type: Boolean, default: true },
    version: { type: String, default: '1.0.0' },
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
const AIEvaluationResultSchema = new mongoose_1.Schema({
    studentId: {
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
    analysis: {
        posture: {
            score: { type: Number, required: true, min: 0, max: 100 },
            details: {
                bodyAlignment: {
                    score: { type: Number, required: true, min: 0, max: 100 },
                    feedback: { type: String, required: true }
                },
                headPosition: {
                    score: { type: Number, required: true, min: 0, max: 100 },
                    feedback: { type: String, required: true }
                },
                coreStability: {
                    score: { type: Number, required: true, min: 0, max: 100 },
                    feedback: { type: String, required: true }
                }
            }
        },
        breathing: {
            score: { type: Number, required: true, min: 0, max: 100 },
            details: {
                timing: {
                    score: { type: Number, required: true, min: 0, max: 100 },
                    feedback: { type: String, required: true }
                },
                technique: {
                    score: { type: Number, required: true, min: 0, max: 100 },
                    feedback: { type: String, required: true }
                },
                consistency: {
                    score: { type: Number, required: true, min: 0, max: 100 },
                    feedback: { type: String, required: true }
                }
            }
        },
        movement: {
            score: { type: Number, required: true, min: 0, max: 100 },
            details: {
                strokeTechnique: {
                    score: { type: Number, required: true, min: 0, max: 100 },
                    feedback: { type: String, required: true }
                },
                rhythm: {
                    score: { type: Number, required: true, min: 0, max: 100 },
                    feedback: { type: String, required: true }
                },
                coordination: {
                    score: { type: Number, required: true, min: 0, max: 100 },
                    feedback: { type: String, required: true }
                }
            }
        },
        efficiency: {
            score: { type: Number, required: true, min: 0, max: 100 },
            details: {
                power: {
                    score: { type: Number, required: true, min: 0, max: 100 },
                    feedback: { type: String, required: true }
                },
                endurance: {
                    score: { type: Number, required: true, min: 0, max: 100 },
                    feedback: { type: String, required: true }
                },
                speed: {
                    score: { type: Number, required: true, min: 0, max: 100 },
                    feedback: { type: String, required: true }
                }
            }
        }
    },
    performance: {
        speed: {
            value: { type: Number, required: true },
            unit: { type: String, required: true }
        },
        distance: {
            value: { type: Number, required: true },
            unit: { type: String, required: true }
        },
        strokeCount: {
            value: { type: Number, required: true },
            unit: { type: String, required: true }
        }
    },
    overallScore: { type: Number, required: true, min: 0, max: 100 },
    grade: {
        type: String,
        enum: ['A', 'B', 'C', 'D', 'F'],
        required: true
    },
    feedback: {
        summary: { type: String, required: true },
        detailedFeedback: { type: String, required: true },
        encouragement: { type: String, required: true },
        goals: [{ type: String }]
    },
    evaluationDate: { type: Date, required: true, default: Date.now }
}, {
    timestamps: true
});
EvaluationCriteriaSchema.index({ technique: 1, level: 1 }, { unique: true });
AIEvaluationResultSchema.index({ studentId: 1, technique: 1, evaluationDate: -1 });
exports.EvaluationCriteria = mongoose_1.default.model('EvaluationCriteria', EvaluationCriteriaSchema);
exports.AIEvaluationResult = mongoose_1.default.model('AIEvaluationResult', AIEvaluationResultSchema);
//# sourceMappingURL=AIEvaluationCriteria.js.map