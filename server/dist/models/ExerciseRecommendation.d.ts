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
export interface IExerciseRecommendation extends Document {
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
declare const _default: mongoose.Model<IExerciseRecommendation, {}, {}, {}, mongoose.Document<unknown, {}, IExerciseRecommendation> & IExerciseRecommendation & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=ExerciseRecommendation.d.ts.map