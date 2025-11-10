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
const SwimProgramSchema = new mongoose_1.Schema({
    athleteId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: false,
        index: true
    },
    athleteName: {
        type: String,
        required: false
    },
    groupClassId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'GroupClass',
        required: false,
        index: true
    },
    groupClassName: {
        type: String,
        required: false
    },
    centerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'SwimmingCenter',
        index: true
    },
    programType: {
        type: String,
        enum: ['weekly', 'race'],
        required: true,
        default: 'weekly'
    },
    programScope: {
        type: String,
        enum: ['individual', 'group'],
        required: true,
        default: 'individual',
        index: true
    },
    params: {
        startDate: { type: String, required: true },
        daysPerWeek: { type: Number, required: true },
        selectedDays: [{ type: String }],
        sessionDuration: { type: Number, required: true },
        pool: { type: Number, required: true },
        mainStrokes: [{ type: String }],
        excludedStrokes: [{ type: String }],
        cssPer100: { type: mongoose_1.Schema.Types.Mixed },
        conditionIds: [{ type: String }],
        goal: { type: String, required: true }
    },
    content: {
        summary: { type: String, required: true },
        planExplanation: { type: String },
        totalDuration: { type: Number, required: true },
        totalMeters: { type: Number, required: true },
        phases: [{
                phase: { type: String, enum: ['base', 'build', 'peak', 'taper'] },
                weekStart: { type: Number },
                weekEnd: { type: Number },
                focus: { type: String },
                volumeTarget: { type: Number },
                intensityDistribution: {
                    z1: { type: Number },
                    z2: { type: Number },
                    z3: { type: Number },
                    z4: { type: Number },
                    z5: { type: Number }
                },
                weeklyPlans: [{ type: mongoose_1.Schema.Types.Mixed }]
            }],
        feasibility: { type: mongoose_1.Schema.Types.Mixed },
        phaseSummary: { type: mongoose_1.Schema.Types.Mixed },
        recommendations: [{ type: String }],
        sessions: [{
                day: { type: String, required: true },
                date: { type: String },
                themeDesc: { type: String },
                duration: { type: Number },
                distance: { type: Number },
                intensity: { type: String },
                status: {
                    type: String,
                    enum: ['scheduled', 'postponed', 'skipped'],
                    default: 'scheduled'
                },
                dayCondition: {
                    condition: {
                        type: String,
                        enum: ['very_good', 'good', 'normal', 'tired', 'very_tired']
                    },
                    hasPain: { type: Boolean },
                    painLocation: { type: String },
                    sleepQuality: { type: Number, min: 1, max: 10 },
                    stressLevel: { type: Number, min: 1, max: 10 },
                    inputBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
                    inputByRole: { type: String, enum: ['self', 'instructor'] },
                    inputAt: { type: Date }
                },
                blocks: [{
                        type: { type: String },
                        description: { type: String },
                        duration: { type: Number },
                        distance: { type: Number },
                        whyPace: { type: String },
                        whyRest: { type: String },
                        whySet: { type: String },
                        evidenceKeys: [{ type: String }]
                    }],
                completion: {
                    completionRate: { type: Number, min: 0, max: 100 },
                    feeling: {
                        type: String,
                        enum: ['easy', 'moderate', 'hard', 'very_hard']
                    },
                    inputBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
                    inputByRole: {
                        type: String,
                        enum: ['self', 'instructor']
                    },
                    inputAt: { type: Date },
                    notes: { type: String },
                    detailedSets: [{
                            setIndex: { type: Number },
                            planned: {
                                distance: { type: Number },
                                reps: { type: Number }
                            },
                            actual: {
                                distance: { type: Number },
                                reps: { type: Number },
                                time: { type: Number },
                                completed: { type: Boolean }
                            }
                        }]
                }
            }]
    },
    usedMethodIds: [{ type: String }],
    executionHistory: [{
            date: { type: String, required: true },
            dayOfWeek: { type: String, required: true },
            condition: {
                type: String,
                enum: ['very_good', 'good', 'normal', 'tired', 'very_tired'],
                required: true
            },
            hasPain: { type: Boolean, default: false },
            rpe: { type: Number, min: 1, max: 10 },
            adjustedPace: { type: String },
            adjustedRest: { type: String },
            notes: { type: String },
            completed: { type: Boolean, default: false }
        }]
}, {
    timestamps: true
});
SwimProgramSchema.index({ athleteId: 1, createdAt: -1 });
SwimProgramSchema.index({ centerId: 1, createdAt: -1 });
SwimProgramSchema.index({ 'params.startDate': 1 });
const SwimProgram = mongoose_1.default.model('SwimProgram', SwimProgramSchema);
exports.default = SwimProgram;
//# sourceMappingURL=SwimProgram.js.map