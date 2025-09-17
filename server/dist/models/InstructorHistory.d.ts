import mongoose, { Document } from 'mongoose';
export interface IInstructorWorkHistory extends Document {
    instructorId: mongoose.Types.ObjectId;
    centerId: mongoose.Types.ObjectId;
    position: string;
    startDate: Date;
    endDate?: Date;
    isActive: boolean;
    workType: 'fulltime' | 'parttime' | 'contract' | 'volunteer';
    responsibilities: string[];
    achievements: string[];
    createdAt: Date;
    createdBy: mongoose.Types.ObjectId;
    hashValue: string;
    previousHash?: string;
    isVerified: boolean;
    verifiedBy?: mongoose.Types.ObjectId;
    verifiedAt?: Date;
    readonly: boolean;
}
export interface IInstructorCertification extends Document {
    instructorId: mongoose.Types.ObjectId;
    certificationType: 'lifeguard' | 'sports_instructor' | 'swimming_coach' | 'first_aid' | 'other';
    certificationName: string;
    certificationNumber: string;
    issuingOrganization: string;
    issueDate: Date;
    expiryDate?: Date;
    isValid: boolean;
    verificationStatus: 'pending' | 'verified' | 'rejected' | 'expired';
    verificationMethod: 'manual' | 'api' | 'document';
    verifiedBy?: mongoose.Types.ObjectId;
    verifiedAt?: Date;
    verificationNotes?: string;
    documentUrl?: string;
    documentHash?: string;
    createdAt: Date;
    updatedAt: Date;
    readonly: boolean;
}
export declare const CERTIFICATION_TYPES: {
    lifeguard: {
        name: string;
        issuingOrgs: string[];
        validityPeriod: number;
        required: boolean;
    };
    sports_instructor: {
        name: string;
        issuingOrgs: string[];
        validityPeriod: any;
        required: boolean;
    };
    swimming_coach: {
        name: string;
        issuingOrgs: string[];
        validityPeriod: number;
        required: boolean;
    };
    first_aid: {
        name: string;
        issuingOrgs: string[];
        validityPeriod: number;
        required: boolean;
    };
};
export declare const InstructorWorkHistory: mongoose.Model<IInstructorWorkHistory, {}, {}, {}, mongoose.Document<unknown, {}, IInstructorWorkHistory> & IInstructorWorkHistory & {
    _id: mongoose.Types.ObjectId;
}, any>;
export declare const InstructorCertification: mongoose.Model<IInstructorCertification, {}, {}, {}, mongoose.Document<unknown, {}, IInstructorCertification> & IInstructorCertification & {
    _id: mongoose.Types.ObjectId;
}, any>;
declare const _default: {
    InstructorWorkHistory: mongoose.Model<IInstructorWorkHistory, {}, {}, {}, mongoose.Document<unknown, {}, IInstructorWorkHistory> & IInstructorWorkHistory & {
        _id: mongoose.Types.ObjectId;
    }, any>;
    InstructorCertification: mongoose.Model<IInstructorCertification, {}, {}, {}, mongoose.Document<unknown, {}, IInstructorCertification> & IInstructorCertification & {
        _id: mongoose.Types.ObjectId;
    }, any>;
    CERTIFICATION_TYPES: {
        lifeguard: {
            name: string;
            issuingOrgs: string[];
            validityPeriod: number;
            required: boolean;
        };
        sports_instructor: {
            name: string;
            issuingOrgs: string[];
            validityPeriod: any;
            required: boolean;
        };
        swimming_coach: {
            name: string;
            issuingOrgs: string[];
            validityPeriod: number;
            required: boolean;
        };
        first_aid: {
            name: string;
            issuingOrgs: string[];
            validityPeriod: number;
            required: boolean;
        };
    };
};
export default _default;
//# sourceMappingURL=InstructorHistory.d.ts.map