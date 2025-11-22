import mongoose, { Document } from 'mongoose';
export interface IExercisePrescription extends Document {
    userId: mongoose.Types.ObjectId;
    centerId?: mongoose.Types.ObjectId;
    instructorId?: mongoose.Types.ObjectId;
    healthGrade: {
        obesityGrade: 'normal' | 'overweight' | 'obesity1' | 'obesity2' | 'obesity3';
        cardiovascularGrade: 'low' | 'moderate' | 'high' | 'very_high';
        fitnessGrade: 'beginner' | 'intermediate' | 'advanced';
        ageGrade: 'young' | 'middle' | 'senior';
        overallGrade: 'A' | 'B' | 'C' | 'D' | 'E';
    };
    currentPrescription: {
        sessionDuration: number;
        totalDistance: number;
        targetHeartRate: {
            min: number;
            max: number;
            optimal: number;
        };
        recommendedExercises: {
            warmUp: {
                duration: number;
                intensity: string;
            };
            mainExercise: {
                duration: number;
                intensity: string;
                sets?: number;
            };
            coolDown: {
                duration: number;
                intensity: string;
            };
        };
        weeklyFrequency: number;
        progressionPlan: {
            currentWeek: number;
            totalWeeks: number;
            weeklyIncrease: number;
        };
        safetyGuidelines: string[];
        contraindications: string[];
    };
    prescriptionInfo: {
        createdBy: 'system' | 'instructor' | 'center_admin' | 'user';
        createdByUserId?: mongoose.Types.ObjectId;
        creationReason: string;
        baseHealthData: any;
        algorithmVersion: string;
    };
    adjustmentHistory: Array<{
        adjustmentId: string;
        date: Date;
        type: 'increase' | 'maintain' | 'decrease';
        amount: number;
        reason: string[];
        confidence: number;
        adjustedBy: 'system' | 'instructor' | 'center_admin' | 'user';
        adjustedByUserId?: mongoose.Types.ObjectId;
        previousPrescription: any;
        newPrescription: any;
    }>;
    exerciseHistory: Array<{
        sessionId: string;
        date: Date;
        prescribedExercise: any;
        actualPerformance: {
            duration: number;
            distance: number;
            averageHeartRate: number;
            maxHeartRate: number;
            perceivedExertion: number;
            completionRate: number;
        };
        feedback: {
            difficulty: 'too_easy' | 'appropriate' | 'too_hard';
            fatigue: 'low' | 'moderate' | 'high';
            enjoyment: 'low' | 'moderate' | 'high';
            instructorNotes?: string;
        };
        nextAdjustment: {
            intensityChange: number;
            durationChange: number;
            reason: string;
        };
    }>;
    status: {
        isActive: boolean;
        lastUpdated: Date;
        nextReviewDate: Date;
        totalSessions: number;
        averageCompletionRate: number;
        currentStreak: number;
        longestStreak: number;
    };
    createdAt: Date;
    updatedAt: Date;
}
export declare const ExercisePrescription: mongoose.Model<IExercisePrescription, {}, {}, {}, mongoose.Document<unknown, {}, IExercisePrescription> & IExercisePrescription & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=ExercisePrescription.d.ts.map