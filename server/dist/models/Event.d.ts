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
export declare const Event: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    type: "lesson" | "competition" | "training" | "meetup" | "social";
    title: string;
    description: string;
    duration: number;
    status: "cancelled" | "completed" | "published" | "draft" | "full";
    images: {
        url?: string;
        caption?: string;
        uploadedBy?: mongoose.Types.ObjectId;
    }[];
    category: "번개모임" | "대회" | "강습" | "소셜" | "훈련";
    tags: string[];
    reviews: {
        rating: number;
        reviewDate: Date;
        reviewer: mongoose.Types.ObjectId;
        comment?: string;
    }[];
    maxParticipants: number;
    participants: {
        status: "pending" | "confirmed" | "attended" | "no_show";
        user: mongoose.Types.ObjectId;
        joinedAt: Date;
        role: "participant" | "helper" | "observer";
    }[];
    organizer: mongoose.Types.ObjectId;
    dateTime: Date;
    minParticipants: number;
    skillLevel: "beginner" | "intermediate" | "advanced" | "mixed";
    ageGroup: "senior" | "adult" | "child" | "mixed" | "teen";
    isPrivate: boolean;
    requiresApproval: boolean;
    cost: number;
    costType: "individual" | "free" | "shared";
    requirements: {
        description?: string;
        isRequired?: boolean;
        item?: string;
    }[];
    location?: {
        poolType: "both" | "indoor" | "outdoor";
        centerId?: mongoose.Types.ObjectId;
        address?: string;
        latitude?: number;
        longitude?: number;
    };
    stats?: {
        completionRate: number;
        averageRating: number;
        totalViews: number;
        totalInterested: number;
    };
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    type: "lesson" | "competition" | "training" | "meetup" | "social";
    title: string;
    description: string;
    duration: number;
    status: "cancelled" | "completed" | "published" | "draft" | "full";
    images: {
        url?: string;
        caption?: string;
        uploadedBy?: mongoose.Types.ObjectId;
    }[];
    category: "번개모임" | "대회" | "강습" | "소셜" | "훈련";
    tags: string[];
    reviews: {
        rating: number;
        reviewDate: Date;
        reviewer: mongoose.Types.ObjectId;
        comment?: string;
    }[];
    maxParticipants: number;
    participants: {
        status: "pending" | "confirmed" | "attended" | "no_show";
        user: mongoose.Types.ObjectId;
        joinedAt: Date;
        role: "participant" | "helper" | "observer";
    }[];
    organizer: mongoose.Types.ObjectId;
    dateTime: Date;
    minParticipants: number;
    skillLevel: "beginner" | "intermediate" | "advanced" | "mixed";
    ageGroup: "senior" | "adult" | "child" | "mixed" | "teen";
    isPrivate: boolean;
    requiresApproval: boolean;
    cost: number;
    costType: "individual" | "free" | "shared";
    requirements: {
        description?: string;
        isRequired?: boolean;
        item?: string;
    }[];
    location?: {
        poolType: "both" | "indoor" | "outdoor";
        centerId?: mongoose.Types.ObjectId;
        address?: string;
        latitude?: number;
        longitude?: number;
    };
    stats?: {
        completionRate: number;
        averageRating: number;
        totalViews: number;
        totalInterested: number;
    };
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    type: "lesson" | "competition" | "training" | "meetup" | "social";
    title: string;
    description: string;
    duration: number;
    status: "cancelled" | "completed" | "published" | "draft" | "full";
    images: {
        url?: string;
        caption?: string;
        uploadedBy?: mongoose.Types.ObjectId;
    }[];
    category: "번개모임" | "대회" | "강습" | "소셜" | "훈련";
    tags: string[];
    reviews: {
        rating: number;
        reviewDate: Date;
        reviewer: mongoose.Types.ObjectId;
        comment?: string;
    }[];
    maxParticipants: number;
    participants: {
        status: "pending" | "confirmed" | "attended" | "no_show";
        user: mongoose.Types.ObjectId;
        joinedAt: Date;
        role: "participant" | "helper" | "observer";
    }[];
    organizer: mongoose.Types.ObjectId;
    dateTime: Date;
    minParticipants: number;
    skillLevel: "beginner" | "intermediate" | "advanced" | "mixed";
    ageGroup: "senior" | "adult" | "child" | "mixed" | "teen";
    isPrivate: boolean;
    requiresApproval: boolean;
    cost: number;
    costType: "individual" | "free" | "shared";
    requirements: {
        description?: string;
        isRequired?: boolean;
        item?: string;
    }[];
    location?: {
        poolType: "both" | "indoor" | "outdoor";
        centerId?: mongoose.Types.ObjectId;
        address?: string;
        latitude?: number;
        longitude?: number;
    };
    stats?: {
        completionRate: number;
        averageRating: number;
        totalViews: number;
        totalInterested: number;
    };
} & {
    _id: mongoose.Types.ObjectId;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    type: "lesson" | "competition" | "training" | "meetup" | "social";
    title: string;
    description: string;
    duration: number;
    status: "cancelled" | "completed" | "published" | "draft" | "full";
    images: {
        url?: string;
        caption?: string;
        uploadedBy?: mongoose.Types.ObjectId;
    }[];
    category: "번개모임" | "대회" | "강습" | "소셜" | "훈련";
    tags: string[];
    reviews: {
        rating: number;
        reviewDate: Date;
        reviewer: mongoose.Types.ObjectId;
        comment?: string;
    }[];
    maxParticipants: number;
    participants: {
        status: "pending" | "confirmed" | "attended" | "no_show";
        user: mongoose.Types.ObjectId;
        joinedAt: Date;
        role: "participant" | "helper" | "observer";
    }[];
    organizer: mongoose.Types.ObjectId;
    dateTime: Date;
    minParticipants: number;
    skillLevel: "beginner" | "intermediate" | "advanced" | "mixed";
    ageGroup: "senior" | "adult" | "child" | "mixed" | "teen";
    isPrivate: boolean;
    requiresApproval: boolean;
    cost: number;
    costType: "individual" | "free" | "shared";
    requirements: {
        description?: string;
        isRequired?: boolean;
        item?: string;
    }[];
    location?: {
        poolType: "both" | "indoor" | "outdoor";
        centerId?: mongoose.Types.ObjectId;
        address?: string;
        latitude?: number;
        longitude?: number;
    };
    stats?: {
        completionRate: number;
        averageRating: number;
        totalViews: number;
        totalInterested: number;
    };
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    type: "lesson" | "competition" | "training" | "meetup" | "social";
    title: string;
    description: string;
    duration: number;
    status: "cancelled" | "completed" | "published" | "draft" | "full";
    images: {
        url?: string;
        caption?: string;
        uploadedBy?: mongoose.Types.ObjectId;
    }[];
    category: "번개모임" | "대회" | "강습" | "소셜" | "훈련";
    tags: string[];
    reviews: {
        rating: number;
        reviewDate: Date;
        reviewer: mongoose.Types.ObjectId;
        comment?: string;
    }[];
    maxParticipants: number;
    participants: {
        status: "pending" | "confirmed" | "attended" | "no_show";
        user: mongoose.Types.ObjectId;
        joinedAt: Date;
        role: "participant" | "helper" | "observer";
    }[];
    organizer: mongoose.Types.ObjectId;
    dateTime: Date;
    minParticipants: number;
    skillLevel: "beginner" | "intermediate" | "advanced" | "mixed";
    ageGroup: "senior" | "adult" | "child" | "mixed" | "teen";
    isPrivate: boolean;
    requiresApproval: boolean;
    cost: number;
    costType: "individual" | "free" | "shared";
    requirements: {
        description?: string;
        isRequired?: boolean;
        item?: string;
    }[];
    location?: {
        poolType: "both" | "indoor" | "outdoor";
        centerId?: mongoose.Types.ObjectId;
        address?: string;
        latitude?: number;
        longitude?: number;
    };
    stats?: {
        completionRate: number;
        averageRating: number;
        totalViews: number;
        totalInterested: number;
    };
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    type: "lesson" | "competition" | "training" | "meetup" | "social";
    title: string;
    description: string;
    duration: number;
    status: "cancelled" | "completed" | "published" | "draft" | "full";
    images: {
        url?: string;
        caption?: string;
        uploadedBy?: mongoose.Types.ObjectId;
    }[];
    category: "번개모임" | "대회" | "강습" | "소셜" | "훈련";
    tags: string[];
    reviews: {
        rating: number;
        reviewDate: Date;
        reviewer: mongoose.Types.ObjectId;
        comment?: string;
    }[];
    maxParticipants: number;
    participants: {
        status: "pending" | "confirmed" | "attended" | "no_show";
        user: mongoose.Types.ObjectId;
        joinedAt: Date;
        role: "participant" | "helper" | "observer";
    }[];
    organizer: mongoose.Types.ObjectId;
    dateTime: Date;
    minParticipants: number;
    skillLevel: "beginner" | "intermediate" | "advanced" | "mixed";
    ageGroup: "senior" | "adult" | "child" | "mixed" | "teen";
    isPrivate: boolean;
    requiresApproval: boolean;
    cost: number;
    costType: "individual" | "free" | "shared";
    requirements: {
        description?: string;
        isRequired?: boolean;
        item?: string;
    }[];
    location?: {
        poolType: "both" | "indoor" | "outdoor";
        centerId?: mongoose.Types.ObjectId;
        address?: string;
        latitude?: number;
        longitude?: number;
    };
    stats?: {
        completionRate: number;
        averageRating: number;
        totalViews: number;
        totalInterested: number;
    };
}> & {
    _id: mongoose.Types.ObjectId;
}>>;
//# sourceMappingURL=Event.d.ts.map