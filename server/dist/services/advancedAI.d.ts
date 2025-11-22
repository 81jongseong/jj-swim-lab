export interface SwimmingPoseAnalysis {
    timestamp: Date;
    userId: string;
    strokeType: 'freestyle' | 'backstroke' | 'breaststroke' | 'butterfly';
    bodyParts: {
        head: PosePoint3D;
        shoulders: {
            left: PosePoint3D;
            right: PosePoint3D;
        };
        arms: {
            left: ArmAnalysis;
            right: ArmAnalysis;
        };
        torso: TorsoAnalysis;
        legs: {
            left: LegAnalysis;
            right: LegAnalysis;
        };
    };
    analysis: {
        technique: TechniqueScore;
        efficiency: EfficiencyScore;
        rhythm: RhythmAnalysis;
        breathing: BreathingAnalysis;
    };
    recommendations: Recommendation[];
    overallScore: number;
}
export interface PosePoint3D {
    x: number;
    y: number;
    z: number;
    confidence: number;
}
export interface ArmAnalysis {
    strokePhase: 'catch' | 'pull' | 'push' | 'recovery';
    angle: number;
    velocity: number;
    power: number;
    efficiency: number;
    issues: string[];
}
export interface TorsoAnalysis {
    rotation: number;
    stability: number;
    alignment: number;
    coreEngagement: number;
}
export interface LegAnalysis {
    kickPhase: 'downkick' | 'upkick' | 'glide';
    frequency: number;
    amplitude: number;
    timing: number;
    coordination: number;
}
export interface TechniqueScore {
    overall: number;
    armTechnique: number;
    legTechnique: number;
    bodyPosition: number;
    timing: number;
    details: {
        strengths: string[];
        weaknesses: string[];
        criticalIssues: string[];
    };
}
export interface EfficiencyScore {
    overall: number;
    energyWaste: number;
    propulsionEfficiency: number;
    dragReduction: number;
    strokeLength: number;
    strokeRate: number;
}
export interface RhythmAnalysis {
    consistency: number;
    strokeTiming: number;
    breathingTiming: number;
    kickTiming: number;
    synchronization: number;
}
export interface BreathingAnalysis {
    frequency: number;
    timing: number;
    headPosition: number;
    efficiency: number;
    issues: string[];
}
export interface Recommendation {
    type: 'technique' | 'training' | 'conditioning' | 'mental';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    specificExercises: Exercise[];
    expectedImprovement: number;
    timeframe: string;
}
export interface Exercise {
    name: string;
    description: string;
    duration: string;
    repetitions?: number;
    focusAreas: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
}
export interface LearningPattern {
    userId: string;
    analysisDate: Date;
    learningStyle: 'visual' | 'kinesthetic' | 'auditory' | 'mixed';
    progressRate: number;
    strongAreas: string[];
    challengingAreas: string[];
    motivationFactors: string[];
    optimalTrainingTime: string;
    attentionSpan: number;
    retentionRate: number;
    preferredFeedbackType: 'immediate' | 'delayed' | 'summary';
}
export interface InjuryRiskAssessment {
    userId: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    riskFactors: RiskFactor[];
    preventionRecommendations: string[];
    monitoringPoints: string[];
    nextAssessment: Date;
}
export interface RiskFactor {
    factor: string;
    severity: number;
    description: string;
    prevention: string[];
}
export declare class AdvancedAIService {
    private static instance;
    static getInstance(): AdvancedAIService;
    analyzeSwimmingPose(videoData: Buffer, userId: string, strokeType: string): Promise<SwimmingPoseAnalysis>;
    analyzeLearningPattern(userId: string): Promise<LearningPattern>;
    assessInjuryRisk(userId: string, poseAnalysis: SwimmingPoseAnalysis): Promise<InjuryRiskAssessment>;
    generatePersonalizedTrainingPlan(userId: string, learningPattern: LearningPattern, currentLevel: string): Promise<TrainingPlan>;
    private extractBasicPose;
    private calculate3DPose;
    private analyzeStrokeSpecific;
    private analyzeTechnique;
    private analyzeEfficiency;
    private analyzeRhythm;
    private analyzeBreathing;
    private generateRecommendations;
    private calculateOverallScore;
    private getLearningHistory;
    private determineLearningStyle;
    private calculateProgressRate;
    private analyzeSkillAreas;
    private analyzeMotivationFactors;
    private findOptimalTrainingTime;
    private calculateAttentionSpan;
    private calculateRetentionRate;
    private determinePreferredFeedbackType;
    private analyzePostureRisks;
    private analyzeRepetitiveMotionRisks;
    private analyzeFatigueRisks;
    private calculateOverallRiskLevel;
    private generatePreventionRecommendations;
    private setMonitoringPoints;
    private setPersonalizedGoals;
    private determineTrainingApproach;
    private generateWeeklyPlans;
    private setAssessmentCriteria;
}
interface TrainingPlan {
    userId: string;
    createdDate: Date;
    duration: string;
    goals: any;
    trainingApproach: string;
    weeklyPlans: any[];
    assessmentCriteria: any;
    adaptiveAdjustments: boolean;
}
export default AdvancedAIService;
//# sourceMappingURL=advancedAI.d.ts.map