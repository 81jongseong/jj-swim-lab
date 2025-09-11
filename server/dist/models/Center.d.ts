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
    createdAt: Date;
    updatedAt: Date;
}
export declare const Center: mongoose.Model<ICenter, {}, {}, {}, mongoose.Document<unknown, {}, ICenter> & ICenter & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default Center;
//# sourceMappingURL=Center.d.ts.map