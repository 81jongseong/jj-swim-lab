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
export declare const Progress: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    type: "progress" | "checklist" | "evaluation";
    student: mongoose.Types.ObjectId;
    instructor: mongoose.Types.ObjectId;
    isActive: boolean;
    status: "completed" | "pending" | "in_progress" | "overdue";
    lastUpdated: Date;
    course: mongoose.Types.ObjectId;
    priority: "high" | "medium" | "low";
    skills: {
        status: "completed" | "not_started" | "learning" | "needs_improvement";
        skillName: string;
        instructorNotes: string;
        practiceDrills: {
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }[];
        advice: string;
    }[];
    overallProgress: number;
    instructorComments: string;
    nextGoals: {
        goal?: string;
        targetDate?: Date;
    }[];
    checklistItems: {
        priority: "high" | "medium" | "low";
        isCompleted: boolean;
        description?: string;
        notes?: string;
        title?: string;
        dueDate?: Date;
        completedAt?: Date;
    }[];
    completedLessons: {
        completedAt?: Date;
        lessonName?: string;
        score?: number;
    }[];
    notes?: string;
    center?: mongoose.Types.ObjectId;
    dueDate?: Date;
    class?: mongoose.Types.ObjectId;
    evaluationDate?: Date;
    updatedBy?: mongoose.Types.ObjectId;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    type: "progress" | "checklist" | "evaluation";
    student: mongoose.Types.ObjectId;
    instructor: mongoose.Types.ObjectId;
    isActive: boolean;
    status: "completed" | "pending" | "in_progress" | "overdue";
    lastUpdated: Date;
    course: mongoose.Types.ObjectId;
    priority: "high" | "medium" | "low";
    skills: {
        status: "completed" | "not_started" | "learning" | "needs_improvement";
        skillName: string;
        instructorNotes: string;
        practiceDrills: {
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }[];
        advice: string;
    }[];
    overallProgress: number;
    instructorComments: string;
    nextGoals: {
        goal?: string;
        targetDate?: Date;
    }[];
    checklistItems: {
        priority: "high" | "medium" | "low";
        isCompleted: boolean;
        description?: string;
        notes?: string;
        title?: string;
        dueDate?: Date;
        completedAt?: Date;
    }[];
    completedLessons: {
        completedAt?: Date;
        lessonName?: string;
        score?: number;
    }[];
    notes?: string;
    center?: mongoose.Types.ObjectId;
    dueDate?: Date;
    class?: mongoose.Types.ObjectId;
    evaluationDate?: Date;
    updatedBy?: mongoose.Types.ObjectId;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    type: "progress" | "checklist" | "evaluation";
    student: mongoose.Types.ObjectId;
    instructor: mongoose.Types.ObjectId;
    isActive: boolean;
    status: "completed" | "pending" | "in_progress" | "overdue";
    lastUpdated: Date;
    course: mongoose.Types.ObjectId;
    priority: "high" | "medium" | "low";
    skills: {
        status: "completed" | "not_started" | "learning" | "needs_improvement";
        skillName: string;
        instructorNotes: string;
        practiceDrills: {
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }[];
        advice: string;
    }[];
    overallProgress: number;
    instructorComments: string;
    nextGoals: {
        goal?: string;
        targetDate?: Date;
    }[];
    checklistItems: {
        priority: "high" | "medium" | "low";
        isCompleted: boolean;
        description?: string;
        notes?: string;
        title?: string;
        dueDate?: Date;
        completedAt?: Date;
    }[];
    completedLessons: {
        completedAt?: Date;
        lessonName?: string;
        score?: number;
    }[];
    notes?: string;
    center?: mongoose.Types.ObjectId;
    dueDate?: Date;
    class?: mongoose.Types.ObjectId;
    evaluationDate?: Date;
    updatedBy?: mongoose.Types.ObjectId;
} & {
    _id: mongoose.Types.ObjectId;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    type: "progress" | "checklist" | "evaluation";
    student: mongoose.Types.ObjectId;
    instructor: mongoose.Types.ObjectId;
    isActive: boolean;
    status: "completed" | "pending" | "in_progress" | "overdue";
    lastUpdated: Date;
    course: mongoose.Types.ObjectId;
    priority: "high" | "medium" | "low";
    skills: {
        status: "completed" | "not_started" | "learning" | "needs_improvement";
        skillName: string;
        instructorNotes: string;
        practiceDrills: {
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }[];
        advice: string;
    }[];
    overallProgress: number;
    instructorComments: string;
    nextGoals: {
        goal?: string;
        targetDate?: Date;
    }[];
    checklistItems: {
        priority: "high" | "medium" | "low";
        isCompleted: boolean;
        description?: string;
        notes?: string;
        title?: string;
        dueDate?: Date;
        completedAt?: Date;
    }[];
    completedLessons: {
        completedAt?: Date;
        lessonName?: string;
        score?: number;
    }[];
    notes?: string;
    center?: mongoose.Types.ObjectId;
    dueDate?: Date;
    class?: mongoose.Types.ObjectId;
    evaluationDate?: Date;
    updatedBy?: mongoose.Types.ObjectId;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    type: "progress" | "checklist" | "evaluation";
    student: mongoose.Types.ObjectId;
    instructor: mongoose.Types.ObjectId;
    isActive: boolean;
    status: "completed" | "pending" | "in_progress" | "overdue";
    lastUpdated: Date;
    course: mongoose.Types.ObjectId;
    priority: "high" | "medium" | "low";
    skills: {
        status: "completed" | "not_started" | "learning" | "needs_improvement";
        skillName: string;
        instructorNotes: string;
        practiceDrills: {
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }[];
        advice: string;
    }[];
    overallProgress: number;
    instructorComments: string;
    nextGoals: {
        goal?: string;
        targetDate?: Date;
    }[];
    checklistItems: {
        priority: "high" | "medium" | "low";
        isCompleted: boolean;
        description?: string;
        notes?: string;
        title?: string;
        dueDate?: Date;
        completedAt?: Date;
    }[];
    completedLessons: {
        completedAt?: Date;
        lessonName?: string;
        score?: number;
    }[];
    notes?: string;
    center?: mongoose.Types.ObjectId;
    dueDate?: Date;
    class?: mongoose.Types.ObjectId;
    evaluationDate?: Date;
    updatedBy?: mongoose.Types.ObjectId;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    type: "progress" | "checklist" | "evaluation";
    student: mongoose.Types.ObjectId;
    instructor: mongoose.Types.ObjectId;
    isActive: boolean;
    status: "completed" | "pending" | "in_progress" | "overdue";
    lastUpdated: Date;
    course: mongoose.Types.ObjectId;
    priority: "high" | "medium" | "low";
    skills: {
        status: "completed" | "not_started" | "learning" | "needs_improvement";
        skillName: string;
        instructorNotes: string;
        practiceDrills: {
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }[];
        advice: string;
    }[];
    overallProgress: number;
    instructorComments: string;
    nextGoals: {
        goal?: string;
        targetDate?: Date;
    }[];
    checklistItems: {
        priority: "high" | "medium" | "low";
        isCompleted: boolean;
        description?: string;
        notes?: string;
        title?: string;
        dueDate?: Date;
        completedAt?: Date;
    }[];
    completedLessons: {
        completedAt?: Date;
        lessonName?: string;
        score?: number;
    }[];
    notes?: string;
    center?: mongoose.Types.ObjectId;
    dueDate?: Date;
    class?: mongoose.Types.ObjectId;
    evaluationDate?: Date;
    updatedBy?: mongoose.Types.ObjectId;
}> & {
    _id: mongoose.Types.ObjectId;
}>>;
//# sourceMappingURL=Progress.d.ts.map