import mongoose from 'mongoose';
export declare const Evaluation: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    student: mongoose.Types.ObjectId;
    instructor: mongoose.Types.ObjectId;
    course: mongoose.Types.ObjectId;
    evaluationDate: NativeDate;
    instructorComments: string;
    attitude: number;
    effort: number;
    overallRating: number;
    recommendations: string;
    isAnonymous: boolean;
    isSubmitted: boolean;
    evaluationType: "student_to_instructor" | "instructor_to_student" | "mutual";
    class?: mongoose.Types.ObjectId;
    skills?: {
        freestyle: number;
        backstroke: number;
        breaststroke: number;
        butterfly: number;
        diving: number;
        turns: number;
    };
    courseEndDate?: NativeDate;
    ratings?: {
        instructorTeaching?: number;
        courseContent?: number;
        facilityQuality?: number;
        overallSatisfaction?: number;
    };
    comments?: {
        strengths: string;
        improvements: string;
        additionalComments: string;
    };
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    student: mongoose.Types.ObjectId;
    instructor: mongoose.Types.ObjectId;
    course: mongoose.Types.ObjectId;
    evaluationDate: NativeDate;
    instructorComments: string;
    attitude: number;
    effort: number;
    overallRating: number;
    recommendations: string;
    isAnonymous: boolean;
    isSubmitted: boolean;
    evaluationType: "student_to_instructor" | "instructor_to_student" | "mutual";
    class?: mongoose.Types.ObjectId;
    skills?: {
        freestyle: number;
        backstroke: number;
        breaststroke: number;
        butterfly: number;
        diving: number;
        turns: number;
    };
    courseEndDate?: NativeDate;
    ratings?: {
        instructorTeaching?: number;
        courseContent?: number;
        facilityQuality?: number;
        overallSatisfaction?: number;
    };
    comments?: {
        strengths: string;
        improvements: string;
        additionalComments: string;
    };
}, {}, {
    timestamps: true;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    student: mongoose.Types.ObjectId;
    instructor: mongoose.Types.ObjectId;
    course: mongoose.Types.ObjectId;
    evaluationDate: NativeDate;
    instructorComments: string;
    attitude: number;
    effort: number;
    overallRating: number;
    recommendations: string;
    isAnonymous: boolean;
    isSubmitted: boolean;
    evaluationType: "student_to_instructor" | "instructor_to_student" | "mutual";
    class?: mongoose.Types.ObjectId;
    skills?: {
        freestyle: number;
        backstroke: number;
        breaststroke: number;
        butterfly: number;
        diving: number;
        turns: number;
    };
    courseEndDate?: NativeDate;
    ratings?: {
        instructorTeaching?: number;
        courseContent?: number;
        facilityQuality?: number;
        overallSatisfaction?: number;
    };
    comments?: {
        strengths: string;
        improvements: string;
        additionalComments: string;
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
    student: mongoose.Types.ObjectId;
    instructor: mongoose.Types.ObjectId;
    course: mongoose.Types.ObjectId;
    evaluationDate: NativeDate;
    instructorComments: string;
    attitude: number;
    effort: number;
    overallRating: number;
    recommendations: string;
    isAnonymous: boolean;
    isSubmitted: boolean;
    evaluationType: "student_to_instructor" | "instructor_to_student" | "mutual";
    class?: mongoose.Types.ObjectId;
    skills?: {
        freestyle: number;
        backstroke: number;
        breaststroke: number;
        butterfly: number;
        diving: number;
        turns: number;
    };
    courseEndDate?: NativeDate;
    ratings?: {
        instructorTeaching?: number;
        courseContent?: number;
        facilityQuality?: number;
        overallSatisfaction?: number;
    };
    comments?: {
        strengths: string;
        improvements: string;
        additionalComments: string;
    };
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    student: mongoose.Types.ObjectId;
    instructor: mongoose.Types.ObjectId;
    course: mongoose.Types.ObjectId;
    evaluationDate: NativeDate;
    instructorComments: string;
    attitude: number;
    effort: number;
    overallRating: number;
    recommendations: string;
    isAnonymous: boolean;
    isSubmitted: boolean;
    evaluationType: "student_to_instructor" | "instructor_to_student" | "mutual";
    class?: mongoose.Types.ObjectId;
    skills?: {
        freestyle: number;
        backstroke: number;
        breaststroke: number;
        butterfly: number;
        diving: number;
        turns: number;
    };
    courseEndDate?: NativeDate;
    ratings?: {
        instructorTeaching?: number;
        courseContent?: number;
        facilityQuality?: number;
        overallSatisfaction?: number;
    };
    comments?: {
        strengths: string;
        improvements: string;
        additionalComments: string;
    };
}>, {}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    student: mongoose.Types.ObjectId;
    instructor: mongoose.Types.ObjectId;
    course: mongoose.Types.ObjectId;
    evaluationDate: NativeDate;
    instructorComments: string;
    attitude: number;
    effort: number;
    overallRating: number;
    recommendations: string;
    isAnonymous: boolean;
    isSubmitted: boolean;
    evaluationType: "student_to_instructor" | "instructor_to_student" | "mutual";
    class?: mongoose.Types.ObjectId;
    skills?: {
        freestyle: number;
        backstroke: number;
        breaststroke: number;
        butterfly: number;
        diving: number;
        turns: number;
    };
    courseEndDate?: NativeDate;
    ratings?: {
        instructorTeaching?: number;
        courseContent?: number;
        facilityQuality?: number;
        overallSatisfaction?: number;
    };
    comments?: {
        strengths: string;
        improvements: string;
        additionalComments: string;
    };
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
//# sourceMappingURL=Evaluation.d.ts.map