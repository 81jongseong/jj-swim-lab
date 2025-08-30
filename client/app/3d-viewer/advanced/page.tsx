/**
 * ✅ JJ Swim Lab - 고급 3D 뷰어 페이지
 * 
 * 📋 **목적**
 * - 향후 개선사항 테스트
 * - 수영 자세 모델 시연
 * - 자세 비교 기능 검증
 * - 고급 3D 기능 체험
 */

'use client';

import React, { useState, useCallback } from 'react';
import { ThreeDViewer, SwimmingPoseModel, PoseComparisonViewer } from '@/components/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

// 예시 수영 자세 데이터
const SAMPLE_POSES = {
  freestyle: {
    joints: [
      { x: 0, y: 1.7, z: 0, confidence: 0.9 },
      { x: -0.3, y: 1.5, z: 0, confidence: 0.9 },
      { x: 0.3, y: 1.5, z: 0, confidence: 0.9 },
      { x: -0.8, y: 1.2, z: 0, confidence: 0.8 },
      { x: 0.6, y: 1.3, z: 0, confidence: 0.8 },
      { x: -1.2, y: 0.9, z: 0, confidence: 0.7 },
      { x: 0.9, y: 1.1, z: 0, confidence: 0.7 },
      { x: -1.3, y: 0.8, z: 0, confidence: 0.6 },
      { x: 1.0, y: 1.0, z: 0, confidence: 0.6 },
      { x: -1.4, y: 0.8, z: 0, confidence: 0.5 },
      { x: 1.1, y: 1.0, z: 0, confidence: 0.5 },
      { x: 0, y: 1.0, z: 0, confidence: 0.9 },
      { x: -0.2, y: 0.5, z: 0, confidence: 0.8 },
      { x: 0.2, y: 0.5, z: 0, confidence: 0.8 },
      { x: -0.2, y: 0.1, z: 0, confidence: 0.7 },
      { x: 0.2, y: 0.1, z: 0, confidence: 0.7 },
      { x: -0.2, y: 0, z: 0, confidence: 0.6 },
      { x: 0.2, y: 0, z: 0, confidence: 0.6 },
    ],
    connections: [
      [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
      [11, 23], [12, 24], [23, 24],
      [23, 25], [25, 27], [27, 29], [29, 31],
      [24, 26], [26, 28], [28, 30], [30, 32],
      [15, 17], [17, 19], [19, 21],
      [16, 18], [18, 20], [20, 22],
    ] as [number, number][]
  },
  breaststroke: {
    joints: [
      { x: 0, y: 1.7, z: 0, confidence: 0.9 },
      { x: -0.3, y: 1.5, z: 0, confidence: 0.9 },
      { x: 0.3, y: 1.5, z: 0, confidence: 0.9 },
      { x: -0.4, y: 1.4, z: 0, confidence: 0.8 },
      { x: 0.4, y: 1.4, z: 0, confidence: 0.8 },
      { x: -0.5, y: 1.2, z: 0, confidence: 0.7 },
      { x: 0.5, y: 1.2, z: 0, confidence: 0.7 },
      { x: -0.6, y: 1.0, z: 0, confidence: 0.6 },
      { x: 0.6, y: 1.0, z: 0, confidence: 0.6 },
      { x: -0.7, y: 1.0, z: 0, confidence: 0.5 },
      { x: 0.7, y: 1.0, z: 0, confidence: 0.5 },
      { x: 0, y: 1.0, z: 0, confidence: 0.9 },
      { x: -0.3, y: 0.4, z: 0, confidence: 0.8 },
      { x: 0.3, y: 0.4, z: 0, confidence: 0.8 },
      { x: -0.3, y: 0, z: 0, confidence: 0.7 },
      { x: 0.3, y: 0, z: 0, confidence: 0.7 },
      { x: -0.3, y: -0.1, z: 0, confidence: 0.6 },
      { x: 0.3, y: -0.1, z: 0, confidence: 0.6 },
    ],
    connections: [
      [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
      [11, 23], [12, 24], [23, 24],
      [23, 25], [25, 27], [27, 29], [29, 31],
      [24, 26], [26, 28], [28, 30], [30, 32],
      [15, 17], [17, 19], [19, 21],
      [16, 18], [18, 20], [20, 22],
    ] as [number, number][]
  }
};

export default function AdvancedThreeDViewerPage() {
  const [currentView, setCurrentView] = useState<'basic' | 'pose' | 'comparison'>('basic');
  const [selectedPose, setSelectedPose] = useState<'freestyle' | 'breaststroke'>('freestyle');
  const [showStats, setShowStats] = useState(false);
  const [showEnvironment, setShowEnvironment] = useState(true);
  const [poseAnalysis, setPoseAnalysis] = useState<any>(null);

  const handlePoseAnalysisUpdate = useCallback((analysis: any) => {
    setPoseAnalysis(analysis);
    console.log('자세 분석 결과:', analysis);
  }, []);

  const handleError = (error: Error) => {
    console.error('3D 뷰어 오류 발생:', error);
    if ((window as any).showToast) {
      (window as any).showToast({
        type: 'error',
        title: '3D 뷰어 오류',
        message: '3D 뷰어에서 오류가 발생했습니다.',
        duration: 5000
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">고급 3D 뷰어</h1>
        <p className="text-gray-600">
          JJ Swim Lab의 향후 개선사항을 미리 체험해보세요.
        </p>
      </div>

      {/* 뷰어 모드 선택 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>뷰어 모드</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={() => setCurrentView('basic')}
              variant={currentView === 'basic' ? 'default' : 'outline'}
            >
              기본 3D 뷰어
            </Button>
            <Button
              onClick={() => setCurrentView('pose')}
              variant={currentView === 'pose' ? 'default' : 'outline'}
            >
              수영 자세 모델
            </Button>
            <Button
              onClick={() => setCurrentView('comparison')}
              variant={currentView === 'comparison' ? 'default' : 'outline'}
            >
              자세 비교 분석
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 설정 패널 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>뷰어 설정</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showStats}
                onChange={(e) => setShowStats(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">성능 통계 표시</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showEnvironment}
                onChange={(e) => setShowEnvironment(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">환경 조명</span>
            </label>

            {currentView === 'pose' && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">수영 자세:</span>
                <select
                  value={selectedPose}
                  onChange={(e) => setSelectedPose(e.target.value as 'freestyle' | 'breaststroke')}
                  className="rounded border-gray-300 px-2 py-1"
                >
                  <option value="freestyle">자유형</option>
                  <option value="breaststroke">평형</option>
                </select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 3D 뷰어 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            {currentView === 'basic' && '기본 3D 뷰어'}
            {currentView === 'pose' && '수영 자세 모델'}
            {currentView === 'comparison' && '자세 비교 분석'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentView === 'basic' && (
            <ThreeDViewer
              showStats={showStats}
              showEnvironment={showEnvironment}
              onError={handleError}
              className="w-full"
            />
          )}

          {currentView === 'pose' && (
            <div className="w-full h-96 bg-gray-900 rounded-lg overflow-hidden">
              <Canvas
                camera={{ position: [0, 2, 5], fov: 75 }}
                onCreated={({ gl }) => {
                  gl.setClearColor('#1f2937');
                }}
              >
                <ambientLight intensity={0.6} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <SwimmingPoseModel
                  poseData={SAMPLE_POSES[selectedPose]}
                  animation="swimming"
                  scale={1}
                  position={[0, 0, 0]}
                  showSkeleton={true}
                  showJoints={true}
                  color="#4ecdc4"
                />
                <OrbitControls 
                  enablePan={true}
                  enableZoom={true}
                  enableRotate={true}
                  minDistance={2}
                  maxDistance={10}
                />
              </Canvas>
            </div>
          )}

          {currentView === 'comparison' && (
            <div className="space-y-4">
              <PoseComparisonViewer
                referencePose={SAMPLE_POSES.freestyle}
                currentPose={SAMPLE_POSES.breaststroke}
                showStats={showStats}
                showEnvironment={showEnvironment}
                showAnalysis={true}
                onAnalysisUpdate={handlePoseAnalysisUpdate}
                onError={handleError}
                className="w-full"
              />
              
              {/* 분석 결과 표시 */}
              {poseAnalysis && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">자세 분석 결과</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">전체 점수:</span> {poseAnalysis.overallScore}/100
                      </p>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              poseAnalysis.overallScore >= 80 ? 'bg-green-500' :
                              poseAnalysis.overallScore >= 60 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${poseAnalysis.overallScore}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">권장사항:</span>
                      </p>
                      <ul className="mt-1 text-xs text-gray-600 space-y-1">
                        {poseAnalysis.recommendations.slice(0, 2).map((rec, index) => (
                          <li key={index}>• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 기능 설명 */}
      <Card>
        <CardHeader>
          <CardTitle>향후 개선사항</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">✅ 구현 완료</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• 기본 3D 뷰어</li>
                <li>• 수영 자세 3D 모델</li>
                <li>• 자세 비교 분석</li>
                <li>• 실시간 애니메이션</li>
                <li>• 에러 처리 및 복구</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">🚀 다음 단계</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• 실제 수영 동작 모델</li>
                <li>• AI 포즈 분석 연동</li>
                <li>• 고급 애니메이션</li>
                <li>• 성능 최적화</li>
                <li>• 모바일 최적화</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
