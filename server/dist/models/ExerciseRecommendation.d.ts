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
    frequency?: number | string;
}
export declare const ExerciseSchema: mongoose.Schema<IExercise, mongoose.Model<IExercise, any, any, any, mongoose.Document<unknown, any, IExercise> & IExercise & {
    _id: mongoose.Types.ObjectId;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, IExercise, mongoose.Document<unknown, {}, mongoose.FlatRecord<IExercise>> & mongoose.FlatRecord<IExercise> & {
    _id: mongoose.Types.ObjectId;
}>;
export declare const WorkoutPlanSchema: mongoose.Schema<IWorkoutPlan, mongoose.Model<IWorkoutPlan, any, any, any, mongoose.Document<unknown, any, IWorkoutPlan> & IWorkoutPlan & {
    _id: mongoose.Types.ObjectId;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, IWorkoutPlan, mongoose.Document<unknown, {}, mongoose.FlatRecord<IWorkoutPlan>> & mongoose.FlatRecord<IWorkoutPlan> & {
    _id: mongoose.Types.ObjectId;
}>;
declare const _default: mongoose.Model<IExerciseRecommendation, {}, {}, {}, mongoose.Document<unknown, {}, IExerciseRecommendation> & IExerciseRecommendation & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=ExerciseRecommendation.d.ts.map