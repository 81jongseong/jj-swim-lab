"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LessonPlan = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const lessonPlanSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true,
        maxlength: 100
    },
    description: {
        type: String,
        required: true,
        maxlength: 500
    },
    stroke: {
        type: String,
        required: true,
        enum: ['자유형', '평영', '배영', '접영', '혼영']
    },
    level: {
        type: String,
        required: true,
        enum: ['초급', '중급', '고급']
    },
    duration: {
        type: Number,
        required: true,
        min: 30,
        max: 120
    },
    objectives: [{
            type: String,
            maxlength: 200
        }],
    activities: [{
            name: String,
            description: String,
            duration: Number,
            materials: [String]
        }],
    assessment: {
        type: String,
        maxlength: 300
    },
    notes: {
        type: String,
        maxlength: 500
    },
    createdBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});
lessonPlanSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});
exports.LessonPlan = mongoose_1.default.model('LessonPlan', lessonPlanSchema);
//# sourceMappingURL=LessonPlan.js.map