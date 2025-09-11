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