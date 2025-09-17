import mongoose from 'mongoose';
import { ITrainingPlan, TrainingIntensity, TrainingGoal, SwimmingStroke } from '../models/TrainingPlan';
export interface ITrainingPlanRequest {
    userId: mongoose.Types.ObjectId;
    userProfile: {
        currentLevel: TrainingIntensity;
        experience: number;
        age: number;
        weight: number;
        height: number;
        medicalConditions: string[];
        availableTime: number;
        preferredDays: number[];
        preferredTimes: string[];
    };
    goals: {
        primary: TrainingGoal;
        secondary: TrainingGoal[];
        targetDate: Date;
        specificTargets: {
            distance?: number;
            time?: number;
            stroke?: SwimmingStroke;
            competition?: string;
        };
    };
    currentAssessment: {
        technique: {
            freestyle: number;
            backstroke: number;
            breaststroke: number;
            butterfly: number;
        };
        endurance: number;
        speed: number;
        flexibility: number;
        strength: number;
    };
}
export declare class AITrainingPlanService {
    static generatePersonalizedPlan(request: ITrainingPlanRequest): Promise<ITrainingPlan>;
    private static analyzeUserProfile;
    private static calculateFitnessLevel;
    private static analyzeTimeConstraints;
    private static analyzePhysicalConstraints;
    private static getBMICategory;
    private static getAgeGroup;
    private static assessMotivationLevel;
    private static analyzeGoals;
    private static assessGoalDifficulty;
    private static analyzeCurrentSkills;
    private static findDominantStroke;
    private static performAIAnalysis;
    private static calculateRecommendedDuration;
    private static calculateSessionsPerWeek;
    private static generateIntensityProgression;
    private static identifyFocusAreas;
    private static identifyRiskFactors;
    private static predictOutcomes;
    private static generateWeeklyPlans;
    private static generateWeeklyGoal;
    private static generateWeeklySessions;
    private static generateSessionTitle;
    private static generateSessionDescription;
    private static calculateSessionDuration;
    private static generateWarmUp;
    private static generateMainSet;
    private static generateCoolDown;
    private static generateSessionFocus;
    private static generateEquipmentList;
    private static estimateCalories;
    private static calculateRestDays;
    private static generateExpectedImprovement;
    private static generateWeeklyFocus;
    private static generateWeeklyMilestones;
    private static generatePlanTitle;
    private static generatePlanDescription;
    private static generateProgressionStrategy;
    private static generateAdaptationRules;
    static adjustTrainingPlan(planId: mongoose.Types.ObjectId, performanceData: any): Promise<ITrainingPlan | null>;
    private static analyzePerformance;
    static getUserTrainingPlans(userId: mongoose.Types.ObjectId): Promise<ITrainingPlan[]>;
    static completeSession(planId: mongoose.Types.ObjectId, sessionData: {
        sessionId: number;
        completion: number;
        perceivedExertion: number;
        actualDuration: number;
        notes: string;
    }): Promise<ITrainingPlan | null>;
}
export default AITrainingPlanService;
//# sourceMappingURL=aiTrainingPlanService.d.ts.map