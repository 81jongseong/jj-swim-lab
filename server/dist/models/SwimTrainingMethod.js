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
exports.SwimTrainingMethod = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const SwimTrainingMethodSchema = new mongoose_1.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    title: {
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
    recommendedDrills: [{
            type: String,
            trim: true
        }],
    avoidForConditions: [{
            type: String,
            trim: true
        }],
    recommendForConditions: [{
            type: String,
            trim: true
        }],
    evidence: [{
            label: {
                type: String,
                trim: true
            },
            url: {
                type: String,
                trim: true
            }
        }],
    targetLevel: [{
            type: String,
            enum: ['beginner', 'intermediate', 'advanced'],
            trim: true
        }],
    intensity: {
        type: String,
        enum: ['low', 'medium', 'high'],
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
SwimTrainingMethodSchema.index({ id: 1 });
SwimTrainingMethodSchema.index({ category: 1 });
SwimTrainingMethodSchema.index({ isActive: 1 });
SwimTrainingMethodSchema.index({ centerId: 1 });
exports.SwimTrainingMethod = mongoose_1.default.models.SwimTrainingMethod || mongoose_1.default.model('SwimTrainingMethod', SwimTrainingMethodSchema);
//# sourceMappingURL=SwimTrainingMethod.js.map