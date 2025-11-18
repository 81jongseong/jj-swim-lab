import mongoose, { Document } from 'mongoose';
export interface ICenterRegistration extends Document {
    centerName: string;
    businessNumber: string;
    representativeName: string;
    representativeEmail: string;
    representativePhone: string;
    password: string;
    address: {
        postalCode: string;
        address1: string;
        address2?: string;
        city: string;
        province: string;
    };
    centerInfo: {
        description: string;
        pools: {
            id: string;
            type: 'main' | 'auxiliary';
            length: number;
            width: number;
            depth: number;
            laneCount?: number;
            description?: string;
        }[];
        facilities: {
            name: string;
            enabled: boolean;
            details?: {
                count?: number;
                type?: string;
                description?: string;
            };
        }[];
        operatingHours: {
            weekdays: {
                open: string;
                close: string;
            };
            weekends: {
                open: string;
                close: string;
            };
        };
        capacity: number;
        parkingAvailable: boolean;
        parkingSpaces?: number;
    };
    applicant: {
        name: string;
        email: string;
        phone: string;
        position: string;
        userId?: mongoose.Types.ObjectId;
    };
    documents: {
        businessLicense?: string;
        facilityPhotos?: string[];
        poolPhotos?: string[];
        otherDocuments?: string[];
    };
    status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'cancelled';
    approvalInfo?: {
        reviewedBy: mongoose.Types.ObjectId;
        reviewedAt: Date;
        approvedBy?: mongoose.Types.ObjectId;
        approvedAt?: Date;
        rejectedBy?: mongoose.Types.ObjectId;
        rejectedAt?: Date;
        rejectionReason?: string;
        comments?: string;
    };
    createdCenterId?: mongoose.Types.ObjectId;
    createdCenterAdminId?: mongoose.Types.ObjectId;
    submittedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ICenterRegistration, {}, {}, {}, mongoose.Document<unknown, {}, ICenterRegistration> & ICenterRegistration & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=CenterRegistration.d.ts.map