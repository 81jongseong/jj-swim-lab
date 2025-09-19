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
    owner: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    path: { type: String, required: true },
    status: { type: String, enum: ['pending', 'reviewed'], default: 'pending' },
    analysisResult: mongoose_1.Schema.Types.Mixed,
    feedback: { type: String },
    reviewedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    visibility: { type: String, enum: ['private', 'center', 'public'], default: 'private' },
    reviews: [{
            reviewedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
            feedback: { type: String },
            analysisResult: mongoose_1.Schema.Types.Mixed,
            visibility: { type: String, enum: ['private', 'center', 'public'] },
            reviewedAt: { type: Date, required: true },
        }],
}, { timestamps: true });
videoSchema.index({ owner: 1, createdAt: -1 });
exports.Video = mongoose_1.default.model('Video', videoSchema);
exports.default = exports.Video;
//# sourceMappingURL=Video.js.map