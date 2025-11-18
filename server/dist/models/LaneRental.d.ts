import mongoose, { Document } from 'mongoose';
export interface ILaneRental extends Document {
    userId: mongoose.Types.ObjectId;
    centerId: mongoose.Types.ObjectId;
    date: Date;
    startTime: string;
    endTime: string;
    duration: number;
    laneNumber: number;
    poolType: 'mainPool' | 'kidsPool' | 'auxiliaryPool';
    status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
    purpose: string;
    notes?: string;
    price: number;
    paymentStatus: 'pending' | 'completed' | 'failed';
    createdAt: Date;
    updatedAt: Date;
}
declare const LaneRental: mongoose.Model<ILaneRental, {}, {}, {}, mongoose.Document<unknown, {}, ILaneRental> & ILaneRental & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default LaneRental;
export { LaneRental };
//# sourceMappingURL=LaneRental.d.ts.map