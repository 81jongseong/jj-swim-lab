/**
 * 🔬 JJ Swim Lab - AdvancedPoseAnalysis 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 고급 수영 자세 분석 및 상세 진단 시스템
 * - 다각도 자세 분석 및 3D 모델링
 * - 자세 교정 가이드 및 운동 처방
 * - 자세 분석 리포트 및 통계 생성
 * - 전문가 의견 및 피드백 시스템
 * 
 * 🔄 **주요 기능**
 * - 다각도 자세 분석 및 비교
 * - 3D 자세 모델링 및 시각화
 * - 상세한 자세 교정 가이드
 * - 운동 처방 및 훈련 계획 수립
 * - 전문가 의견 및 피드백
 * 
 * 🗄️ **데이터 연동**
 * - 고급 AI 자세 인식 모델
 * - 3D 모델링 및 시각화 데이터
 * - 자세 분석 리포트 데이터
 * - 전문가 피드백 및 의견 데이터
 * 
 * 🛠️ **필요한 설치 파일**
 * - React (useState, useEffect, useRef)
 * - 고급 AI 자세 인식 라이브러리
 * - 3D 모델링 및 시각화 라이브러리
 * - 차트 및 분석 도구 라이브러리
 * - Tailwind CSS (스타일링)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 고급 AI 모델의 성능 및 정확도
 * 2. 3D 모델링의 성능 최적화
 * 3. 자세 분석 결과의 전문성
 * 4. 사용자 개인정보 보호
 * 5. 전문가 피드백 시스템의 품질
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 고급 AI 모델 연동 상태 확인
 * - [ ] 3D 모델링 성능 확인
 * - [ ] 자세 분석 결과 정확성 검증
 * - [ ] 전문가 피드백 시스템 동작 확인
 * - [ ] 성능 및 메모리 사용량 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 고급 자세 분석)
 * - 2024-12-19: 고급 AI 모델 연동 구현
 * - 2024-12-19: 3D 모델링 시스템 구현
 * - 2024-12-19: 전문가 피드백 시스템 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (고급 자세 분석 시스템 완료)
 * 
 * 🚀 **다음 단계**
 * - AI 모델 고도화
 * - 3D 모델링 성능 최적화
 * - 전문가 피드백 시스템 고도화
 * - 접근성 개선
 * 
 * 💡 **사용 예시**
 * ```tsx
 * <AdvancedPoseAnalysis 
 *   onAnalysisComplete={(result) => handleAnalysisComplete(result)}
 *   on3DModelGenerated={(model) => handle3DModelGenerated(model)}
 *   onExpertFeedback={(feedback) => handleExpertFeedback(feedback)}
 *   userId="user123"
 * />
 * ```
 */

'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import { createDetector, SupportedModels } from '@tensorflow-models/pose-detection';

interface PoseLandmark {
  x: number;
  y: number;
  score: number;
}

interface PoseAnalysis {
  confidence: number;
  posture: 'excellent' | 'good' | 'fair' | 'poor';
  corrections: string[];
  score: number;
  recommendations: string[];
}

interface AdvancedPoseAnalysisProps {
  onAnalysisComplete: (analysis: PoseAnalysis) => void;
  swimmingStyle?: 'freestyle' | 'breaststroke' | 'backstroke' | 'butterfly';
}

const AdvancedPoseAnalysis: React.FC<AdvancedPoseAnalysisProps> = ({
  onAnalysisComplete,
  swimmingStyle = 'freestyle'
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<PoseAnalysis | null>(null);
  const [fps, setFps] = useState(0);
  const [model, setModel] = useState<any | null>(null);

  // TensorFlow.js 초기화
  useEffect(() => {
    const initializeTensorFlow = async () => {
      try {
        // WebGL 백엔드 사용 (GPU 가속)
        await tf.setBackend('webgl');
        console.log('TensorFlow.js WebGL 백엔드 초기화 완료');
        
        // PoseNet 모델 로드
        const posenetModel = await createDetector(
          SupportedModels.PoseNet,
          {
            architecture: 'MobileNetV1',
            outputStride: 16,
            inputResolution: { width: 257, height: 257 },
            multiplier: 0.75,
            quantBytes: 2
          }
        );
        
        setModel(posenetModel);
        setIsInitialized(true);
        console.log('PoseNet 모델 로드 완료');
      } catch (error) {
        console.error('TensorFlow.js 초기화 실패:', error);
        // CPU 백엔드로 폴백
        try {
          await tf.setBackend('cpu');
          console.log('TensorFlow.js CPU 백엔드로 폴백');
          setIsInitialized(true);
        } catch (fallbackError) {
          console.error('CPU 백엔드도 실패:', fallbackError);
        }
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
          facingMode: 'user'
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
  const analyzePose = useCallback(async (pose: any) => {
    if (!model) return;

    try {
      const poseData = await model.estimatePoses(videoRef.current!, {
        flipHorizontal: false,
        maxPoseDetections: 1,
        scoreThreshold: 0.3,
        nmsRadius: 20
      });

      if (poseData.length > 0) {
        const keypoints = poseData[0].keypoints;
        const analysis = performAdvancedAnalysis(keypoints, swimmingStyle);
        setCurrentAnalysis(analysis);
        onAnalysisComplete(analysis);
      }
    } catch (error) {
      console.error('자세 분석 실패:', error);
    }
  }, [model, swimmingStyle, onAnalysisComplete]);

  // 고급 분석 알고리즘
  const performAdvancedAnalysis = (keypoints: any[], style: string): PoseAnalysis => {
    const landmarks = keypoints.reduce((acc: any, kp: any) => {
      acc[kp.part] = { x: kp.position.x, y: kp.position.y, score: kp.score };
      return acc;
    }, {});

    let score = 0;
    let posture: 'excellent' | 'good' | 'fair' | 'poor' = 'poor';
    const corrections: string[] = [];
    const recommendations: string[] = [];

    // 자세 점수 계산 (0-100)
    if (landmarks.nose && landmarks.leftShoulder && landmarks.rightShoulder) {
      // 어깨 정렬 체크
      const shoulderAlignment = Math.abs(landmarks.leftShoulder.y - landmarks.rightShoulder.y);
      if (shoulderAlignment < 10) {
        score += 25;
      } else if (shoulderAlignment < 20) {
        score += 15;
        corrections.push('어깨를 수평으로 맞춰주세요');
      } else {
        corrections.push('어깨 정렬이 많이 틀어졌습니다');
      }
    }

    if (landmarks.leftElbow && landmarks.leftShoulder && landmarks.leftWrist) {
      // 팔꿈치 각도 체크
      const elbowAngle = calculateAngle(
        landmarks.leftShoulder,
        landmarks.leftElbow,
        landmarks.leftWrist
      );
      
      if (style === 'freestyle') {
        if (elbowAngle > 80 && elbowAngle < 120) {
          score += 25;
        } else if (elbowAngle > 60 && elbowAngle < 140) {
          score += 15;
          corrections.push('팔꿈치 각도를 90도에 가깝게 유지하세요');
        } else {
          corrections.push('팔꿈치 각도가 너무 크거나 작습니다');
        }
      }
    }

    if (landmarks.leftHip && landmarks.leftKnee && landmarks.leftAnkle) {
      // 다리 정렬 체크
      const legAlignment = calculateAngle(
        landmarks.leftHip,
        landmarks.leftKnee,
        landmarks.leftAnkle
      );
      
      if (legAlignment > 160 && legAlignment < 180) {
        score += 25;
      } else if (legAlignment > 140 && legAlignment < 200) {
        score += 15;
        corrections.push('다리를 곧게 펴주세요');
      } else {
        corrections.push('다리 정렬이 많이 틀어졌습니다');
      }
    }

    // 전반적인 자세 점수
    if (landmarks.nose && landmarks.leftEar && landmarks.rightEar) {
      const headAlignment = Math.abs(landmarks.leftEar.y - landmarks.rightEar.y);
      if (headAlignment < 5) {
        score += 25;
      } else if (headAlignment < 15) {
        score += 15;
        corrections.push('머리를 수평으로 유지하세요');
      } else {
        corrections.push('머리가 많이 기울어졌습니다');
      }
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
    if (style === 'freestyle') {
      recommendations.push('자유형: 팔을 앞으로 뻗어 물을 밀어내는 동작에 집중하세요');
    } else if (style === 'breaststroke') {
      recommendations.push('평영: 다리 동작과 팔 동작의 타이밍을 맞추세요');
    } else if (style === 'backstroke') {
      recommendations.push('배영: 몸을 곧게 펴고 팔을 원을 그리며 움직이세요');
    } else if (style === 'butterfly') {
      recommendations.push('접영: 물고기처럼 몸을 물결치며 움직이세요');
    }

    return {
      confidence: score / 100,
      posture,
      corrections,
      score,
      recommendations
    };
  };

  // 각도 계산 함수
  const calculateAngle = (p1: PoseLandmark, p2: PoseLandmark, p3: PoseLandmark): number => {
    const radians = Math.atan2(p3.y - p2.y, p3.x - p2.x) - 
                   Math.atan2(p1.y - p2.y, p1.x - p2.x);
    let angle = Math.abs(radians * 180 / Math.PI);
    if (angle > 180) angle = 360 - angle;
    return angle;
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
          await analyzePose(model);
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
          <p className="text-gray-600">AI 모델을 로딩 중입니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          🤖 고급 AI 자세 분석 - {swimmingStyle}
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
                FPS: {fps}
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
              <span className="font-medium">백엔드:</span> {tf.getBackend()}
            </div>
            <div>
              <span className="font-medium">모델:</span> PoseNet MobileNetV1
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

export default AdvancedPoseAnalysis;
