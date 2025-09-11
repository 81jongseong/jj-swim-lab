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
exports.ClassChecklist = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ClassChecklistItemSchema = new mongoose_1.Schema({
    stepName: {
        type: String,
        required: true,
        trim: true
    },
    stepOrder: {
        type: Number,
        required: true,
        default: 0
    },
    category: {
        type: String,
        trim: true
    },
    difficulty: {
        type: String,
        trim: true
    },
    tips: {
        type: String,
        trim: true
    },
    teachingMethodId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'TeachingMethod',
        required: true
    },
    instructorMessage: {
        type: String,
        trim: true
    },
    messageUpdatedAt: {
        type: Date
    },
    isCompleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});
const ClassChecklistSchema = new mongoose_1.Schema({
    classId: {
        type: mongoose_1.Schema.Types.Mixed,
        required: true
    },
    level: {
        type: String,
        trim: true
    },
    templateId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'ChecklistTemplate'
    },
    customLevel: {
        type: String,
        trim: true
    },
    items: {
        type: [ClassChecklistItemSchema],
        default: []
    },
    hiddenItems: [{
            type: String
        }],
    customItems: {
        type: [ClassChecklistItemSchema],
        default: []
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});
ClassChecklistSchema.index({ classId: 1 }, { unique: true });
exports.ClassChecklist = mongoose_1.default.model('ClassChecklist', ClassChecklistSchema);
//# sourceMappingURL=ClassChecklist.js.map