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
exports.QuizAttempt = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const QuizAttemptSchema = new mongoose_1.Schema({
    quizId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    answers: [{
            questionIndex: {
                type: Number,
                required: true
            },
            selectedAnswer: {
                type: mongoose_1.Schema.Types.Mixed,
                required: true
            },
            isCorrect: {
                type: Boolean,
                required: true
            },
            pointsEarned: {
                type: Number,
                required: true
            },
            timeSpent: {
                type: Number,
                default: 0
            }
        }],
    totalScore: {
        type: Number,
        required: true
    },
    maxPossibleScore: {
        type: Number,
        required: true
    },
    percentage: {
        type: Number,
        required: true
    },
    passed: {
        type: Boolean,
        required: true
    },
    timeSpent: {
        type: Number,
        required: true
    },
    completedAt: {
        type: Date,
        required: true
    },
    startedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});
QuizAttemptSchema.index({ quizId: 1, userId: 1 });
QuizAttemptSchema.index({ userId: 1, completedAt: -1 });
QuizAttemptSchema.index({ quizId: 1, completedAt: -1 });
exports.QuizAttempt = mongoose_1.default.model('QuizAttempt', QuizAttemptSchema);
//# sourceMappingURL=QuizAttempt.js.map