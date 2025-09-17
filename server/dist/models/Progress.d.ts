import mongoose from 'mongoose';
export declare const Progress: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    type: "progress" | "checklist" | "evaluation";
    instructor: mongoose.Types.ObjectId;
    student: mongoose.Types.ObjectId;
    isActive: boolean;
    status: "pending" | "completed" | "in_progress" | "overdue";
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
        title?: string;
        description?: string;
        notes?: string;
        dueDate?: Date;
        completedAt?: Date;
    }[];
    completedLessons: {
        completedAt?: Date;
        lessonName?: string;
        score?: number;
    }[];
    notes?: string;
    updatedBy?: mongoose.Types.ObjectId;
    center?: mongoose.Types.ObjectId;
    dueDate?: Date;
    class?: mongoose.Types.ObjectId;
    evaluationDate?: Date;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    type: "progress" | "checklist" | "evaluation";
    instructor: mongoose.Types.ObjectId;
    student: mongoose.Types.ObjectId;
    isActive: boolean;
    status: "pending" | "completed" | "in_progress" | "overdue";
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
        title?: string;
        description?: string;
        notes?: string;
        dueDate?: Date;
        completedAt?: Date;
    }[];
    completedLessons: {
        completedAt?: Date;
        lessonName?: string;
        score?: number;
    }[];
    notes?: string;
    updatedBy?: mongoose.Types.ObjectId;
    center?: mongoose.Types.ObjectId;
    dueDate?: Date;
    class?: mongoose.Types.ObjectId;
    evaluationDate?: Date;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    type: "progress" | "checklist" | "evaluation";
    instructor: mongoose.Types.ObjectId;
    student: mongoose.Types.ObjectId;
    isActive: boolean;
    status: "pending" | "completed" | "in_progress" | "overdue";
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
        title?: string;
        description?: string;
        notes?: string;
        dueDate?: Date;
        completedAt?: Date;
    }[];
    completedLessons: {
        completedAt?: Date;
        lessonName?: string;
        score?: number;
    }[];
    notes?: string;
    updatedBy?: mongoose.Types.ObjectId;
    center?: mongoose.Types.ObjectId;
    dueDate?: Date;
    class?: mongoose.Types.ObjectId;
    evaluationDate?: Date;
} & {
    _id: mongoose.Types.ObjectId;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    type: "progress" | "checklist" | "evaluation";
    instructor: mongoose.Types.ObjectId;
    student: mongoose.Types.ObjectId;
    isActive: boolean;
    status: "pending" | "completed" | "in_progress" | "overdue";
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
        title?: string;
        description?: string;
        notes?: string;
        dueDate?: Date;
        completedAt?: Date;
    }[];
    completedLessons: {
        completedAt?: Date;
        lessonName?: string;
        score?: number;
    }[];
    notes?: string;
    updatedBy?: mongoose.Types.ObjectId;
    center?: mongoose.Types.ObjectId;
    dueDate?: Date;
    class?: mongoose.Types.ObjectId;
    evaluationDate?: Date;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    type: "progress" | "checklist" | "evaluation";
    instructor: mongoose.Types.ObjectId;
    student: mongoose.Types.ObjectId;
    isActive: boolean;
    status: "pending" | "completed" | "in_progress" | "overdue";
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
        title?: string;
        description?: string;
        notes?: string;
        dueDate?: Date;
        completedAt?: Date;
    }[];
    completedLessons: {
        completedAt?: Date;
        lessonName?: string;
        score?: number;
    }[];
    notes?: string;
    updatedBy?: mongoose.Types.ObjectId;
    center?: mongoose.Types.ObjectId;
    dueDate?: Date;
    class?: mongoose.Types.ObjectId;
    evaluationDate?: Date;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    type: "progress" | "checklist" | "evaluation";
    instructor: mongoose.Types.ObjectId;
    student: mongoose.Types.ObjectId;
    isActive: boolean;
    status: "pending" | "completed" | "in_progress" | "overdue";
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
        title?: string;
        description?: string;
        notes?: string;
        dueDate?: Date;
        completedAt?: Date;
    }[];
    completedLessons: {
        completedAt?: Date;
        lessonName?: string;
        score?: number;
    }[];
    notes?: string;
    updatedBy?: mongoose.Types.ObjectId;
    center?: mongoose.Types.ObjectId;
    dueDate?: Date;
    class?: mongoose.Types.ObjectId;
    evaluationDate?: Date;
}> & {
    _id: mongoose.Types.ObjectId;
}>>;
//# sourceMappingURL=Progress.d.ts.map