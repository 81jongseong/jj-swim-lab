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
exports.VideoProcessingJob = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const VideoProcessingJobSchema = new mongoose_1.Schema({
    videoId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    originalVideoPath: {
        type: String,
        required: true
    },
    outputDir: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending',
        required: true
    },
    progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    error: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date
    },
    motionDataPath: {
        type: String
    },
    glbPath: {
        type: String
    },
    fbxPath: {
        type: String
    },
    previewImagePath: {
        type: String
    },
    originalFileName: {
        type: String
    },
    videoDuration: {
        type: Number
    },
    frameCount: {
        type: Number
    },
    resolution: {
        width: Number,
        height: Number
    }
});
VideoProcessingJobSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});
VideoProcessingJobSchema.index({ status: 1 });
VideoProcessingJobSchema.index({ createdAt: -1 });
VideoProcessingJobSchema.index({ videoId: 1 });
exports.VideoProcessingJob = mongoose_1.default.model('VideoProcessingJob', VideoProcessingJobSchema);
//# sourceMappingURL=VideoProcessingJob.js.map