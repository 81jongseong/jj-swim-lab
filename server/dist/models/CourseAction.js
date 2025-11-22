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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseAction = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const CourseActionSchema = new mongoose_1.Schema({
    courseId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    centerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Center',
        required: true
    },
    actionType: {
        type: String,
        enum: ['activate', 'deactivate', 'suspend', 'warning'],
        required: true
    },
    actionBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reason: {
        category: {
            type: String,
            enum: ['safety', 'quality', 'policy', 'financial', 'certification', 'facility', 'other'],
            required: true
        },
        description: {
            type: String,
            required: true,
            minlength: 50,
            maxlength: 1000
        },
        evidence: [{
                type: String
            }]
    },
    warningLevel: {
        type: Number,
        enum: [1, 2, 3]
    },
    improvementPeriod: {
        startDate: Date,
        endDate: Date,
        requirements: [{
                type: String,
                required: true
            }]
    },
    automaticTrigger: {
        condition: {
            type: String,
            enum: ['satisfaction_low', 'safety_incident', 'document_missing', 'payment_overdue', 'certification_expired']
        },
        value: mongoose_1.Schema.Types.Mixed,
        threshold: mongoose_1.Schema.Types.Mixed
    },
    appeal: {
        submitted: {
            type: Boolean,
            default: false
        },
        submittedAt: Date,
        submittedBy: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        },
        reason: {
            type: String,
            maxlength: 1000
        },
        evidence: [{
                type: String
            }],
        status: {
            type: String,
            enum: ['pending', 'under_review', 'approved', 'rejected'],
            default: 'pending'
        },
        reviewedAt: Date,
        reviewedBy: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        },
        reviewResult: {
            type: String,
            maxlength: 1000
        }
    },
    reactivationConditions: {
        requirements: [{
                type: String,
                required: true
            }],
        deadline: Date,
        completed: {
            type: Boolean,
            default: false
        },
        completedAt: Date
    },
    isActive: {
        type: Boolean,
        default: true
    },
    effectiveDate: {
        type: Date,
        default: Date.now
    },
    expiryDate: Date
}, {
    timestamps: true,
    collection: 'course_actions'
});
CourseActionSchema.index({ courseId: 1, actionType: 1, createdAt: -1 });
CourseActionSchema.index({ centerId: 1, actionType: 1 });
CourseActionSchema.index({ actionBy: 1, createdAt: -1 });
CourseActionSchema.index({ 'appeal.status': 1, 'appeal.submittedAt': -1 });
exports.CourseAction = mongoose_1.default.model('CourseAction', CourseActionSchema);
//# sourceMappingURL=CourseAction.js.map