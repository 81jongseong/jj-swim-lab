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