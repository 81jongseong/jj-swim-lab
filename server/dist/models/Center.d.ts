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
    images?: {
        logo?: string;
        mainImage?: string;
        [key: string]: string | undefined;
    };
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
    customLevels?: Array<{
        id: string;
        name: string;
        description: string;
        color: string;
        mappedToAdminLevel: string;
        order: number;
    }>;
    availabilitySettings: {
        personalLesson: {
            enabled: boolean;
            availableDays: string[];
            availableTimes: Array<{
                startTime: string;
                endTime: string;
                maxDuration?: number;
            }>;
            dayTimeSlots?: Array<{
                day: string;
                timeSlots: Array<{
                    startTime: string;
                    endTime: string;
                }>;
            }>;
            advanceBookingDays?: number;
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
        freeSwim?: {
            enabled: boolean;
            dayTimeSlots?: Array<{
                day: string;
                timeSlots: Array<{
                    startTime: string;
                    endTime: string;
                }>;
            }>;
            cancellationPolicy?: string;
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
    geoDistributionVisibility?: {
        isPublic: boolean;
        showToOtherCenterAdmins: boolean;
        showToOwnInstructors: boolean;
        showToOtherInstructors: boolean;
        showToOwnMembers: boolean;
        showToOtherMembers: boolean;
        lastUpdated?: Date;
        updatedBy?: mongoose.Types.ObjectId;
    };
    settings?: {
        theme?: {
            primaryColor?: string;
            secondaryColor?: string;
            mode?: 'light' | 'dark' | 'auto';
            color?: string;
            density?: string;
            [key: string]: any;
        };
        notifications?: {
            email?: boolean;
            sms?: boolean;
        };
        features?: {
            reports?: boolean;
            payments?: boolean;
            bookings?: boolean;
        };
        [key: string]: any;
    };
    createdAt: Date;
    updatedAt: Date;
}
export declare const Center: mongoose.Model<ICenter, {}, {}, {}, mongoose.Document<unknown, {}, ICenter> & ICenter & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default Center;
//# sourceMappingURL=Center.d.ts.map