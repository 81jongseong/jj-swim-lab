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
export interface IExercise {
    name: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    duration: number;
    repetitions?: number;
    sets?: number;
    equipment: string[];
    instructions: string[];
    benefits: string[];
    precautions: string[];
}
export interface IWorkoutPlan {
    name: string;
    description: string;
    totalDuration: number;
    exercises: {
        exerciseName: string;
        duration: number;
        order: number;
    }[];
    frequency: number;
    progression: any;
}
export interface IExerciseRecommendationComplex extends Document {
    technique: string;
    level: string;
    category: 'posture' | 'breathing' | 'movement' | 'efficiency';
    exercises: IExercise[];
    workoutPlan: IWorkoutPlan[];
    isActive: boolean;
    createdBy: mongoose.Types.ObjectId;
    centerId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export interface IExerciseRecommendation {
    id: string;
    name: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    category: string;
    duration: number;
    equipment?: string[];
    instructions: string[];
    benefits: string[];
}
declare const _default: mongoose.Model<IExerciseRecommendation, {}, {}, {}, mongoose.Document<unknown, {}, IExerciseRecommendation> & IExerciseRecommendation & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=ExerciseRecommendation.d.ts.map