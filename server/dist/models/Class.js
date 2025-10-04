"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Class = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const classSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
    },
    center: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'SwimmingCenter',
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
    level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        required: true,
    },
    maxStudents: {
        type: Number,
        required: true,
    },
    currentStudents: {
        type: Number,
        default: 0,
    },
    schedule: {
        dayOfWeek: {
            type: String,
            enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
            required: true,
        },
        startTime: {
            type: String,
            required: true,
        },
        endTime: {
            type: String,
            required: true,
        },
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    description: {
        type: String,
        default: '',
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    students: [{
            student: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'User',
            },
            enrolledAt: {
                type: Date,
                default: Date.now,
            },
            status: {
                type: String,
                enum: ['active', 'completed', 'dropped'],
                default: 'active',
            },
        }],
}, {
    timestamps: true
});
classSchema.index({ instructor: 1, isActive: 1 });
exports.Class = mongoose_1.default.models.Class || mongoose_1.default.model('Class', classSchema);
//# sourceMappingURL=Class.js.map