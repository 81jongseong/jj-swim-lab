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
import mongoose from 'mongoose';
export declare function getNextTeachingStep(userId: mongoose.Types.ObjectId, teachingProgress: any[], preferredStrokes?: string[], currentLevel?: string): Promise<{
    methodId: mongoose.Types.ObjectId;
    methodName: string;
    stroke: string;
    nextStep: any;
    completionRate: number;
} | null>;
export declare function convertTeachingStepToTrainingSet(step: any, stroke: string, level: string, poolLength?: number): any;
export declare function generateProgramFromTeachingMethod(userId: mongoose.Types.ObjectId, teachingProgress: any[], memberData: {
    currentLevel: string;
    preferredStrokes: string[];
    poolLength: number;
    sessionDuration: number;
}): Promise<{
    summary: string;
    planExplanation: string;
    totalDuration: number;
    totalMeters: number;
    blocks: any[];
} | null>;
export declare function generateDefaultTechniqueProgram(currentLevel: string, mainStrokes?: string[], poolLength?: number, sessionDuration?: number): {
    summary: string;
    planExplanation: string;
    totalDuration: number;
    totalMeters: number;
    blocks: any[];
};
//# sourceMappingURL=teachingMethodToProgramConverter.d.ts.map