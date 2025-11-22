import mongoose, { Document } from 'mongoose';
export interface IPersonalLesson extends Document {
    studentId: mongoose.Types.ObjectId;
    instructorId?: mongoose.Types.ObjectId;
    centerId: mongoose.Types.ObjectId;
    requestedCenterId?: mongoose.Types.ObjectId;
    isExternalMember: boolean;
    isExternalInstructor?: boolean;
    date: Date;
    startTime: string;
    endTime?: string;
    time: string;
    duration: number;
    status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
    lessonType: string;
    skillLevel: string;
    goals: string;
    notes?: string;
    price: number;
    instructorFee?: number;
    laneRentalFee?: number;
    platformFee?: number;
    totalAmount?: number;
    paymentId?: mongoose.Types.ObjectId;
    specialRequests?: string;
    paymentStatus: 'pending' | 'completed' | 'failed';
    assignedLane?: number;
    laneRentalId?: mongoose.Types.ObjectId;
    poolType?: 'mainPool' | 'kidsPool' | 'auxiliaryPool';
    locationStatus: 'pending' | 'confirmed' | 'rejected';
    locationNotes?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const PersonalLesson: mongoose.Model<IPersonalLesson, {}, {}, {}, mongoose.Document<unknown, {}, IPersonalLesson> & IPersonalLesson & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default PersonalLesson;
export { PersonalLesson };
//# sourceMappingURL=PersonalLesson.d.ts.map