import mongoose, { Document } from 'mongoose';
export interface ISwimmingStyle extends Document {
    name: string;
    displayName: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    isActive: boolean;
    isPublicDemo: boolean;
    modelUrl?: string;
    poster?: string;
    tags?: string[];
    cues?: string[];
    cautions?: string[];
    createdAt: Date;
    updatedAt: Date;
}
export declare const SwimmingStyle: mongoose.Model<any, {}, {}, {}, any, any>;
//# sourceMappingURL=SwimmingStyle.d.ts.map