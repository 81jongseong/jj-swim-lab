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
import { IHealthAssessment, HealthRiskLevel, ChronicCondition, IExerciseRecommendation } from '../models/HealthAssessment';
export interface IMedicalExercisePrescriptionRequest {
    userId: mongoose.Types.ObjectId;
    healthAssessmentId: mongoose.Types.ObjectId;
    goals: string[];
    preferences: {
        exerciseTypes: string[];
        timeAvailable: number;
        daysPerWeek: number;
        intensity: 'low' | 'moderate' | 'high';
    };
    environmentalFactors: {
        poolAvailable: boolean;
        gymAccess: boolean;
        homeEquipment: string[];
        weatherRestrictions: string[];
    };
}
export interface IMedicalPrescriptionResult {
    prescriptionId: string;
    patientInfo: {
        userId: mongoose.Types.ObjectId;
        riskLevel: HealthRiskLevel;
        primaryConditions: ChronicCondition[];
        currentMedications: string[];
    };
    exerciseRecommendations: IExerciseRecommendation[];
    safetyGuidelines: {
        preExerciseChecklist: string[];
        duringExerciseMonitoring: string[];
        postExerciseActions: string[];
        warningSignsToStop: string[];
        emergencyProtocol: string[];
    };
    progressionPlan: {
        phase: number;
        duration: string;
        objectives: string[];
        exerciseModifications: string[];
        assessmentSchedule: string;
    }[];
    medicalSupervision: {
        required: boolean;
        frequency: string;
        specialistReferral: boolean;
        clearanceNeeded: boolean;
    };
    contraindications: {
        absolute: string[];
        relative: string[];
    };
}
export declare class MedicalExercisePrescriptionService {
    static createMedicalPrescription(request: IMedicalExercisePrescriptionRequest): Promise<IMedicalPrescriptionResult>;
    private static analyzeHealthRisks;
    private static getConditionSpecificGuidelines;
    private static generateExerciseRecommendations;
    private static calculateBaseParameters;
    private static calculateTargetHeartRate;
    private static generateAerobicExercises;
    private static generateResistanceExercises;
    private static generateFlexibilityExercises;
    private static generateBalanceExercises;
    private static getAerobicPrecautions;
    private static getAerobicContraindications;
    private static generateAerobicProgression;
    private static getResistancePrecautions;
    private static getResistanceContraindications;
    private static generateResistanceProgression;
    private static generateSafetyGuidelines;
    private static createProgressionPlan;
    private static determineMedicalSupervision;
    private static identifyContraindications;
    static checkExerciseClearance(healthAssessmentId: mongoose.Types.ObjectId): Promise<{
        cleared: boolean;
        reason?: string;
        recommendations: string[];
    }>;
    static getUserHealthAssessments(userId: mongoose.Types.ObjectId): Promise<IHealthAssessment[]>;
    static getHighRiskPatients(): Promise<IHealthAssessment[]>;
    static getPendingClearances(): Promise<IHealthAssessment[]>;
}
export default MedicalExercisePrescriptionService;
//# sourceMappingURL=medicalExercisePrescriptionService.d.ts.map