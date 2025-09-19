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
export interface IHealthData extends Document {
    studentId: mongoose.Types.ObjectId;
    height: number;
    weight: number;
    bmi: number;
    bloodPressure: string;
    heartRate: number;
    flexibility: number;
    strength: number;
    endurance: number;
    exerciseLevel: string;
    swimmingExperience: string;
    healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
    exerciseCompliance: number;
    lastHealthCheck: Date;
    aiRecommendations: {
        exerciseIntensity: number;
        duration: number;
        frequency: number;
        restPeriod: number;
        specialNotes: string;
    };
    privacySettings: {
        height: boolean;
        weight: boolean;
        bmi: boolean;
        bloodPressure: boolean;
        heartRate: boolean;
        flexibility: boolean;
        strength: boolean;
        endurance: boolean;
        exerciseLevel: boolean;
        swimmingExperience: boolean;
        healthStatus: boolean;
        exerciseCompliance: boolean;
    };
    createdAt: Date;
    updatedAt: Date;
}
export declare const HealthData: mongoose.Model<IHealthData, {}, {}, {}, mongoose.Document<unknown, {}, IHealthData> & IHealthData & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default HealthData;
//# sourceMappingURL=HealthData.d.ts.map