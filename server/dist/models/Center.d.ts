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
    operatingHours: {
        open: string;
        close: string;
        days: string[];
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