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