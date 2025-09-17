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
exports.PerformancePrediction = exports.PerformanceFactorCategory = exports.ConfidenceLevel = exports.SwimmingEvent = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var SwimmingEvent;
(function (SwimmingEvent) {
    SwimmingEvent["FREESTYLE_50"] = "freestyle_50";
    SwimmingEvent["FREESTYLE_100"] = "freestyle_100";
    SwimmingEvent["FREESTYLE_200"] = "freestyle_200";
    SwimmingEvent["FREESTYLE_400"] = "freestyle_400";
    SwimmingEvent["FREESTYLE_800"] = "freestyle_800";
    SwimmingEvent["FREESTYLE_1500"] = "freestyle_1500";
    SwimmingEvent["BACKSTROKE_50"] = "backstroke_50";
    SwimmingEvent["BACKSTROKE_100"] = "backstroke_100";
    SwimmingEvent["BACKSTROKE_200"] = "backstroke_200";
    SwimmingEvent["BREASTSTROKE_50"] = "breaststroke_50";
    SwimmingEvent["BREASTSTROKE_100"] = "breaststroke_100";
    SwimmingEvent["BREASTSTROKE_200"] = "breaststroke_200";
    SwimmingEvent["BUTTERFLY_50"] = "butterfly_50";
    SwimmingEvent["BUTTERFLY_100"] = "butterfly_100";
    SwimmingEvent["BUTTERFLY_200"] = "butterfly_200";
    SwimmingEvent["MEDLEY_100"] = "medley_100";
    SwimmingEvent["MEDLEY_200"] = "medley_200";
    SwimmingEvent["MEDLEY_400"] = "medley_400";
})(SwimmingEvent || (exports.SwimmingEvent = SwimmingEvent = {}));
var ConfidenceLevel;
(function (ConfidenceLevel) {
    ConfidenceLevel["VERY_LOW"] = "very_low";
    ConfidenceLevel["LOW"] = "low";
    ConfidenceLevel["MODERATE"] = "moderate";
    ConfidenceLevel["HIGH"] = "high";
    ConfidenceLevel["VERY_HIGH"] = "very_high";
})(ConfidenceLevel || (exports.ConfidenceLevel = ConfidenceLevel = {}));
var PerformanceFactorCategory;
(function (PerformanceFactorCategory) {
    PerformanceFactorCategory["TECHNIQUE"] = "technique";
    PerformanceFactorCategory["PHYSICAL"] = "physical";
    PerformanceFactorCategory["TRAINING"] = "training";
    PerformanceFactorCategory["PSYCHOLOGICAL"] = "psychological";
    PerformanceFactorCategory["ENVIRONMENTAL"] = "environmental";
    PerformanceFactorCategory["EQUIPMENT"] = "equipment";
    PerformanceFactorCategory["TACTICAL"] = "tactical";
})(PerformanceFactorCategory || (exports.PerformanceFactorCategory = PerformanceFactorCategory = {}));
const trainingPerformanceSchema = new mongoose_1.Schema({
    date: { type: Date, required: true },
    event: {
        type: String,
        enum: Object.values(SwimmingEvent),
        required: true
    },
    time: { type: Number, required: true, min: 0 },
    distance: { type: Number, required: true, min: 25 },
    strokeCount: { type: Number, required: true, min: 1 },
    strokeRate: { type: Number, required: true, min: 10, max: 100 },
    splitTimes: [{ type: Number, min: 0 }],
    heartRateAvg: { type: Number, min: 40, max: 220 },
    heartRateMax: { type: Number, min: 40, max: 220 },
    lactateLevel: { type: Number, min: 0, max: 30 },
    perceivedExertion: { type: Number, required: true, min: 1, max: 10 },
    conditions: {
        poolLength: { type: Number, required: true, enum: [25, 50] },
        waterTemp: { type: Number, required: true, min: 15, max: 35 },
        weather: { type: String },
        competition: { type: Boolean, default: false }
    },
    technique: {
        efficiency: { type: Number, required: true, min: 1, max: 10 },
        consistency: { type: Number, required: true, min: 1, max: 10 },
        startTime: { type: Number, min: 0 },
        turnTimes: [{ type: Number, min: 0 }],
        finishTime: { type: Number, min: 0 }
    }
});
const physiologicalDataSchema = new mongoose_1.Schema({
    date: { type: Date, required: true },
    vo2Max: { type: Number, min: 20, max: 90 },
    anaerobicThreshold: { type: Number, min: 50, max: 100 },
    lactateThreshold: { type: Number, min: 1, max: 20 },
    restingHeartRate: { type: Number, required: true, min: 30, max: 100 },
    maxHeartRate: { type: Number, required: true, min: 150, max: 220 },
    bodyFatPercentage: { type: Number, min: 3, max: 50 },
    muscleMass: { type: Number, min: 20, max: 100 },
    flexibility: {
        shoulderFlexibility: { type: Number, required: true, min: 1, max: 10 },
        ankleFlexibility: { type: Number, required: true, min: 1, max: 10 },
        spinalFlexibility: { type: Number, required: true, min: 1, max: 10 }
    },
    strength: {
        upperBodyStrength: { type: Number, required: true, min: 1, max: 10 },
        coreStrength: { type: Number, required: true, min: 1, max: 10 },
        legStrength: { type: Number, required: true, min: 1, max: 10 }
    }
});
const performanceFactorSchema = new mongoose_1.Schema({
    category: {
        type: String,
        enum: Object.values(PerformanceFactorCategory),
        required: true
    },
    factor: { type: String, required: true },
    impact: { type: Number, required: true, min: -100, max: 100 },
    confidence: { type: Number, required: true, min: 0, max: 100 },
    description: { type: String, required: true },
    recommendations: [{ type: String }]
});
const performancePredictionSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    predictionDate: { type: Date, default: Date.now },
    userProfile: {
        age: { type: Number, required: true, min: 5, max: 100 },
        weight: { type: Number, required: true, min: 20, max: 300 },
        height: { type: Number, required: true, min: 100, max: 250 },
        experience: { type: Number, required: true, min: 0 },
        currentLevel: { type: String, required: true },
        dominantStroke: {
            type: String,
            enum: Object.values(SwimmingEvent),
            required: true
        },
        trainingFrequency: { type: Number, required: true, min: 1, max: 14 },
        competitionExperience: { type: Boolean, default: false }
    },
    currentRecords: [{
            event: {
                type: String,
                enum: Object.values(SwimmingEvent),
                required: true
            },
            bestTime: { type: Number, required: true, min: 0 },
            achievedDate: { type: Date, required: true },
            conditions: { type: String, required: true }
        }],
    trainingAnalysis: {
        recentPerformances: [trainingPerformanceSchema],
        trainingLoad: {
            weeklyVolume: { type: Number, required: true, min: 0 },
            weeklyIntensity: { type: Number, required: true, min: 1, max: 10 },
            trainingDays: { type: Number, required: true, min: 1, max: 7 }
        },
        progressTrend: {
            type: String,
            enum: ['improving', 'stable', 'declining'],
            required: true
        },
        consistencyScore: { type: Number, required: true, min: 1, max: 100 },
        peakPerformanceIndicators: {
            bestRecentTime: { type: Number, required: true },
            averageTime: { type: Number, required: true },
            timeVariability: { type: Number, required: true, min: 0 }
        }
    },
    physiologicalAnalysis: {
        recentData: [physiologicalDataSchema],
        fitnessScore: { type: Number, required: true, min: 1, max: 100 },
        strengthProfile: {
            overall: { type: Number, required: true, min: 1, max: 100 },
            strengths: [{ type: String }],
            weaknesses: [{ type: String }]
        },
        enduranceProfile: {
            aerobicCapacity: { type: Number, required: true, min: 1, max: 100 },
            anaerobicCapacity: { type: Number, required: true, min: 1, max: 100 },
            lactateManagement: { type: Number, required: true, min: 1, max: 100 }
        }
    },
    techniqueAnalysis: {
        overallScore: { type: Number, required: true, min: 1, max: 100 },
        strokeEfficiency: { type: Number, required: true, min: 1, max: 100 },
        startTechnique: { type: Number, required: true, min: 1, max: 100 },
        turnTechnique: { type: Number, required: true, min: 1, max: 100 },
        finishTechnique: { type: Number, required: true, min: 1, max: 100 },
        breathing: { type: Number, required: true, min: 1, max: 100 },
        bodyPosition: { type: Number, required: true, min: 1, max: 100 },
        timing: { type: Number, required: true, min: 1, max: 100 },
        improvementAreas: [{ type: String }]
    },
    predictions: [{
            targetEvent: {
                type: String,
                enum: Object.values(SwimmingEvent),
                required: true
            },
            currentBestTime: { type: Number, required: true, min: 0 },
            predictedTime: { type: Number, required: true, min: 0 },
            improvementSeconds: { type: Number, required: true },
            improvementPercentage: { type: Number, required: true },
            confidenceLevel: {
                type: String,
                enum: Object.values(ConfidenceLevel),
                required: true
            },
            confidenceScore: { type: Number, required: true, min: 0, max: 100 },
            timeframePredictions: {
                oneMonth: { type: Number, required: true, min: 0 },
                threeMonths: { type: Number, required: true, min: 0 },
                sixMonths: { type: Number, required: true, min: 0 },
                oneYear: { type: Number, required: true, min: 0 }
            },
            performanceFactors: [performanceFactorSchema],
            breakdown: {
                startImprovement: { type: Number, required: true },
                strokeImprovement: { type: Number, required: true },
                turnImprovement: { type: Number, required: true },
                finishImprovement: { type: Number, required: true },
                enduranceImprovement: { type: Number, required: true },
                techniqueImprovement: { type: Number, required: true }
            },
            recommendations: {
                training: [{ type: String }],
                technique: [{ type: String }],
                physical: [{ type: String }],
                tactical: [{ type: String }]
            },
            milestones: [{
                    targetTime: { type: Number, required: true, min: 0 },
                    estimatedAchievementDate: { type: Date, required: true },
                    requiredImprovementRate: { type: Number, required: true }
                }]
        }],
    modelInfo: {
        version: { type: String, default: '1.0.0' },
        algorithm: { type: String, default: 'neural_network' },
        trainingDataSize: { type: Number, required: true },
        lastTrainingDate: { type: Date, required: true },
        accuracy: { type: Number, required: true, min: 0, max: 100 }
    },
    validation: {
        historicalAccuracy: { type: Number, required: true, min: 0, max: 100 },
        similarSwimmersComparison: {
            count: { type: Number, required: true, min: 0 },
            averageImprovement: { type: Number, required: true },
            bestImprovement: { type: Number, required: true }
        },
        expertValidation: {
            coachReview: { type: String },
            adjustments: [{ type: String }],
            approvalStatus: {
                type: String,
                enum: ['pending', 'approved', 'rejected'],
                default: 'pending'
            }
        }
    },
    tracking: {
        actualResults: [{
                event: {
                    type: String,
                    enum: Object.values(SwimmingEvent),
                    required: true
                },
                predictedTime: { type: Number, required: true },
                actualTime: { type: Number, required: true },
                achievedDate: { type: Date, required: true },
                accuracy: { type: Number, required: true, min: 0, max: 100 }
            }],
        feedbackProvided: { type: Boolean, default: false },
        nextPredictionDate: { type: Date, required: true }
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
});
performancePredictionSchema.index({ userId: 1, predictionDate: -1 });
performancePredictionSchema.index({ 'predictions.targetEvent': 1 });
performancePredictionSchema.index({ 'predictions.confidenceLevel': 1 });
performancePredictionSchema.index({ isActive: 1 });
performancePredictionSchema.index({ 'tracking.nextPredictionDate': 1 });
performancePredictionSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});
performancePredictionSchema.statics.getLatestPrediction = async function (userId) {
    return await this.findOne({ userId, isActive: true })
        .sort({ predictionDate: -1 })
        .populate('userId', 'name email');
};
performancePredictionSchema.statics.getEventStatistics = async function (event) {
    return await this.aggregate([
        { $match: { isActive: true, 'predictions.targetEvent': event } },
        { $unwind: '$predictions' },
        { $match: { 'predictions.targetEvent': event } },
        {
            $group: {
                _id: '$predictions.confidenceLevel',
                count: { $sum: 1 },
                avgImprovement: { $avg: '$predictions.improvementPercentage' },
                avgConfidence: { $avg: '$predictions.confidenceScore' }
            }
        },
        { $sort: { avgConfidence: -1 } }
    ]);
};
performancePredictionSchema.statics.getAccuracyStatistics = async function () {
    return await this.aggregate([
        { $match: { isActive: true, 'tracking.actualResults.0': { $exists: true } } },
        { $unwind: '$tracking.actualResults' },
        {
            $group: {
                _id: '$tracking.actualResults.event',
                count: { $sum: 1 },
                avgAccuracy: { $avg: '$tracking.actualResults.accuracy' },
                bestAccuracy: { $max: '$tracking.actualResults.accuracy' },
                worstAccuracy: { $min: '$tracking.actualResults.accuracy' }
            }
        },
        { $sort: { avgAccuracy: -1 } }
    ]);
};
performancePredictionSchema.methods.needsUpdate = function () {
    const daysSinceUpdate = Math.floor((Date.now() - this.updatedAt.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceUpdate >= 14 ||
        this.tracking.nextPredictionDate <= new Date() ||
        this.trainingAnalysis.recentPerformances.length >= 10;
};
performancePredictionSchema.methods.addActualResult = function (event, predictedTime, actualTime, achievedDate) {
    const accuracy = Math.max(0, 100 - Math.abs((actualTime - predictedTime) / predictedTime) * 100);
    this.tracking.actualResults.push({
        event,
        predictedTime,
        actualTime,
        achievedDate,
        accuracy
    });
    this.tracking.nextPredictionDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
};
performancePredictionSchema.methods.calculateOverallAccuracy = function () {
    if (this.tracking.actualResults.length === 0)
        return 0;
    const totalAccuracy = this.tracking.actualResults.reduce((sum, result) => sum + result.accuracy, 0);
    return totalAccuracy / this.tracking.actualResults.length;
};
performancePredictionSchema.methods.analyzeImprovementTrend = function () {
    const performances = this.trainingAnalysis.recentPerformances
        .sort((a, b) => a.date.getTime() - b.date.getTime());
    if (performances.length < 3)
        return 'insufficient_data';
    const recentPerfs = performances.slice(-3);
    const earlierPerfs = performances.slice(-6, -3);
    if (earlierPerfs.length === 0)
        return 'insufficient_data';
    const recentAvg = recentPerfs.reduce((sum, p) => sum + p.time, 0) / recentPerfs.length;
    const earlierAvg = earlierPerfs.reduce((sum, p) => sum + p.time, 0) / earlierPerfs.length;
    const improvementPercent = ((earlierAvg - recentAvg) / earlierAvg) * 100;
    if (improvementPercent > 2)
        return 'improving';
    if (improvementPercent < -2)
        return 'declining';
    return 'stable';
};
exports.PerformancePrediction = mongoose_1.default.model('PerformancePrediction', performancePredictionSchema);
exports.default = exports.PerformancePrediction;
//# sourceMappingURL=PerformancePrediction.js.map