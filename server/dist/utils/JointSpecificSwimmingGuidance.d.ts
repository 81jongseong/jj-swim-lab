export interface JointCondition {
    joint: 'spine' | 'shoulder' | 'knee' | 'ankle' | 'wrist' | 'elbow';
    condition: string;
    severity: 'mild' | 'moderate' | 'severe';
    description: string;
    medicalEvidence: string[];
}
export interface SwimmingSafety {
    stroke: 'freestyle' | 'backstroke' | 'breaststroke' | 'butterfly' | 'sidestroke' | 'elementary_backstroke';
    safetyLevel: 'safe' | 'caution' | 'avoid' | 'prohibited';
    reason: string;
    modifications?: string[];
    alternativeStrokes?: string[];
}
export interface JointSwimmingGuidance {
    joint: string;
    conditions: {
        [conditionName: string]: {
            condition: JointCondition;
            swimmingGuidance: {
                [stroke: string]: SwimmingSafety;
            };
            generalRecommendations: string[];
            contraindications: string[];
            rehabilitationTips: string[];
        };
    };
}
export declare class JointSpecificSwimmingGuidance {
    static getSpineGuidance(): JointSwimmingGuidance;
    static getShoulderGuidance(): JointSwimmingGuidance;
    static getKneeGuidance(): JointSwimmingGuidance;
    static getAllJointGuidance(): {
        [joint: string]: JointSwimmingGuidance;
    };
    static getSwimmingGuidanceForCondition(joint: string, condition: string): {
        condition: JointCondition;
        swimmingGuidance: {
            [stroke: string]: SwimmingSafety;
        };
        generalRecommendations: string[];
        contraindications: string[];
        rehabilitationTips: string[];
    } | null;
    static getRecommendedStrokes(joint: string, condition: string): string[];
    static getProhibitedStrokes(joint: string, condition: string): string[];
}
//# sourceMappingURL=JointSpecificSwimmingGuidance.d.ts.map