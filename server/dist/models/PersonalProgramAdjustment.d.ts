import mongoose, { Document } from 'mongoose';
export interface IPersonalProgramAdjustment extends Document {
    programId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    groupClassId: mongoose.Types.ObjectId;
    adjustments: {
        globalPaceAdjustment: number;
        globalPaceReason: string;
        avoidStrokes: string[];
        avoidDrills: string[];
        avoidEquipment: string[];
        warnings: Array<{
            type: 'health' | 'condition' | 'technique';
            severity: 'info' | 'warning' | 'critical';
            message: string;
            relatedCondition?: string;
        }>;
        sessionAdjustments: Array<{
            sessionDate: string;
            dayOfWeek: string;
            paceAdjustment: number;
            restAdjustment: number;
            skipBlocks: number[];
            modifiedBlocks: Array<{
                blockIndex: number;
                originalDescription: string;
                modifiedDescription: string;
                reason: string;
            }>;
            notes: string;
        }>;
    };
    generatedBy: {
        conditionIds: string[];
        healthConditions: string[];
        currentCondition: string;
        generatedAt: Date;
    };
    viewedByMember: boolean;
    viewedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IPersonalProgramAdjustment, {}, {}, {}, mongoose.Document<unknown, {}, IPersonalProgramAdjustment> & IPersonalProgramAdjustment & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=PersonalProgramAdjustment.d.ts.map