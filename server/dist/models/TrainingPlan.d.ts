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
export declare enum TrainingIntensity {
    BEGINNER = "beginner",
    INTERMEDIATE = "intermediate",
    ADVANCED = "advanced",
    PROFESSIONAL = "professional"
}
export declare enum TrainingGoal {
    FITNESS = "fitness",
    TECHNIQUE = "technique",
    SPEED = "speed",
    ENDURANCE = "endurance",
    COMPETITION = "competition",
    REHABILITATION = "rehabilitation"
}
export declare enum SwimmingStroke {
    FREESTYLE = "freestyle",
    BACKSTROKE = "backstroke",
    BREASTSTROKE = "breaststroke",
    BUTTERFLY = "butterfly",
    MEDLEY = "medley"
}
export interface ITrainingSession {
    sessionNumber: number;
    title: string;
    description: string;
    duration: number;
    warmUp: {
        exercises: string[];
        duration: number;
    };
    mainSet: {
        exercises: string[];
        sets: number;
        reps: number;
        restTime: number;
        intensity: number;
    };
    coolDown: {
        exercises: string[];
        duration: number;
    };
    focusAreas: string[];
    equipment: string[];
    calories: number;
    difficulty: number;
}
export interface IWeeklyPlan {
    week: number;
    goal: string;
    sessions: ITrainingSession[];
    restDays: number[];
    progressMetrics: {
        expectedImprovement: string;
        keyFocus: string[];
        milestones: string[];
    };
}
export interface ITrainingPlan extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    description: string;
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
        overallScore: number;
    };
    planDetails: {
        duration: number;
        sessionsPerWeek: number;
        totalSessions: number;
        weeklyPlans: IWeeklyPlan[];
        progressionStrategy: string;
        adaptationRules: string[];
    };
    progress: {
        currentWeek: number;
        currentSession: number;
        completedSessions: number;
        totalSessions: number;
        adherenceRate: number;
        performanceMetrics: {
            date: Date;
            sessionId: number;
            completion: number;
            perceivedExertion: number;
            actualDuration: number;
            notes: string;
        }[];
    };
    aiAnalysis: {
        lastAnalysisDate: Date;
        performanceTrend: 'improving' | 'stable' | 'declining';
        recommendedAdjustments: string[];
        riskFactors: string[];
        strengthAreas: string[];
        improvementAreas: string[];
        nextReviewDate: Date;
    };
    createdBy: 'ai' | 'instructor';
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    version: number;
}
export declare const TrainingPlan: mongoose.Model<ITrainingPlan, {}, {}, {}, mongoose.Document<unknown, {}, ITrainingPlan> & ITrainingPlan & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default TrainingPlan;
//# sourceMappingURL=TrainingPlan.d.ts.map