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
exports.LearningProgress = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const learningProgressSchema = new mongoose_1.Schema({
    studentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    teachingMethodId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'TeachingMethod',
        required: true,
        index: true
    },
    completedSteps: [{
            type: Number,
            default: []
        }],
    totalSteps: {
        type: Number,
        required: true,
        default: 0
    },
    progress: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
        max: 100
    },
    lastStudied: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String,
        default: ''
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    studyTime: {
        type: Number,
        default: 0,
        min: 0
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    masteryLevel: {
        type: String,
        enum: ['learning', 'practicing', 'mastered'],
        default: 'learning'
    }
}, {
    timestamps: true
});
learningProgressSchema.index({ studentId: 1, teachingMethodId: 1 }, { unique: true });
learningProgressSchema.pre('save', function (next) {
    if (this.completedSteps && this.totalSteps > 0) {
        this.progress = Math.round((this.completedSteps.length / this.totalSteps) * 100);
        if (this.progress === 100) {
            this.masteryLevel = 'mastered';
        }
        else if (this.progress >= 70) {
            this.masteryLevel = 'practicing';
        }
        else {
            this.masteryLevel = 'learning';
        }
    }
    next();
});
exports.LearningProgress = mongoose_1.default.model('LearningProgress', learningProgressSchema);
//# sourceMappingURL=LearningProgress.js.map