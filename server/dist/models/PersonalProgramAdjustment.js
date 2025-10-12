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
const mongoose_1 = __importStar(require("mongoose"));
const PersonalProgramAdjustmentSchema = new mongoose_1.Schema({
    programId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'SwimProgram',
        required: true,
        index: true
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    groupClassId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'GroupClass',
        required: true,
        index: true
    },
    adjustments: {
        globalPaceAdjustment: { type: Number, default: 0 },
        globalPaceReason: { type: String, default: '' },
        avoidStrokes: [{ type: String }],
        avoidDrills: [{ type: String }],
        avoidEquipment: [{ type: String }],
        warnings: [{
                type: { type: String, enum: ['health', 'condition', 'technique'], required: true },
                severity: { type: String, enum: ['info', 'warning', 'critical'], required: true },
                message: { type: String, required: true },
                relatedCondition: { type: String }
            }],
        sessionAdjustments: [{
                sessionDate: { type: String, required: true },
                dayOfWeek: { type: String, required: true },
                paceAdjustment: { type: Number, default: 0 },
                restAdjustment: { type: Number, default: 0 },
                skipBlocks: [{ type: Number }],
                modifiedBlocks: [{
                        blockIndex: { type: Number, required: true },
                        originalDescription: { type: String, required: true },
                        modifiedDescription: { type: String, required: true },
                        reason: { type: String, required: true }
                    }],
                notes: { type: String }
            }]
    },
    generatedBy: {
        conditionIds: [{ type: String }],
        healthConditions: [{ type: String }],
        currentCondition: { type: String },
        generatedAt: { type: Date, default: Date.now }
    },
    viewedByMember: { type: Boolean, default: false },
    viewedAt: { type: Date }
}, {
    timestamps: true
});
PersonalProgramAdjustmentSchema.index({ programId: 1, userId: 1 });
PersonalProgramAdjustmentSchema.index({ groupClassId: 1, userId: 1 });
exports.default = mongoose_1.default.model('PersonalProgramAdjustment', PersonalProgramAdjustmentSchema);
//# sourceMappingURL=PersonalProgramAdjustment.js.map