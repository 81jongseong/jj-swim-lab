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
exports.LessonPlanTemplate = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const lessonPlanTemplateSchema = new mongoose_1.Schema({
    templateName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    category: {
        type: String,
        enum: ['freestyle', 'backstroke', 'breaststroke', 'butterfly', 'mixed', 'basic', 'advanced'],
        required: true,
        index: true
    },
    level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        required: true,
        index: true
    },
    totalDuration: {
        type: Number,
        required: true,
        min: 1,
        max: 52
    },
    totalSessions: {
        type: Number,
        required: true,
        min: 4,
        max: 200
    },
    sessionDuration: {
        type: Number,
        required: true,
        min: 30,
        max: 180
    },
    stages: [{
            stageNumber: {
                type: Number,
                required: true,
                min: 1
            },
            stageName: {
                type: String,
                required: true,
                trim: true
            },
            duration: {
                type: Number,
                required: true,
                min: 1
            },
            sessions: {
                type: Number,
                required: true,
                min: 1
            },
            objectives: [{
                    type: String,
                    required: true,
                    trim: true
                }],
            teachingMethods: [{
                    type: String,
                    required: true,
                    trim: true
                }],
            assessmentCriteria: [{
                    type: String,
                    trim: true
                }],
            materials: [{
                    type: String,
                    trim: true
                }],
            safetyNotes: [{
                    type: String,
                    trim: true
                }],
            progressRequirements: [{
                    type: String,
                    trim: true
                }]
        }],
    specialStages: [{
            stageName: {
                type: String,
                required: true,
                trim: true
            },
            description: {
                type: String,
                required: true,
                trim: true
            },
            isOptional: {
                type: Boolean,
                default: true
            },
            duration: {
                type: Number,
                required: true,
                min: 1
            },
            prerequisites: [{
                    type: String,
                    trim: true
                }],
            objectives: [{
                    type: String,
                    trim: true
                }],
            teachingMethods: [{
                    type: String,
                    trim: true
                }]
        }],
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    isPublic: {
        type: Boolean,
        default: true,
        index: true
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    usageCount: {
        type: Number,
        default: 0,
        min: 0
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    tags: [{
            type: String,
            trim: true
        }]
}, {
    timestamps: true,
    collection: 'lessonplantemplates'
});
lessonPlanTemplateSchema.index({ category: 1, level: 1, isActive: 1 });
lessonPlanTemplateSchema.index({ isPublic: 1, isActive: 1 });
lessonPlanTemplateSchema.index({ createdBy: 1, isActive: 1 });
lessonPlanTemplateSchema.virtual('totalStageDuration').get(function () {
    return this.stages.reduce((total, stage) => total + stage.duration, 0);
});
lessonPlanTemplateSchema.virtual('stageCount').get(function () {
    return this.stages.length;
});
exports.LessonPlanTemplate = mongoose_1.default.model('LessonPlanTemplate', lessonPlanTemplateSchema);
//# sourceMappingURL=LessonPlanTemplate.js.map