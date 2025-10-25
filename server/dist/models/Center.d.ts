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
import mongoose, { Document } from 'mongoose';
export interface ICenter extends Document {
    name: string;
    address: string;
    phone: string;
    email: string;
    managerId: mongoose.Types.ObjectId;
    instructors: mongoose.Types.ObjectId[];
    students: mongoose.Types.ObjectId[];
    courses: mongoose.Types.ObjectId[];
    capacity: number;
    status: 'active' | 'inactive' | 'maintenance';
    facilities: string[];
    poolConfiguration?: {
        mainPool?: {
            name: string;
            lanes: number;
            depth: string;
            size: string;
        };
        kidsPool?: {
            name: string;
            lanes: number;
            depth: string;
            size: string;
        };
        auxiliaryPool?: {
            name: string;
            lanes: number;
            depth: string;
            size: string;
        };
    };
    operatingHours: {
        open: string;
        close: string;
        days: string[];
    };
    availabilitySettings: {
        personalLesson: {
            enabled: boolean;
            availableDays: string[];
            availableTimes: Array<{
                startTime: string;
                endTime: string;
                maxDuration: number;
            }>;
            advanceBookingDays: number;
            cancellationPolicy: string;
        };
        laneRental: {
            enabled: boolean;
            availableDays: string[];
            availableTimes: Array<{
                startTime: string;
                endTime: string;
                maxDuration: number;
            }>;
            availableLanes: number[];
            advanceBookingDays: number;
            cancellationPolicy: string;
        };
    };
    introduction: {
        shortDescription: string;
        fullDescription: string;
        features: string[];
        certifications: string[];
        images: string[];
        videoUrl?: string;
        achievements: string[];
        specialPrograms: string[];
        targetAudience: string[];
        philosophy: string;
        history: string;
        staff: Array<{
            name: string;
            position: string;
            experience: string;
            certifications: string[];
            photo?: string;
        }>;
        contactInfo: {
            website?: string;
            socialMedia?: {
                facebook?: string;
                instagram?: string;
                youtube?: string;
                kakao?: string;
            };
            parkingInfo?: string;
            publicTransport?: string;
        };
        pricing: {
            membershipFees?: Array<{
                type: string;
                price: number;
                duration: string;
                description: string;
            }>;
            lessonFees?: Array<{
                type: string;
                price: number;
                duration: string;
                description: string;
            }>;
        };
        visibility: {
            isPublic: boolean;
            showToMembers: boolean;
            showToInstructors: boolean;
            lastUpdated: Date;
            updatedBy: mongoose.Types.ObjectId;
        };
    };
    createdAt: Date;
    updatedAt: Date;
}
export declare const Center: mongoose.Model<ICenter, {}, {}, {}, mongoose.Document<unknown, {}, ICenter> & ICenter & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default Center;
//# sourceMappingURL=Center.d.ts.map