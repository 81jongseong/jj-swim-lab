import mongoose, { Document } from 'mongoose';
export interface ILessonTicket extends Document {
    userId: mongoose.Types.ObjectId;
    centerId: mongoose.Types.ObjectId;
    type: 'group' | 'personal' | 'unlimited';
    name: string;
    totalSessions: number;
    remainingSessions: number;
    usedSessions: number;
    purchaseDate: Date;
    startDate: Date;
    expiryDate: Date;
    status: 'active' | 'expired' | 'exhausted' | 'suspended';
    price: number;
    allowedCourseTypes?: string[];
    assignedInstructor?: mongoose.Types.ObjectId;
    notes?: string;
    centerMemo?: string;
    isRefunded: boolean;
    refundDate?: Date;
    refundAmount?: number;
    createdAt: Date;
    updatedAt: Date;
    useSession(): Promise<ILessonTicket>;
    cancelSession(): Promise<ILessonTicket>;
}
export interface ILessonTicketModel extends mongoose.Model<ILessonTicket> {
    updateExpiredTickets(): Promise<any>;
    getExpiringSoonTickets(centerId?: mongoose.Types.ObjectId): Promise<ILessonTicket[]>;
}
export declare const LessonTicket: ILessonTicketModel;
//# sourceMappingURL=LessonTicket.d.ts.map