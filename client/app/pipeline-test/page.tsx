'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Label from '@/components/ui/Label';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import Badge from '@/components/ui/Badge';
import { Download, Play, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface PipelineResult {
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

interface PipelineStatus {
  ready: boolean;
  files: Record<string, boolean>;
  progress: number;
}

export default function PipelineTestPage() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [fbxFile, setFbxFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [status, setStatus] = useState<PipelineStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setError(null);
    }
  };

  const handleFbxUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFbxFile(file);
      setError(null);
    }
  };

  const uploadFile = async (file: File, type: 'video' | 'model'): Promise<string> => {
    const formData = new FormData();
    formData.append(type === 'video' ? 'video' : 'userModel', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`파일 업로드 실패: ${response.statusText}`);
    }

    const data = await response.json();
    return data.filePath;
  };

  const runPipeline = async () => {
    if (!videoFile || !fbxFile) {
      setError('비디오 파일과 FBX 파일을 모두 선택해주세요.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);
    setStatus(null);

    try {
      // 1. 파일 업로드
      console.log('파일 업로드 시작...');
      const [videoPath, fbxPath] = await Promise.all([
        uploadFile(videoFile, 'video'),
        uploadFile(fbxFile, 'model')
      ]);

      console.log('파일 업로드 완료:', { videoPath, fbxPath });

      // 2. 파이프라인 실행
      console.log('파이프라인 실행 시작...');
      const response = await fetch('/api/video-upload/pipeline/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoPath,
          fbxPath,
          outputDir: `./server/uploads/processed/pipeline-${Date.now()}`,
          maxFrames: 300,
          startFrame: 1,
          endFrame: 300
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '파이프라인 실행 실패');
      }

      const pipelineResult: PipelineResult = await response.json();
      setResult(pipelineResult);

      console.log('파이프라인 완료:', pipelineResult);

    } catch (err) {
      console.error('파이프라인 오류:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const checkStatus = async () => {
    if (!result) return;

    try {
      const response = await fetch(`/api/video-upload/pipeline/status?outputDir=${encodeURIComponent(result.files.glb.split('/').slice(0, -1).join('/'))}`);
      const statusData: PipelineStatus = await response.json();
      setStatus(statusData);
    } catch (err) {
      console.error('상태 확인 오류:', err);
    }
  };

  const downloadFile = async (fileType: string) => {
    if (!result) return;

    try {
      const response = await fetch(`/api/video-upload/pipeline/download?outputDir=${encodeURIComponent(result.files.glb.split('/').slice(0, -1).join('/'))}&fileType=${fileType}`);
      
      if (!response.ok) {
        throw new Error('다운로드 실패');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileType}.${fileType === 'glb' ? 'glb' : fileType === 'bvh' ? 'bvh' : 'json'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('다운로드 오류:', err);
      setError('다운로드 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">VideoPose3D 파이프라인 테스트</h1>
        <p className="text-gray-600">비디오 → BVH → FBX → GLB 변환 파이프라인</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 파일 업로드 */}
        <Card>
          <CardHeader>
            <CardTitle>파일 업로드</CardTitle>
            <CardDescription>비디오 파일과 FBX 모델을 업로드하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="video">비디오 파일</Label>
              <Input
                id="video"
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="mt-1"
              />
              {videoFile && (
                <p className="text-sm text-green-600 mt-1">
                  ✓ {videoFile.name} ({Math.round(videoFile.size / 1024 / 1024)}MB)
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="fbx">FBX 모델</Label>
              <Input
                id="fbx"
                type="file"
                accept=".fbx,.blend"
                onChange={handleFbxUpload}
                className="mt-1"
              />
              {fbxFile && (
                <p className="text-sm text-green-600 mt-1">
                  ✓ {fbxFile.name} ({Math.round(fbxFile.size / 1024 / 1024)}MB)
                </p>
              )}
            </div>

            <Button
              onClick={runPipeline}
              disabled={!videoFile || !fbxFile || isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  처리 중...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  파이프라인 실행
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 상태 및 결과 */}
        <Card>
          <CardHeader>
            <CardTitle>처리 상태</CardTitle>
            <CardDescription>파이프라인 실행 상태를 확인하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center">
                  <XCircle className="h-4 w-4 text-red-500 mr-2" />
                  <span className="text-red-700">{error}</span>
                </div>
              </div>
            )}

            {result && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">처리 완료</span>
                  <Badge variant={result.success ? "default" : "destructive"}>
                    {result.success ? "성공" : "실패"}
                  </Badge>
                </div>

                {result.success && (
                  <div className="space-y-2">
                    <div className="text-sm">
                      <p>프레임 수: {result.metadata.frameCount}</p>
                      <p>FPS: {result.metadata.fps}</p>
                      <p>길이: {result.metadata.duration}초</p>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-medium">생성된 파일:</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadFile('glb')}
                        >
                          <Download className="mr-1 h-3 w-3" />
                          GLB
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadFile('bvh')}
                        >
                          <Download className="mr-1 h-3 w-3" />
                          BVH
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadFile('keypoints2d')}
                        >
                          <Download className="mr-1 h-3 w-3" />
                          키포인트
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadFile('preview')}
                        >
                          <Download className="mr-1 h-3 w-3" />
                          미리보기
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {status && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">파일 상태</span>
                  <span className="text-sm text-gray-500">{status.progress}%</span>
                </div>
                <Progress value={status.progress} className="w-full" />
                
                <div className="space-y-1">
                  {Object.entries(status.files).map(([file, exists]) => (
                    <div key={file} className="flex items-center justify-between text-sm">
                      <span>{file}</span>
                      {exists ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 파이프라인 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>파이프라인 정보</CardTitle>
          <CardDescription>VideoPose3D → BVH → FBX → GLB 변환 과정</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <h3 className="font-medium mb-2">1. VideoPose3D</h3>
              <p className="text-sm text-gray-600">MediaPipe → COCO-17 → 3D 포즈</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h3 className="font-medium mb-2">2. BVH 생성</h3>
              <p className="text-sm text-gray-600">3D 포즈 → BVH 모션 파일</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h3 className="font-medium mb-2">3. FBX 로드</h3>
              <p className="text-sm text-gray-600">사용자 모델 → Armature 선택</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h3 className="font-medium mb-2">4. GLB 내보내기</h3>
              <p className="text-sm text-gray-600">BVH 적용 → 애니메이션 GLB</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



