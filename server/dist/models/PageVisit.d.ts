import mongoose, { Document } from 'mongoose';
export interface IPageVisit extends Document {
    userId?: mongoose.Types.ObjectId;
    userType?: 'student' | 'instructor' | 'centerAdmin' | 'superAdmin' | 'guest';
    path: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    statusCode: number;
    responseTime: number;
    ipAddress: string;
    userAgent: string;
    referrer?: string;
    visitTime: Date;
    sessionId?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const PageVisit: mongoose.Model<IPageVisit, {}, {}, {}, mongoose.Document<unknown, {}, IPageVisit> & IPageVisit & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=PageVisit.d.ts.map