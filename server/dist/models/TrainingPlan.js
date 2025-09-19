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
exports.TrainingPlan = exports.SwimmingStroke = exports.TrainingGoal = exports.TrainingIntensity = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var TrainingIntensity;
(function (TrainingIntensity) {
    TrainingIntensity["BEGINNER"] = "beginner";
    TrainingIntensity["INTERMEDIATE"] = "intermediate";
    TrainingIntensity["ADVANCED"] = "advanced";
    TrainingIntensity["PROFESSIONAL"] = "professional";
})(TrainingIntensity || (exports.TrainingIntensity = TrainingIntensity = {}));
var TrainingGoal;
(function (TrainingGoal) {
    TrainingGoal["FITNESS"] = "fitness";
    TrainingGoal["TECHNIQUE"] = "technique";
    TrainingGoal["SPEED"] = "speed";
    TrainingGoal["ENDURANCE"] = "endurance";
    TrainingGoal["COMPETITION"] = "competition";
    TrainingGoal["REHABILITATION"] = "rehabilitation";
})(TrainingGoal || (exports.TrainingGoal = TrainingGoal = {}));
var SwimmingStroke;
(function (SwimmingStroke) {
    SwimmingStroke["FREESTYLE"] = "freestyle";
    SwimmingStroke["BACKSTROKE"] = "backstroke";
    SwimmingStroke["BREASTSTROKE"] = "breaststroke";
    SwimmingStroke["BUTTERFLY"] = "butterfly";
    SwimmingStroke["MEDLEY"] = "medley";
})(SwimmingStroke || (exports.SwimmingStroke = SwimmingStroke = {}));
const trainingSessionSchema = new mongoose_1.Schema({
    sessionNumber: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    warmUp: {
        exercises: [{ type: String }],
        duration: { type: Number, required: true }
    },
    mainSet: {
        exercises: [{ type: String }],
        sets: { type: Number, required: true },
        reps: { type: Number, required: true },
        restTime: { type: Number, required: true },
        intensity: { type: Number, min: 1, max: 10, required: true }
    },
    coolDown: {
        exercises: [{ type: String }],
        duration: { type: Number, required: true }
    },
    focusAreas: [{ type: String }],
    equipment: [{ type: String }],
    calories: { type: Number, required: true },
    difficulty: { type: Number, min: 1, max: 10, required: true }
});
const weeklyPlanSchema = new mongoose_1.Schema({
    week: { type: Number, required: true },
    goal: { type: String, required: true },
    sessions: [trainingSessionSchema],
    restDays: [{ type: Number }],
    progressMetrics: {
        expectedImprovement: { type: String, required: true },
        keyFocus: [{ type: String }],
        milestones: [{ type: String }]
    }
});
const trainingPlanSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    userProfile: {
        currentLevel: {
            type: String,
            enum: Object.values(TrainingIntensity),
            required: true
        },
        experience: { type: Number, required: true, min: 0 },
        age: { type: Number, required: true, min: 5, max: 100 },
        weight: { type: Number, required: true, min: 20, max: 300 },
        height: { type: Number, required: true, min: 100, max: 250 },
        medicalConditions: [{ type: String }],
        availableTime: { type: Number, required: true, min: 1, max: 40 },
        preferredDays: [{ type: Number, min: 0, max: 6 }],
        preferredTimes: [{
                type: String,
                enum: ['morning', 'afternoon', 'evening']
            }]
    },
    goals: {
        primary: {
            type: String,
            enum: Object.values(TrainingGoal),
            required: true
        },
        secondary: [{
                type: String,
                enum: Object.values(TrainingGoal)
            }],
        targetDate: { type: Date, required: true },
        specificTargets: {
            distance: { type: Number, min: 25 },
            time: { type: Number, min: 10 },
            stroke: {
                type: String,
                enum: Object.values(SwimmingStroke)
            },
            competition: { type: String }
        }
    },
    currentAssessment: {
        technique: {
            freestyle: { type: Number, min: 1, max: 10, required: true },
            backstroke: { type: Number, min: 1, max: 10, required: true },
            breaststroke: { type: Number, min: 1, max: 10, required: true },
            butterfly: { type: Number, min: 1, max: 10, required: true }
        },
        endurance: { type: Number, min: 1, max: 10, required: true },
        speed: { type: Number, min: 1, max: 10, required: true },
        flexibility: { type: Number, min: 1, max: 10, required: true },
        strength: { type: Number, min: 1, max: 10, required: true },
        overallScore: { type: Number, min: 1, max: 100, required: true }
    },
    planDetails: {
        duration: { type: Number, required: true, min: 1, max: 52 },
        sessionsPerWeek: { type: Number, required: true, min: 1, max: 7 },
        totalSessions: { type: Number, required: true },
        weeklyPlans: [weeklyPlanSchema],
        progressionStrategy: { type: String, required: true },
        adaptationRules: [{ type: String }]
    },
    progress: {
        currentWeek: { type: Number, default: 1 },
        currentSession: { type: Number, default: 1 },
        completedSessions: { type: Number, default: 0 },
        totalSessions: { type: Number, required: true },
        adherenceRate: { type: Number, default: 0, min: 0, max: 100 },
        performanceMetrics: [{
                date: { type: Date, required: true },
                sessionId: { type: Number, required: true },
                completion: { type: Number, required: true, min: 0, max: 100 },
                perceivedExertion: { type: Number, required: true, min: 1, max: 10 },
                actualDuration: { type: Number, required: true },
                notes: { type: String, default: '' }
            }]
    },
    aiAnalysis: {
        lastAnalysisDate: { type: Date, default: Date.now },
        performanceTrend: {
            type: String,
            enum: ['improving', 'stable', 'declining'],
            default: 'stable'
        },
        recommendedAdjustments: [{ type: String }],
        riskFactors: [{ type: String }],
        strengthAreas: [{ type: String }],
        improvementAreas: [{ type: String }],
        nextReviewDate: { type: Date, required: true }
    },
    createdBy: {
        type: String,
        enum: ['ai', 'instructor'],
        default: 'ai'
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    version: { type: Number, default: 1 }
});
trainingPlanSchema.index({ userId: 1, isActive: 1 });
trainingPlanSchema.index({ 'goals.primary': 1 });
trainingPlanSchema.index({ 'userProfile.currentLevel': 1 });
trainingPlanSchema.index({ createdAt: -1 });
trainingPlanSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});
trainingPlanSchema.statics.generateAIPlan = async function (userId, userInput) {
    return null;
};
trainingPlanSchema.methods.calculateProgress = function () {
    if (this.progress.totalSessions === 0)
        return 0;
    return Math.round((this.progress.completedSessions / this.progress.totalSessions) * 100);
};
trainingPlanSchema.methods.getNextSession = function () {
    const currentWeekPlan = this.planDetails.weeklyPlans.find((week) => week.week === this.progress.currentWeek);
    if (!currentWeekPlan)
        return null;
    const nextSession = currentWeekPlan.sessions.find((session) => session.sessionNumber === this.progress.currentSession);
    return nextSession || null;
};
trainingPlanSchema.methods.needsAdjustment = function () {
    const daysSinceLastAnalysis = Math.floor((Date.now() - this.aiAnalysis.lastAnalysisDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceLastAnalysis >= 7 ||
        this.progress.adherenceRate < 70 ||
        this.aiAnalysis.performanceTrend === 'declining';
};
exports.TrainingPlan = mongoose_1.default.model('TrainingPlan', trainingPlanSchema);
exports.default = exports.TrainingPlan;
//# sourceMappingURL=TrainingPlan.js.map