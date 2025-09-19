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
exports.Checklist = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ChecklistItemSchema = new mongoose_1.Schema({
    teachingMethodId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'TeachingMethod',
        required: false
    },
    stepName: {
        type: String,
        required: true,
        trim: true
    },
    stepOrder: {
        type: Number,
        required: true,
        default: 0
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date
    },
    category: {
        type: String,
        trim: true
    },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced']
    },
    tips: {
        type: String,
        trim: true
    },
    notes: {
        type: String,
        trim: true
    },
    instructorNotes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});
const ChecklistSchema = new mongoose_1.Schema({
    studentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    courseId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    instructorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: {
        type: [ChecklistItemSchema],
        default: []
    },
    overallProgress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    targetCompletionDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'paused'],
        default: 'active'
    },
    completedAt: {
        type: Date
    },
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});
ChecklistSchema.index({ studentId: 1, courseId: 1 });
ChecklistSchema.index({ instructorId: 1, status: 1 });
ChecklistSchema.index({ lastUpdated: -1 });
ChecklistSchema.pre('save', function (next) {
    if (this.items && this.items.length > 0) {
        const completedItems = this.items.filter(item => item.isCompleted).length;
        this.overallProgress = Math.round((completedItems / this.items.length) * 100);
    }
    this.lastUpdated = new Date();
    next();
});
exports.Checklist = mongoose_1.default.model('Checklist', ChecklistSchema);
//# sourceMappingURL=Checklist.js.map