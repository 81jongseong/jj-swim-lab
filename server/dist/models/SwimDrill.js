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
exports.SwimDrill = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const SwimDrillSchema = new mongoose_1.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    tags: [{
            type: String,
            trim: true
        }],
    cues: [{
            type: String,
            trim: true
        }],
    examples: [{
            type: String,
            trim: true
        }],
    videoUrl: {
        type: String,
        trim: true
    },
    recommendedFor: [{
            type: String,
            trim: true
        }],
    avoidFor: [{
            type: String,
            trim: true
        }],
    targetStroke: [{
            type: String,
            enum: ['freestyle', 'backstroke', 'breaststroke', 'butterfly', 'all'],
            trim: true
        }],
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    },
    centerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Center',
        required: false
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    }
}, {
    timestamps: true
});
SwimDrillSchema.index({ id: 1 });
SwimDrillSchema.index({ category: 1 });
SwimDrillSchema.index({ tags: 1 });
SwimDrillSchema.index({ isActive: 1 });
SwimDrillSchema.index({ centerId: 1 });
exports.SwimDrill = mongoose_1.default.models.SwimDrill || mongoose_1.default.model('SwimDrill', SwimDrillSchema);
//# sourceMappingURL=SwimDrill.js.map