import mongoose, { Document } from 'mongoose';
export interface INotification extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'course' | 'booking' | 'payment' | 'system';
    category: 'general' | 'course' | 'booking' | 'payment' | 'membership' | 'ai_analysis' | 'system';
    isRead: boolean;
    isEmailSent: boolean;
    isPushSent: boolean;
    relatedId?: mongoose.Types.ObjectId;
    relatedType?: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    scheduledAt?: Date;
    expiresAt?: Date;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Notification: mongoose.Model<INotification, {}, {}, {}, mongoose.Document<unknown, {}, INotification, {}, {}> & INotification & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Notification.d.ts.map