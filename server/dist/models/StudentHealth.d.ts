import mongoose, { Document } from 'mongoose';
export interface IHealthRestriction extends Document {
    condition: string;
    severity: 'mild' | 'moderate' | 'severe';
    description: string;
    restrictions: string[];
    alternatives: string[];
    doctorNote?: string;
    startDate: Date;
    endDate?: Date;
}
export interface IStudentHealth extends Document {
    studentId: mongoose.Types.ObjectId;
    centerId: mongoose.Types.ObjectId;
    currentRestrictions: IHealthRestriction[];
    medicalHistory: IHealthRestriction[];
    emergencyContact: {
        name: string;
        relationship: string;
        phone: string;
    };
    allergies: string[];
    medications: string[];
    notes: string;
    lastUpdated: Date;
    updatedBy: mongoose.Types.ObjectId;
}
export declare const StudentHealth: mongoose.Model<IStudentHealth, {}, {}, {}, mongoose.Document<unknown, {}, IStudentHealth> & IStudentHealth & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=StudentHealth.d.ts.map