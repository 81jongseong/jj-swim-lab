"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const execAsync_1 = require("../utils/execAsync");
const VideoProcessingJob_1 = require("../models/VideoProcessingJob");
const router = express_1.default.Router();
const videoStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(__dirname, '../../uploads/videos');
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const ext = path_1.default.extname(file.originalname);
        cb(null, `video-${timestamp}-${Math.floor(Math.random() * 1000000000)}${ext}`);
    }
});
const modelStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(__dirname, '../../uploads/models');
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const ext = path_1.default.extname(file.originalname);
        cb(null, `model-${timestamp}-${Math.floor(Math.random() * 1000000000)}${ext}`);
    }
});
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    fileFilter: (req, file, cb) => {
        const allowedVideoTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm'];
        const allowedModelTypes = ['model/fbx', 'model/obj', 'model/gltf', 'model/glb', 'application/octet-stream'];
        if (file.fieldname === 'video' && allowedVideoTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else if (file.fieldname === 'userModel' && (allowedModelTypes.includes(file.mimetype) || file.originalname.match(/\.(fbx|obj|gltf|glb|blend)$/i))) {
            cb(null, true);
        }
        else {
            cb(new Error('지원되지 않는 파일 형식입니다.'));
        }
    },
    limits: {
        fileSize: 200 * 1024 * 1024
    }
});
router.post('/upload', upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'userModel', maxCount: 1 }
]), async (req, res) => {
    try {
        const videoFile = req.files?.['video']?.[0];
        const userModelFile = req.files?.['userModel']?.[0];
        if (!videoFile) {
            return res.status(400).json({
                success: false,
                message: '동영상 파일이 필요합니다.'
            });
        }
        const videoId = `video-${Date.now()}-${Math.floor(Math.random() * 1000000000)}`;
        const outputDir = path_1.default.join(__dirname, '../../uploads/processed', videoId);
        if (!fs_1.default.existsSync(outputDir)) {
            fs_1.default.mkdirSync(outputDir, { recursive: true });
        }
        const videoPath = path_1.default.join(outputDir, 'input_video.mp4');
        fs_1.default.writeFileSync(videoPath, videoFile.buffer);
        let userModelPath = null;
        if (userModelFile) {
            const modelExt = path_1.default.extname(userModelFile.originalname);
            userModelPath = path_1.default.join(outputDir, `user_model${modelExt}`);
            fs_1.default.writeFileSync(userModelPath, userModelFile.buffer);
        }
        const job = new VideoProcessingJob_1.VideoProcessingJob({
            videoId,
            originalVideoPath: videoPath,
            outputDir,
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date(),
            customModel: userModelPath
        });
        await job.save();
        processVideoAsync(videoId, videoPath, outputDir, userModelPath);
        res.json({
            success: true,
            message: '동영상 업로드 및 처리 시작',
            data: {
                videoId,
                status: 'pending',
                estimatedTime: '2-5분',
                hasUserModel: !!userModelPath
            }
        });
    }
    catch (error) {
        console.error('동영상 업로드 오류:', error);
        res.status(500).json({
            success: false,
            message: '동영상 업로드 중 오류가 발생했습니다.',
            error: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
async function processVideoAsync(videoId, videoPath, outputDir, userModelPath) {
    try {
        console.log(`비디오 처리 시작: ${videoId}`);
        await extractMotionData(videoPath, outputDir);
        if (userModelPath) {
            await generate3DAnimationWithUserModel(videoId, outputDir, userModelPath);
        }
        else {
            await generate3DAnimation(videoId, outputDir);
        }
        await VideoProcessingJob_1.VideoProcessingJob.findOneAndUpdate({ videoId }, {
            status: 'completed',
            completedAt: new Date(),
            updatedAt: new Date()
        });
        console.log(`OK 비디오 처리 완료: ${videoId}`);
    }
    catch (error) {
        console.error(`ERROR 비디오 처리 오류 (${videoId}):`, error);
        await VideoProcessingJob_1.VideoProcessingJob.findOneAndUpdate({ videoId }, {
            status: 'failed',
            error: error instanceof Error ? error.message : '알 수 없는 오류',
            updatedAt: new Date()
        });
    }
}
async function extractMotionData(videoPath, outputDir) {
    console.log('수정된 VideoPose3D로 모션 데이터 추출 중...');
    const scriptPath = path_1.default.join(__dirname, '../../pipeline/process_video_fixed.py');
    const command = `py -3.11 "${scriptPath}" --video "${videoPath}" --out "${outputDir}" --fps 30`;
    try {
        const { stdout, stderr } = await (0, execAsync_1.execAsync)(command, {
            cwd: process.cwd(),
            shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/bash',
            timeout: 300000
        });
        console.log('수정된 VideoPose3D 출력:', stdout);
        if (stderr)
            console.log('수정된 VideoPose3D 오류:', stderr);
    }
    catch (error) {
        console.error('수정된 VideoPose3D 실행 오류:', error);
        throw new Error('모션 데이터 추출 실패');
    }
}
async function generate3DAnimation(videoId, outputDir) {
    console.log('Blender로 3D 애니메이션 생성 중...');
    const scriptPath = path_1.default.join(__dirname, '../../scripts/blender_animation_generator.py');
    const command = `py -3.11 "${scriptPath}" "${outputDir}" "${videoId}"`;
    try {
        const { stdout, stderr } = await (0, execAsync_1.execAsync)(command, {
            cwd: process.cwd(),
            shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/bash',
            timeout: 600000
        });
        console.log('Blender 출력:', stdout);
        if (stderr)
            console.log('Blender 오류:', stderr);
    }
    catch (error) {
        console.error('Blender 실행 오류:', error);
        throw new Error('3D 애니메이션 생성 실패');
    }
}
async function generate3DAnimationWithUserModel(videoId, outputDir, userModelPath) {
    console.log('사용자 모델로 3D 애니메이션 생성 중...');
    const scriptPath = path_1.default.join(__dirname, '../../pipeline/retarget_fix_offset.py');
    const bvhPath = path_1.default.join(outputDir, 'motion.bvh');
    const glbPath = path_1.default.join(outputDir, `${videoId}_animated.glb`);
    const debugDir = path_1.default.join(outputDir, 'debug');
    const command = `"C:\\Program Files\\Blender Foundation\\Blender 4.5\\blender.exe" --background --python "${scriptPath}" -- --fbx "${userModelPath}" --bvh "${bvhPath}" --out_glb "${glbPath}" --out_dir "${debugDir}" --start 1 --end 300`;
    try {
        const { stdout, stderr } = await (0, execAsync_1.execAsync)(command, {
            cwd: process.cwd(),
            shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/bash',
            timeout: 600000
        });
        console.log('사용자 모델 Blender 출력:', stdout);
        if (stderr)
            console.log('사용자 모델 Blender 오류:', stderr);
    }
    catch (error) {
        console.error('사용자 모델 Blender 실행 오류:', error);
        throw new Error('사용자 모델 3D 애니메이션 생성 실패');
    }
}
router.get('/status/:videoId', async (req, res) => {
    try {
        const { videoId } = req.params;
        const job = await VideoProcessingJob_1.VideoProcessingJob.findOne({ videoId });
        if (!job) {
            return res.status(404).json({
                success: false,
                message: '비디오 작업을 찾을 수 없습니다.'
            });
        }
        res.json({
            success: true,
            data: {
                videoId: job.videoId,
                status: job.status,
                progress: job.progress || 0,
                createdAt: job.createdAt,
                completedAt: job.completedAt,
                error: job.error
            }
        });
    }
    catch (error) {
        console.error('상태 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '상태 조회 중 오류가 발생했습니다.'
        });
    }
});
router.get('/download/:videoId/:fileType', async (req, res) => {
    try {
        const { videoId, fileType } = req.params;
        const job = await VideoProcessingJob_1.VideoProcessingJob.findOne({ videoId });
        if (!job) {
            return res.status(404).json({
                success: false,
                message: '비디오 작업을 찾을 수 없습니다.'
            });
        }
        let filePath;
        let fileName;
        switch (fileType) {
            case 'glb':
                filePath = path_1.default.join(job.outputDir, `${videoId}_animated.glb`);
                fileName = `${videoId}_animated.glb`;
                break;
            case 'fbx':
                filePath = path_1.default.join(job.outputDir, `${videoId}_animated.fbx`);
                fileName = `${videoId}_animated.fbx`;
                break;
            case 'bvh':
                filePath = path_1.default.join(job.outputDir, 'motion.bvh');
                fileName = `${videoId}_motion.bvh`;
                break;
            case 'debug':
                filePath = path_1.default.join(job.outputDir, 'debug');
                fileName = `${videoId}_debug.zip`;
                break;
            case 'pose_stats':
                filePath = path_1.default.join(job.outputDir, 'debug', 'pose_stats.json');
                fileName = `${videoId}_pose_stats.json`;
                break;
            case 'log':
                filePath = path_1.default.join(job.outputDir, 'debug', 'log.json');
                fileName = `${videoId}_log.json`;
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: '지원되지 않는 파일 형식입니다.'
                });
        }
        if (!fs_1.default.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: '파일을 찾을 수 없습니다.'
            });
        }
        res.download(filePath, fileName);
    }
    catch (error) {
        console.error('파일 다운로드 오류:', error);
        res.status(500).json({
            success: false,
            message: '파일 다운로드 중 오류가 발생했습니다.'
        });
    }
});
exports.default = router;
//# sourceMappingURL=video-upload.js.map