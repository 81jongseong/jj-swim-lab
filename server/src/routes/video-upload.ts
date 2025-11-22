import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { execAsync } from '../utils/execAsync';
import { VideoProcessingJob } from '../models/VideoProcessingJob';
import { logInfo, logError, logWarn, logDebug } from '../utils/logger';
// import { runPipeline, checkPipelineStatus, downloadPipelineResult } from './runPipeline';

const router = express.Router();

// Multer 설정 - 동영상 파일 업로드
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/videos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `video-${timestamp}-${Math.floor(Math.random() * 1000000000)}${ext}`);
  }
});

void videoStorage;

// Multer 설정 - 3D 모델 파일 업로드
const modelStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/models');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `model-${timestamp}-${Math.floor(Math.random() * 1000000000)}${ext}`);
  }
});

void modelStorage;

const upload = multer({
  storage: multer.memoryStorage(), // 메모리 스토리지 사용
  fileFilter: (req, file, cb) => {
    const allowedVideoTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm'];
    const allowedModelTypes = ['model/fbx', 'model/obj', 'model/gltf', 'model/glb', 'application/octet-stream'];
    
    if (file.fieldname === 'video' && allowedVideoTypes.includes(file.mimetype)) {
      cb(null, true);
    } else if (file.fieldname === 'userModel' && (allowedModelTypes.includes(file.mimetype) || file.originalname.match(/\.(fbx|obj|gltf|glb|blend)$/i))) {
      cb(null, true);
    } else {
      cb(new Error('지원되지 않는 파일 형식입니다.'));
    }
  },
  limits: {
    fileSize: 200 * 1024 * 1024 // 200MB 제한
  }
});

// 동영상 업로드 및 처리 시작
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

    // 파일 저장
    const videoId = `video-${Date.now()}-${Math.floor(Math.random() * 1000000000)}`;
    const outputDir = path.join(__dirname, '../../uploads/processed', videoId);
    
    // 출력 디렉토리 생성
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 동영상 파일 저장
    const videoPath = path.join(outputDir, 'input_video.mp4');
    fs.writeFileSync(videoPath, videoFile.buffer);

    // 사용자 모델 파일 저장 (있는 경우)
    let userModelPath = null;
    if (userModelFile) {
      const modelExt = path.extname(userModelFile.originalname);
      userModelPath = path.join(outputDir, `user_model${modelExt}`);
      fs.writeFileSync(userModelPath, userModelFile.buffer);
    }

    // MongoDB에 작업 상태 저장
    const job = new VideoProcessingJob({
      videoId,
      originalVideoPath: videoPath,
      outputDir,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      customModel: userModelPath
    });

    await job.save();

    // 비동기로 Python 스크립트 실행
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

  } catch (error) {
    logError('동영상 업로드 오류', error);
    res.status(500).json({
      success: false,
      message: '동영상 업로드 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

// 비동기 비디오 처리 함수
async function processVideoAsync(videoId: string, videoPath: string, outputDir: string, userModelPath?: string) {
  try {
    console.log(`비디오 처리 시작: ${videoId}`);
    
    // 1. VideoPose3D로 모션 데이터 추출
    await extractMotionData(videoPath, outputDir);
    
    // 2. Blender로 3D 애니메이션 생성
    if (userModelPath) {
      // 사용자 모델이 있는 경우
      await generate3DAnimationWithUserModel(videoId, outputDir, userModelPath);
    } else {
      // 기본 모델 사용
      await generate3DAnimation(videoId, outputDir);
    }
    
    // 3. 상태 업데이트
    await VideoProcessingJob.findOneAndUpdate(
      { videoId },
      { 
        status: 'completed',
        completedAt: new Date(),
        updatedAt: new Date()
      }
    );

    console.log(`OK 비디오 처리 완료: ${videoId}`);

  } catch (error) {
    logError(`ERROR 비디오 처리 오류 (${videoId}):`, error);
    
    await VideoProcessingJob.findOneAndUpdate(
      { videoId },
      { 
        status: 'failed',
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        updatedAt: new Date()
      }
    );
  }
}

// 수정된 VideoPose3D로 모션 데이터 추출 (좌표 정규화 및 스케일링 개선)
async function extractMotionData(videoPath: string, outputDir: string) {
  console.log('수정된 VideoPose3D로 모션 데이터 추출 중...');
  
  const scriptPath = path.join(__dirname, '../../pipeline/process_video_fixed.py');
  const command = `py -3.11 "${scriptPath}" --video "${videoPath}" --out "${outputDir}" --fps 30`;
  
  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd: process.cwd(),
      shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/bash',
      timeout: 300000 // 5분 타임아웃
    });
    
    console.log('수정된 VideoPose3D 출력:', stdout);
    if (stderr) console.log('수정된 VideoPose3D 오류:', stderr);
    
  } catch (error) {
    logError('수정된 VideoPose3D 실행 오류', error);
    throw new Error('모션 데이터 추출 실패');
  }
}

// Blender로 3D 애니메이션 생성
async function generate3DAnimation(videoId: string, outputDir: string) {
  console.log('Blender로 3D 애니메이션 생성 중...');
  
  const scriptPath = path.join(__dirname, '../../scripts/blender_animation_generator.py');
  const command = `py -3.11 "${scriptPath}" "${outputDir}" "${videoId}"`;
  
  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd: process.cwd(),
      shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/bash',
      timeout: 600000 // 10분 타임아웃
    });
    
    console.log('Blender 출력:', stdout);
    if (stderr) console.log('Blender 오류:', stderr);
    
  } catch (error) {
    logError('Blender 실행 오류', error);
    throw new Error('3D 애니메이션 생성 실패');
  }
}

// 사용자 모델로 3D 애니메이션 생성 (수정된 리타겟 스크립트 사용)
async function generate3DAnimationWithUserModel(videoId: string, outputDir: string, userModelPath: string) {
  console.log('사용자 모델로 3D 애니메이션 생성 중...');
  
  const scriptPath = path.join(__dirname, '../../pipeline/retarget_fix_offset.py');
  const bvhPath = path.join(outputDir, 'motion.bvh');
  const glbPath = path.join(outputDir, `${videoId}_animated.glb`);
  const debugDir = path.join(outputDir, 'debug');
  
  const command = `"C:\\Program Files\\Blender Foundation\\Blender 4.5\\blender.exe" --background --python "${scriptPath}" -- --fbx "${userModelPath}" --bvh "${bvhPath}" --out_glb "${glbPath}" --out_dir "${debugDir}" --start 1 --end 300`;
  
  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd: process.cwd(),
      shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/bash',
      timeout: 600000 // 10분 타임아웃
    });
    
    console.log('사용자 모델 Blender 출력:', stdout);
    if (stderr) console.log('사용자 모델 Blender 오류:', stderr);
    
  } catch (error) {
    logError('사용자 모델 Blender 실행 오류', error);
    throw new Error('사용자 모델 3D 애니메이션 생성 실패');
  }
}

// 처리 상태 조회
router.get('/status/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const job = await VideoProcessingJob.findOne({ videoId });
    
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
    
  } catch (error) {
    logError('상태 조회 오류', error);
    res.status(500).json({
      success: false,
      message: '상태 조회 중 오류가 발생했습니다.'
    });
  }
});

// 결과 파일 다운로드
router.get('/download/:videoId/:fileType', async (req, res) => {
  try {
    const { videoId, fileType } = req.params;
    const job = await VideoProcessingJob.findOne({ videoId });
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: '비디오 작업을 찾을 수 없습니다.'
      });
    }
    
    let filePath: string;
    let fileName: string;
    
    switch (fileType) {
      case 'glb':
        filePath = path.join(job.outputDir, `${videoId}_animated.glb`);
        fileName = `${videoId}_animated.glb`;
        break;
      case 'fbx':
        filePath = path.join(job.outputDir, `${videoId}_animated.fbx`);
        fileName = `${videoId}_animated.fbx`;
        break;
      case 'bvh':
        filePath = path.join(job.outputDir, 'motion.bvh');
        fileName = `${videoId}_motion.bvh`;
        break;
      case 'debug':
        filePath = path.join(job.outputDir, 'debug');
        fileName = `${videoId}_debug.zip`;
        break;
      case 'pose_stats':
        filePath = path.join(job.outputDir, 'debug', 'pose_stats.json');
        fileName = `${videoId}_pose_stats.json`;
        break;
      case 'log':
        filePath = path.join(job.outputDir, 'debug', 'log.json');
        fileName = `${videoId}_log.json`;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: '지원되지 않는 파일 형식입니다.'
        });
    }
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: '파일을 찾을 수 없습니다.'
      });
    }
    
    res.download(filePath, fileName);
    
  } catch (error) {
    logError('파일 다운로드 오류', error);
    res.status(500).json({
      success: false,
      message: '파일 다운로드 중 오류가 발생했습니다.'
    });
  }
});

// 새로운 파이프라인 라우트들 (임시 비활성화)
// router.post('/pipeline/run', runPipeline);
// router.get('/pipeline/status', checkPipelineStatus);
// router.get('/pipeline/download', downloadPipelineResult);

export default router;
