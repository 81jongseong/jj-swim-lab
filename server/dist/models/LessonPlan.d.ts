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
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/inferschematype" />
/// <reference types="mongoose/types/inferrawdoctype" />
import mongoose from 'mongoose';
export declare const LessonPlan: mongoose.Model<{
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
//# sourceMappingURL=LessonPlan.d.ts.map