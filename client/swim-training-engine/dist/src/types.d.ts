export type Sex = 'M' | 'F';
export type SwimLevel = 'beginner' | 'intermediate' | 'advanced';
export type Category = 'spine' | 'shoulder' | 'knee' | 'ankle' | 'wrist' | 'elbow' | 'hip';
export type Stroke = 'freestyle' | 'backstroke' | 'breaststroke' | 'butterfly' | 'elementary_backstroke' | 'sidestroke';
export type SafetyLevel = 'safe' | 'caution' | 'avoid';
export type EvidenceLevel = 'SR/MA' | 'RCT' | 'CPG' | 'Observational' | 'Expert';
export interface MedicalCitation {
    id: string;
    citation: string;
    link: string;
    level: EvidenceLevel;
    keyFindings: string;
}
export interface StrokeGuidance {
    level: SafetyLevel;
    reason: string;
    allowedMovements: string[];
    prohibitedMovements: string[];
    modifications: string[];
    alternatives: Stroke[];
    medicalEvidence: MedicalCitation[];
    detailedExplanation: string;
}
export interface JointConditionGuidance {
    conditionId: string;
    conditionName: string;
    category: Category;
    severity: 'mild' | 'moderate' | 'severe';
    swimmingGuidance: Record<Stroke, StrokeGuidance>;
    exerciseRestrictions: {
        intensityReduction: number;
        durationLimit: number;
        frequencyLimit: number;
        contraindicatedExercises: string[];
        recommendedExercises: string[];
    };
}
export interface HealthInput {
    demographics: {
        age: number;
        sex: Sex;
    };
    anthropometrics: {
        height_cm: number;
        weight_kg: number;
        waist_cm?: number;
        bmi?: number;
    };
    vitals: {
        rest_hr?: number;
        rest_bp?: {
            sbp: number;
            dbp: number;
        };
        meds?: string[];
        on_beta_blocker?: boolean;
    };
    labs?: {
        tc?: number;
        ldl?: number;
        hdl?: number;
        tg?: number;
        fpg?: number;
        hba1c?: number;
        egfr?: number;
    };
    conditions: {
        obesity: 'normal' | 'overweight' | 'obesity';
        hypertension: 'normal' | 'elevated' | 'stage1' | 'stage2';
        dyslipidemia: boolean;
        diabetes: boolean;
    };
    orthopedics: string[];
    swim_profile: {
        level: SwimLevel;
        swim_hr_peak_land?: number | null;
        rpe_tolerance?: string;
        grade?: string;
        preferredPace?: number;
        poolDistance?: number;
        poolType?: 'standard_25m' | 'standard_50m' | 'custom';
    };
    goals: string[];
    adherence_last_week: number;
    symptoms_flags: string[];
    specialConditions?: {
        pregnancy?: {
            isPregnant: boolean;
            trimester: string;
        };
        postSurgery?: {
            hasSurgery: boolean;
            surgeryType: string;
            recoveryStage: string;
        };
    };
}
export interface StrokeBlock {
    stroke: Stroke;
    block: string;
    distance?: number;
    duration?: number;
    pace?: number;
}
export interface SessionPlan {
    day: string;
    focus: string[];
    stroke_plan: StrokeBlock[];
    constraints: string[];
    intensity_cues: {
        primary: string;
        secondary?: string;
    };
    stop_rules: string[];
    totalDistance: number;
    totalDuration: number;
    averagePace: number;
    intensity: number;
}
export interface PlanOutput {
    microcycle_week: number;
    weekly_target_min: number;
    weekly_target_distance: number;
    medical_clearance_required: boolean;
    sessions: SessionPlan[];
    strength_days: number;
    next_week_adjustment: 'progress_+5%' | 'progress_+10%' | 'maintain' | 'deload_-10%' | 'deload_-20%';
    notes: string[];
    exercisePrescription: {
        totalDuration: number;
        totalDistance: number;
        averagePace: number;
        intensity: number;
        grade: string;
    };
}
//# sourceMappingURL=types.d.ts.map