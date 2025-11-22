import mongoose, { Document } from 'mongoose';
export interface INotification extends Document {
    userId: mongoose.Types.ObjectId;
    type: 'learning_progress' | 'recommendation' | 'lesson_plan' | 'quiz' | 'system' | 'achievement';
    title: string;
    message: string;
    data?: any;
    isRead: boolean;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    expiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Notification: mongoose.Model<INotification, {}, {}, {}, mongoose.Document<unknown, {}, INotification> & INotification & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=Notification.d.ts.map