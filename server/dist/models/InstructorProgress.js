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
exports.InstructorProgress = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const SessionSchema = new mongoose_1.Schema({
    sessionId: { type: String, required: true },
    sessionDate: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    activity: { type: String, required: true },
    location: { type: String },
    sessionType: { type: String, enum: ['group', 'personal'], required: true },
    courseName: { type: String },
    status: { type: String, enum: ['present', 'late', 'absent'], required: true }
}, { _id: false });
const CoachNoteSchema = new mongoose_1.Schema({
    noteId: { type: String, required: true },
    sessionId: { type: String },
    content: { type: String, required: true },
    authorName: { type: String },
    createdAt: { type: Date, required: true }
}, { _id: false });
const HomeworkSchema = new mongoose_1.Schema({
    taskId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    dueDate: { type: Date, required: true },
    createdAt: { type: Date, required: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null }
}, { _id: false });
const LevelChecklistSchema = new mongoose_1.Schema({
    itemId: { type: String, required: true },
    label: { type: String, required: true },
    description: { type: String },
    category: {
        type: String,
        enum: ['stroke', 'technique', 'endurance', 'safety'],
        default: 'technique'
    },
    level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
    },
    checked: { type: Boolean, default: false },
    checkedAt: { type: Date, default: null },
    sourceMethodId: { type: String },
    sourceMethodName: { type: String }
}, { _id: false });
const InstructorProgressSchema = new mongoose_1.Schema({
    instructorId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    studentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    courseName: { type: String },
    sessions: { type: [SessionSchema], default: [] },
    notes: { type: [CoachNoteSchema], default: [] },
    homework: { type: [HomeworkSchema], default: [] },
    levelChecklist: { type: [LevelChecklistSchema], default: [] }
}, {
    timestamps: true,
    collection: 'instructorProgress'
});
InstructorProgressSchema.index({ instructorId: 1, studentId: 1 }, { unique: true });
exports.InstructorProgress = mongoose_1.default.model('InstructorProgress', InstructorProgressSchema);
//# sourceMappingURL=InstructorProgress.js.map