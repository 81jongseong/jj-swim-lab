"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Course = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const courseSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        required: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    maxStudents: {
        type: Number,
        required: true,
    },
    instructor: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    classInfo: {
        className: { type: String, required: true },
        classType: {
            type: String,
            enum: ['regular', 'intensive', 'private'],
            default: 'regular',
            required: true
        },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        maxCapacity: { type: Number, required: true },
        currentEnrollment: { type: Number, default: 0 }
    },
    teachingMethods: [{
            methodId: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'TeachingMethod',
                required: true
            },
            order: { type: Number, required: true },
            isRequired: { type: Boolean, default: true }
        }],
    schedule: [{
            day: {
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
        }],
    isActive: {
        type: Boolean,
        default: true,
    },
    enrolledStudents: [{
            student: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'User',
                required: true
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
            progress: {
                percentage: { type: Number, default: 0 },
                completedSteps: [{
                        methodId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'TeachingMethod' },
                        stepName: { type: String, required: true },
                        completedAt: { type: Date, default: Date.now },
                        notes: { type: String, default: '' }
                    }],
                lastUpdated: { type: Date, default: Date.now },
                notes: { type: String, default: '' }
            }
        }],
}, {
    timestamps: true
});
exports.Course = mongoose_1.default.model('Course', courseSchema);
//# sourceMappingURL=Course.js.map