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
exports.TeachingMethod = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const TeachingMethodSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    level: {
        type: String,
        required: true,
        trim: true,
        default: '초급'
    },
    steps: [{
            type: String,
            trim: true
        }],
    tips: [{
            type: String,
            trim: true
        }],
    checklist: [{
            type: String,
            trim: true
        }],
    videoUrl: {
        type: String,
        trim: true
    },
    imageUrl: {
        type: String,
        trim: true
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    },
    instructorComments: {
        type: String,
        trim: true
    },
    levelChangeHistory: [{
            fromLevel: {
                type: String,
                required: true
            },
            toLevel: {
                type: String,
                required: true
            },
            changedBy: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            changedAt: {
                type: Date,
                default: Date.now
            },
            reason: {
                type: String,
                trim: true
            }
        }]
}, {
    timestamps: true
});
exports.TeachingMethod = mongoose_1.default.model('TeachingMethod', TeachingMethodSchema);
//# sourceMappingURL=TeachingMethod.js.map