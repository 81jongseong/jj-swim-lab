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
exports.HealthConfig = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const healthFieldSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    type: {
        type: String,
        enum: ['number', 'string', 'select', 'boolean', 'date'],
        required: true
    },
    unit: { type: String },
    required: { type: Boolean, default: false },
    category: {
        type: String,
        enum: ['basic', 'vital', 'medical', 'fitness', 'custom'],
        default: 'basic'
    },
    description: { type: String },
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 }
});
const normalRangeSchema = new mongoose_1.Schema({
    fieldId: { type: String, required: true },
    ageGroups: [{
            minAge: { type: Number, required: true },
            maxAge: { type: Number, required: true },
            gender: {
                type: String,
                enum: ['male', 'female', 'all'],
                default: 'all'
            },
            normalRange: {
                min: { type: Number },
                max: { type: Number },
                recommended: [{ type: String }]
            },
            riskLevels: [{
                    level: {
                        type: String,
                        enum: ['low', 'normal', 'high', 'critical'],
                        required: true
                    },
                    range: {
                        min: { type: Number },
                        max: { type: Number }
                    },
                    description: { type: String, required: true },
                    recommendations: [{ type: String }]
                }]
        }]
});
const exerciseRuleSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    conditions: [{
            fieldId: { type: String, required: true },
            operator: {
                type: String,
                enum: ['eq', 'gt', 'lt', 'gte', 'lte', 'in', 'between'],
                required: true
            },
            value: { type: mongoose_1.Schema.Types.Mixed, required: true }
        }],
    recommendations: [{
            type: {
                type: String,
                enum: ['swimming', 'fitness', 'cardio', 'strength', 'flexibility'],
                required: true
            },
            exercise: { type: String, required: true },
            duration: { type: Number, required: true },
            frequency: { type: Number, required: true },
            intensity: {
                type: String,
                enum: ['low', 'moderate', 'high'],
                required: true
            },
            description: { type: String, required: true },
            precautions: [{ type: String }]
        }],
    priority: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
});
const aiConfigSchema = new mongoose_1.Schema({
    modelVersion: { type: String, required: true, default: '1.0.0' },
    parameters: {
        learningRate: { type: Number, default: 0.001 },
        confidence: { type: Number, default: 0.8 },
        accuracy: { type: Number, default: 0.85 },
        maxRecommendations: { type: Number, default: 5 },
        updateFrequency: { type: Number, default: 7 }
    },
    features: {
        personalizedRecommendations: { type: Boolean, default: true },
        riskAssessment: { type: Boolean, default: true },
        progressTracking: { type: Boolean, default: true },
        goalSetting: { type: Boolean, default: true },
        socialComparison: { type: Boolean, default: false }
    },
    thresholds: {
        riskAlert: { type: Number, default: 0.7 },
        progressAlert: { type: Number, default: 0.8 },
        goalAchievement: { type: Number, default: 0.9 }
    },
    lastUpdated: { type: Date, default: Date.now },
    lastTrainedAt: { type: Date, default: Date.now }
});
const healthConfigSchema = new mongoose_1.Schema({
    version: { type: String, required: true, default: '1.0.0' },
    healthFields: [healthFieldSchema],
    normalRanges: [normalRangeSchema],
    exerciseRules: [exerciseRuleSchema],
    aiConfig: { type: aiConfigSchema, default: () => ({}) },
    privacySettings: {
        defaultVisibility: {
            type: String,
            enum: ['public', 'center', 'instructor', 'private'],
            default: 'center'
        },
        allowUserControl: { type: Boolean, default: true },
        dataRetentionDays: { type: Number, default: 365 },
        anonymizeAfterDays: { type: Number, default: 1825 }
    },
    permissions: {
        superAdmin: [{ type: String }],
        centerAdmin: [{ type: String }],
        instructor: [{ type: String }],
        student: [{ type: String }]
    },
    isActive: { type: Boolean, default: true },
    createdBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});
healthConfigSchema.index({ version: 1, isActive: 1 });
healthConfigSchema.index({ 'healthFields.id': 1 });
healthConfigSchema.index({ 'normalRanges.fieldId': 1 });
exports.HealthConfig = mongoose_1.default.model('HealthConfig', healthConfigSchema);
//# sourceMappingURL=HealthConfig.js.map