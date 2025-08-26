import mongoose from 'mongoose';
export declare const Class: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    level: "beginner" | "intermediate" | "advanced";
    name: string;
    instructor: mongoose.Types.ObjectId;
    maxStudents: number;
    currentStudents: number;
    isActive: boolean;
    description: string;
    students: mongoose.Types.DocumentArray<{
        status: "active" | "completed" | "dropped";
        enrolledAt: NativeDate;
        student?: mongoose.Types.ObjectId;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        status: "active" | "completed" | "dropped";
        enrolledAt: NativeDate;
        student?: mongoose.Types.ObjectId;
    }> & {
        status: "active" | "completed" | "dropped";
        enrolledAt: NativeDate;
        student?: mongoose.Types.ObjectId;
    }>;
    startDate: NativeDate;
    endDate: NativeDate;
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
    level: "beginner" | "intermediate" | "advanced";
    name: string;
    instructor: mongoose.Types.ObjectId;
    maxStudents: number;
    currentStudents: number;
    isActive: boolean;
    description: string;
    students: mongoose.Types.DocumentArray<{
        status: "active" | "completed" | "dropped";
        enrolledAt: NativeDate;
        student?: mongoose.Types.ObjectId;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        status: "active" | "completed" | "dropped";
        enrolledAt: NativeDate;
        student?: mongoose.Types.ObjectId;
    }> & {
        status: "active" | "completed" | "dropped";
        enrolledAt: NativeDate;
        student?: mongoose.Types.ObjectId;
    }>;
    startDate: NativeDate;
    endDate: NativeDate;
    course: mongoose.Types.ObjectId;
    center: mongoose.Types.ObjectId;
    schedule?: {
        startTime: string;
        endTime: string;
        dayOfWeek: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
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
    currentStudents: number;
    isActive: boolean;
    description: string;
    students: mongoose.Types.DocumentArray<{
        status: "active" | "completed" | "dropped";
        enrolledAt: NativeDate;
        student?: mongoose.Types.ObjectId;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        status: "active" | "completed" | "dropped";
        enrolledAt: NativeDate;
        student?: mongoose.Types.ObjectId;
    }> & {
        status: "active" | "completed" | "dropped";
        enrolledAt: NativeDate;
        student?: mongoose.Types.ObjectId;
    }>;
    startDate: NativeDate;
    endDate: NativeDate;
    course: mongoose.Types.ObjectId;
    center: mongoose.Types.ObjectId;
    schedule?: {
        startTime: string;
        endTime: string;
        dayOfWeek: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
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
    currentStudents: number;
    isActive: boolean;
    description: string;
    students: mongoose.Types.DocumentArray<{
        status: "active" | "completed" | "dropped";
        enrolledAt: NativeDate;
        student?: mongoose.Types.ObjectId;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        status: "active" | "completed" | "dropped";
        enrolledAt: NativeDate;
        student?: mongoose.Types.ObjectId;
    }> & {
        status: "active" | "completed" | "dropped";
        enrolledAt: NativeDate;
        student?: mongoose.Types.ObjectId;
    }>;
    startDate: NativeDate;
    endDate: NativeDate;
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
    level: "beginner" | "intermediate" | "advanced";
    name: string;
    instructor: mongoose.Types.ObjectId;
    maxStudents: number;
    currentStudents: number;
    isActive: boolean;
    description: string;
    students: mongoose.Types.DocumentArray<{
        status: "active" | "completed" | "dropped";
        enrolledAt: NativeDate;
        student?: mongoose.Types.ObjectId;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        status: "active" | "completed" | "dropped";
        enrolledAt: NativeDate;
        student?: mongoose.Types.ObjectId;
    }> & {
        status: "active" | "completed" | "dropped";
        enrolledAt: NativeDate;
        student?: mongoose.Types.ObjectId;
    }>;
    startDate: NativeDate;
    endDate: NativeDate;
    course: mongoose.Types.ObjectId;
    center: mongoose.Types.ObjectId;
    schedule?: {
        startTime: string;
        endTime: string;
        dayOfWeek: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
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
    currentStudents: number;
    isActive: boolean;
    description: string;
    students: mongoose.Types.DocumentArray<{
        status: "active" | "completed" | "dropped";
        enrolledAt: NativeDate;
        student?: mongoose.Types.ObjectId;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        status: "active" | "completed" | "dropped";
        enrolledAt: NativeDate;
        student?: mongoose.Types.ObjectId;
    }> & {
        status: "active" | "completed" | "dropped";
        enrolledAt: NativeDate;
        student?: mongoose.Types.ObjectId;
    }>;
    startDate: NativeDate;
    endDate: NativeDate;
    course: mongoose.Types.ObjectId;
    center: mongoose.Types.ObjectId;
    schedule?: {
        startTime: string;
        endTime: string;
        dayOfWeek: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
    };
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
//# sourceMappingURL=Class.d.ts.map