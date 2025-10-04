"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkillTemplate = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const skillTemplateSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        enum: ['freestyle', 'backstroke', 'breaststroke', 'butterfly', 'diving', 'turning', 'breathing', 'endurance', 'technique'],
        required: true,
    },
    level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    practiceDrills: [{
            name: {
                type: String,
                required: true,
            },
            description: {
                type: String,
                required: true,
            },
            youtubeUrl: {
                type: String,
            },
            duration: {
                type: Number,
                default: 10,
            },
            difficulty: {
                type: String,
                enum: ['easy', 'medium', 'hard'],
                default: 'medium',
            },
        }],
    commonIssues: [{
            issue: {
                type: String,
                required: true,
            },
            solution: {
                type: String,
                required: true,
            },
            practiceDrill: {
                type: String,
            },
        }],
    prerequisites: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'SkillTemplate',
        }],
    isActive: {
        type: Boolean,
        default: true,
    },
    createdBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true
});
skillTemplateSchema.index({ category: 1, level: 1, isActive: 1 });
exports.SkillTemplate = mongoose_1.default.models.SkillTemplate || mongoose_1.default.model('SkillTemplate', skillTemplateSchema);
//# sourceMappingURL=SkillTemplate.js.map