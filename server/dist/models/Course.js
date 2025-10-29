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
    instructorId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
    },
    instructorName: {
        type: String,
    },
    centerId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Center',
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
            lanes: {
                type: {
                    assignedLanes: [{ type: Number }],
                    originalAssignedLanes: [{ type: Number }],
                    isAdjusted: { type: Boolean, default: false }
                },
                default: () => ({
                    assignedLanes: [],
                    originalAssignedLanes: [],
                    isAdjusted: false
                })
            }
        }],
    poolType: {
        type: String,
        enum: ['mainPool', 'kidsPool', 'auxiliaryPool'],
        default: 'mainPool'
    },
    lanes: [{
            type: Number,
            min: 1,
            max: 10
        }],
    laneInfo: {
        assignedLanes: [{ type: Number }],
        originalAssignedLanes: [{ type: Number }],
        maxLanes: { type: Number, default: 1 },
        minLanes: { type: Number, default: 1 },
        laneNotes: { type: String, default: '' }
    },
    personalLessonAdjustment: {
        isEnabled: { type: Boolean, default: false },
        reducedLanes: { type: Number, default: 1 },
        adjustmentTime: { type: Number, default: 60 },
        notes: { type: String, default: '' }
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        default: function () {
            const date = new Date();
            date.setMonth(date.getMonth() + 1);
            return date;
        }
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
    tags: [{
            type: String
        }],
    isPersonalLesson: {
        type: Boolean,
        default: false
    },
    personalLessonSettings: {
        timeSlots: [{
                startTime: String,
                endTime: String
            }],
        lessonTypes: [String],
        frequencyOptions: [String]
    },
    courseType: {
        type: String,
        enum: ['group', 'personal', 'freeSwim'],
        default: 'group'
    }
}, {
    timestamps: true
});
courseSchema.index({ centerId: 1, status: 1 });
courseSchema.index({ instructorId: 1, status: 1 });
courseSchema.index({ 'schedule.dayOfWeek': 1, 'schedule.startTime': 1 });
courseSchema.index({ 'level': 1, 'category': 1 });
courseSchema.index({ 'students.studentId': 1 });
courseSchema.index({ createdAt: -1 });
courseSchema.index({ 'capacity.max': 1, 'capacity.current': 1 });
courseSchema.index({ 'price.amount': 1 });
exports.Course = mongoose_1.default.models.Course || mongoose_1.default.model('Course', courseSchema);
//# sourceMappingURL=Course.js.map