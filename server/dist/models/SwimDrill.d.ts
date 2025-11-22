import mongoose, { Document } from 'mongoose';
export interface ISwimDrill extends Document {
    id: string;
    name: string;
    category: string;
    description: string;
    tags?: string[];
    cues?: string[];
    examples?: string[];
    videoUrl?: string;
    recommendedFor?: string[];
    avoidFor?: string[];
    targetStroke?: string[];
    difficulty?: string;
    isActive: boolean;
    order?: number;
    centerId?: mongoose.Types.ObjectId;
    createdBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const SwimDrill: mongoose.Model<any, {}, {}, {}, any, any>;
//# sourceMappingURL=SwimDrill.d.ts.map