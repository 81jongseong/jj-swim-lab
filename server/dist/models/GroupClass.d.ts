import mongoose, { Document, Types } from 'mongoose';
export interface IGroupClass extends Document {
    _id: Types.ObjectId;
    className: string;
    addStudent(userId: Types.ObjectId): Promise<void>;
    removeStudent(userId: Types.ObjectId): Promise<void>;
    updateStudentStatus(userId: Types.ObjectId, status: 'active' | 'inactive' | 'completed' | 'dropped'): Promise<void>;
    description?: string;
    centerId: Types.ObjectId;
    instructorId: Types.ObjectId;
    students: {
        userId: Types.ObjectId;
        enrolledAt: Date;
        status: 'active' | 'inactive' | 'completed' | 'dropped';
        attendanceRate?: number;
        completionRate?: number;
    }[];
    schedule: {
        dayOfWeek: number[];
        startTime: string;
        endTime: string;
        duration: number;
    };
    period: {
        startDate: Date;
        endDate: Date;
        totalSessions: number;
        completedSessions: number;
    };
    capacity: {
        min: number;
        max: number;
        current: number;
    };
    programId?: Types.ObjectId;
    level: 'beginner' | 'intermediate' | 'advanced' | 'mixed';
    targetAge?: {
        min: number;
        max: number;
    };
    status: 'planned' | 'active' | 'completed' | 'cancelled';
    fee?: {
        amount: number;
        currency: string;
        billingCycle: 'monthly' | 'per_session' | 'total';
    };
    notes?: string;
    announcements?: {
        title: string;
        content: string;
        createdAt: Date;
        createdBy: Types.ObjectId;
    }[];
    createdAt: Date;
    updatedAt: Date;
    createdBy: Types.ObjectId;
}
declare const _default: mongoose.Model<IGroupClass, {}, {}, {}, mongoose.Document<unknown, {}, IGroupClass> & IGroupClass & Required<{
    _id: Types.ObjectId;
}>, any>;
export default _default;
//# sourceMappingURL=GroupClass.d.ts.map