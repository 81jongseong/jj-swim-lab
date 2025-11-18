import mongoose, { Document } from 'mongoose';
export interface ISwimProgram extends Document {
    athleteId?: mongoose.Types.ObjectId;
    athleteName?: string;
    groupClassId?: mongoose.Types.ObjectId;
    groupClassName?: string;
    centerId?: mongoose.Types.ObjectId;
    programType: 'weekly' | 'race';
    programScope: 'individual' | 'group';
    params: {
        startDate: string;
        daysPerWeek: number;
        selectedDays: string[];
        sessionDuration: number;
        pool: number;
        mainStrokes: string[];
        excludedStrokes: string[];
        cssPer100: Record<string, number>;
        conditionIds: string[];
        goal: string;
    };
    content: {
        summary: string;
        planExplanation?: string;
        totalDuration: number;
        totalMeters: number;
        phases?: Array<{
            phase: 'base' | 'build' | 'peak' | 'taper';
            weekStart: number;
            weekEnd: number;
            focus: string;
            volumeTarget: number;
            intensityDistribution: {
                z1: number;
                z2: number;
                z3: number;
                z4: number;
                z5: number;
            };
            weeklyPlans: Array<any>;
        }>;
        feasibility?: any;
        phaseSummary?: any;
        recommendations?: string[];
        sessions: Array<{
            day: string;
            date?: string;
            themeDesc?: string;
            duration: number;
            distance: number;
            intensity: string;
            status?: 'scheduled' | 'postponed' | 'skipped';
            blocks: Array<{
                type: string;
                description: string;
                duration: number;
                distance: number;
                whyPace?: string;
                whyRest?: string;
                whySet?: string;
                evidenceKeys?: string[];
            }>;
            completion?: {
                completionRate: number;
                feeling: 'easy' | 'moderate' | 'hard' | 'very_hard';
                inputBy: mongoose.Types.ObjectId;
                inputByRole: 'self' | 'instructor';
                inputAt: Date;
                notes?: string;
                detailedSets?: Array<{
                    setIndex: number;
                    planned: {
                        distance: number;
                        reps: number;
                    };
                    actual: {
                        distance?: number;
                        reps?: number;
                        time?: number;
                        completed: boolean;
                    };
                }>;
            };
        }>;
    };
    usedMethodIds: string[];
    executionHistory: Array<{
        date: string;
        dayOfWeek: string;
        condition: 'very_good' | 'good' | 'normal' | 'tired' | 'very_tired';
        hasPain: boolean;
        rpe?: number;
        adjustedPace?: string;
        adjustedRest?: string;
        notes?: string;
        completed: boolean;
    }>;
    createdAt: Date;
    updatedAt: Date;
}
declare const SwimProgram: mongoose.Model<ISwimProgram, {}, {}, {}, mongoose.Document<unknown, {}, ISwimProgram> & ISwimProgram & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default SwimProgram;
//# sourceMappingURL=SwimProgram.d.ts.map