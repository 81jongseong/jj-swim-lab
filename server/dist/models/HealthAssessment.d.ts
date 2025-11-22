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
import mongoose, { Document } from 'mongoose';
export declare enum HealthRiskLevel {
    VERY_LOW = "very_low",
    LOW = "low",
    MODERATE = "moderate",
    HIGH = "high",
    VERY_HIGH = "very_high",
    CRITICAL = "critical"
}
export declare enum ChronicCondition {
    HYPERTENSION = "hypertension",
    DIABETES_TYPE1 = "diabetes_type1",
    DIABETES_TYPE2 = "diabetes_type2",
    HEART_DISEASE = "heart_disease",
    ARRHYTHMIA = "arrhythmia",
    ASTHMA = "asthma",
    COPD = "copd",
    ARTHRITIS = "arthritis",
    OSTEOPOROSIS = "osteoporosis",
    KIDNEY_DISEASE = "kidney_disease",
    THYROID_DISORDER = "thyroid_disorder",
    EPILEPSY = "epilepsy",
    DEPRESSION = "depression",
    ANXIETY = "anxiety"
}
export declare enum ExerciseRestriction {
    NO_HIGH_INTENSITY = "no_high_intensity",
    LIMITED_DURATION = "limited_duration",
    AVOID_BREATH_HOLDING = "avoid_breath_holding",
    NO_SUDDEN_MOVEMENTS = "no_sudden_movements",
    TEMPERATURE_SENSITIVE = "temperature_sensitive",
    MEDICATION_TIMING = "medication_timing",
    BLOOD_PRESSURE_MONITORING = "bp_monitoring",
    BLOOD_SUGAR_MONITORING = "bs_monitoring",
    HEART_RATE_MONITORING = "hr_monitoring",
    SUPERVISED_ONLY = "supervised_only"
}
export declare enum ExerciseRecommendationType {
    AEROBIC_LOW = "aerobic_low",
    AEROBIC_MODERATE = "aerobic_moderate",
    RESISTANCE_LIGHT = "resistance_light",
    FLEXIBILITY = "flexibility",
    BALANCE = "balance",
    BREATHING = "breathing",
    REHABILITATION = "rehabilitation",
    THERAPEUTIC = "therapeutic"
}
export interface IVitalSigns {
    date: Date;
    systolicBP: number;
    diastolicBP: number;
    restingHR: number;
    bloodGlucose?: number;
    weight: number;
    bodyFat?: number;
    temperature?: number;
    oxygenSaturation?: number;
    notes: string;
}
export interface IMedication {
    name: string;
    dosage: string;
    frequency: string;
    timing: string[];
    sideEffects: string[];
    exerciseImpact: string;
    precautions: string[];
}
export interface IMedicalHistory {
    condition: string;
    date: Date;
    severity: 'mild' | 'moderate' | 'severe';
    treatment: string;
    currentStatus: 'resolved' | 'ongoing' | 'monitoring';
    restrictions: string[];
}
export interface IExerciseRecommendation {
    type: ExerciseRecommendationType;
    intensity: number;
    duration: number;
    frequency: number;
    targetHR: {
        min: number;
        max: number;
    };
    specificExercises: {
        name: string;
        sets?: number;
        reps?: number;
        duration?: number;
        restTime?: number;
        modifications: string[];
    }[];
    precautions: string[];
    contraindications: string[];
    progressionPlan: {
        week: number;
        adjustments: string;
    }[];
}
export interface IHealthAssessment extends Document {
    userId: mongoose.Types.ObjectId;
    assessmentDate: Date;
    basicHealth: {
        age: number;
        gender: 'male' | 'female' | 'other';
        height: number;
        weight: number;
        bmi: number;
        smokingStatus: 'never' | 'former' | 'current';
        alcoholConsumption: 'none' | 'light' | 'moderate' | 'heavy';
        sleepHours: number;
        stressLevel: number;
        activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
    };
    vitalSigns: IVitalSigns[];
    chronicConditions: {
        condition: ChronicCondition;
        diagnosedDate: Date;
        severity: 'mild' | 'moderate' | 'severe';
        controlled: boolean;
        lastCheckup: Date;
        doctorNotes: string;
        medications: IMedication[];
    }[];
    medicalHistory: IMedicalHistory[];
    currentSymptoms: {
        symptom: string;
        severity: number;
        frequency: 'rarely' | 'sometimes' | 'often' | 'always';
        triggers: string[];
        duration: string;
    }[];
    physicalLimitations: {
        bodyPart: string;
        limitation: string;
        severity: 'mild' | 'moderate' | 'severe';
        cause: string;
        recommendations: string[];
    }[];
    exerciseRestrictions: ExerciseRestriction[];
    emergencyContact: {
        name: string;
        relationship: string;
        phone: string;
        email?: string;
    };
    medicalTeam: {
        doctorName: string;
        specialty: string;
        hospital: string;
        phone: string;
        email?: string;
        lastConsultation: Date;
        nextAppointment?: Date;
    }[];
    riskAssessment: {
        overallRisk: HealthRiskLevel;
        cardiovascularRisk: number;
        metabolicRisk: number;
        musculoskeletalRisk: number;
        respiratoryRisk: number;
        riskFactors: {
            factor: string;
            severity: number;
            modifiable: boolean;
        }[];
        clearanceRequired: boolean;
        clearanceObtained: boolean;
        clearanceDate?: Date;
        clearanceDoctor?: string;
    };
    exerciseRecommendations: IExerciseRecommendation[];
    monitoringPlan: {
        vitalSignsFrequency: 'daily' | 'weekly' | 'monthly';
        medicalCheckupFrequency: 'monthly' | 'quarterly' | 'biannually' | 'annually';
        parametersToMonitor: string[];
        alertThresholds: {
            parameter: string;
            minValue?: number;
            maxValue?: number;
            action: string;
        }[];
        reviewDate: Date;
    };
    assessedBy: mongoose.Types.ObjectId;
    reviewedBy?: mongoose.Types.ObjectId;
    approvedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    version: number;
}
export declare const HealthAssessment: mongoose.Model<IHealthAssessment, {}, {}, {}, mongoose.Document<unknown, {}, IHealthAssessment> & IHealthAssessment & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default HealthAssessment;
//# sourceMappingURL=HealthAssessment.d.ts.map