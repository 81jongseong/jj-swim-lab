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
exports.Quiz = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const QuizSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
    },
    type: {
        type: String,
        enum: ['multiple-choice', 'short-answer'],
        required: true
    },
    questions: [{
            question: {
                type: String,
                required: true,
                trim: true
            },
            type: {
                type: String,
                enum: ['multiple-choice', 'short-answer'],
                required: true
            },
            options: [{
                    type: String,
                    trim: true
                }],
            correctAnswer: {
                type: mongoose_1.Schema.Types.Mixed,
                required: true
            },
            explanation: {
                type: String,
                trim: true
            },
            points: {
                type: Number,
                required: true,
                default: 1
            }
        }],
    timeLimit: {
        type: Number,
        min: 1,
        max: 180
    },
    passingScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    maxAttempts: {
        type: Number,
        default: 3,
        min: 1
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedTo: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        }],
    tags: [{
            type: String,
            trim: true
        }]
}, {
    timestamps: true
});
QuizSchema.index({ title: 'text', description: 'text', category: 1 });
QuizSchema.index({ createdBy: 1, isActive: 1 });
QuizSchema.index({ difficulty: 1, category: 1 });
exports.Quiz = mongoose_1.default.model('Quiz', QuizSchema);
//# sourceMappingURL=Quiz.js.map