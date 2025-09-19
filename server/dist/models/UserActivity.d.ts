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