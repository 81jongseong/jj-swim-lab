import mongoose, { Document } from 'mongoose';
export declare enum SwimmingEvent {
    FREESTYLE_50 = "freestyle_50",
    FREESTYLE_100 = "freestyle_100",
    FREESTYLE_200 = "freestyle_200",
    FREESTYLE_400 = "freestyle_400",
    FREESTYLE_800 = "freestyle_800",
    FREESTYLE_1500 = "freestyle_1500",
    BACKSTROKE_50 = "backstroke_50",
    BACKSTROKE_100 = "backstroke_100",
    BACKSTROKE_200 = "backstroke_200",
    BREASTSTROKE_50 = "breaststroke_50",
    BREASTSTROKE_100 = "breaststroke_100",
    BREASTSTROKE_200 = "breaststroke_200",
    BUTTERFLY_50 = "butterfly_50",
    BUTTERFLY_100 = "butterfly_100",
    BUTTERFLY_200 = "butterfly_200",
    MEDLEY_100 = "medley_100",
    MEDLEY_200 = "medley_200",
    MEDLEY_400 = "medley_400"
}
export declare enum ConfidenceLevel {
    VERY_LOW = "very_low",
    LOW = "low",
    MODERATE = "moderate",
    HIGH = "high",
    VERY_HIGH = "very_high"
}
export declare enum PerformanceFactorCategory {
    TECHNIQUE = "technique",
    PHYSICAL = "physical",
    TRAINING = "training",
    PSYCHOLOGICAL = "psychological",
    ENVIRONMENTAL = "environmental",
    EQUIPMENT = "equipment",
    TACTICAL = "tactical"
}
export interface IPerformanceFactor {
    category: PerformanceFactorCategory;
    factor: string;
    impact: number;
    confidence: number;
    description: string;
    recommendations: string[];
}
export interface ITrainingPerformance {
    date: Date;
    event: SwimmingEvent;
    time: number;
    distance: number;
    strokeCount: number;
    strokeRate: number;
    splitTimes: number[];
    heartRateAvg?: number;
    heartRateMax?: number;
    lactateLevel?: number;
    perceivedExertion: number;
    conditions: {
        poolLength: number;
        waterTemp: number;
        weather?: string;
        competition: boolean;
    };
    technique: {
        efficiency: number;
        consistency: number;
        startTime?: number;
        turnTimes?: number[];
        finishTime?: number;
    };
}
export interface IPhysiologicalData {
    date: Date;
    vo2Max?: number;
    anaerobicThreshold?: number;
    lactateThreshold?: number;
    restingHeartRate: number;
    maxHeartRate: number;
    bodyFatPercentage?: number;
    muscleMass?: number;
    flexibility: {
        shoulderFlexibility: number;
        ankleFlexibility: number;
        spinalFlexibility: number;
    };
    strength: {
        upperBodyStrength: number;
        coreStrength: number;
        legStrength: number;
    };
}
export interface IPredictionResult {
    targetEvent: SwimmingEvent;
    currentBestTime: number;
    predictedTime: number;
    improvementSeconds: number;
    improvementPercentage: number;
    confidenceLevel: ConfidenceLevel;
    confidenceScore: number;
    timeframePredictions: {
        oneMonth: number;
        threeMonths: number;
        sixMonths: number;
        oneYear: number;
    };
    performanceFactors: IPerformanceFactor[];
    breakdown: {
        startImprovement: number;
        strokeImprovement: number;
        turnImprovement: number;
        finishImprovement: number;
        enduranceImprovement: number;
        techniqueImprovement: number;
    };
    recommendations: {
        training: string[];
        technique: string[];
        physical: string[];
        tactical: string[];
    };
    milestones: {
        targetTime: number;
        estimatedAchievementDate: Date;
        requiredImprovementRate: number;
    }[];
}
export interface IPerformancePrediction extends Document {
    userId: mongoose.Types.ObjectId;
    predictionDate: Date;
    userProfile: {
        age: number;
        weight: number;
        height: number;
        experience: number;
        currentLevel: string;
        dominantStroke: SwimmingEvent;
        trainingFrequency: number;
        competitionExperience: boolean;
    };
    currentRecords: {
        event: SwimmingEvent;
        bestTime: number;
        achievedDate: Date;
        conditions: string;
    }[];
    trainingAnalysis: {
        recentPerformances: ITrainingPerformance[];
        trainingLoad: {
            weeklyVolume: number;
            weeklyIntensity: number;
            trainingDays: number;
        };
        progressTrend: 'improving' | 'stable' | 'declining';
        consistencyScore: number;
        peakPerformanceIndicators: {
            bestRecentTime: number;
            averageTime: number;
            timeVariability: number;
        };
    };
    physiologicalAnalysis: {
        recentData: IPhysiologicalData[];
        fitnessScore: number;
        strengthProfile: {
            overall: number;
            strengths: string[];
            weaknesses: string[];
        };
        enduranceProfile: {
            aerobicCapacity: number;
            anaerobicCapacity: number;
            lactateManagement: number;
        };
    };
    techniqueAnalysis: {
        overallScore: number;
        strokeEfficiency: number;
        startTechnique: number;
        turnTechnique: number;
        finishTechnique: number;
        breathing: number;
        bodyPosition: number;
        timing: number;
        improvementAreas: string[];
    };
    predictions: IPredictionResult[];
    modelInfo: {
        version: string;
        algorithm: string;
        trainingDataSize: number;
        lastTrainingDate: Date;
        accuracy: number;
    };
    validation: {
        historicalAccuracy: number;
        similarSwimmersComparison: {
            count: number;
            averageImprovement: number;
            bestImprovement: number;
        };
        expertValidation?: {
            coachReview: string;
            adjustments: string[];
            approvalStatus: 'pending' | 'approved' | 'rejected';
        };
    };
    tracking: {
        actualResults: {
            event: SwimmingEvent;
            predictedTime: number;
            actualTime: number;
            achievedDate: Date;
            accuracy: number;
        }[];
        feedbackProvided: boolean;
        nextPredictionDate: Date;
    };
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
}
export declare const PerformancePrediction: mongoose.Model<IPerformancePrediction, {}, {}, {}, mongoose.Document<unknown, {}, IPerformancePrediction> & IPerformancePrediction & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default PerformancePrediction;
//# sourceMappingURL=PerformancePrediction.d.ts.map