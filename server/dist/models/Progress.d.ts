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
export declare const Progress: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    type: "progress" | "checklist" | "evaluation";
    student: mongoose.Types.ObjectId;
    instructor: mongoose.Types.ObjectId;
    isActive: boolean;
    status: "completed" | "pending" | "in_progress" | "overdue";
    lastUpdated: NativeDate;
    course: mongoose.Types.ObjectId;
    priority: "high" | "medium" | "low";
    skills: mongoose.Types.DocumentArray<{
        status: "completed" | "not_started" | "learning" | "needs_improvement";
        skillName: string;
        instructorNotes: string;
        practiceDrills: mongoose.Types.DocumentArray<{
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }> & {
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }>;
        advice: string;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        status: "completed" | "not_started" | "learning" | "needs_improvement";
        skillName: string;
        instructorNotes: string;
        practiceDrills: mongoose.Types.DocumentArray<{
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }> & {
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }>;
        advice: string;
    }> & {
        status: "completed" | "not_started" | "learning" | "needs_improvement";
        skillName: string;
        instructorNotes: string;
        practiceDrills: mongoose.Types.DocumentArray<{
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }> & {
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }>;
        advice: string;
    }>;
    overallProgress: number;
    instructorComments: string;
    nextGoals: mongoose.Types.DocumentArray<{
        goal?: string;
        targetDate?: NativeDate;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        goal?: string;
        targetDate?: NativeDate;
    }> & {
        goal?: string;
        targetDate?: NativeDate;
    }>;
    checklistItems: mongoose.Types.DocumentArray<{
        priority: "high" | "medium" | "low";
        isCompleted: boolean;
        description?: string;
        notes?: string;
        title?: string;
        dueDate?: NativeDate;
        completedAt?: NativeDate;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        priority: "high" | "medium" | "low";
        isCompleted: boolean;
        description?: string;
        notes?: string;
        title?: string;
        dueDate?: NativeDate;
        completedAt?: NativeDate;
    }> & {
        priority: "high" | "medium" | "low";
        isCompleted: boolean;
        description?: string;
        notes?: string;
        title?: string;
        dueDate?: NativeDate;
        completedAt?: NativeDate;
    }>;
    completedLessons: mongoose.Types.DocumentArray<{
        completedAt?: NativeDate;
        lessonName?: string;
        score?: number;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        completedAt?: NativeDate;
        lessonName?: string;
        score?: number;
    }> & {
        completedAt?: NativeDate;
        lessonName?: string;
        score?: number;
    }>;
    notes?: string;
    center?: mongoose.Types.ObjectId;
    dueDate?: NativeDate;
    class?: mongoose.Types.ObjectId;
    evaluationDate?: NativeDate;
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
    lastUpdated: NativeDate;
    course: mongoose.Types.ObjectId;
    priority: "high" | "medium" | "low";
    skills: mongoose.Types.DocumentArray<{
        status: "completed" | "not_started" | "learning" | "needs_improvement";
        skillName: string;
        instructorNotes: string;
        practiceDrills: mongoose.Types.DocumentArray<{
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }> & {
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }>;
        advice: string;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        status: "completed" | "not_started" | "learning" | "needs_improvement";
        skillName: string;
        instructorNotes: string;
        practiceDrills: mongoose.Types.DocumentArray<{
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }> & {
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }>;
        advice: string;
    }> & {
        status: "completed" | "not_started" | "learning" | "needs_improvement";
        skillName: string;
        instructorNotes: string;
        practiceDrills: mongoose.Types.DocumentArray<{
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }> & {
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }>;
        advice: string;
    }>;
    overallProgress: number;
    instructorComments: string;
    nextGoals: mongoose.Types.DocumentArray<{
        goal?: string;
        targetDate?: NativeDate;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        goal?: string;
        targetDate?: NativeDate;
    }> & {
        goal?: string;
        targetDate?: NativeDate;
    }>;
    checklistItems: mongoose.Types.DocumentArray<{
        priority: "high" | "medium" | "low";
        isCompleted: boolean;
        description?: string;
        notes?: string;
        title?: string;
        dueDate?: NativeDate;
        completedAt?: NativeDate;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        priority: "high" | "medium" | "low";
        isCompleted: boolean;
        description?: string;
        notes?: string;
        title?: string;
        dueDate?: NativeDate;
        completedAt?: NativeDate;
    }> & {
        priority: "high" | "medium" | "low";
        isCompleted: boolean;
        description?: string;
        notes?: string;
        title?: string;
        dueDate?: NativeDate;
        completedAt?: NativeDate;
    }>;
    completedLessons: mongoose.Types.DocumentArray<{
        completedAt?: NativeDate;
        lessonName?: string;
        score?: number;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        completedAt?: NativeDate;
        lessonName?: string;
        score?: number;
    }> & {
        completedAt?: NativeDate;
        lessonName?: string;
        score?: number;
    }>;
    notes?: string;
    center?: mongoose.Types.ObjectId;
    dueDate?: NativeDate;
    class?: mongoose.Types.ObjectId;
    evaluationDate?: NativeDate;
    updatedBy?: mongoose.Types.ObjectId;
}, {}, {
    timestamps: true;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    type: "progress" | "checklist" | "evaluation";
    student: mongoose.Types.ObjectId;
    instructor: mongoose.Types.ObjectId;
    isActive: boolean;
    status: "completed" | "pending" | "in_progress" | "overdue";
    lastUpdated: NativeDate;
    course: mongoose.Types.ObjectId;
    priority: "high" | "medium" | "low";
    skills: mongoose.Types.DocumentArray<{
        status: "completed" | "not_started" | "learning" | "needs_improvement";
        skillName: string;
        instructorNotes: string;
        practiceDrills: mongoose.Types.DocumentArray<{
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }> & {
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }>;
        advice: string;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        status: "completed" | "not_started" | "learning" | "needs_improvement";
        skillName: string;
        instructorNotes: string;
        practiceDrills: mongoose.Types.DocumentArray<{
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }> & {
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }>;
        advice: string;
    }> & {
        status: "completed" | "not_started" | "learning" | "needs_improvement";
        skillName: string;
        instructorNotes: string;
        practiceDrills: mongoose.Types.DocumentArray<{
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }> & {
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }>;
        advice: string;
    }>;
    overallProgress: number;
    instructorComments: string;
    nextGoals: mongoose.Types.DocumentArray<{
        goal?: string;
        targetDate?: NativeDate;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        goal?: string;
        targetDate?: NativeDate;
    }> & {
        goal?: string;
        targetDate?: NativeDate;
    }>;
    checklistItems: mongoose.Types.DocumentArray<{
        priority: "high" | "medium" | "low";
        isCompleted: boolean;
        description?: string;
        notes?: string;
        title?: string;
        dueDate?: NativeDate;
        completedAt?: NativeDate;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        priority: "high" | "medium" | "low";
        isCompleted: boolean;
        description?: string;
        notes?: string;
        title?: string;
        dueDate?: NativeDate;
        completedAt?: NativeDate;
    }> & {
        priority: "high" | "medium" | "low";
        isCompleted: boolean;
        description?: string;
        notes?: string;
        title?: string;
        dueDate?: NativeDate;
        completedAt?: NativeDate;
    }>;
    completedLessons: mongoose.Types.DocumentArray<{
        completedAt?: NativeDate;
        lessonName?: string;
        score?: number;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        completedAt?: NativeDate;
        lessonName?: string;
        score?: number;
    }> & {
        completedAt?: NativeDate;
        lessonName?: string;
        score?: number;
    }>;
    notes?: string;
    center?: mongoose.Types.ObjectId;
    dueDate?: NativeDate;
    class?: mongoose.Types.ObjectId;
    evaluationDate?: NativeDate;
    updatedBy?: mongoose.Types.ObjectId;
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
    type: "progress" | "checklist" | "evaluation";
    student: mongoose.Types.ObjectId;
    instructor: mongoose.Types.ObjectId;
    isActive: boolean;
    status: "completed" | "pending" | "in_progress" | "overdue";
    lastUpdated: NativeDate;
    course: mongoose.Types.ObjectId;
    priority: "high" | "medium" | "low";
    skills: mongoose.Types.DocumentArray<{
        status: "completed" | "not_started" | "learning" | "needs_improvement";
        skillName: string;
        instructorNotes: string;
        practiceDrills: mongoose.Types.DocumentArray<{
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }> & {
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }>;
        advice: string;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        status: "completed" | "not_started" | "learning" | "needs_improvement";
        skillName: string;
        instructorNotes: string;
        practiceDrills: mongoose.Types.DocumentArray<{
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }> & {
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }>;
        advice: string;
    }> & {
        status: "completed" | "not_started" | "learning" | "needs_improvement";
        skillName: string;
        instructorNotes: string;
        practiceDrills: mongoose.Types.DocumentArray<{
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }> & {
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }>;
        advice: string;
    }>;
    overallProgress: number;
    instructorComments: string;
    nextGoals: mongoose.Types.DocumentArray<{
        goal?: string;
        targetDate?: NativeDate;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        goal?: string;
        targetDate?: NativeDate;
    }> & {
        goal?: string;
        targetDate?: NativeDate;
    }>;
    checklistItems: mongoose.Types.DocumentArray<{
        priority: "high" | "medium" | "low";
        isCompleted: boolean;
        description?: string;
        notes?: string;
        title?: string;
        dueDate?: NativeDate;
        completedAt?: NativeDate;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        priority: "high" | "medium" | "low";
        isCompleted: boolean;
        description?: string;
        notes?: string;
        title?: string;
        dueDate?: NativeDate;
        completedAt?: NativeDate;
    }> & {
        priority: "high" | "medium" | "low";
        isCompleted: boolean;
        description?: string;
        notes?: string;
        title?: string;
        dueDate?: NativeDate;
        completedAt?: NativeDate;
    }>;
    completedLessons: mongoose.Types.DocumentArray<{
        completedAt?: NativeDate;
        lessonName?: string;
        score?: number;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        completedAt?: NativeDate;
        lessonName?: string;
        score?: number;
    }> & {
        completedAt?: NativeDate;
        lessonName?: string;
        score?: number;
    }>;
    notes?: string;
    center?: mongoose.Types.ObjectId;
    dueDate?: NativeDate;
    class?: mongoose.Types.ObjectId;
    evaluationDate?: NativeDate;
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
    lastUpdated: NativeDate;
    course: mongoose.Types.ObjectId;
    priority: "high" | "medium" | "low";
    skills: mongoose.Types.DocumentArray<{
        status: "completed" | "not_started" | "learning" | "needs_improvement";
        skillName: string;
        instructorNotes: string;
        practiceDrills: mongoose.Types.DocumentArray<{
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }> & {
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }>;
        advice: string;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        status: "completed" | "not_started" | "learning" | "needs_improvement";
        skillName: string;
        instructorNotes: string;
        practiceDrills: mongoose.Types.DocumentArray<{
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }> & {
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }>;
        advice: string;
    }> & {
        status: "completed" | "not_started" | "learning" | "needs_improvement";
        skillName: string;
        instructorNotes: string;
        practiceDrills: mongoose.Types.DocumentArray<{
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }> & {
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }>;
        advice: string;
    }>;
    overallProgress: number;
    instructorComments: string;
    nextGoals: mongoose.Types.DocumentArray<{
        goal?: string;
        targetDate?: NativeDate;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        goal?: string;
        targetDate?: NativeDate;
    }> & {
        goal?: string;
        targetDate?: NativeDate;
    }>;
    checklistItems: mongoose.Types.DocumentArray<{
        priority: "high" | "medium" | "low";
        isCompleted: boolean;
        description?: string;
        notes?: string;
        title?: string;
        dueDate?: NativeDate;
        completedAt?: NativeDate;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        priority: "high" | "medium" | "low";
        isCompleted: boolean;
        description?: string;
        notes?: string;
        title?: string;
        dueDate?: NativeDate;
        completedAt?: NativeDate;
    }> & {
        priority: "high" | "medium" | "low";
        isCompleted: boolean;
        description?: string;
        notes?: string;
        title?: string;
        dueDate?: NativeDate;
        completedAt?: NativeDate;
    }>;
    completedLessons: mongoose.Types.DocumentArray<{
        completedAt?: NativeDate;
        lessonName?: string;
        score?: number;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        completedAt?: NativeDate;
        lessonName?: string;
        score?: number;
    }> & {
        completedAt?: NativeDate;
        lessonName?: string;
        score?: number;
    }>;
    notes?: string;
    center?: mongoose.Types.ObjectId;
    dueDate?: NativeDate;
    class?: mongoose.Types.ObjectId;
    evaluationDate?: NativeDate;
    updatedBy?: mongoose.Types.ObjectId;
}>, {}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    type: "progress" | "checklist" | "evaluation";
    student: mongoose.Types.ObjectId;
    instructor: mongoose.Types.ObjectId;
    isActive: boolean;
    status: "completed" | "pending" | "in_progress" | "overdue";
    lastUpdated: NativeDate;
    course: mongoose.Types.ObjectId;
    priority: "high" | "medium" | "low";
    skills: mongoose.Types.DocumentArray<{
        status: "completed" | "not_started" | "learning" | "needs_improvement";
        skillName: string;
        instructorNotes: string;
        practiceDrills: mongoose.Types.DocumentArray<{
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }> & {
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }>;
        advice: string;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        status: "completed" | "not_started" | "learning" | "needs_improvement";
        skillName: string;
        instructorNotes: string;
        practiceDrills: mongoose.Types.DocumentArray<{
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }> & {
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }>;
        advice: string;
    }> & {
        status: "completed" | "not_started" | "learning" | "needs_improvement";
        skillName: string;
        instructorNotes: string;
        practiceDrills: mongoose.Types.DocumentArray<{
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }> & {
            name?: string;
            description?: string;
            youtubeUrl?: string;
        }>;
        advice: string;
    }>;
    overallProgress: number;
    instructorComments: string;
    nextGoals: mongoose.Types.DocumentArray<{
        goal?: string;
        targetDate?: NativeDate;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        goal?: string;
        targetDate?: NativeDate;
    }> & {
        goal?: string;
        targetDate?: NativeDate;
    }>;
    checklistItems: mongoose.Types.DocumentArray<{
        priority: "high" | "medium" | "low";
        isCompleted: boolean;
        description?: string;
        notes?: string;
        title?: string;
        dueDate?: NativeDate;
        completedAt?: NativeDate;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        priority: "high" | "medium" | "low";
        isCompleted: boolean;
        description?: string;
        notes?: string;
        title?: string;
        dueDate?: NativeDate;
        completedAt?: NativeDate;
    }> & {
        priority: "high" | "medium" | "low";
        isCompleted: boolean;
        description?: string;
        notes?: string;
        title?: string;
        dueDate?: NativeDate;
        completedAt?: NativeDate;
    }>;
    completedLessons: mongoose.Types.DocumentArray<{
        completedAt?: NativeDate;
        lessonName?: string;
        score?: number;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        completedAt?: NativeDate;
        lessonName?: string;
        score?: number;
    }> & {
        completedAt?: NativeDate;
        lessonName?: string;
        score?: number;
    }>;
    notes?: string;
    center?: mongoose.Types.ObjectId;
    dueDate?: NativeDate;
    class?: mongoose.Types.ObjectId;
    evaluationDate?: NativeDate;
    updatedBy?: mongoose.Types.ObjectId;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
//# sourceMappingURL=Progress.d.ts.map