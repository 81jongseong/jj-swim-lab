import mongoose, { Document } from 'mongoose';
export interface ICenterInfo extends Document {
    centerId: string;
    name: string;
    shortDescription: string;
    description: string;
    address: string;
    phone: string;
    email: string;
    website?: string;
    businessHours: {
        monday: string;
        tuesday: string;
        wednesday: string;
        thursday: string;
        friday: string;
        saturday: string;
        sunday: string;
    };
    facilities: string[];
    features: string[];
    images: {
        mainImage?: string;
        gallery: string[];
    };
    instructors: Array<{
        name: string;
        specialty: string;
        experience: string;
        image?: string;
    }>;
    courses: Array<{
        name: string;
        description: string;
        level: string;
        duration: string;
        price: string;
    }>;
    createdAt: Date;
    updatedAt: Date;
}
export declare const CenterInfo: mongoose.Model<ICenterInfo, {}, {}, {}, mongoose.Document<unknown, {}, ICenterInfo, {}, {}> & ICenterInfo & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=CenterInfo.d.ts.map