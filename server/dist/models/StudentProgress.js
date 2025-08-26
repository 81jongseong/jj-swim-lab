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
exports.StudentProgress = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const StudentProgressItemSchema = new mongoose_1.Schema({
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
    instructorNotes: {
        type: String,
        trim: true
    },
    studentNotes: {
        type: String,
        trim: true
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
    }
}, {
    timestamps: true
});
const StudentProgressSchema = new mongoose_1.Schema({
    studentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    classId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    classChecklistId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'ClassChecklist',
        required: true
    },
    items: {
        type: [StudentProgressItemSchema],
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
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});
StudentProgressSchema.index({ studentId: 1, classId: 1 }, { unique: true });
exports.StudentProgress = mongoose_1.default.model('StudentProgress', StudentProgressSchema);
//# sourceMappingURL=StudentProgress.js.map