import mongoose from 'mongoose';
export declare const Evaluation: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    instructor: mongoose.Types.ObjectId;
    student: mongoose.Types.ObjectId;
    course: mongoose.Types.ObjectId;
    evaluationDate: Date;
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
    courseEndDate?: Date;
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
    instructor: mongoose.Types.ObjectId;
    student: mongoose.Types.ObjectId;
    course: mongoose.Types.ObjectId;
    evaluationDate: Date;
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
    courseEndDate?: Date;
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
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    instructor: mongoose.Types.ObjectId;
    student: mongoose.Types.ObjectId;
    course: mongoose.Types.ObjectId;
    evaluationDate: Date;
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
    courseEndDate?: Date;
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
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    instructor: mongoose.Types.ObjectId;
    student: mongoose.Types.ObjectId;
    course: mongoose.Types.ObjectId;
    evaluationDate: Date;
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
    courseEndDate?: Date;
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
    instructor: mongoose.Types.ObjectId;
    student: mongoose.Types.ObjectId;
    course: mongoose.Types.ObjectId;
    evaluationDate: Date;
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
    courseEndDate?: Date;
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
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    instructor: mongoose.Types.ObjectId;
    student: mongoose.Types.ObjectId;
    course: mongoose.Types.ObjectId;
    evaluationDate: Date;
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
    courseEndDate?: Date;
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
}>>;
//# sourceMappingURL=Evaluation.d.ts.map