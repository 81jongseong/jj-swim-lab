'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Pose } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { PoseConnections } from '@mediapipe/pose';

interface PoseAnalysisProps {
  onAnalysisComplete?: (results: any) => void;
  showCamera?: boolean;
  autoStart?: boolean;
}

interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

interface PoseResults {
  poseLandmarks: PoseLandmark[];
  poseWorldLandmarks: PoseLandmark[];
  image: HTMLCanvasElement;
}

export function RealTimePoseAnalysis({ 
  onAnalysisComplete, 
  showCamera = true, 
  autoStart = false 
}: PoseAnalysisProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(autoStart);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [poseResults, setPoseResults] = useState<PoseResults | null>(null);
  const [analysisStats, setAnalysisStats] = useState({
    confidence: 0,
    poseType: 'Unknown',
    quality: 'Good'
  });

  // MediaPipe Pose 인스턴스
  const poseRef = useRef<Pose | null>(null);
  const cameraRef = useRef<Camera | null>(null);

  // Pose 설정 초기화
  const initializePose = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // MediaPipe Pose 초기화
      poseRef.current = new Pose({
        locateFile: (file) => {
          // CDN에서 파일 로드 시도, 실패 시 로컬 fallback
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`;
        }
      });

      // Pose 설정
      poseRef.current.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      // 결과 처리 콜백
      poseRef.current.onResults((results) => {
        if (results.poseLandmarks) {
          setPoseResults({
            poseLandmarks: results.poseLandmarks,
            poseWorldLandmarks: results.poseWorldLandmarks || [],
            image: results.image
          });

          // 자세 분석 수행
          const analysis = analyzePose(results.poseLandmarks);
          setAnalysisStats(analysis);

          // 분석 결과 전달
          if (onAnalysisComplete) {
            onAnalysisComplete({
              landmarks: results.poseLandmarks,
              analysis: analysis
            });
          }

          // 캔버스에 그리기
          drawPoseOnCanvas(results);
        }
      });

      // 초기화 완료 후 약간의 지연을 두고 로딩 상태 해제
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);

    } catch (err) {
      setError(`Pose 초기화 실패: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  }, [onAnalysisComplete]);

  // 카메라 시작
  const startCamera = useCallback(async () => {
    if (!poseRef.current || !videoRef.current) return;

    try {
      // 카메라 권한 요청
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      cameraRef.current = new Camera(videoRef.current, {
        onFrame: async () => {
          if (poseRef.current && videoRef.current) {
            await poseRef.current.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480
      });

      await cameraRef.current.start();
      setIsActive(true);
      setError(null); // 성공 시 에러 메시지 제거
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      if (errorMessage.includes('Permission denied')) {
        setError('카메라 권한이 거부되었습니다. 브라우저 설정에서 카메라 권한을 허용해주세요.');
      } else if (errorMessage.includes('NotFoundError')) {
        setError('카메라를 찾을 수 없습니다. 카메라가 연결되어 있는지 확인해주세요.');
      } else {
        setError(`카메라 시작 실패: ${errorMessage}`);
      }
    }
  }, []);

  // 카메라 중지
  const stopCamera = useCallback(async () => {
    if (cameraRef.current) {
      await cameraRef.current.stop();
      setIsActive(false);
    }
  }, []);

  // 자세 분석 함수
  const analyzePose = (landmarks: PoseLandmark[]) => {
    if (landmarks.length < 33) return { confidence: 0, poseType: 'Unknown', quality: 'Poor' };

    // 기본 신뢰도 계산
    const visibility = landmarks.map(l => l.visibility || 0);
    const avgVisibility = visibility.reduce((a, b) => a + b, 0) / visibility.length;
    
    // 자세 유형 판별 (간단한 예시)
    let poseType = 'Standing';
    let quality = 'Good';

    // 어깨와 엉덩이의 수평성 체크
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];

    if (leftShoulder && rightShoulder && leftHip && rightHip) {
      const shoulderDiff = Math.abs(leftShoulder.y - rightShoulder.y);
      const hipDiff = Math.abs(leftHip.y - rightHip.y);
      
      if (shoulderDiff > 0.1 || hipDiff > 0.1) {
        quality = 'Needs Improvement';
      }
    }

    // 신뢰도에 따른 품질 조정
    if (avgVisibility < 0.7) {
      quality = 'Poor';
    } else if (avgVisibility < 0.85) {
      quality = 'Fair';
    }

    return {
      confidence: Math.round(avgVisibility * 100),
      poseType,
      quality
    };
  };

  // 캔버스에 자세 그리기
  const drawPoseOnCanvas = (results: any) => {
    const canvas = canvasRef.current;
    if (!canvas || !results.poseLandmarks) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 캔버스 초기화
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 비디오 프레임 그리기
    if (results.image) {
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
    }

    // 자세 랜드마크 그리기
    if (results.poseLandmarks) {
      drawConnectors(ctx, results.poseLandmarks, PoseConnections.POSE_POSE, {
        color: '#00FF00',
        lineWidth: 2
      });
      drawLandmarks(ctx, results.poseLandmarks, {
        color: '#FF0000',
        lineWidth: 1,
        radius: 3
      });
    }
  };

  // 컴포넌트 마운트 시 초기화
  useEffect(() => {
    initializePose();
    
    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
    };
  }, [initializePose]);

  // 자동 시작 옵션
  useEffect(() => {
    if (autoStart && poseRef.current && !isActive) {
      startCamera();
    }
  }, [autoStart, isActive, startCamera]);

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          🏊‍♂️ 실시간 자세 분석
        </h2>
        <p className="text-gray-600">
          MediaPipe AI를 사용한 실시간 수영 자세 분석 및 피드백
        </p>
      </div>

      {/* 에러 표시 */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>오류:</strong> {error}
        </div>
      )}

      {/* 분석 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{analysisStats.confidence}%</div>
          <div className="text-sm text-blue-800">신뢰도</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-lg font-semibold text-green-600">{analysisStats.poseType}</div>
          <div className="text-sm text-green-800">자세 유형</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg text-center">
          <div className="text-lg font-semibold text-yellow-600">{analysisStats.quality}</div>
          <div className="text-sm text-yellow-800">자세 품질</div>
        </div>
      </div>

      {/* 카메라 및 분석 영역 */}
      <div className="relative">
        {showCamera && (
          <div className="mb-4">
            <video
              ref={videoRef}
              className="w-full max-w-2xl mx-auto border-2 border-gray-300 rounded-lg"
              autoPlay
              playsInline
              muted
            />
          </div>
        )}

        {/* 분석 캔버스 */}
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className="w-full max-w-2xl mx-auto border-2 border-gray-300 rounded-lg"
        />

        {/* 로딩 오버레이 */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2"></div>
              <div>AI 모델 로딩 중...</div>
            </div>
          </div>
        )}
      </div>

      {/* 컨트롤 버튼 */}
      <div className="flex justify-center gap-4 mt-6">
        {!isActive ? (
          <button
            onClick={startCamera}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🎥 분석 시작
          </button>
        ) : (
          <button
            onClick={stopCamera}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            ⏹️ 분석 중지
          </button>
        )}
      </div>

      {/* 사용법 안내 */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2">📖 사용법</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• 카메라 권한을 허용해주세요</li>
          <li>• 카메라 앞에서 자세를 취해주세요</li>
          <li>• AI가 실시간으로 자세를 분석합니다</li>
          <li>• 녹색 선과 빨간 점으로 자세가 표시됩니다</li>
        </ul>
      </div>
    </div>
  );
}

export default RealTimePoseAnalysis;
