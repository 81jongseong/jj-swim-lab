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
export interface ILoginLog extends Document {
    userId: mongoose.Types.ObjectId;
    userType: 'student' | 'instructor' | 'centerAdmin' | 'superAdmin';
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