import mongoose, { Document } from 'mongoose';
export interface ICenterRegistration extends Document {
    centerName: string;
    businessNumber: string;
    representativeName: string;
    representativeEmail: string;
    representativePhone: string;
    address: {
        postalCode: string;
        address1: string;
        address2?: string;
        city: string;
        province: string;
    };
    centerInfo: {
        description: string;
        facilities: string[];
        poolSize: {
            length: number;
            width: number;
            depth: number;
        };
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