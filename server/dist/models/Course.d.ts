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
export declare const Course: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    instructor: mongoose.Types.ObjectId;
    level: "beginner" | "intermediate" | "advanced";
    maxStudents: number;
    isActive: boolean;
    description: string;
    duration: number;
    price: number;
    teachingMethods: {
        methodId: mongoose.Types.ObjectId;
        order: number;
        isRequired: boolean;
    }[];
    schedule: {
        day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
        startTime: string;
        endTime: string;
    }[];
    enrolledStudents: {
        student: mongoose.Types.ObjectId;
        status: "active" | "completed" | "dropped";
        enrolledAt: Date;
        progress?: {
            percentage: number;
            lastUpdated: Date;
            notes: string;
            completedSteps?: any;
        };
    }[];
    classInfo?: {
        className: string;
        classType: "regular" | "intensive" | "private";
        startDate: Date;
        endDate: Date;
        maxCapacity: number;
        currentEnrollment: number;
    };
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    instructor: mongoose.Types.ObjectId;
    level: "beginner" | "intermediate" | "advanced";
    maxStudents: number;
    isActive: boolean;
    description: string;
    duration: number;
    price: number;
    teachingMethods: {
        methodId: mongoose.Types.ObjectId;
        order: number;
        isRequired: boolean;
    }[];
    schedule: {
        day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
        startTime: string;
        endTime: string;
    }[];
    enrolledStudents: {
        student: mongoose.Types.ObjectId;
        status: "active" | "completed" | "dropped";
        enrolledAt: Date;
        progress?: {
            percentage: number;
            lastUpdated: Date;
            notes: string;
            completedSteps?: any;
        };
    }[];
    classInfo?: {
        className: string;
        classType: "regular" | "intensive" | "private";
        startDate: Date;
        endDate: Date;
        maxCapacity: number;
        currentEnrollment: number;
    };
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    instructor: mongoose.Types.ObjectId;
    level: "beginner" | "intermediate" | "advanced";
    maxStudents: number;
    isActive: boolean;
    description: string;
    duration: number;
    price: number;
    teachingMethods: {
        methodId: mongoose.Types.ObjectId;
        order: number;
        isRequired: boolean;
    }[];
    schedule: {
        day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
        startTime: string;
        endTime: string;
    }[];
    enrolledStudents: {
        student: mongoose.Types.ObjectId;
        status: "active" | "completed" | "dropped";
        enrolledAt: Date;
        progress?: {
            percentage: number;
            lastUpdated: Date;
            notes: string;
            completedSteps?: any;
        };
    }[];
    classInfo?: {
        className: string;
        classType: "regular" | "intensive" | "private";
        startDate: Date;
        endDate: Date;
        maxCapacity: number;
        currentEnrollment: number;
    };
} & {
    _id: mongoose.Types.ObjectId;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    instructor: mongoose.Types.ObjectId;
    level: "beginner" | "intermediate" | "advanced";
    maxStudents: number;
    isActive: boolean;
    description: string;
    duration: number;
    price: number;
    teachingMethods: {
        methodId: mongoose.Types.ObjectId;
        order: number;
        isRequired: boolean;
    }[];
    schedule: {
        day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
        startTime: string;
        endTime: string;
    }[];
    enrolledStudents: {
        student: mongoose.Types.ObjectId;
        status: "active" | "completed" | "dropped";
        enrolledAt: Date;
        progress?: {
            percentage: number;
            lastUpdated: Date;
            notes: string;
            completedSteps?: any;
        };
    }[];
    classInfo?: {
        className: string;
        classType: "regular" | "intensive" | "private";
        startDate: Date;
        endDate: Date;
        maxCapacity: number;
        currentEnrollment: number;
    };
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    instructor: mongoose.Types.ObjectId;
    level: "beginner" | "intermediate" | "advanced";
    maxStudents: number;
    isActive: boolean;
    description: string;
    duration: number;
    price: number;
    teachingMethods: {
        methodId: mongoose.Types.ObjectId;
        order: number;
        isRequired: boolean;
    }[];
    schedule: {
        day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
        startTime: string;
        endTime: string;
    }[];
    enrolledStudents: {
        student: mongoose.Types.ObjectId;
        status: "active" | "completed" | "dropped";
        enrolledAt: Date;
        progress?: {
            percentage: number;
            lastUpdated: Date;
            notes: string;
            completedSteps?: any;
        };
    }[];
    classInfo?: {
        className: string;
        classType: "regular" | "intensive" | "private";
        startDate: Date;
        endDate: Date;
        maxCapacity: number;
        currentEnrollment: number;
    };
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    instructor: mongoose.Types.ObjectId;
    level: "beginner" | "intermediate" | "advanced";
    maxStudents: number;
    isActive: boolean;
    description: string;
    duration: number;
    price: number;
    teachingMethods: {
        methodId: mongoose.Types.ObjectId;
        order: number;
        isRequired: boolean;
    }[];
    schedule: {
        day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
        startTime: string;
        endTime: string;
    }[];
    enrolledStudents: {
        student: mongoose.Types.ObjectId;
        status: "active" | "completed" | "dropped";
        enrolledAt: Date;
        progress?: {
            percentage: number;
            lastUpdated: Date;
            notes: string;
            completedSteps?: any;
        };
    }[];
    classInfo?: {
        className: string;
        classType: "regular" | "intensive" | "private";
        startDate: Date;
        endDate: Date;
        maxCapacity: number;
        currentEnrollment: number;
    };
}> & {
    _id: mongoose.Types.ObjectId;
}>>;
//# sourceMappingURL=Course.d.ts.map