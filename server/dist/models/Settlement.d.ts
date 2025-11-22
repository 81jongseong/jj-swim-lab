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
export interface ISettlement extends Document {
    recipientType: 'instructor' | 'center' | 'platform';
    recipientId: mongoose.Types.ObjectId;
    recipientTypeModel: 'User' | 'Center';
    periodType: 'weekly' | 'monthly';
    periodStart: Date;
    periodEnd: Date;
    totalAmount: number;
    items: Array<{
        personalLessonId: mongoose.Types.ObjectId;
        paymentId: mongoose.Types.ObjectId;
        amount: number;
        description: string;
        date: Date;
    }>;
    breakdown: {
        instructorFee?: number;
        laneRentalFee?: number;
        platformFee?: number;
        deductedAmount?: number;
        netAmount: number;
    };
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
    processedAt?: Date;
    processedBy?: mongoose.Types.ObjectId;
    transactionId?: string;
    receiptUrl?: string;
    notes?: string;
    errorMessage?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const Settlement: mongoose.Model<ISettlement, {}, {}, {}, mongoose.Document<unknown, {}, ISettlement> & ISettlement & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default Settlement;
export { Settlement };
//# sourceMappingURL=Settlement.d.ts.map