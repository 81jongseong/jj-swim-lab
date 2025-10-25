import { Request, Response } from 'express';
declare const router: import("express-serve-static-core").Router;
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
export default router;
//# sourceMappingURL=runPipeline.d.ts.map