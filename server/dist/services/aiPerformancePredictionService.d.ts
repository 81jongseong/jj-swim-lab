import mongoose from 'mongoose';
import { IPerformancePrediction, SwimmingEvent, ITrainingPerformance, IPhysiologicalData } from '../models/PerformancePrediction';
export interface IPerformancePredictionRequest {
    userId: mongoose.Types.ObjectId;
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
    trainingData: ITrainingPerformance[];
    physiologicalData: IPhysiologicalData[];
    targetEvents: SwimmingEvent[];
}
export declare class AIPerformancePredictionService {
    static predictPerformance(request: IPerformancePredictionRequest): Promise<IPerformancePrediction>;
    private static analyzeTrainingData;
    private static calculateWeeklyVolume;
    private static calculateTrainingDays;
    private static analyzeProgressTrend;
    private static calculateConsistencyScore;
    private static calculateTimeVariability;
    private static calculateTrainingScore;
    private static analyzePhysiologicalData;
    private static calculateFitnessScore;
    private static analyzeStrengthProfile;
    private static analyzeEnduranceProfile;
    private static analyzeTechnique;
    private static analyzeStrokeEfficiency;
    private static analyzeStartTechnique;
    private static analyzeTurnTechnique;
    private static analyzeFinishTechnique;
    private static identifyTechniqueImprovementAreas;
    private static performComprehensiveAnalysis;
    private static calculatePotentialScore;
    private static identifyLimitingFactors;
    private static identifyStrengthAreas;
    private static predictEventPerformance;
    private static getEventBaseTime;
    private static applyPredictionModel;
    private static getEventImprovementMultiplier;
    private static calculatePredictionConfidence;
    private static getConfidenceLevel;
    private static analyzePerformanceFactors;
    private static analyzePerformanceBreakdown;
    private static generateEventRecommendations;
    private static generateMilestones;
    private static shouldUpdateExisting;
    private static updateExistingPrediction;
    private static createNewPrediction;
    private static generateModelInfo;
    private static generateValidationInfo;
    static getUserPredictions(userId: mongoose.Types.ObjectId): Promise<IPerformancePrediction[]>;
    static getLatestPrediction(userId: mongoose.Types.ObjectId): Promise<IPerformancePrediction | null>;
    static addActualResult(predictionId: mongoose.Types.ObjectId, event: SwimmingEvent, predictedTime: number, actualTime: number, achievedDate: Date): Promise<IPerformancePrediction | null>;
    static getEventStatistics(event: SwimmingEvent): Promise<any>;
    static getAccuracyStatistics(): Promise<any>;
}
export default AIPerformancePredictionService;
//# sourceMappingURL=aiPerformancePredictionService.d.ts.map