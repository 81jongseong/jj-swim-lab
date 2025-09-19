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
exports.StudentGoal = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const studentGoalSchema = new mongoose_1.Schema({
    studentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
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
    targetDate: {
        type: Date,
        required: true
    },
    teachingMethods: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'TeachingMethod'
        }],
    priority: {
        type: String,
        enum: ['high', 'medium', 'low'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'paused', 'cancelled'],
        default: 'active'
    },
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    milestones: [{
            title: {
                type: String,
                required: true
            },
            description: {
                type: String,
                required: true
            },
            targetDate: {
                type: Date,
                required: true
            },
            completed: {
                type: Boolean,
                default: false
            },
            completedAt: {
                type: Date
            }
        }],
    notes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});
studentGoalSchema.pre('save', function (next) {
    if (this.milestones && this.milestones.length > 0) {
        const completedMilestones = this.milestones.filter(m => m.completed).length;
        this.progress = Math.round((completedMilestones / this.milestones.length) * 100);
        if (this.progress === 100 && this.status === 'active') {
            this.status = 'completed';
        }
    }
    next();
});
exports.StudentGoal = mongoose_1.default.model('StudentGoal', studentGoalSchema);
//# sourceMappingURL=StudentGoal.js.map