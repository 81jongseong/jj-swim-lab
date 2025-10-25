import { Request, Response, Router } from 'express';
import path from 'path';
import fs from 'fs/promises';
import SpawnProc from '../utils/spawnProc';

const router = Router();

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

/**
 * 전체 파이프라인 실행
 * VideoPose3D → BVH → FBX → GLB
 */
export async function runPipeline(req: Request, res: Response): Promise<void> {
  try {
    const { videoPath, fbxPath, outputDir, maxFrames = 300, startFrame = 1, endFrame = 300 }: PipelineRequest = req.body;

    console.log('[PIPELINE] 파이프라인 시작');
    console.log(`[PIPELINE] 비디오: ${videoPath}`);
    console.log(`[PIPELINE] FBX: ${fbxPath}`);
    console.log(`[PIPELINE] 출력: ${outputDir}`);

    // 입력 파일 검증
    if (!await SpawnProc.checkFileExists(videoPath)) {
      throw new Error(`비디오 파일이 존재하지 않습니다: ${videoPath}`);
    }

    if (!await SpawnProc.checkFileExists(fbxPath)) {
      throw new Error(`FBX 파일이 존재하지 않습니다: ${fbxPath}`);
    }

    // 출력 디렉토리 생성
    await SpawnProc.ensureDir(outputDir);

    // 절대 경로로 변환
    const videoAbsPath = SpawnProc.resolvePath(videoPath);
    const fbxAbsPath = SpawnProc.resolvePath(fbxPath);
    const outputAbsDir = SpawnProc.resolvePath(outputDir);

    // 파이프라인 스크립트 경로
    const pipelineDir = path.join(__dirname, '..', 'pipeline');
    const processVideoScript = path.join(pipelineDir, 'process_video.py');
    const blenderApplyScript = path.join(pipelineDir, 'blender_apply_bvh_strict.py');

    // 1단계: VideoPose3D 처리
    console.log('[PIPELINE] 1단계: VideoPose3D 처리 시작');
    
    const videoResult = await SpawnProc.runPython(processVideoScript, [
      '--video', videoAbsPath,
      '--out', outputAbsDir,
      '--max_frames', maxFrames.toString()
    ], {
      label: 'VIDEO',
      timeout: 300000 // 5분
    });

    if (!videoResult.success) {
      throw new Error(`VideoPose3D 처리 실패: ${videoResult.stderr}`);
    }

    console.log('[PIPELINE] 1단계 완료: VideoPose3D 처리');

    // BVH 파일 경로
    const bvhPath = path.join(outputAbsDir, 'motion.bvh');
    
    if (!await SpawnProc.checkFileExists(bvhPath)) {
      throw new Error(`BVH 파일이 생성되지 않았습니다: ${bvhPath}`);
    }

    // 2단계: Blender BVH 적용
    console.log('[PIPELINE] 2단계: Blender BVH 적용 시작');
    
    const glbPath = path.join(outputAbsDir, 'result.glb');
    const previewPath = path.join(outputAbsDir, 'preview.png');

    const blenderResult = await SpawnProc.runBlender(blenderApplyScript, [
      '--fbx', fbxAbsPath,
      '--bvh', bvhPath,
      '--out_glb', glbPath,
      '--start', startFrame.toString(),
      '--end', endFrame.toString()
    ], {
      label: 'BLENDER',
      timeout: 600000 // 10분
    });

    if (!blenderResult.success) {
      throw new Error(`Blender 처리 실패: ${blenderResult.stderr}`);
    }

    console.log('[PIPELINE] 2단계 완료: Blender BVH 적용');

    // 결과 파일 검증
    const resultFiles = {
      keypoints2d: path.join(outputAbsDir, 'keypoints_2d.json'),
      poses3d: path.join(outputAbsDir, 'poses3d.npy'),
      bvh: bvhPath,
      glb: glbPath,
      preview: previewPath
    };

    for (const [name, filePath] of Object.entries(resultFiles)) {
      if (!await SpawnProc.checkFileExists(filePath)) {
        console.warn(`[PIPELINE] 파일이 생성되지 않았습니다: ${name} - ${filePath}`);
      }
    }

    // 메타데이터 추출
    const metadata = await extractMetadata(resultFiles.keypoints2d, videoAbsPath);

    const result: PipelineResult = {
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

  } catch (error) {
    console.error('[PIPELINE] 파이프라인 실패:', error);
    
    const errorResult: PipelineResult = {
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

/**
 * 메타데이터 추출
 */
async function extractMetadata(keypointsPath: string, videoPath: string): Promise<{
  frameCount: number;
  fps: number;
  duration: number;
}> {
  try {
    // 키포인트 파일에서 프레임 수 추출
    const keypointsData = await fs.readFile(keypointsPath, 'utf-8');
    const keypoints = JSON.parse(keypointsData);
    const frameCount = keypoints.length;

    // 비디오에서 FPS 추출 (OpenCV 사용)
    const cv2 = require('opencv4nodejs');
    const cap = new cv2.VideoCapture(videoPath);
    const fps = cap.get(cv2.CAP_PROP_FPS);
    const duration = frameCount / fps;

    return {
      frameCount,
      fps: Math.round(fps * 100) / 100,
      duration: Math.round(duration * 100) / 100
    };
  } catch (error) {
    console.warn('[PIPELINE] 메타데이터 추출 실패:', error);
    return {
      frameCount: 0,
      fps: 0,
      duration: 0
    };
  }
}

/**
 * 파이프라인 상태 확인
 */
export async function checkPipelineStatus(req: Request, res: Response): Promise<void> {
  try {
    const { outputDir } = req.query;
    
    if (!outputDir || typeof outputDir !== 'string') {
      res.status(400).json({ error: 'outputDir 파라미터가 필요합니다.' });
      return;
    }

    const outputAbsDir = SpawnProc.resolvePath(outputDir);
    
    // 결과 파일들 확인
    const files = {
      keypoints2d: path.join(outputAbsDir, 'keypoints_2d.json'),
      poses3d: path.join(outputAbsDir, 'poses3d.npy'),
      bvh: path.join(outputAbsDir, 'motion.bvh'),
      glb: path.join(outputAbsDir, 'result.glb'),
      preview: path.join(outputAbsDir, 'preview.png')
    };

    const status = {
      ready: false,
      files: {} as Record<string, boolean>,
      progress: 0
    };

    let completedFiles = 0;
    const totalFiles = Object.keys(files).length;

    for (const [name, filePath] of Object.entries(files)) {
      const exists = await SpawnProc.checkFileExists(filePath);
      status.files[name] = exists;
      if (exists) completedFiles++;
    }

    status.progress = Math.round((completedFiles / totalFiles) * 100);
    status.ready = completedFiles === totalFiles;

    res.json(status);

  } catch (error) {
    console.error('[PIPELINE] 상태 확인 실패:', error);
    res.status(500).json({ error: '상태 확인 실패' });
  }
}

/**
 * 파이프라인 결과 다운로드
 */
export async function downloadPipelineResult(req: Request, res: Response): Promise<void> {
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

    const outputAbsDir = SpawnProc.resolvePath(outputDir);
    
    const fileMap: Record<string, string> = {
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

    const filePath = path.join(outputAbsDir, fileName);
    
    if (!await SpawnProc.checkFileExists(filePath)) {
      res.status(404).json({ error: '파일이 존재하지 않습니다.' });
      return;
    }

    res.download(filePath, fileName);

  } catch (error) {
    console.error('[PIPELINE] 다운로드 실패:', error);
    res.status(500).json({ error: '다운로드 실패' });
  }
}

// 라우트 등록
router.post('/run', runPipeline);
router.get('/status/:jobId', checkPipelineStatus);
router.get('/download/:jobId', downloadPipelineResult);

export default router;
