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