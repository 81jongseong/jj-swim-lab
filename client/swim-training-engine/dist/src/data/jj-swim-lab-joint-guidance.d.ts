import type { Stroke } from '../types';
export type SafetyLevel = 'safe' | 'caution' | 'avoid' | 'medical';
export interface MedicalCitation {
    id: string;
    citation: string;
    link: string;
    level: 'SR/MA' | 'RCT' | 'Cohort' | 'Case' | 'Expert';
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
    category: 'spine' | 'shoulder' | 'knee' | 'hip' | 'ankle' | 'wrist' | 'elbow' | 'muscle' | 'joint' | 'tendon';
    severity: 'mild' | 'moderate' | 'severe';
    description: string;
    swimmingGuidance: {
        freestyle?: StrokeGuidance;
        backstroke?: StrokeGuidance;
        breaststroke?: StrokeGuidance;
        butterfly?: StrokeGuidance;
        elementary_backstroke?: StrokeGuidance;
        sidestroke?: StrokeGuidance;
        [key: string]: StrokeGuidance | undefined;
    };
    exerciseRestrictions: {
        intensityReduction: number;
        durationLimit: number;
        frequencyLimit: number;
        contraindicatedExercises: string[];
        recommendedExercises: string[];
    };
}
export declare const EVIDENCE_BASED_SOURCES: Record<string, MedicalCitation>;
export declare const allJointConditions: JointConditionGuidance[];
//# sourceMappingURL=jj-swim-lab-joint-guidance.d.ts.map