/**
 * 🏊‍♂️ JJ Swim Lab - 건강 규칙 및 안전 게이트
 *
 * 📋 **기능:**
 * - 건강 플래그 기반 안전 제한
 * - 관절 28질환 룰 적용
 * - 특수상황별 제한사항
 * - 의학적 근거 기반 안전 규칙
 */
import { HealthFlags, SafetyRule, MedicalEvidence } from './types';
export declare const JOINT_SAFETY_RULES: Record<string, SafetyRule>;
export declare const HEALTH_SAFETY_RULES: Record<string, SafetyRule>;
export declare const MEDICAL_EVIDENCE: MedicalEvidence[];
/**
 * 건강 플래그 기반 안전 제한 적용
 */
export declare function getSafetyCaps(health: HealthFlags): {
    maxIntensity: number;
    restrictedMethods: string[];
    restrictedDrills: string[];
    modifications: string[];
};
/**
 * 관절 질환별 안전 규칙 조회
 */
export declare function getJointSafetyRule(condition: string): SafetyRule | null;
/**
 * 건강 플래그별 안전 규칙 조회
 */
export declare function getHealthSafetyRule(condition: string): SafetyRule | null;
/**
 * 의학적 근거 조회
 */
export declare function getMedicalEvidence(level?: 'SR/MA' | 'RCT' | 'CPG' | 'EXP'): MedicalEvidence[];
//# sourceMappingURL=health_rules.d.ts.map