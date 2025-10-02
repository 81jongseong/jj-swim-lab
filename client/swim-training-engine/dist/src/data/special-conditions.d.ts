/**
 * 특수 상황별 수영 가이드라인
 *
 * 연동되는 데이터:
 * - 임신부 수영 가이드라인
 * - 수술후 재활 가이드라인
 * - 특수 상황별 운동 제한사항
 *
 * 연동되는 파일:
 * - /swim-training-engine/ (수영 트레이닝 규칙 엔진)
 * - /data/joint-conditions.ts (관절질환 가이드라인)
 */
export type SpecialCondition = 'pregnancy' | 'post_joint_surgery' | 'post_gynecological_surgery' | 'post_cardiac_surgery' | 'post_spinal_surgery';
export type PregnancyTrimester = 'first' | 'second' | 'third';
export type SurgeryRecoveryStage = 'acute' | 'subacute' | 'chronic';
export interface SpecialConditionGuidance {
    conditionId: string;
    conditionName: string;
    category: SpecialCondition;
    severity: 'mild' | 'moderate' | 'severe';
    swimmingGuidance: {
        freestyle: StrokeGuidance;
        backstroke: StrokeGuidance;
        breaststroke: StrokeGuidance;
        butterfly: StrokeGuidance;
        elementary_backstroke: StrokeGuidance;
        sidestroke: StrokeGuidance;
    };
    exerciseRestrictions: {
        intensityReduction: number;
        durationLimit: number;
        frequencyLimit: number;
        contraindicatedExercises: string[];
        recommendedExercises: string[];
    };
    medicalEvidence: MedicalCitation[];
    specialConsiderations: string[];
}
export interface StrokeGuidance {
    level: 'safe' | 'caution' | 'avoid';
    reason: string;
    allowedMovements: string[];
    prohibitedMovements: string[];
    modifications: string[];
    alternatives: string[];
    medicalEvidence: MedicalCitation[];
    detailedExplanation: string;
}
export interface MedicalCitation {
    id: string;
    citation: string;
    link: string;
    level: 'SR/MA' | 'RCT' | 'CPG' | 'Observational' | 'Expert';
    keyFindings: string;
}
export declare const SPECIAL_CONDITIONS_EVIDENCE: Record<string, MedicalCitation>;
export declare const specialConditionsData: SpecialConditionGuidance[];
export declare function generateSpecialConditionPlan(condition: SpecialCondition, stage: PregnancyTrimester | SurgeryRecoveryStage, baseHealthData: any): any;
//# sourceMappingURL=special-conditions.d.ts.map