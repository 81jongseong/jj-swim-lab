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
exports.PersonalLesson = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const personalLessonSchema = new mongoose_1.Schema({
    studentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    instructorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    centerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Center',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true,
        default: 60
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
        default: 'pending'
    },
    lessonType: {
        type: String,
        required: true
    },
    skillLevel: {
        type: String,
        required: true
    },
    goals: {
        type: String,
        required: true
    },
    notes: {
        type: String
    },
    price: {
        type: Number,
        required: true,
        default: 0
    },
    specialRequests: {
        type: String
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    assignedLane: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true
});
const PersonalLesson = mongoose_1.default.model('PersonalLesson', personalLessonSchema);
exports.PersonalLesson = PersonalLesson;
exports.default = PersonalLesson;
//# sourceMappingURL=PersonalLesson.js.map