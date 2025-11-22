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
exports.Video = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const videoSchema = new mongoose_1.Schema({
    owner: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    ownerCenterId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Center' },
    youtubeUrl: { type: String, required: true },
    title: { type: String },
    description: { type: String },
    visibility: {
        myCenterInstructors: { type: Boolean, default: false },
        allInstructors: { type: Boolean, default: false },
        myCenterMembers: { type: Boolean, default: false },
        allMembers: { type: Boolean, default: false }
    },
    analysisRequest: {
        type: { type: String, enum: ['public', 'center', 'specific'], default: 'public' },
        requestedInstructors: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
        analysisFee: { type: Number, default: 0 },
        paymentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Payment' },
        paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' }
    },
    feedbacks: [{
            reviewer: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
            reviewerType: { type: String, enum: ['instructor', 'member'], required: true },
            reviewerCenterId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Center' },
            content: { type: String, required: true },
            rating: { type: Number, min: 1, max: 5 },
            createdAt: { type: Date, default: Date.now }
        }],
    status: { type: String, enum: ['pending', 'reviewed'], default: 'pending' },
    analysisResult: mongoose_1.Schema.Types.Mixed,
    feedback: { type: String },
    reviewedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    reviews: [{
            reviewedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
            feedback: { type: String },
            analysisResult: mongoose_1.Schema.Types.Mixed,
            visibility: { type: String, enum: ['private', 'center', 'public'] },
            reviewedAt: { type: Date, required: true },
        }],
}, { timestamps: true });
videoSchema.index({ owner: 1, createdAt: -1 });
videoSchema.index({ ownerCenterId: 1, createdAt: -1 });
videoSchema.index({ 'visibility.allMembers': 1, createdAt: -1 });
exports.Video = mongoose_1.default.model('Video', videoSchema);
exports.default = exports.Video;
//# sourceMappingURL=Video.js.map