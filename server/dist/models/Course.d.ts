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
    centerId: mongoose.Types.ObjectId;
    level: "beginner" | "intermediate" | "advanced";
    isActive: boolean;
    description: string;
    duration: number;
    price: number;
    maxStudents: number;
    teachingMethods: {
        order: number;
        methodId: mongoose.Types.ObjectId;
        isRequired: boolean;
    }[];
    schedule: {
        startTime: string;
        endTime: string;
        day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
    }[];
    enrolledStudents: {
        student: mongoose.Types.ObjectId;
        status: "completed" | "active" | "dropped";
        enrolledAt: Date;
        progress?: {
            notes: string;
            lastUpdated: Date;
            percentage: number;
            completedSteps?: any;
        };
    }[];
    classInfo?: {
        startDate: Date;
        endDate: Date;
        className: string;
        classType: "private" | "regular" | "intensive";
        maxCapacity: number;
        currentEnrollment: number;
    };
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    instructor: mongoose.Types.ObjectId;
    centerId: mongoose.Types.ObjectId;
    level: "beginner" | "intermediate" | "advanced";
    isActive: boolean;
    description: string;
    duration: number;
    price: number;
    maxStudents: number;
    teachingMethods: {
        order: number;
        methodId: mongoose.Types.ObjectId;
        isRequired: boolean;
    }[];
    schedule: {
        startTime: string;
        endTime: string;
        day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
    }[];
    enrolledStudents: {
        student: mongoose.Types.ObjectId;
        status: "completed" | "active" | "dropped";
        enrolledAt: Date;
        progress?: {
            notes: string;
            lastUpdated: Date;
            percentage: number;
            completedSteps?: any;
        };
    }[];
    classInfo?: {
        startDate: Date;
        endDate: Date;
        className: string;
        classType: "private" | "regular" | "intensive";
        maxCapacity: number;
        currentEnrollment: number;
    };
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    instructor: mongoose.Types.ObjectId;
    centerId: mongoose.Types.ObjectId;
    level: "beginner" | "intermediate" | "advanced";
    isActive: boolean;
    description: string;
    duration: number;
    price: number;
    maxStudents: number;
    teachingMethods: {
        order: number;
        methodId: mongoose.Types.ObjectId;
        isRequired: boolean;
    }[];
    schedule: {
        startTime: string;
        endTime: string;
        day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
    }[];
    enrolledStudents: {
        student: mongoose.Types.ObjectId;
        status: "completed" | "active" | "dropped";
        enrolledAt: Date;
        progress?: {
            notes: string;
            lastUpdated: Date;
            percentage: number;
            completedSteps?: any;
        };
    }[];
    classInfo?: {
        startDate: Date;
        endDate: Date;
        className: string;
        classType: "private" | "regular" | "intensive";
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
    centerId: mongoose.Types.ObjectId;
    level: "beginner" | "intermediate" | "advanced";
    isActive: boolean;
    description: string;
    duration: number;
    price: number;
    maxStudents: number;
    teachingMethods: {
        order: number;
        methodId: mongoose.Types.ObjectId;
        isRequired: boolean;
    }[];
    schedule: {
        startTime: string;
        endTime: string;
        day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
    }[];
    enrolledStudents: {
        student: mongoose.Types.ObjectId;
        status: "completed" | "active" | "dropped";
        enrolledAt: Date;
        progress?: {
            notes: string;
            lastUpdated: Date;
            percentage: number;
            completedSteps?: any;
        };
    }[];
    classInfo?: {
        startDate: Date;
        endDate: Date;
        className: string;
        classType: "private" | "regular" | "intensive";
        maxCapacity: number;
        currentEnrollment: number;
    };
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    instructor: mongoose.Types.ObjectId;
    centerId: mongoose.Types.ObjectId;
    level: "beginner" | "intermediate" | "advanced";
    isActive: boolean;
    description: string;
    duration: number;
    price: number;
    maxStudents: number;
    teachingMethods: {
        order: number;
        methodId: mongoose.Types.ObjectId;
        isRequired: boolean;
    }[];
    schedule: {
        startTime: string;
        endTime: string;
        day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
    }[];
    enrolledStudents: {
        student: mongoose.Types.ObjectId;
        status: "completed" | "active" | "dropped";
        enrolledAt: Date;
        progress?: {
            notes: string;
            lastUpdated: Date;
            percentage: number;
            completedSteps?: any;
        };
    }[];
    classInfo?: {
        startDate: Date;
        endDate: Date;
        className: string;
        classType: "private" | "regular" | "intensive";
        maxCapacity: number;
        currentEnrollment: number;
    };
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    instructor: mongoose.Types.ObjectId;
    centerId: mongoose.Types.ObjectId;
    level: "beginner" | "intermediate" | "advanced";
    isActive: boolean;
    description: string;
    duration: number;
    price: number;
    maxStudents: number;
    teachingMethods: {
        order: number;
        methodId: mongoose.Types.ObjectId;
        isRequired: boolean;
    }[];
    schedule: {
        startTime: string;
        endTime: string;
        day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
    }[];
    enrolledStudents: {
        student: mongoose.Types.ObjectId;
        status: "completed" | "active" | "dropped";
        enrolledAt: Date;
        progress?: {
            notes: string;
            lastUpdated: Date;
            percentage: number;
            completedSteps?: any;
        };
    }[];
    classInfo?: {
        startDate: Date;
        endDate: Date;
        className: string;
        classType: "private" | "regular" | "intensive";
        maxCapacity: number;
        currentEnrollment: number;
    };
}> & {
    _id: mongoose.Types.ObjectId;
}>>;
//# sourceMappingURL=Course.d.ts.map