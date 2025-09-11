import mongoose from 'mongoose';
export declare const Class: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    instructor: mongoose.Types.ObjectId;
    level: "beginner" | "intermediate" | "advanced";
    isActive: boolean;
    description: string;
    maxStudents: number;
    startDate: Date;
    endDate: Date;
    currentStudents: number;
    students: {
        status: "completed" | "active" | "dropped";
        enrolledAt: Date;
        student?: mongoose.Types.ObjectId;
    }[];
    course: mongoose.Types.ObjectId;
    center: mongoose.Types.ObjectId;
    schedule?: {
        startTime: string;
        endTime: string;
        dayOfWeek: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
    };
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    instructor: mongoose.Types.ObjectId;
    level: "beginner" | "intermediate" | "advanced";
    isActive: boolean;
    description: string;
    maxStudents: number;
    startDate: Date;
    endDate: Date;
    currentStudents: number;
    students: {
        status: "completed" | "active" | "dropped";
        enrolledAt: Date;
        student?: mongoose.Types.ObjectId;
    }[];
    course: mongoose.Types.ObjectId;
    center: mongoose.Types.ObjectId;
    schedule?: {
        startTime: string;
        endTime: string;
        dayOfWeek: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
    };
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    instructor: mongoose.Types.ObjectId;
    level: "beginner" | "intermediate" | "advanced";
    isActive: boolean;
    description: string;
    maxStudents: number;
    startDate: Date;
    endDate: Date;
    currentStudents: number;
    students: {
        status: "completed" | "active" | "dropped";
        enrolledAt: Date;
        student?: mongoose.Types.ObjectId;
    }[];
    course: mongoose.Types.ObjectId;
    center: mongoose.Types.ObjectId;
    schedule?: {
        startTime: string;
        endTime: string;
        dayOfWeek: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
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
    isActive: boolean;
    description: string;
    maxStudents: number;
    startDate: Date;
    endDate: Date;
    currentStudents: number;
    students: {
        status: "completed" | "active" | "dropped";
        enrolledAt: Date;
        student?: mongoose.Types.ObjectId;
    }[];
    course: mongoose.Types.ObjectId;
    center: mongoose.Types.ObjectId;
    schedule?: {
        startTime: string;
        endTime: string;
        dayOfWeek: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
    };
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    instructor: mongoose.Types.ObjectId;
    level: "beginner" | "intermediate" | "advanced";
    isActive: boolean;
    description: string;
    maxStudents: number;
    startDate: Date;
    endDate: Date;
    currentStudents: number;
    students: {
        status: "completed" | "active" | "dropped";
        enrolledAt: Date;
        student?: mongoose.Types.ObjectId;
    }[];
    course: mongoose.Types.ObjectId;
    center: mongoose.Types.ObjectId;
    schedule?: {
        startTime: string;
        endTime: string;
        dayOfWeek: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
    };
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    instructor: mongoose.Types.ObjectId;
    level: "beginner" | "intermediate" | "advanced";
    isActive: boolean;
    description: string;
    maxStudents: number;
    startDate: Date;
    endDate: Date;
    currentStudents: number;
    students: {
        status: "completed" | "active" | "dropped";
        enrolledAt: Date;
        student?: mongoose.Types.ObjectId;
    }[];
    course: mongoose.Types.ObjectId;
    center: mongoose.Types.ObjectId;
    schedule?: {
        startTime: string;
        endTime: string;
        dayOfWeek: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
    };
}> & {
    _id: mongoose.Types.ObjectId;
}>>;
//# sourceMappingURL=Class.d.ts.map