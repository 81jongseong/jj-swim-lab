import mongoose, { Document } from 'mongoose';
export interface IUserActivity extends Document {
    userId: mongoose.Types.ObjectId;
    userType: 'superAdmin' | 'centerAdmin' | 'instructor' | 'student' | 'guest';
    action: string;
    resource: string;
    resourceId?: string;
    details: any;
    ip: string;
    userAgent?: string;
    timestamp: Date;
    sessionId?: string;
    success: boolean;
    errorMessage?: string;
    duration?: number;
    metadata?: {
        browser?: string;
        os?: string;
        device?: string;
        location?: string;
    };
}
declare const UserActivity: mongoose.Model<IUserActivity, {}, {}, {}, mongoose.Document<unknown, {}, IUserActivity> & IUserActivity & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default UserActivity;
//# sourceMappingURL=UserActivity.d.ts.map