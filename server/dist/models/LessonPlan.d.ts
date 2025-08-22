import mongoose from 'mongoose';
declare const _default: mongoose.Model<{
    level: "고급" | "초급" | "중급";
    createdAt: NativeDate;
    updatedAt: NativeDate;
    isActive: boolean;
    description: string;
    duration: number;
    title: string;
    createdBy: mongoose.Types.ObjectId;
    stroke: "자유형" | "평영" | "배영" | "접영" | "혼영";
    objectives: string[];
    activities: mongoose.Types.DocumentArray<{
        materials: string[];
        name?: string;
        description?: string;
        duration?: number;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        materials: string[];
        name?: string;
        description?: string;
        duration?: number;
    }> & {
        materials: string[];
        name?: string;
        description?: string;
        duration?: number;
    }>;
    notes?: string;
    assessment?: string;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    level: "고급" | "초급" | "중급";
    createdAt: NativeDate;
    updatedAt: NativeDate;
    isActive: boolean;
    description: string;
    duration: number;
    title: string;
    createdBy: mongoose.Types.ObjectId;
    stroke: "자유형" | "평영" | "배영" | "접영" | "혼영";
    objectives: string[];
    activities: mongoose.Types.DocumentArray<{
        materials: string[];
        name?: string;
        description?: string;
        duration?: number;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        materials: string[];
        name?: string;
        description?: string;
        duration?: number;
    }> & {
        materials: string[];
        name?: string;
        description?: string;
        duration?: number;
    }>;
    notes?: string;
    assessment?: string;
}, {}, mongoose.DefaultSchemaOptions> & {
    level: "고급" | "초급" | "중급";
    createdAt: NativeDate;
    updatedAt: NativeDate;
    isActive: boolean;
    description: string;
    duration: number;
    title: string;
    createdBy: mongoose.Types.ObjectId;
    stroke: "자유형" | "평영" | "배영" | "접영" | "혼영";
    objectives: string[];
    activities: mongoose.Types.DocumentArray<{
        materials: string[];
        name?: string;
        description?: string;
        duration?: number;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        materials: string[];
        name?: string;
        description?: string;
        duration?: number;
    }> & {
        materials: string[];
        name?: string;
        description?: string;
        duration?: number;
    }>;
    notes?: string;
    assessment?: string;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    level: "고급" | "초급" | "중급";
    createdAt: NativeDate;
    updatedAt: NativeDate;
    isActive: boolean;
    description: string;
    duration: number;
    title: string;
    createdBy: mongoose.Types.ObjectId;
    stroke: "자유형" | "평영" | "배영" | "접영" | "혼영";
    objectives: string[];
    activities: mongoose.Types.DocumentArray<{
        materials: string[];
        name?: string;
        description?: string;
        duration?: number;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        materials: string[];
        name?: string;
        description?: string;
        duration?: number;
    }> & {
        materials: string[];
        name?: string;
        description?: string;
        duration?: number;
    }>;
    notes?: string;
    assessment?: string;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    level: "고급" | "초급" | "중급";
    createdAt: NativeDate;
    updatedAt: NativeDate;
    isActive: boolean;
    description: string;
    duration: number;
    title: string;
    createdBy: mongoose.Types.ObjectId;
    stroke: "자유형" | "평영" | "배영" | "접영" | "혼영";
    objectives: string[];
    activities: mongoose.Types.DocumentArray<{
        materials: string[];
        name?: string;
        description?: string;
        duration?: number;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        materials: string[];
        name?: string;
        description?: string;
        duration?: number;
    }> & {
        materials: string[];
        name?: string;
        description?: string;
        duration?: number;
    }>;
    notes?: string;
    assessment?: string;
}>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<{
    level: "고급" | "초급" | "중급";
    createdAt: NativeDate;
    updatedAt: NativeDate;
    isActive: boolean;
    description: string;
    duration: number;
    title: string;
    createdBy: mongoose.Types.ObjectId;
    stroke: "자유형" | "평영" | "배영" | "접영" | "혼영";
    objectives: string[];
    activities: mongoose.Types.DocumentArray<{
        materials: string[];
        name?: string;
        description?: string;
        duration?: number;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        materials: string[];
        name?: string;
        description?: string;
        duration?: number;
    }> & {
        materials: string[];
        name?: string;
        description?: string;
        duration?: number;
    }>;
    notes?: string;
    assessment?: string;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default _default;
//# sourceMappingURL=LessonPlan.d.ts.map