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
exports.SwimmingStyle = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const swimmingStyleSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    displayName: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isPublicDemo: {
        type: Boolean,
        default: false
    },
    modelUrl: {
        type: String,
        trim: true
    },
    poster: {
        type: String,
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
    cautions: [{
            type: String,
            trim: true
        }]
}, {
    timestamps: true
});
exports.SwimmingStyle = mongoose_1.default.models.SwimmingStyle || mongoose_1.default.model('SwimmingStyle', swimmingStyleSchema);
//# sourceMappingURL=SwimmingStyle.js.map