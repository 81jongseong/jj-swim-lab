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