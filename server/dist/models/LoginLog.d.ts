import mongoose, { Document } from 'mongoose';
export interface ILoginLog extends Document {
    userId: mongoose.Types.ObjectId;
    userType: 'student' | 'instructor' | 'centerAdmin' | 'center-admin' | 'superAdmin';
    loginTime: Date;
    logoutTime?: Date;
    ipAddress: string;
    userAgent: string;
    sessionDuration?: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const LoginLog: mongoose.Model<ILoginLog, {}, {}, {}, mongoose.Document<unknown, {}, ILoginLog> & ILoginLog & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=LoginLog.d.ts.map