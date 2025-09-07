import { Request, Response } from 'express';
export interface PipelineRequest {
    videoPath: string;
    fbxPath: string;
    outputDir: string;
    maxFrames?: number;
    startFrame?: number;
    endFrame?: number;
}
export interface PipelineResult {
    success: boolean;
    message: string;
    files: {
        keypoints2d: string;
        poses3d: string;
        bvh: string;
        glb: string;
        preview: string;
    };
    metadata: {
        frameCount: number;
        fps: number;
        duration: number;
    };
}
export declare function runPipeline(req: Request, res: Response): Promise<void>;
export declare function checkPipelineStatus(req: Request, res: Response): Promise<void>;
export declare function downloadPipelineResult(req: Request, res: Response): Promise<void>;
declare const _default: {
    runPipeline: typeof runPipeline;
    checkPipelineStatus: typeof checkPipelineStatus;
    downloadPipelineResult: typeof downloadPipelineResult;
};
export default _default;
//# sourceMappingURL=runPipeline.d.ts.map