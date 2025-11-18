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