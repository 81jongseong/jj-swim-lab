import mongoose from 'mongoose';
export declare const LessonPlan: mongoose.Model<{
    level: "고급" | "초급" | "중급";
    isActive: boolean;
    title: string;
    description: string;
    duration: number;
    createdAt: Date;
    updatedAt: Date;
    createdBy: mongoose.Types.ObjectId;
    stroke: "자유형" | "배영" | "평영" | "접영" | "혼영";
    objectives: string[];
    activities: {
        materials: string[];
        name?: string;
        description?: string;
        duration?: number;
    }[];
    notes?: string;
    assessment?: string;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    level: "고급" | "초급" | "중급";
    isActive: boolean;
    title: string;
    description: string;
    duration: number;
    createdAt: Date;
    updatedAt: Date;
    createdBy: mongoose.Types.ObjectId;
    stroke: "자유형" | "배영" | "평영" | "접영" | "혼영";
    objectives: string[];
    activities: {
        materials: string[];
        name?: string;
        description?: string;
        duration?: number;
    }[];
    notes?: string;
    assessment?: string;
}> & {
    level: "고급" | "초급" | "중급";
    isActive: boolean;
    title: string;
    description: string;
    duration: number;
    createdAt: Date;
    updatedAt: Date;
    createdBy: mongoose.Types.ObjectId;
    stroke: "자유형" | "배영" | "평영" | "접영" | "혼영";
    objectives: string[];
    activities: {
        materials: string[];
        name?: string;
        description?: string;
        duration?: number;
    }[];
    notes?: string;
    assessment?: string;
} & {
    _id: mongoose.Types.ObjectId;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    level: "고급" | "초급" | "중급";
    isActive: boolean;
    title: string;
    description: string;
    duration: number;
    createdAt: Date;
    updatedAt: Date;
    createdBy: mongoose.Types.ObjectId;
    stroke: "자유형" | "배영" | "평영" | "접영" | "혼영";
    objectives: string[];
    activities: {
        materials: string[];
        name?: string;
        description?: string;
        duration?: number;
    }[];
    notes?: string;
    assessment?: string;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    level: "고급" | "초급" | "중급";
    isActive: boolean;
    title: string;
    description: string;
    duration: number;
    createdAt: Date;
    updatedAt: Date;
    createdBy: mongoose.Types.ObjectId;
    stroke: "자유형" | "배영" | "평영" | "접영" | "혼영";
    objectives: string[];
    activities: {
        materials: string[];
        name?: string;
        description?: string;
        duration?: number;
    }[];
    notes?: string;
    assessment?: string;
}>> & mongoose.FlatRecord<{
    level: "고급" | "초급" | "중급";
    isActive: boolean;
    title: string;
    description: string;
    duration: number;
    createdAt: Date;
    updatedAt: Date;
    createdBy: mongoose.Types.ObjectId;
    stroke: "자유형" | "배영" | "평영" | "접영" | "혼영";
    objectives: string[];
    activities: {
        materials: string[];
        name?: string;
        description?: string;
        duration?: number;
    }[];
    notes?: string;
    assessment?: string;
}> & {
    _id: mongoose.Types.ObjectId;
}>>;
//# sourceMappingURL=LessonPlan.d.ts.map