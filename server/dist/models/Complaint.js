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
exports.Complaint = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ComplaintSchema = new mongoose_1.Schema({
    centerId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'SwimmingCenter',
        required: true,
        index: true
    },
    isAnonymous: { type: Boolean, default: false },
    reporterId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
    reporterName: { type: String, required: true },
    reporterEmail: { type: String },
    reporterPhone: { type: String },
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: {
        type: String,
        enum: ['facility', 'instructor', 'service', 'schedule', 'payment', 'safety', 'other'],
        required: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['pending', 'reviewing', 'assigned', 'in_progress', 'resolved', 'closed'],
        default: 'pending',
        index: true
    },
    assignedTo: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
    assignedToName: { type: String },
    assignedAt: { type: Date },
    progressNotes: [{
            content: { type: String, required: true },
            createdBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
            createdByName: { type: String, required: true },
            createdAt: { type: Date, default: Date.now },
            status: {
                type: String,
                enum: ['pending', 'reviewing', 'assigned', 'in_progress', 'resolved', 'closed'],
                required: true
            }
        }],
    checklist: [{
            task: { type: String, required: true },
            isCompleted: { type: Boolean, default: false },
            completedBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
            completedByName: { type: String },
            completedAt: { type: Date }
        }],
    resolution: { type: String },
    resolvedAt: { type: Date },
    resolvedBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
    resolvedByName: { type: String },
    satisfactionRating: {
        type: Number,
        min: 1,
        max: 5
    },
    satisfactionComment: { type: String },
    attachments: [{
            fileName: { type: String, required: true },
            fileUrl: { type: String, required: true },
            fileType: { type: String, required: true },
            uploadedAt: { type: Date, default: Date.now }
        }],
    closedAt: { type: Date }
}, {
    timestamps: true
});
ComplaintSchema.index({ centerId: 1, status: 1, createdAt: -1 });
ComplaintSchema.index({ assignedTo: 1, status: 1 });
ComplaintSchema.index({ reporterId: 1 });
exports.Complaint = mongoose_1.default.model('Complaint', ComplaintSchema);
//# sourceMappingURL=Complaint.js.map