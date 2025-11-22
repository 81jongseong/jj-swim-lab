import mongoose from 'mongoose';
interface UserPatternAnalysis {
    preferredTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'flexible';
    averageSessionDuration: number;
    preferredDaysOfWeek: number[];
    completionRate: number;
    intensityPreference: 'low' | 'moderate' | 'high' | 'varied';
    strokePreference: string[];
    consistencyScore: number;
    improvementTrend: 'improving' | 'stable' | 'declining';
    weeklyFrequency: number;
}
interface RoutineRecommendation {
    routineId: string;
    routineName: string;
    description: string;
    weeklySchedule: {
        dayOfWeek: number;
        recommendedTime: string;
        sessionDuration: number;
        intensity: 'low' | 'moderate' | 'high';
        focusArea: string;
        strokes: string[];
    }[];
    totalWeeklyDuration: number;
    totalWeeklyDistance: number;
    expectedCompletionRate: number;
    suitabilityScore: number;
    reasoning: string[];
    goals: string[];
    adaptations: {
        ifLowCompletion: string;
        ifHighCompletion: string;
        ifInjury: string;
        ifTimeLimited: string;
    };
    createdAt: Date;
}
export declare class AIRoutineRecommendationService {
    static analyzeUserPattern(userId: string | mongoose.Types.ObjectId): Promise<UserPatternAnalysis>;
    private static calculateImprovementTrend;
    private static determineIntensityPreference;
    static generateRoutineRecommendation(userId: string | mongoose.Types.ObjectId, goals?: string[]): Promise<RoutineRecommendation>;
    static generateMultipleRoutineOptions(userId: string | mongoose.Types.ObjectId, count?: number): Promise<RoutineRecommendation[]>;
}
export {};
//# sourceMappingURL=aiRoutineRecommendationService.d.ts.map