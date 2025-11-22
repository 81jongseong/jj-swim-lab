"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runPipeline = runPipeline;
exports.checkPipelineStatus = checkPipelineStatus;
exports.downloadPipelineResult = downloadPipelineResult;
const express_1 = require("express");
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const spawnProc_1 = __importDefault(require("../utils/spawnProc"));
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
async function runPipeline(req, res) {
    try {
        const { videoPath, fbxPath, outputDir, maxFrames = 300, startFrame = 1, endFrame = 300 } = req.body;
        console.log('[PIPELINE] 파이프라인 시작');
        console.log(`[PIPELINE] 비디오: ${videoPath}`);
        console.log(`[PIPELINE] FBX: ${fbxPath}`);
        console.log(`[PIPELINE] 출력: ${outputDir}`);
        if (!await spawnProc_1.default.checkFileExists(videoPath)) {
            throw new Error(`비디오 파일이 존재하지 않습니다: ${videoPath}`);
        }
        if (!await spawnProc_1.default.checkFileExists(fbxPath)) {
            throw new Error(`FBX 파일이 존재하지 않습니다: ${fbxPath}`);
        }
        await spawnProc_1.default.ensureDir(outputDir);
        const videoAbsPath = spawnProc_1.default.resolvePath(videoPath);
        const fbxAbsPath = spawnProc_1.default.resolvePath(fbxPath);
        const outputAbsDir = spawnProc_1.default.resolvePath(outputDir);
        const pipelineDir = path_1.default.join(__dirname, '..', 'pipeline');
        const processVideoScript = path_1.default.join(pipelineDir, 'process_video.py');
        const blenderApplyScript = path_1.default.join(pipelineDir, 'blender_apply_bvh_strict.py');
        console.log('[PIPELINE] 1단계: VideoPose3D 처리 시작');
        const videoResult = await spawnProc_1.default.runPython(processVideoScript, [
            '--video', videoAbsPath,
            '--out', outputAbsDir,
            '--max_frames', maxFrames.toString()
        ], {
            label: 'VIDEO',
            timeout: 300000
        });
        if (!videoResult.success) {
            throw new Error(`VideoPose3D 처리 실패: ${videoResult.stderr}`);
        }
        console.log('[PIPELINE] 1단계 완료: VideoPose3D 처리');
        const bvhPath = path_1.default.join(outputAbsDir, 'motion.bvh');
        if (!await spawnProc_1.default.checkFileExists(bvhPath)) {
            throw new Error(`BVH 파일이 생성되지 않았습니다: ${bvhPath}`);
        }
        console.log('[PIPELINE] 2단계: Blender BVH 적용 시작');
        const glbPath = path_1.default.join(outputAbsDir, 'result.glb');
        const previewPath = path_1.default.join(outputAbsDir, 'preview.png');
        const blenderResult = await spawnProc_1.default.runBlender(blenderApplyScript, [
            '--fbx', fbxAbsPath,
            '--bvh', bvhPath,
            '--out_glb', glbPath,
            '--start', startFrame.toString(),
            '--end', endFrame.toString()
        ], {
            label: 'BLENDER',
            timeout: 600000
        });
        if (!blenderResult.success) {
            throw new Error(`Blender 처리 실패: ${blenderResult.stderr}`);
        }
        console.log('[PIPELINE] 2단계 완료: Blender BVH 적용');
        const resultFiles = {
            keypoints2d: path_1.default.join(outputAbsDir, 'keypoints_2d.json'),
            poses3d: path_1.default.join(outputAbsDir, 'poses3d.npy'),
            bvh: bvhPath,
            glb: glbPath,
            preview: previewPath
        };
        for (const [name, filePath] of Object.entries(resultFiles)) {
            if (!await spawnProc_1.default.checkFileExists(filePath)) {
                console.warn(`[PIPELINE] 파일이 생성되지 않았습니다: ${name} - ${filePath}`);
            }
        }
        const metadata = await extractMetadata(resultFiles.keypoints2d, videoAbsPath);
        const result = {
            success: true,
            message: '파이프라인 완료',
            files: resultFiles,
            metadata
        };
        console.log('[PIPELINE] 파이프라인 완료');
        console.log(`[PIPELINE] 결과 GLB: ${glbPath}`);
        console.log(`[PIPELINE] 프레임 수: ${metadata.frameCount}`);
        console.log(`[PIPELINE] FPS: ${metadata.fps}`);
        res.json(result);
    }
    catch (error) {
        (0, logger_1.logError)('[PIPELINE] 파이프라인 실패:', error);
        const errorResult = {
            success: false,
            message: error instanceof Error ? error.message : '알 수 없는 오류',
            files: {
                keypoints2d: '',
                poses3d: '',
                bvh: '',
                glb: '',
                preview: ''
            },
            metadata: {
                frameCount: 0,
                fps: 0,
                duration: 0
            }
        };
        res.status(500).json(errorResult);
    }
}
async function extractMetadata(keypointsPath, videoPath) {
    try {
        const keypointsData = await promises_1.default.readFile(keypointsPath, 'utf-8');
        const keypoints = JSON.parse(keypointsData);
        const frameCount = keypoints.length;
        const cv2 = require('opencv4nodejs');
        const cap = new cv2.VideoCapture(videoPath);
        const fps = cap.get(cv2.CAP_PROP_FPS);
        const duration = frameCount / fps;
        return {
            frameCount,
            fps: Math.round(fps * 100) / 100,
            duration: Math.round(duration * 100) / 100
        };
    }
    catch (error) {
        console.warn('[PIPELINE] 메타데이터 추출 실패:', error);
        return {
            frameCount: 0,
            fps: 0,
            duration: 0
        };
    }
}
async function checkPipelineStatus(req, res) {
    try {
        const { outputDir } = req.query;
        if (!outputDir || typeof outputDir !== 'string') {
            res.status(400).json({ error: 'outputDir 파라미터가 필요합니다.' });
            return;
        }
        const outputAbsDir = spawnProc_1.default.resolvePath(outputDir);
        const files = {
            keypoints2d: path_1.default.join(outputAbsDir, 'keypoints_2d.json'),
            poses3d: path_1.default.join(outputAbsDir, 'poses3d.npy'),
            bvh: path_1.default.join(outputAbsDir, 'motion.bvh'),
            glb: path_1.default.join(outputAbsDir, 'result.glb'),
            preview: path_1.default.join(outputAbsDir, 'preview.png')
        };
        const status = {
            ready: false,
            files: {},
            progress: 0
        };
        let completedFiles = 0;
        const totalFiles = Object.keys(files).length;
        for (const [name, filePath] of Object.entries(files)) {
            const exists = await spawnProc_1.default.checkFileExists(filePath);
            status.files[name] = exists;
            if (exists)
                completedFiles++;
        }
        status.progress = Math.round((completedFiles / totalFiles) * 100);
        status.ready = completedFiles === totalFiles;
        res.json(status);
    }
    catch (error) {
        (0, logger_1.logError)('[PIPELINE] 상태 확인 실패:', error);
        res.status(500).json({ error: '상태 확인 실패' });
    }
}
async function downloadPipelineResult(req, res) {
    try {
        const { outputDir, fileType } = req.query;
        if (!outputDir || typeof outputDir !== 'string') {
            res.status(400).json({ error: 'outputDir 파라미터가 필요합니다.' });
            return;
        }
        if (!fileType || typeof fileType !== 'string') {
            res.status(400).json({ error: 'fileType 파라미터가 필요합니다.' });
            return;
        }
        const outputAbsDir = spawnProc_1.default.resolvePath(outputDir);
        const fileMap = {
            'keypoints2d': 'keypoints_2d.json',
            'poses3d': 'poses3d.npy',
            'bvh': 'motion.bvh',
            'glb': 'result.glb',
            'preview': 'preview.png'
        };
        const fileName = fileMap[fileType];
        if (!fileName) {
            res.status(400).json({ error: '지원되지 않는 파일 타입입니다.' });
            return;
        }
        const filePath = path_1.default.join(outputAbsDir, fileName);
        if (!await spawnProc_1.default.checkFileExists(filePath)) {
            res.status(404).json({ error: '파일이 존재하지 않습니다.' });
            return;
        }
        res.download(filePath, fileName);
    }
    catch (error) {
        (0, logger_1.logError)('[PIPELINE] 다운로드 실패:', error);
        res.status(500).json({ error: '다운로드 실패' });
    }
}
router.post('/run', runPipeline);
router.get('/status/:jobId', checkPipelineStatus);
router.get('/download/:jobId', downloadPipelineResult);
exports.default = router;
//# sourceMappingURL=runPipeline.js.map