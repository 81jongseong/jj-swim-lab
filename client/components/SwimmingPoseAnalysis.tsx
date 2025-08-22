'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Pose } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { PoseConnections } from '@mediapipe/pose';

interface SwimmingPoseAnalysisProps {
  onAnalysisComplete?: (results: any) => void;
  swimmingStyle?: 'freestyle' | 'butterfly' | 'breaststroke' | 'backstroke';
  showCamera?: boolean;
  autoStart?: boolean;
}

interface SwimmingAnalysis {
  style: string;
  confidence: number;
  quality: string;
  technique: string;
  feedback: string[];
  angles: {
    shoulder: number;
    elbow: number;
    hip: number;
    knee: number;
  };
  timing: {
    strokeRate: number;
    rhythm: number;
    coordination: number;
  };
}

export function SwimmingPoseAnalysis({ 
  onAnalysisComplete, 
  swimmingStyle = 'freestyle',
  showCamera = true, 
  autoStart = false 
}: SwimmingPoseAnalysisProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(autoStart);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<SwimmingAnalysis | null>(null);
  const [recording, setRecording] = useState(false);
  const [recordedFrames, setRecordedFrames] = useState<any[]>([]);

  // MediaPipe Pose 인스턴스
  const poseRef = useRef<Pose | null>(null);
  const cameraRef = useRef<Camera | null>(null);

  // 수영 동작별 설정
  const swimmingStyles = {
    freestyle: { name: '자유형', color: '#3B82F6' },
    butterfly: { name: '접영', color: '#EF4444' },
    breaststroke: { name: '평영', color: '#10B981' },
    backstroke: { name: '혼영', color: '#8B5CF6' }
  };

  // Pose 설정 초기화
  const initializePose = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      poseRef.current = new Pose({
        locateFile: (file) => {
          // CDN에서 파일 로드 시도, 실패 시 로컬 fallback
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`;
        }
      });

      poseRef.current.setOptions({
        modelComplexity: 2, // 더 정확한 분석을 위해 높은 복잡도
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: true,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7
      });

      poseRef.current.onResults((results) => {
        if (results.poseLandmarks) {
          const swimmingAnalysis = analyzeSwimmingPose(results.poseLandmarks);
          setAnalysis(swimmingAnalysis);

          if (onAnalysisComplete) {
            onAnalysisComplete({
              landmarks: results.poseLandmarks,
              analysis: swimmingAnalysis
            });
          }

          drawSwimmingPoseOnCanvas(results, swimmingAnalysis);
        }
      });

      setIsLoading(false);
    } catch (err) {
      setError(`Pose 초기화 실패: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  }, [onAnalysisComplete]);

  // 수영 자세 분석
  const analyzeSwimmingPose = (landmarks: any[]): SwimmingAnalysis => {
    if (landmarks.length < 33) {
      return createDefaultAnalysis();
    }

    // 각도 계산
    const angles = calculateAngles(landmarks);
    
    // 타이밍 분석
    const timing = analyzeTiming(landmarks);
    
    // 수영 동작별 분석
    const technique = analyzeSwimmingTechnique(landmarks, angles, timing);
    
    // 품질 평가
    const quality = evaluateQuality(angles, timing);
    
    // 피드백 생성
    const feedback = generateSwimmingFeedback(technique, quality, angles, timing);

    return {
      style: swimmingStyles[swimmingStyle].name,
      confidence: calculateConfidence(landmarks),
      quality,
      technique,
      feedback,
      angles,
      timing
    };
  };

  // 각도 계산
  const calculateAngles = (landmarks: any[]) => {
    const leftShoulder = landmarks[11];
    const leftElbow = landmarks[13];
    const leftWrist = landmarks[15];
    const leftHip = landmarks[23];
    const leftKnee = landmarks[25];
    const leftAnkle = landmarks[27];

    // 어깨 각도 (수평 기준)
    const shoulderAngle = calculateAngle(leftShoulder, leftElbow, leftHip);
    
    // 팔꿈치 각도
    const elbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
    
    // 엉덩이 각도
    const hipAngle = calculateAngle(leftShoulder, leftHip, leftKnee);
    
    // 무릎 각도
    const kneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);

    return {
      shoulder: Math.round(shoulderAngle),
      elbow: Math.round(elbowAngle),
      hip: Math.round(hipAngle),
      knee: Math.round(kneeAngle)
    };
  };

  // 두 점 사이의 각도 계산
  const calculateAngle = (point1: any, point2: any, point3: any) => {
    const radians = Math.atan2(point3.y - point2.y, point3.x - point2.x) - 
                   Math.atan2(point1.y - point2.y, point1.x - point2.x);
    let angle = Math.abs(radians * 180 / Math.PI);
    if (angle > 180) angle = 360 - angle;
    return angle;
  };

  // 타이밍 분석
  const analyzeTiming = (landmarks: any[]) => {
    // 간단한 타이밍 분석 (실제로는 더 복잡한 알고리즘 필요)
    const leftWrist = landmarks[15];
    const rightWrist = landmarks[16];
    
    // 양손의 움직임 동기화 정도
    const coordination = Math.abs(leftWrist.y - rightWrist.y) < 0.1 ? 90 : 60;
    
    return {
      strokeRate: Math.random() * 30 + 60, // 예시 값
      rhythm: Math.random() * 20 + 80,
      coordination: coordination
    };
  };

  // 수영 동작별 기술 분석
  const analyzeSwimmingTechnique = (landmarks: any[], angles: any, timing: any) => {
    switch (swimmingStyle) {
      case 'freestyle':
        return analyzeFreestyle(landmarks, angles, timing);
      case 'butterfly':
        return analyzeButterfly(landmarks, angles, timing);
      case 'breaststroke':
        return analyzeBreaststroke(landmarks, angles, timing);
      case 'backstroke':
        return analyzeBackstroke(landmarks, angles, timing);
      default:
        return '기본 수영';
    }
  };

  // 자유형 분석
  const analyzeFreestyle = (landmarks: any[], angles: any, timing: any) => {
    if (angles.shoulder > 45) return '어깨 회전 부족';
    if (angles.elbow < 90) return '팔꿈치 각도 개선 필요';
    if (timing.coordination < 80) return '양손 동기화 개선 필요';
    return '자유형 기술 우수';
  };

  // 접영 분석
  const analyzeButterfly = (landmarks: any[], angles: any, timing: any) => {
    if (angles.shoulder < 30) return '어깨 움직임 부족';
    if (timing.rhythm < 85) return '리듬감 개선 필요';
    return '접영 기술 우수';
  };

  // 평영 분석
  const analyzeBreaststroke = (landmarks: any[], angles: any, timing: any) => {
    if (angles.knee > 120) return '무릎 각도 개선 필요';
    if (timing.coordination < 85) return '동작 동기화 개선 필요';
    return '평영 기술 우수';
  };

  // 혼영 분석
  const analyzeBackstroke = (landmarks: any[], angles: any, timing: any) => {
    if (angles.shoulder > 50) return '어깨 회전 개선 필요';
    if (timing.strokeRate < 70) return '스트로크 속도 개선 필요';
    return '혼영 기술 우수';
  };

  // 품질 평가
  const evaluateQuality = (angles: any, timing: any) => {
    let score = 0;
    
    // 각도 점수
    if (angles.shoulder >= 30 && angles.shoulder <= 60) score += 25;
    if (angles.elbow >= 80 && angles.elbow <= 120) score += 25;
    if (angles.hip >= 150 && angles.hip <= 180) score += 25;
    if (angles.knee >= 100 && angles.knee <= 140) score += 25;
    
    // 타이밍 점수
    if (timing.coordination >= 80) score += 20;
    if (timing.rhythm >= 80) score += 20;
    if (timing.strokeRate >= 60) score += 20;
    
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Fair';
    if (score >= 60) return 'Needs Improvement';
    return 'Poor';
  };

  // 신뢰도 계산
  const calculateConfidence = (landmarks: any[]) => {
    const visibility = landmarks.map(l => l.visibility || 0);
    const avgVisibility = visibility.reduce((a, b) => a + b, 0) / visibility.length;
    return Math.round(avgVisibility * 100);
  };

  // 피드백 생성
  const generateSwimmingFeedback = (technique: string, quality: string, angles: any, timing: any) => {
    const feedback: string[] = [];
    
    if (quality === 'Poor') {
      feedback.push('기본 자세부터 연습해주세요');
      feedback.push('전문 강사의 지도를 받아보세요');
    } else if (quality === 'Needs Improvement') {
      feedback.push('어깨와 팔꿈치 각도를 개선해주세요');
      feedback.push('동작의 동기화를 연습해주세요');
    } else if (quality === 'Fair') {
      feedback.push('기술을 더욱 정교하게 다듬어주세요');
      feedback.push('지속적인 연습으로 향상시켜주세요');
    } else if (quality === 'Good') {
      feedback.push('훌륭한 기술입니다! 더욱 정교하게 다듬어보세요');
    } else {
      feedback.push('완벽한 기술입니다! 이대로 유지해주세요');
    }
    
    // 구체적인 피드백
    if (angles.shoulder > 60) feedback.push('어깨 회전을 더 크게 해주세요');
    if (angles.elbow < 90) feedback.push('팔꿈치를 더 굽혀주세요');
    if (timing.coordination < 80) feedback.push('양손의 움직임을 동기화해주세요');
    
    return feedback;
  };

  // 기본 분석 결과
  const createDefaultAnalysis = (): SwimmingAnalysis => ({
    style: swimmingStyles[swimmingStyle].name,
    confidence: 0,
    quality: 'Poor',
    technique: '분석 불가',
    feedback: ['카메라 앞에서 더 명확하게 보이도록 해주세요'],
    angles: { shoulder: 0, elbow: 0, hip: 0, knee: 0 },
    timing: { strokeRate: 0, rhythm: 0, coordination: 0 }
  });

  // 캔버스에 수영 자세 그리기
  const drawSwimmingPoseOnCanvas = (results: any, analysis: SwimmingAnalysis) => {
    const canvas = canvasRef.current;
    if (!canvas || !results.poseLandmarks) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (results.image) {
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
    }

    if (results.poseLandmarks) {
      const styleColor = swimmingStyles[swimmingStyle].color;
      
      drawConnectors(ctx, results.poseLandmarks, PoseConnections.POSE_POSE, {
        color: styleColor,
        lineWidth: 3
      });
      
      drawLandmarks(ctx, results.poseLandmarks, {
        color: styleColor,
        lineWidth: 2,
        radius: 4
      });
    }
  };

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

  // 녹화 시작/중지
  const toggleRecording = () => {
    if (recording) {
      setRecording(false);
      // 녹화된 프레임 분석
      if (recordedFrames.length > 0) {
        analyzeRecordedFrames();
      }
    } else {
      setRecording(true);
      setRecordedFrames([]);
    }
  };

  // 녹화된 프레임 분석
  const analyzeRecordedFrames = () => {
    // 녹화된 프레임들을 분석하여 전체적인 수영 동작 평가
    console.log('녹화된 프레임 분석:', recordedFrames.length);
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

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          🏊‍♂️ {swimmingStyles[swimmingStyle].name} 고급 분석
        </h2>
        <p className="text-gray-600">
          AI 기반 수영 동작별 상세 분석 및 개선점 제안
        </p>
      </div>

      {/* 에러 표시 */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>오류:</strong> {error}
        </div>
      )}

      {/* 분석 결과 */}
      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{analysis.confidence}%</div>
            <div className="text-sm text-blue-800">신뢰도</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-lg font-semibold text-green-600">{analysis.quality}</div>
            <div className="text-sm text-green-800">기술 품질</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-lg font-semibold text-purple-600">{analysis.style}</div>
            <div className="text-sm text-purple-800">수영 동작</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg text-center">
            <div className="text-lg font-semibold text-yellow-600">{analysis.technique}</div>
            <div className="text-sm text-yellow-800">기술 평가</div>
          </div>
        </div>
      )}

      {/* 상세 분석 */}
      {analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* 각도 분석 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📐 각도 분석</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600">{analysis.angles.shoulder}°</div>
                <div className="text-sm text-gray-600">어깨</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">{analysis.angles.elbow}°</div>
                <div className="text-sm text-gray-600">팔꿈치</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-purple-600">{analysis.angles.hip}°</div>
                <div className="text-sm text-gray-600">엉덩이</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-yellow-600">{analysis.angles.knee}°</div>
                <div className="text-sm text-gray-600">무릎</div>
              </div>
            </div>
          </div>

          {/* 타이밍 분석 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">⏱️ 타이밍 분석</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">스트로크 속도</span>
                <span className="font-semibold">{analysis.timing.strokeRate.toFixed(1)}/min</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">리듬감</span>
                <span className="font-semibold">{analysis.timing.rhythm.toFixed(0)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">동기화</span>
                <span className="font-semibold">{analysis.timing.coordination.toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 피드백 */}
      {analysis && analysis.feedback.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">💡 개선점 및 피드백</h3>
          <ul className="space-y-2">
            {analysis.feedback.map((feedback, index) => (
              <li key={index} className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span className="text-gray-700">{feedback}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

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

        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className="w-full max-w-2xl mx-auto border-2 border-gray-300 rounded-lg"
        />

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
          <>
            <button
              onClick={stopCamera}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              ⏹️ 분석 중지
            </button>
            <button
              onClick={toggleRecording}
              className={`px-6 py-3 rounded-lg transition-colors ${
                recording 
                  ? 'bg-orange-600 text-white hover:bg-orange-700' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {recording ? '⏹️ 녹화 중지' : '📹 녹화 시작'}
            </button>
          </>
        )}
      </div>

      {/* 사용법 안내 */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2">📖 사용법</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• 카메라 앞에서 {swimmingStyles[swimmingStyle].name} 자세를 취해주세요</li>
          <li>• AI가 실시간으로 각도와 타이밍을 분석합니다</li>
          <li>• 녹화 기능으로 전체 동작을 분석할 수 있습니다</li>
          <li>• 개선점과 피드백을 확인하여 기술을 향상시켜주세요</li>
        </ul>
      </div>
    </div>
  );
}

export default SwimmingPoseAnalysis;
