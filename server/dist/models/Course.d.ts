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