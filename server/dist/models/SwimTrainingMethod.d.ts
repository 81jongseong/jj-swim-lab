import mongoose, { Document } from 'mongoose';
export interface ISwimTrainingMethod extends Document {
    id: string;
    title: string;
    category: string;
    description: string;
    recommendedDrills?: string[];
    avoidForConditions?: string[];
    recommendForConditions?: string[];
    evidence?: Array<{
        label: string;
        url: string;
    }>;
    targetLevel?: string[];
    intensity?: string;
    isActive: boolean;
    order?: number;
    centerId?: mongoose.Types.ObjectId;
    createdBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const SwimTrainingMethod: mongoose.Model<any, {}, {}, {}, any, any>;
//# sourceMappingURL=SwimTrainingMethod.d.ts.map