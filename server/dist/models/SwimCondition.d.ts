import mongoose, { Document } from 'mongoose';
export interface ISwimCondition extends Document {
    id: string;
    name: string;
    label?: string;
    category: string;
    group: string;
    description?: string;
    swimmingGuidance?: string;
    recommendedStrokes?: string[];
    avoidStrokes?: string[];
    recommendedMethods?: string[];
    avoidMethods?: string[];
    recommendedDrills?: string[];
    avoidDrills?: string[];
    rationale?: string;
    evidence?: Array<{
        label: string;
        url: string;
    }>;
    keywords?: string[];
    severity?: string;
    isMSK28?: boolean;
    isActive: boolean;
    order?: number;
    centerId?: mongoose.Types.ObjectId;
    createdBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const SwimCondition: mongoose.Model<any, {}, {}, {}, any, any>;
//# sourceMappingURL=SwimCondition.d.ts.map