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
import mongoose from 'mongoose';
export declare const SkillTemplate: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    level: "beginner" | "intermediate" | "advanced";
    isActive: boolean;
    description: string;
    category: "technique" | "freestyle" | "backstroke" | "breaststroke" | "butterfly" | "diving" | "endurance" | "breathing" | "turning";
    practiceDrills: {
        name: string;
        description: string;
        duration: number;
        difficulty: "medium" | "easy" | "hard";
        youtubeUrl?: string;
    }[];
    createdBy: mongoose.Types.ObjectId;
    prerequisites: mongoose.Types.ObjectId[];
    commonIssues: {
        issue: string;
        solution: string;
        practiceDrill?: string;
    }[];
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    level: "beginner" | "intermediate" | "advanced";
    isActive: boolean;
    description: string;
    category: "technique" | "freestyle" | "backstroke" | "breaststroke" | "butterfly" | "diving" | "endurance" | "breathing" | "turning";
    practiceDrills: {
        name: string;
        description: string;
        duration: number;
        difficulty: "medium" | "easy" | "hard";
        youtubeUrl?: string;
    }[];
    createdBy: mongoose.Types.ObjectId;
    prerequisites: mongoose.Types.ObjectId[];
    commonIssues: {
        issue: string;
        solution: string;
        practiceDrill?: string;
    }[];
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    level: "beginner" | "intermediate" | "advanced";
    isActive: boolean;
    description: string;
    category: "technique" | "freestyle" | "backstroke" | "breaststroke" | "butterfly" | "diving" | "endurance" | "breathing" | "turning";
    practiceDrills: {
        name: string;
        description: string;
        duration: number;
        difficulty: "medium" | "easy" | "hard";
        youtubeUrl?: string;
    }[];
    createdBy: mongoose.Types.ObjectId;
    prerequisites: mongoose.Types.ObjectId[];
    commonIssues: {
        issue: string;
        solution: string;
        practiceDrill?: string;
    }[];
} & {
    _id: mongoose.Types.ObjectId;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    level: "beginner" | "intermediate" | "advanced";
    isActive: boolean;
    description: string;
    category: "technique" | "freestyle" | "backstroke" | "breaststroke" | "butterfly" | "diving" | "endurance" | "breathing" | "turning";
    practiceDrills: {
        name: string;
        description: string;
        duration: number;
        difficulty: "medium" | "easy" | "hard";
        youtubeUrl?: string;
    }[];
    createdBy: mongoose.Types.ObjectId;
    prerequisites: mongoose.Types.ObjectId[];
    commonIssues: {
        issue: string;
        solution: string;
        practiceDrill?: string;
    }[];
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    level: "beginner" | "intermediate" | "advanced";
    isActive: boolean;
    description: string;
    category: "technique" | "freestyle" | "backstroke" | "breaststroke" | "butterfly" | "diving" | "endurance" | "breathing" | "turning";
    practiceDrills: {
        name: string;
        description: string;
        duration: number;
        difficulty: "medium" | "easy" | "hard";
        youtubeUrl?: string;
    }[];
    createdBy: mongoose.Types.ObjectId;
    prerequisites: mongoose.Types.ObjectId[];
    commonIssues: {
        issue: string;
        solution: string;
        practiceDrill?: string;
    }[];
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    level: "beginner" | "intermediate" | "advanced";
    isActive: boolean;
    description: string;
    category: "technique" | "freestyle" | "backstroke" | "breaststroke" | "butterfly" | "diving" | "endurance" | "breathing" | "turning";
    practiceDrills: {
        name: string;
        description: string;
        duration: number;
        difficulty: "medium" | "easy" | "hard";
        youtubeUrl?: string;
    }[];
    createdBy: mongoose.Types.ObjectId;
    prerequisites: mongoose.Types.ObjectId[];
    commonIssues: {
        issue: string;
        solution: string;
        practiceDrill?: string;
    }[];
}> & {
    _id: mongoose.Types.ObjectId;
}>>;
//# sourceMappingURL=SkillTemplate.d.ts.map