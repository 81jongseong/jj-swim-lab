/**
 * ✅ JJ Swim Lab - 자세 비교 3D 뷰어 컴포넌트
 * 
 * 📋 **기능**
 * - 두 수영 자세를 나란히 비교
 * - 자세 분석 및 피드백
 * - 차이점 시각화
 * - 실시간 비교
 * 
 * 🛠️ **기술 스택**
 * - Three.js: 3D 렌더링
 * - React Three Fiber: React 통합
 * - SwimmingPoseModel: 수영 자세 모델
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Stats } from '@react-three/drei';
import { SwimmingPoseModel } from './SwimmingPoseModel';
import { ErrorBoundary } from './errorboundary';
import { logger } from '@/lib/logger';

interface PoseData {
  joints: Array<{
    x: number;
    y: number;
    z: number;
    confidence: number;
  }>;
  connections: Array<[number, number]>;
}

interface PoseComparisonViewerProps {
  className?: string;
  referencePose: PoseData;
  currentPose: PoseData;
  showStats?: boolean;
  showEnvironment?: boolean;
  showAnalysis?: boolean;
  onAnalysisUpdate?: (analysis: any) => void;
  onError?: (error: Error) => void;
}

// 자세 분석 결과 인터페이스
interface PoseAnalysis {
  overallScore: number;
  jointDifferences: Array<{
    jointIndex: number;
    jointName: string;
    difference: number;
    severity: 'low' | 'medium' | 'high';
    feedback: string;
  }>;
  recommendations: string[];
}

// 자세 분석 함수
function analyzePoseDifference(reference: PoseData, current: PoseData): PoseAnalysis {
  const jointNames = [
    '머리', '왼쪽 어깨', '오른쪽 어깨', '왼쪽 팔꿈치', '오른쪽 팔꿈치',
    '왼쪽 손목', '오른쪽 손목', '왼쪽 손', '오른쪽 손', '왼쪽 엄지', '오른쪽 엄지',
    '엉덩이', '왼쪽 무릎', '오른쪽 무릎', '왼쪽 발목', '오른쪽 발목',
    '왼쪽 발', '오른쪽 발'
  ];

  let totalDifference = 0;
  const jointDifferences: PoseAnalysis['jointDifferences'] = [];
  const recommendations: string[] = [];

  // 각 관절의 차이점 분석
  reference.joints.forEach((refJoint, index) => {
    if (current.joints[index]) {
      const currJoint = current.joints[index];
      const diffX = Math.abs(refJoint.x - currJoint.x);
      const diffY = Math.abs(refJoint.y - currJoint.y);
      const diffZ = Math.abs(refJoint.z - currJoint.z);
      const totalDiff = Math.sqrt(diffX * diffX + diffY * diffY + diffZ * diffZ);

      totalDifference += totalDiff;

      let severity: 'low' | 'medium' | 'high' = 'low';
      let feedback = '';

      if (totalDiff > 0.3) {
        severity = 'high';
        feedback = '자세를 크게 수정해야 합니다.';
      } else if (totalDiff > 0.15) {
        severity = 'medium';
        feedback = '자세를 조금 수정하면 좋겠습니다.';
      } else {
        feedback = '자세가 좋습니다.';
      }

      jointDifferences.push({
        jointIndex: index,
        jointName: jointNames[index] || `관절 ${index}`,
        difference: totalDiff,
        severity,
        feedback
      });
    }
  });

  // 전체 점수 계산 (100점 만점)
  const overallScore = Math.max(0, Math.round(100 - (totalDifference * 50)));

  // 전반적인 권장사항 생성
  if (overallScore < 60) {
    recommendations.push('전체적인 자세를 다시 점검해주세요.');
    recommendations.push('기본 자세부터 연습하는 것을 권장합니다.');
  } else if (overallScore < 80) {
    recommendations.push('몇 가지 부분을 개선하면 더 좋은 자세가 될 것 같습니다.');
  } else {
    recommendations.push('훌륭한 자세입니다! 계속 유지해주세요.');
  }

  // 가장 큰 차이를 보이는 관절에 대한 구체적인 권장사항
  const worstJoint = jointDifferences.reduce((prev, current) =>
    prev.difference > current.difference ? prev : current
  );

  if (worstJoint.severity === 'high') {
    recommendations.push(`${worstJoint.jointName} 부분을 특히 주의해서 연습해주세요.`);
  }

  return {
    overallScore,
    jointDifferences,
    recommendations
  };
}

// 자세 비교 씬 컴포넌트
function PoseComparisonScene({
  referencePose,
  currentPose,
  showAnalysis,
  onAnalysisUpdate
}: {
  referencePose: PoseData;
  currentPose: PoseData;
  showAnalysis: boolean;
  onAnalysisUpdate?: (analysis: PoseAnalysis) => void;
}) {
  // 자세 분석 실행
  const analysis = useMemo(() => {
    const result = analyzePoseDifference(referencePose, currentPose);
    onAnalysisUpdate?.(result);
    return result;
  }, [referencePose, currentPose, onAnalysisUpdate]);

  return (
    <>
      {/* 기본 조명 */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, 10, 5]} intensity={0.5} />

      {/* 참조 자세 (왼쪽) */}
      <group position={[-2, 0, 0]}>
        <SwimmingPoseModel
          poseData={referencePose}
          animation="idle"
          scale={0.8}
          color="#4ecdc4"
          showSkeleton={true}
          showJoints={true}
        />

        {/* 참조 자세 라벨 */}
        <mesh position={[0, 2.5, 0]}>
          <boxGeometry args={[2, 0.3, 0.1]} />
          <meshStandardMaterial color="#4ecdc4" />
        </mesh>
      </group>

      {/* 현재 자세 (오른쪽) */}
      <group position={[2, 0, 0]}>
        <SwimmingPoseModel
          poseData={currentPose}
          animation="swimming"
          scale={0.8}
          color="#ff6b6b"
          showSkeleton={true}
          showJoints={true}
        />

        {/* 현재 자세 라벨 */}
        <mesh position={[0, 2.5, 0]}>
          <boxGeometry args={[2, 0.3, 0.1]} />
          <meshStandardMaterial color="#ff6b6b" />
        </mesh>
      </group>

      {/* 분석 결과 시각화 */}
      {showAnalysis && (
        <group position={[0, 1, 2]}>
          {/* 점수 표시 */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1.5, 0.8, 0.1]} />
            <meshStandardMaterial
              color={
                analysis.overallScore >= 80 ? '#4ade80' :
                  analysis.overallScore >= 60 ? '#fbbf24' :
                    '#ef4444'
              }
            />
          </mesh>
        </group>
      )}

      {/* 중앙 구분선 */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.05, 4, 0.05]} />
        <meshStandardMaterial color="#9ca3af" />
      </mesh>
    </>
  );
}

// 에러 발생 시 fallback 컴포넌트
function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
        <div className="text-red-600 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-red-800 mb-2">자세 비교 오류</h3>
        <p className="text-red-600 mb-4 text-sm">
          {error.message || '자세 비교 뷰어를 로드하는 중 오류가 발생했습니다.'}
        </p>
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}

export function PoseComparisonViewer({
  className = '',
  referencePose,
  currentPose,
  showStats = false,
  showEnvironment = true,
  showAnalysis = true,
  onAnalysisUpdate,
  onError
}: PoseComparisonViewerProps) {
  const [hasError, setHasError] = useState(false);

  const handleError = (error: Error) => {
    logger.error('자세 비교 뷰어 오류:', error);
    setHasError(true);
    onError?.(error);
  };

  const handleReset = () => {
    setHasError(false);
  };

  // 오류가 발생한 경우 fallback UI 표시
  if (hasError) {
    return (
      <div className={`w-full h-96 bg-gray-100 rounded-lg ${className}`}>
        <ErrorFallback
          error={new Error('자세 비교 뷰어 초기화 실패')}
          resetErrorBoundary={handleReset}
        />
      </div>
    );
  }

  return (
    <div className={`w-full h-96 bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      <ErrorBoundary
        fallback={<ErrorFallback error={new Error('자세 비교 렌더링 오류')} resetErrorBoundary={handleReset} />}
        onError={handleError}
      >
        <Canvas
          camera={{ position: [0, 2, 8], fov: 60 }}
          onCreated={({ gl }) => {
            gl.setClearColor('#1f2937'); // 다크 그레이 배경
          }}
        >
          <PoseComparisonScene
            referencePose={referencePose}
            currentPose={currentPose}
            showAnalysis={showAnalysis}
            onAnalysisUpdate={onAnalysisUpdate}
          />

          {/* 환경 조명 */}
          {showEnvironment && (
            <Environment preset="sunset" />
          )}

          {/* 카메라 컨트롤 */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={20}
          />

          {/* 성능 통계 (개발 환경에서만) */}
          {showStats && process.env.NODE_ENV === 'development' && (
            <Stats />
          )}
        </Canvas>
      </ErrorBoundary>
    </div>
  );
}

export default PoseComparisonViewer;


