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