import mongoose from 'mongoose';
export declare const Course: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    level: "beginner" | "intermediate" | "advanced";
    name: string;
    instructor: mongoose.Types.ObjectId;
    maxStudents: number;
    isActive: boolean;
    description: string;
    duration: number;
    price: number;
    teachingMethods: mongoose.Types.DocumentArray<{
        methodId: mongoose.Types.ObjectId;
        order: number;
        isRequired: boolean;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        methodId: mongoose.Types.ObjectId;
        order: number;
        isRequired: boolean;
    }> & {
        methodId: mongoose.Types.ObjectId;
        order: number;
        isRequired: boolean;
    }>;
    schedule: mongoose.Types.DocumentArray<{
        day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
        startTime: string;
        endTime: string;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
        startTime: string;
        endTime: string;
    }> & {
        day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
        startTime: string;
        endTime: string;
    }>;
    enrolledStudents: mongoose.Types.DocumentArray<{
        student: mongoose.Types.ObjectId;
        status: "active" | "completed" | "dropped";
        enrolledAt: NativeDate;
        progress?: {
            percentage: number;
            lastUpdated: NativeDate;
            notes: string;
            completedSteps?: unknown;
        };
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        student: mongoose.Types.ObjectId;
        status: "active" | "completed" | "dropped";
        enrolledAt: NativeDate;
        progress?: {
            percentage: number;
            lastUpdated: NativeDate;
            notes: string;
            completedSteps?: unknown;
        };
    }> & {
        student: mongoose.Types.ObjectId;
        status: "active" | "completed" | "dropped";
        enrolledAt: NativeDate;
        progress?: {
            percentage: number;
            lastUpdated: NativeDate;
            notes: string;
            completedSteps?: unknown;
        };
    }>;
    classInfo?: {
        className: string;
        classType: "regular" | "intensive" | "private";
        startDate: NativeDate;
        endDate: NativeDate;
        maxCapacity: number;
        currentEnrollment: number;
    };
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    level: "beginner" | "intermediate" | "advanced";
    name: string;
    instructor: mongoose.Types.ObjectId;
    maxStudents: number;
    isActive: boolean;
    description: string;
    duration: number;
    price: number;
    teachingMethods: mongoose.Types.DocumentArray<{
        methodId: mongoose.Types.ObjectId;
        order: number;
        isRequired: boolean;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        methodId: mongoose.Types.ObjectId;
        order: number;
        isRequired: boolean;
    }> & {
        methodId: mongoose.Types.ObjectId;
        order: number;
        isRequired: boolean;
    }>;
    schedule: mongoose.Types.DocumentArray<{
        day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
        startTime: string;
        endTime: string;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
        startTime: string;
        endTime: string;
    }> & {
        day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
        startTime: string;
        endTime: string;
    }>;
    enrolledStudents: mongoose.Types.DocumentArray<{
        student: mongoose.Types.ObjectId;
        status: "active" | "completed" | "dropped";
        enrolledAt: NativeDate;
        progress?: {
            percentage: number;
            lastUpdated: NativeDate;
            notes: string;
            completedSteps?: unknown;
        };
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        student: mongoose.Types.ObjectId;
        status: "active" | "completed" | "dropped";
        enrolledAt: NativeDate;
        progress?: {
            percentage: number;
            lastUpdated: NativeDate;
            notes: string;
            completedSteps?: unknown;
        };
    }> & {
        student: mongoose.Types.ObjectId;
        status: "active" | "completed" | "dropped";
        enrolledAt: NativeDate;
        progress?: {
            percentage: number;
            lastUpdated: NativeDate;
            notes: string;
            completedSteps?: unknown;
        };
    }>;
    classInfo?: {
        className: string;
        classType: "regular" | "intensive" | "private";
        startDate: NativeDate;
        endDate: NativeDate;
        maxCapacity: number;
        currentEnrollment: number;
    };
}, {}, {
    timestamps: true;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    level: "beginner" | "intermediate" | "advanced";
    name: string;
    instructor: mongoose.Types.ObjectId;
    maxStudents: number;
    isActive: boolean;
    description: string;
    duration: number;
    price: number;
    teachingMethods: mongoose.Types.DocumentArray<{
        methodId: mongoose.Types.ObjectId;
        order: number;
        isRequired: boolean;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        methodId: mongoose.Types.ObjectId;
        order: number;
        isRequired: boolean;
    }> & {
        methodId: mongoose.Types.ObjectId;
        order: number;
        isRequired: boolean;
    }>;
    schedule: mongoose.Types.DocumentArray<{
        day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
        startTime: string;
        endTime: string;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
        startTime: string;
        endTime: string;
    }> & {
        day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
        startTime: string;
        endTime: string;
    }>;
    enrolledStudents: mongoose.Types.DocumentArray<{
        student: mongoose.Types.ObjectId;
        status: "active" | "completed" | "dropped";
        enrolledAt: NativeDate;
        progress?: {
            percentage: number;
            lastUpdated: NativeDate;
            notes: string;
            completedSteps?: unknown;
        };
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        student: mongoose.Types.ObjectId;
        status: "active" | "completed" | "dropped";
        enrolledAt: NativeDate;
        progress?: {
            percentage: number;
            lastUpdated: NativeDate;
            notes: string;
            completedSteps?: unknown;
        };
    }> & {
        student: mongoose.Types.ObjectId;
        status: "active" | "completed" | "dropped";
        enrolledAt: NativeDate;
        progress?: {
            percentage: number;
            lastUpdated: NativeDate;
            notes: string;
            completedSteps?: unknown;
        };
    }>;
    classInfo?: {
        className: string;
        classType: "regular" | "intensive" | "private";
        startDate: NativeDate;
        endDate: NativeDate;
        maxCapacity: number;
        currentEnrollment: number;
    };
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
    instructor: mongoose.Types.ObjectId;
    maxStudents: number;
    isActive: boolean;
    description: string;
    duration: number;
    price: number;
    teachingMethods: mongoose.Types.DocumentArray<{
        methodId: mongoose.Types.ObjectId;
        order: number;
        isRequired: boolean;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        methodId: mongoose.Types.ObjectId;
        order: number;
        isRequired: boolean;
    }> & {
        methodId: mongoose.Types.ObjectId;
        order: number;
        isRequired: boolean;
    }>;
    schedule: mongoose.Types.DocumentArray<{
        day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
        startTime: string;
        endTime: string;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
        startTime: string;
        endTime: string;
    }> & {
        day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
        startTime: string;
        endTime: string;
    }>;
    enrolledStudents: mongoose.Types.DocumentArray<{
        student: mongoose.Types.ObjectId;
        status: "active" | "completed" | "dropped";
        enrolledAt: NativeDate;
        progress?: {
            percentage: number;
            lastUpdated: NativeDate;
            notes: string;
            completedSteps?: unknown;
        };
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        student: mongoose.Types.ObjectId;
        status: "active" | "completed" | "dropped";
        enrolledAt: NativeDate;
        progress?: {
            percentage: number;
            lastUpdated: NativeDate;
            notes: string;
            completedSteps?: unknown;
        };
    }> & {
        student: mongoose.Types.ObjectId;
        status: "active" | "completed" | "dropped";
        enrolledAt: NativeDate;
        progress?: {
            percentage: number;
            lastUpdated: NativeDate;
            notes: string;
            completedSteps?: unknown;
        };
    }>;
    classInfo?: {
        className: string;
        classType: "regular" | "intensive" | "private";
        startDate: NativeDate;
        endDate: NativeDate;
        maxCapacity: number;
        currentEnrollment: number;
    };
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    level: "beginner" | "intermediate" | "advanced";
    name: string;
    instructor: mongoose.Types.ObjectId;
    maxStudents: number;
    isActive: boolean;
    description: string;
    duration: number;
    price: number;
    teachingMethods: mongoose.Types.DocumentArray<{
        methodId: mongoose.Types.ObjectId;
        order: number;
        isRequired: boolean;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        methodId: mongoose.Types.ObjectId;
        order: number;
        isRequired: boolean;
    }> & {
        methodId: mongoose.Types.ObjectId;
        order: number;
        isRequired: boolean;
    }>;
    schedule: mongoose.Types.DocumentArray<{
        day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
        startTime: string;
        endTime: string;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
        startTime: string;
        endTime: string;
    }> & {
        day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
        startTime: string;
        endTime: string;
    }>;
    enrolledStudents: mongoose.Types.DocumentArray<{
        student: mongoose.Types.ObjectId;
        status: "active" | "completed" | "dropped";
        enrolledAt: NativeDate;
        progress?: {
            percentage: number;
            lastUpdated: NativeDate;
            notes: string;
            completedSteps?: unknown;
        };
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        student: mongoose.Types.ObjectId;
        status: "active" | "completed" | "dropped";
        enrolledAt: NativeDate;
        progress?: {
            percentage: number;
            lastUpdated: NativeDate;
            notes: string;
            completedSteps?: unknown;
        };
    }> & {
        student: mongoose.Types.ObjectId;
        status: "active" | "completed" | "dropped";
        enrolledAt: NativeDate;
        progress?: {
            percentage: number;
            lastUpdated: NativeDate;
            notes: string;
            completedSteps?: unknown;
        };
    }>;
    classInfo?: {
        className: string;
        classType: "regular" | "intensive" | "private";
        startDate: NativeDate;
        endDate: NativeDate;
        maxCapacity: number;
        currentEnrollment: number;
    };
}>, {}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    level: "beginner" | "intermediate" | "advanced";
    name: string;
    instructor: mongoose.Types.ObjectId;
    maxStudents: number;
    isActive: boolean;
    description: string;
    duration: number;
    price: number;
    teachingMethods: mongoose.Types.DocumentArray<{
        methodId: mongoose.Types.ObjectId;
        order: number;
        isRequired: boolean;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        methodId: mongoose.Types.ObjectId;
        order: number;
        isRequired: boolean;
    }> & {
        methodId: mongoose.Types.ObjectId;
        order: number;
        isRequired: boolean;
    }>;
    schedule: mongoose.Types.DocumentArray<{
        day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
        startTime: string;
        endTime: string;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
        startTime: string;
        endTime: string;
    }> & {
        day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
        startTime: string;
        endTime: string;
    }>;
    enrolledStudents: mongoose.Types.DocumentArray<{
        student: mongoose.Types.ObjectId;
        status: "active" | "completed" | "dropped";
        enrolledAt: NativeDate;
        progress?: {
            percentage: number;
            lastUpdated: NativeDate;
            notes: string;
            completedSteps?: unknown;
        };
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        student: mongoose.Types.ObjectId;
        status: "active" | "completed" | "dropped";
        enrolledAt: NativeDate;
        progress?: {
            percentage: number;
            lastUpdated: NativeDate;
            notes: string;
            completedSteps?: unknown;
        };
    }> & {
        student: mongoose.Types.ObjectId;
        status: "active" | "completed" | "dropped";
        enrolledAt: NativeDate;
        progress?: {
            percentage: number;
            lastUpdated: NativeDate;
            notes: string;
            completedSteps?: unknown;
        };
    }>;
    classInfo?: {
        className: string;
        classType: "regular" | "intensive" | "private";
        startDate: NativeDate;
        endDate: NativeDate;
        maxCapacity: number;
        currentEnrollment: number;
    };
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
//# sourceMappingURL=Course.d.ts.map