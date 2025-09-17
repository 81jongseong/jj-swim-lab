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
exports.LessonPlan = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const lessonPlanSchema = new mongoose_1.Schema({
    instructorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    centerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Center',
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
    teachingMethods: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'TeachingMethod'
        }],
    students: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        }],
    duration: {
        type: Number,
        required: true,
        min: 30,
        max: 180
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    objectives: [{
            type: String,
            trim: true
        }],
    materials: [{
            type: String,
            trim: true
        }],
    notes: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['draft', 'scheduled', 'in_progress', 'completed', 'cancelled'],
        default: 'draft'
    },
    actualDuration: {
        type: Number,
        min: 0
    },
    attendance: [{
            studentId: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            attended: {
                type: Boolean,
                default: false
            },
            notes: {
                type: String,
                default: ''
            }
        }],
    feedback: [{
            studentId: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            rating: {
                type: Number,
                min: 1,
                max: 5,
                required: true
            },
            comment: {
                type: String,
                default: ''
            }
        }]
}, {
    timestamps: true
});
lessonPlanSchema.index({ instructorId: 1, date: 1 });
lessonPlanSchema.index({ centerId: 1, date: 1 });
lessonPlanSchema.index({ status: 1, date: 1 });
exports.LessonPlan = mongoose_1.default.model('LessonPlan', lessonPlanSchema);
//# sourceMappingURL=LessonPlan.js.map