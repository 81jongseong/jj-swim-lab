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
exports.JobApplication = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const jobApplicationSchema = new mongoose_1.Schema({
    postId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'CommunityPost',
        required: true,
        index: true
    },
    applicantId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    centerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'SwimmingCenter',
        index: true
    },
    status: {
        type: String,
        enum: ['applied', 'document_passed', 'document_failed', 'interview_scheduled', 'interview_passed', 'interview_failed', 'final_passed', 'final_failed', 'withdrawn'],
        default: 'applied',
        required: true,
        index: true
    },
    coverLetter: {
        type: String,
        maxlength: 2000
    },
    resume: {
        type: String
    },
    interviewDate: {
        type: Date
    },
    interviewTime: {
        type: String
    },
    interviewLocation: {
        type: String
    },
    interviewNotes: {
        type: String,
        maxlength: 1000
    },
    documentScore: {
        type: Number,
        min: 0,
        max: 100
    },
    interviewScore: {
        type: Number,
        min: 0,
        max: 100
    },
    totalScore: {
        type: Number,
        min: 0,
        max: 200
    },
    evaluationNotes: {
        type: String,
        maxlength: 1000
    },
    notificationSent: {
        type: Boolean,
        default: false
    },
    notificationSentAt: {
        type: Date
    }
}, {
    timestamps: true,
    collection: 'job_applications'
});
jobApplicationSchema.index({ postId: 1, applicantId: 1 }, { unique: true });
jobApplicationSchema.index({ centerId: 1, status: 1, createdAt: -1 });
exports.JobApplication = mongoose_1.default.models.JobApplication || mongoose_1.default.model('JobApplication', jobApplicationSchema);
//# sourceMappingURL=JobApplication.js.map