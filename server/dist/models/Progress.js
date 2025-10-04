"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Progress = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const progressSchema = new mongoose_1.default.Schema({
    student: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    instructor: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    course: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
    },
    center: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'SwimmingCenter',
        required: false,
    },
    class: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Class',
        required: false,
    },
    type: {
        type: String,
        enum: ['progress', 'checklist', 'evaluation'],
        default: 'progress'
    },
    evaluationDate: {
        type: Date,
        required: false,
    },
    skills: [{
            skillName: {
                type: String,
                required: true,
            },
            status: {
                type: String,
                enum: ['not_started', 'learning', 'completed', 'needs_improvement'],
                default: 'not_started',
            },
            instructorNotes: {
                type: String,
                default: '',
            },
            practiceDrills: [{
                    name: String,
                    description: String,
                    youtubeUrl: String,
                }],
            advice: {
                type: String,
                default: '',
            },
        }],
    overallProgress: {
        type: Number,
        default: 0,
    },
    instructorComments: {
        type: String,
        default: '',
    },
    nextGoals: [{
            goal: String,
            targetDate: Date,
        }],
    checklistItems: [{
            title: String,
            description: String,
            isCompleted: {
                type: Boolean,
                default: false
            },
            notes: String,
            completedAt: Date,
            dueDate: Date,
            priority: {
                type: String,
                enum: ['low', 'medium', 'high'],
                default: 'medium'
            }
        }],
    dueDate: Date,
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed', 'overdue'],
        default: 'pending'
    },
    notes: String,
    completedLessons: [{
            lessonName: String,
            completedAt: Date,
            score: Number
        }],
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    updatedBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User'
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true
});
progressSchema.index({ student: 1, course: 1, evaluationDate: -1 });
progressSchema.index({ instructor: 1, type: 1 });
progressSchema.index({ student: 1, type: 1 });
exports.Progress = mongoose_1.default.models.Progress || mongoose_1.default.model('Progress', progressSchema);
//# sourceMappingURL=Progress.js.map