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