"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Evaluation = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const evaluationSchema = new mongoose_1.default.Schema({
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
    class: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Class',
        required: false,
    },
    courseEndDate: {
        type: Date,
        required: false,
    },
    evaluationDate: {
        type: Date,
        default: Date.now,
    },
    skills: {
        freestyle: {
            type: Number,
            min: 1,
            max: 5,
            default: 0
        },
        backstroke: {
            type: Number,
            min: 1,
            max: 5,
            default: 0
        },
        breaststroke: {
            type: Number,
            min: 1,
            max: 5,
            default: 0
        },
        butterfly: {
            type: Number,
            min: 1,
            max: 5,
            default: 0
        },
        diving: {
            type: Number,
            min: 1,
            max: 5,
            default: 0
        },
        turns: {
            type: Number,
            min: 1,
            max: 5,
            default: 0
        }
    },
    attitude: {
        type: Number,
        min: 1,
        max: 5,
        default: 0
    },
    effort: {
        type: Number,
        min: 1,
        max: 5,
        default: 0
    },
    overallRating: {
        type: Number,
        min: 1,
        max: 5,
        default: 0
    },
    ratings: {
        instructorTeaching: {
            type: Number,
            min: 1,
            max: 5,
            required: false,
        },
        courseContent: {
            type: Number,
            min: 1,
            max: 5,
            required: false,
        },
        facilityQuality: {
            type: Number,
            min: 1,
            max: 5,
            required: false,
        },
        overallSatisfaction: {
            type: Number,
            min: 1,
            max: 5,
            required: false,
        },
    },
    comments: {
        strengths: {
            type: String,
            default: '',
        },
        improvements: {
            type: String,
            default: '',
        },
        additionalComments: {
            type: String,
            default: '',
        },
    },
    instructorComments: {
        type: String,
        default: ''
    },
    recommendations: {
        type: String,
        default: ''
    },
    isAnonymous: {
        type: Boolean,
        default: false,
    },
    isSubmitted: {
        type: Boolean,
        default: false,
    },
    evaluationType: {
        type: String,
        enum: ['student_to_instructor', 'instructor_to_student', 'mutual'],
        default: 'mutual'
    }
}, {
    timestamps: true
});
evaluationSchema.methods.isWithinEvaluationPeriod = function () {
    if (!this.courseEndDate)
        return true;
    const now = new Date();
    const endDate = new Date(this.courseEndDate);
    const evaluationDeadline = new Date(endDate.getTime() + (10 * 24 * 60 * 60 * 1000));
    return now <= evaluationDeadline;
};
evaluationSchema.index({ student: 1, course: 1, evaluationDate: -1 });
evaluationSchema.index({ instructor: 1, course: 1, evaluationDate: -1 });
evaluationSchema.index({ evaluationType: 1 });
exports.Evaluation = mongoose_1.default.model('Evaluation', evaluationSchema);
//# sourceMappingURL=Evaluation.js.map