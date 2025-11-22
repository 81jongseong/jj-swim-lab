/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose/types/inferschematype" />
import mongoose from 'mongoose';
import { IInjuryPrediction, ITrainingLoad, IBiomechanicalData, IRecoveryData } from '../models/InjuryPrediction';
export interface IInjuryAssessmentRequest {
    userId: mongoose.Types.ObjectId;
    userProfile: {
        age: number;
        weight: number;
        height: number;
        experience: number;
        currentLevel: string;
        medicalHistory: string[];
        previousInjuries: any[];
    };
    trainingData: ITrainingLoad[];
    biomechanicalData: IBiomechanicalData[];
    recoveryData: IRecoveryData[];
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
}
export declare class AIInjuryPredictionService {
    static predictInjuryRisk(request: IInjuryAssessmentRequest): Promise<IInjuryPrediction>;
    private static analyzeTrainingLoad;
    private static calculateWeeklyLoads;
    private static detectLoadSpikes;
    private static analyzeLoadTrend;
    private static analyzeBiomechanics;
    private static analyzeRecovery;
    private static performComprehensiveAnalysis;
    private static calculateEnvironmentalRisk;
    private static calculateHistoricalRisk;
    private static identifyRiskFactors;
    private static predictInjuryTypes;
    private static calculateShoulderInjuryRisk;
    private static calculateBackInjuryRisk;
    private static calculateKneeInjuryRisk;
    private static calculateOveruseRisk;
    private static generateRecommendations;
    private static generateMonitoringPoints;
    private static calculateRiskLevel;
    private static calculateConfidenceScore;
    private static calculateVariability;
    private static shouldUpdateExisting;
    private static updateExistingPrediction;
    private static createNewPrediction;
    private static calculateDataQuality;
    static getUserPredictions(userId: mongoose.Types.ObjectId): Promise<IInjuryPrediction[]>;
    static getHighRiskUsers(): Promise<IInjuryPrediction[]>;
    static getInjuryStatistics(): Promise<any>;
}
export default AIInjuryPredictionService;
//# sourceMappingURL=aiInjuryPredictionService.d.ts.map