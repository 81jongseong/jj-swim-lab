export interface Video3DConversionResult {
    success: boolean;
    data?: {
        originalFrames: string[];
        depthMaps: string[];
        reconstructed3D: string[];
        video3D: string;
        analysisData: {
            bodyPositions3D: any[];
            jointAngles3D: any[];
            movementTrajectories3D: any[];
            swimmingMetrics3D: any;
            swimming3DAnalysis: Swimming3DAnalysis;
        };
    };
    message?: string;
}
export interface Swimming3DAnalysis {
    bodyAlignment3D: {
        spineCurvature: number;
        bodyRotation: number;
        lateralDeviation: number;
        score: number;
    };
    strokeTechnique3D: {
        armTrajectory: any[];
        handEntryAngle: number;
        pullPattern: any[];
        score: number;
    };
    breathingPattern3D: {
        headRotation: number;
        breathingTiming: number;
        bodyPosition: any;
        score: number;
    };
    efficiency3D: {
        dragCoefficient: number;
        propulsionEfficiency: number;
        energyExpenditure: number;
        score: number;
    };
    meta?: {
        technique: string;
        level: string;
    };
}
export declare class Video3DConversionEngine {
    static convertAndAnalyzeVideo(videoPath: string, outputDir: string, technique: string, level: string): Promise<Video3DConversionResult>;
    private static runPythonConverter;
    private static extractFrames;
    private static simulateFrameExtraction;
    private static generateDepthMaps;
    private static generateDepthMapWithMiDaS;
    private static generateSimulationDepthMap;
    private static apply3DEffect;
    private static reconstruct3D;
    private static create3DVideo;
    private static simulate3DVideo;
    private static generateBlenderScript;
    private static runBlenderReconstruction;
    private static analyze3DData;
    private static generateSimulationAnalysisData;
    private static performSwimming3DAnalysis;
    private static analyze3DBodyAlignment;
    private static analyze3DStrokeTechnique;
    private static analyze3DBreathingPattern;
    private static analyze3DEfficiency;
    private static generateSimulated3DBodyPositions;
    private static generateSimulated3DJointAngles;
    private static generateSimulated3DTrajectories;
    private static generateSimulated3DSwimmingMetrics;
    private static calculateSpineCurvature3D;
    private static calculateBodyRotation3D;
    private static calculateLateralDeviation3D;
    private static calculateArmTrajectory3D;
    private static calculateHandEntryAngle3D;
    private static calculatePullPattern3D;
    private static calculateHeadRotation3D;
    private static calculateBreathingTiming3D;
    private static calculateBodyPosition3D;
    private static calculateDragCoefficient3D;
    private static calculatePropulsionEfficiency3D;
    private static calculateEnergyExpenditure3D;
    private static getFileList;
}
//# sourceMappingURL=Video3DConversionEngine.d.ts.map