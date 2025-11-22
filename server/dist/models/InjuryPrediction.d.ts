import mongoose, { Document } from 'mongoose';
export declare enum InjuryRiskLevel {
    VERY_LOW = "very_low",
    LOW = "low",
    MODERATE = "moderate",
    HIGH = "high",
    VERY_HIGH = "very_high"
}
export declare enum InjuryType {
    SHOULDER = "shoulder",
    NECK = "neck",
    BACK = "back",
    KNEE = "knee",
    ANKLE = "ankle",
    WRIST = "wrist",
    MUSCLE_STRAIN = "muscle_strain",
    JOINT_PAIN = "joint_pain",
    OVERUSE = "overuse",
    FATIGUE = "fatigue"
}
export declare enum RiskFactorCategory {
    TRAINING_LOAD = "training_load",
    TECHNIQUE = "technique",
    PHYSICAL = "physical",
    ENVIRONMENTAL = "environmental",
    PSYCHOLOGICAL = "psychological",
    RECOVERY = "recovery",
    BIOMECHANICAL = "biomechanical"
}
export interface IRiskFactor {
    category: RiskFactorCategory;
    factor: string;
    severity: number;
    confidence: number;
    description: string;
    recommendations: string[];
}
export interface ITrainingLoad {
    date: Date;
    duration: number;
    intensity: number;
    volume: number;
    perceivedExertion: number;
    heartRateAvg?: number;
    heartRateMax?: number;
    strokeCount?: number;
    restTime?: number;
}
export interface IBiomechanicalData {
    date: Date;
    strokeEfficiency: number;
    bodyPosition: number;
    breathingPattern: number;
    strokeRate: number;
    strokeLength: number;
    symmetry: number;
    flexibility: number;
    strength: number;
}
export interface IRecoveryData {
    date: Date;
    sleepHours: number;
    sleepQuality: number;
    stressLevel: number;
    fatigue: number;
    soreness: number;
    nutrition: number;
    hydration: number;
    restDaysTaken: number;
}
export interface IInjuryHistory {
    date: Date;
    injuryType: InjuryType;
    severity: number;
    recoveryDays: number;
    cause: string;
    treatment: string;
    preventionMeasures: string[];
    recurrence: boolean;
}
export interface IPredictionResult {
    overallRisk: number;
    riskLevel: InjuryRiskLevel;
    confidenceScore: number;
    primaryRiskFactors: IRiskFactor[];
    injuryTypePredictions: {
        injuryType: InjuryType;
        probability: number;
        timeframe: string;
    }[];
    recommendations: {
        immediate: string[];
        shortTerm: string[];
        longTerm: string[];
    };
    monitoringPoints: string[];
}
export interface IInjuryPrediction extends Document {
    userId: mongoose.Types.ObjectId;
    assessmentDate: Date;
    userProfile: {
        age: number;
        weight: number;
        height: number;
        experience: number;
        currentLevel: string;
        medicalHistory: string[];
        previousInjuries: IInjuryHistory[];
    };
    trainingLoadAnalysis: {
        recentLoads: ITrainingLoad[];
        averageWeeklyLoad: number;
        loadTrend: 'increasing' | 'stable' | 'decreasing';
        acuteChronicRatio: number;
        loadSpikes: {
            date: Date;
            magnitude: number;
            type: 'duration' | 'intensity' | 'volume';
        }[];
    };
    biomechanicalAnalysis: {
        recentData: IBiomechanicalData[];
        techniqueScore: number;
        asymmetryIssues: string[];
        movementPatterns: {
            pattern: string;
            quality: number;
            riskLevel: number;
        }[];
    };
    recoveryAnalysis: {
        recentData: IRecoveryData[];
        recoveryScore: number;
        sleepDebt: number;
        stressAccumulation: number;
        fatigueLevel: number;
    };
    environmentalFactors: {
        poolConditions: {
            temperature: number;
            chlorineLevel: number;
            crowdedness: number;
        };
        equipmentCondition: number;
        coachingQuality: number;
        trainingEnvironment: number;
    };
    prediction: IPredictionResult;
    monitoring: {
        alertsGenerated: {
            date: Date;
            level: 'info' | 'warning' | 'critical';
            message: string;
            acknowledged: boolean;
        }[];
        followUpRequired: boolean;
        nextAssessmentDate: Date;
        interventionsRecommended: string[];
    };
    modelVersion: string;
    dataQuality: number;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
}
export declare const InjuryPrediction: mongoose.Model<IInjuryPrediction, {}, {}, {}, mongoose.Document<unknown, {}, IInjuryPrediction> & IInjuryPrediction & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default InjuryPrediction;
//# sourceMappingURL=InjuryPrediction.d.ts.map