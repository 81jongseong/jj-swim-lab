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
export declare const SkillTemplate: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    level: "beginner" | "intermediate" | "advanced";
    name: string;
    isActive: boolean;
    description: string;
    category: "freestyle" | "backstroke" | "breaststroke" | "butterfly" | "diving" | "turning" | "breathing" | "endurance" | "technique";
    practiceDrills: mongoose.Types.DocumentArray<{
        name: string;
        description: string;
        duration: number;
        difficulty: "medium" | "easy" | "hard";
        youtubeUrl?: string;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        name: string;
        description: string;
        duration: number;
        difficulty: "medium" | "easy" | "hard";
        youtubeUrl?: string;
    }> & {
        name: string;
        description: string;
        duration: number;
        difficulty: "medium" | "easy" | "hard";
        youtubeUrl?: string;
    }>;
    createdBy: mongoose.Types.ObjectId;
    commonIssues: mongoose.Types.DocumentArray<{
        issue: string;
        solution: string;
        practiceDrill?: string;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        issue: string;
        solution: string;
        practiceDrill?: string;
    }> & {
        issue: string;
        solution: string;
        practiceDrill?: string;
    }>;
    prerequisites: mongoose.Types.ObjectId[];
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    level: "beginner" | "intermediate" | "advanced";
    name: string;
    isActive: boolean;
    description: string;
    category: "freestyle" | "backstroke" | "breaststroke" | "butterfly" | "diving" | "turning" | "breathing" | "endurance" | "technique";
    practiceDrills: mongoose.Types.DocumentArray<{
        name: string;
        description: string;
        duration: number;
        difficulty: "medium" | "easy" | "hard";
        youtubeUrl?: string;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        name: string;
        description: string;
        duration: number;
        difficulty: "medium" | "easy" | "hard";
        youtubeUrl?: string;
    }> & {
        name: string;
        description: string;
        duration: number;
        difficulty: "medium" | "easy" | "hard";
        youtubeUrl?: string;
    }>;
    createdBy: mongoose.Types.ObjectId;
    commonIssues: mongoose.Types.DocumentArray<{
        issue: string;
        solution: string;
        practiceDrill?: string;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        issue: string;
        solution: string;
        practiceDrill?: string;
    }> & {
        issue: string;
        solution: string;
        practiceDrill?: string;
    }>;
    prerequisites: mongoose.Types.ObjectId[];
}, {}, {
    timestamps: true;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    level: "beginner" | "intermediate" | "advanced";
    name: string;
    isActive: boolean;
    description: string;
    category: "freestyle" | "backstroke" | "breaststroke" | "butterfly" | "diving" | "turning" | "breathing" | "endurance" | "technique";
    practiceDrills: mongoose.Types.DocumentArray<{
        name: string;
        description: string;
        duration: number;
        difficulty: "medium" | "easy" | "hard";
        youtubeUrl?: string;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        name: string;
        description: string;
        duration: number;
        difficulty: "medium" | "easy" | "hard";
        youtubeUrl?: string;
    }> & {
        name: string;
        description: string;
        duration: number;
        difficulty: "medium" | "easy" | "hard";
        youtubeUrl?: string;
    }>;
    createdBy: mongoose.Types.ObjectId;
    commonIssues: mongoose.Types.DocumentArray<{
        issue: string;
        solution: string;
        practiceDrill?: string;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        issue: string;
        solution: string;
        practiceDrill?: string;
    }> & {
        issue: string;
        solution: string;
        practiceDrill?: string;
    }>;
    prerequisites: mongoose.Types.ObjectId[];
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    level: "beginner" | "intermediate" | "advanced";
    name: string;
    isActive: boolean;
    description: string;
    category: "freestyle" | "backstroke" | "breaststroke" | "butterfly" | "diving" | "turning" | "breathing" | "endurance" | "technique";
    practiceDrills: mongoose.Types.DocumentArray<{
        name: string;
        description: string;
        duration: number;
        difficulty: "medium" | "easy" | "hard";
        youtubeUrl?: string;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        name: string;
        description: string;
        duration: number;
        difficulty: "medium" | "easy" | "hard";
        youtubeUrl?: string;
    }> & {
        name: string;
        description: string;
        duration: number;
        difficulty: "medium" | "easy" | "hard";
        youtubeUrl?: string;
    }>;
    createdBy: mongoose.Types.ObjectId;
    commonIssues: mongoose.Types.DocumentArray<{
        issue: string;
        solution: string;
        practiceDrill?: string;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        issue: string;
        solution: string;
        practiceDrill?: string;
    }> & {
        issue: string;
        solution: string;
        practiceDrill?: string;
    }>;
    prerequisites: mongoose.Types.ObjectId[];
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    level: "beginner" | "intermediate" | "advanced";
    name: string;
    isActive: boolean;
    description: string;
    category: "freestyle" | "backstroke" | "breaststroke" | "butterfly" | "diving" | "turning" | "breathing" | "endurance" | "technique";
    practiceDrills: mongoose.Types.DocumentArray<{
        name: string;
        description: string;
        duration: number;
        difficulty: "medium" | "easy" | "hard";
        youtubeUrl?: string;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        name: string;
        description: string;
        duration: number;
        difficulty: "medium" | "easy" | "hard";
        youtubeUrl?: string;
    }> & {
        name: string;
        description: string;
        duration: number;
        difficulty: "medium" | "easy" | "hard";
        youtubeUrl?: string;
    }>;
    createdBy: mongoose.Types.ObjectId;
    commonIssues: mongoose.Types.DocumentArray<{
        issue: string;
        solution: string;
        practiceDrill?: string;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        issue: string;
        solution: string;
        practiceDrill?: string;
    }> & {
        issue: string;
        solution: string;
        practiceDrill?: string;
    }>;
    prerequisites: mongoose.Types.ObjectId[];
}>, {}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    level: "beginner" | "intermediate" | "advanced";
    name: string;
    isActive: boolean;
    description: string;
    category: "freestyle" | "backstroke" | "breaststroke" | "butterfly" | "diving" | "turning" | "breathing" | "endurance" | "technique";
    practiceDrills: mongoose.Types.DocumentArray<{
        name: string;
        description: string;
        duration: number;
        difficulty: "medium" | "easy" | "hard";
        youtubeUrl?: string;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        name: string;
        description: string;
        duration: number;
        difficulty: "medium" | "easy" | "hard";
        youtubeUrl?: string;
    }> & {
        name: string;
        description: string;
        duration: number;
        difficulty: "medium" | "easy" | "hard";
        youtubeUrl?: string;
    }>;
    createdBy: mongoose.Types.ObjectId;
    commonIssues: mongoose.Types.DocumentArray<{
        issue: string;
        solution: string;
        practiceDrill?: string;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        issue: string;
        solution: string;
        practiceDrill?: string;
    }> & {
        issue: string;
        solution: string;
        practiceDrill?: string;
    }>;
    prerequisites: mongoose.Types.ObjectId[];
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
//# sourceMappingURL=SkillTemplate.d.ts.map