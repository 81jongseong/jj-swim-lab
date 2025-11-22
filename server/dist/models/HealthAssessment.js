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
exports.HealthAssessment = exports.ExerciseRecommendationType = exports.ExerciseRestriction = exports.ChronicCondition = exports.HealthRiskLevel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var HealthRiskLevel;
(function (HealthRiskLevel) {
    HealthRiskLevel["VERY_LOW"] = "very_low";
    HealthRiskLevel["LOW"] = "low";
    HealthRiskLevel["MODERATE"] = "moderate";
    HealthRiskLevel["HIGH"] = "high";
    HealthRiskLevel["VERY_HIGH"] = "very_high";
    HealthRiskLevel["CRITICAL"] = "critical";
})(HealthRiskLevel || (exports.HealthRiskLevel = HealthRiskLevel = {}));
var ChronicCondition;
(function (ChronicCondition) {
    ChronicCondition["HYPERTENSION"] = "hypertension";
    ChronicCondition["DIABETES_TYPE1"] = "diabetes_type1";
    ChronicCondition["DIABETES_TYPE2"] = "diabetes_type2";
    ChronicCondition["HEART_DISEASE"] = "heart_disease";
    ChronicCondition["ARRHYTHMIA"] = "arrhythmia";
    ChronicCondition["ASTHMA"] = "asthma";
    ChronicCondition["COPD"] = "copd";
    ChronicCondition["ARTHRITIS"] = "arthritis";
    ChronicCondition["OSTEOPOROSIS"] = "osteoporosis";
    ChronicCondition["KIDNEY_DISEASE"] = "kidney_disease";
    ChronicCondition["THYROID_DISORDER"] = "thyroid_disorder";
    ChronicCondition["EPILEPSY"] = "epilepsy";
    ChronicCondition["DEPRESSION"] = "depression";
    ChronicCondition["ANXIETY"] = "anxiety";
})(ChronicCondition || (exports.ChronicCondition = ChronicCondition = {}));
var ExerciseRestriction;
(function (ExerciseRestriction) {
    ExerciseRestriction["NO_HIGH_INTENSITY"] = "no_high_intensity";
    ExerciseRestriction["LIMITED_DURATION"] = "limited_duration";
    ExerciseRestriction["AVOID_BREATH_HOLDING"] = "avoid_breath_holding";
    ExerciseRestriction["NO_SUDDEN_MOVEMENTS"] = "no_sudden_movements";
    ExerciseRestriction["TEMPERATURE_SENSITIVE"] = "temperature_sensitive";
    ExerciseRestriction["MEDICATION_TIMING"] = "medication_timing";
    ExerciseRestriction["BLOOD_PRESSURE_MONITORING"] = "bp_monitoring";
    ExerciseRestriction["BLOOD_SUGAR_MONITORING"] = "bs_monitoring";
    ExerciseRestriction["HEART_RATE_MONITORING"] = "hr_monitoring";
    ExerciseRestriction["SUPERVISED_ONLY"] = "supervised_only";
})(ExerciseRestriction || (exports.ExerciseRestriction = ExerciseRestriction = {}));
var ExerciseRecommendationType;
(function (ExerciseRecommendationType) {
    ExerciseRecommendationType["AEROBIC_LOW"] = "aerobic_low";
    ExerciseRecommendationType["AEROBIC_MODERATE"] = "aerobic_moderate";
    ExerciseRecommendationType["RESISTANCE_LIGHT"] = "resistance_light";
    ExerciseRecommendationType["FLEXIBILITY"] = "flexibility";
    ExerciseRecommendationType["BALANCE"] = "balance";
    ExerciseRecommendationType["BREATHING"] = "breathing";
    ExerciseRecommendationType["REHABILITATION"] = "rehabilitation";
    ExerciseRecommendationType["THERAPEUTIC"] = "therapeutic";
})(ExerciseRecommendationType || (exports.ExerciseRecommendationType = ExerciseRecommendationType = {}));
const vitalSignsSchema = new mongoose_1.Schema({
    date: { type: Date, required: true },
    systolicBP: { type: Number, required: true, min: 70, max: 250 },
    diastolicBP: { type: Number, required: true, min: 40, max: 150 },
    restingHR: { type: Number, required: true, min: 30, max: 200 },
    bloodGlucose: { type: Number, min: 50, max: 500 },
    weight: { type: Number, required: true, min: 20, max: 300 },
    bodyFat: { type: Number, min: 3, max: 50 },
    temperature: { type: Number, min: 35, max: 42 },
    oxygenSaturation: { type: Number, min: 70, max: 100 },
    notes: { type: String, default: '' }
});
const medicationSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, required: true },
    timing: [{ type: String }],
    sideEffects: [{ type: String }],
    exerciseImpact: { type: String, required: true },
    precautions: [{ type: String }]
});
const medicalHistorySchema = new mongoose_1.Schema({
    condition: { type: String, required: true },
    date: { type: Date, required: true },
    severity: {
        type: String,
        enum: ['mild', 'moderate', 'severe'],
        required: true
    },
    treatment: { type: String, required: true },
    currentStatus: {
        type: String,
        enum: ['resolved', 'ongoing', 'monitoring'],
        required: true
    },
    restrictions: [{ type: String }]
});
const healthAssessmentSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assessmentDate: { type: Date, default: Date.now },
    basicHealth: {
        age: { type: Number, required: true, min: 5, max: 120 },
        gender: {
            type: String,
            enum: ['male', 'female', 'other'],
            required: true
        },
        height: { type: Number, required: true, min: 100, max: 250 },
        weight: { type: Number, required: true, min: 20, max: 300 },
        bmi: { type: Number, required: true, min: 10, max: 60 },
        smokingStatus: {
            type: String,
            enum: ['never', 'former', 'current'],
            required: true
        },
        alcoholConsumption: {
            type: String,
            enum: ['none', 'light', 'moderate', 'heavy'],
            required: true
        },
        sleepHours: { type: Number, required: true, min: 3, max: 12 },
        stressLevel: { type: Number, required: true, min: 1, max: 10 },
        activityLevel: {
            type: String,
            enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active'],
            required: true
        }
    },
    vitalSigns: [vitalSignsSchema],
    chronicConditions: [{
            condition: {
                type: String,
                enum: Object.values(ChronicCondition),
                required: true
            },
            diagnosedDate: { type: Date, required: true },
            severity: {
                type: String,
                enum: ['mild', 'moderate', 'severe'],
                required: true
            },
            controlled: { type: Boolean, required: true },
            lastCheckup: { type: Date, required: true },
            doctorNotes: { type: String, default: '' },
            medications: [medicationSchema]
        }],
    medicalHistory: [medicalHistorySchema],
    currentSymptoms: [{
            symptom: { type: String, required: true },
            severity: { type: Number, required: true, min: 1, max: 10 },
            frequency: {
                type: String,
                enum: ['rarely', 'sometimes', 'often', 'always'],
                required: true
            },
            triggers: [{ type: String }],
            duration: { type: String, required: true }
        }],
    physicalLimitations: [{
            bodyPart: { type: String, required: true },
            limitation: { type: String, required: true },
            severity: {
                type: String,
                enum: ['mild', 'moderate', 'severe'],
                required: true
            },
            cause: { type: String, required: true },
            recommendations: [{ type: String }]
        }],
    exerciseRestrictions: [{
            type: String,
            enum: Object.values(ExerciseRestriction)
        }],
    emergencyContact: {
        name: { type: String, required: true },
        relationship: { type: String, required: true },
        phone: { type: String, required: true },
        email: { type: String }
    },
    medicalTeam: [{
            doctorName: { type: String, required: true },
            specialty: { type: String, required: true },
            hospital: { type: String, required: true },
            phone: { type: String, required: true },
            email: { type: String },
            lastConsultation: { type: Date, required: true },
            nextAppointment: { type: Date }
        }],
    riskAssessment: {
        overallRisk: {
            type: String,
            enum: Object.values(HealthRiskLevel),
            required: true
        },
        cardiovascularRisk: { type: Number, required: true, min: 0, max: 100 },
        metabolicRisk: { type: Number, required: true, min: 0, max: 100 },
        musculoskeletalRisk: { type: Number, required: true, min: 0, max: 100 },
        respiratoryRisk: { type: Number, required: true, min: 0, max: 100 },
        riskFactors: [{
                factor: { type: String, required: true },
                severity: { type: Number, required: true, min: 1, max: 10 },
                modifiable: { type: Boolean, required: true }
            }],
        clearanceRequired: { type: Boolean, default: false },
        clearanceObtained: { type: Boolean, default: false },
        clearanceDate: { type: Date },
        clearanceDoctor: { type: String }
    },
    exerciseRecommendations: [{
            type: {
                type: String,
                enum: Object.values(ExerciseRecommendationType),
                required: true
            },
            intensity: { type: Number, required: true, min: 1, max: 10 },
            duration: { type: Number, required: true, min: 5, max: 120 },
            frequency: { type: Number, required: true, min: 1, max: 7 },
            targetHR: {
                min: { type: Number, required: true, min: 50, max: 220 },
                max: { type: Number, required: true, min: 50, max: 220 }
            },
            specificExercises: [{
                    name: { type: String, required: true },
                    sets: { type: Number, min: 1, max: 10 },
                    reps: { type: Number, min: 1, max: 100 },
                    duration: { type: Number, min: 1, max: 60 },
                    restTime: { type: Number, min: 10, max: 300 },
                    modifications: [{ type: String }]
                }],
            precautions: [{ type: String }],
            contraindications: [{ type: String }],
            progressionPlan: [{
                    week: { type: Number, required: true, min: 1, max: 52 },
                    adjustments: { type: String, required: true }
                }]
        }],
    monitoringPlan: {
        vitalSignsFrequency: {
            type: String,
            enum: ['daily', 'weekly', 'monthly'],
            required: true
        },
        medicalCheckupFrequency: {
            type: String,
            enum: ['monthly', 'quarterly', 'biannually', 'annually'],
            required: true
        },
        parametersToMonitor: [{ type: String }],
        alertThresholds: [{
                parameter: { type: String, required: true },
                minValue: { type: Number },
                maxValue: { type: Number },
                action: { type: String, required: true }
            }],
        reviewDate: { type: Date, required: true }
    },
    assessedBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reviewedBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    version: { type: Number, default: 1 }
});
healthAssessmentSchema.index({ userId: 1, assessmentDate: -1 });
healthAssessmentSchema.index({ 'riskAssessment.overallRisk': 1 });
healthAssessmentSchema.index({ 'riskAssessment.clearanceRequired': 1 });
healthAssessmentSchema.index({ 'monitoringPlan.reviewDate': 1 });
healthAssessmentSchema.index({ isActive: 1 });
healthAssessmentSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    if (this.basicHealth.height && this.basicHealth.weight) {
        const heightInMeters = this.basicHealth.height / 100;
        this.basicHealth.bmi = Number((this.basicHealth.weight / (heightInMeters * heightInMeters)).toFixed(1));
    }
    next();
});
healthAssessmentSchema.statics.getHighRiskPatients = async function () {
    return await this.find({
        isActive: true,
        'riskAssessment.overallRisk': { $in: [HealthRiskLevel.HIGH, HealthRiskLevel.VERY_HIGH, HealthRiskLevel.CRITICAL] }
    })
        .populate('userId', 'name email phone')
        .sort({ 'riskAssessment.cardiovascularRisk': -1 });
};
healthAssessmentSchema.statics.getPendingClearances = async function () {
    return await this.find({
        isActive: true,
        'riskAssessment.clearanceRequired': true,
        'riskAssessment.clearanceObtained': false
    })
        .populate('userId', 'name email phone')
        .populate('assessedBy', 'name email')
        .sort({ assessmentDate: -1 });
};
healthAssessmentSchema.statics.getHealthStatistics = async function () {
    return await this.aggregate([
        { $match: { isActive: true } },
        {
            $group: {
                _id: '$riskAssessment.overallRisk',
                count: { $sum: 1 },
                avgAge: { $avg: '$basicHealth.age' },
                avgBMI: { $avg: '$basicHealth.bmi' }
            }
        },
        { $sort: { count: -1 } }
    ]);
};
healthAssessmentSchema.methods.recalculateRisk = function () {
    const avgRisk = (this.riskAssessment.cardiovascularRisk +
        this.riskAssessment.metabolicRisk +
        this.riskAssessment.musculoskeletalRisk +
        this.riskAssessment.respiratoryRisk) / 4;
    if (avgRisk >= 80)
        return HealthRiskLevel.CRITICAL;
    if (avgRisk >= 65)
        return HealthRiskLevel.VERY_HIGH;
    if (avgRisk >= 50)
        return HealthRiskLevel.HIGH;
    if (avgRisk >= 35)
        return HealthRiskLevel.MODERATE;
    if (avgRisk >= 20)
        return HealthRiskLevel.LOW;
    return HealthRiskLevel.VERY_LOW;
};
healthAssessmentSchema.methods.requiresMedicalClearance = function () {
    return this.riskAssessment.overallRisk === HealthRiskLevel.HIGH ||
        this.riskAssessment.overallRisk === HealthRiskLevel.VERY_HIGH ||
        this.riskAssessment.overallRisk === HealthRiskLevel.CRITICAL ||
        this.chronicConditions.some((c) => [ChronicCondition.HEART_DISEASE, ChronicCondition.DIABETES_TYPE1].includes(c.condition));
};
healthAssessmentSchema.methods.getLatestVitalSigns = function () {
    if (this.vitalSigns.length === 0)
        return null;
    return this.vitalSigns.sort((a, b) => b.date.getTime() - a.date.getTime())[0];
};
exports.HealthAssessment = mongoose_1.default.model('HealthAssessment', healthAssessmentSchema);
exports.default = exports.HealthAssessment;
//# sourceMappingURL=HealthAssessment.js.map