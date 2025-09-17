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
exports.InjuryPrediction = exports.RiskFactorCategory = exports.InjuryType = exports.InjuryRiskLevel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var InjuryRiskLevel;
(function (InjuryRiskLevel) {
    InjuryRiskLevel["VERY_LOW"] = "very_low";
    InjuryRiskLevel["LOW"] = "low";
    InjuryRiskLevel["MODERATE"] = "moderate";
    InjuryRiskLevel["HIGH"] = "high";
    InjuryRiskLevel["VERY_HIGH"] = "very_high";
})(InjuryRiskLevel || (exports.InjuryRiskLevel = InjuryRiskLevel = {}));
var InjuryType;
(function (InjuryType) {
    InjuryType["SHOULDER"] = "shoulder";
    InjuryType["NECK"] = "neck";
    InjuryType["BACK"] = "back";
    InjuryType["KNEE"] = "knee";
    InjuryType["ANKLE"] = "ankle";
    InjuryType["WRIST"] = "wrist";
    InjuryType["MUSCLE_STRAIN"] = "muscle_strain";
    InjuryType["JOINT_PAIN"] = "joint_pain";
    InjuryType["OVERUSE"] = "overuse";
    InjuryType["FATIGUE"] = "fatigue";
})(InjuryType || (exports.InjuryType = InjuryType = {}));
var RiskFactorCategory;
(function (RiskFactorCategory) {
    RiskFactorCategory["TRAINING_LOAD"] = "training_load";
    RiskFactorCategory["TECHNIQUE"] = "technique";
    RiskFactorCategory["PHYSICAL"] = "physical";
    RiskFactorCategory["ENVIRONMENTAL"] = "environmental";
    RiskFactorCategory["PSYCHOLOGICAL"] = "psychological";
    RiskFactorCategory["RECOVERY"] = "recovery";
    RiskFactorCategory["BIOMECHANICAL"] = "biomechanical";
})(RiskFactorCategory || (exports.RiskFactorCategory = RiskFactorCategory = {}));
const trainingLoadSchema = new mongoose_1.Schema({
    date: { type: Date, required: true },
    duration: { type: Number, required: true, min: 1 },
    intensity: { type: Number, required: true, min: 1, max: 10 },
    volume: { type: Number, required: true, min: 0 },
    perceivedExertion: { type: Number, required: true, min: 1, max: 10 },
    heartRateAvg: { type: Number, min: 40, max: 220 },
    heartRateMax: { type: Number, min: 40, max: 220 },
    strokeCount: { type: Number, min: 0 },
    restTime: { type: Number, min: 0 }
});
const biomechanicalDataSchema = new mongoose_1.Schema({
    date: { type: Date, required: true },
    strokeEfficiency: { type: Number, required: true, min: 1, max: 10 },
    bodyPosition: { type: Number, required: true, min: 1, max: 10 },
    breathingPattern: { type: Number, required: true, min: 1, max: 10 },
    strokeRate: { type: Number, required: true, min: 10, max: 100 },
    strokeLength: { type: Number, required: true, min: 0.5, max: 5 },
    symmetry: { type: Number, required: true, min: 1, max: 10 },
    flexibility: { type: Number, required: true, min: 1, max: 10 },
    strength: { type: Number, required: true, min: 1, max: 10 }
});
const recoveryDataSchema = new mongoose_1.Schema({
    date: { type: Date, required: true },
    sleepHours: { type: Number, required: true, min: 0, max: 24 },
    sleepQuality: { type: Number, required: true, min: 1, max: 10 },
    stressLevel: { type: Number, required: true, min: 1, max: 10 },
    fatigue: { type: Number, required: true, min: 1, max: 10 },
    soreness: { type: Number, required: true, min: 1, max: 10 },
    nutrition: { type: Number, required: true, min: 1, max: 10 },
    hydration: { type: Number, required: true, min: 1, max: 10 },
    restDaysTaken: { type: Number, required: true, min: 0 }
});
const injuryHistorySchema = new mongoose_1.Schema({
    date: { type: Date, required: true },
    injuryType: {
        type: String,
        enum: Object.values(InjuryType),
        required: true
    },
    severity: { type: Number, required: true, min: 1, max: 10 },
    recoveryDays: { type: Number, required: true, min: 0 },
    cause: { type: String, required: true },
    treatment: { type: String, required: true },
    preventionMeasures: [{ type: String }],
    recurrence: { type: Boolean, default: false }
});
const riskFactorSchema = new mongoose_1.Schema({
    category: {
        type: String,
        enum: Object.values(RiskFactorCategory),
        required: true
    },
    factor: { type: String, required: true },
    severity: { type: Number, required: true, min: 1, max: 10 },
    confidence: { type: Number, required: true, min: 0, max: 100 },
    description: { type: String, required: true },
    recommendations: [{ type: String }]
});
const injuryPredictionSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assessmentDate: { type: Date, default: Date.now },
    userProfile: {
        age: { type: Number, required: true, min: 5, max: 100 },
        weight: { type: Number, required: true, min: 20, max: 300 },
        height: { type: Number, required: true, min: 100, max: 250 },
        experience: { type: Number, required: true, min: 0 },
        currentLevel: { type: String, required: true },
        medicalHistory: [{ type: String }],
        previousInjuries: [injuryHistorySchema]
    },
    trainingLoadAnalysis: {
        recentLoads: [trainingLoadSchema],
        averageWeeklyLoad: { type: Number, required: true, min: 0 },
        loadTrend: {
            type: String,
            enum: ['increasing', 'stable', 'decreasing'],
            required: true
        },
        acuteChronicRatio: { type: Number, required: true, min: 0, max: 5 },
        loadSpikes: [{
                date: { type: Date, required: true },
                magnitude: { type: Number, required: true },
                type: {
                    type: String,
                    enum: ['duration', 'intensity', 'volume'],
                    required: true
                }
            }]
    },
    biomechanicalAnalysis: {
        recentData: [biomechanicalDataSchema],
        techniqueScore: { type: Number, required: true, min: 1, max: 100 },
        asymmetryIssues: [{ type: String }],
        movementPatterns: [{
                pattern: { type: String, required: true },
                quality: { type: Number, required: true, min: 1, max: 10 },
                riskLevel: { type: Number, required: true, min: 1, max: 10 }
            }]
    },
    recoveryAnalysis: {
        recentData: [recoveryDataSchema],
        recoveryScore: { type: Number, required: true, min: 1, max: 100 },
        sleepDebt: { type: Number, required: true, min: 0 },
        stressAccumulation: { type: Number, required: true, min: 1, max: 100 },
        fatigueLevel: { type: Number, required: true, min: 1, max: 100 }
    },
    environmentalFactors: {
        poolConditions: {
            temperature: { type: Number, required: true, min: 15, max: 35 },
            chlorineLevel: { type: Number, required: true, min: 0, max: 10 },
            crowdedness: { type: Number, required: true, min: 1, max: 10 }
        },
        equipmentCondition: { type: Number, required: true, min: 1, max: 10 },
        coachingQuality: { type: Number, required: true, min: 1, max: 10 },
        trainingEnvironment: { type: Number, required: true, min: 1, max: 10 }
    },
    prediction: {
        overallRisk: { type: Number, required: true, min: 0, max: 100 },
        riskLevel: {
            type: String,
            enum: Object.values(InjuryRiskLevel),
            required: true
        },
        confidenceScore: { type: Number, required: true, min: 0, max: 100 },
        primaryRiskFactors: [riskFactorSchema],
        injuryTypePredictions: [{
                injuryType: {
                    type: String,
                    enum: Object.values(InjuryType),
                    required: true
                },
                probability: { type: Number, required: true, min: 0, max: 100 },
                timeframe: { type: String, required: true }
            }],
        recommendations: {
            immediate: [{ type: String }],
            shortTerm: [{ type: String }],
            longTerm: [{ type: String }]
        },
        monitoringPoints: [{ type: String }]
    },
    monitoring: {
        alertsGenerated: [{
                date: { type: Date, default: Date.now },
                level: {
                    type: String,
                    enum: ['info', 'warning', 'critical'],
                    required: true
                },
                message: { type: String, required: true },
                acknowledged: { type: Boolean, default: false }
            }],
        followUpRequired: { type: Boolean, default: false },
        nextAssessmentDate: { type: Date, required: true },
        interventionsRecommended: [{ type: String }]
    },
    modelVersion: { type: String, default: '1.0.0' },
    dataQuality: { type: Number, required: true, min: 1, max: 100 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
});
injuryPredictionSchema.index({ userId: 1, assessmentDate: -1 });
injuryPredictionSchema.index({ 'prediction.riskLevel': 1 });
injuryPredictionSchema.index({ 'prediction.overallRisk': -1 });
injuryPredictionSchema.index({ 'monitoring.followUpRequired': 1 });
injuryPredictionSchema.index({ isActive: 1 });
injuryPredictionSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});
injuryPredictionSchema.statics.getHighRiskUsers = async function () {
    return await this.find({
        isActive: true,
        'prediction.riskLevel': { $in: [InjuryRiskLevel.HIGH, InjuryRiskLevel.VERY_HIGH] }
    })
        .populate('userId', 'name email')
        .sort({ 'prediction.overallRisk': -1 });
};
injuryPredictionSchema.statics.getInjuryStatistics = async function () {
    return await this.aggregate([
        { $match: { isActive: true } },
        {
            $group: {
                _id: '$prediction.riskLevel',
                count: { $sum: 1 },
                avgRisk: { $avg: '$prediction.overallRisk' }
            }
        },
        { $sort: { avgRisk: -1 } }
    ]);
};
injuryPredictionSchema.methods.needsUpdate = function () {
    const daysSinceUpdate = Math.floor((Date.now() - this.updatedAt.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceUpdate >= 7 ||
        this.monitoring.followUpRequired ||
        this.prediction.riskLevel === InjuryRiskLevel.VERY_HIGH;
};
injuryPredictionSchema.methods.generateAlert = function (level, message) {
    this.monitoring.alertsGenerated.push({
        date: new Date(),
        level,
        message,
        acknowledged: false
    });
    if (level === 'critical') {
        this.monitoring.followUpRequired = true;
    }
};
injuryPredictionSchema.methods.updateRecommendations = function (immediate, shortTerm, longTerm) {
    this.prediction.recommendations = {
        immediate: immediate || this.prediction.recommendations.immediate,
        shortTerm: shortTerm || this.prediction.recommendations.shortTerm,
        longTerm: longTerm || this.prediction.recommendations.longTerm
    };
};
exports.InjuryPrediction = mongoose_1.default.model('InjuryPrediction', injuryPredictionSchema);
exports.default = exports.InjuryPrediction;
//# sourceMappingURL=InjuryPrediction.js.map