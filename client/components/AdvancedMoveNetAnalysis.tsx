'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';

interface MoveNetPose {
  keypoints: poseDetection.Keypoint[];
  score: number;
}

interface AdvancedAnalysisResult {
  confidence: number;
  posture: 'excellent' | 'good' | 'fair' | 'poor';
  corrections: string[];
  score: number;
  recommendations: string[];
  detailedMetrics: {
    shoulderAlignment: number;
    elbowAngles: { left: number; right: number };
    hipAlignment: number;
    kneeAngles: { left: number; right: number };
    headPosition: number;
  };
}

interface AdvancedMoveNetAnalysisProps {
  onAnalysisComplete: (analysis: AdvancedAnalysisResult) => void;
  swimmingStyle?: 'freestyle' | 'breaststroke' | 'backstroke' | 'butterfly';
}

const AdvancedMoveNetAnalysis: React.FC<AdvancedMoveNetAnalysisProps> = ({
  onAnalysisComplete,
  swimmingStyle = 'freestyle'
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<AdvancedAnalysisResult | null>(null);
  const [fps, setFps] = useState(0);
  const [model, setModel] = useState<poseDetection.PoseDetector | null>(null);
  const [backend, setBackend] = useState<string>('');

  // TensorFlow.js 초기화 및 최적화
  useEffect(() => {
    const initializeTensorFlow = async () => {
      try {
        // 백엔드 우선순위: WebGPU > WebGL > WASM > CPU
        const backends = ['webgpu', 'webgl', 'wasm', 'cpu'];
        
        for (const backendName of backends) {
          try {
            await tf.setBackend(backendName);
            console.log(`TensorFlow.js ${backendName} 백엔드 초기화 완료`);
            setBackend(backendName);
            break;
          } catch (error) {
            console.warn(`${backendName} 백엔드 초기화 실패:`, error);
            continue;
          }
        }

        // MoveNet 모델 로드 (더 정확한 자세 분석)
        const detectorConfig = {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
          enableSmoothing: true,
          enableSegmentation: false
        };
        
        const detector = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          detectorConfig
        );
        
        setModel(detector);
        setIsInitialized(true);
        console.log('MoveNet 모델 로드 완료');
        
      } catch (error) {
        console.error('TensorFlow.js 초기화 실패:', error);
        setIsInitialized(false);
      }
    };

    initializeTensorFlow();
  }, []);

  // 카메라 시작
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user',
          frameRate: { ideal: 30 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error('카메라 접근 실패:', error);
    }
  }, []);

  // 카메라 중지
  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  // 고급 자세 분석
  const analyzePose = useCallback(async () => {
    if (!model || !videoRef.current) return;

    try {
      const poses = await model.estimatePoses(videoRef.current, {
        flipHorizontal: false
      });

      if (poses.length > 0) {
        const pose = poses[0];
        const analysis = performAdvancedAnalysis(pose, swimmingStyle);
        setCurrentAnalysis(analysis);
        onAnalysisComplete(analysis);
        
        // 캔버스에 자세 그리기
        drawPoseOnCanvas(pose);
      }
    } catch (error) {
      console.error('자세 분석 실패:', error);
    }
  }, [model, swimmingStyle, onAnalysisComplete]);

  // 고급 분석 알고리즘
  const performAdvancedAnalysis = (pose: poseDetection.Pose, style: string): AdvancedAnalysisResult => {
    const keypoints = pose.keypoints;
    const keypointMap = keypoints.reduce((acc: any, kp) => {
      acc[kp.name] = { x: kp.x, y: kp.y, score: kp.score };
      return acc;
    }, {});

    let score = 0;
    let posture: 'excellent' | 'good' | 'fair' | 'poor' = 'poor';
    const corrections: string[] = [];
    const recommendations: string[] = [];

    // 상세 메트릭 계산
    const detailedMetrics = calculateDetailedMetrics(keypointMap);

    // 어깨 정렬 점수 (0-25점)
    if (detailedMetrics.shoulderAlignment < 5) {
      score += 25;
    } else if (detailedMetrics.shoulderAlignment < 15) {
      score += 20;
    } else if (detailedMetrics.shoulderAlignment < 25) {
      score += 15;
      corrections.push('어깨를 더 수평으로 맞춰주세요');
    } else {
      corrections.push('어깨 정렬이 많이 틀어졌습니다');
    }

    // 팔꿈치 각도 점수 (0-25점)
    const leftElbowScore = calculateElbowScore(detailedMetrics.elbowAngles.left, style);
    const rightElbowScore = calculateElbowScore(detailedMetrics.elbowAngles.right, style);
    score += Math.round((leftElbowScore + rightElbowScore) / 2);

    if (leftElbowScore < 20 || rightElbowScore < 20) {
      corrections.push('팔꿈치 각도를 90도에 가깝게 유지하세요');
    }

    // 다리 정렬 점수 (0-25점)
    if (detailedMetrics.hipAlignment < 10) {
      score += 25;
    } else if (detailedMetrics.hipAlignment < 20) {
      score += 20;
    } else if (detailedMetrics.hipAlignment < 30) {
      score += 15;
      corrections.push('다리를 더 곧게 펴주세요');
    } else {
      corrections.push('다리 정렬이 많이 틀어졌습니다');
    }

    // 머리 위치 점수 (0-25점)
    if (detailedMetrics.headPosition < 5) {
      score += 25;
    } else if (detailedMetrics.headPosition < 15) {
      score += 20;
    } else if (detailedMetrics.headPosition < 25) {
      score += 15;
      corrections.push('머리를 수평으로 유지하세요');
    } else {
      corrections.push('머리가 많이 기울어졌습니다');
    }

    // 점수에 따른 자세 등급
    if (score >= 90) {
      posture = 'excellent';
      recommendations.push('완벽한 자세입니다! 이대로 유지하세요');
    } else if (score >= 75) {
      posture = 'good';
      recommendations.push('좋은 자세입니다. 조금만 더 개선하면 완벽합니다');
    } else if (score >= 60) {
      posture = 'fair';
      recommendations.push('보통 수준입니다. 지속적인 연습이 필요합니다');
    } else {
      recommendations.push('기본 자세부터 차근차근 연습하세요');
    }

    // 스타일별 맞춤 추천
    addStyleSpecificRecommendations(style, recommendations, detailedMetrics);

    return {
      confidence: score / 100,
      posture,
      corrections,
      score,
      recommendations,
      detailedMetrics
    };
  };

  // 상세 메트릭 계산
  const calculateDetailedMetrics = (keypointMap: any) => {
    const metrics = {
      shoulderAlignment: 0,
      elbowAngles: { left: 0, right: 0 },
      hipAlignment: 0,
      kneeAngles: { left: 0, right: 0 },
      headPosition: 0
    };

    // 어깨 정렬
    if (keypointMap.left_shoulder && keypointMap.right_shoulder) {
      metrics.shoulderAlignment = Math.abs(
        keypointMap.left_shoulder.y - keypointMap.right_shoulder.y
      );
    }

    // 팔꿈치 각도
    if (keypointMap.left_shoulder && keypointMap.left_elbow && keypointMap.left_wrist) {
      metrics.elbowAngles.left = calculateAngle(
        keypointMap.left_shoulder,
        keypointMap.left_elbow,
        keypointMap.left_wrist
      );
    }
    if (keypointMap.right_shoulder && keypointMap.right_elbow && keypointMap.right_wrist) {
      metrics.elbowAngles.right = calculateAngle(
        keypointMap.right_shoulder,
        keypointMap.right_elbow,
        keypointMap.right_wrist
      );
    }

    // 엉덩이 정렬
    if (keypointMap.left_hip && keypointMap.right_hip) {
      metrics.hipAlignment = Math.abs(
        keypointMap.left_hip.y - keypointMap.right_hip.y
      );
    }

    // 무릎 각도
    if (keypointMap.left_hip && keypointMap.left_knee && keypointMap.left_ankle) {
      metrics.kneeAngles.left = calculateAngle(
        keypointMap.left_hip,
        keypointMap.left_knee,
        keypointMap.left_ankle
      );
    }
    if (keypointMap.right_hip && keypointMap.right_knee && keypointMap.right_ankle) {
      metrics.kneeAngles.right = calculateAngle(
        keypointMap.right_hip,
        keypointMap.right_knee,
        keypointMap.right_ankle
      );
    }

    // 머리 위치
    if (keypointMap.left_ear && keypointMap.right_ear) {
      metrics.headPosition = Math.abs(
        keypointMap.left_ear.y - keypointMap.right_ear.y
      );
    }

    return metrics;
  };

  // 팔꿈치 점수 계산
  const calculateElbowScore = (angle: number, style: string): number => {
    if (style === 'freestyle') {
      if (angle > 80 && angle < 120) return 25;
      if (angle > 60 && angle < 140) return 20;
      if (angle > 40 && angle < 160) return 15;
      return 10;
    }
    // 다른 스타일들에 대한 점수 계산
    return 20;
  };

  // 스타일별 추천사항
  const addStyleSpecificRecommendations = (
    style: string, 
    recommendations: string[], 
    metrics: any
  ) => {
    switch (style) {
      case 'freestyle':
        if (metrics.elbowAngles.left < 80 || metrics.elbowAngles.right < 80) {
          recommendations.push('자유형: 팔을 더 높이 들어올리세요');
        }
        break;
      case 'breaststroke':
        if (metrics.hipAlignment > 20) {
          recommendations.push('평영: 엉덩이를 수평으로 유지하세요');
        }
        break;
      case 'backstroke':
        if (metrics.headPosition > 15) {
          recommendations.push('배영: 머리를 중앙에 고정하세요');
        }
        break;
      case 'butterfly':
        if (metrics.shoulderAlignment > 20) {
          recommendations.push('접영: 어깨를 물결치듯 움직이세요');
        }
        break;
    }
  };

  // 각도 계산 함수
  const calculateAngle = (p1: any, p2: any, p3: any): number => {
    const radians = Math.atan2(p3.y - p2.y, p3.x - p2.x) - 
                   Math.atan2(p1.y - p2.y, p1.x - p2.x);
    let angle = Math.abs(radians * 180 / Math.PI);
    if (angle > 180) angle = 360 - angle;
    return angle;
  };

  // 캔버스에 자세 그리기
  const drawPoseOnCanvas = (pose: poseDetection.Pose) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 캔버스 초기화
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#ff0000';

    // 키포인트 그리기
    pose.keypoints.forEach(keypoint => {
      if (keypoint.score && keypoint.score > 0.3) {
        ctx.beginPath();
        ctx.arc(keypoint.x, keypoint.y, 4, 0, 2 * Math.PI);
        ctx.fill();
      }
    });

    // 뼈대 그리기
    const connections = [
      ['left_shoulder', 'right_shoulder'],
      ['left_shoulder', 'left_elbow'],
      ['left_elbow', 'left_wrist'],
      ['right_shoulder', 'right_elbow'],
      ['right_elbow', 'right_wrist'],
      ['left_shoulder', 'left_hip'],
      ['right_shoulder', 'right_hip'],
      ['left_hip', 'right_hip'],
      ['left_hip', 'left_knee'],
      ['left_knee', 'left_ankle'],
      ['right_hip', 'right_knee'],
      ['right_knee', 'right_ankle']
    ];

    connections.forEach(([start, end]) => {
      const startPoint = pose.keypoints.find(kp => kp.name === start);
      const endPoint = pose.keypoints.find(kp => kp.name === end);

      if (startPoint && endPoint && startPoint.score && endPoint.score && 
          startPoint.score > 0.3 && endPoint.score > 0.3) {
        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(endPoint.x, endPoint.y);
        ctx.stroke();
      }
    });
  };

  // 실시간 분석 시작/중지
  const toggleAnalysis = useCallback(() => {
    if (isAnalyzing) {
      setIsAnalyzing(false);
      stopCamera();
    } else {
      setIsAnalyzing(true);
      startCamera();
    }
  }, [isAnalyzing, startCamera, stopCamera]);

  // FPS 계산
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();

    const updateFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (currentTime - lastTime)));
        frameCount = 0;
        lastTime = currentTime;
      }
      
      if (isAnalyzing) {
        requestAnimationFrame(updateFPS);
      }
    };

    if (isAnalyzing) {
      updateFPS();
    }
  }, [isAnalyzing]);

  // 실시간 분석 루프
  useEffect(() => {
    let animationId: number;

    const analyzeLoop = async () => {
      if (isAnalyzing && model && videoRef.current) {
        try {
          await analyzePose();
          animationId = requestAnimationFrame(analyzeLoop);
        } catch (error) {
          console.error('분석 루프 오류:', error);
        }
      }
    };

    if (isAnalyzing) {
      analyzeLoop();
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isAnalyzing, model, analyzePose]);

  // 컴포넌트 정리
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">고급 AI 모델을 로딩 중입니다...</p>
          <p className="text-sm text-gray-500 mt-2">MoveNet 모델 + {backend} 백엔드</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          🚀 고급 MoveNet AI 자세 분석 - {swimmingStyle}
        </h2>

        {/* 카메라 및 분석 영역 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full h-64 bg-gray-900 rounded-lg"
                autoPlay
                muted
                playsInline
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
                width={640}
                height={480}
              />
            </div>
            
            <div className="flex justify-between items-center">
              <button
                onClick={toggleAnalysis}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  isAnalyzing
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {isAnalyzing ? '분석 중지' : '분석 시작'}
              </button>
              
              <div className="text-sm text-gray-600">
                FPS: {fps} | 백엔드: {backend}
              </div>
            </div>
          </div>

          {/* 실시간 분석 결과 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">실시간 분석 결과</h3>
            
            {currentAnalysis ? (
              <div className="space-y-4">
                {/* 점수 */}
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {currentAnalysis.score}/100
                  </div>
                  <div className="text-sm text-gray-600">자세 점수</div>
                </div>

                {/* 자세 등급 */}
                <div className="text-center">
                  <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                    currentAnalysis.posture === 'excellent' ? 'bg-green-100 text-green-800' :
                    currentAnalysis.posture === 'good' ? 'bg-blue-100 text-blue-800' :
                    currentAnalysis.posture === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {currentAnalysis.posture === 'excellent' ? '⭐ 완벽' :
                     currentAnalysis.posture === 'good' ? '👍 좋음' :
                     currentAnalysis.posture === 'fair' ? '⚠️ 보통' :
                     '❌ 개선 필요'}
                  </div>
                </div>

                {/* 상세 메트릭 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-3">상세 메트릭</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium">어깨 정렬:</span> 
                      <span className={`ml-2 ${currentAnalysis.detailedMetrics.shoulderAlignment < 10 ? 'text-green-600' : 'text-red-600'}`}>
                        {currentAnalysis.detailedMetrics.shoulderAlignment}px
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">왼쪽 팔꿈치:</span> 
                      <span className="ml-2 text-blue-600">
                        {Math.round(currentAnalysis.detailedMetrics.elbowAngles.left)}°
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">오른쪽 팔꿈치:</span> 
                      <span className="ml-2 text-blue-600">
                        {Math.round(currentAnalysis.detailedMetrics.elbowAngles.right)}°
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">엉덩이 정렬:</span> 
                      <span className={`ml-2 ${currentAnalysis.detailedMetrics.hipAlignment < 15 ? 'text-green-600' : 'text-red-600'}`}>
                        {currentAnalysis.detailedMetrics.hipAlignment}px
                      </span>
                    </div>
                  </div>
                </div>

                {/* 개선점 */}
                {currentAnalysis.corrections.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">개선점</h4>
                    <ul className="space-y-1">
                      {currentAnalysis.corrections.map((correction, index) => (
                        <li key={index} className="text-sm text-red-600 flex items-center">
                          <span className="mr-2">•</span>
                          {correction}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 추천사항 */}
                {currentAnalysis.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">추천사항</h4>
                    <ul className="space-y-1">
                      {currentAnalysis.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-blue-600 flex items-center">
                          <span className="mr-2">💡</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                분석을 시작하면 실시간 결과가 여기에 표시됩니다
              </div>
            )}
          </div>
        </div>

        {/* 기술 정보 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-700 mb-2">기술 정보</h3>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">백엔드:</span> {backend}
            </div>
            <div>
              <span className="font-medium">모델:</span> MoveNet Lightning
            </div>
            <div>
              <span className="font-medium">해상도:</span> 640x480
            </div>
            <div>
              <span className="font-medium">프레임:</span> {fps} FPS
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedMoveNetAnalysis;
